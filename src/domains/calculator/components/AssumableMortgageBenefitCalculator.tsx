"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  assumedBalance: string
  assumedRate: string
  assumedYears: string
  newAmount: string
  newRate: string
  newYears: string
}

interface Result {
  assumedPayment: number
  newPayment: number
  monthlySavings: number
  assumedInterest: number
  newInterest: number
  interestSaved: number
}

function pmt(rate: number, n: number, pv: number): number {
  if (rate === 0) return pv / n
  const f = Math.pow(1 + rate, n)
  return (pv * rate * f) / (f - 1)
}

const DEFAULTS: Inputs = { assumedBalance: "200000", assumedRate: "3.25", assumedYears: "25", newAmount: "200000", newRate: "6.5", newYears: "30" }

function calculate(inputs: Inputs): Result {
  const assumedBalance = Math.max(0, parseFloat(inputs.assumedBalance) || 0)
  const assumedRate = Math.max(0, parseFloat(inputs.assumedRate) || 0)
  const assumedYears = Math.max(1, parseFloat(inputs.assumedYears) || 25)
  const newAmount = Math.max(0, parseFloat(inputs.newAmount) || 0)
  const newRate = Math.max(0, parseFloat(inputs.newRate) || 0)
  const newYears = Math.max(1, parseFloat(inputs.newYears) || 30)

  const assumedPayment = pmt(assumedRate / 100 / 12, Math.round(assumedYears * 12), assumedBalance)
  const newPayment = pmt(newRate / 100 / 12, Math.round(newYears * 12), newAmount)
  const monthlySavings = Math.max(0, newPayment - assumedPayment)
  const assumedInterest = assumedPayment * Math.round(assumedYears * 12) - assumedBalance
  const newInterest = newPayment * Math.round(newYears * 12) - newAmount
  const interestSaved = Math.max(0, newInterest - assumedInterest)
  return { assumedPayment, newPayment, monthlySavings, assumedInterest, newInterest, interestSaved }
}

export default function AssumableMortgageBenefitCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const ab = parseFloat(inputs.assumedBalance)
    const ar = parseFloat(inputs.assumedRate)
    const ay = parseFloat(inputs.assumedYears)
    const na = parseFloat(inputs.newAmount)
    const nr = parseFloat(inputs.newRate)
    const ny = parseFloat(inputs.newYears)
    return [ab, na].some((v) => isNaN(v) || v < 0) || [ar, nr].some((v) => isNaN(v) || v < 0) || [ay, ny].some((v) => isNaN(v) || v <= 0)
  }, [inputs])

  const chartData = useMemo(
    () => [
      { name: "Assumed Loan", value: result.assumedInterest, fill: "hsl(var(--primary))" },
      { name: "New Loan", value: result.newInterest, fill: "hsl(15 85% 55%)" },
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
    <div className="racira-page-container py-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Finance</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Assumable Mortgage Benefit Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Assumable Mortgage Benefit Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="card-calculator bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Assumed Loan (Seller&apos;s Mortgage)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Assumed Balance ($)</label>
                <input
                  type="number"
                  value={inputs.assumedBalance}
                  onChange={(e) => setInputs({ ...inputs, assumedBalance: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="200000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assumed Rate (%)</label>
                <input
                  type="number"
                  value={inputs.assumedRate}
                  onChange={(e) => setInputs({ ...inputs, assumedRate: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="3.25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years Remaining</label>
                <input
                  type="number"
                  value={inputs.assumedYears}
                  onChange={(e) => setInputs({ ...inputs, assumedYears: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="25"
                />
              </div>
            </div>
            <h2 className="text-sm font-semibold text-foreground mt-4 mb-3">New Market Loan (Alternative)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">New Loan Amount ($)</label>
                <input
                  type="number"
                  value={inputs.newAmount}
                  onChange={(e) => setInputs({ ...inputs, newAmount: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="200000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Rate (%)</label>
                <input
                  type="number"
                  value={inputs.newRate}
                  onChange={(e) => setInputs({ ...inputs, newRate: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="6.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Loan Term (years)</label>
                <input
                  type="number"
                  value={inputs.newYears}
                  onChange={(e) => setInputs({ ...inputs, newYears: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="30"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter non-negative amounts and rates with positive terms.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly Savings by Assuming</p>
            <p className="text-4xl font-bold text-primary mt-1">{money(result.monthlySavings)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {money(result.assumedPayment)} assumed vs {money(result.newPayment)} new loan
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Assumed Payment</p>
              <p className="text-lg font-bold mt-1 text-emerald-600">{money(result.assumedPayment)}</p>
              <p className="text-xs text-muted-foreground">{parseFloat(inputs.assumedRate) || 0}% over {parseFloat(inputs.assumedYears) || 0} yrs</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">New Loan Payment</p>
              <p className="text-lg font-bold mt-1 text-red-600">{money(result.newPayment)}</p>
              <p className="text-xs text-muted-foreground">{parseFloat(inputs.newRate) || 0}% over {parseFloat(inputs.newYears) || 0} yrs</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Interest Saved</p>
              <p className="text-lg font-bold mt-1 text-primary">{money0(result.interestSaved)}</p>
              <p className="text-xs text-muted-foreground">over the life of each loan</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Loan Comparison</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Loan Amount", parseFloat(inputs.assumedBalance) || 0, "assumed balance"],
                  ["Interest Rate", parseFloat(inputs.assumedRate) || 0, "assumed loan rate"],
                  ["Monthly Payment", result.assumedPayment, "assumed loan"],
                  ["Total Interest (Assumed)", result.assumedInterest, "assumed loan, full term"],
                  ["Total Interest (New)", result.newInterest, "new loan, full term"],
                  ["Interest Saved", result.interestSaved, "new loan interest − assumed"],
                ].map((row, i) => (
                  <tr key={row[0] as string} className={`border-b border-border ${i === 5 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0] as string}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {i === 1 ? `${row[1] as number}%` : money(row[1] as number)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{row[2] as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Total Interest Paid ($)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                <Tooltip formatter={(v: number) => [money0(v), "Total interest"]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.monthlySavings > 0
                ? `Assuming the seller's loan saves ${money(result.monthlySavings)} per month and roughly ${money0(result.interestSaved)} in total interest.`
                : "The new loan is cheaper — check whether the assumed rate really beats today's market."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Assumed Rate</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.assumedRate) || 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">New Loan Rate</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.newRate) || 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assumed Payment</p>
                <p className="font-semibold text-foreground">{money(result.assumedPayment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">New Loan Payment</p>
                <p className="font-semibold text-foreground">{money(result.newPayment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Savings</p>
                <p className="font-semibold text-foreground">{money(result.monthlySavings)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Interest Saved</p>
                <p className="font-semibold text-foreground">{money0(result.interestSaved)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/assumable-mortgage-benefit-calculator" />
      </div>
    </div>
  )
}
