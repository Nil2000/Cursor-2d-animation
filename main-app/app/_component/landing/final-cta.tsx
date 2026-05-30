import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FinalCtaProps = {
  primaryHref: string;
};

export function FinalCta({ primaryHref }: FinalCtaProps) {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] border bg-card/80 p-6 text-center shadow-2xl backdrop-blur sm:p-10 lg:p-14 2xl:max-w-[88rem]">
        <Badge variant="secondary" className="rounded-full">
          <SparklesIcon />
          Ready when your idea is
        </Badge>
        <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Build your next animation from a prompt, not a blank canvas.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Start with one concept, refine the scene plan, and render a polished
          Manim-style animation you can use immediately.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="group h-12 rounded-xl px-7">
            <Link href={primaryHref}>
              Start creating
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            size="lg"
            className="h-12 rounded-xl px-7"
          >
            <Link href="#features">Review features</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
