import { motionReduced } from './effects';

function initDoomPage() {
  const page = document.querySelector<HTMLElement>('[data-doom-page]');
  if (!page || page.dataset.doomReady) return;
  page.dataset.doomReady = '1';
  const controller = new AbortController();
  const { signal } = controller;
  const cabinet = page.querySelector<HTMLElement>('[data-doom-fx="cabinet"]');
  const title = page.querySelector<HTMLElement>('.doom-title');
  const cover = page.querySelector<HTMLElement>('.doom-cover-screen');
  const bossFiles = page.querySelector<HTMLElement>('.doom-boss-files');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const activeEffects = new Map<HTMLElement, { className: string; timer: number }>();
  let idleTimer: number | undefined;
  let booted = false;
  let lastGlitch = -Infinity;

  const playEffect = (element: HTMLElement | null, className: string, duration: number) => {
    if (signal.aborted || !element || motionReduced() || document.hidden || activeEffects.has(element)) return;
    element.classList.add(className);
    const timer = window.setTimeout(() => {
      element.classList.remove(className);
      activeEffects.delete(element);
    }, duration);
    activeEffects.set(element, { className, timer });
  };
  const clearEffects = () => {
    activeEffects.forEach(({ className, timer }, element) => {
      window.clearTimeout(timer);
      element.classList.remove(className);
    });
    activeEffects.clear();
  };
  const glitchHero = () => {
    if (!cabinet?.hasAttribute('data-doom-visible') || performance.now() - lastGlitch < 1800) return;
    lastGlitch = performance.now();
    playEffect(title, 'is-glitching', 720);
    playEffect(cover, 'is-glitching', 720);
  };
  const syncMotion = () => {
    if (signal.aborted) return;
    const enabled = !motionReduced() && !document.hidden;
    page.dataset.doomMotion = enabled ? 'on' : 'off';
    if (!enabled) clearEffects();
    if (!enabled || !cabinet?.hasAttribute('data-doom-visible')) {
      window.clearTimeout(idleTimer);
      idleTimer = undefined;
      return;
    }
    if (!booted) {
      booted = true;
      playEffect(cover, 'is-booting', 800);
      playEffect(title, 'is-glitching', 720);
    }
    if (idleTimer === undefined) {
      idleTimer = window.setTimeout(() => {
        idleTimer = undefined;
        glitchHero();
        syncMotion();
      }, 11000);
    }
  };
  // Ambient animation runs only on visible panels, and sleeps when the tab is hidden.
  const fxObserver = new IntersectionObserver(entries => {
    if (signal.aborted) return;
    entries.forEach(entry => entry.target.toggleAttribute('data-doom-visible', entry.isIntersecting));
    syncMotion();
  }, { threshold: 0.08 });
  page.querySelectorAll('[data-doom-fx]').forEach(panel => fxObserver.observe(panel));
  document.addEventListener('visibilitychange', syncMotion, { signal });
  document.addEventListener('trampolin:effects-change', syncMotion, { signal });
  reducedMotion.addEventListener('change', syncMotion, { signal });
  title?.addEventListener('pointerenter', glitchHero, { signal });
  cover?.addEventListener('pointerenter', glitchHero, { signal });
  page.querySelector('.doom-actions')?.addEventListener('focusin', glitchHero, { signal });
  syncMotion();

  // Draw each asset once at low resolution; no animation loop or video download.
  page.querySelectorAll<HTMLElement>('[data-doom-pixels]').forEach(frame => {
    const img = frame.querySelector('img');
    const canvas = frame.querySelector('canvas');
    if (!img || !canvas) return;
    const draw = () => {
      if (signal.aborted || !img.naturalWidth) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.width = Number(frame.dataset.doomPixels) || 192;
      canvas.height = Math.round(canvas.width * img.naturalHeight / img.naturalWidth);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      frame.dataset.pixelReady = '1';
    };
    if (img.complete) draw();
    else img.addEventListener('load', draw, { once: true, signal });
  });

  const selector = page.querySelector<HTMLElement>('[data-doom-selector]');
  const choices = [...page.querySelectorAll<HTMLButtonElement>('[data-doom-boss]')];
  const panels = [...page.querySelectorAll<HTMLElement>('[data-doom-boss-panel]')];
  const selectBoss = (id: string, animate = false) => {
    const changed = choices.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.doomBoss !== id;
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.doomBoss === id)));
    panels.forEach(panel => { panel.hidden = panel.dataset.doomBossPanel !== id; });
    if (animate && changed) playEffect(bossFiles, 'is-tuning', 600);
  };
  if (selector && choices.length) {
    selectBoss(choices[0].dataset.doomBoss!);
    selector.hidden = false;
    choices.forEach(button => button.addEventListener('click', () => selectBoss(button.dataset.doomBoss!, true), { signal }));
  }

  // Extra game-menu keys stay inside these controls; normal Tab/Enter still work.
  page.querySelectorAll<HTMLElement>('[data-doom-menu]').forEach(menu => {
    const controls = [...menu.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>('a, button')];
    menu.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const index = controls.indexOf(document.activeElement as HTMLButtonElement);
      if (index < 0) return;
      let next: number;
      switch (event.key) {
        case 'ArrowDown': case 'ArrowRight': next = (index + 1) % controls.length; break;
        case 'ArrowUp': case 'ArrowLeft': next = (index + controls.length - 1) % controls.length; break;
        case 'Home': next = 0; break;
        case 'End': next = controls.length - 1; break;
        default: return;
      }
      event.preventDefault();
      controls[next].focus();
      if (menu.hasAttribute('data-doom-selector')) controls[next].click();
    }, { signal });
  });

  const screen = page.querySelector<HTMLElement>('[data-doom-game-screen]');
  const poster = page.querySelector<HTMLElement>('[data-doom-game-poster]');
  const start = page.querySelector<HTMLButtonElement>('[data-doom-start]');
  const stop = page.querySelector<HTMLButtonElement>('[data-doom-stop]');
  let iframe: HTMLIFrameElement | undefined;
  const stopGame = () => {
    iframe?.remove();
    iframe = undefined;
    if (poster) poster.hidden = false;
    if (stop) stop.hidden = true;
  };
  const launch = () => {
    if (iframe || !screen || !poster || !stop) return;
    iframe = document.createElement('iframe');
    iframe.src = '/tym_trampolin_doom.html';
    iframe.title = 'DOOM Bounce';
    iframe.allow = 'autoplay; fullscreen; gamepad';
    screen.append(iframe);
    poster.hidden = true;
    stop.hidden = false;
    playEffect(screen, 'is-powering', 650);
    // Keep focus outside the game's pointer lock, with a reachable exit button.
    stop.focus({ preventScroll: true });
  };
  start?.addEventListener('click', launch, { signal });
  page.querySelector('[data-doom-start-link]')?.addEventListener('click', launch, { signal });
  stop?.addEventListener('click', () => {
    stopGame();
    start?.focus({ preventScroll: true });
  }, { signal });
  document.addEventListener('astro:before-swap', () => {
    window.clearTimeout(idleTimer);
    fxObserver.disconnect();
    clearEffects();
    stopGame();
    page.querySelectorAll('video').forEach(video => video.pause());
    controller.abort();
  }, { once: true, signal });
}

initDoomPage();
document.addEventListener('astro:page-load', initDoomPage);
