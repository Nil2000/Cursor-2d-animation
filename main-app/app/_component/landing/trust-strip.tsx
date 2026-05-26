import { Badge } from "@/components/ui/badge";
import { trustSignals } from "./constants";

export function TrustStrip() {
  return (
    <section className="border-y bg-card/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left 2xl:max-w-[88rem]">
        <p className="text-sm font-medium text-muted-foreground">
          Designed for creators and teams that need crisp technical storytelling.
        </p>
        <div className="flex flex-wrap justify-center gap-2 lg:justify-end">
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
