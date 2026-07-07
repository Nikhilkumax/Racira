import { Search } from "lucide-react";
import { TTSHero } from "@/domains/voice/components/tts-sections/TTSHero";
import { StudioCard } from "@/domains/voice/components/tts/StudioCard";
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
            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            10+ Free Voice Tools —{" "}
            <span className="hero-gradient-text">Record, Pitch & Modulate</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Browser-based tools to record, change pitch, and modulate your voice securely. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search 10+ voice tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Voice Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 pb-20 sm:px-6 lg:px-8">
        <StudioCard />
      </div>

      <TTSFeatures />
      <TTSWhyRacira />
      <TTSFAQ />
      <TTSSeoContent />
    </div>
  );
}
