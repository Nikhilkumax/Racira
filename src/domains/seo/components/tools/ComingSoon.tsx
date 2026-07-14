import Link from "next/link";
import { Clock, Bell, ArrowRight } from "lucide-react";

export function ComingSoon({ name }: { name: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
      <div className="relative px-8 py-16 text-center">
        <div className="absolute inset-0 -z-10 bg-hero-gradient opacity-40" />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
          <Clock className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">Coming soon</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{name}</span> is on the
          Racira SEO roadmap. We're rolling out tools one by one, polished and
          fast — no half-baked previews.
        </p>

        <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-2xl border border-border/60 bg-background/60 p-2 backdrop-blur">
          <Bell className="ml-2 h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            placeholder="you@company.com"
            className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Notify me
          </button>
        </div>

        <Link
          href="/seo/tools/keyword-density-checker"
          className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Meanwhile, try the live Keyword Density Checker
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
