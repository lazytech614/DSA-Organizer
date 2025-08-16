'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useDeleteQuestion } from '@/hooks/useQuestions';
import { Question } from '@prisma/client';

interface DeleteQuestionDialogProps {
  question: Question & { isSolved?: boolean; isBookmarked?: boolean };
  children?: React.ReactNode;
  courseTitle?: string;
  onDeleteStart?: () => void; // Callback when deletion starts
  onDeleteComplete?: () => void; // Callback when deletion completes
}

export function DeleteQuestionDialog({ 
  question, 
  children, 
  courseTitle,
  onDeleteStart,
  onDeleteComplete 
}: DeleteQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteQuestion = useDeleteQuestion();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      onDeleteStart?.(); // Trigger optimistic UI update
      
      await deleteQuestion.mutateAsync(question.id);
      
      setOpen(false);
      onDeleteComplete?.(); // Cleanup if needed
    } catch (error) {
      setIsDeleting(false);
      // Error is handled in the hook with rollback
    }
  };

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setIsDeleting(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-red-400 p-1 transition-all duration-200"
            title="Delete question"
          >
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Delete Question
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            This action cannot be undone. This will permanently remove the question from your course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Info */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">{question.title}</h4>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  question.difficulty === 'EASY' ? 'text-green-400 border-green-400' :
                  question.difficulty === 'MEDIUM' ? 'text-yellow-400 border-yellow-400' :
                  'text-red-400 border-red-400'
                }`}
              >
                {question.difficulty}
              </Badge>
              {question.topics.slice(0, 3).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              {courseTitle && <div>📚 Course: {courseTitle}</div>}
              <div>🔗 {question.urls.length} practice link(s)</div>
              {question.isSolved && <div>✅ Currently marked as solved</div>}
              {question.isBookmarked && <div>🔖 Currently bookmarked</div>}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-medium text-sm">Warning</span>
            </div>
            <p className="text-red-200 text-sm">
              This will remove the question from your course and delete your progress (solved status, bookmarks) for this question.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 hover:bg-gray-700"
              disabled={deleteQuestion.isPending || isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteQuestion.isPending || isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
            >
              {deleteQuestion.isPending || isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Question
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
