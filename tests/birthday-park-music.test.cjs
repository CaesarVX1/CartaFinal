const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "..", "birthday-entry.js"), "utf8");
const helpers = source.slice(source.indexOf("  let parkMusicSnapshot"), source.indexOf("  function syncMusicControls()"));

function harness(paused = false) {
  const events = new Map();
  const audio = { currentTime: 72.125, paused, loop: true, track: "previous.mp3",
    getAttribute() { return this.track; },
    set src(value) { this.track = value; this.currentTime = 0; },
    pause() { this.paused = true; },
    addEventListener(name, callback) { events.set(name, callback); },
    removeEventListener(name, callback) { if (events.get(name) === callback) events.delete(name); },
  };
  const audioChange = { hidden: false };
  const state = { audio, audioChange, closeMusicPanel() {}, parkTrack: "park.mp4", playMusic: () => { audio.paused = false; }, syncMusicControls() {} };
  vm.createContext(state);
  vm.runInContext(helpers, state);
  return { audio, audioChange, events, run: (code) => vm.runInContext(code, state) };
}

test("entering the park loops its soundtrack and restores the old song at its saved time", () => {
  const h = harness();
  h.run("startParkMusic()");
  assert.equal(h.audioChange.hidden, true);
  assert.equal(h.audio.track, "park.mp4");
  assert.equal(h.audio.loop, true);
  assert.equal(h.audio.paused, false);
  h.audio.currentTime = 15;
  h.run("startParkMusic()");
  h.run("restoreParkMusic()");
  assert.equal(h.audioChange.hidden, false);
  assert.equal(h.audio.track, "previous.mp3");
  assert.equal(h.audio.currentTime, 72.125);
  assert.equal(h.audio.paused, false);
  h.audio.currentTime = 0;
  h.events.get("loadedmetadata")();
  assert.equal(h.audio.currentTime, 72.125);
});

test("paused music stays paused on return, and leaving birthday never restarts audio", () => {
  const h = harness(true);
  h.run("startParkMusic(); restoreParkMusic()");
  assert.equal(h.audio.paused, true);
  h.run("startParkMusic(); restoreParkMusic(false)");
  assert.equal(h.audio.paused, true);
  assert.equal(h.audio.currentTime, 0);
});

test("changing songs cancels pending restoration seeks and selector includes the real park file", () => {
  const h = harness();
  h.run("startParkMusic(); restoreParkMusic(); cancelMusicSeek()");
  assert.equal(h.events.size, 0);
  const track = source.match(/const parkTrack = "([^"]+)"/)[1];
  assert.ok(fs.existsSync(path.join(__dirname, "..", track)));
  assert.match(source, /tracks\.push\(\{ src: parkTrack, label: "Corazón Mármol" \}\)/);
  assert.match(source, /birthdayPath === "3"\) \{\s*startParkMusic\(\)/);
  assert.match(source, /songSelect\.addEventListener\("change", \(\) => \{\s*cancelMusicSeek\(\)/);
});
