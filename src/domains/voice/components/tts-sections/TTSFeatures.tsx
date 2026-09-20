import { Infinity as InfIcon, Globe2, Mic2, Sparkles, Zap, Wallet, Smartphone, MonitorSmartphone } from "lucide-react";
import { VOICE_COUNT, LANGUAGE_COUNT } from "@/domains/voice/lib/voiceCatalog";

// Counts come from the voice catalog rather than being written into the copy,
// so a voice list update cannot leave this section advertising a number the
// picker no longer offers.
const FEATURES = [
  { icon: InfIcon, title: "Unlimited free usage", text: "Generate as much speech as you want — no quotas or paywalls." },
  { icon: MonitorSmartphone, title: "Runs on your device", text: "Speech is generated locally in your browser. Nothing to install." },
  { icon: Globe2, title: `${LANGUAGE_COUNT} languages and accents`, text: "Voices across dozens of languages and regional accents, including US and UK English." },
  { icon: Mic2, title: `${VOICE_COUNT} voices to pick from`, text: "Every voice is free to use, in whichever accent suits the script." },
  { icon: Sparkles, title: "WAV or MP3 output", text: "Download an uncompressed master or a compressed file for sharing." },
  { icon: Wallet, title: "Zero API costs", text: "No keys, no billing, no surprises. Privately rendered on your device." },
  { icon: Smartphone, title: "Responsive interface", text: "A polished layout on every screen, with a clear notice if your browser can't run generation." },
  { icon: Zap, title: "Offline after the first run", text: "Each voice is saved on your device, so later clips need no download at all." },
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
          Racira TTS combines a polished interface with fast on-device
          synthesis, so you can focus on the script — not the setup.
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
