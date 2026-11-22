import { ArrowIcon, SectionHeading } from "./ui";

export default function Work() {
  return (
    <section className="mb-16">
      <SectionHeading>Work</SectionHeading>
      <a
        href="https://grepr.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-xl border border-[#262626] bg-gradient-to-br from-[#151515] to-[#0f0f0f] p-6 transition-colors hover:border-[#3a3a3a]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Grepr</h3>
            <p className="text-sm text-neutral-400">
              Founding Engineer · 2025 to present
            </p>
          </div>
          <span className="mt-1 text-neutral-500 transition-colors group-hover:text-white">
            <ArrowIcon />
          </span>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-300">
          Grepr is a harness for operational agents: it processes raw
          telemetry in real time, separates signal from noise, and hands every
          new pattern to agents that investigate it. I work across the stack, from the Flink and Kubernetes infrastructure
          the pipelines run on to the agents themselves, including the loop
          that uses our agents' own traces to keep improving them and the MCP
          server and CLI they work through.
        </p>
      </a>
    </section>
  );
}
