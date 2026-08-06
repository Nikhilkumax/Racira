"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/domains/calculator/components/ui/AmortizationTable";
import { RotateCcw, ChevronDown, Truck, Receipt, TrendingDown } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

interface RvInputs {
  rvPrice: number;
  downPayment: number;
  interestRate: number;
  loanTermMonths: number;
  tradeInValue: number;
  salesTaxRate: number;
  registrationFees: number;
  proMode: boolean;
  extraMonthly: number;
  annualDepreciationRate: number;
}

interface ChartSlice {
  name: string;
  value: number;
  percent: number;
  color: string;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface RvResult {
  monthlyPayment: number;
  loanAmount: number;
  salesTaxAmount: number;
  outTheDoorPrice: number;
  totalInterest: number;
  totalPaid: number;
  totalCostOfOwnership: number;
  interestPercentOfLoan: number;
  rows: TableRow[];
  chartData: ChartSlice[];
  amortRows: AmortRow[];
  // Professional mode
  payoffMonths: number;
  monthsSaved: number;
  interestSaved: number;
  breakEvenMonth: number;
  valueAtPayoff: number;
  maxNegativeEquity: number;
}

const DEFAULTS: RvInputs = {
  rvPrice: 85000,
  downPayment: 10000,
  interestRate: 8.5,
  loanTermMonths: 144,
  tradeInValue: 0,
  salesTaxRate: 6.5,
  registrationFees: 500,
  proMode: false,
  extraMonthly: 0,
  annualDepreciationRate: 12,
};

function buildSchedule(principal: number, monthlyRate: number, payment: number, maxMonths: number): AmortRow[] {
  const rows: AmortRow[] = [];
  let balance = principal;
  for (let period = 1; period <= maxMonths && balance > 0.01; period += 1) {
    const interest = balance * monthlyRate;
    let principalPaid = payment - interest;
    if (principalPaid <= 0) break;
    if (principalPaid > balance) principalPaid = balance;
    balance -= principalPaid;
    rows.push({ period, payment: interest + principalPaid, principal: principalPaid, interest, balance: Math.max(0, balance) });
  }
  return rows;
}

export function calculateRvLoan(i: RvInputs): RvResult {
  const price = Math.max(0, i.rvPrice);
  const tradeIn = Math.max(0, i.tradeInValue);
  const down = Math.max(0, i.downPayment);
  const fees = Math.max(0, i.registrationFees);

  // Most states assess sales tax on the price net of trade-in value.
  const taxableAmount = Math.max(0, price - tradeIn);
  const salesTaxAmount = taxableAmount * (Math.max(0, i.salesTaxRate) / 100);
  const outTheDoorPrice = price + salesTaxAmount + fees;
  const loanAmount = Math.max(0, outTheDoorPrice - down - tradeIn);

  const n = Math.max(1, Math.round(i.loanTermMonths));
  const r = Math.max(0, i.interestRate) / 100 / 12;

  const monthlyPayment =
    loanAmount > 0 ? (r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n) : 0;

  const amortRows = buildSchedule(loanAmount, r, monthlyPayment, n);
  const totalInterest = amortRows.reduce((sum, row) => sum + row.interest, 0);
  const totalPaid = loanAmount + totalInterest;
  const totalCostOfOwnership = down + tradeIn + totalPaid;
  const interestPercentOfLoan = loanAmount > 0 ? (totalInterest / loanAmount) * 100 : 0;

  const chartRaw: { name: string; value: number; color: string }[] = [
    { name: "Principal", value: loanAmount, color: "#2563EB" },
    { name: "Total Interest", value: totalInterest, color: "#F59E0B" },
    { name: "Sales Tax", value: salesTaxAmount, color: "#10B981" },
    { name: "Dealer & Registration Fees", value: fees, color: "#8B5CF6" },
  ].filter((s) => s.value > 0);

  const chartTotal = chartRaw.reduce((sum, s) => sum + s.value, 0);
  const chartData: ChartSlice[] = chartRaw.map((s) => ({
    ...s,
    value: Number(s.value.toFixed(2)),
    percent: chartTotal > 0 ? (s.value / chartTotal) * 100 : 0,
  }));

  const money = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const whole = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const rows: TableRow[] = [
    { label: "RV Purchase Price", value: whole(price) },
    { label: `Sales Tax (${i.salesTaxRate}% on ${whole(taxableAmount)})`, value: whole(salesTaxAmount) },
    { label: "Dealer & Registration Fees", value: whole(fees) },
    { label: "Out-the-Door Price", value: whole(outTheDoorPrice) },
    { label: "Less Down Payment", value: `-${whole(down)}` },
    { label: "Less Trade-In Value", value: `-${whole(tradeIn)}` },
    { label: "Amount Financed", value: whole(loanAmount), key: true },
    { label: `Monthly Payment (${n} mo @ ${i.interestRate}%)`, value: money(monthlyPayment) },
    { label: "Total Interest Paid", value: whole(totalInterest) },
    { label: "Total of Payments", value: whole(totalPaid) },
  ];

  // Professional mode: accelerated payoff and equity crossover.
  const acceleratedRows = buildSchedule(loanAmount, r, monthlyPayment + Math.max(0, i.extraMonthly), n);
  const payoffMonths = acceleratedRows.length > 0 ? acceleratedRows.length : amortRows.length;
  const monthsSaved = Math.max(0, amortRows.length - payoffMonths);
  const acceleratedInterest = acceleratedRows.reduce((sum, row) => sum + row.interest, 0);
  const interestSaved = Math.max(0, totalInterest - acceleratedInterest);

  // Compare declining loan balance against a depreciating asset value to find the
  // month the borrower stops being underwater.
  const depRate = Math.max(0, i.annualDepreciationRate) / 100;
  const monthlyDep = Math.pow(1 - depRate, 1 / 12);
  let breakEvenMonth = 0;
  let maxNegativeEquity = 0;
  for (let m = 1; m <= acceleratedRows.length; m += 1) {
    const assetValue = price * Math.pow(monthlyDep, m);
    const balance = acceleratedRows[m - 1].balance;
    const gap = balance - assetValue;
    if (gap > maxNegativeEquity) maxNegativeEquity = gap;
    if (breakEvenMonth === 0 && assetValue >= balance) breakEvenMonth = m;
  }
  const valueAtPayoff = price * Math.pow(monthlyDep, payoffMonths);

  return {
    monthlyPayment,
    loanAmount,
    salesTaxAmount,
    outTheDoorPrice,
    totalInterest,
    totalPaid,
    totalCostOfOwnership,
    interestPercentOfLoan,
    rows,
    chartData,
    amortRows,
    payoffMonths,
    monthsSaved,
    interestSaved,
    breakEvenMonth,
    valueAtPayoff,
    maxNegativeEquity,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function RvLoanPaymentCalculator() {
  const [inputs, setInputs] = useState<RvInputs>(DEFAULTS);
  const [result, setResult] = useState<RvResult>(calculateRvLoan(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateRvLoan(inputs));
  }, []);

  const calculate = () => setResult(calculateRvLoan(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateRvLoan(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof RvInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const money = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const whole = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

  const interestColor =
    result.interestPercentOfLoan <= 30 ? "text-emerald-600" : result.interestPercentOfLoan <= 60 ? "text-amber-600" : "text-red-600";

  const faqs = [
    {
      question: "How long can you finance an RV?",
      answer:
        "RV loans carry much longer terms than auto loans because the collateral is expensive and treated more like a small home than a car. Where a car loan usually caps at 72 to 84 months, RV loans commonly run 120 months up to 240 months for high-end motorhomes above $100,000. Longer is not automatically better: every additional year lowers the payment while raising total interest substantially.",
    },
    {
      question: "Are RV loan rates higher than auto loan rates?",
      answer:
        "Generally yes, by roughly one to three percentage points. RVs are discretionary purchases rather than primary transportation, so in a downturn borrowers default on an RV before they default on a car or a mortgage. Lenders price that behavioral risk into the rate. Credit score matters more here than in auto lending, and the spread between excellent and fair credit on an RV loan is often wider than four points.",
    },
    {
      question: "Is RV loan interest tax deductible?",
      answer:
        "Often, yes. The IRS treats an RV as a qualified second home if it has sleeping, cooking, and toilet facilities. If your RV meets that definition and the loan is secured by the RV itself, the interest may be deductible on your federal return in the same way as mortgage interest, subject to current limits and to the overall cap on qualified residence debt. You can only claim one second home at a time, so this competes with an actual vacation property.",
    },
    {
      question: "How does sales tax affect my RV loan?",
      answer:
        "Sales tax on an $85,000 RV commonly runs $5,000 to $8,500 depending on the state. If you do not pay it in cash, the dealer rolls it into the financed amount, which means paying interest on the tax for the next ten to fifteen years. On a 144-month loan at 8.5%, financing $5,500 of tax adds roughly $58 per month and about $2,800 in additional interest over the life of the loan.",
    },
    {
      question: "Does a trade-in reduce my sales tax?",
      answer:
        "In most states, yes, and this is one of the largest hidden benefits of trading in rather than selling privately. Sales tax is assessed on the purchase price net of trade-in value, so a $20,000 trade-in against an $85,000 RV in a 6.5% state saves $1,300 in tax outright. That saving partially offsets the lower price a dealer will offer relative to a private-party sale.",
    },
    {
      question: "How long am I underwater on an RV loan?",
      answer:
        "Longer than most buyers expect. RVs depreciate roughly 10% to 15% annually, steepest in the first three years, while a long loan amortizes slowly at the start. With zero down on a 15-year term, negative equity can persist for six to eight years. Professional Mode above computes the exact crossover month by comparing your declining balance against a depreciating asset value.",
    },
    {
      question: "Is a bigger down payment worth it on an RV?",
      answer:
        "It is unusually valuable here. A larger down payment cuts the balance you pay interest on across a very long term, and it shortens the period of negative equity, which is what traps owners who need to sell early. Twenty percent down on a 144-month loan is a materially different financial position than zero down, even though the monthly payment difference looks modest.",
    },
    {
      question: "Should I make extra payments on an RV loan?",
      answer:
        "Extra principal is exceptionally effective on long-term loans because so much of each early payment goes to interest. On an $85,000 balance at 8.5% over 144 months, an extra $200 per month cuts roughly 30 months and thousands in interest off the loan. Enable Professional Mode to see the exact months and dollars saved for your own figures.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator/finance" },
          { label: "RV Loan Payment Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">RV Loan Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rvPrice" className={lbl}>RV Price</label>
                <input id="rvPrice" type="number" min="0" step="1000" className={inp} value={inputs.rvPrice}
                  onChange={(e) => setNum("rvPrice", e.target.value)} />
              </div>
              <div>
                <label htmlFor="downPayment" className={lbl}>Down Payment</label>
                <input id="downPayment" type="number" min="0" step="1000" className={inp} value={inputs.downPayment}
                  onChange={(e) => setNum("downPayment", e.target.value)} />
              </div>
              <div>
                <label htmlFor="interestRate" className={lbl}>Interest Rate (%)</label>
                <input id="interestRate" type="number" min="0" step="0.01" className={inp} value={inputs.interestRate}
                  onChange={(e) => setNum("interestRate", e.target.value)} />
              </div>
              <div>
                <label htmlFor="loanTermMonths" className={lbl}>Loan Term</label>
                <select id="loanTermMonths" className={inp} value={inputs.loanTermMonths}
                  onChange={(e) => setNum("loanTermMonths", e.target.value)}>
                  <option value="60">60 months (5 years)</option>
                  <option value="84">84 months (7 years)</option>
                  <option value="120">120 months (10 years)</option>
                  <option value="144">144 months (12 years)</option>
                  <option value="180">180 months (15 years)</option>
                  <option value="240">240 months (20 years)</option>
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Receipt className="h-3.5 w-3.5" /> Taxes, Fees &amp; Trade-In
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="tradeInValue" className={lbl}>Trade-In Value</label>
                        <input id="tradeInValue" type="number" min="0" step="500" className={inp} value={inputs.tradeInValue}
                          onChange={(e) => setNum("tradeInValue", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="salesTaxRate" className={lbl}>Sales Tax Rate (%)</label>
                        <input id="salesTaxRate" type="number" min="0" step="0.1" className={inp} value={inputs.salesTaxRate}
                          onChange={(e) => setNum("salesTaxRate", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="registrationFees" className={lbl}>Dealer &amp; Registration Fees</label>
                        <input id="registrationFees" type="number" min="0" step="50" className={inp} value={inputs.registrationFees}
                          onChange={(e) => setNum("registrationFees", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <TrendingDown className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock equity crossover and payoff acceleration
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="extraMonthly" className={lbl}>Extra Payment / mo</label>
                          <input id="extraMonthly" type="number" min="0" step="25" className={inp} value={inputs.extraMonthly}
                            onChange={(e) => setNum("extraMonthly", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="annualDepreciationRate" className={lbl}>Depreciation / yr (%)</label>
                          <input id="annualDepreciationRate" type="number" min="0" step="1" className={inp}
                            value={inputs.annualDepreciationRate} onChange={(e) => setNum("annualDepreciationRate", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Estimated Monthly Payment
              </div>
              <div className="text-4xl font-bold text-primary my-1">{money(result.monthlyPayment)}</div>
              <div className="text-sm text-muted-foreground">
                {inputs.loanTermMonths} months at {inputs.interestRate}% on {whole(result.loanAmount)} financed
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Amount Financed</div>
                <div className="text-lg font-bold text-foreground">{whole(result.loanAmount)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Interest</div>
                <div className={`text-lg font-bold ${interestColor}`}>{whole(result.totalInterest)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Cost</div>
                <div className="text-lg font-bold text-foreground">{whole(result.totalCostOfOwnership)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Loan Component</th>
                    <th className="p-2.5 pr-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Total Cost of Ownership</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{whole(result.totalCostOfOwnership)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Where Your Money Goes</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RPie>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {result.chartData.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <RTooltip formatter={(value: number) => money(value)} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  </RPie>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {result.chartData.map((slice) => (
                    <div key={slice.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: slice.color }} />
                      {slice.name} — {slice.percent.toFixed(1)}%
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3">Payoff &amp; Equity Crossover</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Actual Payoff Time</div>
                      <div className="text-base font-bold text-foreground">
                        {Math.floor(result.payoffMonths / 12)} yr {result.payoffMonths % 12} mo
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Time Saved</div>
                      <div className="text-base font-bold text-emerald-600">
                        {Math.floor(result.monthsSaved / 12)} yr {result.monthsSaved % 12} mo
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Interest Saved</div>
                      <div className="text-base font-bold text-emerald-600">{whole(result.interestSaved)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Equity Break-Even</div>
                      <div className={`text-base font-bold ${result.breakEvenMonth === 0 ? "text-red-600" : result.breakEvenMonth > 72 ? "text-amber-600" : "text-emerald-600"}`}>
                        {result.breakEvenMonth === 0
                          ? "Never during term"
                          : `Month ${result.breakEvenMonth} (yr ${(result.breakEvenMonth / 12).toFixed(1)})`}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Peak Negative Equity</div>
                      <div className="text-base font-bold text-red-600">{whole(result.maxNegativeEquity)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">RV Value at Payoff</div>
                      <div className="text-base font-bold text-foreground">{whole(result.valueAtPayoff)}</div>
                    </div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card max-h-[400px] overflow-y-auto">
                  <h3 className="text-sm font-bold text-foreground mb-4">Yearly Amortization Schedule</h3>
                  <AmortizationTable
                    rows={result.amortRows.filter((r) => r.period % 12 === 0).map((r) => ({ ...r, period: r.period / 12 }))}
                    yearly={true}
                  />
                </div>
              </>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Financing an RV Is Not Financing a Car</h2>
            <p className="mb-4">
              Buying a recreational vehicle is closer to buying a small second home than to buying a car, and lenders treat
              it accordingly. Motorhomes, fifth wheels, and travel trailers range from about $30,000 to well past $300,000,
              which is why RV loans routinely stretch to twelve, fifteen, or even twenty years. Rates also run one to three
              points above comparable auto loans, because an RV is a discretionary purchase and defaults on discretionary
              collateral rise sharply in a downturn. Both facts push in the same direction: the total interest on an RV loan
              is far larger than the monthly payment suggests.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Cost of a Long Term</h2>
            <p className="mb-4">
              Stretching the term is the standard lever for making an expensive rig look affordable, and it is the most
              expensive decision in the transaction. An $85,000 loan at 8.5% over 60 months costs roughly $19,600 in total
              interest. The same balance over 180 months costs about $65,000 in interest, more than three times as much, for
              an asset that has been depreciating the entire time. The monthly payment falls by a few hundred dollars; the
              lifetime cost rises by tens of thousands. Run both terms in the calculator above before accepting the payment
              a dealer quotes.
            </p>

            <h2 className="text-2xl font-bold mb-3">Taxes, Fees, and the Trade-In Advantage</h2>
            <p className="mb-4">
              Sales tax and dealer fees typically add 6% to 10% to the purchase price. Rolling them into the loan preserves
              cash today but means paying interest on tax for over a decade. One genuine offset exists: in most states,
              sales tax is assessed on the price net of trade-in value, so trading in a $20,000 unit against an $85,000
              purchase in a 6.5% state saves $1,300 in tax immediately. That saving partly compensates for the lower price a
              dealer offers relative to a private sale, which is worth calculating rather than assuming either way.
            </p>

            <h2 className="text-2xl font-bold mb-3">Negative Equity and When It Ends</h2>
            <p>
              RVs depreciate roughly 10% to 15% per year, steepest in the first three, while a long loan pays down principal
              slowly at the start. Financing taxes and fees with little or no down payment therefore guarantees being
              underwater the moment you leave the lot, and on a fifteen-year term that position can persist for six to eight
              years. This matters because life changes: an owner who needs to sell in year four may have to bring cash to
              close the gap. Professional Mode above computes the exact crossover month for your figures, along with the peak
              negative equity and how much extra monthly principal shortens both the loan and the underwater period.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rv-loan-payment-calculator" />
          <PopularCalculators exclude="/calculator/rv-loan-payment-calculator" />
        </div>
      </div>
    </>
  );
}
