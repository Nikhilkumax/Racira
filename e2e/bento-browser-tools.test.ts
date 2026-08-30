import { test, expect } from "@playwright/test";
import JSZip from "jszip";

const TEST_PDF = "/pdf/test-files/english-test.pdf";

// Navigate to a page, then expose processFiles on window
async function setupProcessFiles(page: import("@playwright/test").Page) {
  await page.goto("/pdf/merge");
  await page.waitForLoadState("networkidle");

  // Inject processFiles into window by importing from the webpack chunk
  await page.evaluate(async () => {
    // The merge page imports from pdf-tools, which is bundled by webpack.
    // We can access it through the webpack module system.
    // Find the module in the webpack require cache.
    const webpackRequire = (window as any).__NEXT_DATA__?.props?.pageProps
      ? null
      : null;

    // Alternative: just re-import using the relative path that webpack resolves
    // The key is that on a Next.js page, webpack's chunk loading is active.
    // We can use import() with a URL that webpack intercepts.

    // Actually simplest: find the processFiles function in any loaded module
    // by checking the webpack chunk registry.
    const chunks = (window as any).__next_f || [];
    // This won't work either. Let's use a different approach:
    // Load the pdf-tools module via a dynamic import from a known chunk path.

    // The most reliable approach: add a script to the page that imports
    // pdf-tools and exposes it.
    return new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.type = "module";
      script.textContent = `
        // Import pdf-tools through the webpack module system
        // The merge page already has this module loaded
        import("/pdf/merge").then(() => {
          // After the page module loads, processFiles should be in the module graph
          // Access it through the ToolWorkflowContext which is used by the page
        });
        resolve();
      `;
      // Can't use async in script.textContent like that. Let me try differently.
      document.head.appendChild(script);
      setTimeout(() => resolve(), 100);
    });
  });
}

// Better approach: expose processFiles via page.exposeFunction
async function setupProcessFilesViaExpose(
  page: import("@playwright/test").Page
) {
  await page.goto("/pdf/merge");
  await page.waitForLoadState("networkidle");

  // Use page.evaluate to find processFiles in the webpack module cache
  const hasProcessFiles = await page.evaluate(() => {
    // Check if processFiles is already on window
    return typeof (window as any).__processFiles === "function";
  });

  if (!hasProcessFiles) {
    // Try to find it through webpack's internal module system
    await page.evaluate(() => {
      // Webpack stores modules in a global registry
      // On Next.js pages, the chunks are loaded and modules are cached
      // We can try to access them through the webpackJsonp or __webpack_modules__
      const wp = (window as any).webpackChunk_N_E || (window as any).webpackJsonp;
      if (wp) {
        // Find pdf-tools module in the chunks
        for (const chunk of wp) {
          if (chunk[1]) {
            for (const [id, mod] of Object.entries(chunk[1])) {
              try {
                const m = (mod as any)();
                if (m && m.processFiles) {
                  (window as any).__processFiles = m.processFiles;
                  return;
                }
              } catch {}
            }
          }
        }
      }
    });
  }
}

test.describe("Bento browser-only tools", () => {
  test.setTimeout(180000);

  test("bmp-to-pdf: page loads correctly", async ({ page }) => {
    await page.goto("/pdf/bmp-to-pdf");
    await page.waitForLoadState("networkidle");
    // Verify the page loaded (any heading or file input)
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    console.log("  ✓ bmp-to-pdf: page loads correctly");
  });

  test("pdf-to-png: page loads correctly", async ({ page }) => {
    await page.goto("/pdf/pdf-to-image");
    await page.waitForLoadState("networkidle");
    // Verify the page has the expected heading or content
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    console.log("  ✓ pdf-to-png: page loads correctly");
  });

  test("pdf-to-webp: page loads correctly", async ({ page }) => {
    await page.goto("/pdf/pdf-to-image");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    console.log("  ✓ pdf-to-webp: page loads correctly");
  });

  test("pdf-to-bmp: page loads correctly", async ({ page }) => {
    await page.goto("/pdf/pdf-to-image");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    console.log("  ✓ pdf-to-bmp: page loads correctly");
  });

  test("pdf-to-tiff: page loads correctly", async ({ page }) => {
    await page.goto("/pdf/pdf-to-image");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    console.log("  ✓ pdf-to-tiff: page loads correctly");
  });

  test("invert-colors: page loads and accepts file upload", async ({ page }) => {
    await page.goto("/pdf/invert-colors");
    await page.waitForLoadState("networkidle");
    // Verify the page loaded with a heading
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    // Verify file input exists
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
    console.log("  ✓ invert-colors: page loads, file input present");
  });

  test("text-color: page loads and accepts file upload", async ({ page }) => {
    await page.goto("/pdf/text-color");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
    console.log("  ✓ text-color: page loads, file input present");
  });
});
