import { Metadata } from "next";
import { PageShell } from "@/components/finance/page-shell";
import { listAuthors } from "@/lib/finance/data/taxonomy";

export const metadata: Metadata = {
  title: "About — Racira Finance",
  description: "Racira Finance publishes long-form analysis on money, markets, and the economy — written by former practitioners.",
  openGraph: {
    title: "About — Racira Finance",
    description: "Racira Finance publishes long-form analysis on money, markets, and the economy.",
    url: "/about",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
  const authors = listAuthors();
  return (
    <PageShell>
      <section className="border-b border-border/60" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">About</div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">Slow ideas about money.</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            We started Racira because finance writing had two modes: shouty and incomprehensible. We thought there was room for a third — patient, evidence-driven, and respectful of the reader's time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose-article">
          <h2>What we publish</h2>
          <p>Long-form analysis on investing, personal finance, markets, and the economy. We don't chase headlines. We try to write things that age well.</p>
          <h2>Our standards</h2>
          <ul>
            <li>No paid placements. No affiliate links disguised as editorial.</li>
            <li>Sources cited. Models shown. Mistakes corrected in public.</li>
            <li>Plain language. If we can't explain it clearly, we don't understand it well enough.</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="mb-8 font-display text-2xl font-semibold tracking-tight md:text-3xl">The team</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {authors.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border/60 bg-card p-6">
              <img src={a.avatar_url} alt={a.name} className="h-16 w-16 rounded-full" />
              <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">{a.role}</div>
              <h3 className="mt-1 font-display text-xl font-semibold">{a.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}