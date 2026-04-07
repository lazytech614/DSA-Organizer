"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { PlatformService } from "@/lib/services/platform/platformService";
import { Prisma, Platform } from "@prisma/client";
import { checkSubscriptionLimit } from "@/lib/subscription";

function validatePlatform(platform: string): Platform | null {
  const platformMap: Record<string, Platform> = {
    leetcode: Platform.LEETCODE,
    codeforces: Platform.CODEFORCES,
    geeksforgeeks: Platform.GEEKSFORGEEKS,
    codechef: Platform.CODECHEF,
    hackerrank: Platform.HACKERRANK,
    atcoder: Platform.ATCODER,
  };
  return platformMap[platform?.toLowerCase()] || null;
}

export async function linkPlatform(data: {
  platform: string;
  username: string;
}) {
  try {
    const { platform: rawPlatform, username } = data;

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const platform = validatePlatform(rawPlatform);
    if (!platform || !username?.trim())
      throw new Error("Invalid platform or username");

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!user)
      throw new Error("User not found. Please complete onboarding first.");

    const existingPlatform = await db.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform,
        },
      },
    });

    // Subscription check only for NEW links
    if (!existingPlatform) {
      const limitCheck = await checkSubscriptionLimit(
        user.id,
        "LINK_PLATFORM"
      );

      if (!limitCheck.allowed)
        throw new Error(limitCheck.reason || "Platform limit reached");
    }

    const platformService = new PlatformService();
    const userData = await platformService.fetchUserData(
      platform.toLowerCase(),
      username
    );

    if (!userData)
      throw new Error(
        "Username not found on this platform or platform not supported"
      );

    const statsData: Prisma.JsonObject = {
      ...userData,
      lastUpdated: new Date().toISOString(),
      platform,
    };

    const result = await db.$transaction(async (tx) => {
      // 🔗 Upsert platform
      const userPlatform = await tx.userPlatform.upsert({
        where: {
          userId_platform: {
            userId: user.id,
            platform,
          },
        },
        update: {
          username: username.trim(),
          stats: statsData,
          lastSync: new Date(),
          isActive: true,
        },
        create: {
          userId: user.id,
          platform,
          username: username.trim(),
          stats: statsData,
          isActive: true,
        },
      });

      if (!existingPlatform) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            totalPlatformsLinked: { increment: 1 },
          },
        });
      }

      await tx.platformSync.create({
        data: {
          userId: user.id,
          platform,
          status: "SUCCESS",
          data: {
            action: existingPlatform ? "update" : "link",
            timestamp: new Date().toISOString(),
            username: username.trim(),
            statsPreview: {
              totalSolved: userData.totalSolved || 0,
              platform,
            },
          },
        },
      });

      return userPlatform;
    });

    return {
      success: true,
      data: result,
      message: `Successfully ${
        existingPlatform ? "updated" : "linked"
      } ${platform} account`,
      isNewLink: !existingPlatform,
    };

  } catch (error) {
    console.error("Platform linking error:", error);
    throw new Error("Failed to link platform");
  }
}

export async function syncPlatform(data: { platform: string }) {
  try {
    const { platform } = data;

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!user) throw new Error("User not found");

    const userPlatform = await db.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform: platform.toUpperCase() as Platform,
        },
      },
    });
    if (!userPlatform)
      throw new Error(`Platform ${platform} not linked for this user`);

    const platformService = new PlatformService();
    const freshData = await platformService.fetchUserData(
      platform.toLowerCase(),
      userPlatform.username
    );

    if (freshData) {
      const syncData: Prisma.JsonObject = {
        ...freshData,
        syncedAt: new Date().toISOString(),
        previousSync: userPlatform.lastSync.toISOString(),
        syncType: "manual",
      };

      const result = await db.$transaction(async (tx) => {
        await tx.userPlatform.update({
          where: { id: userPlatform.id },
          data: {
            stats: syncData,
            lastSync: new Date(),
          },
        });

        await tx.platformSync.create({
          data: {
            userId: user.id,
            platform: platform.toUpperCase() as Platform,
            status: "SUCCESS",
            data: syncData,
          },
        });

        return syncData;
      });

      return {
        success: true,
        data: result,
        message: `Successfully synced ${platform} data`,
      };
    } else {
      const errorData: Prisma.JsonObject = {
        error: "No data returned from platform",
        attemptedAt: new Date().toISOString(),
        platform,
        username: userPlatform.username,
      };

      await db.platformSync.create({
        data: {
          userId: user.id,
          platform: platform.toUpperCase() as Platform,
          status: "FAILED",
          errorMsg: "No data returned from platform",
          data: errorData,
        },
      });

      throw new Error("Failed to fetch fresh data from platform");
    }
  } catch (error) {
    console.error("Platform sync error:", error);
    throw new Error("Sync failed");
  }
}

export async function unlinkPlatform(data: { platform: string }) {
  try {
    const { platform: rawPlatform } = data;

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!user) throw new Error("User not found");

    const platform = validatePlatform(rawPlatform);
    if (!platform) throw new Error("Invalid platform");

    const linkedPlatform = await db.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform,
        },
      },
    });
    if (!linkedPlatform) throw new Error("Platform not linked");

    await db.$transaction(async (tx) => {
      await tx.userPlatform.delete({
        where: {
          userId_platform: {
            userId: user.id,
            platform,
          },
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          totalPlatformsLinked: { decrement: 1 },
        },
      });

      await tx.platformSync.create({
        data: {
          userId: user.id,
          platform,
          status: "SUCCESS",
          data: {
            action: "unlink",
            timestamp: new Date().toISOString(),
            username: linkedPlatform.username,
            previousStats: linkedPlatform.stats,
          },
        },
      });

      return true;
    });

    return {
      success: true,
      message: `Successfully unlinked ${platform} account`,
      platformsRemaining: Math.max(0, user.totalPlatformsLinked - 1),
    };
  } catch (error) {
    console.error("Platform unlinking error:", error);
    throw new Error("Failed to unlink platform");
  }
}

export async function verifyPlatform(data: {
  platform: string;
  username: string;
}) {
  try {
    const { platform, username } = data;

    if (!platform || !username)
      throw new Error("Platform and username are required");

    const platformService = new PlatformService();
    const userData = await platformService.fetchUserData(
      platform.toLowerCase(),
      username
    );

    if (!userData)
      throw new Error("Username not found on this platform");

    return {
      success: true,
      verified: true,
      data: userData,
    };
  } catch (error) {
    console.error("Platform verification error:", error);
    throw new Error("Failed to verify username");
  }
}