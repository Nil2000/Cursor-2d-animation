"use client";
import * as React from "react";

// Define the shape of the context
type ChatPageContextProps = {
  title: string;
  history: {
    id: string;
    title: string;
  }[];
  setTitle: (newTitle: string) => void;
  setHistory: (newHistory: { id: string; title: string }[]) => void;
};

// Create the context with default values
const ChatPageContext = React.createContext<ChatPageContextProps | null>(null);

function useChatPage() {
  const context = React.useContext(ChatPageContext);
  if (!context) {
    throw new Error("useChatPage must be used within a ChatPageProvider");
  }
  return context;
}

// Provider component for the ChatPageContext
const ChatPageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [title, setTitle] = React.useState("");
  const [history, setHistory] = React.useState<{ id: string; title: string }[]>(
    []
  );

  const contextValue = React.useMemo(
    () => ({ title, history, setTitle, setHistory }),
    [title, history]
  );

  return (
    <ChatPageContext.Provider value={contextValue}>
      {children}
    </ChatPageContext.Provider>
  );
};

export { ChatPageProvider, useChatPage };
