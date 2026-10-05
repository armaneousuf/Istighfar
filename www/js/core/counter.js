import { getFormattedDate } from "../constants.js";
import {
  getState,
  saveState,
  getIsAnonymous,
  setIsAnonymous,
  getAnonymousCount,
  setAnonymousCount,
} from "./app-state.js";
import { getCurrentStreak, getLongestStreak } from "./dates.js";
import { MILESTONES, RANKS } from "../data/milestones.js";
import {
  counterDisplay,
  focusCount,
  todayTotalDisplay,
  lifetimeTotalDisplay,
  progressRing,
  tapBtn,
  targetLabel,
  goalChipValue,
  ringCircumference,
  modalLevelTitle,
  modalRankNumber,
  modalRankOf,
  modalXpText,
  xpProgressBar,
  nextLevelLabel,
  rankPips,
  statTotalIstighfar,
  statStreak,
  statBestStreak,
  stat1kCount,
  statBadgesEarned,
  streakBigNumber,
  streakBestDisplay,
  streak1kDisplay,
  floatContainer,
  duaSelect,
  anonymousBtn,
  anonymousBanner,
} from "./dom.js";
import { playClickSound, playMilestoneSound } from "./audio.js";
import { hapticTap } from "../services/haptics.js";
import { renderBadgesList, checkMilestones } from "../features/badges.js";
import {
  renderInsightSummary,
  renderStreakWeek,
  renderWeeklyChart,
  renderHeatmap,
} from "../features/analytics.js";

export function updateStreak() {
  const state = getState();
  state.streakDays = getCurrentStreak(state.dailyHistory);
  state.bestStreak = Math.max(
    state.bestStreak || 0,
    getLongestStreak(state.dailyHistory),
    state.streakDays,
  );
}

export function applySelectedDua() {
  if (duaSelect) duaSelect.value = getState().selectedDua;
}

function triggerTargetReward() {
  playMilestoneSound();
  hapticTap(getState().hapticsEnabled, "success");
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.className = "confetti";
    p.style.backgroundColor = ["#a78bfa", "#38bdf8", "#f59e0b"][
      Math.floor(Math.random() * 3)
    ];

    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 120;
    p.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    p.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);

    p.style.left = "50%";
    p.style.top = "50%";
    floatContainer.appendChild(p);
    setTimeout(() => p.remove(), 2200);
  }
}

function updateRankDisplay() {
  const state = getState();
  const isAnonymous = getIsAnonymous();
  const percent =
    state.target > 0
      ? Math.min(
          100,
          Math.floor(
            ((isAnonymous ? getAnonymousCount() : state.count) / state.target) *
              100,
          ),
        )
      : 0;
  targetLabel.textContent = `${percent}% • Goal ${state.target.toLocaleString()}`;
  if (goalChipValue) goalChipValue.textContent = state.target.toLocaleString();

  if (isAnonymous) {
    if (modalLevelTitle) modalLevelTitle.textContent = "Anonymous Mode";
    if (modalRankNumber) modalRankNumber.textContent = "--";
    if (modalRankOf) modalRankOf.textContent = "";
    if (modalXpText) modalXpText.textContent = "Session Only";
    if (xpProgressBar) xpProgressBar.style.width = "0%";
    if (nextLevelLabel) nextLevelLabel.textContent = "Nothing is saved in this session";
    if (rankPips) rankPips.innerHTML = "";
    return;
  }

  const effectiveTotal = Math.max(state.count, state.lifetimeTotal);

  // Walk the shared rank table backwards for the highest rank the total has
  // reached, then the next one up is this rank's ceiling.
  let rankIndex = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (effectiveTotal >= RANKS[i].at) {
      rankIndex = i;
      break;
    }
  }
  const current = RANKS[rankIndex];
  const next = RANKS[rankIndex + 1];
  const nextThreshold = next ? next.at : Infinity;

  if (modalLevelTitle) modalLevelTitle.textContent = current.name;
  if (modalRankNumber) modalRankNumber.textContent = `${rankIndex + 1}`;
  if (modalXpText)
    modalXpText.textContent = `${effectiveTotal.toLocaleString()} XP`;
  if (modalRankOf) modalRankOf.textContent = `of ${RANKS.length}`;

  const xpPercent =
    nextThreshold === Infinity
      ? 100
      : Math.min(100, (effectiveTotal / nextThreshold) * 100);
  if (xpProgressBar) xpProgressBar.style.width = `${xpPercent}%`;
  if (nextLevelLabel) {
    nextLevelLabel.textContent =
      nextThreshold === Infinity
        ? "Al-Musaafir achieved — SubhanAllah!"
        : `${(nextThreshold - effectiveTotal).toLocaleString()} XP until ${
            next.name
          }`;
  }

  renderRankPips(rankIndex);
}

/* 15 pips, one per rank: filled up to the current rank, hollow above it. */
function renderRankPips(currentIndex) {
  if (!rankPips) return;
  if (rankPips.childElementCount !== RANKS.length) {
    rankPips.innerHTML = RANKS.map((r) => `<i data-at="${r.at}"></i>`).join("");
  }
  Array.from(rankPips.children).forEach((pip, i) => {
    pip.classList.toggle("on", i <= currentIndex);
    pip.classList.toggle("current", i === currentIndex);
    pip.setAttribute("title", RANKS[i].name);
  });
}



export function updateProgress() {
  const state = getState();
  const isAnonymous = getIsAnonymous();
  const currentDisplayCount = isAnonymous ? getAnonymousCount() : state.count;
  counterDisplay.textContent = currentDisplayCount.toLocaleString();
  if (focusCount) focusCount.textContent = currentDisplayCount.toLocaleString();

  if (isAnonymous) {
    if (todayTotalDisplay) todayTotalDisplay.textContent = "—";
    if (lifetimeTotalDisplay) lifetimeTotalDisplay.textContent = "—";
  } else {
    if (todayTotalDisplay)
      todayTotalDisplay.textContent = state.todayTotal.toLocaleString();
    if (lifetimeTotalDisplay)
      lifetimeTotalDisplay.textContent = state.lifetimeTotal.toLocaleString();
  }

  const progress = Math.min(currentDisplayCount / state.target, 1);
  const offset = ringCircumference - progress * ringCircumference;
  progressRing.style.strokeDashoffset = offset;

  if (currentDisplayCount >= state.target && state.target > 0) {
    tapBtn.classList.add("glow-pulse");
  } else {
    tapBtn.classList.remove("glow-pulse");
  }

  if (statTotalIstighfar)
    statTotalIstighfar.textContent = state.lifetimeTotal.toLocaleString();
  if (statStreak) statStreak.textContent = `${state.streakDays}`;
  if (statBestStreak) statBestStreak.textContent = `${state.bestStreak}`;
  const kCompletedCount = Math.floor(state.lifetimeTotal / 1000);
  if (stat1kCount) stat1kCount.textContent = kCompletedCount.toLocaleString();
  if (statBadgesEarned)
    statBadgesEarned.textContent = `${state.unlockedBadges.size}/${MILESTONES.length}`;

  if (streakBigNumber) streakBigNumber.textContent = state.streakDays;
  if (streakBestDisplay) streakBestDisplay.textContent = state.bestStreak;
  if (streak1kDisplay) streak1kDisplay.textContent = kCompletedCount;

  updateRankDisplay();
  renderInsightSummary();
  renderStreakWeek();
}

export function checkDailyReset() {
  if (getIsAnonymous()) return;
  const state = getState();

  const currentTodayStr = getFormattedDate();

  let lastActiveISO = state.lastActiveDate;
  if (state.lastActiveDate && state.lastActiveDate.includes(" ")) {
    const parsedDate = new Date(state.lastActiveDate);
    if (!isNaN(parsedDate.getTime())) {
      lastActiveISO = getFormattedDate(parsedDate);
    }
  }

  if (lastActiveISO !== currentTodayStr) {
    state.todayTotal = 0;
    state.count = 0;
    state.lastActiveDate = currentTodayStr;
    updateStreak();
    saveState();

    updateProgress();
    renderBadgesList();
  }
}

export function toggleAnonymousMode(forceState = null) {
  setIsAnonymous(forceState !== null ? forceState : !getIsAnonymous());

  if (getIsAnonymous()) {
    setAnonymousCount(0);
    document.body.classList.add("anonymous-mode");
    anonymousBtn.classList.add("active");
    anonymousBanner.classList.remove("hidden");
  } else {
    document.body.classList.remove("anonymous-mode");
    anonymousBtn.classList.remove("active");
    anonymousBanner.classList.add("hidden");
  }

  updateProgress();
}

export function handleTap() {
  const state = getState();

  if (getIsAnonymous()) {
    const next = getAnonymousCount() + 1;
    setAnonymousCount(next);
    if (next === state.target) {
      triggerTargetReward();
    }
    playClickSound(Math.min(300, Math.floor((next % 100) / 10) * 8));
    hapticTap(state.hapticsEnabled);
    updateProgress();
    return;
  }

  checkDailyReset();

  state.count++;
  state.todayTotal++;
  state.lifetimeTotal++;

  const iso = getFormattedDate();
  state.dailyHistory[iso] = (state.dailyHistory[iso] || 0) + 1;
  updateStreak();

  if (state.count === state.target) {
    triggerTargetReward();
  }

  checkMilestones();
  playClickSound(Math.min(300, Math.floor((state.count % 100) / 10) * 8));
  hapticTap(state.hapticsEnabled);
  updateProgress();
  saveState();
}

export function handleUndo() {
  const state = getState();

  if (getIsAnonymous()) {
    if (getAnonymousCount() > 0) {
      setAnonymousCount(getAnonymousCount() - 1);
      updateProgress();
    }
    return;
  }

  if (state.count > 0) {
    state.count--;
    if (state.todayTotal > 0) state.todayTotal--;
    if (state.lifetimeTotal > 0) state.lifetimeTotal--;

    const iso = getFormattedDate();
    if (state.dailyHistory[iso] && state.dailyHistory[iso] > 0) {
      state.dailyHistory[iso]--;
    }
    updateStreak();

    updateProgress();
    saveState();
  }
}

export function handleReset() {
  const state = getState();

  if (getIsAnonymous()) {
    setAnonymousCount(0);
    updateProgress();
    return;
  }

  if (state.count === 0) return;
  const confirmed = window.confirm(
    `Reset current session? You're at ${state.count.toLocaleString()} taps.\n\nThis only clears the counter on screen — your daily and lifetime totals stay saved.`,
  );
  if (!confirmed) return;
  state.count = 0;
  updateProgress();
  saveState();
}

export function setTarget(newTarget) {
  const state = getState();
  const parsedTarget = Number.parseInt(newTarget, 10);
  if (
    !Number.isFinite(parsedTarget) ||
    parsedTarget < 1 ||
    parsedTarget > 1000000
  )
    return false;
  state.target = parsedTarget;
  document.querySelectorAll(".target-btn").forEach((btn) => {
    if (parseInt(btn.getAttribute("data-target")) === state.target) {
      btn.className =
        "target-btn px-2 py-2 text-[11px] font-semibold rounded-lg theme-accent-bg text-slate-950 font-bold transition";
    } else {
      btn.className =
        "target-btn px-2 py-2 text-[11px] font-semibold rounded-lg bg-white/[0.05] text-slate-400 hover:text-slate-100 transition";
    }
  });
  updateProgress();
  saveState();
  return true;
}

export function refreshAll() {
  updateProgress();
  renderBadgesList();
  renderWeeklyChart();
  renderHeatmap();
}
