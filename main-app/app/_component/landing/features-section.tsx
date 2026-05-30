import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features } from "./constants";
import { SectionHeader } from "./section-header";

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[88rem]">
        <SectionHeader
          eyebrow="Feature set"
          title="Everything needed to turn a technical brief into a clear animated story."
          description="Built around the real creation loop: plan the scene, generate the Manim logic, render, refine, and keep every project organized."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group h-full border-border/70 bg-card/70 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition duration-300 group-hover:scale-105">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
