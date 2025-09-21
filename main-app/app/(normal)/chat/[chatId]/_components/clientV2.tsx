"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import UserBubble from "./user-bubble";
import AssistantBubble from "./assistant-bubble";
import { Loader, Send } from "lucide-react";
import TextComponent from "@/components/text-component";
import { Button } from "@/components/ui/button";
import { useChatHook } from "@/components/providers/chat-provider";
import {
  ClientMessageType,
  Role,
  UserInfoType,
  ClientMessageVideoType,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [videoDialogOpen, setVideoDialogOpen] = React.useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] =
    React.useState<ClientMessageVideoType | null>(null);
  const messageContainerRef = React.useRef<HTMLDivElement>(null);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const abortController = React.useRef<AbortController | null>(null);
  const pollingIntervals = React.useRef<Map<string, NodeJS.Timeout>>(new Map());
  const router = useRouter();

  const handleOpenVideoDialog = React.useCallback(
    (video: ClientMessageVideoType) => {
      setSelectedVideo(video);
      setVideoDialogOpen(true);
    },
    []
  );

  const pollVideoStatus = React.useCallback(async (videoId: string) => {
    try {
      const response = await fetch(`/api/video_status/${videoId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const videoStatus = await response.json();

      // Update the message with the new video status
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          chat_videos: msg.chat_videos?.map((video) =>
            video.id === videoId
              ? { ...video, status: videoStatus.status, url: videoStatus.url }
              : video
          ),
        }))
      );

      // If video is completed or failed, stop polling
      if (
        videoStatus.status === "completed" ||
        videoStatus.status === "failed"
      ) {
        const interval = pollingIntervals.current.get(videoId);
        if (interval) {
          clearInterval(interval);
          pollingIntervals.current.delete(videoId);
        }
        console.log(
          `Video ${videoId} polling stopped. Status: ${videoStatus.status}`
        );
      }
    } catch (error) {
      console.error(`Error polling video status for ${videoId}:`, error);

      // On error, mark video as failed and stop polling
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          chat_videos: msg.chat_videos?.map((video) =>
            video.id === videoId
              ? { ...video, status: "failed" as const }
              : video
          ),
        }))
      );

      const interval = pollingIntervals.current.get(videoId);
      if (interval) {
        clearInterval(interval);
        pollingIntervals.current.delete(videoId);
      }
    }
  }, []);

  const startVideoPolling = React.useCallback(
    (videoId: string) => {
      // Don't start polling if already polling this video
      if (pollingIntervals.current.has(videoId)) {
        return;
      }

      console.log(`Starting video polling for ${videoId}`);

      // Poll immediately
      pollVideoStatus(videoId);

      // Then poll every 3 seconds
      const interval = setInterval(() => {
        pollVideoStatus(videoId);
      }, 3000);

      pollingIntervals.current.set(videoId, interval);
    },
    [pollVideoStatus]
  );

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

  const getChatHistory = async () => {
    const res = await axios.get(`/api/chat/${chatId}`);

    if (res.status !== 200) {
      console.log("error", res);
      router.push("/");
      return;
    }
    setMessages(res.data.messages);
  };

  const processStream = async (response: Response, input: string) => {
    if (!response.ok) {
      console.log("error", response);
      throw new Error("Error processing stream");
    }
    const tempMessageId = `msg-${Date.now()}`;
    let streamMetadata: { chatId?: string; newChatVideoId?: string | null } =
      {};

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
                type?: string;
                chatId?: string;
                newChatVideoId?: string | null;
              };

              // Handle metadata
              if (parsedData.type === "metadata") {
                streamMetadata = {
                  chatId: parsedData.chatId,
                  newChatVideoId: parsedData.newChatVideoId,
                };
                console.log("Received stream metadata:", streamMetadata);
                continue;
              }

              // Handle content
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

      // After stream is complete, you can use the metadata
      if (
        streamMetadata.newChatVideoId &&
        typeof streamMetadata.newChatVideoId === "string"
      ) {
        console.log(
          "Stream completed with video ID:",
          streamMetadata.newChatVideoId
        );
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === tempMessageId) {
              return {
                ...msg,
                chat_videos: [
                  ...(msg.chat_videos || []),
                  {
                    id: streamMetadata.newChatVideoId as string,
                    status: "pending" as const,
                    url: null,
                  },
                ],
              };
            }
            return msg;
          })
        );
        // Start polling for the video status
        startVideoPolling(streamMetadata.newChatVideoId);
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
      getChatHistory();
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

  // Cleanup polling intervals when component unmounts or chatId changes
  React.useEffect(() => {
    return () => {
      // Clear all polling intervals
      pollingIntervals.current.forEach((interval) => {
        clearInterval(interval);
      });
      pollingIntervals.current.clear();
    };
  }, [chatId]);

  // Also start polling for any existing pending videos when component mounts
  React.useEffect(() => {
    messages.forEach((message) => {
      message.chat_videos?.forEach((video) => {
        if (
          video.status === "pending" &&
          !pollingIntervals.current.has(video.id)
        ) {
          startVideoPolling(video.id);
        }
      });
    });
  }, [messages, startVideoPolling]);

  if (spaceLoading) {
    return (
      <div className="mt-20">
        <Loader className="w-10 h-10 mx-auto animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-y-auto">
        <div
          className="flex flex-col gap-4 lg:max-w-[1000px] mx-auto p-4 h-[calc(100vh-12rem)] scroll-smooth items-center"
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
                    chat_videos={message.chat_videos}
                    onVideoClick={handleOpenVideoDialog}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
      <div className="absolute bottom-0 flex justify-center w-full px-6 pb-0 pt-2 mr-2 gap-4 z-10">
        <Card className="w-full lg:max-w-[1000px] rounded-lg min-h-16 p-2 flex flex-col justify-between gap-2">
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
              size={"icon"}
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText || loading}
            >
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Single Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Generated Video</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video w-full">
              <video
                src={selectedVideo.url!}
                controls
                className="w-full h-full rounded-md"
                autoPlay
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
