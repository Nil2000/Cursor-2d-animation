import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { ClientMessageVideoType } from "@/lib/types";
import VideoSelect, { getQualityLabel } from "./video-select";

export default function VideoDialogShowCase({
  videos,
  showDialog,
  onDialogClose,
}: {
  videos: ClientMessageVideoType[];
  showDialog: boolean;
  onDialogClose: () => void;
}) {
  const [selectedQuality, setSelectedQuality] =
    React.useState<string>("medium");
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  // Get the currently selected video based on quality
  const selectedVideo = React.useMemo(() => {
    return videos.find((v) => v.quality === selectedQuality);
  }, [videos, selectedQuality]);

  // Reset to medium quality when dialog opens
  React.useEffect(() => {
    if (showDialog) {
      setSelectedQuality("medium");
      setDownloadError(null);
    }
  }, [showDialog]);

  const handleDownload = async () => {
    if (!selectedVideo?.url) {
      setDownloadError("No video URL available for download");
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(selectedVideo.url, {
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
      link.download = `generated_video_${selectedQuality}_${Date.now()}.mp4`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading video:", error);
      setDownloadError("Failed to download the video. Please try again.");
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
        {selectedVideo?.url ? (
          <div className="aspect-video w-full bg-black rounded-md overflow-hidden flex items-center justify-center">
            <video
              key={selectedVideo.url}
              src={selectedVideo.url}
              controls
              className="w-full h-full"
              autoPlay
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted rounded-md flex flex-col items-center justify-center text-muted-foreground gap-3">
            {selectedVideo?.status === "pending" ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Video is still being generated...</p>
              </>
            ) : selectedVideo?.status === "failed" ? (
              <>
                <AlertCircle className="w-8 h-8 text-destructive" />
                <p className="text-destructive">Failed to generate this quality</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8" />
                <p>Video is unavailable</p>
              </>
            )}
          </div>
        )}
        
        {downloadError && (
          <div className="text-sm text-destructive text-center">
            {downloadError}
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Quality:</label>
              <VideoSelect
                value={selectedQuality}
                onValueChange={setSelectedQuality}
                videos={videos}
              />
            </div>
            <Button
              onClick={handleDownload}
              disabled={
                isDownloading ||
                !selectedVideo?.url ||
                selectedVideo?.status !== "completed"
              }
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
                  Download {getQualityLabel(selectedQuality)}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
