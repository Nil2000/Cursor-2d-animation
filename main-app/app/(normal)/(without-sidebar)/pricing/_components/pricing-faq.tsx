"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Can I change my plan later?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for Enterprise plans, we can arrange invoicing and bank transfers.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Yes! Pro and Enterprise plans come with a 14-day free trial. No credit card required to start your trial. You can cancel anytime during the trial period.",
  },
  {
    question: "What happens when I reach my animation limit?",
    answer:
      "When you reach your monthly limit, you can either upgrade to a higher plan or wait until your limit resets at the start of the next billing cycle. We'll send you notifications as you approach your limit.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with Manim AI, contact our support team for a full refund within 30 days of purchase.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access to your plan features until the end of your current billing period.",
  },
  {
    question: "What's included in priority support?",
    answer:
      "Priority support includes faster response times (typically within 4 hours), direct access to our senior support team, and priority bug fixes. Enterprise customers also get a dedicated account manager.",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "No hidden fees! The price you see is the price you pay. All features listed in your plan are included. Additional services like custom integrations for Enterprise are discussed separately.",
  },
];

export function PricingFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground">
          Have questions? We&apos;ve got answers. Can&apos;t find what
          you&apos;re looking for?{" "}
          <a href="#" className="text-primary hover:underline">
            Contact our support team
          </a>
          .
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Collapsible
            key={index}
            open={openItems.includes(index)}
            onOpenChange={() => toggleItem(index)}
          >
            <div className="border rounded-lg bg-card hover:shadow-md transition-shadow">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left">
                <span className="font-semibold text-lg pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                    openItems.includes(index) && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
