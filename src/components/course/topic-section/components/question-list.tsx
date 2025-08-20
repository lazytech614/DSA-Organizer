'use client';

import React from 'react';
import { QuestionItem } from '@/components/course/question-item/question-item';
import { QuestionListProps } from '../types';

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  courseId,
  courseTitle
}) => {
  return (
    <>
      {questions.map((question, questionIndex) => (
        <div
          key={`${question.id}-${question.isSolved}`}
          className="transform transition-all duration-300 ease-out"
          style={{ 
            transitionDelay: `${questionIndex * 20}ms`,
            animationFillMode: 'both'
          }}
        >
          <QuestionItem
            question={question}
            index={questionIndex + 1}
            courseId={courseId}
            courseTitle={courseTitle}
            showDelete={courseTitle !== 'Default Course'}
          />
        </div>
      ))}
    </>
  );
};

export default QuestionList;
