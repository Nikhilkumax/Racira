"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface TravelBudgetInputs {
  days: number;
  travelers: number;
  region: string;      // "domestic" | "international"
  style: string;       // "budget" | "midrange" | "luxury"
  flights: number;     // $ total round trip
  activitiesPerDay: number;
  misc: number;        // $ one-time
  insurance: number;   // $ total
}

interface TravelBudgetResults {
  dailyRate: number;   // $/person/day
  dailyCost: number;   // $ total daily budget
  totalCost: number;
  perPerson: number;
  perPersonPerDay: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const DAILY_RATES: Record<string, Record<string, number>> = {
  budget: { domestic: 80, international: 100 },
  midrange: { domestic: 150, international: 200 },
  luxury: { domestic: 300, international: 400 },
};

const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

function calcTravelBudget(i: TravelBudgetInputs): TravelBudgetResults {
  const dailyRate = DAILY_RATES[i.style]?.[i.region] ?? 150;
  const dailyCost = i.days * i.travelers * dailyRate;
  const activities = i.days * i.travelers * i.activitiesPerDay;
  const totalCost = dailyCost + i.flights + activities + i.misc + i.insurance;
  const perPerson = i.travelers > 0 ? totalCost / i.travelers : totalCost;
  const perPersonPerDay = i.days > 0 ? perPerson / i.days : 0;

  const chartData = [
    { name: "Daily Costs", value: Math.round(dailyCost) },
    { name: "Flights", value: Math.round(i.flights) },
    { name: "Activities", value: Math.round(activities) },
    { name: "Misc / Souvenirs", value: Math.round(i.misc) },
    { name: "Insurance", value: Math.round(i.insurance) },
  ];

  const breakdown = [
    { label: `Daily Budget (${i.days} d × ${i.travelers} × $${dailyRate})`, value: `$${dailyCost.toFixed(2)}` },
    { label: "Flights (round trip)", value: `$${i.flights.toFixed(2)}` },
    { label: "Activities & Tours", value: `$${activities.toFixed(2)}` },
    { label: "Misc / Souvenirs", value: `$${i.misc.toFixed(2)}` },
    { label: "Travel Insurance", value: `$${i.insurance.toFixed(2)}` },
    { label: "Total Trip Budget", value: `$${totalCost.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Per Person", value: `$${perPerson.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Total Trip Budget", value: `$${totalCost.toFixed(2)}` },
    { label: "Per Person", value: `$${perPerson.toFixed(2)}` },
    { label: "Per Person / Day", value: `$${perPersonPerDay.toFixed(2)}` },
    { label: "Daily Budget", value: `$${dailyCost.toFixed(2)}` },
    { label: "Flights", value: `$${i.flights.toFixed(2)}` },
    { label: "Activities", value: `$${activities.toFixed(2)}` },
    { label: "Travel Style", value: i.style.charAt(0).toUpperCase() + i.style.slice(1) },
    { label: "Trip Length", value: `${i.days} day(s), ${i.travelers} traveler(s)` },
  ];

  return { dailyRate, dailyCost, totalCost, perPerson, perPersonPerDay, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  days: "7",
  travelers: "2",
  region: "international",
  style: "midrange",
  flights: "400",
  activitiesPerDay: "30",
  misc: "100",
  insurance: "120",
};

// 4. Component
export default function TravelBudgetCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<TravelBudgetResults>(() => calcTravelBudget({ days: 7, travelers: 2, region: "international", style: "midrange", flights: 400, activitiesPerDay: 30, misc: 100, insurance: 120 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcTravelBudget({ days: 7, travelers: 2, region: "international", style: "midrange", flights: 400, activitiesPerDay: 30, misc: 100, insurance: 120 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcTravelBudget({
        days: parseFloat(inputs.days) || 0,
        travelers: parseFloat(inputs.travelers) || 1,
        region: inputs.region,
        style: inputs.style,
        flights: parseFloat(inputs.flights) || 0,
        activitiesPerDay: parseFloat(inputs.activitiesPerDay) || 0,
        misc: parseFloat(inputs.misc) || 0,
        insurance: parseFloat(inputs.insurance) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcTravelBudget({ days: 7, travelers: 2, region: "international", style: "midrange", flights: 400, activitiesPerDay: 30, misc: 100, insurance: 120 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const days = parseFloat(inputs.days) || 0;
  const travelers = parseFloat(inputs.travelers) || 0;
  if (days < 1 || days > 60) errors.days = "Must be 1–60 days";
  if (travelers < 1 || travelers > 20) errors.travelers = "Must be 1–20";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much should I budget per day for travel?", answer: "A common starting point: $80–100 per person per day for budget travel, $150–200 for mid-range (comfortable hotels, regular meals), and $300–400 for luxury. International trips run higher than domestic — the calculator's style and region selectors apply these typical daily rates automatically." },
    { question: "What counts as a daily travel cost?", answer: "Lodging, meals, local transportation, and entry fees — everything you spend day to day at the destination. Flights and insurance are separate line items because they're paid once, in advance. The daily rate in this calculator includes accommodation and food, so it is higher than a 'spending money' estimate." },
    { question: "How do I budget for a family trip?", answer: "Multiply the daily rate by travelers — lodging usually doesn't scale linearly (rooms and suites share), but meals and activities do. The calculator charges the full daily rate per person, which is conservative: many families find real costs land 10–20% below that once room-sharing is factored in." },
    { question: "What's a realistic flights budget?", answer: "Round-trip domestic US flights typically run $150–400, international $600–1,200+ depending on destination and season. The calculator treats flights as a total input for the whole party, and it's worth booking these first — they often anchor the trip budget more than any daily cost." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Travel", href: "/calculator#travel" }, { label: "Travel Budget Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Travel Budget Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="days" className={lbl}>Trip Duration</label>
                <div className={inp}>
                  <input id="days" type="number" min="1" max="60" value={inputs.days} onChange={(e) => set("days")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">days</span>
                </div>
                {errors.days && <p className="text-xs text-red-500 font-medium mt-1">{errors.days}</p>}
              </div>
              <div>
                <label htmlFor="travelers" className={lbl}>Travelers</label>
                <div className={inp}>
                  <input id="travelers" type="number" min="1" max="20" value={inputs.travelers} onChange={(e) => set("travelers")(e.target.value)} className={ci} />
                </div>
                {errors.travelers && <p className="text-xs text-red-500 font-medium mt-1">{errors.travelers}</p>}
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
                <label htmlFor="style" className={lbl}>Travel Style</label>
                <select id="style" value={inputs.style} onChange={(e) => set("style")(e.target.value)} className={sel}>
                  <option value="budget">Budget</option>
                  <option value="midrange">Mid-range</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="flights" className={lbl}>Flights (round trip, all travelers)</label>
              <div className={inp}>
                <span className="pl-3 text-muted-foreground text-sm">$</span>
                <input id="flights" type="number" min="0" step="50" value={inputs.flights} onChange={(e) => set("flights")(e.target.value)} className={ci} />
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Extras & Coverage</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="activitiesPerDay" className={lbl}>Activities per Day</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="activitiesPerDay" type="number" min="0" step="10" value={inputs.activitiesPerDay} onChange={(e) => set("activitiesPerDay")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">/person</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="misc" className={lbl}>Misc / Souvenirs</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="misc" type="number" min="0" step="25" value={inputs.misc} onChange={(e) => set("misc")(e.target.value)} className={ci} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="insurance" className={lbl}>Travel Insurance</label>
                      <div className={inp}>
                        <span className="pl-3 text-muted-foreground text-sm">$</span>
                        <input id="insurance" type="number" min="0" step="20" value={inputs.insurance} onChange={(e) => set("insurance")(e.target.value)} className={ci} />
                      </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Trip Budget</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.perPerson.toFixed(2)}/person · ${result.perPersonPerDay.toFixed(2)}/person/day · {inputs.days} day(s)
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Daily Budget", `$${result.dailyCost.toFixed(2)}`],
                ["Flights", `$${parseFloat(inputs.flights).toFixed(2)}`],
                ["Per Person", `$${result.perPerson.toFixed(2)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Budget Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Where the Budget Goes</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {result.chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`$${v}`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Daily costs dominate long trips; flights dominate short ones — the mix shifts with duration.</p>
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
            <h2 className="text-2xl font-bold mb-3">Build the Budget Backward</h2>
            <p>The most reliable way to budget a trip is to start from the fixed costs — flights and insurance — then layer the daily rate. Daily rates in this calculator are all-in per person (lodging, meals, local transport, entry fees): $80–100 budget, $150–200 mid-range, $300–400 luxury, with an international premium. A 7-day trip for two at mid-range international rates is about $2,800 in daily costs plus flights.</p>
            <h2 className="text-2xl font-bold mb-3">The Duration Mix</h2>
            <p>Short trips are flight-heavy; long trips are daily-cost-heavy. For a weekend away, flights can be 60% of the budget; for a month abroad, daily costs dominate and flights shrink to a footnote. Watching the pie chart shift as you change duration is the fastest way to see where your money is really going.</p>
            <h2 className="text-2xl font-bold mb-3">Leave Room for the Unplanned</h2>
            <p>Every real trip has surprise costs — a missed connection, a weather day, a market you can't walk past. The misc line (default $100) is that buffer, and travel insurance covers the rare catastrophic version of the same problem. Budget 5–10% above the calculated total and the trip writes its own happy ending.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/travel-budget-calculator" />
          <PopularCalculators exclude="/calculator/travel-budget-calculator" />
        </div>
      </div>
    </>
  );
}
