"use client";
import axios from "axios";
import * as React from "react";

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
  usersCredits: number;
  isUserPremium: boolean;
  creditsLoading: boolean;
  refetchCredits: () => Promise<void>;
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
const ChatPageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [limit, setLimit] = React.useState(5);
  const [history, setHistory] = React.useState<{ id: string; title: string }[]>(
    []
  );
  const [triggerCheckHistory, setTriggerCheckHistory] = React.useState(false);
  
  // Credits state
  const [credits, setCredits] = React.useState<number>(0);
  const [isPremium, setIsPremium] = React.useState<boolean>(false);
  const [creditsLoading, setCreditsLoading] = React.useState<boolean>(true);

  const getChatSpaceHistory = async (limit: number) => {
    await axios
      .get(`/api/chat/history?limit=${limit}`)
      .then((response) => {
        setHistory(response.data);
      })
      .catch((error) => {
        console.error("Error fetching chat history:", error);
      });
  };

  const fetchCredits = async () => {
    try {
      setCreditsLoading(true);
      const response = await fetch("/api/credits");

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data = await response.json();
      console.log("credits data from context", data);
      setCredits(data.credits);
      setIsPremium(data.isPremium);
    } catch (err) {
      console.error("Error fetching credits:", err);
    } finally {
      setCreditsLoading(false);
    }
  };

  const triggerCheck = () => {
    setTriggerCheckHistory((prev) => !prev);
  };

  const contextValue = React.useMemo(
    () => ({
      limit,
      setLimit,
      history,
      setHistory,
      getChatSpaceHistory,
      triggerCheck,
      usersCredits: credits,
      isUserPremium: isPremium,
      creditsLoading,
      refetchCredits: fetchCredits,
    }),
    [limit, setLimit, history, getChatSpaceHistory, triggerCheck, credits, isPremium, creditsLoading]
  );

  React.useEffect(() => {
    getChatSpaceHistory(limit);
  }, [triggerCheckHistory]);

  // Fetch credits on mount
  React.useEffect(() => {
    fetchCredits();
  }, []);

  // Auto-refresh chat history every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      getChatSpaceHistory(limit);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [limit, getChatSpaceHistory]);

  return (
    <ChatPageContext.Provider value={contextValue}>
      {children}
    </ChatPageContext.Provider>
  );
};

export { ChatPageProvider, useChatHook };
