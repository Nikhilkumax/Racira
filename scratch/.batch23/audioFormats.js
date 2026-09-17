"use strict";
/**
 * Per-format output configuration and ffmpeg argument construction.
 *
 * Split out of the component so the encoder requirements, quality scales and CLI
 * argument shapes can be read (and corrected) in one place without scrolling
 * through JSX.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALAC_TARGETS = exports.DECODER_TARGETS = exports.NATIVE_FORMATS = exports.SAMPLE_RATES = exports.CHANNEL_MODES = exports.BIT_DEPTHS = exports.FLAC_COMPRESSION_DEFAULT = exports.FLAC_COMPRESSION_MAX = exports.FLAC_COMPRESSION_MIN = exports.VORBIS_CBR_BITRATES = exports.VORBIS_QUALITIES = exports.OPUS_BITRATES = exports.WMA_BITRATES = exports.AAC_BITRATES = exports.MP3_BITRATES = exports.SLUG_TO_FORMAT = exports.FORMAT_ORDER = exports.FORMATS = void 0;
exports.supportsVbr = supportsVbr;
exports.isVbrFirst = isVbrFirst;
exports.hasNativeEncoder = hasNativeEncoder;
exports.canUseNativeEncoder = canUseNativeEncoder;
exports.buildFfmpegArgs = buildFfmpegArgs;
exports.isFormatSupported = isFormatSupported;
exports.buildDecodeArgs = buildDecodeArgs;
exports.buildAlacArgs = buildAlacArgs;
exports.targetExtension = targetExtension;
exports.FORMATS = {
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
exports.FORMAT_ORDER = [
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
exports.SLUG_TO_FORMAT = Object.fromEntries(exports.FORMAT_ORDER.map((id) => [exports.FORMATS[id].slug, id]));
// ---------------------------------------------------------------------------
// Quality scales
// ---------------------------------------------------------------------------
/** MP3 — unchanged from the previous MP3-only tool. */
exports.MP3_BITRATES = [
    { value: 64, label: "Economy" },
    { value: 128, label: "Standard" },
    { value: 192, label: "High" },
    { value: 320, label: "Best" },
];
/**
 * AAC/M4A is efficient at lower bitrates than MP3, so the ladder starts higher
 * and stops lower than MP3's 64–320.
 */
exports.AAC_BITRATES = [
    { value: 96, label: "Economy" },
    { value: 128, label: "Standard" },
    { value: 192, label: "High" },
    { value: 256, label: "Best" },
];
/** wmav2 tops out usefully well below the other lossy encoders. */
exports.WMA_BITRATES = [
    { value: 64, label: "Economy" },
    { value: 128, label: "Standard" },
    { value: 192, label: "High" },
];
/** Opus stays transparent at low bitrates; 192 is already generous. */
exports.OPUS_BITRATES = [
    { value: 64, label: "Economy" },
    { value: 96, label: "Standard" },
    { value: 128, label: "High" },
    { value: 192, label: "Best" },
];
/** libvorbis -q:a scale. Vorbis is natively variable-bitrate. */
exports.VORBIS_QUALITIES = [
    { value: 2, label: "Low" },
    { value: 5, label: "Medium" },
    { value: 7, label: "High" },
    { value: 10, label: "Best" },
];
/** Secondary fixed-bitrate ladder for OGG's "Advanced" escape hatch. */
exports.VORBIS_CBR_BITRATES = [96, 128, 192, 256];
exports.FLAC_COMPRESSION_MIN = 0;
exports.FLAC_COMPRESSION_MAX = 12;
exports.FLAC_COMPRESSION_DEFAULT = 5;
exports.BIT_DEPTHS = [16, 24];
exports.CHANNEL_MODES = [
    { value: "original", label: "Original" },
    { value: "mono", label: "Mono" },
    { value: "stereo", label: "Stereo" },
];
exports.SAMPLE_RATES = [
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
const MP3_VBR_LEVEL = {
    64: 7,
    128: 5,
    192: 2,
    320: 0,
};
/** Formats whose quality control is a variable-bitrate scale by nature. */
function supportsVbr(format) {
    return format === "mp3" || format === "ogg" || format === "opus";
}
/** Formats where VBR is the primary mode rather than an opt-in. */
function isVbrFirst(format) {
    return format === "ogg" || format === "opus";
}
/**
 * Formats that have an in-process encoder and never need ffmpeg.wasm for a
 * plain conversion: MP3 via lamejs, WAV via lib/wav.ts, AIFF via lib/aiff.ts.
 */
exports.NATIVE_FORMATS = ["mp3", "wav", "aiff"];
function hasNativeEncoder(format) {
    return exports.NATIVE_FORMATS.includes(format);
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
function canUseNativeEncoder(settings) {
    if (settings.metadataMode !== "strip")
        return false;
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
function codecArgs(settings) {
    const spec = exports.FORMATS[settings.format];
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
/**
 * Assemble the full ffmpeg invocation.
 *
 * `effectiveSampleRate` is passed in already clamped to the source rate so the
 * tool never fake-upsamples — the caller owns that decision because it needs the
 * probed per-file rate.
 */
function buildFfmpegArgs(settings, inputName, outputName, effectiveSampleRate) {
    const spec = exports.FORMATS[settings.format];
    const args = ["-i", inputName];
    args.push("-map_metadata", settings.metadataMode === "preserve" ? "0" : "-1");
    if (settings.channelMode === "mono")
        args.push("-ac", "1");
    else if (settings.channelMode === "stereo")
        args.push("-ac", "2");
    if (effectiveSampleRate !== null)
        args.push("-ar", String(effectiveSampleRate));
    args.push(...codecArgs(settings));
    args.push(outputName);
    const optionalArgs = settings.metadataMode === "preserve" && spec.supportsAlbumArt
        ? ["-map", "0", "-c:v", "copy"]
        : [];
    return { args, optionalArgs };
}
/** Whether the loaded core can serve this format at all. */
function isFormatSupported(format, support) {
    if (support === null)
        return null; // not probed yet
    return exports.FORMATS[format].requiredEncoders.every((enc) => support[enc] === true);
}
exports.DECODER_TARGETS = [
    { id: "mp3", label: "MP3 (universal playback)" },
    { id: "wav", label: "WAV (lossless, uncompressed)" },
    { id: "flac", label: "FLAC (lossless, compressed)" },
];
function buildDecodeArgs(target, inputName, outputName) {
    const codec = target === "mp3"
        ? ["-c:a", "libmp3lame", "-b:a", "192k"]
        : target === "flac"
            ? ["-c:a", "flac"]
            : ["-c:a", "pcm_s16le"];
    return ["-i", inputName, "-vn", "-map_metadata", "0", ...codec, outputName];
}
exports.ALAC_TARGETS = [
    { id: "alac", label: "ALAC in M4A (lossless)" },
    { id: "wav", label: "WAV (lossless PCM)" },
    { id: "flac", label: "FLAC (lossless)" },
    { id: "aac", label: "AAC in M4A (lossy, small)" },
    { id: "mp3", label: "MP3 (lossy, universal)" },
];
function buildAlacArgs(target, inputName, outputName) {
    const codec = target === "alac"
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
function targetExtension(target) {
    return target === "alac" || target === "aac" ? "m4a" : target;
}
