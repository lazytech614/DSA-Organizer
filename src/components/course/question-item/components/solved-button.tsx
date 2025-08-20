'use client';

import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { ActionButtonProps } from '../types';

interface SolvedButtonProps extends ActionButtonProps {
  isSolved: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export const SolvedButton: React.FC<SolvedButtonProps> = ({
  isSolved,
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
        isSolved 
          ? 'text-green-400 hover:text-green-300 scale-105' 
          : 'text-gray-400 hover:text-green-400'
      } ${isLoading ? 'animate-pulse' : ''}`}
      title={user ? (isSolved ? 'Mark as unsolved' : 'Mark as solved') : 'Sign in to track progress'}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isSolved ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
    </Button>
  );
};

export default SolvedButton;
