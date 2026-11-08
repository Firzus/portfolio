// Shared content for every direction, in French only: the prototype judges the look, not the
// translation. Text marked `provisional` is not confirmed by Lilian and is shown as such on the page.

export type Picture = { src: string; alt: string; width: number; height: number; caption: string };
export type ProjectLink = { label: string; href: string };
export type Provisional = { text: string; provisional?: boolean };

export type Project = {
  slug: string;
  name: string;
  kind: string;
  year: string;
  summary: string;
  context: string[];
  role: Provisional;
  facts: { label: string; value: string }[];
  pictures: Picture[];
  links: ProjectLink[];
};

export const person = {
  name: "Lilian PRIEU",
  title: "Software Engineer",
  lead: {
    text: "Je crée des jeux vidéo et les outils qui servent à les faire.",
    provisional: true,
  } satisfies Provisional,
  about: {
    text: "Ingénieur logiciel entre le jeu vidéo et l'outillage : un jeu d'aventure, un site de référence pour des milliers de joueurs, un noyau de script visuel pour Unity. Je construis le produit et ce qui permet de le construire.",
    provisional: true,
  } satisfies Provisional,
  email: "lprieu.infos@gmail.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/lprieu/" },
    { label: "GitHub", href: "https://github.com/Firzus" },
  ],
  cv: { label: "CV (PDF)", href: "#cv", provisional: true },
};

export const projects: Project[] = [
  {
    slug: "lysandra",
    name: "Lysandra",
    kind: "Jeu vidéo",
    year: "2026",
    summary: "Un jeu d'aventure dans un ciel d'îles flottantes, avec une démo jouable.",
    context: [
      "Lysandra est un jeu d'aventure dont l'héroïne explore un ciel d'îles flottantes. Son site invite à « tester la démo » et à soutenir le projet sur Kickstarter.",
      "Le site du jeu présente l'univers en plein écran, avec sa musique, et mène directement à la démo.",
    ],
    role: { text: "Programmation du jeu et site du projet.", provisional: true },
    facts: [
      { label: "Type", value: "Jeu d'aventure" },
      { label: "Démo", value: "Jouable depuis le site" },
      { label: "Financement", value: "Campagne Kickstarter" },
    ],
    pictures: [
      {
        src: "/assets/placeholders/lysandra-1.jpg",
        alt: "Illustration provisoire : un personnage de dos sur une colline regarde une île flottante.",
        width: 1586,
        height: 992,
        caption: "Image provisoire : le ciel d'îles flottantes",
      },
      {
        src: "/assets/placeholders/lysandra-2.jpg",
        alt: "Illustration provisoire : une arche de pierre et une cascade au bord d'une île flottante.",
        width: 1586,
        height: 992,
        caption: "Image provisoire : le bord d'une île",
      },
    ],
    links: [{ label: "Site et démo", href: "https://lysandra.faill.studio" }],
  },
  {
    slug: "huzounet",
    name: "Huzounet",
    kind: "Site et outils pour joueurs",
    year: "2025",
    summary: "Le site de référence des joueurs du mode online de Dofus : équipements, monstres, marché et outils.",
    context: [
      "Huzounet rassemble 1 901 équipements PvM et PvP, une base de monstres et de boss, un suivi des prix du marché par serveur et une recherche rapide au clavier.",
      "Une page d'outils regroupe Dofmaster, la carte du monde, Familier, Brisage et PNJ Dofus, chacun avec sa version. Une extension de navigateur, HUZ, complète le site.",
    ],
    role: { text: "Conception et développement du site et de son extension.", provisional: true },
    facts: [
      { label: "Équipements", value: "1 901 stuffs PvM et PvP" },
      { label: "Outils", value: "5, versionnés" },
      { label: "Extension", value: "HUZ" },
    ],
    pictures: [
      {
        src: "/assets/placeholders/huzounet-1.jpg",
        alt: "Illustration provisoire : un œuf lumineux sur un socle, entouré d'étagères d'équipements.",
        width: 1586,
        height: 992,
        caption: "Image provisoire : le catalogue d'équipements",
      },
      {
        src: "/assets/placeholders/huzounet-2.jpg",
        alt: "Illustration provisoire : une carte du monde, une balance et un registre sur une table de marchand.",
        width: 1586,
        height: 992,
        caption: "Image provisoire : la carte et le marché",
      },
    ],
    links: [{ label: "huzounet.fr", href: "https://huzounet.fr" }],
  },
  {
    slug: "atelier",
    name: "Atelier",
    kind: "Outil pour Unity",
    year: "2026",
    summary: "Un noyau de script visuel pour Unity : assembler le gameplay dans l'Inspector ou en C#.",
    context: [
      "Dans Atelier, un comportement de jeu est un déclencheur, des conditions, puis des instructions dans l'ordre. On l'assemble dans l'Inspector ou on l'écrit avec l'API C# : les deux pilotent le même noyau.",
      "Les concepteurs assemblent sans ouvrir d'IDE, les programmeurs restent dans le code quand le code va plus vite. Open source sous licence MIT, pour Unity 6 et URP.",
    ],
    role: { text: "Conception et développement du noyau et de ses éditeurs.", provisional: true },
    facts: [
      { label: "Moteur", value: "Unity 6, URP" },
      { label: "Licence", value: "MIT" },
      { label: "Extension", value: "Cloth, mouvement secondaire" },
    ],
    pictures: [
      {
        src: "/assets/placeholders/atelier-1.jpg",
        alt: "Illustration provisoire : des blocs et des cartes reliés par des fils sur un établi.",
        width: 1586,
        height: 992,
        caption: "Image provisoire : un déclencheur, des conditions, des instructions",
      },
      {
        src: "/assets/placeholders/atelier-2.jpg",
        alt: "Illustration provisoire : une figurine articulée tient une bannière de tissu qui ondule.",
        width: 1586,
        height: 992,
        caption: "Image provisoire : le tissu en mouvement secondaire",
      },
    ],
    links: [{ label: "Dépôt GitHub (lien à venir)", href: "#atelier-github" }],
  },
];

export const findProject = (slug: string) => projects.find((project) => project.slug === slug);
