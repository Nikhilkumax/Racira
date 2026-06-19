"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ownershipCost, costPerMile, depreciate, fmtUsd, fmtUsd2 } from "@/lib/auto/autoFinance";

interface AnnualCostInputs {
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
}

interface AnnualCostResults {
  annualCost: number;
  monthlyCost: number;
  costPerMile: number;
  depreciationTotal: number;
  interestTotal: number;
  insuranceTotal: number;
  fuelTotal: number;
  maintenanceTotal: number;
  registrationTotal: number;
  parkingTotal: number;
  netCost: number;
}

const DEFAULTS: AnnualCostInputs = {
  purchasePrice: 35000,
  downPayment: 7000,
  loanApr: 6.9,
  loanTermYears: 5,
  annualInsurance: 1800,
  annualFuel: 2400,
  annualMaintenance: 800,
  annualRegistration: 400,
  annualParking: 1200,
  resaleValue: 18000,
  ownershipYears: 5,
  annualMiles: 15000,
};

function calculate(input: AnnualCostInputs): AnnualCostResults {
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

  return {
    annualCost: res.annualCost,
    monthlyCost: res.monthlyCost,
    costPerMile: res.costPerMile,
    depreciationTotal: res.depreciation,
    interestTotal: res.totalInterest,
    insuranceTotal: res.insurance,
    fuelTotal: res.fuel,
    maintenanceTotal: res.maintenance,
    registrationTotal: res.registration,
    parkingTotal: res.parking,
    netCost: res.totalOutOfPocket,
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

const AnnualCarCostCalculator = () => {
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<AnnualCostResults | null>(null);

  const inputs: AnnualCostInputs = useMemo(() => ({
    purchasePrice: parseFloat(purchasePrice) || 0,
    downPayment: parseFloat(downPayment) || 0,
    loanApr: parseFloat(loanApr) || 0,
    loanTermYears: parseFloat(loanTermYears) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0,
    annualFuel: parseFloat(annualFuel) || 0,
    annualMaintenance: parseFloat(annualMaintenance) || 0,
    annualRegistration: parseFloat(annualRegistration) || 0,
    annualParking: parseFloat(annualParking) || 0,
    resaleValue: parseFloat(resaleValue) || 0,
    ownershipYears: parseFloat(ownershipYears) || 0,
    annualMiles: parseFloat(annualMiles) || 0,
  }), [purchasePrice, downPayment, loanApr, loanTermYears, annualInsurance, annualFuel, annualMaintenance, annualRegistration, annualParking, resaleValue, ownershipYears, annualMiles]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);

  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    const d = DEFAULTS;
    setPurchasePrice(String(d.purchasePrice)); setDownPayment(String(d.downPayment)); setLoanApr(String(d.loanApr)); setLoanTermYears(String(d.loanTermYears));
    setAnnualInsurance(String(d.annualInsurance)); setAnnualFuel(String(d.annualFuel)); setAnnualMaintenance(String(d.annualMaintenance));
    setAnnualRegistration(String(d.annualRegistration)); setAnnualParking(String(d.annualParking)); setResaleValue(String(d.resaleValue));
    setOwnershipYears(String(d.ownershipYears)); setAnnualMiles(String(d.annualMiles)); setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const pieData = results ? [
    { name: "Depreciation", value: Math.round(results.depreciationTotal), color: "#ef4444" },
    { name: "Interest", value: Math.round(results.interestTotal), color: "#f59e0b" },
    { name: "Insurance", value: Math.round(results.insuranceTotal), color: "#8b5cf6" },
    { name: "Fuel", value: Math.round(results.fuelTotal), color: "#10b981" },
    { name: "Maintenance", value: Math.round(results.maintenanceTotal), color: "#06b6d4" },
    { name: "Registration", value: Math.round(results.registrationTotal), color: "#ec4899" },
    { name: "Parking", value: Math.round(results.parkingTotal), color: "#f97316" },
  ] : [];
  const activePieData = pieData.filter((d) => d.value > 0);
  const pieTotal = activePieData.reduce((s, d) => s + d.value, 0);

  const faqs = [
    { question: "What is the true annual cost of owning a car?", answer: "The true annual cost includes depreciation (the largest hidden cost), financing interest, insurance, fuel, maintenance, registration, and parking. Most people underestimate depreciation and forget registration and parking, leading to a cost that is 50–100% higher than they expected." },
    { question: "How much does depreciation cost per year?", answer: "New cars typically lose 20% of their value in year 1 and 15% per year thereafter (on the remaining value). On a $35,000 car, depreciation alone averages $4,500–$6,000 per year for the first five years." },
    { question: "Is fuel or depreciation the bigger cost?", answer: "For most vehicles, depreciation is significantly larger than fuel. On a $35,000 car driven 15,000 miles/year at 25 MPG with $3.50/gallon gas, fuel costs about $2,100/year. Depreciation averages $4,000–$6,000/year. Combined with insurance, depreciation typically exceeds fuel 3:1." },
    { question: "How does the loan term affect annual cost?", answer: "Longer loan terms reduce monthly payments but increase total interest. A 72-month loan at 7% on $28,000 adds $6,600 in interest over the life of the loan, whereas a 48-month loan at the same rate adds only $4,200. Shorter terms lower annual cost." },
    { question: "Should I include parking costs?", answer: "Yes, if you pay for parking regularly — whether at work, downtown, or at home in a city. Monthly parking in major metro areas can run $200–$400, which adds $2,400–$4,800 to annual cost and is frequently overlooked." },
    { question: "How do I estimate my resale value?", answer: "Use Kelley Blue Book or Edmunds to find the estimated private-party or trade-in value for your vehicle at the age and mileage you plan to sell. Subtract that from your purchase price to get depreciation." },
    { question: "What is a good annual cost for a car?", answer: "A reasonable benchmark for a mid-range sedan is $6,000–$9,000 per year including all costs. Luxury vehicles often exceed $12,000/year. Electric vehicles may have lower fuel and maintenance but higher depreciation and insurance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Annual Car Cost" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Annual Car Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
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

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Annual Cost of Ownership</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.annualCost).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">${results.monthlyCost.toFixed(0)}/mo · ${results.costPerMile.toFixed(2)}/mile</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly</div>
                    <div className="text-lg font-bold text-foreground">${results.monthlyCost.toFixed(0)}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Per Mile</div>
                    <div className="text-lg font-bold text-foreground">${results.costPerMile.toFixed(2)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total ({inputs.ownershipYears}yr)</div>
                    <div className="text-lg font-bold text-blue-600">${Math.round(results.netCost).toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Cost Category</th>
                        <th className="p-2.5 text-right w-[110px]">Annual</th>
                        <th className="p-2.5 pr-3 text-right w-[120px]">Total ({Math.round(inputs.ownershipYears)}yr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Depreciation", annual: results.depreciationTotal / Math.max(1, inputs.ownershipYears), total: results.depreciationTotal, cls: "text-red-600" },
                        { label: "Loan Interest", annual: results.interestTotal / Math.max(1, inputs.ownershipYears), total: results.interestTotal, cls: "text-amber-600" },
                        { label: "Insurance", annual: inputs.annualInsurance, total: results.insuranceTotal, cls: "text-violet-600" },
                        { label: "Fuel", annual: inputs.annualFuel, total: results.fuelTotal, cls: "text-emerald-600" },
                        { label: "Maintenance", annual: inputs.annualMaintenance, total: results.maintenanceTotal, cls: "text-cyan-600" },
                        { label: "Registration", annual: inputs.annualRegistration, total: results.registrationTotal, cls: "text-pink-600" },
                        { label: "Parking", annual: inputs.annualParking, total: results.parkingTotal, cls: "text-orange-600" },
                      ].map((r) => (
                        <tr key={r.label} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className="p-2.5 text-right text-foreground">${Math.round(r.annual).toLocaleString()}</td>
                          <td className={`p-2.5 pr-3 text-right font-medium ${r.cls}`}>${Math.round(r.total).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total</td>
                        <td className="p-2.5 text-right">${Math.round(results.annualCost).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-primary">${Math.round(results.netCost).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border bg-card">
                  <div className="w-full sm:w-1/2 flex justify-center shrink-0">
                    {activePieData.length > 0 && (
                      <div className="w-[200px] h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={activePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                              {activePieData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">/ Year</span>
                          <span className="text-lg font-extrabold text-foreground">${Math.round(results.annualCost).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-col gap-2">
                    {activePieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
                        <span className="text-foreground font-medium flex-1">{d.name}</span>
                        <span className="text-muted-foreground tabular-nums">{pieTotal > 0 ? ((d.value / pieTotal) * 100).toFixed(1) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">Purchase price:</span><span className="font-medium text-foreground">${Math.round(inputs.purchasePrice).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ownership period:</span><span className="font-medium text-foreground">{Math.round(inputs.ownershipYears)} years</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Annual miles:</span><span className="font-medium text-foreground">{Math.round(inputs.annualMiles).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Resale value:</span><span className="font-medium text-foreground">${Math.round(inputs.resaleValue).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Depreciation:</span><span className="font-medium text-foreground">${Math.round(results.depreciationTotal).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Cost per mile:</span><span className="font-medium text-foreground">${results.costPerMile.toFixed(2)}</span></div>
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between text-base">
                    <span className="font-semibold text-foreground">Total cost of ownership:</span>
                    <span className="font-bold text-primary">${Math.round(results.netCost).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
            <h2>What Is the Annual Car Cost Calculator?</h2>
            <p>The Annual Car Cost Calculator computes the full yearly cost of owning a vehicle — not just the monthly payment, but every expense: depreciation, loan interest, insurance, fuel, maintenance, registration fees, and parking. By revealing the true cost per year and per mile, it helps you budget accurately, compare vehicles objectively, and decide whether a car upgrade is financially justified.</p>
            <p>Most car buyers focus on the monthly payment and dramatically underestimate total ownership cost. Studies consistently show that the average American spends $8,000–$10,000 per year on their vehicle, yet most people would guess half that figure. This calculator eliminates the guesswork.</p>

            <h2>How It Works</h2>
            <p>Depreciation is computed as purchase price minus resale value. Loan interest uses the standard amortization formula M = P × r(1+r)^n / ((1+r)^n − 1) on the financed amount (price minus down payment). All other costs (insurance, fuel, maintenance, registration, parking) are annualized inputs multiplied by the ownership period. The total out-of-pocket cost is the sum of all components, and dividing by years gives the annual cost, by months gives monthly cost, and by total miles gives cost per mile.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary result is your annual cost — typically $6,000–$12,000 for a mid-range vehicle. The 3-stat bar shows the same figure as a monthly payment and per-mile cost for easy comparison to rideshares, transit, or other vehicles. The breakdown table itemizes every cost category as annual and total. The donut chart shows the proportional split — depreciation usually dominates at 35–50% of the total. The summary recaps all inputs and outputs.</p>

            <h2>Key Factors That Drive Annual Cost</h2>
            <ul>
              <li><strong>Depreciation:</strong> The single largest cost for most vehicles. A new car loses 15–20% in year 1 alone. Choosing a vehicle with strong resale value (Toyota, Honda, some luxury brands) dramatically reduces annual cost.</li>
              <li><strong>Fuel:</strong> Driven by fuel price, MPG, and annual miles. A 10 MPG improvement on a 15,000-mile/year vehicle saves $700–$1,000 annually at $3.50/gallon.</li>
              <li><strong>Insurance:</strong> Varies 50%+ by vehicle, driver age, location, and coverage level. A sports car in a high-crime urban area can cost 3x more to insure than a sedan in a suburb.</li>
              <li><strong>Maintenance:</strong> Rises with vehicle age — budget $500/year for a new car under warranty, $800–$1,200 for a 5–10-year-old vehicle.</li>
              <li><strong>Parking:</strong> Frequently forgotten but significant in cities — $200–$400/month is common in major metros.</li>
              <li><strong>Loan interest:</strong> Minimized by shorter terms and lower APRs. A cash purchase eliminates this entirely.</li>
            </ul>

            <h2>Advanced Features</h2>
            <p>The Advanced Options panel exposes down payment, loan APR, loan term, resale value, registration, and parking. Use resale value from Kelley Blue Book for accuracy. Registration varies by state — check your DMV schedule. Parking is easy to overlook but adds thousands in cities.</p>

            <h2>Practical Examples</h2>
            <h3>Example 1: Mid-range sedan</h3>
            <p>A $35,000 sedan financed at 6.9% with $7,000 down, $1,800 insurance, $2,400 fuel, $800 maintenance, $400 registration, and $1,200 parking, sold after 5 years for $18,000, costs about $9,800/year or $0.65/mile. Depreciation ($3,400/yr) and parking ($1,200/yr) together exceed fuel.</p>
            <h3>Example 2: Compact economy car</h3>
            <p>A $24,000 compact with $5,000 down, $1,400 insurance, $1,800 fuel (35 MPG), $600 maintenance, $300 registration, $0 parking, sold after 5 years for $12,000, costs about $6,200/year or $0.41/mile — roughly 37% less than the mid-range sedan.</p>
            <h3>Example 3: Luxury SUV</h3>
            <p>A $55,000 luxury SUV with $11,000 down, $2,800 insurance, $3,200 fuel (20 MPG), $1,200 maintenance, $600 registration, $2,400 parking, sold after 5 years for $28,000, costs about $15,400/year or $1.03/mile — 2.5x the compact economy car.</p>

            <h2>Tips & Best Practices</h2>
            <ul>
              <li><strong>Compare cost per mile, not sticker price.</strong> A cheaper car with poor fuel economy and rapid depreciation can cost more per mile than a more expensive efficient model.</li>
              <li><strong>Factor in all costs before buying.</strong> Use this calculator during the shopping process, not after.</li>
              <li><strong>Keep cars longer to spread depreciation.</strong> The steepest drop is in years 1–3. Holding a car 8–10 years dramatically lowers annual depreciation cost.</li>
              <li><strong>Shop insurance before buying the car.</strong> Premiums can vary 40%+ for the same driver with different vehicles.</li>
              <li><strong>Pay cash when possible.</strong> Eliminating loan interest saves $2,000–$6,000 over a typical 5-year ownership period.</li>
              <li><strong>Maintain on schedule.</strong> Neglecting maintenance leads to larger repair bills that exceed the cost of preventive care.</li>
            </ul>

            <h2>Benefits of Using This Calculator</h2>
            <p>This calculator provides the complete, honest picture of car ownership cost — not just the payment the dealer wants you to see. By including depreciation and every running cost, it helps you make financially sound vehicle choices, set realistic budgets, and compare the true cost of ownership across vehicles. Use it before every vehicle purchase or lease decision.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/annual-car-cost-calculator" />
          <PopularCalculators exclude="/calculator/annual-car-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default AnnualCarCostCalculator;
