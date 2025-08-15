'use client';

import { Question } from '@prisma/client';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface QuestionItemProps {
  question: Question;
  index: number;
}

export function QuestionItem({ question, index }: QuestionItemProps) {
  const difficultyColors = {
    EASY: 'text-green-400 border-green-400',
    MEDIUM: 'text-yellow-400 border-yellow-400',
    HARD: 'text-red-400 border-red-400',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-colors gap-3 sm:gap-4">
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
        {/* Question Number */}
        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-600 text-xs sm:text-sm font-medium flex-shrink-0">
          {index}
        </div>

        {/* Question Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate text-sm sm:text-base">
            {question.title}
          </h4>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
            <Badge 
              variant="outline" 
              className={`text-xs ${difficultyColors[question.difficulty]}`}
            >
              {question.difficulty}
            </Badge>
            <div className="flex flex-wrap items-center gap-1">
              {question.topics.slice(0, 2).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs bg-gray-600">
                  {topic}
                </Badge>
              ))}
              {question.topics.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-gray-600">
                  +{question.topics.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
        {/* Practice Links */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {question.urls.slice(0, 2).map((url, urlIndex) => (
            <Button
              key={urlIndex}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white p-1 sm:p-2"
              asChild
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="text-xs hidden sm:inline">
                  {url.includes('leetcode') ? 'LC' : 
                   url.includes('geeksforgeeks') ? 'GFG' : 
                   `Link ${urlIndex + 1}`}
                </span>
              </a>
            </Button>
          ))}
          {question.urls.length > 2 && (
            <span className="text-xs text-gray-500">+{question.urls.length - 2}</span>
          )}
        </div>

        {/* Completion Status */}
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-green-400 p-1 sm:p-2 flex-shrink-0"
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
