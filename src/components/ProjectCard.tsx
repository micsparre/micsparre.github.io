import { ArrowIcon } from "./ui";

export interface Project {
  name: string;
  description: string;
  url: string;
}

export default function ProjectCard({ name, description, url }: Project) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border border-[#222] bg-[#111] p-5 transition-colors hover:border-[#3a3a3a]"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-white">{name}</h3>
        <span className="text-neutral-600 transition-colors group-hover:text-white">
          <ArrowIcon />
        </span>
      </div>
      <p className="text-sm leading-relaxed text-neutral-400">{description}</p>
    </a>
  );
}
