"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Building2, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface GradeResults {
  g1Midpoint: number;
  g2Midpoint: number;
  g1Spread: number;
  g2Spread: number;
  midpointDiff: number;
  overlapAmount: number;
  hasOverlap: boolean;
  overlapPct: number; // as a % of Grade 1's total range
  chartData: { name: string; range: [number, number]; fill: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateGradeSpread = (g1Min: number, g1Max: number, g2Min: number, g2Max: number): GradeResults => {
  // Ensure max >= min
  const actualG1Max = Math.max(g1Min, g1Max);
  const actualG2Max = Math.max(g2Min, g2Max);
  
  const g1Midpoint = (g1Min + actualG1Max) / 2;
  const g2Midpoint = (g2Min + actualG2Max) / 2;
  
  const g1Spread = g1Min > 0 ? ((actualG1Max - g1Min) / g1Min) * 100 : 0;
  const g2Spread = g2Min > 0 ? ((actualG2Max - g2Min) / g2Min) * 100 : 0;
  
  // Midpoint Differential (Progression)
  const midpointDiff = g1Midpoint > 0 ? ((g2Midpoint - g1Midpoint) / g1Midpoint) * 100 : 0;
  
  // Overlap Calculation
  // Overlap occurs if G1_Max > G2_Min
  const overlapAmount = Math.max(0, Math.min(actualG1Max, actualG2Max) - Math.max(g1Min, g2Min));
  const hasOverlap = overlapAmount > 0;
  const g1Range = actualG1Max - g1Min;
  const overlapPct = g1Range > 0 ? (overlapAmount / g1Range) * 100 : 0;

  const chartData = [
    { name: "Grade 1 (Lower)", range: [g1Min, actualG1Max] as [number, number], fill: "hsl(var(--primary))" },
    { name: "Grade 2 (Higher)", range: [g2Min, actualG2Max] as [number, number], fill: "hsl(var(--chart-3))" },
  ];

  const summaryStats = [
    { label: "Midpoint Differential", value: `${midpointDiff.toFixed(1)}%` },
    { label: "Grade 1 Spread", value: `${g1Spread.toFixed(1)}%` },
    { label: "Grade 2 Spread", value: `${g2Spread.toFixed(1)}%` },
    { label: "Band Overlap", value: hasOverlap ? "Yes" : "None" },
  ];

  const breakdown = [
    { label: "Grade 1 Midpoint", amount: `$${g1Midpoint.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Grade 2 Midpoint", amount: `$${g2Midpoint.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Midpoint Progression (Promotion Value)", amount: `+${midpointDiff.toFixed(2)}%`, colorClass: "text-emerald-500 font-bold" },
    { label: "Overlap Amount (Dollars)", amount: hasOverlap ? `$${overlapAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "$0" },
    { label: "Overlap % (Portion of Grade 1 Range)", amount: `${overlapPct.toFixed(2)}%`, isTotal: true, colorClass: hasOverlap ? "text-amber-500 font-bold" : "text-muted-foreground font-bold" },
  ];

  return { g1Midpoint, g2Midpoint, g1Spread, g2Spread, midpointDiff, overlapAmount, hasOverlap, overlapPct, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  g1Min: "60000",
  g1Max: "90000",
  g2Min: "75000",
  g2Max: "112500",
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

export default function SalaryGradeSpreadCalculator() {
  const [g1Min, setG1Min] = useState(DEFAULTS.g1Min);
  const [g1Max, setG1Max] = useState(DEFAULTS.g1Max);
  const [g2Min, setG2Min] = useState(DEFAULTS.g2Min);
  const [g2Max, setG2Max] = useState(DEFAULTS.g2Max);
  
  const [results, setResults] = useState<GradeResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateGradeSpread(
      parseFloat(g1Min) || 0, 
      parseFloat(g1Max) || 0,
      parseFloat(g2Min) || 0,
      parseFloat(g2Max) || 0
    ));
  };

  const handleReset = () => {
    setG1Min(DEFAULTS.g1Min); setG1Max(DEFAULTS.g1Max); setG2Min(DEFAULTS.g2Min); setG2Max(DEFAULTS.g2Max);
    setResults(calculateGradeSpread(60000, 90000, 75000, 112500));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Salary Grade Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">{data.name}</p>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">Range:</span>
            <span>${data.range[0].toLocaleString()} - ${data.range[1].toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Salary Grade Spread" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Salary Grade Progression Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Corporate Grade Structure</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="g1min" label="Grade 1 Minimum" value={g1Min} onChange={setG1Min} prefix="$" tooltip="Minimum pay for the lower job grade (e.g., Analyst I)." />
              <CompactInput id="g1max" label="Grade 1 Maximum" value={g1Max} onChange={setG1Max} prefix="$" tooltip="Maximum pay for the lower job grade." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="g2min" label="Grade 2 Minimum" value={g2Min} onChange={setG2Min} prefix="$" tooltip="Minimum pay for the next job grade up (e.g., Analyst II)." />
              <CompactInput id="g2max" label="Grade 2 Maximum" value={g2Max} onChange={setG2Max} prefix="$" tooltip="Maximum pay for the higher job grade." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Evaluates the structural overlap between two consecutive job grades and calculates the "Midpoint Differential" (the financial value of a promotion).
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-emerald-500/10 border-emerald-500/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-emerald-600 transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Midpoint Differential (Promotion Value)
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    {results.midpointDiff.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Standard HR Target: <span className="font-bold text-foreground">15% to 20%</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Structure Metric</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Grade Range Overlap</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" domain={[0, 'dataMax + 10000']} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          
                          <Bar dataKey="range" radius={4} barSize={30}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Overlap allows experienced junior employees to earn more than inexperienced senior employees.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is a Salary Grade Structure?</h2>
            <p>Instead of creating a unique salary band for every single job title, modern HR departments use a <strong>Grade Structure</strong>. Jobs of similar value and complexity are grouped into the same "Grade" (e.g., Grade 5, Grade 6). For instance, an Accountant II, an HR Generalist, and a Marketing Coordinator might all be classified as Grade 6.</p>
            
            <h3>The Midpoint Differential (Progression)</h3>
            <p>When an employee is promoted from Grade 1 to Grade 2, HR needs to ensure the promotion carries a meaningful financial incentive. The <strong>Midpoint Differential</strong> calculates the percentage increase between the target midpoint of Grade 1 and the target midpoint of Grade 2.</p>
            <ul>
              <li><strong>Clerical/Administrative Roles:</strong> Usually have a midpoint differential of 10% to 15% between grades.</li>
              <li><strong>Professional/Managerial Roles:</strong> Usually have a midpoint differential of 15% to 20%.</li>
              <li><strong>Executive Roles:</strong> Often see differentials of 25% or more, reflecting massive shifts in responsibility.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why Do Salary Grades Overlap?</h2>
            <p>A well-designed compensation structure will always have overlap between consecutive grades. This means the Maximum of Grade 1 is actually higher than the Minimum of Grade 2.</p>
            <p><strong>Why is this important?</strong> It acknowledges experience. Imagine a "Senior Customer Support Agent" (Grade 1) who has been with the company for 8 years and is an absolute expert at their job. They should absolutely be paid more than a brand new, unproven "Support Manager" (Grade 2) who was hired yesterday.</p>

            <h2 className="text-2xl font-bold mb-3">How to Spot a Broken Pay Structure</h2>
            <p>If there is <strong>no overlap</strong> between grades (Grade 1 ends at $60k, and Grade 2 starts at $61k), it creates severe pay compression. New hires will come in making exactly the same as tenured employees who just got promoted. Conversely, if there is <strong>too much overlap</strong> (e.g., 70%), the grades are practically identical, rendering the promotion financially meaningless.</p>
          </article>
          <FAQSection faqs={[
            { question: "What is a normal Band Spread for a Grade?", answer: "Band Spreads (the difference between Min and Max within the same grade) are typically 30% for administrative roles, 40% to 50% for professional roles, and 60%+ for directors and executives." },
            { question: "If I get promoted, do I get the Midpoint Differential?", answer: "Not automatically. The Midpoint Differential determines the structure of the bands, not your personal raise. However, a standard internal promotion raise is usually designed to roughly match the Midpoint Differential (around 10% to 15%)." },
            { question: "What is Broadbanding?", answer: "Broadbanding is an alternative HR strategy where a company uses very few grades (maybe only 4 or 5 for the whole company) but gives them massive spreads (100% to 150%). This flattens the hierarchy and allows employees to grow salary without constantly needing a formal title promotion." },
          ]} pageUrl="https://racira.com/calculator/salary-grade-spread-calculator" />
          <PopularCalculators exclude="/calculator/salary-grade-spread-calculator" />
        </div>
      </div>
    </>
  );
}
