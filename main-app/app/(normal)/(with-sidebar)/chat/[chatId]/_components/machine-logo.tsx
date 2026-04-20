import { BrainCircuit } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export default function MachineLogo({
  className,
  iconSize = 16,
}: {
  className?: string;
  iconSize?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-md bg-secondary text-foreground flex items-center justify-center p-2",
        className
      )}
    >
      <BrainCircuit size={iconSize} />
    </div>
  );
}
