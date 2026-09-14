#!/usr/bin/env node
/**
 * Run the invisible-shape and label-clipping pre-checks against the
 * Scale Bar Tool page with all 3 bar styles to verify the new SVG output.
 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3002";
const ROUTES = ["/cad/scale-bar-tool"];

const STYLES = ["double-row", "single-row", "line"];

const browser = await chromium.launch();
const page = await browser.newPage();

const invisible = [];
const clipped = [];
const errors = [];

const EVAL_CHECKS = () => {
  const out = { invisible: [], clipped: [] };
  const TOL = 2;
  document.querySelectorAll("svg").forEach((svg) => {
    const label = svg.getAttribute("aria-label") ?? "";
    const vb = svg.viewBox && svg.viewBox.baseVal;
    const hasVb = vb && vb.width && vb.height;
    svg.querySelectorAll("line, rect, path, circle, ellipse, polygon").forEach((el) => {
      const cs = getComputedStyle(el);
      const stroke = cs.stroke;
      const fill = cs.fill;
      const paintsStroke = stroke && stroke !== "none";
      const paintsFill = fill && fill !== "none" && fill !== "transparent";
      const isLine = el.tagName.toLowerCase() === "line";
      if (isLine ? !paintsStroke : !paintsStroke && !paintsFill) {
        out.invisible.push(
          `${el.tagName.toLowerCase()} [${(el.getAttribute("class") ?? "").slice(0, 40)}] [${label.slice(0, 60)}]`
        );
      }
    });
    if (hasVb) {
      svg.querySelectorAll("text").forEach((t) => {
        let b;
        try { b = t.getBBox(); } catch { return; }
        if (b.width === 0 && b.height === 0) return;
        const clips = [];
        if (b.x < vb.x - TOL) clips.push(`left ${b.x.toFixed(1)} < ${vb.x}`);
        if (b.x + b.width > vb.x + vb.width + TOL) clips.push(`right ${(b.x + b.width).toFixed(1)} > ${vb.x + vb.width}`);
        if (b.y < vb.y - TOL) clips.push(`top ${b.y.toFixed(1)} < ${vb.y}`);
        if (b.y + b.height > vb.y + vb.height + TOL) clips.push(`bottom ${(b.y + b.height).toFixed(1)} > ${vb.y + vb.height}`);
        if (clips.length) {
          out.clipped.push(`${(t.textContent ?? "").slice(0, 40)} → ${clips.join("; ")} [${label.slice(0, 60)}]`);
        }
      });
    }
  });
  return out;
};

for (const route of ROUTES) {
  for (const style of STYLES) {
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30_000 });
    // Set bar style via evaluate
    await page.evaluate((s) => {
      const sel = document.querySelectorAll('select')[3];
      if (sel) { sel.value = s; sel.dispatchEvent(new Event('change', { bubbles: true })); }
    }, style);

    const pageErrors = [];
    const onConsole = (msg) => { if (msg.type() === "error") pageErrors.push(msg.text().slice(0, 200)); };
    const onPageError = (err) => pageErrors.push(String(err).slice(0, 200));
    page.on("console", onConsole);
    page.on("pageerror", onPageError);

    const res = await page.evaluate(EVAL_CHECKS);
    for (const v of res.invisible) invisible.push(`${route} [${style}]: ${v}`);
    for (const v of res.clipped) clipped.push(`${route} [${style}]: ${v}`);
    if (pageErrors.length) errors.push(`${route} [${style}]: ${pageErrors.join(" | ")}`);

    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }
}

await browser.close();

console.log("=== INVISIBLE SHAPES ===");
console.log(invisible.length ? invisible.join("\n") : "NONE");
console.log("\n=== CLIPPED LABELS ===");
console.log(clipped.length ? clipped.join("\n") : "NONE");
console.log("\n=== CONSOLE ERRORS ===");
console.log(errors.length ? errors.join("\n") : "NONE");

const pass = invisible.length === 0 && clipped.length === 0 && errors.length === 0;
console.log(`\nResult: ${pass ? "ALL PASS" : "FAILURES FOUND"}`);
process.exit(pass ? 0 : 1);
