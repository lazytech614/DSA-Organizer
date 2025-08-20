'use client';

import React from 'react';
import { CourseWithQuestions } from '@/types';
import { useCourseStats } from './hooks/useCourseStats';
import { TotalProgress } from './stats/total-progress';
import { DifficultySection } from './stats/difficulty-section';

interface CourseStatsProps {
  course: CourseWithQuestions;
}

export const CourseStats: React.FC<CourseStatsProps> = ({ course }) => {
  const stats = useCourseStats(course);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 overflow-x-hidden">
      {/* Desktop layout */}
      <div className="hidden lg:flex items-center gap-8">
        <TotalProgress stats={stats.total} variant="desktop" />
        <DifficultySection stats={stats} variant="desktop" />
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden space-y-6">
        <TotalProgress stats={stats.total} variant="mobile" />
        
        <div className="w-full h-px bg-gray-600" />
        
        <DifficultySection stats={stats} variant="mobile" />
      </div>
    </div>
  );
};

export default CourseStats;
