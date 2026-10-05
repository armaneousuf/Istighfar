/* Lifetime ranks, ascending. `at` is the lifetime total needed to enter the
   rank; the next rank's `at` is the ceiling for the XP bar. */
export const RANKS = [
  { name: "Novice Seeker", at: 0 },
  { name: "Awakened Seeker", at: 500 },
  { name: "Devoted Pilgrim", at: 1000 },
  { name: "Golden Adept", at: 2500 },
  { name: "Champion Seeker", at: 5000 },
  { name: "Radiant Heart", at: 10000 },
  { name: "Celestial Pilgrim", at: 25000 },
  { name: "Ocean of Mercy", at: 50000 },
  { name: "Light Bearer", at: 100000 },
  { name: "Cosmic Master", at: 250000 },
  { name: "Pillar of Repentance", at: 500000 },
  { name: "Master of Istighfar", at: 1000000 },
  { name: "Beacon of Devotion", at: 2500000 },
  { name: "Eternal Remembrance", at: 5000000 },
  { name: "Al-Musaafir", at: 10000000 },
];

export const MILESTONES = [
  {
    count: 33,
    title: "Seed of Devotion",
    desc: "Completed 33 Istighfar",
    tier: 0,
    xp: 33,
  },
  {
    count: 100,
    title: "First Step",
    desc: "Reached 100 Istighfar",
    tier: 1,
    xp: 100,
  },
  {
    count: 500,
    title: "Awakened Seeker",
    desc: "Completed 500 Istighfar",
    tier: 2,
    xp: 500,
  },
  {
    count: 1000,
    title: "Devoted Pilgrim",
    desc: "Achieved 1,000 Istighfar",
    tier: 3,
    xp: 1000,
  },
  {
    count: 5000,
    title: "Golden Adept",
    desc: "Reached 5,000 Istighfar",
    tier: 4,
    xp: 5000,
  },
  {
    count: 10000,
    title: "Champion Seeker",
    desc: "Reached 10,000 Istighfar",
    tier: 5,
    xp: 10000,
  },
  {
    count: 25000,
    title: "Radiant Heart",
    desc: "Completed 25,000 Istighfar",
    tier: 2,
    xp: 25000,
  },
  {
    count: 50000,
    title: "Celestial Pilgrim",
    desc: "Completed 50,000 Istighfar",
    tier: 1,
    xp: 50000,
  },
  {
    count: 100000,
    title: "Ocean of Mercy",
    desc: "Achieved 100,000 Istighfar",
    tier: 5,
    xp: 100000,
  },
  {
    count: 250000,
    title: "Light Bearer",
    desc: "Reached 250,000 Istighfar",
    tier: 3,
    xp: 250000,
  },
  {
    count: 500000,
    title: "Cosmic Master",
    desc: "Completed 500,000 Istighfar",
    tier: 4,
    xp: 500000,
  },
  {
    count: 1000000,
    title: "Pillar of Repentance",
    desc: "Achieved 1,000,000 Lifetime Istighfar",
    tier: 5,
    xp: 1000000,
  },
  {
    count: 2500000,
    title: "Master of Istighfar",
    desc: "An extraordinary 2,500,000 Istighfar",
    tier: 6,
    xp: 2500000,
  },
  {
    count: 5000000,
    title: "Beacon of Devotion",
    desc: "Half of ten million — SubhanAllah",
    tier: 7,
    xp: 5000000,
  },
  {
    count: 10000000,
    title: "Al-Musaafir — Millionist",
    desc: "Ten million Istighfar. MashaAllah!",
    tier: 8,
    xp: 10000000,
  },
];

export const TIER_COLORS = [
  "#94a3b8",
  "#38bdf8",
  "#a78bfa",
  "#f59e0b",
  "#fb7185",
  "#f472b6",
  "#e8a87c",
  "#00b894",
  "#00cec9",
];

export const SVG_STAR = `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M12 2l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7L12 2z"/></svg>`;
const SVG_LOCK = `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>`;
const SVG_FLAME = `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M12 23c-4.97 0-9-3.6-9-8 0-3.2 2-6 5-7.5-.5 1.5-.2 3 .8 4 1-3 3-5.5 5.5-7-.5 2 .5 4 2 5.5.5-1.5 1.2-3 2.2-4C19.5 8 21 11 21 14c0 4.97-4.03 9-9 9z"/></svg>`;
const SVG_CROWN = `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M5 16L3 6l5.5 5L12 4l3.5 7L21 6l-2 10H5zm0 2h14v2H5v-2z"/></svg>`;
const SVG_GALAXY = `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 2c1 0 1.8.7 2.3 1.7.9-.3 1.9-.4 2.7 0 .5.3.9.8 1 1.4.6.4 1 1 1.1 1.7.1.7-.1 1.4-.5 2 .4.6.5 1.3.3 2-.2.6-.7 1.2-1.3 1.5.1.7 0 1.5-.5 2-.5.6-1.2.9-2 .9-.4.6-1 1.1-1.8 1.2-.7.1-1.4-.1-2-.5-.6.4-1.3.5-2 .4-.7-.2-1.3-.7-1.6-1.3-.7 0-1.4-.3-1.9-.8-.5-.5-.7-1.2-.6-1.9-.6-.4-1.1-1-1.3-1.7-.2-.7 0-1.4.3-2-.4-.6-.5-1.3-.3-2 .2-.6.7-1.2 1.3-1.5-.1-.7 0-1.5.5-2 .5-.6 1.2-.9 2-.9.4-.6 1-1.1 1.8-1.2.4-.1.8 0 1.2.1C10.5 4.4 11.2 4 12 4z"/></svg>`;

export function getTierIcon(tier, unlocked) {
  if (!unlocked) return SVG_LOCK;
  if (tier === 8) return SVG_GALAXY;
  if (tier === 7) return SVG_CROWN;
  if (tier === 6) return SVG_FLAME;
  return SVG_STAR;
}
