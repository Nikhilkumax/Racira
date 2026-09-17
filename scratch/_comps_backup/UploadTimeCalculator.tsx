"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  fileSize: string
  fileUnit: string
  speed: string
  speedUnit: string
  overhead: string
}

interface Result {
  timeLabel: string
  totalSeconds: number
  effectiveSpeedBps: number
  sizeMB: number
  perSpeed: { name: string; seconds: number; isSel: boolean }[]
}

const DEFAULTS: Inputs = {
  fileSize: "500",
  fileUnit: "MB",
  speed: "10",
  speedUnit: "Mbps",
  overhead: "10",
}

const FILE_UNITS: { key: string; factor: number }[] = [
  { key: "KB", factor: 1024 },
  { key: "MB", factor: 1024 ** 2 },
  { key: "GB", factor: 1024 ** 3 },
  { key: "TB", factor: 1024 ** 4 },
]

const SPEED_UNITS: { key: string; factor: number }[] = [
  { key: "Kbps", factor: 1000 },
  { key: "Mbps", factor: 1000 ** 2 },
  { key: "Gbps", factor: 1000 ** 3 },
]

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${s}s`
}

function calculate(inputs: Inputs): Result {
  let sizeInBytes = (parseFloat(inputs.fileSize) || 0) * (FILE_UNITS.find((u) => u.key === inputs.fileUnit)?.factor ?? 1)
  let speedInBps = (parseFloat(inputs.speed) || 0) * (SPEED_UNITS.find((u) => u.key === inputs.speedUnit)?.factor ?? 1)

  if (sizeInBytes <= 0 || speedInBps <= 0) {
    return { timeLabel: "—", totalSeconds: 0, effectiveSpeedBps: 0, sizeMB: 0, perSpeed: [] }
  }

  const totalBits = sizeInBytes * 8
  const overheadFactor = 1 + (parseFloat(inputs.overhead) || 0) / 100
  const seconds = (totalBits * overheadFactor) / speedInBps

  const sizeMB = sizeInBytes / 1024 ** 2
  const commonSpeeds = [
    { name: "5 Mbps", bps: 5 * 1e6 },
    { name: "10 Mbps", bps: 10 * 1e6 },
    { name: "25 Mbps", bps: 25 * 1e6 },
    { name: "50 Mbps", bps: 50 * 1e6 },
    { name: "100 Mbps", bps: 100 * 1e6 },
    { name: "1 Gbps", bps: 1e9 },
  ]
  const perSpeed = commonSpeeds.map((s) => ({
    name: s.name,
    seconds: (totalBits * overheadFactor) / s.bps,
    isSel: Math.abs(s.bps - speedInBps) < 1,
  }))

  return {
    timeLabel: formatDuration(seconds),
    totalSeconds: seconds,
    effectiveSpeedBps: speedInBps / overheadFactor,
    sizeMB,
    perSpeed,
  }
}

export default function UploadTimeCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const fs = parseFloat(inputs.fileSize)
    const sp = parseFloat(inputs.speed)
    const oh = parseFloat(inputs.overhead)
    return [fs, sp, oh].some((x) => isNaN(x) || x < 0)
  }, [inputs])

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const speedMbps = (parseFloat(inputs.speed) || 0) * (SPEED_UNITS.find((u) => u.key === inputs.speedUnit)?.factor ?? 1) / 1e6

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Tools</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Upload Time Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Upload Time Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">File Size</label>
                <input
                  type="number"
                  min={0}
                  value={inputs.fileSize}
                  onChange={(e) => setInputs({ ...inputs, fileSize: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File Unit</label>
                <select
                  value={inputs.fileUnit}
                  onChange={(e) => setInputs({ ...inputs, fileUnit: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {FILE_UNITS.map((u) => (
                    <option key={u.key} value={u.key}>{u.key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upload Speed</label>
                <input
                  type="number"
                  min={0}
                  value={inputs.speed}
                  onChange={(e) => setInputs({ ...inputs, speed: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Speed Unit</label>
                <select
                  value={inputs.speedUnit}
                  onChange={(e) => setInputs({ ...inputs, speedUnit: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SPEED_UNITS.map((u) => (
                    <option key={u.key} value={u.key}>{u.key}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Network Overhead (%)</label>
                <input
                  type="number"
                  min={0}
                  value={inputs.overhead}
                  onChange={(e) => setInputs({ ...inputs, overhead: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="10"
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Upload Time</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.timeLabel}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.sizeMB.toFixed(2)} MB with {parseFloat(inputs.overhead) || 0}% overhead
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Seconds</p>
              <p className="text-lg font-bold text-foreground mt-1">{Math.round(result.totalSeconds).toLocaleString()} s</p>
              <p className="text-xs text-muted-foreground">incl. overhead</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Effective Rate</p>
              <p className="text-lg font-bold text-primary mt-1">{(result.effectiveSpeedBps / 1e6).toFixed(2)} Mbps</p>
              <p className="text-xs text-muted-foreground">after overhead</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Your Speed</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{speedMbps.toFixed(2)} Mbps</p>
              <p className="text-xs text-muted-foreground">{inputs.speedUnit}</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Transfer Estimate</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["File Size", `${result.sizeMB.toFixed(2)} MB`],
                  ["Raw Data Bits", `${(result.sizeMB * 8).toFixed(0)} Mbit`],
                  ["Overhead Added", `${parseFloat(inputs.overhead) || 0}% (${(result.sizeMB * 8 * (parseFloat(inputs.overhead) || 0) / 100).toFixed(0)} Mbit)`],
                  ["Total Bits to Send", `${(result.sizeMB * 8 * (1 + (parseFloat(inputs.overhead) || 0) / 100)).toFixed(0)} Mbit`],
                  ["Effective Transfer Rate", `${(result.effectiveSpeedBps / 1e6).toFixed(2)} Mbps`],
                  ["Estimated Time", result.timeLabel],
                ].map((row, i) => (
                  <tr key={row[0]} className={`border-b border-border ${i === 5 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0]}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Upload Time at Common Speeds (seconds)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.perSpeed} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [formatDuration(v), "Upload time"]}
                  labelFormatter={(l) => `${l} connection`}
                />
                <Bar dataKey="seconds" radius={[4, 4, 0, 0]}>
                  {result.perSpeed.map((d) => (
                    <Cell key={d.name} fill={d.isSel ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Highlighted bar = your connection speed.</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">File Size</p>
                <p className="font-semibold text-foreground">{result.sizeMB.toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Upload Speed</p>
                <p className="font-semibold text-foreground">{speedMbps.toFixed(2)} Mbps</p>
              </div>
              <div>
                <p className="text-muted-foreground">Overhead</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.overhead) || 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Time</p>
                <p className="font-semibold text-foreground">{result.timeLabel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bytes vs Bits</p>
                <p className="font-semibold text-foreground">1 MB = 8 Mbit</p>
              </div>
              <div>
                <p className="text-muted-foreground">Real-World Note</p>
                <p className="font-semibold text-foreground">Actual times vary with congestion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/upload-time-calculator" />
      </div>
    </div>
  )
}
