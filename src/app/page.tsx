'use client';

import { useState, useEffect } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { CoursesSidebar } from '@/components/layout/courses-sidebar';
import { CourseContent } from '@/components/layout/course-content';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { CourseWithQuestions } from '@/types';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { data: courses, isLoading, error } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<CourseWithQuestions | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // ✅ This state is properly managed

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Always open on desktop
        // ✅ Reset collapse state when switching to desktop
      } else {
        setSidebarOpen(false); // Always closed initially on mobile
        setSidebarCollapsed(false); // ✅ Reset collapse on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile) {
      if (sidebarOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, isMobile]);

  // Close sidebar on mobile when course changes
  const handleCourseSelect = (course: CourseWithQuestions) => {
    setSelectedCourse(course);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // ✅ Debug function to check if toggle is working
  const handleToggleCollapse = () => {
    console.log('Toggle collapse clicked:', { current: sidebarCollapsed, new: !sidebarCollapsed });
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
      {/* Desktop Sidebar - ✅ Fixed container width logic */}
      {!isMobile && (
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80 xl:w-96'} flex-shrink-0 transition-all duration-300`}>
          <CoursesSidebar
            courses={courses || []}
            selectedCourse={selectedCourse}
            onCourseSelect={handleCourseSelect}
            isMobile={false}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
        </div>
      )}

      {/* Mobile Sidebar with Sliding Animation */}
      {isMobile && (
        <>
          {/* Background Overlay */}
          <div 
            className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out lg:hidden ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          </div>
          
          {/* Sidebar Panel with Slide Animation */}
          <div 
            className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full bg-gray-900 shadow-2xl">
              <CoursesSidebar
                courses={courses || []}
                selectedCourse={selectedCourse}
                onCourseSelect={handleCourseSelect}
                onClose={() => setSidebarOpen(false)}
                isMobile={true}
                collapsed={false} // ✅ Mobile is never collapsed
                onToggleCollapse={undefined} // ✅ No toggle on mobile
              />
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header with Menu Button */}
        {isMobile && (
          <div className="lg:hidden bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 -ml-2 transition-all duration-200"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-orange-400">DSA Platform</h1>
                {selectedCourse && (
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">
                    {selectedCourse.title}
                  </p>
                )}
              </div>
            </div>
            
            {/* Mobile header actions */}
            <DashboardHeader selectedCourse={selectedCourse} isMobile={true} />
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <DashboardHeader selectedCourse={selectedCourse} isMobile={false} />
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto main-content-scroll">
          <CourseContent course={selectedCourse} />
        </div>
      </div>

      {/* Floating Menu Button with Animation */}
      {isMobile && !sidebarOpen && (
        <Button
          onClick={() => setSidebarOpen(true)}
          className={`fixed bottom-6 right-6 z-40 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 lg:hidden transform ${
            sidebarOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* ✅ Debug indicator - Remove after testing */}
      {!isMobile && (
        <div className="fixed bottom-4 right-4 bg-black/50 text-white p-2 rounded text-xs">
          Collapsed: {sidebarCollapsed.toString()}
        </div>
      )}
    </div>
  );
}
