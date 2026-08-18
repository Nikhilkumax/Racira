"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  r: string
  g: string
  b: string
}

interface Result {
  hex: string
  cssRgb: string
  hsl: { h: number; s: number; l: number }
  complement: string
  luminance: number
}

const DEFAULTS: Inputs = { r: "103", g: "58", b: "183" }

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

function componentToHex(c: number): string {
  const hex = clamp255(c).toString(16)
  return hex.length === 1 ? "0" + hex : hex
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0))
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function calculate(inputs: Inputs): Result {
  const r = clamp255(parseFloat(inputs.r) || 0)
  const g = clamp255(parseFloat(inputs.g) || 0)
  const b = clamp255(parseFloat(inputs.b) || 0)
  const hex = rgbToHex(r, g, b).toUpperCase()
  const hsl = rgbToHsl(r, g, b)
  const complement = rgbToHex(255 - r, 255 - g, 255 - b).toUpperCase()
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return { hex, cssRgb: `rgb(${r}, ${g}, ${b})`, hsl, complement, luminance }
}

export default function RgbToHexConverter() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(
    () =>
      ["r", "g", "b"].some((k) => {
        const v = parseFloat(inputs[k as keyof Inputs])
        return isNaN(v)
      }),
    [inputs]
  )

  const chartData = useMemo(() => {
    const r = clamp255(parseFloat(inputs.r) || 0)
    const g = clamp255(parseFloat(inputs.g) || 0)
    const b = clamp255(parseFloat(inputs.b) || 0)
    return [
      { name: "Red", value: r, fill: "#ef4444" },
      { name: "Green", value: g, fill: "#22c55e" },
      { name: "Blue", value: b, fill: "#3b82f6" },
    ]
  }, [inputs])

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const r = clamp255(parseFloat(inputs.r) || 0)
  const g = clamp255(parseFloat(inputs.g) || 0)
  const b = clamp255(parseFloat(inputs.b) || 0)
  const textColor = result.luminance > 0.5 ? "#111827" : "#ffffff"

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">RGB to HEX Converter</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        RGB to HEX Converter
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            {(["r", "g", "b"] as const).map((channel, idx) => {
              const labels = ["Red", "Green", "Blue"]
              const colors = ["text-red-500", "text-green-500", "text-blue-500"]
              const accents = ["accent-red-500", "accent-green-500", "accent-blue-500"]
              return (
                <div key={channel} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <label className={`text-sm font-medium ${colors[idx]}`}>{labels[idx]}</label>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={inputs[channel]}
                      onChange={(e) => setInputs({ ...inputs, [channel]: e.target.value })}
                      className="w-16 h-9 text-center rounded-md border border-input bg-background font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={clamp255(parseFloat(inputs[channel]) || 0)}
                    onChange={(e) => setInputs({ ...inputs, [channel]: e.target.value })}
                    className={`w-full ${accents[idx]}`}
                  />
                </div>
              )
            })}
            {invalid && <p className="text-xs text-red-500 mt-2">All channels must be numbers (0–255).</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Hex Code</p>
            <p className="text-4xl font-bold text-primary mt-1 font-mono">{result.hex}</p>
            <p className="text-sm text-muted-foreground mt-1">{result.cssRgb}</p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">HSL</p>
              <p className="text-lg font-bold text-foreground mt-1 font-mono text-base">
                {result.hsl.h}° {result.hsl.s}% {result.hsl.l}%
              </p>
              <p className="text-xs text-muted-foreground">hue · sat · light</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Complement</p>
              <p className="text-lg font-bold text-primary mt-1 font-mono text-base">{result.complement}</p>
              <p className="text-xs text-muted-foreground">inverted color</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Relative Luminance</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{result.luminance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">0 = black · 1 = white</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Color Details</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Red (R)", `${r}`, `#${componentToHex(r)}`],
                  ["Green (G)", `${g}`, `#${componentToHex(g)}`],
                  ["Blue (B)", `${b}`, `#${componentToHex(b)}`],
                  ["Hex Code", result.hex, "CSS-ready"],
                  ["CSS RGB", result.cssRgb, "rgb() notation"],
                  ["Complement", result.complement, "255 − channel"],
                ].map((row, i) => (
                  <tr key={row[0]} className={`border-b border-border ${row[0] === "Hex Code" ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0]}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{row[1]}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 rounded-lg h-12 border border-border flex items-center justify-center" style={{ backgroundColor: result.hex }}>
              <span className="font-mono text-sm font-bold" style={{ color: textColor }}>{result.hex}</span>
            </div>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Channel Intensity (0–255)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 255]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v} / 255`, "Intensity"]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">16.7M possible colors — 256 levels per channel.</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Hex Code</p>
                <p className="font-semibold text-foreground font-mono">{result.hex}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CSS RGB</p>
                <p className="font-semibold text-foreground font-mono text-xs">{result.cssRgb}</p>
              </div>
              <div>
                <p className="text-muted-foreground">HSL</p>
                <p className="font-semibold text-foreground">{result.hsl.h}° {result.hsl.s}% {result.hsl.l}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Complement</p>
                <p className="font-semibold text-foreground font-mono">{result.complement}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Grayscale Value</p>
                <p className="font-semibold text-foreground font-mono">{rgbToHex(r, r, r).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Colors</p>
                <p className="font-semibold text-foreground">16,777,216</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/rgb-to-hex-converter" />
      </div>
    </div>
  )
}
