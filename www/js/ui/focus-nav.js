import { focusCount, focusOverlay, getEl } from "../core/dom.js";
import {
  getState,
  getIsAnonymous,
  getAnonymousCount,
} from "../core/app-state.js";
import {
  renderInsightSummary,
  renderWeeklyChart,
  renderHeatmap,
} from "../features/analytics.js";
import { loadPrayerTimes } from "../features/prayer-view.js";

export function enableFocusMode() {
  const state = getState();
  if (focusCount)
    focusCount.textContent = (
      getIsAnonymous() ? getAnonymousCount() : state.count
    ).toLocaleString();
  document.body.classList.add("focus-mode");
  focusOverlay.classList.remove("hidden");
}

export function disableFocusMode() {
  document.body.classList.remove("focus-mode");
  focusOverlay.classList.add("hidden");
}

export function setupBottomNavbar({ onCloseFocus }) {
  const navButtons = document.querySelectorAll("#bottomNav .nav-btn");
  const views = document.querySelectorAll("#viewContainer .view");
  const header = getEl("appHeader");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetViewId = `view-${btn.getAttribute("data-view")}`;

      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach((v) => {
        if (v.id === targetViewId) {
          v.classList.remove("hidden");
        } else {
          v.classList.add("hidden");
        }
      });

      if (targetViewId === "view-home") {
        header.classList.remove("hide-nav-buttons");
      } else {
        header.classList.add("hide-nav-buttons");
      }

      if (targetViewId !== "view-home") {
        if (!focusOverlay.classList.contains("hidden")) {
          onCloseFocus();
        }
      }

      if (targetViewId === "view-insights") {
        renderInsightSummary();
        renderWeeklyChart();
        renderHeatmap();
      } else if (targetViewId === "view-prayers") {
        loadPrayerTimes();
      }
    });
  });
}
