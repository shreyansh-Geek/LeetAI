"use client";

import { PlaylistItem } from "../../types/course";
import { PlaylistVideoItem } from "./PlaylistVideoItem";
import { Music2 } from "lucide-react";

interface Props {
  playlist: PlaylistItem[];
}

export function PlaylistCard({ playlist }: Props) {
  const hasItems = playlist && playlist.length > 0;

  return (
    <section className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Music2 className="text-[#24CFA6] w-5 h-5" />
        <h2 className="text-xl font-semibold text-white">Complete Video Playlist</h2>
      </div>

      {!hasItems ? (
        <p className="text-gray-400 text-sm">
          No playlist generated for this course.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {playlist.map((video, idx) => (
            <PlaylistVideoItem key={idx} video={video} index={idx + 1} />
          ))}
        </div>
      )}
    </section>
  );
}
