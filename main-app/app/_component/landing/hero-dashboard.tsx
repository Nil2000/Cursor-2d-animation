import { Clock3Icon, PlayIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  generationSteps,
  spectrumBars,
  timelineTracks,
} from "./constants";

export function HeroDashboard() {
  return (
    <Card className="group relative overflow-hidden border-border/70 bg-card/80 p-0 shadow-2xl backdrop-blur transition duration-500 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" />
      <CardContent className="relative p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Current project
            </div>
            <div className="mt-1 text-lg font-semibold">
              Fourier transform explainer
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full">
            <Clock3Icon />
            Drafting
          </Badge>
        </div>

        <div className="rounded-2xl border bg-background/70 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline" className="rounded-full">
              Prompt
            </Badge>
            <span className="text-xs text-muted-foreground">Scene brief</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Explain how a signal decomposes into frequencies using smooth axes,
            rotating vectors, and a final spectrum reveal.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {generationSteps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className="rounded-2xl border bg-card/70 p-4 transition duration-300 group-hover:border-primary/30"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="mt-3 text-sm font-semibold">{step.label}</div>
                <div className="mt-1 text-xs leading-5 text-muted-foreground">
                  {step.description}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-3xl border bg-background/80 p-3 shadow-sm">
          <div className="aspect-video overflow-hidden rounded-2xl border bg-gradient-to-br from-muted via-background to-secondary/30 p-4">
            <div className="flex h-full flex-col justify-between rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Preview frame
                  </div>
                  <div className="text-sm font-semibold">
                    Frequency spectrum reveal
                  </div>
                </div>
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition duration-300 group-hover:scale-105">
                  <PlayIcon className="size-4 fill-primary-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-[0.8fr_1.2fr] items-end gap-4">
                <div className="space-y-2">
                  <div className="h-2 w-4/5 rounded-full bg-primary/70" />
                  <div className="h-2 w-2/3 rounded-full bg-primary/40" />
                  <div className="h-2 w-full rounded-full bg-secondary" />
                </div>
                <div className="flex h-28 items-end gap-2 rounded-xl border bg-background/70 p-3">
                  {spectrumBars.map((height) => (
                    <div
                      key={height}
                      className={cn(
                        "flex-1 rounded-t-md bg-primary/70 transition duration-500 group-hover:bg-primary",
                        height,
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-1.5">
                {timelineTracks.map((track) => (
                  <div key={track} className={cn("h-2 rounded-full", track)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
