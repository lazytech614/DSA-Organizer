'use client';

import { useCourses } from '@/hooks/useQuestions';
import { AddCourseDialog } from '@/components/dialogs/add-course-dialog';
import { CourseCard } from '@/components/cards/course-card';
import { useUser } from '@clerk/nextjs';

export default function HomePage() {
  const { data: courses, isLoading, error } = useCourses();
  const { isSignedIn } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading courses</div>
      </div>
    );
  }

  const defaultCourses = courses?.filter(course => course.isDefault) || [];
  const userCourses = courses?.filter(course => !course.isDefault) || [];

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DSA Courses</h1>
            <p className="text-gray-600 mt-1">
              Organize and track your Data Structures and Algorithms journey
            </p>
          </div>
          {isSignedIn && <AddCourseDialog />}
        </div>

        <div className="space-y-8">
          {/* Default Courses Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Default Courses
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {defaultCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            {defaultCourses.length === 0 && (
              <p className="text-gray-500">No default courses available.</p>
            )}
          </div>

          {/* User Courses Section */}
          {isSignedIn && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                My Courses
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              {userCourses.length === 0 && (
                <p className="text-gray-500">
                  You haven't created any courses yet. Click "Add Course" to get started!
                </p>
              )}
            </div>
          )}

          {/* Sign In Message for Non-Authenticated Users */}
          {!isSignedIn && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Create Your Own Courses
              </h3>
              <p className="text-blue-700 mb-4">
                Sign in to create custom courses and organize your DSA journey
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
