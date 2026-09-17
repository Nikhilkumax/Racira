/**
 * Byte-level audio container/codec detection — the pure core of the Audio
 * Format Detector and Audio Codec Identifier. No browser APIs, deterministic,
 * verified in Node against hand-constructed byte fixtures.
 */

export interface FormatInfo {
  /** Container, e.g. "WAV (RIFF)", "MP3 (MPEG audio)", "FLAC", "OGG", "MP4/M4A", "WebM/Matroska". */
  container: string;
  /** Codec string when determinable, e.g. "PCM 16-bit", "MPEG-1 Layer III", "FLAC", "Vorbis", "AAC (mp4a)". */
  codec: string | null;
  sampleRate: number | null;
  channels: number | null;
  bitDepth: number | null;
  /** Duration in seconds when derivable from headers (never an estimate). */
  durationSec: number | null;
  /** Byte-level evidence, e.g. which magic bytes matched. */
  matched: string;
}

function readAscii(b: Uint8Array, off: number, len: number): string {
  let s = "";
  for (let i = 0; i < len && off + i < b.length; i++) s += String.fromCharCode(b[off + i]);
  return s;
}

const MPEG_RATES: Record<number, number[]> = {
  3: [44100, 48000, 32000], // MPEG-1
  2: [22050, 24000, 16000], // MPEG-2
  0: [11025, 12000, 8000], // MPEG-2.5
};
const MPEG_L3_BITRATES_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];

/** Find an MPEG audio frame sync and parse its header. */
function parseMpeg(b: Uint8Array): Partial<FormatInfo> | null {
  for (let i = 0; i < Math.min(b.length - 4, 1 << 20); i++) {
    if (b[i] === 0xff && (b[i + 1] & 0xe0) === 0xe0) {
      const versionBits = (b[i + 1] >> 3) & 0x03; // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
      const layerBits = (b[i + 1] >> 1) & 0x03; // 1=Layer III
      const bitrateIdx = (b[i + 2] >> 4) & 0x0f;
      const rateIdx = (b[i + 2] >> 2) & 0x03;
      const mode = (b[i + 3] >> 6) & 0x03; // 3=mono
      if (versionBits === 1 || layerBits === 0 || rateIdx === 3 || bitrateIdx === 0 || bitrateIdx === 15) continue;
      const rates = MPEG_RATES[versionBits];
      if (!rates) continue;
      const layerName = layerBits === 3 ? "Layer I" : layerBits === 2 ? "Layer II" : "Layer III";
      const versionName = versionBits === 3 ? "MPEG-1" : versionBits === 2 ? "MPEG-2" : "MPEG-2.5";
      return {
        codec: `${versionName} ${layerName}`,
        sampleRate: rates[rateIdx],
        channels: mode === 3 ? 1 : 2,
      };
    }
  }
  return null;
}

/** MP4: walk top-level boxes for ftyp/moov; mvhd for duration; stsd codec strings. */
function parseMp4(b: Uint8Array): Partial<FormatInfo> | null {
  const brands = readAscii(b, 8, 4);
  if (!/^(M4A |isom|mp42|mp41|dash|iso2|avc1|M4B |3gp)/.test(brands)) return null;
  const info: Partial<FormatInfo> = { container: "MP4/M4A", matched: "ftyp" };
  // Walk top-level boxes: [size u32][type 4c][payload]
  let off = 0;
  while (off + 8 <= b.length) {
    const view = new DataView(b.buffer, b.byteOffset + off, 8);
    let size = view.getUint32(0);
    const type = readAscii(b, off + 4, 4);
    if (size === 0) size = b.length - off;
    if (size < 8) break;
    if (type === "moov") {
      // scan inside moov for mvhd and stsd
      const end = Math.min(off + size, b.length);
      let inner = off + 8;
      while (inner + 8 <= end) {
        const vs = new DataView(b.buffer, b.byteOffset + inner, 8);
        const isize = vs.getUint32(0);
        const itype = readAscii(b, inner + 4, 4);
        if (isize < 8) break;
        if (itype === "mvhd") {
          const v = b[inner + 8];
          if (v === 0) {
            const dv = new DataView(b.buffer, b.byteOffset + inner + 8, 100);
            const timescale = dv.getUint32(12);
            const dur = dv.getUint32(16);
            if (timescale > 0) info.durationSec = dur / timescale;
          } else if (v === 1) {
            const dv = new DataView(b.buffer, b.byteOffset + inner + 8, 112);
            const timescale = dv.getUint32(20);
            const dur = Number(dv.getBigUint64(24));
            if (timescale > 0) info.durationSec = dur / timescale;
          }
        }
        if (itype === "stsd") {
          // look for codec fourcc inside the sample description
          const region = b.subarray(inner, Math.min(inner + isize, inner + 256));
          const s = readAscii(region, 0, region.length);
          if (s.includes("mp4a")) info.codec = "AAC (mp4a)";
          else if (s.includes("opus")) info.codec = "Opus";
          else if (s.includes("alac")) info.codec = "ALAC";
          else if (s.includes("ac-3")) info.codec = "AC-3";
        }
        inner += isize;
      }
    }
    off += size;
  }
  return info;
}

export function detectFormat(bytes: Uint8Array): FormatInfo | null {
  if (bytes.length < 12) return null;
  const b = bytes;

  // RIFF/WAVE
  if (readAscii(b, 0, 4) === "RIFF" && readAscii(b, 8, 4) === "WAVE") {
    const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const info: FormatInfo = {
      container: "WAV (RIFF)",
      codec: null,
      sampleRate: null,
      channels: null,
      bitDepth: null,
      durationSec: null,
      matched: "RIFF…WAVE",
    };
    let off = 12;
    let fmtDone = false;
    let dataSize = 0;
    while (off + 8 <= b.length) {
      const id = readAscii(b, off, 4);
      const size = view.getUint32(off + 4, true);
      if (id === "fmt " && size >= 16 && !fmtDone) {
        const audioFormat = view.getUint16(off + 8, true);
        info.channels = view.getUint16(off + 10, true);
        info.sampleRate = view.getUint32(off + 12, true);
        const bits = view.getUint16(off + 22, true);
        info.bitDepth = bits;
        info.codec =
          audioFormat === 1 ? `PCM ${bits}-bit` :
          audioFormat === 3 ? `IEEE float ${bits}-bit` :
          audioFormat === 6 ? "A-law" :
          audioFormat === 7 ? "μ-law" :
          audioFormat === 0xfffe ? "Extensible (see subformat)" :
          `format ${audioFormat}`;
        fmtDone = true;
      }
      if (id === "data") {
        dataSize = size === 0 || off + 8 + size > b.length ? b.length - off - 8 : size;
        if (info.sampleRate && info.channels && info.bitDepth) {
          const bytesPerFrame = (info.bitDepth / 8) * info.channels;
          info.durationSec = dataSize / (info.sampleRate * bytesPerFrame);
        }
        break;
      }
      off += 8 + size + (size % 2);
    }
    return info;
  }

  // FLAC
  if (readAscii(b, 0, 4) === "fLaC") {
    const info: FormatInfo = {
      container: "FLAC", codec: "FLAC", sampleRate: null, channels: null,
      bitDepth: null, durationSec: null, matched: "fLaC",
    };
    // STREAMINFO is the first metadata block: 4-byte header + 34 bytes.
    if (b.length >= 42 && (b[4] & 0x7f) === 0) {
      // 34 bytes at offset 8: [minBlock 16][maxBlock 16][minFrame 24][maxFrame 24]
      // [20 bits sampleRate][3 bits channels-1][5 bits bps-1][36 bits totalSamples]
      // BigInt arithmetic without literals: the project compiles below ES2020,
      // where 1n-style literals are unavailable (TS2737).
      const SHIFT_1N = (n: number): bigint => BigInt(1) << BigInt(n);
      const bits =
        (BigInt(b[18]) << BigInt(96)) | (BigInt(b[19]) << BigInt(88)) |
        (BigInt(b[20]) << BigInt(80)) | (BigInt(b[21]) << BigInt(72)) |
        (BigInt(b[22]) << BigInt(64)) | (BigInt(b[23]) << BigInt(56)) |
        (BigInt(b[24]) << BigInt(48)) | (BigInt(b[25]) << BigInt(40));
      const sampleRate = Number((bits >> BigInt(64)) & BigInt(0xfffff));
      const channels = Number((bits >> BigInt(61)) & BigInt(7)) + 1;
      const bps = Number((bits >> BigInt(56)) & BigInt(31)) + 1;
      const totalSamples = Number(bits & (SHIFT_1N(56) - BigInt(1)) & (SHIFT_1N(36) - BigInt(1)));
      if (sampleRate > 0) {
        info.sampleRate = sampleRate;
        info.channels = channels;
        info.bitDepth = bps;
        info.durationSec = totalSamples / sampleRate;
      }
    }
    return info;
  }

  // OGG
  if (readAscii(b, 0, 4) === "OggS") {
    const info: FormatInfo = {
      container: "OGG", codec: null, sampleRate: null, channels: null,
      bitDepth: null, durationSec: null, matched: "OggS",
    };
    const first = readAscii(b, 28, 8);
    if (first.startsWith("\x01vorbis")) {
      info.codec = "Vorbis";
      const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
      info.channels = view.getUint8(39);
      info.sampleRate = view.getUint32(40, true);
    } else if (first.startsWith("OpusHead")) {
      info.codec = "Opus";
      const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
      info.channels = view.getUint8(37);
      info.sampleRate = 48000; // Opus decodes at 48 kHz; OpusHead's rate is input-side only
    }
    return info;
  }

  // MP4/M4A
  const mp4 = parseMp4(b);
  if (mp4) {
    return {
      container: "MP4/M4A",
      codec: mp4.codec ?? null,
      sampleRate: null,
      channels: null,
      bitDepth: null,
      durationSec: mp4.durationSec ?? null,
      matched: mp4.matched ?? "ftyp",
    };
  }

  // WebM/Matroska (EBML)
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) {
    const head = readAscii(b, 0, Math.min(b.length, 1 << 16));
    let codec: string | null = null;
    if (head.includes("A_OPUS")) codec = "Opus";
    else if (head.includes("A_VORBIS")) codec = "Vorbis";
    else if (head.includes("A_MPEG")) codec = "MPEG audio";
    else if (head.includes("A_AAC")) codec = "AAC";
    else if (head.includes("A_FLAC")) codec = "FLAC";
    return {
      container: "WebM/Matroska", codec, sampleRate: null, channels: null,
      bitDepth: null, durationSec: null, matched: "EBML",
    };
  }

  // MP3: ID3v2 tag and/or frame sync
  if (readAscii(b, 0, 3) === "ID3") {
    const mpeg = parseMpeg(b.subarray(10));
    if (mpeg) {
      return {
        container: "MP3 (ID3v2 + MPEG)", codec: mpeg.codec ?? "MPEG audio",
        sampleRate: mpeg.sampleRate ?? null, channels: mpeg.channels ?? null,
        bitDepth: null, durationSec: null, matched: "ID3 + frame sync",
      };
    }
    return {
      container: "MP3 (ID3v2)", codec: null, sampleRate: null, channels: null,
      bitDepth: null, durationSec: null, matched: "ID3",
    };
  }
  const mpeg = parseMpeg(b);
  if (mpeg) {
    return {
      container: "MP3 (MPEG audio)", codec: mpeg.codec ?? null,
      sampleRate: mpeg.sampleRate ?? null, channels: mpeg.channels ?? null,
      bitDepth: null, durationSec: null, matched: "frame sync",
    };
  }

  // AIFF
  if (readAscii(b, 0, 4) === "FORM" && readAscii(b, 8, 4) === "AIFF") {
    return {
      container: "AIFF", codec: "PCM (big-endian)", sampleRate: null, channels: null,
      bitDepth: null, durationSec: null, matched: "FORM…AIFF",
    };
  }

  return null;
}
