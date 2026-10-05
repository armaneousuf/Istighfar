export const STORAGE_KEY = "ISTIGHFAR_APP_DATA_V5";

export function getFormattedDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const defaultState = {
  count: 0,
  target: 1000,
  todayTotal: 0,
  lifetimeTotal: 0,
  kCompletedCount: 0,
  streakDays: 0,
  bestStreak: 0,
  lastActiveDate: getFormattedDate(),
  soundEnabled: true,
  hapticsEnabled: true,
  selectedDua: "1",
  unlockedBadges: [],
  dailyHistory: {},
  // Position in the 99-name cycle and the date it was assigned. Stored with the
  // rest of the app state so the sequence survives updates and reinstalls.
  nameOfDayIndex: 0,
  nameOfDayDate: getFormattedDate(),
};

export const duaPhrases = {
  1: {
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    trans: '"I seek forgiveness from Allah"',
  },
  2: {
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    trans: '"I seek forgiveness from Allah and turn to Him in repentance"',
  },
  3: {
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ",
    trans: '"O Allah, You are my Lord. There is no deity except You..."',
  },
  4: {
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ",
    trans: '"My Lord, forgive me and accept my repentance"',
  },
};
