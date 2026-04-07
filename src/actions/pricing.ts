"use server";

import { db } from "@/lib/db";
import { PricingPlan } from "@/types/pricing";

export async function getPricingPlans() {
  try {
    const subscriptionPlans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });

    const plans: PricingPlan[] = subscriptionPlans.map((plan) => ({
      id: plan.type as "FREE" | "PRO",
      name: plan.name,
      description: plan.description || "",
      monthlyPrice: Number(plan.monthlyPrice) || 0,
      yearlyPrice: Number(plan.yearlyPrice) || 0,
      maxCourses: plan.maxCourses,
      maxQuestionsPerCourse: plan.maxQuestionsPerCourse,
      features: plan.features,
      highlighted: plan.type === "PRO",
      buttonText: plan.type === "FREE" ? "Get Started" : "Upgrade to Pro",
      stripePriceId: plan.stripePriceId || undefined,
    }));

    return plans;
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    throw new Error("Failed to fetch pricing plans");
  }
}