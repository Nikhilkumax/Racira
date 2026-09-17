"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, ShieldCheck, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from "recharts";

// 1. TypeScript interfaces
interface InsuranceResults {
  annualPremium: number;
  monthlyPremium: number;
  sixMonthPremium: number;
  chartData: any[];
  breakdown: {
    baseRate: number;
    agePenalty: number;
    recordPenalty: number;
    locationPenalty: number;
    coverageMultiplier: number;
  };
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateInsurance = (inputs: typeof DEFAULTS): InsuranceResults => {
  const vehicleValue = parseFloat(inputs.vehicleValue) || 0;
  const driverAge = parseFloat(inputs.driverAge) || 0;
  const drivingRecord = inputs.drivingRecord as "clean" | "minor" | "major" | "dui";
  const location = inputs.location as "rural" | "suburb" | "city";
  const coverageLevel = inputs.coverageLevel as "liability" | "standard" | "full";
  
  // Advanced
  const deductible = inputs.deductible as "500" | "1000" | "2000";
  const annualMiles = parseFloat(inputs.annualMiles) || 0;

  if (vehicleValue <= 0 || driverAge < 16) {
    return {
      annualPremium: 0, monthlyPremium: 0, sixMonthPremium: 0, chartData: [],
      breakdown: { baseRate: 0, agePenalty: 0, recordPenalty: 0, locationPenalty: 0, coverageMultiplier: 0 },
      isError: true, errorMsg: "Vehicle value must be > 0 and Driver Age must be 16 or older."
    };
  }

  // Base Rate (Roughly 3% of vehicle value per year as a baseline starting point)
  // Actually, a flat baseline + small % of vehicle is more realistic
  const baseRate = 800 + (vehicleValue * 0.015);

  // Age Multiplier
  let ageMultiplier = 1.0;
  if (driverAge < 20) ageMultiplier = 2.5; // Huge penalty for teens
  else if (driverAge < 25) ageMultiplier = 1.8;
  else if (driverAge > 70) ageMultiplier = 1.2; // Minor penalty for elderly
  else ageMultiplier = 1.0; // 25-70 is baseline

  // Driving Record Multiplier
  let recordMultiplier = 1.0;
  if (drivingRecord === "minor") recordMultiplier = 1.25; // 25% hike for speeding ticket
  else if (drivingRecord === "major") recordMultiplier = 1.60; // 60% hike for at-fault accident
  else if (drivingRecord === "dui") recordMultiplier = 2.50; // 150% hike for DUI

  // Location Multiplier
  let locationMultiplier = 1.0;
  if (location === "rural") locationMultiplier = 0.85; // Less traffic, fewer accidents
  else if (location === "suburb") locationMultiplier = 1.0;
  else if (location === "city") locationMultiplier = 1.40; // High theft/accident rate

  // Mileage Multiplier
  let milesMultiplier = 1.0;
  if (annualMiles < 5000) milesMultiplier = 0.90; // Low mileage discount
  else if (annualMiles > 20000) milesMultiplier = 1.20; // High risk exposure

  // Deductible Multiplier
  let deductibleMultiplier = 1.0;
  if (deductible === "500") deductibleMultiplier = 1.15; // Lower deductible = higher premium
  else if (deductible === "1000") deductibleMultiplier = 1.0;
  else if (deductible === "2000") deductibleMultiplier = 0.85;

  // Calculate Base Adjusted (before coverage level)
  const adjustedBase = baseRate * ageMultiplier * recordMultiplier * locationMultiplier * milesMultiplier;

  // Coverage Level Multiplier
  let coverageMultiplier = 1.0;
  let liabilityCost = adjustedBase * 0.5; // Liability is usually half the cost of full
  let standardCost = adjustedBase * 0.8 * deductibleMultiplier;
  let fullCost = adjustedBase * 1.0 * deductibleMultiplier;

  let annualPremium = 0;
  if (coverageLevel === "liability") {
    annualPremium = liabilityCost;
    coverageMultiplier = 0.5;
  } else if (coverageLevel === "standard") {
    annualPremium = standardCost;
    coverageMultiplier = 0.8;
  } else {
    annualPremium = fullCost;
    coverageMultiplier = 1.0;
  }

  const chartData = [
    { name: "Liability Only", cost: liabilityCost, color: "#94a3b8" },
    { name: "Standard", cost: standardCost, color: "#3b82f6" },
    { name: "Full Coverage", cost: fullCost, color: "#10b981" }
  ];

  return {
    annualPremium,
    monthlyPremium: annualPremium / 12,
    sixMonthPremium: annualPremium / 2,
    chartData,
    breakdown: {
      baseRate,
      agePenalty: (baseRate * ageMultiplier) - baseRate,
      recordPenalty: (baseRate * recordMultiplier) - baseRate,
      locationPenalty: (baseRate * locationMultiplier) - baseRate,
      coverageMultiplier
    },
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  vehicleValue: "25000",
  driverAge: "35",
  drivingRecord: "clean",
  location: "suburb",
  coverageLevel: "full",
  // Advanced
  deductible: "1000",
  annualMiles: "12000"
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, tooltip, type = "number", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function CarInsuranceCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<InsuranceResults>(calculateInsurance(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleCalculate = () => {
    setResults(calculateInsurance(inputs));
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: document.getElementById('results-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateInsurance(DEFAULTS));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const faqs = [
    { question: "Why is car insurance so expensive for young drivers?", answer: "Actuarial data proves that drivers under the age of 25 are statistically the most likely demographic to be involved in severe, expensive car accidents. Insurance companies offset this massive risk by charging extremely high premiums. Rates typically drop significantly once a driver hits 25, assuming their record remains clean." },
    { question: "What is the difference between Liability and Full Coverage?", answer: "Liability insurance only pays for the damage you cause to OTHER people and their property if you are at fault in an accident; it pays nothing to fix your own car. Full Coverage (which includes Comprehensive and Collision) pays to fix your car regardless of who is at fault, and also covers theft, vandalism, and weather damage." },
    { question: "How does my deductible affect my premium?", answer: "Your deductible is the amount of money you must pay out of pocket before the insurance company pays a dime. If you choose a low deductible (e.g., $500), your monthly premium will be higher because the insurance company takes on more financial risk. If you choose a high deductible (e.g., $2,000), your monthly premium will drop significantly." },
    { question: "Does a speeding ticket really raise my rates?", answer: "Yes. Insurance companies view moving violations (speeding, running red lights) as indicators of reckless behavior, which increases your likelihood of causing an accident. A single minor ticket can increase your premium by 20% to 30% for 3 to 5 years. A major violation like a DUI can instantly double or triple your rates." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Car Insurance Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Insurance Cost Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="car-value" label="Current Vehicle Value" value={inputs.vehicleValue} onChange={(v: string) => handleChange("vehicleValue", v)} prefix="$" />
              <CompactInput id="age" label="Driver Age" value={inputs.driverAge} onChange={(v: string) => handleChange("driverAge", v)} suffix="yrs" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 border-t border-border pt-3">Risk Factors</div>
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="record" label="Driving Record (Last 3 Years)" value={inputs.drivingRecord} onChange={(v: string) => handleChange("drivingRecord", v)} options={[
                { label: "Clean (No tickets or accidents)", value: "clean" },
                { label: "Minor (1-2 Speeding Tickets)", value: "minor" },
                { label: "Major (At-Fault Accident)", value: "major" },
                { label: "Severe (DUI / Reckless Driving)", value: "dui" }
              ]} />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-1">
              <CompactInput id="location" label="Primary Location" value={inputs.location} onChange={(v: string) => handleChange("location", v)} options={[
                { label: "Rural / Country (Low Traffic)", value: "rural" },
                { label: "Suburbs (Average Traffic)", value: "suburb" },
                { label: "Inner City (High Traffic/Theft)", value: "city" }
              ]} />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-1">
              <CompactInput id="coverage" label="Desired Coverage Level" value={inputs.coverageLevel} onChange={(v: string) => handleChange("coverageLevel", v)} options={[
                { label: "Liability Only (Minimum Legal)", value: "liability" },
                { label: "Standard (Good Limits)", value: "standard" },
                { label: "Full Coverage (Max Limits + Comp/Collision)", value: "full" }
              ]} />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options (Deductible & Miles) <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="col-span-2 text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Coverage Options</div>
                  <CompactInput id="deductible" label="Deductible" value={inputs.deductible} onChange={(v: string) => handleChange("deductible", v)} options={[
                    { label: "$500 (High Premium)", value: "500" },
                    { label: "$1,000 (Average)", value: "1000" },
                    { label: "$2,000 (Low Premium)", value: "2000" }
                  ]} />
                  <CompactInput id="miles" label="Annual Miles" value={inputs.annualMiles} onChange={(v: string) => handleChange("annualMiles", v)} suffix="mi" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Monthly Premium</div>
                  <div className="text-5xl font-bold text-primary mb-1">
                    {formatCurrency(results.monthlyPremium)}
                    <span className="text-xl font-normal text-muted-foreground ml-2">/ mo</span>
                  </div>
                  <div className="text-sm text-muted-foreground">This is a simulation. Actual rates vary significantly by carrier and credit score.</div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Coverage Level</div>
                    <div className="text-lg font-bold text-foreground capitalize">{inputs.coverageLevel}</div>
                  </div>
                  <div className="flex-1 p-3 text-center border-r border-border">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">6-Month Policy</div>
                    <div className="text-lg font-bold text-[#3b82f6]">{formatCurrency(results.sixMonthPremium)}</div>
                  </div>
                  <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Annual Cost</div>
                    <div className="text-lg font-bold text-foreground">{formatCurrency(results.annualPremium)}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Coverage Tier Comparison (Annual)</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} width={100} />
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} cursor={{fill: 'hsl(var(--muted)/0.5)'}} />
                        <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={30}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Premium Impact Factors</h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                      <span className="text-muted-foreground">Base Vehicle Risk</span>
                      <span className="font-medium text-foreground">{formatCurrency(results.breakdown.baseRate)}</span>
                    </div>
                    
                    {results.breakdown.agePenalty > 0 ? (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Driver Age Penalty ({inputs.driverAge} yrs)</span>
                        <span className="font-medium text-red-500">+{formatCurrency(results.breakdown.agePenalty)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Driver Age Discount ({inputs.driverAge} yrs)</span>
                        <span className="font-medium text-emerald-500">No Penalty</span>
                      </div>
                    )}

                    {results.breakdown.recordPenalty > 0 && (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Driving Record Surcharge ({inputs.drivingRecord})</span>
                        <span className="font-medium text-red-500">+{formatCurrency(results.breakdown.recordPenalty)}</span>
                      </div>
                    )}

                    {results.breakdown.locationPenalty > 0 ? (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Location Surcharge ({inputs.location})</span>
                        <span className="font-medium text-red-500">+{formatCurrency(results.breakdown.locationPenalty)}</span>
                      </div>
                    ) : results.breakdown.locationPenalty < 0 ? (
                      <div className="flex justify-between items-center px-4 py-2.5 text-base border-b border-border/50">
                        <span className="text-muted-foreground">Location Discount ({inputs.location})</span>
                        <span className="font-medium text-emerald-500">{formatCurrency(results.breakdown.locationPenalty)}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between items-center px-4 py-3 text-base border-t-2 border-border font-bold bg-muted/10">
                      <span>Total Annual Premium ({inputs.coverageLevel})</span>
                      <span className="text-primary">{formatCurrency(results.annualPremium)}</span>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Car Insurance Cost Calculator?</h2>
            <p>A Car Insurance Cost Calculator is a risk-assessment tool that simulates how automotive insurance underwriters determine your premium. Insurance companies use massive actuarial algorithms to predict how likely you are to file a claim. If you represent a high risk, they charge you a high premium. This tool breaks down those hidden risk factors—including your age, your driving record, and where you park the vehicle—to show you exactly why you pay what you pay.</p>

            <h2 className="text-2xl font-bold mb-3">The Heaviest Penalty: Driver Age</h2>
            <p>Statistically, teenagers and young adults (under the age of 25) are involved in significantly more car accidents than any other demographic. Because insurance companies operate purely on math, they levy massive <strong>Age Penalties</strong> on young drivers. If you are 18 years old, you can expect to pay double or even triple the premium of a 35-year-old with the exact same vehicle and driving record. Once you hit 25, premiums historically experience a sharp drop.</p>

            <h2 className="text-2xl font-bold mb-3">Your Driving Record is Permanent (Mostly)</h2>
            <p>Your driving record is the second largest variable. Insurance companies check your Motor Vehicle Report (MVR). A <strong>Minor Violation</strong>, like a speeding ticket, will generally trigger a 20% to 30% surcharge that stays on your record for 3 to 5 years. A <strong>Major Violation</strong>, such as an at-fault accident, can spike your rates by 50% or more. A severe violation, like a DUI, will classify you as a high-risk driver, forcing you into expensive specialized insurance pools and potentially tripling your premium overnight.</p>

            <h2 className="text-2xl font-bold mb-3">Location, Location, Location</h2>
            <p>Where you park your car at night dictates your <strong>Location Surcharge</strong>. If you live in a dense inner city, your car is statistically much more likely to be stolen, vandalized, or hit by another driver while parked. Therefore, city dwellers pay significantly more for insurance than people living in rural or suburban areas. Even moving one zip code over can change your insurance premium by hundreds of dollars a year.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1: The Safe Driver.</strong> Sarah is 35 years old, has a perfectly clean driving record, and lives in the suburbs. She drives a $25,000 car and wants Full Coverage. The calculator estimates her annual premium at roughly $1,175, or just under $100 a month. She is the ideal, low-risk client for an insurance company.</p>
            <p><strong>Example 2: The High-Risk Youth.</strong> John is 19 years old, lives in the inner city, and has one speeding ticket on his record. He drives the exact same $25,000 car as Sarah. Because of his youth, his location, and his ticket, the calculator estimates his annual premium at a staggering $4,100, or roughly $340 a month. The insurance company views him as an extreme financial risk.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>The easiest way to lower your insurance premium without changing your driving habits is to raise your <strong>Deductible</strong>. By increasing your deductible from $500 to $1,000 or $2,000, you take on more of the financial risk in the event of a minor accident. The insurance company rewards this by lowering your monthly bill. Furthermore, never blindly renew your policy. Shop around with at least three different carriers every two years, as different companies use slightly different algorithms to price risk.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-insurance-cost-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
