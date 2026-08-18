"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface RoadTripInputs {
  distance: number;   // miles
  mpg: number;        // miles per gallon
  fuelPrice: number;  // $/gallon
  nights: number;
  lodgingPerNight: number;
  foodPerDay: number;
  tolls: number;      // $ total
  activities: number; // $ total
  travelers: number;
}

interface RoadTripResults {
  fuelCost: number;
  lodgingCost: number;
  foodCost: number;
  totalCost: number;
  perPerson: number;
  costPerMile: number;
  days: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

function calcRoadTrip(i: RoadTripInputs): RoadTripResults {
  const fuelCost = i.mpg > 0 ? (i.distance / i.mpg) * i.fuelPrice : 0;
  const days = i.nights + 1;
  const lodgingCost = i.nights * i.lodgingPerNight;
  const foodCost = days * i.foodPerDay;
  const totalCost = fuelCost + lodgingCost + foodCost + i.tolls + i.activities;
  const perPerson = i.travelers > 0 ? totalCost / i.travelers : totalCost;
  const costPerMile = i.distance > 0 ? totalCost / i.distance : 0;

  const chartData = [
    { name: "Fuel", value: Math.round(fuelCost) },
    { name: "Lodging", value: Math.round(lodgingCost) },
    { name: "Food", value: Math.round(foodCost) },
    { name: "Tolls", value: Math.round(i.tolls) },
    { name: "Activities", value: Math.round(i.activities) },
  ];

  const breakdown = [
    { label: "Fuel", value: `$${fuelCost.toFixed(2)}`, highlight: true, isTotal: false },
    { label: "Lodging", value: `$${lodgingCost.toFixed(2)}` },
    { label: "Food", value: `$${foodCost.toFixed(2)}` },
    { label: "Tolls & Fees", value: `$${i.tolls.toFixed(2)}` },
    { label: "Activities", value: `$${i.activities.toFixed(2)}` },
    { label: "Total Trip Cost", value: `$${totalCost.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Per Person", value: `$${perPerson.toFixed(2)}` },
    { label: "Cost per Mile", value: `$${costPerMile.toFixed(3)}` },
  ];

  const summaryStats = [
    { label: "Total Trip Cost", value: `$${totalCost.toFixed(2)}` },
    { label: "Per Person", value: `$${perPerson.toFixed(2)}` },
    { label: "Cost per Mile", value: `$${costPerMile.toFixed(3)}` },
    { label: "Fuel Cost", value: `$${fuelCost.toFixed(2)}` },
    { label: "Lodging Cost", value: `$${lodgingCost.toFixed(2)}` },
    { label: "Food Cost", value: `$${foodCost.toFixed(2)}` },
    { label: "Distance", value: `${i.distance.toLocaleString()} mi` },
    { label: "Trip Length", value: `${days} day(s), ${i.nights} night(s)` },
  ];

  return { fuelCost, lodgingCost, foodCost, totalCost, perPerson, costPerMile, days, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  distance: "600",
  mpg: "28",
  fuelPrice: "3.50",
  nights: "2",
  lodgingPerNight: "120",
  foodPerDay: "45",
  tolls: "15",
  activities: "50",
  travelers: "2",
};

// 4. Component
export default function RoadTripCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<RoadTripResults>(() => calcRoadTrip({ distance: 600, mpg: 28, fuelPrice: 3.5, nights: 2, lodgingPerNight: 120, foodPerDay: 45, tolls: 15, activities: 50, travelers: 2 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcRoadTrip({ distance: 600, mpg: 28, fuelPrice: 3.5, nights: 2, lodgingPerNight: 120, foodPerDay: 45, tolls: 15, activities: 50, travelers: 2 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcRoadTrip({
        distance: parseFloat(inputs.distance) || 0,
        mpg: parseFloat(inputs.mpg) || 0,
        fuelPrice: parseFloat(inputs.fuelPrice) || 0,
        nights: parseFloat(inputs.nights) || 0,
        lodgingPerNight: parseFloat(inputs.lodgingPerNight) || 0,
        foodPerDay: parseFloat(inputs.foodPerDay) || 0,
        tolls: parseFloat(inputs.tolls) || 0,
        activities: parseFloat(inputs.activities) || 0,
        travelers: parseFloat(inputs.travelers) || 1,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcRoadTrip({ distance: 600, mpg: 28, fuelPrice: 3.5, nights: 2, lodgingPerNight: 120, foodPerDay: 45, tolls: 15, activities: 50, travelers: 2 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const distance = parseFloat(inputs.distance) || 0;
  const mpg = parseFloat(inputs.mpg) || 0;
  const fuelPrice = parseFloat(inputs.fuelPrice) || 0;
  const nights = parseFloat(inputs.nights) || 0;
  const travelers = parseFloat(inputs.travelers) || 0;
  if (distance <= 0) errors.distance = "Must be greater than 0";
  if (mpg <= 0) errors.mpg = "Must be greater than 0";
  if (fuelPrice <= 0) errors.fuelPrice = "Must be greater than 0";
  if (nights < 0 || nights > 30) errors.nights = "Must be 0–30";
  if (travelers < 1 || travelers > 20) errors.travelers = "Must be 1–20";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How is road trip fuel cost calculated?", answer: "Fuel cost = distance ÷ fuel economy × fuel price. A 600-mile trip at 28 mpg with gas at $3.50/gal burns about 21.4 gallons — roughly $75 in fuel. Your real economy varies with highway vs city driving, load, and speed; the calculator's default of 28 mpg is a good blended estimate." },
    { question: "What should I budget for food on a road trip?", answer: "A common rule is $40–60 per person per day covering fast food, grocery stops, and the occasional sit-down meal. Add a full day of food for every night you stay — a 3-day, 2-night trip needs 3 days of food budget. Couples can often share and trim 20–30%." },
    { question: "How much does lodging add to a road trip?", answer: "Mid-range motels and budget hotels run $90–160 per night for two people. If you want to cut this, alternate hotel nights with camping or stays with friends — many trips halve lodging cost that way. This calculator uses $120/night as a realistic mid-range default." },
    { question: "How do I split costs between travelers?", answer: "Total trip cost divided by the number of travelers gives a fair per-person share, which the calculator reports. If one person drives their own car, many groups split fuel and tolls evenly but let the driver keep the lodging share that would have been their room anyway — agree before you leave." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Travel", href: "/calculator#travel" }, { label: "Road Trip Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Road Trip Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="distance" className={lbl}>Distance</label>
                <div className={inp}>
                  <input id="distance" type="number" min="1" step="10" value={inputs.distance} onChange={(e) => set("distance")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">mi</span>
                </div>
                {errors.distance && <p className="text-xs text-red-500 font-medium mt-1">{errors.distance}</p>}
              </div>
              <div>
                <label htmlFor="mpg" className={lbl}>Fuel Economy</label>
                <div className={inp}>
                  <input id="mpg" type="number" min="1" step="1" value={inputs.mpg} onChange={(e) => set("mpg")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">mpg</span>
                </div>
                {errors.mpg && <p className="text-xs text-red-500 font-medium mt-1">{errors.mpg}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fuelPrice" className={lbl}>Fuel Price</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="fuelPrice" type="number" min="0.01" step="0.05" value={inputs.fuelPrice} onChange={(e) => set("fuelPrice")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">/gal</span>
                </div>
                {errors.fuelPrice && <p className="text-xs text-red-500 font-medium mt-1">{errors.fuelPrice}</p>}
              </div>
              <div>
                <label htmlFor="nights" className={lbl}>Nights on the Road</label>
                <div className={inp}>
                  <input id="nights" type="number" min="0" max="30" value={inputs.nights} onChange={(e) => set("nights")(e.target.value)} className={ci} />
                </div>
                {errors.nights && <p className="text-xs text-red-500 font-medium mt-1">{errors.nights}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Budget Estimates</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="lodgingPerNight" className={lbl}>Lodging per Night</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="lodgingPerNight" type="number" min="0" step="10" value={inputs.lodgingPerNight} onChange={(e) => set("lodgingPerNight")(e.target.value)} className={ci} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="foodPerDay" className={lbl}>Food per Day</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="foodPerDay" type="number" min="0" step="5" value={inputs.foodPerDay} onChange={(e) => set("foodPerDay")(e.target.value)} className={ci} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label htmlFor="tolls" className={lbl}>Tolls & Fees</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="tolls" type="number" min="0" step="5" value={inputs.tolls} onChange={(e) => set("tolls")(e.target.value)} className={ci} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="activities" className={lbl}>Activities & Extras</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="activities" type="number" min="0" step="10" value={inputs.activities} onChange={(e) => set("activities")(e.target.value)} className={ci} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="travelers" className={lbl}>Travelers</label>
                      <div className={inp}>
                        <input id="travelers" type="number" min="1" max="20" value={inputs.travelers} onChange={(e) => set("travelers")(e.target.value)} className={ci} />
                      </div>
                      {errors.travelers && <p className="text-xs text-red-500 font-medium mt-1">{errors.travelers}</p>}
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Trip Cost</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.perPerson.toFixed(2)}/person · ${result.costPerMile.toFixed(3)}/mile · {result.days} day(s)
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Fuel", `$${result.fuelCost.toFixed(2)}`],
                ["Lodging", `$${result.lodgingCost.toFixed(2)}`],
                ["Food", `$${result.foodCost.toFixed(2)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Cost Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Cost by Category</h3>
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
              <p className="text-xs text-muted-foreground mt-2 text-center">Share of total cost by category — fuel is the only truly unavoidable line item.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Real Cost of the Open Road</h2>
            <p>Most people budget only for gas, but lodging and food typically dominate a multi-day trip. Fuel is the one true variable you cannot plan away: distance divided by your car's real economy, times the pump price. For 600 miles at 28 mpg and $3.50/gal, that's about $75 — usually the smallest line on the ledger.</p>
            <h2 className="text-2xl font-bold mb-3">Lodging and Food Dominate</h2>
            <p>At $120 a night and $45 a day for food, a 3-day, 2-night trip adds $330 on top of fuel. Those are the categories with the most wiggle room: camping, hotel loyalty points, cooking at the Airbnb, and splitting meals can cut the trip total by a third. Track them separately so you can see where the money actually goes.</p>
            <h2 className="text-2xl font-bold mb-3">Per-Person Math</h2>
            <p>Traveling with a companion nearly halves the per-person cost, because lodging — often the biggest line item — is shared while fuel splits evenly. The calculator reports total, per-person, and per-mile figures, so you can compare trip options honestly and agree on a fair split before you pack the car.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/road-trip-cost-calculator" />
          <PopularCalculators exclude="/calculator/road-trip-cost-calculator" />
        </div>
      </div>
    </>
  );
}
