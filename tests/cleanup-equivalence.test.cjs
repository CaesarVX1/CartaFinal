const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

test("terminal progress retains every width update and avoids duplicate label mutations", () => {
  const source = read("script.js");
  const helper = source.slice(source.indexOf("  function updateCyberProgress("), source.indexOf("  function pauseCyberSequenceAt("));
  let text = "", aria = null, textWrites = 0, ariaWrites = 0;
  const fill = { style: {} };
  const value = { get textContent() { return text; }, set textContent(next) { text = next; textWrites++; } };
  const track = { getAttribute: () => aria, setAttribute: (name, next) => { aria = next; ariaWrites++; } };
  const context = vm.createContext({ cyberProgressFill: fill, cyberProgressValue: value, cyberProgressTrack: track });
  vm.runInContext(helper, context);
  const progress = [-1, 0, 0.1, 0.2, 15, 15.1, 40, 60, 80, 95, 100, 101];
  for (const input of progress) {
    context.input = input;
    vm.runInContext("updateCyberProgress(input)", context);
    const safe = Math.max(0, Math.min(100, input));
    assert.equal(fill.style.width, `${safe}%`);
    assert.equal(text, `${Math.round(safe)}%`);
    assert.equal(aria, String(Math.round(safe)));
  }
  assert.ok(textWrites < progress.length);
  assert.ok(ariaWrites < progress.length);
});

test("viewport caching preserves exact rounded CSS values and still measures the dock", () => {
  const source = read("navigation-ui.js");
  const helper = source.slice(source.indexOf("  function updateViewport("), source.indexOf("  function queueViewport("));
  const writes = [];
  let dockMeasures = 0;
  const viewport = { height: 739.6, offsetTop: 0.2 };
  const context = vm.createContext({
    viewportQueued: false, viewportHeight: -1, viewportTop: -1, innerHeight: 740,
    window: { visualViewport: viewport },
    document: { body: { style: { setProperty: (name, value) => writes.push([name, value]) } } },
    measureDock: () => dockMeasures++,
  });
  vm.runInContext(`${helper}; updateViewport(); updateViewport();`, context);
  assert.deepEqual(writes, [["--viewport-height", "740px"], ["--viewport-top", "0px"]]);
  assert.equal(dockMeasures, 2);
  viewport.height = 740.1;
  vm.runInContext("updateViewport()", context);
  assert.equal(writes.length, 2, "same rounded viewport does not rewrite CSS variables");
  viewport.height = 420.4;
  viewport.offsetTop = 32.8;
  vm.runInContext("updateViewport()", context);
  assert.deepEqual(writes.slice(2), [["--viewport-height", "420px"], ["--viewport-top", "33px"]]);
});
