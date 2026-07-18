"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Target, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RangeResults {
  min: number;
  max: number;
  midpoint: number;
  spread: number;
  rangeDiff: number;
  q1Target: number;
  q2Target: number;
  q3Target: number;
  chartData: { name: string; Q1: number; Q2: number; Q3: number; Q4: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateRange = (min: number, max: number): RangeResults => {
  // Enforce Max >= Min
  const actualMax = Math.max(min, max);
  
  const midpoint = (min + actualMax) / 2;
  const spread = min > 0 ? ((actualMax - min) / min) * 100 : 0;
  const rangeDiff = actualMax - min;

  // Calculate quartiles (dividing the range into 4 equal segments)
  const quarterStep = rangeDiff / 4;
  const q1Target = min + quarterStep;
  const q2Target = midpoint; // min + 2 * quarterStep
  const q3Target = min + 3 * quarterStep;

  // Chart data: A stacked bar to visualize the quartiles
  const chartData = [
    { 
      name: "Salary Band Quartiles", 
      Q1: quarterStep, 
      Q2: quarterStep, 
      Q3: quarterStep, 
      Q4: quarterStep 
    }
  ];

  const summaryStats = [
    { label: "Calculated Midpoint", value: `$${midpoint.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Band Spread", value: `${spread.toFixed(1)}%` },
    { label: "Total Range ($)", value: `$${rangeDiff.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Quartile Step", value: `$${quarterStep.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "First Quartile (Q1) - Developing", amount: `$${min.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${q1Target.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-amber-500" },
    { label: "Second Quartile (Q2) - Proficient", amount: `$${q1Target.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${q2Target.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-emerald-500" },
    { label: "Third Quartile (Q3) - Advanced", amount: `$${q2Target.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${q3Target.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-blue-500" },
    { label: "Fourth Quartile (Q4) - Expert", amount: `$${q3Target.toLocaleString("en-US", { maximumFractionDigits: 0 })} - $${actualMax.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-purple-500" },
    { label: "Band Target Midpoint", amount: `$${midpoint.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true, colorClass: "text-foreground font-bold" },
  ];

  return { min, max: actualMax, midpoint, spread, rangeDiff, q1Target, q2Target, q3Target, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  min: "60000",
  max: "90000",
};

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

export default function SalaryBandRangeCalculator() {
  const [min, setMin] = useState(DEFAULTS.min);
  const [max, setMax] = useState(DEFAULTS.max);
  
  const [results, setResults] = useState<RangeResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateRange(
      parseFloat(min) || 0, 
      parseFloat(max) || 0
    ));
  };

  const handleReset = () => {
    setMin(DEFAULTS.min); setMax(DEFAULTS.max);
    setResults(calculateRange(60000, 90000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Salary Band Range</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && results) {
      // Custom mapping to show the actual dollar ranges instead of just the quarter step value
      const labels = [
        { name: "First Quartile (Q1)", range: `$${results.min.toLocaleString()} - $${results.q1Target.toLocaleString()}`, color: "hsl(var(--amber-500))" },
        { name: "Second Quartile (Q2)", range: `$${results.q1Target.toLocaleString()} - $${results.q2Target.toLocaleString()}`, color: "hsl(var(--emerald-500))" },
        { name: "Third Quartile (Q3)", range: `$${results.q2Target.toLocaleString()} - $${results.q3Target.toLocaleString()}`, color: "hsl(var(--blue-500))" },
        { name: "Fourth Quartile (Q4)", range: `$${results.q3Target.toLocaleString()} - $${results.max.toLocaleString()}`, color: "hsl(var(--purple-500))" },
      ];
      
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">Band Quartiles</p>
          {labels.map((item, index) => (
            <div key={index} className="flex justify-between gap-4 mb-1">
              <span style={{ color: item.color }}>{item.name}:</span>
              <span>{item.range}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Salary Band Range" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Salary Band Range & Quartile Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Band Limits</h2>
            </div>
            
            <CompactInput id="min" label="Band Minimum Salary" value={min} onChange={setMin} prefix="$" tooltip="The absolute lowest pay authorized for this job level." />
            <CompactInput id="max" label="Band Maximum Salary" value={max} onChange={setMax} prefix="$" tooltip="The absolute highest pay authorized for this job level." />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Reverse-engineers the target midpoint and breaks the salary band into standard HR quartiles for compensation planning.
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
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-primary/10 border-primary/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Target Market Midpoint
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-primary`}>
                    ${results.midpoint.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Band Spread: <span className="font-bold text-foreground">{results.spread.toFixed(1)}% from Min to Max</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Salary Quartile</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Range Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Quartile Distribution</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <XAxis type="number" hide domain={[0, results.rangeDiff]} />
                          <YAxis dataKey="name" type="category" hide />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                          <Bar dataKey="Q1" stackId="a" fill="hsl(var(--amber-500))" radius={[4, 0, 0, 4]} />
                          <Bar dataKey="Q2" stackId="a" fill="hsl(var(--emerald-500))" />
                          <Bar dataKey="Q3" stackId="a" fill="hsl(var(--blue-500))" />
                          <Bar dataKey="Q4" stackId="a" fill="hsl(var(--purple-500))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <div className="flex w-full justify-between text-xs text-muted-foreground px-2 font-bold mt-2">
                      <span>${(results.min/1000).toFixed(0)}k</span>
                      <span>Midpoint</span>
                      <span>${(results.max/1000).toFixed(0)}k</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Hover over the segments to view the exact dollar range for each quartile.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Do HR Teams Use Salary Quartiles?</h2>
            <p>Once a company defines the Minimum and Maximum pay for a specific job title, they divide that salary band into four equal zones, known as <strong>Quartiles</strong>. This framework helps managers make objective, data-driven decisions when hiring new employees or issuing annual merit raises.</p>
            
            <h3>The Four Salary Quartiles Explained</h3>
            <ul>
              <li><strong>First Quartile (Q1) - Developing:</strong> The bottom 25% of the pay band. Employees placed here are usually entry-level, recent graduates, or individuals transitioning from a different career path who meet the minimum qualifications but need significant training.</li>
              <li><strong>Second Quartile (Q2) - Proficient:</strong> From the 25th percentile to the Midpoint. Employees here are fully trained, perform their job well, and require minimal supervision. Most employees in a company sit in Q2.</li>
              <li><strong>Third Quartile (Q3) - Advanced:</strong> From the Midpoint to the 75th percentile. Employees here are highly experienced, consistently exceed expectations, and often mentor junior staff. They possess deep institutional knowledge.</li>
              <li><strong>Fourth Quartile (Q4) - Expert:</strong> The top 25% of the band. Reserved for "unicorns." These are subject matter experts possessing extremely rare skills who consistently deliver industry-leading results. Hiring into Q4 is very rare.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">What is Band Spread?</h2>
            <p>The <strong>Band Spread</strong> is the percentage difference between the Minimum and the Maximum of the salary band. To calculate it, subtract the Minimum from the Maximum, and divide by the Minimum.</p>
            <p>For example, a band from $60,000 to $90,000 has a spread of exactly 50%. A 50% spread is the standard benchmark for mid-level corporate professional roles, as it provides enough "runway" for an employee to receive raises over 5 to 7 years before maxing out the band and requiring a promotion.</p>
          </section>
          <FAQSection faqs={[
            { question: "How does a manager decide where to place a new hire?", answer: "Usually, new hires are placed in Q1 or Q2. Placing a new hire in Q3 or Q4 is heavily discouraged by HR because it leaves the employee with almost no room for future raises (they will 'cap out' quickly) and often causes pay equity issues with existing tenured staff." },
            { question: "What happens if an employee reaches the Maximum (Q4)?", answer: "When an employee's salary hits the Maximum, they are considered 'Red-Circled'. They are usually ineligible for further base salary increases until they are promoted to a higher job classification with a higher salary band." },
            { question: "Why is the Midpoint so important?", answer: "The Midpoint is the anchor of the entire compensation strategy. HR designs the Midpoint to exactly match the external market rate for the job. If the market rate for an Accountant is $75,000, HR sets the Midpoint to $75,000, and builds the Min and Max around it." },
          ]} pageUrl="https://racira.com/calculator/salary-band-range-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Salary Band Range Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Salary Band Range Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Salary Band Range Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Salary Band Range Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Salary Band Range Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/salary-band-range-calculator" />
        </div>
      </div>
    </>
  );
}
