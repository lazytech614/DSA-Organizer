import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { PlatformService } from '@/lib/platformService';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { platform } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userPlatform = await prisma.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId,
          platform
        }
      }
    });

    if (!userPlatform) {
      return NextResponse.json(
        { error: 'Platform not linked' },
        { status: 404 }
      );
    }

    // Fetch fresh data
    const platformService = new PlatformService();
    const freshData = await platformService.fetchUserData(
      platform.toLowerCase(), 
      userPlatform.username
    );

    if (freshData) {
      // Ensure freshData is compatible with Prisma JsonObject
      const syncData: Prisma.JsonObject = {
        ...freshData,
        syncedAt: new Date().toISOString(),
        previousSync: userPlatform.lastSync.toISOString(),
        syncType: 'manual'
      };

      // Update database
      await prisma.userPlatform.update({
        where: { id: userPlatform.id },
        data: {
          stats: syncData,
          lastSync: new Date()
        }
      });

      // Log successful sync
      await prisma.platformSync.create({
        data: {
          userId,
          platform,
          status: 'SUCCESS',
          data: syncData
        }
      });

      return NextResponse.json({ 
        success: true, 
        data: syncData,
        message: `Successfully synced ${platform} data` 
      });
    } else {
      // Create error log data
      const errorData: Prisma.JsonObject = {
        error: 'No data returned from platform',
        attemptedAt: new Date().toISOString(),
        platform: platform,
        username: userPlatform.username
      };

      // Log failed sync
      await prisma.platformSync.create({
        data: {
          userId,
          platform,
          status: 'FAILED',
          errorMsg: 'No data returned from platform',
          data: errorData
        }
      });

      return NextResponse.json(
        { error: 'Failed to fetch fresh data from platform' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Platform sync error:', error);

    // Log failed sync
    try {
      // Get userId and platform from the original request or auth
      const { userId: requestUserId } = await auth();
      const body = await request.json();
      
      const errorLogData: Prisma.JsonObject = {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : null
      };

      await prisma.platformSync.create({
        data: {
          userId: requestUserId || body.userId || 'unknown',
          platform: body.platform || 'UNKNOWN',
          status: 'FAILED',
          errorMsg: error instanceof Error ? error.message : 'Unknown error',
          data: errorLogData
        }
      });
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }

    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}