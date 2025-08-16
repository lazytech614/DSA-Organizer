'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, TrendingUp, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { AddQuestionDialog } from './add-question-dialog';
import { AddCourseDialog } from './add-course-dialog';

export function AdminDashboard() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Get all default courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/questions');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    }
  });

  // Get specific course data when one is selected
  const { data: selectedCourseData, isLoading: courseLoading } = useQuery({
    queryKey: ['admin-course', selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return null;
      const response = await fetch(`/api/admin/questions?courseId=${selectedCourseId}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      return response.json();
    },
    enabled: !!selectedCourseId
  });

  const courses = coursesData?.courses || [];
  const selectedCourse = selectedCourseData?.course;

  // Auto-select first course if none selected
  if (!selectedCourseId && courses.length > 0) {
    setSelectedCourseId(courses[0].id);
  }

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-300">Loading dashboard...</div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Default Courses',
      value: coursesData?.totalCourses || 0,
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Total Questions',
      value: coursesData?.totalQuestions || 0,
      icon: BookOpen,
      color: 'text-green-400'
    },
    {
      title: 'Current Course Questions',
      value: selectedCourse?.questions?.length || 0,
      icon: TrendingUp,
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage default courses and questions</p>
        </div>
        <div className="flex items-center gap-2">
          <AddCourseDialog />
        </div>
      </div>

      {/* Course Selector */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Course Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 max-w-md">
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select a course to manage" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} ({course._count.questions} questions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCourseId && (
              <AddQuestionDialog courseId={selectedCourseId}>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question to Course
                </Button>
              </AddQuestionDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/questions">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Manage All Questions
              </Button>
            </Link>
            <AddCourseDialog>
              <Button className="w-full justify-start" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create New Course
              </Button>
            </AddCourseDialog>
          </div>
        </CardContent>
      </Card>

      {/* Current Course Overview */}
      {selectedCourse && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {selectedCourse.title} - Recent Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courseLoading ? (
              <div className="text-gray-400">Loading course details...</div>
            ) : selectedCourse.questions?.length > 0 ? (
              <div className="space-y-2">
                {selectedCourse.questions.slice(0, 5).map((question: any) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-white">{question.title}</h4>
                      <p className="text-sm text-gray-400">
                        {question.difficulty} • {question.topics.join(', ')}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {selectedCourse.questions.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/admin/questions">
                      <Button variant="ghost" size="sm">
                        View all {selectedCourse.questions.length} questions
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No questions in this course yet.</p>
                <AddQuestionDialog courseId={selectedCourseId}>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                </AddQuestionDialog>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
