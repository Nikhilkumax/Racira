"use client";

import { useState } from "react";
import { Btn, CalcLayout, Panel, PanelTitle, Res, ResBox } from "../easy/ui";

type Row = { part: string; material: string; qty: string; unit: string; notes: string };

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * Parts List (BOM) Builder — editable item table with quantity totals and a
 * copyable CSV export. Line-item numbers are assigned automatically.
 */
export default function PartsListBomBuilder() {
  const [rows, setRows] = useState<Row[]>([
    { part: "Bracket", material: "Aluminium 6061", qty: "2", unit: "pcs", notes: "CNC machined" },
    { part: "M4 × 0.7 cap screw", material: "Steel", qty: "8", unit: "pcs", notes: "" },
    { part: "Flat washer M4", material: "Steel", qty: "8", unit: "pcs", notes: "DIN 125" },
  ]);
  const [status, setStatus] = useState("");

  const parsed = rows.map((r) => ({ ...r, qtyv: parseFloat(r.qty) }));
  const lines = parsed.filter((r) => r.part.trim() !== "");
  const total = lines.reduce((s, r) => s + (Number.isFinite(r.qtyv) ? r.qtyv : 0), 0);

  const setCell = (i: number, k: keyof Row, v: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows((rs) => [...rs, { part: "", material: "", qty: "1", unit: "pcs", notes: "" }]);
  const rmRow = () => setRows((rs) => (rs.length > 1 ? rs.slice(0, -1) : rs));

  const csv = [
    "Item,Part,Material,Qty,Unit,Notes",
    ...lines.map((r, i) =>
      [String(i + 1), csvCell(r.part), csvCell(r.material), csvCell(r.qty), csvCell(r.unit), csvCell(r.notes)].join(","),
    ),
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(csv);
      setStatus(`Copied ${lines.length} line items`);
    } catch {
      setStatus("Copy blocked — select the CSV preview below manually");
    }
  };

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Bill of materials</PanelTitle>
        <div className="space-y-1.5">
          <div className="grid grid-cols-[1.6fr_1.2fr_0.7fr_0.9fr_1fr_auto] gap-2 px-1">
            {["Part", "Material", "Qty", "Unit", "Notes", ""].map((h, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {h}
              </span>
            ))}
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1.6fr_1.2fr_0.7fr_0.9fr_1fr_auto] items-center gap-2">
              <input
                data-testid={`in-part${i}`}
                type="text"
                value={r.part}
                onChange={(e) => setCell(i, "part", e.target.value)}
                placeholder="Part name"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
              <input
                data-testid={`in-mat${i}`}
                type="text"
                value={r.material}
                onChange={(e) => setCell(i, "material", e.target.value)}
                placeholder="Material"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
              <input
                data-testid={`in-qty${i}`}
                type="number"
                inputMode="decimal"
                value={r.qty}
                onChange={(e) => setCell(i, "qty", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
              />
              <input
                data-testid={`in-unit${i}`}
                type="text"
                value={r.unit}
                onChange={(e) => setCell(i, "unit", e.target.value)}
                placeholder="unit"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
              <input
                data-testid={`in-notes${i}`}
                type="text"
                value={r.notes}
                onChange={(e) => setCell(i, "notes", e.target.value)}
                placeholder="Notes"
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                data-testid={`rm-row-${i}`}
                onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                disabled={rows.length <= 1}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Remove row ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Btn kind="ghost" testid="add-row" onClick={addRow}>+ Add row</Btn>
            {rows.length > 1 && (
              <Btn kind="ghost" testid="rm-row" onClick={rmRow}>− Remove last</Btn>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Item numbers are assigned automatically in row order. Empty part names are excluded
          from the totals and the CSV export.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Totals & export</PanelTitle>
        <ResBox>
          <Res name="lines" label="Line items" value={String(lines.length)} />
          <Res name="total" label="Total quantity" value={String(total)} />
        </ResBox>
        <div className="mt-3 flex items-center gap-2">
          <Btn testid="copy-csv" onClick={copy}>Copy CSV</Btn>
          {status && <span data-testid="res-status" className="text-xs text-muted-foreground">{status}</span>}
        </div>
        <div className="mt-3">
          <pre
            data-testid="res-csv"
            className="max-h-64 overflow-auto rounded-xl border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-foreground"
          >
            {csv}
          </pre>
        </div>
      </Panel>
    </CalcLayout>
  );
}