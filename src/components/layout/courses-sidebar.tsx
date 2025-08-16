'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, BookOpen, Plus, User } from 'lucide-react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { CourseWithQuestions } from '@/types';
import { Button } from '@/components/ui/button';
import { AddCourseDialog } from '@/components/dialogs/add-course-dialog';
import { Badge } from '@/components/ui/badge';

interface CoursesSidebarProps {
  courses: CourseWithQuestions[];
  selectedCourse: CourseWithQuestions | null;
  onCourseSelect: (course: CourseWithQuestions) => void;
  isMobile?: boolean;
}

export function CoursesSidebar({ courses, selectedCourse, onCourseSelect, isMobile = false }: CoursesSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['default', 'user']);
  const { isSignedIn } = useUser();

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const defaultCourses = courses.filter(course => course.isDefault);
  const userCourses = courses.filter(course => !course.isDefault);

  return (
    <div className="w-full h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className={`border-b border-gray-700 ${isMobile ? 'p-4' : 'p-6'}`}>
        <h1 className={`font-bold text-orange-400 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          DSA Platform
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isMobile ? 'Learning path' : 'Choose your learning path'}
        </p>
      </div>

      {/* Courses List */}
      <div className={`flex-1 overflow-y-auto space-y-3 ${isMobile ? 'p-3' : 'p-4'}`}>
        {/* Default Courses Section */}
        <div>
          <button
            onClick={() => toggleSection('default')}
            className={`flex items-center justify-between w-full text-left rounded-lg transition-colors ${expandedSections.includes('default') ? 'bg-gray-700' : 'hover:bg-gray-700'} ${
              isMobile ? 'p-2' : 'p-2'
            }`}
          >
            <div className="flex items-center space-x-2 min-w-0">
              {expandedSections.includes('default') ? (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <BookOpen className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span className={`font-medium text-gray-200 truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
                Default Courses
              </span>
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
              {defaultCourses.length}
            </Badge>
          </button>

          {expandedSections.includes('default') && (
            <div className={`mt-2 space-y-1 ${isMobile ? 'ml-4' : 'ml-6'}`}>
              {defaultCourses.map((course) => (
                <CourseItem
                  key={course.id}
                  course={course}
                  isSelected={selectedCourse?.id === course.id}
                  onClick={() => onCourseSelect(course)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </div>

        {/* User Courses Section */}
        {isSignedIn ? (
          <div>
            <button
              onClick={() => toggleSection('user')}
              className={`flex items-center justify-between w-full text-left ${expandedSections.includes('user') ? 'bg-gray-700' : 'hover:bg-gray-700'} rounded-lg transition-colors ${
                isMobile ? 'p-2' : 'p-2'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                {expandedSections.includes('user') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className={`font-medium text-gray-200 truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
                  My Courses
                </span>
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                {userCourses.length}
              </Badge>
            </button>

            {expandedSections.includes('user') && (
              <div className={`mt-2 space-y-1 ${isMobile ? 'ml-4' : 'ml-6'}`}>
                {userCourses.map((course) => (
                  <CourseItem
                    key={course.id}
                    course={course}
                    isSelected={selectedCourse?.id === course.id}
                    onClick={() => onCourseSelect(course)}
                    isMobile={isMobile}
                  />
                ))}
                <div className="mt-2">
                  <AddCourseDialog />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg p-4 flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-blue-300 font-medium mb-1">Create Custom Courses</h4>
              <p className="text-gray-300 text-sm mb-3">Sign in to add new courses to organize your questions and track your learning progress.</p>
              <SignInButton>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition-colors">
                  Create Now
                </Button>
              </SignInButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CourseItemProps {
  course: CourseWithQuestions;
  isSelected: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

function CourseItem({ course, isSelected, onClick, isMobile = false }: CourseItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg transition-colors ${
        isMobile ? 'p-2' : 'p-3'
      } ${
        isSelected
          ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
          : 'hover:bg-gray-700 text-gray-300'
      }`}
    >
      <div className="flex items-center justify-between min-w-0">
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
            {course.title}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {course.questions.length} questions
          </p>
        </div>
        {course.isDefault && (
          <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">
            Default
          </Badge>
        )}
      </div>
    </button>
  );
}
