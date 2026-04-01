export function formatDuration(duration: number | string): string {
  const d = typeof duration === "string" ? parseInt(duration) : duration;

  if (!d || isNaN(d)) return "0:00";

  const minutes = Math.floor(d / 60);
  const seconds = d % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

