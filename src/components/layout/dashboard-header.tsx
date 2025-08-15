'use client';

import { useState } from 'react';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import { CourseWithQuestions } from '@/types';
import { Button } from '@/components/ui/button';
import { Search, Filter, MoreVertical, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  selectedCourse: CourseWithQuestions | null;
  isMobile?: boolean;
}

export function DashboardHeader({ selectedCourse, isMobile = false }: DashboardHeaderProps) {
  const { isSignedIn } = useUser();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className={`${isMobile ? 'p-4 pt-16' : 'p-6'}`}>
        <div className="flex items-center justify-between">
          {/* Course Info */}
          <div className="flex-1 min-w-0">
            {selectedCourse && (
              <div>
                <h1 className={`font-bold text-white truncate ${
                  isMobile ? 'text-lg' : 'text-2xl'
                }`}>
                  {selectedCourse.title}
                </h1>
                <p className={`text-gray-400 mt-1 ${
                  isMobile ? 'text-sm hidden sm:block' : 'block'
                }`}>
                  Master Data Structures and Algorithms with structured practice
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Subscriptions */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <Star className="w-4 h-4 mr-1" />
              <span>Get Pro</span>
            </Button>
            {/* Mobile More Options */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}

            {/* User Authentication */}
            <div className="flex-shrink-0">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton>
                  <Button size={isMobile ? "sm" : "default"}>
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobile && showSearch && (
          <div className="mt-4 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search problems..."
                className="pl-10 w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
