// Dev server with server rendering, so the page is the same as the prerendered build.
import { readFileSync } from "node:fs";
import { createServer as createHttp } from "node:http";
import { join } from "node:path";
import { createServer } from "vite";

const root = import.meta.dirname;
const vite = await createServer({ root, server: { middlewareMode: true }, appType: "custom" });
const port = Number(process.env.PORT ?? 4318);

createHttp((req, res) => {
  vite.middlewares(req, res, async () => {
    try {
      const url = new URL(req.url, "http://x").pathname;
      const template = await vite.transformIndexHtml(url, readFileSync(join(root, "index.html"), "utf8"));
      const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
      const { html, head } = render(url);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(template.replace("<!--app-head-->", head).replace("<!--app-html-->", html));
    } catch (error) {
      vite.ssrFixStacktrace(error);
      res.writeHead(500).end(String(error.stack));
    }
  });
}).listen(port, "127.0.0.1", () => console.log(`http://127.0.0.1:${port}/`));
