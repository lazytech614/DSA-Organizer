import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';

export const useBookmarks = () => {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await fetch('/api/users/bookmarks');
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      return response.json();
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBookmarkQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/questions/${questionId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to bookmark question');
      }
      
      return response.json();
    },
    onMutate: async (questionId) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      await queryClient.cancelQueries({ queryKey: ['user-info'] });
      await queryClient.cancelQueries({ queryKey: ['courses'] });

      const previousBookmarks = queryClient.getQueryData(['bookmarks']);
      const previousUserInfo = queryClient.getQueryData(['user-info']);
      const previousCourses = queryClient.getQueryData(['courses']);

      queryClient.setQueryData(['bookmarks'], (old: any) => {
        if (!old) return [questionId];
        return old.includes(questionId) ? old : [...old, questionId];
      });

      queryClient.setQueryData(['user-info'], (old: any) => {
        if (!old) return old;
        const newBookmarks = old.bookmarkedQuestions.includes(questionId) 
          ? old.bookmarkedQuestions 
          : [...old.bookmarkedQuestions, questionId];
        
        return {
          ...old,
          bookmarkedQuestions: newBookmarks,
          stats: {
            ...old.stats,
            questionsBookmarked: newBookmarks.length,
          }
        };
      });

      queryClient.setQueryData(['courses'], (old: any) => {
        if (!old) return old;
        return old.map((course: any) => ({
          ...course,
          questions: course.questions.map((question: any) => 
            question.id === questionId 
              ? { ...question, isBookmarked: true }
              : question
          )
        }));
      });

      return { previousBookmarks, previousUserInfo, previousCourses };
    },
    onError: (err, questionId, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(['bookmarks'], context.previousBookmarks);
      }
      if (context?.previousUserInfo) {
        queryClient.setQueryData(['user-info'], context.previousUserInfo);
      }
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};


export const useUnbookmarkQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/questions/${questionId}/bookmark`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove bookmark');
      }
      
      return response.json();
    },
    onMutate: async (questionId) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      await queryClient.cancelQueries({ queryKey: ['user-info'] });

      const previousBookmarks = queryClient.getQueryData(['bookmarks']);
      const previousCourses = queryClient.getQueryData(['courses']);
      const previousUserInfo = queryClient.getQueryData(['user-info']);

      // Optimistically remove bookmark
      queryClient.setQueryData(['bookmarks'], (old: any) => {
        if (!old) return [];
        return old.filter((id: string) => id !== questionId);
      });

      // Optimistically update courses data
      queryClient.setQueryData(['courses'], (old: any) => {
        if (!old) return old;
        
        return old.map((course: any) => ({
          ...course,
          questions: course.questions.map((question: any) => 
            question.id === questionId 
              ? { ...question, isBookmarked: false }
              : question
          )
        }));
      });

      // Optimistically update user info
      queryClient.setQueryData(['user-info'], (old: any) => {
        if (!old) return old;
        const newBookmarks = old.bookmarkedQuestions.includes(questionId) 
          ? old.bookmarkedQuestions 
          : [...old.bookmarkedQuestions, questionId];
        
        return {
          ...old,
          bookmarkedQuestions: newBookmarks,
          stats: {
            ...old.stats,
            questionsBookmarked: newBookmarks.length,
          }
        };
      });

      return { previousBookmarks, previousCourses, previousUserInfo };
    },
    onError: (err, questionId, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(['bookmarks'], context.previousBookmarks);
      }
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
      if (context?.previousUserInfo) {
        queryClient.setQueryData(['user-info'], context.previousUserInfo);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
    },
  });
};

// Hook to check if a question is bookmarked
export const useIsQuestionBookmarked = (questionId: string) => {
  const { data: bookmarks = [] } = useBookmarks();
  return bookmarks.includes(questionId);
};
