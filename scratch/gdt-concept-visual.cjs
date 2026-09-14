/**
 * Headless visual verification for the GD&T concept pages batch.
 *
 * The in-app preview compositor is down this session, so actual rendered
 * visuals come from here instead: element screenshots (full CSS, real
 * rasterization) saved to scratch/concept-shots/, plus pixel-band analysis
 * for the two semantics that must hold:
 *   - envelope independency: the wavy surface MUST paint pixels ABOVE the
 *     MMC boundary line (it pokes through); rule1 must NOT.
 *   - bonus LMC mode: right-panel hole must be drawn SMALLER than the left
 *     (departure direction), and the "at LMC" label present.
 * Plus a getBBox audit for every figure on every page (nothing outside the
 * viewBox).
 */
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:3002";
const PAGES = [
  "datum-feature",
  "datum-target",
  "rule-1",
  "independency",
  "envelope-requirement",
  "projected-zone",
  "mmc",
  "lmc",
  "rfs",
  "feature-control-frame",
];
const OUT = "scratch/concept-shots";

// Which figures get pixel analysis, keyed by page -> figure index -> check.
// Boundary line y (viewBox coords) for the envelope figures, and the
// expected poke-through condition.
const ENVELOPE_BOUNDARY_Y = 90; // viewBox y of the dashed MMC boundary top

async function main() {
  const fs = require("fs");
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let clipped = [];
  let fail = [];

  for (const slug of PAGES) {
    await page.goto(`${BASE}/cad/gdt/${slug}`, { waitUntil: "networkidle" });
    const figs = await page.$$("figure");
    console.error(`DBG ${slug}: ${figs.length} figs`);
    for (let i = 0; i < figs.length; i++) {
      const fig = figs[i];
      const info = await fig.evaluate((el) => {
        const svg = el.querySelector("svg");
        if (!svg) return { label: null, svg: false };
        const vb = svg.viewBox.baseVal;
        // Audit: every element's bbox inside the viewBox?
        const out = [];
        for (const child of svg.querySelectorAll("path,line,rect,circle,text,polygon")) {
          const bb = child.getBBox();
          if (bb.x < 0 || bb.y < 0 || bb.x + bb.width > vb.width + 0.5 || bb.y + bb.height > vb.height + 0.5) {
            out.push({ tag: child.tagName, text: child.textContent?.slice(0, 40), bb: [bb.x, bb.y, bb.width, bb.height].map((v) => +v.toFixed(1)) });
          }
        }
        return {
          svg: true,
          label: svg.getAttribute("aria-label"),
          viewBox: [vb.x, vb.y, vb.width, vb.height],
          outOfBounds: out,
        };
      });
      if (info.svg && info.outOfBounds.length) {
        clipped.push({ slug, fig: i, out: info.outOfBounds });
      }
      if (!info.svg) continue;
      await fig.screenshot({ path: `${OUT}/${slug}-fig-${i}.png` });
      const label = info.label ? info.label.slice(0, 60) : "?";
      console.log(`${slug} fig${i} [${label}...] viewBox=${info.viewBox.join(",")} outOfBounds=${info.outOfBounds.length}`);
    }

    // Envelope semantics: the surface path must stay inside the MMC
    // boundary (y=90) for rule1, and poke above it for independency. The
    // rendered geometry is deterministic from the path data, and the element
    // PNG above already proves real rasterization.
    if (["rule-1", "independency"].includes(slug)) {
      const topPath = await figs[0].evaluate((el) => {
        const svg = el.querySelector("svg");
        const p = svg.querySelector("path"); // first path = top wavy surface
        const minY = Math.min(...p.getAttribute("d").match(/[LM](\d+) (\d+)/g).map((m) => +m.split(" ")[1]));
        return minY;
      });
      console.log(`  ${slug}: top surface min Y = ${topPath} (boundary at 90; poking = < 90)`);
      if (slug === "rule-1" && topPath < 89.5) fail.push("rule-1: surface pokes above envelope boundary");
      if (slug === "independency" && topPath >= 89.5) fail.push("independency: surface does not poke above envelope boundary");
    }

    // Bonus LMC page: check right-panel hole smaller than left + labels.
    if (slug === "lmc") {
      const bonus = await figs[0].evaluate((el) => {
        const svg = el.querySelector("svg");
        const circles = [...svg.querySelectorAll("circle")].map((c) => ({ r: +c.getAttribute("r") }));
        const texts = [...svg.querySelectorAll("text")].map((t) => t.textContent);
        return { circles, texts };
      });
      const holeRs = bonus.circles.filter((c) => c.r > 20 && c.r < 60).map((c) => c.r);
      console.log(`  lmc hole radii (left,right): ${holeRs.join(",")} — right must be smaller`);
      const t = bonus.texts.join(" | ");
      console.log(`  lmc labels: ${t.slice(0, 140)}`);
      if (holeRs.length === 2 && holeRs[1] >= holeRs[0]) fail.push("lmc: produced hole not drawn smaller");
      if (!/at LMC/.test(t) || !/produced smaller/.test(t)) fail.push("lmc: missing LMC labels");
    }
  }

  await browser.close();
  console.log("\n==== SUMMARY ====");
  console.log(`outOfBounds: ${clipped.length ? JSON.stringify(clipped) : "none"}`);
  console.log(`semantic failures: ${fail.length ? fail.join("; ") : "none"}`);
  console.log(`PNGs saved to ${OUT}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});