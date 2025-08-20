'use client';

import React from 'react';
import { CircularProgress } from './circular-progress';
import { DifficultyCount } from './types';

interface TotalProgressProps {
  stats: DifficultyCount;
  variant?: 'desktop' | 'mobile';
}

export const TotalProgress: React.FC<TotalProgressProps> = ({ 
  stats, 
  variant = 'desktop' 
}) => {
  if (variant === 'mobile') {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-200 font-semibold text-lg mb-1">Total Progress</h3>
          <div className="text-white text-2xl font-bold transition-all duration-300">
            {stats.completed} / {stats.total}
          </div>
        </div>
        <CircularProgress percentage={stats.percentage} size={60} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 min-w-[220px]">
      <div>
        <h3 className="text-gray-200 font-semibold text-lg mb-1">Total Progress</h3>
        <div className="text-white text-2xl font-extrabold transition-all duration-300">
          {stats.completed} / {stats.total}
        </div>
      </div>

      <div className="ml-2">
        <CircularProgress percentage={stats.percentage} />
      </div>
    </div>
  );
};

export default TotalProgress;
