import { Boxes, GitBranch, Infinity as InfinityIcon } from "lucide-react";

const pillars = [
  {
    icon: Boxes,
    title: "Multiple categories",
    desc: "Calculators, PDF, image, and voice — each its own expandable surface.",
  },
  {
    icon: GitBranch,
    title: "Unified design system",
    desc: "Every tool inherits the same spacing, typography, and interaction model.",
  },
  {
    icon: InfinityIcon,
    title: "Continuously expanding",
    desc: "New tools ship regularly without breaking the experience you already know.",
  },
];

const Ecosystem = () => {
  return (
    <section className="container py-14 md:py-20">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Ecosystem
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
          A growing ecosystem of tools.
        </h2>
        <p className="mt-4 text-muted-foreground md:text-lg leading-relaxed">
          Racira isn’t a single tool — it’s a platform. We continuously add new utilities
          across multiple categories, all designed to work the same way and feel like one
          coherent product.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="rounded-xl border border-border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-glow"
            >
              <div className="tool-card-icon">
                <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-[15px] font-bold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Ecosystem;
