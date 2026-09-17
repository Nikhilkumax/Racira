"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Legend,
} from "recharts";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import PopularCalculators from "@/components/PopularCalculators";
import type { LtvPoint } from "./pmiLogic";

/* ── Original sub-component (used by PmiCalculator) — keep as named export ── */

interface ChartProps {
  ltvCurve: LtvPoint[];
  ltvCurveAccel: LtvPoint[];
  ltvCurveAppreciation: LtvPoint[];
  pmiCancelMonth: number;
  pmiCancelDate: string;
  hasExtra: boolean;
  hasAppreciation: boolean;
}

export function PmiLtvChart({
  ltvCurve, ltvCurveAccel, ltvCurveAppreciation,
  pmiCancelMonth, pmiCancelDate, hasExtra, hasAppreciation,
}: ChartProps) {
  const monthSet = new Set<number>();
  ltvCurve.forEach(p => monthSet.add(p.month));
  ltvCurveAccel.forEach(p => monthSet.add(p.month));
  ltvCurveAppreciation.forEach(p => monthSet.add(p.month));

  const accelMap = new Map(ltvCurveAccel.map(p => [p.month, p.ltv]));
  const apprMap = new Map(ltvCurveAppreciation.map(p => [p.month, p.ltv]));

  const sorted = [...monthSet].sort((a, b) => a - b).filter(m => m % 3 === 0 || m === 1);

  const data = sorted.map(month => {
    const base = ltvCurve.find(p => p.month === month);
    return {
      month,
      baseline: base ? parseFloat(base.ltv.toFixed(1)) : undefined,
      accelerated: hasExtra ? (accelMap.has(month) ? parseFloat((accelMap.get(month)!).toFixed(1)) : undefined) : undefined,
      appreciation: hasAppreciation ? (apprMap.has(month) ? parseFloat((apprMap.get(month)!).toFixed(1)) : undefined) : undefined,
    };
  }).filter(d => d.baseline !== undefined || d.accelerated !== undefined);

  const maxMonth = sorted[sorted.length - 1] ?? 360;
  const loanTermYears = Math.ceil(maxMonth / 12);

  function buildYearTicks(termYears: number, maxTicks: number): number[] {
    const candidates = [1, 2, 3, 5, 10, 15];
    let interval = 5;
    for (const c of candidates) {
      if (Math.ceil(termYears / c) <= maxTicks) { interval = c; break; }
    }
    const ticks: number[] = [];
    for (let yr = interval; yr < termYears; yr += interval) ticks.push(yr * 12);
    if (ticks.length === 0 || ticks[ticks.length - 1] !== termYears * 12) {
      ticks.push(termYears * 12);
    }
    return ticks;
  }

  const xTicks = buildYearTicks(loanTermYears, 7);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <span style={{ width: 32, height: 32, background: "#EBF3FF", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <i className="ti ti-chart-line" style={{ fontSize: 18, color: "#2563EB" }} />
        </span>
        LTV Over Time
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <ReferenceArea y1={80} y2={100} fill="#f59e0b" fillOpacity={0.12} />
          <XAxis
            dataKey="month"
            type="number"
            domain={[0, maxMonth]}
            ticks={xTicks}
            tickFormatter={m => `Yr ${Math.round(m / 12)}`}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            domain={[60, 100]}
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            width={38}
          />
          <Tooltip
            formatter={(val: number, name: string) => [`${val}%`, name]}
            labelFormatter={m => `Month ${m} (Yr ${Math.round(Number(m) / 12)})`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "80% LTV", position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }} />
          {pmiCancelMonth > 0 && pmiCancelMonth < maxMonth && (
            <ReferenceLine
              x={pmiCancelMonth}
              stroke="#10b981"
              strokeDasharray="5 3"
              strokeWidth={2}
              label={{ value: `PMI ends\n${pmiCancelDate}`, position: "top", fontSize: 9, fill: "#10b981" }}
            />
          )}
          <Line name="Baseline LTV" dataKey="baseline" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} connectNulls />
          {hasExtra && (
            <Line name="With Extra Payments" dataKey="accelerated" stroke="#10b981" strokeWidth={2} strokeDasharray="6 2" dot={false} connectNulls />
          )}
          {hasAppreciation && (
            <Line name="With Appreciation" dataKey="appreciation" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="2 3" dot={false} connectNulls />
          )}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground mt-1 text-center">Amber zone = PMI active (LTV &gt; 80%)</p>
    </div>
  );
}

/* ── Standalone calculator (default export) ── */

interface Inputs {
  homePrice: string;
  downPct: string;
  rate: string;
  term: string;
  appreciation: string;
}

interface CurvePoint {
  month: number;
  ltv: number;
  balance: number;
  homeValue: number;
}

interface Result {
  loanAmount: number;
  payment: number;
  startLtv: number;
  cancelMonth: number;
  cancelDate: string;
  cancelLtv: number;
  neverRequired: boolean;
  curve: CurvePoint[];
  annualRows: { year: number; ltv: number; balance: number; homeValue: number }[];
}

const DEFAULTS: Inputs = {
  homePrice: "400000",
  downPct: "10",
  rate: "6.5",
  term: "30",
  appreciation: "2",
};

const MONTHS: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function fmtDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function calculate(inputs: Inputs): Result {
  const price = parseFloat(inputs.homePrice) || 0;
  const downPct = parseFloat(inputs.downPct) || 0;
  const annualRate = parseFloat(inputs.rate) || 0;
  const termYears = parseFloat(inputs.term) || 30;
  const appreciation = parseFloat(inputs.appreciation) || 0;

  const down = price * downPct / 100;
  const loan = Math.max(0, price - down);
  const n = Math.max(1, Math.round(termYears * 12));
  const r = annualRate / 100 / 12;
  const payment = r > 0
    ? loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : loan / n;

  const startDate = new Date();
  const monthlyAppr = Math.pow(1 + appreciation / 100, 1 / 12);

  const curve: CurvePoint[] = [];
  let balance = loan;
  let cancelMonth = 0;
  const cancelLtv = 78;

  for (let m = 0; m <= n; m++) {
    const homeValue = price * Math.pow(monthlyAppr, m);
    const ltv = homeValue > 0 ? (balance / homeValue) * 100 : 0;
    curve.push({ month: m, ltv: parseFloat(ltv.toFixed(2)), balance, homeValue });
    if (cancelMonth === 0 && m > 0 && ltv <= cancelLtv) cancelMonth = m;
    if (m < n) {
      const interest = balance * r;
      const principal = payment - interest;
      balance = Math.max(0, balance - principal);
    }
  }

  if (cancelMonth === 0) cancelMonth = n;

  const annualRows = curve
    .filter((p) => p.month % 12 === 0)
    .map((p) => ({ year: p.month / 12, ltv: p.ltv, balance: p.balance, homeValue: p.homeValue }));

  return {
    loanAmount: loan,
    payment,
    startLtv: curve[0]?.ltv ?? (downPct > 0 ? 100 - downPct : 0),
    cancelMonth,
    cancelDate: fmtDate(addMonths(startDate, cancelMonth)),
    cancelLtv,
    neverRequired: loan <= 0 || (curve[0]?.ltv ?? 100) <= cancelLtv,
    curve,
    annualRows,
  };
}

const fmtMoney = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtPct = (n: number) => n.toFixed(1) + "%";

export default function PmiLtvChartCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
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

  const chartData = useMemo(
    () =>
      result.curve
        .filter((p) => p.month % 6 === 0)
        .map((p) => ({ month: p.month, ltv: parseFloat(p.ltv.toFixed(1)) })),
    [result]
  );

  function run() {
    setResult(calculate(inputs));
  }

  function reset() {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  }

  const maxMonth = result.curve[result.curve.length - 1]?.month ?? 360;
  const years = Math.ceil(maxMonth / 12);
  const ticks: number[] = [];
  for (let yr = 5; yr < years; yr += 5) ticks.push(yr * 12);
  if (ticks[ticks.length - 1] !== years * 12) ticks.push(years * 12);

  return (
    <div className="w-full">
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Mortgage</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">PMI LTV Chart Calculator</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        PMI LTV Chart Calculator
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
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Market Assumptions</p>
                    <label className="block text-sm font-medium mb-1">Annual Home Appreciation (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.appreciation}
                      onChange={(e) => setInputs({ ...inputs, appreciation: e.target.value })}
                      className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="2"
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {result.neverRequired ? "PMI Not Required" : "Months to 78% LTV (PMI Auto-Cancel)"}
            </p>
            <p className="text-4xl font-bold text-primary mt-1">
              {result.neverRequired ? "0" : result.cancelMonth}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.neverRequired
                ? `Down payment of ${parseFloat(inputs.downPct) || 0}% keeps LTV at or below 78% from day one.`
                : `LTV reaches 78% in ${result.cancelDate} · ${Math.floor(result.cancelMonth / 12)} yr ${result.cancelMonth % 12} mo`}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Starting LTV</p>
              <p className="text-lg font-bold text-foreground mt-1">{fmtPct(result.startLtv)}</p>
              <p className="text-xs text-muted-foreground">{fmtMoney(result.loanAmount)} loan</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly Payment</p>
              <p className="text-lg font-bold text-primary mt-1">{fmtMoney(result.payment)}</p>
              <p className="text-xs text-muted-foreground">P&amp;I only</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cancel Threshold</p>
              <p className="text-lg font-bold text-amber-600 mt-1">78% LTV</p>
              <p className="text-xs text-muted-foreground">automatic termination</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">LTV by Year</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                    <th className="text-left py-2 px-3 font-medium">Year</th>
                    <th className="text-right py-2 px-3 font-medium">LTV</th>
                    <th className="text-right py-2 px-3 font-medium">Balance</th>
                    <th className="text-right py-2 px-3 font-medium">Home Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.annualRows.slice(0, 8).map((row) => (
                    <tr
                      key={row.year}
                      className={`border-b border-border ${row.ltv <= 78 && row.ltv > 0 ? "bg-primary/10 font-semibold text-primary" : ""}`}
                    >
                      <td className="py-2.5 px-3">{row.year === 0 ? "Start" : `Yr ${row.year}`}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtPct(row.ltv)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney(row.balance)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{fmtMoney(row.homeValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">LTV Over Time</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <ReferenceArea y1={80} y2={100} fill="#f59e0b" fillOpacity={0.12} />
                <XAxis
                  dataKey="month"
                  type="number"
                  domain={[0, maxMonth]}
                  ticks={ticks}
                  tickFormatter={(m) => `Yr ${Math.round(m / 12)}`}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis domain={[50, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} tickLine={false} width={40} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, "LTV"]}
                  labelFormatter={(m) => `Month ${m} (Yr ${Math.round(Number(m) / 12)})`}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                />
                <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "80% LTV", position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }} />
                <ReferenceLine y={78} stroke="#10b981" strokeDasharray="4 2" label={{ value: "78% auto-cancel", position: "insideBottomRight", fontSize: 10, fill: "#10b981" }} />
                <Line name="LTV" dataKey="ltv" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Amber zone = PMI active (LTV &gt; 80%). PMI auto-terminates at 78% LTV.</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Home Price</p>
                <p className="font-semibold text-foreground">{fmtMoney(parseFloat(inputs.homePrice) || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Down Payment</p>
                <p className="font-semibold text-foreground">{fmtMoney((parseFloat(inputs.homePrice) || 0) * (parseFloat(inputs.downPct) || 0) / 100)} ({parseFloat(inputs.downPct) || 0}%)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Loan Amount</p>
                <p className="font-semibold text-foreground">{fmtMoney(result.loanAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Payment</p>
                <p className="font-semibold text-foreground">{fmtMoney(result.payment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">PMI Auto-Cancel</p>
                <p className="font-semibold text-foreground">{result.neverRequired ? "Not required" : `${result.cancelDate} (mo ${result.cancelMonth})`}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Appreciation Assumed</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.appreciation) || 0}% / yr</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/pmi-ltv-chart" />
      </div>
    </div>
  );
}
