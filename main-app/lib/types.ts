type ClientMessageType = {
  type: "user" | "assistant";
  body: string;
  contextId?: string | null;
  loading?: boolean;
  error?: string;
};

type UserInfoType = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined | undefined;
};
