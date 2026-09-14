"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  total: string
  currentPct: string
  targetPct: string
}

interface Result {
  currentEvening: number
  targetEvening: number
  shifted: number
  currentDaytime: number
  targetDaytime: number
}

const DEFAULTS: Inputs = { total: "2000", currentPct: "40", targetPct: "20" }

function calculate(inputs: Inputs): Result {
  const total = parseFloat(inputs.total) || 0
  const currentPct = parseFloat(inputs.currentPct) || 0
  const targetPct = parseFloat(inputs.targetPct) || 0
  const currentEvening = total * (currentPct / 100)
  const targetEvening = total * (targetPct / 100)
  return {
    currentEvening,
    targetEvening,
    shifted: currentEvening - targetEvening,
    currentDaytime: total - currentEvening,
    targetDaytime: total - targetEvening,
  }
}

export default function NightEatingCalorieRedistributionCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const t = parseFloat(inputs.total)
    const c = parseFloat(inputs.currentPct)
    const g = parseFloat(inputs.targetPct)
    return isNaN(t) || t <= 0 || isNaN(c) || c < 0 || c > 100 || isNaN(g) || g < 0 || g > 100
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Current", Evening: result.currentEvening, Daytime: result.currentDaytime },
      { name: "Redistributed", Evening: result.targetEvening, Daytime: result.targetDaytime },
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

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Health</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Night Eating Calorie Redistribution Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Night Eating Calorie Redistribution Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Total Daily Calories</label>
                <input
                  type="number"
                  value={inputs.total}
                  onChange={(e) => setInputs({ ...inputs, total: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="2000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Evening Intake Now (%)</label>
                <input
                  type="number"
                  value={inputs.currentPct}
                  onChange={(e) => setInputs({ ...inputs, currentPct: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Evening Intake (%)</label>
                <input
                  type="number"
                  value={inputs.targetPct}
                  onChange={(e) => setInputs({ ...inputs, targetPct: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="20"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter a positive calorie total and percentages between 0 and 100.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Calories to Move to Daytime</p>
            <p className="text-4xl font-bold text-primary mt-1">
              {result.shifted.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {parseFloat(inputs.currentPct) || 0}% evening → {parseFloat(inputs.targetPct) || 0}% evening
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Evening Now</p>
              <p className="text-lg font-bold mt-1 text-red-600">{result.currentEvening.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              <p className="text-xs text-muted-foreground">{parseFloat(inputs.currentPct) || 0}% of daily total</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Evening Target</p>
              <p className="text-lg font-bold mt-1 text-primary">{result.targetEvening.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              <p className="text-xs text-muted-foreground">{parseFloat(inputs.targetPct) || 0}% of daily total</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Daytime Share</p>
              <p className="text-lg font-bold mt-1 text-emerald-600">{result.targetDaytime.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              <p className="text-xs text-muted-foreground">after redistribution</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Meal Distribution Plan</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Total Daily Intake", parseFloat(inputs.total) || 0, "kcal across the day"],
                  ["Evening Intake (current)", result.currentEvening, `${parseFloat(inputs.currentPct) || 0}% of total`],
                  ["Daytime Intake (current)", result.currentDaytime, `${100 - (parseFloat(inputs.currentPct) || 0)}% of total`],
                  ["Evening Intake (target)", result.targetEvening, `${parseFloat(inputs.targetPct) || 0}% of total`],
                  ["Daytime Intake (target)", result.targetDaytime, `${100 - (parseFloat(inputs.targetPct) || 0)}% of total`],
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
                  <td className="py-2.5 px-3">Calories Shifted to Daytime</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {result.shifted.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground">evening reduction</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Daytime vs Evening Split (kcal)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`} />
                <Tooltip formatter={(v: number, name: string) => [`${v.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal`, name]} />
                <Legend />
                <Bar dataKey="Daytime" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Evening" stackId="a" fill="hsl(15 85% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.shifted > 0
                ? `Moving ${result.shifted.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal from evening to daytime keeps your daily total unchanged while reducing late-night intake by ${(parseFloat(inputs.currentPct) || 0) - (parseFloat(inputs.targetPct) || 0)} percentage points.`
                : "Set the target evening share below the current share to plan a redistribution."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Daily Total</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.total) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              </div>
              <div>
                <p className="text-muted-foreground">Evening Share Now</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.currentPct) || 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Target Evening Share</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.targetPct) || 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Evening Reduction</p>
                <p className="font-semibold text-foreground">
                  {result.shifted.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">New Evening Intake</p>
                <p className="font-semibold text-foreground">{result.targetEvening.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              </div>
              <div>
                <p className="text-muted-foreground">New Daytime Intake</p>
                <p className="font-semibold text-foreground">{result.targetDaytime.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/night-eating-calorie-redistribution-calculator" />
      </div>
    </div>
  )
}
