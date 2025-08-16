import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { json } from 'stream/consumers';

export const useSolvedQuestions = (courseId?: string) => {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ['solved-questions', courseId],
    queryFn: async () => {
      const params = courseId ? `?courseId=${courseId}` : '';
      const response = await fetch(`/api/users/solved-questions${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch solved questions');
      }
      return response.json();
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMarkQuestionSolved = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/questions/${questionId}/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark question as solved');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['solved-questions'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUnmarkQuestionSolved = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/questions/${questionId}/solve`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unmark question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solved-questions'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

// Hook to check if a specific question is solved
export const useIsQuestionSolved = (questionId: string, courseId?: string) => {
  const { data: solvedQuestions = [] } = useSolvedQuestions(courseId);
  
  return solvedQuestions.some((sq: any) => sq.questionId === questionId);
};
