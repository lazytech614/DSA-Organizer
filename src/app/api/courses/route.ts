import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      const defaultCourses = await db.course.findMany({
        where: { isDefault: true },
        include: {
          questions: true,
          user: true
        }
      });
      return NextResponse.json(defaultCourses);
    }

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!prismaUser) {
      const defaultCourses = await db.course.findMany({
        where: { isDefault: true },
        include: {
          questions: true,
          user: true
        }
      });
      return NextResponse.json(defaultCourses);
    }

    const courses = await db.course.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: prismaUser.id }  
        ]
      },
      include: {
        questions: true,
        user: true
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUser = await db.user.upsert({
      where: { clerkId: userId },
      update: {
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim()
      },
      create: {
        clerkId: userId,
        // email: user.emailAddresses?.emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim()
      }
    });

    const body = await request.json();
    const { title } = body;

    const course = await db.course.create({
      data: {
        title,
        userId: dbUser.id, 
        isDefault: false
      },
      include: {
        questions: true,
        user: true
      }
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
