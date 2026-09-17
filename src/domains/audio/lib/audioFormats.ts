/**
 * Per-format output configuration and ffmpeg argument construction.
 *
 * Split out of the component so the encoder requirements, quality scales and CLI
 * argument shapes can be read (and corrected) in one place without scrolling
 * through JSX.
 */

export type FormatId =
  | "mp3"
  | "wav"
  | "m4a"
  | "flac"
  | "ogg"
  | "aac"
  | "aiff"
  | "wma"
  | "opus";

/** Which control the settings panel renders for a given output format. */
export type QualityKind =
  | "mp3-bitrate"
  | "bit-depth"
  | "flac-compression"
  | "vorbis-quality"
  | "aac-bitrate"
  | "wma-bitrate"
  | "opus-bitrate";

export type QualityMode = "cbr" | "vbr";
export type MetadataMode = "preserve" | "strip";
export type ChannelMode = "original" | "mono" | "stereo";
export type SampleRateOption = "original" | 16000 | 24000 | 32000 | 44100 | 48000;
export type BitDepth = 16 | 24;

export interface FormatSpec {
  id: FormatId;
  label: string;
  ext: string;
  mime: string;
  qualityKind: QualityKind;
  /**
   * Encoder names that must be present in the loaded core for this format to
   * work. All of them are required, not any-of — 24-bit WAV needs pcm_s24le as
   * well as pcm_s16le because the bit-depth toggle can select either.
   */
  requiredEncoders: string[];
  /**
   * Whether an album-art passthrough attempt is worth making. Containers that
   * cannot hold an attached picture are excluded so the optional-args retry
   * never fires pointlessly.
   */
  supportsAlbumArt: boolean;
  /** Registry slug this format is the default for. */
  slug: string;
}

export const FORMATS: Record<FormatId, FormatSpec> = {
  mp3: {
    id: "mp3",
    label: "MP3",
    ext: "mp3",
    mime: "audio/mpeg",
    qualityKind: "mp3-bitrate",
    requiredEncoders: ["libmp3lame"],
    supportsAlbumArt: true,
    slug: "mp3-converter",
  },
  wav: {
    id: "wav",
    label: "WAV",
    ext: "wav",
    mime: "audio/wav",
    qualityKind: "bit-depth",
    requiredEncoders: ["pcm_s16le", "pcm_s24le"],
    supportsAlbumArt: false,
    slug: "wav-converter",
  },
  m4a: {
    id: "m4a",
    label: "M4A",
    ext: "m4a",
    mime: "audio/mp4",
    qualityKind: "aac-bitrate",
    requiredEncoders: ["aac"],
    supportsAlbumArt: true,
    slug: "m4a-converter",
  },
  flac: {
    id: "flac",
    label: "FLAC",
    ext: "flac",
    mime: "audio/flac",
    qualityKind: "flac-compression",
    requiredEncoders: ["flac"],
    supportsAlbumArt: true,
    slug: "flac-converter",
  },
  ogg: {
    id: "ogg",
    label: "OGG",
    ext: "ogg",
    mime: "audio/ogg",
    qualityKind: "vorbis-quality",
    requiredEncoders: ["libvorbis"],
    supportsAlbumArt: false,
    slug: "ogg-converter",
  },
  aac: {
    id: "aac",
    label: "AAC",
    ext: "aac",
    mime: "audio/aac",
    qualityKind: "aac-bitrate",
    requiredEncoders: ["aac"],
    supportsAlbumArt: false,
    slug: "aac-converter",
  },
  aiff: {
    id: "aiff",
    label: "AIFF",
    ext: "aiff",
    mime: "audio/aiff",
    qualityKind: "bit-depth",
    requiredEncoders: ["pcm_s16be", "pcm_s24be"],
    supportsAlbumArt: false,
    slug: "aiff-converter",
  },
  wma: {
    id: "wma",
    label: "WMA",
    ext: "wma",
    mime: "audio/x-ms-wma",
    qualityKind: "wma-bitrate",
    requiredEncoders: ["wmav2"],
    supportsAlbumArt: false,
    slug: "wma-converter",
  },
  opus: {
    id: "opus",
    label: "OPUS",
    ext: "opus",
    mime: "audio/ogg",
    qualityKind: "opus-bitrate",
    requiredEncoders: ["libopus"],
    supportsAlbumArt: false,
    slug: "opus-converter",
  },
};

/** Button-row order. */
export const FORMAT_ORDER: FormatId[] = [
  "mp3",
  "wav",
  "m4a",
  "flac",
  "ogg",
  "aac",
  "aiff",
  "wma",
  "opus",
];

export const SLUG_TO_FORMAT: Record<string, FormatId> = Object.fromEntries(
  FORMAT_ORDER.map((id) => [FORMATS[id].slug, id]),
);

// ---------------------------------------------------------------------------
// Quality scales
// ---------------------------------------------------------------------------

/** MP3 — unchanged from the previous MP3-only tool. */
export const MP3_BITRATES = [
  { value: 64, label: "Economy" },
  { value: 128, label: "Standard" },
  { value: 192, label: "High" },
  { value: 320, label: "Best" },
] as const;

/**
 * AAC/M4A is efficient at lower bitrates than MP3, so the ladder starts higher
 * and stops lower than MP3's 64–320.
 */
export const AAC_BITRATES = [
  { value: 96, label: "Economy" },
  { value: 128, label: "Standard" },
  { value: 192, label: "High" },
  { value: 256, label: "Best" },
] as const;

/** wmav2 tops out usefully well below the other lossy encoders. */
export const WMA_BITRATES = [
  { value: 64, label: "Economy" },
  { value: 128, label: "Standard" },
  { value: 192, label: "High" },
] as const;

/** Opus stays transparent at low bitrates; 192 is already generous. */
export const OPUS_BITRATES = [
  { value: 64, label: "Economy" },
  { value: 96, label: "Standard" },
  { value: 128, label: "High" },
  { value: 192, label: "Best" },
] as const;

/** libvorbis -q:a scale. Vorbis is natively variable-bitrate. */
export const VORBIS_QUALITIES = [
  { value: 2, label: "Low" },
  { value: 5, label: "Medium" },
  { value: 7, label: "High" },
  { value: 10, label: "Best" },
] as const;

/** Secondary fixed-bitrate ladder for OGG's "Advanced" escape hatch. */
export const VORBIS_CBR_BITRATES = [96, 128, 192, 256] as const;

export const FLAC_COMPRESSION_MIN = 0;
export const FLAC_COMPRESSION_MAX = 12;
export const FLAC_COMPRESSION_DEFAULT = 5;

export const BIT_DEPTHS: BitDepth[] = [16, 24];

export const CHANNEL_MODES: { value: ChannelMode; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "mono", label: "Mono" },
  { value: "stereo", label: "Stereo" },
];

export const SAMPLE_RATES: { value: SampleRateOption; label: string }[] = [
  { value: "original", label: "Original" },
  { value: 16000, label: "16 kHz" },
  { value: 24000, label: "24 kHz" },
  { value: 32000, label: "32 kHz" },
  { value: 44100, label: "44.1 kHz" },
  { value: 48000, label: "48 kHz" },
];

/**
 * LAME VBR V-levels for each CBR tier, used when MP3 output is switched to VBR.
 * Lower V = higher quality.
 */
const MP3_VBR_LEVEL: Record<number, number> = {
  64: 7,
  128: 5,
  192: 2,
  320: 0,
};

/** Formats whose quality control is a variable-bitrate scale by nature. */
export function supportsVbr(format: FormatId): boolean {
  return format === "mp3" || format === "ogg" || format === "opus";
}

/** Formats where VBR is the primary mode rather than an opt-in. */
export function isVbrFirst(format: FormatId): boolean {
  return format === "ogg" || format === "opus";
}

export interface EncodeSettings {
  format: FormatId;
  qualityMode: QualityMode;
  bitrate: number;
  bitDepth: BitDepth;
  flacCompression: number;
  vorbisQuality: number;
  channelMode: ChannelMode;
  sampleRate: SampleRateOption;
  metadataMode: MetadataMode;
}

/**
 * Formats that have an in-process encoder and never need ffmpeg.wasm for a
 * plain conversion: MP3 via lamejs, WAV via lib/wav.ts, AIFF via lib/aiff.ts.
 */
export const NATIVE_FORMATS: FormatId[] = ["mp3", "wav", "aiff"];

export function hasNativeEncoder(format: FormatId): boolean {
  return NATIVE_FORMATS.includes(format);
}

/**
 * Whether the current settings can be served entirely in-process, skipping the
 * ~31 MB ffmpeg core download.
 *
 * Metadata passthrough always escalates: none of the in-process encoders can
 * carry tags or album art, so Preserve genuinely needs ffmpeg's broader
 * capability. Beyond that the constraint is per-format — MP3 only escapes at a
 * constant bitrate because lamejs has no VBR mode, while WAV and AIFF have no
 * such limit: bit depth, channel mode and sample rate are all handled natively
 * by the writers and the Web Audio resampler.
 */
export function canUseNativeEncoder(settings: EncodeSettings): boolean {
  if (settings.metadataMode !== "strip") return false;

  switch (settings.format) {
    case "mp3":
      return settings.qualityMode === "cbr";
    case "wav":
    case "aiff":
      return true;
    default:
      return false;
  }
}

/** Codec + quality flags for the selected format. */
function codecArgs(settings: EncodeSettings): string[] {
  const spec = FORMATS[settings.format];

  switch (spec.qualityKind) {
    case "mp3-bitrate":
      return settings.qualityMode === "vbr"
        ? ["-c:a", "libmp3lame", "-q:a", String(MP3_VBR_LEVEL[settings.bitrate] ?? 2)]
        : ["-c:a", "libmp3lame", "-b:a", `${settings.bitrate}k`];

    case "bit-depth": {
      const bigEndian = settings.format === "aiff";
      const depth = settings.bitDepth === 24 ? "24" : "16";
      return ["-c:a", `pcm_s${depth}${bigEndian ? "be" : "le"}`];
    }

    case "flac-compression":
      return ["-c:a", "flac", "-compression_level", String(settings.flacCompression)];

    case "vorbis-quality":
      return settings.qualityMode === "cbr"
        ? ["-c:a", "libvorbis", "-b:a", `${settings.bitrate}k`]
        : ["-c:a", "libvorbis", "-q:a", String(settings.vorbisQuality)];

    case "aac-bitrate":
      // AAC's VBR mode is inconsistent across builds, so this is always CBR/ABR.
      return ["-c:a", "aac", "-b:a", `${settings.bitrate}k`];

    case "wma-bitrate":
      return ["-c:a", "wmav2", "-b:a", `${settings.bitrate}k`];

    case "opus-bitrate":
      return [
        "-c:a",
        "libopus",
        "-b:a",
        `${settings.bitrate}k`,
        "-vbr",
        settings.qualityMode === "cbr" ? "off" : "on",
      ];
  }
}

export interface BuiltArgs {
  args: string[];
  /** Album-art passthrough, spliced in before the output and dropped on retry. */
  optionalArgs: string[];
}

/**
 * Assemble the full ffmpeg invocation.
 *
 * `effectiveSampleRate` is passed in already clamped to the source rate so the
 * tool never fake-upsamples — the caller owns that decision because it needs the
 * probed per-file rate.
 */
export function buildFfmpegArgs(
  settings: EncodeSettings,
  inputName: string,
  outputName: string,
  effectiveSampleRate: number | null,
): BuiltArgs {
  const spec = FORMATS[settings.format];
  const args: string[] = ["-i", inputName];

  args.push("-map_metadata", settings.metadataMode === "preserve" ? "0" : "-1");

  if (settings.channelMode === "mono") args.push("-ac", "1");
  else if (settings.channelMode === "stereo") args.push("-ac", "2");

  if (effectiveSampleRate !== null) args.push("-ar", String(effectiveSampleRate));

  args.push(...codecArgs(settings));
  args.push(outputName);

  const optionalArgs =
    settings.metadataMode === "preserve" && spec.supportsAlbumArt
      ? ["-map", "0", "-c:v", "copy"]
      : [];

  return { args, optionalArgs };
}

/** Whether the loaded core can serve this format at all. */
export function isFormatSupported(
  format: FormatId,
  support: Record<string, boolean> | null,
): boolean | null {
  if (support === null) return null; // not probed yet
  return FORMATS[format].requiredEncoders.every((enc) => support[enc] === true);
}

// ---------------------------------------------------------------------------
// Batch 23 — container-specific decode/convert helpers (pure, Node-verified)
// ---------------------------------------------------------------------------

/**
 * “Decode WMA/M4B/CAF” — transcode whatever came in to one of the three
 * widely-playable outputs. WMA audio uses wmav2; M4B (Audiobook) is an MP4
 * container whose audio track is normally AAC; CAF (Core Audio Format) is
 * usually PCM. All three decode paths are handled by the same ffmpeg core,
 * so the tool only needs the target codec + a `-vn` guard (cover art in M4B
 * would otherwise trip stream-copy paths).
 */
export type DecoderTarget = "mp3" | "wav" | "flac";

export const DECODER_TARGETS: { id: DecoderTarget; label: string }[] = [
  { id: "mp3", label: "MP3 (universal playback)" },
  { id: "wav", label: "WAV (lossless, uncompressed)" },
  { id: "flac", label: "FLAC (lossless, compressed)" },
];

export function buildDecodeArgs(
  target: DecoderTarget,
  inputName: string,
  outputName: string,
): string[] {
  const codec =
    target === "mp3"
      ? ["-c:a", "libmp3lame", "-b:a", "192k"]
      : target === "flac"
        ? ["-c:a", "flac"]
        : ["-c:a", "pcm_s16le"];
  return ["-i", inputName, "-vn", "-map_metadata", "0", ...codec, outputName];
}

/**
 * “Convert to/from ALAC lossless in M4A” — ALAC lives inside the M4A (MP4)
 * container both ways. To ALAC: re-encode with the `alac` encoder. From ALAC:
 * decode to the requested PCM-based or lossy target. `-vn` keeps the M4A
 * container happy when source carries art.
 */
export type AlacTarget = "alac" | "wav" | "flac" | "mp3" | "aac";

export const ALAC_TARGETS: { id: AlacTarget; label: string }[] = [
  { id: "alac", label: "ALAC in M4A (lossless)" },
  { id: "wav", label: "WAV (lossless PCM)" },
  { id: "flac", label: "FLAC (lossless)" },
  { id: "aac", label: "AAC in M4A (lossy, small)" },
  { id: "mp3", label: "MP3 (lossy, universal)" },
];

export function buildAlacArgs(
  target: AlacTarget,
  inputName: string,
  outputName: string,
): string[] {
  const codec =
    target === "alac"
      ? ["-c:a", "alac"]
      : target === "wav"
        ? ["-c:a", "pcm_s16le"]
        : target === "flac"
          ? ["-c:a", "flac"]
          : target === "aac"
            ? ["-c:a", "aac", "-b:a", "256k"]
            : ["-c:a", "libmp3lame", "-b:a", "192k"];
  return ["-i", inputName, "-vn", ...codec, outputName];
}

/** Extension for an output of a decoder/ALAC run (drives the download name). */
export function targetExtension(target: DecoderTarget | AlacTarget): string {
  return target === "alac" || target === "aac" ? "m4a" : target;
}
