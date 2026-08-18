"use client"

import { useState, useEffect, useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  capacity: string
  tbwRating: string
  dailyWrites: string
}

interface Result {
  lifespanYears: number
  totalDays: number
  dwpd: number
  annualUsagePct: number
  quality: string
  curve: { year: number; consumed: number; isEnd: boolean }[]
}

const DEFAULTS: Inputs = { capacity: "1000", tbwRating: "600", dailyWrites: "50" }

function calculate(inputs: Inputs): Result {
  const cap = parseFloat(inputs.capacity) || 1000
  const tbw = parseFloat(inputs.tbwRating) || 0
  const daily = parseFloat(inputs.dailyWrites) || 0

  const dailyTB = daily / 1000
  const totalDays = tbw > 0 && dailyTB > 0 ? tbw / dailyTB : 0
  const years = totalDays / 365
  const dwpd = cap > 0 ? daily / cap : 0
  const annualTB = dailyTB * 365
  const annualUsagePct = tbw > 0 ? (annualTB / tbw) * 100 : 0

  const maxYears = Math.min(30, Math.max(1, Math.ceil(years * 1.2)))
  const curve: { year: number; consumed: number; isEnd: boolean }[] = []
  for (let y = 0; y <= maxYears; y++) {
    const consumed = annualTB * y
    curve.push({ year: y, consumed, isEnd: y === Math.floor(years) })
  }

  return {
    lifespanYears: years,
    totalDays,
    dwpd,
    annualUsagePct,
    quality: years > 10 ? "Excellent" : years > 5 ? "Good" : years > 0 ? "Heavy Usage" : "—",
    curve,
  }
}

export default function SsdTbwCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(() => {
    const cap = parseFloat(inputs.capacity)
    const tbw = parseFloat(inputs.tbwRating)
    const daily = parseFloat(inputs.dailyWrites)
    return [cap, tbw, daily].some((x) => isNaN(x) || x < 0)
  }, [inputs])

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const tbwNum = parseFloat(inputs.tbwRating) || 0

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">SSD TBW Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        SSD TBW Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">SSD Capacity (GB)</label>
                <input
                  type="number"
                  value={inputs.capacity}
                  onChange={(e) => setInputs({ ...inputs, capacity: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">TBW Rating (TB)</label>
                <input
                  type="number"
                  value={inputs.tbwRating}
                  onChange={(e) => setInputs({ ...inputs, tbwRating: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="600"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Average Daily Writes (GB)</label>
                <input
                  type="number"
                  value={inputs.dailyWrites}
                  onChange={(e) => setInputs({ ...inputs, dailyWrites: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="50"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative numbers for all fields.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Lifespan</p>
            <p className="text-4xl font-bold text-primary mt-1">
              {result.lifespanYears.toFixed(1)} <span className="text-xl font-semibold">years</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              At {parseFloat(inputs.dailyWrites) || 0} GB written per day
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">DWPD</p>
              <p className="text-lg font-bold text-foreground mt-1">{result.dwpd.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">drive writes per day</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Annual TBW Use</p>
              <p className="text-lg font-bold text-primary mt-1">{result.annualUsagePct.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">of rating / year</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Durability Grade</p>
              <p className={`text-lg font-bold mt-1 ${result.quality === "Excellent" ? "text-emerald-600" : result.quality === "Good" ? "text-amber-600" : "text-red-600"}`}>
                {result.quality}
              </p>
              <p className="text-xs text-muted-foreground">&gt;10yr great · &gt;5yr good</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Lifespan Details</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["TBW Rating", `${tbwNum.toLocaleString()} TB`],
                  ["Daily Writes", `${parseFloat(inputs.dailyWrites) || 0} GB/day`],
                  ["Total Days Until TBW", result.totalDays > 0 ? Math.round(result.totalDays).toLocaleString() : "—"],
                  ["Lifespan (Years)", result.lifespanYears > 0 ? result.lifespanYears.toFixed(1) : "—"],
                  ["Annual TBW Consumption", `${result.annualUsagePct.toFixed(1)}%`],
                  ["Total Writes Until Failure", `${(tbwNum * 1000).toLocaleString()} GB`],
                ].map((row, i) => (
                  <tr key={row[0]} className={`border-b border-border ${i === 3 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0]}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Cumulative Writes vs TBW Rating</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={result.curve} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={(y) => `Yr ${y}`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} TB`} />
                <Tooltip
                  formatter={(v: number) => [`${v.toFixed(0)} TB`, "Cumulative written"]}
                  labelFormatter={(y) => `Year ${y}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                />
                <ReferenceLine
                  y={tbwNum}
                  stroke="#f59e0b"
                  strokeDasharray="4 2"
                  label={{ value: `TBW ${tbwNum} TB`, position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }}
                />
                <Area
                  name="Cumulative written"
                  type="monotone"
                  dataKey="consumed"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.15)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              The line crosses the TBW rating at year {result.lifespanYears > 0 ? result.lifespanYears.toFixed(1) : "—"} — where NAND wear-out begins.
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Capacity</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.capacity) || 0} GB</p>
              </div>
              <div>
                <p className="text-muted-foreground">TBW Rating</p>
                <p className="font-semibold text-foreground">{tbwNum.toLocaleString()} TB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Daily Writes</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.dailyWrites) || 0} GB</p>
              </div>
              <div>
                <p className="text-muted-foreground">DWPD</p>
                <p className="font-semibold text-foreground">{result.dwpd.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lifespan</p>
                <p className="font-semibold text-foreground">{result.lifespanYears > 0 ? result.lifespanYears.toFixed(1) + " years" : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Wear Rate</p>
                <p className="font-semibold text-foreground">{result.annualUsagePct.toFixed(1)}% of rating per year</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/ssd-tbw-calculator" />
      </div>
    </div>
  )
}
