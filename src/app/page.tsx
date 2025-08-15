'use client';

import { useState, useEffect } from 'react';
import { useCourses } from '@/hooks/useQuestions';
import { CoursesSidebar } from '@/components/layout/courses-sidebar';
import { CourseContent } from '@/components/layout/course-content';
import { DashboardHeader } from '@/components/layout/dashboard-header';
// import { MobileMenu } from '@/components/layout/mobile-menu';
import { CourseWithQuestions } from '@/types';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { data: courses, isLoading, error } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<CourseWithQuestions | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-lg text-gray-300">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-lg text-red-400">Error loading courses</div>
      </div>
    );
  }

  // Select default course by default if none selected
  if (!selectedCourse && courses && courses.length > 0) {
    const defaultCourse = courses.find(course => course.isDefault);
    setSelectedCourse(defaultCourse || courses[0]);
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            size="sm"
            variant="outline"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out' : 'relative'}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        w-80 sm:w-72 lg:w-80 xl:w-96
      `}>
        <CoursesSidebar
          courses={courses || []}
          selectedCourse={selectedCourse}
          onCourseSelect={(course) => {
            setSelectedCourse(course);
            if (isMobile) setSidebarOpen(false);
          }}
          isMobile={isMobile}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader selectedCourse={selectedCourse} isMobile={isMobile} />
        <CourseContent course={selectedCourse} />
      </div>
    </div>
  );
}
