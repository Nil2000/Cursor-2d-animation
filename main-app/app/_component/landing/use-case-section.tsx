import { MonitorPlayIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCases } from "./constants";
import { SectionHeader } from "./section-header";

export function UseCaseSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-10 rounded-[2rem] border bg-card/50 p-5 shadow-sm backdrop-blur sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:p-10 2xl:max-w-[88rem]">
        <div className="flex flex-col justify-between gap-8">
          <SectionHeader
            align="left"
            eyebrow="Use cases"
            title="Made for visualizing ideas that deserve more than static slides."
            description="Use Manim AI anywhere clarity depends on motion, sequence, and guided attention."
          />
          <div className="rounded-3xl border bg-background/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MonitorPlayIcon className="size-5" />
              </div>
              <div>
                <div className="font-semibold">Responsive by default</div>
                <div className="text-sm text-muted-foreground">
                  The interface stays legible from mobile planning to desktop
                  production.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {useCases.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="group border-border/70 bg-background/70 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <CardContent className="flex gap-4 p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition duration-300 group-hover:scale-105">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
