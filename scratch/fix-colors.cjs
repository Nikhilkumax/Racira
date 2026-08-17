#!/usr/bin/env node
// Pass B: swap contiguous `bg-COLOR-500/10 border-l-4 border-COLOR-500` card
// classes to `bg-primary/10 border-l-4 border-primary`, and normalize the
// label + headline-number text colors inside those cards.
const fs = require("fs");
const path = require("path");
const COMP = "src/domains/calculator/components";

const lines = fs.readFileSync("status_rebuild.txt", "utf8").split("\n").filter(Boolean)
  .filter((l) => l.includes("missing primary result card"));
const slugs = lines.map((l) => l.split("\t")[0]);

const scanSrc = fs.readFileSync("scratch/scan-phase1.cjs", "utf8");
const am = scanSrc.match(/const ALIASES = \{[\s\S]*?\n\};/);
const ALIASES = eval("(" + am[0].replace(/^const ALIASES = /, "").replace(/;$/, "") + ")");
const fileNames = fs.readdirSync(COMP).filter((f) => f.endsWith(".tsx"));
const fileInfo = new Map(fileNames.map((f) => [f, true]));
function pascal(s) { return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(""); }
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ""); }
const normToFile = new Map();
for (const f of fileNames) { const n = norm(f.replace(/\.tsx$/, "")); if (!normToFile.has(n)) normToFile.set(n, f); }
function findFile(slug) {
  if (ALIASES[slug] && fileInfo.has(ALIASES[slug])) return ALIASES[slug];
  if (fileInfo.has(pascal(slug) + ".tsx")) return pascal(slug) + ".tsx";
  if (fileInfo.has(pascal(slug) + "Calculator.tsx")) return pascal(slug) + "Calculator.tsx";
  const n = norm(slug);
  if (normToFile.has(n)) return normToFile.get(n);
  if (normToFile.has(n + "calculator")) return normToFile.get(n + "calculator");
  return null;
}

const COLORS = "green|emerald|amber|teal|rose|red|blue|orange|yellow|purple|indigo|cyan|sky|lime|pink";
// contiguous card class: bg-COLOR-500/10 ... border-l-4 ... border-COLOR-500 (any order within the string)
const CARD_RE = new RegExp(`(bg-(?:${COLORS})-500\\/10)([^"\`]*?)(border-l-4)([^"\`]*?)(border-(?:${COLORS})-500)`);
const CARD_RE_ALT = new RegExp(`(border-l-4)([^"\`]*?)(bg-(?:${COLORS})-500\\/10)([^"\`]*?)(border-(?:${COLORS})-500)`);
const COLOR_CLS = `(?:${COLORS})`;

let changed = 0;
const filesDone = [];
for (const s of slugs) {
  const f = findFile(s);
  if (!f) continue;
  const p = path.join(COMP, f);
  let c = fs.readFileSync(p, "utf8");
  if (/(bg-primary\/\d+[^"]*border-l-4|border-l-4[^"]*bg-primary\/\d+)/.test(c)) continue; // already passes
  let had = false;
  let newC = c.replace(CARD_RE, (m, g1, g2, g3, g4, g5) => { had = true; return `bg-primary/10${g2}${g3}${g4}border-primary`; });
  if (!had) newC = c.replace(CARD_RE_ALT, (m, g1, g2, g3, g4, g5) => { had = true; return `${g1}${g2}bg-primary/10${g4}border-primary`; });
  if (!had) continue;
  // normalize label + number colors that reference the same color family inside this file's cards:
  // text-COLOR-600/700 + dark:text-COLOR-400 -> muted / primary for labels & numbers
  newC = newC.replace(new RegExp(`text-(${COLOR_CLS})-600 dark:text-(${COLOR_CLS})-400`, "g"), "text-primary");
  newC = newC.replace(new RegExp(`text-(${COLOR_CLS})-700 dark:text-(${COLOR_CLS})-400`, "g"), "text-muted-foreground");
  newC = newC.replace(new RegExp(`text-(${COLOR_CLS})-700\\/70 dark:text-(${COLOR_CLS})-400\\/70`, "g"), "text-muted-foreground");
  newC = newC.replace(new RegExp(`text-(${COLOR_CLS})-700`, "g"), "text-muted-foreground");
  fs.writeFileSync(p, newC, "utf8");
  changed++;
  filesDone.push(f);
}
console.log("changed:", changed);
fs.writeFileSync("scratch/pass-b-files.txt", filesDone.join("\n") + "\n");
