"use client";

import { useMemo, useState } from "react";
import { CopyBtn, Panel, PanelTitle, RefTable, Sel, TextInput } from "../ui";

interface Block {
  name: string;
  range: [number, number];
  note: string;
}

const BLOCKS: Block[] = [
  { name: "Arrows", range: [0x2190, 0x21ff], note: "Directional arrows used in flows and notation." },
  { name: "Mathematical operators", range: [0x2200, 0x22ff], note: "∀ ∂ ∈ ∉ ∏ ∑ √ ∞ ≈ ≠ ≤ ≥." },
  { name: "Geometric shapes", range: [0x25a0, 0x25ff], note: "Squares, circles, triangles — the shape vocabulary of diagrams." },
  { name: "Miscellaneous symbols", range: [0x2600, 0x26ff], note: "Weather, chess, zodiac, card suits." },
  { name: "Dingbats", range: [0x2700, 0x27bf], note: "Check marks, crosses, stars, scissors, envelopes." },
  { name: "Misc. symbols & arrows", range: [0x2b00, 0x2bff], note: "Extra arrows and stars for icons." },
  { name: "Box drawing", range: [0x2500, 0x257f], note: "ASCII-art frames and rules." },
  { name: "Braille patterns", range: [0x2800, 0x28ff], note: "256 dot patterns, also used as a block-shading hack." },
];

const PAGE = 96;

/**
 * Dingbat & Symbol Explorer — walks the symbol planes of Unicode by block and
 * renders each code point with its hexadecimal code, so a symbol seen in a
 * design can be identified and copied. Blocks are the reliable unit here:
 * unlike emoji, dingbats and marks are single code points with stable shapes.
 */
export default function DingbatAndSymbolExplorer() {
  const [blockName, setBlockName] = useState(BLOCKS[4].name);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");

  const block = BLOCKS.find((b) => b.name === blockName) ?? BLOCKS[0];
  const all = useMemo(() => {
    const out: { ch: string; code: string }[] = [];
    for (let cp = block.range[0]; cp <= block.range[1]; cp++) {
      out.push({ ch: String.fromCodePoint(cp), code: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}` });
    }
    return out;
  }, [block]);

  const filtered = query.trim()
    ? all.filter((c) => c.code.toLowerCase().includes(query.trim().toLowerCase()))
    : all;
  const maxPage = Math.max(0, Math.ceil(filtered.length / PAGE) - 1);
  const safePage = Math.min(page, maxPage);
  const visible = filtered.slice(safePage * PAGE, safePage * PAGE + PAGE);

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle>Block & filter</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <Sel
            name="block"
            label="Unicode block"
            value={blockName}
            onChange={(v) => {
              setBlockName(v);
              setPage(0);
            }}
            options={BLOCKS.map((b) => ({ value: b.name, label: `${b.name} (${b.range[1] - b.range[0] + 1})` }))}
          />
          <TextInput
            name="query"
            label="Filter by code"
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(0);
            }}
            placeholder="U+2705"
          />
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Page
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-mono text-xs text-muted-foreground">
                {safePage + 1} / {maxPage + 1}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                disabled={safePage >= maxPage}
                className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {block.note} · full range {`U+${block.range[0].toString(16).toUpperCase()}–U+${block.range[1].toString(16).toUpperCase()}`}
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Characters</PanelTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6" data-testid="symbol-grid">
          {visible.map((c) => (
            <div key={c.code} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card/40 px-3 py-2">
              <span className="font-mono text-xl text-foreground">{c.ch}</span>
              <div className="flex flex-col items-end gap-1">
                <span className="font-mono text-[10px] text-muted-foreground">{c.code}</span>
                <CopyBtn text={c.ch} label="Copy" />
              </div>
            </div>
          ))}
        </div>
        {visible.length === 0 && <p className="text-sm text-muted-foreground">No character matches that code.</p>}
      </Panel>

      <Panel>
        <PanelTitle>Caveats</PanelTitle>
        <RefTable
          cols={["Effect", "Why"]}
          rows={[
            ["Glyph may render as a box", "The current font may not contain that code point — the browser then falls back or shows .notdef."],
            ["Emoji-style rendering", "Some marks (U+2600–U+27BF) have emoji variants selected by U+FE0F and are drawn in colour."],
            ["Width varies", "Symbols from East Asian fonts are often full-width, which changes alignment in monospaced contexts."],
            ["Copy target matters", "Pasting into plain text preserves the character; into HTML you may prefer the numeric reference."],
          ]}
          minWidth={520}
        />
      </Panel>
    </div>
  );
}
