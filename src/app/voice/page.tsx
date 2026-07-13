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
      <TTSHero />
      
      <div className="racira-page-container pb-20">
        <StudioCard />
      </div>

      <TTSFeatures />
      <TTSWhyRacira />
      <TTSFAQ />
      <TTSSeoContent />
    </div>
  );
}
