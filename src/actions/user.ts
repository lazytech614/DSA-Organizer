"use server";

import { currentUser } from "@clerk/nextjs/server";
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