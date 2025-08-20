'use client';

import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { ActionButtonProps } from '../types';

interface BookmarkButtonProps extends ActionButtonProps {
  isBookmarked: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  isBookmarked,
  isLoading,
  isDeleting,
  onToggle
}) => {
  const { user } = useUser();

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onToggle}
      disabled={isLoading || isDeleting}
      className={`p-1 sm:p-2 flex-shrink-0 transition-all duration-300 ${
        isBookmarked 
          ? 'text-yellow-500 hover:text-yellow-400 scale-105' 
          : 'text-gray-400 hover:text-yellow-500'
      } ${isLoading ? 'animate-pulse' : ''}`}
      title={user ? (isBookmarked ? 'Remove bookmark' : 'Bookmark question') : 'Sign in to bookmark'}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </Button>
  );
};

export default BookmarkButton;
