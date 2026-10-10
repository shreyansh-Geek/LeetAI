export function formatDuration(
  duration: number | string | undefined
): string {
  if (duration === undefined || duration === null || duration === "") {
    return "--:--";
  }

  // Handle numeric durations (seconds).
  if (typeof duration === "number") {
    return formatSeconds(duration);
  }

  const value = duration.trim();

  if (!value) return "--:--";

  // Handle ISO 8601 durations, e.g. PT5M30S or PT1H5M30S.
  const isoMatch = value.match(
    /^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i
  );

  if (isoMatch) {
    const hours = Number(isoMatch[1] || 0);
    const minutes = Number(isoMatch[2] || 0);
    const seconds = Number(isoMatch[3] || 0);

    return formatSeconds(hours * 3600 + minutes * 60 + seconds);
  }

  // Handle MM:SS and HH:MM:SS.
  if (/^\d+(?::\d{1,2}){1,2}$/.test(value)) {
    const parts = value.split(":").map(Number);

    const totalSeconds =
      parts.length === 3
        ? parts[0] * 3600 + parts[1] * 60 + parts[2]
        : parts[0] * 60 + parts[1];

    return formatSeconds(totalSeconds);
  }

  // Handle numeric strings representing seconds.
  if (/^\d+(?:\.\d+)?$/.test(value)) {
    return formatSeconds(Number(value));
  }

  return "--:--";
}

function formatSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "--:--";
  }

  const total = Math.floor(totalSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
