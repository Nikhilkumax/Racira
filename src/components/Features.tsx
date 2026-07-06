import { Boxes, GitBranch, Sparkles, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Boxes,
    title: "All-in-one ecosystem",
    desc: "Multiple tool categories, one seamless platform.",
  },
  {
    icon: GitBranch,
    title: "Unified design system",
    desc: "Every tool inherits the same spacing, typography, and interaction model.",
  },
  {
    icon: Sparkles,
    title: "Always improving",
    desc: "New tools and categories ship regularly without breaking the experience you know.",
  },
  {
    icon: TrendingUp,
    title: "Built to scale",
    desc: "From simple tools to powerful workflows.",
  },
];

const Features = () => {
  return (
    <section className="border-y border-border bg-secondary/40 py-20 md:py-24">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Why Racira
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            Built as a unified platform
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg leading-relaxed">
            Everything on Racira works together — fast, simple, and scalable.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-glow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
                <h3 className="mt-7 text-lg font-bold tracking-tight md:text-xl">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed md:text-[15px]">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
