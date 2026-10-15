import { motionReduced } from "./effects";

function initAlbum() {
  const card = document.getElementById("player-card");
  if (!card || card.dataset.albumReady) return;
  card.dataset.albumReady = "1";
  const controller = new AbortController(), { signal } = controller;
  const cs = document.documentElement.lang === "cs";
  const audio = new Audio();
  audio.preload = "metadata";
  let currentIndex = -1, frame = 0, inView = true, playRequest = 0;
  let audioCtx: AudioContext | undefined, analyser: AnalyserNode | undefined;
  let data: Uint8Array<ArrayBuffer> | undefined;
  const tracks = [...document.querySelectorAll<HTMLButtonElement>(".track-item")];
  const playButton = document.getElementById("btn-play")!;
  const playIcon = document.getElementById("icon-play")!;
  const pauseIcon = document.getElementById("icon-pause")!;
  const vinyl = document.getElementById("vinyl")!;
  const seek = document.getElementById("progress-bar") as HTMLInputElement;
  const currentTime = document.getElementById("time-current")!;
  const totalTime = document.getElementById("time-total")!;
  const status = document.getElementById("player-status")!;
  const canvas = document.getElementById("visualizer") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const time = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  function progress() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    seek.disabled = !duration;
    seek.max = String(duration || 1);
    seek.value = String(audio.currentTime);
    seek.setAttribute("aria-valuetext", `${time(audio.currentTime)} ${cs ? "z" : "of"} ${time(duration)}`);
    currentTime.textContent = time(audio.currentTime);
    totalTime.textContent = time(duration);
  }
  function stopViz() {
    cancelAnimationFrame(frame); frame = 0;
    vinyl.classList.remove("spinning");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }
  function draw() {
    frame = 0;
    if (signal.aborted || audio.paused || audio.ended || document.hidden || !inView || motionReduced() || !ctx || !analyser || !data) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    analyser.getByteFrequencyData(data);
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(127,214,255,.9)"); gradient.addColorStop(1, "rgba(125,139,255,.2)");
    ctx.fillStyle = gradient;
    for (let i = 0; i < 48; i++) {
      const h = data[Math.floor(i / 48 * data.length)] / 255 * height * .95;
      ctx.fillRect(i * width / 48 + 2, height - h, Math.max(1, width / 48 - 4), h);
    }
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    const playing = !audio.paused && !audio.ended;
    playIcon.classList.toggle("hidden", playing);
    pauseIcon.classList.toggle("hidden", !playing);
    playButton.setAttribute("aria-label", playing ? (cs ? "Pozastavit" : "Pause") : (cs ? "Přehrát" : "Play"));
    stopViz();
    if (playing && inView && !document.hidden && !motionReduced()) {
      vinyl.classList.add("spinning");
      frame = requestAnimationFrame(draw);
    }
  }
  function load(index: number) {
    playRequest++;
    audio.pause();
    currentIndex = index;
    const item = tracks[index];
    audio.src = item.dataset.src!;
    document.getElementById("now-title")!.textContent = item.dataset.title!;
    document.getElementById("now-subtitle")!.textContent = item.dataset.subtitle!;
    document.getElementById("now-genre")!.textContent = item.dataset.genre!;
    status.textContent = `${item.dataset.title} · ${item.dataset.subtitle}`;
    tracks.forEach((track, i) => {
      track.classList.toggle("active", i === index);
      if (i === index) track.setAttribute("aria-current", "true"); else track.removeAttribute("aria-current");
    });
    progress(); sync();
  }
  async function play() {
    if (currentIndex < 0) load(0);
    const request = ++playRequest;
    // Failure to initialize decorative audio analysis must not prevent playback.
    if (!audioCtx && window.AudioContext) {
      try {
        audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser(); analyser.fftSize = 128;
        data = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser); analyser.connect(audioCtx.destination);
      } catch { /* Native audio still works where Web Audio is unavailable. */ }
    }
    if (audioCtx?.state === "suspended") void audioCtx.resume().catch(() => {});
    try { await audio.play(); }
    catch {
      if (request === playRequest && !signal.aborted) status.textContent = cs ? "Přehrávání se nepovedlo. Zkuste to znovu." : "Playback failed. Please try again.";
    }
  }
  function pause() { playRequest++; audio.pause(); sync(); }
  function next(auto = false) { const resume = auto || !audio.paused; load((currentIndex + 1) % tracks.length); if (resume) void play(); }
  document.getElementById("btn-next")!.addEventListener("click", () => next(), { signal });
  document.getElementById("btn-prev")!.addEventListener("click", () => {
    if (audio.currentTime > 3) { audio.currentTime = 0; progress(); return; }
    const resume = !audio.paused;
    load(currentIndex < 0 ? tracks.length - 1 : (currentIndex - 1 + tracks.length) % tracks.length);
    if (resume) void play();
  }, { signal });
  playButton.addEventListener("click", () => audio.paused ? void play() : pause(), { signal });
  tracks.forEach((item, index) => item.addEventListener("click", () => {
    if (index === currentIndex && !audio.paused) pause();
    else { if (index !== currentIndex) load(index); void play(); }
  }, { signal }));
  seek.addEventListener("input", () => { if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(audio.duration, Number(seek.value)); progress(); }, { signal });
  for (const event of ["timeupdate", "loadedmetadata", "durationchange", "emptied"]) audio.addEventListener(event, progress, { signal });
  for (const event of ["play", "pause", "ended"]) audio.addEventListener(event, sync, { signal });
  audio.addEventListener("ended", () => next(true), { signal });
  audio.addEventListener("error", () => { status.textContent = cs ? "Skladbu se nepodařilo načíst. Zkuste jinou nebo stáhněte album." : "Could not load the track. Try another or download the album."; sync(); }, { signal });
  reduced.addEventListener("change", sync, { signal });
  document.addEventListener("trampolin:effects-change", sync, { signal });
  document.addEventListener("visibilitychange", sync, { signal });
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); });
  observer.observe(card);
  document.addEventListener("astro:before-swap", () => {
    playRequest++; controller.abort(); observer.disconnect(); audio.pause(); audio.removeAttribute("src"); audio.load(); stopViz();
    if (audioCtx) void audioCtx.close().catch(() => {});
  }, { once: true, signal });
  progress(); sync();
}
initAlbum();
document.addEventListener("astro:page-load", initAlbum);
