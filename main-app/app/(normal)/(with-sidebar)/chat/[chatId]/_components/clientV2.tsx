"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import UserBubble from "./user-bubble";
import AssistantBubble from "./assistant-bubble";
import AssistantLoadingBubble from "./assistant-loading-bubble";
import MachineLogo from "./machine-logo";
import { Loader, Send } from "lucide-react";
import TextComponent from "@/components/text-component";
import { Button } from "@/components/ui/button";
import {
  ChatGenerationApiSuccess,
  ClientMessageType,
  Role,
  UserInfoType,
  ClientMessageVideoType,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import VideoDialogShowCase from "./video-showcase-dialog";
import { useChatHook } from "@/components/providers/chat-provider";
import {
  CHAT_VIDEO_STATUS_UPDATED_EVENT,
  type ChatNotification,
} from "@/lib/chat-utils/chatNotifications";

type Props = {
  chatId: string;
  spaceExists: boolean;
  userInfo: UserInfoType;
};

export default function ChatPageV2({ chatId, spaceExists, userInfo }: Props) {
  const [messages, setMessages] = React.useState<ClientMessageType[]>([]);
  const [spaceLoading, setSpaceLoading] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(
    spaceExists ? false : true,
  );
  const [inputText, setInputText] = React.useState<string>("");
  const [videoDialogOpen, setVideoDialogOpen] = React.useState<boolean>(false);
  const [selectedVideos, setSelectedVideos] = React.useState<
    ClientMessageVideoType[]
  >([]);
  const messageContainerRef = React.useRef<HTMLDivElement>(null);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const abortController = React.useRef<AbortController | null>(null);
  const router = useRouter();
  const { usersCredits, creditsLoading, refetchCredits, subscribeToNotifications } =
    useChatHook();

  const handleOpenVideoDialog = React.useCallback(
    (allVideos: ClientMessageVideoType[]) => {
      setSelectedVideos(allVideos);
      setVideoDialogOpen(true);
    },
    [],
  );

  // Check if there are any pending video generations
  const hasPendingVideos = React.useMemo(() => {
    return messages.some((message) =>
      message.chat_videos?.some((video) => video.status === "pending"),
    );
  }, [messages]);

  // Check if user has credits
  const canSendMessage = React.useMemo(() => {
    return usersCredits > 0;
  }, [usersCredits]);

  // Check if we can show retry button (last message is from assistant and has failed video generation)
  const canRetry = React.useMemo(() => {
    if (messages.length < 2 || loading) return false;

    // Check if user has credits
    if (usersCredits === 0) return false;

    const lastMessage = messages[messages.length - 1];

    // Only show retry if last message is from assistant and has failed video generation
    if (lastMessage.type !== Role.Assistant) return false;

    // Check if there are any failed videos in the last assistant message
    const hasFailedVideos = lastMessage.chat_videos?.some(
      (video) => video.status === "failed",
    );

    return hasFailedVideos || false;
  }, [messages, loading, usersCredits]);

  const getLastMessageFromLocalStorage = React.useCallback(() => {
    const key = `user/${userInfo.id}`;
    const localStorageData = localStorage.getItem(key);
    if (!localStorageData) {
      // console.log("no data");
      return null;
    }
    const userData = JSON.parse(localStorageData);
    if (!userData.lastSearchedFor) {
      // console.log("no last searched for");
      return null;
    }

    // Store the message text before deleting
    const messageText = userData.lastSearchedFor.text;

    // Delete the localStorage data completely
    localStorage.removeItem(key);

    return messageText;
  }, [userInfo.id]);

  const getChatHistory = React.useCallback(async () => {
    const res = await axios.get(`/api/chat/${chatId}`);

    if (res.status !== 200) {
      // console.log("error", res);
      router.push("/");
      return;
    }
    setMessages(res.data.messages);
  }, [chatId, router]);

  const handleChatApiResponse = React.useCallback(
    async (
      response: Response,
      resyncOnFailure?: () => void | Promise<void>,
    ) => {
      try {
        const raw = await response.json().catch(() => null);

        if (!response.ok) {
          if (resyncOnFailure) {
            await resyncOnFailure();
          } else {
            const errMsg =
              raw &&
              typeof raw === "object" &&
              "error" in raw &&
              typeof (raw as { error: unknown }).error === "string"
                ? (raw as { error: string }).error
                : "Request failed";
            setMessages((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}`,
                type: Role.Assistant,
                body: "",
                error: errMsg,
                contextId: null,
              },
            ]);
          }
          return;
        }

        const success = raw as ChatGenerationApiSuccess;
        if (
          !success ||
          typeof success.body !== "string" ||
          !Array.isArray(success.videos)
        ) {
          throw new Error("Invalid response shape");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            type: Role.Assistant,
            body: success.body,
            contextId: null,
            chat_videos: success.videos.length > 0 ? success.videos : undefined,
          },
        ]);

        if (success.videos.length > 0) {
          void refetchCredits();
        }
      } catch (error) {
        console.error("Error handling chat response:", error);
        if (resyncOnFailure) {
          await resyncOnFailure();
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              type: Role.Assistant,
              body: "",
              error: "Failed to process response",
              contextId: null,
            },
          ]);
        }
      } finally {
        setLoading(false);
        abortController.current = null;
      }
    },
    [refetchCredits],
  );

  const handleSendMessage = React.useCallback(
    async (input: string) => {
      if (!input || input.trim().length === 0) {
        return;
      }
      if (usersCredits === 0) {
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
        const response = await fetch(`/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            chatId: chatId,
          }),
          signal: abortController.current?.signal,
        });

        await handleChatApiResponse(response);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sending message:", error);
        }
        setLoading(false);
        abortController.current = null;
      }
    },
    [chatId, handleChatApiResponse, usersCredits],
  );

  const handleRetry = React.useCallback(async () => {
    // Check credits before retrying
    if (usersCredits === 0) {
      return;
    }

    setLoading(true);

    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      // Remove the last message from the UI immediately (it should be an assistant message)
      setMessages((prev) => prev.slice(0, -1));

      const response = await fetch(`/api/chat/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chatId,
        }),
        signal: abortController.current?.signal,
      });

      await handleChatApiResponse(response, getChatHistory);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error retrying message:", error);
        await getChatHistory();
      }
      setLoading(false);
      abortController.current = null;
    }
  }, [chatId, getChatHistory, handleChatApiResponse, usersCredits]);

  const init = React.useCallback(async () => {
    setSpaceLoading(false);
    // console.log("init", chatId, spaceExists, userInfo);
    if (!spaceExists) {
      // console.log("no chat space");
      const message = getLastMessageFromLocalStorage();

      if (!message) {
        router.push("/chat");
        // console.log("no message");
        return;
      }
      handleSendMessage(message);
    } else {
      // get Chat history
      getChatHistory();
    }
  }, [getChatHistory, getLastMessageFromLocalStorage, handleSendMessage, router, spaceExists]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    void init();
  }, [init]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  React.useEffect(() => {
    if (!videoDialogOpen || selectedVideos.length === 0) {
      return;
    }

    const videosById = new Map<string, ClientMessageVideoType>();
    messages.forEach((message) => {
      message.chat_videos?.forEach((video) => {
        videosById.set(video.id, video);
      });
    });

    setSelectedVideos((current) => {
      let hasChanges = false;

      const nextVideos = current.map((video) => {
        const updatedVideo = videosById.get(video.id);
        if (
          updatedVideo &&
          (updatedVideo.status !== video.status || updatedVideo.url !== video.url)
        ) {
          hasChanges = true;
          return updatedVideo;
        }

        return video;
      });

      return hasChanges ? nextVideos : current;
    });
  }, [messages, videoDialogOpen, selectedVideos.length]);

  React.useEffect(() => {
    return subscribeToNotifications((notification: ChatNotification) => {
      if (notification.event !== CHAT_VIDEO_STATUS_UPDATED_EVENT) {
        return;
      }

      if (notification.payload.chatSpaceId !== chatId) {
        return;
      }

      const updatedVideosById = new Map(
        notification.payload.videos.map((video) => [video.id, video]),
      );

      setMessages((prev) => {
        let hasChanges = false;

        const nextMessages = prev.map((message) => {
          if (!message.chat_videos?.length) {
            return message;
          }

          let messageChanged = false;

          const nextVideos = message.chat_videos.map((video) => {
            const updatedVideo = updatedVideosById.get(video.id);

            if (!updatedVideo) {
              return video;
            }

            if (
              updatedVideo.status === video.status &&
              updatedVideo.url === video.url
            ) {
              return video;
            }

            messageChanged = true;
            hasChanges = true;

            return {
              ...video,
              status: updatedVideo.status,
              url: updatedVideo.url,
            };
          });

          return messageChanged
            ? {
                ...message,
                chat_videos: nextVideos,
              }
            : message;
        });

        return hasChanges ? nextMessages : prev;
      });

      void refetchCredits();
    });
  }, [chatId, refetchCredits, subscribeToNotifications]);

  if (spaceLoading) {
    return (
      <div className="mt-20">
        <Loader className="w-10 h-10 mx-auto animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] w-full relative">
      <div className="flex-1 overflow-y-auto w-full" ref={messageContainerRef}>
        <div className="flex flex-col gap-4 lg:max-w-[1000px] mx-auto p-4 pb-40 scroll-smooth items-center w-full">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center text-center mt-32 gap-4 text-muted-foreground w-full">
              <MachineLogo
                className="w-16 h-16 bg-secondary/50"
                iconSize={32}
              />
              <div>
                <h2 className="text-xl font-medium text-foreground">
                  How can I help you today?
                </h2>
                <p className="text-sm mt-2 max-w-sm mx-auto">
                  Type a prompt below to generate a new animation. I will write
                  the code and render a video for you.
                </p>
              </div>
            </div>
          )}
          {messages.length > 0 &&
            messages.map((message, index) => (
              <div key={message.id || index} className="w-full">
                {message.type === "user" ? (
                  <UserBubble
                    messageBody={message.body}
                    imgUrl={userInfo.image}
                    retry={canRetry && index === messages.length - 2}
                    retryHandler={handleRetry}
                  />
                ) : (
                  <AssistantBubble
                    body={message.body}
                    error={message.error}
                    chat_videos={message.chat_videos}
                    onVideoClick={handleOpenVideoDialog}
                  />
                )}
              </div>
            ))}
          {loading && (
            <div className="w-full">
              <AssistantLoadingBubble />
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center w-full px-4 py-4 bg-linear-to-t from-background via-background to-transparent z-10 pointer-events-none">
        <Card className="w-full lg:max-w-[1000px] rounded-lg min-h-16 p-2 flex flex-col justify-between gap-2 shadow-lg border-border/40 pointer-events-auto">
          {!canSendMessage && !creditsLoading && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-900">
              ⚠️ No credits available. Please purchase more credits to continue
              generating videos.
            </div>
          )}
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
            disabled={!canSendMessage}
          />
          <div className="flex justify-end items-center gap-2">
            <Button
              size={"icon"}
              onClick={() => handleSendMessage(inputText)}
              disabled={
                !inputText || loading || hasPendingVideos || !canSendMessage
              }
              title={!canSendMessage ? "No credits available" : ""}
            >
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Video Dialog with all qualities */}
      <VideoDialogShowCase
        videos={selectedVideos}
        showDialog={videoDialogOpen}
        onDialogClose={() => setVideoDialogOpen(false)}
      />
    </div>
  );
}
