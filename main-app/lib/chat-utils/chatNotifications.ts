export const CHAT_SIDEBAR_TOPIC_PREFIX = "chat-sidebar";

export const CHAT_SPACE_CREATED_EVENT = "chat-space-created";
export const CHAT_SPACE_UPDATED_EVENT = "chat-space-updated";

export type ChatSidebarEventName =
  | typeof CHAT_SPACE_CREATED_EVENT
  | typeof CHAT_SPACE_UPDATED_EVENT;

export type ChatSidebarNotificationPayload = {
  chatSpaceId: string;
  title?: string;
};

export const getChatSidebarTopic = (userId: string) =>
  `${CHAT_SIDEBAR_TOPIC_PREFIX}:${userId}`;

export const buildChatSidebarWebSocketUrl = (
  notifyServerUrl: string,
  userId: string,
) => {
  const url = new URL("/", notifyServerUrl);
  url.protocol =
    url.protocol === "https:" || url.protocol === "wss:" ? "wss:" : "ws:";
  url.searchParams.set("topic", getChatSidebarTopic(userId));
  return url.toString();
};
