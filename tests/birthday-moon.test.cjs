const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "birthday-entry.js"), "utf8");

test("the first lunar route uses the four existing illustrations in order", () => {
  const data = source.slice(source.indexOf("  const moonScenes = ["), source.indexOf("  const homeAlt"));
  const scenes = vm.runInNewContext(`${data}; moonScenes`);
  assert.equal(scenes.length, 4);
  assert.equal(scenes[0].action, "Dar una vuelta");
  assert.equal(scenes[1].action, "Acercarse");
  assert.equal(scenes[2].action, "Sentarse");
  assert.equal(scenes[2].title, "¿Qué es esto?");
  assert.equal(scenes[2].lines.length, 3);
  assert.match(source, /changeScene\(moonScenes\[3\]\.src, moonScenes\[3\]\.alt, 3/);
  scenes.forEach(({ src }) => assert.ok(fs.existsSync(path.resolve(root, src))));
  assert.match(source, /button\.dataset\.birthdayPath === "1"/);
  assert.match(source, /changeScene\(moonScenes\[1\]\.src/);
});

test("lunar navigation keeps parallax, suppresses fireworks and restores the birthday background", () => {
  assert.match(source, /changeScene\(homeImage, homeAlt, -1, showPaths\)/);
  assert.match(source, /image\.src = homeImage/);
  assert.match(source, /if \(!active \|\| moonPage >= 0 \|\| reducedMotion\.matches/);
  assert.match(source, /content\.addEventListener\("pointermove"/);
  assert.match(source, /if \(sceneChanging\) return/);
  assert.match(source, /epoch !== sceneEpoch \|\| !active/);
});

test("approaching the crater uses smooth footsteps for 4.25 seconds before changing the illustration", () => {
  const helper = source.slice(source.indexOf("  function walkingFrames("), source.indexOf("  async function changeScene("));
  const frames = vm.runInNewContext(`${helper}; walkingFrames()`);
  assert.equal(frames.length, 137);
  assert.equal(frames[0].offset, 0);
  assert.equal(frames.at(-1).offset, 1);
  assert.match(frames[0].transform, /scale\(1\)/);
  assert.match(frames.at(-1).transform, /scale\(1\.12\)/);
  assert.match(source, /duration: reducedMotion\.matches \? 0 : 4250/);
  assert.ok(source.indexOf("await walking.finished") < source.indexOf("const fade = [scene, panel]"));
  assert.match(source, /changeScene\(moonScenes\[2\]\.src/);
});

test("all three lunar messages alternate four-second thoughts and one-second empty pauses", () => {
  const data = source.slice(source.indexOf("  const moonScenes = ["), source.indexOf("  const homeAlt"));
  const helpers = source.slice(source.indexOf("  function clearThoughtTimer("), source.indexOf("  const sceneImages"));
  for (const moonPage of [0, 1, 2]) {
    const jobs = [];
    const panel = { hidden: false };
    const next = { hidden: true };
    const title = { textContent: "", animate() {} };
    const context = vm.createContext({
      moonPage, panel, next, title, active: true, sceneChanging: false, moonIntroPending: true,
      reducedMotion: { matches: true }, copy: { replaceChildren() {} }, step: {},
      messageToggle: { addEventListener() {} },
      setTimeout: (callback, delay) => { jobs.push({ callback, delay }); return jobs.length; },
      clearTimeout() {},
    });
    vm.runInContext(`${data}; let thoughtIndex = 0, thoughtTimer = null, thoughtGap = false, messagesHidden = false, firstThoughtPending = true; ${helpers}; scheduleThought();`, context);
    assert.equal(jobs.length, 0, "wait for the introduction popup confirmation");
    vm.runInContext("moonIntroPending = false; scheduleThought();", context);
    const initial = jobs.shift();
    assert.equal(initial.delay, 1500, "wait before the first thought in either scene");
    initial.callback();
    const count = vm.runInContext("moonScenes[moonPage].lines.length", context);
    for (let index = 0; index < count; index++) {
      assert.equal(next.hidden, true, "no action before the last thought");
      const visible = jobs.shift();
      assert.equal(visible.delay, 4000);
      visible.callback();
      assert.equal(panel.hidden, true, "hide the whole message during the pause");
      const gap = jobs.shift();
      assert.equal(gap.delay, 1000);
      gap.callback();
      assert.equal(panel.hidden, false);
    }
    assert.equal(next.hidden, false, "last thought reveals the scene action");
    assert.equal(jobs.length, 0, "keep the final action available");
  }
});
