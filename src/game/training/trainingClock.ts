export const TRAINING_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Gets YYYY-MM-DD date key in Asia/Ho_Chi_Minh (GMT+7) timezone
 */
export function getTrainingDateKey(epochMs: number = Date.now(), timeZone: string = TRAINING_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date(epochMs)); // Returns YYYY-MM-DD
  } catch (err) {
    // Fallback if Intl timeZone fails
    const d = new Date(epochMs + 7 * 3600 * 1000); // GMT+7 offset
    return d.toISOString().slice(0, 10);
  }
}

/**
 * Returns epoch milliseconds for the next 00:00:00 in Asia/Ho_Chi_Minh timezone
 */
export function getNextTrainingResetAt(epochMs: number = Date.now(), timeZone: string = TRAINING_TIMEZONE): number {
  const currentDateKey = getTrainingDateKey(epochMs, timeZone);
  const [yearStr, monthStr, dayStr] = currentDateKey.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Next day 00:00:00 in local GMT+7
  const nextDateUtc = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
  
  // Calculate offset to GMT+7 (Asia/Ho_Chi_Minh has no DST, always +7 hours = +25200000ms)
  // 00:00 in GMT+7 is 17:00 of previous day UTC.
  const resetEpochMs = Date.UTC(year, month - 1, day + 1, 0, 0, 0) - (7 * 3600 * 1000);
  
  if (resetEpochMs <= epochMs) {
    return resetEpochMs + 24 * 3600 * 1000;
  }
  return resetEpochMs;
}

/**
 * Calculates human-readable time remaining until next 00:00 reset
 */
export function getFormattedResetCountdown(epochMs: number = Date.now(), timeZone: string = TRAINING_TIMEZONE): string {
  const resetMs = getNextTrainingResetAt(epochMs, timeZone);
  const diffMs = Math.max(0, resetMs - epochMs);

  const hours = Math.floor(diffMs / (3600 * 1000));
  const minutes = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  return `${minutes} phút`;
}
