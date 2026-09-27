"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  batteryCapacity: string
  batteryVoltage: string
  load: string
  efficiency: string
}

interface Result {
  totalWh: number
  effectiveWh: number
  runtimeHours: number
  runtimeMinutes: number
  loadPct: number
  perLoad: { name: string; minutes: number; isSel: boolean }[]
}

const DEFAULTS: Inputs = { batteryCapacity: "100", batteryVoltage: "12", load: "300", efficiency: "85" }

function calculate(inputs: Inputs): Result {
  const ah = parseFloat(inputs.batteryCapacity) || 0
  const v = parseFloat(inputs.batteryVoltage) || 0
  const w = parseFloat(inputs.load) || 0
  const eff = (parseFloat(inputs.efficiency) || 85) / 100

  const totalWh = ah * v
  const effectiveWh = totalWh * eff
  const runtimeHours = w > 0 ? effectiveWh / w : 0
  const runtimeMinutes = runtimeHours * 60

  const loads = [100, 200, 300, 500, 800].map((l) => ({
    name: `${l}W`,
    minutes: l > 0 ? (effectiveWh / l) * 60 : 0,
    isSel: Math.abs(l - w) < 1,
  }))

  return {
    totalWh,
    effectiveWh,
    runtimeHours,
    runtimeMinutes,
    loadPct: totalWh > 0 ? (w / totalWh) * 100 : 0,
    perLoad: loads,
  }
}

export default function UpsBatteryRuntimeCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const ah = parseFloat(inputs.batteryCapacity)
    const v = parseFloat(inputs.batteryVoltage)
    const w = parseFloat(inputs.load)
    const eff = parseFloat(inputs.efficiency)
    return [ah, v, w, eff].some((x) => isNaN(x) || x < 0)
  }, [inputs])

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  return (
    <div className="racira-page-container py-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">UPS Battery Runtime Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        UPS Battery Runtime Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Battery Capacity (Ah)</label>
                <input
                  type="number"
                  value={inputs.batteryCapacity}
                  onChange={(e) => setInputs({ ...inputs, batteryCapacity: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Battery Voltage (V)</label>
                <input
                  type="number"
                  value={inputs.batteryVoltage}
                  onChange={(e) => setInputs({ ...inputs, batteryVoltage: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Load (Watts)</label>
                <input
                  type="number"
                  value={inputs.load}
                  onChange={(e) => setInputs({ ...inputs, load: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">UPS Efficiency (%)</label>
                <input
                  type="number"
                  value={inputs.efficiency}
                  onChange={(e) => setInputs({ ...inputs, efficiency: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="85"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative numbers for all fields.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Runtime</p>
            <p className="text-4xl font-bold text-primary mt-1">
              {Math.floor(result.runtimeMinutes)} <span className="text-xl font-semibold">min</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.runtimeHours.toFixed(1)} hours at {parseFloat(inputs.load) || 0} W load
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Battery Storage</p>
              <p className="text-lg font-bold text-foreground mt-1">{result.totalWh.toLocaleString()} Wh</p>
              <p className="text-xs text-muted-foreground">{(parseFloat(inputs.batteryCapacity) || 0).toLocaleString()} Ah × {(parseFloat(inputs.batteryVoltage) || 0).toLocaleString()} V</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Usable Energy</p>
              <p className="text-lg font-bold text-primary mt-1">{result.effectiveWh.toLocaleString()} Wh</p>
              <p className="text-xs text-muted-foreground">{parseFloat(inputs.efficiency) || 0}% efficiency</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Load Ratio</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{result.loadPct.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">of battery capacity</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Backup Projection</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Battery Capacity", `${(parseFloat(inputs.batteryCapacity) || 0).toLocaleString()} Ah`],
                  ["Battery Voltage", `${parseFloat(inputs.batteryVoltage) || 0} V`],
                  ["Total Energy Stored", `${result.totalWh.toLocaleString()} Wh`],
                  ["Efficiency Loss", `${100 - (parseFloat(inputs.efficiency) || 0)}%`],
                  ["Usable Energy", `${result.effectiveWh.toLocaleString()} Wh`],
                  ["Continuous Load", `${parseFloat(inputs.load) || 0} W`],
                  ["Estimated Runtime", `${result.runtimeMinutes.toFixed(0)} min (${result.runtimeHours.toFixed(1)} h)`],
                ].map((row, i) => (
                  <tr key={row[0]} className={`border-b border-border ${i === 6 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0]}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Runtime at Common Loads (minutes)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.perLoad} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)} min`, "Runtime"]} labelFormatter={(l) => `${l} load`} />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                  {result.perLoad.map((d) => (
                    <Cell key={d.name} fill={d.isSel ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Highlighted bar = your current load. Real runtime shrinks as batteries age.</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Energy Stored</p>
                <p className="font-semibold text-foreground">{result.totalWh.toLocaleString()} Wh</p>
              </div>
              <div>
                <p className="text-muted-foreground">Usable Energy</p>
                <p className="font-semibold text-foreground">{result.effectiveWh.toLocaleString()} Wh</p>
              </div>
              <div>
                <p className="text-muted-foreground">Runtime</p>
                <p className="font-semibold text-foreground">{result.runtimeMinutes.toFixed(1)} min</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hours</p>
                <p className="font-semibold text-foreground">{result.runtimeHours.toFixed(2)} h</p>
              </div>
              <div>
                <p className="text-muted-foreground">Load</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.load) || 0} W</p>
              </div>
              <div>
                <p className="text-muted-foreground">Battery Aging</p>
                <p className="font-semibold text-foreground">3-yr-old battery ≈ 60–70% runtime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/ups-battery-runtime-calculator" />
      </div>
    </div>
  )
}
