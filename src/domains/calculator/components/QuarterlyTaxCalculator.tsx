"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, CalendarClock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NumInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}

function NumInput({ label, value, onChange, min = 0, max = 9999999, step = 1, suffix, prefix }: NumInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(min);
            const n = parseFloat(raw);
            if (Number.isNaN(n)) return;
            onChange(Math.min(max, Math.max(min, n)));
          }}
          className={`input-calc ${prefix ? "pl-8" : ""} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

export default function QuarterlyTaxCalculator() {
  const [income, setIncome] = useState(100000);
  const [expenses, setExpenses] = useState(20000);
  const [lastYearTax, setLastYearTax] = useState(12000);
  const [filing, setFiling] = useState("single");
  const [showResults, setShowResults] = useState(false);

  const netProfit = Math.max(0, income - expenses);
  const seBase = netProfit * 0.9235;
  const ssTax = Math.min(seBase, 168600) * 0.124;
  const medicareTax = seBase * 0.029;
  const totalSeTax = ssTax + medicareTax;
  const stdDed = filing === "single" ? 14600 : 29200;
  const taxableIncome = Math.max(0, netProfit - totalSeTax / 2 - stdDed);
  const estIncomeTax = taxableIncome * 0.18;
  const totalLiability = totalSeTax + estIncomeTax;
  const rule90 = totalLiability * 0.9;
  const rule100 = lastYearTax * (lastYearTax > 150000 ? 1.1 : 1.0);
  const requiredAnnual = Math.min(rule90, rule100);
  const quarterly = requiredAnnual / 4;
  const remaining = totalLiability - requiredAnnual;

  const chartData = [
    { name: "Self-Employment", value: Math.round(totalSeTax) },
    { name: "Income Tax (est.)", value: Math.round(estIncomeTax) },
  ];

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setIncome(100000);
    setExpenses(20000);
    setLastYearTax(12000);
    setFiling("single");
    setShowResults(false);
  };

  const faqs = [
    { question: "Who must pay estimated quarterly taxes?", answer: "Self-employed individuals, freelancers, and anyone whose income is not subject to withholding — including gig workers, small business owners, and retirees with large non-payroll income. If you expect to owe $1,000 or more at filing, the IRS generally requires quarterly payments." },
    { question: "When are quarterly payments due?", answer: "Four installments per year: April 15, June 15, September 15, and January 15 of the following year. Each covers roughly one quarter of your expected liability. If a due date falls on a weekend or holiday, it moves to the next business day." },
    { question: "What is the safe harbor rule?", answer: "You avoid penalties if you pay the smaller of 90% of this year's tax liability or 100% of last year's tax (110% if your prior-year adjusted gross income exceeded $150,000). This calculator takes the lower of the two and splits it into four equal payments." },
    { question: "How is self-employment tax calculated?", answer: "It is 15.3% — 12.4% Social Security (capped at $168,600 for 2024) plus 2.9% Medicare — applied to 92.35% of net profit. You also deduct half of the self-employment tax when computing taxable income for income tax." },
    { question: "What happens if I underpay?", answer: "The IRS charges interest on the shortfall from each missed due date, plus a failure-to-pay penalty of 0.5% per month. Paying via the safe harbor protects you from penalties even if your final liability comes in higher than estimated." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Quarterly Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Quarterly Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <CalendarClock className="w-4 h-4" /> Estimated Payments
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Expected Annual Revenue" value={income} onChange={setIncome} min={0} max={5000000} step={1000} prefix="$" />
              <NumInput label="Estimated Business Expenses" value={expenses} onChange={setExpenses} min={0} max={3000000} step={1000} prefix="$" />
              <NumInput label="Total Tax Paid Last Year" value={lastYearTax} onChange={setLastYearTax} min={0} max={2000000} step={100} prefix="$" />
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Filing Status</label>
                <select
                  value={filing}
                  onChange={(e) => setFiling(e.target.value)}
                  className="input-calc"
                >
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Recommended Quarterly Payment</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(quarterly)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(requiredAnnual)}/year via safe harbor · due Apr 15, Jun 15, Sep 15, Jan 15
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Net Profit</p>
                    <p className="text-2xl font-bold text-primary">{fmt(netProfit)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Self-Employment Tax</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(totalSeTax)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Liability</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(totalLiability)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Item</th>
                        <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Quarterly Payment (Safe Harbor)</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(quarterly)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Self-Employment Tax (SS + Medicare)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(totalSeTax)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Estimated Federal Income Tax</td>
                        <td className="py-2.5 px-3 text-right">{fmt(estIncomeTax)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Total Current-Year Liability</td>
                        <td className="py-2.5 px-3 text-right">{fmt(totalLiability)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">90% Rule</td>
                        <td className="py-2.5 px-3 text-right">{fmt(rule90)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Prior-Year Safe Harbor</td>
                        <td className="py-2.5 px-3 text-right">
                          {fmt(rule100)}
                          {lastYearTax > 150000 ? " (110%)" : ""}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Year-End Balance (if safe harbor)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(remaining)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Liability Breakdown</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Revenue − Expenses</span>
                      <span className="font-medium">{fmt(netProfit)} net</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">SE Tax Rate</span>
                      <span className="font-medium">15.3% of 92.35%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Quarterly Payment</span>
                      <span className="font-medium">{fmt(quarterly)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Annual Payment</span>
                      <span className="font-medium">{fmt(requiredAnnual)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Filing Status</span>
                      <span className="font-medium">{filing === "single" ? "Single" : "MFJ"}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Safe Harbor Used</span>
                      <span className="font-medium">{rule90 <= rule100 ? "90% of current year" : "Prior year"}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your expected revenue, expenses, and last year's tax, then click <strong className="text-foreground">Calculate</strong> to see your recommended quarterly payment.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Estimated Quarterly Taxes Work</h2>
            <p>Self-employment tax is 15.3% (12.4% Social Security capped at $168,600 + 2.9% Medicare) applied to 92.35% of net profit. Income tax is estimated at 18% of taxable income after the standard deduction and half the SE tax. The safe-harbor rule lets you pay the smaller of 90% of this year's liability or 100% of last year's tax (110% if your prior tax exceeded $150,000), split into four payments.</p>
            <h3>Worked Example</h3>
            <p>With $100,000 revenue, $20,000 expenses, and $12,000 paid last year: net profit is $80,000, SE tax $11,304, and income tax $10,755 — a $22,058 total liability. The prior-year safe harbor ($12,000) beats the 90% rule ($19,852), so each quarterly payment is $3,000.</p>
            <h3>Penalty Protection</h3>
            <p>Payments are estimates, not exact bills — that is why the safe harbor exists. As long as you pay enough to satisfy the 90% or 100/110% rule, you owe no underpayment penalty even if your April 15 tax return shows a balance. If your income spikes mid-year, the annualized income installment method can lower required payments for early quarters.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/quarterly-tax-calculator" />
          <PopularCalculators exclude="/calculator/quarterly-tax-calculator" />
        </div>
      </div>
    </>
  );
}
