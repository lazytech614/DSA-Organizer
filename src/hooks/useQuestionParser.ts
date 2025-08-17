// hooks/useQuestionParser.ts
import { useState } from 'react';
import { ParsedQuestionData } from '@/lib/questionParser';

export function useQuestionParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseQuestion = async (url: string): Promise<ParsedQuestionData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parse-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse question');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    parseQuestion,
    isLoading,
    error,
  };
}
