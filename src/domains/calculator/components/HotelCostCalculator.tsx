"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface HotelInputs {
  rate: number;        // $/night
  nights: number;
  taxRate: number;     // %
  resortFee: number;   // $/night
  discount: number;    // % off room rate
  cleaningFee: number; // $ one-time
}

interface HotelResults {
  roomSubtotal: number;
  taxes: number;
  resortFees: number;
  totalCost: number;
  perNight: number;
  perDay: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];

function calcHotel(i: HotelInputs): HotelResults {
  const roomSubtotal = i.rate * i.nights * (1 - i.discount / 100);
  const taxes = roomSubtotal * (i.taxRate / 100);
  const resortFees = i.resortFee * i.nights;
  const totalCost = roomSubtotal + taxes + resortFees + i.cleaningFee;
  const perNight = i.nights > 0 ? totalCost / i.nights : 0;
  const perDay = perNight;

  const chartData = [
    { name: "Room", value: Math.round(roomSubtotal) },
    { name: "Taxes", value: Math.round(taxes) },
    { name: "Resort Fees", value: Math.round(resortFees) },
    { name: "Cleaning", value: Math.round(i.cleaningFee) },
  ];

  const breakdown = [
    { label: `Room Rate (${i.nights} × $${i.rate.toFixed(2)})`, value: `$${(i.rate * i.nights).toFixed(2)}` },
    { label: `Discount (${i.discount}%)`, value: `-$${(i.rate * i.nights * (i.discount / 100)).toFixed(2)}` },
    { label: "Room Subtotal", value: `$${roomSubtotal.toFixed(2)}` },
    { label: `Lodging Tax (${i.taxRate}%)`, value: `$${taxes.toFixed(2)}` },
    { label: `Resort Fee (${i.nights} × $${i.resortFee.toFixed(2)})`, value: `$${resortFees.toFixed(2)}` },
    { label: "Cleaning / Facility Fee", value: `$${i.cleaningFee.toFixed(2)}` },
    { label: "Total Stay Cost", value: `$${totalCost.toFixed(2)}`, highlight: true, isTotal: true },
  ];

  const summaryStats = [
    { label: "Total Stay Cost", value: `$${totalCost.toFixed(2)}` },
    { label: "Per Night (all-in)", value: `$${perNight.toFixed(2)}` },
    { label: "Room Subtotal", value: `$${roomSubtotal.toFixed(2)}` },
    { label: "Taxes", value: `$${taxes.toFixed(2)}` },
    { label: "Resort Fees", value: `$${resortFees.toFixed(2)}` },
    { label: "Cleaning / Facility", value: `$${i.cleaningFee.toFixed(2)}` },
    { label: "Nights", value: `${i.nights}` },
    { label: "Effective Tax Rate", value: `${(taxes / Math.max(1, roomSubtotal) * 100).toFixed(1)}%` },
  ];

  return { roomSubtotal, taxes, resortFees, totalCost, perNight, perDay, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  rate: "150",
  nights: "3",
  taxRate: "12",
  resortFee: "25",
  discount: "0",
  cleaningFee: "20",
};

// 4. Component
export default function HotelCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<HotelResults>(() => calcHotel({ rate: 150, nights: 3, taxRate: 12, resortFee: 25, discount: 0, cleaningFee: 20 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcHotel({ rate: 150, nights: 3, taxRate: 12, resortFee: 25, discount: 0, cleaningFee: 20 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcHotel({
        rate: parseFloat(inputs.rate) || 0,
        nights: parseFloat(inputs.nights) || 0,
        taxRate: parseFloat(inputs.taxRate) || 0,
        resortFee: parseFloat(inputs.resortFee) || 0,
        discount: parseFloat(inputs.discount) || 0,
        cleaningFee: parseFloat(inputs.cleaningFee) || 0,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcHotel({ rate: 150, nights: 3, taxRate: 12, resortFee: 25, discount: 0, cleaningFee: 20 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const rate = parseFloat(inputs.rate) || 0;
  const nights = parseFloat(inputs.nights) || 0;
  const taxRate = parseFloat(inputs.taxRate) || 0;
  const discount = parseFloat(inputs.discount) || 0;
  if (rate <= 0) errors.rate = "Must be greater than 0";
  if (nights < 1 || nights > 60) errors.nights = "Must be 1–60";
  if (taxRate < 0 || taxRate > 30) errors.taxRate = "Must be 0–30%";
  if (discount < 0 || discount > 100) errors.discount = "Must be 0–100%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What is a resort fee and why is it charged separately?", answer: "Resort fees — $15–45 a night — cover amenities like pool, gym, Wi-Fi, and parking that hotels once bundled into the room rate. They are legally required to be disclosed but often show up only at checkout. This calculator treats them as a separate per-night line so you see the real all-in price." },
    { question: "How high are hotel taxes?", answer: "Combined city, county, and state lodging taxes typically run 10–18% of the room rate, and can exceed 20% in major cities like New York, Houston, or Chicago. The room price you see advertised is almost never the price you pay — always add tax plus any resort or destination fees." },
    { question: "What's the difference between per-night and total cost?", answer: "The advertised nightly rate rarely matches the nightly cost. Once taxes, resort fees, and cleaning charges are spread across your nights, a $150 room with 12% tax, a $25 resort fee, and a $20 cleaning fee costs $183.13 per night — 22% more than advertised. The all-in per-night figure is what you should compare across hotels." },
    { question: "Do discounts really save much on a short stay?", answer: "A 10% discount on a 3-night stay at $150 saves $45 — meaningful but small next to fixed fees. On longer stays the discount compounds: 10% off a 10-night stay saves $150. Use member rates, AAA, or corporate codes, and check whether the discounted rate still includes resort fees before booking." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Travel", href: "/calculator#travel" }, { label: "Hotel Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hotel Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rate" className={lbl}>Room Rate</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="rate" type="number" min="1" step="10" value={inputs.rate} onChange={(e) => set("rate")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">/night</span>
                </div>
                {errors.rate && <p className="text-xs text-red-500 font-medium mt-1">{errors.rate}</p>}
              </div>
              <div>
                <label htmlFor="nights" className={lbl}>Nights</label>
                <div className={inp}>
                  <input id="nights" type="number" min="1" max="60" value={inputs.nights} onChange={(e) => set("nights")(e.target.value)} className={ci} />
                </div>
                {errors.nights && <p className="text-xs text-red-500 font-medium mt-1">{errors.nights}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="taxRate" className={lbl}>Lodging Tax</label>
                <div className={inp}>
                  <input id="taxRate" type="number" min="0" max="30" step="0.5" value={inputs.taxRate} onChange={(e) => set("taxRate")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">%</span>
                </div>
                {errors.taxRate && <p className="text-xs text-red-500 font-medium mt-1">{errors.taxRate}</p>}
              </div>
              <div>
                <label htmlFor="resortFee" className={lbl}>Resort Fee</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="resortFee" type="number" min="0" step="5" value={inputs.resortFee} onChange={(e) => set("resortFee")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">/night</span>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Rates & Discounts</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="discount" className={lbl}>Room Discount</label>
                        <div className={inp}>
                          <input id="discount" type="number" min="0" max="100" step="5" value={inputs.discount} onChange={(e) => set("discount")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
                        </div>
                        {errors.discount && <p className="text-xs text-red-500 font-medium mt-1">{errors.discount}</p>}
                      </div>
                      <div>
                        <label htmlFor="cleaningFee" className={lbl}>Cleaning / Facility Fee</label>
                        <div className={inp}>
                          <span className="pl-3 text-muted-foreground text-sm">$</span>
                          <input id="cleaningFee" type="number" min="0" step="5" value={inputs.cleaningFee} onChange={(e) => set("cleaningFee")(e.target.value)} className={ci} />
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Stay Cost</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                ${result.perNight.toFixed(2)}/night all-in · {inputs.nights} night(s) · includes taxes & fees
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Room Subtotal", `$${result.roomSubtotal.toFixed(2)}`],
                ["Taxes & Fees", `$${(result.taxes + result.resortFees + parseFloat(inputs.cleaningFee) || 0).toFixed(2)}`],
                ["Per Night (all-in)", `$${result.perNight.toFixed(2)}`],
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
              <h3 className="text-base font-bold mb-4">Where Your Money Goes</h3>
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
              <p className="text-xs text-muted-foreground mt-2 text-center">Taxes and fees can add 20–30% to the advertised rate — they are rarely negotiable.</p>
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
            <h2 className="text-2xl font-bold mb-3">The Advertised Rate Is a Starting Point</h2>
            <p>Hotels quote a base nightly rate, then layer on lodging tax (10–18% typical, 20%+ in big cities), resort or destination fees ($15–45 per night), and sometimes cleaning or parking charges. A $150 room can easily become $180+ a night once every line item lands — the difference between a "deal" and a budget buster.</p>
            <h2 className="text-2xl font-bold mb-3">Compare the All-In Price</h2>
            <p>Booking sites sort by nightly rate, which is the least useful number on the page. Re-sort mentally by total including taxes and fees: for a 3-night stay, a $140 room with a $30 resort fee costs more than a $160 room with none. This calculator reports the per-night all-in figure so every hotel is compared on the same basis.</p>
            <h2 className="text-2xl font-bold mb-3">Cut the Fees You Can Control</h2>
            <p>You cannot negotiate taxes, but you can often avoid resort fees by booking a property without amenities, or by choosing vacation rentals with a flat cleaning fee instead of per-night extras. Longer stays amortize fixed cleaning charges, while member discounts shave the room line itself — combine both to trim the total meaningfully.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hotel-cost-calculator" />
          <PopularCalculators exclude="/calculator/hotel-cost-calculator" />
        </div>
      </div>
    </>
  );
}
