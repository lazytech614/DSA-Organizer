'use client';

import React from 'react';
import { DifficultyStats } from './difficulty-stats';
import { CourseStatsData } from './types';

interface DifficultySectionProps {
  stats: CourseStatsData;
  variant?: 'desktop' | 'mobile';
}

const DIFFICULTY_COLORS = {
  easy: '#16a34a',    // green-500
  medium: '#f59e0b',  // yellow-500
  hard: '#ef4444',    // red-500
} as const;

export const DifficultySection: React.FC<DifficultySectionProps> = ({ 
  stats, 
  variant = 'desktop' 
}) => {
  const difficulties = [
    { 
      key: 'easy', 
      label: 'Easy', 
      data: stats.easy, 
      color: DIFFICULTY_COLORS.easy 
    },
    { 
      key: 'medium', 
      label: 'Medium', 
      data: stats.medium, 
      color: DIFFICULTY_COLORS.medium 
    },
    { 
      key: 'hard', 
      label: 'Hard', 
      data: stats.hard, 
      color: DIFFICULTY_COLORS.hard 
    },
  ];

  if (variant === 'mobile') {
    return (
      <div className="grid grid-cols-3 gap-4">
        {difficulties.map(({ key, label, data, color }) => (
          <DifficultyStats
            key={key}
            label={label}
            completed={data.completed}
            total={data.total}
            percentage={data.percentage}
            color={color}
            variant="mobile"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center flex-1 divide-x divide-gray-700 pl-6">
      {difficulties.map(({ key, label, data, color }, index) => (
        <div 
          key={key}
          className={`${
            index === 0 ? 'pr-6 pl-0' : 
            index === difficulties.length - 1 ? 'pl-6 pr-0' : 'px-6'
          }`}
        >
          <DifficultyStats
            label={label}
            completed={data.completed}
            total={data.total}
            percentage={data.percentage}
            color={color}
            variant="desktop"
          />
        </div>
      ))}
    </div>
  );
};

export default DifficultySection;
