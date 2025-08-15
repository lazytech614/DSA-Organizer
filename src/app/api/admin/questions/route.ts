import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;
    
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) return false;

    // Get admin emails from environment variable
    const adminEmailsStr = process.env.ADMIN_EMAILS;
    if (!adminEmailsStr) {
      console.warn('ADMIN_EMAILS environment variable is not set');
      return false;
    }

    // Split by comma and trim whitespace
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

export async function GET() {
  try {
    // const { userId } = await auth();
    
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
    // }

    //TODO: check if user is admin
    // if (!(await isAdmin(userId))) {
    //   return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    // }

    const defaultCourse = await db.course.findFirst({
      where: { isDefault: true },
      include: {
        questions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!defaultCourse) {
      return NextResponse.json({ error: 'Default course not found' }, { status: 404 });
    }

    return NextResponse.json({
      course: defaultCourse,
      questionsCount: defaultCourse.questions.length
    });

  } catch (error) {
    console.error('Error fetching admin questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    //TODO: Fix this logic later
    // const { userId } = await auth();
    
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized - Authentication required' }, { status: 401 });
    // }

    // if (!(await isAdmin(userId))) {
    //   return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    // }

    const body = await request.json();
    const { title, topics, urls, difficulty } = body;

    // Validate required fields
    if (!title || !topics || !urls || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: title, topics, urls, difficulty' },
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

    // Find the default course
    const defaultCourse = await db.course.findFirst({
      where: { isDefault: true }
    });

    if (!defaultCourse) {
      return NextResponse.json(
        { error: 'Default course not found. Please create it first.' },
        { status: 404 }
      );
    }

    // Check if question with same title already exists
    const existingQuestion = await db.question.findFirst({
      where: {
        title: title.trim(),
        courses: {
          some: {
            id: defaultCourse.id
          }
        }
      }
    });

    if (existingQuestion) {
      return NextResponse.json(
        { error: 'A question with this title already exists in the default course' },
        { status: 409 }
      );
    }

    // Create the question and connect it to the default course
    const question = await db.question.create({
      data: {
        title: title.trim(),
        topics,
        urls: urls.filter((url: string) => url.trim()),
        difficulty,
        courses: {
          connect: { id: defaultCourse.id }
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
    const { questionId } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    // Find the default course first
    const defaultCourse = await db.course.findFirst({
      where: { isDefault: true }
    });

    if (!defaultCourse) {
      return NextResponse.json(
        { error: 'Default course not found' },
        { status: 404 }
      );
    }

    // Find the question and verify it's in the default course
    const question = await db.question.findFirst({
      where: {
        id: questionId,
        courses: {
          some: {
            id: defaultCourse.id
          }
        }
      },
      include: {
        courses: true
      }
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found in default course' },
        { status: 404 }
      );
    }

    // If question is only in the default course, delete it completely
    // If it's in other courses too, just disconnect from default course
    if (question.courses.length === 1) {
      await db.question.delete({
        where: { id: questionId }
      });
    } else {
      await db.question.update({
        where: { id: questionId },
        data: {
          courses: {
            disconnect: { id: defaultCourse.id }
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
    const { questionId, title, topics, urls, difficulty } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    // Find the default course
    const defaultCourse = await db.course.findFirst({
      where: { isDefault: true }
    });

    if (!defaultCourse) {
      return NextResponse.json(
        { error: 'Default course not found' },
        { status: 404 }
      );
    }

    // Verify the question exists in the default course
    const existingQuestion = await db.question.findFirst({
      where: {
        id: questionId,
        courses: {
          some: {
            id: defaultCourse.id
          }
        }
      }
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found in default course' },
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
