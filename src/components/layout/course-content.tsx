'use client';

import { useState, useMemo } from 'react';
import { CourseWithQuestions } from '@/types';
import { TopicSection } from '@/components/course/topic-section';
import { CourseStats } from '@/components/course/course-stats';
import { AddQuestionDialog } from '@/components/dialogs/add-question-dialog';
import { Button } from '@/components/ui/button';
import { Settings, Plus, BookmarkCheck, BookmarkIcon, FilterIcon, ChevronRight, Menu } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookamrks';
import { SignInButton, useUser } from '@clerk/nextjs';

interface CourseContentProps {
  course: CourseWithQuestions | null;
  sidebarCollapsed?: boolean; // ✅ New prop
  onExpandSidebar?: () => void; // ✅ New prop
}

export function CourseContent({ course, sidebarCollapsed = false }: CourseContentProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);
  
  const { user, isSignedIn } = useUser();
  const { data: bookmarkedQuestionIds = [], isLoading: bookmarksLoading } = useBookmarks();

  // Group questions by topics
  const questionsByTopic = useMemo(() => {
    if (!course) return {};

    const grouped: { [topic: string]: typeof course.questions } = {};

    // First, filter questions based on bookmark filter and difficulty
    let questionsToProcess = course.questions;
    
    // Apply bookmark filter
    if (showBookmarkedOnly) {
      questionsToProcess = course.questions.filter(question => 
        bookmarkedQuestionIds.includes(question.id)
      );
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      questionsToProcess = questionsToProcess.filter(q => 
        q.difficulty === selectedDifficulty.toUpperCase()
      );
    }

    // Group filtered questions by topics
    questionsToProcess.forEach(question => {
      question.topics.forEach(topic => {
        if (!grouped[topic]) {
          grouped[topic] = [];
        }
        grouped[topic].push(question);
      });
    });

    // Sort topics alphabetically
    const sortedTopics = Object.keys(grouped).sort();
    const sortedGrouped: { [topic: string]: typeof course.questions } = {};
    sortedTopics.forEach(topic => {
      sortedGrouped[topic] = grouped[topic];
    });

    return sortedGrouped;
  }, [course, selectedDifficulty, showBookmarkedOnly, bookmarkedQuestionIds]);

  // Calculate stats for current view
  const currentViewStats = useMemo(() => {
    if (!course) return { total: 0, bookmarked: 0 };
    
    let filteredQuestions = course.questions;
    
    if (selectedDifficulty !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => 
        q.difficulty === selectedDifficulty.toUpperCase()
      );
    }
    
    const bookmarkedInView = filteredQuestions.filter(q => 
      bookmarkedQuestionIds.includes(q.id)
    ).length;
    
    return {
      total: filteredQuestions.length,
      bookmarked: bookmarkedInView
    };
  }, [course, selectedDifficulty, bookmarkedQuestionIds]);

  const handleBookmarkToggle = () => {
    if (!user) {
      return;
    }
    setShowBookmarkedOnly(!showBookmarkedOnly);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
  };

  const handleResetFilters = () => {
    setSelectedDifficulty('all');
    setShowBookmarkedOnly(false);
  };

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            Select a course to get started
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Choose a course from the sidebar to view its questions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
      {/* ✅ Sidebar Collapsed Notice */}
      {sidebarCollapsed && !isSignedIn && (
        <div className='space-y-2'>
          <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg p-4 flex items-start space-x-3 transform transition-all duration-300 hover:bg-blue-500/20">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              </div>
                <div className="flex-1">
                  <h4 className="text-blue-300 font-medium mb-1">Create Custom Courses</h4>
                  <p className="text-gray-300 text-sm mb-3">Sign in to add new courses to organize your questions and track your learning progress.</p>
                  <SignInButton>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition-all duration-200 hover:scale-105">
                      Create Now
                    </Button>
                  </SignInButton>
                </div>
              </div>
              <div className="bg-green-500/10 border-l-4 border-green-500 rounded-r-lg p-4 flex items-start space-x-3 transform transition-all duration-300 hover:bg-green-500/20">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-green-300 font-medium mb-1">Link Coding Platforms</h4>
                  <p className="text-gray-300 text-sm mb-3">Sign in to connect your LeetCode, Codeforces, GeeksforGeeks, and other platforms to view all your coding stats in one place.</p>
                  <SignInButton>
                    <Button className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded transition-all duration-200 hover:scale-105">
                      Connect Platforms
                    </Button>
                  </SignInButton>
                </div>
              </div>
            </div>
      )}

      {/* Course Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="w-full flex justify-between items-center space-x-4">
            <div>
              <h2 className="text-lg font-semibold">Course Overview</h2>
              {(showBookmarkedOnly || selectedDifficulty !== 'all') && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {showBookmarkedOnly && selectedDifficulty !== 'all' 
                      ? `Showing bookmarked ${selectedDifficulty} questions`
                      : showBookmarkedOnly 
                      ? 'Showing bookmarked questions'
                      : `Showing ${selectedDifficulty} questions`
                    }
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleResetFilters}
                    className="text-xs text-orange-400 hover:text-orange-300 p-1 h-auto"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
            {!course.isDefault && (
              <AddQuestionDialog courseId={course.id} />
            )}
          </div>
        </div>

        <CourseStats course={course} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          {/* Difficulty Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
            <div className='flex gap-x-2 items-center'>
              <FilterIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 whitespace-nowrap">Filter by difficulty:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'easy', 'medium', 'hard'].map(difficulty => (
                <Button
                  key={difficulty}
                  size="sm"
                  variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                  onClick={() => handleDifficultyChange(difficulty)}
                  className={`capitalize whitespace-nowrap ${
                    selectedDifficulty === difficulty
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>

          {/* Bookmarks Filter */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={handleBookmarkToggle}
              disabled={!user || bookmarksLoading}
              variant={showBookmarkedOnly ? 'default' : 'outline'}
              className={`${
                showBookmarkedOnly
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'hover:bg-gray-700 border-yellow-500/50 text-yellow-400 hover:text-yellow-300'
              }`}
            >
              {bookmarksLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : showBookmarkedOnly ? (
                <BookmarkCheck className="w-4 h-4 mr-2" />
              ) : (
                <BookmarkIcon className="w-4 h-4 mr-2" />
              )}
              Bookmarks
              {user && currentViewStats.bookmarked > 0 && (
                <span className="ml-2 px-2 py-1 bg-black/20 rounded-full text-xs">
                  {showBookmarkedOnly 
                    ? Object.values(questionsByTopic).flat().length
                    : currentViewStats.bookmarked
                  }
                </span>
              )}
            </Button>
            
            {!user && (
              <span className="text-xs text-gray-500">Sign in to use bookmarks</span>
            )}
          </div>
        </div>
      </div>

      {/* Topics and Questions */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {Object.entries(questionsByTopic).map(([topic, questions], index) => (
          questions.length > 0 && (
            <TopicSection
              key={`${topic}-${showBookmarkedOnly}-${selectedDifficulty}`}
              topic={topic}
              questions={questions}
              stepNumber={index + 1}
              courseId={course.id}
            />
          )
        ))}

        {Object.keys(questionsByTopic).length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              {showBookmarkedOnly ? (
                <BookmarkIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              ) : (
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">?</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {showBookmarkedOnly ? 'No bookmarked questions found' : 'No questions found'}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mb-4">
              {showBookmarkedOnly && selectedDifficulty !== 'all'
                ? `No bookmarked ${selectedDifficulty.toLowerCase()} questions found in this course.`
                : showBookmarkedOnly
                ? 'You haven\'t bookmarked any questions in this course yet.'
                : selectedDifficulty === 'all' 
                ? 'This course doesn\'t have any questions yet.'
                : `No ${selectedDifficulty.toLowerCase()} questions found in this course.`
              }
            </p>
            {(showBookmarkedOnly || selectedDifficulty !== 'all') && (
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="border-gray-600 hover:bg-gray-700"
              >
                Show all questions
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
