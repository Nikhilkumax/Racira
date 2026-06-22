"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Car } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = (n: number, d = 0) => `$${fmt(n, d)}`;

const Sel = ({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <select id={id} value={value} onChange={e => onChange(e.target.value)} className="rounded-md border border-input bg-background h-10 px-3 text-base text-foreground outline-none shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Inp = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface CarInsResult {
  liability: number; collision: number; comprehensive: number; pip: number; uninsured: number;
  total: number; monthly: number;
  breakdown: { name: string; value: number }[];
}

export default function CarInsuranceCalculator() {
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState("male");
  const [carYear, setCarYear] = useState("2021");
  const [carValue, setCarValue] = useState("28000");
  const [drivingRecord, setDrivingRecord] = useState("clean");
  const [annualMiles, setAnnualMiles] = useState("12000");
  const [coverage, setCoverage] = useState("full");
  const [deductible, setDeductible] = useState("500");
  const [state, setState] = useState("CA");
  const [res, setRes] = useState<CarInsResult | null>(null);

  const stateFactor: Record<string, number> = {
    MI: 2.1, LA: 1.85, FL: 1.8, NY: 1.65, NJ: 1.6, CO: 1.4, KY: 1.35, WA: 1.3,
    CA: 1.25, GA: 1.2, MO: 1.15, TX: 1.1, IL: 1.1, PA: 1.05, MD: 1.05,
    VA: 1.0, OH: 0.95, IN: 0.9, TN: 0.9, NC: 0.88, AZ: 0.92, WI: 0.85,
    MN: 0.85, IA: 0.7, ME: 0.7, NH: 0.65, ID: 0.68, UT: 0.72, OR: 0.9,
  };

  useEffect(() => { calculate(); }, []);

  const calculate = () => {
    const a = parseInt(age) || 32;
    const cv = parseFloat(carValue) || 28000;
    const cy = parseInt(carYear) || 2021;
    const miles = parseInt(annualMiles) || 12000;
    const ded = parseInt(deductible) || 500;
    const sf = stateFactor[state] || 1.0;
    const carAge = new Date().getFullYear() - cy;

    // Age factor
    let ageFactor = 1.0;
    if (a < 25) ageFactor = 1.7;
    else if (a < 30) ageFactor = 1.2;
    else if (a >= 65) ageFactor = 1.15;

    // Driving record factor
    const recFactor = drivingRecord === "clean" ? 1.0 : drivingRecord === "minor" ? 1.35 : 1.85;

    // Miles factor
    const milesFactor = miles < 7500 ? 0.85 : miles > 15000 ? 1.1 : 1.0;

    // Deductible discount
    const dedDiscount = ded === 250 ? 1.12 : ded === 500 ? 1.0 : ded === 1000 ? 0.88 : 0.78;

    // Base liability ($500/yr national average base)
    const liability = Math.round(500 * ageFactor * recFactor * sf * milesFactor * dedDiscount);
    const pip = Math.round(120 * sf);
    const uninsured = Math.round(80 * sf * ageFactor);

    let collision = 0, comprehensive = 0;
    if (coverage !== "liability") {
      const depreciatedValue = cv * Math.pow(0.85, carAge);
      collision = Math.round((depreciatedValue / 100) * 1.2 * ageFactor * recFactor * sf * dedDiscount);
      comprehensive = Math.round((depreciatedValue / 100) * 0.5 * sf);
    }

    const total = liability + collision + comprehensive + pip + uninsured;
    const monthly = total / 12;

    const breakdown = [
      { name: "Liability", value: liability },
      { name: "Collision", value: collision },
      { name: "Comprehensive", value: comprehensive },
      { name: "PIP/MedPay", value: pip },
      { name: "Uninsured", value: uninsured },
    ].filter(b => b.value > 0);

    setRes({ liability, collision, comprehensive, pip, uninsured, total, monthly, breakdown });
  };

  const faqs = [
    { question: "What is the minimum car insurance required?", answer: "Every state requires at least liability insurance — usually expressed as limits like 25/50/25 (bodily injury per person/per accident/property damage). Some states add PIP or uninsured motorist requirements. Lenders require collision and comprehensive for financed/leased vehicles. Don't just meet minimums — minimum liability limits are dangerously low if you cause a serious accident." },
    { question: "What affects car insurance rates the most?", answer: "The biggest factors are: Driving record (at-fault accidents, DUIs, speeding tickets dramatically raise rates), Age (teens and seniors pay significantly more), State (Michigan and Louisiana have the highest rates nationwide), Vehicle (luxury/sports cars cost more to insure), Credit score (in most states, poor credit can double your premium), Annual mileage, and Coverage limits/deductibles chosen." },
    { question: "What is the difference between collision and comprehensive?", answer: "Collision covers damage from hitting another vehicle or object, regardless of fault. Comprehensive covers everything else: theft, vandalism, floods, fire, fallen trees, hail, and animal strikes. Both have deductibles you choose. For older cars worth less than $4,000-$5,000, dropping collision/comprehensive may make financial sense — you'd pay more in premiums than the car is worth." },
    { question: "How much liability insurance do I need?", answer: "State minimums are often insufficient. If you cause a serious accident with significant bodily injury, minimum limits leave you personally liable for costs above the limit. A common recommendation: 100/300/100 ($100k per person, $300k per accident, $100k property damage). If you have significant assets (home equity, investments), consider an umbrella policy for $1 million+ additional coverage." },
    { question: "Will my rate go up after a claim?", answer: "Usually yes — at-fault accidents typically raise rates 25-50% for 3-5 years. Even not-at-fault accidents can increase rates slightly in some states. Minor comprehensive claims (small hail damage, cracked windshield) often have less impact. Check if you have accident forgiveness coverage. For minor fender-benders where damage is less than your deductible + 2 years of increased premiums, consider paying out-of-pocket." },
  ];

  const stateOptions = Object.keys(stateFactor).sort().map(s => ({ value: s, label: s }));

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Car Insurance Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Insurance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Driver & Vehicle Details</h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Inp id="age" label="Driver Age" value={age} onChange={setAge} suffix="yrs" />
                <Sel id="gender" label="Gender" value={gender} onChange={setGender} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Inp id="caryear" label="Vehicle Year" value={carYear} onChange={setCarYear} />
                <Inp id="carval" label="Vehicle Value" value={carValue} onChange={setCarValue} prefix="$" />
              </div>
              <Sel id="state" label="State" value={state} onChange={setState} options={stateOptions} />
              <Sel id="record" label="Driving Record" value={drivingRecord} onChange={setDrivingRecord} options={[{ value: "clean", label: "Clean (no violations)" }, { value: "minor", label: "1 Minor Violation" }, { value: "major", label: "Major Violation / DUI" }]} />
              <Inp id="miles" label="Annual Miles Driven" value={annualMiles} onChange={setAnnualMiles} suffix="mi" />
              <Sel id="coverage" label="Coverage Level" value={coverage} onChange={setCoverage} options={[{ value: "liability", label: "Liability Only (state minimum)" }, { value: "standard", label: "Standard (+ collision/comp)" }, { value: "full", label: "Full Coverage" }]} />
              <Sel id="deductible" label="Collision Deductible" value={deductible} onChange={setDeductible} options={[{ value: "250", label: "$250" }, { value: "500", label: "$500" }, { value: "1000", label: "$1,000" }, { value: "1500", label: "$1,500" }]} />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Estimate
              </button>
              <button type="button" onClick={() => { setAge("32"); setGender("male"); setCarYear("2021"); setCarValue("28000"); setDrivingRecord("clean"); setAnnualMiles("12000"); setCoverage("full"); setDeductible("500"); setState("CA"); setTimeout(calculate, 0); }} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">* Estimates for comparison only. Actual rates depend on full underwriting including credit score and claims history.</p>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Estimated Insurance Cost</h2>
                  <Car className="h-5 w-5 text-primary" />
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Annual Premium</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtUSD(res.total)}</div>
                  <div className="text-sm text-muted-foreground font-medium">{fmtUSD(res.monthly, 0)}/month</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Coverage</th><th className="p-2.5 pr-3 text-right">Annual Cost</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      {[
                        { label: "Bodily Injury / Property Damage Liability", value: fmtUSD(res.liability) },
                        { label: "Collision", value: res.collision > 0 ? fmtUSD(res.collision) : "Not Selected" },
                        { label: "Comprehensive", value: res.comprehensive > 0 ? fmtUSD(res.comprehensive) : "Not Selected" },
                        { label: "PIP / Medical Payments", value: fmtUSD(res.pip) },
                        { label: "Uninsured Motorist", value: fmtUSD(res.uninsured) },
                        { label: "Total Annual Premium", value: fmtUSD(res.total) },
                      ].map(row => (
                        <tr key={row.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-medium text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Premium Breakdown by Coverage</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={res.breakdown} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                      <Tooltip formatter={(v: any) => [fmtUSD(v), "Annual Premium"]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "Annual", value: fmtUSD(res.total) },
                    { label: "Monthly", value: fmtUSD(res.monthly) },
                    { label: "Liability", value: fmtUSD(res.liability) },
                    { label: "Collision", value: res.collision > 0 ? fmtUSD(res.collision) : "N/A" },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>How This Car Insurance Calculator Works</h2>
            <p>This car insurance calculator provides a data-driven estimate of your expected annual auto insurance premium based on the key underwriting factors used by major insurers. It applies state-specific rate factors (insurance costs vary by 3× or more between states), age-based risk multipliers, driving record adjustments, mileage factors, and deductible discounts to produce a realistic estimate for budgeting and comparison purposes.</p>
            <p>The national average for full coverage auto insurance is approximately $1,600-$2,000 per year (2024), though individual rates vary dramatically. A clean-record 35-year-old in a low-risk state might pay $800-$1,200, while a 20-year-old with a DUI in Michigan might pay $5,000+. Always shop multiple carriers — rate differences of 40-50% for the same coverage are common.</p>

            <h2>Breaking Down Auto Insurance Coverage Types</h2>
            <p><strong>Liability Insurance</strong> is mandatory in nearly all states and covers bodily injury and property damage you cause to others in an at-fault accident. It does not cover your own vehicle or injuries. State minimums are dangerously low — consider 100/300/100 ($100k per person, $300k per accident, $100k property) as a responsible baseline.</p>
            <p><strong>Collision Insurance</strong> pays to repair your vehicle regardless of fault. Required by lenders on financed vehicles. For older cars, calculate: if your car is worth less than 10× your annual premium for this coverage, consider dropping it. The break-even analysis: if collision coverage costs $700/year and your car is worth $5,000, you'd collect at most $4,500 (after deductible) — not worth the premium for many older vehicles.</p>
            <p><strong>Comprehensive Insurance</strong> covers non-collision losses: theft, vandalism, fire, flood, hail, fallen trees, and animal strikes. Often called "other than collision." Generally cheaper than collision and usually worth maintaining even on older vehicles given theft and weather risks.</p>

            <h2>How to Get the Cheapest Car Insurance</h2>
            <p>Shopping multiple carriers is the single most impactful step — online brokers like The Zebra or Policygenius compare dozens of insurers instantly. Bundle home and auto for 10-25% savings. Increase your deductible (from $500 to $1,000 saves ~15%). Maintain a clean driving record — one at-fault accident raises premiums 25-50% for 3-5 years. Take a defensive driving course (5-15% discount). Ask about good student, military, alumni, and professional association discounts. For very low mileage drivers, pay-per-mile programs (Metromile, Allstate Milewise) can save 30-50%.</p>

            <h2>Understanding Your State's Insurance Requirements</h2>
            <p>Insurance requirements vary significantly by state. Michigan has the nation's most expensive premiums but also the most comprehensive PIP (Personal Injury Protection) requirements. Florida requires PIP but not uninsured motorist coverage, despite having the highest percentage of uninsured drivers. New Hampshire is the only state that doesn't require liability insurance (though financial responsibility is still required). California prohibits insurers from using credit scores — unusual nationally. Always check your state's specific DMV requirements before selecting coverage levels.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-insurance-calculator" />
          <PopularCalculators exclude="/calculator/car-insurance-calculator" />
        </div>
      </div>
    </>
  );
}
