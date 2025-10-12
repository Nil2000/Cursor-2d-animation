"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles, Zap, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PRICING_PLANS_DATA } from "@/lib/constants";
import type { BillingPeriod, PricingPlan } from "@/lib/types";

// Icon mapping
const iconMap = {
  Sparkles: <Sparkles className="size-5" />,
  Zap: <Zap className="size-5" />,
  Rocket: <Rocket className="size-5" />,
} as const;

// Convert pricing plans data to include icons
const pricingPlans: PricingPlan[] = PRICING_PLANS_DATA.map((plan) => ({
  ...plan,
  icon: iconMap[plan.iconName],
}));

export function PricingCards() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const getPrice = (plan: PricingPlan) => {
    return billingPeriod === "monthly" ? plan.price.monthly : plan.price.yearly;
  };

  const getSavings = (plan: PricingPlan) => {
    if (billingPeriod === "yearly" && plan.price.monthly > 0) {
      const monthlyCost = plan.price.monthly * 12;
      const yearlyCost = plan.price.yearly;
      const savings = Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
      return savings;
    }
    return 0;
  };

  return (
    <div className="mb-16">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={cn(
              "px-6 py-2 rounded-md text-sm font-medium transition-all",
              billingPeriod === "monthly"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={cn(
              "px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              billingPeriod === "yearly"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yearly
            <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative transition-all duration-300 hover:shadow-lg",
              plan.highlight &&
                "border-2 border-primary shadow-xl scale-105 lg:scale-110"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="pb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">
                    ${getPrice(plan)}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingPeriod === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
                {billingPeriod === "yearly" && getSavings(plan) > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Save {getSavings(plan)}% with yearly billing
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="size-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.highlight ? "default" : "outline"}
                size="lg"
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
