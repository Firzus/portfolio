import type { Piste } from "../types";
import { Home } from "./Home";
import { Project } from "./Project";

export const piste: Piste = {
  id: "b",
  name: "L'instrument discret",
  pitch:
    "Une page sombre et presque silencieuse : le titre passe sur une ligne au milieu des images, puis un registre de trois projets ouvre l'écran de chacun à côté de la colonne.",
  head: [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,600;1,400&family=League+Spartan:wght@700&display=swap" rel="stylesheet">',
  ].join(""),
  Home,
  Project,
};
