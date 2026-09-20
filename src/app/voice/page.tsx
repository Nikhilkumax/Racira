import { TTSHero } from "@/domains/voice/components/tts-sections/TTSHero";
import { VoiceSupportGate } from "@/domains/voice/components/VoiceSupportGate";
import { SpeechStudio } from "@/domains/voice/components/tts/SpeechStudio";
import { TTSFeatures } from "@/domains/voice/components/tts-sections/TTSFeatures";
import { TTSWhyRacira } from "@/domains/voice/components/tts-sections/TTSWhyRacira";
import { TTSFAQ } from "@/domains/voice/components/tts-sections/TTSFAQ";
import { TTSSeoContent } from "@/domains/voice/components/tts-sections/TTSSeoContent";
import type { Metadata } from "next";
import { VOICE_SITE } from "@/domains/voice/site";
import { VOICE_COUNT, LANGUAGE_COUNT } from "@/domains/voice/lib/voiceCatalog";

// The voice and language counts are read from the catalog rather than written
// into the copy, so a voice list update cannot leave the SEO description
// claiming a number the picker no longer offers.
const DESCRIPTION =
  `Convert text to speech instantly with Racira TTS. ${VOICE_COUNT} natural voices ` +
  `across ${LANGUAGE_COUNT} languages, with unlimited generation. No signup required, ` +
  `private and browser-based.`;

export const metadata: Metadata = {
  title: VOICE_SITE.title,
  description: DESCRIPTION,
  keywords: ["text to speech", "free tts", "ai voice generator", "online tts", "speech synthesis", "multilingual tts", "browser tts"],
  openGraph: {
    title: VOICE_SITE.title,
    description: DESCRIPTION,
    type: "website",
    url: "https://racira.com/voice",
  },
  twitter: {
    card: "summary",
    title: VOICE_SITE.title,
  },
};

export default function VoicePage() {
  return (
    <div className="flex flex-col">
      <TTSHero />

      {/* id lives here, not on the studio, so the #studio anchor still resolves
          while the capability check is running or showing a notice. */}
      <div id="studio">
        <VoiceSupportGate>
          <SpeechStudio />
        </VoiceSupportGate>
      </div>

      <TTSFeatures />
      <TTSWhyRacira />
      <TTSFAQ />
      <TTSSeoContent />
    </div>
  );
}
