// Hands a compact snapshot of the counter and the next prayer to native code
// (the Android home-screen widget).
//
// The app's source of truth is IndexedDB, which the native layer cannot read
// without duplicating the whole schema. Capacitor's Preferences plugin writes to
// SharedPreferences on Android, so the widget reads one small, stable JSON blob
// from there instead. This is a mirror, never the source of truth: if the plugin
// is missing (plain browser) the call is a no-op.

import {
  calculatePrayerTimes,
  formatPrayerTime,
  getSavedLocation,
} from "./prayer.js";

const NativePreferences = globalThis.Capacitor?.Plugins?.Preferences;

export const WIDGET_KEY = "widget_state";

const NAMED_PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Next prayer from the saved location. Returns null when no location has ever
// been set — the widget then shows a prompt rather than a stale or made-up time.
function getNextPrayer(now = new Date()) {
  const saved = getSavedLocation();
  if (!saved) return null;

  try {
    const today = calculatePrayerTimes(saved.latitude, saved.longitude, now);
    const upcoming = NAMED_PRAYERS.find((key) => today[key] > now);
    if (upcoming) {
      return {
        name: capitalize(upcoming),
        time: formatPrayerTime(today[upcoming]),
        tomorrow: false,
      };
    }

    // All of today's prayers have passed: the next one is tomorrow's Fajr.
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const nextDay = calculatePrayerTimes(
      saved.latitude,
      saved.longitude,
      tomorrow,
    );
    return {
      name: "Fajr",
      time: formatPrayerTime(nextDay.fajr),
      tomorrow: true,
    };
  } catch (err) {
    // A bad saved location or a failed calculation must not block the counter.
    return null;
  }
}

export function syncWidgetState(state, { anonymous = false } = {}) {
  if (!NativePreferences || !state) return;

  const target = state.target > 0 ? state.target : 1;
  const count = anonymous ? 0 : state.count;
  const prayer = getNextPrayer();

  const payload = {
    count,
    target: state.target,
    percent: Math.min(100, Math.floor((count / target) * 100)),
    lifetimeTotal: anonymous ? 0 : state.lifetimeTotal,
    streakDays: anonymous ? 0 : state.streakDays,
    // Empty strings mean "no location set"; the widget renders a prompt.
    nextPrayerName: prayer ? prayer.name : "",
    nextPrayerTime: prayer ? prayer.time : "",
    nextPrayerTomorrow: prayer ? prayer.tomorrow : false,
  };

  // Fire-and-forget: the widget is a convenience, and a failed write must never
  // surface as an app error or make a tap feel slow. MainActivity refreshes the
  // widget on resume/pause, so no native call is needed from here.
  NativePreferences.set({
    key: WIDGET_KEY,
    value: JSON.stringify(payload),
  }).catch(() => {});
}
