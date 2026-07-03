"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { ownershipCost, depreciate, fmtUsd, fmtUsd2, fmtPct } from "@/lib/auto/autoFinance";

interface TrueCostInputs {
  purchasePrice: number;
  downPayment: number;
  loanApr: number;
  loanTermYears: number;
  annualInsurance: number;
  annualFuel: number;
  annualMaintenance: number;
  annualRegistration: number;
  annualParking: number;
  resaleValue: number;
  ownershipYears: number;
  annualMiles: number;
  taxTitleFees: number;
}

interface TrueCostResults {
  depreciation: number;
  interest: number;
  insurance: number;
  fuel: number;
  maintenance: number;
  registration: number;
  parking: number;
  taxTitleFees: number;
  totalCost: number;
  monthlyCost: number;
  costPerMile: number;
  depreciationPct: number;
}

const DEFAULTS: TrueCostInputs = {
  purchasePrice: 35000,
  downPayment: 7000,
  loanApr: 6.9,
  loanTermYears: 5,
  annualInsurance: 1800,
  annualFuel: 2400,
  annualMaintenance: 800,
  annualRegistration: 400,
  annualParking: 1200,
  resaleValue: 15000,
  ownershipYears: 5,
  annualMiles: 15000,
  taxTitleFees: 2500,
};

function calculate(input: TrueCostInputs): TrueCostResults {
  const res = ownershipCost({
    purchasePrice: Math.max(0, input.purchasePrice),
    years: Math.max(1, input.ownershipYears),
    annualMiles: Math.max(0, input.annualMiles),
    aprPct: Math.max(0, input.loanApr),
    loanTermYears: Math.max(0, input.loanTermYears),
    downPayment: Math.max(0, input.downPayment),
    insuranceAnnual: Math.max(0, input.annualInsurance),
    fuelAnnual: Math.max(0, input.annualFuel),
    maintenanceAnnual: Math.max(0, input.annualMaintenance),
    registrationAnnual: Math.max(0, input.annualRegistration),
    parkingAnnual: Math.max(0, input.annualParking),
    resaleValue: Math.max(0, input.resaleValue),
  });

  const taxTitleFees = Math.max(0, input.taxTitleFees);
  const totalCost = res.totalOutOfPocket + taxTitleFees;
  const depreciationPct = input.purchasePrice > 0 ? ((res.depreciation / input.purchasePrice) * 100) : 0;

  return {
    depreciation: res.depreciation,
    interest: res.totalInterest,
    insurance: res.insurance,
    fuel: res.fuel,
    maintenance: res.maintenance,
    registration: res.registration,
    parking: res.parking,
    taxTitleFees,
    totalCost,
    monthlyCost: totalCost / Math.max(1, input.ownershipYears) / 12,
    costPerMile: res.costPerMile > 0 ? (totalCost / Math.max(1, input.annualMiles * input.ownershipYears)) : 0,
    depreciationPct,
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

const COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#10b981", "#06b6d4", "#ec4899", "#f97316", "#6366f1"];

const CarTrueCostOfOwnershipCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(String(DEFAULTS.purchasePrice));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [loanApr, setLoanApr] = useState(String(DEFAULTS.loanApr));
  const [loanTermYears, setLoanTermYears] = useState(String(DEFAULTS.loanTermYears));
  const [annualInsurance, setAnnualInsurance] = useState(String(DEFAULTS.annualInsurance));
  const [annualFuel, setAnnualFuel] = useState(String(DEFAULTS.annualFuel));
  const [annualMaintenance, setAnnualMaintenance] = useState(String(DEFAULTS.annualMaintenance));
  const [annualRegistration, setAnnualRegistration] = useState(String(DEFAULTS.annualRegistration));
  const [annualParking, setAnnualParking] = useState(String(DEFAULTS.annualParking));
  const [resaleValue, setResaleValue] = useState(String(DEFAULTS.resaleValue));
  const [ownershipYears, setOwnershipYears] = useState(String(DEFAULTS.ownershipYears));
  const [annualMiles, setAnnualMiles] = useState(String(DEFAULTS.annualMiles));
  const [taxTitleFees, setTaxTitleFees] = useState(String(DEFAULTS.taxTitleFees));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<TrueCostResults | null>(null);

  const inputs: TrueCostInputs = useMemo(() => ({
    purchasePrice: parseFloat(purchasePrice) || 0, downPayment: parseFloat(downPayment) || 0,
    loanApr: parseFloat(loanApr) || 0, loanTermYears: parseFloat(loanTermYears) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0, annualFuel: parseFloat(annualFuel) || 0,
    annualMaintenance: parseFloat(annualMaintenance) || 0, annualRegistration: parseFloat(annualRegistration) || 0,
    annualParking: parseFloat(annualParking) || 0, resaleValue: parseFloat(resaleValue) || 0,
    ownershipYears: parseFloat(ownershipYears) || 0, annualMiles: parseFloat(annualMiles) || 0,
    taxTitleFees: parseFloat(taxTitleFees) || 0,
  }), [purchasePrice, downPayment, loanApr, loanTermYears, annualInsurance, annualFuel, annualMaintenance, annualRegistration, annualParking, resaleValue, ownershipYears, annualMiles, taxTitleFees]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    const d = DEFAULTS;
    setPurchasePrice(String(d.purchasePrice)); setDownPayment(String(d.downPayment)); setLoanApr(String(d.loanApr)); setLoanTermYears(String(d.loanTermYears));
    setAnnualInsurance(String(d.annualInsurance)); setAnnualFuel(String(d.annualFuel)); setAnnualMaintenance(String(d.annualMaintenance));
    setAnnualRegistration(String(d.annualRegistration)); setAnnualParking(String(d.annualParking)); setResaleValue(String(d.resaleValue));
    setOwnershipYears(String(d.ownershipYears)); setAnnualMiles(String(d.annualMiles)); setTaxTitleFees(String(d.taxTitleFees)); setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const barData = results ? [
    { name: "Depreciation", value: Math.round(results.depreciation), color: COLORS[0] },
    { name: "Interest", value: Math.round(results.interest), color: COLORS[1] },
    { name: "Insurance", value: Math.round(results.insurance), color: COLORS[2] },
    { name: "Fuel", value: Math.round(results.fuel), color: COLORS[3] },
    { name: "Maintenance", value: Math.round(results.maintenance), color: COLORS[4] },
    { name: "Registration", value: Math.round(results.registration), color: COLORS[5] },
    { name: "Parking", value: Math.round(results.parking), color: COLORS[6] },
    { name: "Tax/Title/Fees", value: Math.round(results.taxTitleFees), color: COLORS[7] },
  ] : [];

  const depreciationCurve = results ? depreciate(Math.max(0, inputs.purchasePrice), Math.max(1, inputs.ownershipYears)) : [];

  const faqs = [
    { question: "What is the true cost of owning a car?", answer: "The true cost includes every dollar you spend on a vehicle over your ownership period: depreciation (typically the largest expense), financing interest, insurance, fuel, maintenance, registration, parking, and taxes/title fees. For a typical mid-range sedan, this totals $35,000–$55,000 over five years — far exceeding the sticker price perception." },
    { question: "Why is depreciation the largest hidden cost?", answer: "Depreciation is the difference between what you pay and what the car is worth when you sell. New cars lose 20% in year 1 and about 15% per year after. On a $35,000 car held for 5 years, you lose $17,000–$20,000 in value — money that is invisible because it never shows up as a bill." },
    { question: "How does the true cost differ from the monthly payment?", answer: "The monthly payment only covers the loan principal and interest. It ignores depreciation ($3,000–$5,000/yr), insurance ($1,500–$2,500/yr), fuel ($1,800–$3,000/yr), maintenance ($500–$1,200/yr), registration, parking, and taxes. The true cost is typically 2–3x the monthly payment when annualized." },
    { question: "What is a typical true cost for a new car?", answer: "A new mid-range sedan ($30,000–$40,000) typically costs $7,000–$10,000 per year in true ownership costs, or $0.50–$0.70 per mile. Luxury vehicles can exceed $12,000/year. Economy cars kept long-term can drop below $5,000/year." },
    { question: "How can I reduce the true cost of ownership?", answer: "Buy vehicles with strong resale value, pay cash or choose short loan terms, shop insurance annually, maintain on schedule, drive fewer miles, choose fuel-efficient models, and park for free when possible. The single biggest lever is holding the car longer — 8–10 years instead of 3–5." },
    { question: "Should I include taxes and title fees?", answer: "Yes. Sales tax (5–10% of purchase price), title fees, and dealer doc fees add $1,500–$4,000 to the initial cost. These are real out-of-pocket expenses that contribute to the true cost of ownership." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "True Cost of Ownership" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car True Cost of Ownership Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="price" label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
              <CI id="years" label="Ownership Years" value={ownershipYears} onChange={setOwnershipYears} suffix="yr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="insurance" label="Insurance / Year" value={annualInsurance} onChange={setAnnualInsurance} prefix="$" />
              <CI id="fuel" label="Fuel / Year" value={annualFuel} onChange={setAnnualFuel} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="maintenance" label="Maintenance / Year" value={annualMaintenance} onChange={setAnnualMaintenance} prefix="$" />
              <CI id="miles" label="Annual Miles" value={annualMiles} onChange={setAnnualMiles} />
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
                  <CI id="resale" label="Resale Value" value={resaleValue} onChange={setResaleValue} prefix="$" />
                  <CI id="reg" label="Registration / Year" value={annualRegistration} onChange={setAnnualRegistration} prefix="$" />
                  <CI id="park" label="Parking / Year" value={annualParking} onChange={setAnnualParking} prefix="$" />
                  <CI id="tax" label="Tax/Title/Fees" value={taxTitleFees} onChange={setTaxTitleFees} prefix="$" />
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

                <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-red-600 mb-1 uppercase tracking-wider">True Cost of Ownership</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.totalCost).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">${Math.round(results.monthlyCost).toLocaleString()}/mo · ${results.costPerMile.toFixed(2)}/mile</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.monthlyCost).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Per Mile</div>
                    <div className="text-lg font-bold text-foreground">${results.costPerMile.toFixed(2)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Depreciation</div>
                    <div className="text-lg font-bold text-red-600">{results.depreciationPct.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Cost Category</th>
                        <th className="p-2.5 pr-3 text-right w-[120px]">Total</th>
                        <th className="p-2.5 pr-3 text-right w-[100px]">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {barData.map((r, i) => {
                        const pct = results.totalCost > 0 ? (r.value / results.totalCost * 100) : 0;
                        return (
                          <tr key={r.name} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                            <td className="p-2.5 pl-3 font-semibold text-foreground"><span className="inline-block w-2.5 h-2.5 rounded-sm mr-2" style={{ background: r.color }} />{r.name}</td>
                            <td className="p-2.5 text-right text-foreground">${r.value.toLocaleString()}</td>
                            <td className="p-2.5 pr-3 text-right font-medium">{pct.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total True Cost</td>
                        <td className="p-2.5 text-right">${Math.round(results.totalCost).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-primary">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Cost Breakdown by Category</h3>
                  <div className="w-full h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Depreciation Curve</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {depreciationCurve.map((val, yr) => (
                      <div key={yr} className="flex items-center justify-between text-sm rounded-md border border-border bg-background px-2.5 py-1.5">
                        <span className="text-muted-foreground font-medium">Year {yr}</span>
                        <span className="font-bold text-foreground">${Math.round(val).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the True Cost of Car Ownership?</h2>
            <p>The true cost of owning a car goes far beyond the sticker price or monthly payment. It encompasses every dollar you spend from the moment you purchase to the moment you sell — including depreciation (the silent wealth destroyer), financing interest, insurance premiums, fuel, maintenance, registration, parking, and taxes. For a typical mid-range sedan, the true cost over five years is $35,000–$55,000, yet most car buyers only consider the $400–$600/month payment.</p>
            <p>This calculator reveals the full picture so you can make informed decisions about which vehicle truly fits your budget and financial goals.</p>

            <h2>How the Calculator Works</h2>
            <p>The Car True Cost of Ownership Calculator aggregates every cost component into a single, honest total. Depreciation is computed as the difference between purchase price and estimated resale value. Loan interest uses the standard amortization formula on the financed amount. Insurance, fuel, maintenance, registration, and parking are annualized and multiplied by the ownership period. Tax, title, and dealer fees are added as a one-time initial expense. The result is the true dollar cost of owning the vehicle — expressed as a total, monthly, and per-mile figure.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary result card shows your true cost of ownership in bold. Below, three stats show monthly cost, per-mile cost, and the depreciation percentage. The breakdown table itemizes every cost category with its dollar amount and percentage of total — depreciation typically dominates at 35–50%. The bar chart visualizes the proportional split, and the depreciation curve shows your car's estimated market value at each year of ownership.</p>

            <h2>Key Factors That Determine True Cost</h2>
            <ul>
              <li><strong>Depreciation:</strong> The largest hidden cost. New cars lose 20% in year one, then ~15% per year. Choosing a vehicle with strong resale value (Toyota, Honda, Porsche) can save $5,000–$10,000 over five years.</li>
              <li><strong>Financing:</strong> A 72-month loan at 7% APR on $28,000 costs $6,600 in interest. Paying cash or choosing a shorter term eliminates thousands in finance charges.</li>
              <li><strong>Insurance:</strong> Varies dramatically by vehicle type, driver profile, and location. Sports cars in urban areas can cost 2–3x more than sedans in suburbs.</li>
              <li><strong>Fuel:</strong> A 10 MPG improvement on 15,000 miles/year saves $700–$1,000 annually at $3.50/gallon. EVs can reduce fuel costs by 60–70%.</li>
              <li><strong>Maintenance:</strong> Budget $500/year for new cars under warranty, rising to $1,000–$1,500/year for vehicles over 100,000 miles.</li>
            </ul>

            <h2>Practical Examples</h2>
            <h3>Example 1: Mid-range sedan ($35,000)</h3>
            <p>A $35,000 sedan financed at 6.9% over 5 years with $7,000 down, $1,800 insurance, $2,400 fuel, $800 maintenance, $400 registration, $1,200 parking, and $2,500 in taxes/title fees, sold for $15,000 after 5 years, has a true cost of ownership of approximately $42,000 — or $8,400/year and $0.56/mile.</p>
            <h3>Example 2: Economy car ($22,000)</h3>
            <p>A $22,000 economy car purchased with cash (no interest), $1,300 insurance, $1,600 fuel (35 MPG), $500 maintenance, $300 registration, $0 parking, $1,500 in taxes/title, sold for $10,000 after 7 years — true cost is approximately $29,000 over 7 years, or $4,100/year and $0.39/mile.</p>
            <h3>Example 3: Luxury SUV ($55,000)</h3>
            <p>A $55,000 luxury SUV with $11,000 down, 7.5% APR over 5 years, $2,800 insurance, $3,200 fuel (18 MPG), $1,200 maintenance, $600 registration, $2,400 parking, $3,500 taxes/title, sold for $26,000 after 5 years — true cost is approximately $62,000, or $12,400/year and $1.03/mile.</p>

            <h2>Tips to Reduce Your True Cost of Ownership</h2>
            <ul>
              <li><strong>Keep cars longer.</strong> The steepest depreciation happens in years 1–3. Holding a car 8–10 years dramatically lowers annual cost.</li>
              <li><strong>Buy models with strong resale value.</strong> Toyota, Honda, and Subaru consistently retain value best.</li>
              <li><strong>Pay cash when possible.</strong> Eliminating loan interest saves $3,000–$7,000 over a typical ownership period.</li>
              <li><strong>Shop insurance annually.</strong> Rates can vary 40%+ between carriers for identical coverage.</li>
              <li><strong>Maintain on schedule.</strong> Preventive maintenance costs far less than emergency repairs.</li>
              <li><strong>Consider fuel efficiency.</strong> A 10 MPG improvement saves $700+ per year at average driving distances.</li>
            </ul>

            <h2>Benefits of Using This Calculator</h2>
            <p>This calculator strips away the illusions of monthly payment marketing and reveals the honest, total cost of owning any vehicle. By seeing every cost component side-by-side, you can make smarter purchase decisions, budget realistically, and understand exactly how much your vehicle choice impacts your long-term finances. It transforms car shopping from a payment-focused exercise into a total-cost analysis.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-true-cost-of-ownership-calculator" />
          <PopularCalculators exclude="/calculator/car-true-cost-of-ownership-calculator" />
        </div>
      </div>
    </>
  );
};

export default CarTrueCostOfOwnershipCalculator;
