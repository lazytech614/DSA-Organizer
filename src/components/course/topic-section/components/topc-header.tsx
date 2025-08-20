'use client';

import React from 'react';
import { ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TopicHeaderProps } from '../types';

export const TopicHeader: React.FC<TopicHeaderProps> = ({
  topic,
  stepNumber,
  isExpanded,
  onToggle,
  stats,
  optimisticQuestionCount
}) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-between w-full p-3 sm:p-4 text-left transition-all duration-200 ${
        stats.isFullyCompleted 
          ? 'hover:bg-green-500/10' 
          : 'hover:bg-gray-700/50'
      }`}
    >
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <div className="transition-transform duration-200">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          )}
        </div>
        
        {/* Completion indicator */}
        {stats.isFullyCompleted && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
        )}
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-base sm:text-lg font-semibold truncate transition-colors duration-300 ${
              stats.isFullyCompleted ? 'text-green-400' : 'text-white'
            }`}>
              Step {stepNumber}: {topic}
            </h3>
            {stats.isFullyCompleted && (
              <TrendingUp className="w-4 h-4 text-green-400 animate-bounce" />
            )}
          </div>
          
          <div className="flex overflow-x-auto scrollbar-hide gap-1 sm:gap-2 mt-1 pb-1">
            <span className={`text-xs sm:text-sm text-gray-400 whitespace-nowrap flex-shrink-0 transition-colors duration-300 ${
              optimisticQuestionCount > 0 ? 'text-blue-400' : ''
            }`}>
              {stats.totalCount} problems
              {optimisticQuestionCount > 0 && (
                <span className="text-blue-400 animate-pulse"> (+{optimisticQuestionCount})</span>
              )}
            </span>
            
            {/* Badges */}
            {stats.completionRate > 0 && (
              <Badge 
                variant="outline" 
                className={`text-xs flex-shrink-0 transition-colors duration-300 ${
                  stats.isFullyCompleted 
                    ? 'text-green-400 border-green-400' 
                    : 'text-blue-400 border-blue-400'
                }`}
              >
                {stats.completionRate}% done
              </Badge>
            )}
            {stats.easyCount > 0 && (
              <Badge variant="outline" className="text-green-400 border-green-400 text-xs flex-shrink-0">
                {stats.easyCount} Easy
              </Badge>
            )}
            {stats.mediumCount > 0 && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs flex-shrink-0">
                {stats.mediumCount} Medium
              </Badge>
            )}
            {stats.hardCount > 0 && (
              <Badge variant="outline" className="text-red-400 border-red-400 text-xs flex-shrink-0">
                {stats.hardCount} Hard
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
        <div className={`font-medium text-sm transition-all duration-300 ${
          stats.isFullyCompleted
            ? 'text-green-400 scale-110' 
            : optimisticQuestionCount > 0
            ? 'text-blue-400'
            : 'text-orange-400'
        }`}>
          {stats.completedCount} / {stats.totalCount}
        </div>
        <div className="relative w-16 lg:w-24 bg-gray-600 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              stats.isFullyCompleted
                ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-500/50 shadow-sm' 
                : optimisticQuestionCount > 0
                ? 'bg-blue-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
          />
          {stats.isFullyCompleted && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>
      </div>
    </button>
  );
};

export default TopicHeader;
