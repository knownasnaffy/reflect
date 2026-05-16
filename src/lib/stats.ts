import { JournalEntry } from "../types";

/**
 * Calculates current journaling streak in days.
 * A streak is broken if a day is skipped.
 */
export function calculateCurrentStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  // Sort entries by date descending (newest first)
  const sortedDates = entries
    .map(e => new Date(e.date).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  // Remove duplicates (multiple entries on the same day)
  const uniqueDates = Array.from(new Set(sortedDates));

  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 86400000;

  // If latest entry is older than yesterday, streak is 0
  if (uniqueDates[0] < yesterday) {
    return 0;
  }

  let streak = 0;
  let expectedDate = uniqueDates[0];

  for (const date of uniqueDates) {
    if (date === expectedDate) {
      streak++;
      expectedDate -= 86400000; // subtract one day
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates the maximum journaling streak achieved.
 */
export function calculateMaxStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedDates = entries
    .map(e => new Date(e.date).setHours(0, 0, 0, 0))
    .sort((a, b) => a - b);

  const uniqueDates = Array.from(new Set(sortedDates));

  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: number | null = null;

  for (const date of uniqueDates) {
    if (prevDate === null || date === prevDate + 86400000) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
    prevDate = date;
  }

  return Math.max(maxStreak, currentStreak);
}

/**
 * Calculates the number of entries made in the current calendar week.
 */
export function calculateEntriesThisWeek(entries: JournalEntry[]): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  
  // Calculate start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  return entries.filter(e => {
    const entryDate = new Date(e.date).getTime();
    return entryDate >= startOfWeek.getTime();
  }).length;
}
