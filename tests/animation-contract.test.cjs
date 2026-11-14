const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8").replace(/\r\n/g, "\n");
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex");

// Baseline captured before the conservative cleanup: do not regenerate it to silence regressions.
test("fracture, chomper and all effective visual styles are unchanged", () => {
  const fingerprints = {
    "fractured-world.js": "e0a2683c44ac8ff4c4b87ec8a9695d46a1e7bb48d2c5a7faca28c4002650897b",
    "fractured-world.css": "2c5c96206b611d10cdc5b184406fd07c4fcbc7dba5a1704f7f303eae07f37a21",
    "styles.css": "57bf08b5293610f1ebd450151c7bbc57790aef11f843955b7834d6f41fd4c3cc",
    "desk-view.css": "6761f25004067db8b184be2315147d494aa045c5fa8787c1b2039cae4aa5ccf7",
    "responsive-ui.css": "6b1b4e7ba7e475be3e4804c94a8452cecda45684e694b41bc43b4950867920fe",
    "menu-chomper.css": "a1e592de7e34789b3d922209b1e758d19a244b3e4349a5a1c0da077c0240f884",
    "menu-chomper.js": "f8cfab426736cce60178c88083f3b70cff45b994d3f9d1d5e7935a625f64216b",
  };
  Object.entries(fingerprints).forEach(([file, expected]) => assert.equal(hash(read(file)), expected, file));
  // The actions container always retains its span and button, so :empty can never match.
  // Exclude the explicitly requested welcome-card layout, not animation rules.
  const birthday = read("birthday-entry.css").replace(/\/\* Named paths replace[\s\S]*?\/\* End named paths\. \*\//, "").replace(/\/\* Compact welcome cards;[\s\S]*?\/\* End compact welcome cards\. \*\//, "").replace(/\/\* Lunar sunlight and[\s\S]*?\/\* End lunar sunlight and shortcut hint\. \*\//, "").replace(/\.birthday-dialogue__actions:empty\s*\{[^}]*\}/g, "").replace(/\s+/g, " ").trim();
  assert.equal(hash(birthday), "5b69f354063e168dcbe39597268413384faf81d7766cb4eee228e2a66cdffc7a");
});

test("camera motion, footsteps, scene fades, message timers and star effects retain their exact code", () => {
  const sections = [
    ["birthday-entry.js", "  function walkingFrames(", "  function showMoonMessage(", "1b80df3db311d8d7b2d5de2cbe404089bb5a506fd2c34366245612c3500827c2"],
    ["birthday-entry.js", "  function draw()", "  function createBurst()", "c1dedd32de2ffa640fd75478fd67c0a651a04f287d3f55c4153f603bafb62f14"],
    ["birthday-entry.js", "  function clearThoughtTimer(", "  const sceneImages", "8b55ea3c78eff7c346a7c8ecc784b86de5eed8e600b70ac99e4fa2775353551f"],
    ["desk-view.js", "  function animate(", "  async function loadImage(", "7ef1e473b82ceb3882dc386e841efc60a9909e8dae4474fc21722f79e88c3292"],
    ["desk-view.js", "  function layout()", "  function groupIsRead(", "0e05fb7ec34a84ee987cd108624b5f6fe36019444d5235ced02ea08dd4bff103"],
    ["script.js", "  function triggerStarryEntry(", "  function resetCyberSequence(", "ccf5188e2a6957233b420b548ca0837284660e6d3f9406ecdd89c729fcdb1f76"],
    ["script.js", "  function tickCyberSequence()", "  function updateCyberProgress(", "b6d6e5ed53bfad9fb169a30e493712830cd811125b0b750b32adc25cfb9af469"],
  ];
  for (const [file, start, end, expected] of sections) {
    // Archive integration hooks do not change the original star animation code.
    const source = read(file).replace(/^[ \t]*(?:park(?:Atmosphere|Letter)|moonReader|birthdayMemory)\.sync\(\);\n/gm, "").replace(/\bactiveScenes\b/g, "moonScenes").replace(/^[ \t]*if \(!moonSunlight\.hidden\) moonSunlight\.style\.transform = image\.style\.transform;\n/gm, "").replace(/^[ \t]*moonSunlight\.style\.(?:width|height) = `\$\{[wh]\}px`;\n/gm, "").replace(/ \|\| moonIntroPending/g, "").replace(/^[ \t]*window\.dispatchEvent\(new Event\("wishes:changed"\)\);\n/gm, "")
      .replace(/^[ \t]*window\.CARTA_WISHES\?\.(?:lockAdmin\(\)|openAdmin\(password, result\.wishes, result\.role, result\.hasMore\));\n/gm, "");
    const from = source.indexOf(start), to = source.indexOf(end);
    assert.ok(from >= 0 && to > from, `${file}: ${start}`);
    assert.equal(hash(source.slice(from, to)), expected, `${file}: ${start}`);
  }
});
