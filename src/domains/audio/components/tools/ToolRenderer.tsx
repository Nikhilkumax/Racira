"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

import { FORMAT_ORDER, FORMATS } from "@/domains/audio/lib/audioFormats";
import { EASY_TOOL_SLUG_LIST, type EasyToolSlug } from "./implemented";

function ToolSkeleton() {
  return (
    <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-card" />
  );
}

function lazy(loader: () => Promise<{ default: ComponentType }>) {
  return dynamic(loader, { ssr: false, loading: () => <ToolSkeleton /> });
}

/**
 * Easy-tier tool components, keyed by registry slug.
 *
 * Each entry is a next/dynamic lazy import so a tool's code ships only in its
 * own route chunk — the /audio/[slug] page never pulls in every easy tool at
 * once (same pattern the CAD domain uses). The map is typed
 * `Record<EasyToolSlug, ComponentType>` against EASY_TOOL_SLUG_LIST, so a
 * slug wired here without a component file, a component file never wired, or a
 * typo in either is a compile error rather than a blank page.
 */
const EASY_TOOL_COMPONENTS: Record<EasyToolSlug, ComponentType> = {
  "audio-reverser": lazy(() => import("./easy/AudioReverser")),
  "audio-speed-changer": lazy(() => import("./easy/AudioSpeedChanger")),
  "audio-amplifier": lazy(() => import("./easy/AudioAmplifier")),
  "silence-remover": lazy(() => import("./easy/SilenceRemover")),
  "volume-booster": lazy(() => import("./easy/VolumeBooster")),
  "volume-reducer": lazy(() => import("./easy/VolumeReducer")),
  "echo-delay-generator": lazy(() => import("./easy/EchoDelayGenerator")),
  "tremolo-effect": lazy(() => import("./easy/TremoloEffect")),
  "vibrato-effect": lazy(() => import("./easy/VibratoEffect")),
  "distortion-effect": lazy(() => import("./easy/DistortionEffect")),
  "ring-modulator": lazy(() => import("./easy/RingModulator")),
  "stereo-widener": lazy(() => import("./easy/StereoWidener")),
  "mono-to-stereo-converter": lazy(() => import("./easy/MonoToStereoConverter")),
  "stereo-to-mono-converter": lazy(() => import("./easy/StereoToMonoConverter")),
  "mid-side-encoder": lazy(() => import("./easy/MidSideEncoder")),
  "mid-side-decoder": lazy(() => import("./easy/MidSideDecoder")),
  "radio-effect": lazy(() => import("./easy/RadioEffect")),
  "telephone-effect": lazy(() => import("./easy/TelephoneEffect")),
  "underwater-effect": lazy(() => import("./easy/UnderwaterEffect")),
  "voice-memo": lazy(() => import("./easy/VoiceMemo")),
  "quick-sound-capture": lazy(() => import("./easy/QuickSoundCapture")),
  "waveform-visualizer": lazy(() => import("./easy/WaveformVisualizer")),
  "spectrum-analyzer": lazy(() => import("./easy/SpectrumAnalyzer")),
  "frequency-analyzer": lazy(() => import("./easy/FrequencyAnalyzer")),
  "rms-meter": lazy(() => import("./easy/RmsMeter")),
  "vu-meter": lazy(() => import("./easy/VUMeter")),
  "ppm-meter": lazy(() => import("./easy/PPMMeter")),
  "crest-factor-meter": lazy(() => import("./easy/CrestFactorMeter")),
  "frequency-counter": lazy(() => import("./easy/FrequencyCounter")),
  "tone-generator": lazy(() => import("./easy/ToneGenerator")),
  "white-noise-generator": lazy(() => import("./easy/WhiteNoiseGenerator")),
  "pink-noise-generator": lazy(() => import("./easy/PinkNoiseGenerator")),
  "brown-noise-generator": lazy(() => import("./easy/BrownNoiseGenerator")),
  "sine-wave-generator": lazy(() => import("./easy/SineWaveGenerator")),
  "square-wave-generator": lazy(() => import("./easy/SquareWaveGenerator")),
  "sawtooth-wave-generator": lazy(() => import("./easy/SawtoothWaveGenerator")),
  "triangle-wave-generator": lazy(() => import("./easy/TriangleWaveGenerator")),
  "pulse-wave-generator": lazy(() => import("./easy/PulseWaveGenerator")),
  "chirp-generator": lazy(() => import("./easy/ChirpGenerator")),
  "sweep-tone-generator": lazy(() => import("./easy/SweepToneGenerator")),
  "warble-tone-generator": lazy(() => import("./easy/WarbleToneGenerator")),
  "binaural-beat-generator": lazy(() => import("./easy/BinauralBeatGenerator")),
  "isochronic-tone-generator": lazy(() => import("./easy/IsochronicToneGenerator")),
  "solfeggio-frequency-generator": lazy(() => import("./easy/SolfeggioFrequencyGenerator")),
  "432-hz-generator": lazy(() => import("./easy/Hz432Generator")),
  "528-hz-generator": lazy(() => import("./easy/Hz528Generator")),
  "test-tone-generator": lazy(() => import("./easy/TestToneGenerator")),
  "frequency-sweep-generator": lazy(() => import("./easy/FrequencySweepGenerator")),
  "click-track-generator": lazy(() => import("./easy/ClickTrackGenerator")),
  "metronome": lazy(() => import("./easy/Metronome")),
  "bpm-calculator": lazy(() => import("./easy/BpmCalculator")),
  "tap-tempo": lazy(() => import("./easy/TapTempo")),
  "delay-time-calculator": lazy(() => import("./easy/DelayTimeCalculator")),
  "reverb-time-calculator": lazy(() => import("./easy/ReverbTimeCalculator")),
  "note-frequency-calculator": lazy(() => import("./easy/NoteFrequencyCalculator")),
  "interval-calculator": lazy(() => import("./easy/IntervalCalculator")),
  "chord-calculator": lazy(() => import("./easy/ChordCalculator")),
  "scale-generator": lazy(() => import("./easy/ScaleGenerator")),
  "chord-progression-builder": lazy(() => import("./easy/ChordProgressionBuilder")),
  "circle-of-fifths-tool": lazy(() => import("./easy/CircleOfFifthsTool")),
  "key-signature-identifier": lazy(() => import("./easy/KeySignatureIdentifier")),
  "time-signature-calculator": lazy(() => import("./easy/TimeSignatureCalculator")),
  "sample-rate-calculator": lazy(() => import("./easy/SampleRateCalculator")),
  "bit-depth-calculator": lazy(() => import("./easy/BitDepthCalculator")),
  "audio-file-size-calculator": lazy(() => import("./easy/AudioFileSizeCalculator")),
  "streaming-bitrate-calculator": lazy(() => import("./easy/StreamingBitrateCalculator")),
  "midi-note-to-frequency": lazy(() => import("./easy/MidiNoteToFrequency")),
  "frequency-to-midi-note": lazy(() => import("./easy/FrequencyToMidiNote")),
  "cents-calculator": lazy(() => import("./easy/CentsCalculator")),
  "playback-speed-calculator": lazy(() => import("./easy/PlaybackSpeedCalculator")),
  "channel-mixer": lazy(() => import("./easy/ChannelMixer")),
  "left-right-channel-swapper": lazy(() => import("./easy/LeftRightChannelSwapper")),
  "channel-inverter": lazy(() => import("./easy/ChannelInverter")),
  "channel-isolator": lazy(() => import("./easy/ChannelIsolator")),
  "mid-side-processor": lazy(() => import("./easy/MidSideProcessor")),
  "panning-tool": lazy(() => import("./easy/PanningTool")),
  "balance-adjuster": lazy(() => import("./easy/BalanceAdjuster")),
  "dc-offset-remover": lazy(() => import("./easy/DcOffsetRemover")),
  "phase-inverter": lazy(() => import("./easy/PhaseInverter")),
  "batch-file-renamer": lazy(() => import("./easy/BatchFileRenamer")),
  "show-notes-timestamp-generator": lazy(() => import("./easy/ShowNotesTimestampGenerator")),
  "podcast-chapter-marker-tool": lazy(() => import("./easy/PodcastChapterMarkerTool")),
  "id3-tag-editor": lazy(() => import("./easy/Id3TagEditor")),
  "audio-speed-slow-down": lazy(() => import("./easy/AudioSpeedSlowDown")),
  "podcast-cover-art-generator": lazy(() => import("./easy/PodcastCoverArtGenerator")),
  "room-tone-generator": lazy(() => import("./easy/RoomToneGenerator")),
  "hearing-aid-frequency-reference": lazy(() => import("./easy/HearingAidFrequencyReference")),
  "pitch-shift-calculator": lazy(() => import("./easy/PitchShiftCalculator")),
  "musical-transpose-tool": lazy(() => import("./easy/MusicalTransposeTool")),
  "guitar-tuner": lazy(() => import("./easy/GuitarTuner")),
  "instrument-tuner": lazy(() => import("./easy/InstrumentTuner")),
  "voice-recorder": lazy(() => import("./easy/VoiceRecorder")),
  "microphone-recorder": lazy(() => import("./easy/MicrophoneRecorder")),
  "browser-tab-recorder": lazy(() => import("./easy/BrowserTabRecorder")),
  "system-audio-recorder": lazy(() => import("./easy/SystemAudioRecorder")),
  "streaming-audio-recorder": lazy(() => import("./easy/StreamingAudioRecorder")),
  "audio-trimmer": lazy(() => import("./easy/AudioTrimmer")),
  "audio-cutter": lazy(() => import("./easy/AudioCutter")),
  "audio-slicer": lazy(() => import("./easy/AudioSlicer")),
  "audio-joiner": lazy(() => import("./easy/AudioJoiner")),
  "audio-merger": lazy(() => import("./easy/AudioMerger")),
  "silence-statistics-calculator": lazy(() => import("./easy/SilenceStatisticsCalculator")),
  "audio-bitrate-reference": lazy(() => import("./easy/AudioBitrateReference")),
  "sample-rate-reference": lazy(() => import("./easy/SampleRateReference")),
  "codec-compatibility-reference": lazy(() => import("./easy/CodecCompatibilityReference")),
  "loudness-standards-reference": lazy(() => import("./easy/LoudnessStandardsReference")),
  "audio-format-converter": lazy(() => import("./easy/AudioFormatConverter")),
  "bitrate-quality-converter": lazy(() => import("./easy/BitrateQualityConverter")),
  "wma-m4b-caf-decoder": lazy(() => import("./easy/WmaM4bCafDecoder")),
  "alac-m4a-lossless-converter": lazy(() => import("./easy/AlacM4aLosslessConverter")),
  "audio-splitter": lazy(() => import("./easy/AudioSplitter")),
  "audio-normalizer": lazy(() => import("./easy/AudioNormalizer")),
  "audio-limiter": lazy(() => import("./easy/AudioLimiter")),
  "audio-compressor": lazy(() => import("./easy/AudioCompressor")),
  "audio-expander": lazy(() => import("./easy/AudioExpander")),
  "audio-gate": lazy(() => import("./easy/AudioGate")),
  "audio-leveler": lazy(() => import("./easy/AudioLeveler")),
  "loudness-normalizer": lazy(() => import("./easy/LoudnessNormalizer")),
  "rms-normalizer": lazy(() => import("./easy/RmsNormalizer")),
  "multiband-compressor": lazy(() => import("./easy/MultibandCompressor")),
  "parallel-compressor": lazy(() => import("./easy/ParallelCompressor")),
  "loudness-meter-lufs": lazy(() => import("./easy/LoudnessMeter")),
  "loudness-range-lra-meter": lazy(() => import("./easy/LoudnessRangeMeter")),
  "loudness-histogram": lazy(() => import("./easy/LoudnessHistogram")),
  "streaming-platform-loudness-guide": lazy(() => import("./easy/StreamingPlatformLoudnessGuide")),
  "multi-guest-leveler": lazy(() => import("./easy/MultiGuestLeveler")),
  "audio-fade-in-out": lazy(() => import("./easy/AudioFadeInOut")),
  "crossfade-creator": lazy(() => import("./easy/CrossfadeCreator")),
  "audio-loop-maker": lazy(() => import("./easy/AudioLoopMaker")),
  "sample-chopper": lazy(() => import("./easy/SampleChopper")),
  "ringtone-maker": lazy(() => import("./easy/RingtoneMaker")),
  "audio-pitch-shifter": lazy(() => import("./easy/AudioPitchShifter")),
  "tempo-changer": lazy(() => import("./easy/TempoChanger")),
  "time-stretcher": lazy(() => import("./easy/TimeStretcher")),
  "harmonizer": lazy(() => import("./easy/Harmonizer")),
  "8d-audio-converter": lazy(() => import("./easy/EightDAudioConverter")),
};

/**
 * Slug → component map for Audio tools with a real implementation.
 *
 * Every audio tool touches the Web Audio API (AudioContext, decodeAudioData),
 * which does not exist during SSR, so all entries load client-side only.
 *
 * Every format converter is the same shared component; the slug only decides
 * which output format it opens on. ffmpeg.wasm is *not* pulled in by this
 * import — UniversalAudioConverter imports it dynamically at convert time.
 *
 * Keep in sync with IMPLEMENTED_TOOL_SLUGS in ./implemented.ts.
 */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  ...Object.fromEntries(
    FORMAT_ORDER.map((id) => [FORMATS[id].slug, lazy(() => import("./UniversalAudioConverter"))]),
  ),
  ...EASY_TOOL_COMPONENTS,
} as Record<string, ComponentType>;

/** Per-slug props, so /audio/flac-converter opens on FLAC rather than MP3. */
export const TOOL_PROPS: Record<string, Record<string, unknown>> = Object.fromEntries(
  FORMAT_ORDER.map((id) => [FORMATS[id].slug, { defaultFormat: id }]),
);

export function ToolRenderer({ slug }: { slug: string }) {
  const Component = TOOL_COMPONENTS[slug];
  if (!Component) return null;
  return <Component {...(TOOL_PROPS[slug] ?? {})} />;
}

/** Server-safe export: does this slug have any wired implementation? */
export function isEasyToolSlug(slug: string): slug is EasyToolSlug {
  return (EASY_TOOL_SLUG_LIST as readonly string[]).includes(slug);
}

/** Compile-time guard: every easy slug in the list must have a component. */
const _coverageCheck: Record<EasyToolSlug, ComponentType> = EASY_TOOL_COMPONENTS;
void _coverageCheck;
void EASY_TOOL_SLUG_LIST;
