"use client";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import UserBubble from "./user-bubble";
import AssistantBubble from "./assistant-bubble";
import { Loader, Send } from "lucide-react";
import TextComponent from "@/components/text-component";
import { Button } from "@/components/ui/button";
import { SyncLoader } from "react-spinners";
import { useChatPage } from "@/components/providers/chat-provider";
import { ClientMessageType, Role, UserInfoType } from "@/lib/types";

type Props = {
  chatId: string;
  spaceExists: boolean;
  userInfo: UserInfoType;
  chatTitle?: string;
};

export default function ChatPageV2({
  chatId,
  spaceExists,
  userInfo,
  chatTitle,
}: Props) {
  const [messages, setMessages] = React.useState<ClientMessageType[]>([]);
  const [spaceLoading, setSpaceLoading] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(
    spaceExists ? false : true
  );
  const [inputText, setInputText] = React.useState<string>("");
  const messageContainerRef = React.useRef<HTMLDivElement>(null);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const abortController = React.useRef<AbortController | null>(null);
  const router = useRouter();
  const { setTitle } = useChatPage();

  const getLastMessageFromLocalStorage = () => {
    const key = `user/${userInfo.id}`;
    const localStorageData = localStorage.getItem(key);
    if (!localStorageData) {
      console.log("no data");
      return;
    }
    const userData = JSON.parse(localStorageData);
    if (!userData.lastSearchedFor) {
      console.log("no last searched for");
      return;
    }
    localStorage.setItem(key, {
      ...userData,
      lastSearchedFor: {},
    });
    return userData.lastSearchedFor.text;
  };

  // const getTextResponseForNewSpace = async (message: string) => {
  //   const res = await axios.post(`/api/chat/`, {
  //     message: message,
  //     chatId: chatId,
  //   });

  //   if (res.status !== 200) {
  //     console.log("error", res);
  //     return;
  //   }

  //   return {
  //     response: res.data.response,
  //     contextId: res.data.contextId || null,
  //     title: res.data.title || "No Title Provided",
  //   };
  // };

  // const getChatHistory = async () => {
  //   const res = await axios.get(`/api/chat/${chatId}`);

  //   if (res.status !== 200) {
  //     console.log("error", res);
  //     router.push("/");
  //     return;
  //   }

  //   console.log("chat history", res.data.messages);

  //   setMessages(res.data.messages);
  // };

  const processStream = async (response: Response, input: string) => {
    if (!response.ok) {
      console.log("error", response);
      throw new Error("Error processing stream");
    }
    const tempMessageId = `msg-${Date.now()}`;
    try {
      const reader = response.body?.getReader();
      if (!reader) {
        console.log("no reader");
        throw new Error("No reader");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: tempMessageId,
          type: Role.Assistant,
          body: "",
          contextId: null,
          loading: true,
        },
      ]);

      let accumulatedContent = "";
      let buffer = "";
      let updateTimeout: NodeJS.Timeout | null = null;

      const updateMessage = (body: string) => {
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }

        updateTimeout = setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessageId ? { ...msg, body } : msg
            )
          );
        }, 50);
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessageId
                ? { ...msg, body: accumulatedContent }
                : msg
            )
          );

          if (updateTimeout) {
            clearTimeout(updateTimeout);
          }
          break;
        }
        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let hasNewContent = false;

        for (const line of lines) {
          if (line.trim() === "") continue;

          if (line.startsWith("data: ")) {
            const data = line.substring(6);

            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsedData = JSON.parse(data) as {
                content?: string;
              };
              const content = parsedData.content;
              if (content) {
                accumulatedContent += content;
                hasNewContent = true;
              }
            } catch (e) {
              console.error("Error parsing JSON:", e, "Raw data:", data);
              // If it's not JSON, treat it as raw text (fallback)
              if (data && data !== "[DONE]") {
                accumulatedContent += data;
                hasNewContent = true;
              }
            }
          } else if (line.trim()) {
            // Handle non-SSE format as fallback
            accumulatedContent += line;
            hasNewContent = true;
          }
        }
        if (hasNewContent) {
          updateMessage(accumulatedContent);
        }
      }
    } catch (error) {
      console.log("error", error);
      console.error("Error processing stream:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId
            ? { ...msg, content: "Error: Failed to process response" }
            : msg
        )
      );
    } finally {
      setLoading(false);
      abortController.current = null;
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!input || input.trim().length === 0) {
      return;
    }
    const userInput = {
      id: `msg-${Date.now()}`,
      type: Role.User,
      body: input,
    };
    setMessages((prev) => [...prev, userInput]);
    setInputText("");
    setLoading(true);

    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      setTimeout(() => {
        void (async () => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,
              {
                method: "POST",
                body: JSON.stringify({
                  message: input,
                  chatId: chatId,
                }),
                signal: abortController.current?.signal,
              }
            );

            await processStream(response, input);
          } catch (error) {
            if ((error as Error).name !== "AbortError") {
              console.error("Error sending message:", error);
            }
            setLoading(false);
          }
        })();
      }, 0);
    } catch (error) {
      console.error("Error preparing request:", error);
    } finally {
      setLoading(false);
    }
  };

  const init = async () => {
    setSpaceLoading(false);
    console.log("init", chatId, spaceExists, userInfo);
    if (!spaceExists) {
      console.log("no chat space");
      const message = getLastMessageFromLocalStorage();

      if (!message) {
        console.log("no message");
        return;
      }
      handleSendMessage(message);
    } else {
      // get Chat history
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    init();
  }, [chatId, spaceExists]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (spaceLoading) {
    return (
      <div className="mt-20">
        <Loader className="w-10 h-10 mx-auto animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full mt-16 relative overflow-y-auto">
        <div
          className="flex flex-col gap-4 w-full lg:max-w-[1000px] mx-auto p-4 h-[calc(100vh-12rem)] scroll-smooth items-center"
          ref={messageContainerRef}
        >
          {messages.length > 0 &&
            messages.map((message, index) => (
              <div key={index} className="w-full">
                {message.type === "user" ? (
                  <UserBubble
                    messageBody={message.body}
                    imgUrl={userInfo.image}
                  />
                ) : (
                  <AssistantBubble
                    messageBody={message.body}
                    error={message.error}
                    loading={message.loading}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
      <div className="absolute bottom-0 flex justify-center w-full p-4 px-6 mr-2 gap-4 z-10">
        <div className="w-full lg:max-w-[1000px] bg-accent rounded-lg min-h-16 p-2 flex flex-col justify-between gap-2">
          <TextComponent
            onChange={(value: string) => setInputText(value)}
            value={inputText}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputText);
              }
            }}
            ref={inputContainerRef}
          />
          <div className="flex justify-end">
            <Button
              className="rounded-lg h-9 w-9"
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText || loading}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
