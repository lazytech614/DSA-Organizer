import { useMemo } from 'react';
import { CourseWithQuestions } from '@/types';
import { useCourses } from '@/hooks/useCourses';
import { CourseStatsData } from '../stats/types';

export const useCourseStats = (course: CourseWithQuestions): CourseStatsData => {
  const { data: courses } = useCourses();
  
  const currentCourse = courses?.find(c => c.id === course.id) || course;

  return useMemo(() => {
    const questions = currentCourse.questions;
    
    // Filter by difficulty
    const easyQuestions = questions.filter(q => q.difficulty.toUpperCase() === 'EASY');
    const mediumQuestions = questions.filter(q => q.difficulty.toUpperCase() === 'MEDIUM');
    const hardQuestions = questions.filter(q => q.difficulty.toUpperCase() === 'HARD');
    
    // Count completed
    const totalCompleted = questions.filter(q => q.isSolved).length;
    const easyCompleted = easyQuestions.filter(q => q.isSolved).length;
    const mediumCompleted = mediumQuestions.filter(q => q.isSolved).length;
    const hardCompleted = hardQuestions.filter(q => q.isSolved).length;
    
    // Calculate percentages
    const calculatePercentage = (completed: number, total: number) => 
      total > 0 ? (completed / total) * 100 : 0;

    return {
      total: {
        total: questions.length,
        completed: totalCompleted,
        percentage: calculatePercentage(totalCompleted, questions.length)
      },
      easy: {
        total: easyQuestions.length,
        completed: easyCompleted,
        percentage: calculatePercentage(easyCompleted, easyQuestions.length)
      },
      medium: {
        total: mediumQuestions.length,
        completed: mediumCompleted,
        percentage: calculatePercentage(mediumCompleted, mediumQuestions.length)
      },
      hard: {
        total: hardQuestions.length,
        completed: hardCompleted,
        percentage: calculatePercentage(hardCompleted, hardQuestions.length)
      }
    };
  }, [currentCourse.questions]);
};
