import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ questionId: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { questionId } = params;

    // Rest of your code remains the same...
    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const question = await db.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isAlreadyBookmarked = prismaUser.bookmarkedQuestions.includes(questionId);
    if (isAlreadyBookmarked) {
      return NextResponse.json({ 
        message: 'Question already bookmarked',
        isBookmarked: true 
      });
    }

    const updatedUser = await db.user.update({
      where: { id: prismaUser.id },
      data: {
        bookmarkedQuestions: {
          push: questionId
        }
      },
      select: {
        bookmarkedQuestions: true
      }
    });

    return NextResponse.json({ 
      message: 'Question bookmarked successfully',
      isBookmarked: true,
      bookmarkedQuestions: updatedUser.bookmarkedQuestions
    });

  } catch (error) {
    console.error('Error bookmarking question:', error);
    return NextResponse.json(
      { error: 'Failed to bookmark question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15
    const params = await context.params;
    const { questionId } = params;

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id: prismaUser.id },
      data: {
        bookmarkedQuestions: prismaUser.bookmarkedQuestions.filter(
          id => id !== questionId
        )
      },
      select: {
        bookmarkedQuestions: true
      }
    });

    return NextResponse.json({ 
      message: 'Bookmark removed successfully',
      isBookmarked: false,
      bookmarkedQuestions: updatedUser.bookmarkedQuestions
    });

  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}
