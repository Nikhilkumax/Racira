"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer, Plus, Trash2 } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Component {
  id: number
  name: string
  units: string
}

interface Inputs {
  rackCapacity: string
  components: Component[]
}

interface Result {
  totalU: number
  usedU: number
  remainingU: number
  fillPct: number
  heightInches: number
  heightMm: number
  overCapacity: boolean
}

const DEFAULT_COMPONENTS: Component[] = [
  { id: 1, name: "Dell PowerEdge (Server)", units: "1" },
  { id: 2, name: "APC Smart-UPS", units: "2" },
  { id: 3, name: "Cisco Switch", units: "1" },
]

const DEFAULTS: Inputs = {
  rackCapacity: "42",
  components: DEFAULT_COMPONENTS,
}

const RACK_UNIT_INCHES = 1.75 // 1U = 1.75 in = 44.45 mm

function calculate(inputs: Inputs): Result {
  const totalU = parseFloat(inputs.rackCapacity) || 0
  let usedU = 0
  for (const c of inputs.components) {
    usedU += parseFloat(c.units) || 0
  }
  const remainingU = totalU - usedU
  const fillPct = totalU > 0 ? (usedU / totalU) * 100 : 0
  const heightInches = usedU * RACK_UNIT_INCHES
  return {
    totalU,
    usedU,
    remainingU,
    fillPct,
    heightInches,
    heightMm: heightInches * 25.4,
    overCapacity: remainingU < 0,
  }
}

export default function ServerRackUnitsCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const cap = parseFloat(inputs.rackCapacity)
    if (isNaN(cap) || cap <= 0) return true
    return inputs.components.some((c) => {
      const u = parseFloat(c.units)
      return isNaN(u) || u < 0
    })
  }, [inputs])

  function addComponent() {
    setInputs({
      ...inputs,
      components: [...inputs.components, { id: Date.now(), name: "New Device", units: "1" }],
    })
  }

  function removeComponent(id: number) {
    setInputs({ ...inputs, components: inputs.components.filter((c) => c.id !== id) })
  }

  function updateComponent(id: number, field: "name" | "units", value: string) {
    setInputs({
      ...inputs,
      components: inputs.components.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    })
  }

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const chartData = useMemo(() => {
    const data = inputs.components.map((c, i) => ({
      name: c.name.length > 16 ? c.name.slice(0, 15) + "…" : c.name,
      units: parseFloat(c.units) || 0,
      isFirst: i === 0,
    }))
    const remaining = result.remainingU > 0 ? result.remainingU : 0
    if (remaining > 0) {
      data.push({ name: "Free Space", units: remaining, isFirst: false })
    }
    return data
  }, [inputs.components, result.remainingU])

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Server Rack Units Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Server Rack Units Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Rack Total Capacity (U)</label>
                <input
                  type="number"
                  min={1}
                  value={inputs.rackCapacity}
                  onChange={(e) => setInputs({ ...inputs, rackCapacity: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="42"
                />
              </div>
              <div className="flex items-end justify-end pb-1">
                <button
                  type="button"
                  onClick={addComponent}
                  className="h-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-background hover:bg-secondary text-sm font-medium text-primary px-3 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Device
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Rack Components</p>
              <div className="space-y-2">
                {inputs.components.map((c) => (
                  <div key={c.id} className="grid grid-cols-[1fr_80px_40px] gap-2 items-center">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateComponent(c.id, "name", e.target.value)}
                      placeholder="Device Name"
                      className="h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={c.units}
                        onChange={(e) => updateComponent(c.id, "units", e.target.value)}
                        className="w-full h-10 text-base rounded-md border border-input bg-background px-3 pr-7 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">U</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeComponent(c.id)}
                      aria-label={`Remove ${c.name}`}
                      className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {invalid && <p className="text-xs text-red-500 mt-2">Rack capacity must be positive; all device heights must be non-negative numbers.</p>}
            {!invalid && result.overCapacity && (
              <p className="text-xs text-red-500 mt-2 font-medium">Over capacity by {Math.abs(result.remainingU)} U — remove devices or use a larger rack.</p>
            )}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Used Rack Space</p>
            <p className="text-4xl font-bold text-primary mt-1">
              {result.usedU.toLocaleString()} <span className="text-xl font-semibold">U</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              of {result.totalU.toLocaleString()} U rack · {result.fillPct.toFixed(1)}% full
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Remaining</p>
              <p className={`text-lg font-bold mt-1 ${result.overCapacity ? "text-red-600" : "text-emerald-600"}`}>
                {result.remainingU.toLocaleString()} U
              </p>
              <p className="text-xs text-muted-foreground">{result.overCapacity ? "over capacity" : "free space"}</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Physical Height</p>
              <p className="text-lg font-bold text-primary mt-1">{result.heightInches.toFixed(2)} in</p>
              <p className="text-xs text-muted-foreground">{result.heightMm.toFixed(0)} mm</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fill Rate</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{result.fillPct.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">of rack capacity</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Device Breakdown</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Device</th>
                  <th className="text-right py-2 px-3 font-medium">Height</th>
                  <th className="text-right py-2 px-3 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {inputs.components.map((c, i) => {
                  const u = parseFloat(c.units) || 0
                  return (
                    <tr key={c.id} className={`border-b border-border ${i === 0 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                      <td className="py-2.5 px-3">{c.name || "Unnamed device"}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{u.toLocaleString()} U</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {result.usedU > 0 ? ((u / result.usedU) * 100).toFixed(1) + "%" : "—"}
                      </td>
                    </tr>
                  )
                })}
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2.5 px-3">Total Used</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{result.usedU.toLocaleString()} U</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Rack Utilization by Device (U)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 16, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v} U`, "Height"]} />
                <Bar dataKey="units" radius={[0, 4, 4, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.isFirst ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Free space shown if the rack has remaining capacity.</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Rack Capacity</p>
                <p className="font-semibold text-foreground">{result.totalU.toLocaleString()} U</p>
              </div>
              <div>
                <p className="text-muted-foreground">Used Space</p>
                <p className="font-semibold text-foreground">{result.usedU.toLocaleString()} U ({result.fillPct.toFixed(1)}%)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining Space</p>
                <p className="font-semibold text-foreground">{result.remainingU.toLocaleString()} U</p>
              </div>
              <div>
                <p className="text-muted-foreground">Occupied Height</p>
                <p className="font-semibold text-foreground">{result.heightInches.toFixed(2)} in ({result.heightMm.toFixed(0)} mm)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Devices</p>
                <p className="font-semibold text-foreground">{inputs.components.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rack Standard</p>
                <p className="font-semibold text-foreground">19″ wide · 1U = 1.75 in</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/server-rack-units-calculator" />
      </div>
    </div>
  )
}
