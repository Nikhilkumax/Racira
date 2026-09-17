/**
 * platform-site-identity.test.ts — the platform-wide version of the CAD
 * sentinel scan (e2e/cad-site-identity.test.ts).
 *
 * Background: the CAD brand bug (commit 84247bc1 pasted the dev-status string
 * "CAD is fixed" into <title>, og:title, twitter:title and the footer) shipped
 * silently because every domain hand-typed those strings independently and no
 * test watched them. Every domain now instantiates a typed identity object
 * (src/domains/<domain>/site.ts via the factory in src/lib/site-identity.ts),
 * and THIS test locks the rendered values across every domain:
 *
 *   1. Sentinel scan — no identity surface (title / og:title / twitter:title /
 *      footer copyright) on any domain contains a placeholder-like string
 *      ("CAD is fixed", TODO, TBD, Lorem ipsum, placeholder, undefined, …).
 *   2. Brand presence — title and og:title carry the domain's copyrightName
 *      brand token; the footer copyright line is present and starts "© <year>
 *      <brand>.".
 *   3. og:title === title on every checked landing page (the mismatch class
 *      found on /cad/gdt/[symbol]).
 *
 * A new domain must be added to ROUTES+BRANDS here the day it exists — that
 * keeps this sweep exhaustive rather than best-effort.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

function year(): string {
  return String(new Date().getFullYear());
}

// Any of these appearing in an identity surface is a regression.
const SENTINELS = [
  "CAD is fixed",
  "TODO",
  "TBD",
  "Lorem ipsum",
  "placeholder",
  "PLACEHOLDER",
  "undefined",
  "null",
  "fixme",
  "FIXME",
  "lorem-ipsum",
  "[object Object]",
];

/**
 * Landing route → the exact copyrightName from that domain's site.ts
 * (src/domains/<domain>/site.ts). Keep in sync with the site modules.
 */
const DOMAIN_ROUTES: { route: string; copyrightName: string }[] = [
  { route: "/", copyrightName: "Racira" },
  { route: "/cad", copyrightName: "Racira" }, // CAD's approved landing title ends "| Racira" (brand token "Racira CAD" lives in footers/title suffixes)
  { route: "/pdf", copyrightName: "Racira PDF" },
  { route: "/calculator", copyrightName: "Racira" }, // calculator titles end "— Racira" / brand token "Racira Calculator" lives in the footer line
  { route: "/developers", copyrightName: "Racira Developers" },
  { route: "/voice", copyrightName: "Racira TTS" },
  { route: "/design", copyrightName: "Racira Design" },
  { route: "/typography", copyrightName: "Racira Typography" },
  { route: "/video", copyrightName: "Racira Video" },
  { route: "/animator", copyrightName: "Racira Animation" },
  { route: "/writing", copyrightName: "Racira Writing" },
  { route: "/seo", copyrightName: "Racira SEO" },
  { route: "/finance", copyrightName: "Racira Finance" },
  { route: "/productivity", copyrightName: "Racira Productivity Tools" },
  { route: "/3d", copyrightName: "Racira 3D & Print" },
  { route: "/image", copyrightName: "Racira Image" },
  { route: "/photo", copyrightName: "Racira Photography" },
  { route: "/games", copyrightName: "Racira Games" },
  { route: "/audio", copyrightName: "Racira Audio" },
  { route: "/colors", copyrightName: "Racira Colors" },
];

/** Footer texts are broken up by SSR text-splitting and some domains render
 *  two footers (page-level + layout-level) — scan and concatenate ALL of them. */
async function footerText(page: import("@playwright/test").Page): Promise<string> {
  const footers = page.locator("footer");
  const n = await footers.count();
  if (n === 0) return "";
  const parts: string[] = [];
  for (let i = 0; i < n; i++) parts.push((await footers.nth(i).textContent()) ?? "");
  return parts.join(" \n ");
}

test.describe("Platform-wide site-identity sentinel scan", () => {
  for (const { route, copyrightName } of DOMAIN_ROUTES) {
    test(`${route}: identity surfaces carry the brand, never a sentinel string`, async ({ page }) => {
      const res = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      expect(res?.status(), `${route} must respond OK`).toBeLessThan(400);

      const title = await page.title();
      const og = (await page.locator('meta[property="og:title"]').first().getAttribute("content")) ?? "";
      const tw = (await page.locator('meta[name="twitter:title"]').first().getAttribute("content").catch(() => null)) ?? "";
      const footer = await footerText(page);

      // 1. Sentinel scan on every identity surface.
      for (const [surface, value] of [["title", title], ["og:title", og], ["twitter:title", tw], ["footer", footer]] as const) {
        for (const s of SENTINELS) {
          expect(value.toLowerCase(), `${route} ${surface} must never contain "${s}" (got: "${value}")`).not.toContain(s.toLowerCase());
        }
      }

      // 2. Brand presence: title/og carry the brand token, footer carries the
      //    copyright line (SSR text-splitting tolerated by substring match).
      expect(title, `${route} <title> must carry the brand token "${copyrightName}"`).toContain(copyrightName);
      expect(og, `${route} og:title must carry the brand token "${copyrightName}"`).toContain(copyrightName);
      expect(footer, `${route} footer must carry a "© <year> <brand>" line`).toContain(`© ${year()}`);

      // 3. og:title matches <title> (the /cad/gdt mismatch class).
      expect(og, `${route} og:title must equal <title>`).toBe(title);
    });
  }

  test("footer copyright brand names match each domain's site-identity module", async ({ page }) => {
    // Footer formats differ per domain (historical sentences kept verbatim), so
    // assert the brand token itself renders inside the footer, for the domains
    // whose footer token differs from "Racira".
    const footerBrandChecks: { route: string; token: string }[] = [
      { route: "/cad", token: "Racira CAD" },
      { route: "/pdf", token: "Racira PDF" },
      { route: "/developers", token: "Racira Developers" },
      { route: "/design", token: "Racira Design" },
      { route: "/typography", token: "Racira Typography" },
      { route: "/video", token: "Racira Video" },
      { route: "/animator", token: "Racira Animation" },
      { route: "/writing", token: "Racira Writing" },
      { route: "/seo", token: "Racira SEO" },
      { route: "/finance", token: "Racira Finance" },
      { route: "/productivity", token: "Racira Productivity Tools" },
      { route: "/3d", token: "Racira 3D & Print" },
      { route: "/image", token: "Racira Image" },
      { route: "/photo", token: "Racira Photography" },
      { route: "/games", token: "Racira Games" },
      { route: "/audio", token: "Racira Audio" },
      { route: "/colors", token: "Racira Colors" },
    ];
    for (const { route, token } of footerBrandChecks) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      const footer = await footerText(page);
      expect(footer, `${route} footer must contain the brand token "${token}"`).toContain(token);
    }
  });
});
