/**
 * Diagnostic probe for the /voice TTS generator.
 *
 * Collects, in one run:
 *   1. every model/voice/wasm network request (url, status, bytes)
 *   2. every console message (including warnings)
 *   3. the generated blob's real byte size AND decoded PCM peak/RMS
 *   4. whether <audio>.currentTime actually advances during playback
 *
 * Run with the dev server already up:  node scripts/tts-probe.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://localhost:3002";
const TEXT = "Hello, this is a test of the speech engine.";
const OUT = "scripts/.tts-probe-out";

const ASSET_RE = /\.(bin|onnx|onnx_data|wasm|json|mjs)(\?|$)/i;

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: false, // WebGPU is unreliable in headless
  args: [
    "--enable-unsafe-webgpu",
    "--enable-features=Vulkan,UseSkiaRenderer",
    "--ignore-gpu-blocklist",
    "--use-angle=default",
  ],
});

const ctx = await browser.newContext();
const page = await ctx.newPage();

const requests = [];
const consoleMsgs = [];
const pageErrors = [];

page.on("console", (m) => {
  consoleMsgs.push({ type: m.type(), text: m.text() });
});
page.on("pageerror", (e) => {
  pageErrors.push(String(e?.message ?? e));
});

page.on("response", async (res) => {
  const url = res.url();
  if (!ASSET_RE.test(url) && !/huggingface|hf\.co|cdn/i.test(url)) return;
  let bytes = null;
  try {
    const buf = await res.body();
    bytes = buf.length;
  } catch {
    bytes = null; // body not retrievable (e.g. served from cache)
  }
  requests.push({
    url,
    status: res.status(),
    fromCache: res.fromServiceWorker(),
    contentLength: res.headers()["content-length"] ?? null,
    bytes,
  });
});

const log = (...a) => console.log(...a);

log(`\n=== navigating to ${BASE}/voice ===`);
await page.goto(`${BASE}/voice`, { waitUntil: "domcontentloaded", timeout: 60000 });

// Report WebGPU availability up front — a silent fallback here would explain a lot.
const gpu = await page.evaluate(async () => {
  const hasGPU = typeof navigator !== "undefined" && "gpu" in navigator;
  let adapter = null;
  if (hasGPU) {
    try {
      const a = await navigator.gpu.requestAdapter();
      adapter = a ? "adapter-ok" : "no-adapter";
    } catch (e) {
      adapter = "error: " + e.message;
    }
  }
  return { hasGPU, adapter, crossOriginIsolated: globalThis.crossOriginIsolated };
});
log("webgpu:", JSON.stringify(gpu));

// Fill the textarea and generate.
await page.waitForSelector("textarea", { timeout: 30000 });
await page.fill("textarea", TEXT);

const genBtn = page.getByRole("button", { name: /generate audio/i });
await genBtn.click();
log("clicked Generate — waiting for audio element (model download may take minutes)...");

let audioAppeared = true;
try {
  await page.waitForSelector('[data-testid="tts-audio"]', { timeout: 600000 });
} catch {
  audioAppeared = false;
}

let result = { audioAppeared };

if (audioAppeared) {
  // Give autoplay a moment, then sample currentTime twice from the REAL element.
  await page.waitForTimeout(1500);

  result = await page.evaluate(async () => {
    const el = document.querySelector('[data-testid="tts-audio"]');
    if (!el) return { audioAppeared: false };

    const src = el.getAttribute("src");
    const resp = await fetch(src);
    const buf = await resp.arrayBuffer();

    // Decode to inspect the actual samples — this is the ground truth for
    // "is it silent", independent of the player UI.
    let decoded = null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const acx = new AC();
      const ab = await acx.decodeAudioData(buf.slice(0));
      const ch = ab.getChannelData(0);
      let peak = 0;
      let sumSq = 0;
      let nonZero = 0;
      for (let i = 0; i < ch.length; i++) {
        const v = Math.abs(ch[i]);
        if (v > peak) peak = v;
        if (v > 1e-6) nonZero++;
        sumSq += ch[i] * ch[i];
      }
      decoded = {
        durationSec: ab.duration,
        sampleRate: ab.sampleRate,
        channels: ab.numberOfChannels,
        samples: ch.length,
        peakAmplitude: peak,
        rms: Math.sqrt(sumSq / ch.length),
        nonZeroSamples: nonZero,
        percentNonZero: ((nonZero / ch.length) * 100).toFixed(3) + "%",
      };
      acx.close();
    } catch (e) {
      decoded = { decodeError: e.message };
    }

    // Observe currentTime on the real element across a play attempt.
    const t0 = el.currentTime;
    try {
      await el.play();
    } catch (e) {
      /* autoplay policy */
    }
    await new Promise((r) => setTimeout(r, 1200));
    const t1 = el.currentTime;

    return {
      audioAppeared: true,
      blobBytes: buf.byteLength,
      mimeFromFetch: resp.headers.get("content-type"),
      element: {
        duration: el.duration,
        paused: el.paused,
        muted: el.muted,
        volume: el.volume,
        readyState: el.readyState,
        networkState: el.networkState,
        error: el.error ? el.error.code : null,
        currentTimeBefore: t0,
        currentTimeAfter: t1,
        advanced: t1 > t0,
      },
      decoded,
    };
  });

  // Save the actual bytes so we can confirm the on-disk size.
  const b64 = await page.evaluate(async () => {
    const el = document.querySelector('[data-testid="tts-audio"]');
    const r = await fetch(el.getAttribute("src"));
    const b = new Uint8Array(await r.arrayBuffer());
    let s = "";
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  });
  const outFile = `${OUT}/generated.bin`;
  fs.writeFileSync(outFile, Buffer.from(b64, "base64"));
  result.savedTo = outFile;
  result.savedBytes = fs.statSync(outFile).size;
}

const report = {
  gpu,
  result,
  requests,
  consoleMsgs,
  pageErrors,
};
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

log("\n=== WEBGPU ===");
log(JSON.stringify(gpu, null, 2));

log("\n=== 1. MODEL / VOICE / WASM REQUESTS ===");
if (!requests.length) log("(none captured)");
for (const r of requests) {
  const short = r.url.length > 110 ? r.url.slice(0, 107) + "..." : r.url;
  log(
    `[${r.status}] ${r.bytes ?? "?"} bytes (CL=${r.contentLength ?? "-"})  ${short}`,
  );
}

log("\n=== 2. CONSOLE (all levels) ===");
for (const m of consoleMsgs) log(`(${m.type}) ${m.text}`);
if (pageErrors.length) {
  log("\n--- page errors ---");
  for (const e of pageErrors) log(e);
}

log("\n=== 3 & 4. AUDIO ===");
log(JSON.stringify(result, null, 2));

log(`\nfull report -> ${OUT}/report.json`);

await browser.close();
