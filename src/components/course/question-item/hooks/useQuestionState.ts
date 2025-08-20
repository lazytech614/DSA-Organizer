import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCourses } from '@/hooks/useCourses';
import { useUserInfo } from '@/hooks/useUserInfo';
import { QuestionItemProps, QuestionState } from '../types';

export const useQuestionState = ({
  question,
  courseId,
  isNew
}: Pick<QuestionItemProps, 'question' | 'courseId' | 'isNew'>): QuestionState => {
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(isNew);

  const { data: courses } = useCourses();
  const { data: userInfo } = useUserInfo();

  // Find current question with live data
  const currentCourse = courses?.find(c => c.id === courseId);
  const currentQuestion = currentCourse?.questions.find(q => q.id === question.id);

  // Hide new badge after 3 seconds
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShowNewBadge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  // Hide question if deleted
  useEffect(() => {
    if (!currentQuestion && courses && currentCourse && !isDeleting) {
      setShouldHide(true);
    }
  }, [currentQuestion, courses, currentCourse, isDeleting]);

  // Determine states
  const isSolved = currentQuestion?.isSolved ?? question.isSolved ?? false;
  const isBookmarked = userInfo?.bookmarkedQuestions?.includes(question.id) ?? question.isBookmarked ?? false;
  const canDelete = currentCourse && !currentCourse.isDefault && !!user;

  return {
    isSolved,
    isBookmarked,
    isDeleting,
    shouldHide,
    showNewBadge,
    canDelete,
    setIsDeleting
  } as QuestionState & { setIsDeleting: (value: boolean) => void };
};
