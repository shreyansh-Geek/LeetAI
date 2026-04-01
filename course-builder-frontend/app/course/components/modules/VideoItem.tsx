"use client";

import { ModuleVideo } from "../../types/module";
import { ExternalLink } from "lucide-react";

function ensureYouTubeUrl(url: string) {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  return `https://www.youtube.com/watch?v=${url}`;
}

interface Props {
  video: ModuleVideo;
  index: number;
}

export function VideoItem({ video, index }: Props) {
  return (
    <a
      href={ensureYouTubeUrl(video.url)}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block bg-[#0e0e0e] border border-[#1f1f1f] rounded-lg p-3 
        hover:border-[#24CFA6]/40 hover:bg-[#111] transition
      "
    >
      <div className="flex items-center justify-between">
        <p className="text-white font-medium">
          {index}. {video.title}
        </p>

        <ExternalLink className="w-4 h-4 text-[#24CFA6]" />
      </div>

      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
        {video.whyChosen || video.reason || "Recommended based on your preferences."}
      </p>
    </a>
  );
}
