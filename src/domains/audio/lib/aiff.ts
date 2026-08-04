/**
 * Minimal AIFF (FORM/AIFF, big-endian PCM) encoder.
 *
 * The big-endian counterpart to ./wav.ts, written for the same reason: the Web
 * Audio API decodes AIFF but cannot encode it, and routing a plain AIFF export
 * through ffmpeg.wasm would mean downloading ~31 MB to do what a few hundred
 * bytes of header writing already does in-process.
 *
 * Deliberately uncompressed AIFF (not AIFF-C): no compressionType field, so the
 * COMM chunk stays at the classic 18 bytes and every AIFF reader accepts it.
 */

import type { PcmSource } from "./wav";

export type AiffBitDepth = 16 | 24;

function writeAscii(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

/**
 * Write the sample rate as an 80-bit IEEE 754 extended float — the format AIFF's
 * COMM chunk mandates and the only genuinely awkward part of the container.
 *
 * Layout: 1 sign bit, 15 exponent bits (biased by 16383), then a 64-bit mantissa
 * whose leading integer bit is explicit (unlike float32/float64, where it is
 * implied). Sample rates are small integers, so the mantissa's low half is
 * always zero in practice and double precision is never strained.
 */
function writeExtendedFloat80(view: DataView, offset: number, value: number) {
  if (value <= 0 || !Number.isFinite(value)) {
    for (let i = 0; i < 10; i++) view.setUint8(offset + i, 0);
    return;
  }

  const exponent = Math.floor(Math.log2(value));
  const mantissa = value / Math.pow(2, exponent); // normalised to [1, 2)

  view.setUint16(offset, exponent + 16383, false); // sign bit stays 0

  // Scale so the leading 1 lands in bit 63, then split into two 32-bit halves.
  const scaled = mantissa * Math.pow(2, 63);
  const high = Math.floor(scaled / Math.pow(2, 32));
  const low = scaled - high * Math.pow(2, 32);

  view.setUint32(offset + 2, high >>> 0, false);
  view.setUint32(offset + 6, low >>> 0, false);
}

/** Bytes before the sample data: 8 (FORM) + 4 (AIFF) + 26 (COMM) + 16 (SSND). */
const HEADER_BYTES = 54;

export function audioBufferToAiff(buffer: PcmSource, bitDepth: AiffBitDepth = 16): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const frames = buffer.length;
  const dataSize = frames * blockAlign;

  const out = new ArrayBuffer(HEADER_BYTES + dataSize);
  const view = new DataView(out);

  // Every multi-byte field in AIFF is big-endian — hence `false` throughout.
  writeAscii(view, 0, "FORM");
  view.setUint32(4, HEADER_BYTES - 8 + dataSize, false); // everything after this field
  writeAscii(view, 8, "AIFF");

  writeAscii(view, 12, "COMM");
  view.setUint32(16, 18, false); // COMM chunk length
  view.setUint16(20, numChannels, false);
  view.setUint32(22, frames, false); // sample *frames*, not samples
  view.setUint16(26, bitDepth, false);
  writeExtendedFloat80(view, 28, sampleRate);

  writeAscii(view, 38, "SSND");
  view.setUint32(42, dataSize + 8, false); // includes the offset/blockSize fields
  view.setUint32(46, 0, false); // offset
  view.setUint32(50, 0, false); // blockSize

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  // Interleave and quantise from float32 [-1, 1] to big-endian signed integers.
  let offset = HEADER_BYTES;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < numChannels; c++) {
      const clamped = Math.max(-1, Math.min(1, channels[c][i]));
      if (bitDepth === 16) {
        const v = Math.round(clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff);
        view.setInt16(offset, v, false);
      } else {
        // No setInt24, so write three big-endian bytes (most significant first).
        // Negative values rely on two's complement, which matches 24-bit PCM.
        const v = Math.round(clamped < 0 ? clamped * 0x800000 : clamped * 0x7fffff);
        view.setUint8(offset, (v >> 16) & 0xff);
        view.setUint8(offset + 1, (v >> 8) & 0xff);
        view.setUint8(offset + 2, v & 0xff);
      }
      offset += bytesPerSample;
    }
  }

  return new Blob([out], { type: "audio/aiff" });
}
