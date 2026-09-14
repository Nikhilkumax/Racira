"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface RentalInputs {
  days: number;
  dailyCost: number;
  carValue: number;
  deductible: number;
  incidentPct: number;
  cardCovers: boolean;
}

interface RentalResult {
  insuranceCost: number;
  oopPerIncident: number;
  expectedDecline: number;
  breakevenDaily: number;
  recommended: "decline" | "buy" | "equal";
  savings: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcRentalInsurance(inp: RentalInputs): RentalResult {
  const insuranceCost = inp.days * inp.dailyCost;
  const oopPerIncident = inp.cardCovers ? 0 : inp.deductible;
  const expectedDecline = (inp.incidentPct / 100) * oopPerIncident;
  const breakevenDaily = inp.days > 0 ? expectedDecline / inp.days : 0;

  let recommended: RentalResult["recommended"] = "decline";
  let savings = insuranceCost - expectedDecline;
  if (Math.abs(insuranceCost - expectedDecline) < 0.5) {
    recommended = "equal";
    savings = 0;
  } else if (expectedDecline > insuranceCost) {
    recommended = "buy";
    savings = expectedDecline - insuranceCost;
  }

  const fmtCur = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

  const breakdown = [
    { label: "Rental Duration", value: `${inp.days} days` },
    { label: "Rental Insurance Cost", value: `${fmtCur(inp.dailyCost)}/day` },
    { label: "Total Rental Insurance Cost", value: fmtCur(insuranceCost) },
    { label: "Rental Car Value", value: fmtCur(inp.carValue) },
    { label: "Your Deductible (if you claim)", value: fmtCur(inp.deductible) },
    { label: "Credit Card Rental CDW", value: inp.cardCovers ? "Yes — card covers damage & deductible" : "No — rely on your own policy" },
    { label: "Chance of Claimable Incident", value: `${inp.incidentPct.toFixed(1)}% per trip` },
    { label: "Expected Out-of-Pocket if You Decline", value: fmtCur(expectedDecline), highlight: true },
    { label: "Breakeven Daily Insurance Price", value: `${fmtCur(breakevenDaily)}/day` },
    { label: "Recommended Option", value: recommended === "decline" ? "Decline — decline is cheaper in expectation" : recommended === "buy" ? "Buy — expected risk exceeds the premium" : "Either option", highlight: true },
  ];

  const summaryStats = [
    { label: "Total Insurance Cost", value: fmtCur(insuranceCost) },
    { label: "Out-of-Pocket per Incident", value: fmtCur(oopPerIncident) },
    { label: "Chance of Incident", value: `${inp.incidentPct.toFixed(1)}%` },
    { label: "Expected Cost If You Decline", value: fmtCur(expectedDecline) },
    { label: "Breakeven Daily Price", value: `${fmtCur(breakevenDaily)}/day` },
    { label: recommended === "decline" ? "Expected Savings by Declining" : recommended === "buy" ? "Expected Loss Avoided by Buying" : "Options Are Equal", value: fmtCur(savings) },
    { label: "Rental Car Value", value: fmtCur(inp.carValue) },
    { label: "Your Deductible", value: fmtCur(inp.deductible) },
  ];

  return {
    insuranceCost, oopPerIncident, expectedDecline, breakevenDaily,
    recommended, savings, breakdown, summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: RentalInputs = {
  days: 7,
  dailyCost: 25,
  carValue: 35000,
  deductible: 1000,
  incidentPct: 2,
  cardCovers: false,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function CarRentalInsuranceValueCalculator() {
  const [days, setDays] = useState(String(DEFAULTS.days));
  const [dailyCost, setDailyCost] = useState(String(DEFAULTS.dailyCost));
  const [carValue, setCarValue] = useState(String(DEFAULTS.carValue));
  const [deductible, setDeductible] = useState(String(DEFAULTS.deductible));
  const [incidentPct, setIncidentPct] = useState(String(DEFAULTS.incidentPct));
  const [cardCovers, setCardCovers] = useState<string>("no");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<RentalResult>(() => calcRentalInsurance(DEFAULTS));

  useEffect(() => { setResult(calcRentalInsurance(DEFAULTS)); }, []);

  const getInputs = (): RentalInputs => ({
    days: parseFloat(days) || 0,
    dailyCost: parseFloat(dailyCost) || 0,
    carValue: parseFloat(carValue) || 0,
    deductible: parseFloat(deductible) || 0,
    incidentPct: parseFloat(incidentPct) || 0,
    cardCovers: cardCovers === "yes",
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const d = parseFloat(days) || 0;
  const price = parseFloat(dailyCost) || 0;
  const value = parseFloat(carValue) || 0;
  const ded = parseFloat(deductible) || 0;
  const pct = parseFloat(incidentPct) || 0;
  if (d < 1 || d > 90) errors.days = "Rental duration must be 1–90 days.";
  if (price < 0 || price > 200) errors.dailyCost = "Daily insurance cost must be $0–$200.";
  if (value <= 0) errors.carValue = "Rental car value must be greater than 0.";
  if (ded < 0) errors.deductible = "Deductible cannot be negative.";
  if (pct < 0 || pct > 50) errors.incidentPct = "Incident chance must be 0–50%.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcRentalInsurance(getInputs())); };

  const reset = () => {
    setDays(String(DEFAULTS.days));
    setDailyCost(String(DEFAULTS.dailyCost));
    setCarValue(String(DEFAULTS.carValue));
    setDeductible(String(DEFAULTS.deductible));
    setIncidentPct(String(DEFAULTS.incidentPct));
    setCardCovers("no");
    setResult(calcRentalInsurance(DEFAULTS));
  };

  const faqs = [
    { question: "Is rental car insurance worth buying?", answer: "It depends entirely on what coverage you already have. If your own auto policy extends collision and comprehensive coverage to rental cars, or your credit card provides rental CDW, the rental counter's collision damage waiver is usually redundant — you are paying $20–$40 per day to insure against a risk you already carry. If you have neither, the waiver can be rational: one at-fault collision without coverage can cost thousands. The calculator compares the premium against the expected cost of self-insuring based on your deductible and your credit card benefits." },
    { question: "What does credit card rental CDW actually cover?", answer: "Most premium credit cards provide secondary rental car collision damage waiver: you decline the counter's CDW, and if the rental car is damaged or stolen, you first claim your own auto insurance and the card reimburses your deductible and any damage not covered. A smaller set of cards offers primary coverage, which pays first without touching your auto policy. Card CDW generally does not cover liability, personal injury, loss of use, or administrative fees, which is why even cardholders sometimes add supplemental liability coverage." },
    { question: "Why is the recommended option based on expected cost?", answer: "Insurance is a bet, and the fair comparison is expected value: the probability of a claim multiplied by what you would pay out-of-pocket if one happens. With a $1,000 deductible and a 2 percent chance of an incident per trip, the expected cost of declining is about $20 — far less than a $175 seven-day waiver. That logic flips only when your chance of damage is high or your out-of-pocket exposure is large, which is what happens if you have no personal coverage at all." },
    { question: "What should I do if my own insurance does not cover rentals?", answer: "If neither your auto policy nor your credit card covers rental damage, you are fully exposed, and the expected-cost math changes dramatically: a 2 percent chance of a $35,000 loss is an expected $700 per trip, which justifies buying the counter coverage. You can model exactly that by setting your deductible to the full car value and your credit card CDW to no in the Advanced Options — the calculator will show the waiver as the cheaper choice." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Car Rental Insurance Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Rental Insurance Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cri-days" className="text-sm font-medium mb-1 block">Rental Duration (days)</label>
                  <div className={inp}><input id="cri-days" type="number" value={days} onChange={(e) => setDays(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">d</span></div>
                  {errors.days && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.days}</p>}
                </div>
                <div>
                  <label htmlFor="cri-cost" className="text-sm font-medium mb-1 block">Rental Insurance Cost ($/day)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="cri-cost" type="number" value={dailyCost} onChange={(e) => setDailyCost(e.target.value)} className={ci} /></div>
                  {errors.dailyCost && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.dailyCost}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cri-value" className="text-sm font-medium mb-1 block">Rental Car Value ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="cri-value" type="number" value={carValue} onChange={(e) => setCarValue(e.target.value)} className={ci} /></div>
                  {errors.carValue && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.carValue}</p>}
                </div>
                <div>
                  <label htmlFor="cri-ded" className="text-sm font-medium mb-1 block">Your Deductible if You Claim ($)</label>
                  <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input id="cri-ded" type="number" value={deductible} onChange={(e) => setDeductible(e.target.value)} className={ci} /></div>
                  {errors.deductible && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.deductible}</p>}
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
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Risk &amp; Coverage Details</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="cri-pct" className="text-sm font-medium mb-1 block">Chance of Incident per Trip (%)</label>
                          <div className={inp}><input id="cri-pct" type="number" value={incidentPct} onChange={(e) => setIncidentPct(e.target.value)} step="0.5" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                          {errors.incidentPct && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.incidentPct}</p>}
                        </div>
                        <div>
                          <label htmlFor="cri-cc" className="text-sm font-medium mb-1 block">Credit Card Rental CDW</label>
                          <select id="cri-cc" value={cardCovers} onChange={(e) => setCardCovers(e.target.value)} className={sel}>
                            <option value="no">No — I&apos;d claim my own policy</option>
                            <option value="yes">Yes — card covers damage &amp; deductible</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">With card CDW, the card reimburses your damage and deductible after your own policy responds, so your expected out-of-pocket drops toward zero. If you have no coverage at all, set your deductible to the full car value.</p>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.recommended === "decline" ? "Savings by Declining Coverage" : result.recommended === "buy" ? "Expected Loss Avoided by Buying" : "Both Options Cost About the Same"}</div>
              <div className={`text-4xl font-extrabold tracking-tight ${result.recommended === "decline" ? "text-emerald-600" : result.recommended === "buy" ? "text-amber-500" : "text-foreground"}`}>${Math.round(result.savings).toLocaleString("en-US")}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.recommended === "decline" ? `Total waiver costs $${Math.round(result.insuranceCost).toLocaleString("en-US")}, but your expected out-of-pocket is only $${Math.round(result.expectedDecline).toLocaleString("en-US")}` : result.recommended === "buy" ? `Expected out-of-pocket of $${Math.round(result.expectedDecline).toLocaleString("en-US")} exceeds the $${Math.round(result.insuranceCost).toLocaleString("en-US")} waiver` : "Expected risk roughly equals the waiver premium"}</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Waiver Cost", `$${Math.round(result.insuranceCost).toLocaleString("en-US")}`],
                ["Expected Cost If Declining", `$${Math.round(result.expectedDecline).toLocaleString("en-US")}`],
                ["Breakeven Daily Price", `$${result.breakevenDaily.toFixed(2)}/day`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Coverage Decision Breakdown</h3>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Car Rental Insurance Value Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A car rental insurance value calculator helps you decide whether to buy the collision damage waiver at the rental counter — the daily add-on that releases you from financial responsibility if the rental car is damaged or stolen. The counter pitch makes it sound essential, but the answer depends on what coverage you already carry. If your personal auto policy extends collision and comprehensive coverage to rental cars, or your credit card provides rental CDW, you may be paying $175 or more for a week of coverage that duplicates protection you already own. If you have neither, declining the waiver leaves you fully exposed to repair or replacement costs that can reach tens of thousands of dollars. This tool puts a number on both sides: the total cost of the counter coverage for your rental period, and the expected out-of-pocket cost of declining it, which combines your deductible, your credit card benefits, and a realistic chance that something happens. The result is a clear recommendation — decline and keep the money, or buy the waiver because the risk genuinely justifies it — built on your situation rather than the rental agent's.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How the Value of Rental Insurance Is Calculated</h2>
              <p className="text-muted-foreground leading-relaxed">The calculation compares two numbers. The first is simple: the total cost of buying the rental insurance is the daily rate multiplied by the number of days you rent. The second is an expected value — the mathematically fair price of self-insuring. Start with what you would actually pay out-of-pocket if the rental car were damaged and you had declined the waiver. If your credit card provides rental CDW, the card typically pays your claim and reimburses your deductible after your own auto policy responds, so that out-of-pocket figure drops to effectively zero. Without card coverage, your exposure is the deductible on your own policy — the amount you pay before your insurer covers the damage. That out-of-pocket amount is then multiplied by the probability that a claimable incident actually occurs during your trip, entered as the chance per rental in Advanced Options. The product is the expected cost of declining: not what an accident would cost you, but what the risk of one is worth in expected terms. A 2 percent chance of a $1,000 deductible is an expected $20 of exposure. The calculator compares that expected cost against the total waiver premium. When the premium exceeds the expected risk, declining is the value play and the difference is your expected savings; when the expected risk exceeds the premium — the situation of a renter with no personal coverage at all — buying is the rational choice. The breakeven daily price is the expected risk spread across each day of the rental, giving you a simple benchmark: if the counter charges more than that per day, you are overpaying for the protection.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The headline is the recommendation — decline or buy — expressed as the dollars you stand to save or the loss you avoid, with the total waiver cost, expected risk, and breakeven daily price alongside. The defaults describe the most common traveler: a seven-day rental at $25 per day for the waiver, a $35,000 car, a $1,000 auto deductible, no credit card CDW, and a 2 percent chance of an incident. The waiver costs $175, while the expected out-of-pocket from declining is about $20 — a $155 expected saving, so the calculator recommends declining. Try the scenarios that change the verdict: turn credit card CDW on and your expected risk drops to zero; more importantly, if your own policy does not cover rentals at all, set the deductible to the full car value in the breakdown scenario described in the FAQ, and the waiver instantly becomes the cheaper choice because a 2 percent chance of a $35,000 loss dwarfs any daily premium. Remember that expected value is a long-run average — it does not tell you whether an accident will happen on this trip, only what the coverage is fairly worth — so pair the math with your own risk tolerance and any card benefits you have not yet verified with your issuer.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-rental-insurance-value-calculator" />
          <PopularCalculators exclude="/calculator/car-rental-insurance-value-calculator" />
        </div>
      </div>
    </>
  );
}
