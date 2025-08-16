'use client';

import { Check, Crown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingPlan, BillingCycle } from '@/types/pricing';

interface PricingCardProps {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  isCurrentPlan: boolean;
  isUpgrade: boolean;
  price: string;
  monthlyEquivalent?: number | null;
  onUpgrade: (planId: 'FREE' | 'PRO') => void;
}

export function PricingCard({
  plan,
  billingCycle,
  isCurrentPlan,
  isUpgrade,
  price,
  monthlyEquivalent,
  onUpgrade
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
        plan.highlighted
          ? 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-2 border-orange-500/30 shadow-2xl shadow-orange-500/20'
          : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* Popular Badge */}
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-green-500 text-white">
            Current Plan
          </Badge>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          {plan.id === 'PRO' && <Crown className="w-6 h-6 text-orange-400 mr-2" />}
          <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
        </div>
        <p className="text-gray-400">{plan.description}</p>
      </div>

      {/* Pricing */}
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-white mb-2">
          {price}
        </div>
        {monthlyEquivalent && billingCycle === 'yearly' && (
          <p className="text-sm text-gray-400">
            ${monthlyEquivalent}/month billed annually
          </p>
        )}
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        <h4 className="font-semibold text-white mb-3">What's included:</h4>
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      {/* Limits Display */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">
              {plan.maxCourses === -1 ? '∞' : plan.maxCourses}
            </div>
            <div className="text-xs text-gray-400">Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {plan.maxQuestionsPerCourse === -1 ? '∞' : plan.maxQuestionsPerCourse}
            </div>
            <div className="text-xs text-gray-400">Questions/Course</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => onUpgrade(plan.id)}
        disabled={isCurrentPlan && plan.id === 'FREE'}
        className={`w-full py-3 font-semibold transition-all duration-200 ${
          plan.highlighted
            ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white'
            : 'border border-gray-600 hover:bg-gray-700 text-gray-300'
        } ${isCurrentPlan && plan.id === 'FREE' ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isCurrentPlan && plan.id === 'FREE'
          ? 'Current Plan'
          : isCurrentPlan && plan.id === 'PRO'
          ? 'Manage Subscription'
          : isUpgrade
          ? `Upgrade to ${plan.name}`
          : plan.buttonText
        }
      </Button>

      {/* Upgrade Benefits */}
      {isUpgrade && (
        <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <p className="text-sm text-orange-300 text-center">
            🚀 Unlock unlimited potential with Pro!
          </p>
        </div>
      )}
    </div>
  );
}
