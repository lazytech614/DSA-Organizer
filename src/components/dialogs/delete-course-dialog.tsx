'use client';

import { useState } from 'react';
import { Trash, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteCourse } from '@/hooks/useCourses';
import { CourseWithQuestions } from '@/types';

interface DeleteCourseDialogProps {
  course: CourseWithQuestions;
  children?: React.ReactNode;
}

export function DeleteCourseDialog({ course, children }: DeleteCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteCourse = useDeleteCourse();

  const handleDelete = async () => {
    try {
      await deleteCourse.mutateAsync(course.id);
      setOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-red-400 p-1"
            title="Delete course"
          >
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Delete Course
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            This action cannot be undone. This will permanently delete the course and all its questions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Info */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">{course.title}</h4>
            <div className="text-sm text-gray-400 space-y-1">
              <div>📚 {course.questions.length} questions will be deleted</div>
              <div>📅 Created: {new Date(course.createdAt).toLocaleDateString()}</div>
              {!course.isDefault && (
                <div className="text-orange-400">⚠️ This is your personal course</div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-medium text-sm">Warning</span>
            </div>
            <p className="text-red-200 text-sm">
              All progress, bookmarks, and solved status for questions in this course will be permanently lost.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 hover:bg-gray-700"
              disabled={deleteCourse.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteCourse.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteCourse.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Course
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
