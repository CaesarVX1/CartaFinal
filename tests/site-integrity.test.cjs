const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex");
const html = read("index.html");

// Content snapshots deliberately protect the letters and diary during this cleanup.
test("all existing HTML text, letters and diary pages are preserved", () => {
  // Normalize only the explicitly renamed tab and birthday buttons; protect all other text.
  const previousText = html.replace("<title>Fuera del ruido</title>", "<title>Hola Josemi</title>")
    .replace("<strong>Hasta la Luna</strong><small aria-hidden=\"true\"></small>", "<strong>1</strong><small>Entrada</small>")
    .replace("<strong>Deseos al cielo</strong><small aria-hidden=\"true\"></small>", "<strong>2</strong><small>Entrada</small>")
    .replace("<strong>Aquellos días</strong><small aria-hidden=\"true\"></small>", "<strong>3</strong><small>Entrada</small>")
    .replace("<strong>Lo que permanece</strong><small aria-hidden=\"true\"></small>", "<strong>4</strong><small>Entrada</small>");
  const text = previousText.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  assert.equal(hash(text), "d8be931659365595b4d9b50286e6f96ff5f6fccb04561cff8a29b5f96a726eec");
});

test("the original main structure remains intact", () => {
  const main = html.match(/<main\b[\s\S]*?<\/main>/)[0];
  assert.equal(hash(main), "1d067f0ac3339256966e4c027110f0df1cfa5b04fb036c1b80b6469887e2b0cf");
});

test("all entry points, dialogs and media remain available", () => {
  for (const id of ["welcome-menu", "hero-original", "hero-mayo", "hero-cyber", "carta-original", "carta-mayo", "carta-cyber",
    "starry-sky", "star-fragment", "wish-admin", "desk-dialog", "desk-clue-dialog", "desk-diary-dialog", "wall-note-dialog",
    "anniversary-destination", "birthday-paths", "cyber-warning-layer", "cyber-arrival-screen", "mayo-video",
    "cyber-journey-video", "cyber-arrival-video", "anniversary-audio", "stars-audio", "cyber-audio", "birthday-audio"]) {
    assert.ok(html.includes(`id="${id}"`), `missing ${id}`);
  }
  assert.equal((html.match(/data-birthday-path="\d"/g) || []).length, 4);
  assert.equal((html.match(/data-arrival-page(?:\s|>)/g) || []).length, 4);
  const references = [...html.matchAll(/\b(?:src|href|data-src|data-track-primary|data-track-secondary)="(\.\/[^"?#]+)(?:\?[^"#]*)?"/g)].map((match) => match[1]);
  assert.equal(new Set(references).size, 38);
  references.forEach((file) => assert.ok(fs.existsSync(path.join(root, file)), `missing asset ${file}`));
});

test("original fonts, root variables and reveal observer stay unchanged", () => {
  const css = read("styles.css"), script = read("script.js");
  assert.equal(hash(css.slice(0, css.indexOf("}") + 1)), "3f6183c283441479d91577f9619fb9d4efde4512c8a53497053de5a7af1aed09");
  assert.equal(hash(script.slice(0, script.indexOf("const welcomeMenu"))), "3d91dc161f6166711aac368c87ddc14912c05f9ee582a07fe1d7b57c2a3935c9");
  assert.ok(html.includes("Cormorant+Garamond") && html.includes("Manrope"));
});

test("star messages, cyber commands, warnings and desk clues stay unchanged", () => {
  const script = read("script.js"), desk = read("desk-view.js");
  assert.equal(hash(script.slice(script.indexOf("const starFragments ="), script.indexOf("const cyberSequenceDuration"))),
    "68cd52cb73c0f35aa2b5f3b15a51a38f749d716f1798a96eda78244e330d46a6");
  assert.equal(hash(desk.slice(desk.indexOf("  const clues ="), desk.indexOf("  const enter ="))),
    "f9494f74041ec8e14a67cd1803782cfa10615fcbe44e98f4f5c21c931fe667ab");
});

test("birthday music starts on the click, before the screen shatter", () => {
  const fracture = read("fractured-world.js"), birthday = read("birthday-entry.js");
  assert.ok(html.includes("Entre luces &#127873; - 15 . 11 . 2026"));
  assert.match(html, /<audio id="birthday-audio" loop preload="none"/);
  assert.match(fracture, /dispatchEvent\(new Event\("birthday:opening"\)\);\s*shatterMenu\(\)/);
  assert.match(birthday, /audio\.volume = 0\.55;/);
  assert.match(birthday, /otherMedia\.forEach\(\(media\) => media\.pause\(\)\)/);
  assert.match(birthday, /dialog\.addEventListener\("close", \(\) => \{\s*closeMusicPanel\(\);\s*stopMusic\(\)/);
});

test("birthday music offers all six existing songs without duplicates", () => {
  const source = read("birthday-entry.js");
  const helper = source.slice(source.indexOf("  function collectMusicTracks("), source.indexOf("  const tracks = collectMusicTracks"));
  const players = [...html.matchAll(/<audio\b([\s\S]*?)><\/audio>/g)].map((match) => {
    const attributes = Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((attribute) => [attribute[1], attribute[2]]));
    return { getAttribute: (key) => attributes[key], dataset: { trackPrimary: attributes["data-track-primary"], trackSecondary: attributes["data-track-secondary"] } };
  });
  const tracks = vm.runInNewContext(`${helper}; collectMusicTracks(players)`, { players });
  assert.equal(tracks.length, 6);
  assert.equal(new Set(tracks.map((track) => track.src)).size, 6);
  tracks.forEach((track) => assert.ok(fs.existsSync(path.join(root, track.src))));
  assert.match(source, /audio\.loop = true/);
  assert.match(source, /audioToggle\.addEventListener\("click"/);
  assert.match(source, /volumeRange\.addEventListener\("input"/);
});
