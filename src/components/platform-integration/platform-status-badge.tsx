'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Shield, Info, AlertTriangle } from 'lucide-react';
import { PlatformLimitDialog } from './platform-limit-dialog';
import { usePlatformLimits } from '@/hooks/usePlatformLimits';

export function PlatformStatusBadge() {
  const { limits, loading } = usePlatformLimits();

  if (loading || !limits) {
    return (
      <Badge variant="outline" className="text-gray-400">
        <Shield className="w-3 h-3 mr-1" />
        Loading...
      </Badge>
    );
  }

  const { maxPlatforms, totalLinked, platformsRemaining, canLinkPlatform, subscriptionType } = limits;
  const isPro = subscriptionType === 'PRO';

  const getBadgeVariant = () => {
    if (isPro) return 'default';
    if (!canLinkPlatform) return 'destructive';
    if (platformsRemaining <= 1) return 'secondary';
    return 'outline';
  };

  const getBadgeContent = () => {
    if (isPro) {
      return (
        <div className="flex items-center gap-1">
          <Crown className="w-3 h-3" />
          <span>Pro • Unlimited</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {!canLinkPlatform ? (
          <AlertTriangle className="w-3 h-3" />
        ) : (
          <Shield className="w-3 h-3" />
        )}
        <span>{totalLinked}/{maxPlatforms}</span>
      </div>
    );
  };

  return (
    <PlatformLimitDialog
      maxPlatforms={maxPlatforms}
      totalLinked={totalLinked}
      platformsRemaining={platformsRemaining}
      canLinkPlatform={canLinkPlatform}
      subscriptionType={subscriptionType}
      trigger={
        <Button variant="ghost" size="sm" className="h-6 px-2">
          <Badge variant={getBadgeVariant()} className="cursor-pointer">
            {getBadgeContent()}
            <Info className="w-3 h-3 ml-1" />
          </Badge>
        </Button>
      }
    />
  );
}
