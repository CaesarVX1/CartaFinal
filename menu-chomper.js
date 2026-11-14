(() => {
  const menu = document.querySelector("#welcome-menu");
  const chomper = document.querySelector("#menu-chomper");
  if (!menu || !chomper) return;
  const eyes = {
    left: chomper.querySelector(".menu-chomper__eye--left"),
    right: chomper.querySelector(".menu-chomper__eye--right"),
  };
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();
  let timer = null;

  function eyePattern(random = Math.random) {
    const mode = Math.floor(random() * 5);
    const duration = 650 + random() * 400;
    const gap = duration + 80 + random() * 160;
    if (mode === 0 || mode === 1) return [{ eye: mode ? "right" : "left", delay: 0, duration }];
    return [
      { eye: mode === 4 ? "right" : "left", delay: 0, duration },
      { eye: mode === 4 ? "left" : "right", delay: mode === 2 ? 0 : gap, duration },
    ];
  }

  function canPlay() {
    return !document.hidden && !reducedMotion.matches && !menu.classList.contains("is-hidden") && !document.querySelector("dialog[open]");
  }

  function stop() {
    clearTimeout(timer);
    timer = null;
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  }

  function blink() {
    timer = null;
    if (!canPlay()) return;
    const pattern = eyePattern();
    const brightness = 0.9 + Math.random() * 0.1;
    pattern.forEach(({ eye, delay, duration }) => {
      const animation = eyes[eye].animate([
        { opacity: 0.04 }, { opacity: brightness, offset: 0.16 },
        { opacity: brightness * 0.85, offset: 0.65 }, { opacity: 0.04 },
      ], { duration, delay, easing: "ease-in-out" });
      animations.add(animation);
      animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    });
    const end = Math.max(...pattern.map(({ delay, duration }) => delay + duration));
    timer = setTimeout(blink, end + 450 + Math.random() * 750);
  }

  function sync() {
    if (!canPlay()) stop();
    else if (timer === null && !animations.size) timer = setTimeout(blink, 150 + Math.random() * 350);
  }

  new MutationObserver((changes) => {
    if (changes.some(({ target }) => target === menu || target.tagName === "DIALOG")) sync();
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class", "open"] });
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  sync();
})();
