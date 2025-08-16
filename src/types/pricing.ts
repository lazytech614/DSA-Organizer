export interface PricingPlan {
  id: 'FREE' | 'PRO';
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxCourses: number;
  maxQuestionsPerCourse: number;
  features: string[];
  highlighted: boolean;
  buttonText: string;
  stripePriceId?: string;
}

export type BillingCycle = 'monthly' | 'yearly';
