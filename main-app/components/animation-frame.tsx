import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClientMessageVideoType } from "@/lib/types";
import { AlertCircle, Check, Clapperboard, PenLine, Play } from "lucide-react";
import React from "react";

export type AnimationStage = "writing" | "rendering" | "ready" | "failed";

export function stageFromReply(
  error: string | undefined,
  video: { status: string; url?: string } | undefined,
): AnimationStage {
  if (error) return "failed";
  if (video?.status === "pending") return "rendering";
  if (video?.status === "completed" && video.url) return "ready";
  return "failed";
}

type Props = {
  stage: AnimationStage;
  video?: ClientMessageVideoType;
  onOpen?: () => void;
  error?: string;
  action?: React.ReactNode;
};

const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
};

const CURVE = "M28 128 C 72 128, 88 46, 132 58 S 214 154, 292 64";

function statusText(stage: AnimationStage, error?: string) {
  if (stage === "writing") return "Writing your scene…";
  if (stage === "rendering") return "Rendering video…";
  if (stage === "ready") return "Ready";
  return error ?? "Rendering failed. Retry from your last message.";
}

function StatusIcon({ stage }: { stage: AnimationStage }) {
  const className = cn(
    "mt-0.5 size-3.5 shrink-0",
    stage === "failed" ? "text-destructive" : "text-primary",
  );
  if (stage === "writing") return <PenLine className={className} />;
  if (stage === "rendering") return <Clapperboard className={className} />;
  if (stage === "ready") return <Check className={className} />;
  return <AlertCircle className={className} />;
}

function SceneCurve({ complete }: { complete: boolean }) {
  return (
    <svg
      viewBox="0 0 320 180"
      className="absolute inset-0 h-full w-full text-primary"
      aria-hidden
    >
      <path
        d={CURVE}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        className={
          complete
            ? undefined
            : "motion-safe:[stroke-dashoffset:1] motion-safe:animate-frame-draw"
        }
      />
    </svg>
  );
}

export default function AnimationFrame({
  stage,
  video,
  onOpen,
  error,
  action,
}: Props) {
  const busy = stage === "writing" || stage === "rendering";
  const canOpen = stage === "ready" && Boolean(video?.url) && Boolean(onOpen);

  return (
    <div className="w-full max-w-[320px]" aria-busy={busy || undefined}>
      <Card
        className={cn(
          "relative w-full gap-0 overflow-hidden rounded-md p-0 shadow-sm",
          stage === "failed" && "border-destructive/40",
        )}
      >
        <div className="relative aspect-video w-full">
          <div
            className={cn(
              "absolute inset-0 bg-secondary/40",
              stage === "failed" && "bg-destructive/10",
            )}
            style={GRID_STYLE}
          />
          {(stage === "writing" || stage === "rendering") && (
            <SceneCurve complete={stage === "rendering"} />
          )}
          {stage === "rendering" && (
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              aria-hidden
            >
              <div className="absolute inset-y-0 left-0 hidden w-1/3 bg-linear-to-r from-transparent via-primary/30 to-transparent motion-safe:block motion-safe:animate-frame-shimmer" />
            </div>
          )}
          {stage === "failed" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertCircle className="size-8 text-destructive" />
            </div>
          )}
          {stage === "ready" && video?.url && (
            <video
              src={video.url}
              className="absolute inset-0 h-full w-full bg-black object-cover motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-500"
              preload="metadata"
              muted
              playsInline
            />
          )}
          {canOpen && (
            <button
              type="button"
              onClick={onOpen}
              aria-label="Play video"
              className="group absolute inset-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="rounded-full bg-primary/90 p-3 text-primary-foreground backdrop-blur-sm">
                  <Play className="size-6 fill-current" />
                </span>
              </span>
              <span className="absolute right-2 bottom-2 rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                Click to view
              </span>
            </button>
          )}
        </div>
      </Card>
      <div
        className="mt-2 flex min-h-8 items-center justify-between gap-2"
        aria-live="polite"
      >
        <p
          className={cn(
            "flex min-w-0 items-start gap-1.5 text-sm",
            stage === "failed" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <StatusIcon stage={stage} />
          <span>{statusText(stage, error)}</span>
        </p>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
