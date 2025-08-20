import { Question } from '@prisma/client';

export interface QuestionItemProps {
  question: Question & { isSolved?: boolean; isBookmarked?: boolean };
  index: number;
  courseId?: string;
  courseTitle?: string;
  showDelete?: boolean;
  isNew?: boolean;
}

export interface QuestionState {
  isSolved: boolean;
  isBookmarked: boolean;
  isDeleting: boolean;
  shouldHide: boolean;
  showNewBadge: boolean;
  canDelete: boolean;
  setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface QuestionNumberProps {
  index: number;
  isSolved: boolean;
  isNew: boolean;
}

export interface QuestionInfoProps {
  question: Question;
  isSolved: boolean;
  isNew: boolean;
  isBookmarked: boolean;
  isDeleting: boolean;
  showNewBadge: boolean;
}

export interface QuestionActionsProps {
  question: Question;
  canDelete: boolean;
  courseTitle?: string;
  onDeleteStart: () => void;
  onDeleteComplete: () => void;
  isDeleting: boolean;
}

export interface ActionButtonProps {
  question: Question;
  isDeleting: boolean;
}
