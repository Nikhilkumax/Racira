/**
 * Minimal WAV (RIFF/PCM) encoder.
 *
 * The Web Audio API can decode many formats but cannot encode any, so any tool
 * that outputs WAV has to build the container by hand. Kept here so the
 * trimming/normalising tools can reuse it instead of re-implementing headers.
 */

export type WavBitDepth = 16 | 24;

/**
 * The subset of AudioBuffer these encoders actually read.
 *
 * A real AudioBuffer satisfies this structurally, so existing callers are
 * unaffected. It exists so a channel-adjusted view (mono downmix, stereo
 * duplication) can be encoded without allocating a second full copy of the
 * samples just to hand over an AudioBuffer.
 */
export interface PcmSource {
  numberOfChannels: number;
  sampleRate: number;
  /** Length in sample frames. */
  length: number;
  getChannelData(channel: number): Float32Array;
}

function writeAscii(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

export function audioBufferToWav(buffer: PcmSource, bitDepth: WavBitDepth = 16): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const frames = buffer.length;
  const dataSize = frames * blockAlign;

  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk length
  view.setUint16(20, 1, true); // audioFormat: 1 = uncompressed PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  // Interleave channels and quantise from float32 [-1, 1] to signed integers.
  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < numChannels; c++) {
      const clamped = Math.max(-1, Math.min(1, channels[c][i]));
      if (bitDepth === 16) {
        const v = Math.round(clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff);
        view.setInt16(offset, v, true);
      } else {
        // No setInt24, so write three little-endian bytes. Negative values rely
        // on two's complement, which matches 24-bit PCM.
        const v = Math.round(clamped < 0 ? clamped * 0x800000 : clamped * 0x7fffff);
        view.setUint8(offset, v & 0xff);
        view.setUint8(offset + 1, (v >> 8) & 0xff);
        view.setUint8(offset + 2, (v >> 16) & 0xff);
      }
      offset += bytesPerSample;
    }
  }

  return new Blob([out], { type: "audio/wav" });
}
