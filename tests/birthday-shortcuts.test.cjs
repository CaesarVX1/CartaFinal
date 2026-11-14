const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "..", "birthday-entry.js"), "utf8");
const skip = source.slice(source.indexOf("  function skipMoonThought()"), source.indexOf('  content.addEventListener("pointerdown"'));

function run(overrides = {}) {
  const state = { active: true, sceneChanging: false, messagesHidden: false, firstThoughtPending: false, moonIntroPending: false,
    moonPage: 0, thoughtIndex: 0, thoughtGap: false, activeScenes: [{ lines: [1, 2, 3] }], renders: 0, ...overrides };
  state.renderThought = () => { state.renders += 1; };
  vm.runInNewContext(`${skip}\nskipMoonThought();`, state);
  return state;
}

test("double-tap shortcut advances exactly one lunar thought, including during a gap", () => {
  assert.equal(run().thoughtIndex, 1);
  const gap = run({ thoughtIndex: 2, thoughtGap: true });
  assert.equal(gap.thoughtIndex, 3);
  assert.equal(gap.thoughtGap, false);
  assert.equal(gap.renders, 1);
});
test("shortcut never skips action buttons, arrival pauses, hidden messages or transitions", () => {
  for (const blocked of [{ thoughtIndex: 3 }, { active: false }, { sceneChanging: true },
    { messagesHidden: true }, { firstThoughtPending: true }, { moonIntroPending: true }, { moonPage: -1 }, { moonPage: 3 }]) {
    assert.equal(run(blocked).renders, 0);
  }
});
test("sunlight follows the illustration camera exactly and the tip requires confirmation", () => {
  assert.match(source, /moonSunlight\.hidden = moonPage !== 0/);
  assert.match(source, /scene\.append\(moonSunlight\)/);
  assert.match(source, /moonSunlight\.style\.transform = image\.style\.transform/);
  assert.match(source, /moonSunlight\.style\.width = `\$\{w\}px`/);
  assert.match(source, /moonSunlight\.style\.height = `\$\{h\}px`/);
  assert.match(source, /moonSkipHint\.showModal\(\)/);
  assert.match(source, /sceneChanging \|\| moonIntroPending \|\| thoughtIndex/);
  assert.doesNotMatch(source, /moonHintTimer/);
  assert.match(source, /Math\.hypot\(event\.clientX - moonTap\.x, event\.clientY - moonTap\.y\) > 14/);
  assert.match(source, /event\.target\.closest\("button, input, select, textarea, a, \.birthday-controls"\)/);
});
