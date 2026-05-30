import Link from "next/link";
import { CheckCircle2Icon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { planHighlights } from "./constants";

type PricingSectionProps = {
  primaryHref: string;
  pricingHref: string;
};

export function PricingSection({
  primaryHref,
  pricingHref,
}: PricingSectionProps) {
  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch 2xl:max-w-[88rem]">
        <Card className="overflow-hidden border-border/70 bg-card/80 shadow-xl">
          <CardHeader>
            <Badge
              variant="outline"
              className="mb-4 w-fit rounded-full text-primary"
            >
              <SparklesIcon />
              Start lean
            </Badge>
            <CardTitle className="text-3xl tracking-tight sm:text-4xl">
              Credits that match your animation volume.
            </CardTitle>
            <CardDescription className="text-base leading-7">
              Start with focused animation generation, then scale up when you
              need more render capacity and project history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {planHighlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border bg-background/70 p-4"
                >
                  <CheckCircle2Icon className="size-5 text-primary" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl">
                <Link href={pricingHref}>See plans</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                size="lg"
                className="h-12 rounded-xl"
              >
                <Link href={primaryHref}>Create a project</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/20 bg-primary p-0 text-primary-foreground shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
          <CardContent className="relative flex h-full flex-col justify-between gap-10 p-6 sm:p-8">
            <div>
              <Badge className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground">
                Premium workflow
              </Badge>
              <h3 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
                Ship clearer explanations without rebuilding every scene by
                hand.
              </h3>
              <p className="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/80">
                Use the same loop for a single concept clip or a complete
                technical lesson: prompt, inspect, render, and refine.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Brief", "Generate", "Render"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4"
                >
                  <div className="text-sm font-semibold">{item}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-primary-foreground/40" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
