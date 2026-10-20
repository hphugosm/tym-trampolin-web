const DURATION_MS = 30_000;
type ChallengePhase = "idle" | "running" | "ready" | "attempted" | "hint1" | "hint2" | "complete";

// The display is derived from a deadline, never from the number of timer ticks.
// A throttled background tab therefore cannot add seconds to the challenge.
export const thinkingTimeLeft = (deadline: number, now = Date.now()) =>
  Math.max(0, Math.min(DURATION_MS, deadline - now));

function initShakeArticle() {
  const article = document.querySelector<HTMLElement>("[data-shake-article]");
  if (!article || article.dataset.ready) return;
  article.dataset.ready = "true";
  const controller = new AbortController();
  const { signal } = controller;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let countdown: number | undefined;
  let progressFrame: number | undefined;
  let copyLabelTimeout: number | undefined;
  let chartObserver: IntersectionObserver | undefined;

  const get = <T extends HTMLElement = HTMLElement>(selector: string) => {
    const node = article.querySelector<T>(selector);
    if (!node) throw new Error(`Missing SHAKE article control: ${selector}`);
    return node;
  };

  const challenge = get("[data-study-challenge]");
  const form = get<HTMLFormElement>("[data-challenge-form]");
  const fieldset = get<HTMLFieldSetElement>("[data-answer-fieldset]");
  const reasoning = get<HTMLTextAreaElement>("[data-reasoning]");
  const status = get("#challenge-status");
  const start = get<HTMLButtonElement>("[data-start]");
  const submit = get<HTMLButtonElement>("[data-submit]");
  const nextHint = get<HTMLButtonElement>("[data-next-hint]");
  const reset = get<HTMLButtonElement>("[data-reset]");
  const timer = get("[data-timer]");
  const timerValue = get("[data-timer-value]");
  const ring = article.querySelector<SVGCircleElement>("[data-timer-ring]")!;
  const firstHint = get('[data-hint="1"]');
  const secondHint = get('[data-hint="2"]');
  const solution = get("[data-solution]");
  const completion = get("[data-completion]");
  const continueLink = get<HTMLAnchorElement>("[data-continue]");
  let phase: ChallengePhase = "idle";
  let deadline = 0;
  let lastSecond = -1;
  const restoreButton = (button: HTMLButtonElement, label: string, arrow: string) => {
    button.textContent = label;
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = arrow;
    button.append(" ", icon);
  };

  const stopCountdown = () => {
    window.clearInterval(countdown);
    countdown = undefined;
  };
  const displayTime = (remaining: number) => {
    const seconds = Math.ceil(remaining / 1000);
    if (seconds !== lastSecond) {
      timerValue.textContent = `00:${String(seconds).padStart(2, "0")}`;
      timer.setAttribute("aria-label", `Thinking time: ${seconds} seconds remaining`);
      lastSecond = seconds;
    }
    ring.style.strokeDashoffset = String(100 * (1 - remaining / DURATION_MS));
  };
  const setPhase = (next: ChallengePhase) => {
    phase = next;
    challenge.dataset.state = next;
  };
  const updateCountdown = () => {
    if (phase !== "running") return;
    const remaining = thinkingTimeLeft(deadline);
    displayTime(remaining);
    if (remaining > 0) return;
    stopCountdown();
    setPhase("ready");
    start.hidden = true;
    submit.hidden = false;
    status.textContent = "Time's up. What did you come up with? Submit your attempt, or select ‘I'm not sure’, to unlock a hint.";
  };

  start.addEventListener("click", () => {
    if (phase !== "idle") return;
    setPhase("running");
    deadline = Date.now() + DURATION_MS;
    start.disabled = true;
    start.textContent = "Thinking time…";
    reset.hidden = false;
    status.textContent = "Your 30 seconds have started. Think through the question and record your attempt. Hints will be available after the timer finishes and you submit.";
    updateCountdown();
    countdown = window.setInterval(updateCountdown, 100);
    form.querySelector<HTMLInputElement>('input[name="jacket-answer"]')?.focus({ preventScroll: true });
  }, { signal });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (phase !== "ready") return;
    const answer = form.querySelector<HTMLInputElement>('input[name="jacket-answer"]:checked');
    if (!answer && !reasoning.value.trim()) {
      status.textContent = "Choose an answer, explain what you tried, or select ‘I'm not sure’ before requesting a hint.";
      form.querySelector<HTMLInputElement>('input[name="jacket-answer"]')?.focus();
      return;
    }
    setPhase("attempted");
    fieldset.disabled = true;
    submit.hidden = true;
    nextHint.hidden = false;
    status.textContent = "Attempt recorded on this page. Take a small hint when you're ready.";
    nextHint.focus({ preventScroll: true });
  }, { signal });

  nextHint.addEventListener("click", () => {
    if (phase === "attempted") {
      setPhase("hint1");
      firstHint.hidden = false;
      nextHint.textContent = "Show Hint 2";
      status.textContent = "Hint 1 is now available. Try applying it before requesting another.";
    } else if (phase === "hint1") {
      setPhase("hint2");
      secondHint.hidden = false;
      nextHint.textContent = "Reveal Full Explanation";
      status.textContent = "Hint 2 is now available. Work through both steps, then reveal the explanation if you need it.";
    } else if (phase === "hint2") {
      setPhase("complete");
      nextHint.hidden = true;
      solution.hidden = false;
      completion.hidden = false;
      continueLink.hidden = false;
      reset.textContent = "Try Again";
      status.textContent = "The full explanation is now available. The final price is €96.";
      // The activating button is now hidden. Move focus to the explanation
      // so keyboard readers keep a useful position in the flow.
      solution.tabIndex = -1;
      solution.focus({ preventScroll: true });
    }
  }, { signal });

  reset.addEventListener("click", () => {
    stopCountdown();
    setPhase("idle");
    deadline = 0;
    form.reset();
    fieldset.disabled = false;
    start.disabled = false;
    start.hidden = false;
    restoreButton(start, "Start My 30 Seconds", "→");
    submit.hidden = true;
    nextHint.hidden = true;
    nextHint.textContent = "Show Hint 1";
    firstHint.hidden = secondHint.hidden = solution.hidden = completion.hidden = true;
    reset.hidden = continueLink.hidden = true;
    reset.textContent = "Start over";
    solution.removeAttribute("tabindex");
    status.textContent = "Start the timer and try the question before looking at a hint.";
    displayTime(DURATION_MS);
    start.focus({ preventScroll: true });
  }, { signal });

  // Recompute from the same deadline immediately when a hidden page returns.
  document.addEventListener("visibilitychange", updateCountdown, { signal });
  window.addEventListener("pageshow", updateCountdown, { signal });
  displayTime(DURATION_MS);
  challenge.dataset.state = phase;
  get("[data-challenge-controls]").hidden = false;

  const tabs = [...article.querySelectorAll<HTMLButtonElement>("[data-tutor-tab]")];
  const panels = [...article.querySelectorAll<HTMLElement>("[data-tutor-panel]")];
  const selectTutor = (selected: HTMLButtonElement) => {
    tabs.forEach((tab) => {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.tutorPanel !== selected.dataset.tutorTab; });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTutor(tab), { signal });
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1
        : (index + (event.key === "ArrowLeft" ? -1 : 1) + tabs.length) % tabs.length;
      selectTutor(tabs[nextIndex]);
      tabs[nextIndex].focus();
    }, { signal });
  });

  const prompt = get<HTMLTextAreaElement>("#study-prompt");
  const copyButton = get<HTMLButtonElement>("[data-copy-prompt]");
  const copyStatus = get("[data-copy-status]");
  copyButton.addEventListener("click", async () => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(prompt.value);
        copied = true;
      }
    } catch { /* Offer a selectable local fallback below. */ }
    if (signal.aborted) return;
    if (!copied) {
      get<HTMLDetailsElement>("[data-prompt-details]").open = true;
      prompt.focus();
      prompt.select();
      prompt.setSelectionRange(0, prompt.value.length);
      try { copied = document.execCommand("copy"); } catch { copied = false; }
    }
    copyStatus.textContent = copied ? "Copied to clipboard. Paste it into a new ChatGPT conversation."
      : "The complete prompt is selected. Press Ctrl+C or Command+C, or use your device's Copy command, then paste it into ChatGPT.";
    if (copied) {
      window.clearTimeout(copyLabelTimeout);
      copyButton.textContent = "Copied to clipboard";
      copyLabelTimeout = window.setTimeout(() => {
        restoreButton(copyButton, "Copy Study Mode Prompt", "↗");
      }, 3000);
    }
  }, { signal });
  copyButton.hidden = false;

  const chart = get("[data-research-chart]");
  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    document.body.classList.add("shake-enhanced");
    chartObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      chart.classList.add("is-visible");
      chartObserver?.disconnect();
    }, { threshold: 0.2 });
    chartObserver.observe(chart);
  }
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      chart.classList.add("is-visible");
      chartObserver?.disconnect();
    }
  }, { signal });

  const progress = document.querySelector<HTMLElement>("[data-reading-progress]")!;
  const drawReadingProgress = () => {
    progressFrame = undefined;
    const end = article.offsetTop + article.offsetHeight - window.innerHeight;
    const range = Math.max(1, end - article.offsetTop);
    const amount = Math.max(0, Math.min(1, (window.scrollY - article.offsetTop) / range));
    progress.style.transform = `scaleX(${amount})`;
  };
  const queueReadingProgress = () => {
    if (progressFrame === undefined) progressFrame = requestAnimationFrame(drawReadingProgress);
  };
  window.addEventListener("scroll", queueReadingProgress, { signal, passive: true });
  window.addEventListener("resize", queueReadingProgress, { signal, passive: true });
  drawReadingProgress();
  window.addEventListener("pagehide", (event) => {
    // A page restored from the back-forward cache retains its state and checks
    // the wall-clock deadline on pageshow. A real navigation releases listeners.
    if (event.persisted) return;
    stopCountdown();
    chartObserver?.disconnect();
    if (progressFrame !== undefined) cancelAnimationFrame(progressFrame);
    window.clearTimeout(copyLabelTimeout);
    controller.abort();
  }, { signal });
}

if (typeof document !== "undefined") initShakeArticle();
