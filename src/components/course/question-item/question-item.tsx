'use client';

import React from 'react';
import { QuestionNumber } from './components/question-number';
import { QuestionInfo } from './components/question-info';
import { QuestionActions } from './components/question-actions';
import { useQuestionState } from './hooks/useQuestionState';
import { useQuestionActions } from './hooks/useQuestionActions';
import { QuestionItemProps } from './types';

export const QuestionItem: React.FC<QuestionItemProps> = (props) => {
  const {
    question,
    index,
    courseId,
    courseTitle,
    showDelete = false,
    isNew = false
  } = props;

  const questionState = useQuestionState({ question, courseId, isNew });
  const questionActions = useQuestionActions(question.id);

  // Don't render if question was deleted
  if (questionState.shouldHide) {
    return null;
  }

  const handleDeleteStart = () => {
    questionState.setIsDeleting(true);
    questionActions.handleDeleteStart();
  };

  const handleDeleteComplete = () => {
    questionState.setIsDeleting(false);
    questionActions.handleDeleteComplete();
  };

  return (
    <div 
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-all duration-300 gap-3 sm:gap-4 ${
        questionState.isSolved ? 'bg-green-500/5 border-l-2 border-l-green-500' : ''
      } ${
        questionState.isBookmarked ? 'border-r-2 border-r-yellow-500' : ''
      } ${
        questionState.isDeleting ? 'opacity-50 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      } ${
        isNew ? 'bg-blue-500/5 border-l-2 border-l-blue-500 animate-in slide-in-from-left-2 duration-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
        <QuestionNumber
          index={index}
          isSolved={questionState.isSolved}
          isNew={isNew}
        />

        <QuestionInfo
          question={question}
          isSolved={questionState.isSolved}
          isNew={isNew}
          isBookmarked={questionState.isBookmarked}
          isDeleting={questionState.isDeleting}
          showNewBadge={questionState.showNewBadge}
        />
      </div>

      <QuestionActions
        question={question}
        canDelete={questionState.canDelete && showDelete}
        courseTitle={courseTitle}
        onDeleteStart={handleDeleteStart}
        onDeleteComplete={handleDeleteComplete}
        isDeleting={questionState.isDeleting}
        isSolved={questionState.isSolved}
        isBookmarked={questionState.isBookmarked}
        isSolvedLoading={questionActions.isSolvedLoading}
        isBookmarkLoading={questionActions.isBookmarkLoading}
        onToggleSolved={() => questionActions.handleToggleSolved(questionState.isSolved)}
        onToggleBookmark={() => questionActions.handleToggleBookmark(questionState.isBookmarked)}
      />
    </div>
  );
};

export default QuestionItem;
