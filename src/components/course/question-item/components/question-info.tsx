'use client';

import React from 'react';
import { BookmarkCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuestionInfoProps } from '../types';

const difficultyColors = {
  EASY: 'text-green-400 border-green-400',
  MEDIUM: 'text-yellow-400 border-yellow-400',
  HARD: 'text-red-400 border-red-400',
};

export const QuestionInfo: React.FC<QuestionInfoProps> = ({
  question,
  isSolved,
  isNew,
  isBookmarked,
  isDeleting,
  showNewBadge
}) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 
          className={`font-medium truncate text-sm sm:text-base transition-all duration-300 ${
            isSolved ? 'text-green-400' : isNew ? 'text-blue-400' : 'text-white'
          }`}
        >
          {question.title}
        </h4>
        
        {/* Status Indicators */}
        {isBookmarked && (
          <BookmarkCheck className="w-4 h-4 text-yellow-500 flex-shrink-0 animate-pulse" />
        )}
        {showNewBadge && (
          <Badge className="bg-blue-500 text-white text-xs animate-pulse">
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </Badge>
        )}
        {isDeleting && (
          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
        <Badge 
          variant="outline" 
          className={`text-xs transition-all duration-200 ${difficultyColors[question.difficulty as keyof typeof difficultyColors]}`}
        >
          {question.difficulty}
        </Badge>
        <div className="flex flex-wrap items-center gap-1">
          {question.topics.length > 2 && (
            <Badge variant="secondary" className="text-xs bg-gray-600">
              +{question.topics.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionInfo;
