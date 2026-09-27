"use client"

import { useState, useEffect, useMemo } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  subs: string
  tier: string
  bits: string
  adRevenue: string
}

interface Result {
  subRevenue: number
  bitRevenue: number
  adRevenue: number
  totalMonthly: number
  totalYearly: number
}

const DEFAULTS: Inputs = { subs: "100", tier: "50", bits: "5000", adRevenue: "150" }

function calculate(inputs: Inputs): Result {
  const sCount = parseInt(inputs.subs) || 0
  const sSplit = (parseFloat(inputs.tier) || 50) / 100
  const bCount = parseInt(inputs.bits) || 0
  const ads = parseFloat(inputs.adRevenue) || 0

  const subRevenue = sCount * 4.99 * sSplit
  const bitRevenue = bCount * 0.01
  const totalMonthly = subRevenue + bitRevenue + ads

  return { subRevenue, bitRevenue, adRevenue: ads, totalMonthly, totalYearly: totalMonthly * 12 }
}

export default function TwitchEarningsCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const s = parseInt(inputs.subs)
    const b = parseInt(inputs.bits)
    const a = parseFloat(inputs.adRevenue)
    return [s, b, a].some((x) => isNaN(x) || x < 0)
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Subscriptions", value: result.subRevenue, fill: "hsl(var(--primary))" },
      { name: "Bits", value: result.bitRevenue, fill: "hsl(var(--primary) / 0.6)" },
      { name: "Ads", value: result.adRevenue, fill: "hsl(var(--primary) / 0.3)" },
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

  const subShare = result.totalMonthly > 0 ? (result.subRevenue / result.totalMonthly) * 100 : 0

  return (
    <div className="racira-page-container py-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Social Media</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Twitch Earnings Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Twitch Earnings Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Subscriptions</label>
                <input
                  type="number"
                  value={inputs.subs}
                  onChange={(e) => setInputs({ ...inputs, subs: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Revenue Split</label>
                <select
                  value={inputs.tier}
                  onChange={(e) => setInputs({ ...inputs, tier: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="50">50% (Affiliate)</option>
                  <option value="70">70% (Partner Plus)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Bits Cheered</label>
                <input
                  type="number"
                  value={inputs.bits}
                  onChange={(e) => setInputs({ ...inputs, bits: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Ad Revenue ($)</label>
                <input
                  type="number"
                  value={inputs.adRevenue}
                  onChange={(e) => setInputs({ ...inputs, adRevenue: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="150"
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Est. Monthly Earnings</p>
            <p className="text-4xl font-bold text-primary mt-1">${result.totalMonthly.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {parseFloat(inputs.tier) === 70 ? "70/30 Partner split" : "50/50 Affiliate split"} · ${result.totalYearly.toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Subs Share</p>
              <p className="text-lg font-bold text-foreground mt-1">${result.subRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{subShare.toFixed(0)}% of total</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Bits Income</p>
              <p className="text-lg font-bold text-primary mt-1">${result.bitRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">$0.01 per bit</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ad Revenue</p>
              <p className="text-lg font-bold text-amber-600 mt-1">${result.adRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">pre-rolls + mid-rolls</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Earnings Breakdown</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Stream</th>
                  <th className="text-right py-2 px-3 font-medium">Monthly</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-primary/10 font-semibold text-primary">
                  <td className="py-2.5 px-3">Subscriptions ({parseInt(inputs.subs) || 0} × $4.99 × {(parseFloat(inputs.tier) || 50) / 100})</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${result.subRevenue.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2.5 px-3">Bits ({parseInt(inputs.bits) || 0} × $0.01)</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${result.bitRevenue.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2.5 px-3">Ad Revenue</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${result.adRevenue.toFixed(2)}</td>
                </tr>
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2.5 px-3">Total</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${result.totalMonthly.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Revenue Allocation</h2>
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
              Subscriptions usually dominate — donations via bits and ads add on top.
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Subscribers</p>
                <p className="font-semibold text-foreground">{parseInt(inputs.subs) || 0} (Tier 1)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Per-Sub Payout</p>
                <p className="font-semibold text-foreground">${(4.99 * (parseFloat(inputs.tier) || 50) / 100).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Total</p>
                <p className="font-semibold text-foreground">${result.totalMonthly.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Yearly Estimate</p>
                <p className="font-semibold text-foreground">${result.totalYearly.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sub Share</p>
                <p className="font-semibold text-foreground">{subShare.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Excludes</p>
                <p className="font-semibold text-foreground">Donations, sponsorships, merch</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/twitch-earnings-calculator" />
      </div>
    </div>
  )
}
