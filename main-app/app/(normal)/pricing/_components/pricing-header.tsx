"use client";

import { Spotlight } from "@/components/ui/spotlight-new";

export function PricingHeader() {
  return (
    <div className="relative mb-16 text-center">
      <Spotlight theme="dark" />
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your animation needs. Upgrade or downgrade at any time.
        </p>
      </div>
    </div>
  );
}
