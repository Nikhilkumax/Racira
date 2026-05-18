import { TTSHero } from "@/components/tts-sections/TTSHero";
import { StudioCard } from "@/components/tts/StudioCard";
import { TTSFeatures } from "@/components/tts-sections/TTSFeatures";
import { TTSWhyRacira } from "@/components/tts-sections/TTSWhyRacira";
import { TTSFAQ } from "@/components/tts-sections/TTSFAQ";
import { TTSSeoContent } from "@/components/tts-sections/TTSSeoContent";
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
