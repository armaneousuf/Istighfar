import { getState, saveState } from "../core/app-state.js";
import {
  targetModal,
  goalChipBtn,
  customTargetInput,
  applyTargetBtn,
  cancelTargetBtn,
  soundToggle,
  hapticsToggle,
  duaSelect,
  lastUpdateLabel,
} from "../core/dom.js";
import { setTarget, applySelectedDua } from "../core/counter.js";
import { hapticTap } from "../services/haptics.js";

const APP_LAST_UPDATED = "2026-10-07";

export function updateLastUpdatedLabel() {
  if (!lastUpdateLabel) return;

  const lastUpdateDate = new Date(APP_LAST_UPDATED);
  const now = new Date();

  const startOfLast = new Date(
    lastUpdateDate.getFullYear(),
    lastUpdateDate.getMonth(),
    lastUpdateDate.getDate(),
  );
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round((startOfNow - startOfLast) / 86400000);

  if (diffDays <= 0) lastUpdateLabel.textContent = "Today";
  else if (diffDays === 1) lastUpdateLabel.textContent = "1 day ago";
  else lastUpdateLabel.textContent = `${diffDays} days ago`;
}

export function setupSettings() {
  document.querySelectorAll(".target-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const button = e.currentTarget;
      if (setTarget(button.getAttribute("data-target")))
        targetModal.classList.add("hidden");
    });
  });

  if (goalChipBtn) {
    goalChipBtn.addEventListener("click", () => {
      customTargetInput.value = getState().target;
      targetModal.classList.remove("hidden");
    });
  }

  if (cancelTargetBtn) {
    cancelTargetBtn.addEventListener("click", () =>
      targetModal.classList.add("hidden"),
    );
  }

  if (applyTargetBtn) {
    applyTargetBtn.addEventListener("click", () => {
      customTargetInput.setCustomValidity("");
      if (setTarget(customTargetInput.value)) {
        targetModal.classList.add("hidden");
      } else {
        customTargetInput.setCustomValidity(
          "Choose a whole-number goal between 1 and 1,000,000.",
        );
        customTargetInput.reportValidity();
      }
    });
  }

  if (duaSelect) {
    duaSelect.addEventListener("change", (e) => {
      getState().selectedDua = e.target.value;
      applySelectedDua();
      saveState();
    });
  }

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      const state = getState();
      state.soundEnabled = !state.soundEnabled;
      soundToggle.classList.toggle("on", state.soundEnabled);
      saveState();
    });
  }

  if (hapticsToggle) {
    hapticsToggle.addEventListener("click", () => {
      const state = getState();
      state.hapticsEnabled = !state.hapticsEnabled;
      hapticsToggle.classList.toggle("on", state.hapticsEnabled);
      if (state.hapticsEnabled) hapticTap(true, "selection");
      saveState();
    });
  }
}
