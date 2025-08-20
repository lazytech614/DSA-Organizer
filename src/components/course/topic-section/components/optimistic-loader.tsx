'use client';

import React from 'react';
import { OptimisticLoaderProps } from '../types';

export const OptimisticLoader: React.FC<OptimisticLoaderProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`optimistic-${index}`}
          className="p-3 sm:p-4 border-b border-gray-700 bg-blue-500/5 border-l-2 border-l-blue-500 animate-pulse"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-blue-500/20 rounded w-3/4 mb-2" />
              <div className="flex gap-2">
                <div className="h-3 bg-gray-600 rounded w-16" />
                <div className="h-3 bg-gray-600 rounded w-20" />
              </div>
            </div>
            <div className="text-blue-400 text-xs">Adding...</div>
          </div>
        </div>
      ))}
    </>
  );
};

export default OptimisticLoader;
