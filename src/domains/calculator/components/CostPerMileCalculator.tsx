"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ownershipCost, costPerMile, fmtUsd } from "@/lib/auto/autoFinance";

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
  ownershipYears: number;
  resaleValue: number;
}

interface Results {
  totalCost: number;
  annualCost: number;
  costPerMile: number;
  depreciation: number;
  interest: number;
  insurance: number;
  fuel: number;
  maintenance: number;
  registration: number;
  parking: number;
}

const DEFAULTS: Inputs = {
  purchasePrice: 35000, downPayment: 7000, loanApr: 6.9, loanTermYears: 5,
  annualInsurance: 1800, annualFuel: 2400, annualMaintenance: 800,
  annualRegistration: 400, annualParking: 600, annualMiles: 15000,
  ownershipYears: 5, resaleValue: 18000,
};

function calculate(input: Inputs): Results {
  const res = ownershipCost({
    purchasePrice: Math.max(0, input.purchasePrice), years: Math.max(1, input.ownershipYears),
    annualMiles: Math.max(0, input.annualMiles), aprPct: Math.max(0, input.loanApr),
    loanTermYears: Math.max(0, input.loanTermYears), downPayment: Math.max(0, input.downPayment),
    insuranceAnnual: Math.max(0, input.annualInsurance), fuelAnnual: Math.max(0, input.annualFuel),
    maintenanceAnnual: Math.max(0, input.annualMaintenance), registrationAnnual: Math.max(0, input.annualRegistration),
    parkingAnnual: Math.max(0, input.annualParking), resaleValue: Math.max(0, input.resaleValue),
  });
  return {
    totalCost: res.totalOutOfPocket, annualCost: res.annualCost, costPerMile: res.costPerMile,
    depreciation: res.depreciation, interest: res.totalInterest, insurance: res.insurance,
    fuel: res.fuel, maintenance: res.maintenance, registration: res.registration, parking: res.parking,
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

const CostPerMileCalculator = () => {
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
  const [ownershipYears, setOwnershipYears] = useState(String(DEFAULTS.ownershipYears));
  const [resaleValue, setResaleValue] = useState(String(DEFAULTS.resaleValue));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  const inputs: Inputs = useMemo(() => ({
    purchasePrice: parseFloat(purchasePrice) || 0, downPayment: parseFloat(downPayment) || 0,
    loanApr: parseFloat(loanApr) || 0, loanTermYears: parseFloat(loanTermYears) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0, annualFuel: parseFloat(annualFuel) || 0,
    annualMaintenance: parseFloat(annualMaintenance) || 0, annualRegistration: parseFloat(annualRegistration) || 0,
    annualParking: parseFloat(annualParking) || 0, annualMiles: parseFloat(annualMiles) || 0,
    ownershipYears: parseFloat(ownershipYears) || 0, resaleValue: parseFloat(resaleValue) || 0,
  }), [purchasePrice, downPayment, loanApr, loanTermYears, annualInsurance, annualFuel, annualMaintenance, annualRegistration, annualParking, annualMiles, ownershipYears, resaleValue]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    const d = DEFAULTS;
    setPurchasePrice(String(d.purchasePrice)); setDownPayment(String(d.downPayment)); setLoanApr(String(d.loanApr)); setLoanTermYears(String(d.loanTermYears));
    setAnnualInsurance(String(d.annualInsurance)); setAnnualFuel(String(d.annualFuel)); setAnnualMaintenance(String(d.annualMaintenance));
    setAnnualRegistration(String(d.annualRegistration)); setAnnualParking(String(d.annualParking)); setAnnualMiles(String(d.annualMiles));
    setOwnershipYears(String(d.ownershipYears)); setResaleValue(String(d.resaleValue)); setShowAdvanced(false);
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

  // Cost per mile breakdown by category
  const cpmBreakdown = results ? [
    { name: "Depreciation", cpm: results.costPerMile > 0 ? results.depreciation / (inputs.annualMiles * inputs.ownershipYears) : 0, color: COLORS[0] },
    { name: "Interest", cpm: results.costPerMile > 0 ? results.interest / (inputs.annualMiles * inputs.ownershipYears) : 0, color: COLORS[1] },
    { name: "Insurance", cpm: results.costPerMile > 0 ? results.insurance / (inputs.annualMiles * inputs.ownershipYears) : 0, color: COLORS[2] },
    { name: "Fuel", cpm: results.costPerMile > 0 ? results.fuel / (inputs.annualMiles * inputs.ownershipYears) : 0, color: COLORS[3] },
    { name: "Maintenance", cpm: results.costPerMile > 0 ? results.maintenance / (inputs.annualMiles * inputs.ownershipYears) : 0, color: COLORS[4] },
    { name: "Registration", cpm: results.costPerMile > 0 ? results.registration / (inputs.annualMiles * inputs.ownershipYears) : 0, color: COLORS[5] },
    { name: "Parking", cpm: results.costPerMile > 0 ? results.parking / (inputs.annualMiles * inputs.ownershipYears) : 0, color: COLORS[6] },
  ] : [];

  const faqs = [
    { question: "What is cost per mile?", answer: "Cost per mile is the total ownership cost divided by the total miles driven. It tells you exactly how much each mile costs you in real dollars. For a typical mid-range sedan, cost per mile is $0.50–$0.70. For a luxury SUV, it can exceed $1.00/mile. For an economy car held 10+ years, it can drop below $0.35/mile." },
    { question: "Why is cost per mile better than monthly payment?", answer: "The monthly payment ignores depreciation and other costs. Cost per mile captures the full picture and lets you compare vehicles objectively regardless of price, fuel type, or loan terms. It's also the perfect metric to compare against rideshare costs ($0.80–$1.50/mile), public transit, or other transportation options." },
    { question: "How do I calculate cost per mile manually?", answer: "Add up all ownership costs (depreciation + interest + insurance + fuel + maintenance + registration + parking) over your ownership period, then divide by total miles driven. For example, $40,000 in costs over 75,000 miles = $0.53/mile." },
    { question: "What is a good cost per mile?", answer: "Under $0.40/mile is excellent (economy car, cash purchase, long ownership). $0.40–$0.60/mile is average (mid-range sedan, typical financing). Over $0.80/mile is high (luxury vehicles, short ownership periods, heavy urban parking costs)." },
    { question: "Which cost component has the highest per-mile cost?", answer: "Depreciation typically dominates at $0.15–$0.30/mile. Fuel is usually second at $0.10–$0.20/mile. Insurance adds $0.08–$0.15/mile. Interest and maintenance each add $0.03–$0.08/mile." },
    { question: "How does driving fewer miles affect cost per mile?", answer: "Fewer miles slightly reduces fuel and maintenance costs but barely affects depreciation, insurance, registration, or parking. Since depreciation is fixed per year, driving 10,000 miles instead of 15,000 can increase cost per mile by 15–20% because the same depreciation is spread over fewer miles." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Cost Per Mile" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost Per Mile Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="price" label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
              <CI id="miles" label="Annual Miles" value={annualMiles} onChange={setAnnualMiles} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="years" label="Ownership Years" value={ownershipYears} onChange={setOwnershipYears} suffix="yr" />
              <CI id="insurance" label="Insurance / Year" value={annualInsurance} onChange={setAnnualInsurance} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="fuel" label="Fuel / Year" value={annualFuel} onChange={setAnnualFuel} prefix="$" />
              <CI id="maintenance" label="Maintenance / Year" value={annualMaintenance} onChange={setAnnualMaintenance} prefix="$" />
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

                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-cyan-600 mb-1 uppercase tracking-wider">Cost Per Mile</div>
                  <div className="text-5xl font-extrabold text-foreground mb-1 tracking-tight">${results.costPerMile.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground font-medium">per mile · ${Math.round(results.annualCost).toLocaleString()}/yr · ${Math.round(results.totalCost).toLocaleString()} total</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Annual</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.annualCost).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.annualCost / 12).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Daily</div>
                    <div className="text-lg font-bold text-foreground">${(results.annualCost / 365).toFixed(2)}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Category</th>
                        <th className="p-2.5 text-right">Total</th>
                        <th className="p-2.5 pr-3 text-right">Per Mile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {cpmBreakdown.map(r => (
                        <tr key={r.name} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground"><span className="inline-block w-2.5 h-2.5 rounded-sm mr-2" style={{ background: r.color }} />{r.name}</td>
                          <td className="p-2.5 text-right text-foreground">${Math.round(r.cpm * inputs.annualMiles * inputs.ownershipYears).toLocaleString()}</td>
                          <td className="p-2.5 pr-3 text-right font-medium">${r.cpm.toFixed(3)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total</td>
                        <td className="p-2.5 text-right">${Math.round(results.totalCost).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-primary">${results.costPerMile.toFixed(3)}</td>
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
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">/ Mile</span>
                          <span className="text-lg font-extrabold text-foreground">${results.costPerMile.toFixed(2)}</span>
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

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Quick Comparisons</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border border-border bg-background p-3">
                      <div className="text-muted-foreground font-medium">Avg Uber/Lyft</div>
                      <div className="text-lg font-bold text-foreground">$1.00–$1.50/mi</div>
                    </div>
                    <div className="rounded-md border border-border bg-background p-3">
                      <div className="text-muted-foreground font-medium">Your Cost</div>
                      <div className={`text-lg font-bold ${results.costPerMile < 0.60 ? "text-emerald-600" : results.costPerMile < 0.80 ? "text-amber-600" : "text-red-600"}`}>${results.costPerMile.toFixed(2)}/mi</div>
                    </div>
                    <div className="rounded-md border border-border bg-background p-3">
                      <div className="text-muted-foreground font-medium">IRS Mileage Rate</div>
                      <div className="text-lg font-bold text-foreground">$0.67/mi (2024)</div>
                    </div>
                    <div className="rounded-md border border-border bg-background p-3">
                      <div className="text-muted-foreground font-medium">Total Miles</div>
                      <div className="text-lg font-bold text-foreground">{Math.round(inputs.annualMiles * inputs.ownershipYears).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Cost Per Mile Calculator?</h2>
            <p>The Cost Per Mile Calculator determines exactly how much each mile you drive costs in total ownership expenses. Unlike MPG or fuel cost per mile, this metric captures the full picture — depreciation, financing, insurance, maintenance, fuel, registration, and parking — expressed as a single dollar amount per mile. It's the most honest way to compare vehicles and evaluate whether driving is cheaper than rideshare, transit, or other alternatives.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Enter your vehicle's purchase details, annual operating costs, annual mileage, and ownership period. The calculator computes total ownership cost using the amortization and depreciation formulas, then divides by total miles driven (annual miles × ownership years). The result is your true cost per mile — typically $0.40–$0.70 for most drivers.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary result is your cost per mile in large bold text. The 3-stat bar converts to annual, monthly, and daily cost. The breakdown table shows per-mile cost for each category — depreciation typically contributes $0.15–$0.30/mile, fuel $0.10–$0.20/mile, insurance $0.08–$0.15/mile. The donut chart shows the proportional split. Quick comparisons benchmark your cost against rideshare prices and the IRS mileage rate.</p>

            <h2 className="text-2xl font-bold mb-3">Cost Per Mile Benchmarks</h2>
            <ul>
              <li><strong>Under $0.35/mile:</strong> Excellent — economy car, cash purchase, long ownership, low insurance area.</li>
              <li><strong>$0.35–$0.55/mile:</strong> Good — mid-range sedan, typical financing, 5–7 year ownership.</li>
              <li><strong>$0.55–$0.80/mile:</strong> Average — mid-range SUV, urban parking costs, shorter ownership.</li>
              <li><strong>Over $0.80/mile:</strong> High — luxury vehicle, short ownership, heavy insurance and parking costs.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">How to Lower Your Cost Per Mile</h2>
            <ul>
              <li><strong>Drive more miles.</strong> Fixed costs (depreciation, insurance, registration) are spread over more miles. Going from 10,000 to 15,000 miles/year can lower CPM by 15–20%.</li>
              <li><strong>Keep the car longer.</strong> Depreciation flattens over time, dramatically lowering annual and per-mile cost.</li>
              <li><strong>Choose fuel-efficient vehicles.</strong> A 10 MPG improvement saves $0.04–$0.07/mile in fuel costs.</li>
              <li><strong>Reduce insurance costs.</strong> Shopping carriers, raising deductibles, and bundling policies saves $0.01–$0.03/mile.</li>
              <li><strong>Park for free when possible.</strong> Urban parking adds $0.02–$0.05/mile in major metros.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Practical Example</h2>
            <p>A $35,000 sedan driven 15,000 miles/year for 5 years with typical costs: total ownership = $48,000. Total miles = 75,000. Cost per mile = $0.64. Compare to Uber at $1.20/mile — owning saves $0.56/mile or $8,400/year vs full-time rideshare.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>Cost per mile is the single best metric for evaluating transportation decisions. Use it to compare vehicles objectively, decide between owning and ridesharing, set per-mile budgets for business travel, and understand the true cost of your daily commute in dollars.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cost-per-mile-calculator" />
          <PopularCalculators exclude="/calculator/cost-per-mile-calculator" />
        </div>
      </div>
    </>
  );
};

export default CostPerMileCalculator;
