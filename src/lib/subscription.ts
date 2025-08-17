import { db } from '@/lib/db';
import { User, SubscriptionType, SubscriptionStatus } from '@prisma/client';

export interface SubscriptionLimits {
  maxCourses: number; // -1 for unlimited
  maxQuestionsPerCourse: number; // -1 for unlimited
  maxPlatforms: number; // ✅ Added platform limits
  canCreateCourse: boolean;
  canAddQuestion: boolean;
  canLinkPlatform: boolean; // ✅ Added platform linking check
  coursesRemaining: number;
  questionsRemaining?: number; // For specific course
  platformsRemaining: number; // ✅ Added platforms remaining
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
      linkedPlatforms: {
        where: { isActive: true },
        select: { id: true }
      }
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
  const userPlatformCount = user.linkedPlatforms.length; // ✅ Count linked platforms
  
  const canCreateCourse = plan.maxCourses === -1 || userCourseCount < plan.maxCourses;
  const canLinkPlatform = plan.maxPlatforms === -1 || userPlatformCount < plan.maxPlatforms; // ✅ Check platform limit
  
  const coursesRemaining = plan.maxCourses === -1 ? -1 : Math.max(0, plan.maxCourses - userCourseCount);
  const platformsRemaining = plan.maxPlatforms === -1 ? -1 : Math.max(0, plan.maxPlatforms - userPlatformCount); // ✅ Calculate remaining platforms

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
    maxPlatforms: plan.maxPlatforms, // ✅ Added
    canCreateCourse,
    canAddQuestion,
    canLinkPlatform, // ✅ Added
    coursesRemaining,
    questionsRemaining,
    platformsRemaining // ✅ Added
  };
}

export async function checkSubscriptionLimit(
  userId: string, 
  action: 'CREATE_COURSE' | 'ADD_QUESTION' | 'LINK_PLATFORM', 
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

    // ✅ Added platform linking limit check
    case 'LINK_PLATFORM':
      if (!limits.canLinkPlatform) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${limits.maxPlatforms} platforms. Upgrade to Pro for unlimited platform integrations.`
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
