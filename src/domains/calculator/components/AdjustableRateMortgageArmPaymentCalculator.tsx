"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { RotateCcw, Printer } from "lucide-react"
import PopularCalculators from "@/components/PopularCalculators"

interface Inputs {
  amount: string
  initialRate: string
  fixedMonths: string
  margin: string
  indexRate: string
  termYears: string
}

interface PeriodRow {
  period: string
  rate: number
  payment: number
  months: number
}

interface Result {
  initialPayment: number
  adjustedRate: number
  adjustedPayment: number
  totalInterest: number
  periods: PeriodRow[]
  initialBalance: number
}

function pmt(rate: number, n: number, pv: number): number {
  if (rate === 0) return pv / n
  const f = Math.pow(1 + rate, n)
  return (pv * rate * f) / (f - 1)
}

function balanceAfter(rate: number, months: number, payment: number, pv: number): number {
  if (rate === 0) return Math.max(0, pv - payment * months)
  const f = Math.pow(1 + rate, months)
  return Math.max(0, (pv * f) - payment * ((f - 1) / rate))
}

const DEFAULTS: Inputs = { amount: "300000", initialRate: "6", fixedMonths: "60", margin: "2.75", indexRate: "4.5", termYears: "30" }

function calculate(inputs: Inputs): Result {
  const amount = Math.max(0, parseFloat(inputs.amount) || 0)
  const initialRate = Math.max(0, parseFloat(inputs.initialRate) || 0)
  const fixedMonths = Math.max(1, Math.round(parseFloat(inputs.fixedMonths) || 60))
  const margin = Math.max(0, parseFloat(inputs.margin) || 0)
  const indexRate = Math.max(0, parseFloat(inputs.indexRate) || 0)
  const termYears = Math.max(1, parseFloat(inputs.termYears) || 30)
  const totalMonths = Math.round(termYears * 12)

  const r1 = initialRate / 100 / 12
  const initialPayment = pmt(r1, totalMonths, amount)
  const adjustedRate = margin + indexRate
  const r2 = adjustedRate / 100 / 12
  const remainingAfterFixed = balanceAfter(r1, fixedMonths, initialPayment, amount)
  const remainingMonths = Math.max(1, totalMonths - fixedMonths)
  const adjustedPayment = pmt(r2, remainingMonths, remainingAfterFixed)

  // Payment projection across the fixed period then each adjustment period
  const periods: PeriodRow[] = []
  let bal = amount
  let cursor = 0
  const steps = [fixedMonths, Math.max(1, remainingMonths)]
  const rates = [initialRate, adjustedRate]
  for (let s = 0; s < steps.length; s++) {
    const months = steps[s]
    const pay = s === 0 ? initialPayment : pmt(rates[s] / 100 / 12, totalMonths - cursor, bal)
    periods.push({ period: s === 0 ? `Fixed Period (${fixedMonths} mo @ ${initialRate.toFixed(2)}%)` : `After Adjustment (${adjustedRate.toFixed(2)}%)`, rate: rates[s], payment: pay, months })
    bal = balanceAfter(rates[s] / 100 / 12, months, pay, bal)
    cursor += months
  }

  // Approximate total interest: initial-period interest + adjusted-period interest
  const totalInterest = periods.reduce((sum, p) => sum + p.payment * p.months, 0) - amount

  return { initialPayment, adjustedRate, adjustedPayment, totalInterest, periods, initialBalance: amount }
}

export default function AdjustableRateMortgageArmPaymentCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS))

  useEffect(() => {
    setResult(calculate(inputs))
  }, [inputs])

  const invalid = useMemo(() => {
    const a = parseFloat(inputs.amount)
    const ir = parseFloat(inputs.initialRate)
    const fm = parseFloat(inputs.fixedMonths)
    const mg = parseFloat(inputs.margin)
    const ix = parseFloat(inputs.indexRate)
    const ty = parseFloat(inputs.termYears)
    return isNaN(a) || a <= 0 || isNaN(ir) || ir < 0 || isNaN(fm) || fm <= 0 || isNaN(mg) || mg < 0 || isNaN(ix) || ix < 0 || isNaN(ty) || ty <= 0
  }, [inputs])

  const chartData = useMemo(() => result.periods.map((p) => ({ name: p.period, value: p.payment, fill: "hsl(var(--primary))" })), [result])

  function run() {
    setResult(calculate(inputs))
  }

  function reset() {
    setInputs(DEFAULTS)
    setResult(calculate(DEFAULTS))
  }

  const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="w-full">
      {/* BREADCRUMB */}
      <nav className="text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
        <span className="hover:text-primary transition-colors">Finance</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Adjustable-Rate Mortgage (ARM) Payment Calculator</span>
      </nav>

      {/* H1 — no subtitle */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Adjustable-Rate Mortgage (ARM) Payment Calculator
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
                  placeholder="300000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Initial Rate (%)</label>
                <input
                  type="number"
                  value={inputs.initialRate}
                  onChange={(e) => setInputs({ ...inputs, initialRate: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fixed Period (months)</label>
                <input
                  type="number"
                  value={inputs.fixedMonths}
                  onChange={(e) => setInputs({ ...inputs, fixedMonths: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Margin (%)</label>
                <input
                  type="number"
                  value={inputs.margin}
                  onChange={(e) => setInputs({ ...inputs, margin: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="2.75"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Index Rate (%)</label>
                <input
                  type="number"
                  value={inputs.indexRate}
                  onChange={(e) => setInputs({ ...inputs, indexRate: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="4.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loan Term (years)</label>
                <input
                  type="number"
                  value={inputs.termYears}
                  onChange={(e) => setInputs({ ...inputs, termYears: e.target.value })}
                  className="w-full h-10 text-base rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="30"
                />
              </div>
            </div>
            {invalid && <p className="text-xs text-red-500 mt-2">Enter a positive loan amount, term, and fixed period with non-negative rates.</p>}

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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Initial Monthly Payment</p>
            <p className="text-4xl font-bold text-primary mt-1">{money(result.initialPayment)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {parseFloat(inputs.initialRate) || 0}% fixed for {Math.round(parseFloat(inputs.fixedMonths) || 0)} months
            </p>
          </div>

          {/* 2. 3-STAT BAR */}
          <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-3 divide-x divide-border">
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Adjusted Rate</p>
              <p className="text-lg font-bold mt-1 text-primary">{result.adjustedRate.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground">margin + index</p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment After Adjust</p>
              <p className={`text-lg font-bold mt-1 ${result.adjustedPayment > result.initialPayment ? "text-red-600" : "text-emerald-600"}`}>
                {money(result.adjustedPayment)}
              </p>
              <p className="text-xs text-muted-foreground">
                {result.adjustedPayment >= result.initialPayment ? "+" : ""}
                {money(Math.abs(result.adjustedPayment - result.initialPayment))} vs initial
              </p>
            </div>
            <div className="px-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Lifetime Interest (≈)</p>
              <p className="text-lg font-bold mt-1">{money(result.totalInterest)}</p>
              <p className="text-xs text-muted-foreground">all payments − principal</p>
            </div>
          </div>

          {/* 3. BREAKDOWN TABLE */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Payment Projection</h2>
            <table className="w-full text-sm">
              <tbody>
                {result.periods.map((p, i) => (
                  <tr key={p.period} className={`border-b border-border ${i === result.periods.length - 1 ? "bg-primary/10 font-semibold text-primary" : ""}`}>
                    <td className="py-2.5 px-3">{p.period}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{p.rate.toFixed(2)}%</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{money(p.payment)}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{p.months} mo</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2.5 px-3">Loan Amount</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">—</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{money(result.initialBalance)}</td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground">{Math.round(parseFloat(inputs.termYears) || 0)} yr term</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. CHART */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Monthly Payment by Period ($)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`} />
                <Tooltip formatter={(v: number) => [money(v), "Monthly payment"]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.45)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              {result.adjustedPayment !== result.initialPayment
                ? `When the fixed period ends, the rate resets to ${result.adjustedRate.toFixed(2)}% (margin + index), changing the payment by ${money(Math.abs(result.adjustedPayment - result.initialPayment))} per month.`
                : "The adjusted rate matches the initial rate, so the payment stays flat."}
            </p>
          </div>

          {/* 5. SUMMARY STATISTICS */}
          <div className="bg-muted/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Loan Amount</p>
                <p className="font-semibold text-foreground">{money(result.initialBalance)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Initial Rate</p>
                <p className="font-semibold text-foreground">{parseFloat(inputs.initialRate) || 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fully-Indexed Rate</p>
                <p className="font-semibold text-foreground">{result.adjustedRate.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Initial Payment</p>
                <p className="font-semibold text-foreground">{money(result.initialPayment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment After Adjustment</p>
                <p className="font-semibold text-foreground">{money(result.adjustedPayment)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. Lifetime Interest</p>
                <p className="font-semibold text-foreground">{money(result.totalInterest)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PopularCalculators exclude="/calculator/adjustable-rate-mortgage-arm-payment-calculator" />
      </div>
    </div>
  )
}
