// Local UI fixture only: no requests to Supabase and no changes to real wishes.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { createWishHarness } = require("./wishes-function.cjs");
const root = path.resolve(__dirname, "../..");
const api = createWishHarness([
  { id: "1", wish: "Deseo de prueba: compartir una noche bajo las estrellas.", created_at: "2026-09-01T20:30:00.123456+00:00" },
  { id: "2", wish: "Otro deseo de prueba para verificar el archivo y sus controles.", created_at: "2026-10-26T19:00:00.000Z" },
]);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".gif": "image/gif", ".mp3": "audio/mpeg", ".mp4": "video/mp4" };
http.createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://127.0.0.1:8766").pathname;
  if (pathname === "/__test_wishes" && req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const response = await api.handler(new Request("http://test.invalid", { method: "POST", headers: { "Content-Type": "application/json" }, body: Buffer.concat(chunks).toString() }));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(await response.text());
    return;
  }
  if (pathname === "/supabase-config.js") {
    res.writeHead(200, { "Content-Type": "text/javascript", "Cache-Control": "no-store" });
    res.end('window.CARTA_CONFIG = Object.freeze({ wishesEndpoint: "http://127.0.0.1:8766/__test_wishes" });');
    return;
  }
  if (pathname === "/" || pathname === "/index.html") {
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8").replace('src="./supabase-config.js"', 'src="./supabase-config.js?preview=wishes"');
    res.writeHead(200, { "Content-Type": types[".html"], "Cache-Control": "no-store" });
    res.end(html);
    return;
  }
  let file;
  try { file = path.resolve(root, "." + decodeURIComponent(pathname === "/" ? "/index.html" : pathname)); }
  catch { res.writeHead(400); res.end(); return; }
  const relative = path.relative(root, file);
  const type = types[path.extname(file).toLowerCase()];
  if (relative.startsWith("..") || path.isAbsolute(relative) || relative.split(path.sep).some((part) => part.startsWith(".")) || !type || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  const stream = fs.createReadStream(file);
  stream.on("error", () => res.destroy());
  stream.pipe(res);
}).listen(8766, "127.0.0.1", () => process.stdout.write("Local preview with fictional wishes; dev-preview / read-preview.\n"));
