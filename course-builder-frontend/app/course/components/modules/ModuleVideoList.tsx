"use client";

import { ModuleVideo } from "../../types/module";
import { VideoItem } from "./VideoItem";

interface Props {
  videos: ModuleVideo[];
}

export function ModuleVideoList({ videos }: Props) {
  if (!videos || videos.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No videos found for this module.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.map((video, i) => (
        <VideoItem key={i} video={video} index={i + 1} />
      ))}
    </div>
  );
}
