import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        align === "left" && "text-left",
      )}
    >
      <Badge variant="outline" className="mb-4 rounded-full text-primary">
        {eyebrow}
      </Badge>
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}
