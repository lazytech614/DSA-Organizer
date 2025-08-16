'use client';

import { useQuery } from '@tanstack/react-query';
import { PricingPlan, BillingCycle } from '@/types/pricing';

export const usePricingPlans = () => {
  return useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async (): Promise<PricingPlan[]> => {
      const response = await fetch('/api/pricing/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch pricing plans');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const usePricingCalculations = (plans: PricingPlan[], billingCycle: BillingCycle) => {
  const getPrice = (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) return 'Free';
    
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const period = billingCycle === 'monthly' ? 'month' : 'year';
    
    return `$${price}/${period}`;
  };

  const getYearlySavings = () => {
    const proPlan = plans.find(p => p.id === 'PRO');
    if (!proPlan) return 0;
    
    const monthlyTotal = proPlan.monthlyPrice * 12;
    const yearlySavings = monthlyTotal - proPlan.yearlyPrice;
    return Math.round(yearlySavings);
  };

  const getMonthlyEquivalent = (plan: PricingPlan) => {
    if (billingCycle === 'monthly' || plan.yearlyPrice === 0) return null;
    return Math.round(plan.yearlyPrice / 12 * 100) / 100;
  };

  return {
    getPrice,
    getYearlySavings,
    getMonthlyEquivalent
  };
};
