'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Zap, 
  ArrowRight,
  Star,
  Infinity
} from 'lucide-react';

interface PlatformLimitDialogProps {
  maxPlatforms: number;
  totalLinked: number;
  platformsRemaining: number;
  canLinkPlatform: boolean;
  subscriptionType: 'FREE' | 'PRO';
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PlatformLimitDialog({
  maxPlatforms,
  totalLinked,
  platformsRemaining,
  canLinkPlatform,
  subscriptionType,
  trigger,
  open,
  onOpenChange
}: PlatformLimitDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const isPro = subscriptionType === 'PRO';
  const usagePercentage = maxPlatforms === -1 ? 0 : (totalLinked / maxPlatforms) * 100;

  const getStatusColor = () => {
    if (isPro) return 'text-purple-400';
    if (!canLinkPlatform) return 'text-red-400';
    if (usagePercentage >= 80) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500';
    if (usagePercentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const DialogContent_Component = (
    <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
      <DialogHeader>
        <div className="flex items-center gap-2">
          {isPro ? (
            <Crown className="w-5 h-5 text-purple-400" />
          ) : (
            <Shield className="w-5 h-5 text-blue-400" />
          )}
          <DialogTitle className="text-white">
            Platform Integration Status
          </DialogTitle>
        </div>
        <DialogDescription className="text-gray-400">
          Manage your platform connections and subscription limits
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Current Status Card */}
        <Card className="bg-gray-700/50 border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Connected Platforms</span>
              <Badge 
                variant="outline" 
                className={`${getStatusColor()} border-current`}
              >
                {isPro ? (
                  <div className="flex items-center gap-1">
                    <Infinity className="w-3 h-3" />
                    <span>Unlimited</span>
                  </div>
                ) : (
                  `${totalLinked}/${maxPlatforms}`
                )}
              </Badge>
            </div>

            {!isPro && (
              <div className="space-y-2">
                <Progress 
                  value={usagePercentage} 
                  className="h-2"
                  style={{
                    '--progress-background': getProgressColor()
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{totalLinked} used</span>
                  <span>{platformsRemaining} remaining</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Messages */}
        <div className="space-y-3">
          {isPro ? (
            <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Crown className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-300">Pro User</p>
                <p className="text-xs text-purple-400">
                  You have unlimited platform integrations
                </p>
              </div>
              <CheckCircle className="w-4 h-4 text-purple-400 ml-auto" />
            </div>
          ) : canLinkPlatform ? (
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-300">
                  {platformsRemaining} platform{platformsRemaining !== 1 ? 's' : ''} remaining
                </p>
                <p className="text-xs text-green-400">
                  You can link {platformsRemaining} more platform{platformsRemaining !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-300">Limit Reached</p>
                <p className="text-xs text-red-400">
                  You've connected all {maxPlatforms} available platforms
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Section for Free Users */}
        {!isPro && (
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="font-medium text-white">Upgrade to Pro</h3>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Star className="w-3 h-3 text-purple-400" />
                  <span>Unlimited platform integrations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Star className="w-3 h-3 text-purple-400" />
                  <span>Advanced analytics & insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Star className="w-3 h-3 text-purple-400" />
                  <span>Priority support</span>
                </div>
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  // Navigate to upgrade page
                  window.open('/upgrade', '_blank');
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Platforms List */}
        {totalLinked > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Connected Platforms</h4>
            <div className="text-xs text-gray-400">
              {totalLinked} platform{totalLinked !== 1 ? 's' : ''} connected
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {DialogContent_Component}
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {DialogContent_Component}
    </Dialog>
  );
}
