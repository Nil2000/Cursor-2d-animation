import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export default function VideoDialogShowCase({
  videoUrl,
  showDialog,
  onDialogClose,
}: {
  videoUrl: string;
  showDialog: boolean;
  onDialogClose: () => void;
}) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!videoUrl) {
      console.error("No video URL available for download");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch(videoUrl, {
        method: "GET",
        headers: {
          Accept: "video/mp4,video/*,*/*",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch video: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `generated_video_${Date.now()}.mp4`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading video:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={onDialogClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Generated Video</DialogTitle>
        </DialogHeader>
        {videoUrl && (
          <div className="aspect-video w-full">
            <video
              src={videoUrl}
              controls
              className="w-full h-full rounded-md"
              autoPlay
            />
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={handleDownload}
            disabled={isDownloading || !videoUrl}
            className="flex items-center gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
