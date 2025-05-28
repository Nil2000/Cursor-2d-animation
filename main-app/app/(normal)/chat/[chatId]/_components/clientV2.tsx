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

type Props = {
  chatId: string;
  spaceExists: boolean;
  userInfo: UserInfoType;
};

export default function ChatPageV2({ chatId, spaceExists, userInfo }: Props) {
  const [messages, setMessages] = React.useState<ClientMessageType[]>([]);
  const [spaceLoading, setSpaceLoading] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [inputText, setInputText] = React.useState<string>("");
  const router = useRouter();
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
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    try {
      const res = await axios.post(`/api/chat/${chatId}`, {
        message: inputText,
        contextId: contextId,
      });

      if (res.status !== 200) {
        console.log("error", res);
        return;
      }

      const responseMessage: ClientMessageType = {
        type: "assistant",
        body: res.data.response,
        contextId: res.data.contextId || null,
      };
      setMessages((prev) => [...prev, responseMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const init = async () => {
    console.log("init", chatId, spaceExists, userInfo);
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
      return;
    }
    console.log("chat space exists");
    getChatHistory();
  };
  React.useEffect(() => {
    init();
    setSpaceLoading(false);
  }, [chatId, spaceExists]);

  if (spaceLoading) {
    return (
      <div>
        <Loader className="w-10 h-10 mx-auto animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[1000px] mx-auto relative h-full">
      <div className="flex flex-col gap-4 p-4">
        {messages.length > 0 &&
          messages.map((message, index) => (
            <div key={index}>
              {message.type === "user" ? (
                <UserBubble
                  messageBody={message.body}
                  imgUrl={userInfo.image}
                />
              ) : (
                <AssistantBubble messageBody={message.body} />
              )}
            </div>
          ))}
      </div>
      <div className="absolute bottom-0 flex justify-center w-full p-4 gap-4">
        <div className="w-full bg-accent rounded-lg min-h-16 p-2 flex flex-col justify-between gap-2">
          <TextComponent
            onChange={(value: string) => setInputText(value)}
            value={inputText}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
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
    </div>
  );
}
