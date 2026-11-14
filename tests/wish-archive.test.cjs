const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const { createWishHarness } = require("./helpers/wishes-function.cjs");
const original = { id: "1", wish: "Deseo de prueba", created_at: "2026-09-01T20:30:00.123456+00:00" };
const previous = { wish: original.wish, createdAt: original.created_at };

test("wish archive renders no edit or delete controls", () => {
  const client = fs.readFileSync(path.join(__dirname, "..", "wish-archive.js"), "utf8");
  const render = client.slice(client.indexOf("function renderAdmin()"), client.indexOf("function lockAdmin()"));
  assert.doesNotMatch(render, /openEditor|button\(/);
  assert.match(render, /wish\.wish/);
  assert.match(render, /dateLabel\(wish\.created_at\)/);
});

test("gallery is public and protected archive assigns separate admin/read-only roles", async () => {
  const api = createWishHarness([original]);
  const gallery = await api.call({ action: "gallery" });
  assert.equal(gallery.status, 200);
  assert.equal(gallery.body.wishes[0].wish, original.wish);
  assert.equal(gallery.body.role, "viewer");
  assert.equal((await api.call({ action: "list", password: "wrong" })).status, 401);
  assert.equal((await api.call({ action: "list", password: "dev-preview" })).body.role, "admin");
  assert.equal((await api.call({ action: "list", password: "read-preview" })).body.role, "viewer");
});

test("public users and read-only password cannot edit or delete even via direct API requests", async () => {
  const api = createWishHarness([original]);
  for (const action of ["update", "delete"]) {
    for (const password of [undefined, "wrong", "read-preview"]) {
      const result = await api.call({ action, password, id: "1", wish: "Cambio", createdAt: original.created_at, previous });
      assert.ok([401, 403].includes(result.status));
    }
  }
  assert.deepEqual(api.rows, [original]);
  assert.equal(api.operations.length, 0);
});

test("admin edits text and date, preserves timestamp precision on text-only changes, then can delete", async () => {
  const api = createWishHarness([original]);
  const update = await api.call({ action: "update", password: "dev-preview", id: "1", wish: "  Texto nuevo  ", createdAt: original.created_at, previous });
  assert.equal(update.status, 200);
  assert.equal(update.body.wish.wish, "Texto nuevo");
  assert.equal(update.body.wish.created_at, original.created_at);
  const dated = await api.call({ action: "update", password: "dev-preview", id: "1", wish: "Texto nuevo", createdAt: "2026-08-31T21:00:00+02:00", previous: { wish: "Texto nuevo", createdAt: original.created_at } });
  assert.equal(dated.body.wish.created_at, "2026-08-31T19:00:00.000Z");
  const deleted = await api.call({ action: "delete", password: "dev-preview", id: "1", previous: { wish: "Texto nuevo", createdAt: dated.body.wish.created_at } });
  assert.equal(deleted.status, 200);
  assert.equal(api.rows.length, 0);
});

test("stale writes, invalid dates, invalid ids and oversized wishes are rejected without changing data", async () => {
  const api = createWishHarness([original]);
  const base = { action: "update", password: "dev-preview", id: "1", wish: "Cambio", createdAt: original.created_at, previous };
  for (const change of [{ wish: "" }, { wish: "x".repeat(601) }, { createdAt: "not-a-date" }, { id: "0" }, { id: "1 or 1=1" }, { id: "9223372036854775808" }, { previous: null }]) {
    assert.equal((await api.call({ ...base, ...change })).status, 400);
  }
  assert.equal((await api.call({ ...base, previous: { ...previous, wish: "Un texto antiguo" } })).status, 409);
  assert.deepEqual(api.rows, [original]);
});

test("pagination includes older wishes beyond 200 and new wishes still submit without a password", async () => {
  const rows = Array.from({ length: 205 }, (_, i) => ({ ...original, id: String(i + 1) }));
  const api = createWishHarness(rows);
  const first = await api.call({ action: "gallery", page: 0 });
  const second = await api.call({ action: "gallery", page: 1 });
  assert.equal(first.body.wishes.length, 200);
  assert.equal(first.body.hasMore, true);
  assert.equal(second.body.wishes.length, 5);
  assert.equal(second.body.hasMore, false);
  assert.equal((await api.call({ action: "gallery", page: -1 })).status, 400);
  assert.equal((await api.call({ action: "submit", wish: "Otro deseo" })).status, 201);
  assert.equal(api.rows.length, 206);
});

test("invalid JSON objects do not crash the function", async () => {
  const api = createWishHarness();
  assert.equal((await api.call(null)).status, 400);
  assert.equal((await api.call([])).status, 400);
});

test("browser management does not embed passwords or persist sessions and is initialized before dialog navigation", () => {
  const root = path.join(__dirname, "..");
  const client = fs.readFileSync(path.join(root, "wish-archive.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.doesNotMatch(client, /11082006|11082026|localStorage|sessionStorage/);
  assert.match(client, /if \(adminRole !== "admin" \|\| busy\) return/);
  assert.match(client, /adminPassword = ""/);
  assert.match(client, /initialDate = date\.value/);
  assert.match(client, /date\.value === initialDate \? wish\.created_at/);
  assert.match(client, /poll = setTimeout\(refreshGallery, 15000\)/);
  assert.ok(html.indexOf('./wish-archive.js?') < html.indexOf('./navigation-ui.js?'));
  const sql = fs.readFileSync(path.join(root, "supabase/setup.sql"), "utf8");
  assert.match(sql, /revoke all on table public\.star_wishes from anon, authenticated/);
  assert.match(sql, /grant select, insert, update, delete on table public\.star_wishes to service_role/);
});
