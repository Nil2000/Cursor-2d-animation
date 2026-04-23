import {
  getChatSidebarTopic,
  type ChatSidebarEventName,
  type ChatSidebarNotificationPayload,
} from "./chatNotifications";

type PublishChatNotificationArgs = {
  userId: string;
  event: ChatSidebarEventName;
  payload: ChatSidebarNotificationPayload;
};

let warnedAboutMissingNotifyConfig = false;

export async function publishChatNotification({
  userId,
  event,
  payload,
}: PublishChatNotificationArgs) {
  const notifyServerUrl = process.env.NOTIFY_SERVER_URL;
  const notifyServerSecret = process.env.NOTIFY_SERVER_SECRET;

  if (!notifyServerUrl || !notifyServerSecret) {
    if (!warnedAboutMissingNotifyConfig) {
      console.warn(
        "Notify server is not configured; chat sidebar updates will not be pushed.",
      );
      warnedAboutMissingNotifyConfig = true;
    }
    return;
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 2000);

  try {
    const response = await fetch(new URL("/notify", notifyServerUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": notifyServerSecret,
      },
      body: JSON.stringify({
        topic: getChatSidebarTopic(userId),
        event,
        payload,
      }),
      signal: timeoutController.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "unknown error");
      throw new Error(
        `Notify server responded with ${response.status}: ${errorText}`,
      );
    }
  } catch (error) {
    console.error("Error publishing chat sidebar notification:", error);
  } finally {
    clearTimeout(timeoutId);
  }
}
