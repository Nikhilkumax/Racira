import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TTSHero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-hero">
      <div className="container mx-auto pb-12 pt-16 text-center sm:pb-16 sm:pt-24">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1 text-[12.5px] font-medium text-muted-foreground shadow-soft">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          ● 100+ voices · 15+ languages · Unlimited generation
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-balance font-display text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[56px]">
          Free <span style={{ color: "#8B5CF6" }}>Text to Speech</span> Online
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-pretty text-[16.5px] leading-relaxed text-muted-foreground sm:text-[17.5px]">
          Convert any text to natural-sounding speech instantly.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-pretty text-[14.5px] text-muted-foreground/80">
          No signup. No limits. No cost.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 gap-2 rounded-full bg-brand px-6 text-[14.5px] font-semibold text-brand-foreground shadow-brand hover:bg-brand/90">
            <a href="#studio">Start Generating <ArrowRight className="h-4 w-4" /></a>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-12 rounded-full px-5 text-[14.5px] font-medium">
            <a href="#features">See features</a>
          </Button>
        </div>

      </div>
    </section>
  );
}
