"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Difficulty } from "@prisma/client";

export async function getQuestions() {
  try {
    const questions = await db.question.findMany({
      include: {
        courses: true,
      },
    });

    return questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions");
  }
}

export async function createQuestion(data: {
  title: string;
  topics: string[];
  urls: string[];
  difficulty: Difficulty;
  courseId: string;
}) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!prismaUser) throw new Error("User not found");

    const { title, topics, urls, difficulty, courseId } = data;

    if (!title || !topics || !urls || !difficulty || !courseId)
      throw new Error("Missing required fields");

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        userId: prismaUser.id,
        isDefault: false,
      },
    });
    if (!course)
      throw new Error(
        "Course not found or cannot add to default course"
      );

    const question = await db.question.create({
      data: {
        title,
        topics,
        urls,
        difficulty,
        courses: {
          connect: { id: courseId },
        },
      },
      include: {
        courses: true,
      },
    });

    return question;
  } catch (error) {
    console.error("Error creating question:", error);
    throw new Error("Failed to create question");
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!user) throw new Error("User not found");

    const question = await db.question.findUnique({
      where: { id: questionId },
      include: {
        courses: {
          where: { userId: user.id },
          select: { id: true, title: true, isDefault: true },
        },
      },
    });
    if (!question) throw new Error("Question not found");

    const userOwnedCourses = question.courses.filter(
      (course) => !course.isDefault
    );
    if (userOwnedCourses.length === 0)
      throw new Error("You can only delete questions from your own courses");

    const result = await db.$transaction(async (tx) => {
      for (const course of userOwnedCourses) {
        await tx.course.update({
          where: { id: course.id },
          data: {
            questions: {
              disconnect: { id: questionId },
            },
            questionCount: { decrement: 1 },
          },
        });
      }

      const remainingCourses = await tx.course.findMany({
        where: {
          questions: {
            some: { id: questionId },
          },
        },
      });

      let deletedQuestion: any = null;

      if (remainingCourses.length === 0) {
        deletedQuestion = await tx.question.delete({
          where: { id: questionId },
        });
      } else {
        deletedQuestion = {
          id: questionId,
          title: question.title,
        };
      }

      await tx.userQuestionSolved.deleteMany({
        where: {
          userId: user.id,
          questionId,
        },
      });

      if (user.bookmarkedQuestions.includes(questionId)) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            bookmarkedQuestions: user.bookmarkedQuestions.filter(
              (id) => id !== questionId
            ),
          },
        });
      }

      return deletedQuestion;
    });

    return {
      message: "Question deleted successfully",
      deletedQuestion: {
        id: result.id,
        title: result.title || question.title,
      },
      removedFromCourses: userOwnedCourses.length,
    };
  } catch (error) {
    console.error("Error deleting question:", error);
    throw new Error("Failed to delete question");
  }
}

export async function markQuestionSolved(questionId: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!prismaUser) throw new Error("User not found");

    const question = await db.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new Error("Question not found");

    const solvedQuestion = await db.userQuestionSolved.upsert({
      where: {
        userId_questionId: {
          userId: prismaUser.id,
          questionId,
        },
      },
      update: {
        solvedAt: new Date(),
      },
      create: {
        userId: prismaUser.id,
        questionId,
      },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    return solvedQuestion;
  } catch (error) {
    console.error("Error marking question as solved:", error);
    throw new Error("Failed to mark question as solved");
  }
}

export async function unmarkQuestionSolved(questionId: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!prismaUser) throw new Error("User not found");

    await db.userQuestionSolved.delete({
      where: {
        userId_questionId: {
          userId: prismaUser.id,
          questionId,
        },
      },
    });

    return { message: "Question unmarked as solved" };
  } catch (error: any) {
    if (error.code === "P2025")
      return { message: "Question was not marked as solved" };

    console.error("Error unmarking question:", error);
    throw new Error("Failed to unmark question");
  }
}

export async function bookmarkQuestion(questionId: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!prismaUser) throw new Error("User not found");

    const question = await db.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new Error("Question not found");

    const isAlreadyBookmarked =
      prismaUser.bookmarkedQuestions.includes(questionId);

    if (isAlreadyBookmarked)
      return {
        success: true,
        message: "Question already bookmarked",
        bookmarkedQuestions: prismaUser.bookmarkedQuestions,
      };

    const updatedUser = await db.user.update({
      where: { id: prismaUser.id },
      data: {
        bookmarkedQuestions: {
          push: questionId,
        },
      },
      select: {
        bookmarkedQuestions: true,
      },
    });

    return {
      success: true,
      message: "Question bookmarked successfully",
      bookmarkedQuestions: updatedUser.bookmarkedQuestions,
    };
  } catch (error) {
    console.error("Error bookmarking question:", error);
    throw new Error("Failed to bookmark question");
  }
}

export async function removeBookmark(questionId: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const prismaUser = await db.user.findUnique({
      where: { clerkId: clerkUserId },
    });
    if (!prismaUser) throw new Error("User not found");

    const updatedUser = await db.user.update({
      where: { id: prismaUser.id },
      data: {
        bookmarkedQuestions: prismaUser.bookmarkedQuestions.filter(
          (id) => id !== questionId
        ),
      },
      select: {
        bookmarkedQuestions: true,
      },
    });

    return {
      success: false,
      message: "Bookmark removed successfully",
      bookmarkedQuestions: updatedUser.bookmarkedQuestions,
    };
  } catch (error) {
    console.error("Error removing bookmark:", error);
    throw new Error("Failed to remove bookmark");
  }
}