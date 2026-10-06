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
    await expect(page.locator('[data-testid="voice-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="format-select"]')).toBeVisible();
  });

  test("carries a gender-labelled voice, a named recommendation and a speed badge", async ({ page }) => {
    await page.goto("/voice");

    // The label is built from the catalog's own fields, so the gender and the
    // quality tier both have to be in it — and the tier words come from the
    // display mapping, never from the catalog.
    await expect(page.locator('[data-testid="voice-select"]')).toContainText(/\(Male\) — Good/);

    // The recommended mark is a glyph, so it carries its own accessible name
    // rather than being a star a screen reader has no word for.
    await expect(
      page.locator('[data-testid="voice-select"] [role="img"][aria-label="Recommended"]'),
    ).toHaveCount(1);

    // The hint under the voice select names the speed tier in words rather than
    // by colour. The estimate only appears once there is text to estimate.
    await expect(page.locator('[data-testid="tts-speed-badge"]')).toHaveText(
      /^(Faster generation speed|Medium generation speed|Slower generation speed)$/,
    );
    await expect(page.locator('[data-testid="tts-time-estimate"]')).toHaveCount(0);

    // No download size is shown in any state, and no field is left in the
    // catalog to show one from. The hint reports what is on the device.
    await expect(page.locator('[data-testid="tts-download-size"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tts-voice-hint"]')).not.toContainText(
      /MB|First use|downloads/i,
    );

    await page.locator("textarea").fill("A short line.");
    await expect(page.locator('[data-testid="tts-time-estimate"]')).toContainText(
      /about .+ s for your text/i,
    );
  });

  test("quality levels read Best, Good and Basic — never the internal tiers", async ({
    page,
  }) => {
    await page.goto("/voice");

    const options = page.locator('[role="option"]');

    /** "Amy (Female) — Good" -> { name, gender, rank } */
    const parse = (label: string) => {
      const match = /^(.+?) \((Female|Male)\) — (Best|Good|Basic)$/.exec(label);
      expect(match, `unexpected voice label: ${label}`).not.toBeNull();
      const [, name, gender, word] = match!;
      return { name, gender, rank: ["Best", "Good", "Basic"].indexOf(word) };
    };

    // Open the longest language list: 24 voices, grouped by gender.
    await page.locator('[data-testid="voice-select"]').click();
    await expect(options.first()).toBeVisible();
    const labels = await options.allInnerTexts();

    // Only the three display words, never a raw tier key and never one of the
    // words the tiers used to read.
    for (const label of labels) {
      expect(label.replace(/ ★$/, "")).toMatch(/— (Best|Good|Basic)$/);
      expect(label).not.toMatch(/x_low|Very light|High fidelity|Standard|\bLight\b/);
    }
    for (const word of ["Best", "Good", "Basic"]) {
      expect(labels.some((label) => label.includes(word))).toBe(true);
    }

    // Recommended voices lead within each group, in one unbroken run per group.
    // The list is grouped by gender for a language this long, and a group can
    // only be ordered relative to itself, so the starred run restarts at the
    // top of each group rather than running across the whole list.
    for (const gender of ["Female", "Male"] as const) {
      const flags = labels
        .filter((label) => label.includes(`(${gender})`))
        .map((label) => label.endsWith("★"));
      const firstUnstarred = flags.indexOf(false);
      if (firstUnstarred !== -1) {
        expect(
          firstUnstarred,
          `${gender} group does not lead with its recommended voices`,
        ).toBe(flags.filter(Boolean).length);
      }
    }

    // Within each gender, everything after the recommended run is ordered
    // Best, then Good, then Basic, and by name inside a tier. The
    // recommended run is excluded because it precedes both genders by design.
    for (const gender of ["Female", "Male"] as const) {
      const rest = labels
        .filter((label) => !label.endsWith("★") && label.includes(`(${gender})`))
        .map(parse);
      expect(rest.length).toBeGreaterThan(0);
      for (let i = 1; i < rest.length; i++) {
        const previous = rest[i - 1];
        const current = rest[i];
        const ordered =
          current.rank > previous.rank ||
          (current.rank === previous.rank && current.name.localeCompare(previous.name) >= 0);
        expect(
          ordered,
          `${gender} group out of order: ${previous.name}/${previous.rank} then ${current.name}/${current.rank}`,
        ).toBe(true);
      }
    }

    await page.keyboard.press("Escape");

    // A language whose two lightest tiers are both present: Vietnamese has a
    // `low` voice (Linh) and an `x_low` one (Hoa), and they must sort together
    // by name rather than apart by the tier they came from.
    await page.locator('[data-testid="language-select"]').click();
    await page.getByRole("option", { name: "Vietnamese (Vietnam)", exact: true }).click();
    await page.locator('[data-testid="voice-select"]').click();
    const vietnamese = await options.allInnerTexts();
    expect(vietnamese).toEqual([
      "Hoa (Female) — Basic",
      "Linh (Female) — Basic",
      "Minh (Male) — Good",
    ]);

    await page.keyboard.press("Escape");
  });

  test("defaults, stacked fields, and single-voice language", async ({ page }) => {
    await page.goto("/voice");

    // Fresh-load defaults: English (US) / Ryan (Good) / MP3.
    await expect(page.locator('[data-testid="language-select"]')).toContainText(
      /united states/i,
    );
    await expect(page.locator('[data-testid="voice-select"]')).toContainText(/Ryan/);
    await expect(page.locator('[data-testid="format-select"]')).toContainText(/MP3/i);

    // Georgian ships a single voice: switching there selects Natia on its own,
    // so the Voice dropdown is never empty and never holds a stale id.
    await page.locator('[data-testid="language-select"]').click();
    await page.getByRole("option", { name: /georgian/i }).click();
    await expect(page.locator('[data-testid="voice-select"]')).toContainText(/Natia/i);

    // The dropdown stays rendered even though there is nothing else to choose.
    await expect(page.locator('[data-testid="voice-select"]')).toBeVisible();
  });

  test("newly exposed catalog voices are selectable", async ({ page }) => {
    await page.goto("/voice");

    // These ids come from the engine's PATH_MAP but are absent from the
    // library's VoiceId union, so a catalog generated from the union alone left
    // them unreachable. No model is downloaded here — this only guards that the
    // picker still offers them, which is what a regeneration could silently
    // drop.
    // Italian now ships a Good-tier voice (Paola) next to the Basic-tier
    // Riccardo; the language switch resolves to Paola, and that resolution is
    // as much of the assertion as her presence.
    await page.locator('[data-testid="language-select"]').click();
    await page.getByRole("option", { name: "Italian (Italy)", exact: true }).click();
    await expect(page.locator('[data-testid="voice-select"]')).toContainText(/Paola/);

    // Welsh is a whole language the union-derived catalog omitted; it has a
    // single voice, so switching to it selects that voice on its own.
    await page.locator('[data-testid="language-select"]').click();
    await page.getByRole("option", { name: "Welsh", exact: true }).click();
    await expect(page.locator('[data-testid="voice-select"]')).toContainText(/Owain/);
  });

  test("long text with the best-quality voice shows the long-text tip", async ({ page }) => {
    await page.goto("/voice");

    const tip = page.locator('[data-testid="tts-long-text-tip"]');
    // 3,600 characters — past the named threshold, comfortably under the cap.
    await page.locator("textarea").fill("The quick brown fox jumps over the lazy dog. ".repeat(80));

    // A Good voice reads this in a couple of minutes at most, which is not
    // worth warning about.
    await expect(tip).toHaveCount(0);

    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /ryan \(male\) — best/i }).first().click();

    await expect(tip).toHaveText(
      "Long text with a Best-quality voice can take a while. A Good voice is faster.",
    );

    // Shorter text drops the tip with the same voice selected: the threshold is
    // what turns it on, not the voice alone.
    await page.locator("textarea").fill("Short enough.");
    await expect(tip).toHaveCount(0);
  });

  test("speed badge fits its panel without clipping at desktop and mobile widths", async ({
    page,
  }) => {
    await page.goto("/voice");

    const badge = page.locator('[data-testid="tts-speed-badge"]');
    const estimate = page.locator('[data-testid="tts-time-estimate"]');
    const hint = page.locator('[data-testid="tts-voice-hint"]');
    await page.locator("textarea").fill("A short line to estimate.");

    /** The panel the badge lives in, and whether anything overflowed it. */
    const measure = async (expected: string) => {
      await expect(badge).toHaveText(expected);
      expect(await badge.evaluate((el) => el.scrollWidth > el.clientWidth + 1)).toBe(false);
      const overflow = await hint.evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(overflow, `${expected} overflows the panel by ${overflow}px`).toBeLessThanOrEqual(1);

      // Beside the badge, or on its own line beneath it — never overlapping or
      // clipped. The row wraps rather than squeezing either one. "Same line" is
      // a vertical overlap rather than equal tops: the row is centre-aligned, so
      // two items sharing a line have different tops when their heights differ.
      const geometry = await page.evaluate(() => {
        const b = document.querySelector('[data-testid="tts-speed-badge"]')!.getBoundingClientRect();
        const e = document.querySelector('[data-testid="tts-time-estimate"]')!.getBoundingClientRect();
        const overlapsVertically = Math.min(b.bottom, e.bottom) - Math.max(b.top, e.top) > 0;
        return { sameLine: overlapsVertically, below: e.top >= b.bottom - 2 };
      });
      expect(geometry.sameLine || geometry.below).toBe(true);
    };

    // The panel width at whatever desktop size this runner uses. The badge has
    // to fit it, not a number picked here.
    const widePanel = await hint.evaluate((el) => el.clientWidth);
    expect(widePanel).toBeGreaterThan(300);

    // One voice per tier: the three phrases, longest last.
    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /^Amy \(Female\) — Basic$/ }).first().click();
    await measure("Faster generation speed");

    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /^Amy \(Female\) — Good/ }).first().click();
    await measure("Medium generation speed");

    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /^Ryan \(Male\) — Best/ }).first().click();
    await measure("Slower generation speed");

    // The narrower desktop panel the spec asks about, about 360 px — a 1100 px
    // viewport puts the panel just above that.
    await page.setViewportSize({ width: 1100, height: 800 });
    const narrowPanel = await hint.evaluate((el) => el.clientWidth);
    expect(narrowPanel, `panel was ${narrowPanel}px`).toBeGreaterThan(330);
    expect(narrowPanel).toBeLessThan(400);
    expect(await badge.evaluate((el) => el.scrollWidth > el.clientWidth + 1)).toBe(false);
    expect(await hint.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);

    // Narrow mobile layout: whatever it takes to fit, nothing is clipped, and
    // the estimate may drop to its own line below the badge.
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(badge).toBeVisible();
    await expect(estimate).toBeVisible();
    expect(await badge.evaluate((el) => el.scrollWidth > el.clientWidth + 1)).toBe(false);
    const mobileOverflow = await hint.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(mobileOverflow).toBeLessThanOrEqual(1);
    const mobileGeometry = await page.evaluate(() => {
      const b = document.querySelector('[data-testid="tts-speed-badge"]')!.getBoundingClientRect();
      const e = document.querySelector('[data-testid="tts-time-estimate"]')!.getBoundingClientRect();
      return {
        insideViewport: b.left >= 0 && b.right <= window.innerWidth + 1,
        sameLine: Math.min(b.bottom, e.bottom) - Math.max(b.top, e.top) > 0,
        below: e.top >= b.bottom - 2,
      };
    });
    expect(mobileGeometry.insideViewport).toBe(true);
    expect(mobileGeometry.sameLine || mobileGeometry.below).toBe(true);
  });

  test("US English female voice → generate → download (default MP3)", async ({ page }) => {
    await page.goto("/voice");

    // 1. Generate is unavailable until there is both a voice and text.
    const generateBtn = page.getByRole("button", { name: /generate audio/i });
    await expect(generateBtn).toBeDisabled();

    // 2. Pick Amy. The list is no longer gender-filtered, so one selection is
    //    enough; the sorted order puts her Good model first.
    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /amy/i }).first().click();

    // 2b. MP3 is the default format, so this test also covers that the default
    //     really is MP3 — no format interaction is needed.

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

    // 8. Download resolves to a real MP3.
    const downloadLink = page.locator('[data-testid="tts-download"]');
    await expect(downloadLink).toHaveAttribute("href", /^blob:/);
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

    // MPEG frame sync (11 set bits) with an MPEG-1 Layer III header — proves the
    // default really went through the encoder rather than falling back to WAV.
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1] & 0xe0).toBe(0xe0);
  });

  test("UK English female voice → generate → download (MP3)", async ({ page }) => {
    await page.goto("/voice");

    const generateBtn = page.getByRole("button", { name: /generate audio/i });

    // Switch language first: the voice list is scoped to the language, so Alba
    // only exists once English (UK) is selected.
    await page.locator('[data-testid="language-select"]').click();
    await page.getByRole("option", { name: /united kingdom/i }).click();

    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /alba/i }).first().click();

    await page.locator("textarea").fill("Testing with a British voice.");

    // MP3 is the default, so choosing it explicitly exercises the select's own
    // wiring rather than the initial state.
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

    // The progress bar, its percentage and a Cancel button are shown while the
    // run is in flight. The wait has to cover the first-run model download,
    // because that is what precedes the first part: the bar cannot appear until
    // the voice is on the device. A cold context fetches ~60 MB here (and the
    // assertion below budgets 240s for the run that follows), so a 20s window
    // measured the visitor's connection rather than the UI. Warm, the bar
    // appears in ~3s.
    const progress = page.locator('[data-testid="tts-generation-progress"]');
    await expect(progress).toBeVisible({ timeout: 120000 });
    await expect(page.locator('[data-testid="tts-progress-percent"]')).toContainText(/\d+%/);
    await expect(page.locator('[data-testid="tts-time-left"]')).toContainText(
      /keep this tab open/i,
    );
    await expect(page.locator('[data-testid="tts-cancel"]')).toBeVisible();

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
