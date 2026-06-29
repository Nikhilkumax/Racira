"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Car } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CarInsInputs {
  age: number;
  carValue: number;
  drivingRecord: string;
  state: string;
  gender: string;
  carYear: number;
  annualMiles: number;
  coverage: string;
  deductible: number;
}

interface CarInsResults {
  liability: number;
  collision: number;
  comprehensive: number;
  pip: number;
  uninsured: number;
  totalAnnual: number;
  totalMonthly: number;
  chartData: { category: string; premium: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const stateFactor: Record<string, number> = {
  MI: 2.1, LA: 1.85, FL: 1.8, NY: 1.65, NJ: 1.6, CO: 1.4, KY: 1.35, WA: 1.3,
  CA: 1.25, GA: 1.2, MO: 1.15, TX: 1.1, IL: 1.1, PA: 1.05, MD: 1.05,
  VA: 1.0, OH: 0.95, IN: 0.9, TN: 0.9, NC: 0.88, AZ: 0.92, WI: 0.85,
  MN: 0.85, IA: 0.7, ME: 0.7, NH: 0.65, ID: 0.68, UT: 0.72, OR: 0.9,
};

const calculateInsurance = (inputs: CarInsInputs): CarInsResults => {
  const { age, carValue, drivingRecord, state, gender, carYear, annualMiles, coverage, deductible } = inputs;
  
  const sf = stateFactor[state] || 1.0;
  const carAge = Math.max(0, new Date().getFullYear() - carYear);

  // Risk Factors
  let ageFactor = 1.0;
  if (age < 25) ageFactor = 1.7;
  else if (age < 30) ageFactor = 1.2;
  else if (age >= 65) ageFactor = 1.15;
  
  if (gender === "male" && age < 25) ageFactor *= 1.1; // Young males are statistically higher risk

  const recFactor = drivingRecord === "clean" ? 1.0 : drivingRecord === "minor" ? 1.35 : 1.85;
  const milesFactor = annualMiles < 7500 ? 0.85 : annualMiles > 15000 ? 1.1 : 1.0;
  const dedDiscount = deductible === 250 ? 1.12 : deductible === 500 ? 1.0 : deductible === 1000 ? 0.88 : 0.78;

  // Base Coverage Calculations
  const liability = Math.round(500 * ageFactor * recFactor * sf * milesFactor * dedDiscount);
  const pip = Math.round(120 * sf);
  const uninsured = Math.round(80 * sf * ageFactor);

  let collision = 0;
  let comprehensive = 0;
  
  if (coverage !== "liability") {
    // Depreciate value for physical damage coverage
    const depreciatedValue = carValue * Math.pow(0.85, carAge);
    
    collision = Math.round((depreciatedValue / 100) * 1.2 * ageFactor * recFactor * sf * dedDiscount);
    comprehensive = Math.round((depreciatedValue / 100) * 0.5 * sf);
    
    if (coverage === "standard") {
      collision = Math.round(collision * 0.8);
      comprehensive = Math.round(comprehensive * 0.8);
    }
  }

  const totalAnnual = liability + collision + comprehensive + pip + uninsured;
  const totalMonthly = totalAnnual / 12;

  const chartData = [
    { category: "Liability", premium: liability, color: "hsl(var(--primary))" },
    { category: "Collision", premium: collision, color: "#3b82f6" },
    { category: "Comp", premium: comprehensive, color: "#10b981" },
    { category: "PIP & UM", premium: pip + uninsured, color: "#8b5cf6" },
  ].filter(d => d.premium > 0);

  const summaryStats = [
    { label: "Driver Risk Profile", value: drivingRecord === "clean" ? "Low Risk" : "High Risk" },
    { label: "State Multiplier", value: `${(sf * 100).toFixed(0)}% of Nat. Avg` },
    { label: "Coverage Level", value: coverage.toUpperCase() },
    { label: "Estimated Monthly", value: `$${totalMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` },
  ];

  const breakdown = [
    { label: "Bodily Injury & Property Liability", amount: `$${liability.toLocaleString("en-US")}` },
    { label: "Collision Coverage", amount: collision > 0 ? `$${collision.toLocaleString("en-US")}` : "Declined" },
    { label: "Comprehensive Coverage", amount: comprehensive > 0 ? `$${comprehensive.toLocaleString("en-US")}` : "Declined" },
    { label: "Personal Injury Protection (PIP)", amount: `$${pip.toLocaleString("en-US")}` },
    { label: "Uninsured Motorist", amount: `$${uninsured.toLocaleString("en-US")}` },
    { label: "Total Estimated Annual Premium", amount: `$${totalAnnual.toLocaleString("en-US")}`, isTotal: true, colorClass: "text-primary" },
  ];

  return { liability, collision, comprehensive, pip, uninsured, totalAnnual, totalMonthly, chartData, summaryStats, breakdown };
};

const DEFAULTS = { age: "32", carValue: "28000", drivingRecord: "clean", state: "CA", gender: "male", carYear: "2021", annualMiles: "12000", coverage: "full", deductible: "500" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

export default function CarInsuranceCalculator() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [carValue, setCarValue] = useState(DEFAULTS.carValue);
  const [drivingRecord, setDrivingRecord] = useState(DEFAULTS.drivingRecord);
  const [state, setState] = useState(DEFAULTS.state);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [carYear, setCarYear] = useState(DEFAULTS.carYear);
  const [annualMiles, setAnnualMiles] = useState(DEFAULTS.annualMiles);
  const [coverage, setCoverage] = useState(DEFAULTS.coverage);
  const [deductible, setDeductible] = useState(DEFAULTS.deductible);

  const [results, setResults] = useState<CarInsResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateInsurance({
      age: parseInt(age) || 32,
      carValue: parseFloat(carValue) || 28000,
      drivingRecord, state, gender,
      carYear: parseInt(carYear) || 2021,
      annualMiles: parseInt(annualMiles) || 12000,
      coverage,
      deductible: parseInt(deductible) || 500
    }));
  };

  const handleReset = () => {
    setAge(DEFAULTS.age); setCarValue(DEFAULTS.carValue); setDrivingRecord(DEFAULTS.drivingRecord); setState(DEFAULTS.state);
    setGender(DEFAULTS.gender); setCarYear(DEFAULTS.carYear); setAnnualMiles(DEFAULTS.annualMiles); setCoverage(DEFAULTS.coverage); setDeductible(DEFAULTS.deductible);
    setShowAdvanced(false);
    setResults(calculateInsurance({
      age: parseInt(DEFAULTS.age), carValue: parseFloat(DEFAULTS.carValue), drivingRecord: DEFAULTS.drivingRecord, state: DEFAULTS.state,
      gender: DEFAULTS.gender, carYear: parseInt(DEFAULTS.carYear), annualMiles: parseInt(DEFAULTS.annualMiles), coverage: DEFAULTS.coverage, deductible: parseInt(DEFAULTS.deductible)
    }));
  };

  useEffect(() => { handleCalculate(); }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Car Insurance Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const stateOptions = Object.keys(stateFactor).sort().map(s => ({ value: s, label: s }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.category}:</span>
          <span className="text-foreground">${payload[0].value.toLocaleString()}</span>
        </div>
      );
    }
    return null;
  };

  const faqs = [
    { question: "What is the minimum car insurance required?", answer: "Every state requires at least liability insurance—usually expressed as limits like 25/50/25 (bodily injury per person/per accident/property damage). Lenders require collision and comprehensive for financed or leased vehicles. Note: Minimum liability limits are dangerously low if you cause a serious accident." },
    { question: "What affects car insurance rates the most?", answer: "The biggest factors are: Driving record (at-fault accidents, DUIs, and speeding tickets dramatically raise rates), Age (teens and seniors pay significantly more), State (Michigan and Louisiana have the highest rates nationwide), Vehicle value, Annual mileage, and Coverage limits chosen." },
    { question: "What is the difference between collision and comprehensive?", answer: "Collision covers damage to your vehicle from hitting another vehicle or object, regardless of fault. Comprehensive covers everything else: theft, vandalism, floods, fire, fallen trees, and animal strikes. Both typically require a deductible to be paid before coverage kicks in." },
    { question: "Should I drop collision on an old car?", answer: "A general rule of thumb is the 10% rule: if your annual premium for collision and comprehensive is more than 10% of the vehicle's total value, it may be time to drop them. You would pay more in premiums over a few years than the insurance company would ever pay out for a total loss." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Car Insurance Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Insurance Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="age" label="Driver Age" value={age} onChange={setAge} suffix="yrs" />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">State</label>
                <select value={state} onChange={(e) => setState(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  {stateOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1.5">Driving Record</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full shadow-sm">
                <button type="button" onClick={() => setDrivingRecord("clean")} className={`flex-1 text-xs sm:text-sm font-semibold transition-colors ${drivingRecord === "clean" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Clean</button>
                <button type="button" onClick={() => setDrivingRecord("minor")} className={`flex-1 text-xs sm:text-sm font-semibold transition-colors border-l border-input ${drivingRecord === "minor" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Minor (1 Ticket)</button>
                <button type="button" onClick={() => setDrivingRecord("major")} className={`flex-1 text-xs sm:text-sm font-semibold transition-colors border-l border-input ${drivingRecord === "major" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Major / DUI</button>
              </div>
            </div>

            <CompactInput id="val" label="Estimated Vehicle Value" value={carValue} onChange={setCarValue} prefix="$" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-4">
                    <CompactInput id="year" label="Vehicle Year" value={carYear} onChange={setCarYear} />
                    <CompactInput id="miles" label="Annual Miles" value={annualMiles} onChange={setAnnualMiles} suffix="mi" />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1.5">Coverage Level</label>
                    <div className="flex rounded-md border border-input overflow-hidden h-9 w-full">
                      <button type="button" onClick={() => setCoverage("liability")} className={`flex-1 text-xs font-semibold transition-colors ${coverage === "liability" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary/80"}`}>Liability</button>
                      <button type="button" onClick={() => setCoverage("standard")} className={`flex-1 text-xs font-semibold transition-colors border-l border-input ${coverage === "standard" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary/80"}`}>Standard</button>
                      <button type="button" onClick={() => setCoverage("full")} className={`flex-1 text-xs font-semibold transition-colors border-l border-input ${coverage === "full" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary/80"}`}>Full</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-foreground mb-1.5">Gender</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-foreground mb-1.5">Collision Deductible</label>
                      <select value={deductible} onChange={(e) => setDeductible(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                        <option value="250">$250</option>
                        <option value="500">$500</option>
                        <option value="1000">$1,000</option>
                        <option value="1500">$1,500</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Annual Premium</div>
                  <div className="text-4xl font-bold text-primary tracking-tighter mb-2">
                    ${results.totalAnnual.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <Car className="h-4 w-4" /> Or ${results.totalMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })} per month
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {results.summaryStats.map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stat.label}</div>
                      <div className="text-sm font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Coverage</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Premium</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[14px] py-3 px-3">{item.label}</td>
                            <td className={`text-[14px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Premium Allocation</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                        <Bar dataKey="premium" radius={[4, 4, 0, 0]}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Car Insurance Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A car insurance calculator provides a data-driven estimate of your expected annual auto insurance premium based on the key underwriting factors used by major insurers. It applies state-specific rate factors (insurance costs vary by 3x or more between states), age-based risk multipliers, driving record adjustments, mileage factors, and deductible discounts to produce a realistic estimate for budgeting and comparison purposes. While actual quotes require full underwriting, this tool provides a highly accurate baseline.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Breaking Down Coverage Types</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Liability Insurance</strong> is mandatory in nearly all states and covers bodily injury and property damage you cause to others in an at-fault accident. It does not cover your own vehicle or injuries. <strong>Collision Insurance</strong> pays to repair your vehicle regardless of fault and is required by lenders on financed vehicles. <strong>Comprehensive Insurance</strong> covers non-collision losses: theft, vandalism, fire, flood, hail, fallen trees, and animal strikes.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-3">Key Underwriting Factors</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your driving record is the largest variable; a single at-fault accident or DUI can double your rates instantly. Age is also critical, with drivers under 25 paying the highest premiums due to statistical risk, before rates plateau in your 30s and drop further in your 40s and 50s. State geography matters massively: states with extreme weather (Florida), dense traffic (New York), or unique legal frameworks (Michigan) have significantly higher base rates than rural states like Iowa or Maine.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">How to Lower Your Premium</h2>
              <p className="text-muted-foreground leading-relaxed">
                The most effective way to lower your insurance cost is to aggressively shop multiple carriers, as rate differences of 40% for the exact same coverage are common. You can instantly lower your premium by raising your collision deductible (e.g., from $500 to $1,000), which shifts more immediate risk to you but saves you money every month. Bundling your auto insurance with homeowners or renters insurance typically yields a 10% to 25% discount. Finally, for very low mileage drivers, pay-per-mile programs can drastically cut costs compared to traditional fixed-rate policies.
              </p>
            </div>
          </section>
          
          <FAQSection faqs={[
            { question: "What is the minimum car insurance required?", answer: "Every state requires at least liability insurance—usually expressed as limits like 25/50/25 (bodily injury per person/per accident/property damage). Lenders require collision and comprehensive for financed or leased vehicles. Note: Minimum liability limits are dangerously low if you cause a serious accident." },
            { question: "What affects car insurance rates the most?", answer: "The biggest factors are: Driving record (at-fault accidents, DUIs, and speeding tickets dramatically raise rates), Age (teens and seniors pay significantly more), State (Michigan and Louisiana have the highest rates nationwide), Vehicle value, Annual mileage, and Coverage limits chosen." },
            { question: "What is the difference between collision and comprehensive?", answer: "Collision covers damage to your vehicle from hitting another vehicle or object, regardless of fault. Comprehensive covers everything else: theft, vandalism, floods, fire, fallen trees, and animal strikes. Both typically require a deductible to be paid before coverage kicks in." },
            { question: "Should I drop collision on an old car?", answer: "A general rule of thumb is the 10% rule: if your annual premium for collision and comprehensive is more than 10% of the vehicle's total value, it may be time to drop them. You would pay more in premiums over a few years than the insurance company would ever pay out for a total loss." }
          ]} pageUrl="https://racira.com/calculator/car-insurance-calculator" />
          <PopularCalculators exclude="/calculator/car-insurance-calculator" />
        </div>
      </div>
    </>
  );
}
