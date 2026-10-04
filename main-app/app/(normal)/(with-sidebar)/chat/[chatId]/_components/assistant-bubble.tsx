import React from "react";
import { Code } from "lucide-react";
import AnimationFrame, { stageFromReply } from "@/components/animation-frame";
import { Button } from "@/components/ui/button";
import { ClientMessageVideoType } from "@/lib/types";
import { extractPythonCode } from "@/lib/chat-utils/getPythonBlockCode";
import AssistantRow from "./assistant-row";
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

  const displayVideo = React.useMemo(() => {
    return (
      chat_videos?.find((video) => video.quality === "medium") ??
      chat_videos?.[0]
    );
  }, [chat_videos]);

  const pythonCode = React.useMemo(() => {
    return body ? extractPythonCode(body) : null;
  }, [body]);

  const stage = stageFromReply(error, displayVideo);

  const handleVideoClick = React.useCallback(() => {
    if (chat_videos && onVideoClick) {
      onVideoClick(chat_videos);
    }
  }, [chat_videos, onVideoClick]);

  const failureDetail = error
    ? error
    : displayVideo
      ? undefined
      : "No video was generated for this reply.";

  return (
    <AssistantRow>
      <div className="flex min-w-0 flex-col">
        <AnimationFrame
          stage={stage}
          video={displayVideo}
          onOpen={stage === "ready" ? handleVideoClick : undefined}
          error={stage === "failed" ? failureDetail : undefined}
          action={
            pythonCode ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-md"
                onClick={() => setIsCodeDialogOpen(true)}
              >
                <Code size={16} />
                View code
              </Button>
            ) : null
          }
        />
        {pythonCode && (
          <CodeDialog
            isOpen={isCodeDialogOpen}
            onClose={() => setIsCodeDialogOpen(false)}
            code={pythonCode}
          />
        )}
      </div>
    </AssistantRow>
  );
});

export default AssistantBubble;
