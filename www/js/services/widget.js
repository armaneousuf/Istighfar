// Hands a compact snapshot of the counter to native code (the Android widget).
//
// The app's source of truth is IndexedDB, which the native layer cannot read
// without duplicating the whole schema. Capacitor's Preferences plugin writes to
// SharedPreferences on Android, so the widget reads one small, stable JSON blob
// from there instead. This is a mirror, never the source of truth: if the plugin
// is missing (plain browser) the calls are no-ops.

const NativePreferences = globalThis.Capacitor?.Plugins?.Preferences;

export const WIDGET_KEY = "widget_state";

export function syncWidgetState(state, { anonymous = false } = {}) {
  if (!NativePreferences || !state) return;

  const target = state.target > 0 ? state.target : 1;
  const count = anonymous ? 0 : state.count;
  const payload = {
    count,
    target: state.target,
    percent: Math.min(100, Math.floor((count / target) * 100)),
    lifetimeTotal: anonymous ? 0 : state.lifetimeTotal,
    streakDays: anonymous ? 0 : state.streakDays,
  };

  // Fire-and-forget: the widget is a convenience, and a failed write must never
  // surface as an app error or make a tap feel slow. MainActivity refreshes the
  // widget on resume/pause, so no native call is needed from here.
  NativePreferences.set({
    key: WIDGET_KEY,
    value: JSON.stringify(payload),
  }).catch(() => {});
}
