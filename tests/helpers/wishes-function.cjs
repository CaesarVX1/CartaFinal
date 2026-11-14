const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");

function createWishHarness(initial = [], secrets = {}) {
  const rows = structuredClone(initial);
  const operations = [];
  let handler;
  const environment = { SUPABASE_URL: "http://test.invalid", SUPABASE_SERVICE_ROLE_KEY: "test-service-key", WISHES_ADMIN_PASSWORD: "dev-preview", WISHES_READER_PASSWORD: "read-preview", ...secrets };
  const createClient = () => ({ from: () => {
    const filters = [];
    let operation = "select", values;
    const matches = (row) => filters.every(([key, value]) => String(row[key]) === String(value));
    const query = {
      insert(value) { operation = "insert"; values = value; return this; },
      update(value) { operation = "update"; values = value; return this; },
      delete() { operation = "delete"; return this; },
      eq(key, value) { filters.push([key, value]); return this; },
      select() { return this; }, order() { return this; },
      async range(from, to) {
        operations.push("select");
        return { data: [...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at) || Number(b.id) - Number(a.id)).slice(from, to + 1), error: null };
      },
      async single() {
        const row = { id: String(Math.max(0, ...rows.map((item) => Number(item.id))) + 1), created_at: new Date().toISOString(), ...values };
        rows.push(row);
        operations.push(operation);
        return { data: structuredClone(row), error: null };
      },
      async maybeSingle() {
        operations.push(operation);
        const index = rows.findIndex(matches);
        if (index < 0) return { data: null, error: null };
        if (operation === "update") Object.assign(rows[index], values);
        const data = structuredClone(rows[index]);
        if (operation === "delete") rows.splice(index, 1);
        return { data, error: null };
      },
    };
    return query;
  } });
  const file = path.join(__dirname, "../../supabase/functions/star-wishes/index.ts");
  const source = fs.readFileSync(file, "utf8").replace(/^import[^\n]+\n/, "");
  vm.runInNewContext(stripTypeScriptTypes(source), {
    Deno: { env: { get: (name) => environment[name] }, serve: (callback) => { handler = callback; } },
    createClient, Response, Request, TextEncoder, Date, JSON, BigInt,
  });
  return {
    rows, operations, handler,
    async call(payload) {
      const response = await handler(new Request("http://test.invalid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
      return { status: response.status, body: await response.json() };
    },
  };
}
module.exports = { createWishHarness };
