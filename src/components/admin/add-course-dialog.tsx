'use client';

import { useState, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddCourseDialogProps {
  children?: ReactNode;
}

export function AddCourseDialog({ children }: AddCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const queryClient = useQueryClient();

  const addCourseMutation = useMutation({
    mutationFn: async (data: { title: string }) => {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setOpen(false);
      setTitle('');
      toast.success('Default course created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Course title is required');
      return;
    }

    addCourseMutation.mutate({ title: title.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New Default Course</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new default course that will be available to all users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-title">Course Title</Label>
            <Input
              id="course-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Advanced DSA Course, System Design, etc."
              className="bg-gray-700 border-gray-600"
              required
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> This will create a default course that all users can access. 
              Only admins can add or modify questions in default courses.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addCourseMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {addCourseMutation.isPending ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
