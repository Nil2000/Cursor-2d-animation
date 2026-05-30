import Link from "next/link";
import { Coins, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FooterCreditsProps = {
  usersCredits: number;
  isUserPremium: boolean;
  creditsLoading?: boolean;
};

export default function FooterCredits({
  usersCredits,
  isUserPremium,
  creditsLoading = false,
}: FooterCreditsProps) {
  const isLowCredits = usersCredits < 10;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-sm shadow-sm transition-colors",
        isUserPremium
          ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-sidebar-accent/40 to-sidebar-accent/20 dark:from-yellow-500/15 dark:via-sidebar-accent/30"
          : "border-sidebar-border/80 bg-sidebar-accent/40",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            isUserPremium
              ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
              : "bg-primary/10 text-primary",
          )}
        >
          {isUserPremium ? (
            <Sparkles className="size-4" />
          ) : (
            <Coins className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {isUserPremium ? "Premium" : "Credits"}
          </p>
          {creditsLoading ? (
            <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              <span className="text-xs">Loading…</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-2xl font-bold tabular-nums leading-none",
                  isLowCredits && !isUserPremium
                    ? "text-orange-600 dark:text-orange-400"
                    : isUserPremium
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-sidebar-foreground",
                )}
              >
                {usersCredits}
              </span>
              <span className="text-xs text-muted-foreground">left</span>
            </div>
          )}
        </div>
        {isUserPremium && (
          <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-400">
            Pro
          </span>
        )}
      </div>

      {isLowCredits && !isUserPremium && !creditsLoading && (
        <p className="mt-2 rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[10px] font-medium text-orange-700 dark:text-orange-400">
          Running low — top up to keep rendering
        </p>
      )}

      {!isUserPremium && !creditsLoading && (
        <Link href="/pricing" className="mt-3 block">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full rounded-lg border-sidebar-border bg-background/60 text-xs font-medium hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="size-3" />
            Add credits
          </Button>
        </Link>
      )}

      {isUserPremium && !creditsLoading && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Unlimited animations included
        </p>
      )}
    </div>
  );
}
