import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;
    
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) return false;

    const adminEmailsStr = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
    if (!adminEmailsStr) return false;

    const adminEmails = adminEmailsStr
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    return adminEmails.includes(userEmail);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Course title is required' },
        { status: 400 }
      );
    }

    // Check if course with same title already exists
    const existingCourse = await db.course.findFirst({
      where: {
        title: title.trim(),
        isDefault: true
      }
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'A default course with this title already exists' },
        { status: 409 }
      );
    }

    // Create the default course
    const course = await db.course.create({
      data: {
        title: title.trim(),
        isDefault: true,
        userId: null // No user owner for default courses
      },
      include: {
        questions: true,
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json(course, { status: 201 });

  } catch (error) {
    console.error('Error creating admin course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
