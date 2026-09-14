/**
 * scale-paper-tool.test.ts — guards the paper-size dropdown on
 * /cad/scale-paper-tool against the four defect classes it was rebuilt for.
 *
 * Background: the dropdown previously carried the same physical sheet twice
 * under two labels (ANSI B "Tabloid" and a separate "Ledger" row — identical
 * once orientation is normalised), grouped its families inconsistently, mixed
 * two label formats, and put 100+ rows behind a plain native <select>. The
 * catalog now lives in PAPER_SIZES with one row per physical sheet, aliases
 * folded into a single label, a derived canonical label format, and a
 * type-to-filter combobox.
 *
 * These checks are written to be **growth-tolerant but removal-sensitive**:
 * adding a size or a family must not break them, but deleting one, re-introducing
 * a duplicate, or drifting from the canonical label format must.
 *
 * Two things worth knowing when maintaining this file:
 *   - Group headers are uppercased by CSS, so compare them case-insensitively.
 *   - The route is dev-compiled on demand and React hydrates after the HTML
 *     lands, so the first click can hit dead markup. openList() retries.
 */
import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:3002";
const ROUTE = `${BASE}/cad/scale-paper-tool`;

/** Every family must still render a group header (adding one is fine). */
const EXPECTED_GROUPS = [
  "ISO A",
  "ISO B",
  "ISO C",
  "Traditional / Imperial",
  "ANSI/US",
  "ARCH",
  "JIS B",
  "Photo Sizes",
  "RA Series",
  "SRA Series",
  "PA",
  "F Series",
  "Custom",
];

/** The synthetic user-defined row. Not catalog data — see the dedupe test. */
const CUSTOM_ID = "custom";

/** The one canonical label format: "Name — W × H mm". */
const CANONICAL = /^.+ — \d+(?:\.\d+)? × \d+(?:\.\d+)? mm$/;

/**
 * Open the baseline combobox. Clicks are retried because React may not have
 * hydrated yet on a freshly dev-compiled route.
 */
async function openList(page: Page) {
  const input = page.locator('[data-testid="in-base"]');
  await expect(input).toBeVisible();
  const listbox = page.locator('[role="listbox"]').first();
  for (let i = 0; i < 40; i++) {
    await input.click();
    if (await listbox.isVisible().catch(() => false)) return;
    await page.waitForTimeout(1000);
  }
  throw new Error("paper-size listbox never opened");
}

/** Option rows with their stable ids, so the synthetic row can be told apart. */
async function optionRows(page: Page): Promise<{ id: string; label: string }[]> {
  return page.locator('[role="listbox"] [role="option"]').evaluateAll((els) =>
    els.map((el) => ({
      id: el.getAttribute("data-option-id") ?? "",
      label: (el as HTMLElement).innerText,
    })),
  );
}

async function optionLabels(page: Page): Promise<string[]> {
  return (await optionRows(page)).map((r) => r.label);
}

async function groupHeaders(page: Page): Promise<string[]> {
  const raw = await page.locator('[role="listbox"] [role="presentation"]').allInnerTexts();
  return raw.map((h) => h.trim().toLowerCase());
}

/** "A4 — 210 × 297 mm" → "210x297" (orientation-normalised). */
function normalise(label: string): string {
  const m = label.match(/(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)\s*mm/);
  if (!m) throw new Error(`label does not carry dimensions: ${label}`);
  const [a, b] = [Number(m[1]), Number(m[2])];
  return `${Math.min(a, b)}x${Math.max(a, b)}`;
}

test.describe("Scale Paper Tool — paper size dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTE, { waitUntil: "load" });
  });

  test("renders both pickers with canonical labels", async ({ page }) => {
    await expect(page.locator('[data-testid="in-base"]')).toHaveValue("A3 — 297 × 420 mm");
    await expect(page.locator('[data-testid="in-comp"]')).toHaveValue("A4 — 210 × 297 mm");
  });

  test("every family renders a group header", async ({ page }) => {
    await openList(page);
    const headers = await groupHeaders(page);
    for (const g of EXPECTED_GROUPS) {
      expect(headers, `missing group header: ${g}`).toContain(g.toLowerCase());
    }
  });

  test("no physical size appears twice", async ({ page }) => {
    await openList(page);
    const rows = await optionRows(page);

    // The Custom row is user data, not catalog data: its dimensions are typed by
    // the user and may legitimately equal a standard size (210 × 297 is A4).
    // Every other row is catalog data and must be unique.
    const catalog = rows.filter((r) => r.id !== CUSTOM_ID);
    expect(catalog.length).toBeGreaterThan(100);
    expect(rows.length, "exactly one Custom row").toBe(catalog.length + 1);

    const labels = catalog.map((r) => r.label);
    expect(new Set(labels).size).toBe(labels.length);

    // …and so must the underlying sheets. Orientation is normalised because
    // Tabloid (279×432) and Ledger (432×279) are the same piece of paper.
    const seen = new Map<string, string>();
    for (const label of labels) {
      const key = normalise(label);
      const previous = seen.get(key);
      expect(previous, `duplicate sheet ${key}: "${previous}" and "${label}"`).toBeUndefined();
      seen.set(key, label);
    }
  });

  test("all labels use the one canonical format", async ({ page }) => {
    await openList(page);
    for (const label of await optionLabels(page)) {
      expect(label, `off-format label: ${label}`).toMatch(CANONICAL);
    }
  });

  test("typing filters the list", async ({ page }) => {
    const input = page.locator('[data-testid="in-base"]');
    await openList(page);
    const all = (await optionLabels(page)).length;

    await input.fill("letter");
    const letter = await optionLabels(page);
    expect(letter.length).toBeLessThan(all);
    expect(letter.some((l) => l.startsWith("Letter (ANSI A)"))).toBe(true);
    expect(letter.some((l) => l.startsWith("A4 "))).toBe(false);

    await input.fill("a4");
    expect((await optionLabels(page)).some((l) => l.startsWith("A4 "))).toBe(true);

    await input.fill("210");
    expect((await optionLabels(page)).some((l) => l.startsWith("A4 "))).toBe(true);
  });

  test("aliases for one sheet stay a single row", async ({ page }) => {
    const input = page.locator('[data-testid="in-base"]');
    await openList(page);
    await input.fill("ledger");
    const rows = await optionLabels(page);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatch(/^Tabloid \/ Ledger \(ANSI B\)/);
  });

  test("selecting by click and by keyboard commits the value", async ({ page }) => {
    const input = page.locator('[data-testid="in-base"]');

    await openList(page);
    // Target the row by id, not by position: substring search means unrelated
    // names can share the query (e.g. Executive "(Monarch…)" matches "arch").
    await input.fill("arch d");
    await page.locator('[role="listbox"] [data-option-id="ARCH-D"]').click();
    await expect(input).toHaveValue(/^ARCH D —/);
    await expect(page.locator('[role="listbox"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="res-width-pct"]')).toBeVisible();

    await openList(page);
    await input.fill("crown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue(/Crown —/);

    await openList(page);
    await page.keyboard.press("Escape");
    await expect(page.locator('[role="listbox"]')).toHaveCount(0);
  });

  test("shows an explanation when nothing matches", async ({ page }) => {
    await openList(page);
    await page.locator('[data-testid="in-base"]').fill("zzzz");
    await expect(page.locator('[role="listbox"] [role="option"]')).toHaveCount(0);
    await expect(page.locator('[role="listbox"]')).toContainText("No paper size matches");
  });

  test("custom size drives the comparison from typed dimensions", async ({ page }) => {
    const base = page.locator('[data-testid="in-base"]');
    const comp = page.locator('[data-testid="in-comp"]');
    const baseW = page.locator('[data-testid="in-base-w"]');
    const baseH = page.locator('[data-testid="in-base-h"]');
    const compW = page.locator('[data-testid="in-comp-w"]');
    const compH = page.locator('[data-testid="in-comp-h"]');

    // Neither side shows width/height fields until Custom is actually chosen.
    await expect(baseW).toHaveCount(0);
    await expect(compW).toHaveCount(0);
    await expect(base).toHaveValue(/^A3 —/);

    // Choosing Custom reveals the fields for that side only.
    await openList(page);
    await page.locator(`[role="listbox"] [data-option-id="${CUSTOM_ID}"]`).click();
    await expect(base).toHaveValue(/^Custom size — 210 × 297 mm$/);
    await expect(baseW).toBeVisible();
    await expect(baseH).toBeVisible();
    await expect(compW).toHaveCount(0);

    // Back to a standard baseline; make the COMPARISON the custom one.
    await openList(page);
    await page.locator('[role="listbox"] [data-option-id="A3"]').click();
    await expect(base).toHaveValue(/^A3 — 297 × 420 mm$/);
    await expect(baseW).toHaveCount(0);

    await comp.click();
    await comp.fill("custom");
    await page.locator(`[role="listbox"] [data-option-id="${CUSTOM_ID}"]`).click();
    await expect(comp).toHaveValue(/^Custom size — 210 × 297 mm$/);
    await expect(compW).toBeVisible();

    // 500 × 700 mm is larger than A3 on both axes.
    await compW.fill("500");
    await compH.fill("700");
    await expect(comp).toHaveValue(/^Custom size — 500 × 700 mm$/);
    await expect(page.locator('[data-testid="res-width-pct"]')).toContainText("+");
    await expect(page.locator('[data-testid="res-area-pct"]')).toContainText("+");

    // Fields are typed in the display unit, so switching units must re-express
    // the numbers rather than reinterpret them: 500 mm becomes 50 cm, and the
    // physical size — and therefore the label — is unchanged.
    await page.locator('[data-testid="in-unit"]').selectOption("cm");
    await expect(compW).toHaveValue("50");
    await expect(compH).toHaveValue("70");
    await expect(comp).toHaveValue(/^Custom size — 500 × 700 mm$/);

    // A non-positive dimension is unusable, and the UI must say so rather than
    // silently comparing against a zero-sized sheet.
    await compW.fill("0");
    await expect(page.getByText("Enter a width and height greater than 0")).toBeVisible();
  });

  test("opening the list highlights and scrolls to the current selection", async ({ page }) => {
    // Pick a row deep in the list so the open-scroll effect is observable —
    // the default A3 sits in the first viewport and would pass vacuously.
    await openList(page);
    await page.locator('[role="listbox"] [data-option-id="ARCH-D"]').click();
    await expect(page.locator('[data-testid="in-base"]')).toHaveValue(/^ARCH D —/);

    await openList(page);
    const active = page.locator('[role="listbox"] [role="option"][aria-active="true"]');
    await expect(active, "open must highlight the selected option").toHaveAttribute(
      "data-option-id",
      "ARCH-D",
    );

    // …and the highlight must have been scrolled into the listbox viewport.
    const inView = await active.evaluate((el) => {
      const list = el.closest('[role="listbox"]')!;
      const lr = list.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      return er.top >= lr.top && er.bottom <= lr.bottom;
    });
    expect(inView, "selected row must be scrolled into view on open").toBe(true);

    // Selected-value chip stays visible while the field is blank for typing.
    await expect(page.locator('[data-testid="chip-base"]')).toContainText("ARCH D");
  });

  test("Enter immediately after opening never commits an unrelated row", async ({ page }) => {
    // Regression: the highlight used to persist from the previous open, so an
    // immediate Enter could silently commit whatever was last active.
    await openList(page);
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-testid="in-base"]')).toHaveValue("A3 — 297 × 420 mm");
  });

  test("two independent Custom sizes are labelled by side", async ({ page }) => {
    const base = page.locator('[data-testid="in-base"]');
    const comp = page.locator('[data-testid="in-comp"]');

    await openList(page);
    await page.locator(`[role="listbox"] [data-option-id="${CUSTOM_ID}"]`).click();
    await page.locator('[data-testid="in-base-w"]').fill("500");
    await page.locator('[data-testid="in-base-h"]').fill("700");

    await comp.click();
    await comp.fill("custom");
    await page.locator(`[role="listbox"] [data-option-id="${CUSTOM_ID}"]`).click();
    await page.locator('[data-testid="in-comp-w"]').fill("900");
    await page.locator('[data-testid="in-comp-h"]').fill("1200");

    // Both info boxes would read "CUSTOM SIZE" — the headers must carry the
    // side tag the overlay legend chips already use.
    await expect(page.locator('[data-testid="dim-base-name"]')).toHaveText(/Baseline — Custom size/i);
    await expect(page.locator('[data-testid="dim-comp-name"]')).toHaveText(/Comparison — Custom size/i);

    // Stats-row labels must name each side too, not read (Custom → Custom).
    await expect(
      page.getByText("Width (Baseline — Custom size → Comparison — Custom size)"),
    ).toBeVisible();

    // A same-name preset pair (A3 vs A3) must get the same disambiguation.
    await openList(page);
    await page.locator('[role="listbox"] [data-option-id="A3"]').click();
    await comp.click();
    await comp.fill("a3");
    await page.locator('[role="listbox"] [data-option-id="A3"]').click();
    await expect(page.locator('[data-testid="dim-base-name"]')).toHaveText(/Baseline — A3/i);
    await expect(page.locator('[data-testid="dim-comp-name"]')).toHaveText(/Comparison — A3/i);
  });

  /**
   * Hydration guard. The server resolves to en-IN and browsers to en-US, so a
   * bare toLocaleString() in this component renders different text on each side
   * ("1,24,740" vs "124,740") and React throws.
   */
  test("hydrates without runtime errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(ROUTE, { waitUntil: "load" });
    await openList(page);
    await expect(page.locator('[data-testid="in-base"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
