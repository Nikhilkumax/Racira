"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  revenue: string
  spend: string
}

interface Result {
  roas: number
  roasPct: number
  profit: number
  margin: number
  scale: string
  breakEven: number
}

const DEFAULTS: Inputs = { revenue: "5000", spend: "1000" }

function calculate(inputs: Inputs): Result {
  const rev = parseFloat(inputs.revenue) || 0
  const cost = parseFloat(inputs.spend) || 0
  const roas = cost > 0 ? rev / cost : 0
  const profit = rev - cost
  const margin = rev > 0 ? (profit / rev) * 100 : 0
  return {
    roas,
    roasPct: roas * 100,
    profit,
    margin,
    scale: roas > 4 ? "High" : roas > 2 ? "Moderate" : "Low",
    breakEven: cost > 0 ? 1 : 0,
  }
}

export default function RoasCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(() => {
    const rev = parseFloat(inputs.revenue)
    const spend = parseFloat(inputs.spend)
    return isNaN(rev) || rev < 0 || isNaN(spend) || spend < 0
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Ad Spend", value: parseFloat(inputs.spend) || 0, fill: "hsl(var(--primary) / 0.45)" },
      { name: "Revenue", value: parseFloat(inputs.revenue) || 0, fill: "hsl(var(--primary))" },
      { name: "Profit", value: result.profit, fill: "hsl(142 71% 45%)" },
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
        <span className="hover:text-primary transition-colors">Business</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">ROAS Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        ROAS Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Total Ad Revenue ($)</label>
                <input
                  type="number"
                  value={inputs.revenue}
                  onChange={(e) => setInputs({ ...inputs, revenue: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Ad Spend ($)</label>
                <input
                  type="number"
                  value={inputs.spend}
                  onChange={(e) => setInputs({ ...inputs, spend: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1000"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative numbers for revenue and spend.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">ROAS (Return on Ad Spend)</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.roas.toFixed(2)}×</p>
            <p className="text-sm text-muted-foreground mt-1">
              ${parseFloat(inputs.revenue) || 0} revenue ÷ ${parseFloat(inputs.spend) || 0} spend
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Profit After Ads</p>
              <p className={`text-lg font-bold mt-1 ${result.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                ${result.profit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">revenue − spend</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Return %</p>
              <p className="text-lg font-bold text-primary mt-1">{result.roasPct.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">of every ad dollar</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Scaling Potential</p>
              <p className={`text-lg font-bold mt-1 ${result.roas > 4 ? "text-emerald-600" : result.roas > 2 ? "text-amber-600" : "text-red-600"}`}>
                {result.scale}
              </p>
              <p className="text-xs text-muted-foreground">benchmark: 4×+</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Campaign Profitability</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Ad Spend", parseFloat(inputs.spend) || 0, "cash out"],
                  ["Attributed Revenue", parseFloat(inputs.revenue) || 0, "gross from ads"],
                  ["Profit (After Ads)", result.profit, result.profit >= 0 ? "positive" : "negative"],
                ].map((row, i) => (
                  <tr
                    key={row[0] as string}
                    className={`border-b border-border ${i === 2 ? "bg-primary/10 font-semibold text-primary" : ""}`}
                  >
                    <td className="py-2.5 px-3">{row[0] as string}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      ${(row[1] as number).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{row[2] as string}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2.5 px-3">ROAS</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{result.roas.toFixed(2)}×</td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground">revenue per $1</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Money Flow ($)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, ""]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.roas > 0
                ? `Every $1 of ad spend returns $${result.roas.toFixed(2)} in revenue.`
                : "Enter spend greater than zero to compute ROAS."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Revenue</p>
                <p className="font-semibold text-foreground">${(parseFloat(inputs.revenue) || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ad Spend</p>
                <p className="font-semibold text-foreground">${(parseFloat(inputs.spend) || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ROAS</p>
                <p className="font-semibold text-foreground">{result.roas.toFixed(2)}× ({result.roasPct.toFixed(0)}%)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Profit</p>
                <p className="font-semibold text-foreground">${result.profit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gross Margin (from ads)</p>
                <p className="font-semibold text-foreground">{result.margin.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Break-Even ROAS</p>
                <p className="font-semibold text-foreground">1.0× (covers ad spend only)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/roas-calculator" />
      </div>
    </div>
  )
}
