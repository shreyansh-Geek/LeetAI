"use client";

import { PlaylistItem } from "../../types/course";
import { ExternalLink } from "lucide-react";
import { formatDuration } from "../../utils/time";

function ensureYouTubeUrl(url: string) {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  return `https://www.youtube.com/watch?v=${url}`;
}

interface Props {
  video: PlaylistItem;
  index: number;
}

export function PlaylistVideoItem({ video, index }: Props) {
  const duration = typeof video.duration === "string"
    ? parseInt(video.duration)
    : video.duration || 0;

  return (
    <a
      href={ensureYouTubeUrl(video.url)}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex items-center justify-between p-3 rounded-lg 
        bg-[#0f0f0f] border border-[#1f1f1f] 
        hover:bg-[#151515] hover:border-[#24CFA6]/40 transition
      "
    >
      <div>
        <p className="text-white text-sm font-medium">
          {index}. {video.title}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {video.channel} • {formatDuration(duration)}
        </p>
      </div>

      <ExternalLink className="text-[#24CFA6] w-4 h-4" />
    </a>
  );
}
