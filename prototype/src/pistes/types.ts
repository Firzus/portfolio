import type { ComponentType } from "react";
import type { Project } from "../content";

export type Piste = {
  id: "d";
  name: string;
  /** One sentence shown on the hub page: what this direction does differently. */
  pitch: string;
  /** Extra <head> markup for this direction, such as its font stylesheet links. */
  head: string;
  Home: ComponentType;
  Project: ComponentType<{ project: Project }>;
};

/** Path of a direction's home page or of one of its project pages. */
export const href = (id: Piste["id"], slug?: string) => (slug ? `/${id}/projets/${slug}/` : `/${id}/`);
