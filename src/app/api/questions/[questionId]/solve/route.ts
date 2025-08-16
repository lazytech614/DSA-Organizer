import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const  questionId = request.nextUrl.searchParams.get('questionId') || '';

    // Get the prisma user
    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!prismaUser) {
      console.log("💖💖User not found");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if question exists
    const question = await db.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Mark as solved (upsert to handle duplicates)
    const solvedQuestion = await db.userQuestionSolved.upsert({
      where: {
        userId_questionId: {
          userId: prismaUser.id,
          questionId: questionId
        }
      },
      update: {
        solvedAt: new Date(),
      },
      create: {
        userId: prismaUser.id,
        questionId: questionId,
      },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            difficulty: true
          }
        }
      }
    });

    return NextResponse.json(solvedQuestion, { status: 200 });
  } catch (error) {
    console.error('Error marking question as solved:', error);
    return NextResponse.json(
      { error: 'Failed to mark question as solved' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId } = params;

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove solved status
    await db.userQuestionSolved.delete({
      where: {
        userId_questionId: {
          userId: prismaUser.id,
          questionId: questionId
        }
      }
    });

    return NextResponse.json({ message: 'Question unmarked as solved' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Question was not marked as solved' });
    }
    console.error('Error unmarking question:', error);
    return NextResponse.json(
      { error: 'Failed to unmark question' },
      { status: 500 }
    );
  }
}
