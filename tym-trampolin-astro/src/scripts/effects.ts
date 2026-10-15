/** A manual reduction can only reduce motion, never override the OS preference. */
export function motionReduced(): boolean {
  return document.documentElement.dataset.effects === "reduced" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function updateEffectsButtons() {
  const reduced = document.documentElement.dataset.effects === "reduced";
  document.querySelectorAll<HTMLButtonElement>("[data-effects-toggle]").forEach(button => {
    button.setAttribute("aria-pressed", String(reduced));
    button.textContent = (reduced ? button.dataset.reduced : button.dataset.system)!;
  });
}

function initEffects() {
  try {
    document.documentElement.dataset.effects = localStorage.getItem("trampolin-effects") === "reduced" ? "reduced" : "system";
  } catch { /* System preference remains available without storage. */ }
  updateEffectsButtons();
  document.querySelectorAll<HTMLButtonElement>("[data-effects-toggle]").forEach(button => {
    if (button.dataset.ready) return;
    button.dataset.ready = "1";
    button.addEventListener("click", () => {
      const mode = document.documentElement.dataset.effects === "reduced" ? "system" : "reduced";
      document.documentElement.dataset.effects = mode;
      try { localStorage.setItem("trampolin-effects", mode); } catch { /* Keep the current-page choice. */ }
      document.dispatchEvent(new Event("trampolin:effects-change"));
    });
  });
}
document.addEventListener("trampolin:effects-change", updateEffectsButtons);
initEffects();
document.addEventListener("astro:page-load", initEffects);
