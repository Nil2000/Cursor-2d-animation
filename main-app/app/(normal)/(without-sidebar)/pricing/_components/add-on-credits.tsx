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
import { Plus, Coins } from "lucide-react";
import { CREDIT_PACKAGES } from "@/lib/constants";

export function AddOnCredits() {
  return (
    <div className="mb-16">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <Coins className="size-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">
            Add-On Credits
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Need more animations? Purchase additional credits anytime when your monthly quota is exhausted
        </p>
      </div>

      {/* Credit Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card
            key={pkg.credits}
            className={`relative transition-all duration-300 hover:shadow-lg ${
              pkg.popular ? "border-2 border-primary shadow-md" : ""
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  Best Value
                </span>
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-baseline gap-1">
                {pkg.credits}
                {pkg.bonus && (
                  <span className="text-sm font-normal text-green-600 dark:text-green-400">
                    +{pkg.bonus}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {pkg.bonus
                  ? `${pkg.credits + pkg.bonus} total credits`
                  : "animation credits"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ${(pkg.price / (pkg.credits + (pkg.bonus || 0))).toFixed(2)}{" "}
                  per credit
                </p>
                {pkg.bonus && (
                  <div className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
                    <Plus className="size-3" />
                    {pkg.bonus} bonus credits
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={pkg.popular ? "default" : "outline"}
              >
                Purchase
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Info Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Credits never expire and can be used anytime • All plans include monthly credits that reset each billing cycle
        </p>
      </div>
    </div>
  );
}
