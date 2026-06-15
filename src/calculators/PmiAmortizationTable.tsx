"use client";
import React, { useState, useRef, useCallback } from "react";
import { Download } from "lucide-react";
import type { AmortizationRow } from "./pmiLogic";

interface Props {
  rows: AmortizationRow[];
  isFha: boolean;
  isUsda: boolean;
  loanType: string;
}

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const VISIBLE_ROWS = 30;

export default function PmiAmortizationTable({ rows, isFha, isUsda, loanType }: Props) {
  const [open, setOpen] = useState(false);
  const [startIdx, setStartIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pmiLabel = isFha ? "MIP" : isUsda ? "Guarantee Fee" : loanType === "va" ? "—" : "PMI";

  const visible = rows.slice(startIdx, startIdx + VISIBLE_ROWS);
  const canUp = startIdx > 0;
  const canDown = startIdx + VISIBLE_ROWS < rows.length;

  const downloadCsv = useCallback(() => {
    const header = ["#", "Date", "Payment", "Principal", "Interest", pmiLabel, "Balance", "Cum. Interest"];
    const lines = [
      header.join(","),
      ...rows.map(r => [
        r.month, r.date,
        r.payment.toFixed(2), r.principal.toFixed(2),
        r.interest.toFixed(2), r.pmi.toFixed(2),
        r.balance.toFixed(2), r.cumulativeInterest.toFixed(2),
      ].join(","))
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "amortization-schedule.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [rows, pmiLabel]);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary/20 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span style={{ width: 32, height: 32, background: "#EBF3FF", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="ti ti-table" style={{ fontSize: 18, color: "#2563EB" }} />
          </span>
          Amortization Schedule ({rows.length} payments)
        </span>
        <i className={`ti ${open ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ fontSize: 16, color: "#6B7280" }} />
      </button>

      {open && (
        <div>
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/10">
            <div className="flex gap-2">
              <button
                disabled={!canUp}
                onClick={() => setStartIdx(Math.max(0, startIdx - VISIBLE_ROWS))}
                className="text-xs px-2 py-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-40"
              >← Prev {VISIBLE_ROWS}</button>
              <button
                disabled={!canDown}
                onClick={() => setStartIdx(Math.min(rows.length - VISIBLE_ROWS, startIdx + VISIBLE_ROWS))}
                className="text-xs px-2 py-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-40"
              >Next {VISIBLE_ROWS} →</button>
              <span className="text-xs text-muted-foreground self-center">
                Showing {startIdx + 1}–{Math.min(startIdx + VISIBLE_ROWS, rows.length)} of {rows.length}
              </span>
            </div>
            <button
              onClick={downloadCsv}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Download className="h-3 w-3" /> Download CSV
            </button>
          </div>

          <div className="overflow-x-auto" ref={containerRef}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-2 pl-3">Mo.</th>
                  <th className="p-2">Date</th>
                  <th className="p-2 text-right">Payment</th>
                  <th className="p-2 text-right">Principal</th>
                  <th className="p-2 text-right">Interest</th>
                  <th className="p-2 text-right">{pmiLabel}</th>
                  <th className="p-2 text-right">Balance</th>
                  <th className="p-2 pr-3 text-right">Cum. Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {visible.map(row => (
                  <tr
                    key={row.month}
                    className={`transition-colors hover:bg-secondary/10 ${row.isPmiCancelRow ? "bg-amber-500/10 font-semibold" : ""}`}
                  >
                    <td className="p-2 pl-3 text-muted-foreground">{row.month}</td>
                    <td className="p-2 text-muted-foreground whitespace-nowrap">{row.date}</td>
                    <td className="p-2 text-right">${fmt(row.payment)}</td>
                    <td className="p-2 text-right text-emerald-600">${fmt(row.principal)}</td>
                    <td className="p-2 text-right text-red-500">${fmt(row.interest)}</td>
                    <td className={`p-2 text-right ${row.pmi > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
                      {row.pmi > 0 ? `$${fmt(row.pmi)}` : "—"}
                    </td>
                    <td className="p-2 text-right font-medium">${fmt(row.balance)}</td>
                    <td className="p-2 pr-3 text-right text-muted-foreground">${fmt(row.cumulativeInterest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.some(r => r.isPmiCancelRow) && (
            <p className="text-[10px] text-amber-600 px-4 py-2 border-t border-border bg-amber-500/5">
              Amber row = PMI cancellation month
            </p>
          )}
        </div>
      )}
    </div>
  );
}
