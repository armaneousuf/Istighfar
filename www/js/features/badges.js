import {
  MILESTONES,
  TIER_COLORS,
  SVG_STAR,
  getTierIcon,
} from "../data/milestones.js";
import { getState, saveState, getIsAnonymous } from "../core/app-state.js";
import {
  badgesContainer,
  toastNotification,
  toastTitle,
  toastDesc,
  toastIcon,
  floatContainer,
  badgesHint,
} from "../core/dom.js";
import { playMilestoneSound } from "../core/audio.js";

function spawnFloatingText(text) {
  const el = document.createElement("div");
  el.className =
    "floating-milestone text-[13px] font-semibold text-slate-100 bg-slate-900/95 border theme-accent-border px-3 py-1.5 rounded-full soft-shadow backdrop-blur-md flex items-center gap-1.5";
  el.innerHTML = `<span class="theme-accent-text">${SVG_STAR}</span><span>${text}</span>`;
  floatContainer.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

let toastHideTimer = null;

function showMilestoneToast(milestone) {
  toastIcon.innerHTML = SVG_STAR;
  toastTitle.textContent = milestone.title;
  toastDesc.textContent = milestone.desc;

  toastNotification.classList.remove("hidden");

  // Restart the dismiss bar on repeat unlocks inside the same window.
  const bar = toastNotification.querySelector(".toast-bar > div");
  if (bar) {
    bar.style.animation = "none";
    void bar.offsetWidth;
    bar.style.animation = "";
  }

  clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => {
    toastNotification.classList.add("hidden");
  }, 4500);
}

export function renderBadgesList() {
  const state = getState();
  if (!badgesContainer || !state) return;
  badgesContainer.innerHTML = "";
  const currentVal = Math.max(state.count, state.lifetimeTotal);
  const isAnonymous = getIsAnonymous();

  let lastUnlockedIndex = -1;

  MILESTONES.forEach((m, i) => {
    const unlocked = state.unlockedBadges.has(m.count) || currentVal >= m.count;
    if (unlocked && !isAnonymous) state.unlockedBadges.add(m.count);
    if (unlocked) lastUnlockedIndex = i;
    const tierColor = TIER_COLORS[m.tier % TIER_COLORS.length];

    const card = document.createElement("div");
    card.className = `bdg ${unlocked ? "unlocked" : "locked"}`;

    const isElite = m.tier >= 6;
    const badgeIcon = getTierIcon(m.tier, unlocked);
    const eliteRing =
      isElite && unlocked ? `box-shadow:0 0 10px ${tierColor}55;` : "";

    card.innerHTML = `
      <div class="bdg-top">
        <div class="bdg-icon" style="background:${
          unlocked ? tierColor + "22" : "rgba(255,255,255,0.02)"
        }; color:${unlocked ? tierColor : "#475569"}; border:1px solid ${
      unlocked ? tierColor + "55" : "rgba(255,255,255,0.04)"
    }; ${eliteRing}">
          ${badgeIcon}
        </div>
        ${
          unlocked
            ? `<span class="bdg-tag" style="color:${tierColor};background:${tierColor}18;border-color:${tierColor}33">UNLOCKED</span>`
            : `<span class="bdg-count">${m.count.toLocaleString()}</span>`
        }
      </div>
      <div class="bdg-title">${m.title}${
        isElite && unlocked
          ? `<span class="bdg-elite" style="color:${tierColor};background:${tierColor}18;border-color:${tierColor}44">ELITE</span>`
          : ""
      }</div>
      <div class="bdg-desc">${m.desc}</div>
    `;
    badgesContainer.appendChild(card);
  });

  // Park the rail on the newest unlock so the next goal is in view. Assigned
  // directly rather than scrolled smoothly: this runs on init, when the
  // details panel may still be collapsed and the track has no width yet.
  if (lastUnlockedIndex >= 0) {
    const card = badgesContainer.children[lastUnlockedIndex];
    const target =
      card.offsetLeft - badgesContainer.offsetLeft - badgesContainer.offsetWidth * 0.15;
    badgesContainer.scrollLeft = Math.max(0, target);
  }

  if (badgesHint)
    badgesHint.textContent = `${state.unlockedBadges.size}/${MILESTONES.length}`;
}

export function checkMilestones() {
  if (getIsAnonymous()) return;
  const state = getState();
  const currentVal = Math.max(state.count, state.lifetimeTotal);

  MILESTONES.forEach((m) => {
    if (currentVal >= m.count && !state.unlockedBadges.has(m.count)) {
      state.unlockedBadges.add(m.count);
      showMilestoneToast(m);
      spawnFloatingText(m.title);
      playMilestoneSound();
      saveState();
    }
  });
  renderBadgesList();
}
