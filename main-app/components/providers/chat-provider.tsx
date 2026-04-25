"use client";
import axios from "axios";
import * as React from "react";

import {
  CHAT_SPACE_CREATED_EVENT,
  CHAT_SPACE_UPDATED_EVENT,
  buildChatNotificationWebSocketUrl,
  type ChatNotification,
} from "@/lib/chat-utils/chatNotifications";

// Define the shape of the context
type ChatPageContextProps = {
  limit: number;
  setLimit: (newLimit: number) => void;
  history: {
    id: string;
    title: string;
  }[];
  setHistory: (newHistory: { id: string; title: string }[]) => void;
  getChatSpaceHistory: (limit: number) => Promise<void>;
  triggerCheck: () => void;
  subscribeToNotifications: (
    listener: (notification: ChatNotification) => void,
  ) => () => void;
  usersCredits: number;
  isUserPremium: boolean;
  creditsLoading: boolean;
  refetchCredits: () => Promise<void>;
};

type ChatPageProviderProps = {
  children: React.ReactNode;
  userId: string;
  notifyServerUrl?: string | null;
};

// Create the context with default values
const ChatPageContext = React.createContext<ChatPageContextProps | null>(null);

function useChatHook() {
  const context = React.useContext(ChatPageContext);
  if (!context) {
    throw new Error("useChatHook must be used within a ChatPageProvider");
  }
  return context;
}

// Provider component for the ChatPageContext
const ChatPageProvider: React.FC<ChatPageProviderProps> = ({
  children,
  userId,
  notifyServerUrl,
}) => {
  const [limit, setLimit] = React.useState(5);
  const [history, setHistory] = React.useState<{ id: string; title: string }[]>(
    [],
  );
  const limitRef = React.useRef(limit);
  const historyRequestIdRef = React.useRef(0);
  const notificationListenersRef = React.useRef(
    new Set<(notification: ChatNotification) => void>(),
  );

  // Credits state
  const [credits, setCredits] = React.useState<number>(0);
  const [isPremium, setIsPremium] = React.useState<boolean>(false);
  const [creditsLoading, setCreditsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    limitRef.current = limit;
  }, [limit]);

  const getChatSpaceHistory = React.useCallback(
    async (historyLimit: number) => {
      const requestId = ++historyRequestIdRef.current;

      try {
        const response = await axios.get(
          `/api/chat/history?limit=${historyLimit}`,
        );

        if (requestId !== historyRequestIdRef.current) {
          return;
        }

        setHistory(response.data);
      } catch (error) {
        if (requestId !== historyRequestIdRef.current) {
          return;
        }

        console.error("Error fetching chat history:", error);
      }
    },
    [],
  );

  const refreshHistory = React.useCallback(() => {
    getChatSpaceHistory(limitRef.current);
  }, [getChatSpaceHistory]);

  const fetchCredits = React.useCallback(async () => {
    try {
      setCreditsLoading(true);
      const response = await fetch("/api/credits");

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data = await response.json();
      // console.log("credits data from context", data);
      setCredits(data.credits);
      setIsPremium(data.isPremium);
    } catch (err) {
      console.error("Error fetching credits:", err);
    } finally {
      setCreditsLoading(false);
    }
  }, []);

  const triggerCheck = React.useCallback(() => {
    refreshHistory();
  }, [refreshHistory]);

  const subscribeToNotifications = React.useCallback(
    (listener: (notification: ChatNotification) => void) => {
      notificationListenersRef.current.add(listener);

      return () => {
        notificationListenersRef.current.delete(listener);
      };
    },
    [],
  );

  React.useEffect(() => {
    refreshHistory();
  }, [limit, refreshHistory]);

  React.useEffect(() => {
    if (!notifyServerUrl || !userId) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) {
        return;
      }

      try {
        const websocketUrl = buildChatNotificationWebSocketUrl(
          notifyServerUrl,
          userId,
        );

        socket = new WebSocket(websocketUrl);

        socket.onopen = () => {
          refreshHistory();
        };

        socket.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data as string) as Partial<ChatNotification>;

            if (!notification.event) {
              return;
            }

            notificationListenersRef.current.forEach((listener) => {
              listener(notification as ChatNotification);
            });

            if (
              notification.event === CHAT_SPACE_CREATED_EVENT ||
              notification.event === CHAT_SPACE_UPDATED_EVENT
            ) {
              refreshHistory();
            }
          } catch (error) {
            console.error("Error handling chat sidebar notification:", error);
          }
        };

        socket.onerror = (error) => {
          console.error("Chat sidebar websocket error:", error);
        };

        socket.onclose = () => {
          if (cancelled) {
            return;
          }

          reconnectTimer = setTimeout(connect, 3000);
        };
      } catch (error) {
        console.error("Error connecting to notify server:", error);
      }
    };

    connect();

    return () => {
      cancelled = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      socket?.close();
    };
  }, [notifyServerUrl, refreshHistory, userId]);

  const contextValue = React.useMemo(
    () => ({
      limit,
      setLimit,
      history,
      setHistory,
      getChatSpaceHistory,
      triggerCheck,
      subscribeToNotifications,
      usersCredits: credits,
      isUserPremium: isPremium,
      creditsLoading,
      refetchCredits: fetchCredits,
    }),
    [
      limit,
      setLimit,
      setHistory,
      history,
      credits,
      isPremium,
      creditsLoading,
      getChatSpaceHistory,
      triggerCheck,
      subscribeToNotifications,
      fetchCredits,
    ],
  );

  // Fetch credits on mount
  React.useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return (
    <ChatPageContext.Provider value={contextValue}>
      {children}
    </ChatPageContext.Provider>
  );
};

export { ChatPageProvider, useChatHook };
