'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DeleteQuestionDialogProps {
  question: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteQuestionDialog({ question, open, onOpenChange, onSuccess }: DeleteQuestionDialogProps) {
  const queryClient = useQueryClient();

  const deleteQuestionMutation = useMutation({
    mutationFn: async (data: { questionId: string; courseId: string }) => {
      console.log('Sending delete data:', data); // Debug log
      
      const response = await fetch('/api/admin/questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Delete API Error:', error); // Debug log
        throw new Error(error.error || 'Failed to delete question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onSuccess();
      toast.success('Question deleted successfully!');
    },
    onError: (error: Error) => {
      console.error('Delete mutation error:', error); // Debug log
      toast.error(error.message);
    }
  });

  const handleDelete = () => {
    if (!question?.id) {
      toast.error('Question ID is missing');
      return;
    }

    if (!question?.courseId) {
      toast.error('Course ID is missing');
      return;
    }

    const deleteData = {
      questionId: question.id,
      courseId: question.courseId
    };

    console.log('Deleting question with data:', deleteData); // Debug log
    deleteQuestionMutation.mutate(deleteData);
  };

  // Don't render if question data is incomplete
  if (!question?.id || !question?.courseId) {
    return null;
  }

  const difficultyColors = {
    EASY: 'text-green-400 border-green-400',
    MEDIUM: 'text-yellow-400 border-yellow-400',
    HARD: 'text-red-400 border-red-400',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-red-400">Delete Question</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {question && (
          <div className="bg-gray-700 p-4 rounded-lg mb-4 border border-red-500/20">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-white text-lg">{question.title}</h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${difficultyColors[question.difficulty as keyof typeof difficultyColors]}`}
              >
                {question.difficulty}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <span className="text-sm text-gray-400">Topics:</span>
                {question.topics?.map((topic: string) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                )) || <span className="text-gray-500 text-sm">No topics</span>}
              </div>
              
              <div className="text-sm text-gray-400">
                URLs: {question.urls?.length || 0} link{(question.urls?.length || 0) !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Debug info (remove in production) */}
            <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-600">
              <div>Question ID: {question.id}</div>
              <div>Course ID: {question.courseId}</div>
            </div>
          </div>
        )}

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
            <p className="text-sm text-red-300">
              <strong>Warning:</strong> This will permanently delete the question. 
              {question.courses?.length > 1 ? 
                ' The question will be removed from this course only.' : 
                ' The question will be completely deleted from the system.'
              }
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 hover:bg-gray-700"
            disabled={deleteQuestionMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteQuestionMutation.isPending || !question?.id || !question?.courseId}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
          >
            {deleteQuestionMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </span>
            ) : (
              'Delete Question'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
