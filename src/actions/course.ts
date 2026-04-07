"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { withSubscriptionLimit2 } from "@/lib/middleware/subscription";
import { checkSubscriptionLimit } from "@/lib/subscription";

export async function getCoursesWithProgress() {
  try {
    const { userId: clerkUserId } = await auth();

    // If NOT logged in → return default courses with isSolved = false
    if (!clerkUserId) {
      const defaultCourses = await db.course.findMany({
        where: { isDefault: true },
        include: {
          questions: true,
          user: true,
        },
      });

      return defaultCourses.map((course) => ({
        ...course,
        questions: course.questions.map((question) => ({
          ...question,
          isSolved: false,
        })),
      }));
    }

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    // If user not in DB → behave like guest
    if (!user) {
      const defaultCourses = await db.course.findMany({
        where: { isDefault: true },
        include: {
          questions: true,
          user: true,
        },
      });

      return defaultCourses.map((course) => ({
        ...course,
        questions: course.questions.map((question) => ({
          ...question,
          isSolved: false,
        })),
      }));
    }

    // Fetch courses (default + user courses)
    const courses = await db.course.findMany({
      where: {
        OR: [{ isDefault: true }, { userId: user.id }],
      },
      include: {
        questions: true,
        user: true,
      },
    });

    // Get solved questions
    const solvedQuestions = await db.userQuestionSolved.findMany({
      where: {
        userId: user.id,
      },
      select: {
        questionId: true,
      },
    });

    const solvedQuestionIds = new Set(
      solvedQuestions.map((sq) => sq.questionId)
    );

    // Attach isSolved
    return courses.map((course) => ({
      ...course,
      questions: course.questions.map((question) => ({
        ...question,
        isSolved: solvedQuestionIds.has(question.id),
      })),
    }));

  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error("Failed to fetch courses");
  }
}

export async function createUserCourse(title: string) {
  await withSubscriptionLimit2("CREATE_COURSE");

  try {
    const user = await currentUser();
    if (!user) throw new Error("User not found");

    const limitCheck = await checkSubscriptionLimit(user.id, "CREATE_COURSE");
    if(!limitCheck.allowed) throw new Error("Subscription limit reached");

    // 🔄 Upsert user
    const dbUser = await db.user.upsert({
      where: { clerkId: user.id },
      update: {
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      create: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
    });

    // ⚠️ Validation
    if (!title?.trim()) throw new Error("Course title is required");

    // 🏗️ Create course
    const course = await db.course.create({
      data: {
        title: title.trim(),
        userId: dbUser.id,
        isDefault: false,
      },
    });

    // 📊 Increment course count
    await db.user.update({
      where: { id: dbUser.id },
      data: {
        totalCoursesCreated: { increment: 1 },
      },
    });

    return { success: true, data: course };

  } catch (error) {
    console.error("Error creating course:", error);
    throw new Error("Failed to create course");
  }
}

export async function deleteUserCourse(courseId: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!user) throw new Error("User not found");

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        questions: {
          select: { id: true },
        },
      },
    });
    if (!course) throw new Error("Course not found");

    if (course.isDefault) throw new Error("Cannot delete default courses");

    if (course.userId !== user.id)
      throw new Error("You can only delete your own courses");

    const deletedCourse = await db.course.delete({
      where: { id: courseId },
    });

    await db.user.update({
      where: { id: user.id },
      data: {
        totalCoursesCreated: { decrement: 1 },
      },
    });

    return {
      success: true,
      message: "Course deleted successfully",
      deletedCourse: {
        id: deletedCourse.id,
        title: deletedCourse.title,
      },
      questionsDeleted: course.questions.length,
    };

  } catch (error) {
    console.error("Error deleting course:", error);
    throw new Error("Failed to delete course");
  }
}