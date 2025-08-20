'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ActionButtonProps } from '../types';

export const PracticeButton: React.FC<ActionButtonProps> = ({
  question,
  isDeleting
}) => {
  if (!question.urls.length) return null;

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-gray-400 hover:text-white p-1 sm:p-2 transition-colors"
      disabled={isDeleting}
      asChild
    >
      <Link
        href={question.urls[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-1"
      >
        <ExternalLink className="w-3 h-3" />
        <span className="text-xs hidden sm:inline">
          Practice
        </span>
      </Link>
    </Button>
  );
};

export default PracticeButton;
