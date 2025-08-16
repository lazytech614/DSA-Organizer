import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useMarkQuestionSolved = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/questions/${questionId}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark question as solved');
      }
      
      return response.json();
    },
    onMutate: async (questionId) => {
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      await queryClient.cancelQueries({ queryKey: ['user-info'] });
      const previousCourses = queryClient.getQueryData(['courses']);
      const previousUserInfo = queryClient.getQueryData(['user-info']);

      queryClient.setQueryData(['courses'], (old: any) => {
        if (!old) return old;
        return old.map((course: any) => ({
          ...course,
          questions: course.questions.map((question: any) => 
            question.id === questionId 
              ? { ...question, isSolved: true }
              : question
          )
        }));
      });

      // Update user info stats
      queryClient.setQueryData(['user-info'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          stats: {
            ...old.stats,
            totalQuestionsSolved: old.stats.totalQuestionsSolved + 1,
          },
          solvedQuestions: [...old.solvedQuestions, {
            id: `temp-${questionId}`,
            questionId,
            solvedAt: new Date().toISOString(),
          }]
        };
      });

      return { previousCourses, previousUserInfo };
    },
    onError: (err, questionId, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
      if (context?.previousUserInfo) {
        queryClient.setQueryData(['user-info'], context.previousUserInfo);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
      queryClient.invalidateQueries({ queryKey: ['solved-questions'] });
    },
  });
};

export const useUnmarkQuestionSolved = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/questions/${questionId}/solve`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unmark question');
      }
      
      return response.json();
    },
    onMutate: async (questionId) => {
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      await queryClient.cancelQueries({ queryKey: ['user-info'] });
      const previousCourses = queryClient.getQueryData(['courses']);
      const previousUserInfo = queryClient.getQueryData(['user-info']);

      queryClient.setQueryData(['courses'], (old: any) => {
        if (!old) return old;
        return old.map((course: any) => ({
          ...course,
          questions: course.questions.map((question: any) => 
            question.id === questionId 
              ? { ...question, isSolved: false }
              : question
          )
        }));
      });

      // Update user info stats
      queryClient.setQueryData(['user-info'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          stats: {
            ...old.stats,
            totalQuestionsSolved: Math.max(0, old.stats.totalQuestionsSolved - 1),
          },
          solvedQuestions: old.solvedQuestions.filter((sq: any) => sq.questionId !== questionId)
        };
      });

      return { previousCourses, previousUserInfo };
    },
    onError: (err, questionId, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
      if (context?.previousUserInfo) {
        queryClient.setQueryData(['user-info'], context.previousUserInfo);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
      queryClient.invalidateQueries({ queryKey: ['solved-questions'] });
    },
  });
};

