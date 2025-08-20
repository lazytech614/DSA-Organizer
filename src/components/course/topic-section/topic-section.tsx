'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TopicHeader } from './components/topc-header';
import { QuestionList } from './components/question-list';
import { OptimisticLoader } from './components/optimistic-loader';
import { AddQuestionCTA } from './components/add-question-CTA';
import { useTopicSection } from './hooks/useTopicSection';
import { useTopicStats } from './hooks/useTopicStats';
import { TopicSectionProps } from './types';

export const TopicSection: React.FC<TopicSectionProps> = ({
  topic,
  questions,
  stepNumber,
  courseId
}) => {
  const {
    isExpanded,
    liveQuestions,
    optimisticQuestionCount,
    canAddQuestions,
    course,
    handleQuestionAdded,
    toggleExpanded,
    prevStats,
    setPrevStats
  } = useTopicSection({ questions, courseId });

  const stats = useTopicStats(liveQuestions, optimisticQuestionCount);

  // Track progress changes for animations
  useEffect(() => {
    if (stats.completedCount !== prevStats.completedCount) {
      setPrevStats({
        completedCount: stats.completedCount,
        totalCount: stats.totalCount
      });
    }
  }, [stats.completedCount, stats.totalCount, prevStats.completedCount, setPrevStats]);

  // Don't render empty sections
  if (liveQuestions.length === 0 && optimisticQuestionCount === 0) {
    return null;
  }

  return (
    <Card className={`bg-gray-800 border-gray-700 transition-all duration-300 ${
      stats.isFullyCompleted ? 'border-green-500/30 shadow-green-500/10 shadow-lg' : ''
    }`}>
      <CardHeader className="p-0">
        <TopicHeader
          topic={topic}
          stepNumber={stepNumber}
          isExpanded={isExpanded}
          onToggle={toggleExpanded}
          stats={stats}
          optimisticQuestionCount={optimisticQuestionCount}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0 animate-in slide-in-from-top-2 duration-300">
          <div className="border-t border-gray-700">
            <QuestionList
              questions={liveQuestions}
              courseId={courseId}
              courseTitle={course?.title}
            />

            <OptimisticLoader count={optimisticQuestionCount} />

            <AddQuestionCTA
              courseId={courseId!}
              topic={topic}
              canAddQuestions={!!canAddQuestions}
              onQuestionAdded={handleQuestionAdded}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TopicSection;
