"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Coverage = "full" | "liability" | "stateMin";
type DrivingRecord = "clean" | "ticket" | "accident" | "dui";
type Credit = "excellent" | "good" | "fair" | "poor";

interface Inputs {
  coverage: Coverage;
  vehicleValue: number;
  age: number;
  record: DrivingRecord;
  mileage: number;
  deductible: number;
  credit: Credit;
  multiPolicy: boolean;
  telematics: boolean;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  monthlyPremium: number;
  annualPremium: number;
  grossPremium: number;
  discountAmount: number;
  discountRate: number;
  pctOfValue: number;
  parts: { label: string; amount: number }[];
  chartData: { name: string; premium: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fx = (f: number) => f.toFixed(2).replace(/\.?0+$/, "") + "×";

const COVERAGES: Record<Coverage, { label: string; liability: number; uninsured: number; collRate: number; compRate: number }> = {
  full: { label: "Full Coverage", liability: 640, uninsured: 190, collRate: 0.018, compRate: 0.01 },
  liability: { label: "Liability Only", liability: 560, uninsured: 140, collRate: 0, compRate: 0 },
  stateMin: { label: "State Minimum", liability: 265, uninsured: 0, collRate: 0, compRate: 0 },
};

const RECORD_FACTORS: Record<DrivingRecord, { label: string; f: number }> = {
  clean: { label: "Clean (3+ yrs)", f: 1 },
  ticket: { label: "1 Ticket (3 yrs)", f: 1.3 },
  accident: { label: "1 At-Fault Accident", f: 1.45 },
  dui: { label: "DUI / Major Violation", f: 1.9 },
};

const CREDIT_FACTORS: Record<Credit, { label: string; f: number }> = {
  excellent: { label: "Excellent", f: 0.9 },
  good: { label: "Good", f: 1 },
  fair: { label: "Fair", f: 1.18 },
  poor: { label: "Poor", f: 1.42 },
};

const ageFactor = (age: number) =>
  age < 25 ? 1.65 : age < 30 ? 1.2 : age < 40 ? 1 : age < 50 ? 0.96 : age < 65 ? 0.9 : age < 75 ? 0.95 : 1.1;

const mileageFactor = (mi: number) =>
  mi <= 0 ? 1 : mi <= 7500 ? 0.92 : mi <= 12000 ? 1 : mi <= 20000 ? 1.15 : 1.28;

function calc(inp: Inputs): Result {
  const cov = COVERAGES[inp.coverage];
  const dedAdj = inp.coverage === "full" ? (inp.deductible >= 1000 ? 0.85 : inp.deductible <= 250 ? 1.15 : 1) : 1;
  const fAge = ageFactor(inp.age);
  const fRec = RECORD_FACTORS[inp.record].f;
  const fMile = mileageFactor(inp.mileage);
  const fCredit = CREDIT_FACTORS[inp.credit].f;
  const combined = fAge * fRec * fMile * fCredit;

  const compBase = inp.coverage === "full" ? Math.max(0, inp.vehicleValue * cov.compRate * dedAdj) : 0;
  const collBase = inp.coverage === "full" ? Math.max(0, inp.vehicleValue * cov.collRate * dedAdj) : 0;

  const liability = Math.round(cov.liability * combined);
  const uninsured = Math.round(cov.uninsured * combined);
  const comprehensive = Math.round(compBase * combined);
  const collision = Math.round(collBase * combined);

  const grossPremium = liability + uninsured + comprehensive + collision;
  const discountRate = Math.min(0.25, (inp.multiPolicy ? 0.1 : 0) + (inp.telematics ? 0.12 : 0));
  const discountAmount = Math.round(grossPremium * discountRate);
  const annualPremium = grossPremium - discountAmount;
  const monthlyPremium = annualPremium / 12;
  const pctOfValue = inp.vehicleValue > 0 ? (annualPremium / inp.vehicleValue) * 100 : 0;

  const parts = [
    { label: "Bodily Injury & Property Damage", amount: liability },
    { label: "Uninsured / Underinsured Motorist", amount: uninsured },
    { label: "Collision", amount: collision },
    { label: "Comprehensive", amount: comprehensive },
  ].filter((p) => p.amount > 0);

  const chartData = parts.map((p) => ({
    name: p.label.replace("Bodily Injury & Property Damage", "Liability").replace("Uninsured / Underinsured Motorist", "Uninsured"),
    premium: p.amount,
  }));

  const breakdown: Row[] = [
    { label: "Bodily Injury & Property Damage", value: money(liability), sum: true },
    { label: "Uninsured / Underinsured Motorist", value: money(uninsured), sum: true },
    { label: `Collision (${inp.coverage === "full" ? "$" + inp.deductible.toLocaleString("en-US") + " deductible" : "not rated"})`, value: inp.coverage === "full" ? money(collision) : "Not rated", sum: inp.coverage === "full" },
    { label: `Comprehensive (${inp.coverage === "full" ? "$" + inp.deductible.toLocaleString("en-US") + " deductible" : "not rated"})`, value: inp.coverage === "full" ? money(comprehensive) : "Not rated", sum: inp.coverage === "full" },
    { label: `Driver Age — ${inp.age}`, value: fx(fAge) },
    { label: `Driving Record — ${RECORD_FACTORS[inp.record].label}`, value: fx(fRec) },
    { label: `Annual Mileage — ${inp.mileage.toLocaleString("en-US")}`, value: fx(fMile) },
    { label: `Credit Tier — ${CREDIT_FACTORS[inp.credit].label}`, value: fx(fCredit) },
  ];

  if (discountAmount > 0) {
    const names = [inp.multiPolicy ? "Multi-Policy" : "", inp.telematics ? "Telematics" : ""].filter(Boolean).join(" + ");
    breakdown.push({ label: `Discounts — ${names} (−${Math.round(discountRate * 100)}%)`, value: "−" + money(discountAmount), highlight: true, sum: true });
  }
  breakdown.push({ label: "Estimated Annual Premium", value: money(annualPremium), isTotal: true, sum: true });

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return {
    monthlyPremium,
    annualPremium,
    grossPremium,
    discountAmount,
    discountRate,
    pctOfValue,
    parts,
    chartData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = {
  coverage: "full",
  vehicleValue: 25000,
  age: 35,
  record: "clean",
  mileage: 12000,
  deductible: 500,
  credit: "good",
  multiPolicy: false,
  telematics: false,
};

export default function AutoInsurancePremiumEstimator() {
  const [coverage, setCoverage] = useState<Coverage>(DEFAULTS.coverage);
  const [vehicleValue, setVehicleValue] = useState(String(DEFAULTS.vehicleValue));
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [record, setRecord] = useState<DrivingRecord>(DEFAULTS.record);
  const [mileage, setMileage] = useState(String(DEFAULTS.mileage));
  const [deductible, setDeductible] = useState(String(DEFAULTS.deductible));
  const [credit, setCredit] = useState<Credit>(DEFAULTS.credit);
  const [multiPolicy, setMultiPolicy] = useState(DEFAULTS.multiPolicy);
  const [telematics, setTelematics] = useState(DEFAULTS.telematics);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    coverage,
    vehicleValue: parseFloat(vehicleValue) || 0,
    age: parseFloat(age) || 0,
    record,
    mileage: parseFloat(mileage) || 0,
    deductible: parseFloat(deductible) || 500,
    credit,
    multiPolicy,
    telematics,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setCoverage(DEFAULTS.coverage);
    setVehicleValue(String(DEFAULTS.vehicleValue));
    setAge(String(DEFAULTS.age));
    setRecord(DEFAULTS.record);
    setMileage(String(DEFAULTS.mileage));
    setDeductible(String(DEFAULTS.deductible));
    setCredit(DEFAULTS.credit);
    setMultiPolicy(DEFAULTS.multiPolicy);
    setTelematics(DEFAULTS.telematics);
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const val = parseFloat(vehicleValue) || 0;
  const a = parseFloat(age) || 0;
  const mi = parseFloat(mileage) || 0;

  const valErrors: Record<string, string> = {};
  if (vehicleValue === "" || isNaN(parseFloat(vehicleValue))) valErrors.vehicleValue = "Enter the vehicle's value";
  else if (val < 1000) valErrors.vehicleValue = "Vehicle value must be at least $1,000";
  else if (val > 200000) valErrors.vehicleValue = "Value looks too high — max $200,000";
  if (age === "" || isNaN(parseFloat(age))) valErrors.age = "Enter the driver's age";
  else if (a < 16) valErrors.age = "Driver must be at least 16";
  else if (a > 100) valErrors.age = "Age must be 100 or younger";
  if (mileage === "" || isNaN(parseFloat(mileage))) valErrors.mileage = "Enter annual mileage";
  else if (mi <= 0) valErrors.mileage = "Annual mileage must be greater than 0";
  else if (mi > 150000) valErrors.mileage = "Annual mileage looks too high";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  const res = result;
  const covLabel = COVERAGES[coverage].label;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Auto Insurance Premium Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Auto Insurance Premium Estimator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ai-coverage" className="text-sm font-medium mb-1 block">Coverage Type</label>
                <div className="relative h-10">
                  <select id="ai-coverage" value={coverage} onChange={(e) => setCoverage(e.target.value as Coverage)} className={selectCls}>
                    <option value="full">Full Coverage</option>
                    <option value="liability">Liability Only</option>
                    <option value="stateMin">State Minimum</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="ai-value" className="text-sm font-medium mb-1 block">Vehicle Value ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="ai-value" type="number" min="0" step="500" value={vehicleValue} onChange={(e) => setVehicleValue(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.vehicleValue && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.vehicleValue}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ai-age" className="text-sm font-medium mb-1 block">Driver Age</label>
                <div className={inputCls}>
                  <input id="ai-age" type="number" min="16" max="100" step="1" value={age} onChange={(e) => setAge(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.age && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.age}</p>}
              </div>
              <div>
                <label htmlFor="ai-record" className="text-sm font-medium mb-1 block">Driving Record</label>
                <div className="relative h-10">
                  <select id="ai-record" value={record} onChange={(e) => setRecord(e.target.value as DrivingRecord)} className={selectCls}>
                    <option value="clean">Clean (3+ yrs)</option>
                    <option value="ticket">1 Ticket (3 yrs)</option>
                    <option value="accident">1 At-Fault Accident</option>
                    <option value="dui">DUI / Major Violation</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center justify-center gap-1.5 py-1 text-sm text-primary font-medium hover:underline">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Rating Factors</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ai-mileage" className="text-sm font-medium mb-1 block">Annual Mileage</label>
                      <div className={inputCls}>
                        <input id="ai-mileage" type="number" min="1" step="500" value={mileage} onChange={(e) => setMileage(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.mileage && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.mileage}</p>}
                    </div>
                    <div>
                      <label htmlFor="ai-deductible" className="text-sm font-medium mb-1 block">Deductible</label>
                      <div className="relative h-10">
                        <select id="ai-deductible" value={deductible} onChange={(e) => setDeductible(e.target.value)} className={selectCls}>
                          <option value="250">$250</option>
                          <option value="500">$500</option>
                          <option value="1000">$1,000</option>
                        </select>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Applies to Collision &amp; Comprehensive only.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Credit &amp; Discounts</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ai-credit" className="text-sm font-medium mb-1 block">Insurance Credit Tier</label>
                      <div className="relative h-10">
                        <select id="ai-credit" value={credit} onChange={(e) => setCredit(e.target.value as Credit)} className={selectCls}>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end gap-1.5 pb-0.5">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer select-none">
                        <input type="checkbox" checked={multiPolicy} onChange={(e) => setMultiPolicy(e.target.checked)} className="h-4 w-4 accent-[#2563eb]" />
                        Multi-Policy (−10%)
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer select-none">
                        <input type="checkbox" checked={telematics} onChange={(e) => setTelematics(e.target.checked)} className="h-4 w-4 accent-[#2563eb]" />
                        Telematics / Safe Driver (−12%)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {res && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Premium</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money2(res.monthlyPremium)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {covLabel} on a {money(val)} vehicle · ≈ {money(res.annualPremium)}/yr{res.discountRate > 0 ? ` after ${Math.round(res.discountRate * 100)}% in discounts` : " with no discounts applied"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Annual Premium", money(res.annualPremium), "text-primary"],
                    ["Cost vs Vehicle Value", res.pctOfValue.toFixed(1) + "%", res.pctOfValue < 8 ? "text-emerald-600" : res.pctOfValue <= 12 ? "text-amber-600" : "text-red-600"],
                    ["Coverage", covLabel, "text-foreground"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Premium by Coverage Component</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={res.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v))} />
                      <Tooltip formatter={(v: number) => [money(Number(v)), "Annual premium"]} cursor={{ fill: "var(--muted)" }} />
                      <Bar dataKey="premium" name="Premium" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={54} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Component premiums after rating factors {res.discountRate > 0 ? `(${Math.round(res.discountRate * 100)}% discount is applied to the total)` : ""}.
                  </p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Premium Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {res.breakdown.map((r, idx) => (
                        <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                          <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                          <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {res.summaryStats.map((s, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Drives Your Auto Insurance Rate</h2>
            <p>Auto insurers build premiums from rating factors rather than the car's price tag alone: your coverage limits and deductibles set the base, then your age, driving record, annual mileage, and insurance-based credit tier adjust it — and every insurer applies them with different weights, so identical drivers can get very different quotes. Coverage-level choices matter most: full coverage rates the vehicle's collision and comprehensive risk, while liability-only policies price only the damage you could cause others. Discounts for bundling home and auto or agreeing to telematics monitoring typically cut 10–15% each. This estimator applies a transparent model of those factors so you can see exactly how each input moves the premium — then compare against real quotes, since your actual rate will reflect your insurer's proprietary algorithm.</p>
          </section>
          <FAQSection faqs={[
            { question: "How accurate is this auto insurance estimate?", answer: "It models the major rating factors — coverage, vehicle value, age, driving record, mileage, credit tier, and discounts — with typical industry multipliers, so it is useful for comparing choices and ballparking your premium. Actual quotes vary by insurer, state regulations, and dozens of finer details, so treat the result as a planning figure and get real quotes before binding a policy." },
            { question: "Should I raise my deductible to save money?", answer: "Moving from a $500 to a $1,000 deductible typically reduces collision and comprehensive costs by roughly 15%, which this calculator reflects. Only choose a deductible you can afford to pay out of pocket after a claim — the premium savings rarely justify a deductible you could not cover." },
            { question: "What coverage level should I choose?", answer: "If your car is financed or leased, the lender requires full coverage. If you own it outright, dropping collision and comprehensive makes sense when the annual savings exceed what you would pay in premiums over the car's remaining life — roughly when the car is worth under about $3,000–5,000, depending on your rate. Liability-only is the minimum for protecting your assets." },
          ]} pageUrl="https://racira.com/calculator/auto-insurance-premium-estimator" />
          <PopularCalculators exclude="/calculator/auto-insurance-premium-estimator" />
        </div>
      </div>
    </>
  );
}
