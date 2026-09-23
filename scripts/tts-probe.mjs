/**
 * Diagnostic + waveform-verification probe for the /voice TTS generator.
 *
 * Collects, in one run:
 *   1. every model/voice/wasm network request (url, status, bytes)
 *   2. every console message (including warnings)
 *   3. each generated blob's real byte size AND decoded PCM peak/RMS
 *   4. whether the <audio> element's currentTime actually advances
 *
 * By default it generates once with whatever voice the page loads with (Ryan,
 * standard, WAV). Set PROBE_VOICES to sweep several voices — this is how the
 * catalog is verified to produce *real* audio rather than a silent or corrupt
 * clip, since a decoded peak of 0 is the one failure that a byte-count cannot
 * detect:
 *
 *   PROBE_VOICES='[
 *     {"id":"en_US-ryan-medium"},
 *     {"id":"it_IT-paola-medium","language":"Italian (Italy)","gender":"female","option":"Paola"},
 *     {"id":"cy_GB-gwryw_gogleddol-medium","language":"Welsh","gender":"male","option":"Owain"}
 *   ]' node scripts/tts-probe.mjs
 *
 * `language`/`gender`/`option` are the strings the picker shows; a descriptor
 * with none of them uses the page's current selection. Every synthesized clip
 * is written to scripts/.tts-probe-out/ and the process exits non-zero if any
 * voice produced silence (peak below SILENCE_PEAK), so this can gate a release.
 *
 * Run with the dev server already up:  node scripts/tts-probe.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://localhost:3002";
const TEXT = process.env.PROBE_TEXT ?? "Hello, this is a test of the speech engine.";
const OUT = "scripts/.tts-probe-out";

/** A decoded peak at or below this is treated as "the model produced nothing". */
const SILENCE_PEAK = 0.01;

/** Engine assets the generator pulls: models + configs + the two wasm bundles. */
const ASSET_RE = /\.(onnx|onnx\.json|wasm|data|bin)(\?|$)/i;

fs.mkdirSync(OUT, { recursive: true });

// ── Voice sweep configuration ───────────────────────────────────────────

// Default: one run with the page's own default selection (English (US) / male /
// Ryan / WAV), which is exactly what this probe did before it could sweep.
let VOICES = [{ id: "(page default)" }];

if (process.env.PROBE_VOICES) {
  let parsed;
  try {
    parsed = JSON.parse(process.env.PROBE_VOICES);
  } catch (error) {
    console.error(`PROBE_VOICES is not valid JSON: ${error.message}`);
    process.exit(2);
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    console.error("PROBE_VOICES must be a non-empty JSON array of descriptors.");
    process.exit(2);
  }
  VOICES = parsed;
}

// ── Browser ─────────────────────────────────────────────────────────────
// Headless by default: the engine is WASM-only (no WebGPU tier to keep alive),
// so there is no reason to depend on a display. PROBE_HEADED=1 to watch it.

const browser = await chromium.launch({ headless: process.env.PROBE_HEADED !== "1" });

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
    fromServiceWorker: res.fromServiceWorker(),
    contentLength: res.headers()["content-length"] ?? null,
    bytes,
  });
});

const log = (...a) => console.log(...a);

// ── Picker helpers ──────────────────────────────────────────────────────

/** Choose a voice through the same dropdowns a visitor uses. */
async function selectVoice(voice) {
  if (voice.language) {
    await page.locator('[data-testid="language-select"]').click();
    await page.getByRole("option", { name: voice.language, exact: true }).click();
  }
  if (voice.gender) {
    const label = voice.gender.toLowerCase() === "male" ? "Male" : "Female";
    await page.locator('[data-testid="gender-select"]').click();
    // exact: "Female" substring-matches "Male".
    await page.getByRole("option", { name: label, exact: true }).click();
  }
  if (voice.option) {
    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: voice.option, exact: false }).first().click();
  }
}

/** Decode the current clip and measure it — the ground truth for "is it silent". */
async function measureClip() {
  return page.evaluate(async () => {
    const el = document.querySelector('[data-testid="tts-audio"]');
    if (!el) return { audioAppeared: false };

    const src = el.getAttribute("src");
    const resp = await fetch(src);
    const buf = await resp.arrayBuffer();

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
    } catch {
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
}

/** Persist the current clip's bytes so on-disk size can be confirmed. */
async function saveClip(name) {
  const b64 = await page.evaluate(async () => {
    const el = document.querySelector('[data-testid="tts-audio"]');
    const r = await fetch(el.getAttribute("src"));
    const b = new Uint8Array(await r.arrayBuffer());
    let s = "";
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  });
  const file = `${OUT}/${name}.bin`;
  fs.writeFileSync(file, Buffer.from(b64, "base64"));
  return { file, bytes: fs.statSync(file).size };
}

// ── Run ─────────────────────────────────────────────────────────────────

log(`\n=== navigating to ${BASE}/voice ===`);
await page.goto(`${BASE}/voice`, { waitUntil: "domcontentloaded", timeout: 60000 });

// Report WebGPU availability up front. The engine is WASM-only, so this is
// informational — but a silent GPU fallback used to explain a lot, and it is
// cheap to keep recording.
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

await page.waitForSelector("textarea", { timeout: 30000 });
await page.fill("textarea", TEXT);

const genBtn = page.getByRole("button", { name: /generate audio/i });
const audioEl = page.locator('[data-testid="tts-audio"]');
const errorEl = page.locator('[data-testid="tts-generate-error"]');

const results = [];

for (const voice of VOICES) {
  const label = voice.id ?? "(page default)";
  log(`\n--- voice: ${label} ---`);

  const previousSrc = await audioEl.getAttribute("src").catch(() => null);

  await selectVoice(voice);

  // The UI's pre-flight part estimate is computed from the same constant the
  // worker splits with, so it is a faithful readout of how many engine calls
  // this input will take (see PART_MAX_CHARS in piperProtocol.ts).
  const estimateEl = page.locator('[data-testid="tts-chunk-estimate"]');
  const chunkEstimate =
    (await estimateEl.count()) > 0 ? ((await estimateEl.textContent()) ?? "").trim() : null;

  const requestsBefore = requests.length;
  await genBtn.click();
  log("clicked Generate — waiting for a fresh clip (model download may take minutes)...");

  let ok = true;
  try {
    // A fresh clip is the last thing a successful run does: the blob URL is
    // re-pointed. Waiting on a *change* is what makes a sweep work, since the
    // audio element already exists from the previous voice.
    await page.waitForFunction(
      (prev) => {
        const el = document.querySelector('[data-testid="tts-audio"]');
        if (!el) return false;
        const src = el.getAttribute("src");
        return !!src && src !== prev;
      },
      previousSrc,
      { timeout: 600000 },
    );
  } catch {
    ok = false;
  }

  if (!ok) {
    const generatedError = (await errorEl.count()) > 0 ? await errorEl.textContent() : null;
    results.push({ id: label, ok: false, error: generatedError ?? "(no clip and no error text)" });
    log(`FAILED — ${generatedError ?? "no clip appeared"}`);
    continue;
  }

  await page.waitForTimeout(1500);
  const measurement = await measureClip();
  const saved = await saveClip(`generated-${label.replace(/[^a-z0-9_.-]/gi, "_")}`);
  const storedText = (await page.locator('[data-testid="tts-stored-voices"]').textContent()) ?? "";

  const decoded = measurement.decoded ?? {};
  const silent = !decoded.peakAmplitude || decoded.peakAmplitude < SILENCE_PEAK;

  results.push({
    id: label,
    ok: !silent,
    silent,
    charCount: TEXT.length,
    chunkEstimate,
    savedTo: saved.file,
    savedBytes: saved.bytes,
    requests: requests.length - requestsBefore,
    storedIndicator: storedText.trim(),
    ...measurement,
  });

  log(
    `chars=${TEXT.length} parts=${chunkEstimate ?? "n/a"} ` +
      `peak=${decoded.peakAmplitude?.toFixed(4) ?? "?"} ` +
      `rms=${decoded.rms?.toFixed(5) ?? "?"} ` +
      `nonZero=${decoded.percentNonZero ?? "?"} ` +
      `dur=${decoded.durationSec?.toFixed(2) ?? "?"}s ` +
      `bytes=${measurement.blobBytes ?? "?"} → ${silent ? "SILENT (FAIL)" : "audio ok"}`,
  );
}

const silentVoices = results.filter((r) => r.ok === false);
const report = { gpu, text: TEXT, results, requests, consoleMsgs, pageErrors };
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

log("\n=== 1. MODEL / VOICE / WASM REQUESTS ===");
if (!requests.length) log("(none captured)");
for (const r of requests) {
  const short = r.url.length > 110 ? r.url.slice(0, 107) + "..." : r.url;
  log(`[${r.status}] ${r.bytes ?? "?"} bytes (CL=${r.contentLength ?? "-"})  ${short}`);
}

log("\n=== 2. CONSOLE (all levels) ===");
for (const m of consoleMsgs) log(`(${m.type}) ${m.text}`);
if (pageErrors.length) {
  log("\n--- page errors ---");
  for (const e of pageErrors) log(e);
}

log("\n=== 3. WAVEFORM SUMMARY ===");
for (const r of results) {
  if (r.ok === false) {
    log(`✗ ${r.id}: ${r.error}`);
    continue;
  }
  log(
    `✓ ${r.id}: peak=${r.decoded?.peakAmplitude?.toFixed(4)} ` +
      `rms=${r.decoded?.rms?.toFixed(5)} nonZero=${r.decoded?.percentNonZero} ` +
      `duration=${r.decoded?.durationSec?.toFixed(2)}s`,
  );
}

log(`\nfull report -> ${OUT}/report.json`);
await browser.close();

if (silentVoices.length) {
  log(`\nRESULT: FAIL — ${silentVoices.length}/${results.length} voice(s) produced silence or no clip.`);
  process.exit(1);
}
log(`\nRESULT: PASS — ${results.length} voice(s) produced non-silent audio.`);
