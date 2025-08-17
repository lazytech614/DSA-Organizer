// components/platform-integration/PlatformLinker.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlatform, Platform } from '@prisma/client';
import { toast } from 'sonner';
import { Trash2, Link2, ExternalLink, RefreshCw } from 'lucide-react';

interface PlatformLinkerProps {
  userId: string;
  linkedPlatforms: UserPlatform[];
}

export function PlatformLinker({ userId, linkedPlatforms }: PlatformLinkerProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const platforms = [
    { key: 'LEETCODE' as Platform, name: 'LeetCode', icon: '🟡', color: 'bg-yellow-500' },
    { key: 'CODEFORCES' as Platform, name: 'Codeforces', icon: '🔴', color: 'bg-red-500' },
    { key: 'CODECHEF' as Platform, name: 'CodeChef', icon: '🟤', color: 'bg-orange-600' },
    { key: 'GEEKSFORGEEKS' as Platform, name: 'GeeksforGeeks', icon: '🟢', color: 'bg-green-500' },
    { key: 'HACKERRANK' as Platform, name: 'HackerRank', icon: '🟩', color: 'bg-green-600' },
    { key: 'ATCODER' as Platform, name: 'AtCoder', icon: '🟠', color: 'bg-orange-500' },
  ];

  const handleConnect = async (platform: Platform) => {
    if (!newUsername.trim()) {
      toast.error('Please enter your username');
      return;
    }

    setConnecting(platform);

    try {
      // First, verify the username exists on the platform
      const verificationResponse = await fetch('/api/platforms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          username: newUsername.trim()
        })
      });

      if (!verificationResponse.ok) {
        const errorData = await verificationResponse.json();
        throw new Error(errorData.error || 'Username not found on this platform');
      }

      // Link the platform
      const response = await fetch('/api/platforms/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          username: newUsername.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link platform');
      }

      toast.success(`Successfully linked ${platform}!`);
      setNewUsername('');
      setSelectedPlatform(null);
      
      // Refresh the page or update state
      window.location.reload();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to link platform');
    } finally {
      setConnecting(null);
    }
  };

  const handleUnlink = async (platform: Platform) => {
    setUnlinking(platform);

    try {
      const response = await fetch('/api/platforms/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unlink platform');
      }

      toast.success(`Successfully unlinked ${platform}!`);
      window.location.reload();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to unlink platform');
    } finally {
      setUnlinking(null);
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

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Link Your Coding Platforms</h3>
      
      {/* Linked Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map(platform => {
          const linked = linkedPlatforms.find(lp => lp.platform === platform.key);
          
          return (
            <div key={platform.key} className="border border-gray-700 rounded-lg p-4 bg-gray-800 hover:bg-gray-750 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${platform.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">
                      {platform.name.slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white">{platform.name}</h4>
                    {linked ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-green-400">@{linked.username}</p>
                        <a 
                          href={getPlatformUrl(platform.key, linked.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="View profile"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Not connected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {linked ? (
                    <>
                      <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                        Connected
                      </Badge>
                      {/* Unlink Button with Confirmation Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                            disabled={unlinking === platform.key}
                          >
                            {unlinking === platform.key ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">
                              Unlink {platform.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              This will permanently remove the connection to your {platform.name} account (@{linked.username}). 
                              Your progress data will be deleted and you'll need to reconnect to sync again.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleUnlink(platform.key)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={unlinking === platform.key}
                            >
                              {unlinking === platform.key ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Unlinking...
                                </>
                              ) : (
                                'Unlink Platform'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setSelectedPlatform(platform.key)}
                      disabled={connecting === platform.key}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Link2 className="w-3 h-3 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>

              {/* Show last sync time if connected */}
              {linked && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Last synced: {new Date(linked.lastSync).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded ${linked.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {linked.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connection Dialog */}
      {selectedPlatform && (
        <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/10">
          <h4 className="font-medium mb-3 text-white">
            Connect {platforms.find(p => p.key === selectedPlatform)?.name}
          </h4>
          <p className="text-sm text-gray-400 mb-3">
            Enter your username to verify and link your {platforms.find(p => p.key === selectedPlatform)?.name} account.
          </p>
          <div className="flex gap-2">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter your username"
              className="flex-1 bg-gray-700 border-gray-600 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newUsername.trim()) {
                  handleConnect(selectedPlatform);
                }
              }}
            />
            <Button
              onClick={() => handleConnect(selectedPlatform)}
              disabled={connecting === selectedPlatform || !newUsername.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting === selectedPlatform ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPlatform(null);
                setNewUsername('');
              }}
              className="border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">Why link your platforms?</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Track your progress across all platforms in one place</li>
          <li>• Sync your solved problems automatically</li>
          <li>• Get detailed analytics and insights</li>
          <li>• Never lose track of your coding journey</li>
        </ul>
      </div>
    </div>
  );
}
