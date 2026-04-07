"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function checkUser() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("User not found");

    const existingUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (existingUser) return { success: true, user: existingUser };

    const dbUser = await db.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || null,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      },
    });

    return {
      success: true,
      user: dbUser,
    };

  } catch (error) {
    console.error("Error syncing user:", error);
    throw new Error("Failed to sync user");
  }
}

export async function getBookmarkedQuestions() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        bookmarkedQuestions: true,
      },
    });
    if (!user) throw new Error("User not found");

    return user.bookmarkedQuestions || [];
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw new Error("Failed to fetch bookmarks");
  }
}

export async function getUserInfo() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        courses: {
          where: { isDefault: false },
          select: {
            id: true,
            title: true,
            isDefault: true,
            questionCount: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        solvedQuestions: {
          select: {
            id: true,
            questionId: true,
            solvedAt: true,
          },
          orderBy: { solvedAt: "desc" },
        },
        linkedPlatforms: {
          where: { isActive: true },
          select: {
            id: true,
            platform: true,
            username: true,
            isActive: true,
            stats: true,
          },
        },
      },
    });
    if (!user) throw new Error("User not found");

    const subscriptionPlan = await db.subscriptionPlan.findUnique({
      where: { type: user.subscriptionType },
    });
    if (!subscriptionPlan) throw new Error("Subscription plan not found");

    const isPro =
      user.subscriptionType === "PRO" &&
      user.subscriptionStatus === "ACTIVE";

    const isSubscriptionActive = user.subscriptionStatus === "ACTIVE";

    const coursesUsed = user.courses.length;

    const coursesRemaining =
      subscriptionPlan.maxCourses === -1
        ? -1
        : Math.max(0, subscriptionPlan.maxCourses - coursesUsed);

    const canCreateCourse =
      subscriptionPlan.maxCourses === -1 ||
      coursesUsed < subscriptionPlan.maxCourses;

    const platformsLinked = user.linkedPlatforms.length;

    const platformsRemaining =
      subscriptionPlan.maxPlatforms === -1
        ? -1
        : Math.max(
            0,
            subscriptionPlan.maxPlatforms - platformsLinked
          );

    const canLinkPlatform =
      subscriptionPlan.maxPlatforms === -1 ||
      platformsLinked < subscriptionPlan.maxPlatforms;

    const calculateStreak = (solvedQuestions: typeof user.solvedQuestions) => {
      if (solvedQuestions.length === 0) return 0;

      const dates = solvedQuestions
        .map((sq) => new Date(sq.solvedAt).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort(
          (a, b) =>
            new Date(b).getTime() - new Date(a).getTime()
        );

      let streak = 0;

      for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);

        if (dates[i] === expectedDate.toDateString()) streak++;
        else break;
      }

      return streak;
    };

    return {
      id: user.id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,

      subscriptionType: user.subscriptionType,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStart:
        user.subscriptionStart?.toISOString() || null,
      subscriptionEnd:
        user.subscriptionEnd?.toISOString() || null,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,

      totalCoursesCreated: user.totalCoursesCreated,
      bookmarkedQuestions: user.bookmarkedQuestions,
      totalPlatformsLinked: user.totalPlatformsLinked,

      isPro,
      isSubscriptionActive,

      limits: {
        maxCourses: subscriptionPlan.maxCourses,
        maxQuestionsPerCourse:
          subscriptionPlan.maxQuestionsPerCourse,
        coursesUsed,
        coursesRemaining,
        canCreateCourse,
        maxPlatforms: subscriptionPlan.maxPlatforms,
        platformsLinked,
        platformsRemaining,
        canLinkPlatform,
      },

      courses: user.courses.map((course) => ({
        id: course.id,
        title: course.title,
        isDefault: course.isDefault,
        questionCount: course.questionCount,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      })),

      solvedQuestions: user.solvedQuestions.map((sq) => ({
        id: sq.id,
        questionId: sq.questionId,
        solvedAt: sq.solvedAt.toISOString(),
      })),

      platforms: user.linkedPlatforms.map((platform) => ({
        id: platform.id,
        platform: platform.platform,
        username: platform.username,
        isActive: platform.isActive,
        stats: platform.stats,
      })),

      stats: {
        totalQuestionsSolved: user.solvedQuestions.length,
        coursesCreated: user.courses.length,
        questionsBookmarked: user.bookmarkedQuestions.length,
        streakDays: calculateStreak(user.solvedQuestions),
      },
    };
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw new Error("Failed to fetch user information");
  }
}

export async function getSolvedQuestions(courseId?: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!user) throw new Error("User not found");

    const whereCondition: any = {
      userId: user.id,
    };

    if (courseId)
      whereCondition.question = {
        courses: {
          some: {
            id: courseId,
          },
        },
      };

    const solvedQuestions = await db.userQuestionSolved.findMany({
      where: whereCondition,
      include: {
        question: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            topics: true,
          },
        },
      },
      orderBy: {
        solvedAt: "desc",
      },
    });

    return solvedQuestions;
  } catch (error) {
    console.error("Error fetching solved questions:", error);
    throw new Error("Failed to fetch solved questions");
  }
}