"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";
import axios from "axios";
type Props = {
  chatId: string;
};

export default function ChatPage({ chatId }: Props) {
  const [text, setText] = React.useState("");
  const [chatSpaceInfo, setChatSpaceInfo] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  if (!session || !session.user) {
    return;
  }

  const userId = session.user.id;

  const getChatSpaceIfExists = async () => {
    const res = await axios.get(`/api/chat/${chatId}`);

    if (res.status !== 200) {
      console.log("error", res);
      return;
    }

    if (res.data.error) {
      console.log("error", res.data.error);
      return null;
    }

    const chatSpace = res.data.spaceInfo;
    console.log("chatSpace", chatSpace);

    setChatSpaceInfo(chatSpace);
    return chatSpace;
  };

  // const getStreamResponse = async () => {
  //   const res=await axios.post(`/api/chat/${chatId}`, {
  //     message: "hello",
  //   }, {
  //     responseType: "stream",
  //   });

  //   if (res.status !== 200) {
  //     console.log("error", res);
  //     return;
  //   }

  //   const reader = res.data.getReader();
  //   const decoder = new TextDecoder("utf-8");
  //   let done = false;
  //   while (!done) {
  //     const { done: doneReading, value } = await reader.read();
  //     done = doneReading;
  //     const text = decoder.decode(value, { stream: !done });
  //     console.log("text", text);

  //     setText((prev) => prev + text);
  //   }
  // }

  const getLastMessageFromLocalStorage = () => {
    const localStorageData = localStorage.getItem(`user/${userId}`);
    if (!localStorageData) {
      console.log("no data");
      return;
    }
    const userData = JSON.parse(localStorageData);
    if (!userData.lastSearchedFor) {
      console.log("no last searched for");
      return;
    }
    return userData.lastSearchedFor.text;
  };

  const getTextResponse = async (message: string) => {
    const res = await axios.post(`/api/chat/`, {
      message: message,
      chatId: chatId,
    });

    if (res.status !== 200) {
      console.log("error", res);
      return;
    }

    const text = res.data.text;
    console.log("text", text);
    setText(text);
  };

  const init = async () => {
    const chatSpaceExists = await getChatSpaceIfExists();
    if (!chatSpaceExists) {
      console.log("no chat space");
      const message = getLastMessageFromLocalStorage();
      await getTextResponse(message);
      return;
    }
  };
  React.useEffect(() => {
    init();
  }, []);
  return (
    <div>
      client: {chatId} {text}
    </div>
  );
}
