"use client";
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Legend,
} from "recharts";
import type { LtvPoint } from "./pmiLogic";

interface Props {
  ltvCurve: LtvPoint[];
  ltvCurveAccel: LtvPoint[];
  ltvCurveAppreciation: LtvPoint[];
  pmiCancelMonth: number;
  pmiCancelDate: string;
  hasExtra: boolean;
  hasAppreciation: boolean;
}

export default function PmiLtvChart({
  ltvCurve, ltvCurveAccel, ltvCurveAppreciation,
  pmiCancelMonth, pmiCancelDate, hasExtra, hasAppreciation,
}: Props) {
  const monthSet = new Set<number>();
  ltvCurve.forEach(p => monthSet.add(p.month));
  ltvCurveAccel.forEach(p => monthSet.add(p.month));
  ltvCurveAppreciation.forEach(p => monthSet.add(p.month));

  const accelMap = new Map(ltvCurveAccel.map(p => [p.month, p.ltv]));
  const apprMap = new Map(ltvCurveAppreciation.map(p => [p.month, p.ltv]));

  // Downsample: one point per 3 months
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

  // Build up to 7 year-based ticks spread across the loan term
  function buildYearTicks(termYears: number, maxTicks: number): number[] {
    // Candidate intervals
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
          {/* Shade PMI zone (LTV > 80%) */}
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
          {/* 80% LTV threshold */}
          <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "80% LTV", position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }} />
          {/* PMI cancel line */}
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
