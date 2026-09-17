"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  nominal: string
  compounding: string
  amount: string
  termYears: string
}

interface Result {
  apy: number
  periodsPerYear: number
  effectiveMonthly: number
  nominal: number
  totalInterest: number
  annualGrowth: { year: number; nominal: number; apy: number }[]
}

const FREQS: Record<string, { label: string; n: number }> = {
  monthly: { label: "Monthly (12)", n: 12 },
  quarterly: { label: "Quarterly (4)", n: 4 },
  semiannual: { label: "Semi-annually (2)", n: 2 },
  daily: { label: "Daily (365)", n: 365 },
  continuous: { label: "Continuous", n: 0 },
}

const DEFAULTS: Inputs = { nominal: "6.5", compounding: "monthly", amount: "20000", termYears: "5" }

function calculate(inputs: Inputs): Result {
  const nominal = Math.max(0, parseFloat(inputs.nominal) || 0)
  const amount = Math.max(0, parseFloat(inputs.amount) || 0)
  const termYears = Math.max(0, parseFloat(inputs.termYears) || 0)
  const freq = FREQS[inputs.compounding] || FREQS.monthly
  const r = nominal / 100
  const apy = freq.n === 0 ? (Math.exp(r) - 1) * 100 : (Math.pow(1 + r / freq.n, freq.n) - 1) * 100
  const effectiveMonthly = freq.n === 0 ? (Math.exp(r / 12) - 1) * 100 : (Math.pow(1 + r / freq.n, freq.n / 12) - 1) * 100
  const totalInterest = amount * (Math.pow(1 + apy / 100, termYears) - 1)
  const annualGrowth = Array.from({ length: Math.max(1, Math.ceil(termYears)) + 1 }, (_, i) => ({
    year: i,
    nominal: amount * Math.pow(1 + r, i),
    apy: amount * Math.pow(1 + apy / 100, i),
  }))
  return { apy, periodsPerYear: freq.n, effectiveMonthly, nominal, totalInterest, annualGrowth }
}

export default function AnnualPercentageYieldLoanCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const n = parseFloat(inputs.nominal)
    const a = parseFloat(inputs.amount)
    const t = parseFloat(inputs.termYears)
    return isNaN(n) || n < 0 || isNaN(a) || a < 0 || isNaN(t) || t < 0
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Nominal Rate", value: result.nominal, fill: "hsl(var(--primary) / 0.45)" },
      { name: "APY (Effective)", value: result.apy, fill: "hsl(var(--primary))" },
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

  const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const money0 = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Finance</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Annual Percentage Yield (APY) Loan Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Annual Percentage Yield (APY) Loan Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="card-calculator bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nominal Interest Rate (%)</label>
                <input
                  type="number"
                  value={inputs.nominal}
                  onChange={(e) => setInputs({ ...inputs, nominal: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="6.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compounding Frequency</label>
                <select
                  value={inputs.compounding}
                  onChange={(e) => setInputs({ ...inputs, compounding: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(FREQS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loan Amount ($)</label>
                <input
                  type="number"
                  value={inputs.amount}
                  onChange={(e) => setInputs({ ...inputs, amount: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="20000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Term (years)</label>
                <input
                  type="number"
                  value={inputs.termYears}
                  onChange={(e) => setInputs({ ...inputs, termYears: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="5"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative values for the rate, amount, and term.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Annual Percentage Yield (APY)</p>
            <p className="text-4xl font-bold text-primary mt-1">{result.apy.toFixed(3)}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              effective rate on {result.nominal.toFixed(2)}% nominal with {FREQS[inputs.compounding]?.label.toLowerCase() || "monthly"} compounding
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Nominal Rate</p>
              <p className="text-lg font-bold mt-1">{result.nominal.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground">quoted annual rate</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Effective Monthly</p>
              <p className="text-lg font-bold mt-1 text-primary">{result.effectiveMonthly.toFixed(4)}%</p>
              <p className="text-xs text-muted-foreground">per-month rate</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Interest over Term</p>
              <p className="text-lg font-bold mt-1">{money0(result.totalInterest)}</p>
              <p className="text-xs text-muted-foreground">at APY on {money0(parseFloat(inputs.amount) || 0)}</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Rate Comparison</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Nominal (quoted) Rate", result.nominal, "% per year"],
                  ["Compounding Periods", result.periodsPerYear === 0 ? "Continuous" : `${result.periodsPerYear}× per year`, "how often interest accrues"],
                  ["Effective Monthly Rate", result.effectiveMonthly, "% per month"],
                  ["Annual Percentage Yield", result.apy, "% effective per year"],
                  ["APY − Nominal", result.apy - result.nominal, "percentage points gained"],
                ].map((row, i) => (
                  <tr key={row[0] as string} className={`border-b border-border ${i === 4 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0] as string}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{typeof row[1] === "number" ? row[1].toFixed(3) : row[1]}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{row[2] as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Nominal vs Effective Annual Rate (%)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(3)}%`, ""]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.apy > result.nominal
                ? `Compounding lifts the true annual cost to ${result.apy.toFixed(3)}%, which is ${(result.apy - result.nominal).toFixed(3)} percentage points above the quoted rate.`
                : "With no compounding the APY equals the nominal rate."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Nominal Rate</p>
                <p className="font-semibold text-foreground">{result.nominal.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">APY (Effective)</p>
                <p className="font-semibold text-foreground">{result.apy.toFixed(3)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Compounding</p>
                <p className="font-semibold text-foreground">{FREQS[inputs.compounding]?.label || "Monthly"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Effective Monthly Rate</p>
                <p className="font-semibold text-foreground">{result.effectiveMonthly.toFixed(4)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Loan Amount</p>
                <p className="font-semibold text-foreground">{money0(parseFloat(inputs.amount) || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Interest over {parseFloat(inputs.termYears) || 0} yrs</p>
                <p className="font-semibold text-foreground">{money0(result.totalInterest)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/annual-percentage-yield-loan-calculator" />
      </div>
    </div>
  )
}
