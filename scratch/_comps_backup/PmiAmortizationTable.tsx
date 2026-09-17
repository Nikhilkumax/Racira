"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { RotateCcw, Printer, Download, ChevronDown, ChevronUp } from "lucide-react";
import PopularCalculators from "@/components/PopularCalculators";
import type { AmortizationRow } from "./pmiLogic";

/* ── Original sub-component (used by PmiCalculator) — keep as named export ── */

interface TableProps {
  rows: AmortizationRow[];
  isFha: boolean;
  isUsda: boolean;
  loanType: string;
}

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const VISIBLE_ROWS = 30;

export function PmiAmortizationTable({ rows, isFha, isUsda, loanType }: TableProps) {
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

/* ── Standalone calculator (default export) ── */

interface Inputs {
  homePrice: string;
  downPct: string;
  rate: string;
  term: string;
  pmiRate: string;
  extraMonthly: string;
}

interface Row {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  pmi: number;
  balance: number;
  cumulativeInterest: number;
  isPmiCancelRow: boolean;
}

interface Result {
  loanAmount: number;
  payment: number;
  pmiStart: number;
  pmiCancelMonth: number;
  pmiCancelDate: string;
  totalPmi: number;
  totalInterest: number;
  totalPaid: number;
  rows: Row[];
  chartData: { month: number; balance: number; pmiCum: number }[];
  annualRows: { year: number; principal: number; interest: number; pmi: number; balance: number }[];
}

const DEFAULT_INPUTS: Inputs = {
  homePrice: "400000",
  downPct: "10",
  rate: "6.5",
  term: "30",
  pmiRate: "0.5",
  extraMonthly: "100",
};

const MONTH_NAMES: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function fmtDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function calculate(inputs: Inputs): Result {
  const price = parseFloat(inputs.homePrice) || 0;
  const downPct = parseFloat(inputs.downPct) || 0;
  const annualRate = parseFloat(inputs.rate) || 0;
  const termYears = parseFloat(inputs.term) || 30;
  const pmiRate = parseFloat(inputs.pmiRate) || 0;
  const extra = parseFloat(inputs.extraMonthly) || 0;

  const loan = Math.max(0, price * (1 - downPct / 100));
  const n = Math.max(1, Math.round(termYears * 12));
  const r = annualRate / 100 / 12;
  const payment = r > 0
    ? loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : loan / n;

  const cancelLtv = 78;
  const startDate = new Date();

  const rows: Row[] = [];
  let balance = loan;
  let cumInterest = 0;
  let totalPmi = 0;
  let pmiCancelMonth = 0;
  let pmiStart = 0;

  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    const principal = Math.min(balance, payment - interest + extra);
    balance = Math.max(0, balance - principal);
    const ltv = price > 0 ? (balance / price) * 100 : 0;
    const pmiActive = ltv > cancelLtv && downPct < 20;
    const pmi = pmiActive ? (balance * pmiRate / 100 / 12) : 0;
    if (m === 1) pmiStart = pmi;
    if (pmiActive) totalPmi += pmi;
    cumInterest += interest;
    const isCancel = pmiActive && ltv - (principal * pmiRate / 100 / 12) <= 0 ? false : !pmiActive && m > 1 && rows[m - 2]?.pmi > 0;
    if (isCancel && pmiCancelMonth === 0) pmiCancelMonth = m;
    rows.push({
      month: m,
      date: fmtDate(addMonths(startDate, m)),
      payment: payment + pmi,
      principal,
      interest,
      pmi,
      balance,
      cumulativeInterest: cumInterest,
      isPmiCancelRow: isCancel,
    });
    if (balance <= 0) break;
  }

  if (pmiCancelMonth === 0) pmiCancelMonth = rows.filter((row) => row.pmi === 0).length > 0 ? (rows.find((row) => row.pmi === 0 && row.month > 1)?.month ?? 0) : 0;

  const chartData = rows
    .filter((row) => row.month % 12 === 0 || row.month === 1)
    .map((row) => ({ month: row.month, balance: Math.round(row.balance), pmiCum: Math.round(totalPmi * (row.month / Math.max(1, pmiCancelMonth || n))) }));

  const annualRows: { year: number; principal: number; interest: number; pmi: number; balance: number }[] = [];
  for (let y = 1; y <= Math.ceil(rows.length / 12); y++) {
    const yrRows = rows.filter((row) => Math.ceil(row.month / 12) === y);
    if (yrRows.length === 0) continue;
    annualRows.push({
      year: y,
      principal: yrRows.reduce((s, row) => s + row.principal, 0),
      interest: yrRows.reduce((s, row) => s + row.interest, 0),
      pmi: yrRows.reduce((s, row) => s + row.pmi, 0),
      balance: yrRows[yrRows.length - 1].balance,
    });
  }

  return {
    loanAmount: loan,
    payment,
    pmiStart,
    pmiCancelMonth,
    pmiCancelDate: pmiCancelMonth > 0 ? fmtDate(addMonths(startDate, pmiCancelMonth)) : "—",
    totalPmi,
    totalInterest: cumInterest,
    totalPaid: cumInterest + loan + totalPmi,
    rows,
    chartData,
    annualRows,
  };
}

const fmtMoney = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtMoney2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PmiAmortizationCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULT_INPUTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const invalid = useMemo(() => {
    const price = parseFloat(inputs.homePrice);
    const down = parseFloat(inputs.downPct);
    const rate = parseFloat(inputs.rate);
    const term = parseFloat(inputs.term);
    return isNaN(price) || price <= 0 || isNaN(down) || down < 0 || down >= 100 || isNaN(rate) || rate < 0 || isNaN(term) || term <= 0;
  }, [inputs]);

  function run() {
    setResult(calculate(inputs));
  }

  function reset() {
    setInputs(DEFAULT_INPUTS);
    setResult(calculate(DEFAULT_INPUTS));
  }

  const firstRows = result.rows.slice(0, 12);
  const pmiActive = result.pmiStart > 0;

  return (
    <div className="w-full">
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Mortgage</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">PMI Amortization Table Calculator</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        PMI Amortization Table Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Home Price ($)</label>
                <input
                  type="number"
                  value={inputs.homePrice}
                  onChange={(e) => setInputs({ ...inputs, homePrice: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="400000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Down Payment (%)</label>
                <input
                  type="number"
                  value={inputs.downPct}
                  onChange={(e) => setInputs({ ...inputs, downPct: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.rate}
                  onChange={(e) => setInputs({ ...inputs, rate: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="6.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loan Term (years)</label>
                <input
                  type="number"
                  value={inputs.term}
                  onChange={(e) => setInputs({ ...inputs, term: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="30"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Check inputs — home price must be positive and down payment below 100%.</p>}

            {/* ADVANCED OPTIONS */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-primary font-medium inline-flex items-center gap-1"
              >
                Advanced Options {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showAdvanced && (
                <div className="mt-3 rounded-md border border-border p-3 bg-background">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">PMI & Extra Payments</p>
                    <label className="block text-sm font-medium mb-1">Annual PMI Rate (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={inputs.pmiRate}
                      onChange={(e) => setInputs({ ...inputs, pmiRate: e.target.value })}
                      className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.5"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">Extra Monthly Payment ($)</label>
                    <input
                      type="number"
                      value={inputs.extraMonthly}
                      onChange={(e) => setInputs({ ...inputs, extraMonthly: e.target.value })}
                      className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-4">
              <button
                type="button"
                onClick={run}
                disabled={invalid}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="flex flex-col gap-4 print-section">
          {/* 1. PRIMARY RESULT CARD */}
          <div className="relative bg-primary/10 border-l-4 border-primary rounded-lg p-5">
            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Print"
              className="absolute top-3 right-3 h-8 w-8 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground flex items-center justify-center"
            >
              <Printer className="h-4 w-4" />
            </button>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total PMI Paid</p>
            <p className="text-4xl font-bold text-primary mt-1">{fmtMoney(result.totalPmi)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {pmiActive
                ? `PMI ends in ${result.pmiCancelMonth > 0 ? `${result.pmiCancelDate} (mo ${result.pmiCancelMonth})` : "—"} at 78% LTV`
                : "Down payment ≥ 20% — PMI not required"}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly P&amp;I</p>
              <p className="text-lg font-bold text-foreground mt-1">{fmtMoney(result.payment)}</p>
              <p className="text-xs text-muted-foreground">+ {fmtMoney2(result.pmiStart)} PMI at start</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Interest</p>
              <p className="text-lg font-bold text-primary mt-1">{fmtMoney(result.totalInterest)}</p>
              <p className="text-xs text-muted-foreground">over {result.rows.length} payments</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">PMI Cancel</p>
              <p className="text-lg font-bold text-amber-600 mt-1">
                {pmiActive ? `Mo ${result.pmiCancelMonth || "—"}` : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">78% LTV threshold</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">First 12 Payments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                    <th className="text-left py-2 px-3 font-medium">Month</th>
                    <th className="text-right py-2 px-3 font-medium">Principal</th>
                    <th className="text-right py-2 px-3 font-medium">Interest</th>
                    <th className="text-right py-2 px-3 font-medium">PMI</th>
                    <th className="text-right py-2 px-3 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {firstRows.map((row) => (
                    <tr
                      key={row.month}
                      className={`border-b border-border ${row.isPmiCancelRow ? "bg-primary/10 font-semibold text-primary" : ""}`}
                    >
                      <td className="py-2.5 px-3">{row.date}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney2(row.principal)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney2(row.interest)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-amber-600">{row.pmi > 0 ? fmtMoney2(row.pmi) : "—"}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium">{fmtMoney(row.balance)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-2.5 px-3">Total (12 mo)</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney2(result.rows.slice(0, 12).reduce((s, r) => s + r.principal, 0))}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney2(result.rows.slice(0, 12).reduce((s, r) => s + r.interest, 0))}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-amber-600">{fmtMoney2(result.rows.slice(0, 12).reduce((s, r) => s + r.pmi, 0))}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Loan Balance Over Time</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={result.chartData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(m) => `Yr ${Math.round(Number(m) / 12)}`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} tick={{ fontSize: 11 }} tickLine={false} width={46} />
                <Tooltip
                  formatter={(val: number, name: string) => [fmtMoney(val), name === "balance" ? "Balance" : "Cum. PMI"]}
                  labelFormatter={(m) => `Month ${m} (Yr ${Math.round(Number(m) / 12)})`}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area name="Balance" type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                <Line name="Cum. PMI" type="monotone" dataKey="pmiCum" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">PMI is charged monthly while LTV exceeds 78%.</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Loan Amount</p>
                <p className="font-semibold text-foreground">{fmtMoney(result.loanAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Payment (P&amp;I)</p>
                <p className="font-semibold text-foreground">{fmtMoney2(result.payment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total PMI Paid</p>
                <p className="font-semibold text-foreground">{fmtMoney(result.totalPmi)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Interest</p>
                <p className="font-semibold text-foreground">{fmtMoney(result.totalInterest)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Cost (P&amp;I + PMI)</p>
                <p className="font-semibold text-foreground">{fmtMoney(result.totalPaid)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">PMI Ends</p>
                <p className="font-semibold text-foreground">{pmiActive ? result.pmiCancelDate : "Not required"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/pmi-amortization-table" />
      </div>
    </div>
  );
}
