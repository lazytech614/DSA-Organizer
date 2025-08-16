'use client';

import React from 'react';
import { CourseWithQuestions } from '@/types';

interface CourseStatsProps {
  course: CourseWithQuestions;
}

/**
 * CircularProgress
 * - percentage: number 0..100
 * - size: diameter in px (default 80)
 */
function CircularProgress({ percentage, size = 80 }: { percentage: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${circumference}`;
  const strokeDashoffset = `${circumference - (percentage / 100) * circumference}`;

  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden={false}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        role="img"
        aria-label={`Progress ${Math.round(percentage)}%`}
      >
        {/* background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-700"
        />

        {/* progress circle (orange) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-orange-500 transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>

      {/* percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-orange-400 font-bold text-sm md:text-lg select-none">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

export function CourseStats({ course }: CourseStatsProps) {
  const totalQuestions = course.questions.length;
  const easyCount = course.questions.filter(q => q.difficulty.toUpperCase() === 'EASY').length;
  const mediumCount = course.questions.filter(q => q.difficulty.toUpperCase() === 'MEDIUM').length;
  const hardCount = course.questions.filter(q => q.difficulty.toUpperCase() === 'HARD').length;

  const completedCount = course.questions.filter(q => q.isSolved).length;
  const easyCompletedCount = course.questions.filter(q => q.isSolved && q.difficulty.toUpperCase() === 'EASY').length;
  const mediumCompletedCount = course.questions.filter(q => q.isSolved && q.difficulty.toUpperCase() === 'MEDIUM').length;
  const hardCompletedCount = course.questions.filter(q => q.isSolved && q.difficulty.toUpperCase() === 'HARD').length;

  const progressPercentage = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;
  const easyProgressPercentage = easyCount > 0 ? (easyCompletedCount / easyCount) * 100 : 0;
  const mediumProgressPercentage = mediumCount > 0 ? (mediumCompletedCount / mediumCount) * 100 : 0;
  const hardProgressPercentage = hardCount > 0 ? (hardCompletedCount / hardCount) * 100 : 0;

  // color hex values to keep original color combinations
  const colors = {
    easy: '#16a34a', // green-500
    medium: '#f59e0b', // yellow-500
    hard: '#ef4444', // red-500
    progressTrack: '#1f2937', // gray-800
  };

  return (
    <div className="bg-gray-700 rounded-2xl p-6 border border-gray-800">
      {/* Desktop layout */}
      <div className="hidden md:flex items-center gap-8">
        {/* Left: Total Progress */}
        <div className="flex items-center gap-6 min-w-[220px]">
          <div>
            <h3 className="text-gray-200 font-semibold text-lg mb-1">Total Progress</h3>
            <div className="text-white text-2xl font-extrabold">
              {completedCount} / {totalQuestions}
            </div>
          </div>

          <div className="ml-2">
            <CircularProgress percentage={progressPercentage} />
          </div>
        </div>

        {/* vertical divider */}
        <div className="h-20 w-px bg-gray-800" />

        {/* Right: difficulty sections with divide-x for vertical separators */}
        <div className="flex items-center flex-1 divide-x divide-gray-700 pl-6">
          {/* Easy */}
          <div className="pr-6 pl-0 min-w-[240px]">
            <h4 className="text-gray-200 font-semibold mb-1">Easy</h4>

            <div className="flex items-baseline gap-3">
              <div className="text-white text-xl font-extrabold">
                {easyCompletedCount}
                <span className="text-gray-400 font-normal text-base"> / {easyCount}</span>
              </div>
              <span className="text-gray-400 text-sm">completed</span>
            </div>

            <div className="mt-3 w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: colors.progressTrack }}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${easyProgressPercentage}%`, backgroundColor: colors.easy }}
              />
            </div>
          </div>

          {/* Medium */}
          <div className="px-6 min-w-[240px]">
            <h4 className="text-gray-200 font-semibold mb-1">Medium</h4>

            <div className="flex items-baseline gap-3">
              <div className="text-white text-xl font-extrabold">
                {mediumCompletedCount}
                <span className="text-gray-400 font-normal text-base"> / {mediumCount}</span>
              </div>
              <span className="text-gray-400 text-sm">completed</span>
            </div>

            <div className="mt-3 w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: colors.progressTrack }}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${mediumProgressPercentage}%`, backgroundColor: colors.medium }}
              />
            </div>
          </div>

          {/* Hard */}
          <div className="pl-6 pr-0 min-w-[240px]">
            <h4 className="text-gray-200 font-semibold mb-1">Hard</h4>

            <div className="flex items-baseline gap-3">
              <div className="text-white text-xl font-extrabold">
                {hardCompletedCount}
                <span className="text-gray-400 font-normal text-base"> / {hardCount}</span>
              </div>
              <span className="text-gray-400 text-sm">completed</span>
            </div>

            <div className="mt-3 w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: colors.progressTrack }}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${hardProgressPercentage}%`, backgroundColor: colors.hard }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden space-y-6">
        {/* Total Progress */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-200 font-semibold text-lg mb-1">Total Progress</h3>
            <div className="text-white text-2xl font-bold">
              {completedCount} / {totalQuestions}
            </div>
          </div>
          <CircularProgress percentage={progressPercentage} size={60} />
        </div>

        <div className="w-full h-px bg-gray-600" />

        <div className="grid grid-cols-3 gap-4">
          {/* Easy */}
          <div className="space-y-1">
            <h4 className="text-white font-semibold text-sm">Easy</h4>
            <div className="text-green-400 font-bold text-sm">
              {easyCompletedCount} / {easyCount}
            </div>
            <div className="text-gray-400 text-xs">completed</div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: colors.progressTrack }}>
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${easyProgressPercentage}%`, backgroundColor: colors.easy }}
              />
            </div>
          </div>

          {/* Medium */}
          <div className="space-y-1">
            <h4 className="text-white font-semibold text-sm">Medium</h4>
            <div className="text-yellow-400 font-bold text-sm">
              {mediumCompletedCount} / {mediumCount}
            </div>
            <div className="text-gray-400 text-xs">completed</div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: colors.progressTrack }}>
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${mediumProgressPercentage}%`, backgroundColor: colors.medium }}
              />
            </div>
          </div>

          {/* Hard */}
          <div className="space-y-1">
            <h4 className="text-white font-semibold text-sm">Hard</h4>
            <div className="text-red-400 font-bold text-sm">
              {hardCompletedCount} / {hardCount}
            </div>
            <div className="text-gray-400 text-xs">completed</div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: colors.progressTrack }}>
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${hardProgressPercentage}%`, backgroundColor: colors.hard }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseStats;
