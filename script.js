const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.2,
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 120}ms`;
  revealObserver.observe(item);
});

const welcomeMenu = document.querySelector("#welcome-menu");
const letterButtons = document.querySelectorAll("[data-letter-target]");
const lockedButtons = document.querySelectorAll("[data-locked]");
const backMenuButton = document.querySelector("#btn-back-menu");
const floatingControls = document.querySelector("#floating-controls");
const toggleCyberAudioButton = document.querySelector("#btn-toggle-cyber-audio");
const switchCyberAudioButton = document.querySelector("#btn-switch-cyber-audio");
const restartCyberAudioButton = document.querySelector("#btn-restart-cyber-audio");
const cyberAudio = document.querySelector("#cyber-audio");
const cyberArrivalVideoStage = document.querySelector("#cyber-arrival-video-stage");
const cyberArrivalVideo = document.querySelector("#cyber-arrival-video");
const playArrivalVideoButton = document.querySelector("#btn-play-arrival-video");
const glitchMenuButton = document.querySelector('[data-letter-target="cyber"]');
const heroOriginal = document.querySelector("#hero-original");
const heroMayo = document.querySelector("#hero-mayo");
const heroCyber = document.querySelector("#hero-cyber");
const letterSection = document.querySelector("#carta");
const cartaOriginal = document.querySelector("#carta-original");
const cartaMayo = document.querySelector("#carta-mayo");
const cartaCyber = document.querySelector("#carta-cyber");
const letterEyebrow = document.querySelector("#letter-eyebrow");
const letterHeading = document.querySelector("#letter-heading");
const mayoVideoStage = document.querySelector("#mayo-video-stage");
const mayoVideo = document.querySelector("#mayo-video");
const playMayoVideoButton = document.querySelector("#btn-play-mayo-video");
const cyberProgressTrack = document.querySelector(".cyber-progress__track");
const cyberProgressFill = document.querySelector("#cyber-progress-fill");
const cyberProgressValue = document.querySelector("#cyber-progress-value");
const cyberTerminalStream = document.querySelector("#cyber-terminal-stream");
const cyberWarningLayer = document.querySelector("#cyber-warning-layer");
const cyberWarningHint = document.querySelector("#cyber-warning-hint");
const cyberVideoOverlay = document.querySelector("#cyber-video-overlay");
const cyberJourneyVideo = document.querySelector("#cyber-journey-video");
const cyberArrivalScreen = document.querySelector("#cyber-arrival-screen");
const cyberArrivalPages = Array.from(document.querySelectorAll("[data-arrival-page]"));
const cyberArrivalPrevButton = document.querySelector("#cyber-arrival-prev");
const cyberArrivalNextButton = document.querySelector("#cyber-arrival-next");
const cyberArrivalPageCurrent = document.querySelector("#cyber-arrival-page-current");

let cyberArrivalPageIndex = 0;
let cyberAudioTrackIndex = 0;

const cyberCommands = [
  { text: "booting ghost protocol...", type: "system" },
  { text: "$ init --channel=cyber_route --mode=stealth", type: "prompt" },
  { text: "probing overlay gateway /welcome-menu", type: "prompt" },
  { text: "0x7f:9a:31 -> mirrored handshake accepted", type: "system" },
  { text: "$ resolve --target carta-final.local --mask shadow", type: "prompt" },
  { text: "$ trace --target page-shell --depth 4", type: "prompt" },
  { text: "mirroring ambient layers into shadow buffer", type: "prompt" },
  { text: "injecting silent packet into carta-final.local", type: "prompt" },
  { text: "exec scan --surface=hero-cyber --ports=443,8080", type: "prompt" },
  { text: "render hook patched :: glitch layer online", type: "system" },
  { text: "net.map => hero-original / hero-mayo / hidden-node", type: "system" },
  { text: "bypassing front-end locks and reveal observers", type: "system" },
  { text: "$ grep -R \"hidden-route\" ./runtime/cache", type: "prompt" },
  { text: "opening tunnel to hidden route registry", type: "prompt" },
  { text: "ssh ghost@memory-node --port 2206", type: "prompt" },
  { text: "scp ./shadow.key ghost@memory-node:/tmp/.sig", type: "prompt" },
  { text: "database handshake established: memories_archive", type: "prompt" },
  { text: "SELECT * FROM entry_map WHERE visibility='private';", type: "prompt" },
  { text: "db.reply => 12 rows encrypted / 3 rows shadowed", type: "system" },
  { text: "BEGIN TRANSACTION route_patch;", type: "prompt" },
  { text: "$ mount /vault/entries --token=••••••••", type: "prompt" },
  { text: "decrypting private entry payload...", type: "system" },
  { text: "AES256 key fragment recovered :: 9f-aa-72-c1", type: "system" },
  { text: "xor --input payload.bin --keyfrag 9f-aa-72-c1", type: "prompt" },
  { text: "cat ./signals/unstable_channel.log | tail -n 5", type: "prompt" },
  { text: "watch -n 1 \"ls -la ./signals/.ghost-cache\"", type: "prompt" },
  { text: "sync hero modules --branch=cyber-fork --force", type: "prompt" },
  { text: "syncing hero modules and alternate timelines", type: "prompt" },
  { text: "PATCH /api/routes/cyber { visibility: 'warming' }", type: "prompt" },
  { text: "writing bypass patch into route manifest...", type: "system" },
  { text: "manifest.hash => 6ac1:e992:ff11:0b7a", type: "system" },
  { text: "checksum verified :: 0xAC7E-11-FF", type: "success" },
  { text: "INSERT INTO session_keys VALUES ('ghost_viewer', 'authorized');", type: "prompt" },
  { text: "$ sudo expose --entry '? ? ?' --signal unstable", type: "prompt" },
  { text: "forking live terminal viewport...", type: "system" },
  { text: "viewport sync => 60fps / neon-stream active", type: "system" },
  { text: "resolving hidden asset pointers...", type: "prompt" },
  { text: "asset pointer recovered :: /vault/routes/cyber/index.sig", type: "success" },
  { text: "hydrating command surface with runtime noise", type: "system" },
  { text: "observer bypass persisted across current thread", type: "success" },
  { text: "$ curl -X POST /gateway/handshake --data \"route=cyber\"", type: "prompt" },
  { text: "gateway response => 202 ACCEPTED / stage-two pending", type: "system" },
  { text: "elevating permissions on temporary visual channel", type: "prompt" },
  { text: "granting read access to unstable cyber channel", type: "success" },
  { text: "privilege escalation complete :: layer=interactive", type: "success" },
  { text: "stream lock acquired :: no rollback detected", type: "system" },
  { text: "privilege escalation complete :: viewer=authorized", type: "success" },
  { text: "POST /gateway/unlock { route: 'cyber', state: 'mounted' }", type: "prompt" },
  { text: "gateway token sealed :: TTL 00:15:00", type: "system" },
  { text: "route beacon transmitted to hidden registry", type: "prompt" },
  { text: "route registry updated :: hero-cyber visible", type: "success" },
  { text: "COMMIT route_patch;", type: "prompt" },
];

const cyberFinalLines = [
  { text: "autorización aceptada", type: "success" },
  { text: "bloqueo final eliminado", type: "success" },
  { text: "reconstruyendo ruta...", type: "system" },
  { text: "destino localizado", type: "success" },
  { text: "conexión establecida", type: "success" },
  { text: "progreso :: 100%", type: "success" },
];

const cyberWarningMilestones = [
  {
    threshold: 15,
    position: "top-left",
    title: "ADVERTENCIA",
    body: "CONEXIÓN INESTABLE DETECTADA. Una ruta no registrada está intentando activarse.",
    buttons: ["CONTINUAR"],
  },
  {
    threshold: 40,
    position: "top-right",
    title: "ADVERTENCIA",
    body: "RUTA OCULTA ENCONTRADA. Este acceso no estaba destinado a ser descubierto por cualquiera.",
    buttons: ["SEGUIR"],
  },
  {
    threshold: 60,
    position: "bottom-left",
    title: "ADVERTENCIA",
    body: "SEÑAL RESIDUAL IDENTIFICADA. La ruta conserva fragmentos de algo que alguien decidió proteger.",
    buttons: ["DESCIFRAR"],
  },
  {
    threshold: 80,
    position: "bottom-right",
    title: "ADVERTENCIA",
    body: "PROTOCOLO DE DESTINO COMPROMETIDO. Hay caminos que nunca estuvieron hechos para recorrerse en soledad.",
    buttons: ["CONTINUAR"],
  },
  {
    threshold: 95,
    position: "center-stage",
    title: "ADVERTENCIA",
    body: "AUTORIZACIÓN FINAL REQUERIDA. Porque quizá nunca se trató únicamente de llegar al destino... sino de con quién querías llegar.",
    buttons: ["AUTORIZAR", "ABORTAR"],
  },
];

const cyberSequenceDuration = 15000;
const cyberCommandDuration = Math.round(cyberSequenceDuration * 0.95);

let cyberSequenceIntervalId = null;
let cyberCommandTimeoutIds = [];
let cyberSequenceStartTime = 0;
let cyberPausedDuration = 0;
let cyberPauseStartedAt = 0;
let cyberLastElapsedMs = 0;
let cyberNextCommandIndex = 0;
let cyberHandledWarningThresholds = new Set();
let cyberActiveWarningThreshold = null;
let cyberFinalSequenceScheduled = false;
let cyberInterfaceMode = "terminal";

if (welcomeMenu) {
  document.body.classList.add("menu-open");

  const hideLockedMessages = () => {
    document.querySelectorAll(".welcome-menu__message.is-visible").forEach((message) => {
      message.classList.remove("is-visible");
    });
  };

  const openMenu = () => {
    hideLockedMessages();
    resetMayoVideo();
    resetCyberSequence();
    stopCyberAudio();
    stopCyberOverload();
    welcomeMenu.classList.remove("is-hidden");
    document.body.classList.add("menu-open");

    if (floatingControls) {
      floatingControls.classList.remove("is-visible", "is-cyber");
    }
  };

  const unlockMenu = ({ instant = false } = {}) => {
    hideLockedMessages();

    if (instant) {
      welcomeMenu.style.transition = "none";
      welcomeMenu.classList.add("is-hidden");
      void welcomeMenu.offsetWidth;
      welcomeMenu.style.removeProperty("transition");
    } else {
      welcomeMenu.classList.add("is-hidden");
    }

    document.body.classList.remove("menu-open");

    if (floatingControls) {
      floatingControls.classList.add("is-visible");
    }
  };

  const showExperience = (target) => {
    if (
      !heroOriginal ||
      !heroMayo ||
      !heroCyber ||
      !letterSection ||
      !cartaOriginal ||
      !cartaMayo ||
      !cartaCyber
    ) {
      return;
    }

    resetMayoVideo();
    resetCyberSequence();
    document.body.classList.remove("theme-mayo", "theme-cyber");
    letterSection.style.removeProperty("display");

    heroOriginal.style.display = "none";
    heroMayo.style.display = "none";
    heroCyber.style.display = "none";
    cartaOriginal.style.display = "none";
    cartaMayo.style.display = "none";
    cartaCyber.style.display = "none";

    if (target === "mayo") {
      document.body.classList.add("theme-mayo");
      heroMayo.style.removeProperty("display");
      cartaMayo.style.removeProperty("display");
      setLetterHeader("Carta completa", "Lo que no quería dejar sin decir.");
      setCyberControls(false);
      return;
    }

    if (target === "cyber") {
      document.body.classList.add("theme-cyber");
      heroCyber.style.removeProperty("display");
      letterSection.style.display = "none";
      setCyberControls(true);
      return;
    }

    heroOriginal.style.removeProperty("display");
    cartaOriginal.style.removeProperty("display");
    setLetterHeader("Carta completa", "Lo que no quería dejar sin decir.");
    setCyberControls(false);
  };

  letterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.letterTarget === "cyber") {
        triggerCyberEntry();
        return;
      }

      showExperience(button.dataset.letterTarget);
      unlockMenu();
    });
  });

  lockedButtons.forEach((button) => {
    const messageId = button.getAttribute("aria-describedby");
    const message = messageId ? document.querySelector(`#${messageId}`) : null;

    button.addEventListener("click", () => {
      hideLockedMessages();
      button.classList.remove("is-shaking");
      void button.offsetWidth;
      button.classList.add("is-shaking");

      if (message) {
        message.classList.add("is-visible");
      }
    });

    button.addEventListener("animationend", () => {
      button.classList.remove("is-shaking");
    });
  });

  if (backMenuButton) {
    backMenuButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      openMenu();
    });
  }

  function setCyberControls(isCyber) {
    if (!floatingControls) {
      return;
    }

    floatingControls.classList.toggle("is-cyber", isCyber);

    if (!isCyber) {
      updateCyberAudioButtonLabel();
    }
  }

  function setLetterHeader(eyebrowText, headingText) {
    if (!letterEyebrow || !letterHeading) {
      return;
    }

    letterEyebrow.textContent = eyebrowText;
    letterHeading.textContent = headingText;
  }

  function stopCyberOverload() {
    if (!welcomeMenu) {
      return;
    }

    welcomeMenu.classList.remove("is-overloading");

    if (glitchMenuButton) {
      glitchMenuButton.classList.remove("is-firing");
    }
  }

  function triggerCyberEntry() {
    if (!welcomeMenu || !glitchMenuButton) {
      return;
    }

    if (welcomeMenu.classList.contains("is-overloading")) {
      return;
    }

    hideLockedMessages();
    glitchMenuButton.classList.add("is-firing");
    welcomeMenu.classList.add("is-overloading");
    startCyberAudio();

    window.setTimeout(() => {
      stopCyberOverload();
      showExperience("cyber");
      unlockMenu({ instant: true });

      window.requestAnimationFrame(() => {
        startCyberSequence();
      });
    }, 1700);
  }

  function resetCyberSequence() {
    stopCyberSequenceInterval();

    cyberCommandTimeoutIds.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });

    cyberCommandTimeoutIds = [];
    cyberSequenceStartTime = 0;
    cyberPausedDuration = 0;
    cyberPauseStartedAt = 0;
    cyberLastElapsedMs = 0;
    cyberNextCommandIndex = 0;
    cyberHandledWarningThresholds = new Set();
    cyberActiveWarningThreshold = null;
    cyberFinalSequenceScheduled = false;
    cyberInterfaceMode = "terminal";

    if (cyberProgressFill) {
      cyberProgressFill.style.width = "0%";
    }

    if (cyberProgressValue) {
      cyberProgressValue.textContent = "0%";
    }

    if (cyberProgressTrack) {
      cyberProgressTrack.setAttribute("aria-valuenow", "0");
    }

    if (cyberTerminalStream) {
      cyberTerminalStream.classList.remove("cyber-terminal__stream--access");
      cyberTerminalStream.innerHTML = "";
      appendCyberLine("awaiting breach sequence...", "system");
    }

    if (cyberWarningLayer) {
      cyberWarningLayer.innerHTML = "";
    }

    if (cyberWarningHint) {
      cyberWarningHint.classList.remove("is-visible");
    }

    hideCyberJourneyVideo();
    hideCyberArrivalScreen();
  }

  function startCyberSequence() {
    if (!cyberTerminalStream || !cyberProgressFill || !cyberProgressValue || !cyberProgressTrack) {
      return;
    }

    resetCyberSequence();
    cyberSequenceStartTime = Date.now();
    appendCyberLine("breach sequence armed :: warning gates online", "warning");
    cyberSequenceIntervalId = window.setInterval(tickCyberSequence, 80);
  }

  function stopCyberSequenceInterval() {
    if (cyberSequenceIntervalId) {
      window.clearInterval(cyberSequenceIntervalId);
      cyberSequenceIntervalId = null;
    }
  }

  function tickCyberSequence() {
    if (!cyberProgressFill || !cyberProgressValue || !cyberProgressTrack) {
      return;
    }

    const effectiveNow = cyberActiveWarningThreshold ? cyberPauseStartedAt : Date.now();
    const elapsed = Math.min(cyberSequenceDuration, effectiveNow - cyberSequenceStartTime - cyberPausedDuration);
    const progress = (elapsed / cyberSequenceDuration) * 100;

    cyberLastElapsedMs = elapsed;
    flushCyberCommands(elapsed);

    const pendingWarning = cyberWarningMilestones.find(
      (warning) =>
        !cyberHandledWarningThresholds.has(warning.threshold) &&
        warning.threshold !== cyberActiveWarningThreshold &&
        progress >= warning.threshold
    );

    if (pendingWarning) {
      pauseCyberSequenceAt(pendingWarning);
      updateCyberProgress(pendingWarning.threshold);
      return;
    }

    updateCyberProgress(progress);

    if (progress >= 100 && !cyberFinalSequenceScheduled) {
      cyberFinalSequenceScheduled = true;
      stopCyberSequenceInterval();

      const finalSequenceStart = window.setTimeout(() => {
        cyberFinalLines.forEach((line, index) => {
          const timeoutId = window.setTimeout(() => {
            appendCyberLine(line.text, line.type);
            if (index === cyberFinalLines.length - 1) {
              const accessTimeoutId = window.setTimeout(() => {
                showCyberAccessScreen();
              }, 1200);

              cyberCommandTimeoutIds.push(accessTimeoutId);
            }
          }, index * 260);

          cyberCommandTimeoutIds.push(timeoutId);
        });
      }, 2000);

      cyberCommandTimeoutIds.push(finalSequenceStart);
    }
  }

  function flushCyberCommands(elapsed) {
    const totalCommands = cyberCommands.length;

    while (cyberNextCommandIndex < totalCommands) {
      const triggerAt = Math.round((cyberCommandDuration / totalCommands) * cyberNextCommandIndex);

      if (elapsed < triggerAt) {
        break;
      }

      appendCyberLine(cyberCommands[cyberNextCommandIndex].text, cyberCommands[cyberNextCommandIndex].type);
      cyberNextCommandIndex += 1;
    }
  }

  function updateCyberProgress(progress) {
    if (!cyberProgressFill || !cyberProgressValue || !cyberProgressTrack) {
      return;
    }

    const safeProgress = Math.max(0, Math.min(100, progress));
    const rounded = Math.round(safeProgress);

    cyberProgressFill.style.width = `${safeProgress}%`;
    cyberProgressValue.textContent = `${rounded}%`;
    cyberProgressTrack.setAttribute("aria-valuenow", `${rounded}`);
  }

  function pauseCyberSequenceAt(warning) {
    cyberActiveWarningThreshold = warning.threshold;
    cyberPauseStartedAt = Date.now();
    showCyberWarning(warning);
    appendCyberLine(`warning gate armed :: ${warning.threshold}% threshold locked`, "warning");
  }

  function resumeCyberSequenceFromWarning(threshold) {
    if (cyberActiveWarningThreshold !== threshold) {
      return;
    }

    const finishResume = () => {
      cyberHandledWarningThresholds.add(threshold);
      cyberPausedDuration += Date.now() - cyberPauseStartedAt;
      cyberPauseStartedAt = 0;
      cyberActiveWarningThreshold = null;

      if (cyberWarningLayer) {
        cyberWarningLayer.innerHTML = "";
      }

      if (cyberWarningHint) {
        cyberWarningHint.classList.remove("is-visible");
      }

      appendCyberLine(`warning gate cleared :: ${threshold}% unlocked`, "success");
      tickCyberSequence();
    };

    const activeCard = cyberWarningLayer?.querySelector(".cyber-warning-card");

    if (!activeCard) {
      finishResume();
      return;
    }

    activeCard.classList.add("is-closing");

    window.setTimeout(() => {
      finishResume();
    }, 420);
  }

  function showCyberWarning(warning) {
    if (!cyberWarningLayer) {
      return;
    }

    cyberWarningLayer.innerHTML = "";

    if (cyberWarningHint) {
      cyberWarningHint.classList.add("is-visible");
    }

    const card = document.createElement("div");
    card.className = `cyber-warning-card cyber-warning-card--${warning.position}`;

    if (warning.position === "center-stage") {
      card.style.setProperty("--warning-x", "-50%");
      card.style.setProperty("--warning-y", "-50%");
    }

    const header = document.createElement("div");
    header.className = "cyber-warning-card__header";

    const tag = document.createElement("p");
    tag.className = "cyber-warning-card__tag";
    tag.textContent = `${warning.threshold}%`;

    const title = document.createElement("h3");
    title.className = "cyber-warning-card__title";
    title.textContent = warning.title;

    const body = document.createElement("p");
    body.className = "cyber-warning-card__body";
    body.textContent = warning.body;

    const actions = document.createElement("div");
    actions.className = "cyber-warning-card__actions";

    warning.buttons.forEach((label, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cyber-warning-card__button";

      if (index > 0) {
        button.classList.add("cyber-warning-card__button--secondary");
      }

      button.textContent = label;
      button.addEventListener("click", () => {
        resumeCyberSequenceFromWarning(warning.threshold);
      });
      actions.appendChild(button);
    });

    header.appendChild(tag);
    header.appendChild(title);
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(actions);
    cyberWarningLayer.appendChild(card);
  }

  function appendCyberLine(text, type) {
    if (!cyberTerminalStream) {
      return;
    }

    cyberTerminalStream.classList.remove("cyber-terminal__stream--access");
    cyberInterfaceMode = "terminal";

    const previousCursor = cyberTerminalStream.querySelector(".cyber-terminal__cursor");

    if (previousCursor) {
      previousCursor.remove();
    }

    const line = document.createElement("p");
    line.className = "cyber-terminal__line";

    if (type === "system") {
      line.classList.add("cyber-terminal__line--system");
    }

    if (type === "success") {
      line.classList.add("cyber-terminal__line--success");
    }

    if (type === "warning") {
      line.classList.add("cyber-terminal__line--warning");
    }

    const prompt = document.createElement("span");
    prompt.className = "cyber-terminal__prompt";
    prompt.textContent = ">";

    const cursor = document.createElement("span");
    cursor.className = "cyber-terminal__cursor";
    cursor.setAttribute("aria-hidden", "true");

    line.appendChild(prompt);
    line.appendChild(document.createTextNode(text));
    line.appendChild(cursor);
    cyberTerminalStream.appendChild(line);
    cyberTerminalStream.scrollTop = cyberTerminalStream.scrollHeight;
  }

  function showCyberAccessScreen() {
    if (!cyberTerminalStream) {
      return;
    }

    cyberInterfaceMode = "access";
    cyberTerminalStream.classList.add("cyber-terminal__stream--access");
    cyberTerminalStream.innerHTML = `
      <div class="cyber-access-screen">
        <p class="cyber-access-screen__state">ACCESO CONCEDIDO</p>
        <p class="cyber-access-screen__text">
          La ruta oculta ha sido desbloqueada.
          <br>
          El destino est&aacute; preparado.
        </p>
        <p class="cyber-access-screen__question">&iquest;Deseas iniciar el viaje?</p>
        <div class="cyber-access-screen__actions">
          <button class="cyber-access-screen__button" type="button" data-cyber-action="start-journey">
            INICIAR VIAJE
          </button>
          <button
            class="cyber-access-screen__button cyber-access-screen__button--secondary"
            type="button"
            data-cyber-action="disconnect"
          >
            DESCONECTAR
          </button>
        </div>
      </div>
    `;

    const startButton = cyberTerminalStream.querySelector('[data-cyber-action="start-journey"]');
    const disconnectButton = cyberTerminalStream.querySelector('[data-cyber-action="disconnect"]');

    startButton?.addEventListener("click", () => {
      showCyberJourneySequence();
    });

    disconnectButton?.addEventListener("click", () => {
      resetCyberSequence();
      appendCyberLine("link terminated :: hidden route awaiting authorization", "warning");
    });
  }

  function showCyberJourneySequence() {
    if (!cyberTerminalStream) {
      return;
    }

    cyberInterfaceMode = "journey";
    cyberTerminalStream.classList.remove("cyber-terminal__stream--access");
    cyberTerminalStream.innerHTML = "";

    const journeyLines = [
      { text: "iniciando protocolo de viaje...", type: "success" },
      { text: "verificando destino...", type: "system" },
      { text: "comprobando pasajeros...", type: "prompt" },
      { text: "1/2", type: "system" },
      { text: "segundo pasajero requerido...", type: "warning" },
    ];

    journeyLines.forEach((line, index) => {
      const timeoutId = window.setTimeout(() => {
        appendCyberLine(line.text, line.type);

        if (index === journeyLines.length - 1) {
          const promptTimeoutId = window.setTimeout(() => {
            showCyberJourneyPrompt();
          }, 900);

          cyberCommandTimeoutIds.push(promptTimeoutId);
        }
      }, index * 420);

      cyberCommandTimeoutIds.push(timeoutId);
    });
  }

  function showCyberJourneyPrompt() {
    if (!cyberTerminalStream) {
      return;
    }

    const question = document.createElement("p");
    question.className = "cyber-access-screen__question";
    question.textContent = "¿Vienes conmigo?";

    const actions = document.createElement("div");
    actions.className = "cyber-access-screen__actions";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "cyber-access-screen__button";
    button.textContent = "IR JUNTOS";
    button.addEventListener("click", () => {
      showCyberJourneyVideo();
    });

    actions.appendChild(button);
    cyberTerminalStream.appendChild(question);
    cyberTerminalStream.appendChild(actions);
    cyberTerminalStream.scrollTop = cyberTerminalStream.scrollHeight;
  }

  function showCyberJourneyVideo() {
    if (!cyberVideoOverlay || !cyberJourneyVideo) {
      return;
    }

    hideCyberArrivalScreen();
    cyberVideoOverlay.classList.remove("is-blackout");
    cyberVideoOverlay.classList.add("is-visible");
    cyberVideoOverlay.setAttribute("aria-hidden", "false");
    cyberJourneyVideo.currentTime = 0;

    const playAttempt = cyberJourneyVideo.play();

    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  }

  function hideCyberJourneyVideo() {
    if (!cyberVideoOverlay || !cyberJourneyVideo) {
      return;
    }

    cyberVideoOverlay.classList.remove("is-blackout");
    cyberVideoOverlay.classList.remove("is-visible");
    cyberVideoOverlay.setAttribute("aria-hidden", "true");
    cyberJourneyVideo.pause();
    cyberJourneyVideo.currentTime = 0;
  }

  function showCyberArrivalScreen() {
    if (!cyberArrivalScreen) {
      return;
    }

    setCyberArrivalPage(0);
    cyberArrivalScreen.classList.add("is-visible");
    cyberArrivalScreen.setAttribute("aria-hidden", "false");
  }

  function hideCyberArrivalScreen() {
    if (!cyberArrivalScreen) {
      return;
    }

    cyberArrivalScreen.classList.remove("is-visible");
    cyberArrivalScreen.setAttribute("aria-hidden", "true");
    setCyberArrivalPage(0);
  }

  function setCyberArrivalPage(index) {
    if (!cyberArrivalPages.length) {
      return;
    }

    resetCyberArrivalVideo();
    cyberArrivalPageIndex = Math.min(Math.max(index, 0), cyberArrivalPages.length - 1);

    cyberArrivalPages.forEach((page, pageIndex) => {
      const isActive = pageIndex === cyberArrivalPageIndex;
      page.classList.toggle("is-active", isActive);
      page.hidden = !isActive;

      if (!isActive) {
        page.scrollTop = 0;
      }
    });

    cyberArrivalPages[cyberArrivalPageIndex].scrollTop = 0;

    if (cyberArrivalPageCurrent) {
      cyberArrivalPageCurrent.textContent = String(cyberArrivalPageIndex + 1).padStart(2, "0");
    }

    if (cyberArrivalPrevButton) {
      cyberArrivalPrevButton.disabled = cyberArrivalPageIndex === 0;
    }

    if (cyberArrivalNextButton) {
      cyberArrivalNextButton.disabled = cyberArrivalPageIndex === cyberArrivalPages.length - 1;
    }
  }

  function resetCyberArrivalVideo() {
    if (!cyberArrivalVideo || !cyberArrivalVideoStage) {
      return;
    }

    cyberArrivalVideo.pause();
    cyberArrivalVideo.currentTime = 0;
    cyberArrivalVideoStage.classList.remove("is-playing");
  }

  function resetMayoVideo() {
    if (!mayoVideo || !mayoVideoStage) {
      return;
    }

    mayoVideo.pause();
    mayoVideo.currentTime = 0;
    mayoVideoStage.classList.remove("is-playing");
  }

  function startCyberAudio() {
    if (!cyberAudio) {
      return;
    }

    const playAttempt = cyberAudio.play();

    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }

    updateCyberAudioButtonLabel();
  }

  function stopCyberAudio() {
    if (!cyberAudio) {
      return;
    }

    cyberAudio.pause();
    cyberAudio.currentTime = 0;
    updateCyberAudioButtonLabel();
  }

  function updateCyberAudioButtonLabel() {
    if (!toggleCyberAudioButton || !cyberAudio) {
      return;
    }

    toggleCyberAudioButton.textContent = cyberAudio.paused ? "Reanudar canci\u00f3n" : "Pausar canci\u00f3n";
  }

  function getCyberAudioTrackSrc(index) {
    if (!cyberAudio) {
      return "";
    }

    const primary = cyberAudio.dataset.trackPrimary || "";
    const secondary = cyberAudio.dataset.trackSecondary || "";
    return index === 1 ? secondary : primary;
  }

  function syncCyberAudioTrack() {
    if (!cyberAudio) {
      return;
    }

    const nextSrc = getCyberAudioTrackSrc(cyberAudioTrackIndex);

    if (!nextSrc || cyberAudio.getAttribute("src") === nextSrc) {
      return;
    }

    cyberAudio.setAttribute("src", nextSrc);
    cyberAudio.load();
  }

  async function switchCyberAudioTrack() {
    if (!cyberAudio) {
      return;
    }

    const wasPlaying = !cyberAudio.paused;
    cyberAudioTrackIndex = cyberAudioTrackIndex === 0 ? 1 : 0;
    syncCyberAudioTrack();

    if (wasPlaying) {
      const playAttempt = cyberAudio.play();

      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    }

    updateCyberAudioButtonLabel();
  }

  if (playMayoVideoButton && mayoVideo && mayoVideoStage) {
    playMayoVideoButton.addEventListener("click", async () => {
      mayoVideoStage.classList.add("is-playing");

      try {
        await mayoVideo.play();
      } catch (error) {
        mayoVideoStage.classList.remove("is-playing");
      }
    });
  }

  if (toggleCyberAudioButton && cyberAudio) {
    toggleCyberAudioButton.addEventListener("click", async () => {
      if (cyberAudio.paused) {
        const playAttempt = cyberAudio.play();

        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(() => {});
        }
      } else {
        cyberAudio.pause();
      }

      updateCyberAudioButtonLabel();
    });
  }

  if (switchCyberAudioButton && cyberAudio) {
    switchCyberAudioButton.addEventListener("click", () => {
      switchCyberAudioTrack();
    });
  }

  if (restartCyberAudioButton && cyberAudio) {
    restartCyberAudioButton.addEventListener("click", async () => {
      cyberAudio.currentTime = 0;

      const playAttempt = cyberAudio.play();

      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }

      updateCyberAudioButtonLabel();
    });
  }

  if (cyberAudio) {
    cyberAudio.addEventListener("pause", updateCyberAudioButtonLabel);
    cyberAudio.addEventListener("play", updateCyberAudioButtonLabel);
  }

  if (playArrivalVideoButton && cyberArrivalVideo && cyberArrivalVideoStage) {
    playArrivalVideoButton.addEventListener("click", async () => {
      cyberArrivalVideoStage.classList.add("is-playing");

      try {
        await cyberArrivalVideo.play();
      } catch (error) {
        cyberArrivalVideoStage.classList.remove("is-playing");
      }
    });
  }

  if (cyberArrivalVideo) {
    cyberArrivalVideo.addEventListener("ended", resetCyberArrivalVideo);
  }

  if (cyberArrivalPrevButton) {
    cyberArrivalPrevButton.addEventListener("click", () => {
      setCyberArrivalPage(cyberArrivalPageIndex - 1);
    });
  }

  if (cyberArrivalNextButton) {
    cyberArrivalNextButton.addEventListener("click", () => {
      setCyberArrivalPage(cyberArrivalPageIndex + 1);
    });
  }

  if (cyberJourneyVideo) {
    cyberJourneyVideo.addEventListener("ended", () => {
      cyberJourneyVideo.pause();
      cyberJourneyVideo.currentTime = 0;
      cyberVideoOverlay.classList.add("is-blackout");

      const arrivalTimeoutId = window.setTimeout(() => {
        showCyberArrivalScreen();
        hideCyberJourneyVideo();
      }, 750);

      cyberCommandTimeoutIds.push(arrivalTimeoutId);
    });
  }

  resetCyberSequence();
  setCyberArrivalPage(0);
  syncCyberAudioTrack();
  updateCyberAudioButtonLabel();
}
