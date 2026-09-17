/**
 * Batch 19 UI verification — HTTP-level checks against the dev server on
 * :3003 (.next-preview isolate). Tool interiors render client-side only
 * (next/dynamic ssr:false), so interactive-probe checks live in the browser
 * preview; this script covers the server-renderable surface:
 *   1. every page 200s
 *   2. title present, coming-soon absent
 *   3. identity sentinel scan passes
 * Run: node scratch/verify-batch19-ui.cjs
 */
const TOOLS = [
  { slug: "pitch-shift-calculator", title: "Pitch Shift Calculator" },
  { slug: "musical-transpose-tool", title: "Musical Transpose Tool" },
  { slug: "guitar-tuner", title: "Guitar Tuner" },
  { slug: "instrument-tuner", title: "Instrument Tuner" },
  { slug: "id3-tag-editor", title: "ID3 Tag Editor" },
];

const BASE = "http://localhost:3003";
let passed = 0;
let failed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL  ${name}: ${e.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function getPage(slug) {
  const res = await fetch(`${BASE}/audio/${slug}`, { signal: AbortSignal.timeout(30_000) });
  const html = await res.text();
  return { code: res.status, html };
}

(async () => {
  console.log("pages:");
  for (const t of TOOLS) {
    try {
      const { code, html } = await getPage(t.slug);
      check(`${t.slug}: HTTP 200`, () => assert(code === 200, `got ${code}`));
      check(`${t.slug}: renders title "${t.title}"`, () => assert(html.includes(t.title), "missing title"));
      check(`${t.slug}: coming-soon state absent`, () => {
        assert(!/Coming soon|coming-soon/i.test(html), "still showing coming-soon");
      });
      check(`${t.slug}: no error boundary`, () => {
        assert(!/Application error/i.test(html) && !html.includes("__next_error__"), "next.js error page");
      });
      check(`${t.slug}: no identity-sentinel leakage`, () => {
        assert(!/status:\s*"(soon|live)"/.test(html), "leaked status literal");
      });
    } catch (e) {
      failed++;
      console.error(`FAIL  ${t.slug}: unreachable (${e.message})`);
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
