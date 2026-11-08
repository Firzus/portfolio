import type { Piste } from "../types";
import { Home } from "./Home";
import { ProjectPage } from "./ProjectPage";

export const piste: Piste = {
  id: "a",
  name: "L'affiche épinglée",
  pitch:
    "Le nom reste épinglé en haut de l'écran pendant que les écrans des projets passent dessous, comme les numéros successifs d'une même affiche orange et noire.",
  head: [
    '<link rel="preconnect" href="https://api.fontshare.com">',
    '<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>',
    '<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,800&display=swap">',
  ].join(""),
  Home,
  Project: ProjectPage,
};
