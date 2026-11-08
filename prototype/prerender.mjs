// Writes one static HTML file per route so every page reads without JavaScript.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const root = import.meta.dirname;
const out = process.env.OUT ?? "dist";
const template = readFileSync(join(root, out, "client/index.html"), "utf8");
const { render, routes } = await import(pathToFileURL(join(root, out, "server/entry-server.js")).href);

for (const route of routes) {
  const { html, head } = render(route);
  const page = template.replace("<!--app-head-->", head).replace("<!--app-html-->", html);
  const file = join(root, out, "client", route, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
  console.log("prerendered", route);
}
