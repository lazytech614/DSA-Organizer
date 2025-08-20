import { useMemo } from 'react';
import { QuestionWithSolvedStatus } from '@/types';
import { TopicStats } from '../types';

export const useTopicStats = (
  questions: QuestionWithSolvedStatus[],
  optimisticQuestionCount: number
): TopicStats => {
  return useMemo(() => {
    const totalCount = questions.length + optimisticQuestionCount;
    const easyCount = questions.filter(q => q.difficulty?.toString().toUpperCase() === 'EASY').length;
    const mediumCount = questions.filter(q => q.difficulty?.toString().toUpperCase() === 'MEDIUM').length;
    const hardCount = questions.filter(q => q.difficulty?.toString().toUpperCase() === 'HARD').length;
    const completedCount = questions.filter(q => q.isSolved).length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const isFullyCompleted = completedCount === totalCount && totalCount > 0;
    
    return {
      easyCount,
      mediumCount,
      hardCount,
      completedCount,
      progressPercentage,
      totalCount,
      completionRate,
      isFullyCompleted
    };
  }, [questions, optimisticQuestionCount]);
};
