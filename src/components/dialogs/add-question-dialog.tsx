'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Difficulty } from '@prisma/client';
import { useCreateQuestion } from '@/hooks/useQuestions';
import { TOPICS } from '@/constants/questions'; // Make sure this path is correct
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

interface AddQuestionDialogProps {
  courseId: string;
  disabled?: boolean;
}

export function AddQuestionDialog({ courseId, disabled = false }: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [topicSearch, setTopicSearch] = useState('');

  const createQuestionMutation = useCreateQuestion();

  // Debug: Log selectedTopics whenever it changes
  useEffect(() => {
    console.log('🔍 selectedTopics changed:', selectedTopics);
  }, [selectedTopics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Form submission data:', {
      title: title.trim(),
      selectedTopics,
      selectedTopicsLength: selectedTopics.length,
      urls,
      difficulty,
      courseId
    });

    if (!title.trim()) {
      toast.error('Question title is required');
      return;
    }

    if (selectedTopics.length === 0) {
      console.log('❌ Topics validation failed - selectedTopics:', selectedTopics);
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

    try {
      await createQuestionMutation.mutateAsync({
        title: title.trim(),
        topics: selectedTopics,
        urls: validUrls,
        difficulty: difficulty as Difficulty,
        courseId
      });
      
      // Reset form
      setTitle('');
      setSelectedTopics([]);
      setUrls(['']);
      setDifficulty('');
      setOpen(false);
      toast.success('Question added successfully!');
    } catch (error) {
      console.error('Failed to create question:', error);
      toast.error('Failed to add question');
    }
  };

  // ✅ FIXED: Use functional update pattern
  const addTopic = (topic: string) => {
    setSelectedTopics(prevTopics => {
      if (!prevTopics.includes(topic)) {
        console.log('✅ Adding topic:', topic, 'Previous topics:', prevTopics);
        const newTopics = [...prevTopics, topic];
        console.log('✅ New topics array:', newTopics);
        return newTopics;
      }
      console.log('⚠️ Topic already exists:', topic);
      return prevTopics;
    });
    setTopicSearch('');
  };

  // ✅ FIXED: Use functional update pattern
  const removeTopic = (topic: string) => {
    setSelectedTopics(prevTopics => {
      console.log('🗑️ Removing topic:', topic, 'Previous topics:', prevTopics);
      const newTopics = prevTopics.filter(t => t !== topic);
      console.log('🗑️ New topics array:', newTopics);
      return newTopics;
    });
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

  if (disabled) {
    return (
      <Button disabled className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Question
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>
            Add a new question to this course.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-title">Question Title</Label>
            <Input
              id="question-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter question title"
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
              />
              {topicSearch && filteredTopics.length > 0 && (
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                  {filteredTopics.slice(0, 5).map(topic => (
                    <div
                      key={topic}
                      className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                      onClick={() => {
                        console.log('🖱️ Clicked on topic:', topic);
                        addTopic(topic);
                      }}
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
                      onClick={() => {
                        console.log('🖱️ Clicked remove topic:', topic);
                        removeTopic(topic);
                      }}
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
                />
                {urls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeUrlField(index)}
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
              className="w-full"
            >
              Add Another URL
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={(value: string) => setDifficulty(value as Difficulty)}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createQuestionMutation.isPending}
            >
              {createQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
