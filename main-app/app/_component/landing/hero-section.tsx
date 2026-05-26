import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { heroStats } from "./constants";
import { HeroDashboard } from "./hero-dashboard";

type HeroSectionProps = {
  authenticated: boolean;
  name?: string;
  primaryHref: string;
};

export function HeroSection({
  authenticated,
  name,
  primaryHref,
}: HeroSectionProps) {
  return (
    <section className="relative px-4 pt-28 pb-20 sm:px-6 sm:pt-36 lg:px-8 lg:pt-40 lg:pb-28">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] 2xl:max-w-[88rem]">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
          <Badge
            variant="outline"
            className="mb-6 rounded-full border-primary/20 bg-background/70 px-3 py-1.5 text-primary shadow-sm backdrop-blur"
          >
            <SparklesIcon />
            {authenticated
              ? name
                ? `Welcome back, ${name}`
                : "Welcome back"
              : "AI-native animation studio"}
          </Badge>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl 2xl:text-8xl">
            Turn complex ideas into
            <span className="text-primary"> polished 2D animations</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl lg:leading-8">
            Manim AI helps you move from a rough concept to a structured,
            render-ready animation with smart planning, Manim-native code, and a
            workflow built for fast iteration.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="group h-12 rounded-xl px-6">
              <Link href={primaryHref}>
                {authenticated ? "Continue creating" : "Start creating"}
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 rounded-xl bg-background/60 px-6 backdrop-blur"
            >
              <Link href="#workflow">See workflow</Link>
            </Button>
          </div>

          <div className="mt-10 grid w-full gap-3 sm:grid-cols-3 lg:max-w-2xl">
            {heroStats.map((stat) => (
              <div
                key={stat.value}
                className="rounded-2xl border bg-card/70 p-4 text-left shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-sm font-semibold text-primary">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <HeroDashboard />
      </div>
    </section>
  );
}
