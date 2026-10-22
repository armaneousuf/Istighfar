import { infoModal, infoBtn, closeInfoModal, getEl } from "../core/dom.js";
import { animateModalIn, animateModalOut } from "../core/motion.js";

export function openModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
  animateModalIn(modal);
}

export function hideModal(modal) {
  if (!modal || modal.classList.contains("hidden")) return;
  animateModalOut(modal);
}

function wirePair(openId, closeId, modalId) {
  const openBtn = getEl(openId);
  const closeBtn = getEl(closeId);
  const modal = getEl(modalId);
  if (!openBtn || !closeBtn || !modal) return;
  openBtn.addEventListener("click", () => openModal(modal));
  closeBtn.addEventListener("click", () => hideModal(modal));
}

export function setupModals() {
  if (infoBtn && closeInfoModal && infoModal) {
    infoBtn.addEventListener("click", () => openModal(infoModal));
    closeInfoModal.addEventListener("click", () => hideModal(infoModal));
  }

  wirePair("openGuideModalBtn", "closeGuideModalBtn", "guideModal");
  wirePair("openProgressModalBtn", "closeProgressModalBtn", "progressModal");
  wirePair("openTipsModalBtn", "closeTipsModalBtn", "tipsModal");
  wirePair("openAboutModalBtn", "closeAboutModalBtn", "aboutModal");

  // Tapping the dimmed backdrop (but not the panel) dismisses the modal.
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hideModal(modal);
    });
  });
}
