import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { PlatformService } from '@/lib/platformService';
import { auth } from '@clerk/nextjs/server';
import { Prisma, Platform } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth(); // ✅ This is the Clerk user ID
    const { platform } = await request.json();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ First, get the database user record using Clerk ID
    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUserId
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ✅ Now find the platform using the database user ID
    const userPlatform = await prisma.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId: user.id, // ✅ Use database user ID, not Clerk ID
          platform: platform.toUpperCase() as Platform // ✅ Ensure correct enum format
        }
      }
    });

    if (!userPlatform) {
      return NextResponse.json(
        { error: `Platform ${platform} not linked for this user` },
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
      console.log("🥳🥳freshData:", freshData);
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
          userId: user.id, // ✅ Use database user ID
          platform: platform.toUpperCase() as Platform,
          status: 'SUCCESS',
          data: syncData
        }
      });

      console.log("😒😒syncData:", syncData);
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
          userId: user.id, // ✅ Use database user ID
          platform: platform.toUpperCase() as Platform,
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
      const { userId: clerkUserId } = await auth();
      const body = await request.json();
      
      if (clerkUserId) {
        const user = await prisma.user.findUnique({
          where: { clerkId: clerkUserId }
        });

        if (user) {
          const errorLogData: Prisma.JsonObject = {
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
            timestamp: new Date().toISOString(),
            stack: error instanceof Error ? error.stack : null
          };

          await prisma.platformSync.create({
            data: {
              userId: user.id, // ✅ Use database user ID
              platform: (body.platform?.toUpperCase() || 'UNKNOWN') as Platform,
              status: 'FAILED',
              errorMsg: error instanceof Error ? error.message : 'Unknown error',
              data: errorLogData
            }
          });
        }
      }
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }

    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
