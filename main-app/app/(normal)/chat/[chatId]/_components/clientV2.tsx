"use client";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import UserBubble from "./user-bubble";
import AssistantBubble from "./assistant-bubble";

type Props = {
  chatId: string;
  spaceExists: boolean;
  userInfo: UserInfoType;
};

export default function ChatPageV2({ chatId, spaceExists, userInfo }: Props) {
  const [messages, setMessages] = React.useState<ClientMessageType[]>([]);
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

    return res.data.response as string;
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

  const init = async () => {
    console.log("init", chatId, spaceExists, userInfo);
    if (!spaceExists) {
      console.log("no chat space");
      const message = getLastMessageFromLocalStorage();
      const response = await getTextResponseForNewSpace(message);
      if (!response) {
        console.log("no response");
        return;
      }
      setMessages((prev) => [
        ...prev,
        { type: "user", body: message },
        { type: "assistant", body: response },
      ]);
      return;
    }
    console.log("chat space exists");
    getChatHistory();
  };
  React.useEffect(() => {
    init();
  }, [chatId, spaceExists]);
  return (
    <div className="w-full lg:w-[1000px] mx-auto p-4">
      <div className="flex flex-col gap-4">
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
    </div>
  );
}
