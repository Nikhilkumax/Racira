#!/usr/bin/env node
/**
 * cad-domain-sweep.mjs — one-off audit sweep: runs the two GD&T pre-checks
 * (invisible shapes, clipped <text> labels) plus console/page-error capture
 * across the ENTIRE CAD domain (index + 10 categories + 66 live tool pages),
 * not just /cad/gdt.
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const BASE = "http://localhost:3002";

const toSlug = (t) =>
  String(t).toLowerCase().replace(/&/g, "and").replace(/\//g, "-")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const regSrc = readFileSync(resolve(ROOT, "src/domains/cad/registry.ts"), "utf-8");
const cats = [];
let cur = null;
for (const line of regSrc.split(/\r?\n/)) {
  const cm = line.match(/cat\("([^"]+)",\s*\[/);
  if (cm) { cur = { title: cm[1], tools: [] }; cats.push(cur); continue; }
  const tm = line.match(/\[\s*"([^"]+)",\s*"[^"]*"\s*\]/);
  if (tm && cur) cur.tools.push(tm[1]);
}
const active = new Set(
  (regSrc.match(/const ACTIVE_SLUGS = new Set\(\[([\s\S]*?)\]\)/)[1])
    .replace(/\/\/[^\r\n]*/g, "").split(",")
    .map((s) => s.trim().replace(/["']/g, "")).filter(Boolean)
);
const toolRoutes = [];
for (const c of cats) for (const n of c.tools) {
  const s = toSlug(n);
  if (active.has(s)) toolRoutes.push(`/cad/${s}`);
}
const routes = ["/cad", ...cats.map((c) => `/cad/${toSlug(c.title)}`), ...toolRoutes];
console.log(`Sweeping ${routes.length} routes (${toolRoutes.length} tool pages)…`);

const browser = await chromium.launch();
const page = await browser.newPage();

const invisible = [];
const clipped = [];
const pageErrors = [];

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

let i = 0;
for (const route of routes) {
  i++;
  const errors = [];
  const onConsole = (msg) => { if (msg.type() === "error") errors.push(msg.text().slice(0, 200)); };
  const onPageError = (err) => errors.push(String(err).slice(0, 200));
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  try {
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30_000 });
    const res = await page.evaluate(EVAL_CHECKS);
    for (const v of res.invisible) invisible.push(`${route}: ${v}`);
    for (const v of res.clipped) clipped.push(`${route}: ${v}`);
    if (errors.length) pageErrors.push(`${route}: ${errors.join(" | ")}`);
  } catch (e) {
    pageErrors.push(`${route}: NAVIGATION FAILURE ${String(e).slice(0, 150)}`);
  }
  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  if (i % 20 === 0) console.log(`  …${i}/${routes.length}`);
}
await browser.close();

console.log("\n=== INVISIBLE SHAPES (stroke:none AND fill:none) ===");
console.log(invisible.length ? invisible.join("\n") : "NONE");
console.log("\n=== CLIPPED <text> (bbox outside viewBox) ===");
console.log(clipped.length ? clipped.join("\n") : "NONE");
console.log("\n=== CONSOLE/PAGE ERRORS ===");
console.log(pageErrors.length ? pageErrors.join("\n") : "NONE");
writeFileSync(resolve(ROOT, "scratch/cad-sweep-results.json"), JSON.stringify({ invisible, clipped, pageErrors }, null, 2));
console.log(`\nRoutes swept: ${routes.length}. Results also in scratch/cad-sweep-results.json`);
