function initDoomPage() {
  const page = document.querySelector<HTMLElement>('[data-doom-page]');
  if (!page || page.dataset.doomReady) return;
  page.dataset.doomReady = '1';
  const controller = new AbortController();
  const { signal } = controller;

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
  const selectBoss = (id: string) => {
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.doomBoss === id)));
    panels.forEach(panel => { panel.hidden = panel.dataset.doomBossPanel !== id; });
  };
  if (selector && choices.length) {
    selectBoss(choices[0].dataset.doomBoss!);
    selector.hidden = false;
    choices.forEach(button => button.addEventListener('click', () => selectBoss(button.dataset.doomBoss!), { signal }));
  }

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
    stopGame();
    page.querySelectorAll('video').forEach(video => video.pause());
    controller.abort();
  }, { once: true, signal });
}

initDoomPage();
document.addEventListener('astro:page-load', initDoomPage);
