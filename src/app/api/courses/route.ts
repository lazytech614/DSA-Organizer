import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { withSubscriptionLimit } from '@/lib/middleware/subscription';

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
      
      // Add isSolved: false for all questions when user is not authenticated
      const coursesWithSolvedStatus = defaultCourses.map(course => ({
        ...course,
        questions: course.questions.map(question => ({
          ...question,
          isSolved: false
        }))
      }));
      
      return NextResponse.json(coursesWithSolvedStatus);
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
      
      // Add isSolved: false for all questions when user doesn't exist in DB
      const coursesWithSolvedStatus = defaultCourses.map(course => ({
        ...course,
        questions: course.questions.map(question => ({
          ...question,
          isSolved: false
        }))
      }));
      
      return NextResponse.json(coursesWithSolvedStatus);
    }

    // Fetch courses
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

    // Get all solved question IDs for this user
    const solvedQuestions = await db.userQuestionSolved.findMany({
      where: {
        userId: prismaUser.id
      },
      select: {
        questionId: true
      }
    });

    // Create a Set for O(1) lookup
    const solvedQuestionIds = new Set(solvedQuestions.map(sq => sq.questionId));

    // Add isSolved boolean to each question
    const coursesWithSolvedStatus = courses.map(course => ({
      ...course,
      questions: course.questions.map(question => ({
        ...question,
        isSolved: solvedQuestionIds.has(question.id)
      }))
    }));

    return NextResponse.json(coursesWithSolvedStatus);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check subscription limits first
  const limitResponse = await withSubscriptionLimit(request, 'CREATE_COURSE');
  if (limitResponse) return limitResponse;

  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    const dbUser = await db.user.upsert({
      where: { clerkId: userId as string },
      update: {
        email: user?.emailAddresses[0]?.emailAddress,
        name: `${user?.firstName} ${user?.lastName}`.trim()
      },
      create: {
        clerkId: userId as string,
        email: user?.emailAddresses[0]?.emailAddress,
        name: `${user?.firstName} ${user?.lastName}`.trim()
      }
    });

    const body = await request.json();
    const { title } = body;

    const course = await db.course.create({
      data: {
        title,
        userId: dbUser.id,
        isDefault: false
      }
    });

    // ✅ Update user's course count
    await db.user.update({
      where: { id: dbUser.id },
      data: {
        totalCoursesCreated: { increment: 1 }
      }
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
