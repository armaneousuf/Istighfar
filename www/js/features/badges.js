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
  statBadgesEarned,
} from "../core/dom.js";
import { playMilestoneSound } from "../core/audio.js";

export function spawnFloatingText(text) {
  const el = document.createElement("div");
  el.className =
    "floating-milestone text-[13px] font-semibold text-slate-100 bg-slate-900/95 border theme-accent-border px-3 py-1.5 rounded-full soft-shadow backdrop-blur-md flex items-center gap-1.5";
  el.innerHTML = `<span class="theme-accent-text">${SVG_STAR}</span><span>${text}</span>`;
  floatContainer.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

function showMilestoneToast(milestone) {
  toastIcon.innerHTML = SVG_STAR;
  toastTitle.textContent = `Unlocked: ${milestone.title}`;
  toastDesc.textContent = milestone.desc;

  toastNotification.classList.remove("hidden");
  setTimeout(() => {
    toastNotification.classList.add("hidden");
  }, 4500);
}

export function renderBadgesList() {
  const state = getState();
  if (!badgesContainer || !state) return;
  badgesContainer.innerHTML = "";
  const currentVal = Math.max(state.count, state.lifetimeTotal);
  const isAnonymous = getIsAnonymous();

  MILESTONES.forEach((m) => {
    const unlocked = state.unlockedBadges.has(m.count) || currentVal >= m.count;
    if (unlocked && !isAnonymous) state.unlockedBadges.add(m.count);
    const tierColor = TIER_COLORS[m.tier % TIER_COLORS.length];

    const card = document.createElement("div");
    card.className = `p-2.5 rounded-xl border flex items-center justify-between transition-all ${
      unlocked
        ? "bg-black/25 border-white/[0.08] text-slate-100 soft-shadow-sm"
        : "bg-black/10 border-white/[0.03] text-slate-600 opacity-60"
    }`;

    const isElite = m.tier >= 6;
    const badgeIcon = getTierIcon(m.tier, unlocked);
    const eliteRing =
      isElite && unlocked ? `box-shadow:0 0 10px ${tierColor}55;` : "";

    card.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${
          unlocked ? tierColor + "22" : "rgba(255,255,255,0.02)"
        }; color:${unlocked ? tierColor : "#475569"}; border:1px solid ${
      unlocked ? tierColor + "55" : "rgba(255,255,255,0.04)"
    }; ${eliteRing}">
          ${badgeIcon}
        </div>
        <div>
          <div class="flex items-center gap-1">
            <div class="text-[11px] font-semibold ${
              unlocked ? "text-slate-100" : "text-slate-500"
            }">${m.title}</div>
            ${
              isElite && unlocked
                ? '<span style="font-size:8px;color:' +
                  tierColor +
                  ";background:" +
                  tierColor +
                  "18;border:1px solid " +
                  tierColor +
                  '44;padding:0 5px;border-radius:999px;font-weight:700;letter-spacing:.05em;">ELITE</span>'
                : ""
            }
          </div>
          <div class="text-[9px] ${
            unlocked ? "text-slate-500" : "text-slate-600"
          }">${m.desc}</div>
        </div>
      </div>
      <div>
        ${
          unlocked
            ? `<span style="font-size:8px;font-weight:700;color:${tierColor};background:${tierColor}18;padding:2px 8px;border-radius:999px;border:1px solid ${tierColor}33;">UNLOCKED</span>`
            : `<span class="text-[9px] text-slate-600 font-medium">${m.count.toLocaleString()} taps</span>`
        }
      </div>
    `;
    badgesContainer.appendChild(card);
  });

  if (statBadgesEarned)
    statBadgesEarned.textContent = `${state.unlockedBadges.size}/${MILESTONES.length}`;
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
