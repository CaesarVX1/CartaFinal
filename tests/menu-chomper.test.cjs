const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "menu-chomper.css"), "utf8");
const script = fs.readFileSync(path.join(root, "menu-chomper.js"), "utf8");

test("Powder's monkey uses a local transparent asset and independent red eye clips", () => {
  const png = fs.readFileSync(path.join(root, "assets/powder-windup-monkey-v2.png"));
  assert.equal(png[25], 6, "RGBA PNG preserves a transparent background");
  assert.match(html, /<button type="button" class="menu-chomper" id="menu-chomper"/);
  assert.match(html, /src="\.\/assets\/powder-windup-monkey-v2\.png"/);
  assert.doesNotMatch(html, /src="\.\/assets\/jinx-chomper\.png"/);
  for (const eye of ["left", "right"]) {
    assert.match(html, new RegExp(`id="chomper-${eye}-eye"`));
    assert.ok(css.includes(`clip-path: url(#chomper-${eye}-eye)`));
  }
  assert.match(script, /eyePattern\(\)/);
  assert.match(css, /opacity: 0\.04/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /#ff4529/);
  assert.match(css, /\.menu-chomper__core\s*\{[^}]*radial-gradient[^}]*mix-blend-mode: screen/s);
});

test("the interactive toy retains its exact bounded row and footprint", () => {
  assert.match(css, /\.menu-chomper__toy \{[^}]*pointer-events: none/);
  assert.match(css, /width: clamp\(4rem, 8vw, 6rem\)/);
  assert.match(css, /flex: 0 0 clamp\(4rem, 8vw, 6rem\)/);
  assert.match(css, /aspect-ratio: 1/);
  assert.match(css, /\.welcome-menu__countdown-row \{ display: flex/);
  assert.match(script, /menu\.classList\.contains\("is-hidden"\)/);
  assert.doesNotMatch(css, /:root|\.anniversary-debris|\.anniversary-shard/);
});

test("hover, touch hold and keyboard winding stop on exit and reduced motion", () => {
  const events = new Map(), mediaEvents = new Map(), docEvents = new Map(), timers = new Map();
  const classes = new Set();
  let id = 0;
  const media = { matches: false, addEventListener: (name, callback) => mediaEvents.set(name, callback) };
  const monkey = { querySelector: () => ({}), classList: {
    remove: (name) => classes.delete(name), toggle: (name, value) => value ? classes.add(name) : classes.delete(name),
  }, addEventListener: (name, callback) => events.set(name, callback), setPointerCapture() {} };
  const menu = { classList: { contains: () => false } };
  const document = { hidden: false, body: {}, querySelector: (selector) => selector === "#welcome-menu" ? menu : selector === "#menu-chomper" ? monkey : null,
    addEventListener: (name, callback) => docEvents.set(name, callback) };
  vm.runInNewContext(script, { document, matchMedia: () => media,
    MutationObserver: class { observe() {} }, setTimeout: (fn) => { timers.set(++id, fn); return id; }, clearTimeout: (key) => timers.delete(key) });
  events.get("pointerenter")({ pointerType: "mouse" });
  assert.equal(classes.has("is-winding"), true);
  events.get("pointerleave")();
  assert.equal(classes.has("is-winding"), false);
  events.get("pointerdown")({ pointerType: "touch", button: 0, pointerId: 1 });
  assert.equal(classes.has("is-winding"), true);
  events.get("pointerup")();
  assert.equal(classes.has("is-winding"), false);
  events.get("keydown")({ key: " ", preventDefault() {} });
  assert.equal(classes.has("is-winding"), true);
  events.get("keyup")({ key: " ", preventDefault() {} });
  assert.equal(classes.has("is-winding"), false);
  events.get("pointerenter")({ pointerType: "mouse" });
  document.hidden = true; docEvents.get("visibilitychange")();
  assert.equal(classes.has("is-winding"), false);
  assert.equal(timers.size, 0);
  document.hidden = false; media.matches = true; mediaEvents.get("change")();
  events.get("pointerenter")({ pointerType: "mouse" });
  assert.equal(classes.has("is-winding"), false);
});

test("random eye patterns cover single, simultaneous and alternating eyes", () => {
  const helper = script.slice(script.indexOf("  function eyePattern("), script.indexOf("  function canPlay("));
  const patterns = [0, 1, 2, 3, 4].map((mode) => {
    let first = true;
    return vm.runInNewContext(`${helper}; eyePattern(random)`, { random: () => { if (first) { first = false; return (mode + 0.1) / 5; } return 0.5; } });
  });
  assert.equal(patterns[0][0].eye, "left");
  assert.equal(patterns[1][0].eye, "right");
  assert.equal(patterns[0].length, 1);
  assert.equal(patterns[1].length, 1);
  assert.equal(patterns[2][0].delay, patterns[2][1].delay);
  for (const pattern of patterns.slice(3)) {
    assert.ok(pattern[1].delay > pattern[0].duration);
    assert.notEqual(pattern[0].eye, pattern[1].eye);
  }
  assert.notEqual(patterns[3][0].eye, patterns[4][0].eye);
});
