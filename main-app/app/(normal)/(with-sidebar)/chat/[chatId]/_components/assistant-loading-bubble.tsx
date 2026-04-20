import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import MachineLogo from "./machine-logo";

const AssistantLoadingBubble = React.memo(function AssistantLoadingBubble() {
  return (
    <div className="flex justify-start items-start gap-2" aria-live="polite" aria-busy="true">
      <MachineLogo />
      <Card className="p-4 sm:max-w-3/4 max-w-full w-full rounded-md shadow-none border-border/60">
        <p className="text-sm text-muted-foreground mb-3">
          Generating your animation
          <span className="inline-flex gap-0.5 ml-0.5" aria-hidden>
            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground motion-safe:animate-bounce [animation-delay:0ms]" />
            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground motion-safe:animate-bounce [animation-delay:150ms]" />
            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground motion-safe:animate-bounce [animation-delay:300ms]" />
          </span>
        </p>
        <div className="space-y-2">
          <Skeleton className="h-3 w-[92%]" />
          <Skeleton className="h-3 w-[78%]" />
          <Skeleton className="h-3 w-[64%]" />
        </div>
      </Card>
    </div>
  );
});

export default AssistantLoadingBubble;
