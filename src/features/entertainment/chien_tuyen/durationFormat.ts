function normalizeDurationSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  return Math.max(0, Math.ceil(seconds));
}

export function formatChienTuyenDurationSeconds(secondsInput: number): string {
  const seconds = normalizeDurationSeconds(secondsInput);
  if (seconds < 60) return `${seconds} giây`;
  const secondPart = String(seconds % 60).padStart(2, "0");
  const totalMinutes = Math.floor(seconds / 60);
  if (seconds < 3600) {
    return `${String(totalMinutes).padStart(2, "0")}:${secondPart}`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${secondPart}`;
}

export function formatChienTuyenDurationMs(durationMs: number): string {
  const safeMs = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
  return formatChienTuyenDurationSeconds(Math.ceil(safeMs / 1000));
}

export function formatChienTuyenDurationForAriaMs(durationMs: number): string {
  const safeMs = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
  const seconds = normalizeDurationSeconds(Math.ceil(safeMs / 1000));
  if (seconds < 60) return `${seconds} giây`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} giờ`);
  if (minutes > 0) parts.push(`${minutes} phút`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds} giây`);
  return parts.length > 0 ? parts.join(" ") : "0 giây";
}
