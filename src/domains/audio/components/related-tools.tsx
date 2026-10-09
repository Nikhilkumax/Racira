import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { categories } from "@/domains/audio/registry";
import { isLiveTool } from "@/lib/tools/liveToolFilters";
import { inferIcon } from "@/components/shared/icon-map";

/**
 * Curated related picks, keyed by tool slug.
 *
 * Same pattern as the colors/typography domains: this domain is typed against
 * the audio registry and renders its own card markup rather than the shared
 * `ToolCard` (that component is a client component, and a Lucide icon is a
 * component, so passing one from this server component across the client
 * boundary throws "Functions cannot be passed directly to Client Components").
 *
 * Every pick is a live audio tool, never the current tool, and is chosen for a
 * real functional relationship — a shared engine, a complementary step, or the
 * natural next tool for the same job — not merely a shared category. Tools
 * without a curated entry fall back to same-category live tools ranked by
 * description overlap, so every tool page still gets a full row; curated entries
 * are added per tool as each SEO batch is authored.
 */
const CURATED_RELATED: Record<string, string[]> = {
  // ── Accessibility (batch 1) ──────────────────────────────────────
  "audio-speed-slow-down": [
    "audio-speed-changer",
    "tempo-changer",
    "time-stretcher",
    "playback-speed-calculator",
  ],
  "hearing-aid-frequency-reference": [
    "frequency-analyzer",
    "frequency-counter",
    "tone-generator",
    "note-frequency-calculator",
  ],

  // ── Podcast & Creator (batch 2) ──────────────────────────────────
  "show-notes-timestamp-generator": [
    "podcast-chapter-marker-tool",
    "id3-tag-editor",
    "podcast-recorder",
    "podcast-cover-art-generator",
  ],
  "podcast-chapter-marker-tool": [
    "id3-tag-editor",
    "show-notes-timestamp-generator",
    "podcast-recorder",
    "batch-file-renamer",
  ],
  "id3-tag-editor": [
    "podcast-chapter-marker-tool",
    "show-notes-timestamp-generator",
    "batch-file-renamer",
    "podcast-cover-art-generator",
  ],
  "podcast-cover-art-generator": [
    "id3-tag-editor",
    "waveform-visualizer",
    "podcast-recorder",
    "podcast-chapter-marker-tool",
  ],
  "multi-guest-leveler": [
    "audio-leveler",
    "loudness-normalizer",
    "rms-normalizer",
    "audio-compressor",
  ],
  "room-tone-generator": [
    "white-noise-generator",
    "pink-noise-generator",
    "brown-noise-generator",
    "noise-reducer",
  ],

  // ── Audio Metadata & Technical (batch 3) ─────────────────────────
  "silence-statistics-calculator": [
    "silence-remover",
    "audio-gate",
    "waveform-visualizer",
    "audio-trimmer",
  ],
  "audio-bitrate-reference": [
    "bitrate-quality-converter",
    "audio-file-size-calculator",
    "streaming-bitrate-calculator",
    "mp3-converter",
  ],
  "sample-rate-reference": [
    "sample-rate-calculator",
    "audio-format-converter",
    "bit-depth-calculator",
    "wav-converter",
  ],
  "codec-compatibility-reference": [
    "audio-format-converter",
    "flac-converter",
    "alac-m4a-lossless-converter",
    "sample-rate-reference",
  ],
  "loudness-standards-reference": [
    "loudness-meter-lufs",
    "loudness-normalizer",
    "true-peak-meter",
    "loudness-range-lra-meter",
  ],
  "streaming-platform-loudness-guide": [
    "loudness-normalizer",
    "loudness-meter-lufs",
    "audio-limiter",
    "loudness-standards-reference",
  ],

  // ── Audio Cleanup (batch 4) ──────────────────────────────────────
  "noise-reducer": [
    "background-noise-remover",
    "hiss-remover",
    "hum-remover",
    "audio-gate",
  ],
  "background-noise-remover": [
    "hum-remover",
    "noise-reducer",
    "wind-noise-remover",
    "dc-offset-remover",
  ],
  "hiss-remover": [
    "noise-reducer",
    "background-noise-remover",
    "sibilance-reducer",
    "equalizer",
  ],
  "hum-remover": [
    "background-noise-remover",
    "noise-reducer",
    "dc-offset-remover",
    "wind-noise-remover",
  ],
  "click-pop-remover": [
    "clipping-distortion-remover",
    "noise-reducer",
    "vinyl-record-effect",
    "hiss-remover",
  ],
  "plosive-remover": [
    "wind-noise-remover",
    "sibilance-reducer",
    "audio-gate",
    "voice-recorder",
  ],
  "sibilance-reducer": [
    "plosive-remover",
    "hiss-remover",
    "equalizer",
    "voice-recorder",
  ],
  "wind-noise-remover": [
    "plosive-remover",
    "hum-remover",
    "dc-offset-remover",
    "voice-recorder",
  ],

  // ── Channel & Utility (batch 5) ──────────────────────────────────
  "channel-mixer": [
    "left-right-channel-swapper",
    "mid-side-processor",
    "panning-tool",
    "mono-to-stereo-converter",
  ],
  "left-right-channel-swapper": [
    "channel-inverter",
    "channel-mixer",
    "channel-isolator",
    "phase-inverter",
  ],
  "channel-inverter": [
    "phase-inverter",
    "left-right-channel-swapper",
    "channel-isolator",
    "mid-side-processor",
  ],
  "channel-isolator": [
    "mid-side-processor",
    "channel-mixer",
    "left-right-channel-swapper",
    "stereo-to-mono-converter",
  ],
  "mid-side-processor": [
    "mid-side-encoder",
    "mid-side-decoder",
    "stereo-widener",
    "panning-tool",
  ],
  "panning-tool": [
    "balance-adjuster",
    "stereo-widener",
    "channel-mixer",
    "8d-audio-converter",
  ],
  "balance-adjuster": [
    "panning-tool",
    "channel-mixer",
    "volume-reducer",
    "left-right-channel-swapper",
  ],
  "dc-offset-remover": [
    "clipping-distortion-remover",
    "phase-inverter",
    "channel-inverter",
    "audio-normalizer",
  ],
  "phase-inverter": [
    "channel-inverter",
    "dc-offset-remover",
    "phase-meter",
    "correlation-meter",
  ],
  "batch-file-renamer": [
    "id3-tag-editor",
    "podcast-chapter-marker-tool",
    "show-notes-timestamp-generator",
    "audio-format-converter",
  ],

  // ── Volume & Dynamics (batch 6) ──────────────────────────────────
  "volume-booster": [
    "audio-amplifier",
    "volume-reducer",
    "audio-limiter",
    "peak-limiter",
  ],
  "volume-reducer": [
    "volume-booster",
    "balance-adjuster",
    "audio-normalizer",
    "audio-fade-in-out",
  ],
  "audio-leveler": [
    "loudness-normalizer",
    "rms-normalizer",
    "audio-compressor",
    "multi-guest-leveler",
  ],
  "loudness-normalizer": [
    "loudness-meter-lufs",
    "rms-normalizer",
    "true-peak-meter",
    "streaming-platform-loudness-guide",
  ],
  "peak-limiter": [
    "brickwall-limiter",
    "audio-limiter",
    "clipping-distortion-remover",
    "loudness-normalizer",
  ],
  "rms-normalizer": [
    "loudness-normalizer",
    "audio-normalizer",
    "audio-leveler",
    "dynamic-range-compressor",
  ],
  "dynamic-range-compressor": [
    "audio-compressor",
    "multiband-compressor",
    "parallel-compressor",
    "audio-leveler",
  ],
  "multiband-compressor": [
    "dynamic-range-compressor",
    "equalizer",
    "bass-booster",
    "audio-compressor",
  ],
  "parallel-compressor": [
    "dynamic-range-compressor",
    "audio-compressor",
    "sidechain-compressor",
    "multiband-compressor",
  ],
  "sidechain-compressor": [
    "audio-compressor",
    "parallel-compressor",
    "dynamic-range-compressor",
    "loudness-normalizer",
  ],
  "brickwall-limiter": [
    "peak-limiter",
    "audio-limiter",
    "clipping-distortion-remover",
    "loudness-normalizer",
  ],
  "clipping-distortion-remover": [
    "peak-limiter",
    "brickwall-limiter",
    "dc-offset-remover",
    "audio-limiter",
  ],

  // ── Audio Recording (batch 7) ────────────────────────────────────
  "voice-recorder": [
    "scheduled-recorder",
    "microphone-recorder",
    "podcast-recorder",
    "noise-reducer",
  ],
  "microphone-recorder": [
    "voice-recorder",
    "interview-recorder",
    "song-recorder",
    "voice-memo",
  ],
  "browser-tab-recorder": [
    "quick-sound-capture",
    "streaming-audio-recorder",
    "system-audio-recorder",
    "audio-trimmer",
  ],
  "system-audio-recorder": [
    "browser-tab-recorder",
    "streaming-audio-recorder",
    "quick-sound-capture",
    "audio-trimmer",
  ],
  "streaming-audio-recorder": [
    "quick-sound-capture",
    "browser-tab-recorder",
    "system-audio-recorder",
    "audio-cutter",
  ],
  "scheduled-recorder": [
    "voice-recorder",
    "interview-recorder",
    "microphone-recorder",
    "voice-memo",
  ],
  "voice-memo": [
    "voice-recorder",
    "microphone-recorder",
    "podcast-recorder",
    "noise-reducer",
  ],
  "podcast-recorder": [
    "podcast-chapter-marker-tool",
    "voice-recorder",
    "interview-recorder",
    "id3-tag-editor",
  ],
  "interview-recorder": [
    "multi-guest-leveler",
    "voice-recorder",
    "podcast-recorder",
    "noise-reducer",
  ],
  "song-recorder": [
    "voice-recorder",
    "microphone-recorder",
    "audio-trimmer",
    "metronome",
  ],
  "loop-recorder": [
    "audio-loop-maker",
    "metronome",
    "click-track-generator",
    "voice-recorder",
  ],
  "quick-sound-capture": [
    "browser-tab-recorder",
    "streaming-audio-recorder",
    "system-audio-recorder",
    "audio-trimmer",
  ],

  // ── Audio Conversion (batch 8) ───────────────────────────────────
  "audio-format-converter": [
    "wma-converter",
    "mp3-converter",
    "flac-converter",
    "wav-converter",
  ],
  "bitrate-quality-converter": [
    "audio-format-converter",
    "mp3-converter",
    "audio-file-size-calculator",
    "streaming-bitrate-calculator",
  ],
  "wma-m4b-caf-decoder": [
    "alac-m4a-lossless-converter",
    "audio-format-converter",
    "mp3-converter",
    "flac-converter",
  ],
  "alac-m4a-lossless-converter": [
    "wma-m4b-caf-decoder",
    "audio-format-converter",
    "flac-converter",
    "m4a-converter",
  ],

  // ── Audio Analysis & Metering (batch 9) ──────────────────────────
  "waveform-visualizer": [
    "spectrogram-viewer",
    "frequency-analyzer",
    "rms-meter",
    "audio-trimmer",
  ],
  "spectrum-analyzer": [
    "frequency-analyzer",
    "spectrogram-viewer",
    "waveform-visualizer",
    "goniometer-vectorscope",
  ],
  "spectrogram-viewer": [
    "spectrum-analyzer",
    "waveform-visualizer",
    "frequency-analyzer",
    "noise-reducer",
  ],
  "frequency-analyzer": [
    "frequency-counter",
    "spectrum-analyzer",
    "hearing-aid-frequency-reference",
    "waveform-visualizer",
  ],
  "phase-meter": [
    "correlation-meter",
    "goniometer-vectorscope",
    "channel-inverter",
    "mid-side-processor",
  ],
  "correlation-meter": [
    "phase-meter",
    "goniometer-vectorscope",
    "mid-side-processor",
    "channel-mixer",
  ],
  "goniometer-vectorscope": [
    "correlation-meter",
    "phase-meter",
    "mid-side-processor",
    "channel-isolator",
  ],
  "loudness-meter-lufs": [
    "ppm-meter",
    "true-peak-meter",
    "loudness-normalizer",
    "streaming-platform-loudness-guide",
  ],
  "true-peak-meter": [
    "peak-limiter",
    "loudness-meter-lufs",
    "loudness-normalizer",
    "loudness-histogram",
  ],
  "rms-meter": [
    "crest-factor-meter",
    "vu-meter",
    "rms-normalizer",
    "peak-limiter",
  ],
  "vu-meter": [
    "ppm-meter",
    "rms-meter",
    "audio-leveler",
    "crest-factor-meter",
  ],
  "ppm-meter": [
    "vu-meter",
    "true-peak-meter",
    "crest-factor-meter",
    "rms-meter",
  ],
  "crest-factor-meter": [
    "rms-meter",
    "peak-limiter",
    "dynamic-range-compressor",
    "true-peak-meter",
  ],
  "frequency-counter": [
    "frequency-analyzer",
    "spectrum-analyzer",
    "spectrogram-viewer",
    "waveform-visualizer",
  ],
  "loudness-range-lra-meter": [
    "loudness-histogram",
    "loudness-meter-lufs",
    "dynamic-range-compressor",
    "loudness-normalizer",
  ],
  "loudness-histogram": [
    "loudness-range-lra-meter",
    "loudness-meter-lufs",
    "loudness-normalizer",
    "streaming-platform-loudness-guide",
  ],

  // ── Audio Generation (batch 10) ─────────────────────────────────
  "tone-generator": [
    "sine-wave-generator",
    "square-wave-generator",
    "warble-tone-generator",
    "frequency-sweep-generator",
  ],
  "white-noise-generator": [
    "pink-noise-generator",
    "brown-noise-generator",
    "noise-reducer",
    "room-tone-generator",
  ],
  "pink-noise-generator": [
    "white-noise-generator",
    "brown-noise-generator",
    "room-tone-generator",
    "spectrum-analyzer",
  ],
  "brown-noise-generator": [
    "pink-noise-generator",
    "white-noise-generator",
    "room-tone-generator",
    "spectrum-analyzer",
  ],
  "sine-wave-generator": [
    "tone-generator",
    "triangle-wave-generator",
    "test-tone-generator",
    "432-hz-generator",
  ],
  "square-wave-generator": [
    "pulse-wave-generator",
    "sawtooth-wave-generator",
    "triangle-wave-generator",
    "tone-generator",
  ],
  "sawtooth-wave-generator": [
    "square-wave-generator",
    "pulse-wave-generator",
    "triangle-wave-generator",
    "tone-generator",
  ],
  "triangle-wave-generator": [
    "sine-wave-generator",
    "sawtooth-wave-generator",
    "square-wave-generator",
    "tone-generator",
  ],
  "pulse-wave-generator": [
    "square-wave-generator",
    "tone-generator",
    "sawtooth-wave-generator",
    "chirp-generator",
  ],
  "chirp-generator": [
    "sweep-tone-generator",
    "frequency-sweep-generator",
    "warble-tone-generator",
    "spectrogram-viewer",
  ],
  "sweep-tone-generator": [
    "frequency-sweep-generator",
    "chirp-generator",
    "spectrogram-viewer",
    "frequency-analyzer",
  ],

  // ── Audio Generation (batch 11) ─────────────────────────────────
  "warble-tone-generator": [
    "chirp-generator",
    "sweep-tone-generator",
    "test-tone-generator",
    "tone-generator",
  ],
  "binaural-beat-generator": [
    "isochronic-tone-generator",
    "solfeggio-frequency-generator",
    "528-hz-generator",
    "432-hz-generator",
  ],
  "isochronic-tone-generator": [
    "binaural-beat-generator",
    "solfeggio-frequency-generator",
    "metronome",
    "click-track-generator",
  ],
  "solfeggio-frequency-generator": [
    "528-hz-generator",
    "432-hz-generator",
    "binaural-beat-generator",
    "isochronic-tone-generator",
  ],
  "432-hz-generator": [
    "528-hz-generator",
    "solfeggio-frequency-generator",
    "sine-wave-generator",
    "tone-generator",
  ],
  "528-hz-generator": [
    "432-hz-generator",
    "solfeggio-frequency-generator",
    "binaural-beat-generator",
    "sine-wave-generator",
  ],
  "test-tone-generator": [
    "tone-generator",
    "frequency-sweep-generator",
    "sweep-tone-generator",
    "true-peak-meter",
  ],
  "frequency-sweep-generator": [
    "sweep-tone-generator",
    "chirp-generator",
    "spectrogram-viewer",
    "frequency-analyzer",
  ],
  "click-track-generator": [
    "metronome",
    "loop-recorder",
    "song-recorder",
    "sine-wave-generator",
  ],
  "metronome": [
    "click-track-generator",
    "song-recorder",
    "loop-recorder",
    "tone-generator",
  ],

  // ── Audio Trimming & Editing (batch 12) ─────────────────────────
  "audio-trimmer": [
    "audio-cutter",
    "audio-fade-in-out",
    "ringtone-maker",
    "silence-remover",
  ],
  "audio-cutter": [
    "audio-splitter",
    "audio-trimmer",
    "sample-chopper",
    "click-pop-remover",
  ],
  "audio-splitter": [
    "audio-cutter",
    "audio-slicer",
    "silence-remover",
    "audio-joiner",
  ],
  "audio-joiner": [
    "audio-merger",
    "crossfade-creator",
    "audio-trimmer",
    "batch-file-renamer",
  ],
  "audio-merger": [
    "audio-joiner",
    "crossfade-creator",
    "audio-loop-maker",
    "audio-normalizer",
  ],
  "audio-slicer": [
    "audio-reverser",
    "audio-splitter",
    "audio-loop-maker",
    "click-track-generator",
  ],
  "audio-loop-maker": [
    "crossfade-creator",
    "audio-reverser",
    "sample-chopper",
    "tempo-changer",
  ],
  "sample-chopper": [
    "audio-slicer",
    "audio-loop-maker",
    "audio-cutter",
    "click-track-generator",
  ],
  "audio-fade-in-out": [
    "crossfade-creator",
    "audio-trimmer",
    "silence-remover",
    "click-pop-remover",
  ],
  "crossfade-creator": [
    "audio-fade-in-out",
    "audio-joiner",
    "audio-loop-maker",
    "audio-merger",
  ],
  "audio-reverser": [
    "audio-loop-maker",
    "audio-trimmer",
    "slowed-reverb-nightcore",
    "echo-delay-generator",
  ],
  "audio-speed-changer": [
    "audio-speed-slow-down",
    "tempo-changer",
    "time-stretcher",
    "playback-speed-calculator",
  ],

  // ── Audio Trimming & Editing (batch 13) ─────────────────────────
  "audio-pitch-shifter": [
    "tempo-changer",
    "time-stretcher",
    "pitch-shift-calculator",
    "musical-transpose-tool",
  ],
  "tempo-changer": [
    "time-stretcher",
    "audio-speed-changer",
    "bpm-calculator",
    "audio-speed-slow-down",
  ],
  "time-stretcher": [
    "tempo-changer",
    "playback-speed-calculator",
    "audio-speed-changer",
    "sample-rate-calculator",
  ],
  "audio-normalizer": [
    "audio-amplifier",
    "loudness-normalizer",
    "rms-normalizer",
    "peak-limiter",
  ],
  "audio-amplifier": [
    "audio-normalizer",
    "volume-booster",
    "audio-limiter",
    "brickwall-limiter",
  ],
  "audio-limiter": [
    "brickwall-limiter",
    "peak-limiter",
    "audio-normalizer",
    "clipping-distortion-remover",
  ],
  "audio-compressor": [
    "dynamic-range-compressor",
    "multiband-compressor",
    "parallel-compressor",
    "audio-limiter",
  ],
  "audio-expander": [
    "audio-gate",
    "noise-reducer",
    "dynamic-range-compressor",
    "hiss-remover",
  ],
  "audio-gate": [
    "silence-remover",
    "audio-expander",
    "noise-reducer",
    "background-noise-remover",
  ],
  "silence-remover": [
    "audio-splitter",
    "silence-statistics-calculator",
    "audio-trimmer",
    "noise-reducer",
  ],
  "ringtone-maker": [
    "audio-trimmer",
    "audio-fade-in-out",
    "m4a-converter",
    "audio-loop-maker",
  ],

  // ── Music Tools (batch 14) ──────────────────────────────────────
  "bpm-calculator": [
    "tap-tempo",
    "delay-time-calculator",
    "time-signature-calculator",
    "tempo-changer",
  ],
  "tap-tempo": [
    "bpm-calculator",
    "delay-time-calculator",
    "metronome",
    "click-track-generator",
  ],
  "delay-time-calculator": [
    "reverb-time-calculator",
    "bpm-calculator",
    "echo-delay-generator",
    "tap-tempo",
  ],
  "reverb-time-calculator": [
    "delay-time-calculator",
    "reverb-simulator",
    "bpm-calculator",
    "convolution-reverb",
  ],
  "note-frequency-calculator": [
    "cents-calculator",
    "midi-note-to-frequency",
    "frequency-to-midi-note",
    "guitar-tuner",
  ],
  "interval-calculator": [
    "note-frequency-calculator",
    "cents-calculator",
    "chord-calculator",
    "musical-transpose-tool",
  ],
  "chord-calculator": [
    "scale-generator",
    "chord-progression-builder",
    "interval-calculator",
    "circle-of-fifths-tool",
  ],
  "scale-generator": [
    "chord-progression-builder",
    "chord-calculator",
    "key-signature-identifier",
    "guitar-tuner",
  ],
  "chord-progression-builder": [
    "scale-generator",
    "chord-calculator",
    "time-signature-calculator",
    "bpm-calculator",
  ],
  "circle-of-fifths-tool": [
    "key-signature-identifier",
    "chord-progression-builder",
    "scale-generator",
    "chord-calculator",
  ],
  "key-signature-identifier": [
    "circle-of-fifths-tool",
    "scale-generator",
    "chord-progression-builder",
    "interval-calculator",
  ],
  "time-signature-calculator": [
    "bpm-calculator",
    "tap-tempo",
    "delay-time-calculator",
    "click-track-generator",
  ],

  // ── Music Tools (batch 15) ──────────────────────────────────────
  "sample-rate-calculator": [
    "bit-depth-calculator",
    "audio-file-size-calculator",
    "codec-compatibility-reference",
    "sample-rate-reference",
  ],
  "bit-depth-calculator": [
    "sample-rate-calculator",
    "audio-file-size-calculator",
    "audio-bitrate-reference",
    "loudness-standards-reference",
  ],
  "audio-file-size-calculator": [
    "streaming-bitrate-calculator",
    "bit-depth-calculator",
    "sample-rate-calculator",
    "audio-bitrate-reference",
  ],
  "streaming-bitrate-calculator": [
    "audio-file-size-calculator",
    "bitrate-quality-converter",
    "streaming-platform-loudness-guide",
    "audio-bitrate-reference",
  ],
  "midi-note-to-frequency": [
    "frequency-to-midi-note",
    "note-frequency-calculator",
    "cents-calculator",
    "tone-generator",
  ],
  "frequency-to-midi-note": [
    "midi-note-to-frequency",
    "note-frequency-calculator",
    "cents-calculator",
    "guitar-tuner",
  ],
  "cents-calculator": [
    "note-frequency-calculator",
    "interval-calculator",
    "pitch-shift-calculator",
    "frequency-to-midi-note",
  ],
  "playback-speed-calculator": [
    "audio-speed-changer",
    "time-stretcher",
    "pitch-shift-calculator",
    "tempo-changer",
  ],
  "pitch-shift-calculator": [
    "audio-pitch-shifter",
    "playback-speed-calculator",
    "cents-calculator",
    "musical-transpose-tool",
  ],
  "musical-transpose-tool": [
    "chord-calculator",
    "scale-generator",
    "audio-pitch-shifter",
    "chord-progression-builder",
  ],
  "guitar-tuner": [
    "instrument-tuner",
    "note-frequency-calculator",
    "cents-calculator",
    "tone-generator",
  ],
  "instrument-tuner": [
    "guitar-tuner",
    "note-frequency-calculator",
    "scale-generator",
    "cents-calculator",
  ],

  // ── Audio Effects (batch 16) ────────────────────────────────────
  "reverb-simulator": [
    "convolution-reverb",
    "hallway-room-simulator",
    "slowed-reverb-nightcore",
    "echo-delay-generator",
  ],
  "convolution-reverb": [
    "reverb-simulator",
    "hallway-room-simulator",
    "reverb-time-calculator",
    "echo-delay-generator",
  ],
  "hallway-room-simulator": [
    "convolution-reverb",
    "reverb-simulator",
    "stereo-widener",
    "room-tone-generator",
  ],
  "echo-delay-generator": [
    "delay-time-calculator",
    "reverb-simulator",
    "chorus-effect",
    "old-tape-effect",
  ],
  "chorus-effect": [
    "flanger-effect",
    "phaser-effect",
    "stereo-widener",
    "echo-delay-generator",
  ],
  "flanger-effect": [
    "chorus-effect",
    "phaser-effect",
    "echo-delay-generator",
    "stereo-widener",
  ],
  "phaser-effect": [
    "flanger-effect",
    "chorus-effect",
    "auto-wah",
    "equalizer",
  ],
  "tremolo-effect": [
    "vibrato-effect",
    "auto-wah",
    "chorus-effect",
    "ring-modulator",
  ],
  "vibrato-effect": [
    "tremolo-effect",
    "chorus-effect",
    "pitch-shift-calculator",
    "flanger-effect",
  ],
  "distortion-effect": [
    "bitcrusher-effect",
    "ring-modulator",
    "old-tape-effect",
    "audio-limiter",
  ],
  "bitcrusher-effect": [
    "distortion-effect",
    "ring-modulator",
    "radio-effect",
    "sample-rate-calculator",
  ],
  "ring-modulator": [
    "tremolo-effect",
    "distortion-effect",
    "bitcrusher-effect",
    "telephone-effect",
  ],
  "auto-wah": [
    "phaser-effect",
    "equalizer",
    "flanger-effect",
    "tremolo-effect",
  ],
  "surround-sound-simulator": [
    "stereo-widener",
    "8d-audio-converter",
    "convolution-reverb",
    "room-tone-generator",
  ],
  "doppler-effect-simulator": [
    "stereo-widener",
    "8d-audio-converter",
    "surround-sound-simulator",
    "vibrato-effect",
  ],
  "stereo-widener": [
    "mid-side-encoder",
    "mid-side-decoder",
    "doppler-effect-simulator",
    "8d-audio-converter",
  ],
  "mono-to-stereo-converter": [
    "stereo-to-mono-converter",
    "stereo-widener",
    "channel-mixer",
    "mid-side-encoder",
  ],
  "stereo-to-mono-converter": [
    "mono-to-stereo-converter",
    "mid-side-decoder",
    "stereo-widener",
    "channel-mixer",
  ],
  "mid-side-encoder": [
    "mid-side-decoder",
    "stereo-widener",
    "mid-side-processor",
    "channel-mixer",
  ],
  "mid-side-decoder": [
    "mid-side-encoder",
    "stereo-widener",
    "mid-side-processor",
    "channel-mixer",
  ],
  // ── Audio Effects (batch 17) ────────────────────────────────────
  "pitch-correction": [
    "auto-tune-effect",
    "harmonizer",
    "audio-pitch-shifter",
    "pitch-shift-calculator",
  ],
  "harmonizer": [
    "pitch-correction",
    "auto-tune-effect",
    "pitch-shift-calculator",
    "chord-progression-builder",
  ],
  "auto-tune-effect": [
    "pitch-correction",
    "harmonizer",
    "audio-pitch-shifter",
    "pitch-shift-calculator",
  ],
  "underwater-effect": [
    "telephone-effect",
    "radio-effect",
    "reverb-simulator",
    "hallway-room-simulator",
  ],
  "radio-effect": [
    "telephone-effect",
    "bitcrusher-effect",
    "equalizer",
    "underwater-effect",
  ],
  "telephone-effect": [
    "radio-effect",
    "equalizer",
    "bitcrusher-effect",
    "underwater-effect",
  ],
  "old-tape-effect": [
    "vinyl-record-effect",
    "chorus-effect",
    "bitcrusher-effect",
    "distortion-effect",
  ],
  "vinyl-record-effect": [
    "old-tape-effect",
    "bitcrusher-effect",
    "distortion-effect",
    "equalizer",
  ],
  "equalizer": [
    "bass-booster",
    "auto-wah",
    "radio-effect",
    "audio-limiter",
  ],
  "bass-booster": [
    "equalizer",
    "audio-limiter",
    "volume-booster",
    "distortion-effect",
  ],
  "8d-audio-converter": [
    "stereo-widener",
    "surround-sound-simulator",
    "mono-to-stereo-converter",
    "vibrato-effect",
  ],
  "slowed-reverb-nightcore": [
    "pitch-shift-calculator",
    "audio-pitch-shifter",
    "reverb-simulator",
    "vinyl-record-effect",
  ],

  // ── Audio Conversion — legacy converters (batch 18) ──────────────
  "mp3-converter": [
    "m4a-converter",
    "ogg-converter",
    "aac-converter",
    "bitrate-quality-converter",
  ],
  "wav-converter": [
    "flac-converter",
    "aiff-converter",
    "alac-m4a-lossless-converter",
    "audio-format-converter",
  ],
  "ogg-converter": [
    "opus-converter",
    "mp3-converter",
    "codec-compatibility-reference",
    "audio-format-converter",
  ],
  "aac-converter": [
    "m4a-converter",
    "opus-converter",
    "bitrate-quality-converter",
    "codec-compatibility-reference",
  ],
  "flac-converter": [
    "wav-converter",
    "aiff-converter",
    "alac-m4a-lossless-converter",
    "audio-file-size-calculator",
  ],
  "m4a-converter": [
    "aac-converter",
    "alac-m4a-lossless-converter",
    "mp3-converter",
    "audio-format-converter",
  ],
  "wma-converter": [
    "wma-m4b-caf-decoder",
    "mp3-converter",
    "m4a-converter",
    "codec-compatibility-reference",
  ],
  "aiff-converter": [
    "wav-converter",
    "flac-converter",
    "alac-m4a-lossless-converter",
    "bit-depth-calculator",
  ],
  "opus-converter": [
    "ogg-converter",
    "mp3-converter",
    "streaming-bitrate-calculator",
    "codec-compatibility-reference",
  ],
};

const MAX_RELATED = 4;

const STOP_WORDS = new Set([
  "and", "the", "for", "with", "your", "you", "its", "from", "any", "own",
  "into", "out", "get", "see", "use", "test", "tests", "tool", "tools",
]);

const tokens = (text: string): Set<string> =>
  new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );

interface Candidate {
  slug: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  status: "live" | "soon";
  category: string;
  words: Set<string>;
}

const ALL_TOOLS: Candidate[] = categories.flatMap((cat) =>
  cat.tools.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    desc: tool.description,
    icon: tool.icon,
    status: tool.status,
    category: cat.name,
    words: tokens(`${tool.name} ${tool.description}`),
  })),
);

function overlap(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const word of a) if (b.has(word)) shared++;
  return shared;
}

/** Same-category live tools, best keyword match first, registry order on ties. */
function rankedSameCategory(
  current: Candidate | undefined,
  category: string,
  taken: Set<string>,
): Candidate[] {
  const candidates = ALL_TOOLS.filter(
    (tool) =>
      tool.category === category &&
      isLiveTool(tool, "audio") &&
      !taken.has(tool.slug),
  );
  if (!current) return candidates;
  return candidates
    .map((tool, index) => ({ tool, index, score: overlap(current.words, tool.words) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.tool);
}

interface RelatedToolsProps {
  currentSlug: string;
  category: string;
}

/**
 * "You Might Also Need" row — four related tools, placed under the tool UI and
 * above the SEO block. Every pick is live, never the current tool, and the card
 * markup mirrors the category grid's.
 */
export function RelatedTools({ currentSlug, category }: RelatedToolsProps) {
  const current = ALL_TOOLS.find((tool) => tool.slug === currentSlug);

  const curated = (CURATED_RELATED[currentSlug] ?? [])
    .map((slug) => ALL_TOOLS.find((tool) => tool.slug === slug))
    .filter(
      (tool): tool is Candidate =>
        tool !== undefined && tool.slug !== currentSlug && isLiveTool(tool, "audio"),
    );

  const pool =
    curated.length >= MAX_RELATED
      ? curated
      : [
          ...curated,
          ...rankedSameCategory(current, category, new Set([currentSlug, ...curated.map((c) => c.slug)])),
        ];

  const related = pool.slice(0, MAX_RELATED);
  if (related.length === 0) return null;

  return (
    <section className="mt-10" data-related-tools="audio">
      <h2 className="text-lg font-bold text-foreground mb-4">You Might Also Need</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((tool) => {
          const Icon = tool.icon || inferIcon(tool.name, tool.slug);
          return (
            <Link
              key={tool.slug}
              href={`/audio/${tool.slug}`}
              className="tool-card group hover:-translate-y-[3px]"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
