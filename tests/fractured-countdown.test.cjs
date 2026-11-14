const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const countdown = source.slice(source.indexOf("function initializeNovemberCountdown("), source.indexOf("\ninitializeNovemberCountdown(novemberCountdown);"));

function setup() {
  const fields = ["days", "hours", "minutes", "seconds"].map((unit) => ({ dataset: { countdown: unit }, textContent: "12" }));
  fields.forEach((field) => { field.nextElementSibling = { textContent: field.dataset.countdown }; });
  const timers = new Map();
  const listeners = {};
  let id = 0;
  let hiddenMenu = false;
  let menuChange;
  const doc = { hidden: false, addEventListener: (name, callback) => { listeners[name] = callback; } };
  const context = vm.createContext({
    Date: { parse: () => assert.fail("The final state must not consult the date"), now: () => assert.fail("The final state must not consult the clock") },
    document: doc,
    welcomeMenu: { classList: { contains: () => hiddenMenu } },
    MutationObserver: class { constructor(callback) { menuChange = callback; } observe() {} },
    setTimeout: (callback, delay) => { timers.set(++id, { callback, delay }); return id; },
    clearTimeout: (key) => timers.delete(key),
  });
  vm.runInContext(countdown, context);
  return { fields, context, timers, doc, listeners, setMenuHidden: (value) => { hiddenMenu = value; menuChange(); } };
}

test("the fractured appearance is active in the HTML before JavaScript runs", () => {
  assert.match(html, /<body\s+class="world-fractured">/);
  assert.doesNotMatch(html, /data-deadline=/);
});
test("the counter scrambles indefinitely with a single low-frequency timer", () => {
  const { fields, context, timers } = setup();
  context.initializeNovemberCountdown({ querySelectorAll: () => fields });
  for (let i = 0; i < 100; i++) {
    assert.ok(fields.every((field) => field.textContent.length === 2));
    assert.equal(timers.size, 1);
    const [id, job] = [...timers][0];
    assert.ok(job.delay >= 450 && job.delay < 850);
    timers.delete(id);
    job.callback();
  }
});

test("counter pauses offscreen and resumes without duplicate timers", () => {
  const h = setup();
  h.context.initializeNovemberCountdown({ querySelectorAll: () => h.fields });
  h.doc.hidden = true;
  h.listeners.visibilitychange();
  assert.equal(h.timers.size, 0);
  h.doc.hidden = false;
  h.listeners.visibilitychange();
  assert.equal(h.timers.size, 1);
  h.setMenuHidden(true);
  assert.equal(h.timers.size, 0);
  h.setMenuHidden(false);
  h.setMenuHidden(false);
  assert.equal(h.timers.size, 1);
});
test("initialization also tolerates a missing counter", () => {
  setup().context.initializeNovemberCountdown(null);
});
