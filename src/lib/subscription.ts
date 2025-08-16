import { db } from '@/lib/db';
import { User, SubscriptionType, SubscriptionStatus } from '@prisma/client';

export interface SubscriptionLimits {
  maxCourses: number; // -1 for unlimited
  maxQuestionsPerCourse: number; // -1 for unlimited
  canCreateCourse: boolean;
  canAddQuestion: boolean;
  coursesRemaining: number;
  questionsRemaining?: number; // For specific course
}

export async function getUserSubscriptionLimits(
  userId: string, 
  courseId?: string
): Promise<SubscriptionLimits> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      courses: {
        where: { isDefault: false },
        select: { id: true, questionCount: true }
      },
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get subscription plan limits
  const plan = await db.subscriptionPlan.findUnique({
    where: { type: user.subscriptionType }
  });

  if (!plan) {
    throw new Error('Subscription plan not found');
  }

  const userCourseCount = user.courses.length;
  const canCreateCourse = plan.maxCourses === -1 || userCourseCount < plan.maxCourses;
  const coursesRemaining = plan.maxCourses === -1 ? -1 : Math.max(0, plan.maxCourses - userCourseCount);

  let canAddQuestion = true;
  let questionsRemaining: number | undefined;

  if (courseId) {
    const course = user.courses.find(c => c.id === courseId);
    if (course) {
      canAddQuestion = plan.maxQuestionsPerCourse === -1 || 
                      course.questionCount < plan.maxQuestionsPerCourse;
      questionsRemaining = plan.maxQuestionsPerCourse === -1 ? -1 : 
                          Math.max(0, plan.maxQuestionsPerCourse - course.questionCount);
    }
  }

  return {
    maxCourses: plan.maxCourses,
    maxQuestionsPerCourse: plan.maxQuestionsPerCourse,
    canCreateCourse,
    canAddQuestion,
    coursesRemaining,
    questionsRemaining
  };
}

export async function checkSubscriptionLimit(
  userId: string, 
  action: 'CREATE_COURSE' | 'ADD_QUESTION',
  courseId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUserSubscriptionLimits(userId, courseId);

  switch (action) {
    case 'CREATE_COURSE':
      if (!limits.canCreateCourse) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${limits.maxCourses} courses. Upgrade to Pro for unlimited courses.`
        };
      }
      return { allowed: true };

    case 'ADD_QUESTION':
      if (!limits.canAddQuestion) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${limits.maxQuestionsPerCourse} questions per course. Upgrade to Pro for unlimited questions.`
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

export function isProUser(user: { subscriptionType: SubscriptionType; subscriptionStatus: SubscriptionStatus }): boolean {
  return user.subscriptionType === 'PRO' && user.subscriptionStatus === 'ACTIVE';
}
