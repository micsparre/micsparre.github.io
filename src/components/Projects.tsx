import ProjectCard, { type Project } from "./ProjectCard";

const projects: Project[] = [
  {
    name: "observe",
    description: "Personal finance dashboard.",
    url: "https://observe.michaelsparre.com",
  },
  {
    name: "workout",
    description: "Visualize Hevy workout history and generate smarter training routines.",
    url: "https://workout.michaelsparre.com",
  },
  {
    name: "ranked",
    description:
      "Explore, track, rank, and get recommendations for movies, TV, books, and manga.",
    url: "https://ranked.michaelsparre.com",
  },
  {
    name: "world-cup",
    description: "2026 World Cup pool with live standings and scoring.",
    url: "https://worldcup.michaelsparre.com",
  },
  {
    name: "passport",
    description: "Interactive travel map for tracking visited places.",
    url: "https://passport.michaelsparre.com",
  },
  {
    name: "synth",
    description:
      "AI image generation playground with persistent history.",
    url: "https://synth.michaelsparre.com",
  },
  {
    name: "rice poems",
    description: "Family poem collection.",
    url: "https://rice.michaelsparre.com",
  },
  {
    name: "pokemon favicon generator",
    description: "Generate favicon packages from Pokemon sprites.",
    url: "https://poke.michaelsparre.com",
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
