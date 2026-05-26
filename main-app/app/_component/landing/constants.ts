import type { LucideIcon } from "lucide-react";
import {
  BotIcon,
  Code2Icon,
  FileVideoIcon,
  Layers3Icon,
  MonitorPlayIcon,
  PenLineIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Users2Icon,
  WandSparklesIcon,
  ZapIcon,
} from "lucide-react";

export const navItems = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
] as const;

export const trustSignals = [
  "AI storyboards",
  "Manim-native scenes",
  "Render-ready exports",
  "Credit-aware workflow",
] as const;

export const heroStats = [
  { value: "Prompt", label: "Start with natural language" },
  { value: "Code", label: "Generate Manim structure" },
  { value: "Video", label: "Render polished scenes" },
] as const;

export const generationSteps: Array<{
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    label: "Storyboard",
    description: "Scene beats and narration flow",
    icon: PenLineIcon,
  },
  {
    label: "Manim code",
    description: "Structured animation instructions",
    icon: Code2Icon,
  },
  {
    label: "Render pass",
    description: "Preview, refine, and export",
    icon: MonitorPlayIcon,
  },
];

export const timelineTracks = [
  "w-[18%] bg-primary/80",
  "w-[24%] bg-secondary",
  "w-[16%] bg-primary/60",
  "w-[28%] bg-accent",
  "w-[14%] bg-primary/40",
] as const;

export const spectrumBars = [
  "h-[34%]",
  "h-[58%]",
  "h-[44%]",
  "h-[82%]",
  "h-[64%]",
  "h-[48%]",
  "h-[74%]",
] as const;

export const features: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Prompt-to-scene intelligence",
    description:
      "Describe the explanation you need and get a structured animation plan with scene timing, motion intent, and visual emphasis.",
    icon: WandSparklesIcon,
  },
  {
    title: "Manim-native generation",
    description:
      "Create animations that map cleanly to Manim concepts, making outputs easier to inspect, iterate, and extend.",
    icon: Code2Icon,
  },
  {
    title: "Polished render pipeline",
    description:
      "Move from idea to preview with a focused queue experience built for fast iteration and production-ready video output.",
    icon: FileVideoIcon,
  },
  {
    title: "Project continuity",
    description:
      "Keep concepts, prompts, and generated scenes organized so you can build complete lessons instead of disconnected clips.",
    icon: Layers3Icon,
  },
  {
    title: "Quality guardrails",
    description:
      "Maintain consistent visual structure, readable pacing, and reusable scene logic across every generated animation.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Creator velocity",
    description:
      "Skip blank timelines and repetitive setup work so technical ideas can become clear animations faster.",
    icon: ZapIcon,
  },
];

export const workflowSteps: Array<{
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    step: "01",
    title: "Describe the concept",
    description:
      "Start with a topic, audience, and desired style. Manim AI turns that brief into a focused scene plan.",
    icon: BotIcon,
  },
  {
    step: "02",
    title: "Review the animation logic",
    description:
      "Inspect the generated structure, refine the prompt, and shape pacing before committing to a final render.",
    icon: Code2Icon,
  },
  {
    step: "03",
    title: "Render and share",
    description:
      "Produce a clean 2D animation that is ready for explainers, lessons, product docs, or social clips.",
    icon: FileVideoIcon,
  },
];

export const useCases: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Educators and course creators",
    description:
      "Turn abstract ideas into visual lessons with clear transitions and guided pacing.",
    icon: Users2Icon,
  },
  {
    title: "Technical product teams",
    description:
      "Explain systems, algorithms, and product flows without building every animation from scratch.",
    icon: Layers3Icon,
  },
  {
    title: "Researchers and builders",
    description:
      "Create crisp visual summaries for demos, presentations, and documentation.",
    icon: SparklesIcon,
  },
];

export const testimonials = [
  {
    quote:
      "The strongest part is how quickly a rough teaching idea becomes a coherent visual sequence.",
    name: "Maya",
    role: "STEM creator",
    initials: "MK",
  },
  {
    quote:
      "It feels built for technical storytelling, not generic video generation. The structure is the product.",
    name: "Arjun",
    role: "Product engineer",
    initials: "AR",
  },
  {
    quote:
      "I can iterate on concepts before rendering, which keeps the final animation focused and easy to follow.",
    name: "Lena",
    role: "Course designer",
    initials: "LS",
  },
] as const;

export const planHighlights = [
  "AI animation planning",
  "Manim code generation",
  "Queued renders",
  "Project history",
] as const;
