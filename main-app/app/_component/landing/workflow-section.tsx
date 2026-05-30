import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { workflowSteps } from "./constants";
import { SectionHeader } from "./section-header";

export function WorkflowSection() {
  return (
    <section id="workflow" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[88rem]">
        <SectionHeader
          eyebrow="Workflow"
          title="A simple creation path with enough structure for serious production."
          description="Keep each step intentional so the output feels polished instead of randomly generated."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {workflowSteps.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.step}
                className="relative overflow-hidden border-border/70 bg-card/75 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute right-6 top-6 text-6xl font-semibold tracking-tight text-muted-foreground/10">
                  {item.step}
                </div>
                <CardHeader className="relative">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="mt-6 text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    {item.description}
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
