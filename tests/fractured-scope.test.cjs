const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

test("fracture initialization leaves other experiences untouched", () => {
  const selections = [];
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8"), {
    document: {
      querySelector: () => null,
      querySelectorAll: (selector) => { selections.push(selector); return []; },
    },
    matchMedia: () => ({ matches: false }),
  });
  assert.deepEqual(selections, []);
});

test("the crack styles do not replace experience backgrounds or their controls", () => {
  const css = fs.readFileSync(path.join(__dirname, "../fractured-world.css"), "utf8");
  assert.doesNotMatch(css, /body\.world-fractured\s*\{/);
  assert.doesNotMatch(css, /\.desk-actions button|\.desk-diary button|#floating-controls button/);
  assert.doesNotMatch(css, /\.world-fractured #welcome-menu::after\s*\{/);
});

test("glass outlines use the exact clipping polygon and omit the screen border", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  const geometry = source.slice(source.indexOf("  function facetGeometry("), source.indexOf("  function freezeScene("));
  const points = [[0, 0], [40, 30], [100, 0], [100, 100], [0, 100]];
  const result = vm.runInNewContext(`${geometry}; facetGeometry(points, 1280, 720)`, { points });
  assert.equal(result.clip, "polygon(0% 0%,40% 30%,100% 0%,100% 100%,0% 100%)");
  assert.equal(result.outline.trim(), "M0 0 L512 216 M512 216 L1280 0");
  assert.match(source, /shard\.append\(copy\)/);
  assert.match(source, /shard\.append\(outline\)/);
  assert.doesNotMatch(source, /function disintegrate|function crumbleObject/);
});

test("the visible mesh is reused for shattering and the next dialogue only fades in", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "../birthday-entry.css"), "utf8");
  assert.match(source, /menuFacets = screenFacets\(\)/);
  assert.match(source, /wallCrackPaths\(menuFacets\)/);
  assert.match(source, /const facets = menuFacets \|\| \(menuFacets = screenFacets\(\)\)/);
  assert.doesNotMatch(css.slice(css.indexOf(".birthday-dialogue, .birthday-paths {"), css.indexOf(".birthday-eyebrow")), /translateY\(/);
  assert.match(css, /transition: opacity 0\.7s ease 0\.4s;/);
});

test("glass falls down with constant gravity and no forward zoom", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  const helper = source.slice(source.indexOf("  function fallingGlassFrames("), source.indexOf("  async function scatterGlass("));
  const frames = vm.runInNewContext(`${helper}; fallingGlassFrames(1200, 30, 15)`);
  let previousY = -1;
  for (const frame of frames) {
    const [, x, y] = frame.transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px, 0\)/);
    const seconds = frame.offset * 1.2;
    assert.ok(Math.abs(Number(x) - 30 * seconds) < 0.000001);
    assert.ok(Math.abs(Number(y) - 900 * seconds * seconds) < 0.000001);
    assert.ok(Number(y) > previousY);
    previousY = Number(y);
    assert.doesNotMatch(frame.transform, /perspective|scale/);
  }
  const css = fs.readFileSync(path.join(__dirname, "../fractured-world.css"), "utf8");
  assert.match(css, /\.welcome-wall-fractures\s*\{[^}]*z-index: 0;[^}]*stroke: #030304;/s);
});

test("returning from the birthday entry restores its menu button", () => {
  const listeners = {};
  const classes = new Set(["is-disintegrated"]);
  let focused = false;
  const classList = { remove: (name) => classes.delete(name) };
  const button = {
    disabled: true, classList, addEventListener() {},
    closest: () => ({ classList }), focus: () => { focused = true; },
  };
  const destination = {
    addEventListener: (event, handler) => { listeners[event] = handler; },
    querySelectorAll: () => [],
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8"), {
    document: {
      querySelector: (selector) => ({ "#btn-anniversary-entry": button, "#anniversary-destination": destination }[selector] || null),
      querySelectorAll: () => [],
    },
    matchMedia: () => ({ matches: false }),
  });
  listeners.close();
  assert.equal(button.disabled, false);
  assert.equal(classes.size, 0);
  assert.equal(focused, true);
});

test("irregular shards cover the entire screen on desktop and mobile", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  const geometry = source.slice(source.indexOf("  function screenFacets()"), source.indexOf("  async function fractureImpact"));
  for (const width of Array.from({ length: 20 }, () => [320, 360, 1280]).flat()) {
    const facets = vm.runInNewContext(`${geometry}; screenFacets()`, { innerWidth: width });
    let area = 0;
    for (const points of facets) {
      assert.ok(points.flat().every(Number.isFinite));
      assert.ok(points.flat().every((value) => value >= -0.001 && value <= 100.001));
      area += Math.abs(points.reduce((sum, [x, y], index) => {
        const next = points[(index + 1) % points.length];
        return sum + x * next[1] - next[0] * y;
      }, 0)) / 2;
    }
    assert.ok(Math.abs(area - 10000) < 0.001, `uncovered screen at ${width}px`);
    assert.equal(facets.length, width < 600 ? 26 : 34);
    const centers = facets.map((points) => points.reduce((sum, [x]) => sum + x, 0) / points.length);
    assert.ok(Math.max(...centers) - Math.min(...centers) > 60);
    const leftCount = centers.filter((x) => x < 50).length;
    assert.ok(leftCount >= facets.length * 0.35 && leftCount <= facets.length * 0.65, "shards must be balanced across the screen");
    const junctions = new Map();
    facets.forEach((points) => new Set(points.map(([x, y]) => `${x.toFixed(5)},${y.toFixed(5)}`)).forEach((key) => {
      junctions.set(key, (junctions.get(key) || 0) + 1);
    }));
    assert.ok(Math.max(...junctions.values()) <= 8, "shards must not fan out from a single wall crack");
  }
  assert.match(source, /const shatterDuration = 7500;/);
});

test("the wall only shows sparse cracks, all lying on actual shard seams", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  const geometry = source.slice(source.indexOf("  function screenFacets()"), source.indexOf("  async function fractureImpact"));
  for (const width of [360, 1280]) {
    const { facets, paths } = vm.runInNewContext(`${geometry}; const facets = screenFacets(); ({ facets, paths: wallCrackPaths(facets) })`, { innerWidth: width });
    assert.ok(paths.length >= 10 && paths.length <= 19);
    const edges = facets.flatMap((points) => points.map((point, index) => [point, points[(index + 1) % points.length]]));
    let totalLength = 0;
    paths.forEach((points) => points.slice(1).forEach((b, index) => {
      const a = points[index];
      totalLength += Math.hypot(b[0] - a[0], b[1] - a[1]);
      assert.ok(edges.some(([start, end]) => [a, b].every(([x, y]) => {
        const dx = end[0] - start[0], dy = end[1] - start[1];
        const t = ((x - start[0]) * dx + (y - start[1]) * dy) / (dx * dx + dy * dy);
        return t >= -0.00001 && t <= 1.00001 && Math.abs((x - start[0]) * dy - (y - start[1]) * dx) < 0.00001;
      })), "a wall crack must coincide with a shard edge");
    }));
    assert.ok(totalLength <= 450.001, "most of the wall must remain intact");
  }
});

test("wall cracks are identical after a fresh page load", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  const geometry = source.slice(source.indexOf("  function screenFacets()"), source.indexOf("  async function fractureImpact"));
  for (const width of [360, 1280]) {
    const create = () => JSON.stringify(vm.runInNewContext(`${geometry}; wallCrackPaths(screenFacets())`, { innerWidth: width }));
    assert.equal(create(), create());
  }
  assert.match(source, /const delay = releaseTime \+ Math\.random\(\) \* 75;/);
  const helper = source.slice(source.indexOf("  function fallingGlassFrames("), source.indexOf("  async function scatterGlass("));
  const slow = vm.runInNewContext(`${helper}; fallingGlassFrames(1200, 30, 15, 40)`);
  const fast = vm.runInNewContext(`${helper}; fallingGlassFrames(1200, 30, 15, 590)`);
  assert.notEqual(slow[3].transform, fast[3].transform);
});

test("7.5-second transition grows the cracks before releasing the glass", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "../fractured-world.css"), "utf8");
  const total = Number(source.match(/const shatterDuration = (\d+);/)[1]);
  const release = Number(source.match(/const releaseTime = (\d+);/)[1]);
  assert.equal(total, 7500);
  assert.equal(release, 5800);
  assert.equal(total - release, 1700, "glass keeps its original fall time and speed");
  assert.ok(150 + 650 + (release - 1000) < release, "cracks finish growing before the simultaneous fall");
  assert.ok(release + 180 + 100 + 1200 < total, "splinters finish inside the full timeline");
  assert.match(source, /strokeDashoffset: 1, opacity: 0/);
  assert.match(css, /\.anniversary-shard-edges\s*\{[^}]*stroke-dashoffset: 1;[^}]*opacity: 0;/s);
  assert.match(source, /reducedMotion\.matches \? \[\[\[0, 0\]/);
  assert.doesNotMatch(css, /\.anniversary-dust|\.anniversary-screen-object|\.anniversary-fragment|\.fracture-overlay/);
});

test("both vines finish blooming exactly 750ms before the glass falls", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  const helper = source.slice(source.indexOf("  function growBirthdayVines("), source.indexOf("  async function shatterScreen("));
  const timings = [];
  const node = () => ({ style: {}, setAttribute() {}, append() {}, cloneNode() { return node(); } });
  const flower = { closest: node, querySelector: node };
  const releaseTime = Number(source.match(/const releaseTime = (\d+);/)[1]);
  const animations = [];
  vm.runInNewContext(`${helper}; growBirthdayVines(copy, animations); animations.forEach(run => run());`, {
    copy: { querySelector: () => flower }, animations, releaseTime, flowerGrowthEnd: releaseTime - 750,
    document: { createElementNS: node },
    animateFragment: (element, frames, options) => timings.push(options),
  });
  assert.equal(timings.length, 62, "two stems, 30 leaves and 30 flowers/buds");
  const lastEnd = Math.max(...timings.map(({ delay, duration }) => delay + duration));
  assert.equal(releaseTime - lastEnd, 750);
  assert.equal(timings.filter(({ duration }) => duration === 1000).length, 30, "flowers unfold gradually, not faster");
  assert.match(source, /duration: releaseTime - 1000/);
});

test("the progressive fracture remains visible before shards start falling", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  assert.doesNotMatch(source, /copy\.style\.opacity = "0"/);
  assert.match(source, /shard\.append\(outline\)/);
  assert.match(source, /strokeDashoffset: 0\.85, opacity: 0\.35/);
  assert.match(source, /duration: releaseTime - 1000/);
  assert.doesNotMatch(source, /transitionStartTime|staticGrowth/);
});

test("idle preparation builds small detached batches and refreshes after a viewport change", () => {
  const source = fs.readFileSync(path.join(__dirname, "../fractured-world.js"), "utf8");
  const helper = source.slice(source.indexOf("  function sceneKey("), source.indexOf("  function activate("));
  const jobs = [];
  let built = 0;
  let started = 0;
  const context = {
    preparedScene: null, preparationScheduled: false, transitioning: false,
    innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
    button: { getBoundingClientRect: () => ({ x: 10, y: 20, width: 500, height: 80 }) },
    menu: { className: "welcome-menu", scrollTop: 0, getClientRects: () => [1] },
    document: { body: { className: "world-fractured" } }, destination: { open: false },
    reducedMotion: { matches: false }, menuFacets: [],
    window: { requestIdleCallback: (job) => jobs.push(job) },
    buildShatterScene: function* () { started += 1; for (let i = 0; i < 4; i++) { built += 1; yield; } return { animations: [] }; },
  };
  vm.createContext(context);
  vm.runInContext(`${helper}; prepareScene(); prepareScene();`, context);
  assert.equal(jobs.length, 1, "duplicate events do not schedule duplicate preparation");
  jobs.shift()({ timeRemaining: () => 50 });
  assert.equal(built, 2, "at most two shards are built in one idle turn");
  assert.equal(started, 1);
  context.innerWidth = 360;
  jobs.shift()({ timeRemaining: () => 50 });
  assert.equal(started, 2, "stale viewport geometry is discarded");
  assert.match(source, /cached\?\.iterator \|\| buildShatterScene\(facets\)/);
  assert.match(source, /animations\.map\(\(run\) => run\(\)\)/);
});
