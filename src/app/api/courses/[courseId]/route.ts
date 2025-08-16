import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ courseId: string }>;
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
    const { courseId } = params;

    // Get the user
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if course exists and belongs to the user
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        questions: {
          select: { id: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Prevent deletion of default courses
    if (course.isDefault) {
      return NextResponse.json({ 
        error: 'Cannot delete default courses' 
      }, { status: 403 });
    }

    // Ensure the course belongs to the user
    if (course.userId !== user.id) {
      return NextResponse.json({ 
        error: 'You can only delete your own courses' 
      }, { status: 403 });
    }

    // Delete the course (this will cascade delete related data due to onDelete: Cascade)
    const deletedCourse = await db.course.delete({
      where: { id: courseId }
    });

    // Update user's totalCoursesCreated count
    await db.user.update({
      where: { id: user.id },
      data: {
        totalCoursesCreated: { decrement: 1 }
      }
    });

    return NextResponse.json({ 
      message: 'Course deleted successfully',
      deletedCourse: {
        id: deletedCourse.id,
        title: deletedCourse.title
      },
      questionsDeleted: course.questions.length
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
