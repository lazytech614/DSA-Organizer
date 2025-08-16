import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ questionId: string }>;
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

    const params = await context.params;
    const { questionId } = params;

    // Get the user
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if question exists and get its details
    const question = await db.question.findUnique({
      where: { id: questionId },
      include: {
        courses: {
          where: { userId: user.id }, // Only courses owned by the user
          select: { id: true, title: true, isDefault: true }
        }
      }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Check if user owns any course that contains this question
    const userOwnedCourses = question.courses.filter(course => !course.isDefault);
    
    if (userOwnedCourses.length === 0) {
      return NextResponse.json({ 
        error: 'You can only delete questions from your own courses' 
      }, { status: 403 });
    }

    // Remove question from user's courses only (not from default courses)
    for (const course of userOwnedCourses) {
      await db.course.update({
        where: { id: course.id },
        data: {
          questions: {
            disconnect: { id: questionId }
          },
          questionCount: { decrement: 1 }
        }
      });
    }

    // If question is only in user courses, delete it entirely
    const remainingCourses = await db.course.findMany({
      where: {
        questions: {
          some: { id: questionId }
        }
      }
    });

    let deletedQuestion = null;
    if (remainingCourses.length === 0) {
      // Question is not in any other courses, safe to delete
      deletedQuestion = await db.question.delete({
        where: { id: questionId }
      });
    } else {
      // Question still exists in other courses, just disconnected from user courses
      deletedQuestion = {
        id: questionId,
        title: question.title
      };
    }

    // Clean up user's solved questions and bookmarks
    await db.userQuestionSolved.deleteMany({
      where: {
        userId: user.id,
        questionId: questionId
      }
    });

    // Remove from bookmarks
    if (user.bookmarkedQuestions.includes(questionId)) {
      await db.user.update({
        where: { id: user.id },
        data: {
          bookmarkedQuestions: user.bookmarkedQuestions.filter(id => id !== questionId)
        }
      });
    }

    return NextResponse.json({ 
      message: 'Question deleted successfully',
      deletedQuestion: {
        id: deletedQuestion.id,
        title: deletedQuestion.title || question.title
      },
      removedFromCourses: userOwnedCourses.length
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}