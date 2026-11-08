import { HomeHero } from "./home/HomeHero";
import { IntentLinks } from "./home/IntentLinks";
import { ProjectGrid } from "./home/ProjectGrid";

export function HomePage() {
  return (
    <main>
      <HomeHero />
      <ProjectGrid />
      <IntentLinks />
    </main>
  );
}
