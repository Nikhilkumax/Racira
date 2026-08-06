import { Check, X } from "lucide-react";

const PROS = [
  "Truly unlimited generation, every day",
  "No subscriptions, no token meters",
  "28 voices across US and UK English",
  "Speed control on every generation",
  "Runs on your device — private, with no per-clip server call",
  "Polished SaaS experience on every device",
];
const CONS = [
  "Subscription paywalls and free-tier traps",
  "Strict character or token limits",
  "Slow remote API requests on every play",
  "Watermarked or downgraded free-tier output",
  "Account walls and email collection",
  "Cluttered, ad-heavy interfaces",
];

const STATS = [
  { value: "28", label: "Premium voices" },
  { value: "2", label: "Languages" },
  { value: "0", label: "API cost" },
  { value: "∞", label: "Generations" },
];

export function TTSWhyRacira() {
  return (
    <section id="why" aria-labelledby="why-title" className="bg-surface-muted/40 py-20 sm:py-28">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-brand">Why Racira TTS</p>
          <h2 id="why-title" className="mt-2 font-display text-[32px] font-bold tracking-tight sm:text-[40px]">
            Built for creators, not for billing dashboards
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-muted-foreground">
            Most online TTS tools nickel-and-dime you. Racira TTS keeps things
            radically simple: open the page, type, generate.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-surface p-7 shadow-soft">
            <h3 className="text-[15px] font-semibold tracking-tight">With Racira TTS</h3>
            <ul className="mt-4 space-y-3">
              {PROS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[14.5px]">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-brand-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface p-7 shadow-soft">
            <h3 className="text-[15px] font-semibold tracking-tight text-muted-foreground">Other TTS tools</h3>
            <ul className="mt-4 space-y-3">
              {CONS.map((c) => (
                <li key={c} className="flex items-start gap-3 text-[14.5px] text-muted-foreground">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <X className="h-3 w-3" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border-subtle bg-surface p-5 text-center shadow-soft">
              <p className="font-display text-[28px] font-bold tracking-tight text-brand">{s.value}</p>
              <p className="mt-1 text-[12.5px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
