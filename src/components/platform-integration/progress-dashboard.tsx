'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, TrendingUp, Calendar, Star, Trophy } from 'lucide-react';
import { UserPlatform } from '@prisma/client';
import { toast } from 'sonner';

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

  // ✅ Enhanced rating color function for all platforms
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

  // ✅ Platform-specific stats renderer
  const renderPlatformStats = (platform: string, stats: any) => {
    const platformLower = platform.toLowerCase();

    switch (platformLower) {
      case 'leetcode':
        return (
          <>
            {stats?.totalSolved !== undefined && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Problems Solved</span>
                  <span className="font-bold text-lg text-white">{stats.totalSolved}</span>
                </div>
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
              </div>
            )}
            {stats?.acceptanceRate !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Acceptance Rate</span>
                <span className="font-semibold text-white">{stats.acceptanceRate}%</span>
              </div>
            )}
            {stats?.ranking && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Global Ranking</span>
                <span className="font-semibold text-blue-400">#{stats.ranking.toLocaleString()}</span>
              </div>
            )}
          </>
        );

      case 'codeforces':
        return (
          <>
            {stats?.rating !== undefined && (
              <div className="space-y-2">
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
                    <span className="text-sm text-gray-400">Rank</span>
                    <Badge variant="outline" className="capitalize">
                      {stats.rank}
                    </Badge>
                  </div>
                )}
              </div>
            )}
            {stats?.problemStats?.solvedCount !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Problems Solved</span>
                <span className="font-semibold text-white">{stats.problemStats.solvedCount}</span>
              </div>
            )}
          </>
        );

      case 'geeksforgeeks':
        return (
          <>
            {stats?.totalSolved !== undefined && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Problems Solved</span>
                  <span className="font-bold text-lg text-white">{stats.totalSolved}</span>
                </div>
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
              </div>
            )}
            {stats?.acceptanceRate !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Acceptance Rate</span>
                <span className="font-semibold text-white">{stats.acceptanceRate}%</span>
              </div>
            )}
            {stats?.ranking && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Global Ranking</span>
                <span className="font-semibold text-blue-400">#{stats.ranking.toLocaleString()}</span>
              </div>
            )}
          </>
        );

      case 'codechef':
        return (
          <>
            <div className="space-y-3">
              {stats?.rating !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Current Rating</span>
                    <Badge className={`${getRatingColor(platform, stats.rating)} bg-transparent border-current`}>
                      {stats.rating}
                    </Badge>
                  </div>
                  {stats.maxRating && stats.maxRating !== stats.rating && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Max Rating</span>
                      <span className={`font-semibold ${getRatingColor(platform, stats.maxRating)}`}>
                        {stats.maxRating}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {stats?.stars && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Stars</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="font-semibold text-yellow-400">{stats.stars}</span>
                  </div>
                </div>
              )}
              
              {stats?.totalSolved !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Problems Solved</span>
                  <span className="font-semibold text-white">{stats.totalSolved}</span>
                </div>
              )}
              
              {stats?.contests !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Contests</span>
                  <span className="font-semibold text-blue-400">{stats.contests}</span>
                </div>
              )}
              
              {stats?.rank !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Global Rank</span>
                  <span className="font-semibold text-purple-400">#{stats.rank.toLocaleString()}</span>
                </div>
              )}
              
              {stats?.countryRank !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Country Rank</span>
                  <span className="font-semibold text-green-400">#{stats.countryRank.toLocaleString()}</span>
                </div>
              )}
              
              {stats?.division && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Division</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.division}
                  </Badge>
                </div>
              )}
            </div>
          </>
        );

      default:
        return (
          <div className="text-center py-4">
            <span className="text-sm text-gray-400">No data available</span>
          </div>
        );
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {platforms.map(platformData => {
          const stats = platformData.stats as any;
          const platform = platformData.platform;
          
          return (
            <Card key={platform} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200">
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
