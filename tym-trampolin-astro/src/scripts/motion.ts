// Shared motion layer — reveal, count-up, split-text, magnetic buttons, cursor dot.
// Re-initialised on every Astro view transition via astro:page-load.

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const noHover = () => window.matchMedia('(hover: none)').matches;

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal:not(.visible), .split-line:not(.visible)').forEach((el) => observer.observe(el));
}

function initCountUp() {
  const nodes = document.querySelectorAll<HTMLElement>('[data-count]:not([data-counted])');
  if (!nodes.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      el.dataset.counted = '1';
      const target = parseFloat(el.dataset.count || '0');
      const suffix = el.dataset.countSuffix || '';
      const decimals = parseInt(el.dataset.countDecimals || '0');
      if (reduceMotion()) {
        el.textContent = target.toFixed(decimals) + suffix;
        io.unobserve(el);
        return;
      }
      const duration = 1400;
      const start = performance.now();
      function tick(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.3 });
  nodes.forEach((n) => io.observe(n));
}

// Wrap each line of a [data-split] heading in a masked span.
function initSplitText() {
  document.querySelectorAll<HTMLElement>('[data-split]:not([data-split-done])').forEach((el) => {
    el.dataset.splitDone = '1';
    if (reduceMotion()) return;
    const lines = el.innerHTML.split(/<br[^>]*>/gi);
    el.innerHTML = lines
      .map((line, i) => `<span class="split-line" style="transition-delay:${i * 90}ms"><span class="split-inner" style="transition-delay:${i * 90}ms">${line}</span></span>`)
      .join('');
  });
}

function initMagnetic() {
  if (reduceMotion() || noHover()) return;
  document.querySelectorAll<HTMLElement>('.magnetic:not([data-magnetic-done])').forEach((el) => {
    el.dataset.magneticDone = '1';
    const strength = Math.min(parseFloat(el.dataset.magnetic || '10'), 12);
    let rect: DOMRect;
    el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

let cursorInited = false;
function initCursor() {
  if (cursorInited || reduceMotion() || noHover()) return;
  cursorInited = true;
  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  document.body.appendChild(dot);
  let x = -100, y = -100, cx = -100, cy = -100;
  window.addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    dot.classList.add('active');
  }, { passive: true });
  document.addEventListener('pointerleave', () => dot.classList.remove('active'));
  function hoverables() {
    const on = () => dot.classList.add('expand');
    const off = () => dot.classList.remove('expand');
    document.querySelectorAll('a, button, [role="button"], input, textarea, select, summary').forEach((el) => {
      if ((el as HTMLElement).dataset.cursorDone) return;
      (el as HTMLElement).dataset.cursorDone = '1';
      el.addEventListener('pointerenter', on);
      el.addEventListener('pointerleave', off);
    });
  }
  hoverables();
  document.addEventListener('astro:page-load', hoverables);
  function loop() {
    cx += (x - cx) * 0.22;
    cy += (y - cy) * 0.22;
    dot.style.transform = `translate(${cx - 6}px, ${cy - 6}px)`;
    requestAnimationFrame(loop);
  }
  loop();
}

function initAll() {
  initSplitText();
  initReveal();
  initCountUp();
  initMagnetic();
  initCursor();
}

initAll();
document.addEventListener('astro:page-load', initAll);
