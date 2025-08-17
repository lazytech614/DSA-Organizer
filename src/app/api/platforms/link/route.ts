import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { PlatformService } from '@/lib/platformService';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const { platform, username } = await request.json();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ First, ensure the user exists in your database
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {}, // Don't update anything if user exists
      create: {
        clerkId: clerkUserId,
        // Add any other required fields with default values
      }
    });

    // Now use the database user ID instead of Clerk ID
    const userId = user.id;

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
          userId, // Use database user ID, not Clerk ID
          platform
        }
      },
      update: {
        username,
        stats: statsData,
        lastSync: new Date(),
        isActive: true
      },
      create: {
        userId, // Use database user ID, not Clerk ID
        platform,
        username,
        stats: statsData
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: userPlatform,
      message: `Successfully linked ${platform} account` 
    });

  } catch (error) {
    console.error('Platform linking error:', error);
    return NextResponse.json(
      { error: 'Failed to link platform' },
      { status: 500 }
    );
  }
}
