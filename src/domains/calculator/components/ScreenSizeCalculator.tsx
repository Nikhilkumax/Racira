"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  diagonal: string
  ratioWidth: string
  ratioHeight: string
}

interface Result {
  width: number
  height: number
  area: number
  k: number
}

const DEFAULTS: Inputs = { diagonal: "27", ratioWidth: "16", ratioHeight: "9" }

const RATIO_PRESETS = [
  { label: "16:9", w: "16", h: "9" },
  { label: "21:9", w: "21", h: "9" },
  { label: "16:10", w: "16", h: "10" },
  { label: "4:3", w: "4", h: "3" },
  { label: "3:2", w: "3", h: "2" },
]

function calculate(inputs: Inputs): Result {
  const d = parseFloat(inputs.diagonal) || 0
  const rw = parseFloat(inputs.ratioWidth) || 16
  const rh = parseFloat(inputs.ratioHeight) || 9
  const k = Math.sqrt(Math.pow(d, 2) / (Math.pow(rw, 2) + Math.pow(rh, 2)))
  const width = rw * k
  const height = rh * k
  return { width, height, area: width * height, k }
}

export default function ScreenSizeCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const d = parseFloat(inputs.diagonal)
    const rw = parseFloat(inputs.ratioWidth)
    const rh = parseFloat(inputs.ratioHeight)
    return [d, rw, rh].some((x) => isNaN(x) || x <= 0)
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Width", value: result.width, fill: "hsl(var(--primary))" },
      { name: "Height", value: result.height, fill: "hsl(var(--primary) / 0.6)" },
      { name: "Diagonal", value: parseFloat(inputs.diagonal) || 0, fill: "hsl(var(--primary) / 0.3)" },
    ],
    [result, inputs]
  )

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const cm = (inches: number) => (inches * 2.54).toFixed(1)

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Screen Size Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Screen Size Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Diagonal Size (inches)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.diagonal}
                  onChange={(e) => setInputs({ ...inputs, diagonal: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="27"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ratio Width</label>
                <input
                  type="number"
                  value={inputs.ratioWidth}
                  onChange={(e) => setInputs({ ...inputs, ratioWidth: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="16"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ratio Height</label>
                <input
                  type="number"
                  value={inputs.ratioHeight}
                  onChange={(e) => setInputs({ ...inputs, ratioHeight: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="9"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Common Ratios</label>
                <div className="flex flex-wrap gap-1.5">
                  {RATIO_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setInputs({ ...inputs, ratioWidth: p.w, ratioHeight: p.h })}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                        inputs.ratioWidth === p.w && inputs.ratioHeight === p.h
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary hover:bg-primary/10 border-border text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter positive numbers for diagonal and ratio.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Screen Area</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.area.toFixed(1)} <span className="text-xl font-semibold">in²</span></p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.width.toFixed(2)} × {result.height.toFixed(2)} in at {inputs.ratioWidth}:{inputs.ratioHeight}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Width</p>
              <p className="text-lg font-bold text-foreground mt-1">{result.width.toFixed(2)} in</p>
              <p className="text-xs text-muted-foreground">{cm(result.width)} cm</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Height</p>
              <p className="text-lg font-bold text-primary mt-1">{result.height.toFixed(2)} in</p>
              <p className="text-xs text-muted-foreground">{cm(result.height)} cm</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Aspect Ratio</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{inputs.ratioWidth}:{inputs.ratioHeight}</p>
              <p className="text-xs text-muted-foreground">{parseFloat(inputs.ratioWidth) / parseFloat(inputs.ratioHeight) > 0 ? (parseFloat(inputs.ratioWidth) / (parseFloat(inputs.ratioHeight) || 1)).toFixed(2) : "—"}:1</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Physical Dimensions</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Width", `${result.width.toFixed(2)} in`, `${cm(result.width)} cm`],
                  ["Height", `${result.height.toFixed(2)} in`, `${cm(result.height)} cm`],
                  ["Area", `${result.area.toFixed(1)} in²`, `${(result.area * 6.4516).toFixed(0)} cm²`],
                  ["Diagonal", `${(parseFloat(inputs.diagonal) || 0).toFixed(1)} in`, `${cm(parseFloat(inputs.diagonal) || 0)} cm`],
                  ["Aspect Ratio", `${inputs.ratioWidth}:${inputs.ratioHeight}`, `${(parseFloat(inputs.ratioWidth) / (parseFloat(inputs.ratioHeight) || 1)).toFixed(2)}:1`],
                ].map((row, i) => (
                  <tr key={row[0] as string} className={`border-b border-border ${i === 2 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0] as string}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{row[1] as string}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{row[2] as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Visual representation */}
            <div className="mt-4 rounded-lg bg-secondary/30 border border-border flex items-center justify-center p-4">
              <div
                className="border-2 border-primary bg-primary/10 rounded"
                style={{ aspectRatio: `${inputs.ratioWidth}/${inputs.ratioHeight}`, width: "80%" }}
              />
            </div>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Dimensions (inches)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)} in`, ""]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              For a fixed diagonal, squarer ratios (4:3) give more area than widescreen (16:9).
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Diagonal</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.diagonal) || 0} in</p>
              </div>
              <div>
                <p className="text-muted-foreground">Aspect Ratio</p>
                <p className="font-semibold text-foreground">{inputs.ratioWidth}:{inputs.ratioHeight}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Width</p>
                <p className="font-semibold text-foreground">{result.width.toFixed(2)} in ({cm(result.width)} cm)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Height</p>
                <p className="font-semibold text-foreground">{result.height.toFixed(2)} in ({cm(result.height)} cm)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Area</p>
                <p className="font-semibold text-foreground">{result.area.toFixed(1)} in² ({(result.area * 6.4516).toFixed(0)} cm²)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Scale Factor</p>
                <p className="font-semibold text-foreground">{result.k.toFixed(3)} in/unit</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/screen-size-calculator" />
      </div>
    </div>
  )
}
