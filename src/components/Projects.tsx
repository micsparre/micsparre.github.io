import ProjectCard, { type Project } from "./ProjectCard";
import { SectionHeading } from "./ui";

const projects: Project[] = [
  {
    name: "ranked",
    description:
      "iPhone app for ranking movies, shows, books, games and manga by choosing between two titles at a time, with lists, progress tracking and a friends feed. An MCP server lets your own AI agent read your library and recommend what's next.",
    url: "https://ranked.michaelsparre.com",
  },
  {
    name: "observe",
    description:
      "Self-hosted personal finance: bank, credit card and brokerage data synced into a database you own, an iPhone app to browse it, and an MCP server so your own AI agents can analyze spending, holdings and budgets.",
    url: "https://observe.michaelsparre.com",
  },
  {
    name: "topho",
    description:
      "iPhone app for shared photo albums. It groups photos by the faces in them, so each friend can find and save the full-resolution photos they're in.",
    url: "https://topho.michaelsparre.com",
  },
  {
    name: "workout",
    description:
      "Training dashboard for Hevy workout history, with an MCP server so AI agents can read your training and draft routine changes.",
    url: "https://workout.michaelsparre.com",
  },
  {
    name: "passport",
    description:
      "Interactive globe for tracking the countries and U.S. states you've visited and the ones you want to visit.",
    url: "https://passport.michaelsparre.com",
  },
  {
    name: "prem",
    description:
      "Premier League 2026/27 table-prediction pool for friends, scored live against the official table.",
    url: "https://prem.michaelsparre.com",
  },
  {
    name: "world-cup",
    description:
      "A 2026 World Cup pool for friends with live standings and scoring, now kept as a read-only archive.",
    url: "https://worldcup.michaelsparre.com",
  },
  {
    name: "poke",
    description: "Generate favicon packages from Pokémon sprites.",
    url: "https://poke.michaelsparre.com",
  },
  {
    name: "rice-poems",
    description: "A family poem collection.",
    url: "https://rice.michaelsparre.com",
  },
];

export default function Projects() {
  return (
    <section className="mb-16">
      <SectionHeading>Projects</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
    </section>
  );
}
