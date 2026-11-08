import type { Piste } from "../types";
import { Home } from "./Home";
import { Project } from "./Project";

export const piste: Piste = {
  id: "c",
  name: "La planche contact",
  pitch:
    "Chaque écran que Lilian a livré devient une vignette d'une seule planche contact, sur fond blanc : tout le travail se voit d'un coup, dans l'ordre où il a été fait.",
  head: [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&display=swap" rel="stylesheet">',
  ].join(""),
  Home,
  Project,
};
