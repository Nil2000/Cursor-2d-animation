import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const APP_NAME = "Manim";

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export default function Logo({
  width = 59,
  height = 36,
  className,
  showWordmark = false,
  wordmarkClassName,
}: LogoProps) {
  const image = (
    <Image
      src="/logo.svg"
      alt={`${APP_NAME} logo`}
      width={width}
      height={height}
      priority
      className={cn("bg-white rounded-sm p-1", className)}
    />
  );

  if (!showWordmark) {
    return image;
  }

  return (
    <span className="flex items-center gap-2">
      {image}
      <span
        className={cn(
          "font-mono text-xl font-bold tracking-tight",
          wordmarkClassName
        )}
      >
        {APP_NAME}
      </span>
    </span>
  );
}
