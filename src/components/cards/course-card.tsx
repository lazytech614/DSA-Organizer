'use client';

import { CourseWithQuestions } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddQuestionDialog } from '../dialogs/add-question-dialog';
import { QuestionCard } from './question-card';

interface CourseCardProps {
  course: CourseWithQuestions;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">{course.title}</CardTitle>
          {course.isDefault && (
            <Badge variant="secondary" className="mt-1">
              Default Course
            </Badge>
          )}
        </div>
        <AddQuestionDialog 
          courseId={course.id} 
          disabled={course.isDefault}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {course.questions.length} question{course.questions.length !== 1 ? 's' : ''}
          </p>
          {course.questions.length > 0 ? (
            <div className="space-y-2">
              {course.questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No questions in this course yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
