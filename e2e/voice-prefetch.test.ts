import { test, expect, type Page } from "@playwright/test";

/**
 * The two invisible behaviours of the voice studio: a failed generation must
 * render copy written for a visitor, and the idle prefetch must respect the
 * connection it would be spending.
 *
 * Both are asserted without transferring a real model — the prefetch tests
 * abort the request once it is observed, and the failure test blocks the hosts
 * outright. That keeps this file fast and deterministic, at the cost of not
 * proving the download itself completes (see the note on the positive control).
 */

/**
 * The engine's own network dependencies: voice models on Hugging Face, the
 * phonemizer wasm from jsDelivr, and the ONNX runtime wasm from cdnjs.
 *
 * Matched by full asset path rather than by host — the page legitimately loads
 * an unrelated icon font from jsDelivr, so a host-only pattern reports page
 * furniture as engine traffic and hides the thing under test.
 */
const ENGINE_ASSET =
  /huggingface\.co\/|cdnjs\.cloudflare\.com\/ajax\/libs\/onnxruntime-web|cdn\.jsdelivr\.net\/npm\/@diffusionstudio\/piper-wasm/;

/** Install a fake Network Information API before the page boots. */
async function withConnection(
  page: Page,
  connection: { saveData?: boolean; effectiveType?: string },
) {
  await page.addInitScript((value) => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      get: () => value,
    });
  }, connection);
}

test.describe("Voice studio — failure copy and connection-aware prefetch", () => {
  test.setTimeout(180000);

  test("a failed generation renders only the generic message", async ({ page }) => {
    // The page and Next's own assets stay reachable; only the engine's
    // dependencies are cut, so generation fails the way a blocked network or an
    // offline device fails it.
    await page.route(ENGINE_ASSET, (route) => route.abort());

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/voice");
    await page.locator("textarea").fill("Hello world, this is a test.");

    const generateBtn = page.getByRole("button", { name: /generate audio/i });
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();

    const error = page.locator('[data-testid="tts-generate-error"]');
    await expect(error).toBeVisible({ timeout: 120000 });

    // Exactly the generic sentence — nothing else.
    const text = ((await error.textContent()) ?? "").trim();
    expect(text).toBe("Couldn't generate speech — try again");

    // No host, package, runtime or part-position text may appear. The engine's
    // own throw values name all of these, so this is the assertion that would
    // fail if the raw error were ever rendered.
    expect(text).not.toMatch(/huggingface|cdnjs|jsdelivr|piper|onnx|ort\b|wasm|https?:|part \d/i);

    // The real error is not swallowed — it is moved to the console.
    expect(consoleErrors.join("\n")).toContain("[voice] generation failed");
  });

  test("no prefetch request fires on a data-saver or 2G connection", async ({ page }) => {
    await withConnection(page, { saveData: true, effectiveType: "2g" });

    const engineRequests: string[] = [];
    page.on("request", (request) => {
      if (ENGINE_ASSET.test(request.url())) engineRequests.push(request.url());
    });

    await page.goto("/voice");
    await expect(page.locator("textarea")).toBeVisible();

    // Well past both the idle timeout and the setTimeout fallback.
    await page.waitForTimeout(10000);

    expect(engineRequests).toEqual([]);
  });

  test("the featured default voice is prefetched on a normal connection", async ({ page }) => {
    await withConnection(page, { saveData: false, effectiveType: "4g" });

    // Positive control for the test above: without this, "no request fired"
    // would also pass if the prefetch never ran at all. The request is aborted
    // as soon as it is seen, so the assertion costs no bandwidth and no model
    // is written to the browser's storage.
    const prefetchRequests: string[] = [];
    await page.route(/huggingface\.co.*en_US-ryan-high\.onnx/, (route) => {
      prefetchRequests.push(route.request().url());
      return route.abort();
    });

    await page.goto("/voice");
    await expect(page.locator("textarea")).toBeVisible();

    // Fires at the first idle moment; the timeout only bounds how late it can be.
    await expect.poll(() => prefetchRequests.length, { timeout: 30000 }).toBeGreaterThan(0);
    expect(prefetchRequests[0]).toContain("en_US-ryan-high.onnx");

    // And it stays invisible: no progress UI, no error, Generate still ready.
    await expect(page.locator('[data-testid="tts-chunk-progress"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tts-generate-error"]')).toHaveCount(0);
    await expect(page.locator("textarea")).toBeEnabled();
  });
});
