import { Card } from "@/components/ui/card";
import React from "react";
import MachineLogo from "./machine-logo";
import MarkedownRendered from "@/components/markdown-renderer";
import { ClientMessageVideoType } from "@/lib/types";
import VideoMessage from "@/components/video-showcase";

type Props = {
  messageBody: string;
  error?: string;
  chat_videos?: ClientMessageVideoType[];
  onVideoClick?: (allVideos: ClientMessageVideoType[]) => void;
};

const AssistantBubble = React.memo(function AssistantBubble({
  messageBody,
  error,
  chat_videos,
  onVideoClick,
}: Props) {
  // Handler to pass all videos when any video is clicked
  const handleVideoClick = React.useCallback(() => {
    if (chat_videos && onVideoClick) {
      onVideoClick(chat_videos);
    }
  }, [chat_videos, onVideoClick]);

  // Show only medium quality video card (default)
  const mediumQualityVideo = React.useMemo(() => {
    return chat_videos?.find((video) => video.quality === "medium");
  }, [chat_videos]);

  return (
    <div className="flex justify-start items-end gap-2">
      <MachineLogo />
      {error ? (
        <Card className="p-4 sm:max-w-3/4 max-w-full w-max rounded-md bg-red-100 text-red-800 shadow-none">
          <p>Error: {error}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          <Card className="p-4 sm:max-w-3/4 rounded-md shadow-none">
            <MarkedownRendered content={messageBody} />
          </Card>
          {mediumQualityVideo && (
            <VideoMessage
              video={mediumQualityVideo}
              onVideoClick={handleVideoClick}
            />
          )}
        </div>
      )}
    </div>
  );
});

export default AssistantBubble;
