import ProjectCard, { type Project } from "./ProjectCard";

const projects: Project[] = [
  {
    name: "ranked",
    description:
      "Media ranking app for movies, TV shows, books, and manga.",
    url: "https://ranked.michaelsparre.com",
    github: "https://github.com/micsparre/ranked",
  },
  {
    name: "synth",
    description:
      "AI image generation playground with persistent history.",
    url: "https://synth.michaelsparre.com",
    github: "https://github.com/micsparre/synth",
  },
  {
    name: "observe",
    description:
      "Self-hosted personal finance dashboard with an AI assistant.",
    url: "https://observe.michaelsparre.com",
    github: "https://github.com/micsparre/observe",
  },
  {
    name: "rice-poems",
    description: "Static site for a family poem collection.",
    url: "https://rice.michaelsparre.com",
    github: "https://github.com/micsparre/rice-poems",
  },
  {
    name: "wordfake",
    description: "A word-guessing party game.",
    url: "https://wordfake.com",
    github: "https://github.com/micsparre/wordfake",
  },
  {
    name: "xray",
    description: "Engineering team knowledge graph tool.",
    github: "https://github.com/micsparre/xray",
  },
];

export default function Projects() {
  return (
    <section>
      <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-neutral-500">
        Projects
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
    </section>
  );
}
