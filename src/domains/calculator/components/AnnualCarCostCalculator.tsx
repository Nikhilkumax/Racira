"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface CostRow {
  label: string;
  annual: number;
  total: number;
  color: string;
  cls: string;
}

interface AnnualCostResult {
  annualCost: number;
  monthlyCost: number;
  costPerMile: number;
  totalCostOfOwnership: number;
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  depreciation: number;
  insuranceTotal: number;
  fuelTotal: number;
  maintenanceTotal: number;
  registrationTotal: number;
  parkingTotal: number;
  rows: CostRow[];
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Pure calculation (zero React) — safe against zero / negative / NaN inputs
// ---------------------------------------------------------------------------

function safe(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function calculate(input: AnnualCostInputs): AnnualCostResult {
  const purchasePrice = safe(input.purchasePrice);
  const downPayment = Math.min(safe(input.downPayment), purchasePrice);
  const apr = safe(input.loanApr);
  const loanTermYears = safe(input.loanTermYears);
  const insuranceAnnual = safe(input.annualInsurance);
  const fuelAnnual = safe(input.annualFuel);
  const maintenanceAnnual = safe(input.annualMaintenance);
  const registrationAnnual = safe(input.annualRegistration);
  const parkingAnnual = safe(input.annualParking);
  const resaleValue = Math.min(safe(input.resaleValue), purchasePrice);
  const ownershipYears = safe(input.ownershipYears) || 1; // never divide by zero
  const annualMiles = safe(input.annualMiles);

  // --- Loan financing ---
  const loanAmount = Math.max(0, purchasePrice - downPayment);
  const n = Math.round(loanTermYears * 12);
  const r = apr / 100 / 12;
  let monthlyPayment = 0;
  if (loanAmount > 0 && n > 0) {
    if (r === 0) {
      monthlyPayment = loanAmount / n;
    } else {
      const factor = Math.pow(1 + r, n);
      monthlyPayment = (loanAmount * r * factor) / (factor - 1);
    }
  }
  const totalInterest = monthlyPayment > 0 ? Math.max(0, monthlyPayment * n - loanAmount) : 0;

  // --- Depreciation (straight-line: purchase price minus resale value) ---
  const depreciation = Math.max(0, purchasePrice - resaleValue);

  // --- Running costs across the ownership period ---
  const insuranceTotal = insuranceAnnual * ownershipYears;
  const fuelTotal = fuelAnnual * ownershipYears;
  const maintenanceTotal = maintenanceAnnual * ownershipYears;
  const registrationTotal = registrationAnnual * ownershipYears;
  const parkingTotal = parkingAnnual * ownershipYears;

  // --- Total Cost of Ownership ---
  // = Depreciation + Interest + Insurance + Fuel + Maintenance + Registration + Parking
  const totalCostOfOwnership =
    depreciation +
    totalInterest +
    insuranceTotal +
    fuelTotal +
    maintenanceTotal +
    registrationTotal +
    parkingTotal;

  const annualCost = totalCostOfOwnership / ownershipYears;
  const monthlyCost = annualCost / 12;
  const totalMiles = annualMiles * ownershipYears;
  const costPerMile = totalMiles > 0 ? totalCostOfOwnership / totalMiles : 0;

  const rows: CostRow[] = [
    { label: "Depreciation", annual: depreciation / ownershipYears, total: depreciation, color: "#ef4444", cls: "text-red-600" },
    { label: "Loan Interest", annual: totalInterest / ownershipYears, total: totalInterest, color: "#f59e0b", cls: "text-amber-600" },
    { label: "Insurance", annual: insuranceAnnual, total: insuranceTotal, color: "#8b5cf6", cls: "text-violet-600" },
    { label: "Fuel", annual: fuelAnnual, total: fuelTotal, color: "#10b981", cls: "text-emerald-600" },
    { label: "Maintenance", annual: maintenanceAnnual, total: maintenanceTotal, color: "#06b6d4", cls: "text-cyan-600" },
    { label: "Registration", annual: registrationAnnual, total: registrationTotal, color: "#ec4899", cls: "text-pink-600" },
    { label: "Parking", annual: parkingAnnual, total: parkingTotal, color: "#f97316", cls: "text-orange-600" },
  ];

  return {
    annualCost,
    monthlyCost,
    costPerMile,
    totalCostOfOwnership,
    loanAmount,
    monthlyPayment,
    totalInterest,
    depreciation,
    insuranceTotal,
    fuelTotal,
    maintenanceTotal,
    registrationTotal,
    parkingTotal,
    rows,
  };
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

const CI = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnnualCarCostCalculator() {
  const [inputs, setInputs] = useState<AnnualCostInputs>(DEFAULTS);
  const [result, setResult] = useState<AnnualCostResult>(calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Ensure results are shown on page load.
  useEffect(() => {
    setResult(calculate(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key: keyof AnnualCostInputs) => (v: string) =>
    setInputs((prev) => ({ ...prev, [key]: v === "" ? 0 : parseFloat(v) || 0 }));

  const handleCalculate = () => setResult(calculate(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setShowAdvanced(false);
    setResult(calculate(DEFAULTS));
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const pieData = result.rows
    .map((r) => ({ name: r.label, value: Math.round(r.total), color: r.color }))
    .filter((d) => d.value > 0);
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  const faqs = [
    { question: "What is the true annual cost of owning a car?", answer: "The true annual cost includes depreciation (usually the largest hidden cost), financing interest, insurance, fuel, maintenance, registration, and parking. Most drivers underestimate depreciation and forget registration and parking, so the real cost is often 50–100% higher than the monthly payment alone suggests." },
    { question: "How much does depreciation cost per year?", answer: "New cars typically lose about 20% of their value in year one and roughly 15% per year afterward on the remaining value. On a $35,000 car, depreciation alone averages $3,000–$6,000 per year over the first five years, making it the single biggest ownership expense." },
    { question: "Is fuel or depreciation the bigger cost?", answer: "For most vehicles depreciation is significantly larger than fuel. Driving 15,000 miles a year at 25 MPG and $3.50/gallon costs about $2,100 in fuel, while depreciation commonly runs $3,000–$6,000 per year. Combined with insurance, depreciation usually dwarfs fuel." },
    { question: "How does the loan term affect annual cost?", answer: "Longer loan terms lower the monthly payment but raise total interest. A 72-month loan at 7% on $28,000 adds thousands more in interest than a 48-month loan at the same rate. Shorter terms and larger down payments reduce the interest portion of your annual cost." },
    { question: "Should I include parking in my annual car cost?", answer: "Yes, if you pay for parking regularly at work, downtown, or at home in a city. Monthly parking in major metro areas can run $200–$400, adding $2,400–$4,800 per year — an expense that is frequently overlooked but very real." },
    { question: "How do I lower my annual car cost?", answer: "Keep the car longer to spread depreciation, choose models with strong resale value, pay cash or use a short loan to cut interest, shop insurance annually, and improve fuel economy. Reducing depreciation and interest usually moves the needle far more than trimming fuel." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Annual Car Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Annual Car Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ---------------- LEFT: inputs ---------------- */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="price" label="Purchase Price" value={String(inputs.purchasePrice)} onChange={setField("purchasePrice")} prefix="$" />
              <CI id="down" label="Down Payment" value={String(inputs.downPayment)} onChange={setField("downPayment")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="apr" label="Loan APR" value={String(inputs.loanApr)} onChange={setField("loanApr")} suffix="%" />
              <CI id="term" label="Loan Term" value={String(inputs.loanTermYears)} onChange={setField("loanTermYears")} suffix="yr" />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up flex flex-col gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Operating Costs</div>
                    <div className="grid grid-cols-2 gap-4">
                      <CI id="insurance" label="Annual Insurance" value={String(inputs.annualInsurance)} onChange={setField("annualInsurance")} prefix="$" />
                      <CI id="fuel" label="Annual Fuel" value={String(inputs.annualFuel)} onChange={setField("annualFuel")} prefix="$" />
                      <CI id="maint" label="Annual Maintenance" value={String(inputs.annualMaintenance)} onChange={setField("annualMaintenance")} prefix="$" />
                      <CI id="reg" label="Annual Registration" value={String(inputs.annualRegistration)} onChange={setField("annualRegistration")} prefix="$" />
                      <CI id="park" label="Annual Parking" value={String(inputs.annualParking)} onChange={setField("annualParking")} prefix="$" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Ownership</div>
                    <div className="grid grid-cols-2 gap-4">
                      <CI id="resale" label="Resale Value" value={String(inputs.resaleValue)} onChange={setField("resaleValue")} prefix="$" />
                      <CI id="years" label="Ownership Years" value={String(inputs.ownershipYears)} onChange={setField("ownershipYears")} suffix="yr" />
                      <CI id="miles" label="Annual Miles" value={String(inputs.annualMiles)} onChange={setField("annualMiles")} suffix="mi" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm active:scale-[0.98]"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ---------------- RIGHT: results ---------------- */}
          <div className="flex flex-col gap-4">
            {/* 1. Primary result card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none print:hidden">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Annual Cost of Ownership</div>
              <div className="text-4xl font-bold text-primary mb-1">{usd(result.annualCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {usd(result.monthlyCost)}/mo · ${result.costPerMile.toFixed(2)}/mile
              </div>
            </div>

            {/* 2. 3-Stat bar */}
            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-4 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly</div>
                <div className="text-lg font-bold text-foreground">{usd(result.monthlyCost)}</div>
              </div>
              <div className="p-4 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Per Mile</div>
                <div className="text-lg font-bold text-foreground">${result.costPerMile.toFixed(2)}</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total ({safe(inputs.ownershipYears) || 1}yr)</div>
                <div className="text-lg font-bold text-primary">{usd(result.totalCostOfOwnership)}</div>
              </div>
            </div>

            {/* 3. Breakdown table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-3">Cost Category</th>
                    <th className="p-3 text-right w-[110px]">Annual</th>
                    <th className="p-3 text-right w-[130px]">Total ({safe(inputs.ownershipYears) || 1}yr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((r) => (
                    <tr key={r.label} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{r.label}</td>
                      <td className="p-3 text-right text-foreground">{usd(r.annual)}</td>
                      <td className={`p-3 text-right font-medium ${r.cls}`}>{usd(r.total)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 text-foreground text-base border-t-2 border-border">
                    <td className="p-3">Total</td>
                    <td className="p-3 text-right">{usd(result.annualCost)}</td>
                    <td className="p-3 text-right text-primary">{usd(result.totalCostOfOwnership)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Pie chart */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Cost Breakdown</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:w-1/2 flex justify-center shrink-0">
                  {pieData.length > 0 ? (
                    <div className="w-[200px] h-[200px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                            {pieData.map((entry, i) => (
                              <Cell key={`c-${i}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => usd(v)} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
                        <span className="text-lg font-extrabold text-foreground">{usd(result.totalCostOfOwnership)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-16">No cost data to display.</div>
                  )}
                </div>
                <div className="w-full sm:w-1/2 flex flex-col gap-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
                      <span className="text-foreground font-medium flex-1">{d.name}</span>
                      <span className="text-muted-foreground tabular-nums">{pieTotal > 0 ? ((d.value / pieTotal) * 100).toFixed(1) : "0.0"}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Summary statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">Purchase price:</span><span className="font-medium text-foreground">{usd(inputs.purchasePrice)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Loan amount:</span><span className="font-medium text-foreground">{usd(result.loanAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Monthly payment:</span><span className="font-medium text-foreground">{usd(result.monthlyPayment)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total interest:</span><span className="font-medium text-foreground">{usd(result.totalInterest)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Depreciation:</span><span className="font-medium text-foreground">{usd(result.depreciation)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Resale value:</span><span className="font-medium text-foreground">{usd(inputs.resaleValue)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ownership period:</span><span className="font-medium text-foreground">{safe(inputs.ownershipYears) || 1} years</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cost per mile:</span><span className="font-medium text-foreground">${result.costPerMile.toFixed(2)}</span></div>
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between text-base">
                <span className="font-semibold text-foreground">Total cost of ownership:</span>
                <span className="font-bold text-primary">{usd(result.totalCostOfOwnership)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SEO content (3 sections) ---------------- */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is the Annual Car Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Annual Car Cost Calculator reveals the true yearly cost of owning a vehicle — not just the monthly payment, but every expense combined: depreciation, loan interest, insurance, fuel, maintenance, registration, and parking. Most buyers focus on the payment and dramatically underestimate the real number, which studies show averages $8,000–$10,000 per year for a typical car. By expressing your cost per year, per month, and per mile, this tool helps you budget accurately, compare vehicles objectively, and decide whether an upgrade truly makes sense.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                Depreciation is calculated as purchase price minus estimated resale value, spread straight-line across your ownership period. Loan interest uses the standard amortization formula, M = P × r(1+r)^n / ((1+r)^n − 1), applied to the financed amount (price minus down payment). Insurance, fuel, maintenance, registration, and parking are annual figures multiplied by the number of ownership years. Adding depreciation, interest, and all running costs gives your Total Cost of Ownership; dividing by ownership years yields the annual cost, by months the monthly cost, and by total miles driven the cost per mile — the fairest metric for comparing vehicles or transit alternatives.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">How to Reduce Your Annual Car Cost</h2>
              <p className="text-muted-foreground leading-relaxed">
                Because depreciation is usually the single largest expense, the biggest savings come from keeping a car longer to spread that loss and choosing models with strong resale value. Financing is the next lever: a larger down payment or a shorter loan term slashes total interest, and paying cash eliminates it entirely. Shop insurance every renewal, since premiums for identical coverage can vary 40% between carriers, and raise your deductible if you rarely file claims. Improving fuel economy, staying on the maintenance schedule to avoid costly repairs, and cutting recurring parking fees round out the plan. Re-run this calculator whenever a variable changes to see exactly how each decision moves your yearly total.
              </p>
            </div>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/annual-car-cost-calculator" />
          <PopularCalculators exclude="/calculator/annual-car-cost-calculator" />
        </div>
      </div>
    </>
  );
}
