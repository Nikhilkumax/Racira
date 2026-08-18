"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface WaterInputs {
  people: number;
  gallonsPerDay: number; // per person
  days: number;          // billing cycle
  waterRate: number;     // $ per 1,000 gal
  sewerRate: number;     // $ per 1,000 gal
  baseFee: number;       // $ fixed monthly
}

interface WaterResults {
  totalGallons: number;
  waterCost: number;
  sewerCost: number;
  totalBill: number;
  perPerson: number;
  gallonsPerDayTotal: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const COLORS = ["#2563eb", "#10b981", "#f59e0b"];

function calcWater(i: WaterInputs): WaterResults {
  const gallonsPerDayTotal = i.people * i.gallonsPerDay;
  const totalGallons = gallonsPerDayTotal * i.days;
  const waterCost = (totalGallons / 1000) * i.waterRate;
  const sewerCost = (totalGallons / 1000) * i.sewerRate;
  const totalBill = waterCost + sewerCost + i.baseFee;
  const perPerson = i.people > 0 ? totalBill / i.people : totalBill;

  const chartData = [
    { name: "Water", value: Math.round(waterCost) },
    { name: "Sewer", value: Math.round(sewerCost) },
    { name: "Base Fee", value: Math.round(i.baseFee) },
  ];

  const breakdown = [
    { label: "Household Size", value: `${i.people}` },
    { label: `Usage (${i.gallonsPerDay} gal/person/day)`, value: `${totalGallons.toLocaleString()} gal` },
    { label: `Water Charge ($${i.waterRate.toFixed(2)}/1,000 gal)`, value: `$${waterCost.toFixed(2)}` },
    { label: `Sewer Charge ($${i.sewerRate.toFixed(2)}/1,000 gal)`, value: `$${sewerCost.toFixed(2)}` },
    { label: "Base / Fixed Fee", value: `$${i.baseFee.toFixed(2)}` },
    { label: "Estimated Water Bill", value: `$${totalBill.toFixed(2)}`, highlight: true, isTotal: true },
    { label: "Per Person", value: `$${perPerson.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Estimated Bill", value: `$${totalBill.toFixed(2)}` },
    { label: "Per Person", value: `$${perPerson.toFixed(2)}` },
    { label: "Total Usage", value: `${totalGallons.toLocaleString()} gal` },
    { label: "Per Day (household)", value: `${gallonsPerDayTotal} gal` },
    { label: "Water Charge", value: `$${waterCost.toFixed(2)}` },
    { label: "Sewer Charge", value: `$${sewerCost.toFixed(2)}` },
    { label: "Base Fee", value: `$${i.baseFee.toFixed(2)}` },
    { label: "Billing Cycle", value: `${i.days} day(s)` },
  ];

  return { totalGallons, waterCost, sewerCost, totalBill, perPerson, gallonsPerDayTotal, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  people: "3",
  gallonsPerDay: "80",
  days: "30",
  waterRate: "4.50",
  sewerRate: "6.00",
  baseFee: "25",
};

// 4. Component
export default function WaterBillCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<WaterResults>(() => calcWater({ people: 3, gallonsPerDay: 80, days: 30, waterRate: 4.5, sewerRate: 6, baseFee: 25 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcWater({ people: 3, gallonsPerDay: 80, days: 30, waterRate: 4.5, sewerRate: 6, baseFee: 25 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcWater({
        people: parseFloat(inputs.people) || 0,
        gallonsPerDay: parseFloat(inputs.gallonsPerDay) || 0,
        days: parseFloat(inputs.days) || 0,
        waterRate: parseFloat(inputs.waterRate) || 0,
        sewerRate: parseFloat(inputs.sewerRate) || 0,
        baseFee: parseFloat(inputs.baseFee) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcWater({ people: 3, gallonsPerDay: 80, days: 30, waterRate: 4.5, sewerRate: 6, baseFee: 25 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const people = parseFloat(inputs.people) || 0;
  const gallonsPerDay = parseFloat(inputs.gallonsPerDay) || 0;
  const days = parseFloat(inputs.days) || 0;
  if (people < 1 || people > 20) errors.people = "Must be 1–20";
  if (gallonsPerDay < 10 || gallonsPerDay > 300) errors.gallonsPerDay = "Must be 10–300 gal";
  if (days < 1 || days > 60) errors.days = "Must be 1–60 days";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How much water does the average person use?", answer: "The typical US household uses about 80 gallons per person per day indoors — roughly 40% toilet and shower, 20% laundry, and the rest faucets and leaks. A family of three on a 30-day cycle uses about 7,200 gallons. Outdoor watering can double that in summer, so the calculator is a baseline, not a ceiling." },
    { question: "Why is my sewer charge so high?", answer: "Most utilities bill sewer at a percentage of your water use — typically 80–100% — because what goes down the drain came from the tap. At a sewer rate of $6 per 1,000 gallons versus $4.50 for water, sewer often costs more than the water itself. The calculator separates the two so you can see it clearly." },
    { question: "What are the biggest water-saving wins?", answer: "Fix leaks first — a running toilet wastes 200 gallons a day. Then shorten showers (2.5 gal/min each), run full laundry loads, and install low-flow fixtures. An average household can cut 20–30% of usage without changing habits much, which is 20–30% off both the water and sewer lines on this bill." },
    { question: "How do I read my water bill?", answer: "Your bill shows gallons or cubic feet used (multiply cubic feet by 7.48 for gallons), a water charge, a sewer charge, and fixed fees. The calculator models exactly that structure — enter your rate per 1,000 gallons from the bill and you can forecast next month or test how much a leak would cost." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home & Garden", href: "/calculator#home-and-garden" }, { label: "Water Bill Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Water Bill Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="people" className={lbl}>Household Size</label>
                <div className={inp}>
                  <input id="people" type="number" min="1" max="20" value={inputs.people} onChange={(e) => set("people")(e.target.value)} className={ci} />
                </div>
                {errors.people && <p className="text-xs text-red-500 font-medium mt-1">{errors.people}</p>}
              </div>
              <div>
                <label htmlFor="gallonsPerDay" className={lbl}>Usage per Person</label>
                <div className={inp}>
                  <input id="gallonsPerDay" type="number" min="10" max="300" step="5" value={inputs.gallonsPerDay} onChange={(e) => set("gallonsPerDay")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">gal/day</span>
                </div>
                {errors.gallonsPerDay && <p className="text-xs text-red-500 font-medium mt-1">{errors.gallonsPerDay}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="days" className={lbl}>Billing Cycle</label>
                <div className={inp}>
                  <input id="days" type="number" min="1" max="60" value={inputs.days} onChange={(e) => set("days")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">days</span>
                </div>
                {errors.days && <p className="text-xs text-red-500 font-medium mt-1">{errors.days}</p>}
              </div>
              <div>
                <label htmlFor="waterRate" className={lbl}>Water Rate</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="waterRate" type="number" min="0.01" step="0.25" value={inputs.waterRate} onChange={(e) => set("waterRate")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">/1,000 gal</span>
                </div>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Sewer & Fixed Charges</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="sewerRate" className={lbl}>Sewer Rate</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="sewerRate" type="number" min="0" step="0.25" value={inputs.sewerRate} onChange={(e) => set("sewerRate")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">/1,000 gal</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="baseFee" className={lbl}>Base / Fixed Fee</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="baseFee" type="number" min="0" step="5" value={inputs.baseFee} onChange={(e) => set("baseFee")(e.target.value)} className={ci} />
                        </div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Water Bill</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.totalBill.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.totalGallons.toLocaleString()} gal · ${result.perPerson.toFixed(2)}/person · water + sewer + fees
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Usage", `${result.totalGallons.toLocaleString()} gal`],
                ["Water Charge", `$${result.waterCost.toFixed(2)}`],
                ["Sewer Charge", `$${result.sewerCost.toFixed(2)}`],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Bill Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Bill Composition</h3>
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
              <p className="text-xs text-muted-foreground mt-2 text-center">Sewer frequently exceeds the water charge itself — and it scales with the same usage.</p>
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
            <h2 className="text-2xl font-bold mb-3">Water Bills Are Two Bills</h2>
            <p>Most utilities bill water and sewer separately: a water charge for what comes in, a sewer charge for what goes out — often 80–100% of the same volume at a higher rate. On top sit fixed fees for meter service and infrastructure. The calculator reproduces that structure, so the number you see is the bill's actual anatomy, not a single vague "water cost."</p>
            <h2 className="text-2xl font-bold mb-3">Usage Drives Everything</h2>
            <p>At 80 gallons per person per day, a family of three uses 7,200 gallons per 30-day cycle. Because both water and sewer rates apply to that volume, every gallon saved cuts two line items at once — which is why fixing a running toilet (up to 200 gallons a day) pays for itself in a single billing cycle.</p>
            <h2 className="text-2xl font-bold mb-3">Forecast Before the Bill Arrives</h2>
            <p>Plug in last month's actual usage and your utility's rates, and you get next month's bill before the meter reader does. The same model answers "what would a leak cost" or "how much does a summer lawn add" — change the per-person usage and watch water, sewer, and the total move together.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/water-bill-calculator" />
          <PopularCalculators exclude="/calculator/water-bill-calculator" />
        </div>
      </div>
    </>
  );
}
