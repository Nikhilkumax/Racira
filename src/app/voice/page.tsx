import { CategorySearch } from "@/components/CategorySearch";
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
          <CategorySearch categorySlug="voice" placeholder="Search 10+ voice tools..." registry={[]} />
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
