import { useRef } from "react";
import { projects } from "../../content";
import { useReveal } from "../../lib/motion";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";
import { HeroFrames } from "./sections/HeroFrames";
import { Ledger } from "./sections/Ledger";
import { Letter } from "./sections/Letter";
import { Rail } from "./sections/Rail";

export function Home() {
  const root = useRef<HTMLDivElement>(null);
  const pictures = useRef<HTMLDivElement>(null);
  useReveal(root);

  return (
    <div ref={root} className="relative">
      <HeroFrames ref={pictures} />
      {/* Spacers place the rail on the first screen's midline and let both frames pass under it. */}
      <div aria-hidden className="h-[calc(50svh-2.25rem)]" />
      <Rail home over={pictures} />
      <div aria-hidden className="h-[calc(150svh-2.25rem)]" />
      <main className="relative bg-ground">
        <Ledger
          id="projets"
          heading="Sur quoi je travaille ?"
          intro="Un jeu d'aventure, un site de référence pour les joueurs de Dofus et un noyau de script visuel pour Unity."
          projects={projects}
        />
        <Letter />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
