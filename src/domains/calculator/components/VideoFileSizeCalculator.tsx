"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  duration: string
  bitrate: string
  audioBitrate: string
}

interface Result {
  videoMB: number
  audioMB: number
  totalMB: number
  totalGB: number
  totalRateMbps: number
  sizeLabel: string
}

const DEFAULTS: Inputs = { duration: "60", bitrate: "8", audioBitrate: "192" }

const DURATION_PRESETS = [
  { label: "1m", value: "1" },
  { label: "10m", value: "10" },
  { label: "1h", value: "60" },
  { label: "2h", value: "120" },
]

function calculate(inputs: Inputs): Result {
  const durSec = (parseFloat(inputs.duration) || 0) * 60
  const vBitrate = parseFloat(inputs.bitrate) || 0
  const aBitrate = parseFloat(inputs.audioBitrate) || 0

  const videoSizeBytes = (vBitrate * 1000000 * durSec) / 8
  const audioSizeBytes = (aBitrate * 1000 * durSec) / 8
  const totalSizeBytes = videoSizeBytes + audioSizeBytes
  const totalMB = totalSizeBytes / (1024 * 1024)

  return {
    videoMB: videoSizeBytes / (1024 * 1024),
    audioMB: audioSizeBytes / (1024 * 1024),
    totalMB,
    totalGB: totalMB / 1024,
    totalRateMbps: vBitrate + aBitrate / 1000,
    sizeLabel: totalMB / 1024 >= 1
      ? `${(totalMB / 1024).toFixed(2)} GB`
      : `${totalMB.toFixed(0)} MB`,
  }
}

export default function VideoFileSizeCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const d = parseFloat(inputs.duration)
    const v = parseFloat(inputs.bitrate)
    const a = parseFloat(inputs.audioBitrate)
    return [d, v, a].some((x) => isNaN(x) || x < 0)
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Video", mb: result.videoMB, fill: "hsl(var(--primary))" },
      { name: "Audio", mb: result.audioMB, fill: "hsl(var(--primary) / 0.45)" },
    ],
    [result]
  )

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const videoShare = result.totalMB > 0 ? (result.videoMB / result.totalMB) * 100 : 0

  return (
    <div className="racira-page-container py-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Technology</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Video File Size Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Video File Size Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min={0}
                  value={inputs.duration}
                  onChange={(e) => setInputs({ ...inputs, duration: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="60"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {DURATION_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setInputs({ ...inputs, duration: p.value })}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                        inputs.duration === p.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-primary/10"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video Bitrate (Mbps)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0.1}
                  value={inputs.bitrate}
                  onChange={(e) => setInputs({ ...inputs, bitrate: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="8"
                />
                <p className="text-xs text-muted-foreground mt-1.5">1080p ≈ 8 · 4K ≈ 40 Mbps</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Audio Bitrate (kbps)</label>
                <select
                  value={inputs.audioBitrate}
                  onChange={(e) => setInputs({ ...inputs, audioBitrate: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="64">64 kbps (Mono)</option>
                  <option value="128">128 kbps (Standard)</option>
                  <option value="192">192 kbps (High Quality)</option>
                  <option value="320">320 kbps (Extreme)</option>
                </select>
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated File Size</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.sizeLabel}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {parseFloat(inputs.duration) || 0} min at {result.totalRateMbps.toFixed(2)} Mbps total
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Video Data</p>
              <p className="text-lg font-bold text-foreground mt-1">{result.videoMB.toFixed(1)} MB</p>
              <p className="text-xs text-muted-foreground">{videoShare.toFixed(0)}% of total</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Audio Data</p>
              <p className="text-lg font-bold text-primary mt-1">{result.audioMB.toFixed(1)} MB</p>
              <p className="text-xs text-muted-foreground">{(100 - videoShare).toFixed(0)}% of total</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Data Rate</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{result.totalRateMbps.toFixed(2)} Mbps</p>
              <p className="text-xs text-muted-foreground">combined A+V</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Component Breakdown</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Stream</th>
                  <th className="text-right py-2 px-3 font-medium">Bitrate</th>
                  <th className="text-right py-2 px-3 font-medium">Size</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-primary/10 font-semibold text-primary">
                  <td className="py-2.5 px-3">Video</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{parseFloat(inputs.bitrate) || 0} Mbps</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{result.videoMB.toFixed(1)} MB</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2.5 px-3">Audio</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{parseFloat(inputs.audioBitrate) || 0} kbps</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{result.audioMB.toFixed(1)} MB</td>
                </tr>
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2.5 px-3">Total</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{result.totalRateMbps.toFixed(2)} Mbps</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{result.totalMB.toFixed(1)} MB</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Data Breakdown (MB)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)} MB`, "Data"]} />
                <Bar dataKey="mb" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {parseFloat(inputs.bitrate) || 0 >= 35
                ? "4K-class bitrate — expect large files; consider HEVC/AV1 to cut size ~50%."
                : parseFloat(inputs.bitrate) || 0 >= 10
                ? "High-quality 1080p60-class bitrate."
                : "Typical 1080p30 web-streaming bitrate."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.duration) || 0} min ({(parseFloat(inputs.duration) || 0) / 60}h)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Video Bitrate</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.bitrate) || 0} Mbps</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Size</p>
                <p className="font-semibold text-foreground">{result.totalMB.toFixed(1)} MB ({result.totalGB.toFixed(3)} GB)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Video Share</p>
                <p className="font-semibold text-foreground">{videoShare.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">1-Hour Equivalent</p>
                <p className="font-semibold text-foreground">{(result.totalMB / Math.max(1, parseFloat(inputs.duration) || 1) * 60).toFixed(0)} MB/hr</p>
              </div>
              <div>
                <p className="text-muted-foreground">Upload @10 Mbps</p>
                <p className="font-semibold text-foreground">≈ {(result.totalMB * 8 / 10 / 60).toFixed(0)} min</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/video-file-size-calculator" />
      </div>
    </div>
  )
}
