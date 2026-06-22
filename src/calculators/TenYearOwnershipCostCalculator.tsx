"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
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

const HORIZON = 10;

const DEFAULTS: Inputs = {
  purchasePrice: 35000, downPayment: 7000, loanApr: 6.9, loanTermYears: 5,
  annualInsurance: 1800, annualFuel: 2400, annualMaintenance: 1000,
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

const TenYearOwnershipCostCalculator = () => {
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

  const barData = results ? [
    { name: "Depreciation", value: Math.round(results.depreciation), color: COLORS[0] },
    { name: "Interest", value: Math.round(results.interest), color: COLORS[1] },
    { name: "Insurance", value: Math.round(results.insurance), color: COLORS[2] },
    { name: "Fuel", value: Math.round(results.fuel), color: COLORS[3] },
    { name: "Maintenance", value: Math.round(results.maintenance), color: COLORS[4] },
    { name: "Registration", value: Math.round(results.registration), color: COLORS[5] },
    { name: "Parking", value: Math.round(results.parking), color: COLORS[6] },
  ] : [];

  const depCurve = results ? depreciate(Math.max(0, inputs.purchasePrice), 10) : [];

  const faqs = [
    { question: "What does 10-year ownership cost include?", answer: "It includes every expense over a decade: depreciation, loan interest (usually only years 1–5), insurance, fuel, maintenance, registration, and parking. A $35,000 car typically costs $60,000–$85,000 over 10 years." },
    { question: "Why calculate 10-year cost?", answer: "The 10-year horizon reveals the true long-term cost efficiency of keeping a car. It shows how annual cost declines after the loan is paid off and depreciation flattens, typically reaching its lowest point in years 7–10." },
    { question: "How does 10-year compare to 5-year cost?", answer: "While total cost is higher over 10 years, the annual cost is typically 20–30% lower than years 1–5 because depreciation flattens and loan interest ends. A car costing $10,000/year over 5 years may drop to $6,500–$7,500/year averaged over 10." },
    { question: "What about maintenance on older cars?", answer: "Maintenance costs rise with age — expect $500/year for years 1–3, $800/year for years 4–6, and $1,200+/year for years 7–10. Major repairs (timing belt, transmission, suspension) often hit between 80,000–120,000 miles." },
    { question: "Is keeping a car 10 years always cheaper?", answer: "Generally yes, but if repair costs spike in years 8–10 (e.g., engine or transmission failure), replacing the car may become cheaper. This calculator helps you see the crossover point." },
    { question: "What is the residual value after 10 years?", answer: "Using the standard depreciation model, a $35,000 car is worth approximately $9,000–$11,000 after 10 years — about 25–30% of its original value. Well-maintained Toyotas and Hondas may retain more." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "10-Year Ownership Cost" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">10-Year Ownership Cost Calculator</h1>

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

                <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-500/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-teal-600 mb-1 uppercase tracking-wider">10-Year Total Ownership Cost</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.totalCost).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">${Math.round(results.annualCost).toLocaleString()}/yr · ${results.costPerMile.toFixed(2)}/mi · Est. value after 10yr: ${Math.round(results.finalValue).toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Annual Avg</div>
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
                        <th className="p-2.5 pr-3 text-right">10-Year Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Depreciation", annual: results.depreciation / 10, total: results.depreciation, cls: "text-red-600" },
                        { label: "Loan Interest", annual: results.interest / 10, total: results.interest, cls: "text-amber-600" },
                        { label: "Insurance", annual: results.insurance / 10, total: results.insurance, cls: "text-violet-600" },
                        { label: "Fuel", annual: results.fuel / 10, total: results.fuel, cls: "text-emerald-600" },
                        { label: "Maintenance", annual: results.maintenance / 10, total: results.maintenance, cls: "text-cyan-600" },
                        { label: "Registration", annual: results.registration / 10, total: results.registration, cls: "text-pink-600" },
                        { label: "Parking", annual: results.parking / 10, total: results.parking, cls: "text-orange-600" },
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

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Cost Breakdown by Category</h3>
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
                        <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {barData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Depreciation Curve (10 Years)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {depCurve.slice(0, 11).map((val, yr) => (
                      <div key={yr} className="flex items-center justify-between text-sm rounded-md border border-border bg-background px-2.5 py-1.5">
                        <span className="text-muted-foreground font-medium">Yr {yr}</span>
                        <span className="font-bold text-foreground">${Math.round(val).toLocaleString()}</span>
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
            <h2>What Is the 10-Year Ownership Cost Calculator?</h2>
            <p>The 10-Year Ownership Cost Calculator projects the full cost of owning a vehicle over a decade — the longest realistic ownership period for most drivers. It accounts for depreciation flattening over time, loan interest ending after the loan term, maintenance costs rising with age, and all annual operating expenses. This long view reveals the true cost efficiency of keeping a car versus replacing it.</p>

            <h2>How It Works</h2>
            <p>Using the accelerated depreciation model (20% year 1, 15% annually after), the calculator estimates your car's value at year 10. Loan interest is computed for the loan term only (typically 5 years). Insurance, fuel, maintenance, registration, and parking are annualized over the full 10-year period. The result shows total, annual, monthly, and per-mile costs.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary card shows the 10-year total cost. The 3-stat bar converts to annual, monthly, and per-mile. The breakdown table shows each category. The horizontal bar chart visualizes the proportional split — notice how depreciation still dominates but interest is a smaller portion compared to the 5-year view. The depreciation curve shows estimated value at each year.</p>

            <h2>Why 10 Years Matters Financially</h2>
            <ul>
              <li><strong>Lowest annual cost:</strong> Years 7–10 typically have the lowest annual cost because the loan is paid off and depreciation has flattened.</li>
              <li><strong>Maintenance reality:</strong> Maintenance rises significantly after 100,000 miles — budget $1,000–$1,500/year for years 7–10.</li>
              <li><strong>Insurance savings:</strong> An older car worth $8,000–$10,000 costs less to insure than one worth $25,000.</li>
              <li><strong>Diminishing returns:</strong> Beyond 10 years, rising maintenance may exceed the shrinking depreciation benefit.</li>
            </ul>

            <h2>Practical Examples</h2>
            <p>A $35,000 sedan over 10 years: ~$72,000 total ($7,200/year, $0.48/mile). The same car over only 5 years would be $45,000 ($9,000/year, $0.60/mile). The extra 5 years add $27,000 in cost but only $6,540/year — 27% less per year than the first 5 years.</p>

            <h2>Tips for 10-Year Ownership</h2>
            <ul>
              <li><strong>Choose reliable brands</strong> — Toyota, Honda, and Subaru are known to exceed 200,000 miles with proper maintenance.</li>
              <li><strong>Follow the maintenance schedule religiously</strong> — preventive care costs far less than major repairs.</li>
              <li><strong>Set aside a repair fund</strong> — $100/month after the warranty expires covers most unexpected repairs.</li>
              <li><strong>Pay cash or use a short loan</strong> — being payment-free for years 6–10 dramatically lowers annual cost.</li>
              <li><strong>Monitor depreciation</strong> — if repair costs approach $3,000+/year, it may be time to replace.</li>
            </ul>

            <h2>Benefits of Using This Calculator</h2>
            <p>This tool shows the financial benefits of long-term car ownership. By projecting costs over 10 years, it helps you decide whether to keep your current car, compare the lifetime cost of different vehicles, and understand when maintenance costs make replacement the better financial choice.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/10-year-ownership-cost-calculator" />
          <PopularCalculators exclude="/calculator/10-year-ownership-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default TenYearOwnershipCostCalculator;
