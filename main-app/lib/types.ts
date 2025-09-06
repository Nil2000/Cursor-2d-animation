export type ClientMessageType = {
  type: "user" | "assistant";
  body: string;
  contextId?: string | null;
  loading?: boolean;
  error?: string;
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
  Agent = "assistant",
  User = "user",
}
