(() => {
  window.createParkAtmosphere = (scene, image, reducedMotion) => {
    const layer = document.createElement("div");
    layer.className = "park-atmosphere";
    layer.setAttribute("aria-hidden", "true");
    layer.hidden = true;
    const water = document.createElement("canvas");
    water.className = "park-atmosphere__water";
    const ctx = water.getContext("2d");
    const waterMask = document.createElement("canvas");
    const maskContext = waterMask.getContext("2d");
    const shade = document.createElement("div");
    shade.className = "park-atmosphere__shade";
    layer.append(shade, water);
    for (let index = 0; index < 12; index += 1) {
      const leaf = document.createElement("i");
      leaf.className = `park-atmosphere__leaf park-atmosphere__leaf--${index % 3 === 0 ? "near" : "far"}`;
      leaf.style.setProperty("--start", `${(index * 31) % 78}%`);
      leaf.style.setProperty("--duration", `${14 + (index * 7) % 13}s`);
      leaf.style.setProperty("--delay", `${-index * 3.7}s`);
      leaf.style.setProperty("--leaf-size", `${7 + index % 5}px`);
      leaf.style.setProperty("--drift", `${12 + index % 4 * 7}vh`);
      leaf.style.setProperty("--sway", `${index % 2 ? -7 : 6}vh`);
      layer.append(leaf);
    }
    for (let index = 0; index < 8; index += 1) {
      const mote = document.createElement("b");
      mote.className = "park-atmosphere__mote";
      mote.style.setProperty("--x", `${18 + index * 9}%`);
      mote.style.setProperty("--y", `${12 + (index * 17) % 65}%`);
      mote.style.setProperty("--delay", `${-index * 2.3}s`);
      layer.append(mote);
    }
    scene.append(layer);
    let page = -1;
    let frame = 0;
    let lastPaint = 0;
    let maskPage = -1;
    // Normalized masks stay aligned with the photograph under camera motion.
    // The second mask deliberately excludes the letter, hand and bench.
    const masks = {
      2: [[[0, 0.46], [0.61, 0.435], [1, 0.45], [1, 0.63], [0, 0.65]]],
      4: [
        [[0, 0.33], [0.365, 0.32], [0.315, 0.77], [0, 0.775]],
        [[0.68, 0.32], [1, 0.32], [1, 0.73], [0.84, 0.73], [0.76, 0.61], [0.69, 0.55]],
      ],
    };

    function sync() {
      if (layer.hidden) return;
      layer.style.transform = image.style.transform;
      if (layer.style.width !== image.style.width) layer.style.width = image.style.width;
      if (layer.style.height !== image.style.height) layer.style.height = image.style.height;
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function traceWater(target, w, h) {
      target.beginPath();
      masks[page].forEach((polygon) => {
        polygon.forEach(([x, y], index) => {
          if (index === 0) target.moveTo(x * w, y * h);
          else target.lineTo(x * w, y * h);
        });
        target.closePath();
      });
    }

    function prepareMask(w, h) {
      if (waterMask.width === w && waterMask.height === h && maskPage === page) return;
      waterMask.width = w;
      waterMask.height = h;
      maskPage = page;
      // Cache the feathered edge, rather than blurring the entire water every frame.
      maskContext.filter = "blur(3px)";
      maskContext.fillStyle = "#fff";
      traceWater(maskContext, w, h);
      maskContext.fill();
      maskContext.globalCompositeOperation = "destination-out";
      maskContext.lineWidth = 6;
      maskContext.strokeStyle = "#000";
      maskContext.stroke();
      maskContext.globalCompositeOperation = "source-over";
    }

    function paint(now) {
      frame = 0;
      if (page < 0 || document.hidden || reducedMotion.matches || !ctx || !maskContext || !masks[page]) return;
      // Bounded backing resolution and 24fps keep the shimmer inexpensive on phones.
      if (now - lastPaint >= 1000 / 24) {
        lastPaint = now;
        const w = Math.min(image.naturalWidth, 900);
        const h = Math.round(w * image.naturalHeight / image.naturalWidth);
        if (!w || !h) return;
        if (water.width !== w || water.height !== h) { water.width = w; water.height = h; }
        prepareMask(w, h);
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        traceWater(ctx, w, h);
        ctx.clip();
        const scale = image.naturalWidth / w;
        const start = Math.floor(h * (page === 2 ? 0.43 : 0.31));
        const end = Math.ceil(h * (page === 2 ? 0.66 : 0.79));
        const time = now * 0.001;
        const breeze = 0.85 + Math.sin(time * 0.29) * 0.1 + Math.sin(time * 0.13 + 1.7) * 0.08;
        const tileWidth = Math.ceil(w / 12);
        ctx.globalAlpha = 0.92;
        // Local sampling avoids shifting the entire pond in uniform horizontal bands.
        for (let y = start; y < end; y += 4) {
          const depth = (y - start) / (end - start);
          const strength = (0.25 + depth * 1.15) * breeze * w / 900;
          for (let x = 0; x < w; x += tileWidth) {
            const wave = x * 0.019 + y * 0.11;
            const dx = (Math.sin(wave - time * 1.15) + Math.sin(x * 0.008 - y * 0.065 + time * 0.73) * 0.55) * strength;
            const dy = Math.cos(x * 0.013 + y * 0.17 - time * 0.92) * strength * 0.6;
            const tw = Math.min(tileWidth + 1, w - x);
            const sx = Math.max(0, Math.min(w - tw, x + dx));
            const sy = Math.max(0, Math.min(h - 5, y + dy));
            ctx.drawImage(image, sx * scale, sy * scale, tw * scale, 5 * scale, x, y, tw, 5);
          }
        }
        // Short, low-contrast glints breathe within the existing sun reflection.
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "#fff1ce";
        const reflectionX = page === 2 ? 0.39 : 0.27;
        for (let i = 0; i < 34; i += 1) {
          const depth = ((i * 19) % 37) / 37;
          const y = start + (end - start) * depth;
          const shimmer = Math.pow(Math.max(0, Math.sin(time * 1.2 + Math.sin(time * 0.23) * 0.3 + i * 2.39)), 4);
          const x = w * (reflectionX + Math.sin(i * 7.13 + time * 0.13) * (0.008 + depth * 0.025));
          ctx.globalAlpha = shimmer * Math.sin(depth * Math.PI) * 0.16;
          ctx.beginPath();
          ctx.ellipse(x, y, (1.4 + depth * 5) * w / 900, 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(waterMask, 0, 0);
        ctx.restore();
      }
      frame = requestAnimationFrame(paint);
    }

    function start() {
      stop();
      if (page >= 0 && masks[page] && !reducedMotion.matches && !document.hidden) {
        lastPaint = 0;
        frame = requestAnimationFrame(paint);
      }
    }

    function show(nextPage) {
      page = nextPage;
      layer.hidden = page < 0;
      layer.style.setProperty("--sun-x", page === 0 ? "52%" : "34%");
      water.hidden = !masks[page];
      ctx?.clearRect(0, 0, water.width, water.height);
      sync();
      start();
    }

    reducedMotion.addEventListener("change", () => {
      ctx?.clearRect(0, 0, water.width, water.height);
      start();
    });
    document.addEventListener("visibilitychange", start);
    return { show, sync, hide: () => show(-1) };
  };
})();
