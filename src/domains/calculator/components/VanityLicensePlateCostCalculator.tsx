"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  plateLength: string
  costPerChar: string
  baseFee: string
  renewalFee: string
  years: string
}

interface Result {
  totalSetup: number
  totalFirstYear: number
  totalFiveYear: number
  perYearCost: { year: number; setup: number; renewal: number; cumulative: number }[]
}

const DEFAULTS: Inputs = {
  plateLength: "6",
  costPerChar: "50",
  baseFee: "50",
  renewalFee: "25",
  years: "5",
}

function calculate(inputs: Inputs): Result {
  const length = Math.max(0, parseInt(inputs.plateLength) || 0)
  const perChar = parseFloat(inputs.costPerChar) || 0
  const base = parseFloat(inputs.baseFee) || 0
  const renewal = parseFloat(inputs.renewalFee) || 0
  const years = Math.max(1, Math.min(10, parseInt(inputs.years) || 5))

  const charCost = length * perChar
  const totalSetup = base + charCost
  const totalFirstYear = totalSetup + renewal

  const perYearCost: { year: number; setup: number; renewal: number; cumulative: number }[] = []
  let cumulative = 0
  for (let y = 1; y <= years; y++) {
    cumulative += y === 1 ? totalFirstYear : renewal
    perYearCost.push({ year: y, setup: y === 1 ? totalSetup : 0, renewal: y === 1 ? renewal : renewal, cumulative })
  }

  return {
    totalSetup,
    totalFirstYear,
    totalFiveYear: cumulative,
    perYearCost,
  }
}

export default function VanityLicensePlateCostCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const len = parseInt(inputs.plateLength)
    const perChar = parseFloat(inputs.costPerChar)
    const base = parseFloat(inputs.baseFee)
    const renew = parseFloat(inputs.renewalFee)
    return [len, perChar, base, renew].some((x) => isNaN(x) || x < 0)
  }, [inputs])

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const length = Math.max(0, parseInt(inputs.plateLength) || 0)

  return (
    <div className="racira-page-container py-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Automotive</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Vanity License Plate Cost Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Vanity License Plate Cost Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Plate Length (characters)</label>
                <input
                  type="number"
                  min={1}
                  value={inputs.plateLength}
                  onChange={(e) => setInputs({ ...inputs, plateLength: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost per Character ($)</label>
                <input
                  type="number"
                  value={inputs.costPerChar}
                  onChange={(e) => setInputs({ ...inputs, costPerChar: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="50"
                />
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-primary font-medium inline-flex items-center gap-1"
              >
                Advanced Options {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showAdvanced && (
                <div className="mt-3 rounded-md border border-border p-3 bg-background">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Fees & Horizon</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Application Fee ($)</label>
                        <input
                          type="number"
                          value={inputs.baseFee}
                          onChange={(e) => setInputs({ ...inputs, baseFee: e.target.value })}
                          className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Annual Renewal ($)</label>
                        <input
                          type="number"
                          value={inputs.renewalFee}
                          onChange={(e) => setInputs({ ...inputs, renewalFee: e.target.value })}
                          className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="25"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Years to Estimate</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={inputs.years}
                          onChange={(e) => setInputs({ ...inputs, years: e.target.value })}
                          className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative numbers for all fee fields.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Cost — First Year</p>
            <p className="text-4xl font-bold text-primary mt-1">${result.totalFirstYear.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
            <p className="text-sm text-muted-foreground mt-1">
              ${result.totalSetup.toLocaleString("en-US", { maximumFractionDigits: 0 })} setup + ${parseFloat(inputs.renewalFee) || 0} renewal
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Character Cost</p>
              <p className="text-lg font-bold text-foreground mt-1">${(length * (parseFloat(inputs.costPerChar) || 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground">{length} chars × ${parseFloat(inputs.costPerChar) || 0}</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Setup Total</p>
              <p className="text-lg font-bold text-primary mt-1">${result.totalSetup.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground">one-time application</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Over {parseInt(inputs.years) || 5} Years</p>
              <p className="text-lg font-bold text-amber-600 mt-1">${result.totalFiveYear.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground">incl. renewals</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Cost Breakdown</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Application / Base Fee", `$${(parseFloat(inputs.baseFee) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Character Fee", `$${(length * (parseFloat(inputs.costPerChar) || 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })} (${length} × $${parseFloat(inputs.costPerChar) || 0})`],
                  ["One-Time Setup Total", `$${result.totalSetup.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Annual Renewal", `$${(parseFloat(inputs.renewalFee) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr`],
                  ["First-Year Total", `$${result.totalFirstYear.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  [`${parseInt(inputs.years) || 5}-Year Total`, `$${result.totalFiveYear.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
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
            <h2 className="text-sm font-semibold text-foreground mb-3">Cumulative Cost by Year</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.perYearCost} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={(y) => `Yr ${y}`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                <Tooltip
                  formatter={(v: number) => [`$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, "Cumulative cost"]}
                  labelFormatter={(y) => `Year ${y}`}
                />
                <Bar dataKey="cumulative" radius={[4, 4, 0, 0]}>
                  {result.perYearCost.map((d, i) => (
                    <Cell key={d.year} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.45)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Year 1 includes setup; later years add only the renewal fee.</p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Plate Length</p>
                <p className="font-semibold text-foreground">{length} characters</p>
              </div>
              <div>
                <p className="text-muted-foreground">Setup Cost</p>
                <p className="font-semibold text-foreground">${result.totalSetup.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">First Year</p>
                <p className="font-semibold text-foreground">${result.totalFirstYear.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Per-Year Renewal</p>
                <p className="font-semibold text-foreground">$${(parseFloat(inputs.renewalFee) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Horizon</p>
                <p className="font-semibold text-foreground">{parseInt(inputs.years) || 5} years</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cost / Year (avg)</p>
                <p className="font-semibold text-foreground">${(result.totalFiveYear / Math.max(1, parseInt(inputs.years) || 5)).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/vanity-license-plate-cost-calculator" />
      </div>
    </div>
  )
}
