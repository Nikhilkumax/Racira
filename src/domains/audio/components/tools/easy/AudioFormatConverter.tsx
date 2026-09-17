"use client";

/**
 * Audio Format Converter — the "universal" conversion tool: pick any output
 * format from the format table (FORMATS/EncodeSettings, Node-verified) with
 * the full quality/bit-depth/channel/rate/metadata control set. Delegates the
 * entire queue+encode flow to UniversalAudioConverter with no format pinned;
 * that component escalates to the in-process encoders or ffmpeg.wasm itself.
 */

import UniversalAudioConverter from "@/domains/audio/components/tools/UniversalAudioConverter";

export default function AudioFormatConverter() {
  return <UniversalAudioConverter />;
}
