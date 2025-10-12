import type { CreditPackage } from "./types";

export const MODEL = "openai/gpt-5-mini";

export const OPENROUTER_CHAT_COMPLETION_URL =
  "https://openrouter.ai/api/v1/chat/completions";

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const MAX_TOKENS = 1000;

export const MANIM_SYSTEM_PRESET = "@preset/preset-for-manim-application";

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
