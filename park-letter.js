(() => {
  window.createParkLetter = (scene, image, reducedMotion) => {
    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = "park-letter-hit";
    hit.setAttribute("aria-label", "Leer la carta");
    hit.setAttribute("aria-haspopup", "dialog");
    hit.hidden = true;
    scene.parentElement.append(hit);

    const dialog = document.createElement("dialog");
    dialog.className = "park-letter";
    dialog.setAttribute("aria-labelledby", "park-letter-title");
    const heading = document.createElement("h2");
    heading.id = "park-letter-title";
    heading.textContent = "A un recuerdo de distancia";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "park-letter__close";
    close.textContent = "Cerrar";
    const header = document.createElement("header");
    header.append(heading, close);
    const body = document.createElement("div");
    body.className = "park-letter__body";
    body.tabIndex = 0;
    const textPage = document.createElement("section");
    textPage.className = "park-letter__text";
    for (const text of [
      "¿Te acuerdas de cuando me hablaste de aquella etapa de tu vida y de lo bien que te sentías entonces? Me quedé pensando en qué era lo que la hacía tan especial para ti.",
      "Creo que era esa libertad de no tener preocupaciones. No pensar en la carrera ni en las oposiciones, no sentir que tienes algo pendiente. Simplemente ser tú, estar con tu grupo de amigas en aquel festival y disfrutar del presente. Sin más.",
      "Decías que te costaba expresarlo, que nunca sabías cómo poner en palabras por qué te sentías así, y me alegra que pudieras compartirlo conmigo. Si nunca me lo hubieras contado, no podría guardar ese pequeño recuerdo en mi memoria y jamás se me habría ocurrido prepararte esto.",
      "Por eso te he traído hasta aquí. Quizá no sea físicamente, pero sí quería acercarte a aquella etapa de tu vida que tanto significó para ti.",
      "Me contabas que pasabas mucho tiempo en el Parque de los Patos o en los jardines, muchas veces solo. Tú, tu música y ese ratito para ti, en soledad, dejando pasar el tiempo.",
      "Y no quería solo traerte a un lugar que forma parte de tus recuerdos. También quería acercarte a algunas de las personas que formaron parte de aquella etapa, a esas personas que compartieron contigo momentos que, de una manera u otra, te hicieron ser quien eres hoy.",
      "Te dejo algo que ellas han preparado exclusivamente para ti.",
      "Disfruta, es tu día. Eres el protagonista.",
      "Att.: César ♥",
    ]) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      textPage.append(paragraph);
    }
    const imagePage = document.createElement("section");
    imagePage.className = "park-letter__image";
    imagePage.setAttribute("aria-label", "Carta de tus amigas");
    const friendsLetter = document.createElement("img");
    friendsLetter.src = "./Entrada Cumpleaños/Parte 3 (Parque)/Carta Amigas.png";
    friendsLetter.alt = "Carta preparada por tus amigas para tu cumpleaños.";
    friendsLetter.decoding = "async";
    friendsLetter.tabIndex = 0;
    friendsLetter.setAttribute("role", "button");
    friendsLetter.setAttribute("aria-label", "Ampliar la carta");
    imagePage.append(friendsLetter);
    body.append(textPage, imagePage);
    const footer = document.createElement("footer");
    const count = document.createElement("span");
    count.setAttribute("aria-live", "polite");
    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Anterior";
    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Siguiente";
    footer.append(previous, count, next);
    dialog.append(header, body, footer);
    document.body.append(dialog);
    let page = 0;
    let turn = null;
    let zoomed = false;

    function setZoom(value) {
      zoomed = value;
      dialog.className = page === 1 ? `park-letter park-letter--viewer${zoomed ? " park-letter--zoomed" : ""}` : "park-letter";
      friendsLetter.setAttribute("aria-label", zoomed ? "Ver la carta completa" : "Ampliar la carta");
      friendsLetter.setAttribute("aria-pressed", String(zoomed));
    }

    function render() {
      turn?.cancel();
      setZoom(false);
      heading.hidden = page === 1;
      footer.hidden = page === 1;
      textPage.hidden = page !== 0;
      imagePage.hidden = page !== 1;
      previous.disabled = page === 0;
      next.disabled = page === 1;
      count.textContent = `${page + 1} / 2`;
      body.scrollTop = 0;
      if (!reducedMotion.matches) turn = body.animate([
        { opacity: 0, transform: "translateY(5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 350, easing: "ease-out" });
    }
    hit.addEventListener("click", () => {
      if (hit.hidden || !scene.closest("dialog")?.open) return;
      page = 0;
      render();
      dialog.showModal();
      close.focus({ preventScroll: true });
    });
    close.addEventListener("click", () => dialog.close());
    previous.addEventListener("click", () => { if (page > 0) { page -= 1; render(); } });
    next.addEventListener("click", () => { if (page < 1) { page += 1; render(); } });
    friendsLetter.addEventListener("click", () => setZoom(!zoomed));
    friendsLetter.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setZoom(!zoomed); }
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || (page === 1 && (event.target === body || event.target === imagePage))) dialog.close();
    });
    dialog.addEventListener("close", () => { turn?.cancel(); });

    function sync() {
      if (hit.hidden) return;
      hit.style.transform = image.style.transform;
      hit.style.width = image.style.width;
      hit.style.height = image.style.height;
    }
    function show(scenePage) {
      hit.hidden = scenePage !== 4;
      if (hit.hidden && dialog.open) dialog.close();
      sync();
    }
    return { show, sync, hide: () => show(-1) };
  };
})();
