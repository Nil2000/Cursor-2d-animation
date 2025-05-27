"use client";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";

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
    console.log("init", chatId, spaceExists);
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
    <div>
      clientV2
      <div>
        {messages.length > 0 &&
          messages.map((message, index) => (
            <div key={index}>
              <strong>{message.type}:</strong>
              <br /> {JSON.stringify(message.body)}
            </div>
          ))}
      </div>
    </div>
  );
}
