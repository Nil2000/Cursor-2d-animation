import React, { memo } from "react";
import { Card } from "./ui/card";
import { ClientMessageVideoType } from "@/lib/types";
import { ShimmeringText } from "./shimmering-text";
import { Play } from "lucide-react";

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
        ) : video.status === "completed" && video.url ? (
          <Card
            className="relative rounded-md shadow-sm overflow-hidden cursor-pointer group"
            onClick={() => onVideoClick?.(video)}
            style={{ width: "320px", aspectRatio: "16/9" }}
          >
            <video
              src={video.url}
              className="w-full h-full object-cover bg-black"
              preload="metadata"
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-primary/90 text-primary-foreground rounded-full p-3 backdrop-blur-sm">
                <Play className="w-6 h-6 fill-current" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              Click to view
            </div>
          </Card>
        ) : (
          <p className="text-red-500 text-sm">Failed to generate video</p>
        )}
      </div>
    );
  },
);

VideoMessage.displayName = "VideoMessage";

export default VideoMessage;
