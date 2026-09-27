"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  views: string
  followers: string
  engagement: string
}

interface Result {
  fundLow: number
  fundHigh: number
  brandDealLow: number
  brandDealHigh: number
  monthlyPotential: number
  rpm: number
  followerTier: string
  eligible: boolean
}

const DEFAULTS: Inputs = { views: "100000", followers: "50000", engagement: "4.5" }

function calculate(inputs: Inputs): Result {
  const v = parseFloat(inputs.views) || 0
  const f = parseFloat(inputs.followers) || 0
  const e = parseFloat(inputs.engagement) || 0

  // TikTok Creator Rewards Program: ~$0.20–$0.80 per 1,000 qualified views
  const fundLow = (v / 1000) * 0.2
  const fundHigh = (v / 1000) * 0.8

  // Brand deals: $15 per 1,000 followers, scaled by engagement (3% = average)
  const baseRate = (f / 1000) * 15
  const engagementMultiplier = e / 3
  const brandDealLow = baseRate * Math.max(0.5, engagementMultiplier * 0.8)
  const brandDealHigh = baseRate * Math.max(1.2, engagementMultiplier * 1.5)

  const monthlyPotential = fundLow * 30 + brandDealLow * 2

  return {
    fundLow,
    fundHigh,
    brandDealLow,
    brandDealHigh,
    monthlyPotential,
    rpm: v > 0 ? (fundLow / v) * 1000 : 0,
    followerTier: f >= 100000 ? "Macro-Influencer" : f >= 10000 ? "Micro-Influencer" : "Nano-Influencer",
    eligible: f >= 10000 && v >= 100000,
  }
}

export default function TiktokEarningsCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const v = parseFloat(inputs.views)
    const f = parseFloat(inputs.followers)
    const e = parseFloat(inputs.engagement)
    return [v, f, e].some((x) => isNaN(x) || x < 0)
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Rewards Program", low: result.fundLow * 30, high: result.fundHigh * 30 },
      { name: "Brand Deals", low: result.brandDealLow * 2, high: result.brandDealHigh * 2 },
      { name: "Total Potential", low: result.monthlyPotential, high: result.monthlyPotential + result.fundHigh * 30 * 0.3 },
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

  return (
    <div className="racira-page-container py-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Social Media</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">TikTok Earnings Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        TikTok Earnings Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Avg. Views per Video</label>
                <input
                  type="number"
                  value={inputs.views}
                  onChange={(e) => setInputs({ ...inputs, views: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Followers</label>
                <input
                  type="number"
                  value={inputs.followers}
                  onChange={(e) => setInputs({ ...inputs, followers: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="50000"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Engagement Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.engagement}
                  onChange={(e) => setInputs({ ...inputs, engagement: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="4.5"
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Est. Monthly Potential</p>
            <p className="text-4xl font-bold text-primary mt-1">
              ${result.monthlyPotential.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              <span className="text-xl font-semibold">+</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Daily uploads + 2 brand deals/month · {result.followerTier}
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Rewards / Video</p>
              <p className="text-lg font-bold text-foreground mt-1">
                ${result.fundLow.toFixed(2)}–${result.fundHigh.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">${result.rpm.toFixed(2)} RPM</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Brand Deal / Post</p>
              <p className="text-lg font-bold text-primary mt-1">
                ${result.brandDealLow.toLocaleString("en-US", { maximumFractionDigits: 0 })}–${result.brandDealHigh.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">engagement-scaled</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Monetization</p>
              <p className={`text-lg font-bold mt-1 ${result.eligible ? "text-emerald-600" : "text-amber-600"}`}>
                {result.eligible ? "Qualified" : "Not yet"}
              </p>
              <p className="text-xs text-muted-foreground">10k followers + 100k views</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Revenue Breakdown (Monthly)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Stream</th>
                  <th className="text-right py-2 px-3 font-medium">Low</th>
                  <th className="text-right py-2 px-3 font-medium">High</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Rewards Program (30 videos)", result.fundLow * 30, result.fundHigh * 30],
                  ["Brand Deals (2 posts)", result.brandDealLow * 2, result.brandDealHigh * 2],
                ].map((row, i) => (
                  <tr key={row[0] as string} className={`border-b border-border ${i === 0 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0] as string}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">${(row[1] as number).toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">${(row[2] as number).toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2.5 px-3">Total Potential</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${result.monthlyPotential.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">${(result.monthlyPotential + (result.fundHigh - result.fundLow) * 30 + (result.brandDealHigh - result.brandDealLow) * 2).toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Monthly Revenue Streams ($)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                <Tooltip formatter={(v: number, name: string) => [`$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, name === "low" ? "Conservative" : "Optimistic"]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="low" name="Conservative" radius={[4, 4, 0, 0]} fill="hsl(var(--primary) / 0.45)" />
                <Bar dataKey="high" name="Optimistic" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Estimates assume 1-min+ videos in the Creator Rewards Program and typical brand deal pricing.
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Views per Video</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.views)?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Followers</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.followers)?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Engagement Rate</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.engagement) || 0}% {parseFloat(inputs.engagement) > 4 ? "(above avg)" : "(avg ~3%)"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">RPM (Rewards)</p>
                <p className="font-semibold text-foreground">${result.rpm.toFixed(2)} per 1k views</p>
              </div>
              <div>
                <p className="text-muted-foreground">Follower Tier</p>
                <p className="font-semibold text-foreground">{result.followerTier}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rewards Eligibility</p>
                <p className="font-semibold text-foreground">{result.eligible ? "Qualified" : "10k followers + 100k views/30d required"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/tiktok-earnings-calculator" />
      </div>
    </div>
  )
}
