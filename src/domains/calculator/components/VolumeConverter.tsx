"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface UnitOption {
  name: string
  factor: number // multiplier to convert to liters
}

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
}

const UNITS: UnitOption[] = [
  { name: "L (liter)", factor: 1 },
  { name: "mL (milliliter)", factor: 0.001 },
  { name: "m³ (cubic meter)", factor: 1000 },
  { name: "cm³ (cubic centimeter)", factor: 0.001 },
  { name: "gal (US gallon)", factor: 3.785411784 },
  { name: "qt (US quart)", factor: 0.946352946 },
  { name: "pt (US pint)", factor: 0.473176473 },
  { name: "fl oz (US fluid ounce)", factor: 0.0295735295625 },
  { name: "cup (US)", factor: 0.2365882365 },
  { name: "tbsp (US tablespoon)", factor: 0.01478676478125 },
  { name: "tsp (US teaspoon)", factor: 0.00492892159375 },
  { name: "imp gal (imperial gallon)", factor: 4.54609 },
  { name: "ft³ (cubic foot)", factor: 28.316846592 },
  { name: "in³ (cubic inch)", factor: 0.016387064 },
]

const DEFAULTS: Inputs = {
  value: "1",
  from: "gal (US gallon)",
  to: "L (liter)",
  digits: "4",
}

function calculate(inputs: Inputs): Result {
  const value = parseFloat(inputs.value)
  const digits = Math.max(0, Math.min(10, parseInt(inputs.digits) || 4))
  const fromFactor = UNITS.find((u) => u.name === inputs.from)?.factor ?? 1
  const toFactor = UNITS.find((u) => u.name === inputs.to)?.factor ?? 1
  const converted = (value * fromFactor) / toFactor

  const perUnit = UNITS.map((u) => ({
    unit: u.name.split(" (")[0],
    value: (value * fromFactor) / u.factor,
  }))

  return {
    converted,
    convertedFormatted: converted.toLocaleString("en-US", {
      maximumFractionDigits: digits,
    }),
    perUnit,
  }
}

export default function VolumeConverter() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(() => {
    const v = parseFloat(inputs.value)
    return isNaN(v) || v < 0
  }, [inputs.value])

  const chartData = useMemo(() => {
    const max = Math.max(...result.perUnit.map((d) => d.value))
    return result.perUnit.map((d) => ({ ...d, log: d.value > 0 ? Math.log10(d.value) : 0, isMax: d.value === max }))
  }, [result])

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const fromFactor = UNITS.find((u) => u.name === inputs.from)?.factor ?? 1

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Converters</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Volume Converter</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Volume Converter
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Volume Value</label>
                <input
                  type="number"
                  value={inputs.value}
                  onChange={(e) => setInputs({ ...inputs, value: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1"
                />
                {invalid && <p className="text-xs text-red-500 mt-1">Enter a non-negative number.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">From Unit</label>
                <select
                  value={inputs.from}
                  onChange={(e) => setInputs({ ...inputs, from: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {UNITS.map((u) => (
                    <option key={u.name} value={u.name}>{u.name}</option>
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
                    <option key={u.name} value={u.name}>{u.name}</option>
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
                Advanced Options {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showAdvanced && (
                <div className="mt-3 rounded-md border border-border p-3 bg-background">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Precision</p>
                    <label className="block text-sm font-medium mb-1">Significant Digits</label>
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Converted Volume</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.convertedFormatted}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {inputs.to.split(" (")[0]}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Input</p>
              <p className="text-lg font-bold text-foreground mt-1">{parseFloat(inputs.value).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{inputs.from.split(" (")[0]}</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">In Liters</p>
              <p className="text-lg font-bold text-primary mt-1">
                {(parseFloat(inputs.value) * fromFactor).toLocaleString("en-US", { maximumFractionDigits: 6 })}
              </p>
              <p className="text-xs text-muted-foreground">base unit</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">In m³</p>
              <p className="text-lg font-bold text-amber-600 mt-1">
                {(parseFloat(inputs.value) * fromFactor / 1000).toLocaleString("en-US", { maximumFractionDigits: 6 })}
              </p>
              <p className="text-xs text-muted-foreground">SI unit</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Equivalent Values</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                    <th className="text-left py-2 px-3 font-medium">Unit</th>
                    <th className="text-right py-2 px-3 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perUnit.map((row, i) => (
                    <tr
                      key={row.unit}
                      className={`border-b border-border ${row.unit === inputs.to.split(" (")[0] ? "bg-primary/10 font-semibold text-primary" : ""}`}
                    >
                      <td className="py-2.5 px-3">{row.unit}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {row.value.toLocaleString("en-US", { maximumFractionDigits: 6 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Equivalent Values (log scale)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="unit" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={70} />
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
                <p className="font-semibold text-foreground">{parseFloat(inputs.value).toLocaleString()} {inputs.from.split(" (")[0]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Converted To</p>
                <p className="font-semibold text-foreground">{result.convertedFormatted} {inputs.to.split(" (")[0]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">In Liters</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.value) * fromFactor).toLocaleString("en-US", { maximumFractionDigits: 6 })} L</p>
              </div>
              <div>
                <p className="text-muted-foreground">In Gallons (US)</p>
                <p className="font-semibold text-foreground">
                  {(parseFloat(inputs.value) * fromFactor / 3.785411784).toLocaleString("en-US", { maximumFractionDigits: 6 })} gal
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">In Cubic Meters</p>
                <p className="font-semibold text-foreground">
                  {(parseFloat(inputs.value) * fromFactor / 1000).toLocaleString("en-US", { maximumFractionDigits: 6 })} m³
                </p>
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
        <PopularCalculators exclude="/calculator/volume-converter" />
      </div>
    </div>
  )
}
