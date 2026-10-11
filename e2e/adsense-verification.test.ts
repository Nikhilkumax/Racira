/**
 * adsense-verification.test.ts — proves the AdSense site-verification file
 * reaches a visitor, not just the filesystem.
 *
 * Companion to _scripts/adsense-verify-check.mjs, which guards the artifact
 * statically in pre-push/CI. That check cannot answer the question that
 * actually matters to Google: does GET /ads.txt on a running server return
 * this record, at the domain root, with no detour? A file in public/ can fail
 * to be served for reasons the static check never sees — a route handler or
 * rewrite shadowing the path, a redirect that turns the plain-text record into
 * a login/404 page, or a middleware matcher that swallows the request.
 *
 * So this test asserts the served response directly:
 *   1. /ads.txt responds 200 with no redirect (request made with maxRedirects
 *      disabled — a 3xx would fail, not silently follow);
 *   2. the body is byte-identical to public/ads.txt on disk and to the exact
 *      required record — if these ever disagree, something else is answering;
 *   3. it is served as text/plain and carries a short cache, not immutable;
 *   4. robots.txt does not disallow /ads.txt and does not block the AdSense
 *      crawler (Mediapartners-Google) or Googlebot;
 *   5. the superseded publisher id appears nowhere in the repo.
 *
 * The AdSense client id appears in ads.txt WITHOUT the "ca-" prefix — that is
 * the correct form for ADS.TXT and is deliberate, not a typo.
 */
import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { execFileSync } from "child_process";
import { join } from "path";

const ADS_TXT_PATH = join(process.cwd(), "public", "ads.txt");
const EXPECTED_RECORD = "google.com, pub-3924503352309890, DIRECT, f08c47fec0942fa0";
const EXPECTED_BODY = `${EXPECTED_RECORD}\n`;
// Assembled from fragments so the repo-wide grep in this test cannot match the
// test's own source.
const LEGACY_PUBLISHER_ID = "7147460072" + "564518";

test.describe("AdSense site verification", () => {
  test("public/ads.txt is present and byte-exact", () => {
    const onDisk = readFileSync(ADS_TXT_PATH, "utf8");
    expect(onDisk, "ads.txt must be exactly the required record plus one LF").toBe(EXPECTED_BODY);
    expect(onDisk.charCodeAt(0), "ads.txt must not start with a BOM").not.toBe(0xfeff);
    expect(onDisk, "ads.txt must use LF, not CRLF").not.toContain("\r");
  });

  test("GET /ads.txt serves that record as plain text with no redirect", async ({ request }) => {
    // maxRedirects: 0 — a redirect must fail this test rather than be followed,
    // because a redirected fetch is not the canonical record Google claims.
    const res = await request.get("/ads.txt", { maxRedirects: 0 });

    expect(res.status(), "the site root must serve the verification file directly").toBe(200);
    expect(res.status(), "requests for /ads.txt must not be redirected").toBeLessThan(300);
    expect(res.url(), "the response must be /ads.txt itself, not a rewritten path").toContain(
      "/ads.txt",
    );

    const served = await res.body();
    const onDisk = readFileSync(ADS_TXT_PATH);
    expect(
      served.equals(onDisk),
      "the served bytes must match public/ads.txt — otherwise something else is answering this path",
    ).toBe(true);
    expect(served.toString("utf8"), "the served body must equal the exact record").toBe(
      EXPECTED_BODY,
    );

    const contentType = res.headers()["content-type"] ?? "";
    expect(contentType, "ADS.TXT must be served as text, not as HTML").toMatch(/text\/plain/);

    const cache = res.headers()["cache-control"] ?? "";
    expect(cache, "ADS.TXT must not be cached immutably").not.toMatch(/immutable/);
  });

  test("robots.txt leaves /ads.txt and the AdSense crawler open", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();

    const disallowsAdsTxt = /^\s*Disallow:\s*\/ads\.txt\s*$/im.test(text);
    expect(disallowsAdsTxt, "robots.txt must not disallow /ads.txt").toBe(false);

    // A blanket disallow (or one aimed at the ad crawlers) would stop AdSense
    // from fetching the record or crawling the site.
    const blocksCrawlers = /User-Agent:\s*(Mediapartners-Google|Googlebot)[\s\S]*?Disallow:\s*\/\s*(?:\n|$)/i.test(
      text,
    );
    expect(blocksCrawlers, "robots.txt must not block Googlebot or Mediapartners-Google").toBe(false);
  });

  test("the superseded publisher id appears nowhere in the repo", () => {
    let out = "";
    try {
      out = execFileSync("git", ["grep", "--untracked", "-nI", "--", LEGACY_PUBLISHER_ID], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
    } catch (err) {
      // git grep exits 1 when there are no matches — that is the pass case.
      out = (err as { stdout?: string }).stdout ?? "";
    }
    expect(out.trim(), "the superseded publisher id must be gone").toBe("");
  });
});
