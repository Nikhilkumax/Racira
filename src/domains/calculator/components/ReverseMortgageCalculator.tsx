"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Home } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

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

export default function ReverseMortgageCalculator() {
  const [homeValue, setHomeValue] = useState(450000);
  const [balance, setBalance] = useState(100000);
  const [age, setAge] = useState(65);
  const [rate, setRate] = useState(7.2);
  const [showResults, setShowResults] = useState(false);

  const eligible = age >= 62;
  // Simplified HUD principal-limit factor: ~40% at 62, rising ~1%/yr, capped
  const plf = Math.min(0.75, Math.max(0.3, 0.35 + (age - 60) * 0.01));
  const principalLimit = homeValue * plf;
  const upfrontCosts = homeValue * 0.02 + 6000; // 2% MIP + fees
  const availableCash = Math.max(0, principalLimit - balance - upfrontCosts);
  const retainedEquity = Math.max(0, homeValue - principalLimit);
  const ltv = homeValue > 0 ? (principalLimit / homeValue) * 100 : 0;
  const monthlyRate = rate / 100 / 12;
  const annualGrowth = Math.pow(1 + monthlyRate, 12) - 1;

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setHomeValue(450000);
    setBalance(100000);
    setAge(65);
    setRate(7.2);
    setShowResults(false);
  };

  const faqs = [
    { question: "How does a reverse mortgage work?", answer: "A reverse mortgage (HECM) lets homeowners 62+ borrow against home equity without monthly payments. The loan principal and interest grow over time and are repaid when the home is sold or the borrower moves out or passes away. You keep title to the home and can live in it for life." },
    { question: "How much can I borrow?", answer: "The principal limit depends on the youngest borrower's age, the home's value, and current interest rates. Roughly, a 62-year-old borrower can access about 40% of home value; the factor rises about 1% per year of age, and higher-value homes are capped by an HUD limit." },
    { question: "What are the upfront costs?", answer: "Expect an upfront mortgage insurance premium of 2% of the home value, plus origination fees, appraisal, and closing costs. These come out of the principal limit rather than your pocket, reducing the cash you can access initially." },
    { question: "What happens to my equity?", answer: "The loan balance grows at the interest rate, so equity shrinks over time. In this model, retained equity is the home value minus the principal limit. You never owe more than the home is worth at settlement — HECM loans are non-recourse." },
    { question: "Is a reverse mortgage right for me?", answer: "It can fund retirement when other assets are thin, but it depletes inheritance and compounds interest quickly. Counseling is mandatory before getting a HECM. Compare against downsizing, a HELOC, or selling, and talk to a HUD-approved counselor first." },
  ];

  const chartData = [
    { name: "Available Cash", value: Math.round(availableCash) },
    { name: "Pay Off Mortgage", value: Math.round(balance) },
    { name: "Upfront Costs", value: Math.round(upfrontCosts) },
    { name: "Retained Equity", value: Math.round(retainedEquity) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Reverse Mortgage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reverse Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Home className="w-4 h-4" /> HECM Principal Limit Estimate
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Estimated Home Value" value={homeValue} onChange={setHomeValue} min={50000} max={5000000} step={1000} prefix="$" />
              <NumInput label="Existing Mortgage Balance" value={balance} onChange={setBalance} min={0} max={3000000} step={1000} prefix="$" />
              <NumInput label="Age of Youngest Borrower" value={age} onChange={setAge} min={55} max={95} step={1} suffix="yrs" />
              <NumInput label="Expected Interest Rate" value={rate} onChange={setRate} min={3} max={15} step={0.1} suffix="%" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {!eligible ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-5 rounded-2xl text-center font-bold">
                Borrowers must be at least 62 years old for a HECM reverse mortgage.
              </div>
            ) : showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Available Cash (Net)</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(availableCash)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    principal limit {fmt(principalLimit)} · minus payoff {fmt(balance)} and costs {fmt(upfrontCosts)}
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Principal Limit</p>
                    <p className="text-2xl font-bold text-primary">{fmt(principalLimit)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">LTV</p>
                    <p className="text-2xl font-bold text-orange-500">{ltv.toFixed(1)}%</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Equity Retained</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(retainedEquity)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Item</th>
                        <th className="py-2.5 px-3 font-medium text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Available Cash (Net)</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(availableCash)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Principal Limit Factor (age {age})</td>
                        <td className="py-2.5 px-3 text-right">{(plf * 100).toFixed(0)}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Total Principal Limit</td>
                        <td className="py-2.5 px-3 text-right">{fmt(principalLimit)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Mortgage Payoff</td>
                        <td className="py-2.5 px-3 text-right">−{fmt(balance)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Upfront MIP (2%) + Fees</td>
                        <td className="py-2.5 px-3 text-right">−{fmt(upfrontCosts)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Equity Retained</td>
                        <td className="py-2.5 px-3 text-right">{fmt(retainedEquity)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Loan Balance Growth (annual)</td>
                        <td className="py-2.5 px-3 text-right">{(annualGrowth * 100).toFixed(2)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Where the Principal Limit Goes</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} label>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={["#2563eb", "#f59e0b", "#ef4444", "#22c55e"][i]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Home Value</span>
                      <span className="font-medium">{fmt(homeValue)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Borrower Age</span>
                      <span className="font-medium">{age} yrs</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Available Cash</span>
                      <span className="font-medium">{fmt(availableCash)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Principal Limit</span>
                      <span className="font-medium">{fmt(principalLimit)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Upfront Costs</span>
                      <span className="font-medium">{fmt(upfrontCosts)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Interest Rate</span>
                      <span className="font-medium">{rate}%</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your details and click <strong className="text-foreground">Calculate</strong> to see your estimated principal limit, available cash, and equity position.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Reverse Mortgages Work</h2>
            <p>The principal limit is the home value times a factor that grows with age (a simplified stand-in for HUD's HECM tables — roughly 40% at 62, ~50% at 75, ~60% at 85). Paying off an existing mortgage and upfront costs (2% MIP plus fees) comes out of that limit; the rest is cash available to you.</p>
            <h3>Worked Example</h3>
            <p>A $450,000 home with a 65-year-old borrower gives a 40% factor ($180,000 limit). After paying off a $100,000 mortgage and ~$15,000 in upfront costs, about $65,000 is available as cash — and the loan balance grows at the 7.2% interest rate until the home is sold.</p>
            <h3>Know the Trade-Offs</h3>
            <p>Reverse mortgages eliminate monthly payments and let you age in place, but the compounding balance erodes the equity your heirs would inherit. Fees are higher than a conventional mortgage, and HUD requires a counseling session before closing. For many retirees the math works; for others, a HELOC or downsizing is cheaper.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reverse-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/reverse-mortgage-calculator" />
        </div>
      </div>
    </>
  );
}
