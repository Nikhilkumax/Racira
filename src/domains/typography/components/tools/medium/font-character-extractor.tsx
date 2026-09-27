"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, TextArea, fmt } from "../ui";

/**
 * Font Character Extractor — reduces a body of text to the unique characters it
 * uses and to the compact unicode-range notation a subsetter takes. This is the
 * input step of subsetting: the range list is what the tool that slices the font
 * binary consumes, and it is also what a @font-face `unicode-range` descriptor
 * needs when a face is split into several files.
 */
export default function FontCharacterExtractor() {
  const [text, setText] = useState(
    "Racira Fonts can be used for any purpose. — It subsets well: this sentence alone determines the range list below. Numbers 0123456789 and symbols @#$%&*()…",
  );
  const [includeSpaces, setIncludeSpaces] = useState("skip");

  const chars = [...new Set([...text])].filter((c) => (includeSpaces === "skip" ? !/\s/.test(c) : true));
  const codePoints = chars.map((c) => c.codePointAt(0)!).sort((a, b) => a - b);

  /** Collapse consecutive code points into ranges (the notation subsetters use). */
  const ranges: { start: number; end: number }[] = [];
  for (const cp of codePoints) {
    const last = ranges[ranges.length - 1];
    if (last && cp === last.end + 1) last.end = cp;
    else ranges.push({ start: cp, end: cp });
  }

  const hex = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
  const rangeText = ranges.map((r) => (r.start === r.end ? hex(r.start) : `${hex(r.start)}-${hex(r.end)}`)).join(", ");

  const byCategory = [
    { name: "Lowercase letters", count: chars.filter((c) => /[a-z]/.test(c)).length },
    { name: "Uppercase letters", count: chars.filter((c) => /[A-Z]/.test(c)).length },
    { name: "Digits", count: chars.filter((c) => /[0-9]/.test(c)).length },
    { name: "Punctuation & symbols", count: chars.filter((c) => !/[a-zA-Z0-9\s]/.test(c)).length },
    { name: "Whitespace", count: [...new Set([...text])].filter((c) => /\s/.test(c)).length },
  ];

  const bytes = chars.map((c) => new TextEncoder().encode(c).length);
  const utf8Bytes = bytes.reduce((a, b) => a + b, 0);
  const superscripts = codePoints.filter((cp) => cp > 0xffff).length;

  const glyphs = `${chars.join("")}\n\nCharacters: ${chars.length}\nCode points: ${codePoints.length}\nSuperscript (astral) code points: ${superscripts}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Source text</PanelTitle>
        <TextArea name="text" label="Paste the copy the font must cover" value={text} onChange={setText} rows={8} />
        <div className="mt-3">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Whitespace
          </span>
          <div className="flex gap-4 text-sm">
            {[
              { value: "skip", label: "Exclude (recommended for ranges)" },
              { value: "keep", label: "Include" },
            ].map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2">
                <input type="radio" name="spaces" checked={includeSpaces === o.value} onChange={() => setIncludeSpaces(o.value)} className="accent-primary" />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </div>
        <ResBox>
          <Res name="unique" label="Unique characters" value={String(chars.length)} />
          <Res name="ranges" label="Ranges produced" value={String(ranges.length)} />
          <Res name="bytes" label="UTF-8 payload" value={`${fmt(utf8Bytes, 0)} bytes`} />
          <Res name="astral" label="Astral code points" value={String(superscripts)} />
          <Res name="ratio" label="Reduction vs full Latin-1" value={`${fmt((1 - chars.length / 191) * 100, 1)}%`} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Extracted characters</PanelTitle>
          <p className="break-all rounded-lg border border-border bg-card/40 p-3 font-mono text-sm text-foreground" data-testid="extracted-glyphs">
            {chars.join("") || "—"}
          </p>
          <RefTable
            cols={["Category", "Characters"]}
            rows={byCategory.map((c) => [c.name, String(c.count)])}
            minWidth={320}
          />
        </Panel>

        <Panel>
          <PanelTitle>Unicode ranges</PanelTitle>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Ranges are the compact form the subsetting step consumes; {ranges.length} of them describe all{" "}
            {codePoints.length} code points.
          </p>
          <CodeOut code={rangeText || "/* no characters */"} title="unicode-range" testid="unicode-range" language="css" />
          <CodeOut code={glyphs} title="Characters + summary" testid="glyph-list" language="text" />
        </Panel>
      </div>
    </CalcLayout>
  );
}
