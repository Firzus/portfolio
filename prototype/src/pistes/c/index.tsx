import { person } from "../../content";
import type { Piste } from "../types";

export const piste: Piste = {
  id: "c",
  name: "À construire",
  pitch: "À construire.",
  head: "",
  Home: () => <main><h1>{person.name}, {person.title}</h1></main>,
  Project: ({ project }) => <main><h1>{project.name}</h1></main>,
};
