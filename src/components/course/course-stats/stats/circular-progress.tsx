'use client';

import React from 'react';
import { CircularProgressProps } from './types';

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, 
  size = 80, 
  className = "" 
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${circumference}`;
  const strokeDashoffset = `${circumference - (percentage / 100) * circumference}`;

  return (
    <div 
      className={`relative ${className}`} 
      style={{ width: size, height: size }} 
      aria-hidden={false}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        role="img"
        aria-label={`Progress ${Math.round(percentage)}%`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-700"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-orange-500 transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>

      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-orange-400 font-bold text-sm md:text-lg select-none">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;
