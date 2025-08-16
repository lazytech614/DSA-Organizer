'use client';

import { useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PricingHeader } from '@/components/pricing/pricing-header';
import { BillingToggle } from '@/components/pricing/billing-toggle';
import { PricingCard } from '@/components/pricing/pricing-card';
import { PricingFAQ } from '@/components/pricing/pricing-faq';
import { usePricingPlans, usePricingCalculations } from '@/hooks/usePricing';
import { useUserInfo } from '@/hooks/useUserInfo';
import { BillingCycle } from '@/types/pricing';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const { user } = useUser();
  const { data: userInfo } = useUserInfo();
  const { data: plans = [], isLoading, error } = usePricingPlans();
  const { getPrice, getYearlySavings, getMonthlyEquivalent } = usePricingCalculations(plans, billingCycle);

  const handleUpgrade = (planId: 'FREE' | 'PRO') => {
    if (planId === 'FREE') {
      toast.info('You\'re already on the free plan!');
      return;
    }
    
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    if (userInfo?.subscriptionType === 'PRO') {
      toast.info('You\'re already a Pro member!');
      return;
    }

    // TODO: Integrate with Stripe checkout
    const plan = plans.find(p => p.id === planId);
    if (plan?.stripePriceId) {
      toast.success('Redirecting to checkout...');
      // window.location.href = `/api/stripe/checkout?priceId=${plan.stripePriceId}`;
    } else {
      toast.error('Payment processing is not available yet.');
    }
  };

  const getCurrentPlan = () => {
    return userInfo?.subscriptionType || 'FREE';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading pricing plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error loading pricing plans. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PricingHeader />

        {/* Billing Toggle */}
        <BillingToggle
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
          yearlySavings={getYearlySavings()}
        />

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan) => {
            const isCurrentPlan = getCurrentPlan() === plan.id;
            const isUpgrade = plan.id === 'PRO' && getCurrentPlan() === 'FREE';
            
            return (
              <PricingCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                isCurrentPlan={isCurrentPlan}
                isUpgrade={isUpgrade}
                price={getPrice(plan)}
                monthlyEquivalent={getMonthlyEquivalent(plan)}
                onUpgrade={handleUpgrade}
              />
            );
          })}
        </div>

        {/* Sign In CTA */}
        {!user && (
          <div className="text-center mb-16">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">
                Ready to Start Learning?
              </h3>
              <p className="text-gray-400 mb-4">
                Sign in to get started with your free account
              </p>
              <SignInButton>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Sign In to Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </SignInButton>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center mb-16">
          <Link href="/">
            <Button variant="outline" className="border-gray-600 hover:bg-gray-700 text-gray-300">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* FAQ */}
        <PricingFAQ />
      </div>
    </div>
  );
}
