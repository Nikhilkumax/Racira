"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ownershipCost, depreciate, fmtUsd } from "@/lib/auto/autoFinance";

interface VehicleInputs {
  purchasePrice: number;
  downPayment: number;
  loanApr: number;
  loanTermYears: number;
  annualInsurance: number;
  annualFuel: number;
  annualMaintenance: number;
  annualRegistration: number;
  resaleValue: number;
  ownershipYears: number;
  annualMiles: number;
}

interface ComparisonResult {
  newCar: { totalCost: number; annualCost: number; costPerMile: number; depreciation: number; interest: number; insurance: number; fuel: number; maintenance: number };
  usedCar: { totalCost: number; annualCost: number; costPerMile: number; depreciation: number; interest: number; insurance: number; fuel: number; maintenance: number };
  savings: number;
  savingsPct: number;
}

const DEFAULTS_NEW: VehicleInputs = {
  purchasePrice: 35000, downPayment: 7000, loanApr: 6.9, loanTermYears: 5,
  annualInsurance: 1800, annualFuel: 2400, annualMaintenance: 600, annualRegistration: 400,
  resaleValue: 18000, ownershipYears: 5, annualMiles: 15000,
};

const DEFAULTS_USED: VehicleInputs = {
  purchasePrice: 22000, downPayment: 4400, loanApr: 7.5, loanTermYears: 5,
  annualInsurance: 1400, annualFuel: 2700, annualMaintenance: 1100, annualRegistration: 350,
  resaleValue: 10000, ownershipYears: 5, annualMiles: 15000,
};

function computeVehicle(v: VehicleInputs) {
  const res = ownershipCost({
    purchasePrice: Math.max(0, v.purchasePrice), years: Math.max(1, v.ownershipYears),
    annualMiles: Math.max(0, v.annualMiles), aprPct: Math.max(0, v.loanApr),
    loanTermYears: Math.max(0, v.loanTermYears), downPayment: Math.max(0, v.downPayment),
    insuranceAnnual: Math.max(0, v.annualInsurance), fuelAnnual: Math.max(0, v.annualFuel),
    maintenanceAnnual: Math.max(0, v.annualMaintenance), registrationAnnual: Math.max(0, v.annualRegistration),
    parkingAnnual: 0, resaleValue: Math.max(0, v.resaleValue),
  });
  return {
    totalCost: res.totalOutOfPocket, annualCost: res.annualCost, costPerMile: res.costPerMile,
    depreciation: res.depreciation, interest: res.totalInterest, insurance: res.insurance,
    fuel: res.fuel, maintenance: res.maintenance,
  };
}

function calculate(newCar: VehicleInputs, usedCar: VehicleInputs): ComparisonResult {
  const nc = computeVehicle(newCar);
  const uc = computeVehicle(usedCar);
  const savings = nc.totalCost - uc.totalCost;
  return { newCar: nc, usedCar: uc, savings, savingsPct: nc.totalCost > 0 ? (savings / nc.totalCost) * 100 : 0 };
}

const CI = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const UsedCarVsNewCarTotalCostComparisonCalculator = () => {
  const [newPrice, setNewPrice] = useState(String(DEFAULTS_NEW.purchasePrice));
  const [newDown, setNewDown] = useState(String(DEFAULTS_NEW.downPayment));
  const [newApr, setNewApr] = useState(String(DEFAULTS_NEW.loanApr));
  const [newTerm, setNewTerm] = useState(String(DEFAULTS_NEW.loanTermYears));
  const [newInsurance, setNewInsurance] = useState(String(DEFAULTS_NEW.annualInsurance));
  const [newFuel, setNewFuel] = useState(String(DEFAULTS_NEW.annualFuel));
  const [newMaintenance, setNewMaintenance] = useState(String(DEFAULTS_NEW.annualMaintenance));
  const [newReg, setNewReg] = useState(String(DEFAULTS_NEW.annualRegistration));
  const [newResale, setNewResale] = useState(String(DEFAULTS_NEW.resaleValue));

  const [usedPrice, setUsedPrice] = useState(String(DEFAULTS_USED.purchasePrice));
  const [usedDown, setUsedDown] = useState(String(DEFAULTS_USED.downPayment));
  const [usedApr, setUsedApr] = useState(String(DEFAULTS_USED.loanApr));
  const [usedTerm, setUsedTerm] = useState(String(DEFAULTS_USED.loanTermYears));
  const [usedInsurance, setUsedInsurance] = useState(String(DEFAULTS_USED.annualInsurance));
  const [usedFuel, setUsedFuel] = useState(String(DEFAULTS_USED.annualFuel));
  const [usedMaintenance, setUsedMaintenance] = useState(String(DEFAULTS_USED.annualMaintenance));
  const [usedReg, setUsedReg] = useState(String(DEFAULTS_USED.annualRegistration));
  const [usedResale, setUsedResale] = useState(String(DEFAULTS_USED.resaleValue));

  const [years, setYears] = useState("5");
  const [miles, setMiles] = useState("15000");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<ComparisonResult | null>(null);

  const newCarInputs: VehicleInputs = useMemo(() => ({
    purchasePrice: parseFloat(newPrice) || 0, downPayment: parseFloat(newDown) || 0,
    loanApr: parseFloat(newApr) || 0, loanTermYears: parseFloat(newTerm) || 0,
    annualInsurance: parseFloat(newInsurance) || 0, annualFuel: parseFloat(newFuel) || 0,
    annualMaintenance: parseFloat(newMaintenance) || 0, annualRegistration: parseFloat(newReg) || 0,
    resaleValue: parseFloat(newResale) || 0, ownershipYears: parseFloat(years) || 5, annualMiles: parseFloat(miles) || 15000,
  }), [newPrice, newDown, newApr, newTerm, newInsurance, newFuel, newMaintenance, newReg, newResale, years, miles]);

  const usedCarInputs: VehicleInputs = useMemo(() => ({
    purchasePrice: parseFloat(usedPrice) || 0, downPayment: parseFloat(usedDown) || 0,
    loanApr: parseFloat(usedApr) || 0, loanTermYears: parseFloat(usedTerm) || 0,
    annualInsurance: parseFloat(usedInsurance) || 0, annualFuel: parseFloat(usedFuel) || 0,
    annualMaintenance: parseFloat(usedMaintenance) || 0, annualRegistration: parseFloat(usedReg) || 0,
    resaleValue: parseFloat(usedResale) || 0, ownershipYears: parseFloat(years) || 5, annualMiles: parseFloat(miles) || 15000,
  }), [usedPrice, usedDown, usedApr, usedTerm, usedInsurance, usedFuel, usedMaintenance, usedReg, usedResale, years, miles]);

  useEffect(() => { setResults(calculate(DEFAULTS_NEW, DEFAULTS_USED)); }, []);
  const handleCalculate = () => setResults(calculate(newCarInputs, usedCarInputs));
  const reset = () => {
    const n = DEFAULTS_NEW, u = DEFAULTS_USED;
    setNewPrice(String(n.purchasePrice)); setNewDown(String(n.downPayment)); setNewApr(String(n.loanApr)); setNewTerm(String(n.loanTermYears));
    setNewInsurance(String(n.annualInsurance)); setNewFuel(String(n.annualFuel)); setNewMaintenance(String(n.annualMaintenance)); setNewReg(String(n.annualRegistration)); setNewResale(String(n.resaleValue));
    setUsedPrice(String(u.purchasePrice)); setUsedDown(String(u.downPayment)); setUsedApr(String(u.loanApr)); setUsedTerm(String(u.loanTermYears));
    setUsedInsurance(String(u.annualInsurance)); setUsedFuel(String(u.annualFuel)); setUsedMaintenance(String(u.annualMaintenance)); setUsedReg(String(u.annualRegistration)); setUsedResale(String(u.resaleValue));
    setYears("5"); setMiles("15000"); setShowAdvanced(false);
    setResults(calculate(DEFAULTS_NEW, DEFAULTS_USED));
  };

  const barData = results ? [
    { category: "Depreciation", new: Math.round(results.newCar.depreciation), used: Math.round(results.usedCar.depreciation) },
    { category: "Interest", new: Math.round(results.newCar.interest), used: Math.round(results.usedCar.interest) },
    { category: "Insurance", new: Math.round(results.newCar.insurance), used: Math.round(results.usedCar.insurance) },
    { category: "Fuel", new: Math.round(results.newCar.fuel), used: Math.round(results.usedCar.fuel) },
    { category: "Maintenance", new: Math.round(results.newCar.maintenance), used: Math.round(results.usedCar.maintenance) },
  ] : [];

  const faqs = [
    { question: "Is it cheaper to buy a used car or a new car?", answer: "In most cases, a used car is significantly cheaper to own over 5 years. The largest savings come from depreciation — a new car loses 20% in year 1, while a 3-year-old used car has already absorbed that loss. A typical used car saves $8,000–$15,000 in total ownership cost over 5 years compared to its new equivalent." },
    { question: "Why might a new car still be worth it?", answer: "New cars come with full warranties (saving $1,000–$3,000 in repair costs), lower maintenance costs, better fuel efficiency, latest safety features, and lower financing rates. If the warranty savings and fuel efficiency gains offset the depreciation penalty, the gap narrows." },
    { question: "How much does depreciation really cost?", answer: "On a $35,000 new car held for 5 years and sold for $18,000, depreciation is $17,000 — about $3,400/year or 49% of value. On a $22,000 used car (originally $35,000) held for 5 years and sold for $10,000, depreciation is $12,000 — about $2,400/year. The used car saves $5,000 in depreciation alone." },
    { question: "Do used cars have higher maintenance?", answer: "Yes, typically $300–$600/year more than new cars under warranty. However, this extra cost is usually dwarfed by the depreciation savings. A $500/year maintenance premium over 5 years is $2,500 — far less than the $5,000–$10,000 saved on depreciation." },
    { question: "How does financing differ?", answer: "New car loans often have lower APRs (5–7%) vs used car loans (7–9%). However, the lower principal on a used car means the total interest is often similar or lower despite the higher rate." },
    { question: "What is the break-even point?", answer: "The break-even point depends on the price gap and cost differences. For a typical scenario where the used car costs 35–40% less, it takes 0 years — the used car is cheaper from day one. Even if the used car needs $2,000 in immediate repairs, it usually still saves money within the first year." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Used vs New Car" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Used Car vs New Car Total Cost Comparison Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">New Car</div>
            <div className="grid grid-cols-2 gap-3">
              <CI id="nprice" label="Purchase Price" value={newPrice} onChange={setNewPrice} prefix="$" />
              <CI id="nins" label="Insurance / Year" value={newInsurance} onChange={setNewInsurance} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CI id="nfuel" label="Fuel / Year" value={newFuel} onChange={setNewFuel} prefix="$" />
              <CI id="nmaint" label="Maintenance / Year" value={newMaintenance} onChange={setNewMaintenance} prefix="$" />
            </div>

            <div className="border-t border-border pt-3 mt-1">
              <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Used Car</div>
              <div className="grid grid-cols-2 gap-3">
                <CI id="uprice" label="Purchase Price" value={usedPrice} onChange={setUsedPrice} prefix="$" />
                <CI id="uins" label="Insurance / Year" value={usedInsurance} onChange={setUsedInsurance} prefix="$" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CI id="ufuel" label="Fuel / Year" value={usedFuel} onChange={setUsedFuel} prefix="$" />
                <CI id="umaint" label="Maintenance / Year" value={usedMaintenance} onChange={setUsedMaintenance} prefix="$" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CI id="years" label="Ownership Years" value={years} onChange={setYears} suffix="yr" />
              <CI id="miles" label="Annual Miles" value={miles} onChange={setMiles} />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up space-y-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">New Car — Loan & Resale</div>
                  <div className="grid grid-cols-2 gap-3">
                    <CI id="ndown" label="Down Payment" value={newDown} onChange={setNewDown} prefix="$" />
                    <CI id="napr" label="Loan APR" value={newApr} onChange={setNewApr} suffix="%" />
                    <CI id="nterm" label="Loan Term" value={newTerm} onChange={setNewTerm} suffix="yr" />
                    <CI id="nresale" label="Resale Value" value={newResale} onChange={setNewResale} prefix="$" />
                    <CI id="nreg" label="Registration / Year" value={newReg} onChange={setNewReg} prefix="$" />
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Used Car — Loan & Resale</div>
                  <div className="grid grid-cols-2 gap-3">
                    <CI id="udown" label="Down Payment" value={usedDown} onChange={setUsedDown} prefix="$" />
                    <CI id="uapr" label="Loan APR" value={usedApr} onChange={setUsedApr} suffix="%" />
                    <CI id="uterm" label="Loan Term" value={usedTerm} onChange={setUsedTerm} suffix="yr" />
                    <CI id="uresale" label="Resale Value" value={usedResale} onChange={setUsedResale} prefix="$" />
                    <CI id="ureg" label="Registration / Year" value={usedReg} onChange={setUsedReg} prefix="$" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex justify-end">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                </div>

                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">
                    {results.savings > 0 ? "Used Car Saves" : "New Car Saves"}
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(Math.abs(results.savings)).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">{results.savingsPct.toFixed(1)}% over {years} years</div>
                </div>

                <div className="grid grid-cols-2 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-blue-600 tracking-wider mb-1">New Car</div>
                    <div className="text-xl font-bold text-foreground">${Math.round(results.newCar.totalCost).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">${Math.round(results.newCar.annualCost).toLocaleString()}/yr</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-emerald-600 tracking-wider mb-1">Used Car</div>
                    <div className="text-xl font-bold text-foreground">${Math.round(results.usedCar.totalCost).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">${Math.round(results.usedCar.annualCost).toLocaleString()}/yr</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Category</th>
                        <th className="p-2.5 text-right text-blue-600">New Car</th>
                        <th className="p-2.5 text-right text-emerald-600">Used Car</th>
                        <th className="p-2.5 pr-3 text-right">Difference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Depreciation", new: results.newCar.depreciation, used: results.usedCar.depreciation },
                        { label: "Interest", new: results.newCar.interest, used: results.usedCar.interest },
                        { label: "Insurance", new: results.newCar.insurance, used: results.usedCar.insurance },
                        { label: "Fuel", new: results.newCar.fuel, used: results.usedCar.fuel },
                        { label: "Maintenance", new: results.newCar.maintenance, used: results.usedCar.maintenance },
                      ].map(r => {
                        const diff = r.used - r.new;
                        return (
                          <tr key={r.label} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                            <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                            <td className="p-2.5 text-right text-foreground">${Math.round(r.new).toLocaleString()}</td>
                            <td className="p-2.5 text-right text-foreground">${Math.round(r.used).toLocaleString()}</td>
                            <td className={`p-2.5 pr-3 text-right font-medium ${diff < 0 ? "text-emerald-600" : "text-red-600"}`}>{diff > 0 ? "+" : ""}${Math.round(diff).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total Cost</td>
                        <td className="p-2.5 text-right text-blue-600">${Math.round(results.newCar.totalCost).toLocaleString()}</td>
                        <td className="p-2.5 text-right text-emerald-600">${Math.round(results.usedCar.totalCost).toLocaleString()}</td>
                        <td className={`p-2.5 pr-3 text-right font-bold ${results.savings > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {results.savings > 0 ? "Save" : "Extra"} ${Math.round(Math.abs(results.savings)).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Cost Comparison by Category</h3>
                  <div className="w-full h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === "new" ? "New Car" : "Used Car"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="new" fill="#3b82f6" name="new" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="used" fill="#10b981" name="used" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Used vs New Car Total Cost Comparison?</h2>
            <p>This calculator performs a comprehensive side-by-side comparison of the total cost of ownership for a new car versus a used car over the same ownership period. It goes beyond sticker prices to include every cost factor: depreciation, financing interest, insurance, fuel, maintenance, and registration — giving you the honest financial picture needed to make the right purchase decision.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Enter the details for both the new car and the used car you're considering. The calculator computes the total cost of ownership for each vehicle over the specified number of years, including depreciation (purchase price minus resale value), loan interest via amortization, and all annual operating costs. It then subtracts the used car total from the new car total to show the net savings — or extra cost — of choosing used.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary result shows the dollar savings from choosing the cheaper option and the percentage difference. The comparison table breaks down every category side-by-side with the difference column showing where each car wins or loses. The grouped bar chart visualizes the category-by-category comparison, making it immediately clear which cost factors favor each vehicle.</p>

            <h2 className="text-2xl font-bold mb-3">Key Differences Between New and Used Cars</h2>
            <ul>
              <li><strong>Depreciation:</strong> New cars lose 20% in year 1; used cars have already absorbed this loss. This is the #1 reason used cars are cheaper to own.</li>
              <li><strong>Maintenance:</strong> Used cars cost $300–$600/year more in maintenance but may need fewer repairs if the previous owner handled major service items.</li>
              <li><strong>Insurance:</strong> Used cars typically cost 10–20% less to insure due to lower replacement value.</li>
              <li><strong>Fuel:</strong> Newer cars may have better MPG, saving $200–$600/year — but this rarely offsets the depreciation savings.</li>
              <li><strong>Warranty:</strong> New cars include a 3–5 year warranty worth $1,500–$3,000 in potential repair savings.</li>
              <li><strong>Financing:</strong> New cars qualify for lower APRs, but the lower principal on used cars often results in similar or lower total interest.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Practical Example</h2>
            <p>A new $35,000 sedan vs a 3-year-old version at $22,000, both held for 5 years. The new car depreciates $17,000 vs $12,000 for the used. The used car has $2,500 more in maintenance but $400/year less in insurance. Net result: the used car saves approximately $8,500 over 5 years — about $1,700/year or $0.11/mile.</p>

            <h2 className="text-2xl font-bold mb-3">Tips for Making the Right Choice</h2>
            <ul>
              <li><strong>Buy slightly used (2–4 years old)</strong> for the best value — the previous owner absorbed the steepest depreciation.</li>
              <li><strong>Get a pre-purchase inspection</strong> to avoid buying a used car with hidden problems that erase the savings.</li>
              <li><strong>Compare cost per mile, not just total cost.</strong> A cheaper used car with poor fuel economy may not save as much as expected.</li>
              <li><strong>Factor in warranty transfers</strong> — some certified pre-owned vehicles carry remaining factory warranty.</li>
              <li><strong>Consider reliability ratings.</strong> A reliable used Toyota may be a better deal than an unreliable new car that spends time in the shop.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>This tool eliminates the guesswork from the new-vs-used decision by computing the actual dollar difference in total ownership cost. It accounts for every factor that dealers won't mention and helps you make a financially sound decision based on real numbers rather than sticker price perception.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/used-car-vs-new-car-total-cost-comparison-calculator" />
          <PopularCalculators exclude="/calculator/used-car-vs-new-car-total-cost-comparison-calculator" />
        </div>
      </div>
    </>
  );
};

export default UsedCarVsNewCarTotalCostComparisonCalculator;
