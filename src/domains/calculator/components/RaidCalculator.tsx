"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  driveCount: string
  driveSize: string
  raidLevel: string
}

interface RaidLevelInfo {
  id: string
  label: string
  minDrives: number
  usable: (n: number, s: number) => number
  faultTolerance: (n: number) => number
  description: string
}

const LEVELS: RaidLevelInfo[] = [
  {
    id: "0",
    label: "RAID 0 (Striping)",
    minDrives: 1,
    usable: (n, s) => n * s,
    faultTolerance: () => 0,
    description: "Maximum performance, zero redundancy. If one drive fails, all data is lost.",
  },
  {
    id: "1",
    label: "RAID 1 (Mirroring)",
    minDrives: 2,
    usable: (n, s) => (n >= 2 ? s : 0),
    faultTolerance: (n) => n - 1,
    description: "Full data duplication. High redundancy, but expensive storage-wise.",
  },
  {
    id: "5",
    label: "RAID 5 (Parity)",
    minDrives: 3,
    usable: (n, s) => (n >= 3 ? (n - 1) * s : 0),
    faultTolerance: () => 1,
    description: "Balanced performance and redundancy. Can survive one drive failure.",
  },
  {
    id: "6",
    label: "RAID 6 (Double Parity)",
    minDrives: 4,
    usable: (n, s) => (n >= 4 ? (n - 2) * s : 0),
    faultTolerance: () => 2,
    description: "High redundancy. Can survive two simultaneous drive failures.",
  },
  {
    id: "10",
    label: "RAID 10 (1+0)",
    minDrives: 4,
    usable: (n, s) => (n >= 4 && n % 2 === 0 ? (n / 2) * s : 0),
    faultTolerance: (n) => (n >= 4 && n % 2 === 0 ? n / 2 : 0),
    description: "Excellent performance and redundancy. Requires even number of drives.",
  },
]

interface Result {
  usableCapacity: number
  totalCapacity: number
  faultTolerance: number
  efficiency: number
  description: string
  perLevel: { id: string; label: string; usable: number; valid: boolean }[]
}

const DEFAULTS: Inputs = {
  driveCount: "4",
  driveSize: "4",
  raidLevel: "5",
}

function calculate(inputs: Inputs): Result {
  const n = parseInt(inputs.driveCount) || 0
  const s = parseFloat(inputs.driveSize) || 0
  const level = LEVELS.find((l) => l.id === inputs.raidLevel) ?? LEVELS[2]

  const usableCapacity = level.usable(n, s)
  const totalCapacity = n * s
  const faultTolerance = level.faultTolerance(n)
  const efficiency = totalCapacity > 0 ? (usableCapacity / totalCapacity) * 100 : 0

  const perLevel = LEVELS.map((l) => ({
    id: l.id,
    label: `RAID ${l.id}`,
    usable: l.usable(n, s),
    valid: n >= l.minDrives && (l.id !== "10" || n % 2 === 0),
  }))

  return {
    usableCapacity,
    totalCapacity,
    faultTolerance,
    efficiency,
    description: level.description,
    perLevel,
  }
}

export default function RaidCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const n = parseInt(inputs.driveCount)
    const s = parseFloat(inputs.driveSize)
    return isNaN(n) || n <= 0 || isNaN(s) || s <= 0
  }, [inputs])

  const selected = LEVELS.find((l) => l.id === inputs.raidLevel) ?? LEVELS[2]

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
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">RAID Capacity Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        RAID Capacity Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Number of Drives</label>
                <input
                  type="number"
                  min={1}
                  value={inputs.driveCount}
                  onChange={(e) => setInputs({ ...inputs, driveCount: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Drive Size (TB)</label>
                <input
                  type="number"
                  step="0.5"
                  value={inputs.driveSize}
                  onChange={(e) => setInputs({ ...inputs, driveSize: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="4"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">RAID Level</label>
                <select
                  value={inputs.raidLevel}
                  onChange={(e) => setInputs({ ...inputs, raidLevel: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter a positive drive count and drive size.</p>}
            {!invalid && parseInt(inputs.driveCount) < selected.minDrives && (
              <p className="text-xs text-amber-600 mt-2">
                {selected.label} requires at least {selected.minDrives} drives — usable capacity will be 0.
              </p>
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Usable Capacity</p>
            <p className="text-4xl font-bold text-primary mt-1">
              {result.usableCapacity.toLocaleString("en-US", { maximumFractionDigits: 1 })}{" "}
              <span className="text-xl font-semibold">TB</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {selected.label} · {result.efficiency.toFixed(0)}% storage efficiency
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Raw</p>
              <p className="text-lg font-bold text-foreground mt-1">{result.totalCapacity.toLocaleString()} TB</p>
              <p className="text-xs text-muted-foreground">{parseInt(inputs.driveCount) || 0} × {(parseFloat(inputs.driveSize) || 0).toLocaleString()} TB</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fault Tolerance</p>
              <p className="text-lg font-bold text-primary mt-1">{result.faultTolerance} drive{result.faultTolerance === 1 ? "" : "s"}</p>
              <p className="text-xs text-muted-foreground">simultaneous failure</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Redundancy Overhead</p>
              <p className="text-lg font-bold text-amber-600 mt-1">
                {(result.totalCapacity - result.usableCapacity).toLocaleString("en-US", { maximumFractionDigits: 1 })} TB
              </p>
              <p className="text-xs text-muted-foreground">lost to parity/mirroring</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Usable Capacity by RAID Level</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                    <th className="text-left py-2 px-3 font-medium">Level</th>
                    <th className="text-right py-2 px-3 font-medium">Usable</th>
                    <th className="text-right py-2 px-3 font-medium">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perLevel.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b border-border ${row.id === inputs.raidLevel ? "bg-primary/10 font-semibold text-primary" : ""}`}
                    >
                      <td className="py-2.5 px-3">
                        RAID {row.id}
                        {!row.valid && <span className="text-xs text-muted-foreground font-normal"> (needs more drives)</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {row.valid ? row.usable.toLocaleString("en-US", { maximumFractionDigits: 1 }) + " TB" : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {row.valid ? ((row.usable / result.totalCapacity) * 100).toFixed(0) + "%" : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Usable Capacity Comparison (TB)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.perLevel} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toLocaleString("en-US", { maximumFractionDigits: 1 })} TB`, "Usable"]}
                  labelFormatter={(l) => `${l}`}
                />
                <Bar dataKey="usable" radius={[4, 4, 0, 0]}>
                  {result.perLevel.map((d) => (
                    <Cell
                      key={d.id}
                      fill={
                        d.id === inputs.raidLevel
                          ? "hsl(var(--primary))"
                          : d.valid
                          ? "hsl(var(--primary) / 0.45)"
                          : "hsl(var(--muted-foreground) / 0.3)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Solid = selected level · dimmed = invalid for {parseInt(inputs.driveCount) || 0} drives.</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Configuration</p>
                <p className="font-semibold text-foreground">{parseInt(inputs.driveCount) || 0} × {(parseFloat(inputs.driveSize) || 0).toLocaleString()} TB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Raw Capacity</p>
                <p className="font-semibold text-foreground">{result.totalCapacity.toLocaleString()} TB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Usable Capacity</p>
                <p className="font-semibold text-foreground">{result.usableCapacity.toLocaleString("en-US", { maximumFractionDigits: 1 })} TB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fault Tolerance</p>
                <p className="font-semibold text-foreground">{result.faultTolerance} drive{result.faultTolerance === 1 ? "" : "s"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Storage Efficiency</p>
                <p className="font-semibold text-foreground">{result.efficiency.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Level Description</p>
                <p className="font-semibold text-foreground text-xs leading-snug">{result.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/raid-calculator" />
      </div>
    </div>
  )
}
