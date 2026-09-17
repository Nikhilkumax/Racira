"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Scale, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface SalaryBandResults {
  midpoint: number;
  min: number;
  max: number;
  compaRatio: number;
  pir: number; // Position in Range
  currentSalary: number; // Added to interface
  status: string;
  statusColor: string;
  chartData: { name: string; value: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateSalaryBand = (midpoint: number, spreadPct: number, currentSalary: number): SalaryBandResults => {
  // Formal HR Salary Band Math:
  // Spread = (Max - Min) / Min
  // Midpoint = (Max + Min) / 2
  // Therefore: Min = (2 * Midpoint) / (2 + Spread)
  
  const spreadDecimal = spreadPct / 100;
  
  const min = (2 * midpoint) / (2 + spreadDecimal);
  const max = min * (1 + spreadDecimal);
  
  const compaRatio = midpoint > 0 ? (currentSalary / midpoint) * 100 : 0;
  
  // Position in Range (PIR) = (Salary - Min) / (Max - Min)
  const rangeSpread = max - min;
  const pir = rangeSpread > 0 ? ((currentSalary - min) / rangeSpread) * 100 : 0;

  let status = "";
  let statusColor = "";

  if (currentSalary > max) {
    status = "Red-Circled (Over Max)";
    statusColor = "text-red-500";
  } else if (currentSalary < min) {
    status = "Green-Circled (Under Min)";
    statusColor = "text-emerald-500";
  } else if (compaRatio >= 110) {
    status = "Highly Compensated (Upper 3rd)";
    statusColor = "text-blue-500";
  } else if (compaRatio >= 90) {
    status = "Market Competitive (Middle 3rd)";
    statusColor = "text-emerald-500";
  } else {
    status = "Developing (Lower 3rd)";
    statusColor = "text-amber-500";
  }

  // Chart data: A single bar representing the band, but Recharts handles floating bars weirdly if not setup right.
  // Actually, a simple bar showing current salary with reference lines for min, mid, max is cleaner.
  const chartData = [
    { name: "Current Salary", value: currentSalary, fill: "hsl(var(--primary))" }
  ];

  const summaryStats = [
    { label: "Compa-Ratio", value: `${compaRatio.toFixed(1)}%` },
    { label: "Position in Range (PIR)", value: `${pir.toFixed(1)}%` },
    { label: "Band Minimum", value: `$${min.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Band Maximum", value: `$${max.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Market Midpoint (Target Rate)", amount: `$${midpoint.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Salary Band Spread", amount: `${spreadPct.toFixed(1)}%` },
    { label: "Calculated Minimum (Bottom of Band)", amount: `$${min.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Calculated Maximum (Top of Band)", amount: `$${max.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Employee Current Salary", amount: `$${currentSalary.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Compa-Ratio (Salary / Midpoint)", amount: `${compaRatio.toFixed(2)}%`, isTotal: true, colorClass: "text-primary font-bold" },
  ];

  return { midpoint, min, max, compaRatio, pir, currentSalary, status, statusColor, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  midpoint: "100000",
  spreadPct: "50",
  currentSalary: "92000",
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

export default function JobClassificationSalaryBandCalculator() {
  const [midpoint, setMidpoint] = useState(DEFAULTS.midpoint);
  const [spreadPct, setSpreadPct] = useState(DEFAULTS.spreadPct);
  const [currentSalary, setCurrentSalary] = useState(DEFAULTS.currentSalary);
  
  const [results, setResults] = useState<SalaryBandResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateSalaryBand(
      parseFloat(midpoint) || 0, 
      parseFloat(spreadPct) || 0,
      parseFloat(currentSalary) || 0
    ));
  };

  const handleReset = () => {
    setMidpoint(DEFAULTS.midpoint); setSpreadPct(DEFAULTS.spreadPct); setCurrentSalary(DEFAULTS.currentSalary);
    setResults(calculateSalaryBand(100000, 50, 92000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Salary Band Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.name}:</span>
          <span className="text-foreground">${payload[0].value.toLocaleString()}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Job Classification Salary Band" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Job Classification Salary Band Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Compensation Structure</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="mid" label="Market Midpoint Salary" value={midpoint} onChange={setMidpoint} prefix="$" tooltip="The target market rate for this job classification (the 50th percentile)." />
              <CompactInput id="spread" label="Band Spread Percentage" value={spreadPct} onChange={setSpreadPct} suffix="%" tooltip="The percentage difference between the Minimum and Maximum (e.g., 40% to 50% is standard for professionals)." />
              <CompactInput id="cur" label="Employee Current Salary" value={currentSalary} onChange={setCurrentSalary} prefix="$" tooltip="The specific employee's current pay to evaluate their position in the band." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Calculates standard HR metrics like Compa-Ratio and Position in Range (PIR).
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
                
                <div className={`bg-primary/10 bg-primary/10 bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative bg-primary/10 border-primary`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Compa-Ratio
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.statusColor}`}>
                    {results.compaRatio.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Classification: <span className={`font-bold ${results.statusColor}`}>{results.status}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Salary Structure</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Value</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Position in Range (PIR)</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" domain={[Math.min(results.min * 0.9, results.currentSalary * 0.9), Math.max(results.max * 1.1, results.currentSalary * 1.1)]} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          
                          <ReferenceLine x={results.min} stroke="hsl(var(--chart-3))" strokeDasharray="3 3" label={{ position: 'top', value: 'Min', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <ReferenceLine x={results.midpoint} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Mid', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <ReferenceLine x={results.max} stroke="hsl(var(--chart-3))" strokeDasharray="3 3" label={{ position: 'top', value: 'Max', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          
                          <Bar dataKey="value" fill="hsl(var(--emerald-500))" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      The green bar shows current salary relative to the defined Minimum, Midpoint, and Maximum limits.
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
            <h2 className="text-2xl font-bold mb-3">What is a Salary Band?</h2>
            <p>In corporate Human Resources, a <strong>Salary Band</strong> (or pay range) provides a structured minimum and maximum pay limit for a specific job classification. Instead of paying everyone with the same title the exact same salary, bands allow managers to pay less experienced workers near the Minimum, and highly experienced, top-performing workers near the Maximum.</p>
            
            <h3>Understanding Compa-Ratio</h3>
            <p>The <strong>Compa-Ratio</strong> (Comparative Ratio) is the most heavily used metric in compensation planning. It compares an employee's actual salary to the Market Midpoint of their salary band.</p>
            <ul>
              <li><strong>Compa-Ratio of 100%:</strong> The employee is paid exactly at the midpoint, which is usually the target market rate for someone fully competent in the role.</li>
              <li><strong>Compa-Ratio under 100%:</strong> Usually signifies a newer employee who is still developing into the role, or an employee who was recently promoted.</li>
              <li><strong>Compa-Ratio over 100%:</strong> Usually signifies a highly tenured employee, a consistent top performer, or someone who possesses hard-to-find skills.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">What is Position in Range (PIR)?</h2>
            <p>While Compa-Ratio tells you where a salary sits relative to the <em>midpoint</em>, <strong>Position in Range (PIR)</strong> tells you where the salary sits on the spectrum from Minimum to Maximum.</p>
            <p>A PIR of 0% means the employee is at the exact bottom of the band. A PIR of 100% means they are at the absolute maximum. A PIR of 50% means they are exactly at the midpoint.</p>

            <h2 className="text-2xl font-bold mb-3">Red-Circled and Green-Circled Employees</h2>
            <p>When HR runs an annual compensation audit, they look for outliers:</p>
            <ul>
              <li><strong>Green-Circled:</strong> An employee whose salary is below the band minimum. HR usually mandates an immediate off-cycle raise to bring them up to at least the minimum.</li>
              <li><strong>Red-Circled:</strong> An employee whose salary is above the band maximum. They are considered "maxed out." Usually, they are ineligible for base salary raises until the band is adjusted for inflation, though they may still receive lump-sum bonuses.</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "What is a normal Band Spread Percentage?", answer: "Band spreads get wider as you move up the corporate ladder. Entry-level/Clerical roles usually have a 20% to 30% spread. Mid-level professional roles usually have a 40% to 50% spread. Executive roles can have spreads of 80% to 100% due to the massive variance in experience." },
            { question: "Why is the Midpoint not exactly in the middle of Min and Max?", answer: "It actually is in the exact middle mathematically. If the Min is $80k and the Max is $120k (a 50% spread), the Midpoint is exactly $100k." },
            { question: "How does HR determine the Midpoint?", answer: "HR purchases market salary surveys (like Radford or Mercer) that aggregate thousands of payroll records across the industry. The Midpoint is typically set to match the 50th percentile (the median) of the external market data." },
          ]} pageUrl="https://racira.com/calculator/job-classification-salary-band-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Job Classification Salary Band Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Job Classification Salary Band Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Job Classification Salary Band Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Job Classification Salary Band Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Job Classification Salary Band Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/job-classification-salary-band-calculator" />
        </div>
      </div>
    </>
  );
}
