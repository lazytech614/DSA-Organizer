import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query conditions
    const whereCondition: any = {
      userId: prismaUser.id
    };

    // Filter by course if provided
    if (courseId) {
      whereCondition.question = {
        courses: {
          some: {
            id: courseId
          }
        }
      };
    }

    const solvedQuestions = await db.userQuestionSolved.findMany({
      where: whereCondition,
      include: {
        question: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            topics: true
          }
        }
      },
      orderBy: {
        solvedAt: 'desc'
      }
    });

    return NextResponse.json(solvedQuestions);
  } catch (error) {
    console.error('Error fetching solved questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solved questions' },
      { status: 500 }
    );
  }
}
