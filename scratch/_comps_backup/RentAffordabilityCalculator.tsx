"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Home } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function RentAffordabilityCalculator() {
  const [annualIncome, setAnnualIncome] = useState("60000");
  const [monthlyDebts, setMonthlyDebts] = useState("300");
  const [showResults, setShowResults] = useState(false);

  const income = parseFloat(annualIncome) || 0;
  const debts = parseFloat(monthlyDebts) || 0;

  const monthlyGross = income / 12;
  const recommendedRent = monthlyGross * 0.3;
  const maxRent40x = income / 40;
  const maxRentByDebt = monthlyGross * 0.36 - debts;
  const leftoverAfterRent = monthlyGross - recommendedRent - debts;
  const debtAfterRecommended = monthlyGross * 0.36 - recommendedRent;

  const chartData = [
    { name: "Rent (30%)", value: Math.round(recommendedRent) },
    { name: "Debts", value: Math.round(debts) },
    { name: "Remaining", value: Math.round(Math.max(0, leftoverAfterRent)) },
  ];

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setAnnualIncome("60000");
    setMonthlyDebts("300");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is the 30% rule?", answer: "The classic guideline that rent should not exceed 30% of gross monthly income. A $5,000/month earner caps rent at $1,500. It predates today's high-cost cities, so in expensive metros many renters spend 40–50% — workable, but it squeezes savings." },
    { question: "What is the 40× rule?", answer: "A landlord qualification standard: your annual income should be at least 40 times the monthly rent. For $1,500/month rent you need $60,000/year. It is stricter than the 30% rule at low rents and looser at high ones, which is why landlords use it to filter applicants." },
    { question: "What is the 36% debt-to-income cap?", answer: "Lenders and many landlords cap your total monthly obligations — housing plus other debts — at 36% of gross income. With $300 of car and student loans, your rent is limited to 36% of $5,000 minus $300 = $1,500, so existing debts directly shrink your rent budget." },
    { question: "Should I include utilities in the rent budget?", answer: "Yes — a $1,400 rent with $200 of utilities is effectively $1,600. Budget rent plus expected utilities together against the 30% number, and confirm with the landlord what utilities are included before signing." },
    { question: "What if I can't afford 30% in my city?", answer: "You have three levers: earn more, spend less elsewhere, or share housing (roommates reduce rent per person dramatically). The 30% rule is a target, not a law — but every percentage point above it comes directly out of savings and emergency buffer." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Rent Affordability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rent Affordability Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Home className="w-4 h-4" /> 30% & 40× Rules
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Annual Gross Income ($)</label>
                <input id="ra-income" type="number" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Other Monthly Debts ($)</label>
                <input id="ra-debts" type="number" value={monthlyDebts} onChange={(e) => setMonthlyDebts(e.target.value)} min={0} className="input-calc" />
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
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Recommended Rent (30% Rule)</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(recommendedRent)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(leftoverAfterRent)} left monthly after rent and {fmt(debts)} of debts
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Max Rent (40× Rule)</p>
                    <p className="text-2xl font-bold text-primary">{fmt(maxRent40x)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Rent Cap with Debts</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(maxRentByDebt)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly Gross</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(monthlyGross)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Metric</th>
                        <th className="py-2.5 px-3 font-medium text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Recommended Rent (30%)</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(recommendedRent)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Monthly Gross Income</td>
                        <td className="py-2.5 px-3 text-right">{fmt(monthlyGross)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Max Rent (40× Rule)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(maxRent40x)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Rent Cap with Debts (36% − debts)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(maxRentByDebt)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Leftover After Rent & Debts</td>
                        <td className="py-2.5 px-3 text-right font-medium">{fmt(leftoverAfterRent)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Debt Room After Recommended Rent</td>
                        <td className="py-2.5 px-3 text-right">{fmt(debtAfterRecommended)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Monthly Budget Split</p>
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
                      <span className="text-muted-foreground">Annual Income</span>
                      <span className="font-medium">{fmt(income)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Monthly Debts</span>
                      <span className="font-medium">{fmt(debts)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Rent % of Income</span>
                      <span className="font-medium">{(recommendedRent / Math.max(1, monthlyGross)) * 100}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Debt-to-Income</span>
                      <span className="font-medium">{((debts / Math.max(1, monthlyGross)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Landlord Max</span>
                      <span className="font-medium">{fmt(maxRent40x)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Verdict</span>
                      <span className="font-medium">{recommendedRent <= maxRent40x && recommendedRent <= maxRentByDebt ? "Comfortable" : "Tight"}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your income and debts, then click <strong className="text-foreground">Calculate</strong> to see how much rent you can comfortably afford.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Rent Affordability Is Measured</h2>
            <p>On $60,000/year ($5,000/month gross), the 30% rule suggests $1,500 rent; landlords using the 40× rule would accept up to $1,500 too ($60,000 ÷ 40). After $300 of debts, you'd have $3,200 left each month for everything else.</p>
            <h3>Three Rules, One Answer</h3>
            <p>The 30% rule protects your own budget, the 40× rule is what landlords actually check, and the 36% debt-to-income cap is what lenders apply. A rent number that clears all three — as $1,500 does here — is safe from every angle. If they disagree, the strictest one wins: the landlord's requirement you cannot negotiate away is the real ceiling.</p>
            <h3>Beyond the Rules</h3>
            <p>Rules assume a standard budget. Adjust them for reality: expensive cities, student loans in income-driven repayment, side income, or a partner contributing to rent. The rules give a starting ceiling; your actual comfort zone depends on your spending, savings rate, and how much buffer you want each month.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rent-affordability-calculator" />
          <PopularCalculators exclude="/calculator/rent-affordability-calculator" />
        </div>
      </div>
    </>
  );
}
