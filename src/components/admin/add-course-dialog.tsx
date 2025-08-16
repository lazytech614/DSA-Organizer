'use client';

import { useState, ReactNode } from 'react';
import { Plus, Crown, AlertTriangle } from 'lucide-react';
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
import { useSubscriptionLimits, useUpgradeCheck } from '@/hooks/useSubscription';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import Link from 'next/link';

interface AddCourseDialogProps {
  children?: ReactNode;
  isAdmin?: boolean; 
}

export function AddCourseDialog({ children, isAdmin = false }: AddCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  
  const { user } = useUser();
  const { data: limits, isLoading: limitsLoading } = useSubscriptionLimits();
  const { needsUpgrade } = useUpgradeCheck();
  
  const queryClient = useQueryClient();

  const addCourseMutation = useMutation({
    mutationFn: async (data: { title: string }) => {
      // Use different endpoints for admin vs user courses
      const endpoint = isAdmin ? '/api/admin/courses' : '/api/courses';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        
        // Handle subscription limit errors
        if (response.status === 403 && error.upgradeRequired) {
          throw new Error(error.message || 'Subscription limit reached');
        }
        
        throw new Error(error.error || 'Failed to create course');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
      setOpen(false);
      setTitle('');
      
      if (isAdmin) {
        toast.success('Default course created successfully!');
      } else {
        toast.success('Course created successfully! 🎉');
      }
    },
    onError: (error: Error) => {
      if (error.message.includes('limit')) {
        toast.error(error.message, {
          action: {
            label: 'Upgrade',
            onClick: () => window.open('/pricing', '_blank')
          }
        });
      } else {
        toast.error(error.message);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Course title is required');
      return;
    }

    // Check subscription limits for non-admin users
    if (!isAdmin && needsUpgrade('CREATE_COURSE')) {
      toast.error('You\'ve reached your course limit. Upgrade to Pro for unlimited courses.', {
        action: {
          label: 'Upgrade',
          onClick: () => window.open('/pricing', '_blank')
        }
      });
      return;
    }

    addCourseMutation.mutate({ title: title.trim() });
  };

  const canCreateCourse = isAdmin || (limits?.canCreateCourse ?? true);
  const isProUser = limits?.maxCourses === -1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            className={`${
              isAdmin 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : canCreateCourse 
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gray-600 hover:bg-gray-500'
            }`}
            disabled={!isAdmin && !canCreateCourse}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAdmin ? 'Add Course' : 'Create Course'}
            {!isAdmin && !canCreateCourse && (
              <Crown className="w-4 h-4 ml-2" />
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAdmin ? 'Create New Default Course' : 'Create New Course'}
            {!isAdmin && isProUser && (
              <Crown className="w-5 h-5 text-yellow-500" />
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isAdmin 
              ? 'Create a new default course that will be available to all users.'
              : 'Create a new course to organize your learning journey.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Subscription Limits Warning for Non-Admin Users */}
        {!isAdmin && limits && (
          <div className="space-y-3">
            {/* Current Usage Display */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Course Usage:</span>
                <span className={`font-medium ${
                  !canCreateCourse ? 'text-red-400' : 'text-green-400'
                }`}>
                  {limits.maxCourses === -1 
                    ? `${(limits.maxCourses - limits.coursesRemaining)} / Unlimited`
                    : `${limits.maxCourses - limits.coursesRemaining} / ${limits.maxCourses}`
                  }
                </span>
              </div>
              
              {/* Progress Bar */}
              {limits.maxCourses !== -1 && (
                <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      !canCreateCourse ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, ((limits.maxCourses - limits.coursesRemaining) / limits.maxCourses) * 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Limit Reached Warning */}
            {!canCreateCourse && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-medium mb-1">
                    Course Limit Reached
                  </p>
                  <p className="text-sm text-red-200">
                    You've reached your limit of {limits.maxCourses} courses. 
                    Upgrade to Pro for unlimited courses and advanced features.
                  </p>
                  <Link 
                    href="/pricing" 
                    className="inline-flex items-center gap-1 text-sm text-red-300 hover:text-red-200 underline mt-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}

            {/* Pro Features Upsell */}
            {canCreateCourse && !isProUser && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm text-yellow-300 font-medium">
                    Unlock More with Pro
                  </p>
                </div>
                <p className="text-sm text-yellow-200 mb-2">
                  Get unlimited courses, unlimited questions, and priority support.
                </p>
                <Link 
                  href="/pricing" 
                  className="text-sm text-yellow-300 hover:text-yellow-200 underline"
                >
                  View Pro Features →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-title">Course Title</Label>
            <Input
              id="course-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isAdmin 
                  ? "e.g., Advanced DSA Course, System Design, etc."
                  : "e.g., My DSA Journey, Interview Prep, etc."
              }
              className="bg-gray-700 border-gray-600 text-white"
              required
              disabled={!isAdmin && !canCreateCourse}
            />
          </div>

          {/* Admin Note */}
          {isAdmin && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> This will create a default course that all users can access. 
                Only admins can add or modify questions in default courses.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
            
            {!isAdmin && !canCreateCourse ? (
              <Link href="/pricing">
                <Button type="button" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
            ) : (
              <Button 
                type="submit" 
                disabled={addCourseMutation.isPending || limitsLoading}
                className={`${
                  isAdmin 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {addCourseMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Course'
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
