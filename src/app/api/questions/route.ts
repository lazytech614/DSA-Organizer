import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const questions = await db.question.findMany({
      include: {
        courses: true
      }
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, topics, urls, difficulty, courseId } = body;

    // Check if the course exists and belongs to the user (not default)
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        userId: prismaUser.id,
        isDefault: false
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or cannot add to default course' },
        { status: 404 }
      );
    }

    const question = await db.question.create({
      data: {
        title,
        topics,
        urls,
        difficulty,
        courses: {
          connect: { id: courseId }
        }
      },
      include: {
        courses: true
      }
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
