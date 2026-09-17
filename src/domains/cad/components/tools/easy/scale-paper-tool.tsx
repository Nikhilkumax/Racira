"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalcLayout, Panel, PanelTitle, Res, ResBox, fmtTrim } from "./ui";

// ── Paper size catalog ───────────────────────────────────────────────────────
// All dimensions in mm, portrait (short side × long side).
//
// Every entry is a *distinct physical size*. The dropdown derives exactly one
// row per entry, so the dedupe rule is structural: if two entries normalise to
// the same min×max pair the audit script (scratch/paper-size-audit.mjs) fails.
// Aliases for the same sheet are combined into a single label, e.g.
// "Tabloid / Ledger (ANSI B)" and "8R (Government Letter)" — never two rows.
//
// Sources:
//   ISO 216 (A/B series), ISO 269 (C series), ISO 217 (RA/SRA raw formats),
//   DIN 476 overformats (4A0, 2A0) and tiny formats (A11–A13),
//   ANSI/ASME Y14.1 (ANSI A–E), ARCH, JIS B, PA4-based (PA) and F4-based (F)
//   transitional series, R-series photo prints, and traditional British sheets.
//
// Historical sheets that catalogs disagree on (Royal, Super Royal, Imperial,
// Cartridge, Post, the Foolscap family) keep one row per source tradition,
// with a parenthetical inch size on the second variant so neither name is
// shadowed. Aliases for one physical sheet are still folded into a single
// label: Tabloid / Ledger, 8R / Imp. Quarto (both 8 × 10 in), F4 / Folio,
// Foolscap writing / Foolscap E. US Government Letter (8 × 10.5 in) is a
// distinct sheet with its own row — it is NOT the same cut as 8R.

export type PaperGroup =
  | "ISO A"
  | "ISO B"
  | "ISO C"
  | "ANSI/US"
  | "ARCH"
  | "JIS B"
  | "RA Series"
  | "SRA Series"
  | "PA"
  | "F Series"
  | "Photo Sizes"
  | "Traditional / Imperial"
  | "Custom";

/** Group render order — common families first, Custom last. */
export const PAPER_GROUPS: PaperGroup[] = [
  "ISO A",
  "ISO B",
  "ISO C",
  "Traditional / Imperial",
  "ANSI/US",
  "ARCH",
  "JIS B",
  "Photo Sizes",
  "RA Series",
  "SRA Series",
  "PA",
  "F Series",
  "Custom",
];

/** Id of the user-defined row. It is NOT a catalog entry — see buildGroups(). */
export const CUSTOM_ID = "custom";
const CUSTOM_GROUP: PaperGroup = "Custom";

export interface PaperSize {
  id: string;
  /** Short display name, e.g. "A4" — used in the SVG overlay and readouts. */
  name: string;
  series: PaperGroup;
  wMm: number; // width in mm (portrait)
  hMm: number; // height in mm (portrait)
}

/** One canonical label format for every group: `Name — W × H mm`. */
export function canonicalLabel(s: Pick<PaperSize, "name" | "wMm" | "hMm">): string {
  const mm = (n: number) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(1)));
  return `${s.name} — ${mm(s.wMm)} × ${mm(s.hMm)} mm`;
}

export const PAPER_SIZES: PaperSize[] = [
  // ── ISO 216 A-series (+ DIN 476 overformats 4A0/2A0, tiny formats A11–A13)
  { id: "4A0", name: "4A0", series: "ISO A", wMm: 1682, hMm: 2378 },
  { id: "2A0", name: "2A0", series: "ISO A", wMm: 1189, hMm: 1682 },
  { id: "A0",  name: "A0",  series: "ISO A", wMm: 841,  hMm: 1189 },
  { id: "A1",  name: "A1",  series: "ISO A", wMm: 594,  hMm: 841  },
  { id: "A2",  name: "A2",  series: "ISO A", wMm: 420,  hMm: 594  },
  { id: "A3",  name: "A3",  series: "ISO A", wMm: 297,  hMm: 420  },
  { id: "A4",  name: "A4",  series: "ISO A", wMm: 210,  hMm: 297  },
  { id: "A5",  name: "A5",  series: "ISO A", wMm: 148,  hMm: 210  },
  { id: "A6",  name: "A6",  series: "ISO A", wMm: 105,  hMm: 148  },
  { id: "A7",  name: "A7",  series: "ISO A", wMm: 74,   hMm: 105  },
  { id: "A8",  name: "A8",  series: "ISO A", wMm: 52,   hMm: 74   },
  { id: "A9",  name: "A9",  series: "ISO A", wMm: 37,   hMm: 52   },
  { id: "A10", name: "A10", series: "ISO A", wMm: 26,   hMm: 37   },
  { id: "A11", name: "A11", series: "ISO A", wMm: 18,   hMm: 26   },
  { id: "A12", name: "A12", series: "ISO A", wMm: 13,   hMm: 18   },
  { id: "A13", name: "A13", series: "ISO A", wMm: 9,    hMm: 13   },

  // ── ISO 216 B-series (B11–B13 continue the ISO halving sequence)
  { id: "B0",  name: "B0",  series: "ISO B", wMm: 1000, hMm: 1414 },
  { id: "B1",  name: "B1",  series: "ISO B", wMm: 707,  hMm: 1000 },
  { id: "B2",  name: "B2",  series: "ISO B", wMm: 500,  hMm: 707  },
  { id: "B3",  name: "B3",  series: "ISO B", wMm: 353,  hMm: 500  },
  { id: "B4",  name: "B4",  series: "ISO B", wMm: 250,  hMm: 353  },
  { id: "B5",  name: "B5",  series: "ISO B", wMm: 176,  hMm: 250  },
  { id: "B6",  name: "B6",  series: "ISO B", wMm: 125,  hMm: 176  },
  { id: "B7",  name: "B7",  series: "ISO B", wMm: 88,   hMm: 125  },
  { id: "B8",  name: "B8",  series: "ISO B", wMm: 62,   hMm: 88   },
  { id: "B9",  name: "B9",  series: "ISO B", wMm: 44,   hMm: 62   },
  { id: "B10", name: "B10", series: "ISO B", wMm: 31,   hMm: 44   },
  { id: "B11", name: "B11", series: "ISO B", wMm: 22,   hMm: 31   },
  { id: "B12", name: "B12", series: "ISO B", wMm: 15,   hMm: 22   },
  { id: "B13", name: "B13", series: "ISO B", wMm: 11,   hMm: 15   },

  // ── ISO 269 C-series (envelopes)
  { id: "C0",  name: "C0",  series: "ISO C", wMm: 917, hMm: 1297 },
  { id: "C1",  name: "C1",  series: "ISO C", wMm: 648, hMm: 917  },
  { id: "C2",  name: "C2",  series: "ISO C", wMm: 458, hMm: 648  },
  { id: "C3",  name: "C3",  series: "ISO C", wMm: 324, hMm: 458  },
  { id: "C4",  name: "C4",  series: "ISO C", wMm: 229, hMm: 324  },
  { id: "C5",  name: "C5",  series: "ISO C", wMm: 162, hMm: 229  },
  { id: "C6",  name: "C6",  series: "ISO C", wMm: 114, hMm: 162  },
  { id: "C7",  name: "C7",  series: "ISO C", wMm: 81,  hMm: 114  },
  { id: "C8",  name: "C8",  series: "ISO C", wMm: 57,  hMm: 81   },
  { id: "C9",  name: "C9",  series: "ISO C", wMm: 40,  hMm: 57   },
  { id: "C10", name: "C10", series: "ISO C", wMm: 28,  hMm: 40   },

  // ── ANSI/ASME Y14.1 + North American sheets
  // ANSI B is one sheet: "Tabloid" portrait, "Ledger" landscape. The tool has
  // its own orientation toggle, so it gets a single combined row.
  { id: "ANSI-A", name: "Letter (ANSI A)",         series: "ANSI/US", wMm: 215.9, hMm: 279.4 },
  { id: "ANSI-B", name: "Tabloid / Ledger (ANSI B)", series: "ANSI/US", wMm: 279.4, hMm: 431.8 },
  { id: "ANSI-C", name: "ANSI C",                  series: "ANSI/US", wMm: 431.8, hMm: 558.8 },
  { id: "ANSI-D", name: "ANSI D",                  series: "ANSI/US", wMm: 558.8, hMm: 863.6 },
  { id: "ANSI-E", name: "ANSI E",                  series: "ANSI/US", wMm: 863.6, hMm: 1117.6 },
  { id: "Legal",  name: "Legal",                   series: "ANSI/US", wMm: 215.9, hMm: 355.6 },
  { id: "Government-Letter", name: "Government Letter (8 × 10.5 in)", series: "ANSI/US", wMm: 203.2, hMm: 266.7 },

  // ── ARCH series (US architectural)
  { id: "ARCH-A", name: "ARCH A", series: "ARCH", wMm: 228.6, hMm: 304.8 },
  { id: "ARCH-B", name: "ARCH B", series: "ARCH", wMm: 304.8, hMm: 457.2 },
  { id: "ARCH-C", name: "ARCH C", series: "ARCH", wMm: 457.2, hMm: 609.6 },
  { id: "ARCH-D", name: "ARCH D", series: "ARCH", wMm: 609.6, hMm: 914.4 },
  { id: "ARCH-E", name: "ARCH E", series: "ARCH", wMm: 914.4, hMm: 1219.2 },

  // ── JIS B-series (Japanese Industrial Standard)
  { id: "JIS-B0",  name: "JIS B0",  series: "JIS B", wMm: 1030, hMm: 1456 },
  { id: "JIS-B1",  name: "JIS B1",  series: "JIS B", wMm: 728,  hMm: 1030 },
  { id: "JIS-B2",  name: "JIS B2",  series: "JIS B", wMm: 515,  hMm: 728  },
  { id: "JIS-B3",  name: "JIS B3",  series: "JIS B", wMm: 364,  hMm: 515  },
  { id: "JIS-B4",  name: "JIS B4",  series: "JIS B", wMm: 257,  hMm: 364  },
  { id: "JIS-B5",  name: "JIS B5",  series: "JIS B", wMm: 182,  hMm: 257  },
  { id: "JIS-B6",  name: "JIS B6",  series: "JIS B", wMm: 128,  hMm: 182  },
  { id: "JIS-B7",  name: "JIS B7",  series: "JIS B", wMm: 91,   hMm: 128  },
  { id: "JIS-B8",  name: "JIS B8",  series: "JIS B", wMm: 64,   hMm: 91   },
  { id: "JIS-B9",  name: "JIS B9",  series: "JIS B", wMm: 45,   hMm: 64   },
  { id: "JIS-B10", name: "JIS B10", series: "JIS B", wMm: 32,   hMm: 45   },

  // ── ISO 217 raw formats (RA = trim to A with no bleed, SRA = with bleed),
  // kept as separate series to match the competitor grouping.
  { id: "RA0",  name: "RA0",  series: "RA Series", wMm: 860, hMm: 1220 },
  { id: "RA1",  name: "RA1",  series: "RA Series", wMm: 610, hMm: 860  },
  { id: "RA2",  name: "RA2",  series: "RA Series", wMm: 430, hMm: 610  },
  { id: "RA3",  name: "RA3",  series: "RA Series", wMm: 305, hMm: 430  },
  { id: "RA4",  name: "RA4",  series: "RA Series", wMm: 215, hMm: 305  },
  { id: "SRA0", name: "SRA0", series: "SRA Series", wMm: 900, hMm: 1280 },
  { id: "SRA1", name: "SRA1", series: "SRA Series", wMm: 640, hMm: 900  },
  { id: "SRA2", name: "SRA2", series: "SRA Series", wMm: 450, hMm: 640  },
  { id: "SRA3", name: "SRA3", series: "SRA Series", wMm: 320, hMm: 450  },
  { id: "SRA4", name: "SRA4", series: "SRA Series", wMm: 225, hMm: 320  },

  // ── PA series (PA4-based transitional)
  { id: "PA0",  name: "PA0",  series: "PA", wMm: 840, hMm: 1120 },
  { id: "PA1",  name: "PA1",  series: "PA", wMm: 560, hMm: 840  },
  { id: "PA2",  name: "PA2",  series: "PA", wMm: 420, hMm: 560  },
  { id: "PA3",  name: "PA3",  series: "PA", wMm: 280, hMm: 420  },
  { id: "PA4",  name: "PA4",  series: "PA", wMm: 210, hMm: 280  },
  { id: "PA5",  name: "PA5",  series: "PA", wMm: 140, hMm: 210  },
  { id: "PA6",  name: "PA6",  series: "PA", wMm: 105, hMm: 140  },
  { id: "PA7",  name: "PA7",  series: "PA", wMm: 70,  hMm: 105  },
  { id: "PA8",  name: "PA8",  series: "PA", wMm: 52,  hMm: 70   },
  { id: "PA9",  name: "PA9",  series: "PA", wMm: 35,  hMm: 52   },
  { id: "PA10", name: "PA10", series: "PA", wMm: 26,  hMm: 35   },

  // ── F series (F4-based transitional)
  { id: "F0",  name: "F0",  series: "F Series", wMm: 841, hMm: 1321 },
  { id: "F1",  name: "F1",  series: "F Series", wMm: 660, hMm: 841  },
  { id: "F2",  name: "F2",  series: "F Series", wMm: 420, hMm: 660  },
  { id: "F3",  name: "F3",  series: "F Series", wMm: 330, hMm: 420  },  { id: "F4",  name: "F4 (Folio)",  series: "F Series", wMm: 210, hMm: 330 },
  { id: "F5",  name: "F5",  series: "F Series", wMm: 165, hMm: 210  },
  { id: "F6",  name: "F6",  series: "F Series", wMm: 105, hMm: 165  },
  { id: "F7",  name: "F7",  series: "F Series", wMm: 82,  hMm: 105  },
  { id: "F8",  name: "F8",  series: "F Series", wMm: 52,  hMm: 82   },
  { id: "F9",  name: "F9",  series: "F Series", wMm: 41,  hMm: 52   },
  { id: "F10", name: "F10", series: "F Series", wMm: 26,  hMm: 41   },

  // ── R-series photo prints. 4R is the "4×6" print; 8R is the same cut as the
  // imperial quarto (8 × 10 in), so it carries both names in one row. US
  // Government Letter is 8 × 10.5 and has its own row under ANSI/US.
  { id: "2R",  name: "2R (2.5 × 3.5 in)",            series: "Photo Sizes", wMm: 63.5, hMm: 88.9 },
  { id: "3R",  name: "3R (3.5 × 5 in)",              series: "Photo Sizes", wMm: 88.9, hMm: 127 },
  { id: "4R",  name: "4R (4 × 6 in)",                series: "Photo Sizes", wMm: 102, hMm: 152 },
  { id: "5R",  name: "5R (5 × 7 in)",                series: "Photo Sizes", wMm: 127, hMm: 178 },
  { id: "6R",  name: "6R (6 × 8 in)",                series: "Photo Sizes", wMm: 152, hMm: 203 },
  { id: "8R",  name: "8R (Imp. Quarto, 8 × 10 in)",  series: "Photo Sizes", wMm: 203, hMm: 254 },
  { id: "10R", name: "10R (10 × 12 in)",             series: "Photo Sizes", wMm: 254, hMm: 305 },

  // ── Traditional British / Imperial sheets (and US loose sizes that share
  // the same naming tradition). Sources disagree on a few historical sheets;
  // values below follow the papersizes.io imperial table and Wikipedia.
  { id: "Foolscap",       name: "Foolscap",       series: "Traditional / Imperial", wMm: 343, hMm: 432  },
  { id: "Small-Foolscap", name: "Small Foolscap", series: "Traditional / Imperial", wMm: 337, hMm: 419 },
  { id: "Double-Foolscap", name: "Double Foolscap", series: "Traditional / Imperial", wMm: 432, hMm: 686 },
  { id: "Foolscap-Cut",   name: "Foolscap writing (Foolscap E)", series: "Traditional / Imperial", wMm: 203, hMm: 330 },
  { id: "Crown",          name: "Crown",          series: "Traditional / Imperial", wMm: 381, hMm: 508  },
  { id: "Double-Crown",   name: "Double Crown",   series: "Traditional / Imperial", wMm: 508, hMm: 762  },
  { id: "Quad-Crown",     name: "Quad Crown",     series: "Traditional / Imperial", wMm: 762, hMm: 1016 },
  { id: "Royal",          name: "Royal",          series: "Traditional / Imperial", wMm: 508, hMm: 635  },
  { id: "Super-Royal",    name: "Super Royal",    series: "Traditional / Imperial", wMm: 483, hMm: 686  },
  { id: "Imperial",       name: "Imperial",       series: "Traditional / Imperial", wMm: 559, hMm: 762  },
  { id: "Elephant",       name: "Elephant",       series: "Traditional / Imperial", wMm: 584, hMm: 711  },
  { id: "Double-Elephant", name: "Double Elephant", series: "Traditional / Imperial", wMm: 678, hMm: 1016 },
  { id: "Post",           name: "Post",           series: "Traditional / Imperial", wMm: 394, hMm: 489  },
  { id: "Quarto",         name: "Quarto",         series: "Traditional / Imperial", wMm: 229, hMm: 279  },
  { id: "Antiquarian",    name: "Antiquarian",    series: "Traditional / Imperial", wMm: 787, hMm: 1346 },
  { id: "Cartridge",      name: "Cartridge",      series: "Traditional / Imperial", wMm: 533, hMm: 660  },
  { id: "Medium",         name: "Medium",         series: "Traditional / Imperial", wMm: 470, hMm: 584  },
  { id: "Demy",           name: "Demy",           series: "Traditional / Imperial", wMm: 445, hMm: 572  },
  { id: "Double-Demy",    name: "Double Demy",    series: "Traditional / Imperial", wMm: 572, hMm: 902  },
  { id: "Executive",      name: "Executive (Monarch, 7.25 × 10.5 in)", series: "Traditional / Imperial", wMm: 184.2, hMm: 266.7 },
  { id: "Half-Letter",    name: "Half Letter (Statement, 5.5 × 8.5 in)", series: "Traditional / Imperial", wMm: 139.7, hMm: 215.9 },
  { id: "Junior-Legal",   name: "Junior Legal (5 × 8 in)", series: "Traditional / Imperial", wMm: 127, hMm: 203.2 },
  { id: "Index-Card",     name: "Index Card (3 × 5 in)",  series: "Traditional / Imperial", wMm: 76,  hMm: 127 },

  // ── Named sizes added for competitor parity, plus second variants of
  // historical sheets where catalogs disagree — the parenthetical inch size
  // disambiguates each pair (see the header note above).
  { id: "Commercial-Writing", name: "Commercial writing",       series: "Traditional / Imperial", wMm: 216,  hMm: 279 },
  { id: "Denny",              name: "Denny",                    series: "Traditional / Imperial", wMm: 406,  hMm: 533 },
  { id: "Folio",              name: "Folio",                    series: "Traditional / Imperial", wMm: 432,  hMm: 559 },
  { id: "Folio-Note",         name: "Folio note",               series: "Traditional / Imperial", wMm: 140,  hMm: 215 },
  { id: "Foolscap-12x16",     name: "Foolscap (12 × 16 in)",    series: "Traditional / Imperial", wMm: 305,  hMm: 406 },
  { id: "Foolscap-Paper-Cut", name: "Foolscap paper cut",       series: "Traditional / Imperial", wMm: 216,  hMm: 343 },
  { id: "Imperial-23x31",     name: "Imperial (23 × 31 in)",    series: "Traditional / Imperial", wMm: 584,  hMm: 787 },
  { id: "Index-Card-5x8",     name: "Index Card 5 × 8 in",      series: "Traditional / Imperial", wMm: 127,  hMm: 203 },
  { id: "Legal-Cap",          name: "Legal cap",                series: "Traditional / Imperial", wMm: 216,  hMm: 356 },
  { id: "Pocket-Note",        name: "Pocket note",              series: "Traditional / Imperial", wMm: 152,  hMm: 241 },
  { id: "Royal-19x27",        name: "Royal (19 × 27.5 in)",     series: "Traditional / Imperial", wMm: 483,  hMm: 700 },
  { id: "Super-Royal-20x28",  name: "Super Royal (20 × 28 in)", series: "Traditional / Imperial", wMm: 508,  hMm: 712 },
  { id: "Cartridge-12x26",    name: "Cartridge (12 × 26 in)",   series: "Traditional / Imperial", wMm: 305,  hMm: 660 },
  { id: "Post-15x19",         name: "Post (15.25 × 19 in)",     series: "Traditional / Imperial", wMm: 387,  hMm: 483 },
  { id: "Quad-Double-Crown",  name: "Quad Double Crown",        series: "Traditional / Imperial", wMm: 1016, hMm: 1524 },
];

/**
 * Group the catalog for rendering. Every group in PAPER_GROUPS is emitted in
 * order, and any `series` not listed there is appended afterwards — so adding
 * a size under a new family can never make it silently vanish from the UI.
 *
 * `custom` is the user-defined row. It is deliberately kept OUT of PAPER_SIZES:
 * it is user data, not catalog data, so it must not be deduped against the
 * standard sizes — typing 210 × 297 is legitimately A4's size and that is fine.
 */
function buildGroups(
  query: string,
  custom?: PaperSize | null,
): { group: string; sizes: PaperSize[] }[] {
  const needle = query.trim().toLowerCase();
  const terms = needle ? needle.split(/\s+/).filter(Boolean) : [];
  const haystack = (s: PaperSize) =>
    `${s.name} ${s.id} ${s.series} ${s.wMm} ${s.hMm} ${canonicalLabel(s)}`.toLowerCase();
  const matches = (s: PaperSize) => terms.every((t) => haystack(s).includes(t));

  const present = [...new Set(PAPER_SIZES.map((s) => s.series as string))];
  const ordered = [
    ...PAPER_GROUPS,
    ...present.filter((g) => !(PAPER_GROUPS as string[]).includes(g)),
  ];

  return ordered
    .map((group) => {
      const sizes = PAPER_SIZES.filter((s) => s.series === group && matches(s));
      if (group === CUSTOM_GROUP && custom && matches(custom)) sizes.push(custom);
      return { group, sizes };
    })
    .filter((g) => g.sizes.length > 0);
}

// ── Unit conversion ──────────────────────────────────────────────────────────
// One mm-canonical factor per display unit; every conversion goes through it,
// so the comparison math never needs to know the display unit. Factors that
// are exact ratios of an inch stay ratios (25.4/72, 25.4/6, 25.4/96) rather
// than pre-rounded decimals. The catalog dimensions stay in mm, so only this
// table and the formatters are unit-aware.
export const DISPLAY_UNITS = [
  { value: "um",   label: "μm — Micrometers",      mmPerUnit: 0.001 },
  { value: "mm",   label: "mm — Millimeters",      mmPerUnit: 1 },
  { value: "cm",   label: "cm — Centimeters",      mmPerUnit: 10 },
  { value: "dm",   label: "dm — Decimeters",       mmPerUnit: 100 },
  { value: "th",   label: "th — Thou (mil)",       mmPerUnit: 0.0254 },
  { value: "in",   label: "in — Inches",           mmPerUnit: 25.4 },
  { value: "li",   label: "li — Links (Gunter's)", mmPerUnit: 201.168 },
  { value: "ft",   label: "ft — Feet",             mmPerUnit: 304.8 },
  { value: "pt",   label: "pt — Points (1/72 in)", mmPerUnit: 25.4 / 72 },
  { value: "p",    label: "p — Picas (1/6 in)",    mmPerUnit: 25.4 / 6 },
  { value: "px",   label: "px — Pixels (96 DPI)",  mmPerUnit: 25.4 / 96 },
  { value: "hpgl", label: "HP-GL (1/40 mm)",       mmPerUnit: 0.025 },
] as const;

const MM_PER_UNIT: Record<string, number> = {};
const UNIT_SUFFIXES: Record<string, string> = {};
for (const u of DISPLAY_UNITS) {
  MM_PER_UNIT[u.value] = u.mmPerUnit;
  UNIT_SUFFIXES[u.value] = u.value === "um" ? "μm" : u.value;
}

function mmToUnit(mm: number, unit: string): number {
  return mm / (MM_PER_UNIT[unit] ?? 1);
}

/**
 * Decimals the typed custom fields need for `unit` so that half a displayed
 * step stays under 5 μm. Coarse units need more of them: one link is ~0.2 mm
 * and one foot ~0.3 mm, so 4 dp there would round-trip a millimetre-wide
 * error into the comparison. Clamped to [2, 6]; trailing zeros are trimmed
 * by fmtTrim, so mm still renders as "210", never "210.000".
 */
function unitDecimals(unit: string): number {
  const f = MM_PER_UNIT[unit] ?? 1;
  return Math.min(6, Math.max(2, Math.ceil(Math.log10(f / 0.005))));
}

/**
 * Inverse of mmToUnit. The custom width/height fields are typed in whatever
 * unit the display selector is set to, so their values are converted here.
 */
function unitToMm(value: number, unit: string): number {
  return value * (MM_PER_UNIT[unit] ?? 1);
}

/**
 * Group digits with a pinned locale. A bare `toLocaleString()` uses the
 * *runtime's* default locale, so an en-IN server renders "1,24,740" while an
 * en-US browser renders "124,740" — which trips React hydration. Pinning to
 * en-US (the repo's convention for Intl.NumberFormat) keeps both in agreement.
 */
const groupDigits = (n: number) => new Intl.NumberFormat("en-US").format(n);

// ── Orientation helpers ──────────────────────────────────────────────────────
function oriented(size: PaperSize, landscape: boolean): { w: number; h: number } {
  const w = landscape ? Math.max(size.wMm, size.hMm) : Math.min(size.wMm, size.hMm);
  const h = landscape ? Math.min(size.wMm, size.hMm) : Math.max(size.wMm, size.hMm);
  return { w, h };
}

function diag(w: number, h: number) {
  return Math.sqrt(w * w + h * h);
}

// ── Visual comparison SVG ────────────────────────────────────────────────────
function buildComparisonSvg(
  base: PaperSize | null,
  comp: PaperSize | null,
  landscape: boolean,
  unit: string,
): string {
  if (!base || !comp) return "";

  const bOri = oriented(base, landscape);
  const cOri = oriented(comp, landscape);

  const maxW = Math.max(bOri.w, cOri.w);
  const maxH = Math.max(bOri.h, cOri.h);

  // SVG canvas: 320 × 220 pt, with 10pt margin
  const canvasW = 320;
  const canvasH = 220;
  const mg = 16;
  const availW = canvasW - mg * 2;
  // 24pt at top for the comp-size label, 20pt at bottom for the base width
  // dimension line + label — without the bottom reserve, a rect scaled to
  // full height pushed its "297 mm" label past the 220pt viewBox (clipped).
  const availH = canvasH - mg * 2 - 24 - 20;

  // Scale to fit the larger of the two
  const scaleX = availW / maxW;
  const scaleY = availH / maxH;
  const sc = Math.min(scaleX, scaleY);

  const bW = bOri.w * sc;
  const bH = bOri.h * sc;
  const cW = cOri.w * sc;
  const cH = cOri.h * sc;

  // Center both rectangles from the same top-left corner
  const ox = mg + (availW - maxW * sc) / 2;
  const oy = mg + 24; // y offset below labels

  const fmtVal = (mm: number) => `${fmtTrim(mmToUnit(mm, unit), 3)} ${UNIT_SUFFIXES[unit]}`;

  // Determine which is larger
  const baseIsLarger = bW >= cW && bH >= cH;
  const compIsLarger = cW >= bW && cH >= bH;

  // Colors
  const baseColor = "#6366f1"; // indigo
  const compColor = "#f59e0b"; // amber

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasW} ${canvasH}" width="${canvasW}" height="${canvasH}" role="img" aria-label="Paper size comparison">`,
    // Background
    `<rect width="${canvasW}" height="${canvasH}" fill="transparent"/>`,

    // Larger rect first (drawn behind)
    ...(baseIsLarger || (!compIsLarger) ? [
      `<rect x="${ox}" y="${oy}" width="${bW}" height="${bH}" fill="${baseColor}22" stroke="${baseColor}" stroke-width="1.5"/>`,
      `<rect x="${ox}" y="${oy}" width="${cW}" height="${cH}" fill="${compColor}30" stroke="${compColor}" stroke-width="1.5" stroke-dasharray="4 2"/>`,
    ] : [
      `<rect x="${ox}" y="${oy}" width="${cW}" height="${cH}" fill="${compColor}22" stroke="${compColor}" stroke-width="1.5"/>`,
      `<rect x="${ox}" y="${oy}" width="${bW}" height="${bH}" fill="${baseColor}30" stroke="${baseColor}" stroke-width="1.5" stroke-dasharray="4 2"/>`,
    ]),

    // Base label (width dim)
    `<line x1="${ox}" y1="${oy + bH + 8}" x2="${ox + bW}" y2="${oy + bH + 8}" stroke="${baseColor}" stroke-width="1"/>`,
    `<text x="${ox + bW / 2}" y="${oy + bH + 18}" text-anchor="middle" font-size="9" fill="${baseColor}" font-family="ui-monospace,monospace">${fmtVal(bOri.w)}</text>`,

    // Base height dim (left side)
    `<line x1="${ox - 6}" y1="${oy}" x2="${ox - 6}" y2="${oy + bH}" stroke="${baseColor}" stroke-width="1"/>`,
    `<text x="${ox - 10}" y="${oy + bH / 2}" text-anchor="end" font-size="9" fill="${baseColor}" font-family="ui-monospace,monospace" dominant-baseline="central">${fmtVal(bOri.h)}</text>`,

    // Comp label (width dim) — only if different
    ...(Math.abs(cW - bW) > 2 || Math.abs(cH - bH) > 2 ? [
      `<line x1="${ox + bW + 4}" y1="${oy}" x2="${ox + bW + 4}" y2="${oy + cH}" stroke="${compColor}" stroke-width="1"/>`,
      `<text x="${ox + bW + 8}" y="${oy + cH / 2}" text-anchor="start" font-size="9" fill="${compColor}" font-family="ui-monospace,monospace" dominant-baseline="central">${fmtVal(cOri.h)}</text>`,
      `<text x="${ox + cW / 2}" y="${oy - 6}" text-anchor="middle" font-size="9" fill="${compColor}" font-family="ui-monospace,monospace">${fmtVal(cOri.w)}</text>`,
    ] : []),

    // Area labels inside each rect
    `<text x="${ox + bW / 2}" y="${oy + bH / 2 - 6}" text-anchor="middle" font-size="8" fill="${baseColor}" font-family="ui-monospace,monospace">${base.name}</text>`,
    `<text x="${ox + bW / 2}" y="${oy + bH / 2 + 5}" text-anchor="middle" font-size="7" fill="${baseColor}bb" font-family="ui-monospace,monospace">${groupDigits(bOri.w * bOri.h)} mm²</text>`,

    ...(Math.abs(cW - bW) > 4 || Math.abs(cH - bH) > 4 ? [
      `<text x="${ox + Math.min(cW, bW) / 2}" y="${oy + Math.min(cH, bH) / 2 + 18}" text-anchor="middle" font-size="8" fill="${compColor}" font-family="ui-monospace,monospace">${comp.name}</text>`,
    ] : []),

    `</svg>`,
  ];

  return parts.join("\n");
}

// ── Download helpers ─────────────────────────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportOverlaySvg(svgStr: string) {
  downloadBlob(new Blob([svgStr], { type: "image/svg+xml" }), "paper-comparison.svg");
}

function exportOverlayPng(svgStr: string) {
  const canvas = document.createElement("canvas");
  const img = new Image();
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    const scale = 3;
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((b) => {
      if (b) downloadBlob(b, "paper-comparison.png");
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  img.src = url;
}

// ── Searchable paper-size combobox ───────────────────────────────────────────
// Replaces the old native <select>: the catalog is ~140 rows, so typing to
// filter ("a4", "letter", "210") beats scrolling. Groups render as bold,
// non-selectable headers; only real sizes are selectable.
function PaperSelect({
  id, label, value, onChange, custom,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  /** The user-defined row, or null while its dimensions are unusable. */
  custom?: PaperSize | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [keyNav, setKeyNav] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => {
    if (value === CUSTOM_ID) return custom ?? null;
    return PAPER_SIZES.find((s) => s.id === value) ?? null;
  }, [value, custom]);
  const groups = useMemo(() => buildGroups(query, custom), [query, custom]);
  const flat = useMemo(() => groups.flatMap((g) => g.sizes), [groups]);

  /**
   * The highlighted row is DERIVED from the current value, never stale state:
   * opening the list always highlights the option matching the selection (or
   * row 0 when the value is unset/unusable), so an immediate Enter commits
   * that row — never whatever the highlight happened to be last time. Only
   * explicit arrow/mouse movement (`keyNav`) moves it off the selection.
   */
  const activeIdx = useMemo(() => {
    if (keyNav > 0) return (keyNav - 1) % Math.max(flat.length, 1);
    return Math.max(
      0,
      flat.findIndex((s) => s.id === value),
    );
  }, [flat, value, keyNav]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setKeyNav(0);
  }, []);

  // Dismiss on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);

  // Keep the highlighted row visible while arrowing through a long list.
  // Runs after the listbox mounts so OPENING scrolls the selection into view
  // too (previously only movement scrolled, so the list opened mid-list).
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-idx="${activeIdx}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  const commit = (size: PaperSize | undefined) => {
    if (!size) return;
    onChange(size.id);
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setKeyNav(Math.min(activeIdx + 1, flat.length - 1) + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyNav(Math.max(activeIdx - 1, 0) + 1);
    } else if (e.key === "Enter") {
      if (open) { e.preventDefault(); commit(flat[activeIdx]); }
    } else if (e.key === "Escape" || e.key === "Tab") {
      close();
    }
  };

  let optionIdx = -1;

  return (
    <div className="block" ref={rootRef}>
      <label
        htmlFor={`paper-${id}`}
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={`paper-${id}`}
          data-testid={`in-${id}`}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`paper-${id}-list`}
          aria-autocomplete="list"
          autoComplete="off"
          value={open ? query : selected ? canonicalLabel(selected) : ""}
          placeholder={`Search ${PAPER_SIZES.length} paper sizes…`}
          onFocus={() => setOpen(true)}
          // Click is handled separately from focus: after committing a selection
          // the input keeps focus, so re-clicking it fires no focus event and the
          // list would otherwise never reopen. Always open — never toggle — so
          // clicking to move the caret while open does not close the list.
          onClick={() => { setKeyNav(0); setOpen(true); }}
          onChange={(e) => { setQuery(e.target.value); setKeyNav(0); setOpen(true); }}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary"
        />
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {open ? "▴" : "▾"}
        </span>

        {/*
         * Persistent selected-value chip. The input becomes the search field
         * while open, so without this the current selection would be invisible
         * exactly when the user is browsing. `aria-live` keeps the state
         * announced to assistive tech even while the field is blank.
         */}
        {open && selected && (
          <span
            data-testid={`chip-${id}`}
            aria-live="polite"
            className="absolute -top-2 left-2 z-10 max-w-[85%] truncate rounded border border-border bg-card px-1.5 font-mono text-[10px] leading-4 text-muted-foreground"
          >
            {canonicalLabel(selected)}
          </span>
        )}

        {open && (
          <div
            id={`paper-${id}-list`}
            ref={listRef}
            role="listbox"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-lg"
          >
            {groups.map(({ group, sizes }) => (
              <div key={group}>
                <div
                  role="presentation"
                  className="sticky top-0 bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {group}
                </div>
                {sizes.map((s) => {
                  optionIdx += 1;
                  const idx = optionIdx;
                  const isActive = idx === activeIdx;
                  const isSelected = s.id === value;
                  return (
                    <div
                      key={s.id}
                      data-idx={idx}
                      data-option-id={s.id}
                      role="option"
                      aria-selected={isSelected}
                      aria-active={isActive || undefined}
                      onMouseEnter={() => setKeyNav(idx + 1)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commit(s)}
                      className={`cursor-pointer px-3 py-1.5 text-xs ${
                        isActive ? "bg-primary/10 text-foreground" : "text-foreground"
                      } ${isSelected ? "font-semibold" : ""}`}
                    >
                      {canonicalLabel(s)}
                    </div>
                  );
                })}
              </div>
            ))}

            {flat.length === 0 && (
              <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                No paper size matches “{query}”.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Custom width × height ────────────────────────────────────────────────────
// The one case the standard catalog cannot cover. Values are typed in whatever
// unit the display selector is on, and the parent keeps them as *text* so a
// half-typed value is never clobbered mid-keystroke.

const CUSTOM_NAME = "Custom size";
/** Seeds the fields the first time Custom is picked (A4, in mm). */
const CUSTOM_SEED = { w: "210", h: "297" };

/** Build the synthetic row, or null while the typed dimensions are unusable. */
function customPaper(
  draft: { w: string; h: string },
  unit: string,
): PaperSize | null {
  const w = Number(draft.w);
  const h = Number(draft.h);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return {
    id: CUSTOM_ID,
    name: CUSTOM_NAME,
    series: CUSTOM_GROUP,
    wMm: unitToMm(w, unit),
    hMm: unitToMm(h, unit),
  };
}

/** Re-express typed dimensions when the display unit changes, so the numbers
 *  keep meaning the same physical size instead of being reinterpreted. */
function convertDraft(draft: { w: string; h: string }, from: string, to: string) {
  const conv = (v: string) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return v; // leave unusable input alone
    return fmtTrim(mmToUnit(unitToMm(n, from), to), unitDecimals(to));
  };
  return { w: conv(draft.w), h: conv(draft.h) };
}

function CustomDims({
  id, unit, value, onChange,
}: {
  id: string;
  unit: string;
  value: { w: string; h: string };
  onChange: (next: { w: string; h: string }) => void;
}) {
  const field = (key: "w" | "h", label: string) => (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        <span className="font-mono normal-case tracking-normal text-muted-foreground/70">
          {UNIT_SUFFIXES[unit]}
        </span>
      </span>
      <input
        data-testid={`in-${id}-${key}`}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value[key]}
        onChange={(e) => onChange({ ...value, [key]: e.target.value })}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
      />
    </label>
  );

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {field("w", "Width")}
      {field("h", "Height")}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ScalePaperTool() {
  const [unit, setUnit] = useState("mm");
  const [landscape, setLandscape] = useState(false);
  const [baseId, setBaseId] = useState("A3");
  const [compId, setCompId] = useState("A4");
  const [baseCustom, setBaseCustom] = useState(CUSTOM_SEED);
  const [compCustom, setCompCustom] = useState(CUSTOM_SEED);

  // The synthetic Custom rows, or null while their dimensions are unusable.
  const baseCustomSize = useMemo(() => customPaper(baseCustom, unit), [baseCustom, unit]);
  const compCustomSize = useMemo(() => customPaper(compCustom, unit), [compCustom, unit]);

  const base = useMemo(
    () => (baseId === CUSTOM_ID ? baseCustomSize : PAPER_SIZES.find((s) => s.id === baseId) ?? null),
    [baseId, baseCustomSize],
  );
  const comp = useMemo(
    () => (compId === CUSTOM_ID ? compCustomSize : PAPER_SIZES.find((s) => s.id === compId) ?? null),
    [compId, compCustomSize],
  );

  /** Re-express both custom fields when the display unit changes, so the typed
   *  numbers keep meaning the same physical size. */
  const handleUnitChange = (next: string) => {
    if (next === unit) return;
    setBaseCustom((c) => convertDraft(c, unit, next));
    setCompCustom((c) => convertDraft(c, unit, next));
    setUnit(next);
  };

  const baseOri = useMemo(() => base ? oriented(base, landscape) : null, [base, landscape]);
  const compOri = useMemo(() => comp ? oriented(comp, landscape) : null, [comp, landscape]);

  const stats = useMemo(() => {
    if (!baseOri || !compOri) return null;
    const bW = baseOri.w, bH = baseOri.h;
    const cW = compOri.w, cH = compOri.h;
    const bArea = bW * bH;
    const cArea = cW * cH;
    const bDiag = diag(bW, bH);
    const cDiag = diag(cW, cH);

    return {
      // Width comparison (base → comp)
      widthPct: ((cW - bW) / bW) * 100,
      widthMult: cW / bW,
      // Height comparison
      heightPct: ((cH - bH) / bH) * 100,
      heightMult: cH / bH,
      // Diagonal scaling (slightly different from width, as documented)
      diagPct: ((cDiag - bDiag) / bDiag) * 100,
      diagMult: cDiag / bDiag,
      // Area
      areaPct: ((cArea - bArea) / bArea) * 100,
      areaMult: cArea / bArea,
      // Raw
      bW, bH, cW, cH, bArea, cArea,
    };
  }, [baseOri, compOri]);

  const svgStr = useMemo(
    () => buildComparisonSvg(base, comp, landscape, unit),
    [base, comp, landscape, unit]
  );

  const suf = UNIT_SUFFIXES[unit];
  const fmtDim = (mm: number) => `${fmtTrim(mmToUnit(mm, unit), 3)} ${suf}`;
  const fmtArea = (mm2: number) => {
    if (unit === "mm") return `${groupDigits(mm2)} mm²`;
    const u = mmToUnit(Math.sqrt(mm2), unit); // convert side
    return `${fmtTrim(u * u, 2)} ${suf}²`;
  };
  const fmtPct = (v: number) =>
    v > 0 ? `+${fmtTrim(v, 1)}%` : `${fmtTrim(v, 1)}%`;
  const fmtMult = (v: number) => `${fmtTrim(v, 3)}×`;

  /**
   * Which side is which. Both info boxes read their size's `name`, and two
   * independently-set Custom sizes share the name "Custom size" — as do any
   * coincidental picks of the same preset. When the names collide, prefix
   * the side's role ("Baseline — Custom size"); otherwise the name alone
   * stays as compact as before.
   */
  const sideLabel = (
    s: PaperSize | null,
    role: "baseline" | "comparison",
  ): string => {
    if (!s) return "";
    const other = role === "baseline" ? comp : base;
    return other && s.name === other.name
      ? `${role[0].toUpperCase()}${role.slice(1)} — ${s.name}`
      : s.name;
  };

  const handleReset = () => {
    setUnit("mm");
    setLandscape(false);
    setBaseId("A3");
    setCompId("A4");
    setBaseCustom(CUSTOM_SEED);
    setCompCustom(CUSTOM_SEED);
  };

  return (
    <CalcLayout>
      {/* Left panel: controls */}
      <Panel>
        <PanelTitle>Paper size selection</PanelTitle>

        {/* Unit + Orientation */}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Display unit
            </span>
            <select
              data-testid="in-unit"
              value={unit}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              {DISPLAY_UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Orientation
            </span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setLandscape(false)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${!landscape ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"}`}
              >
                ▯ Portrait
              </button>
              <button
                type="button"
                onClick={() => setLandscape(true)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${landscape ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"}`}
              >
                ▭ Landscape
              </button>
            </div>
          </label>
        </div>

        {/* Paper selectors */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <PaperSelect
              id="base"
              label="Baseline paper"
              value={baseId}
              onChange={setBaseId}
              custom={baseCustomSize}
            />
            {baseId === CUSTOM_ID && (
              <CustomDims id="base" unit={unit} value={baseCustom} onChange={setBaseCustom} />
            )}
          </div>
          <div>
            <PaperSelect
              id="comp"
              label="Comparison paper"
              value={compId}
              onChange={setCompId}
              custom={compCustomSize}
            />
            {compId === CUSTOM_ID && (
              <CustomDims id="comp" unit={unit} value={compCustom} onChange={setCompCustom} />
            )}
          </div>
        </div>

        {/* Custom sizes are user data, so say so when the typed value is unusable. */}
        {((baseId === CUSTOM_ID && !baseCustomSize) || (compId === CUSTOM_ID && !compCustomSize)) && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Enter a width and height greater than 0 to compare a custom size.
          </p>
        )}

        {/* Dimension display */}
        {baseOri && compOri && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <div data-testid="dim-base-name" className="mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                {sideLabel(base, "baseline")}
              </div>
              <div className="font-mono text-sm text-foreground">
                {fmtDim(baseOri.w)} × {fmtDim(baseOri.h)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {fmtArea(baseOri.w * baseOri.h)}
              </div>
              {stats && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Scale vs {sideLabel(comp, "comparison")}: {fmtPct((1 / stats.diagMult - 1) * 100)} ({fmtMult(1 / stats.diagMult)})
                </div>
              )}
            </div>
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <div data-testid="dim-comp-name" className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                {sideLabel(comp, "comparison")}
              </div>
              <div className="font-mono text-sm text-foreground">
                {fmtDim(compOri.w)} × {fmtDim(compOri.h)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {fmtArea(compOri.w * compOri.h)}
              </div>
              {stats && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Scale vs {sideLabel(base, "baseline")}: {fmtPct((stats.diagMult - 1) * 100)} ({fmtMult(stats.diagMult)})
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reset */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-border bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            ↺ Reset fields
          </button>
        </div>
      </Panel>

      {/* Right panel: visual + stats */}
      <Panel>
        <PanelTitle>Comparison overlay</PanelTitle>

        {/* SVG overlay */}
        {svgStr ? (
          <div className="rounded-lg border border-border bg-background p-2 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: svgStr }} />
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 h-48 flex items-center justify-center text-sm text-muted-foreground">
            Select two paper sizes to compare
          </div>
        )}

        {/* Legend */}
        {base && comp && (
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded-sm bg-indigo-500/30 border border-indigo-500" />
              {sideLabel(base, "baseline")}
              {base.name === comp.name && " (baseline)"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded-sm bg-amber-500/20 border border-amber-500 border-dashed" />
              {sideLabel(comp, "comparison")}
              {base.name === comp.name && " (comparison)"}
            </span>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <ResBox>
            <Res
              name="width-pct"
              label={`Width (${sideLabel(base, "baseline")} → ${sideLabel(comp, "comparison")})`}
              value={`${fmtPct(stats.widthPct)}  ·  ${fmtMult(stats.widthMult)}`}
            />
            <Res
              name="height-pct"
              label={`Height (${sideLabel(base, "baseline")} → ${sideLabel(comp, "comparison")})`}
              value={`${fmtPct(stats.heightPct)}  ·  ${fmtMult(stats.heightMult)}`}
            />
            <Res
              name="diag-pct"
              label="Diagonal scaling factor"
              value={`${fmtPct(stats.diagPct)}  ·  ${fmtMult(stats.diagMult)}`}
            />
            <Res
              name="area-pct"
              label="Area ratio"
              value={`${fmtPct(stats.areaPct)}  ·  ${fmtMult(stats.areaMult)}`}
            />
          </ResBox>
        )}

        {/* Download buttons */}
        {svgStr && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => exportOverlaySvg(svgStr)}
              className="px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              ↓ SVG
            </button>
            <button
              onClick={() => exportOverlayPng(svgStr)}
              className="px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              ↓ PNG
            </button>
          </div>
        )}
      </Panel>
    </CalcLayout>
  );
}
