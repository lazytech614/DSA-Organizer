'use client';

import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteQuestionDialog } from '@/components/dialogs/delete-question-dialog';
import { QuestionActionsProps } from '../types';

interface DeleteButtonProps extends Pick<QuestionActionsProps, 'question' | 'courseTitle' | 'onDeleteStart' | 'onDeleteComplete' | 'isDeleting'> {
  isSolved: boolean;
  isBookmarked: boolean;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  question,
  courseTitle,
  onDeleteStart,
  onDeleteComplete,
  isDeleting,
  isSolved,
  isBookmarked
}) => {
  return (
    <DeleteQuestionDialog 
      question={{ ...question, isSolved, isBookmarked }} 
      courseTitle={courseTitle}
      onDeleteStart={onDeleteStart}
      onDeleteComplete={onDeleteComplete}
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
  );
};

export default DeleteButton;
