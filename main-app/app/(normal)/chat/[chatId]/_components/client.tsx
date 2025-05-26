"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";
import axios from "axios";
type Props = {
  chatId: string;
  spaceExists: boolean;
};

export default function ChatPage({ chatId, spaceExists }: Props) {
  const [text, setText] = React.useState("");
  const [chatSpaceInfo, setChatSpaceInfo] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<ClientMessageType[]>([]);
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

    setMessages(res.data.messages);
  };

  const init = async () => {
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
        { role: "user", body: message },
        { role: "assistant", body: response },
      ]);
    } else {
      getChatHistory();
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
