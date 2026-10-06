/**
 * RIFF/WAVE (PCM) parsing and stitching for the Voice domain.
 *
 * The speech engine returns one WAV file per engine call. A long script is
 * several calls, so the pieces have to be joined into a single playable —
 * and downloadable — file. Joining the compressed or chunked containers
 * directly is not possible, so each piece is decoded to samples, the pieces
 * are written back-to-back with a short silence between them, and the result
 * is re-encoded as one canonical 16-bit mono WAV.
 *
 * Pure and synchronous apart from the Blob reads in concatWavBlobs.
 */

const HEADER_BYTES = 44;

export interface ParsedWav {
  sampleRate: number;
  /** Channels found in the source file (the samples below are mono). */
  channels: number;
  bitsPerSample: number;
  /**
   * Mono samples in [-1, 1]. Multi-channel input is averaged down: every
   * concatenated file this module produces is mono, and the engine emits mono.
   */
  samples: Float32Array;
  /** Duration of the decoded audio, in seconds. */
  durationSec: number;
}

/** RIFF is little-endian throughout; every field is read with an LE view. */
function readFourCC(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

function clampSample(value: number): number {
  return value > 1 ? 1 : value < -1 ? -1 : value;
}

/**
 * One float sample in [-1, 1] as its 16-bit integer code.
 *
 * Round-to-nearest rather than truncate: truncation biases every sample toward
 * zero by up to half a code step, which is measurable as quantization error on
 * quiet material. The rounded result is clamped because a value just under 1
 * rounds to 32768, which setInt16 would wrap to -32768.
 */
export function floatToInt16(value: number): number {
  if (value >= 1) return 32767;
  if (value <= -1) return -32768;
  const scaled = Math.round(value * 32768);
  return scaled > 32767 ? 32767 : scaled < -32768 ? -32768 : scaled;
}

/**
 * Decode a RIFF/WAVE buffer into mono samples.
 *
 * Handles the two formats that occur in practice — integer PCM (8/16/24/32
 * bit) and 32-bit float — and skips unknown chunks (LIST, fact, bext, …)
 * rather than assuming `fmt ` and `data` are adjacent.
 *
 * @throws If the buffer is not a RIFF/WAVE file, has no `fmt ` or `data`
 *         chunk, or uses an encoding this parser does not decode.
 */
export function parseWav(buffer: ArrayBuffer): ParsedWav {
  const view = new DataView(buffer);

  if (buffer.byteLength < 12 || readFourCC(view, 0) !== "RIFF" || readFourCC(view, 8) !== "WAVE") {
    throw new Error("Not a RIFF/WAVE file.");
  }

  let audioFormat = 0;
  let channels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let dataOffset = -1;
  let dataLength = 0;

  let offset = 12;
  while (offset + 8 <= buffer.byteLength) {
    const id = readFourCC(view, offset);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;

    if (id === "fmt ") {
      audioFormat = view.getUint16(body, true);
      channels = view.getUint16(body + 2, true);
      sampleRate = view.getUint32(body + 4, true);
      bitsPerSample = view.getUint16(body + 14, true);
      // WAVE_FORMAT_EXTENSIBLE (0xFFFE) carries the real format in the first
      // two bytes of its extension.
      if (audioFormat === 0xfffe && size >= 26) {
        audioFormat = view.getUint16(body + 24, true);
      }
    } else if (id === "data") {
      dataOffset = body;
      // A streamed file may declare 0 or an over-long size; trust the buffer.
      dataLength = Math.min(size, buffer.byteLength - body);
    }

    // Chunks are word-aligned: an odd size is followed by a pad byte.
    offset = body + size + (size % 2);
  }

  if (dataOffset < 0 || channels <= 0 || sampleRate <= 0) {
    throw new Error("WAV file has no usable fmt / data chunk.");
  }

  const isFloat = audioFormat === 3;
  const isPcm = audioFormat === 1;
  if (!isFloat && !isPcm) {
    throw new Error(`Unsupported WAV encoding (format ${audioFormat}).`);
  }
  if (isPcm && ![8, 16, 24, 32].includes(bitsPerSample)) {
    throw new Error(`Unsupported PCM bit depth (${bitsPerSample}).`);
  }
  if (isFloat && bitsPerSample !== 32) {
    throw new Error(`Unsupported float bit depth (${bitsPerSample}).`);
  }

  const bytesPerSample = bitsPerSample / 8;
  const frameBytes = bytesPerSample * channels;
  const frameCount = Math.floor(dataLength / frameBytes);
  const samples = new Float32Array(frameCount);
  const read = bitsPerSample === 16 ? view.getInt16.bind(view) : null;

  for (let frame = 0; frame < frameCount; frame++) {
    let sum = 0;
    for (let channel = 0; channel < channels; channel++) {
      const at = dataOffset + frame * frameBytes + channel * bytesPerSample;
      let value: number;

      if (isFloat) {
        value = view.getFloat32(at, true);
      } else if (bitsPerSample === 8) {
        // 8-bit PCM is unsigned.
        value = (view.getUint8(at) - 128) / 128;
      } else if (bitsPerSample === 16) {
        value = read!(at, true) / 32768;
      } else if (bitsPerSample === 24) {
        const lo = view.getUint8(at);
        const mid = view.getUint8(at + 1);
        const hi = view.getInt8(at + 2);
        value = ((hi << 16) | (mid << 8) | lo) / 8388608;
      } else {
        value = view.getInt32(at, true) / 2147483648;
      }

      sum += value;
    }

    samples[frame] = clampSample(sum / channels);
  }

  return {
    sampleRate,
    channels,
    bitsPerSample,
    samples,
    durationSec: frameCount / sampleRate,
  };
}

/** Encode mono samples as a canonical 16-bit PCM WAV. */
export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(HEADER_BYTES + samples.length * 2);
  const view = new DataView(buffer);

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, buffer.byteLength - 8, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // PCM fmt chunk size
  view.setUint16(20, 1, true); // WAVE_FORMAT_PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, samples.length * 2, true);

  let at = HEADER_BYTES;
  for (let i = 0; i < samples.length; i++) {
    // Asymmetric full scale: positive is 32767, negative is -32768.
    view.setInt16(at, floatToInt16(samples[i]), true);
    at += 2;
  }

  return buffer;
}

export interface ConcatOptions {
  /** Silence inserted at each seam, in milliseconds. */
  gapMs?: number;
}

const DEFAULT_GAP_MS = 120;

export interface MergedAudio {
  /** Mono samples in [-1, 1], with the inter-chunk silence already applied. */
  samples: Float32Array;
  sampleRate: number;
  /** Parts that were joined (1 = the input was passed through untouched). */
  parts: number;
}

/**
 * Decode per-chunk WAV files and merge them into one continuous sample buffer.
 *
 * A short silence gap is inserted at each seam so consecutive chunks do not
 * butt against each other mid-word. The gap is the only silence added: the
 * decoded audio itself is copied sample for sample.
 *
 * Split out from concatWavBlobs because the compressed output path needs the
 * same seam behaviour: encoding MP3 from separately-encoded chunks would leave
 * an encoder frame boundary at every seam instead of the intended silence.
 *
 * @throws If any input is not a decodable WAV, or the sample rates differ.
 */
export async function concatWavSamples(
  blobs: Blob[],
  { gapMs = DEFAULT_GAP_MS }: ConcatOptions = {},
): Promise<MergedAudio> {
  if (blobs.length === 0) throw new Error("No audio to join.");

  const parts = await Promise.all(
    blobs.map(async (blob) => parseWav(await blob.arrayBuffer())),
  );

  const sampleRate = parts[0].sampleRate;
  const mismatched = parts.findIndex((part) => part.sampleRate !== sampleRate);
  if (mismatched > 0) {
    throw new Error(
      `Cannot join audio with different sample rates ` +
        `(${parts[0].sampleRate} Hz and ${parts[mismatched].sampleRate} Hz).`,
    );
  }

  if (parts.length === 1) {
    return { samples: parts[0].samples, sampleRate, parts: 1 };
  }

  const gapSamples = Math.max(0, Math.round((sampleRate * gapMs) / 1000));
  const totalSamples =
    parts.reduce((sum, part) => sum + part.samples.length, 0) +
    gapSamples * (parts.length - 1);

  const merged = new Float32Array(totalSamples);
  let offset = 0;
  for (const part of parts) {
    merged.set(part.samples, offset);
    // The gap is already zero-filled, so advancing past it is all that is
    // needed to insert silence.
    offset += part.samples.length + gapSamples;
  }

  return { samples: merged, sampleRate, parts: parts.length };
}

/**
 * Stitch per-chunk WAV files into one continuous WAV.
 *
 * A single input is returned as-is rather than being re-encoded, so a
 * short script costs nothing beyond the engine call that produced it.
 *
 * @throws If any input is not a decodable WAV, or the sample rates differ.
 */
export async function concatWavBlobs(
  blobs: Blob[],
  options: ConcatOptions = {},
): Promise<Blob> {
  if (blobs.length === 1) return blobs[0];

  const { samples, sampleRate } = await concatWavSamples(blobs, options);
  return new Blob([encodeWav(samples, sampleRate)], { type: "audio/wav" });
}
