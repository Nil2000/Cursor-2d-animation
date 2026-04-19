import { ClientMessageVideoType } from "@/lib/types";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const getQualityLabel = (quality: string) => {
  const labels: Record<string, string> = {
    high: "High (1080p)",
    medium: "Medium (720p)",
    low: "Low (480p)",
  };
  return labels[quality] || quality;
};

export default function VideoSelect({
  value,
  onValueChange,
  videos,
}: {
  value: string;
  onValueChange: (value: string) => void;
  videos: ClientMessageVideoType[];
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {videos.map((video) => (
          <SelectItem
            key={video.id}
            value={video.quality}
            disabled={video.status !== "completed"}
          >
            {getQualityLabel(video.quality)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
