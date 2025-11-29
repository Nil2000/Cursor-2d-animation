import React, { memo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ClientMessageVideoType } from "@/lib/types";
import { ShimmeringText } from "./shimmering-text";

const VideoMessage = memo(
  ({
    video,
    onVideoClick,
  }: {
    video: ClientMessageVideoType;
    onVideoClick?: (video: ClientMessageVideoType) => void;
  }) => {
    return (
      <div className="w-max">
        {video.status === "pending" ? (
          <ShimmeringText
            className="font-semibold text-sm"
            text="Video is being generated..."
            wave
          />
        ) : video.status === "completed" ? (
          <Card className="p-4 rounded-md shadow-none w-max flex flex-row items-center gap-2 justify-between">
            <p className="text-sm">Video is ready to play</p>
            <Button
              className="cursor-pointer rounded-sm"
              onClick={() => onVideoClick?.(video)}
              size={"sm"}
            >
              Show video
            </Button>
          </Card>
        ) : (
          <p className="text-red-500">Failed to generate video</p>
        )}
      </div>
    );
  }
);

VideoMessage.displayName = "VideoMessage";

export default VideoMessage;
