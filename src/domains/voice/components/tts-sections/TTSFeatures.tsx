import { Infinity as InfIcon, Globe2, Mic2, Sparkles, Zap, Wallet, Smartphone, MonitorSmartphone } from "lucide-react";

const FEATURES = [
  { icon: InfIcon, title: "Unlimited free usage", text: "Generate as much speech as you want — no quotas or paywalls." },
  { icon: MonitorSmartphone, title: "Browser-based engine", text: "Powered by your browser's native speech API. Nothing to install." },
  { icon: Globe2, title: "US and UK English", text: "Native American and British English accents." },
  { icon: Mic2, title: "Premium voice options", text: "28 distinctive branded voices, each with its own character and tone." },
  { icon: Sparkles, title: "Smart tone controls", text: "Pick a preset or describe a custom tone in plain language." },
  { icon: Wallet, title: "Zero API costs", text: "No keys, no billing, no surprises. Privately rendered on your device." },
  { icon: Smartphone, title: "Mobile friendly", text: "A polished experience on phones, tablets, and desktops alike." },
  { icon: Zap, title: "Fast performance", text: "Instant playback with no waiting on remote servers." },
];

export function TTSFeatures() {
  return (
    <section id="features" aria-labelledby="features-title" className="container mx-auto py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[13px] font-semibold uppercase tracking-wider text-brand">Features</p>
        <h2 id="features-title" className="mt-2 font-display text-[32px] font-bold tracking-tight sm:text-[40px]">
          Everything you need to create great voiceovers
        </h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-muted-foreground">
          Racira TTS combines a polished interface with a powerful browser-native
          engine, so you can focus on the script — not the setup.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="group rounded-2xl border border-border-subtle bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand transition-transform group-hover:scale-105">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <h3 className="mt-4 text-[15.5px] font-semibold tracking-tight">{title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
