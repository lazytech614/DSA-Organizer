'use client';

import React from 'react';
import { PracticeButton } from './practice-button';
import { DeleteButton } from './delete-button';
import { BookmarkButton } from './bookmark-button';
import { SolvedButton } from './solved-button';
import { QuestionActionsProps } from '../types';

interface QuestionActionsContainerProps extends QuestionActionsProps {
  isSolved: boolean;
  isBookmarked: boolean;
  isSolvedLoading: boolean;
  isBookmarkLoading: boolean;
  onToggleSolved: () => void;
  onToggleBookmark: () => void;
}

export const QuestionActions: React.FC<QuestionActionsContainerProps> = ({
  question,
  canDelete,
  courseTitle,
  onDeleteStart,
  onDeleteComplete,
  isDeleting,
  isSolved,
  isBookmarked,
  isSolvedLoading,
  isBookmarkLoading,
  onToggleSolved,
  onToggleBookmark
}) => {
  return (
    <div className="flex items-center justify-start sm:justify-end sm:space-x-2 w-full sm:w-auto">
      {/* Practice Button */}
      <PracticeButton question={question} isDeleting={isDeleting} />

      {/* Delete Button */}
      {canDelete && (
        <DeleteButton
          question={question}
          courseTitle={courseTitle}
          onDeleteStart={onDeleteStart}
          onDeleteComplete={onDeleteComplete}
          isDeleting={isDeleting}
          isSolved={isSolved}
          isBookmarked={isBookmarked}
        />
      )}

      {/* Bookmark Button */}
      <BookmarkButton
        question={question}
        isBookmarked={isBookmarked}
        isLoading={isBookmarkLoading}
        isDeleting={isDeleting}
        onToggle={onToggleBookmark}
      />

      {/* Solved Button */}
      <SolvedButton
        question={question}
        isSolved={isSolved}
        isLoading={isSolvedLoading}
        isDeleting={isDeleting}
        onToggle={onToggleSolved}
      />
    </div>
  );
};

export default QuestionActions;
