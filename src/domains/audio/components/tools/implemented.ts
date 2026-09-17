/**
 * Slugs that have a real tool implementation wired into ToolRenderer.
 *
 * Server-safe on purpose: it holds no JSX and no `next/dynamic` call, so the
 * `[slug]` server component can import it to decide whether to mount a tool or
 * fall back to the coming-soon state. A tool marked `status: "live"` in the
 * registry but missing from this set still renders coming-soon instead of an
 * empty page.
 *
 * The format-converter slugs are derived from the format table rather than
 * hand-listed, so a format can never be wired into ToolRenderer without also
 * being considered implemented here. The Easy-tier slugs ARE hand-listed in
 * EASY_TOOL_SLUG_LIST, which is the single source of truth for both the
 * `EasyToolSlug` union and the Set below: the component registry
 * (./ToolRenderer.tsx) is typed as `Record<EasyToolSlug, ComponentType>`, so
 * wiring a component for a slug not in this list — or marking a registry entry
 * live without a component — stops the build instead of shipping a coming-soon
 * page behind a "live" badge.
 *
 * Keep in sync with the TOOL_COMPONENTS map in ./ToolRenderer.tsx.
 */
import { FORMAT_ORDER, FORMATS } from "@/domains/audio/lib/audioFormats";

/** Easy-tier tools with real implementations, appended per batch. */
export const EASY_TOOL_SLUG_LIST = [
  "audio-reverser", // batch 1
  "audio-speed-changer", // batch 1
  "audio-amplifier", // batch 1
  "silence-remover", // batch 1
  "volume-booster", // batch 1
  "volume-reducer", // batch 2
  "echo-delay-generator", // batch 2
  "tremolo-effect", // batch 2
  "vibrato-effect", // batch 2
  "distortion-effect",
  "ring-modulator",
  "stereo-widener",
  "mono-to-stereo-converter",
  "stereo-to-mono-converter",
  "mid-side-encoder", // batch 2
  "mid-side-decoder", // batch 4
  "radio-effect", // batch 4
  "telephone-effect", // batch 4
  "underwater-effect", // batch 4
  "voice-memo", // batch 4
  "quick-sound-capture", // batch 5
  "waveform-visualizer", // batch 5
  "spectrum-analyzer", // batch 5
  "frequency-analyzer", // batch 5
  "rms-meter", // batch 5
  "white-noise-generator", // batch 7
  "pink-noise-generator", // batch 7
  "brown-noise-generator", // batch 7
  "sine-wave-generator", // batch 7
  "square-wave-generator", // batch 7
  "sawtooth-wave-generator", // batch 8
  "triangle-wave-generator", // batch 8
  "pulse-wave-generator", // batch 8
  "chirp-generator", // batch 8
  "sweep-tone-generator", // batch 8
  "warble-tone-generator", // batch 9
  "binaural-beat-generator", // batch 9
  "isochronic-tone-generator", // batch 9
  "solfeggio-frequency-generator", // batch 9
  "432-hz-generator", // batch 9
  "528-hz-generator", // batch 10
  "test-tone-generator", // batch 10
  "frequency-sweep-generator", // batch 10
  "click-track-generator", // batch 10
  "metronome", // batch 10
  "bpm-calculator", // batch 11
  "tap-tempo", // batch 11
  "delay-time-calculator", // batch 11
  "reverb-time-calculator", // batch 11
  "note-frequency-calculator", // batch 11
  "interval-calculator", // batch 12
  "chord-calculator", // batch 12
  "scale-generator", // batch 12
  "chord-progression-builder", // batch 12
  "circle-of-fifths-tool", // batch 12
  "key-signature-identifier", // batch 12
  "time-signature-calculator", // batch 13
  "sample-rate-calculator", // batch 13
  "bit-depth-calculator", // batch 13
  "audio-file-size-calculator", // batch 13
  "streaming-bitrate-calculator", // batch 14
  "midi-note-to-frequency", // batch 14
  "frequency-to-midi-note", // batch 14
  "cents-calculator", // batch 14
  "playback-speed-calculator", // batch 14
  "channel-mixer", // batch 15
  "left-right-channel-swapper", // batch 15
  "channel-inverter", // batch 15
  "channel-isolator", // batch 15
  "mid-side-processor", // batch 15
  "panning-tool", // batch 16
  "balance-adjuster", // batch 16
  "dc-offset-remover", // batch 16
  "phase-inverter", // batch 16
  "batch-file-renamer", // batch 16
  "show-notes-timestamp-generator", // batch 17
  "podcast-chapter-marker-tool", // batch 17
  "id3-tag-editor", // batch 17
  "audio-speed-slow-down", // batch 18
  "podcast-cover-art-generator", // batch 18
  "room-tone-generator", // batch 18
  "hearing-aid-frequency-reference", // batch 18
  "vu-meter", // batch 6
  "ppm-meter", // batch 6
  "crest-factor-meter", // batch 6
  "frequency-counter", // batch 6
  "tone-generator", // batch 6
  "pitch-shift-calculator", // batch 19
  "musical-transpose-tool", // batch 19
  "guitar-tuner", // batch 19
  "instrument-tuner", // batch 19
  "voice-recorder", // batch 20
  "microphone-recorder", // batch 20
  "browser-tab-recorder", // batch 20
  "system-audio-recorder", // batch 20
  "streaming-audio-recorder", // batch 20
  "audio-trimmer", // batch 21
  "audio-cutter", // batch 21
  "audio-slicer", // batch 21
  "audio-joiner", // batch 21
  "audio-merger", // batch 21
  "silence-statistics-calculator", // batch 22
  "audio-bitrate-reference", // batch 22
  "sample-rate-reference", // batch 22
  "codec-compatibility-reference", // batch 22
  "loudness-standards-reference", // batch 22
  "audio-format-converter", // batch 23
  "bitrate-quality-converter", // batch 23
  "wma-m4b-caf-decoder", // batch 23
  "alac-m4a-lossless-converter", // batch 23
  "audio-splitter", // batch 23
  "audio-normalizer", // batch 24
  "audio-limiter", // batch 24
  "audio-compressor", // batch 24
  "audio-expander", // batch 24
  "audio-gate", // batch 24
  "audio-leveler", // batch 25
  "loudness-normalizer", // batch 25
  "rms-normalizer", // batch 25
  "multiband-compressor", // batch 25
  "parallel-compressor", // batch 25
  "loudness-meter-lufs", // batch 26
  "loudness-range-lra-meter", // batch 26
  "loudness-histogram", // batch 26
  "streaming-platform-loudness-guide", // batch 26
  "multi-guest-leveler", // batch 26
  "audio-fade-in-out", // batch 27
  "crossfade-creator", // batch 27
  "audio-loop-maker", // batch 27
  "sample-chopper", // batch 27
  "ringtone-maker", // batch 27
  "audio-pitch-shifter", // batch 28
  "tempo-changer", // batch 28
  "time-stretcher", // batch 28
  "harmonizer", // batch 28
  "8d-audio-converter", // batch 28
] as const;

export type EasyToolSlug = (typeof EASY_TOOL_SLUG_LIST)[number];

export const IMPLEMENTED_TOOL_SLUGS = new Set<string>([
  ...FORMAT_ORDER.map((id) => FORMATS[id].slug),
  ...EASY_TOOL_SLUG_LIST,
]);

export function hasAudioToolImplementation(slug: string): boolean {
  return IMPLEMENTED_TOOL_SLUGS.has(slug);
}
