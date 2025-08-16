'use client';

import { useState } from 'react';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import { CourseWithQuestions } from '@/types';
import { Button } from '@/components/ui/button';
import { Star, MoreVertical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useUserSubscription } from '@/hooks/useUserInfo';

interface DashboardHeaderProps {
  selectedCourse: CourseWithQuestions | null;
  isMobile?: boolean;
}

export function DashboardHeader({ selectedCourse, isMobile = false }: DashboardHeaderProps) {
  const { isSignedIn } = useUser();
  const { user } = useUser();
  const { data: userInfo, isLoading, error } = useUserSubscription();

  const { data: isAdminUser } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const userEmail = user.emailAddresses[0]?.emailAddress;
      const adminEmailsStr = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
      if (!adminEmailsStr || !userEmail) return false;
      
      const adminEmails = adminEmailsStr
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      
      return adminEmails.includes(userEmail);
    },
    enabled: !!user
  });

  // For mobile, return compact header actions only
  if (isMobile) {
    return (
      <div className="flex items-center space-x-2">
        {/* User Authentication - Compact */}
        <div className="flex-shrink-0">
          {isSignedIn ? (
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          ) : (
            <SignInButton>
              <Button size="sm" className="text-sm px-3">
                Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border-b border-gray-700 min-h-[100px]">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Course Info */}
          <div className="flex-1 min-w-0">
            {selectedCourse && (
              <div>
                <h1 className="text-2xl font-bold text-white truncate">
                  {selectedCourse.title}
                </h1>
                <p className="text-gray-400 mt-1">
                  Master Data Structures and Algorithms with structured practice
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 ml-4">
            {/* Admin/Pro Actions */}
            {isAdminUser ? (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
                  Admin Panel
                </Button>
              </Link>
            ) : (
              !userInfo?.isPro && (
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="default"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Get Pro
                  </Button>
                </Link>
              )
            )}

            {/* User Authentication */}
            <div className="flex-shrink-0">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton>
                  <Button>
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
