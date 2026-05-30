import Link from "next/link";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { workflowSteps } from "./constants";
import { SectionHeader } from "./section-header";

type ProductSectionProps = {
  primaryHref: string;
};

export function ProductSection({ primaryHref }: ProductSectionProps) {
  return (
    <section id="product" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center 2xl:max-w-[88rem]">
        <Card className="overflow-hidden border-border/70 bg-card/80 p-0 shadow-xl backdrop-blur">
          <CardContent className="p-4 sm:p-6">
            <div className="rounded-3xl border bg-background/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Animation workspace
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    Scene plan to render queue
                  </div>
                </div>
                <Badge className="rounded-full">Live</Badge>
              </div>
              <Separator className="my-5" />
              <div className="space-y-3">
                {workflowSteps.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.step}
                      className="group/item flex gap-4 rounded-2xl border bg-card/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary">
                            {item.step}
                          </span>
                          <h3 className="font-semibold">{item.title}</h3>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <SectionHeader
            align="left"
            eyebrow="Product experience"
            title="A focused studio for visual explanations, not another blank video editor."
            description="The landing flow mirrors the product goal: keep the creative loop tight, make technical content legible, and give creators confidence before they render."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Clean prompt capture",
              "Structured scene planning",
              "Readable generated code",
              "Render status visibility",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border bg-card/60 p-4"
              >
                <CheckCircle2Icon className="size-5 text-primary" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-12 rounded-xl">
              <Link href={primaryHref}>
                Try the studio
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              size="lg"
              className="h-12 rounded-xl bg-background/60"
            >
              <Link href="#features">Explore features</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
