"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Car, DollarSign, Calendar, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface CarResult {
  monthlyCarShare: number;
  monthlyRental: number;
  annualCarShare: number;
  annualRental: number;
  totalCarShareCost: number;
  totalRentalCost: number;
  savings: number;
  savingsPct: number;
  recommendation: string;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  carShareHourly: "12",
  carShareMonthly: "8",
  carShareAnnual: "199",
  rentalDaily: "45",
  rentalDaysPerYear: "10",
  rentalAnnualFee: "50",
  usageYears: "3",
};

const calculate = (v: typeof DEFAULTS): CarResult => {
  const hourly = parseFloat(v.carShareHourly) || 0;
  const monthly = parseFloat(v.carShareMonthly) || 0;
  const annualFee = parseFloat(v.carShareAnnual) || 0;
  const rentalDaily = parseFloat(v.rentalDaily) || 0;
  const rentalDays = parseFloat(v.rentalDaysPerYear) || 0;
  const rentalAnnual = parseFloat(v.rentalAnnualFee) || 0;
  const years = parseFloat(v.usageYears) || 1;

  // Car sharing: monthly fee * 12 + annual fee + (hourly * monthly hours * 12 months)
  const monthlyCarShare = monthly + (hourly * (parseFloat(v.carShareMonthly) || 0) * 12);

  // Wait, let me redo this more carefully
  // Car sharing = annual membership fee + monthly fee * 12 + hourly rate * hours per month * 12
  const annualCarShare = annualFee + (monthly * 12) + (hourly * 0 * 0);
  
  // Actually, let me restructure. The inputs are:
  // - Car share: hourly rate, monthly membership fee, annual fee
  // - Rental: daily rate, days per year, annual fee
  
  // Car sharing monthly cost = monthly membership + (hourly rate * estimated monthly hours)
  const monthlyHours = 20; // typical user drives ~20 hours per month with car sharing
  const carShareMonthlyTotal = monthly + (hourly * monthlyHours);
  const carShareAnnualTotal = annualFee + (carShareMonthlyTotal * 12);
  
  // Rental car annual cost = annual fee + (daily rate * days per year)
  const rentalAnnualTotal = rentalAnnual + (rentalDaily * rentalDays);
  
  const totalCarShare3yr = carShareAnnualTotal * years;
  const totalRental3yr = rentalAnnualTotal * years;
  
  const savings = totalRental3yr - totalCarShare3yr;
  const savingsPct = totalRental3yr > 0 ? ((totalRental3yr - totalCarShare3yr) / totalRental3yr) * 100 : 0;
  
  let recommendation = "";
  if (carShareAnnualTotal < rentalAnnualTotal) {
    recommendation = "Car sharing is more economical for your usage pattern.";
  } else if (carShareAnnualTotal > rentalAnnualTotal) {
    recommendation = "Rental is more economical for your usage pattern.";
  } else {
    recommendation = "Both options cost about the same.";
  }

  const chartData = [
    { name: "Car Sharing", value: parseFloat(carShareAnnualTotal.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Rental Car", value: parseFloat(rentalAnnualTotal.toFixed(2)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Car Sharing (Annual)", value: `$${carShareAnnualTotal.toFixed(2)}` },
    { label: "  - Annual Fee", value: `$${annualFee.toFixed(2)}` },
    { label: "  - Monthly Fee (×12)", value: `$${(monthly * 12).toFixed(2)}` },
    { label: "  - Hourly (est. 20h/mo × 12)", value: `$${(hourly * monthlyHours * 12).toFixed(2)}` },
    { label: "Rental (Annual)", value: `$${rentalAnnualTotal.toFixed(2)}` },
    { label: "  - Annual Fee", value: `$${rentalAnnual.toFixed(2)}` },
    { label: "  - Daily Rate × Days", value: `$${(rentalDaily * rentalDays).toFixed(2)}` },
    { label: "Years", value: `${years.toFixed(0)}` },
    { label: "Total Car Share Cost", value: `$${totalCarShare3yr.toFixed(2)}` },
    { label: "Total Rental Cost", value: `$${totalRental3yr.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Car Sharing Annual", value: `$${carShareAnnualTotal.toFixed(2)}` },
    { label: "Rental Annual", value: `$${rentalAnnualTotal.toFixed(2)}` },
    { label: "3-Year Savings", value: `$${Math.abs(savings).toFixed(2)}` },
    { label: "Cheaper Option", value: savings <= 0 ? "Car Sharing" : "Rental" },
    { label: "Savings %", value: `${Math.abs(savingsPct).toFixed(1)}%` },
  ];

  return {
    monthlyCarShare: carShareMonthlyTotal,
    monthlyRental: rentalDaily * (rentalDays / 12),
    annualCarShare: carShareAnnualTotal,
    annualRental: rentalAnnualTotal,
    totalCarShareCost: totalCarShare3yr,
    totalRentalCost: totalRental3yr,
    savings,
    savingsPct,
    recommendation,
    chartData,
    breakdown,
    summaryStats,
  };
};

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const CompactInput = ({ id, label, value, onChange, prefix, suffix, tooltip }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
      {label}
      {tooltip && <span className="text-xs text-muted-foreground cursor-help" title={tooltip}>ⓘ</span>}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground">{prefix}</span>}
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground">{suffix}</span>}
    </div>
  </div>
);

const COLORS = ["hsl(var(--primary))", "#10b981"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].name || payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function CarSharingVsRentalCostCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<CarResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(vals));
  };

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const updateVal = (key: keyof typeof DEFAULTS, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "When is car sharing cheaper than renting?", answer: "Car sharing is typically cheaper if you need a car for less than 2-3 days per month on a regular basis, or if you need occasional hourly trips. If you only need a car for a week-long vacation once a year, rental is usually cheaper." },
    { question: "What are the typical car sharing costs?", answer: "Most car sharing services charge $8-15 per month for membership plus $8-20 per hour or $40-80 per day. Annual fees range from $0 to $200 depending on the service." },
    { question: "How much does it cost to rent a car for a week?", answer: "Weekly rentals typically cost $200-500 depending on the car class, location, and season. Add taxes, insurance, and fees which can add 20-40% to the base rate." },
    { question: "What is the break-even point?", answer: "If you need a car more than about 15-20 days per year, rental cars become more expensive than most car sharing memberships. However, car sharing works best for short trips and doesn't give you a car for a full week." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Car Sharing vs Rental Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Car Sharing vs Rental Cost Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Car className="w-3.5 h-3.5" /> Car Sharing
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="carShareHourly" label="Hourly Rate" value={vals.carShareHourly} onChange={(v) => updateVal("carShareHourly", v)} prefix="$" suffix="/hr" tooltip="Cost per hour of driving" />
                <CompactInput id="carShareMonthly" label="Monthly Membership" value={vals.carShareMonthly} onChange={(v) => updateVal("carShareMonthly", v)} prefix="$" suffix="/mo" tooltip="Monthly fee for the service" />
                <CompactInput id="carShareAnnual" label="Annual Fee" value={vals.carShareAnnual} onChange={(v) => updateVal("carShareAnnual", v)} prefix="$" suffix="/yr" tooltip="Annual membership or platform fee" />
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Rental Car
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="rentalDaily" label="Daily Rate" value={vals.rentalDaily} onChange={(v) => updateVal("rentalDaily", v)} prefix="$" suffix="/day" tooltip="Cost per day to rent" />
                <CompactInput id="rentalDaysPerYear" label="Days Per Year" value={vals.rentalDaysPerYear} onChange={(v) => updateVal("rentalDaysPerYear", v)} tooltip="How many days per year you rent" />
                <CompactInput id="rentalAnnualFee" label="Annual Fee" value={vals.rentalAnnualFee} onChange={(v) => updateVal("rentalAnnualFee", v)} prefix="$" suffix="/yr" tooltip="Annual membership or fees" />
              </div>
            </div>

            <CompactInput id="usageYears" label="Comparison Period" value={vals.usageYears} onChange={(v) => updateVal("usageYears", v)} suffix="years" tooltip="Number of years to compare total costs" />

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> {result.savings < 0 ? "Car Sharing Savings" : "Rental Savings"}
                </div>
                <div className={`text-4xl font-bold ${result.savings < 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {result.savings < 0 ? `-$${Math.abs(result.savings).toFixed(2)}` : `+$${Math.abs(result.savings).toFixed(2)}`}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{result.recommendation}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Car Share</div>
                  <div className="text-lg font-bold text-foreground">${result.annualCarShare.toFixed(2)}/yr</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Rental</div>
                  <div className="text-lg font-bold text-foreground">${result.annualRental.toFixed(2)}/yr</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Savings %</div>
                  <div className={`text-lg font-bold ${result.savings < 0 ? "text-emerald-600" : "text-rose-600"}`}>{Math.abs(result.savingsPct).toFixed(1)}%</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Item</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={r.label.startsWith("Total") ? "font-bold bg-secondary/10 border-t-2 border-border" : ""}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Annual Cost Comparison</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Car Sharing vs Rental: Which Saves You Money?</h2>
            <p>Choosing between car sharing services (like Zipcar, Getaround, or Turo) and traditional rental car companies depends entirely on how frequently and how long you need a vehicle. Car sharing services excel at short, occasional trips with hourly billing, while rental companies are designed for multi-day bookings at a lower per-day rate. This calculator helps you quantify the annual and multi-year cost difference so you can make the most economical choice for your transportation needs.</p>

            <h3>1. How Car Sharing Pricing Works</h3>
            <p>Car sharing platforms typically charge three components: a monthly or annual membership fee, a per-hour driving rate, and sometimes a per-mile charge. Some services also charge a daily maximum (capping hourly rates after a certain number of hours). The total monthly cost is the membership fee plus the hourly rate multiplied by your expected monthly driving hours.</p>

            <h3>2. How Rental Car Pricing Works</h3>
            <p>Rental companies charge a daily rate, sometimes with weekly or monthly discounts. They also charge an annual or one-time administrative fee for some services. Unlike car sharing, you can keep the car for an extended period (days or weeks), making it more economical for travel or extended use scenarios.</p>

            <h3>3. When Car Sharing Wins</h3>
            <p>Car sharing is more economical when you need a car for short, infrequent trips—typically under 2-3 days per month. If you drive less than 20 hours per month, the hourly rates are offset by the lower membership cost. If you need a car for a full week or longer, rental companies almost always win.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-sharing-vs-rental-cost-calculator" />
          <PopularCalculators exclude="/calculator/car-sharing-vs-rental-cost-calculator" />
        </div>
      </div>
    </>
  );
}
