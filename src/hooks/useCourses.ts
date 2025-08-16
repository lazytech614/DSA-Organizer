'use client';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { CreateQuestionData, CreateCourseData, CourseWithQuestions } from '@/types';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async (): Promise<CourseWithQuestions[]> => {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    }
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCourseData) => {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }
      
      return response.json();
    },
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      await queryClient.cancelQueries({ queryKey: ['user-info'] });

      // Snapshot the previous values
      const previousCourses = queryClient.getQueryData(['courses']);
      const previousUserInfo = queryClient.getQueryData(['user-info']);

      // Optimistically update courses (add new course)
      queryClient.setQueryData(['courses'], (old: CourseWithQuestions[]) => {
        if (!old) return old;
        
        // Create optimistic course object
        const optimisticCourse: CourseWithQuestions = {
          id: `temp-${Date.now()}`, // Temporary ID
          title: data.title,
          isDefault: false,
          userId: 'temp-user-id',
          questions: [],
          questionCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: null
        };
        
        return [...old, optimisticCourse];
      });

      // Optimistically update user info
      queryClient.setQueryData(['user-info'], (old: any) => {
        if (!old) return old;
        
        const newCoursesUsed = old.limits.coursesUsed + 1;
        const newCoursesRemaining = old.limits.maxCourses === -1 ? -1 : Math.max(0, old.limits.maxCourses - newCoursesUsed);
        
        return {
          ...old,
          totalCoursesCreated: old.totalCoursesCreated + 1,
          limits: {
            ...old.limits,
            coursesUsed: newCoursesUsed,
            coursesRemaining: newCoursesRemaining,
            canCreateCourse: old.limits.maxCourses === -1 || newCoursesUsed < old.limits.maxCourses,
          },
          stats: {
            ...old.stats,
            coursesCreated: old.stats.coursesCreated + 1,
          },
          courses: [...old.courses, {
            id: `temp-${Date.now()}`,
            title: data.title,
            isDefault: false,
            questionCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }]
        };
      });

      return { previousCourses, previousUserInfo };
    },
    onError: (err, data, context) => {
      // Rollback optimistic updates on error
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
      if (context?.previousUserInfo) {
        queryClient.setQueryData(['user-info'], context.previousUserInfo);
      }
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete course');
      }

      return response.json();
    },
    onMutate: async (courseId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      await queryClient.cancelQueries({ queryKey: ['user-info'] });

      // Snapshot the previous values
      const previousCourses = queryClient.getQueryData(['courses']);
      const previousUserInfo = queryClient.getQueryData(['user-info']);

      // Optimistically update courses
      queryClient.setQueryData(['courses'], (old: any) => {
        if (!old) return old;
        return old.filter((course: any) => course.id !== courseId);
      });

      // Optimistically update user info
      queryClient.setQueryData(['user-info'], (old: any) => {
        if (!old) return old;
        
        const updatedCourses = old.courses.filter((course: any) => course.id !== courseId);
        const coursesUsed = updatedCourses.length;
        const coursesRemaining = old.limits.maxCourses === -1 ? -1 : Math.max(0, old.limits.maxCourses - coursesUsed);
        
        return {
          ...old,
          courses: updatedCourses,
          limits: {
            ...old.limits,
            coursesUsed,
            coursesRemaining,
            canCreateCourse: old.limits.maxCourses === -1 || coursesUsed < old.limits.maxCourses,
          },
          stats: {
            ...old.stats,
            coursesCreated: updatedCourses.length,
          }
        };
      });

      return { previousCourses, previousUserInfo };
    },
    onError: (err, courseId, context) => {
      // Rollback optimistic updates on error
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
      if (context?.previousUserInfo) {
        queryClient.setQueryData(['user-info'], context.previousUserInfo);
      }
      
      toast.error('Failed to delete course');
    },
    onSuccess: (data, courseId) => {
      toast.success(`Course "${data.deletedCourse?.title || 'Course'}" deleted successfully`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
  });
};

// ✅ Additional helper hook for managing all course-related updates
export const useCourseUpdates = () => {
  const queryClient = useQueryClient();

  const invalidateAllCourseData = () => {
    // Invalidate all course-related queries
    queryClient.invalidateQueries({ queryKey: ['courses'] });
    queryClient.invalidateQueries({ queryKey: ['user-info'] });
    queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
    queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    queryClient.invalidateQueries({ queryKey: ['admin-course'] });
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    queryClient.invalidateQueries({ queryKey: ['solved-questions'] });
  };

  const updateCourseInCache = (courseId: string, updater: (course: CourseWithQuestions) => CourseWithQuestions) => {
    queryClient.setQueryData(['courses'], (old: CourseWithQuestions[]) => {
      if (!old) return old;
      return old.map(course => 
        course.id === courseId ? updater(course) : course
      );
    });
  };

  const removeCourseFromCache = (courseId: string) => {
    queryClient.setQueryData(['courses'], (old: CourseWithQuestions[]) => {
      if (!old) return old;
      return old.filter(course => course.id !== courseId);
    });
  };

  return {
    invalidateAllCourseData,
    updateCourseInCache,
    removeCourseFromCache,
  };
};
