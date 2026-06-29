"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ownershipCost, depreciate, fmtUsd, fmtUsd2 } from "@/lib/auto/autoFinance";

interface OwnershipInputs {
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
  firstYearDepRate: number;
  annualDepRate: number;
}

interface OwnershipResult {
  annualCosts: number[];
  cumulativeCosts: number[];
  depreciationCurve: number[];
  totalCost: number;
  avgAnnualCost: number;
  costPerMile: number;
}

const DEFAULTS: OwnershipInputs = {
  purchasePrice: 35000,
  downPayment: 7000,
  loanApr: 6.9,
  loanTermYears: 5,
  annualInsurance: 1800,
  annualFuel: 2400,
  annualMaintenance: 800,
  annualRegistration: 400,
  annualParking: 0,
  annualMiles: 15000,
  firstYearDepRate: 20,
  annualDepRate: 15,
};

function calculate(input: OwnershipInputs): OwnershipResult {
  const years = 10;
  const annualCosts: number[] = [];
  const cumulativeCosts: number[] = [];
  const depCurve = depreciate(Math.max(0, input.purchasePrice), years, input.firstYearDepRate / 100, input.annualDepRate / 100);

  for (let y = 1; y <= years; y++) {
    const resale = depCurve[y] ?? 0;
    const res = ownershipCost({
      purchasePrice: Math.max(0, input.purchasePrice),
      years: y,
      annualMiles: Math.max(0, input.annualMiles),
      aprPct: Math.max(0, input.loanApr),
      loanTermYears: Math.max(0, input.loanTermYears),
      downPayment: Math.max(0, input.downPayment),
      insuranceAnnual: Math.max(0, input.annualInsurance),
      fuelAnnual: Math.max(0, input.annualFuel),
      maintenanceAnnual: Math.max(0, input.annualMaintenance),
      registrationAnnual: Math.max(0, input.annualRegistration),
      parkingAnnual: Math.max(0, input.annualParking),
      resaleValue: resale,
    });
    annualCosts.push(res.annualCost);
    cumulativeCosts.push(res.totalOutOfPocket);
  }

  const totalCost = cumulativeCosts[years - 1] ?? 0;
  const avgAnnualCost = totalCost / years;
  const cpm = input.annualMiles * years > 0 ? totalCost / (input.annualMiles * years) : 0;

  return { annualCosts, cumulativeCosts, depreciationCurve: depCurve, totalCost, avgAnnualCost, costPerMile: cpm };
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

const CarOwnershipAnnualCostCalculator = () => {
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
  const [firstYearDepRate, setFirstYearDepRate] = useState(String(DEFAULTS.firstYearDepRate));
  const [annualDepRate, setAnnualDepRate] = useState(String(DEFAULTS.annualDepRate));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<OwnershipResult | null>(null);

  const inputs: OwnershipInputs = useMemo(() => ({
    purchasePrice: parseFloat(purchasePrice) || 0, downPayment: parseFloat(downPayment) || 0,
    loanApr: parseFloat(loanApr) || 0, loanTermYears: parseFloat(loanTermYears) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0, annualFuel: parseFloat(annualFuel) || 0,
    annualMaintenance: parseFloat(annualMaintenance) || 0, annualRegistration: parseFloat(annualRegistration) || 0,
    annualParking: parseFloat(annualParking) || 0, annualMiles: parseFloat(annualMiles) || 0,
    firstYearDepRate: parseFloat(firstYearDepRate) || 20, annualDepRate: parseFloat(annualDepRate) || 15,
  }), [purchasePrice, downPayment, loanApr, loanTermYears, annualInsurance, annualFuel, annualMaintenance, annualRegistration, annualParking, annualMiles, firstYearDepRate, annualDepRate]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    const d = DEFAULTS;
    setPurchasePrice(String(d.purchasePrice)); setDownPayment(String(d.downPayment)); setLoanApr(String(d.loanApr)); setLoanTermYears(String(d.loanTermYears));
    setAnnualInsurance(String(d.annualInsurance)); setAnnualFuel(String(d.annualFuel)); setAnnualMaintenance(String(d.annualMaintenance));
    setAnnualRegistration(String(d.annualRegistration)); setAnnualParking(String(d.annualParking)); setAnnualMiles(String(d.annualMiles));
    setFirstYearDepRate(String(d.firstYearDepRate)); setAnnualDepRate(String(d.annualDepRate)); setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const chartData = results ? results.annualCosts.map((ac, i) => ({
    year: `Year ${i + 1}`,
    annual: Math.round(ac),
    cumulative: Math.round(results.cumulativeCosts[i]),
  })) : [];

  const faqs = [
    { question: "What does car ownership cost per year on average?", answer: "The average American spends $8,000–$10,000 per year to own and operate a vehicle. This includes depreciation ($3,000–$5,000), insurance ($1,500–$2,500), fuel ($1,800–$3,000), maintenance ($500–$1,200), and registration/parking. The exact figure depends heavily on the vehicle's purchase price, fuel efficiency, and how long you keep it." },
    { question: "Why does the annual cost change over time?", answer: "Depreciation is front-loaded — year 1 loses 20%, year 2 loses 15% of the remaining value, etc. So annual depreciation cost drops each year while maintenance tends to rise. Insurance may also decrease slightly as the car ages. The net effect is that annual cost typically declines after the first few years." },
    { question: "How does ownership length affect annual cost?", answer: "Longer ownership dramatically lowers annual cost because the heaviest depreciation happens early. A car owned for 3 years might cost $10,000/year, but the same car owned for 8 years might drop to $6,500/year. The loan interest also finishes sooner, further reducing cost." },
    { question: "What is the best ownership length for cost efficiency?", answer: "From a pure cost perspective, 8–10 years is optimal. By that point, depreciation has flattened, the loan is paid off, and the remaining costs are mainly fuel, insurance, and maintenance. However, rising maintenance costs after 100,000 miles can offset some savings." },
    { question: "Should I include depreciation in my annual budget?", answer: "Yes. While depreciation is a non-cash expense, it represents real lost wealth. If you're comparing vehicles, depreciation must be included because a $50,000 car and a $25,000 car have very different depreciation trajectories even if their fuel and insurance costs are similar." },
    { question: "How does the loan term affect annual ownership cost?", answer: "A longer loan term (72 months vs 48 months) reduces monthly payments but increases total interest by $1,500–$3,000. However, since annual cost is calculated over the ownership period, the impact per year is modest — roughly $250–$500/year more for a 72-month term." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Ownership Annual Cost" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Ownership Annual Cost Calculator</h1>

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
                  <CI id="dep1" label="Year-1 Depreciation" value={firstYearDepRate} onChange={setFirstYearDepRate} suffix="%" />
                  <CI id="depN" label="Annual Depreciation" value={annualDepRate} onChange={setAnnualDepRate} suffix="%" />
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

                <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-violet-600 mb-1 uppercase tracking-wider">Average Annual Ownership Cost</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.avgAnnualCost).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">${results.costPerMile.toFixed(2)}/mile · ${Math.round(results.totalCost).toLocaleString()} over 10 years</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Year 1 Cost</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.annualCosts[0]).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Year 5 Cost</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.annualCosts[4] || 0).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Year 10 Cost</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.annualCosts[9] || 0).toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Year</th>
                        <th className="p-2.5 text-right">Annual Cost</th>
                        <th className="p-2.5 text-right">Cumulative</th>
                        <th className="p-2.5 pr-3 text-right">Est. Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.annualCosts.map((ac, i) => (
                        <tr key={i} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">Year {i + 1}</td>
                          <td className="p-2.5 text-right text-foreground">${Math.round(ac).toLocaleString()}</td>
                          <td className="p-2.5 text-right font-medium">${Math.round(results.cumulativeCosts[i]).toLocaleString()}</td>
                          <td className="p-2.5 pr-3 text-right text-red-600">${Math.round(results.depreciationCurve[i + 1]).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Annual Cost Over 10 Years</h3>
                  <div className="w-full h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === "annual" ? "Annual" : "Cumulative"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                        <Line type="monotone" dataKey="annual" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 4 }} name="annual" />
                        <Line type="monotone" dataKey="cumulative" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 3" dot={false} name="cumulative" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Car Ownership Annual Cost Calculator?</h2>
            <p>The Car Ownership Annual Cost Calculator computes your year-by-year cost of owning a vehicle over a 10-year horizon. Unlike simple annual cost estimates, this tool shows how costs evolve over time — high in year 1 due to steep depreciation, then declining as the loan pays off and depreciation flattens. It provides an average annual cost, per-mile cost, and a year-by-year breakdown with cumulative totals and estimated vehicle value.</p>
            <p>This long-term view is essential for understanding how long you should keep a car to minimize cost and when the optimal sell point occurs.</p>

            <h2>How It Works</h2>
            <p>The calculator uses an accelerated depreciation model (20% in year 1, 15% per year after by default) to estimate your vehicle's market value at the end of each year. For each year from 1 to 10, it computes the full ownership cost including depreciation to that point, loan interest, insurance, fuel, maintenance, registration, and parking. The annual cost for each year is the total divided by the number of years owned, showing how per-year cost decreases the longer you hold the vehicle.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary card shows your average annual cost over 10 years. The 3-stat bar compares Year 1, Year 5, and Year 10 costs — you'll typically see Year 1 is the most expensive due to the 20% first-year depreciation hit. The year-by-year table shows annual cost, cumulative spending, and estimated vehicle value. The line chart visualizes the annual cost trajectory (declining curve) alongside cumulative spending (rising curve).</p>

            <h2>Why Annual Cost Declines Over Time</h2>
            <ul>
              <li><strong>Depreciation flattens:</strong> The 20% first-year loss is a one-time hit. By year 5, annual depreciation is typically $2,000–$3,000 vs $7,000+ in year 1.</li>
              <li><strong>Loan interest ends:</strong> Once your loan is paid off (typically years 3–6), that entire cost component disappears.</li>
              <li><strong>Insurance may decrease:</strong> Older vehicles generally cost less to insure as their replacement value drops.</li>
              <li><strong>Maintenance rises, but less than depreciation drops:</strong> Maintenance typically increases $100–$200/year as the car ages, but this is usually offset by falling depreciation.</li>
            </ul>

            <h2>Practical Examples</h2>
            <h3>Example 1: $35,000 sedan, 5-year loan</h3>
            <p>Year 1 cost: ~$10,500 (heavy depreciation). Year 5: ~$7,800. Year 10: ~$5,200. Average over 10 years: ~$7,400/year. The cost drops 50% from year 1 to year 10.</p>
            <h3>Example 2: $25,000 compact, cash purchase</h3>
            <p>Year 1: ~$6,800. Year 5: ~$4,500. Year 10: ~$3,200. Average: ~$4,900/year. No loan interest means lower costs throughout.</p>

            <h2>Tips for Reducing Annual Ownership Cost</h2>
            <ul>
              <li><strong>Keep the car 8–10 years.</strong> Annual cost drops significantly after the loan is paid off and depreciation flattens.</li>
              <li><strong>Pay cash or choose short loan terms.</strong> Eliminating interest saves $1,000–$2,000/year during the loan period.</li>
              <li><strong>Buy vehicles with slow depreciation.</strong> Toyota, Honda, and Subaru models lose value more slowly than average.</li>
              <li><strong>Shop insurance every renewal.</strong> You can often save 15–25% by switching carriers every 2–3 years.</li>
              <li><strong>Maintain preventively.</strong> Following the maintenance schedule prevents expensive breakdowns.</li>
            </ul>

            <h2>Benefits of Using This Calculator</h2>
            <p>This tool uniquely shows the time dimension of car ownership cost. By revealing how annual cost changes from year to year, it helps you decide the optimal ownership length for your vehicle, compare the true long-term cost of different vehicles, and understand exactly when the financial benefits of keeping your car outweigh the rising maintenance costs.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-ownership-annual-cost-calculator" />
          <PopularCalculators exclude="/calculator/car-ownership-annual-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default CarOwnershipAnnualCostCalculator;
