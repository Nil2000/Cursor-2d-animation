import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";

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
    <LogoMark
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
