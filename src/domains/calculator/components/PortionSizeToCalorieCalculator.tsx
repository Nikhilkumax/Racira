"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  servingCal: string
  servingG: string
  portionG: string
}

interface Result {
  calories: number
  calPerGram: number
  multiplier: number
}

const DEFAULTS: Inputs = { servingCal: "200", servingG: "40", portionG: "60" }

function calculate(inputs: Inputs): Result {
  const servingCal = parseFloat(inputs.servingCal) || 0
  const servingG = parseFloat(inputs.servingG) || 0
  const portionG = parseFloat(inputs.portionG) || 0
  const calPerGram = servingG > 0 ? servingCal / servingG : 0
  return {
    calories: calPerGram * portionG,
    calPerGram,
    multiplier: servingG > 0 ? portionG / servingG : 0,
  }
}

export default function PortionSizeToCalorieCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(() => {
    const c = parseFloat(inputs.servingCal)
    const s = parseFloat(inputs.servingG)
    const p = parseFloat(inputs.portionG)
    return isNaN(c) || c < 0 || isNaN(s) || s <= 0 || isNaN(p) || p < 0
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Listed Serving", value: parseFloat(inputs.servingCal) || 0, fill: "hsl(var(--primary) / 0.45)" },
      { name: "Your Portion", value: result.calories, fill: "hsl(var(--primary))" },
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
        <span className="text-foreground">Portion Size to Calorie Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Portion Size to Calorie Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Calories per Serving</label>
                <input
                  type="number"
                  value={inputs.servingCal}
                  onChange={(e) => setInputs({ ...inputs, servingCal: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Serving Size (g)</label>
                <input
                  type="number"
                  value={inputs.servingG}
                  onChange={(e) => setInputs({ ...inputs, servingG: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Portion (g)</label>
                <input
                  type="number"
                  value={inputs.portionG}
                  onChange={(e) => setInputs({ ...inputs, portionG: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="60"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative calories, a serving size greater than zero, and a non-negative portion.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Calories in Your Portion</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.calories.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(parseFloat(inputs.portionG) || 0).toFixed(0)} g portion at {result.calPerGram.toFixed(1)} kcal/g
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Listed Serving</p>
              <p className="text-lg font-bold mt-1">{(parseFloat(inputs.servingCal) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              <p className="text-xs text-muted-foreground">per {(parseFloat(inputs.servingG) || 0).toFixed(0)} g</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Multiplier</p>
              <p className="text-lg font-bold mt-1 text-primary">{result.multiplier.toFixed(2)}×</p>
              <p className="text-xs text-muted-foreground">portion ÷ serving</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Calorie Density</p>
              <p className="text-lg font-bold mt-1">{result.calPerGram.toFixed(1)} kcal/g</p>
              <p className="text-xs text-muted-foreground">per gram of food</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Portion Math</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Serving Size (label)", parseFloat(inputs.servingG) || 0, "grams per listed serving"],
                  ["Calories per Serving", parseFloat(inputs.servingCal) || 0, "from the nutrition label"],
                  ["Your Portion", parseFloat(inputs.portionG) || 0, "grams you actually eat"],
                  ["Portion Multiplier", result.multiplier, "portion ÷ serving size"],
                  ["Calories in Your Portion", result.calories, "serving calories × multiplier"],
                ].map((row, i) => (
                  <tr key={row[0] as string} className={`border-b border-border ${i === 4 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0] as string}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {(row[1] as number).toLocaleString("en-US", { maximumFractionDigits: 1 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{row[2] as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Serving vs Your Portion (kcal)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} kcal`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal`, ""]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.calories > 0
                ? `Your ${(parseFloat(inputs.portionG) || 0).toFixed(0)} g portion contains ${result.calories.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal — ${result.multiplier.toFixed(2)}× the listed serving.`
                : "Enter a portion size to compute its calories."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Serving Calories</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.servingCal) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              </div>
              <div>
                <p className="text-muted-foreground">Serving Size</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.servingG) || 0).toFixed(0)} g</p>
              </div>
              <div>
                <p className="text-muted-foreground">Your Portion</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.portionG) || 0).toFixed(0)} g</p>
              </div>
              <div>
                <p className="text-muted-foreground">Calories in Portion</p>
                <p className="font-semibold text-foreground">{result.calories.toLocaleString("en-US", { maximumFractionDigits: 0 })} kcal</p>
              </div>
              <div>
                <p className="text-muted-foreground">Calorie Density</p>
                <p className="font-semibold text-foreground">{result.calPerGram.toFixed(1)} kcal/g</p>
              </div>
              <div>
                <p className="text-muted-foreground">vs Label Serving</p>
                <p className="font-semibold text-foreground">{result.multiplier.toFixed(2)}×</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/portion-size-to-calorie-calculator" />
      </div>
    </div>
  )
}
