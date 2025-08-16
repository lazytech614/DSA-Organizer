'use client';

import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PricingHeader() {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-orange-400 mr-2" />
        <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
          Pricing Plans
        </Badge>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
        Choose Your
        <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
          {" "}Learning Path
        </span>
      </h1>
      
      <p className="text-xl text-gray-400 max-w-3xl mx-auto">
        Start your DSA journey with our free plan or unlock unlimited potential with Pro. 
        No hidden fees, cancel anytime.
      </p>
    </div>
  );
}
