"use client";

import { useState } from "react";
import { Btn, CalcLayout, Panel, PanelTitle, Res, ResBox, fmt } from "../easy/ui";

type Dim = { name: string; nom: string; tol: string };

/**
 * Tolerance Stack-Up Analyzer — linear stack along one axis:
 *   worst case:  Σnom ± Σ|tol|
 *   statistical: Σnom ± √(Σtol²)   (RSS, assumes independent normal distributions)
 * The RSS saving is the reduction in total spread, WC − RSS, reported as a
 * percentage of the worst-case spread.
 */
export default function ToleranceStackUpAnalyzer() {
  const [rows, setRows] = useState<Dim[]>([
    { name: "Housing", nom: "50", tol: "0.3" },
    { name: "Spacer", nom: "10", tol: "0.1" },
    { name: "Shaft", nom: "25", tol: "0.2" },
  ]);

  const dims = rows.map((r) => ({ nom: parseFloat(r.nom), tol: Math.abs(parseFloat(r.tol)) }));
  const valid = dims.length >= 1 && dims.every((d) => Number.isFinite(d.nom) && Number.isFinite(d.tol));

  const nom = valid ? dims.reduce((s, d) => s + d.nom, 0) : NaN;
  const wc = valid ? dims.reduce((s, d) => s + d.tol, 0) : NaN;
  const rss = valid ? Math.sqrt(dims.reduce((s, d) => s + d.tol * d.tol, 0)) : NaN;

  const setCell = (i: number, k: keyof Dim, v: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows((rs) => [...rs, { name: `Part ${rs.length + 1}`, nom: "10", tol: "0.1" }]);
  const rmRow = () => setRows((rs) => (rs.length > 1 ? rs.slice(0, -1) : rs));

  const pct = (n: number) => (Number.isFinite(n) ? `${fmt(n, 1)}%` : "—");

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Stack dimensions (± tolerances)</PanelTitle>
        <div className="space-y-1.5">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.2fr_1fr_auto] items-center gap-2">
              <input
                data-testid={`in-name${i}`}
                type="text"
                value={r.name}
                onChange={(e) => setCell(i, "name", e.target.value)}
                placeholder="Part name"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
              <input
                data-testid={`in-nom${i}`}
                type="number"
                inputMode="decimal"
                value={r.nom}
                onChange={(e) => setCell(i, "nom", e.target.value)}
                placeholder="nominal"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
              />
              <input
                data-testid={`in-tol${i}`}
                type="number"
                inputMode="decimal"
                value={r.tol}
                onChange={(e) => setCell(i, "tol", e.target.value)}
                placeholder="± tol"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                data-testid={`rm-row-${i}`}
                onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                disabled={rows.length <= 1}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Remove ${r.name || `row ${i + 1}`}`}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Btn kind="ghost" testid="add-dim" onClick={addRow}>+ Add dimension</Btn>
            {rows.length > 1 && (
              <Btn kind="ghost" testid="rm-dim" onClick={rmRow}>− Remove last</Btn>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Every dimension is assumed to act along the same axis. The ± tolerance is taken as
          absolute. All results are in the same unit as the inputs.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="nom" label="Stack nominal" value={valid ? `${fmt(nom)}` : "—"} />
          <Res name="wc-min" label="Worst-case minimum" value={valid ? fmt(nom - wc) : "—"} />
          <Res name="wc-max" label="Worst-case maximum" value={valid ? fmt(nom + wc) : "—"} />
          <Res name="wc-spread" label="Worst-case spread" value={valid ? `± ${fmt(wc)}` : "—"} />
          <Res name="rss-min" label="RSS minimum" value={valid ? fmt(nom - rss) : "—"} />
          <Res name="rss-max" label="RSS maximum" value={valid ? fmt(nom + rss) : "—"} />
          <Res name="rss-spread" label="RSS spread" value={valid ? `± ${fmt(rss)}` : "—"} />
          <Res
            name="saving"
            label="RSS vs worst-case"
            value={valid ? `${fmt(wc - rss)} narrower (${pct(((wc - rss) / wc) * 100)})` : "—"}
          />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Worst case adds every tolerance; RSS takes the square root of the sum of the squares,
          which is realistic only when the parts are statistically independent.
        </p>
      </Panel>
    </CalcLayout>
  );
}