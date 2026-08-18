"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

const zones = [
  { key: "UTC-12", label: "UTC−12 (Baker Island)", offset: -12 },
  { key: "UTC-11", label: "UTC−11 (Samoa)", offset: -11 },
  { key: "UTC-10", label: "UTC−10 (Hawaii)", offset: -10 },
  { key: "UTC-9", label: "UTC−9 (Alaska)", offset: -9 },
  { key: "UTC-8", label: "UTC−8 (PST)", offset: -8 },
  { key: "UTC-7", label: "UTC−7 (MST)", offset: -7 },
  { key: "UTC-6", label: "UTC−6 (CST)", offset: -6 },
  { key: "UTC-5", label: "UTC−5 (EST)", offset: -5 },
  { key: "UTC-4", label: "UTC−4 (AST)", offset: -4 },
  { key: "UTC-3", label: "UTC−3 (Brazil)", offset: -3 },
  { key: "UTC-2", label: "UTC−2", offset: -2 },
  { key: "UTC-1", label: "UTC−1 (Azores)", offset: -1 },
  { key: "UTC+0", label: "UTC+0 (GMT/London)", offset: 0 },
  { key: "UTC+1", label: "UTC+1 (CET/Paris)", offset: 1 },
  { key: "UTC+2", label: "UTC+2 (EET/Cairo)", offset: 2 },
  { key: "UTC+3", label: "UTC+3 (Moscow)", offset: 3 },
  { key: "UTC+4", label: "UTC+4 (Dubai)", offset: 4 },
  { key: "UTC+5", label: "UTC+5 (Pakistan)", offset: 5 },
  { key: "UTC+5.5", label: "UTC+5:30 (IST/India)", offset: 5.5 },
  { key: "UTC+6", label: "UTC+6 (Bangladesh)", offset: 6 },
  { key: "UTC+7", label: "UTC+7 (Bangkok)", offset: 7 },
  { key: "UTC+8", label: "UTC+8 (Singapore/China)", offset: 8 },
  { key: "UTC+9", label: "UTC+9 (JST/Tokyo)", offset: 9 },
  { key: "UTC+10", label: "UTC+10 (AEST/Sydney)", offset: 10 },
  { key: "UTC+11", label: "UTC+11 (Magadan)", offset: 11 },
  { key: "UTC+12", label: "UTC+12 (Auckland)", offset: 12 },
]

interface Inputs {
  hour: string
  minute: string
  fromZone: string
  toZone: string
}

interface Result {
  sourceTime12: string
  convertedTime12: string
  convertedTime24: string
  diff: number
  targetZoneLabel: string
  worldClock: { name: string; hour: number; minute: number; time12: string; isFrom: boolean; isTo: boolean }[]
}

const DEFAULTS: Inputs = { hour: "12", minute: "0", fromZone: "UTC-5", toZone: "UTC+5.5" }

function formatTime(hours: number, minutes: number): string {
  let h = hours % 24
  if (h < 0) h += 24
  const dayShift = hours < 0 ? " (prev day)" : hours >= 24 ? " (next day)" : ""
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${minutes.toString().padStart(2, "0")} ${period}${dayShift}`
}

function calculate(inputs: Inputs): Result {
  const h = parseInt(inputs.hour) || 0
  const m = parseInt(inputs.minute) || 0
  const fromOffset = zones.find((z) => z.key === inputs.fromZone)?.offset ?? 0
  const toOffset = zones.find((z) => z.key === inputs.toZone)?.offset ?? 0
  const diff = toOffset - fromOffset
  const totalMinutes = h * 60 + m + diff * 60
  const resultH = Math.floor(totalMinutes / 60)
  const resultM = Math.round(totalMinutes % 60)

  const worldClock = zones.map((z) => {
    const zm = h * 60 + m + (z.offset - fromOffset) * 60
    const zh = Math.floor(zm / 60)
    const zmin = Math.round(zm % 60)
    let hh = zh % 24
    if (hh < 0) hh += 24
    const period = hh >= 12 ? "PM" : "AM"
    const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
    return {
      name: z.key,
      hour: hh,
      minute: zmin,
      time12: `${h12}:${zmin.toString().padStart(2, "0")} ${period}`,
      isFrom: z.key === inputs.fromZone,
      isTo: z.key === inputs.toZone,
    }
  })

  return {
    sourceTime12: formatTime(h, m),
    convertedTime12: formatTime(resultH, resultM),
    convertedTime24: `${(resultH % 24 + 24) % 24 < 10 ? "0" : ""}${(resultH % 24 + 24) % 24}:${resultM.toString().padStart(2, "0")}`,
    diff,
    targetZoneLabel: zones.find((z) => z.key === inputs.toZone)?.label ?? inputs.toZone,
    worldClock,
  }
}

export default function TimeZoneConverter() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(() => {
    const h = parseInt(inputs.hour)
    const m = parseInt(inputs.minute)
    return isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59
  }, [inputs])

  const chartData = useMemo(
    () =>
      result.worldClock.map((z) => ({
        name: z.name,
        hour: z.hour,
        time: z.time12,
        isFrom: z.isFrom,
        isTo: z.isTo,
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

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Tools</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Time Zone Converter</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Time Zone Converter
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Hour (0–23)</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={inputs.hour}
                  onChange={(e) => setInputs({ ...inputs, hour: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minute</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={inputs.minute}
                  onChange={(e) => setInputs({ ...inputs, minute: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">From Time Zone</label>
                <select
                  value={inputs.fromZone}
                  onChange={(e) => setInputs({ ...inputs, fromZone: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {zones.map((z) => (
                    <option key={z.key} value={z.key}>{z.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">To Time Zone</label>
                <select
                  value={inputs.toZone}
                  onChange={(e) => setInputs({ ...inputs, toZone: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {zones.map((z) => (
                    <option key={z.key} value={z.key}>{z.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Hour must be 0–23 and minute 0–59.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Converted Time</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.convertedTime12}</p>
            <p className="text-sm text-muted-foreground mt-1">{result.convertedTime24} · {result.targetZoneLabel}</p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Source Time</p>
              <p className="text-lg font-bold text-foreground mt-1">{result.sourceTime12}</p>
              <p className="text-xs text-muted-foreground">{inputs.fromZone}</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Time Difference</p>
              <p className={`text-lg font-bold mt-1 ${result.diff >= 0 ? "text-primary" : "text-amber-600"}`}>
                {result.diff >= 0 ? "+" : ""}{result.diff} h
              </p>
              <p className="text-xs text-muted-foreground">target − source</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Zones Covered</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{zones.length}</p>
              <p className="text-xs text-muted-foreground">UTC−12 to UTC+12</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Key Region Times</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Zone</th>
                  <th className="text-right py-2 px-3 font-medium">Local Time</th>
                </tr>
              </thead>
              <tbody>
                {result.worldClock
                  .filter((z) => ["UTC-8", "UTC-5", "UTC+0", "UTC+1", "UTC+5.5", "UTC+8", "UTC+9", "UTC+10"].includes(z.name))
                  .map((z) => (
                    <tr
                      key={z.name}
                      className={`border-b border-border ${
                        z.isFrom ? "bg-primary/10 font-semibold text-primary" : z.isTo ? "bg-primary/5 font-semibold" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3">{z.name}{z.isFrom ? " · from" : z.isTo ? " · to" : ""}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{z.time12}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">World Clock (hour of day)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 24]} tick={{ fontSize: 10 }} ticks={[0, 6, 12, 18, 24]} />
                <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: number, name: string) => [v, "Hour"]}
                  labelFormatter={(l) => {
                    const z = result.worldClock.find((w) => w.name === l)
                    return z ? `${l} · ${z.time12}` : String(l)
                  }}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="hour" radius={[0, 4, 4, 0]}>
                  {chartData.map((d) => (
                    <Cell
                      key={d.name}
                      fill={d.isFrom ? "hsl(var(--primary))" : d.isTo ? "hsl(var(--primary) / 0.6)" : "hsl(var(--primary) / 0.3)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Bar length = local hour of day for each zone (0–24).</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Source</p>
                <p className="font-semibold text-foreground">{result.sourceTime12} {inputs.fromZone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Target</p>
                <p className="font-semibold text-foreground">{result.convertedTime12} {inputs.toZone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Offset Difference</p>
                <p className="font-semibold text-foreground">{result.diff >= 0 ? "+" : ""}{result.diff} hours</p>
              </div>
              <div>
                <p className="text-muted-foreground">24h Format</p>
                <p className="font-semibold text-foreground font-mono">{result.convertedTime24}</p>
              </div>
              <div>
                <p className="text-muted-foreground">DST Handling</p>
                <p className="font-semibold text-foreground">Fixed offsets — adjust for DST manually</p>
              </div>
              <div>
                <p className="text-muted-foreground">Zones</p>
                <p className="font-semibold text-foreground">{zones.length} offsets, UTC−12 → UTC+12</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/time-zone-converter" />
      </div>
    </div>
  )
}
