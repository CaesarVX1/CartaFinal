const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");
const countdown = source.slice(source.indexOf("function initializeNovemberCountdown("), source.indexOf("\ninitializeNovemberCountdown(novemberCountdown);"));
const deadline = Date.parse("2026-11-15T00:00:00+01:00");

function setup(time) {
  let now = time;
  let tick;
  let foreground;
  const classes = new Set();
  const fields = ["days", "hours", "minutes", "seconds"].map((unit) => ({ dataset: { countdown: unit }, textContent: "" }));
  const context = vm.createContext({
    Date: { parse: Date.parse, now: () => now },
    document: {
      hidden: false,
      body: { classList: { add: (name) => classes.add(name) } },
      addEventListener: (name, callback) => { if (name === "visibilitychange") foreground = callback; },
    },
    window: { setInterval: (callback) => { tick = callback; return 1; }, clearInterval: () => {} },
  });
  vm.runInContext(countdown, context);
  context.initializeNovemberCountdown({
    dataset: { deadline: "2026-11-15T00:00:00+01:00" },
    querySelectorAll: () => fields,
  });
  return { classes, fields, tick: () => tick(), foreground: () => foreground(), setTime: (value) => { now = value; } };
}

test("uses midnight in peninsular Spain, not the viewer's timezone", () => {
  assert.equal(deadline, Date.parse("2026-11-14T23:00:00Z"));
});
test("does not fracture even one millisecond before the deadline", () => {
  const page = setup(deadline - 1);
  assert.equal(page.classes.size, 0);
  assert.equal(page.fields.at(-1).textContent, "01");
});
test("switches an already open page at the deadline and zeros the counter", () => {
  const page = setup(deadline - 1000);
  page.setTime(deadline);
  page.tick();
  assert.ok(page.classes.has("world-fractured"));
  assert.ok(page.fields.every((field) => field.textContent === "00"));
});
test("switches immediately when loaded after the deadline", () => {
  assert.ok(setup(deadline + 1).classes.has("world-fractured"));
});
test("updates when a background tab becomes visible after midnight", () => {
  const page = setup(deadline - 60000);
  page.setTime(deadline + 60000);
  page.foreground();
  assert.ok(page.classes.has("world-fractured"));
});
