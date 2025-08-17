import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Platform } from '@prisma/client';

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

    const { platform: rawPlatform } = await request.json();

    // ✅ Validate platform enum
    const platform = validatePlatform(rawPlatform);
    if (!platform) {
      return NextResponse.json(
        { error: 'Invalid platform' },
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

    // ✅ Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete the platform link
      await tx.userPlatform.delete({
        where: {
          userId_platform: {
            userId: user.id,
            platform
          }
        }
      });

      // ✅ Update platform count
      await tx.user.update({
        where: { id: user.id },
        data: {
          totalPlatformsLinked: {
            decrement: 1
          }
        }
      });

      // ✅ Log the unlink action
      await tx.platformSync.create({
        data: {
          userId: user.id,
          platform,
          status: 'SUCCESS',
          data: {
            action: 'unlink',
            timestamp: new Date().toISOString(),
            username: linkedPlatform.username,
            previousStats: linkedPlatform.stats
          }
        }
      });
    });

    console.log(`✅ Platform ${platform} unlinked and count decremented for user ${user.id}`);

    return NextResponse.json({ 
      success: true,
      message: `Successfully unlinked ${platform} account`,
      platformsRemaining: Math.max(0, user.totalPlatformsLinked - 1)
    });

  } catch (error: any) {
    console.error('Platform unlinking error:', error);
    return NextResponse.json(
      { error: 'Failed to unlink platform', details: error.message },
      { status: 500 }
    );
  }
}

// ✅ Alternative DELETE method for RESTful approach
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const url = new URL(request.url);
    const platformParam = url.searchParams.get('platform');
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const platform = validatePlatform(platformParam || '');
    if (!platform) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'Platform not linked' }, { status: 404 });
    }

    // Use same transaction logic as POST method
    await prisma.$transaction(async (tx) => {
      await tx.userPlatform.delete({
        where: {
          userId_platform: {
            userId: user.id,
            platform
          }
        }
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          totalPlatformsLinked: {
            decrement: 1
          }
        }
      });

      await tx.platformSync.create({
        data: {
          userId: user.id,
          platform,
          status: 'SUCCESS',
          data: {
            action: 'unlink_delete',
            timestamp: new Date().toISOString(),
            username: linkedPlatform.username
          }
        }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully unlinked ${platform} account`
    });

  } catch (error) {
    console.error('Platform DELETE error:', error);
    return NextResponse.json({ error: 'Failed to unlink platform' }, { status: 500 });
  }
}
