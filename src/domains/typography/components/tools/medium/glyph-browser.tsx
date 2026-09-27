"use client";

import { useMemo, useState } from "react";
import { CopyBtn, Panel, PanelTitle, Res, ResBox, Sel, SliderNum, TextInput } from "../ui";
import { FONTS } from "../fonts";

const PAGE = 144;

/**
 * Glyph Browser — walks the printable code points of a chosen face and measures
 * each one's advance width with the Canvas API, so the browser reports the
 * font's real metrics (as rendered) rather than a table copied from elsewhere.
 * Cells that draw a fallback are marked, using the same font-matching check the
 * renderer uses.
 */
export default function GlyphBrowser() {
  const [fontName, setFontName] = useState("Fraunces");
  const [size, setSize] = useState("34");
  const [start, setStart] = useState("0x20");
  const [count, setCount] = useState("144");
  const [selected, setSelected] = useState<string>("A");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[1];
  const px = Math.min(96, Math.max(12, parseFloat(size) || 34));
  const startCp = (() => {
    const s = start.trim();
    const n = s.startsWith("0x") ? parseInt(s, 16) : parseInt(s, 10);
    return Number.isFinite(n) ? Math.max(0x20, Math.min(0x9fff, n)) : 0x20;
  })();
  const n = Math.min(480, Math.max(16, Math.round(parseFloat(count) || PAGE)));

  const glyphs = useMemo(() => {
    const ctx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
    const out: { ch: string; code: string; width: number | null; native: boolean }[] = [];
    for (let i = 0; i < n; i++) {
      const cp = startCp + i;
      if (cp > 0x10ffff) break;
      const ch = String.fromCodePoint(cp);
      let width: number | null = null;
      let native = false;
      if (ctx) {
        ctx.font = `${px}px ${font.stack}`;
        width = ctx.measureText(ch).width;
      }
      if (typeof document !== "undefined" && document.fonts) {
        try {
          native = document.fonts.check(`${px}px ${font.stack}`, ch);
        } catch {
          native = false;
        }
      }
      out.push({ ch, code: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`, width, native });
    }
    return out;
  }, [font, px, startCp, n]);

  const widths = glyphs.map((g) => g.width).filter((w): w is number => typeof w === "number" && w > 0);
  const avg = widths.length ? widths.reduce((a, b) => a + b, 0) / widths.length : 0;
  const nativeCount = glyphs.filter((g) => g.native).length;
  const sel = glyphs.find((g) => g.ch === selected) ?? glyphs[0];

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle>Face & range</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-4">
          <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: f.name }))} />
          <TextInput name="start" label="Start code point" value={start} onChange={setStart} placeholder="0x20 or 32" />
          <SliderNum name="count" label="Glyphs shown" value={count} onChange={setCount} min={16} max={480} step={16} />
          <SliderNum name="size" label="Cell size" unit="px" value={size} onChange={setSize} min={12} max={96} step={2} />
        </div>
        <ResBox>
          <Res name="shown" label="Glyphs shown" value={String(glyphs.length)} />
          <Res name="native" label="Drawn by this face" value={`${nativeCount} / ${glyphs.length}`} />
          <Res name="avg" label="Average advance" value={avg ? `${avg.toFixed(2)}px (${(avg / px).toFixed(3)}em)` : "—"} />
          <Res name="start" label="Range" value={glyphs.length ? `${glyphs[0].code} – ${glyphs[glyphs.length - 1].code}` : "—"} />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Glyph grid</PanelTitle>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9" data-testid="glyph-grid">
          {glyphs.map((g) => (
            <button
              key={g.code}
              type="button"
              onClick={() => setSelected(g.ch)}
              className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                selected === g.ch ? "border-primary bg-primary/10" : "border-border bg-card/40 hover:bg-accent"
              }`}
            >
              <span className="block truncate" style={{ fontFamily: font.stack, fontSize: `${Math.min(px, 34)}px`, lineHeight: 1.1 }}>
                {g.ch}
              </span>
              <span className="mt-1 block font-mono text-[9px] text-muted-foreground">{g.code.replace("U+", "")}</span>
              {!g.native && <span className="mt-0.5 block text-[9px] text-amber-500">fallback</span>}
            </button>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Selected glyph</PanelTitle>
        <div className="flex flex-wrap items-center gap-6">
          <span style={{ fontFamily: font.stack, fontSize: `${Math.min(160, px * 3)}px`, lineHeight: 1 }} className="text-foreground" data-testid="glyph-detail">
            {sel?.ch}
          </span>
          <div className="min-w-[220px] flex-1">
            <RefRow label="Code point" value={sel?.code ?? "—"} />
            <RefRow label="Advance width" value={sel?.width ? `${sel.width.toFixed(3)}px` : "—"} />
            <RefRow label="In em units" value={sel?.width ? `${(sel.width / px).toFixed(4)}em` : "—"} />
            <RefRow label="Drawn by" value={sel ? (sel.native ? `${font.name} (native)` : "a fallback face") : "—"} />
            <div className="mt-3 flex flex-wrap gap-2">
              {sel && <CopyBtn text={sel.ch} label="Copy character" />}
              {sel && <CopyBtn text={sel.code} label="Copy code point" />}
              {sel && <CopyBtn text={`&#x${sel.code.slice(2)};`} label="Copy HTML entity" />}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Advance widths are measured by the browser's text engine at {px}px, which already includes kerning and any
          font-feature defaults the face applies. A glyph marked “fallback” is not in this face and will be substituted at
          render time.
        </p>
      </Panel>
    </div>
  );
}

function RefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}
