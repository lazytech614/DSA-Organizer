'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddQuestionDialog } from '@/components/dialogs/add-question-dialog';
import { AddQuestionCTAProps } from '../types';

export const AddQuestionCTA: React.FC<AddQuestionCTAProps> = ({
  courseId,
  topic,
  canAddQuestions,
  onQuestionAdded
}) => {
  if (!canAddQuestions) return null;

  return (
    <div className="p-3 sm:p-4 border-b border-gray-700 bg-gray-800/50">
      <div className="flex items-center justify-center">
        <AddQuestionDialog
          courseId={courseId}
          onQuestionAdded={onQuestionAdded}
          topicFilter={topic}
        >
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white hover:bg-gray-700 w-full transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question to {topic}
          </Button>
        </AddQuestionDialog>
      </div>
    </div>
  );
};

export default AddQuestionCTA;
