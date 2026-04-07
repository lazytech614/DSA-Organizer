"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

export async function isAdmin(userId: string) {
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                email: true
            }
        })
        if(!user) throw new Error("User not found");
        if(!user.email) throw new Error("User email not found");

        const adminEmailsStr = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
        if(!adminEmailsStr) throw new Error("ADMIN_EMAILS environment variable is not set");

        const adminEmails = adminEmailsStr
                                .split(',')
                                .map(email => email.trim())
                                .filter(email => email.length > 0);

        return adminEmails.includes(user.email);
    }catch(err) {
        console.error("Error checking admin status:", err);
        throw new Error("Failed to check admin status");
    }
}

export async function createDefaultCourse(title: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const admin = await isAdmin(userId);
    if (!admin) throw new Error("Forbidden");

    if (!title?.trim()) throw new Error("Course title is required");

    const cleanTitle = title.trim();

    const existingCourse = await db.course.findFirst({
      where: {
        title: cleanTitle,
        isDefault: true,
      },
    });

    if (existingCourse) throw new Error("Course with the same title already exists");

    const course = await db.course.create({
      data: {
        title: cleanTitle,
        isDefault: true,
        userId: null,
      },
      include: {
        questions: true,
        _count: {
          select: { questions: true },
        },
      },
    });

    return { success: true, data: course };
  } catch (error) {
    console.error("Error creating admin course:", error);
    throw new Error("Failed to create admin course");
  }
}

export async function deleteDefaultCourse(courseId: string) {
    try {
        if(!courseId) throw new Error("Missing required fields");

        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const admin = await isAdmin(userId);
        if(!admin) throw new Error("Forbidden");

        const course = await db.course.findUnique({
            where: {
                id: courseId
            },
            select: {
                isDefault: true
            }
        })
        if(!course) throw new Error("Course not found");
        if(!course.isDefault) throw new Error("Not a default course");

        await db.course.delete({
            where: {
                id: courseId
            }
        })

        return {success: true, data: course};
    }catch(err) {
        console.error("Error deleting admin course:", err);
        throw new Error("Failed to delete admin course");
    }
}

export async function getAdminCourses(courseId?: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const admin = await isAdmin(userId);
    if (!admin) throw new Error("Forbidden");

    if (courseId) {
      const course = await db.course.findFirst({
        where: {
          id: courseId,
          isDefault: true,
        },
        include: {
          questions: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!course) throw new Error("Course not found");

      return {
        success: true,
        course,
        questionsCount: course.questions.length,
      };
    }

    const defaultCourses = await db.course.findMany({
      where: { isDefault: true },
      include: {
        questions: {
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      success: true,
      courses: defaultCourses,
      totalCourses: defaultCourses.length,
      totalQuestions: defaultCourses.reduce(
        (sum, course) => sum + course.questions.length,
        0
      ),
    };

  } catch (error) {
    console.error("Error fetching admin data:", error);
    throw new Error("Failed to fetch admin data");
  }
}

export async function createAdminQuestion(data: {
  title: string;
  topics: string[];
  urls: string[];
  difficulty: Difficulty;
  courseId: string;
}) {
  try {
    const { title, topics, urls, difficulty, courseId } = data;

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const admin = await isAdmin(userId);
    if (!admin) throw new Error("Forbidden");

    if (!title || !topics || !urls || !difficulty || !courseId) throw new Error("Missing required fields");

    if (!Array.isArray(topics) || !Array.isArray(urls)) throw new Error("Topics and URLs must be arrays");

    const validDifficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
    if (!validDifficulties.includes(difficulty)) throw new Error("Invalid difficulty");

    const cleanTitle = title.trim();

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        isDefault: true,
      },
    });

    if (!course) throw new Error("Course not found");

    const existingQuestion = await db.question.findFirst({
      where: {
        title: cleanTitle,
        courses: {
          some: {
            id: courseId,
          },
        },
      },
    });

    if (existingQuestion) throw new Error("Question with the same title already exists in this course");

    const question = await db.question.create({
      data: {
        title: cleanTitle,
        topics,
        urls: urls.filter((url) => url.trim()),
        difficulty,
        courses: {
          connect: { id: courseId },
        },
      },
      include: {
        courses: true,
      },
    });

    return { success: true, data: question };

  } catch (error) {
    console.error("Error creating admin question:", error);
    throw new Error("Failed to create admin question");
  }
}

export async function deleteAdminQuestion(data: {
  questionId: string;
  courseId: string;
}) {
  try {
    const { questionId, courseId } = data;

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const admin = await isAdmin(userId);
    if (!admin) throw new Error("Forbidden");

    if (!questionId || !courseId) throw new Error("Missing required fields");

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        isDefault: true,
      },
    });

    if (!course) throw new Error("Course not found");

    const question = await db.question.findFirst({
      where: {
        id: questionId,
        courses: {
          some: {
            id: courseId,
          },
        },
      },
      include: {
        courses: true,
      },
    });

    if (!question) throw new Error("Question not found in this course");

    // DELETE V/S DISCONNECT LOGIC
    if (question.courses.length === 1) {
      // Only belongs to this course → delete completely
      await db.question.delete({
        where: { id: questionId },
      });
    } else {
      // Belongs to multiple courses → just disconnect
      await db.question.update({
        where: { id: questionId },
        data: {
          courses: {
            disconnect: { id: courseId },
          },
        },
      });
    }

    return { success: true };

  } catch (error) {
    console.error("Error deleting admin question:", error);
    throw new Error("Failed to delete question");
  }
}

export async function updateAdminQuestion(data: {
  questionId: string;
  title?: string;
  topics?: string[];
  urls?: string[];
  difficulty?: Difficulty;
  courseId: string;
}) {
  try {
    const { questionId, title, topics, urls, difficulty, courseId } = data;

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized - Authentication required");

    if (!(await isAdmin(userId))) throw new Error("Forbidden - Admin access required");

    if (!questionId || !courseId) throw new Error("Question ID and Course ID are required");

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        isDefault: true,
      },
    });

    if (!course) throw new Error("Default course not found");

    const existingQuestion = await db.question.findFirst({
      where: {
        id: questionId,
        courses: {
          some: { id: courseId },
        },
      },
    });

    if (!existingQuestion) throw new Error("Question not found in specified course");

    const updatedQuestion = await db.question.update({
      where: { id: questionId },
      data: {
        ...(title && { title: title.trim() }),
        ...(topics && { topics }),
        ...(urls && { urls: urls.filter((url) => url.trim()) }),
        ...(difficulty && { difficulty }),
      },
      include: {
        courses: true,
      },
    });

    return { success: true, data: updatedQuestion };

  } catch (error) {
    console.error("Error updating admin question:", error);
    throw new Error("Failed to update question");
  }
}