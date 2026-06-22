"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ownershipCost, depreciate, fmtUsd } from "@/lib/auto/autoFinance";

interface Inputs {
  purchasePrice: number;
  downPayment: number;
  loanApr: number;
  loanTermYears: number;
  annualInsurance: number;
  annualFuel: number;
  annualMaintenance: number;
  annualRegistration: number;
  annualParking: number;
  annualMiles: number;
}

interface Results {
  totalCost: number;
  annualCost: number;
  monthlyCost: number;
  costPerMile: number;
  depreciation: number;
  interest: number;
  insurance: number;
  fuel: number;
  maintenance: number;
  registration: number;
  parking: number;
  finalValue: number;
}

const HORIZON = 5;

const DEFAULTS: Inputs = {
  purchasePrice: 35000, downPayment: 7000, loanApr: 6.9, loanTermYears: 5,
  annualInsurance: 1800, annualFuel: 2400, annualMaintenance: 800,
  annualRegistration: 400, annualParking: 600, annualMiles: 15000,
};

function calculate(input: Inputs): Results {
  const depCurve = depreciate(Math.max(0, input.purchasePrice), HORIZON);
  const resaleValue = depCurve[HORIZON] ?? 0;
  const res = ownershipCost({
    purchasePrice: Math.max(0, input.purchasePrice), years: HORIZON,
    annualMiles: Math.max(0, input.annualMiles), aprPct: Math.max(0, input.loanApr),
    loanTermYears: Math.max(0, input.loanTermYears), downPayment: Math.max(0, input.downPayment),
    insuranceAnnual: Math.max(0, input.annualInsurance), fuelAnnual: Math.max(0, input.annualFuel),
    maintenanceAnnual: Math.max(0, input.annualMaintenance), registrationAnnual: Math.max(0, input.annualRegistration),
    parkingAnnual: Math.max(0, input.annualParking), resaleValue,
  });
  return {
    totalCost: res.totalOutOfPocket, annualCost: res.annualCost, monthlyCost: res.monthlyCost,
    costPerMile: res.costPerMile, depreciation: res.depreciation, interest: res.totalInterest,
    insurance: res.insurance, fuel: res.fuel, maintenance: res.maintenance,
    registration: res.registration, parking: res.parking, finalValue: resaleValue,
  };
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

const COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#10b981", "#06b6d4", "#ec4899", "#f97316"];

const FiveYearOwnershipCostCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(String(DEFAULTS.purchasePrice));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [loanApr, setLoanApr] = useState(String(DEFAULTS.loanApr));
  const [loanTermYears, setLoanTermYears] = useState(String(DEFAULTS.loanTermYears));
  const [annualInsurance, setAnnualInsurance] = useState(String(DEFAULTS.annualInsurance));
  const [annualFuel, setAnnualFuel] = useState(String(DEFAULTS.annualFuel));
  const [annualMaintenance, setAnnualMaintenance] = useState(String(DEFAULTS.annualMaintenance));
  const [annualRegistration, setAnnualRegistration] = useState(String(DEFAULTS.annualRegistration));
  const [annualParking, setAnnualParking] = useState(String(DEFAULTS.annualParking));
  const [annualMiles, setAnnualMiles] = useState(String(DEFAULTS.annualMiles));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  const inputs: Inputs = useMemo(() => ({
    purchasePrice: parseFloat(purchasePrice) || 0, downPayment: parseFloat(downPayment) || 0,
    loanApr: parseFloat(loanApr) || 0, loanTermYears: parseFloat(loanTermYears) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0, annualFuel: parseFloat(annualFuel) || 0,
    annualMaintenance: parseFloat(annualMaintenance) || 0, annualRegistration: parseFloat(annualRegistration) || 0,
    annualParking: parseFloat(annualParking) || 0, annualMiles: parseFloat(annualMiles) || 0,
  }), [purchasePrice, downPayment, loanApr, loanTermYears, annualInsurance, annualFuel, annualMaintenance, annualRegistration, annualParking, annualMiles]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    const d = DEFAULTS;
    setPurchasePrice(String(d.purchasePrice)); setDownPayment(String(d.downPayment)); setLoanApr(String(d.loanApr)); setLoanTermYears(String(d.loanTermYears));
    setAnnualInsurance(String(d.annualInsurance)); setAnnualFuel(String(d.annualFuel)); setAnnualMaintenance(String(d.annualMaintenance));
    setAnnualRegistration(String(d.annualRegistration)); setAnnualParking(String(d.annualParking)); setAnnualMiles(String(d.annualMiles)); setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const pieData = results ? [
    { name: "Depreciation", value: Math.round(results.depreciation), color: COLORS[0] },
    { name: "Interest", value: Math.round(results.interest), color: COLORS[1] },
    { name: "Insurance", value: Math.round(results.insurance), color: COLORS[2] },
    { name: "Fuel", value: Math.round(results.fuel), color: COLORS[3] },
    { name: "Maintenance", value: Math.round(results.maintenance), color: COLORS[4] },
    { name: "Registration", value: Math.round(results.registration), color: COLORS[5] },
    { name: "Parking", value: Math.round(results.parking), color: COLORS[6] },
  ] : [];
  const activePie = pieData.filter(d => d.value > 0);
  const pieTotal = activePie.reduce((s, d) => s + d.value, 0);

  const faqs = [
    { question: "What does a 5-year ownership cost include?", answer: "It includes every dollar spent over 5 years: depreciation (the drop in your car's value), loan interest, insurance, fuel, maintenance, registration, and parking. For a typical $35,000 car, this totals $35,000–$50,000 over 5 years." },
    { question: "Why is 5 years the standard ownership period?", answer: "Five years is the average length of new car ownership in the US and aligns with the typical loan term (60 months). It's also when the steepest depreciation has occurred, making it a natural evaluation point." },
    { question: "How much does a $35,000 car cost over 5 years?", answer: "A $35,000 sedan financed at 7% with typical operating costs depreciates about $17,000, incurs $5,000 in interest, $9,000 in insurance, $12,000 in fuel, $4,000 in maintenance, $2,000 in registration, and $3,000 in parking — totaling approximately $52,000 over 5 years or $10,400/year." },
    { question: "Does depreciation really dominate?", answer: "Yes. Depreciation is typically 35–50% of total ownership cost. On a $35,000 car sold for $18,000 after 5 years, depreciation alone is $17,000 — more than any other single category." },
    { question: "How can I reduce my 5-year cost?", answer: "Choose vehicles with strong resale value, pay cash or use short loan terms, shop insurance annually, maintain on schedule, and keep the car the full 5 years rather than replacing after 2–3." },
    { question: "Is 5 years enough or should I plan for longer?", answer: "Financially, keeping a car 8–10 years is more efficient because depreciation flattens and loan interest ends. However, rising maintenance costs after 100,000 miles may offset some savings." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "5-Year Ownership Cost" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">5-Year Ownership Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="price" label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
              <CI id="miles" label="Annual Miles" value={annualMiles} onChange={setAnnualMiles} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="insurance" label="Insurance / Year" value={annualInsurance} onChange={setAnnualInsurance} prefix="$" />
              <CI id="fuel" label="Fuel / Year" value={annualFuel} onChange={setAnnualFuel} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="maintenance" label="Maintenance / Year" value={annualMaintenance} onChange={setAnnualMaintenance} prefix="$" />
              <CI id="reg" label="Registration / Year" value={annualRegistration} onChange={setAnnualRegistration} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CI id="down" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
                  <CI id="apr" label="Loan APR" value={loanApr} onChange={setLoanApr} suffix="%" />
                  <CI id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="yr" />
                  <CI id="park" label="Parking / Year" value={annualParking} onChange={setAnnualParking} prefix="$" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
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

                <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-amber-600 mb-1 uppercase tracking-wider">5-Year Total Ownership Cost</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.totalCost).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">${Math.round(results.annualCost).toLocaleString()}/yr · ${results.costPerMile.toFixed(2)}/mi · Est. value after 5yr: ${Math.round(results.finalValue).toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Annual</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.annualCost).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.monthlyCost).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Per Mile</div>
                    <div className="text-lg font-bold text-foreground">${results.costPerMile.toFixed(2)}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Cost Category</th>
                        <th className="p-2.5 text-right">Annual</th>
                        <th className="p-2.5 pr-3 text-right">5-Year Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Depreciation", annual: results.depreciation / 5, total: results.depreciation, cls: "text-red-600" },
                        { label: "Loan Interest", annual: results.interest / 5, total: results.interest, cls: "text-amber-600" },
                        { label: "Insurance", annual: results.insurance / 5, total: results.insurance, cls: "text-violet-600" },
                        { label: "Fuel", annual: results.fuel / 5, total: results.fuel, cls: "text-emerald-600" },
                        { label: "Maintenance", annual: results.maintenance / 5, total: results.maintenance, cls: "text-cyan-600" },
                        { label: "Registration", annual: results.registration / 5, total: results.registration, cls: "text-pink-600" },
                        { label: "Parking", annual: results.parking / 5, total: results.parking, cls: "text-orange-600" },
                      ].map(r => (
                        <tr key={r.label} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className="p-2.5 text-right text-foreground">${Math.round(r.annual).toLocaleString()}</td>
                          <td className={`p-2.5 pr-3 text-right font-medium ${r.cls}`}>${Math.round(r.total).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total</td>
                        <td className="p-2.5 text-right">${Math.round(results.annualCost).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-primary">${Math.round(results.totalCost).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border bg-card">
                  <div className="w-full sm:w-1/2 flex justify-center shrink-0">
                    {activePie.length > 0 && (
                      <div className="w-[200px] h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={activePie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                              {activePie.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">5 Years</span>
                          <span className="text-lg font-extrabold text-foreground">${Math.round(results.totalCost).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-col gap-2">
                    {activePie.map(d => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
                        <span className="text-foreground font-medium flex-1">{d.name}</span>
                        <span className="text-muted-foreground tabular-nums">{pieTotal > 0 ? ((d.value / pieTotal) * 100).toFixed(1) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the 5-Year Ownership Cost Calculator?</h2>
            <p>The 5-Year Ownership Cost Calculator estimates the total cost of owning a vehicle over five years — the most common ownership period in the United States. It goes beyond the purchase price to include depreciation, financing interest, insurance, fuel, maintenance, registration, and parking. The result is the true dollar amount you will spend over 60 months of ownership.</p>
            <p>Five years is a natural evaluation horizon because it aligns with the typical auto loan term and marks the point where the steepest depreciation has already occurred.</p>

            <h2>How It Works</h2>
            <p>The calculator uses the standard accelerated depreciation model (20% first year, 15% per year after) to estimate your car's resale value after 5 years. Loan interest is computed via amortization on the financed amount. Annual costs for insurance, fuel, maintenance, registration, and parking are summed over 5 years. The total represents every dollar out of pocket, excluding the resale value which is already accounted for via depreciation.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary result shows the total 5-year cost. The 3-stat bar converts this to annual, monthly, and per-mile figures. The breakdown table shows each cost category as annual and 5-year totals. The donut chart reveals the proportional split — depreciation typically takes the largest slice at 35–50%.</p>

            <h2>Key Factors in 5-Year Cost</h2>
            <ul>
              <li><strong>Depreciation:</strong> The single largest cost. On a $35,000 car, expect $15,000–$18,000 in value loss over 5 years.</li>
              <li><strong>Loan interest:</strong> A 5-year loan at 7% on $28,000 adds about $5,300 in interest.</li>
              <li><strong>Insurance:</strong> $1,500–$2,500/year — $7,500–$12,500 over 5 years.</li>
              <li><strong>Fuel:</strong> At 25 MPG and $3.50/gallon, 15,000 miles/year costs about $2,100/year or $10,500 over 5 years.</li>
              <li><strong>Maintenance:</strong> Rises from $500/year (new) to $1,000+/year as the car ages.</li>
            </ul>

            <h2>Practical Examples</h2>
            <p>A $35,000 sedan over 5 years: ~$45,000 total ($9,000/year, $0.60/mile). A $25,000 compact: ~$32,000 total ($6,400/year, $0.43/mile). A $50,000 luxury SUV: ~$62,000 total ($12,400/year, $0.83/mile).</p>

            <h2>Tips to Reduce Your 5-Year Cost</h2>
            <ul>
              <li><strong>Buy vehicles with strong resale value</strong> — this alone can save $5,000–$8,000 over 5 years.</li>
              <li><strong>Pay cash or use a short loan term</strong> to minimize interest.</li>
              <li><strong>Shop insurance every year</strong> to capture competitive rates.</li>
              <li><strong>Maintain on schedule</strong> to prevent costly breakdowns.</li>
              <li><strong>Consider fuel efficiency</strong> — a 10 MPG improvement saves $3,500 over 5 years.</li>
            </ul>

            <h2>Benefits of Using This Calculator</h2>
            <p>This tool gives you the complete financial picture for a 5-year ownership horizon — the period most people actually keep their cars. Use it before purchasing to compare vehicles honestly and budget accurately for the full cost, not just the monthly payment.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/5-year-ownership-cost-calculator" />
          <PopularCalculators exclude="/calculator/5-year-ownership-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default FiveYearOwnershipCostCalculator;
