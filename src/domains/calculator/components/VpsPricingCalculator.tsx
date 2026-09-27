"use client"

import { useState, useEffect, useMemo } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  cpu: string
  ram: string
  storage: string
  bandwidth: string
  region: string
}

interface Result {
  monthlyTotal: number
  annualTotal: number
  hourlyTotal: number
  breakdown: { cpu: number; ram: number; storage: number; bandwidth: number }
}

const DEFAULTS: Inputs = {
  cpu: "2",
  ram: "4",
  storage: "80",
  bandwidth: "2",
  region: "us-east",
}

const REGIONS: { key: string; label: string; mult: number }[] = [
  { key: "us-east", label: "US East (N. Virginia)", mult: 1.0 },
  { key: "us-west", label: "US West (Oregon)", mult: 1.0 },
  { key: "eu-west", label: "Europe (London/Frankfurt)", mult: 1.05 },
  { key: "ap-south", label: "Asia Pacific (Mumbai)", mult: 1.2 },
  { key: "ap-east", label: "Asia Pacific (Tokyo)", mult: 1.3 },
]

const PRESETS = [
  { label: "Basic", cpu: "1", ram: "1", storage: "25", bandwidth: "1" },
  { label: "Standard", cpu: "2", ram: "4", storage: "80", bandwidth: "4" },
  { label: "Enterprise", cpu: "8", ram: "32", storage: "640", bandwidth: "10" },
]

function calculate(inputs: Inputs): Result {
  const CPU_PRICE = 5 // $/core/mo
  const RAM_PRICE = 4 // $/GB/mo
  const STORAGE_PRICE = 0.1 // $/GB/mo
  const BANDWIDTH_PRICE = 0.01 // $/GB above free tier

  const baseCost =
    (parseFloat(inputs.cpu) || 0) * CPU_PRICE +
    (parseFloat(inputs.ram) || 0) * RAM_PRICE +
    (parseFloat(inputs.storage) || 0) * STORAGE_PRICE

  const freeBandwidth = (parseFloat(inputs.ram) || 0) * 1000 // 1 TB per GB RAM
  const extraBandwidth = Math.max(0, (parseFloat(inputs.bandwidth) || 0) * 1000 - freeBandwidth)
  const bandwidthCost = extraBandwidth * BANDWIDTH_PRICE

  const regionMult = REGIONS.find((r) => r.key === inputs.region)?.mult ?? 1
  const monthlyTotal = (baseCost + bandwidthCost) * regionMult

  return {
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    hourlyTotal: monthlyTotal / 730,
    breakdown: {
      cpu: (parseFloat(inputs.cpu) || 0) * CPU_PRICE * regionMult,
      ram: (parseFloat(inputs.ram) || 0) * RAM_PRICE * regionMult,
      storage: (parseFloat(inputs.storage) || 0) * STORAGE_PRICE * regionMult,
      bandwidth: bandwidthCost * regionMult,
    },
  }
}

export default function VpsPricingCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const cpu = parseFloat(inputs.cpu)
    const ram = parseFloat(inputs.ram)
    const storage = parseFloat(inputs.storage)
    const bw = parseFloat(inputs.bandwidth)
    return [cpu, ram, storage, bw].some((x) => isNaN(x) || x < 0)
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Compute (vCPU)", value: result.breakdown.cpu, fill: "hsl(var(--primary))" },
      { name: "Memory (RAM)", value: result.breakdown.ram, fill: "hsl(var(--primary) / 0.75)" },
      { name: "Block Storage", value: result.breakdown.storage, fill: "hsl(var(--primary) / 0.5)" },
      { name: "Bandwidth", value: result.breakdown.bandwidth, fill: "hsl(var(--primary) / 0.3)" },
    ],
    [result]
  )

  function setPreset(p: { cpu: string; ram: string; storage: string; bandwidth: string }) {
    setInputs({ ...inputs, ...p })
  }

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
        <span className="text-foreground">VPS Pricing Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        VPS Pricing Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPreset(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    inputs.cpu === p.cpu && inputs.ram === p.ram
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary hover:bg-primary/10 border-border text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {(
              [
                { label: "CPU Cores", key: "cpu", min: 1, max: 64, step: 1 },
                { label: "RAM (GB)", key: "ram", min: 1, max: 512, step: 1 },
                { label: "Storage (GB)", key: "storage", min: 10, max: 2000, step: 10 },
              ] as const
            ).map((f) => (
              <div key={f.key} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">{f.label}</label>
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    value={inputs[f.key]}
                    onChange={(e) => setInputs({ ...inputs, [f.key]: e.target.value })}
                    className="w-20 h-9 text-center rounded-md border border-input bg-background font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <input
                  type="range"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={parseFloat(inputs[f.key]) || f.min}
                  onChange={(e) => setInputs({ ...inputs, [f.key]: e.target.value })}
                  className="w-full accent-primary"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Bandwidth (TB/mo)</label>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={inputs.bandwidth}
                  onChange={(e) => setInputs({ ...inputs, bandwidth: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cloud Region</label>
                <select
                  value={inputs.region}
                  onChange={(e) => setInputs({ ...inputs, region: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {REGIONS.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative numbers for all resources.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Monthly Cost</p>
            <p className="text-4xl font-bold text-primary mt-1">${result.monthlyTotal.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              ≈ ${result.hourlyTotal.toFixed(3)}/hr · unmanaged VPS market average
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Annual Total</p>
              <p className="text-lg font-bold text-foreground mt-1">${result.annualTotal.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">12 × monthly</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Hourly Rate</p>
              <p className="text-lg font-bold text-primary mt-1">${result.hourlyTotal.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">730 hrs/month</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Region Factor</p>
              <p className="text-lg font-bold text-amber-600 mt-1">
                {REGIONS.find((r) => r.key === inputs.region)?.mult ?? 1}×
              </p>
              <p className="text-xs text-muted-foreground">{REGIONS.find((r) => r.key === inputs.region)?.label.split(" (")[0]}</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Cost Breakdown</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Resource</th>
                  <th className="text-right py-2 px-3 font-medium">Amount</th>
                  <th className="text-right py-2 px-3 font-medium">Monthly</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-primary/10 font-semibold text-primary">
                  <td className="py-2.5 px-3">Compute (vCPU)</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{parseFloat(inputs.cpu) || 0} cores</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${result.breakdown.cpu.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2.5 px-3">Memory (RAM)</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{parseFloat(inputs.ram) || 0} GB</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${result.breakdown.ram.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2.5 px-3">Block Storage</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{parseFloat(inputs.storage) || 0} GB</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${result.breakdown.storage.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2.5 px-3">Egress Bandwidth</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{parseFloat(inputs.bandwidth) || 0} TB</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {result.breakdown.bandwidth > 0 ? `$${result.breakdown.bandwidth.toFixed(2)}` : "Included"}
                  </td>
                </tr>
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2.5 px-3">Total</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{inputs.region.split("-")[0].toUpperCase()}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${result.monthlyTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Cost Allocation</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Bandwidth shown as $0 if within the included free tier (1 TB per GB RAM).
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Configuration</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.cpu) || 0} vCPU · {parseFloat(inputs.ram) || 0} GB RAM</p>
              </div>
              <div>
                <p className="text-muted-foreground">Storage</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.storage) || 0} GB NVMe</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly</p>
                <p className="font-semibold text-foreground">${result.monthlyTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Annual</p>
                <p className="font-semibold text-foreground">${result.annualTotal.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Free Bandwidth Included</p>
                <p className="font-semibold text-foreground">{(parseFloat(inputs.ram) || 0).toFixed(0)} TB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pricing Basis</p>
                <p className="font-semibold text-foreground">Avg of DigitalOcean / Vultr / Linode</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/vps-pricing-calculator" />
      </div>
    </div>
  )
}
