import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { UserInfo } from '@/hooks/useUserInfo';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get comprehensive user data
    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        courses: {
          where: { isDefault: false }, // Only user-created courses
          select: {
            id: true,
            title: true,
            isDefault: true,
            questionCount: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        solvedQuestions: {
          select: {
            id: true,
            questionId: true,
            solvedAt: true,
          },
          orderBy: { solvedAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get subscription plan details
    const subscriptionPlan = await db.subscriptionPlan.findUnique({
      where: { type: user.subscriptionType }
    });

    if (!subscriptionPlan) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
    }

    // Calculate derived values
    const isPro = user.subscriptionType === 'PRO' && user.subscriptionStatus === 'ACTIVE';
    const isSubscriptionActive = user.subscriptionStatus === 'ACTIVE';
    const coursesUsed = user.courses.length;
    const coursesRemaining = subscriptionPlan.maxCourses === -1 ? -1 : Math.max(0, subscriptionPlan.maxCourses - coursesUsed);
    const canCreateCourse = subscriptionPlan.maxCourses === -1 || coursesUsed < subscriptionPlan.maxCourses;

    // Calculate streak (simplified - you can make this more sophisticated)
    const calculateStreak = (solvedQuestions: typeof user.solvedQuestions) => {
      if (solvedQuestions.length === 0) return 0;
      
      const dates = solvedQuestions
        .map(sq => new Date(sq.solvedAt).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index) // unique dates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      let streak = 0;
      const today = new Date().toDateString();
      
      for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (dates[i] === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    };

    const userInfo: UserInfo = {
      // Basic info
      id: user.id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      
      // Subscription info
      subscriptionType: user.subscriptionType,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStart: user.subscriptionStart?.toISOString() || null,
      subscriptionEnd: user.subscriptionEnd?.toISOString() || null,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      
      // Usage tracking
      totalCoursesCreated: user.totalCoursesCreated,
      bookmarkedQuestions: user.bookmarkedQuestions,
      
      // Derived subscription info
      isPro,
      isSubscriptionActive,
      
      // Limits info
      limits: {
        maxCourses: subscriptionPlan.maxCourses,
        maxQuestionsPerCourse: subscriptionPlan.maxQuestionsPerCourse,
        coursesUsed,
        coursesRemaining,
        canCreateCourse,
      },
      
      // User courses
      courses: user.courses.map(course => ({
        id: course.id,
        title: course.title,
        isDefault: course.isDefault,
        questionCount: course.questionCount,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      })),
      
      // Solved questions
      solvedQuestions: user.solvedQuestions.map(sq => ({
        id: sq.id,
        questionId: sq.questionId,
        solvedAt: sq.solvedAt.toISOString(),
      })),
      
      // Statistics
      stats: {
        totalQuestionsSolved: user.solvedQuestions.length,
        coursesCreated: user.courses.length,
        questionsBookmarked: user.bookmarkedQuestions.length,
        streakDays: calculateStreak(user.solvedQuestions),
      },
    };

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('Error fetching user information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 }
    );
  }
}
