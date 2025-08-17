// app/api/platforms/unlink/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the database user
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { platform } = await request.json();

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    // Check if platform is linked
    const linkedPlatform = await prisma.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform
        }
      }
    });

    if (!linkedPlatform) {
      return NextResponse.json(
        { error: 'Platform not linked' },
        { status: 404 }
      );
    }

    // Delete the platform link
    await prisma.userPlatform.delete({
      where: {
        userId_platform: {
          userId: user.id,
          platform
        }
      }
    });

    // Optionally, log the unlink action
    await prisma.platformSync.create({
      data: {
        userId: user.id,
        platform,
        status: 'SUCCESS',
        data: {
          action: 'unlink',
          timestamp: new Date().toISOString(),
          username: linkedPlatform.username
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully unlinked ${platform} account` 
    });

  } catch (error) {
    console.error('Platform unlinking error:', error);
    return NextResponse.json(
      { error: 'Failed to unlink platform' },
      { status: 500 }
    );
  }
}
