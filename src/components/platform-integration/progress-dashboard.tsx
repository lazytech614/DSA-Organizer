'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, TrendingUp, Calendar, Star, Trophy } from 'lucide-react';
import { UserPlatform } from '@prisma/client';
import { toast } from 'sonner';
import { stat } from 'fs';
import RatingDistributionPieChart from './rating-distribution-pie-chart';

interface ProgressDashboardProps {
  userId: string;
  platforms: UserPlatform[];
}

export function ProgressDashboard({ userId, platforms }: ProgressDashboardProps) {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const syncPlatform = async (platform: string) => {
    setSyncing(platform);
    
    try {
      const response = await fetch('/api/platforms/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      toast.success(`${platform} synced successfully!`);
      setLastRefresh(new Date());
      
      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(`Failed to sync ${platform}`);
    } finally {
      setSyncing(null);
    }
  };

  const syncAllPlatforms = async () => {
    setSyncing('all');
    
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
      setLastRefresh(new Date());
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Some platforms failed to sync');
    } finally {
      setSyncing(null);
    }
  };

  const getRatingColor = (platform: string, rating: number): string => {
    switch (platform.toLowerCase()) {
      case 'codeforces':
        if (rating >= 2100) return "text-red-400"; // Master/Grandmaster
        if (rating >= 1600) return "text-purple-400"; // Expert
        if (rating >= 1400) return "text-blue-400"; // Specialist
        if (rating >= 1200) return "text-green-400"; // Pupil
        return "text-gray-400"; // Newbie
      
      case 'codechef':
        if (rating >= 2200) return "text-red-400"; // 7 star
        if (rating >= 2000) return "text-orange-400"; // 6 star
        if (rating >= 1800) return "text-yellow-400"; // 5 star
        if (rating >= 1600) return "text-purple-400"; // 4 star
        if (rating >= 1400) return "text-blue-400"; // 3 star
        return "text-green-400"; // 1-2 star
      
      default:
        return "text-blue-400";
    }
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

  const getPlatformUrl = (platform: string, username: string): string => {
    switch (platform.toLowerCase()) {
      case 'leetcode': return `https://leetcode.com/${username}`;
      case 'codeforces': return `https://codeforces.com/profile/${username}`;
      case 'codechef': return `https://www.codechef.com/users/${username}`;
      case 'geeksforgeeks': return `https://auth.geeksforgeeks.org/user/${username}`;
      case 'hackerrank': return `https://www.hackerrank.com/${username}`;
      case 'atcoder': return `https://atcoder.jp/users/${username}`;
      default: return '#';
    }
  };

  // Helper function to format rating ranges
const formatRatingRange = (range: string) => {
  const rangeMap: { [key: string]: string } = {
    below1000: "< 1000",
    range1000to1199: "1000-1199",
    range1200to1399: "1200-1399", 
    range1400to1599: "1400-1599",
    range1600to1799: "1600-1799",
    range1800to1999: "1800-1999",
    range2000to2199: "2000-2199",
    range2200to2399: "2200-2399",
    range2400to2599: "2400-2599",
    range2600to2799: "2600-2799",
    range2800to2999: "2800-2999",
    above3000: "3000+",
    unrated: "Unrated"
  };
  return rangeMap[range] || range;
};

// Helper function to get bar colors for different rating ranges
const getRatingBarColor = (range: string) => {
  const colorMap: { [key: string]: string } = {
    below1000: "bg-gray-400",
    range1000to1199: "bg-green-400",
    range1200to1399: "bg-green-500",
    range1400to1599: "bg-cyan-400",
    range1600to1799: "bg-blue-400",
    range1800to1999: "bg-purple-400",
    range2000to2199: "bg-yellow-400",
    range2200to2399: "bg-yellow-500",
    range2400to2599: "bg-orange-400",
    range2600to2799: "bg-red-400",
    range2800to2999: "bg-red-500",
    above3000: "bg-red-600",
    unrated: "bg-gray-500"
  };
  return colorMap[range] || "bg-gray-400";
};


  const renderPlatformStats = (platform: string, stats: any) => {
    return (
      <>
        {stats?.rating !== undefined && (
          <div className="space-y-2">
            {stats.title && (
              <div className={`${getRatingColor(platform, stats.rating)} font-semibold`}>{stats.title}</div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Current Rating</span>
              <Badge className={`${getRatingColor(platform, stats.rating)} bg-transparent border-current`}>
                {stats.rating}
              </Badge>
            </div>
            {stats.maxRating && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Max Rating</span>
                <span className={`font-semibold ${getRatingColor(platform, stats.maxRating)}`}>
                  {stats.maxRating}
                </span>
              </div>
            )}
            {stats.rank && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Best Rank</span>
                <Badge variant="outline" className="capitalize">
                  {stats.rank}
                </Badge>
              </div>
            )}
            {stats.lastThreeRanks && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Last 3 Ranks</span>
                <div className="flex gap-1">
                  {stats.lastThreeRanks.map((rank: string, index: number) => (
                    <Badge key={index} variant="outline" className="capitalize text-xs">
                      {rank}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {stats?.totalSolved !== undefined && (
          <div className="space-y-4">
            {/* Total Problems Solved */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total Problems</span>
              <span className="font-bold text-lg text-white">{stats.totalSolved}</span>
            </div>

            {/* Easy/Medium/Hard breakdown */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-green-500/10 rounded">
                <div className="text-green-400 font-semibold">{stats.easySolved || 0}</div>
                <div className="text-xs text-gray-400">Easy</div>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 rounded">
                <div className="text-yellow-400 font-semibold">{stats.mediumSolved || 0}</div>
                <div className="text-xs text-gray-400">Medium</div>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded">
                <div className="text-red-400 font-semibold">{stats.hardSolved || 0}</div>
                <div className="text-xs text-gray-400">Hard</div>
              </div>
            </div>

            {/* Replace the entire rating-wise breakdown section with the pie chart */}
            {stats.ratingWiseCount && (
              <RatingDistributionPieChart 
                ratingWiseCount={stats.ratingWiseCount}
                totalSolved={stats.totalSolved}
                className="mt-4"
              />
            )}
          </div>
        )}
      </>
    );
  };

  if (platforms.length === 0) {
    return (
      <Card className="text-center py-12 bg-gray-800 border-gray-700">
        <CardContent>
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-lg font-medium mb-2 text-white">No platforms connected</h3>
          <p className="text-gray-400 mb-4">
            Connect your coding platforms to track your progress and achievements
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Connect Platforms
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with sync all button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Coding Progress</h2>
          <p className="text-gray-400">
            Last updated: {lastRefresh.toLocaleString()}
          </p>
        </div>
        <Button 
          onClick={syncAllPlatforms}
          disabled={syncing === 'all'}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {syncing === 'all' ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing All...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All
            </>
          )}
        </Button>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[minmax(200px,auto)]">
        {platforms.map(platformData => {
          const stats = platformData.stats as any;
          const platform = platformData.platform;
          
          // Determine if this card has complex content (pie charts, lots of data)
          const isComplexCard = (platform.toLowerCase() === 'codeforces' && stats?.ratingWiseCount) ||
                              (stats?.totalSolved > 500) ||
                              (stats?.ratingWiseCount && Object.keys(stats.ratingWiseCount).length > 5);
          
          return (
            <Card 
              key={platform} 
              className={`
                bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200
                ${isComplexCard ? 'md:row-span-2 xl:row-span-2' : ''}
              `}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlatformIcon(platform)}</span>
                    <div>
                      <CardTitle className="text-lg text-white capitalize">{platform}</CardTitle>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-400">@{platformData.username}</p>
                        <a 
                          href={getPlatformUrl(platform, platformData.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => syncPlatform(platform)}
                    disabled={syncing === platform}
                    className="hover:bg-gray-700"
                  >
                    {syncing === platform ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* ✅ Platform-specific stats rendering */}
                  {renderPlatformStats(platform, stats)}

                  {/* Last Sync */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      Last synced
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(platformData.lastSync).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ✅ Enhanced Achievement Summary */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Achievement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {platforms.reduce((sum, p) => {
                  const stats = p.stats as any;
                  return sum + (stats?.totalSolved || 0);
                }, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Problems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {platforms.length}
              </div>
              <div className="text-sm text-gray-400">Active Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {platforms.reduce((max, p) => {
                  const stats = p.stats as any;
                  return Math.max(max, stats?.rating || stats?.maxRating || 0);
                }, 0)}
              </div>
              <div className="text-sm text-gray-400">Highest Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(platforms.reduce((sum, p) => {
                  const daysSince = Math.floor((Date.now() - new Date(p.lastSync).getTime()) / (1000 * 60 * 60 * 24));
                  return sum + daysSince;
                }, 0) / platforms.length) || 0}
              </div>
              <div className="text-sm text-gray-400">Avg Days Since Sync</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
