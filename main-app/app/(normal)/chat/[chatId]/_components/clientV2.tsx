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
  const [loading, setLoading] = React.useState<boolean>(false);
  const [inputText, setInputText] = React.useState<string>("");
  const messageContainerRef = React.useRef<HTMLDivElement>(null);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
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

  const getTextResponseForNewSpace = async (message: string) => {
    const res = await axios.post(`/api/chat/`, {
      message: message,
      chatId: chatId,
    });

    if (res.status !== 200) {
      console.log("error", res);
      return;
    }

    return {
      response: res.data.response,
      contextId: res.data.contextId || null,
      title: res.data.title || "No Title Provided",
    };
  };

  const getChatHistory = async () => {
    const res = await axios.get(`/api/chat/${chatId}`);

    if (res.status !== 200) {
      console.log("error", res);
      router.push("/");
      return;
    }

    console.log("chat history", res.data.messages);

    setMessages(res.data.messages);
  };

  const handleSendMessage = async () => {
    if (!inputText || inputText.trim().length === 0) {
      return;
    }
    const contextId = messages[messages.length - 1]?.contextId || null;
    setLoading(true);
    const newMessage: ClientMessageType = {
      type: "user",
      body: inputText,
      contextId: null,
    };
    const responseMessage: ClientMessageType = {
      type: "assistant",
      body: "",
      contextId: null,
      loading: true,
    };
    setMessages((prev) => [...prev, newMessage, responseMessage]);
    setInputText("");

    try {
      const res = await axios.post(`/api/chat/${chatId}`, {
        message: inputText,
        contextId: contextId,
      });

      if (res.status !== 200) {
        console.log("error", res);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            ...responseMessage,
            error: "Error sending message. Please try again.",
            loading: false,
          },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          ...responseMessage,
          body: res.data.response,
          contextId: res.data.contextId || null,
          loading: false,
        },
      ]);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const init = async () => {
    console.log("init", chatId, spaceExists, userInfo);
    setSpaceLoading(true);
    if (!spaceExists) {
      console.log("no chat space");
      const message = getLastMessageFromLocalStorage();
      const textResponse = await getTextResponseForNewSpace(message);
      if (!textResponse) {
        console.log("no response");
        return;
      }
      setMessages((prev) => [
        ...prev,
        { type: "user", body: message },
        {
          type: "assistant",
          body: textResponse?.response,
          contextId: textResponse?.contextId || null,
        },
      ]);
      setTitle(textResponse?.title);
      setSpaceLoading(false);
      return;
    }
    console.log("chat space exists");
    setTitle(chatTitle || "Chat");
    getChatHistory();
    setSpaceLoading(false);
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
                handleSendMessage();
              }
            }}
            ref={inputContainerRef}
          />
          <div className="flex justify-end">
            <Button
              className="rounded-lg h-9 w-9"
              onClick={handleSendMessage}
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
