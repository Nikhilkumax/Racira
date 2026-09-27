"use client";

import { useState } from "react";
import { Panel, PanelTitle, RefTable, Sel, TextInput, fmt } from "../ui";

interface UniBlock {
  name: string;
  start: number;
  end: number;
  plane: number;
  note: string;
}

/** A representative slice of Unicode blocks (the full set is 300+); planes 0–2. */
const BLOCKS: UniBlock[] = [
  { name: "Basic Latin", start: 0x0000, end: 0x007f, plane: 0, note: "ASCII — controls, punctuation, digits, upper/lowercase Latin." },
  { name: "Latin-1 Supplement", start: 0x0080, end: 0x00ff, plane: 0, note: "Western European accents, ©, ®, ¿, ¡." },
  { name: "Latin Extended-A", start: 0x0100, end: 0x017f, plane: 0, note: "Central/Eastern European Latin letters." },
  { name: "Greek and Coptic", start: 0x0370, end: 0x03ff, plane: 0, note: "Greek alphabet and math symbols." },
  { name: "Cyrillic", start: 0x0400, end: 0x04ff, plane: 0, note: "Russian and other Cyrillic-script languages." },
  { name: "Hebrew", start: 0x0590, end: 0x05ff, plane: 0, note: "Hebrew alphabet with niqqud." },
  { name: "Arabic", start: 0x0600, end: 0x06ff, plane: 0, note: "Arabic script — positional forms." },
  { name: "Devanagari", start: 0x0900, end: 0x097f, plane: 0, note: "Hindi, Marathi, Sanskrit." },
  { name: "General Punctuation", start: 0x2000, end: 0x206f, plane: 0, note: "Dashes, quotes, spaces, invisible operators." },
  { name: "Superscripts and Subscripts", start: 0x2070, end: 0x209f, plane: 0, note: "⁰¹²³⁴⁵⁶⁷⁸⁹ and subscript digits." },
  { name: "Currency Symbols", start: 0x20a0, end: 0x20cf, plane: 0, note: "€ ₹ ₽ ₺ ₩ and historic currency signs." },
  { name: "Letterlike Symbols", start: 0x2100, end: 0x214f, plane: 0, note: "™ ℠ № ℗ Ω K Å." },
  { name: "Number Forms", start: 0x2150, end: 0x218f, plane: 0, note: "Roman numerals, fractions ⅓ ⅔ ⅛." },
  { name: "Arrows", start: 0x2190, end: 0x21ff, plane: 0, note: "→ ← ↑ ↓ ↔ ⇧ ⇩." },
  { name: "Mathematical Operators", start: 0x2200, end: 0x22ff, plane: 0, note: "∀ ∃ ∈ ∉ ∑ ∏ √ ∞." },
  { name: "Box Drawing", start: 0x2500, end: 0x257f, plane: 0, note: "Frames and rules for text UI." },
  { name: "Block Elements", start: 0x2580, end: 0x259f, plane: 0, note: "Shade blocks used for bar charts in text." },
  { name: "Geometric Shapes", start: 0x25a0, end: 0x25ff, plane: 0, note: "■ □ ▲ ● ◆." },
  { name: "Miscellaneous Symbols", start: 0x2600, end: 0x26ff, plane: 0, note: "☀ ☂ ☎ ☕ ⚡ (many have emoji variants)." },
  { name: "Dingbats", start: 0x2700, end: 0x27bf, plane: 0, note: "✓ ✗ ✦ ✉ ✂." },
  { name: "CJK Symbols and Punctuation", start: 0x3000, end: 0x303f, plane: 0, note: "CJK brackets, iteration marks." },
  { name: "Hiragana", start: 0x3040, end: 0x309f, plane: 0, note: "Japanese syllabary." },
  { name: "Katakana", start: 0x30a0, end: 0x30ff, plane: 0, note: "Japanese syllabary for loanwords." },
  { name: "CJK Unified Ideographs", start: 0x4e00, end: 0x9fff, plane: 0, note: "The main Han ideograph block — 20,992 code points." },
  { name: "Hangul Syllables", start: 0xac00, end: 0xd7af, plane: 0, note: "Precomposed Korean syllables — 11,172 code points." },
  { name: "Private Use Area", start: 0xe000, end: 0xf8ff, plane: 0, note: "No assigned meaning — icon fonts live here." },
  { name: "Emoticons", start: 0x1f600, end: 0x1f64f, plane: 1, note: "The classic emoji faces (plane 1, surrogate pairs in UTF-16)." },
  { name: "Transport and Map Symbols", start: 0x1f680, end: 0x1f6ff, plane: 1, note: "🚀 🚗 🗺 — mixed emoji and pictographs." },
  { name: "Supplemental Symbols and Pictographs", start: 0x1f900, end: 0x1f9ff, plane: 1, note: "🤖 🥑 🦄 — the modern emoji additions." },
  { name: "CJK Unified Ideographs Extension B", start: 0x20000, end: 0x2a6df, plane: 2, note: "Rare Han characters — beyond the BMP." },
];

/**
 * Unicode Block Explorer — a searchable index of the blocks most often met in
 * typography work, with each block's code-point range, plane and size. The
 * plane column matters because plane 1+ characters are outside the BMP and cost
 * two UTF-16 code units, which changes string length in JavaScript.
 */
export default function UnicodeBlockExplorer() {
  const [query, setQuery] = useState("");
  const [plane, setPlane] = useState("all");

  const filtered = BLOCKS.filter((b) => (plane === "all" ? true : String(b.plane) === plane)).filter((b) =>
    query.trim() ? (b.name + b.note).toLowerCase().includes(query.trim().toLowerCase()) : true,
  );

  const format = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
  const rows = filtered.map((b) => [
    b.name,
    `${format(b.start)} – ${format(b.end)}`,
    String(b.plane),
    fmt(b.end - b.start + 1, 0),
    b.plane === 0 ? "BMP — 1 UTF-16 unit" : "astral — 2 UTF-16 units",
    b.note,
  ]);

  const totals = BLOCKS.reduce((n, b) => n + (b.end - b.start + 1), 0);

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle>Filter</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput name="query" label="Search blocks" value={query} onChange={setQuery} placeholder="emoji, math, CJK…" />
          <Sel
            name="plane"
            label="Plane"
            value={plane}
            onChange={setPlane}
            options={[
              { value: "all", label: `All planes (${BLOCKS.length} blocks)` },
              { value: "0", label: "Plane 0 — Basic Multilingual" },
              { value: "1", label: "Plane 1 — Supplementary Multilingual" },
              { value: "2", label: "Plane 2 — Supplementary Ideographic" },
            ]}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {filtered.length} block(s) shown · {fmt(totals, 0)} code points across the indexed blocks ·{" "}
          {filtered.reduce((n, b) => n + (b.end - b.start + 1), 0).toLocaleString()} in the current filter
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Blocks</PanelTitle>
        <RefTable
          cols={["Block", "Range", "Plane", "Code points", "UTF-16 cost", "Notes"]}
          rows={rows}
          search
          minWidth={760}
          note="Unicode 15 assigns 149,813 characters across 327 blocks; this index covers the blocks encountered in web and editorial typography."
        />
      </Panel>
    </div>
  );
}
