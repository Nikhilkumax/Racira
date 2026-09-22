import { test, expect, type Page } from "@playwright/test";

/**
 * Regression: changing the voice used to replay the previous clip.
 *
 * The speech library keeps one process-wide `TtsSession` and its constructor
 * returns that instance whenever one exists, overwriting only `voiceId` — so a
 * second voice never re-ran `init()`, and the same text was synthesized with
 * the first voice's model config and ONNX session. The audio was therefore
 * effectively unchanged (the byte-level difference is only the model's own
 * sampling noise), and only a hard refresh cleared it.
 *
 * Because inference noise makes byte comparison useless as a signal, this test
 * asserts the *mechanism* instead: the second run must send the new voice id,
 * must fetch that voice's model, and must end with it saved on the device.
 * Every one of those fails on the pre-fix worker, where the stale singleton
 * means no model for the new voice is ever loaded or written.
 *
 * Costs two cold model downloads (~60 MB each), hence the long timeouts.
 */
test.describe("Voice Studio — voice switch", () => {
  test.setTimeout(480000);

  type GenerateRequest = { voiceId: string; text: string };

  /** Record the payload the page posts to the speech worker. */
  async function recordWorkerRequests(page: Page): Promise<void> {
    await page.addInitScript(() => {
      const scope = window as unknown as { __voiceRequests?: GenerateRequest[] };
      scope.__voiceRequests = [];
      const original = Worker.prototype.postMessage;
      Worker.prototype.postMessage = function patched(
        this: Worker,
        message: never,
        ...rest: never[]
      ) {
        const request = message as unknown as { type?: string; voiceId?: string; text?: string };
        if (request?.type === "generate" && request.voiceId) {
          scope.__voiceRequests!.push({ voiceId: request.voiceId, text: request.text ?? "" });
        }
        return (original as unknown as (...args: never[]) => void).apply(this, [
          message,
          ...rest,
        ]);
      } as typeof Worker.prototype.postMessage;
    });
  }

  test("a different voice generates different audio without a reload", async ({ page }) => {
    await recordWorkerRequests(page);

    const modelRequests: string[] = [];
    page.on("request", (request) => {
      if (/\.onnx(\?|$)/.test(request.url())) modelRequests.push(request.url());
    });

    await page.goto("/voice");

    const textarea = page.locator("textarea");
    const audioEl = page.locator('[data-testid="tts-audio"]');
    const storedVoices = page.locator('[data-testid="tts-stored-voices"]');
    const generateBtn = page.getByRole("button", { name: /generate audio/i });

    // The same script for both runs — the bug reproduces on unchanged text.
    const script = "Hello world, this is a test.";
    await textarea.fill(script);

    // 1. Default voice: English (US) / Male / Ryan (standard) / WAV.
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();
    await page
      .locator('[data-testid="tts-download"]')
      .waitFor({ state: "attached", timeout: 300000 });

    const firstSrc = await audioEl.getAttribute("src");
    expect(firstSrc).toMatch(/^blob:/);

    // 2. Switch to a different voice without reloading the page.
    await page.locator('[data-testid="gender-select"]').click();
    await page.getByRole("option", { name: "Female", exact: true }).click();
    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /amy/i }).first().click();

    // 3. Generate the identical text again.
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();

    // Completion signal: the player is re-pointed at a brand new blob, which is
    // the last thing a successful run does. Pre-fix this only happens because a
    // fresh object URL is built around the *old* model's audio.
    await expect(audioEl).not.toHaveAttribute("src", firstSrc!, { timeout: 300000 });

    // The UI asked the worker for the newly chosen voice, with the same text —
    // rules out a stale closure in the handler.
    const sends = await page.evaluate(
      () => (window as unknown as { __voiceRequests: GenerateRequest[] }).__voiceRequests,
    );
    expect(sends.map((send) => send.voiceId)).toEqual([
      "en_US-ryan-medium",
      "en_US-amy-medium",
    ]);
    expect(sends[1].text).toBe(sends[0].text);

    // The new voice's model was actually fetched...
    expect(modelRequests.some((url) => url.includes("en_US-amy-medium.onnx"))).toBe(true);

    // ...and written to the device, so the cache indicator flips for it. This is
    // the assertion that fails hardest on the pre-fix worker: the stale session
    // never re-inits, so the second voice's model is never downloaded or stored.
    await expect(storedVoices).toContainText(/saved on this device/i, { timeout: 20000 });

    await expect(page.locator('[data-testid="tts-generate-error"]')).toHaveCount(0);
  });
});
