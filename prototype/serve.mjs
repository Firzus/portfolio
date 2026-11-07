// Serves the prototype on 127.0.0.1 with the site's own three.js and GSAP from
// node_modules, and answers every route of the journey (/, /projets,
// /projets/<slug>, and the same under /en/) with index.html, as the static
// site will once each route is prerendered.
// Usage: node prototype/serve.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(here, "..");
const port = Number(process.argv[2] ?? 4317);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

const mounts = [
  ["/node_modules/three/", join(root, "node_modules/three/")],
  ["/node_modules/gsap/", join(root, "node_modules/gsap/")],
  ["/", here],
];

async function fileFor(pathname) {
  for (const [prefix, dir] of mounts) {
    if (!pathname.startsWith(prefix)) continue;
    const target = normalize(join(dir, pathname.slice(prefix.length)));
    if (!target.startsWith(dir)) return null;
    try {
      if ((await stat(target)).isFile()) return target;
    } catch {}
    return null;
  }
  return null;
}

const routes = /^\/(en\/)?(projets\/?([a-z-]+\/?)?)?$/;

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  let file = await fileFor(decodeURIComponent(pathname));
  if (!file && routes.test(pathname)) file = join(here, "index.html");
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
    return;
  }
  res.writeHead(200, {
    "content-type": types[extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  res.end(await readFile(file));
}).listen(port, "127.0.0.1", () => {
  console.log(`Prototype: http://127.0.0.1:${port}/`);
});
