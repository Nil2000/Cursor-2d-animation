"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      className={cn(
        "opacity-0 motion-reduce:!opacity-100",
        inView && "animate-rise motion-reduce:animate-none",
        className,
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
