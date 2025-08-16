'use client';

import { useState, ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TOPICS } from '@/constants/questions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface AddQuestionDialogProps {
  children?: ReactNode;
  courseId?: string; // Make courseId optional but preferred
}

export function AddQuestionDialog({ children, courseId }: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || '');
  const [topicSearch, setTopicSearch] = useState('');

  const queryClient = useQueryClient();

  // Get courses for selection if no courseId provided
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/questions');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: !courseId // Only fetch if no courseId provided
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add question');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setOpen(false);
      resetForm();
      toast.success('Question added successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const resetForm = () => {
    setTitle('');
    setSelectedTopics([]);
    setUrls(['']);
    setDifficulty('');
    setTopicSearch('');
    if (!courseId) setSelectedCourseId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetCourseId = courseId || selectedCourseId;
    
    if (!targetCourseId) {
      toast.error('Please select a course');
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

    addQuestionMutation.mutate({
      title: title.trim(),
      topics: selectedTopics,
      urls: validUrls,
      difficulty,
      courseId: targetCourseId
    });
  };

  const addTopic = (topic: string) => {
    if (!selectedTopics.includes(topic)) {
      setSelectedTopics([...selectedTopics, topic]);
    }
    setTopicSearch('');
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics(selectedTopics.filter(t => t !== topic));
  };

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const filteredTopics = TOPICS.filter(topic =>
    topic.toLowerCase().includes(topicSearch.toLowerCase()) &&
    !selectedTopics.includes(topic)
  );

  const courses = coursesData?.courses || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new question to {courseId ? 'the selected course' : 'a default course'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!courseId && (
            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Question Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter question title"
              className="bg-gray-700 border-gray-600"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Topics</Label>
            <div className="space-y-2">
              <Input
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Search and select topics"
                className="bg-gray-700 border-gray-600"
              />
              {topicSearch && filteredTopics.length > 0 && (
                <div className="border border-gray-600 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-700">
                  {filteredTopics.slice(0, 5).map(topic => (
                    <div
                      key={topic}
                      className="cursor-pointer p-1 hover:bg-gray-600 rounded"
                      onClick={() => addTopic(topic)}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {selectedTopics.map(topic => (
                  <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                    {topic}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTopic(topic)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question URLs</Label>
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  placeholder="Enter question URL"
                  className="bg-gray-700 border-gray-600"
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
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addQuestionMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {addQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
