// Utility functions for managing daily resets and streaks

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

export function isNewDay(lastReadDate: string): boolean {
  const today = getTodayString();
  return lastReadDate !== today;
}

export function shouldResetDailyReads(lastReadDate: string): boolean {
  return isNewDay(lastReadDate);
}

export function calculateStreak(
  lastReadDate: string,
  currentStreak: number
): number {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (lastReadDate === today) {
    // Already read today, keep current streak
    return currentStreak;
  } else if (lastReadDate === yesterday) {
    // Read yesterday, increment streak
    return currentStreak + 1;
  } else {
    // Missed a day, reset streak
    return 1;
  }
}

export function getDaysSinceDate(dateString: string): number {
  const targetDate = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - targetDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isWithinDays(dateString: string, days: number): boolean {
  return getDaysSinceDate(dateString) <= days;
}

// Premium trial logic
const TRIAL_DURATION_DAYS = 7;

export function isTrialActive(installDate: string): boolean {
  return isWithinDays(installDate, TRIAL_DURATION_DAYS);
}

export function getTrialDaysRemaining(installDate: string): number {
  const daysSince = getDaysSinceDate(installDate);
  return Math.max(0, TRIAL_DURATION_DAYS - daysSince);
}

// Reading limits for free users
export const FREE_DAILY_STORY_LIMIT = 3;
export const FREE_QUOTE_CATEGORIES_LIMIT = 10;

export function canReadStory(dailyReads: number, isPremium: boolean): boolean {
  if (isPremium) return true;
  return dailyReads < FREE_DAILY_STORY_LIMIT;
}

export function getRemainingStoryReads(
  dailyReads: number,
  isPremium: boolean
): number {
  if (isPremium) return Infinity;
  return Math.max(0, FREE_DAILY_STORY_LIMIT - dailyReads);
}

// Time-based helpers
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  } else if (hour < 18) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "morning";
  } else if (hour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
}
