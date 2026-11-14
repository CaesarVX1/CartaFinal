const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");

function setup() {
  const elements = [];
  const createElement = (tag) => {
    const events = new Map();
    const el = { tag, style: {}, children: [], open: false,
      append(...items) { this.children.push(...items); }, setAttribute() {},
      addEventListener(name, fn) { events.set(name, fn); },
      click(target) { events.get("click")?.({ target: target || this }); }, focus() {},
      showModal() { this.open = true; }, close() { this.open = false; },
    };
    elements.push(el);
    return el;
  };
  const env = { window: {}, document: { createElement, body: createElement("body") } };
  vm.runInNewContext(fs.readFileSync(path.join(root, "moon-reader.js"), "utf8"), env);
  let allowed = true;
  const image = { style: { transform: "translate3d(1px, 2px, 0)", width: "1200px", height: "700px" } };
  const api = env.window.createMoonReader({ parentElement: createElement("content") }, image, { matches: true, addEventListener() {} }, () => allowed);
  return { api, image, elements, allow: (value) => { allowed = value; }, find: (name) => elements.find((el) => el.className === name) };
}

test("lunar reader aligns the parchment hitbox and blocks opening before arrival", () => {
  const h = setup();
  const hit = h.find("moon-reader-hit"), dialog = h.find("moon-reader");
  hit.click();
  assert.equal(dialog.open, false);
  h.api.show();
  assert.deepEqual(hit.style, h.image.style);
  h.allow(false);
  hit.click();
  assert.equal(dialog.open, false);
  h.allow(true);
  hit.click();
  assert.equal(dialog.open, true);
});

test("lunar reader closes by button, backdrop, or leaving the route", () => {
  const h = setup();
  const hit = h.find("moon-reader-hit"), dialog = h.find("moon-reader");
  h.api.show(); hit.click();
  dialog.children[2].children[0].click();
  assert.equal(dialog.open, false);
  hit.click(); dialog.click();
  assert.equal(dialog.open, false);
  hit.click(); h.api.hide();
  assert.equal(dialog.open, false);
  assert.equal(hit.hidden, true);
});

test("reading surface stays solid and scrollable with no decorative text animation", () => {
  const css = fs.readFileSync(path.join(root, "moon-reader.css"), "utf8");
  assert.match(css, /background: #0d141b/);
  assert.match(css, /\.moon-reader__body \{[^}]*overflow: auto/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /text-shadow: none/);
  assert.match(css, /prefers-reduced-motion/);
});
