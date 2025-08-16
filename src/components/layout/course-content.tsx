'use client';

import { useState, useMemo } from 'react';
import { CourseWithQuestions } from '@/types';
import { TopicSection } from '@/components/course/topic-section';
import { CourseStats } from '@/components/course/course-stats';
import { AddQuestionDialog } from '@/components/dialogs/add-question-dialog';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';

interface CourseContentProps {
  course: CourseWithQuestions | null;
}

export function CourseContent({ course }: CourseContentProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Group questions by topics
  const questionsByTopic = useMemo(() => {
    if (!course) return {};

    const grouped: { [topic: string]: typeof course.questions } = {};

    course.questions.forEach(question => {
      question.topics.forEach(topic => {
        if (!grouped[topic]) {
          grouped[topic] = [];
        }
        grouped[topic].push(question);
      });
    });

    const sortedTopics = Object.keys(grouped).sort();
    const sortedGrouped: { [topic: string]: typeof course.questions } = {};
    sortedTopics.forEach(topic => {
      sortedGrouped[topic] = grouped[topic];
    });

    return sortedGrouped;
  }, [course]);

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            Select a course to get started
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Choose a course from the sidebar to view its questions
          </p>
        </div>
      </div>
    );
  }

  const filteredQuestionsByTopic = Object.entries(questionsByTopic).reduce(
    (acc, [topic, questions]) => {
      if (selectedDifficulty === 'all') {
        acc[topic] = questions;
      } else {
        acc[topic] = questions.filter(q => q.difficulty === selectedDifficulty.toUpperCase());
      }
      return acc;
    },
    {} as { [topic: string]: typeof course.questions }
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Course Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Course Overview</h2>
            {!course.isDefault && (
              <AddQuestionDialog courseId={course.id} />
            )}
          </div>
        </div>

        <CourseStats course={course} />

        {/* Difficulty Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
          <span className="text-sm text-gray-400 whitespace-nowrap">Filter by difficulty:</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'easy', 'medium', 'hard'].map(difficulty => (
              <Button
                key={difficulty}
                size="sm"
                variant={selectedDifficulty === difficulty ? 'default' : 'ghost'}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`capitalize whitespace-nowrap ${
                  selectedDifficulty === difficulty
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'hover:bg-gray-700'
                }`}
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Topics and Questions */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {Object.entries(filteredQuestionsByTopic).map(([topic, questions], index) => (
          questions.length > 0 && (
            <TopicSection
              key={topic}
              topic={topic}
              questions={questions}
              stepNumber={index + 1}
              courseId={course.id}
            />
          )
        ))}

        {Object.keys(filteredQuestionsByTopic).length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              No questions found
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {selectedDifficulty === 'all' 
                ? 'This course doesn\'t have any questions yet.'
                : `No ${selectedDifficulty} questions found in this course.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
