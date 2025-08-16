import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';

export function useSubscriptionLimits(courseId?: string) {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ['subscription-limits', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/subscription/limits${courseId ? `?courseId=${courseId}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch subscription limits');
      return response.json();
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpgradeCheck() {
  const { data: limits } = useSubscriptionLimits();
  
  return {
    needsUpgrade: (action: 'CREATE_COURSE' | 'ADD_QUESTION') => {
      if (!limits) return false;
      
      switch (action) {
        case 'CREATE_COURSE':
          return !limits.canCreateCourse;
        case 'ADD_QUESTION':
          return !limits.canAddQuestion;
        default:
          return false;
      }
    },
    limits
  };
}
