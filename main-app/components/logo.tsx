import { cn } from "@/lib/utils";
import Image from "next/image";

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
  const mark = (
    <Image
      src="/manimai-icon-only.svg"
      alt="Manim Logo"
      width={width}
      height={height}
      className={cn("rounded-sm p-1", className)}
    />
  );

  if (!showWordmark) {
    return mark;
  }

  return (
    <span className="flex items-center gap-2 text-foreground">
      {mark}
      <span
        className={cn(
          "font-mono text-xl font-bold tracking-tight",
          wordmarkClassName,
        )}
      >
        {APP_NAME}
      </span>
    </span>
  );
}
