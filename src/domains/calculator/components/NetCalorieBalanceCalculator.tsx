"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  consumed: string
  burned: string
  days: string
}

interface Result {
  dailyNet: number
  totalNet: number
  weightLb: number
  weightKg: number
  direction: string
}

const KCAL_PER_LB = 3500

const DEFAULTS: Inputs = { consumed: "2200", burned: "2500", days: "30" }

function calculate(inputs: Inputs): Result {
  const consumed = parseFloat(inputs.consumed) || 0
  const burned = parseFloat(inputs.burned) || 0
  const days = parseFloat(inputs.days) || 0
  const dailyNet = consumed - burned
  const totalNet = dailyNet * days
  const weightLb = totalNet / KCAL_PER_LB
  return {
    dailyNet,
    totalNet,
    weightLb,
    weightKg: weightLb * 0.45359237,
    direction: dailyNet > 0 ? "Surplus (gain)" : dailyNet < 0 ? "Deficit (loss)" : "Maintenance",
  }
}

export default function NetCalorieBalanceCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(() => {
    const c = parseFloat(inputs.consumed)
    const b = parseFloat(inputs.burned)
    const d = parseFloat(inputs.days)
    return isNaN(c) || c < 0 || isNaN(b) || b < 0 || isNaN(d) || d <= 0
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Consumed", value: parseFloat(inputs.consumed) || 0, fill: "hsl(15 85% 55%)" },
      { name: "Burned", value: parseFloat(inputs.burned) || 0, fill: "hsl(var(--primary))" },
      { name: "Daily Net", value: Math.abs(result.dailyNet), fill: result.dailyNet >= 0 ? "hsl(15 85% 55% / 0.55)" : "hsl(142 71% 45% / 0.7)" },
    ],
    [inputs, result]
  )

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Health</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Net Calorie Balance Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Net Calorie Balance Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Calories Consumed / Day</label>
                <input
                  type="number"
                  value={inputs.consumed}
                  onChange={(e) => setInputs({ ...inputs, consumed: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="2200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calories Burned / Day</label>
                <input
                  type="number"
                  value={inputs.burned}
                  onChange={(e) => setInputs({ ...inputs, burned: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Period (days)</label>
                <input
                  type="number"
                  value={inputs.days}
                  onChange={(e) => setInputs({ ...inputs, days: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="30"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative calories and a period greater than zero.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Projected Weight Change</p>
            <p className={`text-4xl font-bold mt-1 ${result.weightLb <= 0 ? "text-primary" : "text-red-600"}`}>
              {result.weightLb >= 0 ? "+" : ""}
              {result.weightLb.toFixed(1)} lb
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              over {parseFloat(inputs.days) || 0} days · {result.direction}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily Net</p>
              <p className={`text-lg font-bold mt-1 ${result.dailyNet > 0 ? "text-red-600" : result.dailyNet < 0 ? "text-emerald-600" : ""}`}>
                {result.dailyNet >= 0 ? "+" : ""}
                {result.dailyNet.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal
              </p>
              <p className="text-xs text-muted-foreground">consumed − burned</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Balance</p>
              <p className={`text-lg font-bold mt-1 ${result.totalNet > 0 ? "text-red-600" : result.totalNet < 0 ? "text-emerald-600" : ""}`}>
                {result.totalNet >= 0 ? "+" : ""}
                {result.totalNet.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal
              </p>
              <p className="text-xs text-muted-foreground">over the period</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">In Kilograms</p>
              <p className={`text-lg font-bold mt-1 ${result.weightKg <= 0 ? "text-primary" : "text-red-600"}`}>
                {result.weightKg >= 0 ? "+" : ""}
                {result.weightKg.toFixed(2)} kg
              </p>
              <p className="text-xs text-muted-foreground">≈ 7,700 kcal/kg</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Energy Balance Breakdown</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Daily Intake", parseFloat(inputs.consumed) || 0, "kcal eaten per day"],
                  ["Daily Expenditure", parseFloat(inputs.burned) || 0, "kcal burned per day"],
                  ["Daily Net Balance", result.dailyNet, "intake − expenditure"],
                  ["Days in Period", parseFloat(inputs.days) || 0, "total days"],
                  ["Cumulative Balance", result.totalNet, "daily net × days"],
                ].map((row, i) => (
                  <tr key={row[0] as string} className={`border-b border-border ${i === 4 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0] as string}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {(row[1] as number).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{row[2] as string}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2.5 px-3">Weight Change (≈)</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {result.weightLb >= 0 ? "+" : ""}
                    {result.weightLb.toFixed(2)} lb
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground">3,500 kcal per lb</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Daily Energy Balance (kcal)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal`, ""]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.dailyNet !== 0
                ? `A daily ${result.dailyNet > 0 ? "surplus" : "deficit"} of ${Math.abs(result.dailyNet).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal projects to about ${Math.abs(result.weightLb).toFixed(1)} lb ${result.dailyNet > 0 ? "gained" : "lost"} over ${parseFloat(inputs.days) || 0} days.`
                : "A balanced intake and expenditure projects to weight maintenance."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Consumed / Day</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.consumed) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              </div>
              <div>
                <p className="text-muted-foreground">Burned / Day</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.burned) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              </div>
              <div>
                <p className="text-muted-foreground">Daily Net</p>
                <p className="font-semibold text-foreground">
                  {result.dailyNet >= 0 ? "+" : ""}
                  {result.dailyNet.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Cumulative Balance</p>
                <p className="font-semibold text-foreground">
                  {result.totalNet >= 0 ? "+" : ""}
                  {result.totalNet.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Weight Change (30 days)</p>
                <p className="font-semibold text-foreground">
                  {result.weightLb >= 0 ? "+" : ""}
                  {result.weightLb.toFixed(1)} lb
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">State</p>
                <p className="font-semibold text-foreground">{result.direction}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/net-calorie-balance-calculator" />
      </div>
    </div>
  )
}
