"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface InsuranceInputs {
  tripCost: number;     // $
  days: number;
  travelers: number;
  region: string;       // "domestic" | "international"
  plan: string;         // "essential" | "standard" | "premium"
  cfar: boolean;        // cancel for any reason
  adventure: boolean;   // adventure sports coverage
  deductible: number;   // $
}

interface InsuranceResults {
  basePremium: number;
  addonsPremium: number;
  travelerPremium: number;
  deductibleDiscount: number;
  totalPremium: number;
  premiumPerDay: number;
  premiumPct: number;
  medicalCoverage: number;
  tripCoverage: number;
  chartData: { name: string; premium: number; selected: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const PLAN_RATES: Record<string, { rate: number; medical: number; trip: number }> = {
  essential: { rate: 0.0045, medical: 100_000, trip: 10_000 },
  standard: { rate: 0.0055, medical: 250_000, trip: 20_000 },
  premium: { rate: 0.0075, medical: 500_000, trip: 30_000 },
};

const REGION_FACTOR: Record<string, number> = { domestic: 1.0, international: 1.4 };
const DEDUCTIBLE_DISCOUNT: Record<number, number> = { 0: 0, 250: 0.1, 500: 0.2 };

function calcInsurance(i: InsuranceInputs): InsuranceResults {
  const plan = PLAN_RATES[i.plan] ?? PLAN_RATES.standard;
  const regionFactor = REGION_FACTOR[i.region] ?? 1.0;
  const basePremium = i.tripCost * plan.rate * i.days * regionFactor;
  const addonsPremium = (i.cfar ? basePremium * 0.15 : 0) + (i.adventure ? basePremium * 0.2 : 0);
  const travelerPremium = i.travelers > 1 ? basePremium * (1 + 0.9 * (i.travelers - 1)) - basePremium : 0;
  const deductibleDiscount = (basePremium + addonsPremium + travelerPremium) * (DEDUCTIBLE_DISCOUNT[i.deductible] ?? 0);
  const totalPremium = Math.max(0, basePremium + addonsPremium + travelerPremium - deductibleDiscount);
  const premiumPerDay = i.days > 0 ? totalPremium / i.days : 0;
  const premiumPct = i.tripCost > 0 ? (totalPremium / i.tripCost) * 100 : 0;

  const chartData = [
    { name: "Essential", premium: +(i.tripCost * PLAN_RATES.essential.rate * i.days * regionFactor).toFixed(2), selected: i.plan === "essential" },
    { name: "Standard", premium: +(i.tripCost * PLAN_RATES.standard.rate * i.days * regionFactor).toFixed(2), selected: i.plan === "standard" },
    { name: "Premium", premium: +(i.tripCost * PLAN_RATES.premium.rate * i.days * regionFactor).toFixed(2), selected: i.plan === "premium" },
  ];

  const breakdown = [
    { label: "Base Premium", value: `$${basePremium.toFixed(2)}` },
    { label: "Add-ons (CFAR / Adventure)", value: `$${addonsPremium.toFixed(2)}` },
    { label: `Extra Travelers (${Math.max(0, i.travelers - 1)})`, value: `$${travelerPremium.toFixed(2)}` },
    { label: `Deductible Discount ($${i.deductible})`, value: `-$${deductibleDiscount.toFixed(2)}` },
    { label: "Estimated Premium", value: `$${totalPremium.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Medical Coverage", value: `$${plan.medical.toLocaleString()}` },
    { label: "Trip Cancellation Coverage", value: `$${plan.trip.toLocaleString()}` },
  ];

  const summaryStats = [
    { label: "Estimated Premium", value: `$${totalPremium.toFixed(2)}` },
    { label: "Per Day", value: `$${premiumPerDay.toFixed(2)}` },
    { label: "% of Trip Cost", value: `${premiumPct.toFixed(1)}%` },
    { label: "Medical Coverage", value: `$${plan.medical.toLocaleString()}` },
    { label: "Trip Coverage", value: `$${plan.trip.toLocaleString()}` },
    { label: "Trip Cost", value: `$${i.tripCost.toLocaleString()}` },
    { label: "Duration", value: `${i.days} day(s)` },
    { label: "Travelers", value: `${i.travelers}` },
  ];

  return { basePremium, addonsPremium, travelerPremium, deductibleDiscount, totalPremium, premiumPerDay, premiumPct, medicalCoverage: plan.medical, tripCoverage: plan.trip, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  tripCost: "3000",
  days: "7",
  travelers: "1",
  region: "international",
  plan: "standard",
  cfar: "false",
  adventure: "false",
  deductible: "0",
};

// 4. Component
export default function TravelInsuranceCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<InsuranceResults>(() => calcInsurance({ tripCost: 3000, days: 7, travelers: 1, region: "international", plan: "standard", cfar: false, adventure: false, deductible: 0 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcInsurance({ tripCost: 3000, days: 7, travelers: 1, region: "international", plan: "standard", cfar: false, adventure: false, deductible: 0 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcInsurance({
        tripCost: parseFloat(inputs.tripCost) || 0,
        days: parseFloat(inputs.days) || 0,
        travelers: parseFloat(inputs.travelers) || 1,
        region: inputs.region,
        plan: inputs.plan,
        cfar: inputs.cfar === "true",
        adventure: inputs.adventure === "true",
        deductible: parseInt(inputs.deductible, 10) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcInsurance({ tripCost: 3000, days: 7, travelers: 1, region: "international", plan: "standard", cfar: false, adventure: false, deductible: 0 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const tripCost = parseFloat(inputs.tripCost) || 0;
  const days = parseFloat(inputs.days) || 0;
  const travelers = parseFloat(inputs.travelers) || 0;
  if (tripCost <= 0) errors.tripCost = "Must be greater than 0";
  if (days < 1 || days > 90) errors.days = "Must be 1–90 days";
  if (travelers < 1 || travelers > 10) errors.travelers = "Must be 1–10";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";
  const chk = "h-5 w-5 rounded border border-input bg-background text-primary accent-primary";

  const faqs = [
    { question: "How much does travel insurance cost?", answer: "Single-trip policies typically cost 4–8% of your total trip price. This calculator uses daily rate bands: about 0.45% of trip cost per day for Essential, 0.55% for Standard, and 0.75% for Premium. A $3,000, 7-day trip runs about $115 on the Standard plan — roughly $16 a day." },
    { question: "What does trip cancellation insurance cover?", answer: "Covered reasons — illness, injury, severe weather, and similar events — reimburse your prepaid, non-refundable trip costs up to the plan limit (typically $10k–$30k). Cancel For Any Reason (CFAR) add-ons waive the covered-reason requirement and usually refund 50–75% of trip cost, but must be bought within 14–21 days of your first trip payment." },
    { question: "Is medical coverage worth it internationally?", answer: "Yes. Your domestic health insurance rarely works abroad, and a single hospital visit can exceed $50,000. International plans with $250k–$500k of medical coverage cost only slightly more — the international factor in this calculator adds 40% to the base rate — which is cheap relative to the risk." },
    { question: "Do I need insurance for a domestic road trip?", answer: "If you have good health coverage and no expensive prepaid travel, a domestic trip of a few days may not need a policy. But rental-car damage waivers, adventure sports, and long trips with prepaid lodging are cases where even domestic coverage pays for itself." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Travel", href: "/calculator#travel" }, { label: "Travel Insurance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Travel Insurance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tripCost" className={lbl}>Trip Cost</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="tripCost" type="number" min="1" step="100" value={inputs.tripCost} onChange={(e) => set("tripCost")(e.target.value)} className={ci} />
                </div>
                {errors.tripCost && <p className="text-xs text-red-500 font-medium mt-1">{errors.tripCost}</p>}
              </div>
              <div>
                <label htmlFor="days" className={lbl}>Trip Duration</label>
                <div className={inp}>
                  <input id="days" type="number" min="1" max="90" value={inputs.days} onChange={(e) => set("days")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">days</span>
                </div>
                {errors.days && <p className="text-xs text-red-500 font-medium mt-1">{errors.days}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="region" className={lbl}>Destination</label>
                <select id="region" value={inputs.region} onChange={(e) => set("region")(e.target.value)} className={sel}>
                  <option value="domestic">Domestic</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div>
                <label htmlFor="travelers" className={lbl}>Travelers</label>
                <div className={inp}>
                  <input id="travelers" type="number" min="1" max="10" value={inputs.travelers} onChange={(e) => set("travelers")(e.target.value)} className={ci} />
                </div>
                {errors.travelers && <p className="text-xs text-red-500 font-medium mt-1">{errors.travelers}</p>}
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Plan & Add-ons</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="plan" className={lbl}>Coverage Plan</label>
                        <select id="plan" value={inputs.plan} onChange={(e) => set("plan")(e.target.value)} className={sel}>
                          <option value="essential">Essential</option>
                          <option value="standard">Standard</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="deductible" className={lbl}>Deductible</label>
                        <select id="deductible" value={inputs.deductible} onChange={(e) => set("deductible")(e.target.value)} className={sel}>
                          <option value="0">$0</option>
                          <option value="250">$250 (−10%)</option>
                          <option value="500">$500 (−20%)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input type="checkbox" checked={inputs.cfar === "true"} onChange={(e) => set("cfar")(String(e.target.checked))} className={chk} />
                        Cancel for Any Reason (+15%)
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input type="checkbox" checked={inputs.adventure === "true"} onChange={(e) => set("adventure")(String(e.target.checked))} className={chk} />
                        Adventure Sports (+20%)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Premium</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.totalPremium.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.premiumPerDay.toFixed(2)}/day · {result.premiumPct.toFixed(1)}% of trip cost · {inputs.travelers} traveler(s)
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Per Day", `$${result.premiumPerDay.toFixed(2)}`],
                ["% of Trip Cost", `${result.premiumPct.toFixed(1)}%`],
                ["Medical Coverage", `$${result.medicalCoverage.toLocaleString()}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Premium Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Premium by Plan Tier</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="premium" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, i) => (
                      <Cell key={i} fill={d.selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Base premium (before add-ons and deductible) at each plan tier.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Travel Insurance Is Priced</h2>
            <p>Insurers price single-trip policies as a percentage of the trip's prepaid, non-refundable cost, scaled by trip length and destination. This calculator models the industry norm: a daily rate band (0.45–0.75% of trip cost per day) with a 40% international surcharge, extra-traveler loading at 90% of the primary rate, and deductible discounts of 10–20%.</p>
            <h2 className="text-2xl font-bold mb-3">What You're Actually Buying</h2>
            <p>A policy bundles trip cancellation/interruption with emergency medical coverage and, on most plans, baggage delay and travel assistance. Medical limits run $100k on Essential plans up to $500k on Premium — the coverage that matters most abroad, where your domestic health plan usually doesn't apply. Read the fine print for covered reasons; they vary by insurer.</p>
            <h2 className="text-2xl font-bold mb-3">When Add-ons Make Sense</h2>
            <p>Cancel For Any Reason waives the covered-reason requirement and refunds 50–75% of trip cost, but it must be purchased within days of your first trip payment and adds ~15% to the premium. Adventure sports coverage (~20%) only matters if you plan risky activities — skiing, diving, climbing — that base policies typically exclude.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/travel-insurance-calculator" />
          <PopularCalculators exclude="/calculator/travel-insurance-calculator" />
        </div>
      </div>
    </>
  );
}
