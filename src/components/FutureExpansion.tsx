import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FutureExpansion = () => {
  return (
    <section className="container py-14 md:py-20">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-10 shadow-elevated md:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary-glow/10 blur-3xl" />

        <div className="relative max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Expanding Platform
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            Built to grow. <span className="hero-gradient-text">Always expanding.</span>
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground md:text-lg leading-relaxed">
            New tools and entire categories are continuously added to Racira. The platform
            is built to scale across dozens of ecosystems without breaking the experience
            you already know.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <a href="#categories">
                Explore Platform <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#categories">Browse Tools</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FutureExpansion;
