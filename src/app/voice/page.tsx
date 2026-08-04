import { TTSHero } from "@/domains/voice/components/tts-sections/TTSHero";
import { DeviceGate } from "@/domains/voice/components/DeviceGate";
import { KokoroGenerator } from "@/domains/voice/components/tts/KokoroGenerator";
import { TTSFeatures } from "@/domains/voice/components/tts-sections/TTSFeatures";
import { TTSWhyRacira } from "@/domains/voice/components/tts-sections/TTSWhyRacira";
import { TTSFAQ } from "@/domains/voice/components/tts-sections/TTSFAQ";
import { TTSSeoContent } from "@/domains/voice/components/tts-sections/TTSSeoContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Text to Speech Online | Natural AI Voices — Racira TTS",
  description: "Convert text to speech instantly with Racira TTS. 28 natural AI voices in US and UK English, with unlimited generation. No signup required, private and browser-based.",
  keywords: ["text to speech", "free tts", "ai voice generator", "online tts", "speech synthesis", "hindi tts", "multilingual tts"],
  openGraph: {
    title: "Free Text to Speech Online | Natural AI Voices — Racira TTS",
    description: "Convert text to speech instantly with Racira TTS. 28 natural AI voices in US and UK English, with unlimited generation.",
    type: "website",
    url: "https://racira.com/voice",
  },
};

export default function VoicePage() {
  return (
    <div className="flex flex-col">
      <TTSHero />

      {/* id lives here, not on KokoroGenerator, so the #studio anchor still
          resolves while DeviceGate is checking or showing an upgrade screen. */}
      <div id="studio">
        <DeviceGate>
          <KokoroGenerator />
        </DeviceGate>
      </div>

      <TTSFeatures />
      <TTSWhyRacira />
      <TTSFAQ />
      <TTSSeoContent />
    </div>
  );
}
