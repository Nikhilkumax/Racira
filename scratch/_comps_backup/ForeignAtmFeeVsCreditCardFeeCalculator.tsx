"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface AtmInputs {
  atmCash: number;
  atmWithdrawals: number;
  cardSpend: number;
  cardFeePct: number;
  atmFlatFee: number;
  atmFxMarkupPct: number;
}

interface AtmResult {
  totalBudget: number;
  atmFxCost: number;
  atmFlatTotal: number;
  atmTotalFees: number;
  cardTotalFees: number;
  totalFees: number;
  avgFeeRatePct: number;
  atmEffRatePct: number;
  cardEffRatePct: number;
  cheaperMethod: "ATM withdrawals" | "Credit card" | "Equal";
  atmPer100: number;
  breakevenWithdrawal: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcAtm(inp: AtmInputs): AtmResult {
  const totalBudget = inp.atmCash + inp.cardSpend;
  const atmFxCost = inp.atmCash * (inp.atmFxMarkupPct / 100);
  const atmFlatTotal = inp.atmWithdrawals * inp.atmFlatFee;
  const atmTotalFees = atmFxCost + atmFlatTotal;
  const cardTotalFees = inp.cardSpend * (inp.cardFeePct / 100);
  const totalFees = atmTotalFees + cardTotalFees;
  const avgFeeRatePct = totalBudget > 0 ? (totalFees / totalBudget) * 100 : 0;
  const atmEffRatePct = inp.atmCash > 0 ? (atmTotalFees / inp.atmCash) * 100 : 0;
  const cardEffRatePct = inp.cardSpend > 0 ? (cardTotalFees / inp.cardSpend) * 100 : 0;
  const cheaperMethod: AtmResult["cheaperMethod"] =
    atmEffRatePct < cardEffRatePct && atmTotalFees > 0 ? "ATM withdrawals"
      : cardEffRatePct < atmEffRatePct && cardTotalFees > 0 ? "Credit card"
        : atmEffRatePct === cardEffRatePct ? "Equal"
          : atmTotalFees <= cardTotalFees ? "ATM withdrawals" : "Credit card";
  const atmPer100 = inp.atmCash > 0 ? (atmTotalFees / inp.atmCash) * 100 : 0;
  const breakevenWithdrawal =
    inp.cardFeePct > inp.atmFxMarkupPct && inp.atmFlatFee > 0
      ? (inp.atmFlatFee * 100) / (inp.cardFeePct - inp.atmFxMarkupPct)
      : 0;

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

  const breakdown = [
    { label: "Trip Spend (Cash + Card)", value: `$${fmtInt(totalBudget)}` },
    { label: "ATM Cash Withdrawn", value: `$${fmtInt(inp.atmCash)}` },
    { label: `ATM FX Markup (${inp.atmFxMarkupPct}%)`, value: `$${fmt(atmFxCost)}` },
    { label: `ATM Flat Fees (${Math.round(inp.atmWithdrawals)} × $${inp.atmFlatFee.toFixed(2)})`, value: `$${fmt(atmFlatTotal)}` },
    { label: "Total ATM Fees", value: `$${fmt(atmTotalFees)}`, highlight: true },
    { label: "ATM Fee per $100", value: `$${atmPer100.toFixed(2)}` },
    { label: "Credit Card Spend", value: `$${fmtInt(inp.cardSpend)}` },
    { label: `Card Foreign Transaction Fee (${inp.cardFeePct}%)`, value: `$${fmt(cardTotalFees)}` },
    { label: "Total Foreign Fees", value: `$${fmt(totalFees)}`, highlight: true },
    { label: "Average Fee Rate", value: `${avgFeeRatePct.toFixed(2)}% of trip spend` },
    { label: "Cheaper Method", value: cheaperMethod === "Equal" ? "Equal" : cheaperMethod },
    { label: "Break-Even ATM Withdrawal", value: breakevenWithdrawal > 0 ? `$${fmtInt(breakevenWithdrawal)}` : "—" },
  ];

  const summaryStats = [
    { label: "Total Fees", value: `$${fmt(totalFees)}` },
    { label: "ATM Fees", value: `$${fmt(atmTotalFees)}` },
    { label: "Card Fees", value: `$${fmt(cardTotalFees)}` },
    { label: "Avg Fee Rate", value: `${avgFeeRatePct.toFixed(2)}%` },
    { label: "ATM Fee per $100", value: `$${atmPer100.toFixed(2)}` },
    { label: "Card Effective Rate", value: `${cardEffRatePct.toFixed(2)}%` },
    { label: "Break-Even Withdrawal", value: breakevenWithdrawal > 0 ? `$${fmtInt(breakevenWithdrawal)}` : "—" },
    { label: "Cheaper Method", value: cheaperMethod },
  ];

  return {
    totalBudget, atmFxCost, atmFlatTotal, atmTotalFees, cardTotalFees, totalFees,
    avgFeeRatePct, atmEffRatePct, cardEffRatePct, cheaperMethod, atmPer100,
    breakevenWithdrawal, breakdown, summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: AtmInputs = {
  atmCash: 600,
  atmWithdrawals: 2,
  cardSpend: 1400,
  cardFeePct: 3,
  atmFlatFee: 4.5,
  atmFxMarkupPct: 2,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function ForeignAtmFeeVsCreditCardFeeCalculator() {
  const [atmCash, setAtmCash] = useState(String(DEFAULTS.atmCash));
  const [atmWithdrawals, setAtmWithdrawals] = useState(String(DEFAULTS.atmWithdrawals));
  const [cardSpend, setCardSpend] = useState(String(DEFAULTS.cardSpend));
  const [cardFeePct, setCardFeePct] = useState(String(DEFAULTS.cardFeePct));
  const [atmFlatFee, setAtmFlatFee] = useState(String(DEFAULTS.atmFlatFee));
  const [atmFxMarkupPct, setAtmFxMarkupPct] = useState(String(DEFAULTS.atmFxMarkupPct));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<AtmResult>(() => calcAtm(DEFAULTS));

  useEffect(() => { setResult(calcAtm(DEFAULTS)); }, []);

  const getInputs = (): AtmInputs => ({
    atmCash: parseFloat(atmCash) || 0,
    atmWithdrawals: parseInt(atmWithdrawals) || 0,
    cardSpend: parseFloat(cardSpend) || 0,
    cardFeePct: parseFloat(cardFeePct) || 0,
    atmFlatFee: parseFloat(atmFlatFee) || 0,
    atmFxMarkupPct: parseFloat(atmFxMarkupPct) || 0,
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const cash = parseFloat(atmCash) || 0;
  const withdrawals = parseInt(atmWithdrawals) || 0;
  const spend = parseFloat(cardSpend) || 0;
  const cardFee = parseFloat(cardFeePct) || 0;
  const flat = parseFloat(atmFlatFee) || 0;
  const markup = parseFloat(atmFxMarkupPct) || 0;
  if (cash < 0) errors.cash = "ATM cash cannot be negative.";
  if (cash === 0 && spend === 0) errors.cash = "Enter a trip spend amount (cash or card).";
  if (cash > 0 && withdrawals < 1) errors.withdrawals = "Enter at least 1 withdrawal when withdrawing cash.";
  if (withdrawals > 50) errors.withdrawals = "Withdrawal count looks too high (max 50).";
  if (spend < 0) errors.spend = "Card spend cannot be negative.";
  if (cardFee < 0 || cardFee > 10) errors.cardFee = "Card fee must be 0–10%.";
  if (flat < 0) errors.flat = "ATM flat fee cannot be negative.";
  if (markup < 0 || markup > 15) errors.markup = "ATM FX markup must be 0–15%.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcAtm(getInputs())); };

  const reset = () => {
    setAtmCash(String(DEFAULTS.atmCash));
    setAtmWithdrawals(String(DEFAULTS.atmWithdrawals));
    setCardSpend(String(DEFAULTS.cardSpend));
    setCardFeePct(String(DEFAULTS.cardFeePct));
    setAtmFlatFee(String(DEFAULTS.atmFlatFee));
    setAtmFxMarkupPct(String(DEFAULTS.atmFxMarkupPct));
    setResult(calcAtm(DEFAULTS));
  };

  const feeColor = result.avgFeeRatePct <= 1 ? "text-emerald-600" : result.avgFeeRatePct <= 3 ? "text-amber-500" : "text-red-500";

  const faqs = [
    { question: "Why do foreign ATM withdrawals cost more than the advertised exchange rate?", answer: "Two separate charges stack up. First, your bank usually applies a foreign transaction fee — often 1–3% of the withdrawal — plus a flat fee per withdrawal of $2–$5. Second, the exchange rate itself may carry a markup of 1–3% over the mid-market rate. The calculator separates the flat fee, the FX markup, and the card foreign transaction fee so you can see each cost." },
    { question: "Is it cheaper to use a credit card or ATM withdrawals abroad?", answer: "It depends on the rates your cards carry. A card with no foreign transaction fee is almost always the cheapest way to pay abroad. When your card does charge a fee, ATM withdrawals can win for large single withdrawals — because the flat fee is spread over more cash — but lose for small ones. The break-even withdrawal size in the results tells you the crossover point for your specific fees." },
    { question: "What is dynamic currency conversion (DCC)?", answer: "Dynamic currency conversion happens when a merchant or ATM offers to charge you in your home currency instead of the local one. The quoted 'convenient' rate typically includes a markup of 3–8%, far above the fee your card would charge. Always choose to pay in the local currency and let your bank do the conversion." },
    { question: "Do travel credit cards really charge 0%?", answer: "Many premium travel cards — such as the Chase Sapphire Preferred and Capital One Venture — charge no foreign transaction fee at all. When paired with a fee-free ATM card (or fee rebates), your effective cost abroad can approach zero. If you travel regularly, the annual fee on such a card is often repaid by the FX savings alone." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Foreign ATM Fee vs Credit Card Fee Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Foreign ATM Fee vs Credit Card Fee Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="atm-cash" className="text-sm font-medium mb-1 block">ATM Cash to Withdraw ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="atm-cash" type="number" value={atmCash} onChange={(e) => setAtmCash(e.target.value)} className={ci} /></div>
                  {errors.cash && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.cash}</p>}
                </div>
                <div>
                  <label htmlFor="atm-count" className="text-sm font-medium mb-1 block">Number of ATM Withdrawals</label>
                  <div className={inp}><input id="atm-count" type="number" value={atmWithdrawals} onChange={(e) => setAtmWithdrawals(e.target.value)} className={ci} /></div>
                  {errors.withdrawals && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.withdrawals}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="atm-card" className="text-sm font-medium mb-1 block">Credit Card Spend ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="atm-card" type="number" value={cardSpend} onChange={(e) => setCardSpend(e.target.value)} className={ci} /></div>
                  {errors.spend && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.spend}</p>}
                </div>
                <div>
                  <label htmlFor="atm-cardfee" className="text-sm font-medium mb-1 block">Card Foreign Transaction Fee (%)</label>
                  <div className={inp}><input id="atm-cardfee" type="number" value={cardFeePct} onChange={(e) => setCardFeePct(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  {errors.cardFee && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.cardFee}</p>}
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                  Advanced Options
                  <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {showAdvanced && (
                  <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">ATM Fees &amp; FX Markup</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="atm-flat" className="text-sm font-medium mb-1 block">ATM Flat Fee per Withdrawal ($)</label>
                          <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="atm-flat" type="number" value={atmFlatFee} onChange={(e) => setAtmFlatFee(e.target.value)} step="0.1" className={ci} /></div>
                          {errors.flat && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.flat}</p>}
                        </div>
                        <div>
                          <label htmlFor="atm-markup" className="text-sm font-medium mb-1 block">ATM FX Markup over Mid-Market (%)</label>
                          <div className={inp}><input id="atm-markup" type="number" value={atmFxMarkupPct} onChange={(e) => setAtmFxMarkupPct(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                          {errors.markup && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.markup}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Includes your bank&apos;s per-withdrawal charge and any local ATM operator surcharge. FX markup is the hidden spread above the mid-market rate.</p>
                    </div>
                  </div>
                )}
              </div>

              {hasErrors && (
                <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                  ⚠️ Please fix the errors above before calculating.
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-1">
                <button type="submit" disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
                <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
              </div>
            </form>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Foreign Transaction Fees</div>
              <div className={`text-4xl font-extrabold tracking-tight ${feeColor}`}>${result.totalFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.avgFeeRatePct.toFixed(2)}% of ${Math.round(result.totalBudget).toLocaleString("en-US")} trip spend · Cheaper method: <span className="font-bold">{result.cheaperMethod}</span></div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["ATM Fees", `$${result.atmTotalFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Card Fees", `$${result.cardTotalFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Break-Even Withdrawal", result.breakevenWithdrawal > 0 ? `$${Math.round(result.breakevenWithdrawal).toLocaleString("en-US")}` : "—"],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Fee Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                    <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                    <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Foreign ATM vs Credit Card Fee Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A foreign ATM vs credit card fee calculator estimates the true cost of spending money abroad by separating the fees attached to each payment method. When you travel, every dollar you spend is subject to a quiet tax: credit cards typically add a foreign transaction fee of one to three percent, ATM withdrawals stack a per-withdrawal flat fee on top of an exchange-rate markup, and merchants or machines may offer dynamic currency conversion that embeds an even larger hidden margin. Most travelers never add these up, which is why a $2,000 trip can quietly cost $60 to $100 in fees that never appear on any receipt. This calculator models a realistic trip as a mix of two behaviors — cash pulled from foreign ATMs and purchases put on a credit card — and computes the fees on each side separately. Beyond the totals, it answers the planning question travelers actually face: given the specific rates on the cards in your wallet, which method is cheaper, and how large should each ATM withdrawal be to minimize the damage from flat per-withdrawal fees? The same math applies whether you are budgeting a weekend in Canada or a month in Southeast Asia.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How Foreign Transaction Fees Are Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">The two methods carry different fee structures, so the calculator models them separately before adding them together. Credit card fees are proportional: the card foreign transaction fee, expressed as a percentage, is applied to everything you charge abroad. ATM costs have three parts. The first is the flat fee your bank charges per withdrawal — often $2 to $5, plus whatever the local ATM operator adds — so the total flat cost is the per-withdrawal fee multiplied by the number of withdrawals you make. The second is the foreign transaction fee your bank applies to cash advances, folded into the markup input. The third is the exchange-rate markup: banks and ATM networks rarely give you the true mid-market rate, instead quoting a rate one to three percent worse, which the calculator models as a percentage applied to the cash amount. Summing the ATM markup cost, the flat withdrawal fees, and the card percentage fee gives your total foreign transaction cost, which is then expressed as a percentage of the overall trip spend so you can judge whether your banking setup is expensive or lean. Because the ATM flat fee is fixed regardless of amount, the calculator also derives the break-even withdrawal size: the cash amount at which the per-dollar cost of an ATM withdrawal equals the per-dollar cost of charging that same amount to your card. Withdraw less than that and the card is cheaper; withdraw more and the ATM wins.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The headline figure is your total foreign transaction fees in dollars, colored by how they compare with your trip size — green when you are paying under one percent of your budget in fees, red when the number climbs past three percent. The three-stat bar splits the total into ATM fees and card fees and shows your break-even withdrawal amount, which is the most actionable number on the page: if you must use cash, withdrawing at least that amount per visit keeps the flat fees from dominating. The breakdown table walks through each charge — ATM exchange markup, flat fees, the card percentage fee — and the summary statistics condense them into effective rates you can compare against other cards you might open. With the default scenario, a $600 in cash taken in two withdrawals plus $1,400 on a card charging three percent produces about $63 of total fees on a $2,000 trip, roughly three percent of the budget. Change the card fee to zero — as many travel cards offer — and the total collapses to the ATM costs alone, which is exactly why the cheapest setup for frequent travelers is a no-foreign-transaction-fee card paired with a bank that rebates ATM fees. The model assumes you are charged in the local currency, so always decline dynamic currency conversion at the terminal, and treat the outputs as planning estimates based on the fee schedules you enter.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/foreign-atm-fee-vs-credit-card-fee-calculator" />
          <PopularCalculators exclude="/calculator/foreign-atm-fee-vs-credit-card-fee-calculator" />
        </div>
      </div>
    </>
  );
}
