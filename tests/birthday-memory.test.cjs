const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");

test("portrait fireworks and their guide assets are no longer loaded by the page", () => {
  const source = fs.readFileSync(path.join(root, "birthday-memory.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(source, /const portraits = \[\]/);
  assert.match(source, /if \(!brush \|\| !portraits\.length \|\| portraitTextures\.size\) return/);
  assert.doesNotMatch(html, /src="[^"\n]*the100-portraits/);
});

function setup(reduced = false, deferFrames = false) {
  const nodes = [], animations = [], delays = [];
  const frames = [];
  const createElement = () => {
    const events = new Map(), attributes = new Map();
    const node = { children: [], style: {}, hidden: false, open: false, complete: true, naturalWidth: 800,
      append(...items) { this.children.push(...items); },
      setAttribute: (key, value) => attributes.set(key, value),
      getAttribute: (key) => attributes.get(key),
      addEventListener: (name, callback) => events.set(name, callback),
      click: (pointerType) => events.get("click")?.({ pointerType, target: node }),
      showModal() { this.open = true; }, close() { this.open = false; events.get("close")?.(); }, focus() {},
      animate(frames, options) { animations.push({ frames, options }); return { finished: Promise.resolve(), cancel() {} }; },
    };
    nodes.push(node); return node;
  };
  const env = { window: {}, document: { createElement, body: createElement(), addEventListener() {} }, Image: class { decode() { return Promise.resolve(); } },
    cancelAnimationFrame() {}, requestAnimationFrame(callback) { if (deferFrames) frames.push(callback); else callback(0); return 1; },
    setTimeout: (resolve, delay) => { delays.push(delay); resolve(); } };
  vm.runInNewContext(fs.readFileSync(path.join(root, "birthday-memory.js"), "utf8"), env);
  const image = { style: { width: "1200px", height: "700px", transform: "translate3d(1px, 2px, 0)" } };
  const api = env.window.createBirthdayMemory(createElement(), createElement(), image, { matches: reduced, addEventListener() {} });
  return { api, nodes, animations, delays, image, flushFrames() { while (frames.length) frames.shift()(0); } };
}

test("memory scene holds the last blink closed while the image changes", async () => {
  const h = setup();
  let swaps = 0;
  await h.api.enter(async (src) => {
    swaps += 1;
    assert.ok(src.endsWith("Parte 4/Parte 1.png"));
    assert.deepEqual(h.delays, [2500]);
    h.api.show();
  });
  assert.equal(swaps, 1);
  assert.equal(h.animations[0].options.duration, 5000);
  assert.equal(h.animations[0].frames.find((frame) => frame.offset === 0.8).opacity, 1);
  assert.equal(h.animations[0].options.easing, "linear", "per-blink easing preserves the blackout swap window");
  const world = h.nodes.find((node) => node.className === "birthday-memory");
  assert.deepEqual(world.style, h.image.style);
  assert.equal(h.nodes.find((node) => node.className === "birthday-memory-blink").hidden, true);
});

test("touch independently restores one silhouette and exit clears both", () => {
  const h = setup();
  const hint = h.nodes.find((node) => node.className === "memory-explore-hint");
  assert.equal(hint.hidden, true);
  h.api.show();
  assert.equal(hint.hidden, false);
  assert.match(hint.textContent, /Cerrar y continuar/);
  const people = h.nodes.filter((node) => node.className === "birthday-memory__person");
  people[0].click("touch");
  assert.equal(people[0].getAttribute("aria-pressed"), "true");
  people[1].click("touch");
  assert.equal(people[0].getAttribute("aria-pressed"), "false");
  assert.equal(people[1].getAttribute("aria-pressed"), "true");
  h.api.hide();
  assert.equal(hint.hidden, true);
  assert.ok(people.every((person) => person.getAttribute("aria-pressed") === "false"));
});

test("each boy opens his personal memory followed by the correctly assigned photo or drawing", () => {
  const h = setup();
  const people = h.nodes.filter((node) => node.className === "birthday-memory__person");
  const reader = h.nodes.find((node) => node.className === "memory-reader");
  people[1].click("mouse");
  assert.equal(reader.open, false, "hidden scene cannot open the reader");
  h.api.show();
  for (const [index, filename] of [[1, "Parte 3.png"], [0, "Parte 4.jpg"]]) {
    people[index].click("mouse");
    assert.equal(reader.open, true);
    assert.equal(reader.className, "memory-reader");
    const body = reader.children[1];
    const [text, photo] = body.children;
    assert.match(text.textContent, index === 0 ? /primer regalo.*\n\n/s : /19\.º cumpleaños/);
    assert.doesNotMatch(text.textContent, /Lorem ipsum/);
    assert.equal(photo.hidden, true);
    reader.children[2].children[0].click();
    assert.equal(reader.className, "memory-reader memory-reader--photo");
    assert.equal(photo.hidden, false);
    assert.equal(reader.children[0].children[1].textContent, "Cerrar y continuar");
    assert.equal(text.hidden, true);
    assert.ok(photo.src.endsWith(filename));
    assert.ok(fs.existsSync(path.join(root, photo.src)));
    reader.children[0].children[1].click();
    assert.equal(reader.open, false);
  }
  people[0].click("touch");
  h.api.hide();
  assert.equal(reader.open, false, "leaving the entry also closes its reader");
});

test("birthday finale requires both loaded photos, appears on closing the second, and only once", () => {
  for (const order of [[0, 1], [1, 0]]) {
    const h = setup();
    h.api.show();
    const people = h.nodes.filter((node) => node.className === "birthday-memory__person");
    const reader = h.nodes.find((node) => node.className === "memory-reader");
    const finale = h.nodes.find((node) => node.className === "memory-reader memory-reader--final");
    const reopen = h.nodes.find((node) => node.className === "anniversary-destination__back memory-finale-reopen");
    assert.equal(reopen.hidden, true);
    const next = reader.children[2].children[0], close = reader.children[0].children[1];
    people[order[0]].click("touch"); close.click();
    assert.equal(finale.open, false, "text alone does not count");
    for (const index of [order[0], order[0]]) {
      people[index].click("mouse"); next.click(); close.click();
      assert.equal(finale.open, false, "reopening the same photo does not count twice");
    }
    people[order[1]].click("mouse"); next.click();
    assert.equal(finale.open, false, "do not cover the second image");
    close.click();
    assert.equal(finale.open, true);
    finale.children[2].children[0].click();
    assert.equal(finale.open, false);
    assert.equal(reopen.hidden, false);
    reopen.click();
    assert.equal(finale.open, true);
    assert.equal(reopen.hidden, true);
    finale.children[2].children[0].click();
    people[0].click("mouse"); next.click(); close.click();
    assert.equal(finale.open, false, "do not repeat the final greeting");
    h.api.hide();
    assert.equal(reopen.hidden, true);
    h.api.show();
    assert.equal(reopen.hidden, false, "completed greeting remains available on returning");
  }
});

test("photo viewer stays bounded instead of covering the full viewport", () => {
  const css = fs.readFileSync(path.join(root, "birthday-memory.css"), "utf8");
  assert.match(css, /width: min\(72rem, 88vw\); height: 84dvh/);
  assert.match(css, /\.memory-reader--photo \.memory-reader__photo \{[^}]*object-fit: contain/);
  assert.match(css, /width: calc\(100% - 1\.5rem\); height: 80dvh/);
});

test("exploration hint is a subtle sibling above controls, never a button-row flex item", () => {
  const source = fs.readFileSync(path.join(root, "birthday-memory.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "birthday-memory.css"), "utf8");
  assert.match(source, /if \(controls\) controls\.before\(exploreHint\)/);
  const rule = css.match(/\.memory-explore-hint \{([^}]+)\}/)[1];
  assert.match(rule, /background: none/);
  assert.match(rule, /border: 0/);
  assert.doesNotMatch(rule, /(?:^|;)\s*(?:flex|order):/);
});

test("leaving the scene cannot open its finale or leave it over the menu", () => {
  const h = setup(); h.api.show();
  const people = h.nodes.filter((node) => node.className === "birthday-memory__person");
  const reader = h.nodes.find((node) => node.className === "memory-reader");
  const finale = h.nodes.find((node) => node.className === "memory-reader memory-reader--final");
  for (const index of [0, 1]) {
    people[index].click("mouse"); reader.children[2].children[0].click();
    if (index === 0) reader.children[0].children[1].click();
  }
  h.api.hide();
  assert.equal(finale.open, false);
});

test("late-loading photos are counted at close and the final opens after the image is dismissed", () => {
  const h = setup(false, true); h.api.show();
  const people = h.nodes.filter((node) => node.className === "birthday-memory__person");
  const reader = h.nodes.find((node) => node.className === "memory-reader");
  const finale = h.nodes.find((node) => node.className === "memory-reader memory-reader--final");
  const photo = reader.children[1].children[1];
  for (const index of [0, 1]) {
    people[index].click("mouse");
    photo.complete = false;
    reader.children[2].children[0].click();
    photo.complete = true;
    reader.children[0].children[1].click();
  }
  assert.equal(reader.open, false);
  assert.equal(finale.open, false, "wait until the browser has removed the photo dialog");
  h.flushFrames();
  assert.equal(finale.open, true);
  const copy = finale.children[1].children.map((p) => p.textContent).join(" ");
  assert.doesNotMatch(copy, /septiembre|yo del futuro/);
});

test("leaving before the deferred final cannot show it over the menu", () => {
  const h = setup(false, true); h.api.show();
  const people = h.nodes.filter((node) => node.className === "birthday-memory__person");
  const reader = h.nodes.find((node) => node.className === "memory-reader");
  const finale = h.nodes.find((node) => node.className === "memory-reader memory-reader--final");
  for (const person of people) {
    person.click("mouse"); reader.children[2].children[0].click(); reader.children[0].children[1].click();
  }
  h.api.hide(); h.flushFrames();
  assert.equal(finale.open, false);
});

test("cancelling loading cannot switch scenes, and reduced motion avoids blinking", async () => {
  const h = setup();
  const run = h.api.enter(() => assert.fail("cancelled scene must not open"));
  h.api.hide();
  await run;
  const reduced = setup(true);
  await reduced.api.enter(() => {});
  assert.equal(reduced.animations[0].frames.length, 2);
  assert.equal(reduced.delays.length, 0);
});

test("reference overlays remain partial and both image files exist", () => {
  const css = fs.readFileSync(path.join(root, "birthday-memory.css"), "utf8");
  assert.match(css, /opacity: 0\.62/);
  assert.match(css, /transition: opacity 1s ease/);
  for (const number of [1, 2]) assert.ok(fs.existsSync(path.join(root, `Entrada Cumpleaños/Parte 4/Parte ${number}.png`)));
});

test("memory fireworks mix traditional, heart and star bursts with slower bounded pacing", () => {
  const source = fs.readFileSync(path.join(root, "birthday-memory.js"), "utf8");
  assert.match(source, /Math\.random\(\) < 0\.35/);
  assert.match(source, /"heart", "star", "crescent", "infinity", "diamond", "flower", "ring"/);
  assert.match(source, /nextLaunch = 5 \+ Math\.random\(\) \* 1\.5/);
  assert.match(source, /bursts\.filter\(\(burst\) => !burst\.special\)\.length < 2/);
  assert.match(source, /burst\.age - 2\.1/);
  assert.match(source, /launchY: 0\.7 \+ Math\.random\(\) \* 0\.08/);
  assert.match(source, /createLinearGradient\(x, y, tx, ty \+ 1\)/);
  assert.match(source, /brush\.clip\("evenodd"\)/);
  assert.match(source, /4\.2 \+ Math\.random\(\) \* 1\.8/);
  assert.match(source, /world\.hidden \|\| document\.hidden \|\| reducedMotion\.matches/);
  assert.match(source, /fireworks\.style\.transform = image\.style\.transform/);
});

test("portraits launch alongside normal fireworks and wait fifteen seconds after the trail ends", () => {
  const source = fs.readFileSync(path.join(root, "birthday-memory.js"), "utf8");
  const scheduler = source.slice(source.indexOf("    function launchFireworks("), source.indexOf("    function stopFireworks("));
  const state = { bursts: [{ special: false, age: 0 }, { special: false, age: 0 }], nextLaunch: 0,
    portraits: [{ name: "Lexa" }], nextPortrait: 15, portraitActive: false, makeBurst: (special = false) => ({ special, age: 0 }) };
  vm.createContext(state);
  vm.runInContext(scheduler, state);
  vm.runInContext("launchFireworks(15)", state);
  assert.equal(state.bursts.length, 3, "special launch is independent of the two normal slots");
  assert.equal(state.portraitActive, true);
  vm.runInContext("launchFireworks(20)", state);
  assert.equal(state.bursts.filter((burst) => burst.special).length, 1);
  state.bursts.find((burst) => burst.special).age = 11.1;
  vm.runInContext("pruneFireworks()", state);
  assert.equal(state.portraitActive, true);
  state.bursts.find((burst) => burst.special).age = 11.3;
  vm.runInContext("pruneFireworks()", state);
  assert.equal(state.nextPortrait, 15);
  assert.equal(state.portraitActive, false);
  vm.runInContext("launchFireworks(14.9)", state);
  assert.equal(state.bursts.filter((burst) => burst.special).length, 0);
  vm.runInContext("launchFireworks(0.2)", state);
  assert.equal(state.bursts.filter((burst) => burst.special).length, 1);
});

test("portraits rotate in shuffled complete rounds without repeats at round boundaries", () => {
  const source = fs.readFileSync(path.join(root, "birthday-memory.js"), "utf8");
  const selector = source.slice(source.indexOf("    function takePortrait("), source.indexOf("    function makeBurst("));
  const state = { portraits: [{ name: "Lexa" }, { name: "Octavia" }, { name: "Clarke" }], portraitBag: [], lastPortrait: -1 };
  vm.createContext(state);
  vm.runInContext(selector, state);
  let last = null;
  for (let round = 0; round < 30; round += 1) {
    const names = [];
    for (let i = 0; i < 3; i += 1) {
      const name = vm.runInContext("takePortrait().name", state);
      assert.notEqual(name, last);
      names.push(name); last = name;
    }
    assert.equal(new Set(names).size, 3);
  }
  assert.doesNotMatch(source, /getJinxPoints|nextJinx|jinxActive/);
});

test("each detailed portrait has bounded normalized particle data and a distinct identity", () => {
  const env = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "assets/the100-portraits.js"), "utf8"), env);
  const portraits = env.window.CARTA_FIREWORK_PORTRAITS;
  assert.equal(portraits.map((p) => p.name).join(","), "Lexa,Octavia,Clarke");
  portraits.forEach(({ points }) => {
    assert.ok(points.length >= 700 && points.length <= 850);
    assert.ok(points.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && Math.abs(x) <= 1 && Math.abs(y) <= 1));
  });
});

test("cached face renderer uses three draws regardless of portrait detail", () => {
  const source = fs.readFileSync(path.join(root, "birthday-memory.js"), "utf8");
  const renderer = source.slice(source.indexOf("    function drawPortrait("), source.indexOf("    function paintFireworks("));
  const draws = [];
  const context = { brush: { drawImage: (...args) => draws.push(args) } };
  vm.createContext(context);
  vm.runInContext(renderer, context);
  context.burst = { x: 0.5, y: 0.21, face: { sharp: {}, glow: {} } };
  vm.runInContext("drawPortrait(burst, 2, 1100, 620)", context);
  assert.equal(draws.length, 3);
  assert.ok(draws.every(([, x, y, w, h]) => [x, y, w, h].every(Number.isFinite) && w > 0 && h > 0));
  vm.runInContext("drawPortrait(burst, 9, 1100, 620)", context);
  assert.equal(draws.length, 3, "no work once the portrait has faded");
  const css = fs.readFileSync(path.join(root, "birthday-memory.css"), "utf8");
  assert.match(css, /mix-blend-mode: screen/, "black atlas pixels must not obscure the scene");
});

test("special launch keeps only 24 moving sparks, with the full cached face intact", () => {
  const source = fs.readFileSync(path.join(root, "birthday-memory.js"), "utf8");
  const helper = source.slice(source.indexOf("    function makeBurst("), source.indexOf("    function launchFireworks("));
  const face = { sharp: {}, glow: {} };
  const context = { window: { innerWidth: 400 }, colors: ["237,224,185"],
    portraitTextures: new Map([["Lexa", face]]), glowSprite: () => ({}),
    takePortrait: () => ({ name: "Lexa", points: Array.from({ length: 850 }, (_, i) => [Math.sin(i), Math.cos(i)]) }) };
  const burst = vm.runInNewContext(`${helper}; makeBurst(true);`, context);
  assert.equal(burst.particles.length, 24);
  assert.equal(burst.face, face);
  assert.ok(burst.particles.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
  assert.ok(fs.existsSync(path.join(root, "assets/the100-portrait-guide.png")));
});
