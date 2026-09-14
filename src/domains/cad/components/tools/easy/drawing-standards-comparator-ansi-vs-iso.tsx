"use client";

import { RefTable } from "./ui";

/**
 * Drawing Standards Comparator (ANSI vs ISO) — side-by-side differences between
 * the ASME (US) and ISO drawing conventions that most often trip up a drawing
 * office working across both systems.
 */

const ROWS: [string, string, string][] = [
  ["Projection", "Third-angle (ANSI/ASME Y14.3)", "First-angle (ISO 128-30)"],
  ["Units", "Inches by default (metric drawings marked)", "Millimetres by default"],
  ["Decimal point", "Period (0.500)", "Comma in many countries (0,500); period also used"],
  ["Dimension origin", "Continuous chain dimensions common", "Datum-oriented (ordinate) dimensioning preferred"],
  ["Dimensioning on drawings", "Dual dimensioning 0.50 [12.7] common", "Single system; dual discouraged"],
  ["GD&T standard", "ASME Y14.5-2018 (formerly ANSI Y14.5)", "ISO 1101 / GPS family (ISO 8015)"],
  ["Modifier for regardless of feature size", "RFS — no symbol, default for position", "Ⓢ (encircled S) explicitly marked"],
  ["Projected tolerance zone", "Circle P symbol", "Ⓟ symbol (ISO 10578)"],
  ["Tolerance frame leader", "Arrow to feature", "Arrow or leader to surface / dimension"],
  ["Section hatching", "ANSI31-style 45° lines, standard spacing", "ISO hatching; different materials hatch differently"],
  ["Surface texture", "ASME Y14.36 / B46.1 symbols", "ISO 1302 check-mark symbol"],
  ["Welding symbols", "AWS A2.4", "ISO 2553"],
  ["Title / general notes", "“UNLESS OTHERWISE SPECIFIED…”", "ISO 7200 title blocks; 8015 general tolerancing"],
  ["Scales", "1:2, 1:4, 1:8, 1:16 (civil), 1:20, 1:50 (SI)", "1:2, 1:5, 1:10, 1:20, 1:50, 1:100 preferred"],
];

export default function DrawingStandardsComparatorAnsiVsIso() {
  return (
    <RefTable
      title="ANSI (ASME) vs ISO drawing conventions"
      search
      cols={["Topic", "ANSI / ASME", "ISO"]}
      rows={ROWS.map((r) => r)}
      note="The single most expensive mistake is mixing the two: a file drawn in inches with ISO first-angle views, or an ASME Y14.5 position tolerance interpreted under ISO rules (where RFS is not the default). State the governing standard in the title block."
    />
  );
}
