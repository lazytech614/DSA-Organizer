'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Plus, X, Link, Wand2 } from 'lucide-react';
import { Difficulty } from '@prisma/client';
import { useCreateQuestion } from '@/hooks/useQuestions';
import { useCourses } from '@/hooks/useCourses';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useQuestionParser } from '@/hooks/useQuestionParser';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface AddQuestionDialogProps {
  courseId: string;
  disabled?: boolean;
  onQuestionAdded?: () => void;
  topicFilter?: string;
  children?: ReactNode;
}

export function AddQuestionDialog({ 
  courseId, 
  disabled = false, 
  onQuestionAdded, 
  topicFilter,
  children 
}: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'url' | 'manual'>('url');
  
  // Form fields
  const [quickUrl, setQuickUrl] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [topicSearch, setTopicSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  // Hooks
  const { data: courses } = useCourses();
  const { data: userInfo } = useUserInfo();
  const createQuestionMutation = useCreateQuestion();
  const { parseQuestion, isLoading: isParsing, error: parseError } = useQuestionParser();

  const currentCourse = courses?.find(c => c.id === courseId);

  const canAddQuestion = () => {
    if (!userInfo || !currentCourse) return true;
    
    if (userInfo.subscriptionType === 'FREE') {
      const questionsInCourse = currentCourse.questions?.length || 0;
      const maxQuestions = userInfo.limits.maxQuestionsPerCourse;
      
      if (maxQuestions !== -1 && questionsInCourse >= maxQuestions) {
        return false;
      }
    }
    
    return true;
  };

  useEffect(() => {
    if (topicFilter && !selectedTopics.includes(topicFilter)) {
      setSelectedTopics([topicFilter]);
    }
  }, [topicFilter, selectedTopics]);

  const resetForm = () => {
    setQuickUrl('');
    setTitle('');
    setSelectedTopics(topicFilter ? [topicFilter] : []);
    setUrls(['']);
    setDifficulty('');
    setTopicSearch('');
    setAutoFilled(false);
    setMode('url');
  };

  // Auto-fill from URL
  const handleAutoFill = async () => {
    if (!quickUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Add URL to the urls array if not already there
    if (!urls.includes(quickUrl.trim())) {
      setUrls([quickUrl.trim(), ...urls.filter(url => url.trim())]);
    }

    toast.loading('Extracting question details...', { id: 'auto-fill' });

    try {
      const parsedData = await parseQuestion(quickUrl.trim());
      
      if (parsedData) {
        // Auto-fill the form
        if (parsedData.title) {
          setTitle(parsedData.title);
        }
        
        if (parsedData.difficulty) {
          setDifficulty(parsedData.difficulty);
        }
        
        if (parsedData.topics && parsedData.topics.length > 0) {
          // Merge with existing topics, keeping topicFilter if present
          const newTopics = [...new Set([
            ...(topicFilter ? [topicFilter] : []),
            ...selectedTopics,
            ...parsedData.topics
          ])];
          setSelectedTopics(newTopics);
        }

        setAutoFilled(true);
        setMode('manual'); // Switch to manual mode for editing
        
        toast.dismiss('auto-fill');
        toast.success('Question details extracted! You can now edit them.', {
          description: `Found: ${parsedData.title || 'Title'}, ${parsedData.difficulty || 'Difficulty'}, ${parsedData.topics?.length || 0} topics`
        });
      } else {
        toast.dismiss('auto-fill');
        toast.error(parseError || 'Could not extract question details from this URL');
      }
    } catch (error) {
      toast.dismiss('auto-fill');
      toast.error('Failed to parse question. Please fill manually.');
    }
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

    if (!canAddQuestion()) {
      toast.error('You\'ve reached the maximum number of questions for this course. Upgrade to add more!');
      setIsSubmitting(false);
      return;
    }

    try {
      toast.loading('Adding question...', { id: 'add-question' });
      onQuestionAdded?.();
      
      await createQuestionMutation.mutateAsync({
        title: title.trim(),
        topics: selectedTopics,
        urls: validUrls,
        difficulty: difficulty as Difficulty,
        courseId
      });
      
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

  // ... (keep all other existing functions like addTopic, removeTopic, etc.)
  const addTopic = (topic: string) => {
    setSelectedTopics(prevTopics => {
      if (!prevTopics.includes(topic)) {
        return [...prevTopics, topic];
      }
      return prevTopics;
    });
    setTopicSearch('');
  };

  const removeTopic = (topic: string) => {
    setSelectedTopics(prevTopics => {
      const newTopics = prevTopics.filter(t => t !== topic);
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
            {mode === 'url' ? (
              <>Paste a LeetCode or GeeksforGeeks URL to auto-fill question details, then edit as needed.</>
            ) : (
              <>Add a new question to {currentCourse?.title || 'this course'}.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={mode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('url')}
              className="flex items-center gap-2"
            >
              <Link className="w-4 h-4" />
              Auto-fill from URL
            </Button>
            <Button
              type="button"
              variant={mode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('manual')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Manual Entry
            </Button>
          </div>

          {/* URL Auto-fill Section */}
          {mode === 'url' && (
            <div className="space-y-3 p-4 border border-blue-500/30 rounded-lg bg-blue-500/5">
              <Label htmlFor="quick-url" className="text-white flex items-center gap-2">
                <Link className="w-4 h-4" />
                LeetCode or GeeksforGeeks URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="quick-url"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/two-sum/"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  disabled={isParsing || isSubmitting}
                />
                <Button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={!quickUrl.trim() || isParsing || isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white shrink-0"
                >
                  {isParsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Auto-fill
                    </>
                  )}
                </Button>
              </div>
              {parseError && (
                <p className="text-red-400 text-sm">{parseError}</p>
              )}
              {autoFilled && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Wand2 className="w-4 h-4" />
                  Details auto-filled! You can now edit them below.
                </div>
              )}
            </div>
          )}

          {mode === 'manual' && <Separator className="bg-gray-600" />}

          {/* Rest of the form (same as before, but now visible in manual mode) */}
          {mode === 'manual' && (
            <>
              {/* Question Title */}
              <div className="space-y-2">
                <Label htmlFor="question-title" className="text-white">
                  Question Title
                  {autoFilled && <span className="text-green-400 text-xs ml-2">(auto-filled)</span>}
                </Label>
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
                  {autoFilled && <span className="text-green-400 text-xs ml-2">(auto-filled)</span>}
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-4 h-4 p-0 hover:bg-transparent"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeTopic(topic);
                          }}
                        >
                          <X className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors" />
                        </Button>
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
                  {autoFilled && quickUrl && <span className="text-green-400 text-xs ml-2">(URL added)</span>}
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
                  {autoFilled && <span className="text-green-400 text-xs ml-2">(auto-filled)</span>}
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
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
