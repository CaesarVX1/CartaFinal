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
const toggleStarsAudioButton = document.querySelector("#btn-toggle-stars-audio");
const switchStarsAudioButton = document.querySelector("#btn-switch-stars-audio");
const starsVolumeControl = document.querySelector("#stars-volume-control");
const starsVolumeButton = document.querySelector("#btn-stars-volume");
const starsVolumeRange = document.querySelector("#stars-volume-range");
const starsVolumeOutput = document.querySelector("#stars-volume-output");
const starsAudio = document.querySelector("#stars-audio");
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
const starrySky = document.querySelector("#starry-sky");
const starrySkyStars = document.querySelector(".starry-sky__stars");
const starrySkyHint = document.querySelector("#starry-sky-hint");
const starrySkyFeedback = document.querySelector("#starry-sky-feedback");
const fixedStarButtons = Array.from(document.querySelectorAll("[data-star-fragment]"));
const starFragment = document.querySelector("#star-fragment");
const starFragmentEyebrow = document.querySelector("#star-fragment-eyebrow");
const starFragmentTitle = document.querySelector("#star-fragment-title");
const starFragmentBody = document.querySelector("#star-fragment-body");
const starFragmentProgress = document.querySelector("#star-fragment-progress");
const starFragmentReturnButton = document.querySelector(".star-fragment__return");
const closeStarFragmentButtons = document.querySelectorAll("[data-close-star-fragment]");
const shootingStarTransition = document.querySelector("#shooting-star-transition");
const welcomeMenuSecretTrigger = document.querySelector("#welcome-menu-secret-trigger");
const wishAdmin = document.querySelector("#wish-admin");
const closeWishAdminButtons = document.querySelectorAll("[data-close-wish-admin]");
const wishAdminLogin = document.querySelector("#wish-admin-login");
const wishAdminPassword = document.querySelector("#wish-admin-password");
const wishAdminStatus = document.querySelector("#wish-admin-status");
const wishAdminArchive = document.querySelector("#wish-admin-archive");
const wishAdminCount = document.querySelector("#wish-admin-count");
const wishAdminList = document.querySelector("#wish-admin-list");
const wishAdminLockButton = document.querySelector("#wish-admin-lock");

let cyberArrivalPageIndex = 0;
let cyberAudioTrackIndex = 0;
let starsAudioTrackIndex = 0;
let shootingStarTimeoutId = null;
let spontaneousShootingStarTimeoutId = null;
let twinklingStarTimeoutId = null;
let starsHintShowTimeoutId = null;
let starsHintHideTimeoutId = null;
let starFeedbackTimeoutId = null;
let starFragmentTransitionTimeoutId = null;
let shootingStarCleanupTimeoutId = null;
let secretTriggerResetTimeoutId = null;
let secretTriggerClickCount = 0;
let activeStarFragmentId = null;
let lastStarTrigger = null;
let shootingUnlockNoticePending = false;
const readStarFragmentIds = new Set();
const assignedStarFragments = new Map();

const starFragments = [
  {
    id: "1",
    eyebrow: "Fragmento estelar 01",
    title: "Estrella 1",
    body: [
      "Buenos díasssss!!!!!",
      "Sé que septiembre te llega un poco de golpe con el comienzo del cole (al cual te deseo muchísimo ánimo), claustros, reuniones, y todas esas cosas que se acumulan cuando casi no da tiempo ni a asimilar una antes de que salga la siguiente",
      "Por eso para esta fecha, he querido dejarte este pequeño cielo, no porque vaya a solucionar absolutamente nada, pero sí porque quería dejarte un sitio al que pudieras entrar y vuelvas a desconectar un poco de todo.",
      "Algo parecido a cuando me dijiste que te quedaste tumbado en la cama, en blanco, escuchando la canción de la entrada anterior. Sin hacer nada... sin pensar en lo siguiente que tienes que hacer... simplemente estando ahí un rato. Y como puedes ver, esta es la primera estrella, te quedan otras tres escondidas por ahí",
      "Aunque hay una quinta que no podrás encontrar tan fácilmente como estas... esa tendrá que encontrarte a ti, ya entenderás el por qué.",
      "Por cierto, la canción que escuchas tampoco está puesta porque sí, no es la original que tenía pensado poner, pero siento que esta pega mucho más con este sitio, la conocí en la última película que vi cuando la dejé de lado para ver un ratito Los 100 contigo. Y mira que la peli era más de acción que otra cosa, pero tenía algunas escenas previas... con un final... que alguna lagrimilla consiguió sacarme. Así que nada.",
      "Bienvenido a mi intento de fabricar unas Perseidas porque las de verdad decidieron que ninguno de los dos se las merecía este año.",
    ],
  },
  {
    id: "2",
    eyebrow: "Fragmento estelar 02",
    title: "Estrella 2",
    body: [
      "¿Te acuerdas de las perseidas?",
      "Y no, no hablo de los cadáveres que salieron del Arca... aunque eso sí que fue una lluvia memorable jajaja.",
      "Hablo de las de verdad, ni tú ni yo conseguimos (técnicamente) ver una sola, y sé que te habría encantado verlas, igual que el eclipse. Y a mí también. Aunque siendo sincero tal vez me habría gustado poder verlas contigo. Pero ya volveré a eso luego, porque antes quería dejarte algo aquí para los días que te vienen.",
      "Sé que estás a tope ahora mismo, y que encima el día 12 está ahí, acercándose poco a poco. Y creo que a veces una opo puede pesar incluso más por todo lo que representa que por el examen en sí. Por eso quiero pedirte una cosa, cuando llegue ese día, aunque sea por unos segundos, intenta mirar un poco hacia atrás.",
      "Piensa en tu yo de hace cinco o seis años entrando por primera vez a la universidad. Sin saber nada de todo lo que iba a pasar después...",
      "¿Qué pensaría si pudiera verte ahora?",
      "Porque han pasado años, has estudiado, has aprendido, has sido súper rígido, has aportado en casa, te has machacado por salir adelante, te has cansado y seguramente habrás tenido momentos en los que mandar todo a la mierda te habría parecido una opción muy razonable... y, aun así, aquí estás..",
      "Has llegado al punto de presentarte a una opo para aquello que hace años estabas empezando a estudiar y no ha aparecido de la nada, hay mucho tiempo, esfuerzo, constancia... Y no sé si tú consigas verlo siempre, porque tendrás días en los que no, pero bueno, para esos días ya estoy yo aquí dando guerra para recordártelo. Confío muchísimo en tí.",
      "Y, obviamente quiero que el día 12 salga bien... muchísimo. Y no te soltaré el típico \"seguro que sale genial\", ya que ninguno de nosotros puede saberlo, y tampoco quiero decirte que si sale algo mal, no dolerá, ya que probablemente lo haga, sobre todo después de todo lo que significa para ti.",
      "Pero quiero que recuerdes que un examen puede decidir cómo salió un día concreto, no decidirá cuánto valió todo el camino que hiciste para llegar a él... no te quita lo aprendido ni borra estos años, mucho menos decide lo buen profe que puedes llegar a ser.",
      "Pero si tienes que tener miedo el día 12, tenlo, ponte nervioso, pero entra sabiendo que tienes muchos más motivos para confiar en ti de los que seguramente tu cabeza te deje recordar en ese momento... y si se te olvidan por lo Doris que eres, ya me acuerdo yo por ti.",
    ],
  },
  {
    id: "3",
    eyebrow: "Fragmento estelar 03",
    title: "Estrella 3",
    body: [
      "Las Perseidas...",
      "Aunque este cielo también esté aquí para darte un poco de calma durante estos días, la idea empezó realmente por eso.",
      "Por aquella lluvia de estrellas que ninguno de los dos consiguió ver.",
      "Me hizo gracia que los dos tuviéramos ganas y que, al final, entre nubes, horarios o lo que fuese, ninguno pudiera presumir de haber visto siquiera una.",
      "Así que, técnicamente, mi recreación tiene bastante mejor porcentaje de éxito que nosotros aquella noche...",
      "Tal vez me pasa por ser de Murcia y tener miradores a tiro de piedra, pero yo me lo imagino de una forma mucho más simple.",
      "Un sitio tranquilo. Sentados desde lo alto, mirando arriba, hablando de cualquier cosa, riéndonos y sin ninguna prisa. Porque me he dado cuenta de que hay cosas que veo, o simplemente se me ocurren, y enseguida pienso que me gustaría compartir el momento.",
      "Y no tienen por qué ser cosas enormes, perfectas ni preparadas al milímetro. Como ya te dije en su día, tú mismo conseguiste convertir un día cualquiera en un muy buen recuerdo, que será difícil de olvidar.",
      "Y supongo que después de la Luna, las estrellas, el eclipse, las Perseidas y todos los miradores que te he mencionado... puede que tenga cierta obsesión con mirar al cielo. O con estar arriba, viendo todo lo demás desde lo alto.",
      "No sé. Quizá sea porque, desde ahí arriba, los problemas parecen un poquito más pequeños. Y por otros motivos... pero bueno...",
      "el resto me lo quedo para mí.",
    ],
  },
  {
    id: "4",
    eyebrow: "Fragmento estelar 04",
    title: "Estrella 4",
    body: [
      "Última estrella.",
      "Bueno, ya has llegado hasta aquí, así que supongo que algo de curiosidad tenías. No quería que esta última fuese otro discurso enorme ni ponerme demasiado ñoño, mucho he hecho ya entre estrellas, miradores y demás.",
      "Solo quería dejarte algo sencillo. Sé que septiembre viene cargado y que vas a tener días bastante buenos, otros más pesados y alguno en el que probablemente quieras mandar todo a paseo.",
      "Así que, si alguna vez necesitas desconectar un rato, hablar de cualquier tontería, hacer videollamada, ver algo, o simplemente no pensar demasiado, cuenta conmigo.",
      "No hace falta que sea por algo importante ni que tengas una explicación preparada. A veces simplemente apetece tener a alguien cerca y ya. Y bueno, después de toda esta recreación de las Perseidas, solo queda una cosa pendiente:",
      "Ver unas de verdad algún día.",
      "Sin webs, sin estrellas programadas y, con suerte, sin nubes o contaminación lumínica.",
      "Aunque con nuestra suerte tampoco prometo nada jajaja...",
      "Ahora sí.",
      "Te queda una última estrella.",
      "Pero esa no está quieta.",
      "Mira bien el cielo.",
    ],
  },
  {
    id: "shooting",
    eyebrow: "Fragmento estelar 05",
    title: "La encontraste",
    body: [
      "¿Sabes qué toca cuando ves una estrella fugaz?",
      "Pedir un deseo. Y, después de cuatro estrellas en las que no he parado de hablar, esta quiero que sea tuya.",
      "Puedes pedir lo que quieras, algo importante, una tontería, algo que quieres que ocurra en unos años, o algo que necesites ahora",
      "No tienes que enseñármelo ni siquiera a mí. Solo escríbelo y envíaselo a las estrellas, cada vez que abras una estrella fugaz, pide un deseo.",
    ],
  },
];

if (starsAudio) {
  starsAudio.volume = 0.55;
}

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
    stopStarrySky();
    stopCyberAudio();
    stopCyberOverload();
    welcomeMenu.classList.remove("is-hidden");
    document.body.classList.add("menu-open");

    if (floatingControls) {
      floatingControls.classList.remove("is-visible", "is-cyber", "is-stars");
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
    stopStarrySky();
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

      if (button.dataset.letterTarget === "stars") {
        triggerStarryEntry();
        return;
      }

      showExperience(button.dataset.letterTarget);
      unlockMenu();
    });
  });

  fixedStarButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openOrderedStaticStarFragment(button);
    });
  });

  closeStarFragmentButtons.forEach((button) => {
    button.addEventListener("click", closeStarFragment);
  });

  closeWishAdminButtons.forEach((button) => {
    button.addEventListener("click", closeWishAdmin);
  });

  welcomeMenuSecretTrigger?.addEventListener("click", registerSecretTriggerClick);
  wishAdminLogin?.addEventListener("submit", unlockWishArchive);
  wishAdminLockButton?.addEventListener("click", lockWishArchive);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && starFragment?.classList.contains("is-visible")) {
      closeStarFragment();
      return;
    }

    if (event.key === "Escape" && wishAdmin?.classList.contains("is-visible")) {
      closeWishAdmin();
    }
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

    if (isCyber) {
      floatingControls.classList.remove("is-stars");
    }

    if (!isCyber) {
      updateCyberAudioButtonLabel();
    }
  }

  function setStarsControls(isStars) {
    if (!floatingControls) {
      return;
    }

    floatingControls.classList.toggle("is-stars", isStars);

    if (isStars) {
      floatingControls.classList.remove("is-cyber");
    } else {
      closeStarsVolumeControl();
      updateStarsAudioButtonLabel();
    }
  }

  function closeStarsVolumeControl() {
    starsVolumeControl?.classList.remove("is-open");
    starsVolumeButton?.setAttribute("aria-expanded", "false");
  }

  function updateStarsVolume(value) {
    if (!starsAudio) {
      return;
    }

    const safeValue = Math.min(Math.max(Number(value), 0), 100);
    starsAudio.volume = safeValue / 100;

    if (starsVolumeOutput) {
      starsVolumeOutput.textContent = `${safeValue}%`;
    }

    if (starsVolumeButton) {
      starsVolumeButton.textContent = `Volumen \u00b7 ${safeValue}%`;
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

  function triggerStarryEntry() {
    if (!starrySky) {
      return;
    }

    hideLockedMessages();
    resetMayoVideo();
    resetCyberSequence();
    stopCyberAudio();
    document.body.classList.remove("theme-mayo", "theme-cyber");
    document.body.classList.add("theme-stars");
    setCyberControls(false);
    setStarsControls(true);
    starrySky.classList.add("is-visible");
    starrySky.setAttribute("aria-hidden", "false");
    updateStarReadingProgress();
    unlockMenu();
    starsAudioTrackIndex = 0;
    syncStarsAudioTrack();
    startStarsAudio();
    scheduleShootingStar(1800);
    scheduleSpontaneousShootingStar(4200 + Math.random() * 4200);
    scheduleTwinklingStar(120);
    scheduleStarsHint();
  }

  function stopStarrySky() {
    if (shootingStarTimeoutId) {
      window.clearTimeout(shootingStarTimeoutId);
      shootingStarTimeoutId = null;
    }

    if (twinklingStarTimeoutId) {
      window.clearTimeout(twinklingStarTimeoutId);
      twinklingStarTimeoutId = null;
    }

    if (spontaneousShootingStarTimeoutId) {
      window.clearTimeout(spontaneousShootingStarTimeoutId);
      spontaneousShootingStarTimeoutId = null;
    }

    if (starsHintShowTimeoutId) {
      window.clearTimeout(starsHintShowTimeoutId);
      starsHintShowTimeoutId = null;
    }

    if (starsHintHideTimeoutId) {
      window.clearTimeout(starsHintHideTimeoutId);
      starsHintHideTimeoutId = null;
    }

    if (starFeedbackTimeoutId) {
      window.clearTimeout(starFeedbackTimeoutId);
      starFeedbackTimeoutId = null;
    }

    if (starFragmentTransitionTimeoutId) {
      window.clearTimeout(starFragmentTransitionTimeoutId);
      starFragmentTransitionTimeoutId = null;
    }

    if (shootingStarCleanupTimeoutId) {
      window.clearTimeout(shootingStarCleanupTimeoutId);
      shootingStarCleanupTimeoutId = null;
    }

    starrySkyHint?.classList.remove("is-visible");
    starrySkyFeedback?.classList.remove("is-visible");
    shootingStarTransition?.classList.remove("is-active");
    document.body.classList.remove("star-fragment-open");
    lastStarTrigger?.classList.remove("is-opening");
    starFragment?.classList.remove("is-visible");
    starFragment?.setAttribute("aria-hidden", "true");
    activeStarFragmentId = null;
    lastStarTrigger = null;

    if (starrySkyStars) {
      starrySkyStars.querySelectorAll(".shooting-star, .twinkle-star").forEach((star) => star.remove());
    }

    if (starrySky) {
      starrySky.classList.remove("is-visible");
      starrySky.setAttribute("aria-hidden", "true");
    }

    document.body.classList.remove("theme-stars");
    setStarsControls(false);
    stopStarsAudio();
  }

  function scheduleStarsHint() {
    if (!starrySkyHint) {
      return;
    }

    starrySkyHint.classList.remove("is-visible");
    starsHintShowTimeoutId = window.setTimeout(() => {
      if (!starrySky?.classList.contains("is-visible")) {
        return;
      }

      starrySkyHint.classList.add("is-visible");
      starsHintHideTimeoutId = window.setTimeout(() => {
        starrySkyHint.classList.remove("is-visible");
        starsHintHideTimeoutId = null;
      }, 10000);
      starsHintShowTimeoutId = null;
    }, 10000);
  }

  function openOrderedStaticStarFragment(button) {
    if (!button || starFragment?.classList.contains("is-visible") || starFragmentTransitionTimeoutId) {
      return;
    }

    let fragmentId = assignedStarFragments.get(button);

    if (!fragmentId) {
      fragmentId = String(assignedStarFragments.size + 1);
      assignedStarFragments.set(button, fragmentId);
      readStarFragmentIds.add(fragmentId);
      shootingUnlockNoticePending = fragmentId === "4";
      updateStarReadingProgress();
    }

    openStarFragment(fragmentId, button);
  }

  function openStarFragment(fragmentId, trigger) {
    if (!starFragment || starFragment.classList.contains("is-visible") || starFragmentTransitionTimeoutId) {
      return;
    }

    const fragment = starFragments.find((item) => item.id === fragmentId);

    if (!fragment) {
      return;
    }

    lastStarTrigger = trigger;
    trigger?.classList.add("is-opening");
    starrySkyHint?.classList.remove("is-visible");
    const transitionDuration = fragment.id === "shooting" ? 760 : 420;

    if (fragment.id === "shooting") {
      startShootingStarTransition(trigger);
    }

    starFragmentTransitionTimeoutId = window.setTimeout(() => {
      trigger?.classList.remove("is-opening");
      activeStarFragmentId = fragment.id;
      starFragmentEyebrow.textContent = fragment.eyebrow;
      starFragmentTitle.textContent = fragment.title;
      renderStarFragmentBody(fragment);
      updateStarReadingProgress();
      starFragment.classList.add("is-visible");
      starFragment.setAttribute("aria-hidden", "false");
      document.body.classList.add("star-fragment-open");
      starFragment.querySelector(".star-fragment__close")?.focus();
      starFragmentTransitionTimeoutId = null;
    }, transitionDuration);
  }

  function startShootingStarTransition(trigger) {
    if (!shootingStarTransition || !trigger) {
      return;
    }

    const triggerBounds = trigger.getBoundingClientRect();
    shootingStarTransition.style.setProperty(
      "--portal-x",
      `${triggerBounds.left + triggerBounds.width / 2}px`,
    );
    shootingStarTransition.style.setProperty(
      "--portal-y",
      `${triggerBounds.top + triggerBounds.height / 2}px`,
    );
    shootingStarTransition.classList.remove("is-active");
    void shootingStarTransition.offsetWidth;
    shootingStarTransition.classList.add("is-active");

    shootingStarCleanupTimeoutId = window.setTimeout(() => {
      shootingStarTransition.classList.remove("is-active");
      trigger.remove();
      shootingStarCleanupTimeoutId = null;
    }, 1050);
  }

  function renderStarFragmentBody(fragment) {
    if (!starFragmentBody) {
      return;
    }

    starFragmentBody.replaceChildren();
    starFragmentBody.classList.toggle("star-fragment__body--wish", fragment.id === "shooting");
    starFragmentReturnButton.textContent = "Volver al cielo";
    const fragmentSheet = starFragment.querySelector(".star-fragment__sheet");
    const bodyParagraphs = Array.isArray(fragment.body) ? fragment.body : [fragment.body];
    const isLongFragment = bodyParagraphs.length > 1;

    fragmentSheet?.classList.toggle("star-fragment__sheet--wish", fragment.id === "shooting");
    fragmentSheet?.classList.toggle("star-fragment__sheet--long", isLongFragment);

    bodyParagraphs.forEach((bodyParagraph) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = bodyParagraph;
      starFragmentBody.appendChild(paragraph);
    });

    if (fragment.id !== "shooting") {
      return;
    }

    const form = document.createElement("form");
    const label = document.createElement("label");
    const textarea = document.createElement("textarea");
    const controls = document.createElement("div");
    const counter = document.createElement("span");
    const submitButton = document.createElement("button");
    const status = document.createElement("p");

    form.className = "star-wish-form";
    label.className = "star-wish-form__label";
    label.htmlFor = "star-wish-message";
    label.textContent = "Pide un deseo por esta estrella fugaz";
    textarea.id = "star-wish-message";
    textarea.name = "wish";
    textarea.rows = 4;
    textarea.maxLength = 600;
    textarea.placeholder = "Escribe aquí tu deseo...";
    textarea.required = true;
    controls.className = "star-wish-form__controls";
    counter.className = "star-wish-form__counter";
    counter.textContent = "0 / 600";
    submitButton.type = "submit";
    submitButton.textContent = "Confirmar mi deseo";
    status.className = "star-wish-form__status";
    status.setAttribute("role", "status");

    textarea.addEventListener("input", () => {
      counter.textContent = `${textarea.value.length} / 600`;
    });
    form.addEventListener("submit", (event) => submitStarWish(event, textarea, submitButton, status));

    controls.append(counter, submitButton);
    form.append(label, textarea, controls, status);
    starFragmentBody.appendChild(form);
  }

  async function submitStarWish(event, textarea, submitButton, status) {
    event.preventDefault();
    const wish = textarea.value.trim();

    if (!wish) {
      status.textContent = "Escribe primero el deseo que quieres confiarle a la estrella.";
      status.className = "star-wish-form__status is-error";
      textarea.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Guardando entre las estrellas...";
    status.textContent = "";
    status.className = "star-wish-form__status";

    try {
      await requestWishesApi({ action: "submit", wish });
      showWishConfirmation();
    } catch (error) {
      status.textContent = getWishRequestErrorMessage(error, "No se ha podido guardar el deseo. Inténtalo de nuevo.");
      status.className = "star-wish-form__status is-error";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Confirmar mi deseo";
    }
  }

  function showWishConfirmation() {
    if (!starFragmentBody || !starFragmentTitle || !starFragmentEyebrow) {
      return;
    }

    const confirmationParagraphs = [
      "Ahora se queda aquí, entre las estrellas.",
      "No sé si estas tienen mucho poder para conceder deseos... teniendo en cuenta que las he programado yo... pero espero que, sea lo que sea que hayas pedido, algún día mires atrás y te des cuenta de que terminó ocurriendo.",
      "Mientras tanto... muchísimo ánimo con todo lo que empieza ahora",
      "Con el cole, opo, y también con todas esas cosas con las que cargues que quizá no conozca",
      "Espero que te haya gustado 🫶",
    ];

    starFragmentEyebrow.textContent = "Deseo enviado";
    starFragmentTitle.textContent = "Ya está. ✦";
    starFragmentBody.replaceChildren();
    starFragmentBody.classList.remove("star-fragment__body--wish");

    confirmationParagraphs.forEach((confirmationParagraph) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = confirmationParagraph;
      starFragmentBody.appendChild(paragraph);
    });

    starFragmentProgress.textContent = "Un deseo entre las estrellas";
    starFragmentReturnButton.textContent = "Cerrar";
    starFragmentReturnButton.focus();
  }

  function registerSecretTriggerClick() {
    secretTriggerClickCount += 1;
    welcomeMenuSecretTrigger?.classList.remove("is-tapped");
    void welcomeMenuSecretTrigger?.offsetWidth;
    welcomeMenuSecretTrigger?.classList.add("is-tapped");

    if (secretTriggerResetTimeoutId) {
      window.clearTimeout(secretTriggerResetTimeoutId);
    }

    if (secretTriggerClickCount >= 10) {
      secretTriggerClickCount = 0;
      openWishAdmin();
      return;
    }

    secretTriggerResetTimeoutId = window.setTimeout(() => {
      secretTriggerClickCount = 0;
      secretTriggerResetTimeoutId = null;
    }, 20000);
  }

  function openWishAdmin() {
    if (!wishAdmin) {
      return;
    }

    if (secretTriggerResetTimeoutId) {
      window.clearTimeout(secretTriggerResetTimeoutId);
      secretTriggerResetTimeoutId = null;
    }

    lockWishArchive();
    wishAdmin.classList.add("is-visible");
    wishAdmin.setAttribute("aria-hidden", "false");
    document.body.classList.add("wish-admin-open");
    window.setTimeout(() => wishAdminPassword?.focus(), 360);
  }

  function closeWishAdmin() {
    if (!wishAdmin) {
      return;
    }

    wishAdmin.classList.remove("is-visible");
    wishAdmin.setAttribute("aria-hidden", "true");
    document.body.classList.remove("wish-admin-open");
    lockWishArchive();
    welcomeMenuSecretTrigger?.focus();
  }

  function lockWishArchive() {
    if (wishAdminLogin) {
      wishAdminLogin.hidden = false;
      wishAdminLogin.reset();
    }

    if (wishAdminArchive) {
      wishAdminArchive.hidden = true;
    }

    if (wishAdminStatus) {
      wishAdminStatus.textContent = "";
      wishAdminStatus.className = "wish-admin__status";
    }

    wishAdminList?.replaceChildren();
  }

  async function unlockWishArchive(event) {
    event.preventDefault();
    const password = wishAdminPassword?.value ?? "";
    const submitButton = wishAdminLogin?.querySelector('button[type="submit"]');

    if (!password || !submitButton || !wishAdminStatus) {
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Verificando...";
    wishAdminStatus.textContent = "";
    wishAdminStatus.className = "wish-admin__status";

    try {
      const result = await requestWishesApi({ action: "list", password });
      renderWishArchive(Array.isArray(result.wishes) ? result.wishes : []);
      wishAdminLogin.hidden = true;
      wishAdminArchive.hidden = false;
      wishAdminPassword.value = "";
    } catch (error) {
      wishAdminStatus.textContent = getWishRequestErrorMessage(error, "No se ha podido abrir el archivo.");
      wishAdminStatus.className = "wish-admin__status is-error";
      wishAdminPassword.select();
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Abrir archivo";
    }
  }

  function renderWishArchive(wishes) {
    if (!wishAdminList || !wishAdminCount) {
      return;
    }

    wishAdminList.replaceChildren();
    wishAdminCount.textContent = `${wishes.length} ${wishes.length === 1 ? "deseo guardado" : "deseos guardados"}`;

    if (wishes.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "wish-admin__empty";
      emptyMessage.textContent = "Todavía no hay ningún deseo esperando aquí.";
      wishAdminList.appendChild(emptyMessage);
      return;
    }

    const dateFormatter = new Intl.DateTimeFormat("es-ES", {
      dateStyle: "long",
      timeStyle: "short",
    });

    wishes.forEach((wish, index) => {
      const article = document.createElement("article");
      const meta = document.createElement("p");
      const message = document.createElement("p");
      const createdAt = new Date(wish.created_at);

      article.className = "wish-admin__item";
      meta.className = "wish-admin__item-meta";
      meta.textContent = `Deseo ${String(wishes.length - index).padStart(2, "0")} · ${
        Number.isNaN(createdAt.getTime()) ? "fecha desconocida" : dateFormatter.format(createdAt)
      }`;
      message.className = "wish-admin__item-message";
      message.textContent = wish.wish;
      article.append(meta, message);
      wishAdminList.appendChild(article);
    });
  }

  async function requestWishesApi(payload) {
    const endpoint = window.CARTA_CONFIG?.wishesEndpoint?.trim();

    if (!endpoint || endpoint.includes("TU-PROYECTO")) {
      const configurationError = new Error("Wishes API is not configured");
      configurationError.code = "NOT_CONFIGURED";
      throw configurationError;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const requestError = new Error(result.error || "Wishes API request failed");
      requestError.status = response.status;
      throw requestError;
    }

    return result;
  }

  function getWishRequestErrorMessage(error, fallbackMessage) {
    if (error?.code === "NOT_CONFIGURED") {
      return "Esta estrella todavía no está conectada a su archivo seguro.";
    }

    if (error?.status === 401) {
      return "La contraseña no coincide con la del archivo.";
    }

    if (error?.status === 429) {
      return "Demasiados intentos. Espera un momento antes de volver a probar.";
    }

    return fallbackMessage;
  }

  function closeStarFragment() {
    if (!starFragment?.classList.contains("is-visible")) {
      return;
    }

    const completedStaticSequence = activeStarFragmentId === "4" && shootingUnlockNoticePending;

    starFragment.classList.remove("is-visible");
    starFragment.setAttribute("aria-hidden", "true");
    document.body.classList.remove("star-fragment-open");
    updateStarReadingProgress();

    if (completedStaticSequence) {
      shootingUnlockNoticePending = false;
      showStarFeedback("La estrella fugaz ya puede ser leída.", 4200);
    }

    const triggerToRestore = lastStarTrigger;
    activeStarFragmentId = null;
    lastStarTrigger = null;

    window.setTimeout(() => {
      if (triggerToRestore?.isConnected) {
        triggerToRestore.focus();
      }
    }, 460);
  }

  function updateStarReadingProgress() {
    const readCount = readStarFragmentIds.size;
    const allStarsRead = readCount === 4;

    if (starFragmentProgress) {
      starFragmentProgress.textContent = `${readCount} / 4 estrellas leídas`;
    }

    fixedStarButtons.forEach((button) => {
      const assignedFragmentId = assignedStarFragments.get(button);
      const isAssigned = Boolean(assignedFragmentId);

      button.classList.toggle("is-read", isAssigned);
      button.toggleAttribute("data-star-assigned", isAssigned);

      if (isAssigned) {
        button.setAttribute(
          "aria-label",
          `Volver a leer la estrella ${assignedFragmentId}, leída`,
        );
      } else {
        button.setAttribute(
          "aria-label",
          `Descubrir la estrella ${Math.min(readCount + 1, 4)}. ${readCount} de 4 estrellas leídas`,
        );
      }
    });

    starrySky?.classList.toggle("all-stars-read", allStarsRead);
    document.querySelectorAll(".shooting-star--main").forEach((star) => {
      star.classList.toggle("is-unlocked", allStarsRead);
      star.setAttribute(
        "aria-label",
        allStarsRead ? "Leer la estrella fugaz" : "Estrella fugaz bloqueada",
      );
    });
  }

  function showStarFeedback(message, duration = 3400) {
    if (!starrySkyFeedback) {
      return;
    }

    if (starFeedbackTimeoutId) {
      window.clearTimeout(starFeedbackTimeoutId);
    }

    starrySkyFeedback.textContent = message;
    starrySkyFeedback.classList.add("is-visible");
    starFeedbackTimeoutId = window.setTimeout(() => {
      starrySkyFeedback.classList.remove("is-visible");
      starFeedbackTimeoutId = null;
    }, duration);
  }

  function scheduleShootingStar(delay) {
    if (!starrySky || !starrySky.classList.contains("is-visible")) {
      return;
    }

    shootingStarTimeoutId = window.setTimeout(() => {
      createShootingStar();
      scheduleShootingStar(20000);
    }, delay);
  }

  function createShootingStar() {
    if (!starrySkyStars || !starrySky?.classList.contains("is-visible")) {
      return;
    }

    const star = document.createElement("button");
    const angle = 112 + Math.random() * 12;

    star.type = "button";
    star.className = "shooting-star shooting-star--main";
    star.setAttribute(
      "aria-label",
      readStarFragmentIds.size === 4 ? "Leer la estrella fugaz" : "Estrella fugaz bloqueada",
    );

    if (readStarFragmentIds.size === 4) {
      star.classList.add("is-unlocked");
    }

    star.style.left = `${52 + Math.random() * 38}%`;
    star.style.top = `${-6 + Math.random() * 28}%`;
    star.style.setProperty("--star-angle", `${angle}deg`);
    star.style.setProperty("--star-distance", `${58 + Math.random() * 20}vw`);
    star.addEventListener("click", () => {
      if (readStarFragmentIds.size < 4) {
        showStarFeedback("Todavía no puedes leer esta estrella");
        return;
      }

      openStarFragment("shooting", star);
    });
    starrySkyStars.appendChild(star);

    star.addEventListener("animationend", () => star.remove(), { once: true });
  }

  function scheduleSpontaneousShootingStar(delay) {
    if (!starrySky || !starrySky.classList.contains("is-visible")) {
      return;
    }

    spontaneousShootingStarTimeoutId = window.setTimeout(() => {
      createSpontaneousShootingStar();
      scheduleSpontaneousShootingStar(5600 + Math.random() * 9400);
    }, delay);
  }

  function createSpontaneousShootingStar() {
    if (!starrySkyStars || !starrySky?.classList.contains("is-visible")) {
      return;
    }

    const star = document.createElement("span");
    const duration = 1800 + Math.random() * 1700;

    star.className = "shooting-star shooting-star--spontaneous";
    star.setAttribute("aria-hidden", "true");
    star.style.left = `${38 + Math.random() * 58}%`;
    star.style.top = `${-3 + Math.random() * 52}%`;
    star.style.setProperty("--star-angle", `${110 + Math.random() * 22}deg`);
    star.style.setProperty("--star-distance", `${32 + Math.random() * 24}vw`);
    star.style.setProperty("--shooting-duration", `${duration.toFixed(0)}ms`);
    starrySkyStars.appendChild(star);

    star.addEventListener("animationend", () => star.remove(), { once: true });
  }

  function scheduleTwinklingStar(delay) {
    if (!starrySky || !starrySky.classList.contains("is-visible")) {
      return;
    }

    twinklingStarTimeoutId = window.setTimeout(() => {
      const starsToCreate = Math.random() > 0.74 ? 2 : 1;

      for (let index = 0; index < starsToCreate; index += 1) {
        createTwinklingStar();
      }

      scheduleTwinklingStar(320 + Math.random() * 980);
    }, delay);
  }

  function createTwinklingStar() {
    if (!starrySkyStars || !starrySky?.classList.contains("is-visible")) {
      return;
    }

    const star = document.createElement("span");
    const size = 1 + Math.random() * 2.8;
    const duration = 1800 + Math.random() * 2600;
    const color = Math.random() > 0.72 ? "#d5e4ff" : "#f3f7ff";

    star.className = "twinkle-star";
    star.setAttribute("aria-hidden", "true");
    star.style.left = `${3 + Math.random() * 94}%`;
    star.style.top = `${3 + Math.random() * 82}%`;
    star.style.setProperty("--star-size", `${size.toFixed(2)}px`);
    star.style.setProperty("--twinkle-duration", `${duration.toFixed(0)}ms`);
    star.style.setProperty("--star-opacity", `${(0.48 + Math.random() * 0.4).toFixed(2)}`);
    star.style.setProperty("--star-color", color);
    starrySkyStars.appendChild(star);

    star.addEventListener("animationend", () => star.remove(), { once: true });
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

  function startStarsAudio() {
    if (!starsAudio) {
      return;
    }

    const playAttempt = starsAudio.play();

    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }

    updateStarsAudioButtonLabel();
  }

  function stopStarsAudio() {
    if (!starsAudio) {
      return;
    }

    starsAudio.pause();
    starsAudio.currentTime = 0;
    updateStarsAudioButtonLabel();
  }

  function updateStarsAudioButtonLabel() {
    if (!toggleStarsAudioButton || !starsAudio) {
      return;
    }

    toggleStarsAudioButton.textContent = starsAudio.paused ? "Reanudar canci\u00f3n" : "Pausar canci\u00f3n";
  }

  function getStarsAudioTrackSrc(index) {
    if (!starsAudio) {
      return "";
    }

    const primary = starsAudio.dataset.trackPrimary || "";
    const secondary = starsAudio.dataset.trackSecondary || "";
    return index === 1 ? secondary : primary;
  }

  function syncStarsAudioTrack() {
    if (!starsAudio) {
      return;
    }

    const nextSrc = getStarsAudioTrackSrc(starsAudioTrackIndex);

    if (!nextSrc || starsAudio.getAttribute("src") === nextSrc) {
      return;
    }

    starsAudio.setAttribute("src", nextSrc);
    starsAudio.load();
  }

  function switchStarsAudioTrack() {
    if (!starsAudio) {
      return;
    }

    const wasPlaying = !starsAudio.paused;
    starsAudioTrackIndex = starsAudioTrackIndex === 0 ? 1 : 0;
    syncStarsAudioTrack();

    if (wasPlaying) {
      const playAttempt = starsAudio.play();

      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    }

    const nextTrackName = starsAudioTrackIndex === 0 ? "Mesora di sole" : "In the pool";
    switchStarsAudioButton?.setAttribute("aria-label", `Cambiar canci\u00f3n a ${nextTrackName}`);
    updateStarsAudioButtonLabel();
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

  if (toggleStarsAudioButton && starsAudio) {
    toggleStarsAudioButton.addEventListener("click", () => {
      if (starsAudio.paused) {
        const playAttempt = starsAudio.play();

        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(() => {});
        }
      } else {
        starsAudio.pause();
      }

      updateStarsAudioButtonLabel();
    });
  }

  if (switchStarsAudioButton && starsAudio) {
    switchStarsAudioButton.addEventListener("click", switchStarsAudioTrack);
  }

  if (starsVolumeButton && starsVolumeControl) {
    starsVolumeButton.addEventListener("click", () => {
      const isOpen = starsVolumeControl.classList.toggle("is-open");
      starsVolumeButton.setAttribute("aria-expanded", `${isOpen}`);
    });
  }

  if (starsVolumeRange) {
    starsVolumeRange.addEventListener("input", () => {
      updateStarsVolume(starsVolumeRange.value);
    });
  }

  document.addEventListener("click", (event) => {
    if (starsVolumeControl?.contains(event.target)) {
      return;
    }

    closeStarsVolumeControl();
  });

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

  if (starsAudio) {
    starsAudio.addEventListener("pause", updateStarsAudioButtonLabel);
    starsAudio.addEventListener("play", updateStarsAudioButtonLabel);
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
