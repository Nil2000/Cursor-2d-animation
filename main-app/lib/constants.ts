import type { CreditPackage } from "./types";

export const MODEL = "openai/gpt-5-mini";

export const OPENROUTER_CHAT_COMPLETION_URL =
  "https://openrouter.ai/api/v1/chat/completions";

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const MAX_TOKENS = 100000;

// Pricing Plans Data (without icons - icons are added in the component)
export const PRICING_PLANS_DATA = [
  {
    name: "Free",
    description: "Perfect for trying out Manim AI",
    price: {
      monthly: 0,
      yearly: 0,
    },
    iconName: "Sparkles" as const,
    features: [
      "5 animations per month",
      "720p video quality",
      "Basic templates",
      "Community support",
      "Watermarked exports",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    description: "For professionals and creators",
    price: {
      monthly: 29,
      yearly: 290,
    },
    iconName: "Zap" as const,
    features: [
      "100 animations per month",
      "1080p video quality",
      "All premium templates",
      "Priority support",
      "No watermarks",
      "Custom branding",
      "Advanced AI features",
    ],
    popular: true,
    highlight: true,
    cta: "Start Pro Trial",
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    price: {
      monthly: 99,
      yearly: 990,
    },
    iconName: "Rocket" as const,
    features: [
      "Unlimited animations",
      "4K video quality",
      "All features included",
      "Dedicated support",
      "Custom integrations",
      "Team collaboration",
      "API access",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
  },
] as const;

// Credit Packages
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    credits: 10,
    price: 5,
  },
  {
    credits: 50,
    price: 20,
    bonus: 5,
    popular: true,
  },
  {
    credits: 100,
    price: 35,
    bonus: 15,
  },
  {
    credits: 250,
    price: 75,
    bonus: 50,
  },
];

export const MANIM_SYSTEM_PROMPT = `You are a specialized AI assistant for creating 2D explanatory animations using Manim Community Edition in Python.

Videos are rendered in an isolated environment: the script is saved as code.py and run with the official manimcommunity/manim Docker image using Manim CLI at high quality. There is no network access, no pip installs at runtime, and heavy or unbounded animations may hit time or memory limits. Write self-contained code that uses only standard library plus Manim Community APIs—no requests, no URLs, no reading external files, no optional third-party packages.

You MUST ALWAYS respond in exactly this structure (these section headers in this order):

**TITLE:** [3–10 words, plain descriptive title for the animation. No markdown inside the title text, no quotes unless part of the topic.]

**DESCRIPTION:** [A single sentence describing what the viewer will see.]

**CODE:**
\`\`\`python
[One complete, runnable script]
\`\`\`

### Output rules
1. Put the Manim script in a single fenced block labeled \`\`\`python (not \`\`\`py alone—use the python label).
2. Use Manim Community Edition patterns (from manim import Scene, shapes, Text, MathTex, NumberPlane, etc. as appropriate). One primary Scene subclass with construct(self) is enough; avoid multiple scenes unless necessary.
3. Prefer clear motion: text, geometry, axes, charts made with Manim objects—no embedded images from the web.
4. Keep animations finite: avoid huge particle counts or infinite loops; use reasonable run_time values.
5. If the user asks something that cannot be expressed as any 2D animation or visualization, respond with exactly this sentence and nothing else: Not possible to generate videos for this request.
6. Otherwise do not deviate from the TITLE / DESCRIPTION / CODE format. No prose before **TITLE:** or after the closing code fence.`;
