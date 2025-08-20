import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useMarkQuestionSolved, useUnmarkQuestionSolved } from '@/hooks/useSolvedQuestions';
import { useBookmarkQuestion, useUnbookmarkQuestion } from '@/hooks/useBookamrks';

export const useQuestionActions = (questionId: string) => {
  const { user } = useUser();
  
  const markSolvedMutation = useMarkQuestionSolved();
  const unmarkSolvedMutation = useUnmarkQuestionSolved();
  const bookmarkMutation = useBookmarkQuestion();
  const unbookmarkMutation = useUnbookmarkQuestion();

  const handleToggleSolved = async (isSolved: boolean) => {
    if (!user) {
      toast.error('Please sign in to track your progress');
      return;
    }

    try {
      if (isSolved) {
        await unmarkSolvedMutation.mutateAsync(questionId);
        toast.success('Question unmarked as solved');
      } else {
        await markSolvedMutation.mutateAsync(questionId);
        toast.success('Great job! Question marked as solved! 🎉');
      }
    } catch (error) {
      toast.error('Failed to update question status');
    }
  };

  const handleToggleBookmark = async (isBookmarked: boolean) => {
    if (!user) {
      toast.error('Please sign in to bookmark questions');
      return;
    }

    try {
      if (isBookmarked) {
        await unbookmarkMutation.mutateAsync(questionId);
        toast.success('Bookmark removed');
      } else {
        await bookmarkMutation.mutateAsync(questionId);
        toast.success('Question bookmarked! 📌');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleDeleteStart = () => {
    toast.loading('Deleting question...', { id: `delete-${questionId}` });
  };

  const handleDeleteComplete = () => {
    toast.dismiss(`delete-${questionId}`);
  };

  return {
    handleToggleSolved,
    handleToggleBookmark,
    handleDeleteStart,
    handleDeleteComplete,
    isSolvedLoading: markSolvedMutation.isPending || unmarkSolvedMutation.isPending,
    isBookmarkLoading: bookmarkMutation.isPending || unbookmarkMutation.isPending,
  };
};
