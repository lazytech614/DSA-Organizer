'use client';

import { useState, useEffect } from 'react';
import { Question } from '@prisma/client';
import { ExternalLink, CheckCircle, Circle, Bookmark, BookmarkCheck, Trash, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMarkQuestionSolved, useUnmarkQuestionSolved } from '@/hooks/useSolvedQuestions';
import { useBookmarkQuestion, useUnbookmarkQuestion } from '@/hooks/useBookamrks';
import { useCourses } from '@/hooks/useCourses';
import { useUserInfo } from '@/hooks/useUserInfo';
import { DeleteQuestionDialog } from '@/components/dialogs/delete-question-dialog';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import Link from 'next/link';

interface QuestionItemProps {
  question: Question & { isSolved?: boolean; isBookmarked?: boolean };
  index: number;
  courseId?: string;
  courseTitle?: string;
  showDelete?: boolean;
  isNew?: boolean; // Flag for newly added questions
}

export function QuestionItem({ question, index, courseId, courseTitle, showDelete = false, isNew = false }: QuestionItemProps) {
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(isNew);
  
  // ✅ Get live data from React Query
  const { data: courses } = useCourses();
  const { data: userInfo } = useUserInfo();
  
  // ✅ Find the current question with live data
  const currentCourse = courses?.find(c => c.id === courseId);
  const currentQuestion = currentCourse?.questions.find(q => q.id === question.id);
  
  // ✅ Hide new badge after 3 seconds
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setShowNewBadge(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);
  
  // ✅ If question doesn't exist in live data and we're not in the middle of deleting, hide it
  useEffect(() => {
    if (!currentQuestion && courses && currentCourse && !isDeleting) {
      setShouldHide(true);
    }
  }, [currentQuestion, courses, currentCourse, isDeleting]);
  
  // ✅ Use live data or fallback to props
  const isSolved = currentQuestion?.isSolved ?? question.isSolved ?? false;
  const isBookmarked = userInfo?.bookmarkedQuestions?.includes(question.id) ?? question.isBookmarked ?? false;
  
  // ✅ Check if user can delete this question (only from their own courses)
  const canDelete = showDelete && currentCourse && !currentCourse.isDefault && user;
  
  // ✅ Initialize mutation hooks
  const markSolvedMutation = useMarkQuestionSolved();
  const unmarkSolvedMutation = useUnmarkQuestionSolved();
  const bookmarkMutation = useBookmarkQuestion();
  const unbookmarkMutation = useUnbookmarkQuestion();
  
  // ✅ Don't render if question was deleted
  if (shouldHide) {
    return null;
  }

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

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark questions');
      return;
    }

    try {
      if (isBookmarked) {
        await unbookmarkMutation.mutateAsync(question.id);
        toast.success('Bookmark removed');
      } else {
        await bookmarkMutation.mutateAsync(question.id);
        toast.success('Question bookmarked! 📌');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  // ✅ Handle optimistic delete
  const handleDeleteStart = () => {
    setIsDeleting(true);
    toast.loading('Deleting question...', { id: `delete-${question.id}` });
  };

  const handleDeleteComplete = () => {
    setIsDeleting(false);
    toast.dismiss(`delete-${question.id}`);
  };

  const isSolvedLoading = markSolvedMutation.isPending || unmarkSolvedMutation.isPending;
  const isBookmarkLoading = bookmarkMutation.isPending || unbookmarkMutation.isPending;

  return (
    <div 
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-all duration-300 gap-3 sm:gap-4 ${
        isSolved ? 'bg-green-500/5 border-l-2 border-l-green-500' : ''
      } ${
        isBookmarked ? 'border-r-2 border-r-yellow-500' : ''
      } ${
        isDeleting ? 'opacity-50 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      } ${
        isNew ? 'bg-blue-500/5 border-l-2 border-l-blue-500 animate-in slide-in-from-left-2 duration-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
        {/* Question Number */}
        <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 transition-all duration-300 ${
          isSolved 
            ? 'bg-green-600 text-white shadow-lg transform scale-105' 
            : isNew
            ? 'bg-blue-600 text-white shadow-lg animate-pulse'
            : 'bg-gray-600 text-gray-300'
        }`}>
          {isSolved ? '✓' : isNew ? '✨' : index}
        </div>

        {/* Question Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium truncate text-sm sm:text-base transition-all duration-300 ${
              isSolved ? 'text-green-400' : isNew ? 'text-blue-400' : 'text-white'
            }`}>
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
              {/* {question.topics.slice(0, 2).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs bg-gray-600">
                  {topic}
                </Badge>
              ))} */}
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
      <div className="flex items-center justify-start sm:justify-end sm:space-x-2 w-full sm:w-auto">
        {/* Practice Links */}
          <Button
            key={question.urls[0]}
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white p-1 sm:p-2 transition-colors"
            disabled={isDeleting}
            asChild
          >
            <Link
              href={question.urls[0]}
              target="_blank"
                rel="noopener noreferrer"
              className="flex items-center space-x-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="text-xs hidden sm:inline">
                Practice
              </span>
            </Link>
          </Button>

        {/* Delete Button (only for user's own courses) */}
        {canDelete && (
          <DeleteQuestionDialog 
            question={{ ...question, isSolved, isBookmarked }} 
            courseTitle={courseTitle}
            onDeleteStart={handleDeleteStart}
            onDeleteComplete={handleDeleteComplete}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`text-gray-400 hover:text-red-400 p-1 sm:p-2 transition-all duration-200 ${
                isDeleting ? 'animate-pulse' : ''
              }`}
              title="Delete question"
              disabled={isDeleting}
            >
              <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </DeleteQuestionDialog>
        )}

        {/* Bookmark Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleBookmark}
          disabled={isBookmarkLoading || isDeleting}
          className={`p-1 sm:p-2 flex-shrink-0 transition-all duration-300 ${
            isBookmarked 
              ? 'text-yellow-500 hover:text-yellow-400 scale-105' 
              : 'text-gray-400 hover:text-yellow-500'
          } ${isBookmarkLoading ? 'animate-pulse' : ''}`}
          title={user ? (isBookmarked ? 'Remove bookmark' : 'Bookmark question') : 'Sign in to bookmark'}
        >
          {isBookmarkLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isBookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>

        {/* Completion Status Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleSolved}
          disabled={isSolvedLoading || isDeleting}
          className={`p-1 sm:p-2 flex-shrink-0 transition-all duration-300 ${
            isSolved 
              ? 'text-green-400 hover:text-green-300 scale-105' 
              : 'text-gray-400 hover:text-green-400'
          } ${isSolvedLoading ? 'animate-pulse' : ''}`}
          title={user ? (isSolved ? 'Mark as unsolved' : 'Mark as solved') : 'Sign in to track progress'}
        >
          {isSolvedLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isSolved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
