import { Card } from "@/components/ui/card";
import React from "react";
import MachineLogo from "./machine-logo";
import MarkedownRendered from "@/components/markdown-renderer";
import { useTheme } from "next-themes";
import { ClientMessageVideoType } from "@/lib/types";

type Props = {
  messageBody: string;
  error?: string;
  chat_videos?: ClientMessageVideoType[];
};

const AssistantBubble = React.memo(function AssistantBubble({
  messageBody,
  error,
  chat_videos,
}: Props) {
  const { theme } = useTheme();
  return (
    <div className="flex justify-start items-end gap-2">
      <MachineLogo />
      {error ? (
        <Card className="p-4 sm:max-w-3/4 max-w-full w-max rounded-md bg-red-100 text-red-800 shadow-none">
          <p>Error: {error}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          <Card className="p-4 sm:max-w-3/4 max-w-full w-max rounded-md shadow-none">
            <MarkedownRendered content={messageBody} />
          </Card>
          {chat_videos?.map((video) => (
            <Card
              key={video.id}
              className="p-4 rounded-md shadow-none aspect-video"
            >
              {video.status === "pending" ? (
                <p>Loading...</p>
              ) : video.status === "completed" ? (
                <video src={video.url!} controls />
              ) : (
                <p>Failed to generate video</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});

export default AssistantBubble;
