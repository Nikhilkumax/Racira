import { TTSHero } from "@/domains/voice/components/tts-sections/TTSHero";
import { Clock } from "lucide-react";

// TTS Studio (StudioCard) depends on tts-worker.js which is not yet committed.
// Flip to `true` once the worker file is added to the repo.
const TTS_STUDIO_ENABLED = false;
import { TTSFeatures } from "@/domains/voice/components/tts-sections/TTSFeatures";
import { TTSWhyRacira } from "@/domains/voice/components/tts-sections/TTSWhyRacira";
import { TTSFAQ } from "@/domains/voice/components/tts-sections/TTSFAQ";
import { TTSSeoContent } from "@/domains/voice/components/tts-sections/TTSSeoContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Text to Speech Online | Natural AI Voices — Racira TTS",
  description: "Convert text to speech instantly with Racira TTS. 100+ natural AI voices, 50+ languages, and unlimited generation. No signup required, private and browser-based.",
  keywords: ["text to speech", "free tts", "ai voice generator", "online tts", "speech synthesis", "hindi tts", "multilingual tts"],
  openGraph: {
    title: "Free Text to Speech Online | Natural AI Voices — Racira TTS",
    description: "Convert text to speech instantly with Racira TTS. 100+ natural AI voices, 50+ languages, and unlimited generation.",
    type: "website",
    url: "https://racira.com/voice",
  },
};

export default function VoicePage() {
  return (
    <div className="flex flex-col">
      <TTSHero />
      
      <div className="racira-page-container pb-20">
        {TTS_STUDIO_ENABLED ? (
          // StudioCard is intentionally not imported while tts-worker.js is absent.
          // Re-add: import { StudioCard } from "@/domains/voice/components/tts/StudioCard";
          null
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border-subtle bg-gradient-card shadow-elevated">
            <div className="relative px-8 py-20 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
                <Clock className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight">TTS Studio — Coming Soon</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                The AI-powered speech synthesis studio is under active development.
                Check back soon for natural, expressive voice generation — fully browser-based.
              </p>
            </div>
          </div>
        )}
      </div>

      <TTSFeatures />
      <TTSWhyRacira />
      <TTSFAQ />
      <TTSSeoContent />
    </div>
  );
}
