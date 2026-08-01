import { test } from "@playwright/test";

test.describe("Kokoro TTS Diagnostics", () => {
  test.setTimeout(300000);

  test("capture all console output during Generate", async ({ page }) => {
    const consoleMessages: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      console.log(text);
    });

    page.on("pageerror", (err) => {
      pageErrors.push(`${err.message}\n${err.stack}`);
      console.log(`[PAGE ERROR] ${err.message}\n${err.stack}`);
    });

    await page.goto("/voice");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000);

    // Select a voice
    await page.locator('[data-testid="voice-select"]').click();
    await page.getByRole("option", { name: /heart/i }).first().click();

    // Type text
    await page.locator("textarea").fill("Hello world, this is a test.");

    // Click Generate
    const generateBtn = page.getByRole("button", { name: /generate audio/i });
    await generateBtn.click();

    // Wait and capture all output
    await page.waitForTimeout(120000);

    // Capture final state
    const hasError = await page.locator("text=Speech generation").count();
    const hasDownload = await page.locator('[data-testid="tts-download"]').count();

    console.log("\n=== FINAL STATE ===");
    console.log(`Console messages: ${consoleMessages.length}`);
    console.log(`Page errors: ${pageErrors.length}`);
    console.log(`Has error message: ${hasError}`);
    console.log(`Has download element: ${hasDownload}`);

    // Get the error text if present
    if (hasError > 0) {
      const errorText = await page.locator("text=Speech generation").first().textContent();
      console.log(`Error text: ${errorText}`);
    }
  });
});
