'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { Difficulty } from '@prisma/client';
import { useCreateQuestion } from '@/hooks/useQuestions';
import { useCourses } from '@/hooks/useCourses';
import { useUserInfo } from '@/hooks/useUserInfo';
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

interface AddQuestionDialogProps {
  courseId: string;
  disabled?: boolean;
  onQuestionAdded?: () => void;
  topicFilter?: string; // Pre-select topic
  children?: ReactNode; // ✅ Add children prop
}

export function AddQuestionDialog({ 
  courseId, 
  disabled = false, 
  onQuestionAdded, 
  topicFilter,
  children 
}: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [topicSearch, setTopicSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Get live data for validation and feedback
  const { data: courses } = useCourses();
  const { data: userInfo } = useUserInfo();
  const createQuestionMutation = useCreateQuestion();

  // ✅ Find current course for validation
  const currentCourse = courses?.find(c => c.id === courseId);

  // ✅ Check if user can add questions to this course
  const canAddQuestion = () => {
    if (!userInfo || !currentCourse) return true; // Allow if data not loaded yet
    
    // Check subscription limits
    if (userInfo.subscriptionType === 'FREE') {
      const questionsInCourse = currentCourse.questions?.length || 0;
      const maxQuestions = userInfo.limits.maxQuestionsPerCourse;
      
      if (maxQuestions !== -1 && questionsInCourse >= maxQuestions) {
        return false;
      }
    }
    
    return true;
  };

  // ✅ Pre-select topic if provided
  useEffect(() => {
    if (topicFilter && !selectedTopics.includes(topicFilter)) {
      setSelectedTopics([topicFilter]);
    }
  }, [topicFilter, selectedTopics]);

  const resetForm = () => {
    setTitle('');
    setSelectedTopics(topicFilter ? [topicFilter] : []); // Keep topic filter when resetting
    setUrls(['']);
    setDifficulty('');
    setTopicSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!title.trim()) {
      toast.error('Question title is required');
      setIsSubmitting(false);
      return;
    }

    if (selectedTopics.length === 0) {
      toast.error('At least one topic is required');
      setIsSubmitting(false);
      return;
    }

    if (!difficulty) {
      toast.error('Difficulty is required');
      setIsSubmitting(false);
      return;
    }

    const validUrls = urls.filter(url => url.trim());
    if (validUrls.length === 0) {
      toast.error('At least one URL is required');
      setIsSubmitting(false);
      return;
    }

    // Check limits
    if (!canAddQuestion()) {
      toast.error('You\'ve reached the maximum number of questions for this course. Upgrade to add more!');
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ Show optimistic feedback immediately
      toast.loading('Adding question...', { id: 'add-question' });
      onQuestionAdded?.(); // Trigger any parent component updates
      
      // ✅ The mutation will handle optimistic updates in the cache
      await createQuestionMutation.mutateAsync({
        title: title.trim(),
        topics: selectedTopics,
        urls: validUrls,
        difficulty: difficulty as Difficulty,
        courseId
      });
      
      // ✅ Success feedback and cleanup
      toast.dismiss('add-question');
      toast.success(`Question "${title.trim()}" added successfully! 🎉`);
      resetForm();
      setOpen(false);
      
    } catch (error) {
      console.error('Failed to create question:', error);
      toast.dismiss('add-question');
      toast.error('Failed to add question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTopic = (topic: string) => {
    setSelectedTopics(prevTopics => {
      if (!prevTopics.includes(topic)) {
        const newTopics = [...prevTopics, topic];
        return newTopics;
      }
      return prevTopics;
    });
    setTopicSearch('');
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics(prevTopics => prevTopics.filter(t => t !== topic));
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

  // ✅ Enhanced disabled state with reason
  if (disabled || !canAddQuestion()) {
    const reason = disabled 
      ? "Add questions to organize your learning"
      : "Upgrade to add more questions to this course";
      
    return (
      <Button 
        disabled 
        className="flex items-center gap-2 opacity-60 cursor-not-allowed"
        title={reason}
      >
        <Plus className="w-4 h-4" />
        Add Question
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {/* ✅ Use children if provided, otherwise default button */}
        {children || (
          <Button 
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            Add Question
            {topicFilter && (
              <span className="text-blue-400 ml-2">to {topicFilter}</span>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new question to {currentCourse?.title || 'this course'}.
            {topicFilter && (
              <span className="block text-blue-300 mt-1">
                Topic "{topicFilter}" will be pre-selected.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Title */}
          <div className="space-y-2">
            <Label htmlFor="question-title" className="text-white">Question Title</Label>
            <Input
              id="question-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter question title"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Topics Selection */}
          <div className="space-y-2">
            <Label className="text-white">
              Topics ({selectedTopics.length} selected)
              {selectedTopics.length === 0 && <span className="text-red-400 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              <Input
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Search and select topics"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                disabled={isSubmitting}
              />
              {topicSearch && filteredTopics.length > 0 && (
                <div className="border border-gray-600 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-700">
                  {filteredTopics.slice(0, 5).map(topic => (
                    <div
                      key={topic}
                      className="cursor-pointer p-2 hover:bg-gray-600 rounded text-white transition-colors"
                      onClick={() => addTopic(topic)}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Selected Topics */}
              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {selectedTopics.map(topic => (
                  <Badge 
                    key={topic} 
                    variant="secondary" 
                    className={`flex items-center gap-1 transition-all duration-200 hover:bg-blue-500/30 ${
                      topic === topicFilter 
                        ? 'bg-blue-500/30 text-blue-200 border-blue-500/50' 
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {topic}
                    {topic === topicFilter && (
                      <span className="text-xs opacity-70">(pre-selected)</span>
                    )}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => removeTopic(topic)}
                    />
                  </Badge>
                ))}
                {selectedTopics.length === 0 && (
                  <span className="text-gray-500 text-sm">No topics selected</span>
                )}
              </div>
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-2">
            <Label className="text-white">
              Practice URLs
              <span className="text-red-400 ml-1">*</span>
            </Label>
            <div className="space-y-2">
              {urls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder={`Enter practice URL ${index + 1}`}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={isSubmitting}
                  />
                  {urls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeUrlField(index)}
                      className="border-gray-600 hover:bg-gray-700 hover:text-red-400"
                      disabled={isSubmitting}
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
                className="w-full border-gray-600 hover:bg-gray-700 text-gray-300"
                disabled={isSubmitting || urls.length >= 5}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another URL {urls.length >= 5 && "(Max 5)"}
              </Button>
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-white">
              Difficulty
              <span className="text-red-400 ml-1">*</span>
            </Label>
            <Select 
              value={difficulty} 
              onValueChange={(value: string) => setDifficulty(value as Difficulty)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="EASY" className="text-green-400">Easy</SelectItem>
                <SelectItem value="MEDIUM" className="text-yellow-400">Medium</SelectItem>
                <SelectItem value="HARD" className="text-red-400">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 hover:bg-gray-700 text-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || createQuestionMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200"
            >
              {isSubmitting || createQuestionMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question {topicFilter && `to ${topicFilter}`}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
