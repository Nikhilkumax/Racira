"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface CompareInputs {
  itemPrice: number;
  apr: number;
  cardMonths: number;
  layawayWeeks: number;
  downPaymentPct: number;
  layawayFee: number;
}

interface CompareResult {
  downPayment: number;
  financed: number;
  cardMonthly: number;
  cardInterest: number;
  cardTotal: number;
  layawayWeekly: number;
  layawayFee: number;
  layawayTotal: number;
  cheaper: "layaway" | "card" | "tie";
  savings: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcLayawayCompare(inp: CompareInputs): CompareResult {
  const downPayment = inp.itemPrice * (inp.downPaymentPct / 100);
  const financed = Math.max(inp.itemPrice - downPayment, 0);

  const r = inp.apr / 100 / 12;
  const cardMonthly = r > 0 && financed > 0
    ? (financed * r * Math.pow(1 + r, inp.cardMonths)) / (Math.pow(1 + r, inp.cardMonths) - 1)
    : financed / inp.cardMonths;
  const cardTotal = downPayment + cardMonthly * inp.cardMonths;
  const cardInterest = cardMonthly * inp.cardMonths - financed;

  const layawayWeekly = inp.layawayWeeks > 0 ? financed / inp.layawayWeeks : 0;
  const layawayTotal = inp.itemPrice + inp.layawayFee;

  const cheaper: CompareResult["cheaper"] = Math.abs(cardTotal - layawayTotal) < 0.5 ? "tie" : (layawayTotal < cardTotal ? "layaway" : "card");
  const savings = Math.abs(cardTotal - layawayTotal);

  const fmtCur = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

  const breakdown = [
    { label: "Item Price", value: fmtCur(inp.itemPrice) },
    { label: `Down Payment (${inp.downPaymentPct}%)`, value: fmtCur(downPayment) },
    { label: "Amount Paid Over Time", value: fmtCur(financed) },
    { label: "Credit Card APR", value: `${inp.apr.toFixed(2)}%` },
    { label: `Card Payment — ${inp.cardMonths} Months`, value: `${fmtCur(cardMonthly)}/mo` },
    { label: "Credit Card Interest", value: fmtCur(cardInterest) },
    { label: "Total Cost — Credit Card", value: fmtCur(cardTotal) },
    { label: `Layaway Payment — ${inp.layawayWeeks} Weeks`, value: `${fmtCur(layawayWeekly)}/wk` },
    { label: "Layaway Service Fee", value: fmtCur(inp.layawayFee) },
    { label: "Total Cost — Layaway", value: fmtCur(layawayTotal) },
    { label: cheaper === "layaway" ? "Savings With Layaway" : cheaper === "card" ? "Savings With Credit Card" : "Costs Are Nearly Equal", value: cheaper === "tie" ? "≈ Equal" : fmtCur(savings), highlight: true },
    { label: "Recommended Option", value: cheaper === "layaway" ? "Layaway — pay as you go" : cheaper === "card" ? "Credit card — pay after delivery" : "Either option", highlight: true },
  ];

  const summaryStats = [
    { label: "Down Payment", value: fmtCur(downPayment) },
    { label: "Credit Card Monthly Payment", value: fmtCur(cardMonthly) },
    { label: "Credit Card Total Interest", value: fmtCur(cardInterest) },
    { label: "Total Cost — Credit Card", value: fmtCur(cardTotal) },
    { label: "Layaway Weekly Payment", value: fmtCur(layawayWeekly) },
    { label: "Layaway Service Fee", value: fmtCur(inp.layawayFee) },
    { label: "Total Cost — Layaway", value: fmtCur(layawayTotal) },
    { label: "Potential Savings", value: fmtCur(savings) },
  ];

  return {
    downPayment, financed, cardMonthly, cardInterest, cardTotal,
    layawayWeekly, layawayFee: inp.layawayFee, layawayTotal, cheaper, savings, breakdown, summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: CompareInputs = {
  itemPrice: 1200,
  apr: 24,
  cardMonths: 6,
  layawayWeeks: 8,
  downPaymentPct: 20,
  layawayFee: 10,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function LayawayVsCreditCardComparisonCalculator() {
  const [itemPrice, setItemPrice] = useState(String(DEFAULTS.itemPrice));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [cardMonths, setCardMonths] = useState(String(DEFAULTS.cardMonths));
  const [layawayWeeks, setLayawayWeeks] = useState(String(DEFAULTS.layawayWeeks));
  const [downPaymentPct, setDownPaymentPct] = useState(String(DEFAULTS.downPaymentPct));
  const [layawayFee, setLayawayFee] = useState(String(DEFAULTS.layawayFee));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<CompareResult>(() => calcLayawayCompare(DEFAULTS));

  useEffect(() => { setResult(calcLayawayCompare(DEFAULTS)); }, []);

  const getInputs = (): CompareInputs => ({
    itemPrice: parseFloat(itemPrice) || 0,
    apr: parseFloat(apr) || 0,
    cardMonths: parseInt(cardMonths) || 6,
    layawayWeeks: parseInt(layawayWeeks) || 8,
    downPaymentPct: parseFloat(downPaymentPct) || 0,
    layawayFee: parseFloat(layawayFee) || 0,
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const price = parseFloat(itemPrice) || 0;
  const rate = parseFloat(apr) || 0;
  const dp = parseFloat(downPaymentPct) || 0;
  const fee = parseFloat(layawayFee) || 0;
  if (price <= 0) errors.itemPrice = "Item price must be greater than 0.";
  if (rate < 1 || rate > 40) errors.apr = "APR must be between 1% and 40%.";
  if (dp < 0 || dp > 90) errors.downPayment = "Down payment must be 0–90%.";
  if (fee < 0) errors.fee = "Layaway fee cannot be negative.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcLayawayCompare(getInputs())); };

  const reset = () => {
    setItemPrice(String(DEFAULTS.itemPrice));
    setApr(String(DEFAULTS.apr));
    setCardMonths(String(DEFAULTS.cardMonths));
    setLayawayWeeks(String(DEFAULTS.layawayWeeks));
    setDownPaymentPct(String(DEFAULTS.downPaymentPct));
    setLayawayFee(String(DEFAULTS.layawayFee));
    setResult(calcLayawayCompare(DEFAULTS));
  };

  const faqs = [
    { question: "When is layaway actually cheaper than a credit card?", answer: "Layaway wins whenever its service fee is smaller than the interest you would pay carrying the purchase on a card. In the default example — a $1,200 item, a $10 layaway fee, and a card at 24% APR paid off over six months — the card adds roughly $68 of interest, so layaway saves about $58. Layaway also wins for shoppers who cannot qualify for a 0% promotional offer, because it never charges interest no matter how long the plan runs." },
    { question: "What are the hidden costs of layaway?", answer: "Retailers vary: some charge a flat service fee, others a percentage of the item price, and many add a cancellation fee if you change your mind before the final payment. Plans also typically hold the merchandise until it is paid in full, so you take delivery later, and your down payment may be refundable only as store credit. Factor the service fee and any cancellation terms into the comparison before committing." },
    { question: "When does the credit card win?", answer: "A card wins when you can pay the statement in full before interest accrues — within the grace period or during a 0% promotional window — because the financing then costs nothing while you keep the item immediately and earn rewards or purchase protection. The calculator assumes you spread the purchase over the payoff period you choose at the card's regular APR, which matches the reality for shoppers who cannot pay in full right away." },
    { question: "Does the down payment change the comparison?", answer: "Both options assume you make the same down payment, so it does not favor either side; it simply reduces the amount financed or spread over weekly payments. You can adjust the down payment in Advanced Options to see how a larger deposit shrinks the credit card interest and the layaway weekly payment equally. What the calculator does not price is the opportunity cost of tying cash up in either plan." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Layaway vs Credit Card Comparison Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Layaway vs Credit Card Comparison Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lay-price" className="text-sm font-medium mb-1 block">Item Price ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="lay-price" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} className={ci} /></div>
                  {errors.itemPrice && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.itemPrice}</p>}
                </div>
                <div>
                  <label htmlFor="lay-apr" className="text-sm font-medium mb-1 block">Credit Card APR (%)</label>
                  <div className={inp}><input id="lay-apr" type="number" value={apr} onChange={(e) => setApr(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                  {errors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.apr}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lay-months" className="text-sm font-medium mb-1 block">Card Payoff Period</label>
                  <select id="lay-months" value={cardMonths} onChange={(e) => setCardMonths(e.target.value)} className={sel}>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="9">9 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="lay-weeks" className="text-sm font-medium mb-1 block">Layaway Term</label>
                  <select id="lay-weeks" value={layawayWeeks} onChange={(e) => setLayawayWeeks(e.target.value)} className={sel}>
                    <option value="4">4 weeks</option>
                    <option value="6">6 weeks</option>
                    <option value="8">8 weeks</option>
                    <option value="10">10 weeks</option>
                    <option value="12">12 weeks</option>
                  </select>
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
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Layaway Terms</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="lay-dp" className="text-sm font-medium mb-1 block">Down Payment (%)</label>
                          <div className={inp}><input id="lay-dp" type="number" value={downPaymentPct} onChange={(e) => setDownPaymentPct(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                          {errors.downPayment && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.downPayment}</p>}
                        </div>
                        <div>
                          <label htmlFor="lay-fee" className="text-sm font-medium mb-1 block">Layaway Service Fee ($)</label>
                          <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="lay-fee" type="number" value={layawayFee} onChange={(e) => setLayawayFee(e.target.value)} className={ci} /></div>
                          {errors.fee && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.fee}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">The same down payment applies in both scenarios. Some retailers charge a percentage fee instead of a flat one — check your plan&apos;s terms.</p>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.cheaper === "layaway" ? "Layaway Is Cheaper" : result.cheaper === "card" ? "Credit Card Is Cheaper" : "Costs Are Nearly Equal"}</div>
              <div className={`text-4xl font-extrabold tracking-tight ${result.cheaper === "layaway" ? "text-emerald-600" : result.cheaper === "card" ? "text-amber-500" : "text-foreground"}`}>${Math.round(result.savings).toLocaleString("en-US")}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.cheaper === "tie" ? "Both options cost about the same — choose on convenience" : `in savings vs total cost of $${Math.round(result.cheaper === "layaway" ? result.cardTotal : result.layawayTotal).toLocaleString("en-US")}`}</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Layaway Total Cost", `$${Math.round(result.layawayTotal).toLocaleString("en-US")}`],
                ["Credit Card Total Cost", `$${Math.round(result.cardTotal).toLocaleString("en-US")}`],
                ["Credit Card Interest", `$${Math.round(result.cardInterest).toLocaleString("en-US")}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cost Comparison Breakdown</h3>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Layaway vs Credit Card Comparison Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A layaway vs credit card comparison calculator answers a practical shopping question: when a big purchase is on the table and you cannot pay in full today, is it cheaper to reserve it through a store layaway plan or put it on a credit card and pay the balance down over time? Layaway programs let you make a down payment and then pay the item off in weekly installments before taking it home, usually for a flat service fee. A credit card lets you take the item home immediately but charges interest on any balance carried past the grace period. Each option has a price — the layaway fee on one side, the credit card interest on the other — and that price depends entirely on the numbers you plug in: how long you spread the payments, what rate your card charges, and what the store charges to run the layaway. This tool lays both plans side by side with identical down payments, computes the true total cost of each, and tells you which one saves money and by how much. It is aimed at shoppers comparing holiday layaway programs, furniture store plans, or big-ticket electronics against the reality of a card balance they expect to carry for several months.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How the Comparison Is Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">Both scenarios start from the same down payment, expressed as a percentage of the item price, so the comparison isolates the financing difference rather than your available cash. The amount paid over time is the item price minus the down payment. On the layaway side, that remaining amount is divided evenly across the weekly payments in the term you choose, and the total cost of the layaway is simply the full item price plus the store's service fee — layaway never charges interest, no matter how long the plan runs. On the credit card side, the remaining amount is financed at your card's APR, and the calculator sizes an equal monthly payment that retires the balance within the payoff period you select, using the standard amortization formula that spreads principal and interest across the months. The total credit card cost is the down payment plus all monthly payments, and the interest is whatever that total adds beyond the amount financed. The two totals — layaway versus credit card — are then compared directly. Whichever is lower wins, and the difference is the savings from choosing it. Because both sides assume the same down payment and the same purchase price, the entire comparison reduces to layaway fees versus credit card interest, which is exactly the trade-off a shopper should be weighing. A card paid in full within its grace period or during a zero-percent promotional window costs nothing and always beats a layaway fee, while a card carried at a high rate for many months quickly overwhelms even a generous layaway program.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The headline result is the cheaper option and the dollar savings it delivers, with the two total costs and the credit card interest shown in the stat bar. The defaults describe a typical case: a $1,200 purchase with a 20 percent down payment, an eight-week layaway plan carrying a $10 fee, and a 24 percent APR card paid off over six months. The layaway costs $1,210 in total; the card costs about $1,268 including roughly $68 of interest — so layaway saves around $58. The breakdown table shows every number behind both totals, and the summary statistics condense the comparison into weekly and monthly payment terms. Experiment with the levers that matter most: the card payoff period is the biggest swing factor, since stretching from six to twelve months roughly doubles the interest and can flip the recommendation; the layaway term only changes your weekly payment, never the total, because layaway carries no interest. Also remember what the tool does not price — the layaway plan holds the merchandise until paid in full, while a card delivers it today with possible rewards and purchase protection — so when the dollar difference is small, those convenience factors can legitimately break the tie.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/layaway-vs-credit-card-comparison-calculator" />
          <PopularCalculators exclude="/calculator/layaway-vs-credit-card-comparison-calculator" />
        </div>
      </div>
    </>
  );
}
