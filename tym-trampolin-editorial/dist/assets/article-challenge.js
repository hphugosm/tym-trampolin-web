const DURATION_MS = 30_000;
export const thinkingTimeLeft = (deadline, now = Date.now())=>Math.max(0, Math.min(DURATION_MS, deadline - now));
function initShakeArticle() {
    const article = document.querySelector("[data-shake-article]");
    if (!article || article.dataset.ready) return;
    article.dataset.ready = "true";
    const isCs = article.lang === "cs";
    const copyCs = {
        "Time's up. What did you come up with? Submit your attempt, or select ‘I'm not sure’, to unlock a hint.": "Čas vypršel. Na co jste přišli? Odešlete svůj pokus, nebo zvolte „Nevím jistě“, a odemkněte nápovědu.",
        "Thinking time…": "Čas na přemýšlení…",
        "Your 30 seconds have started. Think through the question and record your attempt. Hints will be available after the timer finishes and you submit.": "Vašich 30 sekund začalo. Promyslete si úlohu a zapište svůj pokus. Nápovědy se zpřístupní po skončení časovače a odeslání pokusu.",
        "Choose an answer, explain what you tried, or select ‘I'm not sure’ before requesting a hint.": "Než požádáte o nápovědu, vyberte odpověď, popište svůj pokus, nebo zvolte „Nevím jistě“.",
        "Attempt recorded on this page. Take a small hint when you're ready.": "Pokus je zachycen na této stránce. Až budete chtít, využijte drobnou nápovědu.",
        "Show Hint 2": "Zobrazit nápovědu 2",
        "Hint 1 is now available. Try applying it before requesting another.": "Nápověda 1 je k dispozici. Zkuste ji využít, než požádáte o další.",
        "Reveal Full Explanation": "Odhalit úplné vysvětlení",
        "Hint 2 is now available. Work through both steps, then reveal the explanation if you need it.": "Nápověda 2 je k dispozici. Projděte oba kroky a pak si v případě potřeby zobrazte vysvětlení.",
        "Try Again": "Zkusit znovu",
        "The full explanation is now available. The final price is €96.": "Úplné vysvětlení je k dispozici. Výsledná cena je 96 €.",
        "Start My 30 Seconds": "Spustit mých 30 sekund",
        "Show Hint 1": "Zobrazit nápovědu 1",
        "Start over": "Začít znovu",
        "Start the timer and try the question before looking at a hint.": "Spusťte časovač a zkuste úlohu vyřešit, než se podíváte na nápovědu.",
        "Copied to clipboard. Paste it into a new ChatGPT conversation.": "Zkopírováno do schránky. Vložte prompt do nového rozhovoru v ChatGPT.",
        "The complete prompt is selected. Press Ctrl+C or Command+C, or use your device's Copy command, then paste it into ChatGPT.": "Celý prompt je vybraný. Stiskněte Ctrl+C nebo Command+C, případně použijte příkaz Kopírovat na svém zařízení, a potom prompt vložte do ChatGPT.",
        "Copied to clipboard": "Zkopírováno do schránky",
        "Copy Study Mode Prompt": "Zkopírovat studijní prompt"
};
    const t = text => isCs ? (copyCs[text] ?? text) : text;
    const controller = new AbortController();
    const { signal } = controller;
    let countdown;
    let copyLabelTimeout;
    const get = (selector)=>{
        const node = article.querySelector(selector);
        if (!node) throw new Error(`Missing SHAKE article control: ${selector}`);
        return node;
    };
    const challenge = get("[data-study-challenge]");
    const form = get("[data-challenge-form]");
    const fieldset = get("[data-answer-fieldset]");
    const reasoning = get("[data-reasoning]");
    const status = get("#challenge-status");
    const start = get("[data-start]");
    const submit = get("[data-submit]");
    const nextHint = get("[data-next-hint]");
    const reset = get("[data-reset]");
    const timer = get("[data-timer]");
    const timerValue = get("[data-timer-value]");
    const ring = article.querySelector("[data-timer-ring]");
    const firstHint = get('[data-hint="1"]');
    const secondHint = get('[data-hint="2"]');
    const solution = get("[data-solution]");
    const completion = get("[data-completion]");
    const continueLink = get("[data-continue]");
    let phase = "idle";
    let deadline = 0;
    let lastSecond = -1;
    const restoreButton = (button, label, arrow)=>{
        button.textContent = label;
        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = arrow;
        button.append(" ", icon);
    };
    const stopCountdown = ()=>{
        window.clearInterval(countdown);
        countdown = undefined;
    };
    const displayTime = (remaining)=>{
        const seconds = Math.ceil(remaining / 1000);
        if (seconds !== lastSecond) {
            timerValue.textContent = `00:${String(seconds).padStart(2, "0")}`;
            timer.setAttribute("aria-label", isCs ? `Čas na přemýšlení: zbývá ${seconds} s` : `Thinking time: ${seconds} seconds remaining`);
            lastSecond = seconds;
        }
        ring.style.strokeDashoffset = String(100 * (1 - remaining / DURATION_MS));
    };
    const setPhase = (next)=>{
        phase = next;
        challenge.dataset.state = next;
    };
    const updateCountdown = ()=>{
        if (phase !== "running") return;
        const remaining = thinkingTimeLeft(deadline);
        displayTime(remaining);
        if (remaining > 0) return;
        stopCountdown();
        setPhase("ready");
        start.hidden = true;
        submit.hidden = false;
        status.textContent = t("Time's up. What did you come up with? Submit your attempt, or select ‘I'm not sure’, to unlock a hint.");
    };
    start.addEventListener("click", ()=>{
        if (phase !== "idle") return;
        setPhase("running");
        deadline = Date.now() + DURATION_MS;
        start.disabled = true;
        start.textContent = t("Thinking time…");
        reset.hidden = false;
        status.textContent = t("Your 30 seconds have started. Think through the question and record your attempt. Hints will be available after the timer finishes and you submit.");
        updateCountdown();
        countdown = window.setInterval(updateCountdown, 100);
        form.querySelector('input[name="jacket-answer"]')?.focus({
            preventScroll: true
        });
    }, {
        signal
    });
    form.addEventListener("submit", (event)=>{
        event.preventDefault();
        if (phase !== "ready") return;
        const answer = form.querySelector('input[name="jacket-answer"]:checked');
        if (!answer && !reasoning.value.trim()) {
            status.textContent = t("Choose an answer, explain what you tried, or select ‘I'm not sure’ before requesting a hint.");
            form.querySelector('input[name="jacket-answer"]')?.focus();
            return;
        }
        setPhase("attempted");
        fieldset.disabled = true;
        submit.hidden = true;
        nextHint.hidden = false;
        status.textContent = t("Attempt recorded on this page. Take a small hint when you're ready.");
        nextHint.focus({
            preventScroll: true
        });
    }, {
        signal
    });
    nextHint.addEventListener("click", ()=>{
        if (phase === "attempted") {
            setPhase("hint1");
            firstHint.hidden = false;
            nextHint.textContent = t("Show Hint 2");
            status.textContent = t("Hint 1 is now available. Try applying it before requesting another.");
        } else if (phase === "hint1") {
            setPhase("hint2");
            secondHint.hidden = false;
            nextHint.textContent = t("Reveal Full Explanation");
            status.textContent = t("Hint 2 is now available. Work through both steps, then reveal the explanation if you need it.");
        } else if (phase === "hint2") {
            setPhase("complete");
            nextHint.hidden = true;
            solution.hidden = false;
            completion.hidden = false;
            continueLink.hidden = false;
            reset.textContent = t("Try Again");
            status.textContent = t("The full explanation is now available. The final price is €96.");
            solution.tabIndex = -1;
            solution.focus({
                preventScroll: true
            });
        }
    }, {
        signal
    });
    reset.addEventListener("click", ()=>{
        stopCountdown();
        setPhase("idle");
        deadline = 0;
        form.reset();
        fieldset.disabled = false;
        start.disabled = false;
        start.hidden = false;
        restoreButton(start, t("Start My 30 Seconds"), "→");
        submit.hidden = true;
        nextHint.hidden = true;
        nextHint.textContent = t("Show Hint 1");
        firstHint.hidden = secondHint.hidden = solution.hidden = completion.hidden = true;
        reset.hidden = continueLink.hidden = true;
        reset.textContent = t("Start over");
        solution.removeAttribute("tabindex");
        status.textContent = t("Start the timer and try the question before looking at a hint.");
        displayTime(DURATION_MS);
        start.focus({
            preventScroll: true
        });
    }, {
        signal
    });
    document.addEventListener("visibilitychange", updateCountdown, {
        signal
    });
    window.addEventListener("pageshow", updateCountdown, {
        signal
    });
    displayTime(DURATION_MS);
    challenge.dataset.state = phase;
    get("[data-challenge-controls]").hidden = false;
    const tabs = [
        ...article.querySelectorAll("[data-tutor-tab]")
    ];
    const panels = [
        ...article.querySelectorAll("[data-tutor-panel]")
    ];
    const selectTutor = (selected)=>{
        tabs.forEach((tab)=>{
            const active = tab === selected;
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        panels.forEach((panel)=>{
            panel.hidden = panel.dataset.tutorPanel !== selected.dataset.tutorTab;
        });
    };
    tabs.forEach((tab, index)=>{
        tab.addEventListener("click", ()=>selectTutor(tab), {
            signal
        });
        tab.addEventListener("keydown", (event)=>{
            if (![
                "ArrowLeft",
                "ArrowRight",
                "Home",
                "End"
            ].includes(event.key)) return;
            event.preventDefault();
            const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowLeft" ? -1 : 1) + tabs.length) % tabs.length;
            selectTutor(tabs[nextIndex]);
            tabs[nextIndex].focus();
        }, {
            signal
        });
    });
    const prompt = get("#study-prompt");
    const copyButton = get("[data-copy-prompt]");
    const copyStatus = get("[data-copy-status]");
    copyButton.addEventListener("click", async ()=>{
        let copied = false;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(prompt.value);
                copied = true;
            }
        } catch  {}
        if (signal.aborted) return;
        if (!copied) {
            get("[data-prompt-details]").open = true;
            prompt.focus();
            prompt.select();
            prompt.setSelectionRange(0, prompt.value.length);
            try {
                copied = document.execCommand("copy");
            } catch  {
                copied = false;
            }
        }
        copyStatus.textContent = copied ? t("Copied to clipboard. Paste it into a new ChatGPT conversation.") : t("The complete prompt is selected. Press Ctrl+C or Command+C, or use your device's Copy command, then paste it into ChatGPT.");
        if (copied) {
            window.clearTimeout(copyLabelTimeout);
            copyButton.textContent = t("Copied to clipboard");
            copyLabelTimeout = window.setTimeout(()=>{
                restoreButton(copyButton, t("Copy Study Mode Prompt"), "↗");
            }, 3000);
        }
    }, {
        signal
    });
    copyButton.hidden = false;
    window.addEventListener("pagehide", (event)=>{
        if (event.persisted) return;
        stopCountdown();
        window.clearTimeout(copyLabelTimeout);
        controller.abort();
    }, {
        signal
    });
}
if (typeof document !== "undefined") initShakeArticle();
