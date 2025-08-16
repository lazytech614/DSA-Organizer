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
    if (!adminEmailsStr) {
      console.warn('ADMIN_EMAILS environment variable is not set');
      return false;
    }

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

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (courseId) {
      // Get specific course
      const course = await db.course.findFirst({
        where: { 
          id: courseId,
          isDefault: true 
        },
        include: {
          questions: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      return NextResponse.json({
        course,
        questionsCount: course.questions.length
      });
    } else {
      // Get all default courses
      const defaultCourses = await db.course.findMany({
        where: { isDefault: true },
        include: {
          questions: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: { questions: true }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return NextResponse.json({
        courses: defaultCourses,
        totalCourses: defaultCourses.length,
        totalQuestions: defaultCourses.reduce((sum, course) => sum + course.questions.length, 0)
      });
    }

  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
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
    const { title, topics, urls, difficulty, courseId } = body;

    // Validate required fields
    if (!title || !topics || !urls || !difficulty || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, topics, urls, difficulty, courseId' },
        { status: 400 }
      );
    }

    // Validate arrays
    if (!Array.isArray(topics) || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'Topics and URLs must be arrays' },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be EASY, MEDIUM, or HARD' },
        { status: 400 }
      );
    }

    // Find the specified default course
    const course = await db.course.findFirst({
      where: { 
        id: courseId,
        isDefault: true 
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Default course not found' },
        { status: 404 }
      );
    }

    // Check if question with same title already exists in this course
    const existingQuestion = await db.question.findFirst({
      where: {
        title: title.trim(),
        courses: {
          some: {
            id: courseId
          }
        }
      }
    });

    if (existingQuestion) {
      return NextResponse.json(
        { error: 'A question with this title already exists in this course' },
        { status: 409 }
      );
    }

    // Create the question and connect it to the specified course
    const question = await db.question.create({
      data: {
        title: title.trim(),
        topics,
        urls: urls.filter((url: string) => url.trim()),
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
    console.error('Error creating admin question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { questionId, courseId } = body;

    if (!questionId || !courseId) {
      return NextResponse.json(
        { error: 'Question ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Find the specified default course
    const course = await db.course.findFirst({
      where: { 
        id: courseId,
        isDefault: true 
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Default course not found' },
        { status: 404 }
      );
    }

    // Find the question and verify it's in the specified course
    const question = await db.question.findFirst({
      where: {
        id: questionId,
        courses: {
          some: {
            id: courseId
          }
        }
      },
      include: {
        courses: true
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found in specified course' },
        { status: 404 }
      );
    }

    // If question is only in this course, delete it completely
    // If it's in other courses too, just disconnect from this course
    if (question.courses.length === 1) {
      await db.question.delete({
        where: { id: questionId }
      });
    } else {
      await db.question.update({
        where: { id: questionId },
        data: {
          courses: {
            disconnect: { id: courseId }
          }
        }
      });
    }

    return NextResponse.json({ message: 'Question removed successfully' });

  } catch (error) {
    console.error('Error deleting admin question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { questionId, title, topics, urls, difficulty, courseId } = body;

    if (!questionId || !courseId) {
      return NextResponse.json(
        { error: 'Question ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Find the specified default course
    const course = await db.course.findFirst({
      where: { 
        id: courseId,
        isDefault: true 
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Default course not found' },
        { status: 404 }
      );
    }

    // Verify the question exists in the specified course
    const existingQuestion = await db.question.findFirst({
      where: {
        id: questionId,
        courses: {
          some: {
            id: courseId
          }
        }
      }
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found in specified course' },
        { status: 404 }
      );
    }

    // Update the question
    const updatedQuestion = await db.question.update({
      where: { id: questionId },
      data: {
        ...(title && { title: title.trim() }),
        ...(topics && { topics }),
        ...(urls && { urls: urls.filter((url: string) => url.trim()) }),
        ...(difficulty && { difficulty }),
      },
      include: {
        courses: true
      }
    });

    return NextResponse.json(updatedQuestion);

  } catch (error) {
    console.error('Error updating admin question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}
