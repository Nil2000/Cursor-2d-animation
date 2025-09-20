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
  status: "pending" | "completed" | "failed";
  url: string | null;
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
