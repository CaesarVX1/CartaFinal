const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "birthday-entry.js"), "utf8");
const data = source.slice(source.indexOf("  const moonScenes = ["), source.indexOf("  const homeAlt"));

test("park route uses all five existing images in order", () => {
  const scenes = vm.runInNewContext(`${data}; parkScenes;`);
  assert.equal(scenes.length, 5);
  scenes.forEach((scene, index) => {
    assert.equal(scene.src, `./Entrada Cumpleaños/Parte 3 (Parque)/Parte ${index + 1}.png`);
    assert.ok(fs.existsSync(path.join(root, scene.src)));
    if (index < 4) assert.ok(scene.lines.length && scene.action);
  });
  assert.equal(scenes[3].action, "Leer en un sitio más iluminado");
});

test("park walks only from scene one to two; later transitions are normal fades", () => {
  const handler = source.slice(source.indexOf('  next.addEventListener("click"'), source.indexOf('  back.addEventListener("click"'));
  for (const moonPage of [0, 1, 2, 3]) {
    let click, transition;
    const state = { moonPage, sceneChanging: false,
      next: { addEventListener: (_, callback) => { click = callback; } },
      showMoonMessage() {}, changeScene: (...args) => { transition = args; },
      paths: {}, toggle: {}, panel: {}, messageToggle: {}, back: {}, parkAtmosphere: { show() {} }, parkLetter: { show() {} } };
    vm.runInNewContext(`${data}; activeScenes = parkScenes; ${handler}`, state);
    click();
    assert.equal(transition[0], `./Entrada Cumpleaños/Parte 3 (Parque)/Parte ${moonPage + 2}.png`);
    assert.equal(transition[2], moonPage + 1);
    assert.equal(transition[4], moonPage === 0);
    if (moonPage === 3) {
      transition[3]();
      assert.equal(state.panel.hidden, true);
      assert.equal(state.back.hidden, false);
    }
  }
});

test("park shares camera, timed messages, confirmation and double-tap controls without lunar rays", () => {
  assert.match(source, /birthdayPath === "3"[\s\S]*?activeScenes = parkScenes/);
  assert.match(source, /const entry = activeScenes\[moonPage\]/);
  assert.match(source, /moonSunlight\.hidden = moonPage !== 0 \|\| activeScenes !== moonScenes/);
  assert.match(source, /function showPaths\(\) \{\s*clearMoonExtras\(\);\s*parkAtmosphere\.hide\(\);\s*parkLetter\.hide\(\);\s*restoreParkMusic\(\);\s*activeScenes = moonScenes/);
});

test("park atmosphere is camera-aligned, bounded and respects reduced motion", () => {
  const effects = fs.readFileSync(path.join(root, "park-atmosphere.js"), "utf8");
  assert.match(effects, /layer\.style\.transform = image\.style\.transform/);
  assert.match(effects, /Math\.min\(image\.naturalWidth, 900\)/);
  assert.match(effects, /1000 \/ 24/);
  assert.match(effects, /document\.hidden \|\| reducedMotion\.matches/);
  assert.match(effects, /2: \[\[\[0, 0\.46\]/);
  assert.match(effects, /4: \[/);
  assert.match(effects, /cancelAnimationFrame\(frame\)/);
});

test("water animation runs only in park scenes three and five and stops on exit", () => {
  const pending = new Set();
  let id = 0;
  const ctx = { clearRect() {} };
  const environment = {
    window: {},
    document: { hidden: false, addEventListener() {}, createElement: () => ({
      style: { setProperty() {} }, append() {}, setAttribute() {}, getContext: () => ctx,
    }) },
    requestAnimationFrame: () => { pending.add(++id); return id; },
    cancelAnimationFrame: (key) => pending.delete(key),
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, "park-atmosphere.js"), "utf8"), environment);
  const image = { style: { transform: "translate3d(2px, 3px, 0)", width: "1200px", height: "900px" } };
  const reduced = { matches: false, addEventListener() {} };
  const effect = environment.window.createParkAtmosphere({ append() {} }, image, reduced);
  for (const page of [0, 1, 3]) { effect.show(page); assert.equal(pending.size, 0); }
  for (const page of [2, 4]) { effect.show(page); assert.equal(pending.size, 1); }
  effect.hide();
  assert.equal(pending.size, 0);
  reduced.matches = true;
  effect.show(2);
  assert.equal(pending.size, 0);
});

test("pond renderer samples bounded local waves and caches its feathered mask", () => {
  let callback;
  const draws = [];
  let maskFills = 0;
  const methods = { clearRect() {}, save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {}, ellipse() {}, stroke() {} };
  const ctx = { ...methods, fill() {}, drawImage: (...args) => draws.push(args) };
  const mask = { ...methods, fill() { maskFills += 1; } };
  let canvasCount = 0;
  const env = { window: {}, document: { hidden: false, addEventListener() {}, createElement: (tag) => ({
    style: { setProperty() {} }, append() {}, setAttribute() {},
    getContext: () => (++canvasCount === 1 ? ctx : mask),
  }) }, requestAnimationFrame: (fn) => { callback = fn; return 1; }, cancelAnimationFrame() {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "park-atmosphere.js"), "utf8"), env);
  const image = { naturalWidth: 1448, naturalHeight: 1086, style: {} };
  const effect = env.window.createParkAtmosphere({ append() {} }, image, { matches: false, addEventListener() {} });
  for (const page of [2, 4]) {
    effect.show(page);
    for (const time of [1000, 2000]) {
      draws.length = 0;
      callback(time);
      const samples = draws.filter((args) => args[0] === image);
      assert.ok(samples.length > 100 && samples.length < 1200);
      samples.forEach(([, sx, sy, sw, sh]) => {
        assert.ok(sx >= 0 && sy >= 0);
        assert.ok(sx + sw <= image.naturalWidth + 0.01);
        assert.ok(sy + sh <= image.naturalHeight + 0.01);
      });
    }
  }
  assert.equal(maskFills, 2, "one cached mask per scene, not per frame");
});
