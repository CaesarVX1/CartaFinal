const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "menu-chomper.css"), "utf8");
const script = fs.readFileSync(path.join(root, "menu-chomper.js"), "utf8");

test("the chomper uses a local transparent asset and independent eye clips", () => {
  const png = fs.readFileSync(path.join(root, "assets/jinx-chomper.png"));
  assert.equal(png[25], 6, "RGBA PNG preserves a transparent background");
  assert.match(html, /id="menu-chomper" role="img"/);
  for (const eye of ["left", "right"]) {
    assert.match(html, new RegExp(`id="chomper-${eye}-eye"`));
    assert.ok(css.includes(`clip-path: url(#chomper-${eye}-eye)`));
  }
  assert.match(script, /eyePattern\(\)/);
  assert.match(css, /opacity: 0\.04/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(html, /class="menu-chomper__mouth" aria-hidden="true"/);
  assert.match(css, /\.menu-chomper__mouth\s*\{[^}]*radial-gradient[^}]*mix-blend-mode: screen/s);
});

test("the decoration cannot intercept controls and has a bounded mobile row", () => {
  assert.match(css, /pointer-events: none/);
  assert.match(css, /\.welcome-menu__countdown-row \{ display: flex/);
  assert.match(script, /menu\.classList\.contains\("is-hidden"\)/);
  assert.doesNotMatch(css, /:root|\.anniversary-debris|\.anniversary-shard/);
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
