import { test, expect } from "@playwright/test";

test.describe("Kokoro TTS Voice Generator", () => {
  test.setTimeout(300000);

  test("page loads and component renders", async ({ page }) => {
    await page.goto("/voice");
    await page.waitForTimeout(5000);
    const textarea = page.locator("textarea");
    const count = await textarea.count();
    console.log(`Textarea count: ${count}`);
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 5000));
    console.log(`Body HTML (first 5000 chars):\n${bodyHTML}`);
    expect(count).toBeGreaterThan(0);
  });

  test("full click-through: US voice → generate → download (WAV)", async ({
    page,
  }) => {
    await page.goto("/voice");

    // 1. Confirm Generate button is disabled initially
    const generateBtn = page.getByRole("button", { name: /generate audio/i });
    await expect(generateBtn).toBeDisabled();

    // 2. Select a US voice (af_heart) from the grouped Voice dropdown
    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /heart/i }).first().click();

    // 3. Type text into the textarea
    const textarea = page.locator("textarea");
    await textarea.fill("Hello world, this is a test.");

    // 4. Confirm Generate button is now enabled
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });

    // 5. Click Generate
    await generateBtn.click();

    // 6. Wait for audio to be generated (Download link appears)
    // Model download can take several minutes; wait for audio player to appear
    await page
      .locator('[data-testid="tts-download"]')
      .waitFor({ state: "attached", timeout: 240000 });

    // 7. Confirm <audio> element has valid blob src
    const audioEl = page.locator('[data-testid="tts-audio"]');
    await expect(audioEl).toHaveAttribute("src", /^blob:/, { timeout: 5000 });

    // 8. Confirm Download button href resolves to non-empty blob
    const downloadLink = page.locator('[data-testid="tts-download"]');
    const href = await downloadLink.getAttribute("href");
    expect(href).toMatch(/^blob:/);

    // Click download and verify it triggers a download
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      downloadLink.click(),
    ]);
    expect(download.suggestedFilename).toMatch(/\.(wav|mp3)$/);
    const buffer = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of buffer!) {
      chunks.push(chunk);
    }
    const size = Buffer.concat(chunks).length;
    expect(size).toBeGreaterThan(1000);
    console.log(`WAV download size: ${size} bytes`);

    // 9. Verify audio src
    const src = await audioEl.getAttribute("src");
    expect(src).toBeTruthy();
    console.log(`Audio src: ${src?.substring(0, 60)}...`);
  });

  test("second language/voice: UK voice → generate → download (MP3)", async ({
    page,
  }) => {
    await page.goto("/voice");

    const generateBtn = page.getByRole("button", { name: /generate audio/i });
    await expect(generateBtn).toBeDisabled();

    // Select a UK voice (bf_emma)
    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /emma/i }).first().click();

    // Type text
    const textarea = page.locator("textarea");
    await textarea.fill("Testing with a British voice.");

    // Switch to MP3 format
    await page.locator('[data-testid="format-select"]').click();
    await page.getByRole("option", { name: /mp3/i }).click();

    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();

    // Wait for audio to be generated
    await page
      .locator('[data-testid="tts-download"]')
      .waitFor({ state: "attached", timeout: 240000 });

    // Verify audio element
    const audioEl = page.locator('[data-testid="tts-audio"]');
    await expect(audioEl).toHaveAttribute("src", /^blob:/, { timeout: 5000 });

    // Verify download
    const downloadLink = page.locator('[data-testid="tts-download"]');
    const href = await downloadLink.getAttribute("href");
    expect(href).toMatch(/^blob:/);

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      downloadLink.click(),
    ]);
    expect(download.suggestedFilename).toMatch(/\.mp3$/);
    const buffer = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of buffer!) {
      chunks.push(chunk);
    }
    const size = Buffer.concat(chunks).length;
    expect(size).toBeGreaterThan(1000);
    console.log(`MP3 download size: ${size} bytes`);
  });
});
