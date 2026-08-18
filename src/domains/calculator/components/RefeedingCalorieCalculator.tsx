"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  current: string
  target: string
  weeks: string
}

interface Result {
  weeklyStep: number
  weeks: number
  schedule: { week: string; intake: number }[]
}

const DEFAULTS: Inputs = { current: "1200", target: "1800", weeks: "4" }

function calculate(inputs: Inputs): Result {
  const current = parseFloat(inputs.current) || 0
  const target = parseFloat(inputs.target) || 0
  const weeks = Math.max(1, Math.round(parseFloat(inputs.weeks) || 1))
  const weeklyStep = (target - current) / weeks
  const schedule = Array.from({ length: weeks }, (_, i) => ({
    week: `Week ${i + 1}`,
    intake: current + weeklyStep * (i + 1),
  }))
  return { weeklyStep, weeks, schedule }
}

export default function RefeedingCalorieCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(() => {
    const c = parseFloat(inputs.current)
    const t = parseFloat(inputs.target)
    const w = parseFloat(inputs.weeks)
    return isNaN(c) || c <= 0 || isNaN(t) || t < c || isNaN(w) || w <= 0
  }, [inputs])

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
        <span className="text-foreground">Refeeding Calorie Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Refeeding Calorie Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Current Intake (kcal/day)</label>
                <input
                  type="number"
                  value={inputs.current}
                  onChange={(e) => setInputs({ ...inputs, current: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Intake (kcal/day)</label>
                <input
                  type="number"
                  value={inputs.target}
                  onChange={(e) => setInputs({ ...inputs, target: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ramp Duration (weeks)</label>
                <input
                  type="number"
                  value={inputs.weeks}
                  onChange={(e) => setInputs({ ...inputs, weeks: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="4"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Target must be above current intake, and both must be positive with a positive ramp duration.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Weekly Calorie Increase</p>
            <p className="text-4xl font-bold text-primary mt-1">+{result.weeklyStep.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
            <p className="text-sm text-muted-foreground mt-1">
              {parseFloat(inputs.current) || 0} → {parseFloat(inputs.target) || 0} kcal/day over {result.weeks} weeks
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Starting Intake</p>
              <p className="text-lg font-bold mt-1">{(parseFloat(inputs.current) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              <p className="text-xs text-muted-foreground">week 1 baseline</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ending Intake</p>
              <p className="text-lg font-bold mt-1 text-primary">{(parseFloat(inputs.target) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              <p className="text-xs text-muted-foreground">target at week {result.weeks}</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Increase</p>
              <p className="text-lg font-bold mt-1 text-emerald-600">
                +{((parseFloat(inputs.target) || 0) - (parseFloat(inputs.current) || 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal
              </p>
              <p className="text-xs text-muted-foreground">over {result.weeks} weeks</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Week-by-Week Ramp Schedule</h2>
            <table className="w-full text-sm">
              <tbody>
                {result.schedule.map((row, i) => (
                  <tr key={row.week} className={`border-b border-border ${i === result.schedule.length - 1 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row.week}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {row.intake.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal/day
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">
                      +{result.weeklyStep.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal vs prior week
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Calorie Ramp (kcal/day)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.schedule} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal/day`, ""]} />
                <Bar dataKey="intake" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.weeklyStep > 0
                ? `Add roughly ${result.weeklyStep.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal per day each week to reach ${parseFloat(inputs.target) || 0} kcal/day by week ${result.weeks}.`
                : "Set the target above current intake to build a ramp schedule."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Current Intake</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.current) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal/day</p>
              </div>
              <div>
                <p className="text-muted-foreground">Target Intake</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.target) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal/day</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ramp Duration</p>
                <p className="font-semibold text-foreground">{result.weeks} weeks</p>
              </div>
              <div>
                <p className="text-muted-foreground">Weekly Step</p>
                <p className="font-semibold text-foreground">+{result.weeklyStep.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal/day</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Increase</p>
                <p className="font-semibold text-foreground">
                  +{((parseFloat(inputs.target) || 0) - (parseFloat(inputs.current) || 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal/day
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Week 1 Intake</p>
                <p className="font-semibold text-foreground">
                  {(parseFloat(inputs.current) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal/day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/refeeding-calorie-calculator" />
      </div>
    </div>
  )
}
