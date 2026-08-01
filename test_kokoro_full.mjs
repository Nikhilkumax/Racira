import { KokoroTTS } from "kokoro-js";
import lamejs from "lamejs";
import { writeFileSync } from "fs";

async function main() {
  console.log("Loading model...");
  const tts = await KokoroTTS.from_pretrained(
    "onnx-community/Kokoro-82M-v1.0-ONNX",
    {
      dtype: "q8",
      device: "cpu",
    },
  );

  console.log("Generating with af_heart (American English)...");
  const audio = await tts.generate("Hello world, this is a test of the Kokoro text to speech system.", {
    voice: "af_heart",
    speed: 1,
  });

  console.log("Audio: samples:", audio.audio.length, "rate:", audio.sampling_rate);

  // Test WAV output
  console.log("\nTesting WAV output...");
  const wavBlob = audio.toBlob();
  console.log("  WAV blob type:", wavBlob.type, "size:", wavBlob.size, "bytes");
  const wavBuffer = await wavBlob.arrayBuffer();
  writeFileSync("test_output.wav", Buffer.from(wavBuffer));
  console.log("  Written test_output.wav:", wavBuffer.byteLength, "bytes");

  // Test MP3 output
  console.log("\nTesting MP3 output...");
  const samples = audio.audio;
  const sampleRate = audio.sampling_rate;
  const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
  const maxSamples = 1152;
  const chunks = [];

  for (let i = 0; i < samples.length; i += maxSamples) {
    const chunk = samples.subarray(i, i + maxSamples);
    const int16 = new Int16Array(chunk.length);
    for (let j = 0; j < chunk.length; j++) {
      int16[j] = Math.max(-1, Math.min(1, chunk[j])) * 0x7fff;
    }
    const mp3buf = mp3Encoder.encodeBuffer(int16);
    if (mp3buf.length > 0) chunks.push(mp3buf);
  }

  const mp3buf = mp3Encoder.flush();
  if (mp3buf.length > 0) chunks.push(mp3buf);

  const mp3Blob = new Blob(chunks, { type: "audio/mp3" });
  console.log("  MP3 blob type:", mp3Blob.type, "size:", mp3Blob.size, "bytes");
  const mp3Buffer = await mp3Blob.arrayBuffer();
  writeFileSync("test_output.mp3", Buffer.from(mp3Buffer));
  console.log("  Written test_output.mp3:", mp3Buffer.byteLength, "bytes");

  // Verify WAV header
  const wavHeader = Buffer.from(wavBuffer.slice(0, 12));
  console.log("\nWAV header:", wavHeader.toString("ascii").substring(0, 4));
  console.log("WAV format:", wavHeader.toString("ascii").substring(8, 12));

  // Verify MP3 header
  const mp3Header = Buffer.from(mp3Buffer.slice(0, 3));
  console.log("MP3 header bytes:", mp3Header[0].toString(16), mp3Header[1].toString(16));

  console.log("\n✓ WAV and MP3 encoding both work.");
}

main().catch((err) => {
  console.error("ERROR:", err.message || err);
  process.exit(1);
});
