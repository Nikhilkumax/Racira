"use client";

import { useState } from "react";
import { Btn, Panel, PanelTitle, Res, ResBox, fmtTrim } from "../ui";
import { contrastRatio, normalizeHex, parseHex, ratioVerdict } from "../color";

/**
 * Color on Color Text Checker — batch WCAG check for a palette: every
 * foreground/background pair gets a ratio and AA/AAA verdict, plus a rendered
 * sample so failures are visible as well as measured.
 */
interface Pair {
  id: number;
  label: string;
  fg: string;
  bg: string;
}

const INITIAL: Pair[] = [
  { id: 1, label: "Body on surface", fg: "#1f2937", bg: "#ffffff" },
  { id: 2, label: "Muted caption", fg: "#9ca3af", bg: "#ffffff" },
  { id: 3, label: "Link on tint", fg: "#7c3aed", bg: "#f3e8ff" },
  { id: 4, label: "Badge text", fg: "#fbbf24", bg: "#78350f" },
];

export default function ColorOnColorTextChecker() {
  const [pairs, setPairs] = useState<Pair[]>(INITIAL);
  const [large, setLarge] = useState(false);

  const update = (id: number, patch: Partial<Pair>) =>
    setPairs((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const results = pairs.map((p) => {
    const fg = parseHex(p.fg);
    const bg = parseHex(p.bg);
    const ratio = fg && bg ? contrastRatio(fg, bg) : NaN;
    return { pair: p, ratio, verdicts: Number.isFinite(ratio) ? ratioVerdict(ratio, large) : [] };
  });
  const failures = results.filter((r) => Number.isFinite(r.ratio) && r.ratio < (large ? 3 : 4.5)).length;

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle>Palette pairs</PanelTitle>
        <div className="space-y-3">
          {pairs.map((p) => (
            <div key={p.id} className="grid items-center gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
              <input
                type="text"
                value={p.label}
                onChange={(e) => update(p.id, { label: e.target.value })}
                aria-label={`Pair ${p.id} label`}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">fg</span>
                <input
                  type="color"
                  value={normalizeHex(p.fg) ?? "#000000"}
                  onChange={(e) => update(p.id, { fg: e.target.value })}
                  aria-label={`Pair ${p.id} foreground`}
                  className="h-9 w-10 cursor-pointer rounded-md border border-border bg-background"
                />
                <input
                  type="text"
                  value={p.fg}
                  onChange={(e) => update(p.id, { fg: e.target.value })}
                  aria-label={`Pair ${p.id} foreground hex`}
                  className="w-24 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">bg</span>
                <input
                  type="color"
                  value={normalizeHex(p.bg) ?? "#ffffff"}
                  onChange={(e) => update(p.id, { bg: e.target.value })}
                  aria-label={`Pair ${p.id} background`}
                  className="h-9 w-10 cursor-pointer rounded-md border border-border bg-background"
                />
                <input
                  type="text"
                  value={p.bg}
                  onChange={(e) => update(p.id, { bg: e.target.value })}
                  aria-label={`Pair ${p.id} background hex`}
                  className="w-24 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <Btn kind="ghost" onClick={() => setPairs((ps) => ps.filter((x) => x.id !== p.id))} testid={`remove-${p.id}`}>
                Remove
              </Btn>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Btn
            kind="ghost"
            onClick={() => setPairs((ps) => [...ps, { id: Math.max(0, ...ps.map((p) => p.id)) + 1, label: "New pair", fg: "#111827", bg: "#ffffff" }])}
            testid="add-pair"
          >
            Add pair
          </Btn>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={large} onChange={(e) => setLarge(e.target.checked)} className="accent-primary" />
            Treat as large text (≥24px or ≥18.66px bold)
          </label>
        </div>
        <ResBox>
          <Res name="count" label="Pairs checked" value={String(pairs.length)} />
          <Res name="fail" label={large ? "Below 3:1" : "Below 4.5:1"} value={String(failures)} />
        </ResBox>
      </Panel>

      <Panel>
        <PanelTitle>Measured verdicts</PanelTitle>
        <div className="space-y-3">
          {results.map(({ pair, ratio, verdicts }) => {
            const fgNorm = normalizeHex(pair.fg) ?? "#000000";
            const bgNorm = normalizeHex(pair.bg) ?? "#ffffff";
            return (
              <div key={pair.id} className="rounded-xl border border-border bg-card/40 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{pair.label}</span>
                  <span className="font-mono text-sm text-foreground">
                    {Number.isFinite(ratio) ? `${fmtTrim(ratio, 2)}:1` : "invalid color"}
                  </span>
                </div>
                <div
                  className="mt-2 rounded-lg p-3"
                  style={{ background: bgNorm, color: fgNorm }}
                  data-testid={`sample-${pair.id}`}
                >
                  <span style={{ fontSize: large ? 26 : 16, fontWeight: large ? 700 : 400 }}>
                    Sample text — check it with your eyes too
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {verdicts.map((v) => (
                    <span
                      key={v.label}
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        v.pass ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {v.label} {v.pass ? "pass" : "fail"}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
