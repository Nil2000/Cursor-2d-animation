import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import Link from "next/link";
import { Coins, Sparkles, Plus } from "lucide-react";

export default function FooterCredits({
  usersCredits,
  isUserPremium,
}: {
  usersCredits: number;
  isUserPremium: boolean;
}) {
  const isLowCredits = usersCredits < 10;

  return (
    <Card
      className={cn(
        "h-max rounded-lg bg-gradient-to-br p-[2px] text-sm border-none transition-all duration-300",
        isUserPremium
          ? "from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-400 shadow-lg shadow-yellow-500/20"
          : "from-primary/60 via-primary to-primary/60 shadow-md"
      )}
    >
      <div className="w-full h-full bg-background rounded-md p-3 flex flex-col justify-center space-y-3">
        {/* Header with Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-1.5 rounded-md",
                isUserPremium
                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  : "bg-primary/10 text-primary"
              )}
            >
              {isUserPremium ? (
                <Sparkles className="size-4" />
              ) : (
                <Coins className="size-4" />
              )}
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {isUserPremium ? "Premium Credits" : "Credits Available"}
            </span>
          </div>
        </div>

        {/* Credits Display */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-3xl font-bold tabular-nums",
                isLowCredits && !isUserPremium
                  ? "text-orange-600 dark:text-orange-400"
                  : isUserPremium
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-foreground"
              )}
            >
              {usersCredits}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              credits
            </span>
          </div>
          {isUserPremium && (
            <div className="px-2 py-0.5 bg-yellow-500/10 rounded-full">
              <span className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                Pro
              </span>
            </div>
          )}
        </div>

        {/* Low Credits Warning */}
        {isLowCredits && !isUserPremium && (
          <div className="px-2 py-1 bg-orange-500/10 rounded-md border border-orange-500/20">
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
              ⚠️ Running low on credits
            </p>
          </div>
        )}

        {/* Action Button */}
        {!isUserPremium && (
          <Link href="/pricing" className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all cursor-pointer"
            >
              <Plus className="size-3" />
              Add More Credits
            </Button>
          </Link>
        )}

        {isUserPremium && (
          <p className="text-[10px] text-center text-muted-foreground">
            Unlimited animations included
          </p>
        )}
      </div>
    </Card>
  );
}
