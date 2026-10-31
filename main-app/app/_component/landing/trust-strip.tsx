import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trustSignals } from "./constants";

function SignalBadges({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-2 pr-2",
        hidden
          ? "motion-reduce:hidden"
          : "motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pr-0",
      )}
      aria-hidden={hidden || undefined}
    >
      {trustSignals.map((signal) => (
        <Badge
          key={signal}
          variant="outline"
          className="rounded-full bg-background/70 px-3 py-1 text-muted-foreground"
        >
          {signal}
        </Badge>
      ))}
    </div>
  );
}

export function TrustStrip() {
  return (
    <section className="border-y bg-card/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left 2xl:max-w-[88rem]">
        <p className="text-sm font-medium text-muted-foreground">
          Designed for creators and teams that need crisp technical storytelling.
        </p>

        <div className="overflow-hidden lg:hidden">
          <div className="flex w-max animate-marquee motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:animate-none">
            <SignalBadges />
            <SignalBadges hidden />
          </div>
        </div>

        <div className="hidden flex-wrap justify-end gap-2 lg:flex">
          {trustSignals.map((signal) => (
            <Badge
              key={signal}
              variant="outline"
              className="rounded-full bg-background/70 px-3 py-1 text-muted-foreground"
            >
              {signal}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
