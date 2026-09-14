/**
 * cad-domain-prechecks.test.ts — the GD&T library's two render pre-checks
 * (invisible shapes, clipped diagram labels) extended to the ENTIRE CAD
 * domain: index, all 10 category pages, and every live tool page.
 *
 * Background: both defect classes were first caught inside the GD&T library
 * (rule-1 envelope shipped with its whole figure invisible; seven label
 * clippings were found only by manual inspection). The pre-checks in
 * cad-gdt-library.test.ts sweep the /cad/gdt content routes, but the tool
 * components under src/domains/cad/components/tools/ draw their own SVGs
 * (diagrams, samples, previews) and were only ever covered by one-off audit
 * sweeps. This file makes the sweep permanent and registry-derived: routes
 * are resolved from src/domains/cad/registry.ts ACTIVE_SLUGS at run time, so
 * every future tool batch is automatically covered the day it goes live.
 *
 * Same rules as the originals:
 *   - invisible shape: a <line> computes to stroke:none (lines paint only via
 *     stroke), or any other shape computes to stroke:none AND fill:none.
 *     Root cause class: className="text-*" without stroke="currentColor" —
 *     Tailwind generates .stroke-* rules only for classes actually used, and
 *     text-* sets color, which SVG shapes do not stroke with.
 *   - clipped label: a <text> whose getBBox() extends past its SVG's own
 *     viewBox (2px tolerance for stroke centers / descenders).
 *   - horizontal overflow of the document at mobile/tablet/desktop widths.
 *
 * Diagram SVGs are identified by role="img" with an aria-label — the
 * convention every GdntDiagram renderer follows — so page furniture (glyphs,
 * icons, logos) is never swept. Clipping is additionally checked on ALL svgs
 * that carry a viewBox (icon-level text is rare but possible).
 */
import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

const BASE = "http://localhost:3002";
// Playwright runs from the config directory (racira-nextjs root).
const ROOT = process.cwd();

// ── Resolve routes from the CAD registry (ground truth, no hardcoded list) ──
function resolveCadRoutes(): { index: string; cats: string[]; tools: string[] } {
  const regSrc = readFileSync(resolve(ROOT, "src/domains/cad/registry.ts"), "utf-8");
  const toSlug = (t: string) =>
    t.toLowerCase().replace(/&/g, "and").replace(/\//g, "-")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const categories: { title: string; tools: string[] }[] = [];
  let currentCat: { title: string; tools: string[] } | null = null;
  for (const line of regSrc.split(/\r?\n/)) {
    const catMatch = line.match(/cat\("([^"]+)",\s*\[/);
    if (catMatch) {
      currentCat = { title: catMatch[1], tools: [] };
      categories.push(currentCat);
      continue;
    }
    const toolMatch = line.match(/\[\s*"([^"]+)",\s*"[^"]*"\s*\]/);
    if (toolMatch && currentCat) currentCat.tools.push(toSlug(toolMatch[1]));
  }
  const activeBody = (regSrc.match(/const ACTIVE_SLUGS = new Set\(\[([\s\S]*?)\]\)/) ?? ["", ""])[1]
    .replace(/\/\/[^\r\n]*/g, "");
  const active = new Set(
    activeBody.split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean)
  );
  const cats = categories.map((c) => `/cad/${toSlug(c.title)}`);
  const tools: string[] = [];
  for (const c of categories) {
    for (const slug of c.tools) {
      if (active.has(slug)) tools.push(`/cad/${slug}`);
    }
  }
  return { index: "/cad", cats, tools };
}

const { index, cats, tools } = resolveCadRoutes();
if (tools.length < 60) {
  // Guard against a parsing regression silently shrinking the sweep.
  throw new Error(`cad-domain-prechecks: registry parse found only ${tools.length} live tools — refusing to sweep a truncated list`);
}

const ALL_ROUTES = [index, ...cats, ...tools];

test.describe("CAD domain-wide render pre-checks", () => {
  test.setTimeout(240_000);

  test("no shape computes to stroke:none AND fill:none on any CAD route", async ({ page }) => {
    const violations: string[] = [];
    for (const route of ALL_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      const found = await page.evaluate(() => {
        const out: string[] = [];
        document.querySelectorAll("svg").forEach((svg) => {
          const label = svg.getAttribute("aria-label") ?? "";
          svg.querySelectorAll("line, rect, path, circle, ellipse, polygon").forEach((el) => {
            const cs = getComputedStyle(el);
            const stroke = cs.stroke;
            const fill = cs.fill;
            const paintsStroke = stroke && stroke !== "none";
            const paintsFill = fill && fill !== "none" && fill !== "transparent";
            const isLine = el.tagName.toLowerCase() === "line";
            const invisible = isLine ? !paintsStroke : !paintsStroke && !paintsFill;
            if (invisible) {
              out.push(
                `${el.tagName.toLowerCase()} [${(el.getAttribute("class") ?? "").slice(0, 40)}] [${label.slice(0, 60)}]`
              );
            }
          });
        });
        return out;
      });
      for (const v of found ?? []) violations.push(`${route}: ${v}`);
    }
    expect(violations, `invisible shapes (no stroke, no fill):\n${violations.join("\n")}`).toEqual([]);
  });

  test("no <text> bbox extends past its SVG viewBox on any CAD route", async ({ page }) => {
    const violations: string[] = [];
    for (const route of ALL_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      const found = await page.evaluate(() => {
        const out: string[] = [];
        const TOL = 2; // px of slack for stroke centers / descenders
        document.querySelectorAll("svg").forEach((svg) => {
          const label = svg.getAttribute("aria-label") ?? "";
          const vb = (svg as SVGSVGElement).viewBox?.baseVal;
          if (!vb || !vb.width || !vb.height) return; // no viewBox to clip against
          svg.querySelectorAll("text").forEach((t) => {
            let b: DOMRect;
            try {
              b = (t as SVGTextElement).getBBox();
            } catch {
              return; // element not rendered (e.g. display:none) — nothing to check
            }
            if (b.width === 0 && b.height === 0) return; // empty text node
            const clips: string[] = [];
            if (b.x < vb.x - TOL) clips.push(`left ${b.x.toFixed(1)} < ${vb.x}`);
            if (b.x + b.width > vb.x + vb.width + TOL) clips.push(`right ${(b.x + b.width).toFixed(1)} > ${vb.x + vb.width}`);
            if (b.y < vb.y - TOL) clips.push(`top ${b.y.toFixed(1)} < ${vb.y}`);
            if (b.y + b.height > vb.y + vb.height + TOL) clips.push(`bottom ${(b.y + b.height).toFixed(1)} > ${vb.y + vb.height}`);
            if (clips.length) {
              out.push(`${t.textContent?.slice(0, 40) ?? ""} → ${clips.join("; ")} [${label.slice(0, 60)}]`);
            }
          });
        });
        return out;
      });
      for (const v of found ?? []) violations.push(`${route}: ${v}`);
    }
    expect(violations, `clipped diagram text:\n${violations.join("\n")}`).toEqual([]);
  });

  for (const width of [375, 1440]) {
    test(`no horizontal overflow at ${width}px across index + categories + all live tool pages`, async ({ page }) => {
      const violations: string[] = [];
      for (const route of ALL_ROUTES) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        if (overflow > 1) violations.push(`${route}: ${overflow}px`);
      }
      expect(violations, `horizontal overflow at ${width}px:\n${violations.join("\n")}`).toEqual([]);
    });
  }
});
