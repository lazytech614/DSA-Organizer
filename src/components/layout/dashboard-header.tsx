'use client';

import { useState } from 'react';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import { CourseWithQuestions } from '@/types';
import { UserPlatform } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  CrownIcon, 
  Code2, 
  RefreshCw,
  Home,
  Menu,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useUserSubscription } from '@/hooks/useUserInfo';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  selectedCourse?: CourseWithQuestions | null;
  isMobile?: boolean;
  // Platform-specific props
  isPlatformPage?: boolean;
  platforms?: UserPlatform[];
  totalStats?: {
    connectedPlatforms: number;
    totalSolved: number;
    rating: number;
    maxRating: number;
    lastSyncTime: Date | null;
  };
}

export function DashboardHeader({ 
  selectedCourse, 
  isMobile = false,
  isPlatformPage = false,
  platforms = [],
  totalStats
}: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isSignedIn, user } = useUser();
  const { data: userInfo } = useUserSubscription();

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

  const syncAllPlatforms = async () => {
    if (platforms.length === 0) {
      toast.error('No platforms connected to sync');
      return;
    }

    setIsSyncing(true);
    
    try {
      const syncPromises = platforms.map(platform => 
        fetch('/api/platforms/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: platform.platform })
        })
      );

      await Promise.all(syncPromises);
      toast.success('All platforms synced successfully!');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Some platforms failed to sync');
    } finally {
      setIsSyncing(false);
    }
  };

  // For mobile, return compact header actions only
  if (isMobile) {
    return (
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50 w-full">
        <div className="flex items-center justify-between p-4">
          {/* Mobile Menu Button & Title */}
          <div className="flex items-center space-x-3">
            {isPlatformPage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
            <div className="flex items-center space-x-2">
              {isPlatformPage && isSignedIn ? (
                <>
                  <Code2 className="w-6 h-6 text-blue-400" />
                  <h1 className="text-lg font-bold text-white">Platforms</h1>
                </>
              ) : (
                selectedCourse && (
                  <div className='flex items-center'>
                    <h1 className="text-lg font-bold text-white truncate">
                      {selectedCourse.title}
                    </h1>
                    
                  </div>
                )
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2">
            {!isPlatformPage && isSignedIn && (
              <Link 
                href="/platforms" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                <span className='text-sm'>Platforms</span>
              </Link>
            )}
            {isPlatformPage && platforms.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={syncAllPlatforms}
                disabled={isSyncing}
                className="text-blue-400 hover:bg-blue-500/10"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
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
        </div>

        {/* Mobile Menu Overlay for Platform Page */}
        {isPlatformPage && isMenuOpen && (
          <div className="bg-gray-800 border-b border-gray-700 p-4 space-y-4">
            {/* Navigation Links Only */}
            <div className="space-y-2">
              <Link 
                href="/"
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              {isAdminUser ? (
                <Link 
                  href="/admin"
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 text-orange-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MoreVertical className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                !userInfo?.isPro && (
                  <Link 
                    href="/pricing"
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-yellow-500/10 text-yellow-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CrownIcon className="w-4 h-4" />
                    <span>Get Pro</span>
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Header - No Stats
  return (
    <div className="bg-gray-900 border-b border-gray-700 min-h-[100px]">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Course/Platform Info */}
          <div className="flex-1 min-w-0">
            {isPlatformPage && isSignedIn ? (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Code2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Coding Platforms</h1>
                  <p className="text-gray-400">
                    Track your progress across multiple platforms
                  </p>
                </div>
              </div>
            ) : (
              selectedCourse && (
                <div>
                  <h1 className="text-2xl font-bold text-white truncate">
                    {selectedCourse.title}
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Master Data Structures and Algorithms with structured practice
                  </p>
                </div>
              )
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 ml-4">
            {/* Platform-specific Sync Button */}
            {isPlatformPage && platforms.length > 0 && (
              <Button
                onClick={syncAllPlatforms}
                disabled={isSyncing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync All
                  </>
                )}
              </Button>
            )}

            {/* Navigation Links */}
            {isPlatformPage && isSignedIn ? (
              <Link 
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
            ) : (
              <Link 
                href="/platforms" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                Platforms
              </Link>
            )}

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
                    <CrownIcon className="w-4 h-4 mr-1" />
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
