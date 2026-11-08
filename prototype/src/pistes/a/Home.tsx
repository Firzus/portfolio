import { useRef } from "react";
import { useReveal } from "../../lib/motion";
import { cn } from "../../lib/utils";
import { About } from "./parts/About";
import { Contact } from "./parts/Contact";
import { sectionGap } from "./parts/frame";
import { Hero } from "./parts/Hero";
import { SiteFooter } from "./parts/SiteFooter";
import { SiteHeader } from "./parts/SiteHeader";
import { WorkIndex } from "./parts/WorkIndex";

export function Home() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  return (
    <div ref={root}>
      <SiteHeader />
      <main>
        <Hero />
        <div className={cn(sectionGap)}>
          <WorkIndex />
        </div>
        <div className={sectionGap}>
          <About />
        </div>
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
