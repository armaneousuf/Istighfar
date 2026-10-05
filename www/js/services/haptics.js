function plugin() {
  return window.Capacitor?.Plugins?.Haptics;
}

const PATTERNS = {
  light: { style: 'LIGHT', webMs: 10 },
  success: { style: 'MEDIUM', webMs: [0, 12, 40, 18] },
  selection: { style: 'LIGHT', webMs: 8 }
};

export async function hapticTap(enabled, flavour = 'light') {
  if (!enabled) return;
  const pattern = PATTERNS[flavour] || PATTERNS.light;

  const haptics = plugin();
  if (haptics) {
    try {
      if (haptics.impact) {
        await haptics.impact({ style: pattern.style });
        return;
      }
      if (haptics.vibrate) {
        await haptics.vibrate({ duration: pattern.webMs });
        return;
      }
    } catch (e) {
    }
  }

  if (navigator.vibrate) {
    try {
      navigator.vibrate(pattern.webMs);
    } catch (e) {}
  }
}