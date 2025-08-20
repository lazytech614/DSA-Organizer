import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCourses } from '@/hooks/useCourses';
import { useUserInfo } from '@/hooks/useUserInfo';
import { QuestionWithSolvedStatus } from '@/types';
import { TopicSectionProps } from '../types';

export const useTopicSection = ({ questions, courseId }: Pick<TopicSectionProps, 'questions' | 'courseId'>) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prevStats, setPrevStats] = useState({ completedCount: 0, totalCount: 0 });
  const [optimisticQuestionCount, setOptimisticQuestionCount] = useState(0);
  
  const { user } = useUser();
  const { data: courses } = useCourses();
  const { data: userInfo } = useUserInfo();
  
  const course = courses?.find(c => c.id === courseId);

  // Process questions with live user data
  const liveQuestions = useMemo(() => {
    return (questions || []).map(question => ({
      ...question,
      isSolved: userInfo?.solvedQuestions?.some(sq => sq.questionId === question.id) ?? question.isSolved ?? false,
      isBookmarked: userInfo?.bookmarkedQuestions?.includes(question.id) ?? question.isBookmarked ?? false
    }));
  }, [questions, userInfo]);

  // Reset optimistic count when live data changes
  useEffect(() => {
    if (liveQuestions.length > optimisticQuestionCount) {
      setOptimisticQuestionCount(0);
    }
  }, [liveQuestions.length, optimisticQuestionCount]);

  const handleQuestionAdded = () => {
    setOptimisticQuestionCount(prev => prev + 1);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const toggleExpanded = () => setIsExpanded(prev => !prev);

  const canAddQuestions = user && course && !course.isDefault;

  return {
    isExpanded,
    liveQuestions,
    optimisticQuestionCount,
    canAddQuestions,
    course,
    handleQuestionAdded,
    toggleExpanded,
    prevStats,
    setPrevStats
  };
};
