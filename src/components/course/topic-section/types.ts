import { QuestionWithSolvedStatus } from '@/types';

export interface TopicSectionProps {
  topic: string;
  questions: QuestionWithSolvedStatus[];
  stepNumber: number;
  courseId?: string;
}

export interface TopicStats {
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  completedCount: number;
  progressPercentage: number;
  totalCount: number;
  completionRate: number;
  isFullyCompleted: boolean;
}

export interface TopicHeaderProps {
  topic: string;
  stepNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  stats: TopicStats;
  optimisticQuestionCount: number;
}

export interface QuestionListProps {
  questions: QuestionWithSolvedStatus[];
  courseId?: string;
  courseTitle?: string;
}

export interface OptimisticLoaderProps {
  count: number;
}

export interface AddQuestionCTAProps {
  courseId: string;
  topic: string;
  canAddQuestions: boolean;
  onQuestionAdded: () => void;
}
