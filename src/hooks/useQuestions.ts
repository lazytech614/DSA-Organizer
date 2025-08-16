import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateQuestionData, CreateCourseData, CourseWithQuestions } from '@/types';

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateQuestionData) => {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create question');
      }
      
      return response.json();
    },
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      await queryClient.cancelQueries({ queryKey: ['user-info'] });
      await queryClient.cancelQueries({ queryKey: ['subscription-limits'] });

      // Snapshot the previous values
      const previousCourses = queryClient.getQueryData(['courses']);
      const previousUserInfo = queryClient.getQueryData(['user-info']);
      const previousLimits = queryClient.getQueryData(['subscription-limits']);

      // Optimistically update courses (add question to specific course)
      queryClient.setQueryData(['courses'], (old: CourseWithQuestions[]) => {
        if (!old) return old;
        
        return old.map(course => {
          if (course.id === data.courseId) {
            // Create optimistic question object
            const optimisticQuestion = {
              id: `temp-question-${Date.now()}`,
              title: data.title,
              topics: data.topics,
              urls: data.urls,
              difficulty: data.difficulty,
              createdAt: new Date(),
              updatedAt: new Date(),
              courses: [],
              solvedBy: [],
              isSolved: false, // New questions start as unsolved
            };
            
            return {
              ...course,
              questions: [...course.questions, optimisticQuestion],
              questionCount: course.questionCount + 1,
            };
          }
          return course;
        });
      });

      // Optimistically update user info (update course question count)
      queryClient.setQueryData(['user-info'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          courses: old.courses.map((course: any) => {
            if (course.id === data.courseId) {
              return {
                ...course,
                questionCount: course.questionCount + 1,
              };
            }
            return course;
          })
        };
      });

      // Update subscription limits if needed (for specific course limits)
      if (data.courseId) {
        queryClient.setQueryData(['subscription-limits', data.courseId], (old: any) => {
          if (!old) return old;
          
          const newQuestionsRemaining = old.maxQuestionsPerCourse === -1 ? -1 : Math.max(0, (old.questionsRemaining || 0) - 1);
          
          return {
            ...old,
            questionsRemaining: newQuestionsRemaining,
            canAddQuestion: old.maxQuestionsPerCourse === -1 || newQuestionsRemaining > 0,
          };
        });
      }

      return { previousCourses, previousUserInfo, previousLimits };
    },
    onError: (err, data, context) => {
      // Rollback optimistic updates on error
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
      if (context?.previousUserInfo) {
        queryClient.setQueryData(['user-info'], context.previousUserInfo);
      }
      if (context?.previousLimits) {
        queryClient.setQueryData(['subscription-limits'], context.previousLimits);
      }
    },
    onSuccess: (newQuestion, data) => {
      // Invalidate all related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-course'] });
      
      // Also invalidate specific course limits if courseId exists
      if (data.courseId) {
        queryClient.invalidateQueries({ 
          queryKey: ['subscription-limits', data.courseId] 
        });
      }
    },
  });
};