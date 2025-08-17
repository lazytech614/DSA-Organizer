import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { PlatformDashboard } from './platformDashboard';

async function getOrCreateUser(clerkId: string) {
  return await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId }
  });
}

async function getUserPlatforms(userId: string) {
  return await prisma.userPlatform.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: {
      lastSync: 'desc'
    }
  });
}

async function getUserStats(userId: string) {
  const platforms = await getUserPlatforms(userId);
  
  let totalStats = {
    connectedPlatforms: platforms.length,
    totalSolved: 0,
    averageRating: 0,
    lastSyncTime: null as Date | null
  };

  platforms.forEach(platform => {
    if (platform.stats && typeof platform.stats === 'object') {
      const stats = platform.stats as any;
      
      if (stats.totalSolved) {
        totalStats.totalSolved += stats.totalSolved;
      }
      
      if (!totalStats.lastSyncTime || platform.lastSync > totalStats.lastSyncTime) {
        totalStats.lastSyncTime = platform.lastSync;
      }
    }
  });

  return { platforms, totalStats };
}

export default async function PlatformsPage() {
  const { userId: clerkUserId } = await auth();
  
  if (!clerkUserId) {
    redirect('/sign-in');
  }

  const user = await getOrCreateUser(clerkUserId);
  const { platforms, totalStats } = await getUserStats(user.id);

  return <PlatformDashboard userId={user.id} platforms={platforms} totalStats={totalStats} />;
}