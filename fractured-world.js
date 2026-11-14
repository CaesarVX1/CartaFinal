(() => {
  const button = document.querySelector("#btn-anniversary-entry");
  const message = document.querySelector("#welcome-menu-message-nov");
  const menu = document.querySelector("#welcome-menu");
  const destination = document.querySelector("#anniversary-destination");
  const destinationContent = document.querySelector("#anniversary-destination-content");
  const backButton = document.querySelector("#btn-anniversary-back");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const shatterDuration = 7500;
  const releaseTime = 5800;
  const flowerGrowthEnd = releaseTime - 750;
  const runningAnimations = new Set();
  let transitioning = false;
  let transitionEpoch = 0;
  let menuFacets = null;
  let preparedScene = null;
  let preparationScheduled = false;

  function sceneKey() {
    const bounds = button.getBoundingClientRect();
    return [innerWidth, innerHeight, devicePixelRatio, menu.scrollTop, document.body.className,
      menu.className, bounds.x, bounds.y, bounds.width, bounds.height, reducedMotion.matches].join("|");
  }

  function prepareScene() {
    if (preparationScheduled || transitioning || !menu || destination.open) return;
    preparationScheduled = true;
    const idle = window.requestIdleCallback || ((callback) => setTimeout(() => callback({ timeRemaining: () => 5 }), 80));
    idle((deadline) => {
      preparationScheduled = false;
      if (transitioning || destination.open || !menu.getClientRects().length) return;
      const key = sceneKey();
      if (!preparedScene || preparedScene.key !== key) {
        preparedScene = { key, iterator: buildShatterScene(menuFacets || (menuFacets = screenFacets())) };
      }
      // No DOM insertion or animation playback here: only prepare two detached shards per idle turn.
      for (let batch = 0; batch < 2 && !preparedScene.result && deadline.timeRemaining() > 2; batch += 1) {
        const step = preparedScene.iterator.next();
        if (step.done) preparedScene.result = step.value;
      }
      if (!preparedScene.result) prepareScene();
    });
  }

  function activate() {
    if (!menu) return;
    menuFacets = screenFacets();
    const glass = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    glass.setAttribute("class", "welcome-wall-fractures");
    glass.setAttribute("viewBox", "0 0 1000 1000");
    glass.setAttribute("preserveAspectRatio", "none");
    glass.setAttribute("aria-hidden", "true");
    const lines = document.createElementNS(glass.namespaceURI, "path");
    lines.setAttribute("d", wallCrackPaths(menuFacets).map((points) =>
      points.map(([x, y], index) => `${index ? "L" : "M"}${x * 10} ${y * 10}`).join(" ")).join(" "));
    lines.setAttribute("vector-effect", "non-scaling-stroke");
    const edge = lines.cloneNode();
    edge.setAttribute("class", "welcome-wall-fractures__edge");
    edge.setAttribute("transform", "translate(1 1)");
    const cut = lines.cloneNode();
    cut.setAttribute("class", "welcome-wall-fractures__cut");
    glass.append(edge, cut, lines);
    menu.append(glass);
  }

  function animateFragment(element, keyframes, options) {
    const frames = reducedMotion.matches ? [{ opacity: element.style.opacity || 1 }, { opacity: 0 }] : keyframes;
    const animation = element.animate(frames, {
      fill: "forwards", ...options,
      ...(reducedMotion.matches ? { duration: 300, delay: 0 } : {}),
    });
    runningAnimations.add(animation);
    return animation.finished.catch(() => {}).finally(() => runningAnimations.delete(animation));
  }

  function createDebris(className = "") {
    const layer = document.createElement("div");
    layer.className = `anniversary-debris ${className}`.trim();
    layer.inert = true;
    layer.setAttribute("aria-hidden", "true");
    return layer;
  }

  function screenFacets() {
    let seed = 15112026;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const facets = [[[0, 0], [100, 0], [100, 100], [0, 100]]];
    const target = innerWidth < 600 ? 26 : 34;
    const area = (points) => Math.abs(points.reduce((sum, [x, y], index) => {
      const next = points[(index + 1) % points.length];
      return sum + x * next[1] - next[0] * y;
    }, 0)) / 2;
    // Recursive cuts share their intersection vertices: irregular shards, no radial wheel or gaps.
    for (let attempt = 0; facets.length < target && attempt < target * 20; attempt += 1) {
      const ranked = facets.map((points, index) => ({ index, weight: area(points) * (0.35 + random()) }));
      ranked.sort((a, b) => b.weight - a.weight);
      const index = ranked[0].index;
      const polygon = facets[index];
      const angle = random() * Math.PI;
      const normal = [Math.cos(angle), Math.sin(angle)];
      const projections = polygon.map(([x, y]) => x * normal[0] + y * normal[1]);
      const min = Math.min(...projections), max = Math.max(...projections);
      const cut = min + (max - min) * (0.18 + random() * 0.64);
      const halves = [[], []];
      polygon.forEach((point, vertex) => {
        const next = polygon[(vertex + 1) % polygon.length];
        const distance = projections[vertex] - cut;
        const nextDistance = projections[(vertex + 1) % polygon.length] - cut;
        halves[distance >= 0 ? 0 : 1].push(point);
        if ((distance > 0) !== (nextDistance > 0)) {
          const t = distance / (distance - nextDistance);
          const intersection = [point[0] + (next[0] - point[0]) * t, point[1] + (next[1] - point[1]) * t];
          halves[0].push(intersection);
          halves[1].push(intersection);
        }
      });
      if (halves.some((points) => points.length < 3 || area(points) < 8)) continue;
      facets.splice(index, 1, ...halves);
    }
    return roughenFacets(facets, random);
  }


  function roughenFacets(facets, random) {
    const key = ([x, y]) => `${x.toFixed(6)},${y.toFixed(6)}`;
    const vertices = [...new Map(facets.flat().map((point) => [key(point), point])).values()];
    // Split shared edges at T-junctions before adding identical kinks to both neighbouring pieces.
    const expanded = facets.map((points) => points.flatMap((a, index) => {
      const b = points[(index + 1) % points.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], lengthSquared = dx * dx + dy * dy;
      const onEdge = vertices.map((point) => ({ point, t: ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / lengthSquared }))
        .filter(({ point, t }) => t > 0.000001 && t < 0.999999 && Math.abs((point[0] - a[0]) * dy - (point[1] - a[1]) * dx) < 0.00001)
        .sort((p, q) => p.t - q.t);
      return [a, ...onEdge.map(({ point }) => point)];
    }));
    const seams = new Map();
    return expanded.map((points) => points.flatMap((a, index) => {
      const b = points[(index + 1) % points.length];
      if ((a[0] === b[0] && (a[0] === 0 || a[0] === 100)) || (a[1] === b[1] && (a[1] === 0 || a[1] === 100))) return [a];
      const forward = key(a) < key(b), start = forward ? a : b, end = forward ? b : a;
      const seamKey = [key(start), key(end)].join("/");
      if (!seams.has(seamKey)) {
        const dx = end[0] - start[0], dy = end[1] - start[1], length = Math.hypot(dx, dy);
        const clearance = Math.min(...vertices.map(([x, y]) => Math.abs((x - start[0]) * dy - (y - start[1]) * dx) / length)
          .filter((distance) => distance > 0.00001));
        const amplitude = Math.min(0.85, length * 0.065, clearance * 0.15);
        seams.set(seamKey, [0.3, 0.65].map((t) => {
          const bend = (random() - 0.5) * amplitude * 2;
          return [Math.max(0, Math.min(100, start[0] + dx * t - dy / length * bend)),
            Math.max(0, Math.min(100, start[1] + dy * t + dx / length * bend))];
        }));
      }
      const bends = seams.get(seamKey);
      return [a, ...(forward ? bends : [...bends].reverse())];
    }));
  }

  function wallCrackPaths(facets) {
    const key = ([x, y]) => `${x.toFixed(6)},${y.toFixed(6)}`;
    const graph = new Map();
    facets.forEach((points) => points.forEach((a, index) => {
      const b = points[(index + 1) % points.length];
      if ((a[0] === b[0] && (a[0] === 0 || a[0] === 100)) || (a[1] === b[1] && (a[1] === 0 || a[1] === 100))) return;
      for (const [point, neighbour] of [[a, b], [b, a]]) {
        if (!graph.has(key(point))) graph.set(key(point), { point, neighbours: new Map() });
        graph.get(key(point)).neighbours.set(key(neighbour), neighbour);
      }
    }));
    const nodes = [...graph.values()];
    const used = new Set();
    const nearest = (target) => nodes.reduce((best, node) =>
      Math.hypot(node.point[0] - target[0], node.point[1] - target[1]) < Math.hypot(best.point[0] - target[0], best.point[1] - target[1]) ? node : best).point;
    const walk = (start, direction, budget, anchorX = null) => {
      const path = [start];
      const visited = new Set([key(start)]);
      let length = 0;
      while (length < budget) {
        const current = path[path.length - 1];
        const choices = [...graph.get(key(current)).neighbours.values()].map((point) => {
          const edge = [key(current), key(point)].sort().join("/");
          const dx = point[0] - current[0], dy = point[1] - current[1];
          const distance = Math.hypot(dx, dy);
          return { point, edge, distance, score: (dx * direction[0] + dy * direction[1]) / distance - (anchorX === null ? 0 : Math.abs(point[0] - anchorX) * 0.06) };
        }).filter(({ point, edge }) => !used.has(edge) && !visited.has(key(point)))
          .sort((a, b) => b.score - a.score);
        if (!choices.length) break;
        const next = choices[0];
        if (length + next.distance > budget) {
          const remaining = (budget - length) / next.distance;
          path.push([current[0] + (next.point[0] - current[0]) * remaining, current[1] + (next.point[1] - current[1]) * remaining]);
          break;
        }
        path.push(next.point);
        visited.add(key(next.point));
        used.add(next.edge);
        length += next.distance;
      }
      return path;
    };
    // Fixed, separated branches reveal only part of the glass mesh before the impact.
    const main = walk(nearest([85, 0]), [0, 1], 48, 83);
    const branch = main.slice(2, -2).find((point) => graph.get(key(point)).neighbours.size >= 3);
    const lowerBranch = main.find((point) => point[1] > 62 && graph.get(key(point)).neighbours.size >= 3);
    const middleBranch = main.find((point) => point[1] > 33 && graph.get(key(point)).neighbours.size >= 3);
    const left = walk(nearest([14, 20]), [0.1, 1], 42, 16);
    const leftBranch = left.slice(1, -1).find((point) => graph.get(key(point)).neighbours.size >= 3);
    const paths = [main,
      ...(branch ? [walk(branch, [-1, 0.15], 21)] : []),
      ...(lowerBranch ? [walk(lowerBranch, [1, 0.2], 9)] : []),
      ...(middleBranch ? [walk(middleBranch, [-1, -0.25], 26)] : []),
      left,
      ...(leftBranch ? [walk(leftBranch, [1, 0.3], 20)] : []),
      walk(nearest([10, 65]), [0.2, 1], 27),
      walk(nearest([78, 88]), [-1, -0.2], 13),
      walk(nearest([8, 12]), [1, 0.2], 16),
      walk(nearest([46, 5]), [1, 0.3], 25),
      walk(nearest([40, 94]), [-0.7, -1], 25),
      walk(nearest([29, 14]), [-0.3, 1], 22),
      walk(nearest([63, 9]), [0.2, 1], 18),
      walk(nearest([22, 78]), [1, 0.3], 23),
      walk(nearest([62, 86]), [0.5, -1], 19),
    ];
    for (const [height, direction] of [[22, [-1, 0.3]], [48, [1, -0.1]], [76, [-1, -0.25]]]) {
      const junction = main.slice(1, -1).find((point) => point[1] > height && graph.get(key(point)).neighbours.size >= 3);
      if (junction) paths.push(walk(junction, direction, 15));
    }
    return paths.filter((points) => points.length > 1);
  }

  async function fractureImpact() {
    if (reducedMotion.matches) return;
    const layer = createDebris("anniversary-impact");
    const animations = [];
    const flash = document.createElement("div");
    flash.className = "anniversary-impact__flash";
    layer.append(flash);
    destination.append(layer);
    animations.push(() => animateFragment(flash, [
      { opacity: 0 }, { opacity: 0, offset: (releaseTime - 100) / shatterDuration },
      { opacity: 0.45, offset: releaseTime / shatterDuration },
      { opacity: 0, offset: (releaseTime + 350) / shatterDuration }, { opacity: 0 },
    ], { duration: shatterDuration, easing: "linear" }));
    try { await Promise.all(animations.map((run) => run())); }
    finally { layer.remove(); }
  }

  function facetGeometry(points, width, height) {
    return {
      clip: `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(",")})`,
      outline: points.map(([x, y], index) => {
        const [endX, endY] = points[(index + 1) % points.length];
        if ((x === endX && (x === 0 || x === 100)) || (y === endY && (y === 0 || y === 100))) return "";
        return `M${x * width / 100} ${y * height / 100} L${endX * width / 100} ${endY * height / 100}`;
      }).join(" "),
    };
  }

  function freezeScene() {
    const snapshot = menu.cloneNode(true);
    const sources = [menu, ...menu.querySelectorAll("*")];
    const copies = [snapshot, ...snapshot.querySelectorAll("*")];
    const properties = ("position top right bottom left z-index display visibility opacity width height min-width min-height max-width max-height " +
      "box-sizing margin padding border border-radius box-shadow background color font letter-spacing line-height text-align text-transform text-shadow white-space " +
      "overflow overflow-x overflow-y clip-path filter transform transform-origin isolation mix-blend-mode " +
      "flex flex-direction flex-wrap justify-content align-content align-items align-self justify-items justify-self gap grid-template-columns grid-template-rows grid-area " +
      "fill fill-opacity stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset").split(" ");
    const freezeStyle = (style) => properties
      .map((property) => `${property}:${style.getPropertyValue(property)} !important;`).join("");
    sources.forEach((source, index) => {
      // Definitions must retain inherited strokes from <use>, rather than freezing them to 'none'.
      if (source.closest("defs")) return;
      const copy = copies[index];
      copy.style.cssText = freezeStyle(getComputedStyle(source));
      if (source.namespaceURI !== "http://www.w3.org/1999/xhtml") return;
      for (const pseudo of ["::before", "::after"]) {
        const style = getComputedStyle(source, pseudo);
        if (style.content === "none" || style.content === "normal" || style.display === "none") continue;
        const decoration = document.createElement("span");
        decoration.style.cssText = freezeStyle(style);
        const text = style.content;
        decoration.textContent = text.startsWith('"') ? text.slice(1, -1) : "";
        if (pseudo === "::before") copy.prepend(decoration);
        else copy.append(decoration);
      }
    });
    snapshot.classList.add("anniversary-scene-copy");
    snapshot.style.setProperty("position", "absolute", "important");
    snapshot.style.setProperty("pointer-events", "none", "important");
    snapshot.style.setProperty("overflow", "hidden", "important");
    snapshot.style.setProperty("opacity", "1");
    return snapshot;
  }

  function identifyCopy(copy, index) {
    const nodes = [copy, ...copy.querySelectorAll("*")];
    const ids = new Map();
    nodes.forEach((node) => {
      if (!node.id) return;
      const id = `anniversary-shard-${index}-${node.id}`;
      ids.set(node.id, id);
      node.id = id;
    });
    nodes.forEach((node) => [...node.attributes].forEach(({ name, value }) => {
      if (!value.includes("url(") && !value.startsWith("#")) return;
      const reference = value.replace(/url\(["']?#([^)'" ]+)["']?\)/g,
        (match, id) => ids.has(id) ? `url(#${ids.get(id)})` : match);
      const updated = reference.startsWith("#") && ids.has(reference.slice(1)) ? `#${ids.get(reference.slice(1))}` : reference;
      if (updated !== value) node.setAttribute(name, updated);
    }));
  }

  function growBirthdayVines(copy, animations) {
    const flower = copy.querySelector(".birthday-flower");
    if (!flower) return;
    const svgNode = (tag, attributes = {}) => {
      const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
      return node;
    };
    const garden = svgNode("svg", { viewBox: "0 0 600 90", preserveAspectRatio: "none", "aria-hidden": "true", focusable: "false" });
    Object.assign(garden.style, { position: "absolute", inset: "0", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit", zIndex: "5", pointerEvents: "none" });
    flower.closest("button").append(garden);
    const bloom = flower.querySelector(".birthday-flower__bloom");
    const reveal = (node, delay, duration = 900) => {
      node.style.opacity = "0";
      animations.push(() => animateFragment(node, [
        { opacity: 0, transform: "scale(.05)" },
        { opacity: 1, transform: "scale(1)" },
      ], { duration, delay, easing: "cubic-bezier(.35,0,.25,1)" }));
    };
    // Each vine grows from its own corner; foliage opens only after its tip passes.
    for (const side of [0, 1]) {
      const root = svgNode("g", { transform: side ? "translate(600 90) rotate(180)" : "" });
      garden.append(root);
      const height = (x) => 64 - x * .065 + Math.sin(x / 48) * 12;
      const points = Array.from({ length: 61 }, (_, i) => [i * 10, height(i * 10)]);
      const stem = svgNode("path", {
        d: points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" "),
        fill: "none", stroke: side ? "#779775" : "#96ad80", "stroke-width": "1.8",
        "stroke-linecap": "round", pathLength: "1", "stroke-dasharray": "1", "stroke-dashoffset": "1",
      });
      root.append(stem);
      animations.push(() => animateFragment(stem, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: flowerGrowthEnd - 1150, delay: 150, easing: "linear" }));
      for (let i = 0; i < 15; i += 1) {
        const x = 20 + i * 39;
        const y = height(x);
        const direction = i % 2 ? -1 : 1;
        const branch = svgNode("g", { transform: `translate(${x} ${y}) rotate(${direction * 22})` });
        const foliage = svgNode("g");
        root.append(branch);
        branch.append(foliage);
        foliage.append(svgNode("path", {
          d: `M0 0 Q8 ${direction * 10} 16 ${direction * 20} M5 ${direction * 6} l-10 ${direction * 3} m13 2 -9 7 M9 ${direction * 11} l12 -2 m-9 7 11 -1`,
          fill: "none", stroke: "#9aac7b", "stroke-width": ".85", "stroke-linecap": "round",
        }));
        const bloomDelay = 400 + i / 14 * (flowerGrowthEnd - 1400);
        reveal(foliage, bloomDelay - 220);
        const position = svgNode("g", { transform: `translate(16 ${direction * 20}) rotate(${i * 37}) scale(${.38 + (i % 4) * .12})` });
        const opening = svgNode("g");
        position.append(opening);
        branch.append(position);
        if (i % 3 === 0) {
          opening.append(svgNode("path", { d: "M0 9C-16-5-7-18 0-13C7-18 16-5 0 9Z", fill: "#b3465c", stroke: "#de8c89", "stroke-width": "1" }));
          opening.append(svgNode("path", { d: "M-6 4 0 10 6 4M0 9V-8", fill: "none", stroke: "#adc18c", "stroke-width": "1" }));
        } else if (bloom) {
          const petals = svgNode("g", { transform: "translate(-49 -34)" });
          petals.append(bloom.cloneNode(true));
          opening.append(petals);
        }
        reveal(opening, bloomDelay, 1000);
      }
    }
  }

  function* buildShatterScene(facets) {
    const snapshot = freezeScene();
    const buttonBounds = button.getBoundingClientRect();
    const debris = createDebris();
    const animations = [];
    const fragments = reducedMotion.matches ? [[[0, 0], [100, 0], [100, 100], [0, 100]]] : facets;
    for (const [index, points] of fragments.entries()) {
      const geometry = facetGeometry(points, innerWidth, innerHeight);
      const shard = document.createElement("div");
      shard.className = "anniversary-screen-shard";
      shard.style.width = `${innerWidth}px`;
      shard.style.height = `${innerHeight}px`;
      shard.style.clipPath = geometry.clip;
      const copy = snapshot.cloneNode(true);
      identifyCopy(copy, index);
      shard.append(copy);
      const xs = points.map(([x]) => x * innerWidth / 100);
      const ys = points.map(([, y]) => y * innerHeight / 100);
      if (!reducedMotion.matches && Math.max(...xs) >= buttonBounds.left && Math.min(...xs) <= buttonBounds.right &&
          Math.max(...ys) >= buttonBounds.top && Math.min(...ys) <= buttonBounds.bottom) {
        growBirthdayVines(copy, animations);
      }
      const sheen = document.createElement("div");
      sheen.className = "anniversary-shard-sheen";
      sheen.style.backgroundPosition = `${index * 37 % 100}% 50%`;
      shard.append(sheen);
      const outline = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      outline.setAttribute("class", "anniversary-shard-edges");
      outline.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
      const path = document.createElementNS(outline.namespaceURI, "path");
      path.setAttribute("d", geometry.outline);
      path.setAttribute("pathLength", "1");
      const thickness = path.cloneNode();
      thickness.setAttribute("class", "anniversary-shard-edges__thickness");
      thickness.setAttribute("transform", "translate(1.5 1.5)");
      const bevel = path.cloneNode();
      bevel.setAttribute("class", "anniversary-shard-edges__bevel");
      bevel.setAttribute("transform", "translate(-0.6 -0.6)");
      outline.append(thickness, bevel, path);
      shard.append(outline);
      debris.append(shard);
      const centerX = points.reduce((sum, [x]) => sum + x, 0) / points.length;
      const centerY = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
      shard.style.transformOrigin = `${centerX}% ${centerY}%`;
      const initialVelocity = 40 + Math.random() * 550;
      const distance = innerHeight * 1.5 + 160;
      const duration = Math.min(shatterDuration - releaseTime - 75,
        (Math.sqrt(initialVelocity * initialVelocity + 2 * 1800 * distance) - initialVelocity) / 1800 * 1000);
      const delay = releaseTime + Math.random() * 75;
      const drift = (Math.random() - 0.5) * 190;
      const spin = (Math.random() - 0.5) * 95;
      const frames = fallingGlassFrames(duration, drift, spin, initialVelocity);
      animations.push(() => animateFragment(shard, frames, { duration, delay, easing: "linear" }));
      animations.push(() => animateFragment(copy, [
        { opacity: 1 }, { opacity: 1, offset: 0.2 },
        { opacity: 0.15, offset: 0.78 }, { opacity: 0 },
      ], { duration, delay, easing: "linear" }));
      animations.push(() => animateFragment(sheen, [
        { opacity: 0 }, { opacity: 0.15, offset: 0.2 },
        { opacity: 0.8, offset: 0.65 }, { opacity: 0.25 },
      ], { duration, delay, easing: "ease-in-out" }));
      animations.push(() => animateFragment(outline, [
        { strokeDashoffset: 1, opacity: 0 },
        { strokeDashoffset: 0.85, opacity: 0.35, offset: 0.2 },
        { strokeDashoffset: 0.35, opacity: 0.7, offset: 0.65 },
        { strokeDashoffset: 0, opacity: 1 },
      ], { duration: releaseTime - 1000, delay: 150 + index / Math.max(1, fragments.length - 1) * 650, easing: "ease-in-out" }));
      yield;
    }
    return { debris, animations };
  }

  async function shatterScreen(facets) {
    const cached = preparedScene?.key === sceneKey() ? preparedScene : null;
    preparedScene = null;
    const iterator = cached?.iterator || buildShatterScene(facets);
    let scene = cached?.result;
    if (!scene) {
      let step;
      do { step = iterator.next(); } while (!step.done);
      scene = step.value;
    }
    const { debris, animations } = scene;
    destination.append(debris);
    try { await Promise.all(animations.map((run) => run())); }
    finally { debris.remove(); }
  }

  function fallingGlassFrames(duration, drift, spin, initialVelocity = 0) {
    // CSS pixels / second squared: ordinary free fall, not a slow zoom towards the viewer.
    return [0, 0.1, 0.2, 0.35, 0.5, 0.7, 0.85, 1].map((offset) => {
      const seconds = offset * duration / 1000;
      return {
        offset,
        transform: `translate3d(${drift * seconds}px, ${initialVelocity * seconds + 0.5 * 1800 * seconds * seconds}px, 0) rotate(${spin * seconds}deg)`,
        opacity: offset < 0.85 ? 1 : (1 - offset) / 0.15,
      };
    });
  }


  async function scatterGlass(facets) {
    if (reducedMotion.matches) return;
    const mobile = innerWidth < 600;
    const intersections = facets.flat().filter(([x, y]) => x > 8 && x < 92 && y > 8 && y < 92);
    const origins = Array.from({ length: mobile ? 2 : 3 }, (_, index) => {
      const point = intersections[Math.floor(index * intersections.length / 3)] || [48, 44];
      return { x: point[0] * innerWidth / 100, y: point[1] * innerHeight / 100, delay: 1450 + index * 200 };
    });
    const debris = createDebris("anniversary-glass-layer");
    const animations = [];
    const shapes = ["polygon(8% 0, 100% 28%, 23% 100%)", "polygon(45% 0, 100% 86%, 0 100%)", "polygon(0 12%, 83% 0, 100% 100%, 34% 72%)"];
    origins.forEach((origin) => {
      for (let i = 0; i < (mobile ? 8 : 14); i += 1) {
        const glass = document.createElement("span");
        glass.className = "anniversary-glass-shard";
        Object.assign(glass.style, {
          left: `${origin.x}px`, top: `${origin.y}px`,
          width: `${3 + Math.random() * (mobile ? 5 : 8)}px`,
          height: `${7 + Math.random() * (mobile ? 8 : 15)}px`,
          clipPath: shapes[i % shapes.length],
        });
        debris.append(glass);
        const vx = (origin.x < innerWidth / 2 ? -1 : 1) * (45 + Math.random() * (mobile ? 100 : 210));
        const vy = 20 + Math.random() * 45;
        const gravity = 650 + Math.random() * 300;
        const spin = (Math.random() - 0.5) * 800;
        // Small splinters detach at the seams and fall too, without an upward burst.
        const frames = [0, 0.12, 0.3, 0.5, 0.75, 1].map((t) => ({
          offset: t,
          transform: `translate3d(${vx * t}px, ${vy * t + gravity * t * t}px, 0) rotate(${spin * t}deg) rotateY(${t * 360}deg) scale(${1 - t * 0.35})`,
          opacity: t === 0 || t === 1 ? 0 : 0.9 * (1 - t * 0.6),
        }));
        animations.push(() => animateFragment(glass, frames, {
          duration: 800 + Math.random() * 400,
          delay: releaseTime + (origin.delay - 1450) * 0.45 + Math.random() * 100,
          easing: "linear",
        }));
      }
    });
    destination.append(debris);
    try {
      await Promise.all(animations.map((run) => run()));
    } finally {
      debris.remove();
    }
  }


  async function shatterMenu() {
    const epoch = ++transitionEpoch;
    transitioning = true;
    destinationContent.hidden = true;
    try {
      // Snapshot visible surfaces before opening the modal; the original menu stays untouched behind it.
      const facets = menuFacets || (menuFacets = screenFacets());
      const tasks = [shatterScreen(facets)];
      tasks.push(scatterGlass(facets));
      tasks.push(fractureImpact());
      button.classList.add("is-disintegrated");
      destination.showModal();
      destination.querySelectorAll(".anniversary-scene-copy").forEach((copy) => { copy.scrollTop = menu.scrollTop; });
      await Promise.all(tasks);
    } finally {
      destination.querySelectorAll(".anniversary-debris").forEach((debris) => debris.remove());
      if (epoch === transitionEpoch && destination.open) {
        transitioning = false;
        destinationContent.hidden = false;
        destination.dispatchEvent(new Event("birthday:enter"));
        destination.querySelector("#birthday-next")?.focus({ preventScroll: true });
      }
    }
  }

  button?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (transitioning || destination.open) return;
    button.disabled = true;
    message.textContent = "";
    message.classList.remove("is-visible");
    destination.dispatchEvent(new Event("birthday:opening"));
    shatterMenu().catch(() => {});
  }, { capture: true });

  backButton?.addEventListener("click", () => destination.close());
  destination?.addEventListener("cancel", (event) => {
    if (transitioning) event.preventDefault();
  });
  destination?.addEventListener("close", () => {
    transitionEpoch += 1;
    transitioning = false;
    runningAnimations.forEach((animation) => animation.cancel());
    runningAnimations.clear();
    destination.querySelectorAll(".anniversary-debris").forEach((debris) => debris.remove());
    button.disabled = false;
    button.classList.remove("is-disintegrated");
    button.focus({ preventScroll: true });
    prepareScene();
  });

  activate();
  if (menu && button && destination) {
    (document.fonts?.ready || Promise.resolve()).then(prepareScene);
    button.addEventListener("pointerenter", prepareScene, { passive: true });
    button.addEventListener("focus", prepareScene);
    window.addEventListener("resize", prepareScene, { passive: true });
    menu.addEventListener("scroll", prepareScene, { passive: true });
  }
})();
