// Motion layer — every GSAP animation in the app lives here so views and
// features only call intent-named functions.
//
// GSAP 3.15's ESM build is imported directly (vendored from node_modules/gsap
// into www/lib/gsap). This module itself is an ES module, so the import is
// resolved along with the rest of the app — no global, no load-order race.
// If the import fails the app must still work, so it is optional: every entry
// point below becomes a plain, instant DOM update when there is no GSAP.
import { gsap as importedGsap } from "../../lib/gsap/index.js";

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export let motionEnabled = Boolean(importedGsap) && !prefersReducedMotion();

// GSAP is ready the moment this module evaluates; kept as a name so the call
// sites below read the same if the import ever needs to become lazy again.
function withGsap(fn) {
  if (!motionEnabled) return;
  fn(importedGsap);
}

// Transforms used by tap feedback; shared so a new tween can cancel the last.
const tweenRegistry = new WeakMap();

function killTween(el) {
  if (!el) return;
  const prev = tweenRegistry.get(el);
  if (prev) {
    prev.kill();
    tweenRegistry.delete(el);
  }
}

function track(el, tween) {
  tweenRegistry.set(el, tween);
}

/* ---------- Boot / loading ---------- */

export function animateBoot(loadingState) {
  if (!loadingState) return;
  const target =
    loadingState.querySelector("#loadingSpinner") ||
    loadingState.querySelector("#loadingError");
  if (!target) return;
  withGsap((gsap) => {
    gsap.from(target, {
      opacity: 0,
      y: 8,
      scale: 0.96,
      duration: 0.5,
      ease: "power3.out",
    });
  });
}

export function animateLoadingOut(loadingState, onHidden) {
  if (!loadingState) return;

  // Idempotent finish: the tween and the no-GSAP safety net race, and only the
  // first one through should hide the loader and start the home entrance.
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    loadingState.classList.add("hidden");
    loadingState.style.pointerEvents = "";
    if (onHidden) onHidden();
  };

  loadingState.style.pointerEvents = "none";
  withGsap((gsap) => {
    gsap.to(loadingState, {
      opacity: 0,
      scale: 1.03,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: done,
    });
  });

  // If the tween never started (reduced motion / no GSAP), don't wait on it.
  if (!motionEnabled) setTimeout(done, 0);
}

/* ---------- Home screen entrance ---------- */

export function animateHomeEntrance() {
  const top = document.querySelector(".hp-top");
  const stage = document.querySelector(".hp-stage");
  const ring = document.querySelector(".hp-ring");
  const controls = document.querySelector(".hp-controls");
  if (!ring) return;

  withGsap((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(top, { opacity: 0, y: -12, duration: 0.45 })
      .from(
        ring,
        {
          opacity: 0,
          scale: 0.86,
          rotate: -12,
          duration: 0.75,
          ease: "back.out(1.4)",
        },
        "-=0.2",
      )
      .from(
        stage ? stage.querySelectorAll(".hp-ring-svg circle") : [],
        { opacity: 0, duration: 0.5, stagger: 0.08 },
        "<0.05",
      )
      .from(controls, { opacity: 0, y: 14, duration: 0.45 }, "-=0.35");
  });
}

/* ---------- View switching ---------- */

export function animateViewIn(view) {
  if (!view) return;

  // Kill any in-flight hide so a fast double-switch can't leave a view blank.
  killTween(view);
  view.style.opacity = "";

  withGsap((gsap) => {
    const tl = gsap.timeline();
    tl.fromTo(
      view,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        clearProps: "transform",
      },
    );

    // Children that read as "cards" lift in a gentle cascade. The selector is
    // per-view because each tab nests its cards differently: Settings and
    // Prayers put them straight in `.pg-stack`, Insights wraps them in
    // `.ins-stack` and `.ins-grid`. Keep the count small — long lists (badges,
    // heatmap) would feel sluggish otherwise.
    const items = view.querySelectorAll(
      [
        ".pg-stack > section",
        ".pg-stack > header",
        ".pg-stack > .st-row",
        ".pg-stack > .st-details",
        ".ins-stack > header",
        ".ins-stack > section",
        ".ins-grid > .ins-tile",
      ].join(", "),
    );
    if (items.length) {
      tl.from(
        Array.from(items).slice(0, 14),
        {
          opacity: 0,
          y: 12,
          duration: 0.32,
          stagger: 0.035,
          ease: "power2.out",
        },
        "-=0.2",
      );
    }
  });
}

export function animateViewOut(view) {
  if (!view) return;
  killTween(view);
  withGsap((gsap) => {
    track(
      view,
      gsap.to(view, { opacity: 0, y: -6, duration: 0.14, ease: "power1.in" }),
    );
  });
}

/* ---------- Counter + ring progress ---------- */

// Deliberately a plain assignment, not a tween: a ring that eases to every tap
// lags behind the count under the finger and feels disconnected from it.
export function setRingProgress(el, dashOffset) {
  if (!el) return;
  el.style.transition = "none";
  el.style.strokeDashoffset = dashOffset;
}

export function pressTap(el) {
  if (!el) return;
  withGsap((gsap) => {
    gsap.to(el, { scale: 0.97, duration: 0.08, ease: "power2.out" });
    gsap.to(el, { scale: 1, duration: 0.18, delay: 0.08, ease: "back.out(2)" });
  });
}

export function popCounter(el) {
  if (!el) return;
  killTween(el);
  withGsap((gsap) => {
    track(
      el,
      gsap.fromTo(
        el,
        { scale: 1, y: 0 },
        {
          scale: 1.09,
          y: -2,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
          clearProps: "transform",
        },
      ),
    );
  });
}

// Counts the visible number to its new value. Undo/reset jump several counts at
// once, so the number rolls rather than snapping.
export function animateNumber(el, from, to) {
  if (!el || from === to) {
    if (el) el.textContent = to.toLocaleString();
    return;
  }
  const proxy = { value: from };
  killTween(el);
  withGsap((gsap) => {
    track(
      el,
      gsap.to(proxy, {
        value: to,
        duration: 0.4,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = Math.round(proxy.value).toLocaleString();
        },
      }),
    );
  });
}

/* ---------- Progress bars (XP, insights "today") ---------- */

// Same reasoning as the ring: bar fills are a readout of state, not a flourish.
// They move with the value instead of easing after it.
export function setBarWidth(el, percent) {
  if (!el) return;
  el.style.transition = "none";
  el.style.width = `${percent}%`;
}

/* ---------- Reward burst ---------- */

export function flashStage(el) {
  if (!el) return;
  withGsap((gsap) => {
    gsap.fromTo(
      el,
      { scale: 1 },
      {
        scale: 1.04,
        duration: 0.28,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        clearProps: "transform",
      },
    );
  });
}

/* ---------- Toasts ---------- */

export function animateToastIn(el) {
  if (!el) return;
  killTween(el);
  withGsap((gsap) => {
    track(
      el,
      gsap.fromTo(
        el,
        { opacity: 0, y: -18, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.6)",
          clearProps: "transform",
        },
      ),
    );
  });
}

export function animateToastOut(el) {
  if (!el) return;
  const finish = () => el.classList.add("hidden");
  killTween(el);
  if (!motionEnabled) {
    finish();
    return;
  }
  withGsap((gsap) => {
    track(
      el,
      gsap.to(el, {
        opacity: 0,
        y: -12,
        duration: 0.22,
        ease: "power2.in",
        onComplete: finish,
      }),
    );
  });
}

/* ---------- Modals ---------- */

export function animateModalIn(modal) {
  if (!modal) return;
  killTween(modal);
  const card = modal.querySelector(".modal-panel") || modal;
  withGsap((gsap) => {
    track(
      modal,
      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.2 }),
    );
    gsap.fromTo(
      card,
      { opacity: 0, y: 24, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        ease: "back.out(1.5)",
        clearProps: "transform",
      },
    );
  });
}

export function animateModalOut(modal, onHidden) {
  if (!modal) return;

  const hidden = () => {
    modal.classList.add("hidden");
    modal.style.opacity = "";
    const card = modal.querySelector(".modal-panel");
    if (card) {
      card.style.opacity = "";
      card.style.transform = "";
    }
    if (onHidden) onHidden();
  };

  killTween(modal);
  if (!motionEnabled) {
    hidden();
    return;
  }

  withGsap((gsap) => {
    const card = modal.querySelector(".modal-panel") || modal;
    gsap.to(card, {
      opacity: 0,
      y: 16,
      scale: 0.97,
      duration: 0.18,
      ease: "power2.in",
    });
    track(
      modal,
      gsap.to(modal, { opacity: 0, duration: 0.2, onComplete: hidden }),
    );
  });
}

/* ---------- Small touches ---------- */

export function animateBadgeList(container) {
  if (!container) return;
  const badges = container.querySelectorAll(".bdg");
  if (!badges.length) return;
  withGsap((gsap) => {
    gsap.from(badges, {
      opacity: 0,
      scale: 0.8,
      duration: 0.35,
      stagger: 0.03,
      ease: "back.out(1.7)",
      clearProps: "transform",
    });
  });
}
