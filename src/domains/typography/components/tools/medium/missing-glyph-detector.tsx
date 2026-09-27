"use client";

import { useMemo, useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Res, ResBox, Sel, TextArea, fmt } from "../ui";
import { FONTS } from "../fonts";

interface Coverage {
  ch: string;
  code: string;
  supported: boolean;
  bucket: string;
}

/** Groups used to summarise what fraction of each block a face covers. */
const BUCKETS: { name: string; test: (cp: number) => boolean }[] = [
  { name: "Basic Latin", test: (cp) => cp >= 0x20 && cp <= 0x7e },
  { name: "Latin-1 supplement", test: (cp) => cp >= 0xa0 && cp <= 0xff },
  { name: "General punctuation", test: (cp) => cp >= 0x2000 && cp <= 0x206f },
  { name: "Currency", test: (cp) => cp >= 0x20a0 && cp <= 0x20bf },
  { name: "Arrows / math", test: (cp) => cp >= 0x2190 && cp <= 0x22ff },
  { name: "Symbols / dingbats", test: (cp) => cp >= 0x2600 && cp <= 0x27bf },
  { name: "CJK", test: (cp) => cp >= 0x3000 && cp <= 0x9fff },
  { name: "Emoji (P1)", test: (cp) => cp >= 0x1f300 && cp <= 0x1faff },
];

const DEFAULT_TEXT = "Racira Fonts — € £ ¥ © ® ™ → ≠ ≈ ✓ ☂ 中文 日本語 😀 1/2 “quotes”";

/**
 * Missing Glyph Detector — asks the browser's own font-matching engine whether
 * the chosen face can render each character (FontFaceSet.check). That is the
 * real answer rather than a heuristic: if the face lacks the code point the
 * browser reports it as unavailable, and the character falls back at render
 * time. The grouped summary shows which blocks the face covers.
 */
export default function MissingGlyphDetector() {
  const [fontName, setFontName] = useState("Inter");
  const [text, setText] = useState(DEFAULT_TEXT);

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[0];

  const results = useMemo<Coverage[]>(() => {
    if (typeof document === "undefined" || !document.fonts) return [];
    const chars = [...new Set([...text])].filter((c) => c.trim().length > 0);
    return chars.map((ch) => {
      const cp = ch.codePointAt(0)!;
      let supported = false;
      try {
        supported = document.fonts.check(`16px ${font.stack}`, ch);
      } catch {
        supported = false;
      }
      return {
        ch,
        code: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`,
        supported,
        bucket: BUCKETS.find((b) => b.test(cp))?.name ?? "other",
      };
    });
  }, [text, font]);

  const missing = results.filter((r) => !r.supported);
  const covered = results.length - missing.length;

  const bucketRows = BUCKETS.map((b) => {
    const inBucket = results.filter((r) => r.bucket === b.name);
    if (!inBucket.length) return null;
    const ok = inBucket.filter((r) => r.supported).length;
    return [
      b.name,
      `${ok} / ${inBucket.length}`,
      `${fmt((ok / inBucket.length) * 100, 0)}%`,
      ok === inBucket.length ? "fully covered" : `${inBucket.length - ok} missing`,
    ];
  }).filter(Boolean) as string[][];

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Face & characters</PanelTitle>
        <Sel name="font" label="Face to test" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
        <div className="mt-3">
          <TextArea name="text" label="Characters to test (duplicates are ignored)" value={text} onChange={setText} rows={4} />
        </div>
        <ResBox>
          <Res name="unique" label="Unique characters" value={String(results.length)} />
          <Res name="covered" label="Covered by this face" value={`${covered}`} />
          <Res name="missing" label="Needs a fallback" value={`${missing.length}`} />
          <Res name="ratio" label="Coverage" value={results.length ? `${fmt((covered / results.length) * 100, 1)}%` : "—"} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Detection uses <span className="font-mono">document.fonts.check()</span>, the browser's own font-matching API — the
          same machinery that decides at paint time whether to substitute a fallback.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Honest rendering</PanelTitle>
          <p className="break-words text-foreground" style={{ fontFamily: font.stack, fontSize: "28px", lineHeight: 1.5 }} data-testid="glyph-sample">
            {text}
          </p>
          {missing.length > 0 && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {missing.length} character(s) are drawn by a fallback face:{" "}
              <span className="font-mono">{missing.map((m) => m.code).join(", ")}</span>
            </p>
          )}
        </Panel>

        <Panel>
          <PanelTitle>Coverage by block</PanelTitle>
          <RefTable cols={["Block", "Covered", "Share", "Note"]} rows={bucketRows} minWidth={480} />
        </Panel>

        <Panel>
          <PanelTitle>Character detail</PanelTitle>
          <RefTable
            cols={["Char", "Code point", "Rendered by", "Block"]}
            rows={results.map((r) => [
              <span key="c" className="text-lg" style={{ fontFamily: font.stack }}>
                {r.ch}
              </span>,
              <code key="cp" className="font-mono text-[11px]">
                {r.code}
              </code>,
              r.supported ? "this face" : "fallback face",
              r.bucket,
            ])}
            search
            minWidth={520}
            note="Search the table to check a specific character or block."
          />
        </Panel>
      </div>
    </CalcLayout>
  );
}
