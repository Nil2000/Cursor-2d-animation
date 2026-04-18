export type ClientMessageType = {
  id: string;
  type: Role;
  body: string;
  contextId?: string | null;
  error?: string;
  chat_videos?: ClientMessageVideoType[];
};

export type ClientMessageVideoType = {
  id: string;
  quality: string;
  status: "pending" | "completed" | "failed";
  url: string;
};

/** JSON body of a successful POST /api/chat or POST /api/chat/retry response */
export type ChatGenerationApiSuccess = {
  chatId: string;
  body: string;
  videos: ClientMessageVideoType[];
};

export type UserInfoType = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined | undefined;
};

export type Message = {
  content: string;
  role: Role;
};

export type Messages = Message[];

export enum Role {
  Assistant = "assistant",
  User = "user",
}

export type CreditsType = {
  credits: number;
  isPremium: boolean;
};

// Pricing Types
export type BillingPeriod = "monthly" | "yearly";

export interface PricingPlan {
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  icon: React.ReactNode;
  features: readonly string[];
  popular?: boolean;
  cta: string;
  highlight?: boolean;
}

export interface CreditPackage {
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
}
