import { getFormattedDate } from "../constants.js";

export function getCurrentStreak(history = {}) {
  let streak = 0;
  const cursor = new Date();
  while ((history[getFormattedDate(cursor)] || 0) > 0) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getLongestStreak(history = {}) {
  const days = Object.keys(history)
    .filter((key) => (history[key] || 0) > 0)
    .sort();
  if (!days.length) return 0;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + "T00:00:00");
    const curr = new Date(days[i] + "T00:00:00");
    const gapDays = Math.round((curr - prev) / 86400000);
    run = gapDays === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  return longest;
}

export function getRecentDays(history, days, endOffset = 0) {
  const result = [];
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() - endOffset);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(end.getDate() - i);
    result.push({
      date,
      count: Number(history[getFormattedDate(date)]) || 0,
    });
  }
  return result;
}

export function getMonthTotal(history, monthOffset = 0) {
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset,
    1,
  );
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset + 1,
    0,
  );
  let total = 0;

  for (const [date, count] of Object.entries(history)) {
    const parsed = new Date(`${date}T00:00:00`);
    if (parsed >= monthStart && parsed <= monthEnd) total += Number(count) || 0;
  }
  return total;
}
