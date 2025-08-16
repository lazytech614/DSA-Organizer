import { Course, Question, User, Difficulty } from '@prisma/client';

export type QuestionWithCourses = Question & {
  courses: Course[];
};

export type QuestionWithSolvedStatus = Question & {
  isSolved: boolean;
};

export type CourseWithQuestions = Course & {
  questions: QuestionWithSolvedStatus[];
  user?: User | null;
};

export interface CreateQuestionData {
  title: string;
  topics: string[];
  urls: string[];
  difficulty: Difficulty;
  courseId: string;
}

export interface CreateCourseData {
  title: string;
}
