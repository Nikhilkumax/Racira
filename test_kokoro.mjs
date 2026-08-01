import { KokoroTTS } from "kokoro-js";

async function main() {
  console.log("Loading model...");
  const tts = await KokoroTTS.from_pretrained(
    "onnx-community/Kokoro-82M-v1.0-ONNX",
    {
      dtype: "q8",
      device: "cpu",
      progress_callback: (e) => {
        if (e.progress !== undefined) {
          console.log("  progress: " + Math.round(e.progress * 100) + "% - " + (e.status || ""));
        }
      },
    },
  );

  console.log("Voices available:", Object.keys(tts.voices).length);

  // Voice 1: American English (af_heart)
  console.log("\nGenerating with af_heart (American English)...");
  const audio1 = await tts.generate("Hello world, this is a test of the Kokoro text to speech system.", {
    voice: "af_heart",
    speed: 1,
  });
  console.log("  samples:", audio1.audio.length, "rate:", audio1.sampling_rate);
  console.log("  duration:", (audio1.audio.length / audio1.sampling_rate).toFixed(2), "s");

  // Voice 2: British English (bf_emma)
  console.log("\nGenerating with bf_emma (British English)...");
  const audio2 = await tts.generate("Hello world, this is a test of the Kokoro text to speech system.", {
    voice: "bf_emma",
    speed: 1,
  });
  console.log("  samples:", audio2.audio.length, "rate:", audio2.sampling_rate);
  console.log("  duration:", (audio2.audio.length / audio2.sampling_rate).toFixed(2), "s");

  // Verify both are different
  const diff = audio1.audio.some((v, i) => v !== audio2.audio[i]);
  console.log("\nAudio outputs differ between voices:", diff);
  console.log("\nBoth voices generated successfully.");
}

main().catch((err) => {
  console.error("ERROR:", err.message || err);
  process.exit(1);
});
