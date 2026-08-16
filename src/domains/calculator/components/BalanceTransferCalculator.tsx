"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import InputField from "@/domains/calculator/components/ui/InputField";
import { Calculator, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell, Legend } from "recharts";

// 1. TypeScript Interfaces
interface BalanceTransferInputs {
  currentBalance: number;
  currentApr: number;
  promoApr: number;
  promoPeriod: number;
  transferFeePct: number;
  regularApr: number;
  monthlyPayment: number;
  keepCurrentCard: boolean;
}

interface BalanceTransferResult {
  transferFee: number;
  transferBalance: number;
  costTransfer: number;
  costKeep: number;
  monthsTransfer: number;
  monthsKeep: number;
  interestTransfer: number;
  interestKeep: number;
  savings: number;
  promoInterestSaved: number;
  chartData: Array<{ name: string; cost: number; fill: string }>;
  impossibleTransfer: boolean;
  impossibleKeep: boolean;
}

// 2. Pure Calculation Function (zero React, fully typed)
const calculate = (inputs: BalanceTransferInputs): BalanceTransferResult => {
  const balance = Math.max(0, inputs.currentBalance || 0);
  const currentApr = Math.max(0, inputs.currentApr || 0) / 100 / 12;
  const promoApr = Math.max(0, inputs.promoApr || 0) / 100 / 12;
  const promoPeriod = Math.max(0, Math.floor(inputs.promoPeriod || 0));
  const feePct = Math.max(0, inputs.transferFeePct || 0) / 100;
  const regularApr = Math.max(0, inputs.regularApr || 0) / 100 / 12;
  const payment = Math.max(0, inputs.monthlyPayment || 0);
  const keepCurrent = !!inputs.keepCurrentCard;

  const transferFee = balance * feePct;
  const transferBalance = balance + transferFee;

  const MAX_MONTHS = 600;

  // Scenario A: Transfer to promo card
  let bA = transferBalance;
  let interestA = 0;
  let monthsA = 0;
  let impossibleA = false;
  if (payment > 0 && bA > 0) {
    while (bA > 0 && monthsA < MAX_MONTHS) {
      const rate = monthsA < promoPeriod ? promoApr : regularApr;
      const interest = bA * rate;
      interestA += interest;
      bA = bA + interest - payment;
      if (bA < 0) bA = 0;
      monthsA++;
    }
    if (bA > 0.01) impossibleA = true;
  }
  const costA = transferFee + interestA;

  // Scenario B: Keep current card
  let bB = balance;
  let interestB = 0;
  let monthsB = 0;
  let impossibleB = false;
  if (payment > 0 && bB > 0) {
    while (bB > 0 && monthsB < MAX_MONTHS) {
      const interest = bB * currentApr;
      interestB += interest;
      bB = bB + interest - payment;
      if (bB < 0) bB = 0;
      monthsB++;
    }
    if (bB > 0.01) impossibleB = true;
  }
  const costB = interestB;

  // Savings = Cost B - Cost A (only meaningful if transfer makes sense)
  const savings = keepCurrent ? 0 : Math.max(0, costB - costA);

  // Interest saved during the promo window if transferring
  const promoInterestSaved = balance * currentApr * Math.min(promoPeriod, monthsB || promoPeriod);

  const chartData = [
    { name: "Keep Current Card", cost: Math.round(costB), fill: "#ef4444" },
    { name: "Balance Transfer", cost: Math.round(costA), fill: "#10b981" },
  ];

  return {
    transferFee,
    transferBalance,
    costTransfer: costA,
    costKeep: costB,
    monthsTransfer: monthsA,
    monthsKeep: monthsB,
    interestTransfer: interestA,
    interestKeep: interestB,
    savings,
    promoInterestSaved,
    chartData,
    impossibleTransfer: impossibleA,
    impossibleKeep: impossibleB,
  };
};

// 3. Realistic Industry-Standard Defaults
const DEFAULTS: BalanceTransferInputs = {
  currentBalance: 5000,
  currentApr: 22.9,
  promoApr: 0,
  promoPeriod: 18,
  transferFeePct: 3,
  regularApr: 18.9,
  monthlyPayment: 200,
  keepCurrentCard: true,
};

// 4. Component
const BalanceTransferCalculator = () => {
  // LEFT col state: single DEFAULTS object (all inputs)
  const [inputs, setInputs] = useState<BalanceTransferInputs>(DEFAULTS);
  // RIGHT col result: computed on mount
  const [result, setResult] = useState<BalanceTransferResult>(calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const update = (key: keyof BalanceTransferInputs, raw: string | boolean) => {
    setInputs((prev) => ({ ...prev, [key]: typeof raw === "boolean" ? raw : raw === "" ? (DEFAULTS[key] as number) : isNaN(parseFloat(raw)) ? (DEFAULTS[key] as number) : parseFloat(raw) }));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calculate(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
    setShowAdvanced(false);
  };

  const faqs = [
    { question: "What is a balance transfer?", answer: "A balance transfer moves high-interest credit card debt to a new card offering a low or 0% introductory APR, so more of your monthly payment attacks the principal instead of interest." },
    { question: "How is the transfer fee calculated?", answer: "The transfer fee is a one-time charge equal to the transfer fee percentage multiplied by the balance moved. A 3% fee on $5,000 adds $150 to your starting balance on the new card." },
    { question: "What happens after the promotional period ends?", answer: "Once the promo window closes, the remaining balance accrues interest at the regular (post-promo) APR, which is usually much higher. Paying off the balance before then maximizes your savings." },
    { question: "Is a balance transfer always worth it?", answer: "It is worth it when the interest you avoid exceeds the transfer fee. Our calculator compares the total cost of transferring against keeping the balance on your current card so you can see the exact savings." },
    { question: "How can I pay off debt faster?", answer: "Increase your monthly payment, avoid new charges on either card, and set up automatic payments so you never trigger a penalty APR before the promo period ends." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Finance", href: "/finance" }, { label: "Balance Transfer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Balance Transfer Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT COLUMN — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 p-5 shadow-sm border border-border bg-card rounded-xl">
            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-3">
                <InputField id="currentBalance" label="Current Balance ($)" value={String(inputs.currentBalance)} onChange={(v) => update("currentBalance", v)} type="number" />
                <InputField id="currentApr" label="Current APR (%)" value={String(inputs.currentApr)} onChange={(v) => update("currentApr", v)} type="number" step="0.1" />
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-3">
                <InputField id="promoApr" label="Promo APR (%)" value={String(inputs.promoApr)} onChange={(v) => update("promoApr", v)} type="number" step="0.1" />
                <InputField id="promoPeriod" label="Promo Period (months)" value={String(inputs.promoPeriod)} onChange={(v) => update("promoPeriod", v)} type="number" />
              </div>

              {/* Advanced Options — Second Tier (2A) */}
              <div className="border-t pt-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Advanced Options
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showAdvanced && (
                  <div className="flex flex-col gap-4 mt-3">
                    <div className="bg-secondary/20 border border-border rounded-lg p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Transfer Terms</p>
                      <div className="grid grid-cols-2 gap-3">
                        <InputField id="transferFeePct" label="Transfer Fee (%)" value={String(inputs.transferFeePct)} onChange={(v) => update("transferFeePct", v)} type="number" step="0.1" />
                        <InputField id="regularApr" label="Regular APR (%)" value={String(inputs.regularApr)} onChange={(v) => update("regularApr", v)} type="number" step="0.1" />
                        <InputField id="monthlyPayment" label="Monthly Payment ($)" value={String(inputs.monthlyPayment)} onChange={(v) => update("monthlyPayment", v)} type="number" />
                      </div>
                    </div>
                    <div className="bg-secondary/20 border border-border rounded-lg p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Comparison</p>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inputs.keepCurrentCard}
                          onChange={(e) => update("keepCurrentCard", e.target.checked)}
                          className="h-4 w-4 accent-primary"
                        />
                        Keep Current Card (show cost if not transferring)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" className="h-10 w-full bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">Calculate</button>
                <button type="button" onClick={handleReset} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground" aria-label="Reset">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN — RESULTS */}
          <div className="flex flex-col gap-4">
            {result.impossibleTransfer && (
              <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-5">
                <p className="text-lg font-bold text-red-600 mb-1">Payment Too Low</p>
                <p className="text-sm text-foreground">Your monthly payment of ${inputs.monthlyPayment} is lower than the interest it generates, so the balance would grow rather than shrink. Increase your payment to see realistic savings.</p>
              </div>
            )}

            {/* 1. Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Total Savings</p>
              <p className="text-4xl font-bold text-primary mt-1">${Math.round(result.savings).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {inputs.keepCurrentCard ? "By transferring instead of keeping the balance on your current card" : "Compared to keeping the balance on your current card"}
              </p>
            </div>

            {/* 2. 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 bg-card border border-border rounded-lg overflow-hidden divide-x divide-border">
              <div className="p-4 text-center">
                <p className="text-xs uppercase text-muted-foreground mb-1">Transfer Cost</p>
                <p className="text-lg font-bold">${Math.round(result.costTransfer).toLocaleString()}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs uppercase text-muted-foreground mb-1">Keep Cost</p>
                <p className="text-lg font-bold">${Math.round(result.costKeep).toLocaleString()}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs uppercase text-muted-foreground mb-1">Transfer Fee</p>
                <p className="text-lg font-bold text-amber-500">${Math.round(result.transferFee).toLocaleString()}</p>
              </div>
            </div>

            {/* 3. Breakdown Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b border-border">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Cost Breakdown</h3>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 px-4 text-muted-foreground">Current Balance</td>
                    <td className="py-2.5 px-4 text-right font-medium">${Math.round(inputs.currentBalance).toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 px-4 text-muted-foreground">Transfer Fee ({inputs.transferFeePct}%)</td>
                    <td className="py-2.5 px-4 text-right font-medium text-amber-500">+ ${Math.round(result.transferFee).toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 px-4 text-muted-foreground">Interest if Transferred</td>
                    <td className="py-2.5 px-4 text-right font-medium text-red-500">${Math.round(result.interestTransfer).toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2.5 px-4 text-muted-foreground">Interest if Kept</td>
                    <td className="py-2.5 px-4 text-right font-medium text-red-500">${Math.round(result.interestKeep).toLocaleString()}</td>
                  </tr>
                  <tr className="bg-muted/10 border-y-2 border-border">
                    <td className="py-3 px-4 font-bold">Total Savings</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">${Math.round(result.savings).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Recharts BarChart */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Total Cost Comparison</h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <RTooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Total Cost"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Legend verticalAlign="bottom" height={32} iconType="circle" />
                    <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5. Summary Statistics */}
            <div className="bg-muted/30 border border-border rounded-lg p-5">
              <h3 className="text-base font-semibold mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">Interest Saved (Promo)</div>
                <div className="font-medium text-right text-emerald-600">${Math.round(result.promoInterestSaved).toLocaleString()}</div>
                <div className="text-muted-foreground">Payoff Time — Transfer</div>
                <div className="font-medium text-right">{result.monthsTransfer} months</div>
                <div className="text-muted-foreground">Payoff Time — Keep</div>
                <div className="font-medium text-right">{result.monthsKeep} months</div>
                <div className="text-muted-foreground">New Starting Balance</div>
                <div className="font-medium text-right">${Math.round(result.transferBalance).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO CONTENT — 3 sections, ~400 words */}
        <div className="max-w-[1180px] mt-12">
          <AdPlaceholder className="mb-8" />
          <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Balance Transfer Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Balance Transfer Calculator is a focused financial tool that compares the true cost of moving high-interest credit card debt onto a promotional 0% APR card versus leaving it on your current card. Credit cards routinely charge 20% to 29% APR, so most of a minimum payment covers interest rather than principal. A balance transfer pauses that interest clock, but it is never free: issuers add a one-time transfer fee, and after the promotional window the remaining balance reverts to a higher regular APR. This calculator runs both amortization paths month by month, subtracting the transfer fee and any post-promo interest from the interest you would otherwise pay, to reveal your real net savings. It answers the single question that matters most: is transferring actually cheaper, and by how much.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How the Calculator Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                The math follows a clear, industry-standard model. First, the transfer fee equals the current balance multiplied by the transfer fee percentage (for example, 3% of $5,000 is $150), which becomes your new starting balance on the promo card. During the promotional period the APR is 0%, so every payment reduces principal directly. Once the promo ends, any remaining balance accrues interest at the regular APR. The calculator simulates each payment until the balance reaches zero under both the transfer scenario and the keep-current scenario, summing total interest for each. Total savings are then calculated as the cost of keeping the balance minus the cost of transferring. The layout groups inputs logically: normal-tier fields set your balance, current APR, promo APR, and promo length, while Advanced Options add the transfer terms (transfer fee, regular APR, monthly payment) and a comparison toggle showing what happens if you simply keep your current card.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Pay Off Debt Faster</h2>
              <p className="text-muted-foreground leading-relaxed">
                The fastest path out of credit card debt is to maximize principal reduction during the interest-free window. Set your monthly payment high enough to clear the entire transferred balance before the promo period ends; divide the new starting balance by the number of promo months to find the minimum aggressive payment. Automate that payment so a missed due date never triggers a penalty APR. Stop using the old card entirely and avoid new purchases on the transfer card, since those accrue interest at the regular rate. If you cannot pay off the full balance in time, the regular APR comparison in the results shows exactly how much extra interest you will owe, helping you decide whether to increase payments or seek a lower-rate personal loan. Run several scenarios with the calculator to find the payment plan that saves the most money.
              </p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/balance-transfer-calculator" />
          <PopularCalculators exclude="/calculator/balance-transfer-calculator" />
        </div>
      </div>
    </>
  );
};

export default BalanceTransferCalculator;
