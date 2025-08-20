import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { PlatformService } from '@/lib/platformService';
import { auth } from '@clerk/nextjs/server';
import { Prisma, Platform } from '@prisma/client';
import { checkSubscriptionLimit } from '@/lib/subscription';

function validatePlatform(platform: string): Platform | null {
  const platformMap: Record<string, Platform> = {
    'leetcode': Platform.LEETCODE,
    'codeforces': Platform.CODEFORCES,
    'geeksforgeeks': Platform.GEEKSFORGEEKS,
    'codechef': Platform.CODECHEF,
    'hackerrank': Platform.HACKERRANK,
    'atcoder': Platform.ATCODER,
  };
  return platformMap[platform?.toLowerCase()] || null;
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const { platform: rawPlatform, username } = await request.json();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Validate platform enum
    const platform = validatePlatform(rawPlatform);
    if (!platform || !username?.trim()) {
      return NextResponse.json(
        { error: 'Invalid platform or username' },
        { status: 400 }
      );
    }

    // ✅ First, ensure the user exists in your database
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {}, 
      create: {
        clerkId: clerkUserId,
        totalPlatformsLinked: 0 // ✅ Initialize platform count
      }
    });

    // ✅ Check if platform already exists (for updates vs new links)
    const existingPlatform = await prisma.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform
        }
      }
    });

    // ✅ Only check subscription limits for NEW platform links
    if (!existingPlatform) {
      const limitCheck = await checkSubscriptionLimit(user.id, 'LINK_PLATFORM');
      
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { 
            error: 'Platform limit reached',
            message: limitCheck.reason,
            upgradeRequired: true,
            currentCount: user.totalPlatformsLinked
          },
          { status: 403 }
        );
      }
    }

    // Verify username exists on platform
    const platformService = new PlatformService();
    const userData = await platformService.fetchUserData(platform.toLowerCase(), username);
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Username not found on this platform or platform not supported' },
        { status: 400 }
      );
    }

    // Ensure userData is compatible with Prisma JsonObject
    const statsData: Prisma.JsonObject = {
      ...userData,
      lastUpdated: new Date().toISOString(),
      platform: platform
    };

    // Link platform to user using the database user ID
    const userPlatform = await prisma.userPlatform.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform
        }
      },
      update: {
        username: username.trim(),
        stats: statsData,
        lastSync: new Date(),
        isActive: true
      },
      create: {
        userId: user.id,
        platform,
        username: username.trim(),
        stats: statsData,
        isActive: true
      }
    });

    // ✅ Update platform count ONLY for new platforms
    if (!existingPlatform) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPlatformsLinked: {
            increment: 1
          }
        }
      });

      console.log(`✅ Platform count incremented for user ${user.id}`);
    }

    // ✅ Log the linking action
    await prisma.platformSync.create({
      data: {
        userId: user.id,
        platform,
        status: 'SUCCESS',
        data: {
          action: existingPlatform ? 'update' : 'link',
          timestamp: new Date().toISOString(),
          username: username.trim(),
          statsPreview: {
            totalSolved: userData.totalSolved || 0,
            platform: platform
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: userPlatform,
      message: `Successfully ${existingPlatform ? 'updated' : 'linked'} ${platform} account`,
      isNewLink: !existingPlatform
    });

  } catch (error: any) {
    console.error('Platform linking error:', error);
    return NextResponse.json(
      { error: 'Failed to link platform', details: error.message },
      { status: 500 }
    );
  }
}
