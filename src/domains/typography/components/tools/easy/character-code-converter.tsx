"use client";

import { useState } from "react";
import { CalcLayout, CopyBtn, Panel, PanelTitle, RefTable, Res, ResBox, TextArea, fmtTrim } from "../ui";

/**
 * Character Code Converter — every encoding a character has, side by side:
 * Unicode code point (dec/hex), HTML entities, CSS escape, JS escape, UTF-8
 * bytes, UTF-16 code units, percent-encoding and binary.
 *
 * Iterates by code point (Array.from), so astral characters (emoji, rare CJK)
 * report the correct U+1F600-style value instead of a broken surrogate half.
 */
function utf8Hex(cp: string): string {
  return [...new TextEncoder().encode(cp)].map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

function binary(n: number, pad = 8): string {
  return n.toString(2).padStart(pad, "0");
}

function describe(ch: string) {
  const cp = ch.codePointAt(0) ?? 0;
  const hex = cp.toString(16).toUpperCase().padStart(4, "0");
  const utf16 = [...ch].map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")).join(" ");
  return {
    ch,
    cp,
    hex,
    htmlDec: `&#${cp};`,
    htmlHex: `&#x${hex};`,
    css: `\\${hex} `,
    js: cp > 0xffff ? `\\u{${hex}}` : `\\u${hex}`,
    utf8: utf8Hex(ch),
    utf16,
    percent: encodeURIComponent(ch),
    binary: binary(cp),
  };
}

export default function CharacterCodeConverter() {
  const [text, setText] = useState("Aé→😀");

  const chars = Array.from(text).slice(0, 200);
  const rows = chars.map((ch) => {
    const d = describe(ch);
    return [
      <span key="c" className="text-base text-foreground">{ch}</span>,
      `U+${d.hex}`,
      String(d.cp),
      d.htmlHex,
      d.css,
      d.utf8,
      d.utf16,
      d.binary,
      d.percent,
    ];
  });

  const summary = chars.length
    ? `characters: ${chars.length} · code points: ${chars.length} · UTF-8 bytes: ${chars.reduce((n, c) => n + new TextEncoder().encode(c).length, 0)}`
    : "—";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Input</PanelTitle>
        <TextArea name="text" label="Text or single character" value={text} onChange={setText} rows={5} />
        <ResBox>
          <Res name="chars" label="Characters" value={text ? String(Array.from(text).length) : "0"} />
          <Res name="bytes" label="UTF-8 bytes" value={String(new TextEncoder().encode(text).length)} />
          <Res name="codeunits" label="UTF-16 code units" value={String(text.length)} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{summary}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Emoji and rare CJK live above U+FFFF: they take two UTF-16 code units but one code point, which is why the two
          counts differ whenever the text contains them.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Encodings</PanelTitle>
          <RefTable
            cols={["Char", "Code point", "Decimal", "HTML entity", "CSS escape", "UTF-8 bytes", "UTF-16 units", "Binary", "%"]}
            rows={rows}
            minWidth={860}
            note="HTML entity shown in hex form — decimal entities work everywhere too."
          />
        </Panel>
        <Panel>
          <PanelTitle>Copy-ready values</PanelTitle>
          <div className="space-y-2">
            {chars.slice(0, 6).map((ch) => {
              const d = describe(ch);
              return (
                <div key={`${d.hex}-${d.cp}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/40 px-3 py-2">
                  <span className="w-6 text-center font-mono text-sm text-foreground">{ch}</span>
                  <code className="font-mono text-xs text-muted-foreground">U+{d.hex}</code>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{d.css}</code>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{d.js}</code>
                  <span className="ml-auto">
                    <CopyBtn text={d.css.trim()} label={`Copy ${ch}`} />
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Design-tool tracking reminder: {fmtTrim(chars.length, 0)} character(s) at 16px can add{" "}
            {fmtTrim(chars.length * 16 * 0.02, 2)}px of width at 0.02em tracking.
          </p>
        </Panel>
      </div>
    </CalcLayout>
  );
}
