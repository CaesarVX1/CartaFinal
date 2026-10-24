(() => {
  const hole = document.querySelector("#btn-wall-hole");
  const menu = document.querySelector("#welcome-menu");
  const dialog = document.querySelector("#desk-dialog");
  const prompt = document.querySelector("#desk-prompt");
  const view = document.querySelector("#desk-view");
  const scene = document.querySelector("#desk-scene");
  const images = [document.querySelector("#desk-image-below"), document.querySelector("#desk-image-above")];
  const layers = [document.querySelector("#desk-layer-below"), document.querySelector("#desk-layer-above")];
  const wallHole = document.querySelector(".welcome-menu__wall-hole");
  const clueDialog = document.querySelector("#desk-clue-dialog");
  const clueButtons = [...document.querySelectorAll("[data-desk-clue]")];
  const portrait = document.querySelector('[data-desk-clue="portrait"]');
  const moon = document.querySelector('[data-desk-clue="moon"]');
  const clueText = document.querySelector(".desk-clue-dialog__text");
  const previousPage = document.querySelector("#btn-desk-clue-prev");
  const nextPage = document.querySelector("#btn-desk-clue-next");
  const discoveries = new Set();
  const clues = {
    throne: {
      title: "Un nuevo Heda",
      text: "Parece la comandante eligiendo al nuevo Heda... Aunque, espera. No consigo distinguir quién es la silueta que está en el trono. Parece un... ¿chico? Es difícil verlo, pero ha capturado muy bien la atención de los pequeños.",
    },
    moon: {
      title: "Un poco más cerca de la Luna",
      text: "Este dibujo parece el más reciente y el más fácil de distinguir. Representa una escena entre dos personas... Pero... ¿qué es lo que hay detrás? Hay poca luz, aunque parece... ¿la Luna? ¿Será que, en ese instante, estuvieron un poco más cerca de ella?",
    },
    lotus: {
      pages: [
        {
          title: "La flor de loto",
          text: "Parece una flor de loto. Suele representar la pureza y la resiliencia: nacer del barro y mantenerse limpia. Aunque... parece que hay algo escrito detrás.",
        },
        {
          title: "Al dorso",
          text: "10 toques en el inicio, con una fecha importante, permite abrir recuerdos incluso a aquellos con peor memoria.\n\n¿Qué es esto...? Me pregunto qué significará...",
        },
      ],
    },
    marks: {
      title: "Las marcas",
      text: "11 filas por 10 columnas... Esto me suena de algo. Pensé que solo llegaron a caer 101. ¿Será que conté mal...?",
    },
    map: {
      title: "Un mapa antiguo",
      text: "Este mapa... lo conozco, pero es difícil leerlo. Parece bastante antiguo, aunque creo que tiene que ver con un grupo llamado «Grounders», por lo que dicen las hojas de atrás.",
    },
    portrait: {
      title: "Un boceto distinto",
      text: "Este boceto es distinto... Se distingue a un chico risueño, riendo y pasándoselo bien en un parque, sin pensar en qué pasaría mañana, con una expresión que da a entender que está disfrutando como si el tiempo estuviese parado.",
    },
  };
  const enter = document.querySelector("#btn-enter-desk");
  const switchView = document.querySelector("#btn-switch-desk");
  const status = document.querySelector("#desk-load-status");
  const viewStatus = document.querySelector("#desk-view-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();
  let state = "closed";
  let session = 0;
  let current = 0;
  let frame = 0;
  let drag = null;
  let noteRead = false;
  let suppressClick = false;
  let activeClue = null;
  let activeKey = null;
  let cluePage = 0;
  let pages = [];
  let seenPages = new Set();
  let sceneSize = { width: 0, height: 0 };
  let sizes = [];
  let pan = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };

  function animate(element, keyframes, duration, delay = 0) {
    const animation = element.animate(keyframes, {
      duration: reducedMotion.matches ? 1 : duration,
      delay: reducedMotion.matches ? 0 : delay,
      easing: "cubic-bezier(.22,.65,.25,1)",
      fill: "both",
    });
    animations.add(animation);
    return animation.finished.catch(() => {}).then(() => {
      animations.delete(animation);
      animation.cancel();
    });
  }

  async function loadImage(image) {
    if (!image.getAttribute("src")) image.src = image.dataset.src;
    await image.decode();
  }

  function layout() {
    const width = scene.clientWidth;
    const height = scene.clientHeight;
    sceneSize = { width, height };
    sizes = images.map((image, index) => {
      if (!image.naturalWidth) return;
      // Overscan gives the camera room to move without exposing an empty edge.
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * 1.1;
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      layers[index].style.width = `${w}px`;
      layers[index].style.height = `${h}px`;
      return { x: (w - width) / 2, y: (h - height) / 2 };
    });
    draw();
  }

  function draw() {
    // Only change compositor transforms while panning; measure and size on resize/load.
    sizes.forEach((size, index) => {
      if (!size || layers[index].hidden) return;
      layers[index].style.transform = `translate3d(calc(-50% + ${pan.x * size.x}px), calc(-50% + ${pan.y * size.y}px), 0)`;
    });
  }

  function tick() {
    pan.x += (target.x - pan.x) * 0.09;
    pan.y += (target.y - pan.y) * 0.09;
    draw();
    if (Math.abs(target.x - pan.x) + Math.abs(target.y - pan.y) > 0.001) {
      frame = requestAnimationFrame(tick);
    } else {
      frame = 0;
    }
  }

  function move(x, y) {
    if (state !== "viewing") return;
    target = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    if (reducedMotion.matches) {
      pan = { ...target };
      draw();
      return;
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function resetPan() {
    cancelAnimationFrame(frame);
    frame = 0;
    pan = { x: 0, y: 0 };
    target = { x: 0, y: 0 };
    layout();
  }

  function renderCluePage() {
    const page = pages[cluePage];
    seenPages.add(cluePage);
    document.querySelector("#desk-clue-title").textContent = page.title;
    document.querySelector("#desk-clue-text").textContent = page.text;
    document.querySelector("#desk-clue-pages").hidden = pages.length < 2;
    document.querySelector("#desk-clue-page-count").textContent = `${cluePage + 1} / ${pages.length}`;
    previousPage.disabled = cluePage === 0;
    nextPage.disabled = cluePage === pages.length - 1;
    clueText.scrollTop = 0;
    clueText.getAnimations().forEach((animation) => animation.cancel());
    animate(clueText, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], 550, 100);
  }

  function showClue(content, opener, key = null) {
    activeClue = opener;
    activeKey = key;
    cluePage = 0;
    pages = content.pages || [content];
    seenPages = new Set();
    target = { ...pan };
    state = "reading";
    clueDialog.showModal();
    renderCluePage();
  }

  function unlockClues() {
    if (moon.hidden && discoveries.has("lotus") && discoveries.has("throne")) {
      moon.hidden = false;
      moon.classList.add("is-discovered");
      viewStatus.textContent = "El dibujo del medio parece guardar otra historia…";
    }
    if (portrait.hidden && discoveries.has("marks") && discoveries.has("map")) {
      portrait.hidden = false;
      portrait.classList.add("is-discovered");
      viewStatus.textContent = "Entre estos papeles, hay un boceto que ahora llama tu atención…";
    }
  }

  previousPage.addEventListener("click", () => {
    if (cluePage <= 0) return;
    cluePage -= 1;
    renderCluePage();
    clueText.focus({ preventScroll: true });
  });
  nextPage.addEventListener("click", () => {
    if (cluePage >= pages.length - 1) return;
    cluePage += 1;
    renderCluePage();
    clueText.focus({ preventScroll: true });
  });

  function cleanUp() {
    session += 1;
    state = "closed";
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    resetPan();
    drag = null;
    menu.classList.remove("is-desk-transition");
    if (clueDialog.open) clueDialog.close();
    dialog.classList.remove("is-exploring");
    view.hidden = true;
    prompt.hidden = false;
    enter.disabled = false;
    switchView.disabled = false;
    hole.focus({ preventScroll: true });
  }

  function openPrompt() {
    if (state !== "closed" || menu.classList.contains("is-hidden")) return;
    state = "prompt";
    status.textContent = "";
    viewStatus.textContent = "";
    document.querySelector("#desk-prompt-title").textContent = noteRead
      ? "Se puede ver un escritorio... ¿quieres echar un vistazo?"
      : "No debería mirar por el agujero todavía... Hay una nota en la pared. Quizá debería leerla primero.";
    enter.hidden = !noteRead;
    document.querySelector("#btn-decline-desk").textContent = noteRead ? "No" : "Volver a la pared";
    dialog.showModal();
  }

  document.querySelector("#wall-note-dialog").addEventListener("close", () => {
    noteRead = true;
    loadImage(images[0]).catch(() => {});
  });

  async function exit() {
    if (state === "closing" || state === "closed") return;
    const wasViewing = state === "viewing";
    const token = ++session;
    state = "closing";
    animations.forEach((animation) => animation.cancel());
    if (wasViewing) {
      await animate(view, [{ opacity: 1 }, { opacity: 0 }], 280);
    }
    if (token === session) dialog.close();
  }

  hole.addEventListener("click", openPrompt);
  hole.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPrompt();
    }
  });
  document.querySelector("#btn-decline-desk").addEventListener("click", exit);
  document.querySelector("#btn-exit-desk").addEventListener("click", exit);
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); exit(); });
  dialog.addEventListener("close", cleanUp);

  enter.addEventListener("click", async () => {
    if (state !== "prompt" || !noteRead) return;
    state = "loading";
    const token = ++session;
    enter.disabled = true;
    status.textContent = "Acercándonos al escritorio…";
    try {
      await loadImage(images[0]);
    } catch {
      if (token !== session) return;
      status.textContent = "No se ha podido cargar la imagen. Puedes volver a intentarlo.";
      enter.disabled = false;
      state = "prompt";
      return;
    }
    if (token !== session) return;
    state = "entering";
    current = 0;
    layers[0].hidden = false;
    layers[1].hidden = true;
    switchView.textContent = "Vista desde arriba";
    document.querySelector("#desk-view-title").textContent = "Vista desde abajo";
    menu.classList.add("is-desk-transition");
    prompt.hidden = true;
    view.hidden = false;
    dialog.classList.add("is-exploring");
    resetPan();
    await Promise.all([
      animate(wallHole, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(2.4)", opacity: 0 }], 460),
      animate(view, [
        { transform: "scale(1.06)", opacity: 0 },
        { transform: "scale(1)", opacity: 1 },
      ], 560, 60),
    ]);
    if (token !== session) return;
    state = "viewing";
    viewStatus.textContent = "Los dibujos de la pared parecen guardar algo. Puedes tocarlos para mirar más de cerca.";
    switchView.focus({ preventScroll: true });
    loadImage(images[1]).catch(() => {});
  });

  switchView.addEventListener("click", async () => {
    if (state !== "viewing") return;
    if (current === 0 && !discoveries.has("moon")) {
      showClue({
        title: "Todavía queda algo aquí…",
        text: moon.hidden
          ? "Antes de mirar el escritorio desde arriba, debería detenerme en los dibujos de la pared. La flor de loto y el trono parecen guardar las primeras pistas."
          : "Hay algo en el dibujo del medio que todavía no he leído... Antes de cambiar de perspectiva, debería acercarme a esos dos chicos.",
      }, switchView);
      return;
    }
    state = "switching";
    switchView.disabled = true;
    const token = session;
    const next = 1 - current;
    viewStatus.textContent = "";
    try {
      await loadImage(images[next]);
      if (token !== session) return;
      await animate(scene, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.025)" }], 220);
      if (token !== session) return;
      layers[current].hidden = true;
      layers[next].hidden = false;
      current = next;
      resetPan();
      document.querySelector("#desk-view-title").textContent = current ? "Vista desde arriba" : "Vista desde abajo";
      switchView.textContent = current ? "Volver a la vista desde abajo" : "Vista desde arriba";
      viewStatus.textContent = current
        ? "Algunos papeles parecen guardar algo. Puedes tocarlos para mirar más de cerca."
        : "Los dibujos de la pared parecen guardar algo. Puedes tocarlos para mirar más de cerca.";
      await animate(scene, [{ opacity: 0, transform: "scale(1.025)" }, { opacity: 1, transform: "scale(1)" }], 340);
    } catch {
      if (token === session) viewStatus.textContent = "No se ha podido cargar esta vista. Vuelve a intentarlo.";
    }
    if (token !== session) return;
    state = "viewing";
    switchView.disabled = false;
  });

  scene.addEventListener("pointerdown", (event) => {
    if (state !== "viewing") return;
    suppressClick = false;
    target = { ...pan };
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, pan: { ...target }, direction: event.pointerType === "mouse" ? 1 : -1 };
  });
  scene.addEventListener("pointermove", (event) => {
    const bounds = scene.getBoundingClientRect();
    if (drag) {
      if (event.pointerId !== drag.id) return;
      if (!suppressClick && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
      suppressClick = true;
      scene.setPointerCapture(event.pointerId);
      move(
        drag.pan.x + drag.direction * (event.clientX - drag.x) / (bounds.width * 0.4),
        drag.pan.y + drag.direction * (event.clientY - drag.y) / (bounds.height * 0.4),
      );
    } else if (event.pointerType === "mouse" && !event.target.closest("[data-desk-clue]")) {
      move(1 - (event.clientX - bounds.left) / bounds.width * 2, 1 - (event.clientY - bounds.top) / bounds.height * 2);
    }
  });
  scene.addEventListener("lostpointercapture", () => { drag = null; });
  scene.addEventListener("pointerup", () => { drag = null; });
  scene.addEventListener("pointercancel", () => { drag = null; });
  scene.addEventListener("keydown", (event) => {
    const directions = { ArrowLeft: [0.2, 0], ArrowRight: [-0.2, 0], ArrowUp: [0, 0.2], ArrowDown: [0, -0.2] };
    if (!directions[event.key]) return;
    event.preventDefault();
    const [x, y] = directions[event.key];
    move(target.x + x, target.y + y);
  });
  clueButtons.forEach((button) => {
    button.addEventListener("pointerenter", () => { target = { ...pan }; });
    button.addEventListener("click", (event) => {
      if (state !== "viewing" || button.closest(".desk-view__layer") !== layers[current] || (suppressClick && event.detail !== 0)) return;
      const key = button.dataset.deskClue;
      if (key === "portrait" && !(discoveries.has("marks") && discoveries.has("map"))) return;
      if (key === "moon" && !(discoveries.has("lotus") && discoveries.has("throne"))) return;
      showClue(clues[key], button, key);
    });
    button.addEventListener("focus", () => {
      if (state !== "viewing" || !button.matches(":focus-visible")) return;
      const size = sizes[current];
      const x = (button.offsetLeft + button.offsetWidth / 2) - (sceneSize.width + size.x * 2) / 2;
      const y = (button.offsetTop + button.offsetHeight / 2) - (sceneSize.height + size.y * 2) / 2;
      move(-x / size.x, -y / size.y);
    });
  });
  document.querySelector("#btn-close-desk-clue").addEventListener("click", () => clueDialog.close());
  clueDialog.addEventListener("close", () => {
    if (state !== "reading") return;
    // A multi-page clue is complete only after visiting every page and closing it.
    if (activeKey && seenPages.size === pages.length) discoveries.add(activeKey);
    state = "viewing";
    unlockClues();
    if (activeKey === "moon") viewStatus.textContent = "Quizá sea el momento de mirar el escritorio desde arriba.";
    activeClue?.focus({ preventScroll: true });
  });
  new ResizeObserver(() => { if (!view.hidden) layout(); }).observe(scene);
})();
