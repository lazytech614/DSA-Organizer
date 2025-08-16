'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, BookOpen, User, Crown, AlertTriangle, Zap, Trash, X } from 'lucide-react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { CourseWithQuestions } from '@/types';
import { Button } from '@/components/ui/button';
import { AddCourseDialog } from '@/components/dialogs/add-course-dialog';
import { Badge } from '@/components/ui/badge';
import { useUserInfo } from '@/hooks/useUserInfo';
import Link from 'next/link';
import { DeleteCourseDialog } from '../dialogs/delete-course-dialog';

interface CoursesSidebarProps {
  courses: CourseWithQuestions[];
  selectedCourse: CourseWithQuestions | null;
  onCourseSelect: (course: CourseWithQuestions) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function CoursesSidebar({ 
  courses, 
  selectedCourse, 
  onCourseSelect, 
  isMobile = false,
  onClose 
}: CoursesSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['default', 'user']);
  const [isVisible, setIsVisible] = useState(false);
  const { isSignedIn } = useUser();
  const { data: userInfo, isLoading, isError } = useUserInfo();

  // Handle entrance animation
  useEffect(() => {
    if (isMobile) {
      // Delay to allow CSS transition to work
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isMobile]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleClose = () => {
    if (onClose && isMobile) {
      setIsVisible(false);
      // Delay closing to allow exit animation
      setTimeout(() => onClose(), 200);
    }
  };

  const defaultCourses = courses.filter(course => course.isDefault);
  const userCourses = courses.filter(course => !course.isDefault);

  // Rest of your existing sidebar logic...
  const getUsagePercentage = () => {
    if (!userInfo?.limits) return 0;
    const { coursesUsed, maxCourses } = userInfo.limits;
    if (maxCourses === -1) return 0;
    return (coursesUsed / maxCourses) * 100;
  };

  const renderSubscriptionNotice = () => {
    // Your existing renderSubscriptionNotice code...
    if (!userInfo) return null;

    const { isPro, limits, stats } = userInfo;
    const usagePercentage = getUsagePercentage();

    if (isPro) {
      return (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 transform transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <h4 className="text-yellow-300 font-medium text-sm">Pro Member</h4>
          </div>
          <div className="space-y-1 text-xs text-yellow-200">
            <div className="flex justify-between">
              <span>Courses:</span>
              <span className="font-medium">Unlimited</span>
            </div>
            <div className="flex justify-between">
              <span>Questions:</span>
              <span className="font-medium">Unlimited per course</span>
            </div>
            <div className="flex justify-between">
              <span>Solved:</span>
              <span className="font-medium">{stats.totalQuestionsSolved}</span>
            </div>
          </div>
        </div>
      );
    }

    // Your other subscription notice variants...
    const isNearLimit = usagePercentage >= 80;
    const isAtLimit = !limits.canCreateCourse;

    if (isAtLimit) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 space-y-2 transform transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h4 className="text-red-300 font-medium text-sm">Limit Reached</h4>
          </div>
          <p className="text-xs text-red-200 mb-3">
            You've used all {limits.maxCourses} course slots. Upgrade to create unlimited courses!
          </p>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Questions solved:</span>
            <span className="font-medium text-gray-300">{stats.totalQuestionsSolved}</span>
          </div>
          {stats.streakDays > 0 && (
            <div className="flex justify-between text-xs text-gray-400">
              <span>Current streak:</span>
              <span className="font-medium text-green-400">{stats.streakDays} days 🔥</span>
            </div>
          )}
          <Link href="/pricing">
            <Button size="sm" className="w-full bg-red-500 hover:bg-red-600 text-white text-xs h-7 transition-colors">
              <Crown className="w-3 h-3 mr-1" />
              Upgrade Now
            </Button>
          </Link>
        </div>
      );
    }

    // Add other cases...
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4 transform transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-400" />
          <h4 className="text-gray-300 font-medium text-sm">Free Plan</h4>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Courses:</span>
              <span className="font-medium text-gray-300">{limits.coursesUsed} / {limits.maxCourses}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Questions solved:</span>
            <span className="font-medium text-gray-300">{stats.totalQuestionsSolved}</span>
          </div>
          {stats.streakDays > 0 && (
            <div className="flex justify-between text-xs text-gray-400">
              <span>Current streak:</span>
              <span className="font-medium text-green-400">{stats.streakDays} days 🔥</span>
            </div>
          )}
          <Link href="/pricing">
            <Button size="sm" variant="outline" className="w-full text-xs h-7 border-gray-600 hover:bg-gray-700 transition-colors">
              <Crown className="w-3 h-3 mr-1" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full h-full bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300 ${
      isMobile ? (isVisible ? 'opacity-100' : 'opacity-0') : 'opacity-100'
    }`}>
      {/* Header with Slide-in Animation */}
      <div className={`border-b border-gray-700 ${isMobile ? 'p-4' : 'p-6 min-h-[100px]'} transition-all duration-300 delay-75 ${
        isMobile ? (isVisible ? 'transform translate-x-0' : 'transform -translate-x-4 opacity-0') : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className={`font-bold text-orange-400 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              DSA Platform
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {isMobile ? 'Learning path' : 'Choose your learning path'}
            </p>
          </div>
          
          {/* Close button with hover effect */}
          {/* {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 ml-2 rounded-full transition-all duration-200 hover:rotate-90"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </Button>
          )} */}
        </div>
      </div>

      {/* Subscription Notice with Staggered Animation */}
      {isSignedIn && !isLoading && (
        <div className={`border-b border-gray-700 ${isMobile ? 'p-3' : 'p-4'} transition-all duration-300 delay-100 ${
          isMobile ? (isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-4 opacity-0') : ''
        }`}>
          {renderSubscriptionNotice()}
        </div>
      )}

      {/* Courses List with Staggered Animation */}
      <div className={`flex-1 overflow-y-auto space-y-3 ${isMobile ? 'p-3' : 'p-4'} transition-all duration-300 delay-150 ${
        isMobile ? (isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-4 opacity-0') : ''
      }`}>
        {/* Default Courses Section */}
        <div className="transform transition-all duration-300">
          <button
            onClick={() => toggleSection('default')}
            className={`flex items-center justify-between w-full text-left rounded-lg transition-all duration-200 hover:scale-[1.02] ${
              expandedSections.includes('default') ? 'bg-gray-800 shadow-sm' : 'hover:bg-gray-800'
            } ${isMobile ? 'p-2' : 'p-2'}`}
          >
            <div className="flex items-center space-x-2 min-w-0">
              <div className="transition-transform duration-200">
                {expandedSections.includes('default') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
              <BookOpen className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span className={`font-medium text-gray-200 truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
                Default Courses
              </span>
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2 transition-all duration-200">
              {defaultCourses.length}
            </Badge>
          </button>

          {/* Animated expansion */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expandedSections.includes('default') ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } pb-1`}>
            <div className={`mt-2 space-y-1 ${isMobile ? 'ml-4' : 'ml-6'}`}>
              {defaultCourses.map((course, index) => (
                <div
                  key={course.id}
                  className={`transform transition-all duration-300 pr-1 ${
                    expandedSections.includes('default') 
                      ? 'translate-x-0 opacity-100' 
                      : '-translate-x-4 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <CourseItem
                    course={course}
                    isSelected={selectedCourse?.id === course.id}
                    onClick={() => onCourseSelect(course)}
                    isMobile={isMobile}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Courses Section with Similar Animation */}
        {isSignedIn ? (
          <div className="transform transition-all duration-300">
            <button
              onClick={() => toggleSection('user')}
              className={`flex items-center justify-between w-full text-left rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                expandedSections.includes('user') ? 'bg-gray-800 shadow-sm' : 'hover:bg-gray-800'
              } ${isMobile ? 'p-2' : 'p-2'}`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <div className="transition-transform duration-200">
                  {expandedSections.includes('user') ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                </div>
                <span className={`font-medium text-gray-200 truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
                  My Courses
                  {userInfo?.isPro && <span className="text-yellow-400 ml-1">Pro</span>}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2 transition-all duration-200">
                {userCourses.length}
                {userInfo?.limits && userInfo.limits.maxCourses !== -1 && (
                  <span className="text-gray-500">/{userInfo.limits.maxCourses}</span>
                )}
              </Badge>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedSections.includes('user') ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className={`mt-2 space-y-1 ${isMobile ? 'ml-4' : 'ml-6'}`}>
                {userCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className={`group transform transition-all duration-300 pr-1 ${
                      expandedSections.includes('user') 
                        ? 'translate-x-0 opacity-100' 
                        : '-translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <CourseItem
                      course={course}
                      isSelected={selectedCourse?.id === course.id}
                      onClick={() => onCourseSelect(course)}
                      isMobile={isMobile}
                    />
                  </div>
                ))}
                <div className={`mt-2 transform transition-all duration-300 ${
                  expandedSections.includes('user') 
                    ? 'translate-x-0 opacity-100' 
                    : '-translate-x-4 opacity-0'
                }`} style={{ transitionDelay: `${userCourses.length * 50}ms` }}>
                  <AddCourseDialog />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg p-4 flex items-start space-x-3 transform transition-all duration-300 hover:bg-blue-500/20">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-blue-300 font-medium mb-1">Create Custom Courses</h4>
              <p className="text-gray-300 text-sm mb-3">Sign in to add new courses to organize your questions and track your learning progress.</p>
              <SignInButton>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition-all duration-200 hover:scale-105">
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
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
  };

  return (
    <div
      className={`w-full rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
        isMobile ? 'p-2' : 'p-3'
      } ${
        isSelected
          ? 'bg-orange-500/10 border border-orange-500/20 shadow-lg scale-[1.02]'
          : 'hover:bg-gray-700 active:scale-[0.98]'
      }`}
    >
      <div className="flex items-center justify-between min-w-0">
        <button
          onClick={onClick}
          className={`flex-1 min-w-0 text-left touch-manipulation transition-colors duration-200 ${
            isSelected ? 'text-orange-400' : 'text-gray-300'
          }`}
        >
          <p className={`font-medium truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
            {course.title}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {course.questions.length} questions
          </p>
        </button>

        <div className="flex items-center gap-1 ml-2" onClick={handleDeleteClick}>
          {course.isDefault ? (
            <Badge variant="outline" className="text-xs flex-shrink-0 transition-all duration-200">
              Default
            </Badge>
          ) : (
            <DeleteCourseDialog course={course}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                title="Delete course"
              >
                <Trash className="w-3 h-3" />
              </Button>
            </DeleteCourseDialog>
          )}
        </div>
      </div>
    </div>
  );
}
