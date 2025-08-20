'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';

export interface UserInfo {
  // Basic user info
  id: string;
  clerkId: string;
  name: string | null;
  email: string | null;
  
  // Subscription info
  subscriptionType: 'FREE' | 'PRO';
  subscriptionStatus: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  
  // Usage tracking
  totalCoursesCreated: number;
  bookmarkedQuestions: string[];
  totalPlatformsLinked: number;
  
  // Derived subscription info
  isPro: boolean;
  isSubscriptionActive: boolean;
  
  // Limits info
  limits: {
    maxCourses: number; // -1 for unlimited
    maxQuestionsPerCourse: number; // -1 for unlimited
    coursesUsed: number;
    coursesRemaining: number;
    canCreateCourse: boolean;
    maxPlatforms: number;
    platformsLinked: number;
    canLinkPlatform: boolean;
    platformsRemaining: number;
  };
  
  // User courses
  courses: Array<{
    id: string;
    title: string;
    isDefault: boolean;
    questionCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  
  // Solved questions
  solvedQuestions: Array<{
    id: string;
    questionId: string;
    solvedAt: string;
  }>;

  platforms: Array<{
    id: string;
    platform: string;
    username: string;
    stats: any;
    isActive: boolean
  }>;
  
  // Statistics
  stats: {
    totalQuestionsSolved: number;
    coursesCreated: number;
    questionsBookmarked: number;
    streakDays: number; // Can be calculated from solvedAt dates
  };
}

export const useUserInfo = () => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  return useQuery({
    queryKey: ['user-info'],
    queryFn: async (): Promise<UserInfo> => {
      const response = await fetch('/api/users/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user information');
      }
      return response.json();
    },
    enabled: clerkLoaded && !!clerkUser, // Only run when Clerk user is loaded and exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useUserSubscription = () => {
  const { data: userInfo, ...rest } = useUserInfo();
  
  return {
    ...rest,
    data: userInfo ? {
      subscriptionType: userInfo.subscriptionType,
      subscriptionStatus: userInfo.subscriptionStatus,
      subscriptionStart: userInfo.subscriptionStart,
      subscriptionEnd: userInfo.subscriptionEnd,
      isPro: userInfo.isPro,
      isActive: userInfo.isSubscriptionActive,
      limits: userInfo.limits,
    } : undefined
  };
};

export const useUserStats = () => {
  const { data: userInfo, ...rest } = useUserInfo();
  
  return {
    ...rest,
    data: userInfo?.stats
  };
};

export const useUserCourses = () => {
  const { data: userInfo, ...rest } = useUserInfo();
  
  return {
    ...rest,
    data: userInfo?.courses || []
  };
};

export const useUserBookmarks = () => {
  const { data: userInfo, ...rest } = useUserInfo();
  
  return {
    ...rest,
    data: userInfo?.bookmarkedQuestions || []
  };
};
