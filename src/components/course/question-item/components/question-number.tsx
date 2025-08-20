'use client';

import React from 'react';
import { QuestionNumberProps } from '../types';

export const QuestionNumber: React.FC<QuestionNumberProps> = ({
  index,
  isSolved,
  isNew
}) => {
  return (
    <div 
      className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 transition-all duration-300 ${
        isSolved 
          ? 'bg-green-600 text-white shadow-lg transform scale-105' 
          : isNew
          ? 'bg-blue-600 text-white shadow-lg animate-pulse'
          : 'bg-gray-600 text-gray-300'
      }`}
    >
      {isSolved ? '✓' : isNew ? '✨' : index}
    </div>
  );
};

export default QuestionNumber;
