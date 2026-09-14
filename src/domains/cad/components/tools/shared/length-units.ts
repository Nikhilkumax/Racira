/**
 * Shared length-unit conversion — single source of truth for every CAD tool
 * that needs unit handling (Scale Bar Tool, …).
 *
 * All factors are "meters per one unit", so converting value → meters → value
 * is always `v * f(a) / f(b)` and never needs a pairwise lookup table. All
 * factors are exact by definition (SI, inch = 25.4 mm, IAU Julian year) or
 * reference-standard:
 *   - foot = 0.3048 m (exact, international foot), imperial chain derived.
 *   - light-year = 9,460,730,472,580,800 m (IAU, exact Julian year × c).
 *   - PostScript point = 1/72 in, pica = 1/6 in (PostScript Language
 *     Reference), pixel = 1/96 in (CSS reference pixel).
 *   - HP-GL unit = 1/1016 in = 0.000025 m (40 units per mm).
 *   - league = land league = 3 mi = 4828.032 m (assumption noted).
 *   - cable = 0.1 nmi = 185.2 m (international approximation).
 */

export const METERS_PER_UNIT: Record<string, number> = {
  // ── Metric (SI) — common range ──────────────────────────────────────────
  nm:  1e-9,
  μm:  1e-6,
  mm:  1e-3,
  cm:  1e-2,
  dm:  1e-1,
  m:   1,
  dam: 10,
  hm:  100,
  km:  1e3,
  Mm:  1e6,

  // ── Imperial / USCS ──────────────────────────────────────────────────────
  th:  0.3048 / 12e3,                       // thou (mil) = 1/12000 ft
  in:  0.3048 / 12,                         // inch = 0.0254 m (exact)
  li:  0.3048 / 12 * 7.92,                  // link = 7.92 in
  ft:  0.3048,                              // foot (exact)
  rd:  0.3048 / 12 * 7.92 * 25,            // rod = 25 links
  yd:  0.3048 * 3,                          // yard = 3 ft
  ch:  0.3048 * 3 * 22,                     // chain = 22 yd
  fur: 0.3048 * 3 * 22 * 10,               // furlong = 10 chains
  mi:  0.3048 * 3 * 22 * 10 * 8,           // mile = 8 furlongs
  lea: 0.3048 * 3 * 22 * 10 * 8 * 3,       // land league = 3 mi = 4828.032 m
  ftm: 1.8288,                              // fathom = 6 ft
  cb:  185.2,                               // cable = 0.1 nmi ≈ 185.2 m
  NM:  1852,                               // nautical mile (exact, by definition)
  nmi: 1852,                               // alias for NM

  // ── Extended SI + specialty ──────────────────────────────────────────────
  ym:  1e-24,
  zm:  1e-21,
  am:  1e-18,
  fm:  1e-15,
  pm:  1e-12,
  Å:   1e-10,                              // ångström
  Gm:  1e9,
  Tm:  1e12,
  Pm:  1e15,
  Em:  1e18,
  Zm:  1e21,
  Ym:  1e24,
  ly:  9_460_730_472_580_800,             // light-year (IAU, Julian year × c)

  // ── Digital / print ──────────────────────────────────────────────────────
  pt:   0.3048 / 12 / 72,               // PostScript point = 1/72 in
  p:    0.3048 / 12 / 6,                // PostScript pica  = 1/6 in
  px:   0.3048 / 12 / 96,              // CSS pixel = 1/96 in
  hpgl: 0.000025,                       // HP-GL unit = 1/1016 in = 0.025 mm
};

export const UNIT_LABELS: Record<string, string> = {
  // Metric (SI) — common
  nm:  "nanometer",
  μm:  "micrometer",
  mm:  "millimeter",
  cm:  "centimeter",
  dm:  "decimeter",
  m:   "meter",
  dam: "decameter",
  hm:  "hectometer",
  km:  "kilometer",
  Mm:  "megameter",
  // Imperial / USCS
  th:  "thou",
  in:  "inch",
  li:  "link",
  ft:  "foot",
  rd:  "rod",
  yd:  "yard",
  ch:  "chain",
  fur: "furlong",
  mi:  "mile",
  lea: "league",
  ftm: "fathom",
  cb:  "cable",
  NM:  "nautical mile",
  nmi: "nautical mile",
  // Extended SI + specialty
  ym:  "yoctometer",
  zm:  "zeptometer",
  am:  "attometer",
  fm:  "femtometer",
  pm:  "picometer",
  Å:   "ångström",
  Gm:  "gigameter",
  Tm:  "terameter",
  Pm:  "petameter",
  Em:  "exameter",
  Zm:  "zettameter",
  Ym:  "yottameter",
  ly:  "light-year",
  // Digital / print
  pt:   "PostScript point",
  p:    "PostScript pica",
  px:   "pixel",
  hpgl: "HP-GL unit",
};

/**
 * Four groups matching the spec order exactly. Used to render <optgroup>
 * elements in the unit selects so labels are never clipped.
 */
export const UNIT_GROUPS: { label: string; units: string[] }[] = [
  {
    label: "Metric (SI)",
    units: ["nm", "μm", "mm", "cm", "dm", "m", "dam", "hm", "km", "Mm"],
  },
  {
    label: "Imperial / USCS",
    units: ["th", "in", "li", "ft", "rd", "yd", "ch", "fur", "mi", "lea", "ftm", "cb", "NM", "nmi"],
  },
  {
    label: "Extended SI + specialty",
    units: ["ym", "zm", "am", "fm", "pm", "Å", "Gm", "Tm", "Pm", "Em", "Zm", "Ym", "ly"],
  },
  {
    label: "Digital / print",
    units: ["pt", "p", "px", "hpgl"],
  },
];

/** Flat ordered list: Metric first, then Imperial, then Extended SI, then Digital. */
export const ALL_UNITS: string[] = UNIT_GROUPS.flatMap((g) => g.units);

/** True when the unit key is known. */
export function isKnownUnit(u: string): boolean {
  return Object.prototype.hasOwnProperty.call(METERS_PER_UNIT, u);
}

/**
 * Convert a value between two units of length via meters — the only place
 * conversion math should live so tools cannot drift apart.
 */
export function convertLength(value: number, from: string, to: string): number {
  return (value * METERS_PER_UNIT[from]) / METERS_PER_UNIT[to];
}
