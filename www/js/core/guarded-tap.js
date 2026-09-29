const TAP_MOVE_TOLERANCE_PX = 10;
const TAP_MIN_DURATION_MS = 30;
const TAP_MAX_DURATION_MS = 800;
const TAP_COOLDOWN_MS = 100;

export function bindGuardedTap(el, onTap) {
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let lastAccepted = 0;

  const reset = () => {
    pointerId = null;
  };

  el.addEventListener("pointerdown", (e) => {
    if (pointerId !== null || !e.isPrimary) return;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    startTime = Date.now();
  });

  el.addEventListener("pointerup", (e) => {
    if (e.pointerId !== pointerId) return;
    const held = Date.now() - startTime;
    const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
    const isDeliberate =
      held >= TAP_MIN_DURATION_MS &&
      held <= TAP_MAX_DURATION_MS &&
      moved <= TAP_MOVE_TOLERANCE_PX &&
      Date.now() - lastAccepted >= TAP_COOLDOWN_MS;
    reset();
    if (isDeliberate) {
      lastAccepted = Date.now();
      onTap(e);
    }
  });

  el.addEventListener("pointercancel", reset);
  el.addEventListener("pointerleave", reset);

  if (el.tagName === "BUTTON" || el.getAttribute("role") === "button") {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onTap(e);
      }
    });
  }
}
