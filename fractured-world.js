(() => {
  const button = document.querySelector("#btn-anniversary-entry");
  const message = document.querySelector("#welcome-menu-message-nov");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let activated = false;
  let destroyed = false;

  function activate() {
    if (activated || !document.body.classList.contains("world-fractured")) return;
    activated = true;
    document.querySelectorAll(".welcome-menu__option, .letter-card, .frame, .text-panel, .desk-prompt, .desk-clue-dialog, .desk-diary, .wall-note-dialog").forEach((surface) => {
      if (getComputedStyle(surface).position === "static") surface.classList.add("fracture-relative");
      const cracks = document.createElement("span");
      cracks.className = "fracture-overlay";
      cracks.setAttribute("aria-hidden", "true");
      surface.append(cracks);
    });
  }

  function animateFragment(element, keyframes, options) {
    return element.animate(keyframes, { fill: "forwards", ...options }).finished.catch(() => {});
  }

  async function disintegrate() {
    const bounds = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    const debris = document.createElement("div");
    debris.className = "anniversary-debris";
    debris.setAttribute("aria-hidden", "true");
    const animations = [];
    const columns = innerWidth < 600 ? 8 : 12;
    const rows = 2;
    // Shared vertices keep the triangles joined until the button starts breaking apart.
    const vertices = Array.from({ length: rows + 1 }, (_, y) =>
      Array.from({ length: columns + 1 }, (_, x) => [
        (x + (x > 0 && x < columns ? (Math.random() - 0.5) * 0.5 : 0)) / columns * 100,
        (y + (y > 0 && y < rows ? (Math.random() - 0.5) * 0.5 : 0)) / rows * 100,
      ]));
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const a = vertices[y][x], b = vertices[y][x + 1];
        const c = vertices[y + 1][x], d = vertices[y + 1][x + 1];
        for (const points of [[a, b, c], [b, d, c]]) {
          const shard = document.createElement("div");
          shard.className = `${button.className} anniversary-fragment`;
          shard.innerHTML = button.innerHTML;
          Object.assign(shard.style, {
            left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px`,
            padding: style.padding, font: style.font, textAlign: style.textAlign, letterSpacing: style.letterSpacing,
            color: style.color, background: style.background,
            border: style.border, borderRadius: style.borderRadius, opacity: style.opacity,
            clipPath: `polygon(${points.map(([px, py]) => `${px}% ${py}%`).join(",")})`,
          });
          const center = points.reduce((sum, [px]) => sum + px, 0) / 3;
          shard.style.transformOrigin = `${center}% 50%`;
          debris.append(shard);
          const dx = (center - 50) * (0.5 + Math.random());
          const fall = 100 + Math.random() * 180;
          animations.push(() => animateFragment(shard, [
            { transform: "translate(0, 0) rotate(0deg)", opacity: style.opacity },
            { transform: `translate(${dx * 0.15}px, 7px) rotate(${dx * 0.1}deg)`, opacity: style.opacity, offset: 0.2 },
            { transform: `translate(${dx}px, ${fall}px) rotate(${dx}deg)`, opacity: 0 },
          ], { duration: 1600 + Math.random() * 900, delay: Math.abs(center - 50) * 9, easing: "cubic-bezier(.35,0,.75,.5)" }));
        }
      }
    }
    for (let i = 0; i < 20; i += 1) {
      const dust = document.createElement("span");
      dust.className = "anniversary-dust";
      dust.style.left = `${bounds.left + Math.random() * bounds.width}px`;
      dust.style.top = `${bounds.top + Math.random() * bounds.height}px`;
      debris.append(dust);
      animations.push(() => animateFragment(dust, [
        { opacity: 0, transform: "translate(0, 0)" },
        { opacity: 0.6, offset: 0.2 },
        { opacity: 0, transform: `translate(${(Math.random() - 0.5) * 90}px, ${50 + Math.random() * 160}px)` },
      ], { duration: 1800, delay: 300 + Math.random() * 500 }));
    }
    document.body.append(debris);
    button.classList.add("is-disintegrated");
    await Promise.all(animations.map((run) => run()));
    debris.remove();
  }

  button?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (destroyed) return;
    destroyed = true;
    button.disabled = true;
    button.closest(".anniversary-threshold")?.classList.add("is-spent");
    message.textContent = "Todavía no… Algunas sorpresas necesitan un poquito más de tiempo.";
    message.classList.add("is-visible", "welcome-menu__message--final");
    message.tabIndex = -1;
    message.focus({ preventScroll: true });
    if (reducedMotion.matches) {
      animateFragment(button, [{ opacity: 0.72 }, { opacity: 0 }], { duration: 250 }).then(() => button.classList.add("is-disintegrated"));
    } else {
      disintegrate();
    }
  }, { capture: true });

  new MutationObserver(activate).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  activate();
})();
