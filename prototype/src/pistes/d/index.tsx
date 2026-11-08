import type { Piste } from "../types";
import { Home } from "./Home";
import { Project } from "./Project";

export const piste: Piste = {
  id: "d",
  name: "Dans l'esprit d'aihero.dev",
  pitch:
    "La structure d'aihero.dev (colonne sombre bordée de filets, grilles de cartes, liens par intention) avec des couleurs propres tirées des illustrations, le nom en lettrage groovy dessiné, des titres et du texte en Rubik et un mouvement liquide.",
  head: [
    '<link rel="preload" href="/fonts/rubik.woff2" as="font" type="font/woff2" crossorigin>',
  ].join(""),
  Home,
  Project,
};
