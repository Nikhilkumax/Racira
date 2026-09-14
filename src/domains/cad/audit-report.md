# CAD Tools Domain — Full Audit Report

Date: 2026-09-03 · Domain: `src/domains/cad/` · Route segment: `/cad`

## 1. Reconciled total tool count

**118 tools across 10 categories** — reconciled against the registry
(`src/domains/cad/registry.ts`) by `_scripts/cad-reconcile.mjs` (parse of the
registry, not a build artifact). The registry is the single source of truth for
CAD — there is no separate `src/data/cad/` file to drift against.

- **118 unique slugs, zero duplicates, zero slug collisions.** Special-character
  audit: 8 names contain parens (`Distance Calculator (2D)`, `Area Calculator
  (polygon)`, `Fit Tolerance Selector (ISO)`, `Material Selection Guide
  (mechanical)`, `GD&T Symbol Reference (Standards)`, `Tolerance Grade (IT
  Grade) Reference`, `Drawing Standards Comparator (ANSI vs ISO)`, `Parts List
  (BOM) Builder`); `&` maps to `and` (`GD&T Symbol Reference` →
  `gdandt-symbol-reference`, distinct from the `-standards` variant). No dotted
  names or `mm²`-style characters — no Developer-Tools-style silent slug
  breakage exists.
- **Orphaned registry entries (no reachable route): 0.** Every slug resolves
  through `TOOLS_BY_SLUG`; every card is rendered from the same registry.
- **Implementations not in the registry: 0.** One component exists
  (`SketchTool`) and it is now the wired implementation of the registry's live
  tool.

### Tier breakdown (Easy / Medium / Hard by category)

Derived per-tool from implementation complexity (`_scripts/cad-tier-list.mjs`),
same rubric as the Developer Tools reconciliation (Easy = formula/reference,
Medium = meaningful logic/tables/geometry math, Hard = interactive canvas /
simulation / complex generation). The live tool's tier is **verified from its
source**; the 117 soon tools have no implementation yet, so their tiers are
projections from stated function.

| Category | Easy | Medium | Hard | Total |
|---|---|---|---|---|
| 2D Drafting | 3 | 5 | 6 | 14 |
| Measurement & Geometry | 7 | 5 | 0 | 12 |
| Mechanical Engineering CAD | 5 | 5 | 2 | 12 |
| Structural & Civil CAD | 5 | 5 | 2 | 12 |
| Electrical & PCB Schematic | 6 | 4 | 2 | 12 |
| Architecture & Planning | 5 | 6 | 3 | 14 |
| Piping & HVAC | 6 | 4 | 0 | 10 |
| GD&T & Standards | 5 | 5 | 0 | 10 |
| CNC & Fabrication | 8 | 2 | 2 | 12 |
| CAD Utilities | 8 | 2 | 0 | 10 |
| **TOTAL** | **58** | **43** | **17** | **118** |

**Tier metadata finding:** the CAD registry has *no stated difficulty tier* on
any entry (unlike the calculator registry's `tier: Tier1/2/3`). "Stated tier vs
actual" can't mismatch because tiers are not stated anywhere — the table above
is the first tier ground truth for the domain. Recommendation: add tiers to the
registry when tools are built, as the calculator domain does.

**Engine finding (platform convention):** no CAD tool depends on a ported CAD
engine — no DXF/STEP parser, no three.js, no WASM geometry kernel. The live
tool is a native 2D-canvas implementation, and all 117 planned tools are
natively buildable (canvas/SVG + DOM math). Nothing needs a heavy ported
engine; none is in use.

## 2. Live count / Soon count

- **Live: 1** (`2d-cad-sketch-tool`)
- **Soon: 117**

All counts are **computed dynamically from the registry**:
- Index hero/search: `LIVE_CAD_COUNT = onlyLive(categories.flatMap(c => c.tools), "cad").length`
  (`app/cad/page.tsx`).
- Layout metadata: `description: \`${totalCount}+ free CAD tools…\``
  (`app/cad/layout.tsx`). The hardcoded `"108+"` is gone.
- Category-section counts `(14)`, `(12)`… are `tools.length` from the registry.
- Sitemap entries for live CAD tools flow through `isLiveTool(t, "cad")`
  (`lib/sitemap/sitemapSources.ts`) — the sketch tool is now included.

The gate is **centralized**: `isLiveTool` / `isComingSoonToolPage` /
`hasComingSoonPage` in `lib/tools/liveToolFilters.ts` / `lib/tools/comingSoonPage.ts`.
No per-case short-circuits remain in CAD. CAD is **not** in
`DOMAINS_WITH_COMING_SOON`, so soon tools correctly render as non-clickable
"SOON" cards (no dead-end pages) — verified on the index and category pages.

## 3. Bugs found and fixed

| # | What was broken | What the fix was |
|---|---|---|
| 1 | **The only "live" tool 404'd.** `2d-cad-sketch-tool` was flagged `live` in the registry and its component (`SketchTool`) existed, but `app/cad/[slug]/page.tsx` called `notFound()` for **every** tool slug, and `liveToolFilters.ts` hard-listed `cad` in `COMPONENT_GATED_DOMAINS`, so `isLiveTool` returned false for the whole domain (homepage count 0, search disabled, sitemap empty, static params omitted the tool). | Wired the tool: added a `TOOL_COMPONENTS` map in `[slug]/page.tsx` (a live flag is only truthful with a wired component) + `ToolView` (breadcrumb + bordered card, matching the 3D domain pattern), and removed `cad` from `COMPONENT_GATED_DOMAINS`. Live count → 1, card clickable, search surfaces the tool, sitemap/static params include it. |
| 2 | **Hardcoded wrong count.** `app/cad/layout.tsx` metadata said `108+ free CAD tools`; the registry actually holds 118 (its own comment said 108 too — stale from before tools were added). | Metadata now interpolates `totalCount` from the registry; registry comment corrected to 118. |
| 3 | **Hero over-promised formats that don't exist.** Hero copy promised "Viewers, DXF & Measure" and "viewing, measuring, and converting CAD and DXF files" — no DXF viewer/converter exists anywhere in the registry (the closest is the sketch tool). | Rewrote hero to what ships today: "Sketch, Draft & Measure" + "Draft on a precision grid with snapping and live measurements…". |
| 4 | **"1 CAD tools" plural bug.** Once the live count became 1, the search placeholder would read "Search 1 CAD tools…". | Placeholder now pluralizes: `tool${LIVE_CAD_COUNT === 1 ? "" : "s"}`. |

All fixes verified: `npx tsc --noEmit` clean, `npm run build` exit 0 (the sketch
tool is statically generated under `/cad/[slug]`), `_scripts/cad-reconcile.mjs`
passes every check.

## 4. Remaining known, unfixed bugs / gaps (stated plainly)

1. **Select tool is inert.** The sketch tool's toolbar advertises "Select" but
   `onDown` returns immediately for `select` — no selection, move, or delete of
   drawn shapes. Functional gap, not a crash; needs a small feature (hit-test +
   move + delete) before the Select button is honest.
2. **No SEO content for the live tool.** CAD has no SEO infra at all (no
   `SeoContent` component / `tool-seo.ts` like the developers and PDF domains).
   The live tool page renders the tool but no ~500-word SEO section. Per the
   standing convention this is a gap for live tools; it is tracked here rather
   than hidden. Not fixed because it is a separate content workstream (the
   developers domain's SEO rollout was its own phase).
3. **No file-format scope yet.** Nothing in the registry imports/exports DXF,
   STL, STEP, OBJ, or SVG (export is PNG only). So the audit's
   round-trip-fidelity and malformed-file edge cases are N/A for the current
   live toolset — the checks apply the day a converter ships. The hero copy no
   longer implies otherwise.
4. **Degenerate shapes.** Click-without-drag commits a zero-length line /
   zero-size rect (harmless; not a crash). Snap readout rounds to 0.1 mm
   (`toFixed(1)`) — fine for sketching; stored geometry keeps full float px.
5. **`pdf-to-json`-style open bug: none in CAD.** Nothing found that returns
   wrong data silently; the one data-producing surface (measure readouts) was
   numerically verified (below).

## 5. Verification method (what was actually done)

A coverage script was **not** the evidence. Every claim below was produced by
running the app and exercising real input:

- **Real server, real routes.** Ran the dev server and the production build
  (`npm run build` exit 0, then `next start`). Curled every route class:
  `/cad` → 200, `/cad/2d-cad-sketch-tool` → 200 (SSG), `/cad/2d-drafting` →
  200, every soon slug (e.g. `/cad/floor-plan-drawer`) → 404 as designed.
- **Real drawing on a real canvas (Playwright, trusted input), in both dev and
  production:** `e2e/cad-sketch-tool.test.ts` — 5 tests, all passing.
  - Draws a 200 px line → object counter increments and `getImageData` at the
    line's midpoint returns exactly `#475569` (dark stroke on white), proving
    pixels are painted, not a blank canvas.
  - Drags an **off-grid** rectangle `(103,297)→(305,399)` → live readout reads
    `W: 100.0 mm  H: 50.0 mm`, proving snap-to-grid and mm math
    (px→mm = px ÷ 20 × 10).
  - Draws a circle → readout `R: 30.0 mm  Ø: 60.0 mm` for a 60 px radius.
  - Polyline: 3 clicks stay uncommitted, Enter commits (counter 0 → 1);
    Undo 1 → 0; Clear all → 0.
  - Export PNG: intercepts the anchor click → `download: "racira-cad-sketch.png"`,
    `href: "data:image/png;base64,…"`.
- **UI-state checks via the live page (DOM-level):** 118 cards / 10 sections on
  the index; the sketch tool card is a real `<a href="/cad/2d-cad-sketch-tool">`;
  search typed "sketch" returns exactly that one result; footer reads
  "118+ tools"; live page has `<title>2D CAD Sketch Tool — Racira CAD` and **no**
  `robots noindex`.
- **Client-side purity (source audit):** zero `fetch`/XHR/`/api/` references in
  `src/domains/cad/`; the sketch tool is pure Canvas 2D + React state, PNG
  export is `toDataURL` — no server calls, no external services, engine fully
  bundled. No exceptions to judge.

Artifacts: `_scripts/cad-reconcile.mjs` (registry ground truth), `_scripts/cad-tier-list.mjs`
(tier table), `e2e/cad-sketch-tool.test.ts` (functional lock), this report.
## 6. Batch 7 status (2026-09-05)

First **Medium-tier** batch shipped on top of the Phase B Easy batches 1–6:

- **7 new live tools** (66 of 118 now live): area-calculator-polygon,
  angle-bisector-tool, coordinate-input-tool, tolerance-stack-up-analyzer,
  thread-fit-calculator (Measurement & Geometry), drawing-title-block-generator,
  parts-list-bom-builder (CAD Utilities).
- New tier seam: `src/domains/cad/components/tools/medium/` with its own
  `registry.tsx` (MEDIUM_TOOL_COMPONENTS), spread into the page\u2019s
  TOOL_COMPONENTS alongside the Easy registry. ui primitives reused from
  `../easy/ui`.
- SEO content: `scratch/cad-seo-batch7.json` (689–905 words/tool, all 7 pass
  SEO_STRICT schema validation), assembled to `registry/seo/batch7.ts` and
  registered in `tool-seo.ts`; every numeric FAQ claim was verified against
  the components\u2019 exact arithmetic before SEO_NUM_OK=1.
- ISO 965-1 thread arithmetic cross-checked against published limits
  (M12�1.75 6g pitch \u2261 10.679–10.829, es 34 µm; M20�2.5 \u2261 18.164–18.334,
  es 42 µm); computed values land within a few µm of ISO 965-2 tables.
- Verification: `e2e/cad-medium-batch7.test.ts` — 7 tests, all passing
  against a real dev server (route 200s for all 7 slugs + category pages).
- Remaining: 52 tools (36 Medium, 16 Hard incl. the built sketch tool = 17
  Hard total).
