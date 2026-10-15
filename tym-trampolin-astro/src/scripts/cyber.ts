// Event-driven public-site effects; every listener/frame is released on route swaps.
import { motionReduced } from "./effects";
type Glyph = { character: string; x: number; y: number; width: number };
type DecodeJob = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; glyphs: Glyph[]; start: number; width: number; height: number; color: string };
type Photo = { element: HTMLElement; image: HTMLImageElement; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; source?: Uint8ClampedArray; visible: boolean; x: number; y: number; amount: number; target: number; glitchUntil: number; lastGlitch: number };

let mounted: HTMLElement | null = null;
let dispose = () => {};
let finishTransient = () => {};

function initCyber() {
  const root = document.body;
  if (!root.classList.contains("site-cyber") || mounted === root) return;
  dispose(); mounted = root;
  const controller = new AbortController(), { signal } = controller;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const observers: (IntersectionObserver | ResizeObserver)[] = [];
  const animations = new Set<Animation>();
  const decodeJobs = new Map<HTMLElement, DecodeJob>();
  const decoded = new WeakSet<HTMLElement>(), lastDecode = new WeakMap<HTMLElement, number>();
  const pendingPhotos = new Set<Photo>(), photos: Photo[] = [];
  let decodeFrame = 0, photoFrame = 0, pointerFrame = 0, lastPaint = 0, lastDecodePaint = 0;

  function animate(element: Element, frames: Keyframe[], duration = 500) {
    if (motionReduced()) return;
    const animation = element.animate(frames, { duration, easing: "cubic-bezier(.16,1,.3,1)" });
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  }
  function finishDecode(element: HTMLElement, job: DecodeJob) {
    job.canvas.remove(); element.classList.remove("decode-running", "is-glitching"); decodeJobs.delete(element);
  }
  function decode(element: HTMLElement | null) {
    if (!element || motionReduced() || decodeJobs.has(element) || signal.aborted) return;
    const now = performance.now();
    if (now - (lastDecode.get(element) ?? -2000) < 1200) return;
    const bounds = element.getBoundingClientRect(), style = getComputedStyle(element);
    if (!bounds.width || !bounds.height) return;
    lastDecode.set(element, now);
    const canvas = document.createElement("canvas"); canvas.className = "decode-cover"; canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(bounds.width * scale); canvas.height = Math.ceil(bounds.height * scale);
    ctx.scale(scale, scale); ctx.font = style.font; ctx.textBaseline = "alphabetic";
    const metrics = ctx.measureText("Hg"), glyphs: Glyph[] = [], walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (let i = 0; i < (node.textContent?.length ?? 0); i++) {
        const char = node.textContent![i]; if (/\s/.test(char)) continue;
        const range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + 1);
        const box = range.getBoundingClientRect();
        glyphs.push({ character: style.textTransform === "uppercase" ? char.toUpperCase() : char, x: box.left - bounds.left, y: box.top - bounds.top + (box.height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2, width: box.width });
      }
    }
    if (!glyphs.length) return;
    const job = { canvas, ctx, glyphs, start: now, width: bounds.width, height: bounds.height, color: style.color === "rgba(0, 0, 0, 0)" ? "#edf4ff" : style.color };
    element.append(canvas); element.classList.add("decode-running", "is-glitching"); decodeJobs.set(element, job);
    if (!decodeFrame) decodeFrame = requestAnimationFrame(paintDecode);
  }
  function paintDecode(now: number) {
    decodeFrame = 0;
    if (now - lastDecodePaint > 38) {
      lastDecodePaint = now;
      for (const [element, job] of decodeJobs) {
        const progress = (now - job.start) / 780;
        if (progress >= 1 || !element.isConnected || motionReduced()) { finishDecode(element, job); continue; }
        const { ctx, glyphs, width, height } = job; ctx.clearRect(0, 0, width, height);
        glyphs.forEach((glyph, index) => {
          const front = progress * 1.28 - index / glyphs.length, resolved = front > .24;
          const code = "01<>/{}[]_*+", tick = Math.floor((now - job.start) / 65);
          ctx.globalAlpha = resolved ? 1 : front > -.18 ? .85 : .25;
          ctx.fillStyle = resolved ? job.color : front > 0 ? "#4fc8ff" : "#7d8bff";
          ctx.fillText(resolved ? glyph.character : code[(index * 7 + tick) % code.length], glyph.x, glyph.y, Math.max(glyph.width, 2));
        });
        ctx.globalAlpha = 1;
      }
    }
    if (decodeJobs.size) decodeFrame = requestAnimationFrame(paintDecode);
  }

  const bayer = [0,48,12,60,3,51,15,63,32,16,44,28,35,19,47,31,8,56,4,52,11,59,7,55,40,24,36,20,43,27,39,23,2,50,14,62,1,49,13,61,34,18,46,30,33,17,45,29,10,58,6,54,9,57,5,53,42,26,38,22,41,25,37,21];
  function drawPhoto(photo: Photo) {
    if (!photo.visible || !photo.image.naturalWidth || !photo.element.isConnected) return;
    const bounds = photo.element.getBoundingClientRect(), w = Math.ceil(bounds.width / 2.4), h = Math.ceil(bounds.height / 2.4);
    if (!w || !h) return;
    if (!photo.source || photo.canvas.width !== w || photo.canvas.height !== h) {
      photo.canvas.width = w; photo.canvas.height = h;
      const source = document.createElement("canvas"); source.width = w; source.height = h;
      const ctx = source.getContext("2d", { willReadFrequently: true }); if (!ctx) return;
      const scale = Math.max(w / photo.image.naturalWidth, h / photo.image.naturalHeight);
      ctx.drawImage(photo.image, (w - photo.image.naturalWidth * scale) / 2, (h - photo.image.naturalHeight * scale) / 2, photo.image.naturalWidth * scale, photo.image.naturalHeight * scale);
      photo.source = ctx.getImageData(0, 0, w, h).data;
    }
    const src = photo.source, out = photo.ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 4, raw = (.2126 * src[k] + .7152 * src[k + 1] + .0722 * src[k + 2]) / 255;
      const lum = Math.min(.98, Math.max(0, (raw - .45) * 1.1 + .45)), on = lum > bayer[(y % 8) * 8 + x % 8] / 64 + .055;
      const violet = Math.max(0, (x / w - .25) * 1.1);
      out.data[k] = on ? 79 + 46 * violet : 3; out.data[k + 1] = on ? 200 - 61 * violet : 8; out.data[k + 2] = on ? 255 : 20; out.data[k + 3] = 255;
      if (on && raw > .83) { out.data[k] = 180; out.data[k + 1] = 220; out.data[k + 2] = 255; }
      if (photo.amount > 0) {
        const distance = Math.hypot((x / w - photo.x) * w / h, y / h - photo.y), reveal = Math.pow(Math.max(0, 1 - distance / .48), 1.2) * photo.amount;
        const value = Math.pow(raw, .8);
        out.data[k] = out.data[k] * (1 - reveal) + (30 + 190 * value) * reveal;
        out.data[k + 1] = out.data[k + 1] * (1 - reveal) + (55 + 184 * value) * reveal;
        out.data[k + 2] = out.data[k + 2] * (1 - reveal) + (85 + 170 * value) * reveal;
      }
    }
    const remaining = (photo.glitchUntil - performance.now()) / 420;
    if (remaining > 0 && !motionReduced()) {
      const phase = Math.floor(remaining * 5), snapshot = new Uint8ClampedArray(out.data);
      for (let band = 0; band < 3; band++) {
        const y0 = Math.floor(h * ([.23, .52, .76][band] + phase * .012)), height = Math.max(2, Math.floor(h * (band === 1 ? .06 : .025)));
        const shift = Math.round((band % 2 ? 1 : -1) * (4 + phase) * remaining);
        for (let y = y0; y < Math.min(h, y0 + height); y++) for (let x = 0; x < w; x++) {
          const k = (y * w + x) * 4, source = (y * w + (x + shift + w) % w) * 4;
          out.data[k] = snapshot[source]; out.data[k + 1] = snapshot[source + 1]; out.data[k + 2] = snapshot[(y * w + (x - shift + w) % w) * 4 + 2];
        }
      }
    }
    photo.ctx.putImageData(out, 0, 0); photo.element.classList.add("is-ready");
  }
  function paintPhotos(now: number) {
    photoFrame = 0;
    if (now - lastPaint > 25) {
      lastPaint = now;
      for (const photo of pendingPhotos) {
        photo.amount += (photo.target - photo.amount) * .22;
        if (Math.abs(photo.target - photo.amount) < .012) {
          photo.amount = photo.target;
          if (photo.glitchUntil <= now) { pendingPhotos.delete(photo); photo.element.classList.remove("is-glitching"); }
        }
        drawPhoto(photo);
      }
    }
    if (pendingPhotos.size) photoFrame = requestAnimationFrame(paintPhotos);
  }
  function queuePhoto(photo: Photo) { pendingPhotos.add(photo); if (!photoFrame) photoFrame = requestAnimationFrame(paintPhotos); }
  const photoVisibility = new IntersectionObserver(entries => {
    for (const entry of entries) { const photo = photos.find(p => p.element === entry.target); if (photo) { photo.visible = entry.isIntersecting; if (photo.visible) drawPhoto(photo); } }
  });
  const photoResize = new ResizeObserver(entries => { for (const entry of entries) { const photo = photos.find(p => p.element === entry.target); if (photo) drawPhoto(photo); } });
  observers.push(photoVisibility, photoResize);
  root.querySelectorAll<HTMLElement>("[data-dither]").forEach(element => {
    const canvas = element.querySelector("canvas")!, image = element.querySelector("img")!, ctx = canvas.getContext("2d"); if (!ctx) return;
    const photo: Photo = { element, canvas, image, ctx, visible: false, x: .5, y: .5, amount: 0, target: 0, glitchUntil: 0, lastGlitch: -2000 };
    photos.push(photo); photoVisibility.observe(element); photoResize.observe(element);
    image.addEventListener("load", () => drawPhoto(photo), { signal });
    element.addEventListener("pointerenter", event => {
      if (motionReduced() || event.pointerType === "touch") return;
      const now = performance.now(); if (now - photo.lastGlitch < 1500) return;
      photo.lastGlitch = now; photo.glitchUntil = now + 420; element.classList.add("is-glitching"); queuePhoto(photo);
    }, { signal });
    element.addEventListener("pointermove", event => {
      if (motionReduced() || event.pointerType === "touch") return;
      const bounds = element.getBoundingClientRect(); photo.x = (event.clientX - bounds.left) / bounds.width; photo.y = (event.clientY - bounds.top) / bounds.height; photo.target = 1; queuePhoto(photo);
      const hero = element.closest<HTMLElement>(".hero-photo");
      hero?.style.setProperty("--tilt-x", `${(.5 - photo.y) * 5}deg`); hero?.style.setProperty("--tilt-y", `${(photo.x - .5) * 5}deg`);
    }, { signal });
    element.addEventListener("pointerleave", () => { photo.target = 0; queuePhoto(photo); element.closest<HTMLElement>(".hero-photo")?.removeAttribute("style"); }, { signal });
  });

  root.querySelectorAll<HTMLElement>("[data-project-directory]").forEach(directory => {
    const tabs = [...directory.querySelectorAll<HTMLAnchorElement>("[data-project-tab]")], panels = [...directory.querySelectorAll<HTMLElement>("[data-project-panel]")];
    const index = directory.querySelector(".directory-index")!;
    index.setAttribute("role", "tablist"); index.setAttribute("aria-orientation", "vertical");
    tabs.forEach(tab => { tab.setAttribute("role", "tab"); tab.setAttribute("aria-controls", `panel-${tab.dataset.projectTab}`); });
    panels.forEach(panel => panel.setAttribute("role", "tabpanel"));
    function select(id: string, motion = true) {
      const selected = tabs.find(tab => tab.dataset.projectTab === id); if (!selected) return;
      tabs.forEach(tab => { const active = tab === selected; tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1; });
      panels.forEach(panel => { panel.hidden = panel.dataset.projectPanel !== id; if (panel.hidden) panel.querySelectorAll("video").forEach(video => video.pause()); });
      const panel = panels.find(p => p.dataset.projectPanel === id)!;
      if (motion || location.hash.startsWith("#tab-")) root.querySelectorAll<HTMLAnchorElement>('[aria-label="Switch to English"], [aria-label="Přepnout do češtiny"]').forEach(link => {
        const url = new URL(link.href); url.hash = selected.id; link.href = url.pathname + url.hash;
      });
      if (motion) { animate(panel.querySelector(".project-art")!, [{ clipPath: "inset(0 0 92% 0)" }, { clipPath: "inset(0)" }], 460); decode(panel.querySelector("[data-decode]")); }
    }
    select(tabs[0].dataset.projectTab!, false);
    const linked = location.hash.startsWith("#tab-") ? location.hash.slice(5) : null;
    if (linked) select(linked, false);
    directory.addEventListener("click", event => {
      const tab = (event.target as Element).closest<HTMLAnchorElement>("[data-project-tab]");
      if (!tab || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault(); select(tab.dataset.projectTab!);
      history.replaceState(history.state, "", `#${tab.id}`);
      if (matchMedia("(max-width:650px)").matches) tab.scrollIntoView({ behavior: motionReduced() ? "instant" : "smooth", block: "start" });
    }, { signal });
    directory.addEventListener("keydown", event => {
      const tab = (event.target as Element).closest<HTMLAnchorElement>("[data-project-tab]"); if (!tab) return;
      const index = tabs.indexOf(tab);
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : event.key === "ArrowDown" ? (index + 1) % tabs.length : event.key === "ArrowUp" ? (index - 1 + tabs.length) % tabs.length : event.key === " " ? index : -1;
      if (next < 0) return; event.preventDefault(); select(tabs[next].dataset.projectTab!); history.replaceState(history.state, "", `#${tabs[next].id}`); tabs[next].focus();
    }, { signal });
  });

  root.addEventListener("click", event => {
    const button = (event.target as Element).closest<HTMLButtonElement>("[data-study]"); if (!button) return;
    const gallery = button.closest<HTMLElement>("[data-web-showcase]")!;
    const image = gallery.querySelector<HTMLImageElement>("[data-study-image]")!;
    image.src = button.dataset.src!; image.alt = button.dataset.alt!;
    gallery.querySelector("[data-study-title]")!.textContent = button.dataset.study!;
    gallery.querySelector<HTMLAnchorElement>("[data-study-link]")!.href = button.dataset.href!;
    gallery.querySelectorAll("[data-study]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    animate(image, [{ clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0)" }], 380);
  }, { signal });

  const timeline = root.querySelector<HTMLElement>("[data-timeline]");
  if (timeline) {
    const steps = [...timeline.querySelectorAll<HTMLElement>("[data-milestone]")], reached = new Set<number>();
    const update = () => {
      const nodeY = (el: HTMLElement) => el.offsetTop + parseFloat(getComputedStyle(el, "::after").top) + 4;
      const start = nodeY(steps[0]); let end = start;
      steps.forEach((step, i) => { step.classList.toggle("is-reached", reached.has(i)); if (reached.has(i)) end = Math.max(end, nodeY(step)); });
      timeline.style.setProperty("--trail-top", `${start}px`); timeline.style.setProperty("--trail-height", `${end - start}px`);
    };
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { for (let i = 0; i <= Number((entry.target as HTMLElement).dataset.milestone); i++) reached.add(i); observer.unobserve(entry.target); } update(); }, { threshold: .3 });
    const resize = new ResizeObserver(update); steps.forEach(step => observer.observe(step)); resize.observe(timeline); observers.push(observer, resize); update();
  }

  const decodeObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { const element = entry.target as HTMLElement; if (!decoded.has(element)) { decoded.add(element); decode(element); } decodeObserver.unobserve(element); }
  }, { threshold: .55 });
  observers.push(decodeObserver);
  document.fonts.ready.then(() => { if (!signal.aborted) root.querySelectorAll<HTMLElement>("[data-decode]").forEach(el => decodeObserver.observe(el)); });
  root.addEventListener("pointerover", event => {
    if (event.pointerType === "touch") return;
    const text = (event.target as Element).closest<HTMLElement>("[data-decode]"); if (text && !text.contains(event.relatedTarget as Node | null)) decode(text);
  }, { signal });
  root.addEventListener("focusin", event => decode((event.target as HTMLElement).querySelector("[data-decode]")), { signal });
  let pointer = { x: 0, y: 0 };
  root.addEventListener("pointermove", event => {
    if (motionReduced() || event.pointerType === "touch") return;
    pointer = { x: event.clientX, y: event.clientY }; if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => { pointerFrame = 0; root.style.setProperty("--light-x", `${pointer.x}px`); root.style.setProperty("--light-y", `${pointer.y}px`); });
  }, { passive: true, signal });
  const reveal = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { animate(entry.target, [{ transform: "translateY(18px)", opacity: .6 }, { transform: "translateY(0)", opacity: 1 }], 650); reveal.unobserve(entry.target); } }, { threshold: .12 });
  root.querySelectorAll(".cyber-cta,.team-person").forEach(el => reveal.observe(el)); observers.push(reveal);
  finishTransient = () => {
    for (const [element, job] of decodeJobs) finishDecode(element, job);
    animations.forEach(animation => animation.cancel()); animations.clear();
    photos.forEach(photo => { photo.target = 0; photo.amount = 0; photo.glitchUntil = 0; photo.element.classList.remove("is-glitching"); drawPhoto(photo); });
    root.querySelectorAll("video").forEach(video => video.pause());
    cancelAnimationFrame(decodeFrame); cancelAnimationFrame(photoFrame); cancelAnimationFrame(pointerFrame);
    decodeFrame = photoFrame = pointerFrame = 0; pendingPhotos.clear();
  };
  reduced.addEventListener("change", () => { if (motionReduced()) finishTransient(); }, { signal });
  document.addEventListener("trampolin:effects-change", () => { if (motionReduced()) finishTransient(); }, { signal });
  window.addEventListener("resize", () => { for (const [element, job] of decodeJobs) finishDecode(element, job); }, { signal });
  document.addEventListener("visibilitychange", () => { if (document.hidden) finishTransient(); }, { signal });
  dispose = () => { finishTransient(); controller.abort(); observers.forEach(observer => observer.disconnect()); mounted = null; };
}

initCyber();
document.addEventListener("astro:page-load", initCyber);
document.addEventListener("astro:before-preparation", () => finishTransient());
document.addEventListener("astro:before-swap", () => dispose());
