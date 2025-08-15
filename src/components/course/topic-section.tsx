'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Question } from '@prisma/client';
import { QuestionItem } from '@/components/course/question-item';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TopicSectionProps {
  topic: string;
  questions: Question[];
  stepNumber: number;
  courseId?: string; // Add this prop
}

export function TopicSection({ topic, questions, stepNumber, courseId }: TopicSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const easyCount = questions.filter(q => q.difficulty === 'EASY').length;
  const mediumCount = questions.filter(q => q.difficulty === 'MEDIUM').length;
  const hardCount = questions.filter(q => q.difficulty === 'HARD').length;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="p-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-3 sm:p-4 text-left hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                Step {stepNumber}: {topic}
              </h3>
              <div className="flex overflow-x-auto scrollbar-hide gap-1 sm:gap-2 mt-1 pb-1">
                <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap flex-shrink-0">
                  {questions.length} problems
                </span>
                {easyCount > 0 && (
                  <Badge variant="outline" className="text-green-400 border-green-400 text-xs flex-shrink-0">
                    {easyCount} Easy
                  </Badge>
                )}
                {mediumCount > 0 && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs flex-shrink-0">
                    {mediumCount} Medium
                  </Badge>
                )}
                {hardCount > 0 && (
                  <Badge variant="outline" className="text-red-400 border-red-400 text-xs flex-shrink-0">
                    {hardCount} Hard
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
            <div className="text-orange-400 font-medium text-sm">
              0 / {questions.length}
            </div>
            <div className="w-16 lg:w-24 bg-gray-600 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full w-0" />
            </div>
          </div>
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          <div className="border-t border-gray-700">
            {questions.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={index + 1}
                courseId={courseId} // Pass courseId here
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
