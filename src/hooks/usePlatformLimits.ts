import { useState, useEffect } from 'react';

interface PlatformLimits {
  maxPlatforms: number;
  platformsRemaining: number;
  canLinkPlatform: boolean;
  totalLinked: number;
  subscriptionType: 'FREE' | 'PRO';
}

export function usePlatformLimits() {
  const [limits, setLimits] = useState<PlatformLimits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/subscription/limits');
      const data = await response.json();
      
      if (data.success) {
        setLimits({
          maxPlatforms: data.data.maxPlatforms,
          platformsRemaining: data.data.platformsRemaining,
          canLinkPlatform: data.data.canLinkPlatform,
          totalLinked: data.user.totalPlatformsLinked,
          subscriptionType: data.user.subscriptionType
        });
      }
    } catch (error) {
      console.error('Failed to fetch platform limits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  return { limits, loading, refetchLimits: fetchLimits };
}
