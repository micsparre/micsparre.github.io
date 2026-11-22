import { ArrowIcon, SectionHeading } from "./ui";

const posts = [
  {
    title: "AI Agent Telemetry: Seven Questions to Ask of Every Agent Run",
    source: "Grepr Blog",
    date: "Nov 2026",
    url: "https://www.grepr.ai/blog/ai-agent-telemetry-seven-questions",
  },
  {
    title: "How AI Can Investigate Every New Log Pattern at Scale",
    source: "Grepr Blog",
    date: "Oct 2026",
    url: "https://www.grepr.ai/blog/ai-investigate-new-log-pattern",
  },
  {
    title: "So You Put Flink on Kubernetes. Now What?",
    source: "VMblog",
    date: "Oct 2026",
    url: "https://vmblog.com/bylines/so-you-put-flink-on-kubernetes-now-what/",
  },
];

export default function Writing() {
  return (
    <section className="mb-16">
      <SectionHeading>Writing</SectionHeading>
      <ul className="divide-y divide-[#1f1f1f] border-y border-[#1f1f1f]">
        {posts.map(({ title, source, date, url }) => (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-4 py-4"
            >
              <div>
                <p className="text-[15px] text-neutral-200 transition-colors group-hover:text-white">
                  {title}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {source} · {date}
                </p>
              </div>
              <span className="mt-1 shrink-0 text-neutral-600 transition-colors group-hover:text-white">
                <ArrowIcon />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
