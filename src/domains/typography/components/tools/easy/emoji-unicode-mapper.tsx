"use client";

import { useState } from "react";
import { CopyBtn, Panel, PanelTitle, RefTable, TextInput, TextArea } from "../ui";

interface EmojiEntry {
  emoji: string;
  name: string;
}

const COMMON: EmojiEntry[] = [
  { emoji: "😀", name: "grinning face" },
  { emoji: "😂", name: "face with tears of joy" },
  { emoji: "🥰", name: "smiling face with hearts" },
  { emoji: "🤔", name: "thinking face" },
  { emoji: "👍", name: "thumbs up" },
  { emoji: "🙏", name: "folded hands" },
  { emoji: "🎉", name: "party popper" },
  { emoji: "🔥", name: "fire" },
  { emoji: "✅", name: "check mark button" },
  { emoji: "⚠️", name: "warning (with VS16)" },
  { emoji: "❤️", name: "red heart (with VS16)" },
  { emoji: "🏳️‍🌈", name: "rainbow flag (ZWJ sequence)" },
  { emoji: "👨‍💻", name: "man technologist (ZWJ sequence)" },
  { emoji: "🇺🇸", name: "flag: United States (regional pair)" },
  { emoji: "1️⃣", name: "keycap: 1 (VS16 + enclosing keycap)" },
];

/**
 * Emoji Unicode Mapper — decodes what an emoji actually is in memory: its code
 * points, its UTF-16 units (which is what JavaScript string length counts) and
 * its UTF-8 bytes. It separates three cases that behave very differently in
 * code: single code points, base+variation-selector sequences (U+FE0F), and
 * ZWJ sequences (U+200D) that render as one glyph but contain many code points.
 */
export default function EmojiUnicodeMapper() {
  const [input, setInput] = useState("🎉");
  const [bulk, setBulk] = useState("😀 👍 ❤️ 👨‍💻 1️⃣");

  const analyse = (s: string) => {
    const codePoints = [...s].map((c) => c.codePointAt(0)!);
    const utf16 = s.length;
    const utf8 = new TextEncoder().encode(s).length;
    const zwj = codePoints.filter((c) => c === 0x200d).length;
    const vs16 = codePoints.filter((c) => c === 0xfe0f).length;
    return { codePoints, utf16, utf8, zwj, vs16 };
  };

  const a = analyse(input);
  const bulkEntries = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(bulk)]
    .map((g) => g.segment)
    .filter((g) => g.trim().length > 0);

  const hex = (n: number, pad: number) => n.toString(16).toUpperCase().padStart(pad, "0");

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle>Single emoji</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="input" label="Emoji (paste or type)" value={input} onChange={setInput} placeholder="🎉" />
          <div className="flex items-end">
            <div className="flex flex-wrap gap-1.5">
              {COMMON.slice(0, 8).map((e) => (
                <button
                  key={e.emoji}
                  type="button"
                  title={e.name}
                  onClick={() => setInput(e.emoji)}
                  className="rounded-lg border border-border px-2 py-1 text-lg hover:bg-accent"
                >
                  {e.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-xl border border-border bg-card/40 p-4">
          <span className="text-5xl leading-none">{input || "❓"}</span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-muted-foreground">
              {a.codePoints.map((cp) => `U+${hex(cp, 4)}`).join("  ")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <CopyBtn text={input} label="Copy emoji" />
              <CopyBtn text={a.codePoints.map((cp) => `\\u{${hex(cp, 4)}}`).join("")} label="Copy JS escapes" />
              <CopyBtn text={a.codePoints.map((cp) => `&#x${hex(cp, 4)};`).join("")} label="Copy HTML entities" />
            </div>
          </div>
        </div>

        <RefTable
          cols={["Measure", "Value", "Note"]}
          rows={[
            ["Code points", String(a.codePoints.length), a.codePoints.length > 1 ? "sequence — not a single scalar" : "single scalar value"],
            ["UTF-16 units (JS length)", String(a.utf16), a.utf16 > a.codePoints.length ? "astral characters cost 2 units" : "same as code points"],
            ["UTF-8 bytes", String(a.utf8), "what the wire carries"],
            ["ZWJ joins", String(a.zwj), a.zwj ? "renders as one grapheme, encodes as several" : "none"],
            ["Variation selector U+FE0F", String(a.vs16), a.vs16 ? "forces emoji presentation" : "none"],
          ]}
          minWidth={460}
        />
      </Panel>

      <Panel>
        <PanelTitle>Bulk mapper</PanelTitle>
        <TextArea name="bulk" label="Emoji list" value={bulk} onChange={setBulk} rows={3} placeholder="Paste several emoji…" />
        <div className="mt-3">
          <RefTable
            cols={["Emoji", "Name (known)", "Code points", "JS length", "UTF-8 bytes"]}
            rows={bulkEntries.map((e) => {
              const info = analyse(e);
              const known = COMMON.find((c) => c.emoji === e);
              return [
                <span key="e" className="text-lg">
                  {e}
                </span>,
                known?.name ?? "—",
                <code key="cp" className="font-mono text-[11px]">
                  {info.codePoints.map((cp) => `U+${hex(cp, 4)}`).join(" ")}
                </code>,
                String(info.utf16),
                String(info.utf8),
              ];
            })}
            minWidth={620}
            note="Segmentation uses Intl.Segmenter at grapheme granularity — the same unit a cursor moves through."
          />
        </div>
      </Panel>
    </div>
  );
}
