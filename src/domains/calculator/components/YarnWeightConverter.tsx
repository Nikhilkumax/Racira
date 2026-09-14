"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface YarnCategory {
  number: number
  usName: string
  ukName: string
  auName: string
  gaugeMin: number // stitches per 4 inches
  gaugeMax: number
  needleMin: number // mm
  needleMax: number
  hookMin: number // mm
  hookMax: number
  wpiMin: number // wraps per inch
  wpiMax: number
}

const CATEGORIES: YarnCategory[] = [
  { number: 0, usName: "Lace", ukName: "3-ply", auName: "3-ply", gaugeMin: 33, gaugeMax: 40, needleMin: 1.5, needleMax: 2.25, hookMin: 2.25, hookMax: 3.5, wpiMin: 16, wpiMax: 18 },
  { number: 1, usName: "Super Fine", ukName: "4-ply", auName: "4-ply", gaugeMin: 27, gaugeMax: 32, needleMin: 2.25, needleMax: 3.25, hookMin: 3.5, hookMax: 4.5, wpiMin: 14, wpiMax: 16 },
  { number: 2, usName: "Fine", ukName: "5-ply", auName: "5-ply", gaugeMin: 23, gaugeMax: 26, needleMin: 3.25, needleMax: 3.75, hookMin: 4.5, hookMax: 5.5, wpiMin: 12, wpiMax: 14 },
  { number: 3, usName: "Light", ukName: "DK", auName: "8-ply", gaugeMin: 21, gaugeMax: 24, needleMin: 3.75, needleMax: 4.5, hookMin: 5.5, hookMax: 6.5, wpiMin: 11, wpiMax: 12 },
  { number: 4, usName: "Medium", ukName: "Aran", auName: "10-ply", gaugeMin: 16, gaugeMax: 20, needleMin: 4.5, needleMax: 5.5, hookMin: 6.5, hookMax: 8, wpiMin: 9, wpiMax: 10 },
  { number: 5, usName: "Bulky", ukName: "Chunky", auName: "12-ply", gaugeMin: 12, gaugeMax: 15, needleMin: 5.5, needleMax: 8, hookMin: 8, hookMax: 10, wpiMin: 7, wpiMax: 8 },
  { number: 6, usName: "Super Bulky", ukName: "Super Chunky", auName: "14-ply", gaugeMin: 8, gaugeMax: 11, needleMin: 8, needleMax: 12.75, hookMin: 10, hookMax: 12, wpiMin: 5, wpiMax: 6 },
  { number: 7, usName: "Jumbo", ukName: "—", auName: "16-ply", gaugeMin: 1, gaugeMax: 7, needleMin: 12.75, needleMax: 19, hookMin: 12, hookMax: 16, wpiMin: 1, wpiMax: 4 },
]

interface Inputs {
  category: string
  gauge: string
}

interface Result {
  cat: YarnCategory
  gaugeIn: boolean
  gaugeMid: number
  needleMid: number
  hookMid: number
}

const DEFAULTS: Inputs = {
  category: "Light (DK)",
  gauge: "21",
}

function calculate(inputs: Inputs): Result {
  const cat = CATEGORIES.find((c) => `${c.usName}${c.number === 4 ? " (Worsted/Aran)" : ""}` === inputs.category)
    ?? CATEGORIES.find((c) => `${c.number} ${c.usName}` === inputs.category)
    ?? CATEGORIES.find((c) => c.usName === "Light")
    ?? CATEGORIES[3]
  const gauge = parseFloat(inputs.gauge)
  const gaugeIn = !isNaN(gauge) && gauge >= cat.gaugeMin && gauge <= cat.gaugeMax
  return {
    cat,
    gaugeIn,
    gaugeMid: (cat.gaugeMin + cat.gaugeMax) / 2,
    needleMid: (cat.needleMin + cat.needleMax) / 2,
    hookMid: (cat.hookMin + cat.hookMax) / 2,
  }
}

export default function YarnWeightConverter() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  const invalid = useMemo(() => {
    const g = parseFloat(inputs.gauge)
    return isNaN(g) || g <= 0 || g > 40
  }, [inputs.gauge])

  const chartData = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: `${c.number} ${c.usName}`,
        low: c.gaugeMin,
        high: c.gaugeMax,
        mid: (c.gaugeMin + c.gaugeMax) / 2,
        isSel: c.usName === result.cat.usName,
      })),
    [result]
  )

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const cat = result.cat
  const gauge = parseFloat(inputs.gauge)
  const nearest = useMemo(() => {
    let best = CATEGORIES[0]
    let bestDist = Infinity
    for (const c of CATEGORIES) {
      const d = Math.abs(gauge - (c.gaugeMin + c.gaugeMax) / 2)
      if (d < bestDist) {
        bestDist = d
        best = c
      }
    }
    return best
  }, [gauge])

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Converters</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Yarn Weight Converter</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Yarn Weight Converter
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">US Yarn Weight</label>
                <select
                  value={inputs.category}
                  onChange={(e) => setInputs({ ...inputs, category: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.number} value={`${c.number} ${c.usName}`}>
                      {c.number} — {c.usName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stitches per 4 in (gauge)</label>
                <input
                  type="number"
                  value={inputs.gauge}
                  onChange={(e) => setInputs({ ...inputs, gauge: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") run(); }}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="21"
                />
                {invalid && <p className="text-xs text-red-500 mt-1">Enter a gauge between 1 and 40.</p>}
              </div>
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Matched Yarn Weight</p>
            <p className="text-4xl font-bold text-primary mt-1">
              {cat.number} {cat.usName}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              UK: {cat.ukName} · AU: {cat.auName}
              {!result.gaugeIn && gauge > 0 && ` · nearest: ${nearest.number} ${nearest.usName}`}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Gauge Range</p>
              <p className="text-lg font-bold text-foreground mt-1">
                {cat.gaugeMin}–{cat.gaugeMax} sts
              </p>
              <p className="text-xs text-muted-foreground">per 4 in</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Needle Size</p>
              <p className="text-lg font-bold text-primary mt-1">
                {cat.needleMin}–{cat.needleMax} mm
              </p>
              <p className="text-xs text-muted-foreground">US {result.needleMid <= 3.25 ? "0–3" : result.needleMid <= 4.5 ? "4–7" : result.needleMid <= 8 ? "8–11" : "13+"} approx</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Typical WPI</p>
              <p className="text-lg font-bold text-amber-600 mt-1">
                {cat.wpiMin}–{cat.wpiMax}
              </p>
              <p className="text-xs text-muted-foreground">wraps per inch</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Category Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["US Standard", `${cat.number} — ${cat.usName}`],
                    ["UK Name", cat.ukName],
                    ["Australia Name", cat.auName],
                    ["Gauge", `${cat.gaugeMin}–${cat.gaugeMax} sts per 4 in`],
                    ["Knitting Needles", `${cat.needleMin}–${cat.needleMax} mm`],
                    ["Crochet Hook", `${cat.hookMin}–${cat.hookMax} mm`],
                    ["Typical WPI", `${cat.wpiMin}–${cat.wpiMax}`],
                  ].map((row, i) => (
                    <tr
                      key={row[0]}
                      className={`border-b border-border ${row[0] === "US Standard" ? "bg-primary/10 font-semibold text-primary" : ""}`}
                    >
                      <td className="py-2.5 px-3 text-muted-foreground">{row[0]}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Gauge Ranges by Category (sts per 4 in)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={75} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    name === "low" ? `${v} min` : name === "high" ? `${v} max` : `${v}`,
                    name === "low" ? "Gauge min" : name === "high" ? "Gauge max" : "Midpoint",
                  ]}
                />
                <Bar dataKey="low" radius={[0, 0, 0, 0]} fill="hsl(var(--primary) / 0.25)" />
                <Bar dataKey="high" radius={[4, 4, 0, 0]} fill="hsl(var(--primary) / 0.55)" />
                <Bar dataKey="mid" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.isSel ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.45)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Highlighted bar = selected category (Craft Yarn Council standards).</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Selected</p>
                <p className="font-semibold text-foreground">{cat.number} {cat.usName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">UK / AU</p>
                <p className="font-semibold text-foreground">{cat.ukName} / {cat.auName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Your Gauge</p>
                <p className="font-semibold text-foreground">
                  {gauge > 0 ? `${gauge} sts/4in ${result.gaugeIn ? "· in range" : "· outside range"}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Recommended Needle</p>
                <p className="font-semibold text-foreground">{cat.needleMin}–{cat.needleMax} mm</p>
              </div>
              <div>
                <p className="text-muted-foreground">Recommended Hook</p>
                <p className="font-semibold text-foreground">{cat.hookMin}–{cat.hookMax} mm</p>
              </div>
              <div>
                <p className="text-muted-foreground">Standard Source</p>
                <p className="font-semibold text-foreground">Craft Yarn Council</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/yarn-weight-converter" />
      </div>
    </div>
  )
}
