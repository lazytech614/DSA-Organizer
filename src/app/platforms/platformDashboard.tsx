'use client';

import { useState, useEffect } from 'react';
import { UserPlatform } from '@prisma/client';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { PlatformLinker } from '@/components/platform-integration/platform-linker';
import { ProgressDashboard } from '@/components/platform-integration/progress-dashboard';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users,
  Award,
  TrendingUp,
  Calendar,
  RefreshCw,
  Star,
  Trophy,
  Zap,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Crown,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useUser } from '@clerk/nextjs';

interface PlatformDashboardProps {
  userId: string;
  platforms: UserPlatform[];
  totalStats: {
    connectedPlatforms: number;
    totalSolved: number;
    rating: number;
    maxRating: number;
    lastSyncTime: Date | null;
  };
}

export function PlatformDashboard({ userId, platforms, totalStats }: PlatformDashboardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { isSignedIn } = useUser();
  const { data: userInfo, isLoading, isError } = useUserInfo();

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768; // sm breakpoint
      const tablet = width >= 768 && width < 1024; // md to lg breakpoint
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      // Auto-collapse sidebar on mobile and tablet
      if (mobile || tablet) {
        setSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle entrance animation for mobile/tablet
  useEffect(() => {
    if ((isMobile || isTablet) && !sidebarCollapsed) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isMobile, isTablet, sidebarCollapsed]);

  // Calculate additional stats
  const additionalStats = {
    totalContests: platforms.reduce((sum, platform) => {
      const stats = platform.stats as any;
      return sum + (stats?.contests || 0);
    }, 0),
    
    activeDays: totalStats.lastSyncTime 
      ? Math.max(1, Math.floor((Date.now() - totalStats.lastSyncTime.getTime()) / (1000 * 60 * 60 * 24)))
      : 0,
    
    platformsWithData: platforms.filter(p => p.stats && Object.keys(p.stats as any).length > 0).length,
    
    easyProblems: platforms.reduce((sum, platform) => {
      const stats = platform.stats as any;
      return sum + (stats?.easySolved || 0);
    }, 0),
    
    mediumProblems: platforms.reduce((sum, platform) => {
      const stats = platform.stats as any;
      return sum + (stats?.mediumSolved || 0);
    }, 0),
    
    hardProblems: platforms.reduce((sum, platform) => {
      const stats = platform.stats as any;
      return sum + (stats?.hardSolved || 0);
    }, 0),

    maxRating: Math.max(...platforms.map(platform => {
      const stats = platform.stats as any;
      return stats?.rating || stats?.maxRating || 0;
    }), 0)
  };

  const refreshStats = () => {
    setLastRefresh(new Date());
    window.location.reload();
  };

  const getPlatformIcon = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'leetcode': return '🟡';
      case 'codeforces': return '🔴';
      case 'codechef': return '🟤';
      case 'geeksforgeeks': return '🟢';
      case 'hackerrank': return '🟩';
      case 'atcoder': return '🟠';
      default: return '💻';
    }
  };

  const handleClose = () => {
    if (isMobile || isTablet) {
      setIsVisible(false);
      setTimeout(() => setSidebarCollapsed(true), 200);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const toggleSidebar = () => {
    if (isMobile || isTablet) {
      if (sidebarCollapsed) {
        setSidebarCollapsed(false);
        setTimeout(() => setIsVisible(true), 10);
      } else {
        setIsVisible(false);
        setTimeout(() => setSidebarCollapsed(true), 200);
      }
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Determine sidebar width based on screen size and collapsed state
  const getSidebarWidth = () => {
    if (isMobile && sidebarCollapsed) return 'w-0';
    if (isTablet && sidebarCollapsed) return 'w-0';
    if (!isMobile && !isTablet && sidebarCollapsed) return 'w-16'; // Desktop collapsed
    if (isMobile) return 'w-80'; // Mobile expanded (overlay)
    if (isTablet) return 'w-72'; // Tablet expanded (overlay)
    return 'w-80'; // Desktop expanded
  };

  const getUsagePercentage = () => {
    if (!userInfo?.limits) return 0;
    const { coursesUsed, maxCourses } = userInfo.limits;
    if (maxCourses === -1) return 0;
    return (coursesUsed / maxCourses) * 100;
  };

  const renderSubscriptionNotice = () => {
    if (!userInfo) return null;

    const { isPro, limits, stats } = userInfo;
    const usagePercentage = getUsagePercentage();

    if (isPro) {
      return (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 transform transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <h4 className="text-yellow-300 font-medium text-sm">Pro Member</h4>
          </div>
          <div className="space-y-1 text-xs text-yellow-200">
            <div className="flex justify-between">
              <span>Platforms:</span>
              <span className="font-medium">Unlimited</span>
            </div>
          </div>
        </div>
      );
    }

    const isNearLimit = usagePercentage >= 80;
    const isAtLimit = !limits.canCreateCourse;

    if (isAtLimit) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 space-y-2 transform transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h4 className="text-red-300 font-medium text-sm">Limit Reached</h4>
          </div>
          <p className="text-xs text-red-200 mb-3">
            You've used all {limits.maxPlatforms} platforms slots. Upgrade to link unlimited platforms!
          </p>
          <Link href="/pricing">
            <Button size="sm" className="w-full bg-red-500 hover:bg-red-600 text-white text-xs h-7 transition-colors">
              <Crown className="w-3 h-3 mr-1" />
              Upgrade Now
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4 transform transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-400" />
          <h4 className="text-gray-300 font-medium text-sm">Free Plan</h4>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Platforms:</span>
              <span className="font-medium text-gray-300">{limits.platformsLinked} / {limits.maxPlatforms}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
          <Link href="/pricing">
            <Button size="sm" variant="outline" className="w-full text-xs h-7 border-gray-600 hover:bg-gray-700 transition-colors">
              <Crown className="w-3 h-3 mr-1" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
      {/* Stats Sidebar - Fixed Height with Internal Scrolling */}
      <div className={`
        ${getSidebarWidth()}
        ${(isMobile || isTablet) && !sidebarCollapsed ? 'fixed z-[9999] h-full' : 'relative'} 
        bg-gray-900 border-r border-gray-700 
        transition-all duration-300 flex-shrink-0 overflow-hidden
        ${(isMobile || isTablet) ? (isVisible ? 'opacity-100' : 'opacity-0') : 'opacity-100'}
        h-full
      `}>
        <div className={`
          ${getSidebarWidth().replace('w-', '')} 
          h-full bg-gray-900 border-r border-gray-700 flex flex-col 
          transition-all duration-300
        `}>
          
          {/* Header - Fixed Height */}
          <div className={`
            border-b border-gray-700 
            ${(isMobile || isTablet) ? 'p-3' : 'p-4'} 
            transition-all duration-300 delay-75 
            h-[80px] sm:h-[90px] lg:h-[100px] flex-shrink-0
            ${(isMobile || isTablet) ? (isVisible ? 'transform translate-x-0' : 'transform -translate-x-4 opacity-0') : ''}
          `}>
            <div className="flex items-center justify-between h-full">
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-orange-400 flex-shrink-0`} />
                    <h1 className={`font-bold text-orange-400 truncate ${
                      isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'
                    }`}>
                      Statistics
                    </h1>
                  </div>
                  <p className={`text-gray-400 mt-1 truncate ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    {isMobile ? 'Platform insights' : 'Your coding platform insights'}
                  </p>
                </div>
              )}
              
              {/* Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-400 hover:text-white p-2 transition-all duration-200 flex-shrink-0"
                title={sidebarCollapsed ? "Expand sidebar" : (isMobile || isTablet ? "Close sidebar" : "Collapse sidebar")}
              >
                {(isMobile || isTablet) ? (
                  <X className="w-4 h-4" />
                ) : sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Scrollable Content Area - Takes remaining height */}
          <div className={`
            flex-1 overflow-y-auto overflow-x-hidden
            ${sidebarCollapsed && !isMobile && !isTablet ? 'p-2' : (isMobile ? 'p-3' : isTablet ? 'p-3' : 'p-4')} 
            transition-all duration-300 delay-150 
            ${(isMobile || isTablet) ? (isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-4 opacity-0') : ''}
            
            /* Enhanced Custom Scrollbar */
            scrollbar-thin 
            scrollbar-track-gray-800/50 
            scrollbar-thumb-gray-600 
            hover:scrollbar-thumb-gray-500 
            active:scrollbar-thumb-gray-400
            scrollbar-thumb-rounded-full 
            scrollbar-corner-gray-800
            
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-gray-800/30
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-600
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:border-2
            [&::-webkit-scrollbar-thumb]:border-solid
            [&::-webkit-scrollbar-thumb]:border-gray-900
            [&::-webkit-scrollbar-thumb]:bg-clip-padding
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
            active:[&::-webkit-scrollbar-thumb]:bg-gray-400
            [&::-webkit-scrollbar-corner]:bg-gray-800
            
            scroll-smooth
            scroll-pt-4
            overscroll-contain
            
            /* Mobile scroll optimizations */
            [-webkit-overflow-scrolling:touch] 
            overscroll-y-contain
          `}>
            
            {sidebarCollapsed && !isMobile && !isTablet ? (
              // Collapsed view - Icons only (Desktop only)
              <div className="space-y-4">
                {/* Refresh Button - Icon only */}
                <div className="flex justify-center">
                  <Button 
                    onClick={refreshStats}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white p-2 transition-all duration-200 hover:scale-105"
                    title="Refresh Stats"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Stats Icons */}
                <div className="space-y-3">
                  <div className="flex flex-col items-center p-2 bg-blue-500/10 rounded-lg transition-all duration-200 hover:bg-blue-500/20" title="Connected Platforms">
                    <Users className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="text-xs font-bold text-white">{totalStats.connectedPlatforms}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-green-500/10 rounded-lg transition-all duration-200 hover:bg-green-500/20" title="Problems Solved">
                    <Award className="w-5 h-5 text-green-400 mb-1" />
                    <span className="text-xs font-bold text-white">{totalStats.totalSolved}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-yellow-500/10 rounded-lg transition-all duration-200 hover:bg-yellow-500/20" title="Average Rating">
                    <TrendingUp className="w-5 h-5 text-yellow-400 mb-1" />
                    <span className="text-xs font-bold text-white">{totalStats.rating || 0}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-purple-500/10 rounded-lg transition-all duration-200 hover:bg-purple-500/20" title="Days Since Last Sync">
                    <Calendar className="w-5 h-5 text-purple-400 mb-1" />
                    <span className="text-xs font-bold text-white">{additionalStats.activeDays}d</span>
                  </div>
                </div>

                {/* Platform Icons */}
                {platforms.length > 0 && (
                  <div className="space-y-2">
                    <div className="w-full h-px bg-gray-700 my-3"></div>
                    {platforms.slice(0, 4).map((platform) => (
                      <div
                        key={platform.id}
                        className="flex justify-center p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-200"
                        title={`${platform.platform} - @${platform.username}`}
                      >
                        <span className="text-lg">{getPlatformIcon(platform.platform)}</span>
                      </div>
                    ))}
                    {platforms.length > 4 && (
                      <div className="flex justify-center p-2 bg-gray-800 rounded-lg" title={`+${platforms.length - 4} more platforms`}>
                        <span className="text-xs text-gray-400">+{platforms.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Achievement Icons */}
                <div className="space-y-2">
                  <div className="w-full h-px bg-gray-700 my-3"></div>
                  {totalStats.totalSolved >= 100 && (
                    <div className="flex justify-center p-2 bg-yellow-500/10 rounded-lg" title="100+ Problems Solved">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                    </div>
                  )}
                  {platforms.length >= 3 && (
                    <div className="flex justify-center p-2 bg-blue-500/10 rounded-lg" title="Multi-Platform Coder">
                      <Star className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                  {additionalStats.maxRating >= 1500 && (
                    <div className="flex justify-center p-2 bg-purple-500/10 rounded-lg" title="High Performer">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Expanded view - Full content
              <div className="space-y-4 lg:space-y-6">
                {!sidebarCollapsed && isSignedIn && !isLoading && (
                  <div className={`border-b border-gray-700 transition-all duration-300 delay-100 ${
                    isMobile ? (isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-4 opacity-0') : ''
                  }`}>
                    {renderSubscriptionNotice()}
                  </div>
                )}
                {/* Refresh Button */}
                <div className={`transform transition-all duration-300 ${
                  (isMobile || isTablet) ? (isVisible ? 'translate-x-0 opacity-100' : 'transform -translate-x-4 opacity-0') : ''
                }`}>
                  <div className="flex justify-between items-center p-2 bg-gray-800 rounded-lg">
                    <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Updated: {lastRefresh.toLocaleTimeString()}
                    </p>
                    <Button 
                      onClick={refreshStats}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white p-2 transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Primary Stats Section */}
                <div className={`transform transition-all duration-300 delay-75 ${
                  (isMobile || isTablet) ? (isVisible ? 'translate-x-0 opacity-100' : 'transform -translate-x-4 opacity-0') : ''
                }`}>
                  <div className="space-y-3 lg:space-y-4">
                    <h4 className={`font-medium text-gray-300 uppercase tracking-wide ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>Overview</h4>
                    
                    {/* Connected Platforms */}
                    <div className={`w-full rounded-lg transition-all duration-200 transform hover:scale-[1.02] bg-gray-800 hover:bg-gray-700 ${
                      isMobile ? 'p-2' : 'p-3'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className={`font-medium text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>Connected</span>
                        </div>
                        <span className={`font-bold text-white ${isMobile ? 'text-base' : 'text-lg'}`}>{totalStats.connectedPlatforms}</span>
                      </div>
                      <Badge variant="outline" className={`text-blue-400 border-blue-400/50 transition-all duration-200 ${
                        isMobile ? 'text-xs' : 'text-xs'
                      }`}>
                        {additionalStats.platformsWithData} active
                      </Badge>
                    </div>

                    {/* Total Solved */}
                    <div className={`w-full rounded-lg transition-all duration-200 transform hover:scale-[1.02] bg-gray-800 hover:bg-gray-700 ${
                      isMobile ? 'p-2' : 'p-3'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className={`font-medium text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>Solved</span>
                        </div>
                        <span className={`font-bold text-green-400 ${isMobile ? 'text-base' : 'text-lg'}`}>{totalStats.totalSolved}</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-xs'}`}>
                          <span className="text-green-400">Easy: {additionalStats.easyProblems}</span>
                          <span className="text-yellow-400">Medium: {additionalStats.mediumProblems}</span>
                          <span className="text-red-400">Hard: {additionalStats.hardProblems}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Stats */}
                    <div className={`w-full rounded-lg transition-all duration-200 transform hover:scale-[1.02] bg-gray-800 hover:bg-gray-700 ${
                      isMobile ? 'p-2' : 'p-3'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <span className={`font-medium text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>Rating</span>
                        </div>
                        <span className={`font-bold text-yellow-400 ${isMobile ? 'text-base' : 'text-lg'}`}>
                          {Math.round(totalStats.rating) || 'N/A'}
                        </span>
                      </div>
                      <div className={`flex justify-between text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                        <span>Max: {totalStats.maxRating || 'N/A'}</span>
                        <span>Contests: {additionalStats.totalContests}</span>
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className={`w-full rounded-lg transition-all duration-200 transform hover:scale-[1.02] bg-gray-800 hover:bg-gray-700 ${
                      isMobile ? 'p-2' : 'p-3'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className={`font-medium text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>Last Sync</span>
                        </div>
                        <span className={`font-bold text-purple-400 ${isMobile ? 'text-base' : 'text-lg'}`}>
                          {additionalStats.activeDays}d
                        </span>
                      </div>
                      <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                        {totalStats.lastSyncTime ? totalStats.lastSyncTime.toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Breakdown Section */}
                {platforms.length > 0 && (
                  <div className={`transform transition-all duration-300 delay-100 ${
                    (isMobile || isTablet) ? (isVisible ? 'translate-x-0 opacity-100' : 'transform -translate-x-4 opacity-0') : ''
                  }`}>
                    <div className="space-y-3 lg:space-y-4">
                      <h4 className={`font-medium text-gray-300 uppercase tracking-wide ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>Platforms</h4>
                      <div className="space-y-2 lg:space-y-3">
                        {platforms.map((platform, index) => {
                          const stats = platform.stats as any;
                          return (
                            <div
                              key={platform.id}
                              className={`w-full rounded-lg transition-all duration-200 transform hover:scale-[1.02] bg-gray-800 hover:bg-gray-700 ${
                                isMobile ? 'p-2' : 'p-3'
                              } ${(isMobile || isTablet) ? 'transition-all duration-300' : ''}`}
                              style={(isMobile || isTablet) ? { transitionDelay: `${index * 50}ms` } : {}}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2 min-w-0">
                                  <span className={`flex-shrink-0 ${isMobile ? 'text-base' : 'text-lg'}`}>
                                    {getPlatformIcon(platform.platform)}
                                  </span>
                                  <div className="min-w-0">
                                    <div className={`font-medium text-white truncate ${
                                      isMobile ? 'text-xs' : 'text-sm'
                                    }`}>
                                      {platform.platform}
                                    </div>
                                    <div className={`text-gray-400 truncate ${
                                      isMobile ? 'text-xs' : 'text-xs'
                                    }`}>
                                      @{platform.username}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {stats?.totalSolved && (
                                  <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                    <span className="text-gray-400">Solved:</span>
                                    <span className="text-green-400">{stats.totalSolved}</span>
                                  </div>
                                )}
                                {stats?.rating && (
                                  <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                    <span className="text-gray-400">Rating:</span>
                                    <span className="text-yellow-400">{stats.rating}</span>
                                  </div>
                                )}
                                <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                  <span className="text-gray-400">Synced:</span>
                                  <span className="text-purple-400">
                                    {Math.floor((Date.now() - new Date(platform.lastSync).getTime()) / (1000 * 60 * 60 * 24))}d ago
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievement Section */}
                <div className={`transform transition-all duration-300 delay-150 ${
                  (isMobile || isTablet) ? (isVisible ? 'translate-x-0 opacity-100' : 'transform -translate-x-4 opacity-0') : ''
                }`}>
                  <div className="space-y-3 lg:space-y-4 pb-10">
                    <h4 className={`font-medium text-gray-300 uppercase tracking-wide ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>Achievements</h4>
                    <div className="space-y-2">
                      {totalStats.totalSolved >= 100 && (
                        <div className={`flex items-center space-x-2 bg-yellow-500/10 rounded-lg transition-all duration-300 hover:bg-yellow-500/20 ${
                          isMobile ? 'p-2' : 'p-2'
                        }`}>
                          <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <span className={`text-yellow-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>100+ Problems Solved</span>
                        </div>
                      )}
                      {platforms.length >= 3 && (
                        <div className={`flex items-center space-x-2 bg-blue-500/10 rounded-lg transition-all duration-300 hover:bg-blue-500/20 ${
                          isMobile ? 'p-2' : 'p-2'
                        }`}>
                          <Star className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className={`text-blue-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Multi-Platform Coder</span>
                        </div>
                      )}
                      {additionalStats.maxRating >= 1500 && (
                        <div className={`flex items-center space-x-2 bg-purple-500/10 rounded-lg transition-all duration-300 hover:bg-purple-500/20 ${
                          isMobile ? 'p-2' : 'p-2'
                        }`}>
                          <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className={`text-purple-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>High Performer</span>
                        </div>
                      )}
                      {platforms.length === 0 && (
                        <div className={`bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg flex items-start space-x-3 transition-all duration-300 hover:bg-blue-500/20 ${
                          isMobile ? 'p-2' : 'p-3'
                        }`}>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-blue-300 font-medium mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Start Your Journey</h4>
                            <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-xs'}`}>Connect your first platform to unlock achievements and track your progress.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Fixed Height with Internal Scrolling */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0">
          <DashboardHeader 
            isPlatformPage={true}
            platforms={platforms}
            totalStats={totalStats}
            isMobile={isMobile}
          />
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8">
          <Tabs defaultValue="connect" className="space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <TabsList className="grid grid-cols-2 bg-gray-800 w-fit">
                <TabsTrigger value="connect" className={`data-[state=active]:bg-gray-700 ${
                  isMobile ? 'text-xs px-3 py-2' : 'text-sm'
                }`}>
                  Connect Platforms
                </TabsTrigger>
                <TabsTrigger value="progress" className={`data-[state=active]:bg-gray-700 ${
                  isMobile ? 'text-xs px-3 py-2' : 'text-sm'
                }`}>
                  View Progress
                </TabsTrigger>
              </TabsList>
              
              {/* Sidebar Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSidebar}
                className="border-gray-600 hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                {sidebarCollapsed ? (
                  <>
                    <ChevronRight className="w-4 h-4 mr-2" />
                    <span className={isMobile ? 'text-xs' : 'text-sm'}>Show Stats</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span className={isMobile ? 'text-xs' : 'text-sm'}>
                      {(isMobile || isTablet) ? 'Stats' : 'Hide Stats'}
                    </span>
                  </>
                )}
              </Button>
            </div>

            <TabsContent value="connect" className="space-y-4 lg:space-y-6">
              <PlatformLinker userId={userId} linkedPlatforms={platforms}  />
            </TabsContent>

            <TabsContent value="progress" className="space-y-4 lg:space-y-6">
              <ProgressDashboard userId={userId} platforms={platforms} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile/Tablet overlay */}
      {(isMobile || isTablet) && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30" 
          onClick={() => toggleSidebar()}
        />
      )}
    </div>
  );
}