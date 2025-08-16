'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, Plus } from 'lucide-react';
import { QuestionItem } from '@/components/course/question-item';
import { AddQuestionDialog } from '@/components/dialogs/add-question-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuestionWithSolvedStatus } from '@/types';
import { useCourses } from '@/hooks/useCourses';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useUser } from '@clerk/nextjs';

interface TopicSectionProps {
  topic: string;
  questions: QuestionWithSolvedStatus[];
  stepNumber: number;
  courseId?: string;
}

export function TopicSection({ topic, questions, stepNumber, courseId }: TopicSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prevStats, setPrevStats] = useState({ completedCount: 0, totalCount: 0 });
  const [optimisticQuestionCount, setOptimisticQuestionCount] = useState(0);
  
  // ✅ Get live data from React Query
  const { data: courses } = useCourses();
  const { data: userInfo } = useUserInfo();
  const { user } = useUser();
  const course = courses?.find(c => c.id === courseId);

  // ✅ Get live questions data with solved status
  const liveQuestions = useMemo(() => {
    if (!course || !courseId) return questions || [];
    
    // Filter course questions by the current topic and enrich with solved status
    const topicQuestions = course.questions
      .filter(q => q.topics.some(t => t.toLowerCase() === topic.toLowerCase()))
      .map(question => ({
        ...question,
        // Check if question is solved by looking in user's solved questions
        isSolved: userInfo?.solvedQuestions?.some(sq => sq.questionId === question.id) ?? question.isSolved ?? false,
        // Check if question is bookmarked
        isBookmarked: userInfo?.bookmarkedQuestions?.includes(question.id) ?? question.isBookmarked ?? false
      }));
    
    return topicQuestions.length > 0 ? topicQuestions : (questions || []);
  }, [course, questions, topic, courseId, userInfo]);

  // ✅ Reset optimistic count when live data changes
  useEffect(() => {
    if (liveQuestions.length > optimisticQuestionCount) {
      setOptimisticQuestionCount(0);
    }
  }, [liveQuestions.length, optimisticQuestionCount]);

  // ✅ Calculate stats with animations trigger
  const stats = useMemo(() => {
    const totalCount = liveQuestions.length + optimisticQuestionCount;
    const easyCount = liveQuestions.filter(q => q.difficulty.toUpperCase() === 'EASY').length;
    const mediumCount = liveQuestions.filter(q => q.difficulty.toUpperCase() === 'MEDIUM').length;
    const hardCount = liveQuestions.filter(q => q.difficulty.toUpperCase() === 'HARD').length;
    const completedCount = liveQuestions.filter(q => q.isSolved).length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    // Calculate completion rate
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return {
      easyCount,
      mediumCount,
      hardCount,
      completedCount,
      progressPercentage,
      totalCount,
      completionRate,
      isFullyCompleted: completedCount === totalCount && totalCount > 0
    };
  }, [liveQuestions, optimisticQuestionCount]);

  // ✅ Track progress changes for animations
  useEffect(() => {
    if (stats.completedCount !== prevStats.completedCount) {
      setPrevStats({
        completedCount: stats.completedCount,
        totalCount: stats.totalCount
      });
    }
  }, [stats.completedCount, stats.totalCount, prevStats.completedCount]);

  // ✅ Handle optimistic question addition
  const handleQuestionAdded = () => {
    setOptimisticQuestionCount(prev => prev + 1);
    // Auto-expand section to show new question will be added
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  // ✅ Check if user can add questions to this topic
  const canAddQuestions = user && course && !course.isDefault;

  return (
    <Card className={`bg-gray-800 border-gray-700 transition-all duration-300 ${
      stats.isFullyCompleted ? 'border-green-500/30 shadow-green-500/10 shadow-lg' : ''
    }`}>
      <CardHeader className="p-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center justify-between w-full p-3 sm:p-4 text-left transition-all duration-200 ${
            stats.isFullyCompleted 
              ? 'hover:bg-green-500/10' 
              : 'hover:bg-gray-700/50'
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="transition-transform duration-200">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              )}
            </div>
            
            {/* Completion indicator */}
            {stats.isFullyCompleted && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            )}
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-semibold truncate transition-colors duration-300 ${
                  stats.isFullyCompleted ? 'text-green-400' : 'text-white'
                }`}>
                  Step {stepNumber}: {topic}
                </h3>
                {stats.isFullyCompleted && (
                  <TrendingUp className="w-4 h-4 text-green-400 animate-bounce" />
                )}
              </div>
              
              <div className="flex overflow-x-auto scrollbar-hide gap-1 sm:gap-2 mt-1 pb-1">
                <span className={`text-xs sm:text-sm text-gray-400 whitespace-nowrap flex-shrink-0 transition-colors duration-300 ${
                  optimisticQuestionCount > 0 ? 'text-blue-400' : ''
                }`}>
                  {stats.totalCount} problems
                  {optimisticQuestionCount > 0 && (
                    <span className="text-blue-400 animate-pulse"> (+{optimisticQuestionCount})</span>
                  )}
                </span>
                {stats.completionRate > 0 && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs flex-shrink-0 transition-colors duration-300 ${
                      stats.isFullyCompleted 
                        ? 'text-green-400 border-green-400' 
                        : 'text-blue-400 border-blue-400'
                    }`}
                  >
                    {stats.completionRate}% done
                  </Badge>
                )}
                {stats.easyCount > 0 && (
                  <Badge variant="outline" className="text-green-400 border-green-400 text-xs flex-shrink-0">
                    {stats.easyCount} Easy
                  </Badge>
                )}
                {stats.mediumCount > 0 && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs flex-shrink-0">
                    {stats.mediumCount} Medium
                  </Badge>
                )}
                {stats.hardCount > 0 && (
                  <Badge variant="outline" className="text-red-400 border-red-400 text-xs flex-shrink-0">
                    {stats.hardCount} Hard
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="hidden sm:flex items-center space-x-4 flex-shrink-0">
            <div className={`font-medium text-sm transition-all duration-300 ${
              stats.isFullyCompleted
                ? 'text-green-400 scale-110' 
                : optimisticQuestionCount > 0
                ? 'text-blue-400'
                : 'text-orange-400'
            }`}>
              {stats.completedCount} / {stats.totalCount}
            </div>
            <div className="relative w-16 lg:w-24 bg-gray-600 rounded-full h-1 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  stats.isFullyCompleted
                    ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-500/50 shadow-sm' 
                    : optimisticQuestionCount > 0
                    ? 'bg-blue-500'
                    : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
              />
              {/* Completion sparkle effect */}
              {stats.isFullyCompleted && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              )}
            </div>
          </div>
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0 animate-in slide-in-from-top-2 duration-300">
          <div className="border-t border-gray-700">
            {/* Question Items */}
            {liveQuestions.map((question, questionIndex) => (
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
                  courseTitle={course?.title}
                  showDelete={!course?.isDefault}
                />
              </div>
            ))}

            {/* Optimistic Loading Questions */}
            {optimisticQuestionCount > 0 && (
              Array.from({ length: optimisticQuestionCount }).map((_, index) => (
                <div
                  key={`optimistic-${index}`}
                  className="p-3 sm:p-4 border-b border-gray-700 bg-blue-500/5 border-l-2 border-l-blue-500 animate-pulse"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-blue-500/20 rounded w-3/4 mb-2" />
                      <div className="flex gap-2">
                        <div className="h-3 bg-gray-600 rounded w-16" />
                        <div className="h-3 bg-gray-600 rounded w-20" />
                      </div>
                    </div>
                    <div className="text-blue-400 text-xs">Adding...</div>
                  </div>
                </div>
              ))
            )}

            {/* Add Question Button */}
            {canAddQuestions && (
              <div className="p-3 sm:p-4 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center justify-center">
                  <AddQuestionDialog
                    courseId={courseId!}
                    onQuestionAdded={handleQuestionAdded}
                    topicFilter={topic} // Pass current topic as default
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
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
