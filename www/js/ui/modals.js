import { infoModal, infoBtn, closeInfoModal, getEl } from "../core/dom.js";

function wirePair(openId, closeId, modalId) {
  const openBtn = getEl(openId);
  const closeBtn = getEl(closeId);
  const modal = getEl(modalId);
  if (!openBtn || !closeBtn || !modal) return;
  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
}

export function setupModals() {
  if (infoBtn && closeInfoModal && infoModal) {
    infoBtn.addEventListener("click", () =>
      infoModal.classList.remove("hidden"),
    );
    closeInfoModal.addEventListener("click", () =>
      infoModal.classList.add("hidden"),
    );
  }

  wirePair("openGuideModalBtn", "closeGuideModalBtn", "guideModal");
  wirePair("openProgressModalBtn", "closeProgressModalBtn", "progressModal");
  wirePair("openTipsModalBtn", "closeTipsModalBtn", "tipsModal");
  wirePair("openAboutModalBtn", "closeAboutModalBtn", "aboutModal");
  wirePair("openDuasModalBtn", "closeDuasModalBtn", "duasModal");
}
