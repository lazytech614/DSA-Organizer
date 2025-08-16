'use client';

import { Question } from '@prisma/client';
import { ExternalLink, CheckCircle, Circle, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMarkQuestionSolved, useUnmarkQuestionSolved, useIsQuestionSolved } from '@/hooks/useSolvedQuestions';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

interface QuestionItemProps {
  question: Question;
  index: number;
  courseId?: string;
}

export function QuestionItem({ question, index, courseId }: QuestionItemProps) {
  const { user } = useUser();
  const isSolved = useIsQuestionSolved(question.id, courseId);
  const markSolvedMutation = useMarkQuestionSolved();
  const unmarkSolvedMutation = useUnmarkQuestionSolved();

  const difficultyColors = {
    EASY: 'text-green-400 border-green-400',
    MEDIUM: 'text-yellow-400 border-yellow-400',
    HARD: 'text-red-400 border-red-400',
  };

  const handleToggleSolved = async () => {
    if (!user) {
      toast.error('Please sign in to track your progress');
      return;
    }

    try {
      if (isSolved) {
        await unmarkSolvedMutation.mutateAsync(question.id);
        toast.success('Question unmarked as solved');
      } else {
        await markSolvedMutation.mutateAsync(question.id);
        toast.success('Great job! Question marked as solved! 🎉');
      }
    } catch (error) {
      toast.error('Failed to update question status');
    }
  };

  const isLoading = markSolvedMutation.isPending || unmarkSolvedMutation.isPending;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-colors gap-3 sm:gap-4">
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
        {/* Question Number */}
        <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 transition-colors`}>
          {index}
        </div>

        {/* Question Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate text-sm sm:text-base transition-colors`}>
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

        {/* Bookkmark question */}
        <Button
          size="sm"
          variant="ghost"
          className="p-1 sm:p-2 flex-shrink-0 transition-colors text-gray-400 hover:text-white"
          title="Bookmark this question"
        >
          <Bookmark className="w-4 h-4" />
        </Button>

        {/* Completion Status Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleSolved}
          disabled={isLoading}
          className={`p-1 sm:p-2 flex-shrink-0 transition-colors ${
            isSolved 
              ? 'text-green-400 hover:text-green-300' 
              : 'text-gray-400 hover:text-green-400'
          } ${isLoading ? 'animate-pulse' : ''}`}
          title={user ? (isSolved ? 'Mark as unsolved' : 'Mark as solved') : 'Sign in to track progress'}
        >
          {isSolved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
