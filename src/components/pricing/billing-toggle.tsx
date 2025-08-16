'use client';

import { Badge } from '@/components/ui/badge';
import { BillingCycle } from '@/types/pricing';

interface BillingToggleProps {
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  yearlySavings: number;
}

export function BillingToggle({ billingCycle, onBillingCycleChange, yearlySavings }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="bg-gray-800 rounded-lg p-1 flex items-center">
        <button
          onClick={() => onBillingCycleChange('monthly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            billingCycle === 'monthly'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onBillingCycleChange('yearly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
            billingCycle === 'yearly'
              ? 'bg-orange-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Yearly
          {yearlySavings > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0">
              Save ${yearlySavings}
            </Badge>
          )}
        </button>
      </div>
    </div>
  );
}
