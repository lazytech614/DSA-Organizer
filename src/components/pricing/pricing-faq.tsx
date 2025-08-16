'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Can I switch between plans anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
  },
  {
    question: "What happens to my data if I downgrade?",
    answer: "Your data is safe. If you exceed the free plan limits, you won't be able to create new courses until you upgrade or remove some content."
  },
  {
    question: "Is there a free trial for Pro?",
    answer: "You can start with our generous free plan to explore the platform. Pro features are available immediately upon upgrade."
  },
  {
    question: "How does billing work?",
    answer: "You'll be charged monthly or yearly based on your selected billing cycle. All payments are processed securely through Stripe."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely! You can cancel your subscription anytime. You'll continue to have Pro access until the end of your billing period."
  }
];

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors"
            >
              <span className="font-medium text-white">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4">
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
