(() => {
  window.createBirthdayMemory = (content, scene, image, reducedMotion) => {
    const base = "./Entrada Cumpleaños/Parte 4/Parte 1.png";
    const reference = "./Entrada Cumpleaños/Parte 4/Parte 2.png";
    const reader = createMemoryReader();
    const world = document.createElement("div");
    world.className = "birthday-memory";
    world.hidden = true;
    const outlines = [
      "450,548 470,527 490,526 506,544 508,577 491,608 483,645 483,789 480,850 469,900 431,918 362,916 334,892 324,855 328,807 354,782 360,719 369,658 384,624 412,610 440,609 454,595",
      "489,473 507,452 531,449 546,462 553,489 550,539 538,571 542,581 583,600 600,626 608,688 611,750 616,789 639,788 651,818 646,861 629,890 602,912 549,922 496,910 479,881 480,825 481,735 478,664 480,630 490,605 503,584 503,574 490,552 486,525",
    ];
    const people = outlines.map((points, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "birthday-memory__person";
      button.setAttribute("aria-label", `Leer el recuerdo del chico de la ${index === 0 ? "izquierda" : "derecha"}`);
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-pressed", "false");
      button.style.clipPath = `polygon(${points.split(" ").map((pair) => pair.split(",").map((n) => `${Number(n) / 10}%`).join(" ")).join(",")})`;
      const picture = document.createElement("img");
      picture.src = reference;
      picture.alt = "";
      picture.draggable = false;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none"><filter id="soft"><feGaussianBlur stdDeviation="4"/></filter><polygon points="${points}" fill="white" filter="url(#soft)"/></svg>`;
      picture.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
      picture.style.webkitMaskImage = picture.style.maskImage;
      button.append(picture);
      button.addEventListener("click", (event) => {
        if (world.hidden || busy) return;
        people.forEach((person) => person.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        reader.open(index);
      });
      world.append(button);
      return button;
    });
    const blink = document.createElement("div");
    blink.className = "birthday-memory-blink";
    blink.setAttribute("aria-hidden", "true");
    blink.hidden = true;
    content.append(world, blink);
    let epoch = 0;
    let busy = false;
    let animation = null;
    let ready = null;
    const fireworks = document.createElement("canvas");
    fireworks.className = "birthday-memory-fireworks";
    fireworks.setAttribute("aria-hidden", "true");
    fireworks.hidden = true;
    scene.append(fireworks);
    const brush = fireworks.getContext?.("2d");
    let fireworkFrame = 0, lastTime = 0, nextLaunch = 1.5;
    let bursts = [];
    let nextPortrait = 15, portraitActive = false;
    // Portrait effects are retired; keep only spark-based fireworks active.
    const portraits = [];
    const portraitTextures = new Map();
    const silhouettePoints = outlines.map((points) => points.split(" ").map((pair) => pair.split(",").map(Number)));
    let portraitBag = [], lastPortrait = -1;
    const colors = ["238,199,121", "131,228,222", "236,151,204", "193,213,255"];
    const glows = new Map();
    function glowSprite(color) {
      if (!glows.has(color)) {
        const sprite = document.createElement("canvas");
        sprite.width = sprite.height = 64;
        const ctx = sprite.getContext("2d");
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(255,251,231,1)");
        gradient.addColorStop(0.1, `rgba(${color},0.9)`);
        gradient.addColorStop(0.35, `rgba(${color},0.2)`);
        gradient.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        glows.set(color, sprite);
      }
      return glows.get(color);
    }

    function takePortrait() {
      if (!portraitBag.length) {
        portraitBag = portraits.map((_, index) => index);
        for (let i = portraitBag.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [portraitBag[i], portraitBag[j]] = [portraitBag[j], portraitBag[i]];
        }
        const end = portraitBag.length - 1;
        if (end > 0 && portraitBag[end] === lastPortrait) [portraitBag[0], portraitBag[end]] = [portraitBag[end], portraitBag[0]];
      }
      lastPortrait = portraitBag.pop();
      return portraits[lastPortrait];
    }

    function makeBurst(special = false) {
      const shaped = Math.random() < 0.35;
      const shapes = ["heart", "star", "crescent", "infinity", "diamond", "flower", "ring"];
      const shape = special ? "portrait" : shaped ? shapes[Math.floor(Math.random() * shapes.length)] : "classic";
      const color = colors[Math.floor(Math.random() * colors.length)];
      const portrait = special ? takePortrait() : null;
      const drawing = portrait?.points;
      const count = drawing ? 24 : 64;
      return { age: 0, special, portrait: portrait?.name, x: special ? 0.5 : 0.35 + Math.random() * 0.3, y: special ? 0.21 : 0.16 + Math.random() * 0.1,
        color, face: portraitTextures.get(portrait?.name), sprite: glowSprite(color), launchY: 0.7 + Math.random() * 0.08,
        launchDrift: (Math.random() - 0.5) * 0.14, radius: special ? 0.19 : 0.1 + Math.random() * 0.035,
        particles: Array.from({ length: count }, (_, index) => {
          const angle = index / count * Math.PI * 2;
          let x, y;
          if (special) {
            [x, y] = drawing[Math.floor(index * drawing.length / count)];
          } else if (shape === "heart") {
            x = Math.pow(Math.sin(angle), 3);
            y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) / 16;
          } else if (shape === "star") {
            const edge = index / count * 10, vertex = Math.floor(edge), blend = edge - vertex;
            const a = vertex * Math.PI / 5 - Math.PI / 2, b = a + Math.PI / 5;
            const ra = vertex % 2 ? 0.43 : 1, rb = vertex % 2 ? 1 : 0.43;
            x = Math.cos(a) * ra * (1 - blend) + Math.cos(b) * rb * blend;
            y = Math.sin(a) * ra * (1 - blend) + Math.sin(b) * rb * blend;
          } else if (shape === "crescent") {
            const inner = index >= count / 2;
            const arc = (index % (count / 2)) / (count / 2) * Math.PI;
            x = (inner ? 0.35 : 0) - Math.sin(arc) * (inner ? 0.72 : 1);
            y = Math.cos(arc);
          } else if (shape === "infinity") {
            x = Math.cos(angle); y = Math.sin(angle * 2) * 0.48;
          } else if (shape === "diamond") {
            x = Math.cos(angle) / (Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle)));
            y = Math.sin(angle) / (Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle)));
          } else if (shape === "flower") {
            const r = 0.7 + Math.cos(angle * 5) * 0.3;
            x = Math.cos(angle) * r; y = Math.sin(angle) * r;
          } else if (shape === "ring") {
            x = Math.cos(angle); y = Math.sin(angle) * 0.55;
          } else {
            const speed = 0.4 + Math.random() * 0.6;
            x = Math.cos(angle) * speed; y = Math.sin(angle) * speed;
          }
          const tint = special ? "237,224,185" : color;
          return { x, y, color: tint, sprite: glowSprite(tint), life: special ? 7 + Math.random() * 2 : 4.2 + Math.random() * 1.8, phase: Math.random() * 6.28 };
        }) };
    }

    function launchFireworks(dt) {
      nextLaunch -= dt;
      if (nextLaunch <= 0 && bursts.filter((burst) => !burst.special).length < 2) {
        bursts.push(makeBurst());
        nextLaunch = 5 + Math.random() * 1.5;
      }
      if (!portraitActive && portraits.length) {
        nextPortrait -= dt;
        if (nextPortrait <= 0) { bursts.push(makeBurst(true)); portraitActive = true; }
      }
    }

    function pruneFireworks() {
      bursts = bursts.filter((burst) => burst.age < (burst.special ? 11.2 : 8.2));
      if (portraitActive && !bursts.some((burst) => burst.special)) {
        portraitActive = false;
        nextPortrait = 15;
      }
    }

    function stopFireworks() {
      cancelAnimationFrame(fireworkFrame);
      fireworkFrame = 0;
      lastTime = 0;
    }

    async function preparePortraits() {
      if (!brush || !portraits.length || portraitTextures.size) return;
      const atlas = new Image();
      atlas.src = "./assets/the100-portrait-guide.png";
      await atlas.decode();
      const cell = atlas.naturalWidth / 3;
      for (let i = 0; i < portraits.length; i += 1) {
        const sharp = document.createElement("canvas");
        sharp.width = sharp.height = window.innerWidth < 600 ? 320 : 448;
        const ctx = sharp.getContext("2d");
        ctx.filter = "contrast(1.35) brightness(1.15)";
        ctx.drawImage(atlas, i * cell, 0, cell, atlas.naturalHeight, 0, 0, sharp.width, sharp.height);
        const glow = document.createElement("canvas");
        glow.width = glow.height = sharp.width;
        const glowContext = glow.getContext("2d");
        glowContext.filter = "blur(2px)";
        glowContext.drawImage(sharp, 0, 0);
        portraitTextures.set(portraits[i].name, { sharp, glow });
      }
    }

    function drawPortrait(burst, t, w, h) {
      if (!burst.face || t >= 9) return;
      const unit = Math.min(w, h);
      const size = unit * 0.44 * (1 - Math.exp(-t * 1.4));
      const x = burst.x * w - size / 2;
      const y = burst.y * h - size / 2 + t * t * unit * 0.00035;
      const fade = Math.pow(Math.max(0, 1 - t / 9), 1.1);
      // Full facial detail is baked once: three texture draws replace 850 particle loops.
      brush.globalAlpha = fade * 0.24;
      brush.drawImage(burst.face.glow, x - 2, y - 2, size + 4, size + 4);
      brush.globalAlpha = fade * 0.12;
      brush.drawImage(burst.face.glow, x, y + unit * 0.007, size, size);
      brush.globalAlpha = fade * (0.84 + Math.sin(t * 2.2) * 0.04);
      brush.drawImage(burst.face.sharp, x, y, size, size);
      brush.globalAlpha = 1;
    }

    function paintFireworks(now) {
      fireworkFrame = 0;
      if (world.hidden || document.hidden || reducedMotion.matches || !brush) return;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime = now;
      const w = fireworks.width, h = fireworks.height, unit = Math.min(w, h);
      brush.clearRect(0, 0, w, h);
      brush.save();
      // Keep the launch trails behind the two silhouettes, not painted over them.
      brush.beginPath(); brush.rect(0, 0, w, h);
      silhouettePoints.forEach((points) => {
        points.forEach(([x, y], index) => {
          if (index === 0) brush.moveTo(x * w / 1000, y * h / 1000);
          else brush.lineTo(x * w / 1000, y * h / 1000);
        });
        brush.closePath();
      });
      brush.clip("evenodd");
      brush.globalCompositeOperation = "lighter";
      launchFireworks(dt);
      for (const burst of bursts) {
        burst.age += dt;
        const t = burst.age - 2.1, ox = burst.x * w, oy = burst.y * h;
        brush.lineWidth = Math.max(0.7, unit / 850);
        if (t < 0) {
          const progress = burst.age / 2.1;
          const ascent = 1 - Math.pow(1 - progress, 1.6);
          const tailProgress = Math.max(0, progress - 0.16);
          const tailAscent = 1 - Math.pow(1 - tailProgress, 1.6);
          const x = ox + burst.launchDrift * w * (1 - ascent);
          const y = oy + (burst.launchY * h - oy) * (1 - ascent);
          const tx = ox + burst.launchDrift * w * (1 - tailAscent);
          const ty = oy + (burst.launchY * h - oy) * (1 - tailAscent);
          const trail = brush.createLinearGradient(x, y, tx, ty + 1);
          trail.addColorStop(0, `rgba(${burst.color},0.95)`);
          trail.addColorStop(0.4, `rgba(${burst.color},0.45)`);
          trail.addColorStop(1, `rgba(${burst.color},0)`);
          brush.strokeStyle = trail;
          brush.lineWidth = Math.max(1.2, unit / 550);
          brush.beginPath(); brush.moveTo(x, y); brush.lineTo(tx, ty); brush.stroke();
          const glow = Math.max(7, unit * 0.018);
          brush.drawImage(burst.sprite, x - glow, y - glow, glow * 2, glow * 2);
          continue;
        }
        if (t < 0.55) {
          const halo = unit * (0.05 + t * 0.13);
          brush.globalAlpha = (1 - t / 0.55) * 0.25;
          brush.drawImage(burst.sprite, ox - halo, oy - halo, halo * 2, halo * 2);
          brush.globalAlpha = 1;
        }
        if (burst.special) drawPortrait(burst, t, w, h);
        const travel = (1 - Math.exp(-t * 0.75)) * unit * burst.radius;
        const tailTime = Math.max(0, t - 0.28);
        const tailTravel = (1 - Math.exp(-tailTime * 0.75)) * unit * burst.radius;
        const gravity = burst.special ? 0.00035 : 0.0017;
        for (const particle of burst.particles) {
          if (t >= particle.life) continue;
          const fade = Math.pow(1 - t / particle.life, 1.3);
          const drop = t * t * unit * gravity;
          const x = ox + particle.x * travel, y = oy + particle.y * travel + drop;
          brush.strokeStyle = `rgba(${particle.color},${fade * 0.65})`;
          brush.beginPath();
          brush.moveTo(ox + particle.x * tailTravel, oy + particle.y * tailTravel + tailTime * tailTime * unit * gravity);
          brush.lineTo(x, y); brush.stroke();
          const glow = Math.max(3, unit * 0.006);
          brush.globalAlpha = fade * 0.85;
          brush.drawImage(particle.sprite, x - glow, y - glow, glow * 2, glow * 2);
          brush.globalAlpha = 1;
          brush.fillStyle = `rgba(${particle.color},${fade * (0.7 + Math.sin(t * 4 + particle.phase) * 0.15)})`;
          brush.beginPath(); brush.arc(x, y, Math.max(0.8, unit / 700), 0, Math.PI * 2); brush.fill();
        }
      }
      brush.restore();
      pruneFireworks();
      fireworkFrame = requestAnimationFrame(paintFireworks);
    }
    function startFireworks() {
      stopFireworks();
      if (!world.hidden && !document.hidden && !reducedMotion.matches && brush) fireworkFrame = requestAnimationFrame(paintFireworks);
    }
    document.addEventListener("visibilitychange", startFireworks);
    reducedMotion.addEventListener("change", () => {
      brush?.clearRect(0, 0, fireworks.width, fireworks.height);
      startFireworks();
    });
    function preload() {
      if (!ready) ready = Promise.all([preparePortraits(), ...[base, reference].map((src) => {
        const img = new Image(); img.src = src; return img.decode();
      })]).catch((error) => { ready = null; throw error; });
      return ready;
    }
    function sync() {
      if (world.hidden) return;
      world.style.width = image.style.width;
      world.style.height = image.style.height;
      world.style.transform = image.style.transform;
      fireworks.style.width = image.style.width;
      fireworks.style.height = image.style.height;
      fireworks.style.transform = image.style.transform;
      const w = Math.min(window.innerWidth < 600 ? 900 : 1100, Math.round(parseFloat(image.style.width)));
      const h = Math.round(w * parseFloat(image.style.height) / parseFloat(image.style.width));
      if (w > 0 && h > 0 && (fireworks.width !== w || fireworks.height !== h)) { fireworks.width = w; fireworks.height = h; }
    }
    function hide() {
      reader.close();
      stopFireworks();
      bursts = [];
      nextLaunch = 1.5;
      nextPortrait = 15;
      portraitActive = false;
      fireworks.hidden = true;
      epoch += 1;
      busy = false;
      animation?.cancel();
      blink.hidden = world.hidden = true;
      people.forEach((person) => person.setAttribute("aria-pressed", "false"));
    }
    async function enter(swap) {
      if (busy) return;
      busy = true;
      const run = ++epoch;
      try {
        await preload();
        if (run !== epoch) return;
        blink.hidden = false;
        const frames = reducedMotion.matches ? [{ opacity: 1 }, { opacity: 1 }] : [
          { opacity: 0, offset: 0, easing: "ease-in-out" },
          { opacity: 0.88, offset: 0.18, easing: "ease-in-out" },
          { opacity: 0.08, offset: 0.36, easing: "ease-in-out" },
          { opacity: 1, offset: 0.5 },
          { opacity: 1, offset: 0.8, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" },
          { opacity: 0, offset: 1 },
        ];
        animation = blink.animate(frames, { duration: reducedMotion.matches ? 1600 : 5000, fill: "both", easing: "linear" });
        const finish = animation.finished.catch(() => {});
        if (!reducedMotion.matches) await new Promise((resolve) => setTimeout(resolve, 2500));
        if (run !== epoch) return;
        await swap(base);
        await finish;
      } finally {
        if (run === epoch) { animation?.cancel(); blink.hidden = true; busy = false; }
      }
    }
    function createMemoryReader() {
      const dialog = document.createElement("dialog");
      dialog.className = "memory-reader";
      dialog.setAttribute("aria-labelledby", "memory-reader-title");
      const header = document.createElement("header");
      const title = document.createElement("h2");
      title.id = "memory-reader-title";
      const close = document.createElement("button");
      close.type = "button"; close.textContent = "Cerrar";
      header.append(title, close);
      const body = document.createElement("div");
      body.className = "memory-reader__body";
      body.tabIndex = 0;
      const text = document.createElement("p");
      const memories = [
        [
          "¿Te acuerdas del primer regalo que te hice? Apenas tuve tiempo, no sabía ni qué prepararte y casi no te conocía todavía... pero me hizo ilusión hacerte aquel dibujo y esperar hasta la noche para hablarte y dártelo.",
          "Me encantó la ilusión que te hizo en su día. Es uno de esos momentos pequeños que se me quedaron guardados.",
          "Me dio muchísima vergüenza hacértelo y todavía más dártelo, pero valió la pena. Valió la pena aquel paso y cada mensaje que he compartido contigo desde entonces hasta el día de hoy.",
          "Y aunque este no sea el original, porque aquel se inundó en su día, quería que pudieras tener este recuerdo de vuelta. Espero que volver a verlo te saque una sonrisa, como la que me sacaste tú cuando te lo di.",
        ].join("\n\n"),
        [
          "Aquí estabas celebrando tu 19.º cumpleaños con tus amigas. No sé si tendrás esta foto o si te acordarás de ese instante, pero me hacía ilusión devolverte también un pedacito de aquel día.",
          "Cuando conseguí contactar con tu amiga para preparar la entrada anterior, la del mensaje de tus amigas de la uni, aproveché para pedirle algo más: alguna foto que creyera que quizá tú no tuvieras, o un momento bonito que pudieras haber olvidado.",
          "Y apareció esta. Después de todo lo bonito que ha salido de aquello, no me arrepiento de haberme peleado día y noche por conseguir contactar con ella jajaja. Me alegra muchísimo haberlo intentado y que todo haya ido tan bien.",
          "Quería que aquí no solo encontraras cosas que he preparado yo, sino también recuerdos que ya eran tuyos y que merecían volver a encontrarte.",
        ].join("\n\n"),
      ];
      const photo = document.createElement("img");
      photo.className = "memory-reader__photo";
      photo.decoding = "async";
      photo.hidden = true;
      body.append(text, photo);
      const footer = document.createElement("footer");
      const next = document.createElement("button");
      next.type = "button"; next.textContent = "Siguiente";
      footer.append(next);
      dialog.append(header, body, footer);
      document.body.append(dialog);
      let viewingPhoto = false;
      let currentPerson = -1;
      let suppressFinal = false;
      let finalShown = false;
      const viewed = new Set();
      const finale = document.createElement("dialog");
      finale.className = "memory-reader memory-reader--final";
      finale.setAttribute("aria-labelledby", "memory-finale-title");
      const finalHeader = document.createElement("header");
      const finalTitle = document.createElement("h2");
      finalTitle.id = "memory-finale-title";
      finalTitle.textContent = "¡¡¡Feliz cumpleaños, Josemiii!!! ❤️ 🫶";
      finalHeader.append(finalTitle);
      const finalBody = document.createElement("div");
      finalBody.className = "memory-reader__body";
      finalBody.tabIndex = 0;
      for (const message of [
        "Has llegado al final del recorrido. Gracias por detenerte en cada lugar y descubrir los recuerdos que había guardado para ti.",
        "Ahora solo queda desearte un día precioso: que te rías, que disfrutes de tu gente y que hoy te dejes querer un poquito más. Te mereces todo esto y mucho más.",
        "Aún queda un regalo fuera de esta web, de esos que me gustaría entregarte en persona. Pero eso será otro momento; hoy el protagonista eres tú.",
        "Me alegro muchísimo de haberte conocido y de todo lo que hemos compartido desde aquel primer dibujo. Te quiero muchísimo, guapo. ❤️",
        "¡Disfruta de tu día! Luego nos vemos. 🫶",
        "César.",
      ]) {
        const paragraph = document.createElement("p");
        paragraph.textContent = message;
        finalBody.append(paragraph);
      }
      const finalFooter = document.createElement("footer");
      const finalClose = document.createElement("button");
      finalClose.type = "button";
      finalClose.textContent = "Volver a las vistas";
      finalFooter.append(finalClose);
      finale.append(finalHeader, finalBody, finalFooter);
      document.body.append(finale);
      const reopen = document.createElement("button");
      reopen.type = "button";
      reopen.className = "anniversary-destination__back memory-finale-reopen";
      reopen.textContent = "Volver a leer la felicitación";
      reopen.hidden = true;
      (content.querySelector?.(".birthday-controls") || content).append(reopen);
      const exploreHint = document.createElement("p");
      exploreHint.className = "memory-explore-hint";
      exploreHint.textContent = "Haz clic o toca a los chicos para descubrir sus recuerdos. Después de cada imagen, pulsa «Cerrar y continuar»: aún queda algo al final.";
      exploreHint.hidden = true;
      const controls = content.querySelector?.(".birthday-controls");
      if (controls) controls.before(exploreHint);
      else content.append(exploreHint);
      function openFinale() {
        if (world.hidden || busy || suppressFinal || viewed.size !== 2) return;
        reopen.hidden = true;
        finalBody.scrollTop = 0;
        if (!finale.open) finale.showModal();
        finalShown = true;
        finalClose.focus({ preventScroll: true });
      }
      reopen.addEventListener("click", openFinale);
      finale.addEventListener("close", () => { reopen.hidden = suppressFinal || world.hidden || busy || !finalShown; });
      finalClose.addEventListener("click", () => finale.close());
      finale.addEventListener("click", (event) => { if (event.target === finale) finale.close(); });
      function markViewed(allowClosed = false) {
        if ((dialog.open || allowClosed === true) && !world.hidden && !suppressFinal && viewingPhoto && currentPerson >= 0 && photo.complete && photo.naturalWidth > 0) viewed.add(currentPerson);
      }
      photo.addEventListener("load", () => markViewed());
      dialog.addEventListener("close", () => {
        markViewed(true);
        if (suppressFinal || finalShown || viewed.size !== 2 || world.hidden || busy) return;
        requestAnimationFrame(() => {
          if (!dialog.open && !finalShown) openFinale();
        });
      });
      next.addEventListener("click", () => {
        viewingPhoto = true;
        dialog.className = "memory-reader memory-reader--photo";
        text.hidden = title.hidden = footer.hidden = true;
        photo.hidden = false;
        close.textContent = "Cerrar y continuar";
        markViewed();
        body.scrollTop = 0;
        close.focus({ preventScroll: true });
      });
      close.addEventListener("click", () => { markViewed(); dialog.close(); });
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog || (viewingPhoto && event.target === body)) { markViewed(); dialog.close(); }
      });
      return {
        open(index) {
          currentPerson = index;
          suppressFinal = false;
          viewingPhoto = false;
          dialog.className = "memory-reader";
          title.textContent = index === 0 ? "Un recuerdo dibujado" : "Un instante que se queda";
          text.textContent = memories[index];
          close.textContent = "Cerrar";
          text.hidden = title.hidden = footer.hidden = false;
          photo.hidden = true;
          photo.src = index === 0 ? "./Entrada Cumpleaños/Parte 4/Parte 4.jpg" : "./Entrada Cumpleaños/Parte 4/Parte 3.png";
          photo.alt = index === 0 ? "Dibujo asociado al chico de la izquierda." : "Fotografía asociada al chico de la derecha.";
          body.scrollTop = 0;
          if (!dialog.open) dialog.showModal();
          close.focus({ preventScroll: true });
        },
        close() {
          suppressFinal = true;
          reopen.hidden = true;
          exploreHint.hidden = true;
          if (dialog.open) dialog.close();
          if (finale.open) finale.close();
        },
        resume() { suppressFinal = false; reopen.hidden = !finalShown; exploreHint.hidden = false; },
      };
    }
    return { enter, sync, hide, show() { world.hidden = fireworks.hidden = false; reader.resume(); sync(); startFireworks(); } };
  };
})();
