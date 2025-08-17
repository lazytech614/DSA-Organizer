// components/platform-integration/PlatformLinker.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlatform, Platform } from '@prisma/client';
import { toast } from 'sonner';
import { Trash2, Link2, ExternalLink, RefreshCw, Crown, Shield, AlertTriangle, Info } from 'lucide-react';

interface PlatformLinkerProps {
  userId: string;
  linkedPlatforms: UserPlatform[];
  onLimitCheck?: () => boolean;
}

export function PlatformLinker({ userId, linkedPlatforms, onLimitCheck }: PlatformLinkerProps) {
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

  // ✅ Check if platform is already linked
  const isPlatformLinked = (platform: Platform) => {
    return linkedPlatforms.some(lp => lp.platform === platform);
  };

  // ✅ Handle platform connection with limit checking
  const handleConnectClick = (platform: Platform) => {
    // If platform is already linked, just show the connection form
    if (isPlatformLinked(platform)) {
      setSelectedPlatform(platform);
      return;
    }

    // ✅ Check limits for new connections
    if (onLimitCheck && !onLimitCheck()) {
      // Limit dialog will be shown by parent component
      return;
    }

    setSelectedPlatform(platform);
  };

  const handleConnect = async (platform: Platform) => {
    if (!newUsername.trim()) {
      toast.error('Please enter your username');
      return;
    }

    // ✅ Double-check limits before API call for new connections
    if (!isPlatformLinked(platform) && onLimitCheck && !onLimitCheck()) {
      return;
    }

    setConnecting(platform);

    try {
      // Link the platform (API will handle verification)
      const response = await fetch('/api/platforms/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          username: newUsername.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ Handle specific limit errors
        if (response.status === 403 && data.upgradeRequired) {
          toast.error(data.message || 'Platform limit reached');
          return;
        }
        throw new Error(data.error || 'Failed to link platform');
      }

      const isUpdate = data.isNewLink === false;
      toast.success(
        isUpdate 
          ? `Successfully updated ${platform} connection!`
          : `Successfully linked ${platform}!`
      );
      
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Link Your Coding Platforms</h3>
        
        {/* ✅ Platform limit info */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Info className="w-4 h-4" />
          <span>{linkedPlatforms.length} platform{linkedPlatforms.length !== 1 ? 's' : ''} connected</span>
        </div>
      </div>
      
      {/* Linked Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map(platform => {
          const linked = linkedPlatforms.find(lp => lp.platform === platform.key);
          
          return (
            <div key={platform.key} className={`border rounded-lg p-4 transition-colors ${
              linked 
                ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10' 
                : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
            }`}>
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
                        <Shield className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                      
                      {/* Update Connection Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPlatform(platform.key);
                          setNewUsername(linked.username);
                        }}
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 text-xs"
                        disabled={connecting === platform.key}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Update
                      </Button>
                      
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
                      onClick={() => handleConnectClick(platform.key)}
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
                  
                  {/* Show stats preview if available */}
                  {linked.stats && (
                    <div className="mt-2 flex gap-3 text-xs">
                      {(linked.stats as any)?.totalSolved && (
                        <span className="text-green-400">
                          Solved: {(linked.stats as any).totalSolved}
                        </span>
                      )}
                      {(linked.stats as any)?.rating && (
                        <span className="text-yellow-400">
                          Rating: {(linked.stats as any).rating}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connection Dialog */}
      {selectedPlatform && (
        <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/10">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-medium text-white">
              {isPlatformLinked(selectedPlatform) ? 'Update' : 'Connect'} {platforms.find(p => p.key === selectedPlatform)?.name}
            </h4>
            {isPlatformLinked(selectedPlatform) && (
              <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Update Mode
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-400 mb-3">
            {isPlatformLinked(selectedPlatform) 
              ? `Update your ${platforms.find(p => p.key === selectedPlatform)?.name} username.`
              : `Enter your username to verify and link your ${platforms.find(p => p.key === selectedPlatform)?.name} account.`
            }
          </p>
          
          <div className="flex gap-2">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={isPlatformLinked(selectedPlatform) ? "Enter new username" : "Enter your username"}
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
                  {isPlatformLinked(selectedPlatform) ? 'Updating...' : 'Verifying...'}
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  {isPlatformLinked(selectedPlatform) ? 'Update' : 'Connect'}
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

      {/* Info section with enhanced content */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-white">Why link your platforms?</h4>
          <Crown className="w-5 h-5 text-purple-400" />
        </div>
        
        <ul className="text-sm text-gray-400 space-y-1 mb-4">
          <li>• Track your progress across all platforms in one place</li>
          <li>• Sync your solved problems automatically</li>
          <li>• Get detailed analytics and insights</li>
          <li>• Never lose track of your coding journey</li>
          <li>• Compare your performance across different platforms</li>
        </ul>

        {/* ✅ Platform limit information */}
        <div className="pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>
              Platform connections are subject to your subscription plan limits. 
              Pro users get unlimited platform integrations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
