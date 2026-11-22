import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Work from "./components/Work";
import Writing from "./components/Writing";

export default function App() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <Hero />
      <Work />
      <Writing />
      <Projects />
      <footer className="border-t border-[#1f1f1f] pt-6 text-xs text-neutral-600">
        © {new Date().getFullYear()} Michael Sparre
      </footer>
    </main>
  );
}
