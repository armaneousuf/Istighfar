// App entry point — element wiring, init, and the service worker.

import { loadState } from "./js/storage.js";
import { getState, setState } from "./js/core/app-state.js";
import {
  tapBtn,
  undoBtn,
  resetBtn,
  anonymousBtn,
  exitAnonymousBtn,
  focusBtn,
  exitFocusBtn,
  focusOverlay,
  progressRing,
  soundToggle,
  hapticsToggle,
  ringCircumference,
} from "./js/core/dom.js";
import { bindGuardedTap } from "./js/core/guarded-tap.js";
import { installAudioPrimer } from "./js/core/audio.js";
import {
  updateStreak,
  applySelectedDua,
  updateProgress,
  checkDailyReset,
  handleTap,
  handleUndo,
  handleReset,
  toggleAnonymousMode,
  refreshAll,
} from "./js/core/counter.js";
import { renderBadgesList } from "./js/features/badges.js";
import { setupPrayerLocationButton } from "./js/features/prayer-view.js";
import {
  renderNameOfTheDay,
  setupNameOfDay,
} from "./js/features/name-of-day.js";
import { setupDataManagement } from "./js/features/data-management.js";
import { setupModals } from "./js/ui/modals.js";
import {
  enableFocusMode,
  disableFocusMode,
  setupBottomNavbar,
} from "./js/ui/focus-nav.js";
import { setupSettings, updateLastUpdatedLabel } from "./js/ui/settings.js";

function wireEventListeners() {
  bindGuardedTap(tapBtn, handleTap);
  undoBtn.addEventListener("click", handleUndo);
  resetBtn.addEventListener("click", handleReset);

  anonymousBtn.addEventListener("click", () => toggleAnonymousMode());
  exitAnonymousBtn.addEventListener("click", () => toggleAnonymousMode(false));

  focusBtn.addEventListener("click", enableFocusMode);
  exitFocusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    disableFocusMode();
  });

  // Taps on the exit button must not count as Istighfar.
  bindGuardedTap(focusOverlay, (e) => {
    if (e.target === exitFocusBtn || exitFocusBtn.contains(e.target)) return;
    handleTap();
  });

  setupPrayerLocationButton();
  setupNameOfDay();
  setupModals();
  setupSettings();

  setupBottomNavbar({
    onCloseFocus: disableFocusMode,
  });

  setupDataManagement({
    refresh: refreshAll,
    applySelectedDua,
  });
}

async function initApp() {
  const loadingState = document.getElementById("appLoadingState");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const loadingError = document.getElementById("loadingError");
  const loadingErrorText = document.getElementById("loadingErrorText");

  const startTime = Date.now();

  try {
    setState(await loadState());
    updateStreak();

    checkDailyReset();

    applySelectedDua();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("action") === "quick-tap") {
      handleTap();
    }

    progressRing.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;
    soundToggle.classList.toggle("on", getState().soundEnabled);
    hapticsToggle.classList.toggle("on", getState().hapticsEnabled);
    wireEventListeners();
    renderBadgesList();
    renderNameOfTheDay();
    updateProgress();
    updateLastUpdatedLabel();

    if (loadingState) {
      const elapsed = Date.now() - startTime;
      const minDisplay = 400;
      const delay = Math.max(0, minDisplay - elapsed);

      setTimeout(() => {
        loadingState.style.pointerEvents = "none";
        loadingState.style.opacity = "0";
        setTimeout(() => {
          loadingState.classList.add("hidden");
        }, 300);
      }, delay);
    }
  } catch (err) {
    if (loadingSpinner) loadingSpinner.classList.add("hidden");
    if (loadingError) loadingError.classList.remove("hidden");
    if (loadingErrorText)
      loadingErrorText.textContent =
        err.message || "Unable to load your saved progress.";
  }
}

installAudioPrimer();
initApp();

if ("serviceWorker" in navigator) {
  if (window.Capacitor) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  } else {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => console.log("SW Registered:", reg.scope))
        .catch((err) => console.log("SW Registration failed:", err));
    });
  }
}
