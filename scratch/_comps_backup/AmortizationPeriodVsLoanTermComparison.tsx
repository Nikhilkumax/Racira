"use client"

import { useState, useEffect, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  amount: string
  rate: string
  amortYears: string
  termYears: string
}

interface Result {
  payment: number
  fullPayment: number
  balloon: number
  interestToTerm: number
  fullInterestToTerm: number
  chart: { year: number; balance: number; fullBalance: number }[]
}

function pmt(rate: number, n: number, pv: number): number {
  if (rate === 0) return pv / n
  const f = Math.pow(1 + rate, n)
  return (pv * rate * f) / (f - 1)
}

const DEFAULTS: Inputs = { amount: "250000", rate: "6.5", amortYears: "25", termYears: "10" }

function calculate(inputs: Inputs): Result {
  const amount = Math.max(0, parseFloat(inputs.amount) || 0)
  const rate = Math.max(0, parseFloat(inputs.rate) || 0)
  const amortYears = Math.max(1, parseFloat(inputs.amortYears) || 25)
  const termYears = Math.max(1, parseFloat(inputs.termYears) || 10)
  const r = rate / 100 / 12
  const amortMonths = Math.round(amortYears * 12)
  const termMonths = Math.round(termYears * 12)

  // Payment sized by the amortization period; balloon is what's left at term end
  const payment = pmt(r, amortMonths, amount)
  const f = Math.pow(1 + r, termMonths)
  const balloon = Math.max(0, amount * f - payment * ((f - 1) / r))
  // Fully-amortizing over the term for comparison
  const fullPayment = pmt(r, termMonths, amount)
  const fullF = Math.pow(1 + r, termMonths)
  const fullBalance = Math.max(0, amount * fullF - fullPayment * ((fullF - 1) / r))

  const interestToTerm = payment * termMonths - (amount - balloon)
  const fullInterestToTerm = fullPayment * termMonths - (amount - fullBalance)

  const chart = Array.from({ length: termYears + 1 }, (_, i) => {
    const months = Math.round(i * 12)
    const f2 = Math.pow(1 + r, months)
    const b = Math.max(0, amount * f2 - payment * ((f2 - 1) / r))
    const fb = Math.max(0, amount * f2 - fullPayment * ((f2 - 1) / r))
    return { year: i, balance: b, fullBalance: fb }
  })

  return { payment, fullPayment, balloon, interestToTerm, fullInterestToTerm, chart }
}

export default function AmortizationPeriodVsLoanTermComparison() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [])

  const invalid = useMemo(() => {
    const a = parseFloat(inputs.amount)
    const r = parseFloat(inputs.rate)
    const am = parseFloat(inputs.amortYears)
    const tm = parseFloat(inputs.termYears)
    return isNaN(a) || a <= 0 || isNaN(r) || r < 0 || isNaN(am) || am <= 0 || isNaN(tm) || tm <= 0 || tm > am
  }, [inputs])

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
        <span className="text-foreground">Amortization Period vs Loan Term Comparison</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Amortization Period vs Loan Term Comparison
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: INPUTS */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Loan Amount ($)</label>
                <input
                  type="number"
                  value={inputs.amount}
                  onChange={(e) => setInputs({ ...inputs, amount: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="250000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  value={inputs.rate}
                  onChange={(e) => setInputs({ ...inputs, rate: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="6.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amortization Period (years)</label>
                <input
                  type="number"
                  value={inputs.amortYears}
                  onChange={(e) => setInputs({ ...inputs, amortYears: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loan Term (years)</label>
                <input
                  type="number"
                  value={inputs.termYears}
                  onChange={(e) => setInputs({ ...inputs, termYears: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="10"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter a positive amount and rate, and a loan term no longer than the amortization period.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Balloon Balance at Term End</p>
            <p className="text-4xl font-bold text-primary mt-1">{money0(result.balloon)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              after {parseFloat(inputs.termYears) || 0} years at {money(result.payment)}/mo
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly Payment</p>
              <p className="text-lg font-bold mt-1 text-primary">{money(result.payment)}</p>
              <p className="text-xs text-muted-foreground">{parseFloat(inputs.amortYears) || 0}-yr amortization</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Full Amort. Payment</p>
              <p className="text-lg font-bold mt-1">{money(result.fullPayment)}</p>
              <p className="text-xs text-muted-foreground">if paid off in {parseFloat(inputs.termYears) || 0} yrs</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Interest Paid by Term</p>
              <p className="text-lg font-bold mt-1">{money0(result.interestToTerm)}</p>
              <p className="text-xs text-muted-foreground">over {parseFloat(inputs.termYears) || 0} years</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Loan Structure</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Loan Amount", parseFloat(inputs.amount) || 0, "principal borrowed"],
                  ["Monthly Payment", result.payment, "sized by amortization period"],
                  ["Loan Term", parseFloat(inputs.termYears) || 0, "years until balloon due"],
                  ["Amortization Period", parseFloat(inputs.amortYears) || 0, "years to fully repay if held"],
                  ["Balloon Balance", result.balloon, "principal still owed at term end"],
                  ["Interest Paid by Term End", result.interestToTerm, "payments − principal repaid"],
                ].map((row, i) => (
                  <tr key={row[0] as string} className={`border-b border-border ${i === 5 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{row[0] as string}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {i === 2 || i === 3 ? `${row[1] as number} yrs` : money(row[1] as number)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{row[2] as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Remaining Balance Over the Term ($)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={result.chart} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                <Tooltip formatter={(v: number, name: string) => [money0(v), name === "balance" ? "This loan" : "Fully amortized"]} labelFormatter={(l) => `Year ${l}`} />
                <Legend />
                <Line type="monotone" dataKey="balance" name="This loan" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fullBalance" name="Fully amortized" stroke="hsl(142 71% 45%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.balloon > 0
                ? `Because the payment is amortized over ${parseFloat(inputs.amortYears) || 0} years but the term is only ${parseFloat(inputs.termYears) || 0}, a balloon of ${money0(result.balloon)} comes due at year ${parseFloat(inputs.termYears) || 0}.`
                : "The loan is fully paid within the term — no balloon balance."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Monthly Payment</p>
                <p className="font-semibold text-foreground">{money(result.payment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Full Amortization Payment</p>
                <p className="font-semibold text-foreground">{money(result.fullPayment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balloon Balance</p>
                <p className="font-semibold text-foreground">{money0(result.balloon)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Principal Paid by Term End</p>
                <p className="font-semibold text-foreground">{money0((parseFloat(inputs.amount) || 0) - result.balloon)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Interest Paid by Term End</p>
                <p className="font-semibold text-foreground">{money0(result.interestToTerm)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Interest if Fully Amortized</p>
                <p className="font-semibold text-foreground">{money0(result.fullInterestToTerm)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/amortization-period-vs-loan-term-comparison" />
      </div>
    </div>
  )
}
