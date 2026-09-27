"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  sla: string
}

interface Result {
  downtimePct: number
  dailySeconds: number
  weeklySeconds: number
  monthlySeconds: number
  yearlySeconds: number
  category: string
  perTier: { tier: string; label: string; yearlySec: number; isSel: boolean }[]
}

const DEFAULTS: Inputs = { sla: "99.9" }

const PRESETS = ["99.0", "99.9", "99.95", "99.99", "99.999"]

const SECONDS_YEAR = 365.25 * 24 * 3600

function formatTime(totalSeconds: number): string {
  const d = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (s > 0 || parts.length === 0) parts.push(`${s}s`)
  return parts.join(" ")
}

function calculate(inputs: Inputs): Result {
  const uptime = parseFloat(inputs.sla)
  const downtimePct = Math.max(0, 100 - uptime)
  const yearlySeconds = (downtimePct / 100) * SECONDS_YEAR

  const tiers = [99, 99.9, 99.95, 99.99, 99.999].map((t) => ({
    tier: t.toFixed(3),
    label: `${t}%`,
    yearlySec: ((100 - t) / 100) * SECONDS_YEAR,
    isSel: Math.abs(t - uptime) < 0.0001,
  }))

  return {
    downtimePct,
    dailySeconds: yearlySeconds / 365.25,
    weeklySeconds: yearlySeconds / 52.1775,
    monthlySeconds: yearlySeconds / 12,
    yearlySeconds,
    category: uptime >= 99.999 ? "High Availability" : uptime >= 99.9 ? "Standard Enterprise" : uptime >= 99 ? "Basic Service" : "Below Standard",
    perTier: tiers,
  }
}

export default function UptimeCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const v = parseFloat(inputs.sla)
    return isNaN(v) || v < 0 || v > 100
  }, [inputs.sla])

  const chartData = useMemo(
    () => [
      { name: "Daily", minutes: result.dailySeconds / 60, fill: "hsl(var(--primary) / 0.45)" },
      { name: "Weekly", minutes: result.weeklySeconds / 60, fill: "hsl(var(--primary) / 0.6)" },
      { name: "Monthly", minutes: result.monthlySeconds / 60, fill: "hsl(var(--primary) / 0.75)" },
      { name: "Yearly", minutes: result.yearlySeconds / 60, fill: "hsl(var(--primary))" },
    ],
    [result]
  )

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const uptime = parseFloat(inputs.sla)

  return (
    <div className="racira-page-container py-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Uptime Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Uptime Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Target Uptime (%)</label>
                <input
                  type="number"
                  step="0.001"
                  value={inputs.sla}
                  onChange={(e) => setInputs({ ...inputs, sla: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="99.9"
                />
                {invalid && <p className="text-xs text-red-500 mt-1">Enter an uptime between 0 and 100%.</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Common SLA Tiers</label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setInputs({ ...inputs, sla: val })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        inputs.sla === val
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary hover:bg-primary/10 border-border text-foreground"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Allowed Downtime Per Year</p>
            <p className="text-4xl font-bold text-primary mt-1">{formatTime(result.yearlySeconds)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {uptime}% uptime = {result.downtimePct.toFixed(4)}% downtime · {result.category}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily</p>
              <p className="text-lg font-bold text-foreground mt-1">{formatTime(result.dailySeconds)}</p>
              <p className="text-xs text-muted-foreground">allowed per day</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Weekly</p>
              <p className="text-lg font-bold text-primary mt-1">{formatTime(result.weeklySeconds)}</p>
              <p className="text-xs text-muted-foreground">allowed per week</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{formatTime(result.monthlySeconds)}</p>
              <p className="text-xs text-muted-foreground">allowed per month</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">SLA Tier Comparison (Yearly Downtime)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Tier</th>
                  <th className="text-right py-2 px-3 font-medium">Downtime / Year</th>
                </tr>
              </thead>
              <tbody>
                {result.perTier.map((row) => (
                  <tr
                    key={row.tier}
                    className={`border-b border-border ${row.isSel ? "bg-primary/10 font-semibold text-primary" : ""}`}
                  >
                    <td className="py-2.5 px-3">
                      {row.label} {row.isSel && "· selected"}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatTime(row.yearlySec)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Allowed Downtime per Period (minutes)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)} min`, "Downtime"]} />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {uptime >= 99.999
                ? "Five nines — high availability. Only ~5.26 min downtime per year."
                : uptime >= 99.99
                ? "Four nines — ~52.6 min downtime per year."
                : uptime >= 99.9
                ? "Three nines — ~8.77 hours downtime per year."
                : "Below three nines — downtime exceeds a day per year."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Target Uptime</p>
                <p className="font-semibold text-foreground">{uptime}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Downtime Percentage</p>
                <p className="font-semibold text-foreground">{result.downtimePct.toFixed(4)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Yearly Downtime</p>
                <p className="font-semibold text-foreground">{formatTime(result.yearlySeconds)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Availability Category</p>
                <p className="font-semibold text-foreground">{result.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nines Rating</p>
                <p className="font-semibold text-foreground">
                  {uptime >= 99.999 ? "Five nines" : uptime >= 99.99 ? "Four nines" : uptime >= 99.9 ? "Three nines" : uptime >= 99 ? "Two nines" : "Below 99%"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Year Basis</p>
                <p className="font-semibold text-foreground">365.25 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/uptime-calculator" />
      </div>
    </div>
  )
}
