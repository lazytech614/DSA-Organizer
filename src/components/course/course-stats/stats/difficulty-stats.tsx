'use client';

import React from 'react';
import { DifficultyStatsProps } from './types';

const DIFFICULTY_COLORS = {
  easy: '#16a34a',    // green-500
  medium: '#f59e0b',  // yellow-500
  hard: '#ef4444',    // red-500
  progressTrack: '#1f2937', // gray-800
} as const;

export const DifficultyStats: React.FC<DifficultyStatsProps> = ({
  label,
  completed,
  total,
  percentage,
  color,
  variant = 'desktop'
}) => {
  if (variant === 'mobile') {
    return (
      <div className="space-y-1">
        <h4 className="text-white font-semibold text-sm">{label}</h4>
        <div 
          className="font-bold text-sm transition-all duration-300"
          style={{ color }}
        >
          {completed} / {total}
        </div>
        <div className="text-gray-400 text-xs">completed</div>
        <div 
          className="w-full rounded-full h-1.5 overflow-hidden" 
          style={{ backgroundColor: DIFFICULTY_COLORS.progressTrack }}
        >
          <div
            className="h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: color 
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[240px]">
      <h4 className="text-gray-200 font-semibold mb-1">{label}</h4>

      <div className="flex items-baseline gap-3">
        <div className="text-white text-xl font-extrabold transition-all duration-300">
          {completed}
          <span className="text-gray-400 font-normal text-base"> / {total}</span>
        </div>
        <span className="text-gray-400 text-sm">completed</span>
      </div>

      <div 
        className="mt-3 w-full rounded-full h-2 overflow-hidden" 
        style={{ backgroundColor: DIFFICULTY_COLORS.progressTrack }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  );
};

export default DifficultyStats;
