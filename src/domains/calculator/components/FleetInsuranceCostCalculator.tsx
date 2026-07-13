"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { fmtUsd } from "@/lib/auto/autoFinance";

interface VehicleInput {
  id: string;
  vehicleType: "sedan" | "suv" | "truck" | "van" | "luxury" | "sports" | "ev";
  value: number;
  annualMiles: number;
  liabilityOnly: boolean;
  driverAge: number;
  coverageLevel: "minimum" | "standard" | "full";
}

interface Inputs {
  vehicles: VehicleInput[];
  multiVehicleDiscount: boolean;
  commercialUse: boolean;
}

interface Results {
  perVehicle: {
    id: string;
    type: string;
    basePremium: number;
    discount: number;
    finalPremium: number;
  }[];
  totalAnnual: number;
  totalMonthly: number;
  multiVehicleSavings: number;
  perMileCost: number;
}

const BASE_PREMIUMS: Record<VehicleInput["vehicleType"], number> = {
  sedan: 1400, suv: 1600, truck: 1500, van: 1450, luxury: 2400, sports: 2800, ev: 1900,
};

const VEHICLE_LABELS: Record<VehicleInput["vehicleType"], string> = {
  sedan: "Sedan", suv: "SUV", truck: "Truck", van: "Van", luxury: "Luxury", sports: "Sports Car", ev: "Electric",
};

const COVERAGE_MULTIPLIER: Record<VehicleInput["coverageLevel"], number> = {
  minimum: 0.55, standard: 1.0, full: 1.45,
};

let nextId = 1;

function computeVehiclePremium(v: VehicleInput): number {
  let base = BASE_PREMIUMS[v.vehicleType];
  if (v.liabilityOnly) base *= 0.45;
  else base *= COVERAGE_MULTIPLIER[v.coverageLevel];

  // Age factor: under 25 surcharge, 50+ discount
  if (v.driverAge < 25) base *= 1.6;
  else if (v.driverAge < 30) base *= 1.15;
  else if (v.driverAge >= 65) base *= 0.95;

  // High-mileage surcharge
  if (v.annualMiles > 20000) base *= 1.15;
  else if (v.annualMiles < 8000) base *= 0.92;

  // Value factor for full coverage
  if (!v.liabilityOnly) {
    base *= Math.max(0.6, Math.min(1.6, v.value / 25000));
  }
  return base;
}

function calculate(input: Inputs): Results {
  const multiDiscountPct = input.multiVehicleDiscount && input.vehicles.length >= 2 ? 0.15 : 0;
  const commercialSurcharge = input.commercialUse ? 1.25 : 1.0;

  const perVehicle = input.vehicles.map(v => {
    const base = computeVehiclePremium(v) * commercialSurcharge;
    const discount = base * multiDiscountPct;
    const final = base - discount;
    return { id: v.id, type: VEHICLE_LABELS[v.vehicleType], basePremium: base, discount, finalPremium: final };
  });

  const totalAnnual = perVehicle.reduce((s, v) => s + v.finalPremium, 0);
  const multiVehicleSavings = perVehicle.reduce((s, v) => s + v.discount, 0);
  const totalMiles = input.vehicles.reduce((s, v) => s + v.annualMiles, 0);

  return {
    perVehicle,
    totalAnnual,
    totalMonthly: totalAnnual / 12,
    multiVehicleSavings,
    perMileCost: totalMiles > 0 ? totalAnnual / totalMiles : 0,
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

const DEFAULTS: Inputs = {
  vehicles: [
    { id: "v1", vehicleType: "sedan", value: 25000, annualMiles: 15000, liabilityOnly: false, driverAge: 35, coverageLevel: "standard" },
    { id: "v2", vehicleType: "suv", value: 35000, annualMiles: 18000, liabilityOnly: false, driverAge: 40, coverageLevel: "full" },
    { id: "v3", vehicleType: "truck", value: 32000, annualMiles: 22000, liabilityOnly: false, driverAge: 45, coverageLevel: "standard" },
  ],
  multiVehicleDiscount: true,
  commercialUse: false,
};

const FleetInsuranceCostCalculator = () => {
  const [vehicles, setVehicles] = useState<VehicleInput[]>(DEFAULTS.vehicles);
  const [multiVehicleDiscount, setMultiVehicleDiscount] = useState(DEFAULTS.multiVehicleDiscount);
  const [commercialUse, setCommercialUse] = useState(DEFAULTS.commercialUse);
  const [results, setResults] = useState<Results | null>(null);

  const inputs: Inputs = useMemo(() => ({ vehicles, multiVehicleDiscount, commercialUse }), [vehicles, multiVehicleDiscount, commercialUse]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    setVehicles(DEFAULTS.vehicles); setMultiVehicleDiscount(DEFAULTS.multiVehicleDiscount); setCommercialUse(DEFAULTS.commercialUse);
    setResults(calculate(DEFAULTS));
  };

  const updateVehicle = (id: string, patch: Partial<VehicleInput>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
  };
  const addVehicle = () => {
    setVehicles(prev => [...prev, { id: `v${nextId++}`, vehicleType: "sedan", value: 25000, annualMiles: 15000, liabilityOnly: false, driverAge: 35, coverageLevel: "standard" }]);
  };
  const removeVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const barData = results ? results.perVehicle.map((v, i) => ({
    name: `${v.type} #${i + 1}`,
    premium: Math.round(v.finalPremium),
    color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#ef4444"][i % 7],
  })) : [];

  const faqs = [
    { question: "What is fleet car insurance?", answer: "Fleet insurance covers multiple vehicles (typically 3+) under a single policy, usually at a discounted rate compared to insuring each vehicle individually. It's used by businesses, large families, and organizations managing multiple vehicles." },
    { question: "How much does fleet insurance cost per vehicle?", answer: "The average fleet insurance cost ranges from $1,200–$2,500 per vehicle per year, depending on vehicle type, driver age, coverage level, and annual mileage. Commercial fleets with high-mileage drivers typically pay 20–40% more than personal-use fleets." },
    { question: "Does fleet insurance offer a multi-vehicle discount?", answer: "Yes. Most insurers offer 10–25% multi-vehicle discounts when insuring 3+ vehicles on one policy. The discount increases with fleet size — fleets of 10+ vehicles often receive custom commercial rates 30%+ below individual policies." },
    { question: "How does commercial use affect the cost?", answer: "Commercial use typically adds a 20–30% surcharge because commercial drivers accumulate more miles, drive during peak hours, and carry higher liability exposure. Delivery, ride-share, and construction fleets pay the highest premiums." },
    { question: "What factors drive fleet insurance premiums?", answer: "Vehicle type (luxury and sports cars cost most), driver age (under-25 drivers add 30–60%), annual mileage (over 20,000 miles adds 15%), coverage level (full coverage is 45% more than standard), and claims history. Safety features and driver training programs can reduce costs by 10–20%." },
    { question: "How can I reduce my fleet insurance cost?", answer: "Install GPS tracking and telematics (5–15% discount), require driver safety training (10–20%), raise deductibles, bundle with commercial property insurance (15%), maintain a clean claims history, and choose vehicles with strong safety ratings." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Fleet Insurance Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fleet Insurance Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card max-h-[820px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-foreground">Vehicles ({vehicles.length})</div>
              <button type="button" onClick={addVehicle} className="text-xs font-bold text-primary hover:underline">+ Add Vehicle</button>
            </div>

            {vehicles.map((v, i) => (
              <div key={v.id} className="rounded-lg border border-border bg-secondary/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle #{i + 1}</span>
                  {vehicles.length > 1 && (
                    <button type="button" onClick={() => removeVehicle(v.id)} className="text-xs font-bold text-red-600 hover:underline">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-foreground mb-1">Type</label>
                    <select value={v.vehicleType} onChange={(e) => updateVehicle(v.id, { vehicleType: e.target.value as VehicleInput["vehicleType"] })} className="rounded-md border border-input bg-background h-9 px-2 text-sm">
                      {Object.entries(VEHICLE_LABELS).map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-foreground mb-1">Coverage</label>
                    <select value={v.coverageLevel} onChange={(e) => updateVehicle(v.id, { coverageLevel: e.target.value as VehicleInput["coverageLevel"] })} className="rounded-md border border-input bg-background h-9 px-2 text-sm">
                      <option value="minimum">Minimum</option>
                      <option value="standard">Standard</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <CI id={`val-${v.id}`} label="Vehicle Value" value={String(v.value)} onChange={(val) => updateVehicle(v.id, { value: parseFloat(val) || 0 })} prefix="$" />
                  <CI id={`mi-${v.id}`} label="Annual Miles" value={String(v.annualMiles)} onChange={(val) => updateVehicle(v.id, { annualMiles: parseFloat(val) || 0 })} />
                </div>
                <CI id={`age-${v.id}`} label="Primary Driver Age" value={String(v.driverAge)} onChange={(val) => updateVehicle(v.id, { driverAge: parseFloat(val) || 25 })} suffix="yr" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={v.liabilityOnly} onChange={(e) => updateVehicle(v.id, { liabilityOnly: e.target.checked })} className="h-4 w-4 accent-primary" />
                  <span className="text-foreground">Liability only (no comprehensive/collision)</span>
                </label>
              </div>
            ))}

            <label className="flex items-center gap-2 text-sm mt-1">
              <input type="checkbox" checked={multiVehicleDiscount} onChange={(e) => setMultiVehicleDiscount(e.target.checked)} className="h-4 w-4 accent-primary" />
              <span className="text-foreground font-medium">Apply multi-vehicle discount (-15%)</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={commercialUse} onChange={(e) => setCommercialUse(e.target.checked)} className="h-4 w-4 accent-primary" />
              <span className="text-foreground font-medium">Commercial use (+25%)</span>
            </label>

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

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-blue-600 mb-1 uppercase tracking-wider">Total Fleet Insurance</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.totalAnnual).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">${Math.round(results.totalMonthly).toLocaleString()}/mo · ${results.perMileCost.toFixed(2)}/mile · {vehicles.length} vehicles</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.totalMonthly).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Per Vehicle</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.totalAnnual / Math.max(1, vehicles.length)).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Multi-Veh Savings</div>
                    <div className="text-lg font-bold text-emerald-600">${Math.round(results.multiVehicleSavings).toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Vehicle</th>
                        <th className="p-2.5 text-right">Base</th>
                        <th className="p-2.5 text-right">Discount</th>
                        <th className="p-2.5 pr-3 text-right">Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.perVehicle.map((v, i) => (
                        <tr key={v.id} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{v.type} #{i + 1}</td>
                          <td className="p-2.5 text-right text-foreground">${Math.round(v.basePremium).toLocaleString()}</td>
                          <td className="p-2.5 text-right text-emerald-600">-{Math.round(v.discount).toLocaleString()}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">${Math.round(v.finalPremium).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Annual Total</td>
                        <td className="p-2.5 text-right"></td>
                        <td className="p-2.5 text-right text-emerald-600">-{Math.round(results.multiVehicleSavings).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-primary">${Math.round(results.totalAnnual).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Premium by Vehicle</h3>
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Premium"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="premium" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                        </Bar>
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
            <h2 className="text-2xl font-bold mb-3">What Is the Fleet Insurance Cost Calculator?</h2>
            <p>This calculator estimates the total annual insurance cost for a fleet of vehicles — whether for a family with multiple cars, a small business, or a large commercial operation. It accounts for vehicle type, driver age, coverage level, annual mileage, multi-vehicle discounts, and commercial-use surcharges to produce an accurate per-vehicle and total-fleet premium estimate.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Each vehicle's base premium is determined by its type (sedan, SUV, truck, luxury, EV, etc.), then adjusted for driver age (under-25 surcharge), annual mileage, coverage level, and vehicle value. The optional multi-vehicle discount (15%) applies when 2+ vehicles are on the policy. Commercial use adds a 25% surcharge. The result shows per-vehicle premiums, total cost, and savings from bundling.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary card shows total annual fleet insurance cost with monthly, per-mile, and vehicle count. The 3-stat bar converts to monthly, per-vehicle average, and multi-vehicle savings. The breakdown table itemizes each vehicle's base, discount, and final premium. The bar chart visualizes how each vehicle contributes to the total.</p>

            <h2 className="text-2xl font-bold mb-3">What Drives Fleet Insurance Costs</h2>
            <ul>
              <li><strong>Vehicle type:</strong> Sports cars ($2,800+) and luxury vehicles ($2,400+) cost 2x more than sedans ($1,400).</li>
              <li><strong>Driver age:</strong> Under-25 drivers add 60% surcharge; under-30 adds 15%. Drivers 50+ get small discounts.</li>
              <li><strong>Coverage level:</strong> Full coverage is 45% more than standard; liability-only is 55% less.</li>
              <li><strong>Annual mileage:</strong> Over 20,000 miles adds 15%; under 8,000 saves 8%.</li>
              <li><strong>Commercial use:</strong> Adds 25% surcharge for business driving exposure.</li>
              <li><strong>Multi-vehicle discount:</strong> 15% off when 2+ vehicles are on one policy.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">How to Reduce Fleet Insurance Costs</h2>
            <ul>
              <li><strong>Bundle all vehicles on one policy</strong> for 10–25% multi-vehicle discounts.</li>
              <li><strong>Install telematics and GPS tracking</strong> — 5–15% discount for safer driving data.</li>
              <li><strong>Require driver safety training</strong> — 10–20% reduction in premiums.</li>
              <li><strong>Raise deductibles</strong> — going from $500 to $1,000 deductible saves 10–15%.</li>
              <li><strong>Choose safer vehicles</strong> with 5-star safety ratings and ADAS features.</li>
              <li><strong>Maintain a clean claims history</strong> — even one at-fault claim can raise rates 30–40%.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Practical Example</h2>
            <p>A 3-vehicle fleet (sedan, SUV, truck) with standard drivers and full/standard coverage costs approximately $4,800/year total or $1,600/vehicle. The multi-vehicle discount saves $720/year. Adding commercial-use surcharge raises the total to $6,000/year.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>This tool helps fleet managers, business owners, and multi-vehicle families estimate insurance costs accurately. By adjusting vehicle mix, driver ages, and coverage levels, you can find the configuration that minimizes total cost while maintaining adequate protection.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fleet-insurance-cost-calculator" />
          <PopularCalculators exclude="/calculator/fleet-insurance-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default FleetInsuranceCostCalculator;
