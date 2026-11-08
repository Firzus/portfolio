import { renderToString } from "react-dom/server";
import { App, headFor, routes } from "./App";

export { routes };

export function render(path: string) {
  return { html: renderToString(<App path={path} />), head: headFor(path) };
}
