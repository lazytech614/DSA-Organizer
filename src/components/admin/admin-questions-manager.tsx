'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Edit, Trash2, ExternalLink, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddQuestionDialog } from './add-question-dialog';
import { EditQuestionDialog } from './edit-question-dialog';
import { DeleteQuestionDialog } from './delete-question-dialog';

export function AdminQuestionsManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Get all courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/questions');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    }
  });

  // Get specific course data
  const { data: courseData, isLoading: courseLoading } = useQuery({
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
  const questions = courseData?.course?.questions || [];

  // Auto-select first course if none selected
  if (!selectedCourseId && courses.length > 0) {
    setSelectedCourseId(courses[0].id);
  }

  const filteredQuestions = questions.filter((question: any) =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.topics.some((topic: string) => 
      topic.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const difficultyColors = {
    EASY: 'text-green-400 border-green-400',
    MEDIUM: 'text-yellow-400 border-yellow-400',
    HARD: 'text-red-400 border-red-400',
  };

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-300">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Question Management</h1>
          <p className="text-gray-400 mt-1">
            Manage questions across default courses
          </p>
        </div>
        <AddQuestionDialog />
      </div>

      {/* Course Selection and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select a course" />
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
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search questions by title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      {/* Course Header */}
      {selectedCourseId && courseData?.course && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {courseData.course.title}
                </h2>
                <p className="text-gray-400">
                  {questions.length} questions total
                </p>
              </div>
              <AddQuestionDialog courseId={selectedCourseId}>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </AddQuestionDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {courseLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-lg text-gray-300">Loading questions...</div>
        </div>
      )}

      {/* Questions List */}
      {!courseLoading && (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">
                  {searchTerm ? 'No questions found matching your search.' : 
                   selectedCourseId ? 'No questions found in this course.' : 
                   'Select a course to view questions.'}
                </p>
                {selectedCourseId && !searchTerm && (
                  <AddQuestionDialog courseId={selectedCourseId}>
                    <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                      Add First Question
                    </Button>
                  </AddQuestionDialog>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question: any, index: number) => (
              <Card key={question.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-400">#{index + 1}</span>
                        <h3 className="font-medium text-white truncate">{question.title}</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${difficultyColors[question.difficulty as keyof typeof difficultyColors]}`}
                        >
                          {question.difficulty}
                        </Badge>
                        {question.topics.map((topic: string) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {question.urls.slice(0, 3).map((url: string, urlIndex: number) => (
                          <a
                            key={urlIndex}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {url.includes('leetcode') ? 'LeetCode' : 
                             url.includes('geeksforgeeks') ? 'GeeksforGeeks' : 
                             `Link ${urlIndex + 1}`}
                          </a>
                        ))}
                        {question.urls.length > 3 && (
                          <span className="text-xs text-gray-500">+{question.urls.length - 3} more</span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        Created: {new Date(question.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedQuestion({ ...question, courseId: selectedCourseId });
                          setEditDialogOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedQuestion({ ...question, courseId: selectedCourseId });
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <EditQuestionDialog
        question={selectedQuestion}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => setEditDialogOpen(false)}
      />

      {/* Delete Dialog */}
      <DeleteQuestionDialog
        question={selectedQuestion}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
