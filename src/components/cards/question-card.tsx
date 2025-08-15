'use client';

import { Question } from '@prisma/client';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DIFFICULTY_COLORS } from '@/constants/questions';

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-2">{question.title}</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {question.topics.map((topic: string) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${DIFFICULTY_COLORS[question.difficulty]}`}
              >
                {question.difficulty.toLowerCase()}
              </Badge>
              <div className="flex gap-1">
                {question.urls.map((url, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    asChild
                  >
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="text-xs">
                        {url.includes('leetcode') ? 'LC' : 
                         url.includes('geeksforgeeks') ? 'GFG' : 
                         `Link ${index + 1}`}
                      </span>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
