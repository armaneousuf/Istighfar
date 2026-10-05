import { getNameByIndex, NAMES_COUNT } from "../data/names.js";
import { getState, saveState } from "../core/app-state.js";
import { getFormattedDate } from "../constants.js";
import {
  nameOfDayBtn,
  nameOfDayModal,
  closeNameOfDayModal,
  nameOfDayArabic,
  nameOfDayTranslit,
  nameOfDayMeaning,
  nameOfDayTrack,
  nameOfDayRemaining,
} from "../core/dom.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const close = () => {
  if (nameOfDayModal) nameOfDayModal.classList.add("hidden");
};

// Whole calendar days between two YYYY-MM-DD strings. Returns 0 when the stored
// date is missing or unparseable, so a bad value never skips the cycle.
function daysBetween(fromISO, toISO) {
  const from = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fromISO || "");
  const to = /^(\d{4})-(\d{2})-(\d{2})$/.exec(toISO || "");
  if (!from || !to) return 0;
  const fromMs = Date.UTC(+from[1], +from[2] - 1, +from[3]);
  const toMs = Date.UTC(+to[1], +to[2] - 1, +to[3]);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return 0;
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

// One name per calendar day, 1 → 99 then back to 1. The position lives in the
// IndexedDB-backed app state rather than being derived from the calendar, so an
// app update can never restart or rewind the cycle. Days skipped while the app
// was closed still advance the cycle, keeping one name per day. The stored
// index is kept inside 0–98 so it never grows without bound.
function resolveNameOfTheDay() {
  const state = getState();
  if (!state) return null;

  const today = getFormattedDate();
  const elapsed = daysBetween(state.nameOfDayDate, today);

  if (elapsed > 0) {
    state.nameOfDayIndex =
      (((Number(state.nameOfDayIndex) || 0) + elapsed) % NAMES_COUNT +
        NAMES_COUNT) %
      NAMES_COUNT;
    state.nameOfDayDate = today;
    saveState();
  } else if (!state.nameOfDayDate) {
    state.nameOfDayDate = today;
    saveState();
  }

  const index = (((Number(state.nameOfDayIndex) || 0) % NAMES_COUNT) +
    NAMES_COUNT) %
    NAMES_COUNT;
  return { name: getNameByIndex(index), index, total: NAMES_COUNT };
}

export function renderNameOfTheDay() {
  if (!nameOfDayArabic) return;
  const today = resolveNameOfTheDay();
  if (!today) return;
  const { name, index, total } = today;

  nameOfDayArabic.textContent = name.arabic;
  nameOfDayTranslit.textContent = name.translit;
  nameOfDayMeaning.textContent = name.meaning;

  if (nameOfDayTrack) {
    nameOfDayTrack.style.width = `${((index + 1) / total) * 100}%`;
  }
  if (nameOfDayRemaining) {
    nameOfDayRemaining.textContent = `${total - index} remaining of ${total}`;
  }
}

// Tapping the Allah button at the top of the Home screen reveals the name.
// Dismissable with the X, a tap on the backdrop, or Escape.
export function setupNameOfDay() {
  if (!nameOfDayBtn || !nameOfDayModal) return;

  nameOfDayBtn.addEventListener("click", () => {
    renderNameOfTheDay();
    nameOfDayModal.classList.remove("hidden");
  });

  if (closeNameOfDayModal) {
    closeNameOfDayModal.addEventListener("click", close);
  }

  nameOfDayModal.addEventListener("click", (e) => {
    if (e.target === nameOfDayModal) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !nameOfDayModal.classList.contains("hidden")) {
      close();
    }
  });
}