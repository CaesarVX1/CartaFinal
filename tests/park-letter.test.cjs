const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");

function harness() {
  const elements = [];
  function element(tag) {
    const events = new Map();
    const item = { tag, style: {}, children: [], hidden: false, open: false,
      append(...children) { this.children.push(...children); }, setAttribute() {},
      addEventListener(name, fn) { events.set(name, fn); },
      click(target) { events.get("click")?.({ target: target || this }); }, focus() {}, animate: () => ({ cancel() {} }),
      showModal() { this.open = true; }, close() { this.open = false; events.get("close")?.(); },
    };
    elements.push(item);
    return item;
  }
  const env = { window: {}, document: { createElement: element, body: element("body") } };
  vm.runInNewContext(fs.readFileSync(path.join(root, "park-letter.js"), "utf8"), env);
  const scene = { parentElement: element("content"), closest: () => ({ open: true }) };
  const image = { style: { transform: "translate3d(2px, 3px, 0)", width: "1200px", height: "900px" } };
  const api = env.window.createParkLetter(scene, image, { matches: true });
  return { api, scene, image, elements, find: (name) => elements.find((el) => el.className === name) };
}

test("only the fifth park image has a letter hitbox, aligned with the photograph", () => {
  const h = harness();
  const hit = h.find("park-letter-hit");
  for (const page of [-1, 0, 1, 2, 3]) { h.api.show(page); assert.equal(hit.hidden, true); }
  h.api.show(4);
  assert.equal(hit.hidden, false);
  assert.deepEqual(hit.style, h.image.style);
  assert.ok(h.scene.parentElement.children.includes(hit), "hitbox must sit above the transparent scene body");
});

test("letter opens at text, shows an unframed image viewer and closes on route exit", () => {
  const h = harness();
  h.api.show(4);
  h.find("park-letter-hit").click();
  const dialog = h.find("park-letter");
  assert.equal(dialog.open, true);
  const footer = dialog.children[2];
  assert.equal(h.find("park-letter__image").hidden, true);
  footer.children[2].click();
  assert.match(dialog.className, /park-letter--viewer/);
  assert.equal(footer.hidden, true);
  assert.equal(h.find("park-letter__text").hidden, true);
  assert.equal(h.find("park-letter__image").hidden, false);
  assert.equal(footer.children[2].disabled, true);
  footer.children[0].click();
  assert.equal(h.find("park-letter__text").hidden, false);
  h.api.hide();
  assert.equal(dialog.open, false);
});

test("friends letter can zoom and closes by clicking outside or the explicit close button", () => {
  const h = harness();
  const dialog = h.find("park-letter");
  const openImage = () => {
    h.api.show(4);
    h.find("park-letter-hit").click();
    dialog.children[2].children[2].click();
  };
  openImage();
  const picture = h.find("park-letter__image").children[0];
  picture.click();
  assert.match(dialog.className, /park-letter--zoomed/);
  picture.click();
  assert.doesNotMatch(dialog.className, /park-letter--zoomed/);
  dialog.click(h.find("park-letter__body"));
  assert.equal(dialog.open, false);
  openImage();
  h.find("park-letter__close").click();
  assert.equal(dialog.open, false);
});

test("letter is scrollable on small screens and its hitbox covers the paper polygon", () => {
  const css = fs.readFileSync(path.join(root, "park-atmosphere.css"), "utf8");
  assert.match(css, /clip-path: polygon\(37\.4% 32\.2%, 65\.6% 32\.7%, 73\.8% 87\.9%, 31\.8% 88\.8%\)/);
  assert.match(css, /\.park-letter__body \{[^}]*overflow: auto/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /\.birthday-entry:has\(\.park-letter-hit:not\(\[hidden\]\)\) \.birthday-controls \{ z-index: 4/);
});
