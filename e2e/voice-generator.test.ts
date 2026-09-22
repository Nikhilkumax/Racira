import { test, expect } from "@playwright/test";

// Voice studio end-to-end. The first generation for a voice downloads its
// model, so the generous timeouts below are deliberate — later runs in the
// same browser profile reuse the copy already saved on the device.
test.describe("Voice Studio", () => {
  test.setTimeout(300000);

  test("page loads and the studio renders", async ({ page }) => {
    await page.goto("/voice");

    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.locator('[data-testid="language-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="gender-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="voice-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="format-select"]')).toBeVisible();
  });

  test("defaults, stacked fields, and single-gender fallback", async ({ page }) => {
    await page.goto("/voice");

    // Fresh-load defaults: English (US) / Male / Ryan (standard) / WAV.
    await expect(page.locator('[data-testid="language-select"]')).toContainText(
      /united states/i,
    );
    await expect(page.locator('[data-testid="gender-select"]')).toContainText(/male/i);
    await expect(page.locator('[data-testid="voice-select"]')).toContainText(/Ryan/);
    await expect(page.locator('[data-testid="format-select"]')).toContainText(/WAV/i);

    // Georgian ships a single female voice: switching there flips Gender to the
    // available one and pre-picks Natia, so the Voice dropdown is never empty.
    await page.locator('[data-testid="language-select"]').click();
    await page.getByRole("option", { name: /georgian/i }).click();
    await expect(page.locator('[data-testid="gender-select"]')).toContainText(/female/i);
    await expect(page.locator('[data-testid="voice-select"]')).toContainText(/Natia/i);

    // ...and the unavailable gender is visibly disabled, not selectable-but-
    // useless. "Female" also substring-matches "Male", so match exactly.
    await page.locator('[data-testid="gender-select"]').click();
    await expect(page.getByRole("option", { name: "Male", exact: true })).toBeDisabled();
    await page.keyboard.press("Escape");
  });

  test("US English female voice → generate → download (WAV)", async ({ page }) => {
    await page.goto("/voice");

    // 1. Generate is unavailable until there is both a voice and text.
    const generateBtn = page.getByRole("button", { name: /generate audio/i });
    await expect(generateBtn).toBeDisabled();

    // 2. The default gender is Male; Amy is Female, so switch and pick her.
    //    (Exact match: "Female" substring-matches "Male".)
    await page.locator('[data-testid="gender-select"]').click();
    await page.getByRole("option", { name: "Female", exact: true }).click();
    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /amy/i }).first().click();

    // 2b. WAV is the default format, so this test also covers that the default
    //     really is WAV — no format interaction is needed.

    // 3. Type the script.
    await page.locator("textarea").fill("Hello world, this is a test.");
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });

    // 4. Generate.
    await generateBtn.click();

    // 5. The player only appears once a finished clip exists.
    await page
      .locator('[data-testid="tts-download"]')
      .waitFor({ state: "attached", timeout: 240000 });

    // 6. The audio element is bound to a blob.
    const audioEl = page.locator('[data-testid="tts-audio"]');
    await expect(audioEl).toHaveAttribute("src", /^blob:/, { timeout: 5000 });

    // 7. The model is now reported as saved on this device (OPFS).
    await expect(page.locator('[data-testid="tts-stored-voices"]')).toContainText(
      /saved on this device/i,
      { timeout: 15000 },
    );

    // 8. Download resolves to a real WAV.
    const downloadLink = page.locator('[data-testid="tts-download"]');
    await expect(downloadLink).toHaveAttribute("href", /^blob:/);
    expect(await downloadLink.getAttribute("download")).toMatch(/\.wav$/);

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      downloadLink.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.wav$/);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(chunk);
    const bytes = Buffer.concat(chunks);
    expect(bytes.length).toBeGreaterThan(1000);

    // RIFF/WAVE magic — proves the concatenated output is a single valid file
    // rather than a stack of chunks with headers at every seam.
    expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(bytes.subarray(8, 12).toString("ascii")).toBe("WAVE");
  });

  test("UK English female voice → generate → download (MP3)", async ({ page }) => {
    await page.goto("/voice");

    const generateBtn = page.getByRole("button", { name: /generate audio/i });

    // Switch language first: the voice list is scoped to the language, and the
    // picker pre-selects the first male voice there. Alba is Female, so switch
    // gender and pick her.
    await page.locator('[data-testid="language-select"]').click();
    await page.getByRole("option", { name: /united kingdom/i }).click();

    await page.locator('[data-testid="gender-select"]').click();
    await page.getByRole("option", { name: "Female", exact: true }).click();

    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /alba/i }).first().click();

    await page.locator("textarea").fill("Testing with a British voice.");

    // WAV is the default now, so MP3 has to be chosen explicitly.
    await page.locator('[data-testid="format-select"]').click();
    await page.getByRole("option", { name: /mp3/i }).click();

    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();

    await page
      .locator('[data-testid="tts-download"]')
      .waitFor({ state: "attached", timeout: 240000 });

    const downloadLink = page.locator('[data-testid="tts-download"]');
    expect(await downloadLink.getAttribute("download")).toMatch(/\.mp3$/);

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      downloadLink.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.mp3$/);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(chunk);
    const bytes = Buffer.concat(chunks);
    expect(bytes.length).toBeGreaterThan(1000);

    // MPEG frame sync (11 set bits) with an MPEG-1 Layer III header.
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1] & 0xe0).toBe(0xe0);
  });

  test("long input is announced as multiple parts and generates one file", async ({ page }) => {
    await page.goto("/voice");

    const generateBtn = page.getByRole("button", { name: /generate audio/i });

    await page.locator('[data-testid="gender-select"]').click();
    await page.getByRole("option", { name: "Female", exact: true }).click();
    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /amy/i }).first().click();

    // 2b. This test asserts WAV seam logic, so WAV is chosen explicitly rather
    // than inherited from the default.
    await page.locator('[data-testid="format-select"]').click();
    await page.getByRole("option", { name: /wav/i }).click();

    // Comfortably past one part (the engine caps a part at 400 characters), so
    // this exercises the chunker and the WAV concatenation seam logic.
    const sentence =
      "The quick brown fox jumps over the lazy dog while the orchestra tunes in the pit. ";
    await page.locator("textarea").fill(sentence.repeat(20));

    const estimate = page.locator('[data-testid="tts-chunk-estimate"]');
    await expect(estimate).toBeVisible({ timeout: 5000 });
    await expect(estimate).toContainText(/generates in \d+ parts/i);

    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();

    // The stepped part bar is shown while parts are in flight. The wait has to
    // cover the first-run model download, because that is what precedes the
    // first part: the bar cannot appear until the voice is on the device. A
    // cold context fetches ~60 MB here (and the assertion below budgets 240s
    // for the run that follows), so a 20s window measured the visitor's
    // connection rather than the UI. Warm, the bar appears in ~3s.
    await expect(page.locator('[data-testid="tts-chunk-progress"]')).toBeVisible({
      timeout: 120000,
    });

    // ...and the run still ends in exactly one downloadable file.
    await page
      .locator('[data-testid="tts-download"]')
      .waitFor({ state: "attached", timeout: 240000 });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      page.locator('[data-testid="tts-download"]').click(),
    ]);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(chunk);
    const bytes = Buffer.concat(chunks);
    expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(bytes.subarray(8, 12).toString("ascii")).toBe("WAVE");
  });
});
