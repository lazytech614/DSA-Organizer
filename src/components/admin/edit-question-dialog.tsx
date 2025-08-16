'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TOPICS } from '@/constants/questions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface EditQuestionDialogProps {
  question: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditQuestionDialog({ question, open, onOpenChange, onSuccess }: EditQuestionDialogProps) {
  const [title, setTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<string>('');
  const [topicSearch, setTopicSearch] = useState('');

  const queryClient = useQueryClient();

  const updateQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Sending update data:', data); // Debug log
      
      const response = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error); // Debug log
        throw new Error(error.error || 'Failed to update question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onSuccess();
      toast.success('Question updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error); // Debug log
      toast.error(error.message);
    }
  });

  useEffect(() => {
    if (question) {
      console.log('Question data received:', question); // Debug log
      
      setTitle(question.title || '');
      setSelectedTopics(question.topics || []);
      setUrls(question.urls && question.urls.length > 0 ? question.urls : ['']);
      setDifficulty(question.difficulty || '');
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question?.id) {
      toast.error('Question ID is missing');
      return;
    }

    if (!question?.courseId) {
      toast.error('Course ID is missing');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Question title is required');
      return;
    }

    if (selectedTopics.length === 0) {
      toast.error('At least one topic is required');
      return;
    }

    if (!difficulty) {
      toast.error('Difficulty is required');
      return;
    }

    const validUrls = urls.filter(url => url.trim());
    if (validUrls.length === 0) {
      toast.error('At least one URL is required');
      return;
    }

    const updateData = {
      questionId: question.id,
      courseId: question.courseId, // Include courseId
      title: title.trim(),
      topics: selectedTopics,
      urls: validUrls,
      difficulty
    };

    console.log('Submitting update with data:', updateData); // Debug log
    updateQuestionMutation.mutate(updateData);
  };

  const addTopic = (topic: string) => {
    if (!selectedTopics.includes(topic)) {
      setSelectedTopics(prev => [...prev, topic]);
    }
    setTopicSearch('');
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics(prev => prev.filter(t => t !== topic));
  };

  const addUrlField = () => {
    setUrls(prev => [...prev, '']);
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      setUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    setUrls(prev => {
      const newUrls = [...prev];
      newUrls[index] = value;
      return newUrls;
    });
  };

  const filteredTopics = TOPICS.filter(topic =>
    topic.toLowerCase().includes(topicSearch.toLowerCase()) &&
    !selectedTopics.includes(topic)
  );

  // Don't render if question data is incomplete
  if (!question?.id || !question?.courseId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update the question details for "{question.title}".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Question Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter question title"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Topics ({selectedTopics.length} selected)</Label>
            <div className="space-y-2">
              <Input
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Search and select topics"
                className="bg-gray-700 border-gray-600 text-white"
              />
              {topicSearch && filteredTopics.length > 0 && (
                <div className="border border-gray-600 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-700">
                  {filteredTopics.slice(0, 8).map(topic => (
                    <div
                      key={topic}
                      className="cursor-pointer p-2 hover:bg-gray-600 rounded text-sm"
                      onClick={() => addTopic(topic)}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              )}
              {selectedTopics.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-700 border-gray-600">
                  {selectedTopics.map(topic => (
                    <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                      {topic}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeTopic(topic)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              {selectedTopics.length === 0 && (
                <div className="text-xs text-red-400">
                  Please select at least one topic
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question URLs</Label>
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  placeholder="Enter question URL (e.g., https://leetcode.com/problems/...)"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                {urls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeUrlField(index)}
                    className="border-gray-600 hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addUrlField}
              className="w-full border-gray-600 hover:bg-gray-700"
            >
              Add Another URL
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Debug info (remove in production) */}
          <div className="text-xs text-gray-500 p-2 bg-gray-900 rounded">
            <div>Question ID: {question.id}</div>
            <div>Course ID: {question.courseId}</div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 hover:bg-gray-700"
              disabled={updateQuestionMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateQuestionMutation.isPending || selectedTopics.length === 0}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {updateQuestionMutation.isPending ? 'Updating...' : 'Update Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
