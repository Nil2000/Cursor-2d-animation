import { Card } from "@/components/ui/card";
import React from "react";
import MachineLogo from "./machine-logo";
import { ClientMessageVideoType } from "@/lib/types";
import VideoMessage from "@/components/video-showcase";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";
import { extractPythonCode } from "@/lib/chat-utils/getPythonBlockCode";
import CodeDialog from "./code-dialog";

type Props = {
  body?: string;
  error?: string;
  chat_videos?: ClientMessageVideoType[];
  onVideoClick?: (allVideos: ClientMessageVideoType[]) => void;
};

const AssistantBubble = React.memo(function AssistantBubble({
  body,
  error,
  chat_videos,
  onVideoClick,
}: Props) {
  const [isCodeDialogOpen, setIsCodeDialogOpen] = React.useState(false);

  const handleVideoClick = React.useCallback(() => {
    if (chat_videos && onVideoClick) {
      onVideoClick(chat_videos);
    }
  }, [chat_videos, onVideoClick]);

  const displayVideo = React.useMemo(() => {
    return (
      chat_videos?.find((video) => video.quality === "medium") ??
      chat_videos?.[0]
    );
  }, [chat_videos]);

  const pythonCode = React.useMemo(() => {
    return body ? extractPythonCode(body) : null;
  }, [body]);

  return (
    <div className="flex justify-start items-start gap-2">
      <MachineLogo />
      {error ? (
        <Card className="p-4 sm:max-w-3/4 max-w-full w-max rounded-md bg-red-100 text-red-800 shadow-none">
          <p>Error: {error}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {displayVideo ? (
            <VideoMessage
              video={displayVideo}
              onVideoClick={handleVideoClick}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No video was generated for this reply.
            </p>
          )}

          {pythonCode && (
            <Button
              variant="outline"
              size="sm"
              className="w-max mt-1 gap-2 rounded-md"
              onClick={() => setIsCodeDialogOpen(true)}
            >
              <Code size={16} />
              View generated code
            </Button>
          )}

          {pythonCode && (
            <CodeDialog
              isOpen={isCodeDialogOpen}
              onClose={() => setIsCodeDialogOpen(false)}
              code={pythonCode}
            />
          )}
        </div>
      )}
    </div>
  );
});

export default AssistantBubble;
