"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-[#0d0d0d] text-white px-6 text-center">

      <AlertTriangle className="w-10 h-10 text-red-500" />

      <h2 className="text-lg font-semibold text-red-400">
        Something went wrong
      </h2>

      <p className="text-gray-300 text-sm max-w-md">{message}</p>

      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
      >
        Retry
      </button>
    </div>
  );
}
