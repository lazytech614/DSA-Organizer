// components/platform-integration/PlatformHeader.tsx
'use client';

import { useState } from 'react';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  TrendingUp, 
  RefreshCw, 
  Settings, 
  Award,
  Users,
  Calendar,
  CrownIcon,
  Home,
  Menu,
  X
} from 'lucide-react';
import { UserPlatform } from '@prisma/client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useUserSubscription } from '@/hooks/useUserInfo';
import { toast } from 'sonner';

interface PlatformHeaderProps {
  platforms: UserPlatform[];
  totalStats: {
    connectedPlatforms: number;
    totalSolved: number;
    averageRating: number;
    lastSyncTime: Date | null;
  };
  isMobile?: boolean;
}

export function PlatformHeader({ platforms, totalStats, isMobile = false }: PlatformHeaderProps) {
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

  // Mobile Header
  if (isMobile) {
    return (
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          {/* Mobile Menu Button & Title */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white lg:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-blue-400" />
              <h1 className="text-lg font-bold text-white">Platforms</h1>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2">
            {platforms.length > 0 && (
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
                <Button size="sm">Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="bg-gray-800 border-b border-gray-700 p-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{totalStats.connectedPlatforms}</div>
                <div className="text-xs text-gray-400">Connected</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-400">{totalStats.totalSolved}</div>
                <div className="text-xs text-gray-400">Solved</div>
              </div>
            </div>

            {/* Navigation Links */}
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
                  <Settings className="w-4 h-4" />
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

  // Desktop Header
  return (
    <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-6">
        {/* Header Top Row */}
        <div className="flex items-center justify-between mb-6">
          {/* Platform Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
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
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-4">
            {/* Sync All Button */}
            {platforms.length > 0 && (
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
            <Link 
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>

            {/* Admin/Pro Actions */}
            {isAdminUser ? (
              <Link href="/admin">
                <Button variant="ghost" className="text-orange-400 hover:text-orange-300">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            ) : (
              !userInfo?.isPro && (
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500"
                  >
                    <CrownIcon className="w-4 h-4 mr-2" />
                    Get Pro
                  </Button>
                </Link>
              )
            )}

            {/* User Authentication */}
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton>
                <Button>Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Stats Row - Desktop Only */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Connected Platforms */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Connected</p>
                <p className="text-2xl font-bold text-white">{totalStats.connectedPlatforms}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/50">
                {platforms.length === 0 ? 'Connect platforms' : 'Active'}
              </Badge>
            </div>
          </div>

          {/* Total Solved */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Solved</p>
                <p className="text-2xl font-bold text-green-400">{totalStats.totalSolved}</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Award className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs text-green-400 border-green-400/50">
                Cross-platform
              </Badge>
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Performance</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {platforms.length > 0 ? '85%' : '0%'}
                </p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/50">
                {platforms.length > 0 ? 'Improving' : 'Start coding'}
              </Badge>
            </div>
          </div>

          {/* Last Activity */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Last Sync</p>
                <p className="text-2xl font-bold text-purple-400">
                  {totalStats.lastSyncTime ? 
                    Math.abs(Math.round((totalStats.lastSyncTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) + 'd'
                    : '∞'
                  }
                </p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/50">
                {totalStats.lastSyncTime ? 'Recent' : 'Never'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
