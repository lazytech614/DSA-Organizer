'use client';

import { useState, ReactNode } from 'react';
import { Plus, X, Crown, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
import { useSubscriptionLimits, useUpgradeCheck } from '@/hooks/useSubscription';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import Link from 'next/link';

interface AddQuestionDialogProps {
  children?: ReactNode;
  courseId?: string; 
  isAdmin?: boolean; // To differentiate admin vs user question creation
}

export function AddQuestionDialog({ children, courseId, isAdmin = false }: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || '');
  const [topicSearch, setTopicSearch] = useState('');

  const { user } = useUser();
  const { data: limits, isLoading: limitsLoading } = useSubscriptionLimits(courseId || selectedCourseId);
  const { needsUpgrade } = useUpgradeCheck();

  const queryClient = useQueryClient();

  // Get courses for selection if no courseId provided
  const { data: coursesData } = useQuery({
    queryKey: isAdmin ? ['admin-courses'] : ['courses'],
    queryFn: async () => {
      const endpoint = isAdmin ? '/api/admin/questions' : '/api/courses';
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: !courseId // Only fetch if no courseId provided
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      // Use different endpoints for admin vs user questions
      const endpoint = isAdmin ? '/api/admin/questions' : '/api/questions';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        
        // Handle subscription limit errors
        if (response.status === 403 && error.upgradeRequired) {
          throw new Error(error.message || 'Subscription limit reached');
        }
        
        throw new Error(error.error || 'Failed to add question');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
      setOpen(false);
      resetForm();
      toast.success('Question added successfully! 🎉');
    },
    onError: (error: Error) => {
      if (error.message.includes('limit')) {
        toast.error(error.message, {
          action: {
            label: 'Upgrade',
            onClick: () => window.open('/pricing', '_blank')
          }
        });
      } else {
        toast.error(error.message);
      }
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

    // Check subscription limits for non-admin users
    if (!isAdmin && needsUpgrade('ADD_QUESTION')) {
      toast.error('You\'ve reached your question limit for this course. Upgrade to Pro for unlimited questions.', {
        action: {
          label: 'Upgrade',
          onClick: () => window.open('/pricing', '_blank')
        }
      });
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
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
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

  const courses = isAdmin ? (coursesData?.courses || []) : (coursesData || []);
  const canAddQuestion = isAdmin || (limits?.canAddQuestion ?? true);
  const isProUser = limits?.maxQuestionsPerCourse === -1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            className={`${
              canAddQuestion 
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            disabled={!isAdmin && !canAddQuestion}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
            {!isAdmin && !canAddQuestion && (
              <Crown className="w-4 h-4 ml-2" />
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add New Question
            {!isAdmin && isProUser && (
              <Crown className="w-5 h-5 text-yellow-500" />
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new question to {courseId ? 'the selected course' : isAdmin ? 'a default course' : 'your course'}.
          </DialogDescription>
        </DialogHeader>

        {/* Subscription Limits Warning for Non-Admin Users */}
        {!isAdmin && limits && (courseId || selectedCourseId) && (
          <div className="space-y-3">
            {/* Current Usage Display */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Question Usage:</span>
                <span className={`font-medium ${
                  !canAddQuestion ? 'text-red-400' : 'text-green-400'
                }`}>
                  {limits.maxQuestionsPerCourse === -1 
                    ? `${limits.questionsRemaining === -1 ? 'Unlimited' : 'Current'} / Unlimited`
                    : `${(limits.maxQuestionsPerCourse - (limits.questionsRemaining || 0))} / ${limits.maxQuestionsPerCourse}`
                  }
                </span>
              </div>
              
              {/* Progress Bar */}
              {limits.maxQuestionsPerCourse !== -1 && limits.questionsRemaining !== undefined && (
                <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      !canAddQuestion ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, ((limits.maxQuestionsPerCourse - limits.questionsRemaining) / limits.maxQuestionsPerCourse) * 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Limit Reached Warning */}
            {!canAddQuestion && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-medium mb-1">
                    Question Limit Reached
                  </p>
                  <p className="text-sm text-red-200">
                    You've reached your limit of {limits.maxQuestionsPerCourse} questions for this course. 
                    Upgrade to Pro for unlimited questions per course.
                  </p>
                  <Link 
                    href="/pricing" 
                    className="inline-flex items-center gap-1 text-sm text-red-300 hover:text-red-200 underline mt-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}

            {/* Pro Features Upsell */}
            {canAddQuestion && !isProUser && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm text-yellow-300 font-medium">
                    Unlock Unlimited Questions
                  </p>
                </div>
                <p className="text-sm text-yellow-200 mb-2">
                  Pro users get unlimited questions per course and advanced features.
                </p>
                <Link 
                  href="/pricing" 
                  className="text-sm text-yellow-300 hover:text-yellow-200 underline"
                >
                  Upgrade Now →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!courseId && (
            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                      {!isAdmin && course.questionCount !== undefined && (
                        <span className="ml-2 text-xs text-gray-400">
                          ({course.questionCount} questions)
                        </span>
                      )}
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
              className="bg-gray-700 border-gray-600 text-white"
              required
              disabled={!isAdmin && !canAddQuestion}
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
                disabled={!isAdmin && !canAddQuestion}
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
                  disabled={!isAdmin && !canAddQuestion}
                />
                {urls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeUrlField(index)}
                    className="border-gray-600 hover:bg-gray-700"
                    disabled={!isAdmin && !canAddQuestion}
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
              disabled={!isAdmin && !canAddQuestion}
            >
              Add Another URL
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select 
              value={difficulty} 
              onValueChange={setDifficulty}
              disabled={!isAdmin && !canAddQuestion}
            >
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
            
            {!isAdmin && !canAddQuestion ? (
              <Link href="/pricing">
                <Button type="button" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
            ) : (
              <Button 
                type="submit" 
                disabled={addQuestionMutation.isPending || limitsLoading || selectedTopics.length === 0}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {addQuestionMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Question'
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
