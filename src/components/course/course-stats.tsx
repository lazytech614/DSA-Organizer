'use client';

import { CourseWithQuestions } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface CourseStatsProps {
  course: CourseWithQuestions;
}

export function CourseStats({ course }: CourseStatsProps) {
  const totalQuestions = course.questions.length;
  const easyCount = course.questions.filter(q => q.difficulty.toLocaleUpperCase() === 'EASY').length;
  const mediumCount = course.questions.filter(q => q.difficulty.toLocaleUpperCase() === 'MEDIUM').length;
  const hardCount = course.questions.filter(q => q.difficulty.toLocaleUpperCase() === 'HARD').length;

  let completedCount = 0;
  course.questions.map(q => q.isSolved && completedCount++);
  const progressPercentage = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;

  let easyCompletedCount = 0;
  course.questions.map(q => q.isSolved && q.difficulty.toLocaleUpperCase() === 'EASY' && easyCompletedCount++);
  const easyProgressPercentage = easyCount > 0 ? (easyCompletedCount / easyCount) * 100 : 0;

  let mediumCompletedCount = 0;
  course.questions.map(q => q.isSolved && q.difficulty.toLocaleUpperCase() === 'MEDIUM' && mediumCompletedCount++);
  const mediumProgressPercentage = mediumCount > 0 ? (mediumCompletedCount / mediumCount) * 100 : 0;

  let hardCompletedCount = 0;
  course.questions.map(q => q.isSolved && q.difficulty.toLocaleUpperCase() === 'HARD' && hardCompletedCount++);
  const hardProgressPercentage = hardCount > 0 ? (hardCompletedCount / hardCount) * 100 : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Progress */}
      <Card className="bg-gray-700 border-gray-600 col-span-2 lg:col-span-1">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-white">
              {completedCount} / {totalQuestions}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Total Progress</div>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-orange-400 text-sm mt-1 font-medium">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Easy Questions */}
      <Card className="bg-gray-700 border-gray-600">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-green-400">
              {easyCompletedCount} / {easyCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Easy</div>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div className={`bg-green-500 h-2 rounded-full w-${easyProgressPercentage}%`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medium Questions */}
      <Card className="bg-gray-700 border-gray-600">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-yellow-400">
              {mediumCompletedCount} / {mediumCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Medium</div>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full w-0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hard Questions */}
      <Card className="bg-gray-700 border-gray-600">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-red-400">
              {hardCompletedCount} / {hardCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Hard</div>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full w-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
