(() => {
  const dialog = document.querySelector("#anniversary-destination");
  const content = document.querySelector("#anniversary-destination-content");
  const scene = document.querySelector("#birthday-scene");
  const image = document.querySelector("#birthday-image");
  const panel = document.querySelector("#birthday-dialogue");
  const paths = document.querySelector("#birthday-paths");
  const title = document.querySelector("#birthday-title");
  const copy = document.querySelector("#birthday-copy");
  const step = document.querySelector("#birthday-step");
  const next = document.querySelector("#birthday-next");
  const back = document.querySelector("#birthday-return");
  const toggle = document.querySelector("#birthday-toggle-paths");
  const messageToggle = document.querySelector("#birthday-toggle-messages");
  const canvas = document.querySelector("#birthday-fireworks");
  const context = canvas?.getContext("2d");
  const audio = document.querySelector("#birthday-audio");
  const audioToggle = document.querySelector("#birthday-audio-toggle");
  const audioChange = document.querySelector("#birthday-audio-change");
  const audioVolume = document.querySelector("#birthday-audio-volume");
  const musicPanel = document.querySelector("#birthday-music-panel");
  const songControl = document.querySelector("#birthday-song-control");
  const volumeControl = document.querySelector("#birthday-volume-control");
  const songSelect = document.querySelector("#birthday-song");
  const volumeRange = document.querySelector("#birthday-volume");
  const volumeOutput = document.querySelector("#birthday-volume-output");
  const musicStatus = document.querySelector("#birthday-music-status");
  const otherMedia = [...document.querySelectorAll("audio, video")].filter((media) => media !== audio);
  if (!dialog || !image) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const messageTitles = ["¡¡¡Feliz cumpleaños!!! 🎂🎉", "La sorpresa que tanto esperaba enseñarte", "Hay algo esperándote"];
  const messages = [
    "Hoy este rincón está de celebración. Espero que disfrutes descubriendo todo lo que he ido preparando para ti.",
    "Llevo meses preparando esto, a veces dándome cabezazos contra el teclado, y no sabes las ganas que tenía de enseñártelo... Aquí tienes uno de los motivos por los que en septiembre he estado un poco ausente, y por los que también he necesitado ratitos en octubre y parte de noviembre. Quería guardar la sorpresa hasta hoy.",
    "Podría seguir contándote cosas, pero prefiero que las descubras tú. Espero que este sea un cumpleaños que no olvides. Hay cuatro caminos esperándote y un poco de mí en cada uno. Uno de ellos guarda algo muy especial para ti, incluso más que para mí... Te recomiendo empezar por «Hasta la Luna». Después, sigue descubriendo los demás a tu ritmo; no hay ninguna prisa.",
  ];
  let page = 0;
  let frame = 0;
  let revealFrame = 0;
  let layoutFrame = 0;
  let drag = null;
  let active = false;
  let observing = false;
  let fireworkFrame = 0;
  let lastTime = 0;
  let nextBurst = 0.9;
  let bursts = [];
  let artwork = { width: 0, height: 0 };
  let canvasRatio = 0;
  const glowSprites = new Map();
  const fireworkColors = ["255,204,116", "132,239,219", "249,161,215", "203,218,255"];
  let range = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const clamp = (value) => Math.max(-1, Math.min(1, value));
  const homeImage = image.getAttribute("src");
  const moonScenes = [
    {
      src: "./Entrada Cumpleaños/Parte 1 (Luna)/Parte 1 de la Entrada.png",
      alt: "Superficie de la Luna bajo un cielo lleno de estrellas.",
      title: "¿Dónde estoy...?",
      lines: ["¿Es la Luna...?", "Qué raro... ¿por qué puedo seguir respirando?", "Ya que estoy aquí... debería dar una vuelta."],
      action: "Dar una vuelta",
    },
    {
      src: "./Entrada Cumpleaños/Parte 1 (Luna)/Parte 2 de la Entrada.png",
      alt: "Vista del espacio, las estrellas y la Tierra desde la Luna.",
      title: "Desde aquí arriba...",
      lines: ["Qué bonito se ve el espacio... las estrellas y la Tierra desde aquí.", "Aunque... hay algo que reluce cerca de ese cráter."],
      action: "Acercarse",
    },
    {
      src: "./Entrada Cumpleaños/Parte 1 (Luna)/Parte 3 de la Entrada.png",
      alt: "Un pergamino luminoso flota sobre un cráter lunar, con la Tierra al fondo.",
      title: "¿Qué es esto?",
      lines: ["¿Por qué está flotando aquí, en plena soledad?", "¿Lleva algo escrito...?", "Me da curiosidad..."],
      action: "Sentarse",
    },
    {
      src: "./Entrada Cumpleaños/Parte 1 (Luna)/Parte 4 de la Entrada.png",
      alt: "Vista sentado al borde del cráter, frente al pergamino luminoso y la Tierra.",
      lines: [],
    },
  ];
  const parkScenes = [
    {
      src: "./Entrada Cumpleaños/Parte 3 (Parque)/Parte 1.png",
      alt: "Un parque tranquilo, con bancos bajo los árboles y un estanque al fondo.",
      title: "Este sitio...",
      lines: ["Tiene algo familiar.", "Se está bien aquí, entre los árboles y el agua.", "Creo que voy a dar una vuelta..."],
      action: "Dar una vuelta",
    },
    {
      src: "./Entrada Cumpleaños/Parte 3 (Parque)/Parte 2.png",
      alt: "Un banco frente al estanque, con una carta sobre el asiento.",
      title: "Qué tranquilo está todo...",
      lines: ["El sol se cuela entre las ramas.", "Me apetece detenerme un momento y mirar el agua."],
      action: "Mirar el estanque",
    },
    {
      src: "./Entrada Cumpleaños/Parte 3 (Parque)/Parte 3.png",
      alt: "La luz del sol se refleja sobre el agua del estanque.",
      title: "Podría quedarme aquí un rato...",
      lines: ["Sin prisas, simplemente mirando.", "Aunque... creo que había algo sobre el banco."],
      action: "Mirar el banco",
    },
    {
      src: "./Entrada Cumpleaños/Parte 3 (Parque)/Parte 4.png",
      alt: "Una carta decorada con flores descansa sobre un banco de madera.",
      title: "Hay una carta...",
      lines: ["Aquí no se distingue muy bien lo que pone."],
      action: "Leer en un sitio más iluminado",
    },
    {
      src: "./Entrada Cumpleaños/Parte 3 (Parque)/Parte 5.png",
      alt: "Una carta sostenida a la luz del sol frente al estanque.",
      lines: [],
    },
  ];
  let activeScenes = moonScenes;
  const homeAlt = image.alt;
  let moonPage = -1;
  let sceneChanging = false;
  let sceneEpoch = 0;
  let thoughtIndex = 0;
  let thoughtTimer = null;
  let thoughtGap = false;
  let firstThoughtPending = false;
  let messagesHidden = false;

  const moonSunlight = document.createElement("div");
  moonSunlight.className = "birthday-moon-sunlight";
  moonSunlight.setAttribute("aria-hidden", "true");
  moonSunlight.hidden = true;
  scene.append(moonSunlight);
  const parkAtmosphere = window.createParkAtmosphere(scene, image, reducedMotion);
  const parkLetter = window.createParkLetter(scene, image, reducedMotion);
  const moonReader = window.createMoonReader(scene, image, reducedMotion, () => active && !sceneChanging && activeScenes === moonScenes && moonPage === 3);
  const birthdayMemory = window.createBirthdayMemory(content, scene, image, reducedMotion);
  const moonSkipHint = document.createElement("dialog");
  moonSkipHint.className = "birthday-moon-skip-hint";
  moonSkipHint.setAttribute("aria-labelledby", "birthday-moon-tip-title");
  const moonTipTitle = document.createElement("h2");
  moonTipTitle.id = "birthday-moon-tip-title";
  moonTipTitle.textContent = "Antes de dar el primer paso...";
  const moonTipCopy = document.createElement("p");
  moonTipCopy.textContent = "Si el texto va despacio para ti o ya lo has leído, haz doble clic o dos toques rápidos en la pantalla para adelantar cada diálogo. Los botones para seguir el camino tendrás que pulsarlos tú. La primera vez, te recomiendo verlo con calma, al completo.";
  const moonTipConfirm = document.createElement("button");
  moonTipConfirm.type = "button";
  moonTipConfirm.textContent = "Entendido, vamos allá";
  moonSkipHint.append(moonTipTitle, moonTipCopy, moonTipConfirm);
  document.body.append(moonSkipHint);
  let moonIntroPending = false;
  let moonTap = null;
  let previousMoonTap = null;

  moonSkipHint.addEventListener("cancel", (event) => event.preventDefault());
  moonTipConfirm.addEventListener("click", () => {
    moonIntroPending = false;
    moonSkipHint.close();
    messageToggle.hidden = false;
    scheduleThought();
  });

  function clearMoonExtras() {
    moonIntroPending = false;
    if (moonSkipHint.open) moonSkipHint.close();
    moonSunlight.hidden = true;
    moonTap = previousMoonTap = null;
  }

  function showMoonExtras() {
    clearMoonExtras();
    moonSunlight.hidden = moonPage !== 0 || activeScenes !== moonScenes;
    if (moonPage !== 0) return;
    moonIntroPending = true;
    moonSkipHint.showModal();
  }

  function skipMoonThought() {
    if (!active || sceneChanging || messagesHidden || firstThoughtPending || moonIntroPending || moonPage < 0) return;
    const entry = activeScenes[moonPage];
    if (!entry || thoughtIndex >= entry.lines.length) return;
    thoughtIndex += 1;
    thoughtGap = false;
    renderThought();
  }

  content.addEventListener("pointerdown", (event) => {
    moonTap = null;
    if (moonPage < 0 || event.isPrimary === false || event.button !== 0 || event.target.closest("button, input, select, textarea, a, .birthday-controls")) {
      previousMoonTap = null;
      return;
    }
    moonTap = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
  });
  content.addEventListener("pointermove", (event) => {
    if (moonTap?.id === event.pointerId && Math.hypot(event.clientX - moonTap.x, event.clientY - moonTap.y) > 14) {
      moonTap = previousMoonTap = null;
    }
  });
  content.addEventListener("pointerup", (event) => {
    const tap = moonTap;
    moonTap = null;
    if (!tap || tap.id !== event.pointerId || performance.now() - tap.time > 350) return;
    const now = performance.now();
    if (previousMoonTap && now - previousMoonTap.time < 350 && Math.hypot(event.clientX - previousMoonTap.x, event.clientY - previousMoonTap.y) < 32) {
      previousMoonTap = null;
      skipMoonThought();
    } else previousMoonTap = { x: event.clientX, y: event.clientY, time: now };
  });
  content.addEventListener("pointercancel", () => { moonTap = previousMoonTap = null; });

  function clearThoughtTimer() {
    clearTimeout(thoughtTimer);
    thoughtTimer = null;
  }

  function enableMessages() {
    messagesHidden = false;
    messageToggle.hidden = false;
    messageToggle.textContent = "Ocultar mensajes";
    messageToggle.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    thoughtGap = false;
    firstThoughtPending = false;
    title.hidden = false;
  }

  function scheduleThought() {
    clearThoughtTimer();
    if (!active || moonPage < 0 || messagesHidden || sceneChanging || moonIntroPending || thoughtIndex >= activeScenes[moonPage].lines.length) return;
    thoughtTimer = setTimeout(() => {
      if (firstThoughtPending) {
        firstThoughtPending = false;
        renderThought();
      } else if (thoughtGap) {
        thoughtIndex += 1;
        thoughtGap = false;
        renderThought();
      } else {
        thoughtGap = true;
        panel.hidden = true;
        scheduleThought();
      }
    }, firstThoughtPending ? 1500 : thoughtGap ? 1000 : 4000);
  }

  function renderThought() {
    const entry = activeScenes[moonPage];
    panel.hidden = messagesHidden;
    title.textContent = thoughtIndex === 0 ? entry.title : entry.lines[thoughtIndex - 1];
    copy.replaceChildren();
    step.textContent = "";
    next.hidden = thoughtIndex < entry.lines.length;
    if (!reducedMotion.matches) title.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800, easing: "ease-out" });
    scheduleThought();
  }

  messageToggle.addEventListener("click", () => {
    messagesHidden = !messagesHidden;
    panel.hidden = messagesHidden || thoughtGap || firstThoughtPending;
    messageToggle.textContent = messagesHidden ? "Mostrar mensajes" : "Ocultar mensajes";
    messageToggle.setAttribute("aria-expanded", String(!messagesHidden));
    if (messagesHidden) clearThoughtTimer();
    else scheduleThought();
  });
  const sceneImages = new Map();

  function loadScene(src) {
    if (!sceneImages.has(src)) {
      const picture = new Image();
      picture.src = src;
      const ready = picture.decode().then(() => picture).catch((error) => { sceneImages.delete(src); throw error; });
      sceneImages.set(src, ready);
    }
    return sceneImages.get(src);
  }

  function stopFireworks() {
    cancelAnimationFrame(fireworkFrame);
    fireworkFrame = 0;
    bursts = [];
    context?.clearRect(0, 0, artwork.width, artwork.height);
  }

  function startFireworks() {
    lastTime = 0;
    nextBurst = 0.9;
    if (active && moonPage < 0 && !fireworkFrame && !reducedMotion.matches && !document.hidden) fireworkFrame = requestAnimationFrame(paintFireworks);
  }

  function walkingFrames() {
    // Gentle alternating footsteps over a continuous forward movement; no layout work per frame.
    return Array.from({ length: 137 }, (_, i) => {
      const progress = i / 136;
      const envelope = Math.sin(Math.PI * progress);
      const stride = progress * Math.PI * 16;
      return {
        offset: progress,
        transform: `translate3d(${Math.sin(stride / 2) * 2.5 * envelope}px, ${Math.sin(stride) * 4 * envelope}px, 0) scale(${1 + progress * 0.12})`,
      };
    });
  }

  async function changeScene(src, alt, destinationPage, show, approach = false) {
    if (sceneChanging || !active) return;
    sceneChanging = true;
    clearThoughtTimer();
    const epoch = ++sceneEpoch;
    next.disabled = back.disabled = true;
    messageToggle.disabled = true;
    closeMusicPanel();
    const duration = reducedMotion.matches ? 0 : 600;
    let walking = null;
    try {
      await loadScene(src);
      if (epoch !== sceneEpoch || !active) return;
      if (approach) {
        panel.hidden = true;
        walking = scene.animate(reducedMotion.matches ? [{ opacity: 1 }, { opacity: 1 }] : walkingFrames(), {
          duration: reducedMotion.matches ? 0 : 4250, fill: "forwards", easing: "linear",
        });
        await walking.finished.catch(() => {});
        if (epoch !== sceneEpoch || !active) return;
      }
      const fade = [scene, panel].map((node) => node.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: "forwards", easing: "ease-in-out" }));
      await Promise.all(fade.map((animation) => animation.finished.catch(() => {})));
      if (epoch !== sceneEpoch || !active) { fade.forEach((animation) => animation.cancel()); return; }
      stopFireworks();
      walking?.cancel();
      moonPage = destinationPage;
      content.classList.toggle("is-lunar", moonPage >= 0);
      image.src = src;
      image.alt = alt;
      scene.style.setProperty("--birthday-scene-art", `url("${src}")`);
      await image.decode();
      if (epoch !== sceneEpoch || !active) { fade.forEach((animation) => animation.cancel()); return; }
      current.x = current.y = target.x = target.y = 0;
      layout();
      show();
      const arrival = [scene, panel].map((node) => node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration + (duration ? 150 : 0), easing: "ease-out" }));
      fade.forEach((animation) => animation.cancel());
      await Promise.all(arrival.map((animation) => animation.finished.catch(() => {})));
      if (active && epoch === sceneEpoch) {
        startFireworks();
        (next.hidden ? back : next).focus({ preventScroll: true });
      }
    } catch {
      if (active && epoch === sceneEpoch) step.textContent = "No se ha podido cargar la imagen. Inténtalo de nuevo.";
    } finally {
      walking?.cancel();
      if (epoch === sceneEpoch) {
        sceneChanging = false;
        next.disabled = back.disabled = false;
        messageToggle.disabled = false;
        scheduleThought();
      }
    }
  }

  function showMoonMessage() {
    showMoonExtras();
    parkAtmosphere.show(activeScenes === parkScenes ? moonPage : -1);
    parkLetter.show(activeScenes === parkScenes ? moonPage : -1);
    const entry = activeScenes[moonPage];
    paths.hidden = toggle.hidden = true;
    enableMessages();
    next.textContent = entry.action;
    back.hidden = false;
    thoughtIndex = 0;
    firstThoughtPending = true;
    panel.hidden = true;
    next.hidden = true;
    if (moonIntroPending) messageToggle.hidden = true;
  }

  function collectMusicTracks(players) {
    const unique = new Map();
    players.forEach((player) => {
      [player.getAttribute("src"), player.dataset.trackPrimary, player.dataset.trackSecondary].filter(Boolean).forEach((src) => {
        if (!unique.has(src)) unique.set(src, { src, label: decodeURIComponent(src.split("/").at(-1)).replace(/\.mp3$/i, "") });
      });
    });
    return [...unique.values()];
  }

  const tracks = collectMusicTracks([audio, ...otherMedia.filter((media) => media.tagName === "AUDIO")].filter(Boolean));
  const parkTrack = "./Entrada Cumpleaños/Parte 3 (Parque)/Corazón Mármol.mp4";
  tracks.push({ src: parkTrack, label: "Corazón Mármol" });
  const trackLabels = new Map(tracks.map(({ src, label }) => [src, label]));
  tracks.forEach((track) => songSelect.add(new Option(track.label, track.src)));
  if (audio) {
    audio.volume = 0.55;
    audio.loop = true;
  }

  let parkMusicSnapshot = null;
  let pendingMusicSeek = null;

  function cancelMusicSeek() {
    if (pendingMusicSeek) audio.removeEventListener("loadedmetadata", pendingMusicSeek);
    pendingMusicSeek = null;
  }

  function startParkMusic() {
    if (!audio || parkMusicSnapshot) return;
    closeMusicPanel();
    audioChange.hidden = true;
    cancelMusicSeek();
    parkMusicSnapshot = { src: audio.getAttribute("src"), time: audio.currentTime, paused: audio.paused, loop: audio.loop };
    audio.pause();
    audio.src = parkTrack;
    audio.loop = true;
    playMusic();
    syncMusicControls();
  }

  function restoreParkMusic(resume = true) {
    if (!audio || !parkMusicSnapshot) return;
    closeMusicPanel();
    audioChange.hidden = false;
    const saved = parkMusicSnapshot;
    parkMusicSnapshot = null;
    cancelMusicSeek();
    audio.pause();
    audio.src = saved.src;
    audio.loop = saved.loop;
    const position = resume ? saved.time : 0;
    pendingMusicSeek = () => {
      pendingMusicSeek = null;
      try { audio.currentTime = position; } catch { /* Some streams are not seekable. */ }
    };
    audio.addEventListener("loadedmetadata", pendingMusicSeek, { once: true });
    try { audio.currentTime = position; } catch { /* Retry when metadata is ready. */ }
    if (resume && !saved.paused) playMusic();
    syncMusicControls();
  }

  function syncMusicControls() {
    if (!audio) return;
    audioToggle.textContent = audio.paused ? "Reanudar canción" : "Pausar canción";
    const volume = Math.round(audio.volume * 100);
    audioVolume.textContent = `Volumen · ${volume}%`;
    volumeRange.value = String(volume);
    volumeOutput.value = `${volume}%`;
    songSelect.value = audio.getAttribute("src");
    musicStatus.textContent = trackLabels.get(songSelect.value) || "";
  }

  function playMusic() {
    otherMedia.forEach((media) => media.pause());
    audio?.play()?.catch(() => {
      syncMusicControls();
      musicStatus.textContent = "Pulsa Reanudar canción para iniciar la música.";
    });
  }

  let musicPanelTimer = null;

  function scheduleMusicPanelClose() {
    clearTimeout(musicPanelTimer);
    if (musicPanel.hidden) return;
    musicPanelTimer = setTimeout(() => {
      const opener = songControl.hidden ? audioVolume : audioChange;
      const restoreFocus = musicPanel.contains(document.activeElement);
      closeMusicPanel();
      if (restoreFocus) opener.focus({ preventScroll: true });
    }, songControl.hidden ? 4000 : 10000);
  }

  function closeMusicPanel() {
    clearTimeout(musicPanelTimer);
    musicPanelTimer = null;
    musicPanel.hidden = true;
    audioChange.setAttribute("aria-expanded", "false");
    audioVolume.setAttribute("aria-expanded", "false");
  }

  function openMusicPanel(mode) {
    const song = mode === "song";
    const button = song ? audioChange : audioVolume;
    const wasOpen = button.getAttribute("aria-expanded") === "true";
    closeMusicPanel();
    if (wasOpen) return;
    songControl.hidden = !song;
    volumeControl.hidden = song;
    musicPanel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    (song ? songSelect : volumeRange).focus({ preventScroll: true });
    scheduleMusicPanelClose();
  }

  audioToggle.addEventListener("click", () => { if (audio.paused) playMusic(); else audio.pause(); });
  audioChange.addEventListener("click", () => openMusicPanel("song"));
  audioVolume.addEventListener("click", () => openMusicPanel("volume"));
  document.querySelector("#birthday-music-close").addEventListener("click", () => {
    const opener = songControl.hidden ? audioVolume : audioChange;
    closeMusicPanel();
    opener.focus({ preventScroll: true });
  });
  songSelect.addEventListener("change", () => {
    cancelMusicSeek();
    const resume = !audio.paused;
    audio.src = songSelect.value;
    audio.loop = true;
    if (resume) playMusic();
    syncMusicControls();
  });
  volumeRange.addEventListener("input", () => {
    audio.volume = Number(volumeRange.value) / 100;
    scheduleMusicPanelClose();
  });
  volumeRange.addEventListener("keydown", (event) => { if (event.key.startsWith("Arrow")) event.stopPropagation(); });
  ["play", "pause", "volumechange", "loadedmetadata"].forEach((event) => audio?.addEventListener(event, syncMusicControls));
  dialog.addEventListener("cancel", (event) => {
    if (musicPanel.hidden) return;
    event.preventDefault();
    const opener = songControl.hidden ? audioVolume : audioChange;
    closeMusicPanel();
    opener.focus({ preventScroll: true });
  });
  syncMusicControls();

  function stopMusic() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  dialog.addEventListener("birthday:opening", () => {
    if (!audio) return;
    closeMusicPanel();
    playMusic();
    moonScenes.forEach(({ src }) => { loadScene(src).catch(() => {}); });
  });
  otherMedia.forEach((media) => media.addEventListener("play", stopMusic));

  function draw() {
    image.style.transform = `translate3d(calc(-50% + ${current.x * range.x}px), calc(-50% + ${current.y * range.y}px), 0)`;
    if (!moonSunlight.hidden) moonSunlight.style.transform = image.style.transform;
    parkAtmosphere.sync();
    parkLetter.sync();
    moonReader.sync();
    birthdayMemory.sync();
    if (canvas) canvas.style.transform = image.style.transform;
  }

  function tick() {
    current.x += (target.x - current.x) * 0.075;
    current.y += (target.y - current.y) * 0.075;
    draw();
    frame = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.002
      ? requestAnimationFrame(tick) : 0;
  }

  function move(x, y) {
    if (!active || sceneChanging || reducedMotion.matches) return;
    target.x = clamp(x);
    target.y = clamp(y);
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function layout() {
    if (!active || !image.naturalWidth) return;
    const width = scene.clientWidth, height = scene.clientHeight;
    // Fit the entire illustration instead of cropping it, with a small cinematic margin.
    const scale = moonPage >= 0
      ? Math.max(width / image.naturalWidth, height / image.naturalHeight) * 1.04
      : Math.min(width / image.naturalWidth, height / image.naturalHeight) * 0.985;
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    image.style.width = `${w}px`;
    image.style.height = `${h}px`;
    moonSunlight.style.width = `${w}px`;
    moonSunlight.style.height = `${h}px`;
    range = moonPage >= 0
      ? { x: Math.max(0, (w - width) / 2), y: Math.max(0, (h - height) / 2) }
      : { x: Math.min(12, (width - w) / 2), y: Math.min(9, (height - h) / 2) };
    artwork = { width: w, height: h };
    if (canvas && context) {
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      const pixelWidth = Math.round(w * ratio), pixelHeight = Math.round(h * ratio);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight || canvasRatio !== ratio) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        canvasRatio = ratio;
      }
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    draw();
  }

  function scheduleLayout() {
    if (!active || layoutFrame) return;
    layoutFrame = requestAnimationFrame(() => { layoutFrame = 0; layout(); });
  }

  function createBurst() {
    const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
    if (!glowSprites.has(color)) {
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = 64;
      const brush = sprite.getContext("2d");
      const glow = brush.createRadialGradient(32, 32, 0, 32, 32, 32);
      glow.addColorStop(0, "rgba(255,250,228,1)");
      glow.addColorStop(0.09, `rgba(${color},0.95)`);
      glow.addColorStop(0.3, `rgba(${color},0.25)`);
      glow.addColorStop(1, `rgba(${color},0)`);
      brush.fillStyle = glow;
      brush.fillRect(0, 0, 64, 64);
      glowSprites.set(color, sprite);
    }
    const count = innerWidth < 600 ? 44 : 88;
    const size = 0.15 + Math.random() * 0.09;
    return {
      age: 0, x: 0.24 + Math.random() * 0.34, y: 0.16 + Math.random() * 0.2,
      launchOffset: (Math.random() - 0.5) * 0.12,
      color, sprite: glowSprites.get(color), particles: Array.from({ length: count }, (_, index) => {
        const angle = index / count * Math.PI * 2 + Math.random() * 0.12;
        const speed = size * (0.45 + Math.random() * 0.55);
        return {
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 2 + Math.random() * 1.25, size: 0.7 + Math.random() * 0.7,
          shimmer: Math.random() * Math.PI * 2,
        };
      }),
    };
  }

  function paintFireworks(time) {
    fireworkFrame = 0;
    if (!active || moonPage >= 0 || reducedMotion.matches || !context) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    const { width, height } = artwork;
    const unit = Math.min(width, height);
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    nextBurst -= dt;
    if (nextBurst <= 0 && !document.hidden) {
      bursts.push(createBurst());
      nextBurst = Math.random() < 0.25 ? 0.6 : 1.8 + Math.random() * 1.4;
    }
    bursts.forEach((burst) => {
      burst.age += dt;
      const t = burst.age - 0.9;
      if (t < 0) {
        const progress = burst.age / 0.9;
        const head = 1 - Math.pow(1 - progress, 1.8);
        const x = (burst.x + burst.launchOffset * (1 - head)) * width;
        const y = (burst.y + (1 - head) * 0.42) * height;
        const tail = (burst.y + (1 - Math.max(0, head - 0.1)) * 0.42) * height;
        const trail = context.createLinearGradient(x, y, x, tail + 1);
        trail.addColorStop(0, `rgba(${burst.color},0.9)`);
        trail.addColorStop(1, `rgba(${burst.color},0)`);
        context.strokeStyle = trail;
        context.lineWidth = Math.max(1, width / 1000);
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + burst.launchOffset * width * 0.1, tail);
        context.stroke();
        const glow = Math.max(6, unit * 0.018);
        context.drawImage(burst.sprite, x - glow, y - glow, glow * 2, glow * 2);
        return;
      }
      if (t < 0.5) {
        const halo = unit * (0.08 + t * 0.18);
        context.globalAlpha = (1 - t / 0.5) * 0.3;
        context.drawImage(burst.sprite, burst.x * width - halo, burst.y * height - halo, halo * 2, halo * 2);
        context.globalAlpha = 1;
      }
      const tailAge = Math.max(0, t - 0.2);
      const travel = (1 - Math.exp(-t * 1.4)) * unit;
      const tailTravel = (1 - Math.exp(-tailAge * 1.4)) * unit;
      const drop = t * t * 0.018 * unit, tailDrop = tailAge * tailAge * 0.018 * unit;
      const originX = burst.x * width, originY = burst.y * height;
      burst.particles.forEach((particle) => {
        if (t > particle.life) return;
        const fade = Math.pow(1 - t / particle.life, 0.85);
        const x = originX + particle.vx * travel;
        const y = originY + particle.vy * travel + drop;
        const sparkle = t < 1 ? 1 : 0.7 + Math.sin(t * 13 + particle.shimmer) * 0.3;
        context.strokeStyle = `rgba(${burst.color},${fade * sparkle * 0.9})`;
        context.lineWidth = Math.max(0.85, unit / 650) * particle.size;
        context.beginPath();
        context.moveTo(originX + particle.vx * tailTravel, originY + particle.vy * tailTravel + tailDrop);
        context.lineTo(x, y);
        context.stroke();
        const glow = Math.max(3, unit * 0.006) * particle.size;
        context.globalAlpha = fade * sparkle;
        context.drawImage(burst.sprite, x - glow, y - glow, glow * 2, glow * 2);
        context.fillStyle = `rgba(255,246,215,${fade})`;
        context.beginPath();
        context.arc(x, y, Math.max(0.7, unit / 900) * particle.size, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      });
    });
    bursts = bursts.filter((burst) => burst.age < 4.2);
    context.globalCompositeOperation = "source-over";
    if (!document.hidden) fireworkFrame = requestAnimationFrame(paintFireworks);
  }

  function showMessage() {
    window.CARTA_WISHES?.closeGallery();
    clearThoughtTimer();
    enableMessages();
    next.textContent = "Siguiente";
    toggle.hidden = true;
    paths.hidden = true;
    next.hidden = false;
    back.hidden = true;
    title.textContent = messageTitles[page];
    copy.replaceChildren(Object.assign(document.createElement("p"), { textContent: messages[page] }));
    step.textContent = `${String(page + 1).padStart(2, "0")} / 03`;
  }

  function showPaths() {
    clearMoonExtras();
    parkAtmosphere.hide();
    parkLetter.hide();
    restoreParkMusic();
    activeScenes = moonScenes;
    birthdayMemory.hide();
    window.CARTA_WISHES?.closeGallery();
    moonReader.hide();
    clearThoughtTimer();
    messageToggle.hidden = true;
    back.hidden = true;
    panel.hidden = true;
    paths.hidden = false;
    observing = false;
    toggle.hidden = false;
    toggle.textContent = "Ocultar entradas";
    toggle.setAttribute("aria-expanded", "true");
    paths.querySelector("button").focus({ preventScroll: true });
  }

  next.addEventListener("click", () => {
    if (sceneChanging) return;
    if (activeScenes === parkScenes && moonPage >= 0) {
      const destination = moonPage + 1;
      if (destination >= parkScenes.length) return;
      const entry = parkScenes[destination];
      changeScene(entry.src, entry.alt, destination, destination === 4 ? () => {
        parkAtmosphere.show(4);
        parkLetter.show(4);
        paths.hidden = toggle.hidden = panel.hidden = next.hidden = messageToggle.hidden = true;
        back.hidden = false;
      } : showMoonMessage, moonPage === 0);
      return;
    }
    if (moonPage === 0) {
      changeScene(moonScenes[1].src, moonScenes[1].alt, 1, showMoonMessage);
      return;
    }
    if (moonPage === 1) {
      changeScene(moonScenes[2].src, moonScenes[2].alt, 2, showMoonMessage, true);
      return;
    }
    if (moonPage === 2) {
      changeScene(moonScenes[3].src, moonScenes[3].alt, 3, () => {
        moonReader.show();
        paths.hidden = toggle.hidden = panel.hidden = next.hidden = messageToggle.hidden = true;
        back.hidden = false;
      });
      return;
    }
    page += 1;
    if (page >= messages.length) showPaths();
    else showMessage();
  });
  back.addEventListener("click", () => {
    if (moonPage >= 0) changeScene(homeImage, homeAlt, -1, showPaths);
    else showPaths();
  });
  toggle.addEventListener("click", () => {
    observing = !observing;
    paths.hidden = observing;
    toggle.textContent = observing ? "Mostrar entradas" : "Ocultar entradas";
    toggle.setAttribute("aria-expanded", String(!observing));
  });
  paths.querySelectorAll("[data-birthday-path]").forEach((button) => {
    button.addEventListener("click", () => {
      if (sceneChanging) return;
      if (button.dataset.birthdayPath === "1") {
        activeScenes = moonScenes;
        changeScene(moonScenes[0].src, moonScenes[0].alt, 0, showMoonMessage);
        return;
      }
      if (button.dataset.birthdayPath === "3") {
        startParkMusic();
        activeScenes = parkScenes;
        parkScenes.forEach(({ src }) => { loadScene(src).catch(() => {}); });
        changeScene(parkScenes[0].src, parkScenes[0].alt, 0, showMoonMessage);
        return;
      }
      if (button.dataset.birthdayPath === "2") {
        paths.hidden = toggle.hidden = panel.hidden = messageToggle.hidden = true;
        back.hidden = false;
        window.CARTA_WISHES?.openGallery();
        return;
      }
      if (button.dataset.birthdayPath === "4") {
        paths.inert = true;
        birthdayMemory.enter((src) => changeScene(src, "Dos chicos se desvanecen mientras contemplan la ciudad bajo la Luna.", 3, () => {
          paths.hidden = toggle.hidden = panel.hidden = next.hidden = messageToggle.hidden = true;
          back.hidden = false;
          birthdayMemory.show();
        })).catch(() => { musicStatus.textContent = "No se ha podido cargar el recuerdo. Inténtalo de nuevo."; })
          .finally(() => { paths.inert = false; });
        return;
      }
      paths.hidden = true;
      toggle.hidden = true;
      enableMessages();
      title.textContent = `Entrada ${button.dataset.birthdayPath}`;
      copy.replaceChildren(Object.assign(document.createElement("p"), { textContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." }));
      step.textContent = "Contenido provisional";
      next.hidden = true;
      back.hidden = false;
      back.focus({ preventScroll: true });
    });
  });

  dialog.addEventListener("birthday:enter", () => {
    active = true;
    page = 0;
    moonPage = -1;
    activeScenes = moonScenes;
    showMessage();
    layout();
    lastTime = 0;
    nextBurst = 0.9;
    if (!fireworkFrame && !reducedMotion.matches) fireworkFrame = requestAnimationFrame(paintFireworks);
    revealFrame = requestAnimationFrame(() => content.classList.add("is-arrived"));
  });
  dialog.addEventListener("close", () => {
    closeMusicPanel();
    stopMusic();
    birthdayMemory.hide();
    restoreParkMusic(false);
    clearMoonExtras();
    parkAtmosphere.hide();
    parkLetter.hide();
    window.CARTA_WISHES?.closeGallery();
    moonReader.hide();
    clearThoughtTimer();
    sceneEpoch += 1;
    sceneChanging = false;
    next.disabled = back.disabled = false;
    messageToggle.disabled = false;
    [scene, panel].forEach((node) => node.getAnimations().forEach((animation) => animation.cancel()));
    moonPage = -1;
    activeScenes = moonScenes;
    image.src = homeImage;
    image.alt = homeAlt;
    scene.style.removeProperty("--birthday-scene-art");
    content.classList.remove("is-lunar");
    active = false;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(revealFrame);
    cancelAnimationFrame(layoutFrame);
    layoutFrame = 0;
    cancelAnimationFrame(fireworkFrame);
    fireworkFrame = 0;
    bursts = [];
    context?.clearRect(0, 0, artwork.width, artwork.height);
    frame = 0;
    drag = null;
    current.x = current.y = target.x = target.y = 0;
    content.classList.remove("is-arrived");
  });
  image.addEventListener("load", scheduleLayout);
  window.addEventListener("resize", scheduleLayout);
  reducedMotion.addEventListener("change", () => {
    cancelAnimationFrame(fireworkFrame);
    fireworkFrame = 0;
    lastTime = 0;
    if (reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      current.x = current.y = target.x = target.y = 0;
      if (active) draw();
      context?.clearRect(0, 0, artwork.width, artwork.height);
    } else if (active && moonPage < 0 && !document.hidden) {
      fireworkFrame = requestAnimationFrame(paintFireworks);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(fireworkFrame);
      fireworkFrame = 0;
    } else if (active && moonPage < 0 && !fireworkFrame && !reducedMotion.matches) {
      lastTime = 0;
      fireworkFrame = requestAnimationFrame(paintFireworks);
    }
  });
  content.addEventListener("pointermove", (event) => {
    if (drag && drag.id === event.pointerId) {
      move(drag.x + (event.clientX - drag.startX) / Math.max(range.x, 50),
        drag.y + (event.clientY - drag.startY) / Math.max(range.y, 50));
    } else if (event.pointerType === "mouse") {
      move((0.5 - event.clientX / innerWidth) * 2, (0.5 - event.clientY / innerHeight) * 2);
    }
  });
  content.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || event.target.closest("button, .birthday-dialogue, .birthday-paths")) return;
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: target.x, y: target.y };
    content.setPointerCapture(event.pointerId);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) {
    content.addEventListener(event, () => { drag = null; });
  }
  content.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") move(0, 0);
  });
})();
