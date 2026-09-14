"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface UnitOption {
  key: string
  label: string
  short: string
  toGrams: number
}

const UNITS: UnitOption[] = [
  { key: "mg", label: "Milligrams (mg)", short: "mg", toGrams: 0.001 },
  { key: "g", label: "Grams (g)", short: "g", toGrams: 1 },
  { key: "kg", label: "Kilograms (kg)", short: "kg", toGrams: 1000 },
  { key: "ton", label: "Metric Tons (t)", short: "t", toGrams: 1000000 },
  { key: "oz", label: "Ounces (oz)", short: "oz", toGrams: 28.349523125 },
  { key: "lb", label: "Pounds (lb)", short: "lb", toGrams: 453.59237 },
  { key: "st", label: "Stones (st)", short: "st", toGrams: 6350.29318 },
]

interface Inputs {
  value: string
  from: string
  to: string
  digits: string
}

interface Result {
  converted: number
  convertedFormatted: string
  perUnit: { unit: string; value: number }[]
  grams: number
}

const DEFAULTS: Inputs = {
  value: "70",
  from: "kg",
  to: "lb",
  digits: "4",
}

function fmt(n: number, digits: number): string {
  if (Math.abs(n) >= 0.01 || n === 0)
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: digits })
  return n.toExponential(4)
}

function calculate(inputs: Inputs): Result {
  const value = parseFloat(inputs.value)
  const digits = Math.max(0, Math.min(10, parseInt(inputs.digits) || 4))
  const fromUnit = UNITS.find((u) => u.key === inputs.from) ?? UNITS[2]
  const toUnit = UNITS.find((u) => u.key === inputs.to) ?? UNITS[5]
  const grams = (isNaN(value) ? 0 : value) * fromUnit.toGrams
  const converted = grams / toUnit.toGrams

  return {
    converted,
    convertedFormatted: fmt(converted, digits),
    perUnit: UNITS.map((u) => ({ unit: u.short, value: grams / u.toGrams })),
    grams,
  }
}

export default function WeightConverter() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => isNaN(parseFloat(inputs.value)), [inputs.value])

  const chartData = useMemo(() => {
    const max = Math.max(...result.perUnit.map((d) => d.value))
    return result.perUnit.map((d) => ({
      ...d,
      log: d.value > 0 ? Math.log10(d.value) : 0,
      isMax: d.value === max,
    }))
  }, [result])

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const fromUnit = UNITS.find((u) => u.key === inputs.from) ?? UNITS[2]
  const toUnit = UNITS.find((u) => u.key === inputs.to) ?? UNITS[5]

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Converters</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Weight Converter</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Weight Converter
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Weight Value</label>
                <input
                  type="number"
                  value={inputs.value}
                  onChange={(e) => setInputs({ ...inputs, value: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="70"
                />
                {invalid && <p className="text-xs text-red-500 mt-1">Enter a numeric value.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">From Unit</label>
                <select
                  value={inputs.from}
                  onChange={(e) => setInputs({ ...inputs, from: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {UNITS.map((u) => (
                    <option key={u.key} value={u.key}>{u.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Unit</label>
                <select
                  value={inputs.to}
                  onChange={(e) => setInputs({ ...inputs, to: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {UNITS.map((u) => (
                    <option key={u.key} value={u.key}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-primary font-medium inline-flex items-center gap-1"
              >
                Advanced Options {showAdvanced ? "▲" : "▼"}
              </button>
              {showAdvanced && (
                <div className="mt-3 rounded-md border border-border p-3 bg-background">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Precision</p>
                    <label className="block text-sm font-medium mb-1">Decimal Places</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={inputs.digits}
                      onChange={(e) => setInputs({ ...inputs, digits: e.target.value })}
                      className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Converted Weight</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.convertedFormatted}</p>
            <p className="text-sm text-muted-foreground mt-1">{toUnit.short}</p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Input</p>
              <p className="text-lg font-bold text-foreground mt-1">{fmt(parseFloat(inputs.value) || 0, 4)}</p>
              <p className="text-xs text-muted-foreground">{fromUnit.short}</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">In Grams</p>
              <p className="text-lg font-bold text-primary mt-1">{fmt(result.grams, 2)}</p>
              <p className="text-xs text-muted-foreground">base unit</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">In Kilograms</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{fmt(result.grams / 1000, 4)}</p>
              <p className="text-xs text-muted-foreground">SI unit</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Equivalent Values</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Unit</th>
                  <th className="text-right py-2 px-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {result.perUnit.map((row) => (
                  <tr
                    key={row.unit}
                    className={`border-b border-border ${row.unit === toUnit.short ? "bg-primary/10 font-semibold text-primary" : ""}`}
                  >
                    <td className="py-2.5 px-3">{row.unit}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{fmt(row.value, 6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Equivalent Values (log scale)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [v.toLocaleString("en-US", { maximumFractionDigits: 6 }), "Value"]}
                />
                <Bar dataKey="log" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.unit} fill={d.isMax ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.45)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Logarithmic scale shows orders of magnitude across units.</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Input Value</p>
                <p className="font-semibold text-foreground">{fmt(parseFloat(inputs.value) || 0, 4)} {fromUnit.short}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Converted To</p>
                <p className="font-semibold text-foreground">{result.convertedFormatted} {toUnit.short}</p>
              </div>
              <div>
                <p className="text-muted-foreground">In Grams</p>
                <p className="font-semibold text-foreground">{fmt(result.grams, 2)} g</p>
              </div>
              <div>
                <p className="text-muted-foreground">In Pounds</p>
                <p className="font-semibold text-foreground">{fmt(result.grams / 453.59237, 4)} lb</p>
              </div>
              <div>
                <p className="text-muted-foreground">In Kilograms</p>
                <p className="font-semibold text-foreground">{fmt(result.grams / 1000, 4)} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">Units Covered</p>
                <p className="font-semibold text-foreground">{UNITS.length} metric + imperial</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/weight-converter" />
      </div>
    </div>
  )
}
