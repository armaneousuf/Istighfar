import { getState } from "./app-state.js";

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function primeAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0);
  } catch (e) {}
}

export function installAudioPrimer() {
  if (typeof window === "undefined") return;
  ["pointerdown", "touchstart", "keydown"].forEach((evt) =>
    window.addEventListener(evt, primeAudio, { once: true, passive: true }),
  );
}

export function playClickSound(pitchShift = 0) {
  if (!getState()?.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime + 0.005;
    const baseFreq = 620 + pitchShift;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.14, now + 0.006);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    master.connect(ctx.destination);

    const layers = [
      { type: "sine", freq: baseFreq, gain: 1, glide: 0.55 },
      { type: "triangle", freq: baseFreq * 2, gain: 0.25, glide: 0.4 },
    ];
    layers.forEach((layer) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = layer.type;
      osc.frequency.setValueAtTime(layer.freq, now);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(80, layer.freq * layer.glide),
        now + 0.08,
      );
      g.gain.setValueAtTime(layer.gain, now);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + 0.1);
    });
  } catch (e) {}
}

export function playMilestoneSound() {
  if (!getState()?.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime + 0.005;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.08;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch (e) {}
}
