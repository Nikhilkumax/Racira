import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="container relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            One platform. Every essential tool.
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            All Your Essential Tools.
            <br />
            <span className="hero-gradient-text">One Platform.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Racira is a growing ecosystem of browser-based tools — organized into focused
            categories, built on a single design system, and ready to scale with your workflow.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="hero" size="lg">
              <Link href="/#categories">
                Explore Platform <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/calculator">Browse Tools</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
