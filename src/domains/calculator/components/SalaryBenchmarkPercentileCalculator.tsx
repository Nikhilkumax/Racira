"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, LineChart, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface BenchmarkResults {
  p25: number;
  p50: number;
  p75: number;
  salary: number;
  estimatedPercentile: number;
  status: string;
  statusColor: string;
  chartData: { name: string; value: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateBenchmark = (p25: number, p50: number, p75: number, salary: number): BenchmarkResults => {
  let estPct = 0;
  
  if (salary <= p25) {
    // Extrapolate below 25th, floor at 1st percentile
    const range = p50 - p25;
    const diff = p25 - salary;
    estPct = Math.max(1, 25 - (diff / range) * 25);
  } else if (salary <= p50) {
    // Interpolate between 25th and 50th
    const range = p50 - p25;
    const diff = salary - p25;
    estPct = 25 + (diff / range) * 25;
  } else if (salary <= p75) {
    // Interpolate between 50th and 75th
    const range = p75 - p50;
    const diff = salary - p50;
    estPct = 50 + (diff / range) * 25;
  } else {
    // Extrapolate above 75th, cap at 99th percentile
    const range = p75 - p50;
    const diff = salary - p75;
    estPct = Math.min(99, 75 + (diff / range) * 25);
  }

  let status = "";
  let statusColor = "";
  if (estPct >= 75) {
    status = "Highly Compensated (Top Quartile)";
    statusColor = "text-emerald-500";
  } else if (estPct >= 50) {
    status = "Above Market Median";
    statusColor = "text-blue-500";
  } else if (estPct >= 25) {
    status = "Below Market Median";
    statusColor = "text-amber-500";
  } else {
    status = "Below Market (Bottom Quartile)";
    statusColor = "text-red-500";
  }

  const chartData = [
    { name: "Your Salary", value: salary }
  ];

  const summaryStats = [
    { label: "Estimated Percentile", value: `${estPct.toFixed(1)}th` },
    { label: "Market Median (P50)", value: `$${p50.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Difference vs Median", value: `${salary >= p50 ? '+' : '-'}$${Math.abs(salary - p50).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Market Competitiveness", value: status.split(' ')[0] },
  ];

  const breakdown = [
    { label: "Market 25th Percentile (P25)", amount: `$${p25.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Market 50th Percentile (Median)", amount: `$${p50.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Market 75th Percentile (P75)", amount: `$${p75.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Your Current Salary", amount: `$${salary.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-foreground font-bold" },
    { label: "Estimated Market Percentile", amount: `${estPct.toFixed(1)}th Percentile`, isTotal: true, colorClass: "text-primary font-bold" },
  ];

  return { p25, p50, p75, salary, estimatedPercentile: estPct, status, statusColor, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  p25: "75000",
  p50: "95000",
  p75: "115000",
  salary: "102000",
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

export default function SalaryBenchmarkPercentileCalculator() {
  const [p25, setP25] = useState(DEFAULTS.p25);
  const [p50, setP50] = useState(DEFAULTS.p50);
  const [p75, setP75] = useState(DEFAULTS.p75);
  const [salary, setSalary] = useState(DEFAULTS.salary);
  
  const [results, setResults] = useState<BenchmarkResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateBenchmark(
      parseFloat(p25) || 0, 
      parseFloat(p50) || 0,
      parseFloat(p75) || 0,
      parseFloat(salary) || 0
    ));
  };

  const handleReset = () => {
    setP25(DEFAULTS.p25); setP50(DEFAULTS.p50); setP75(DEFAULTS.p75); setSalary(DEFAULTS.salary);
    setResults(calculateBenchmark(75000, 95000, 115000, 102000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Salary Benchmark</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Salary Benchmark Percentile" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Salary Benchmark Percentile Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <LineChart className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Market Data Inputs</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="p25" label="25th Percentile (P25)" value={p25} onChange={setP25} prefix="$" tooltip="The lower boundary of market pay. 25% of workers make this or less." />
              <CompactInput id="p50" label="50th Percentile (Median / P50)" value={p50} onChange={setP50} prefix="$" tooltip="The exact middle of the market. Most companies target this rate." />
              <CompactInput id="p75" label="75th Percentile (P75)" value={p75} onChange={setP75} prefix="$" tooltip="The upper boundary of market pay. Only 25% of workers make this or more." />
            </div>

            <div className="border-t border-border my-2"></div>
            
            <CompactInput id="sal" label="Your Current Salary" value={salary} onChange={setSalary} prefix="$" tooltip="Your actual pay to benchmark against the market data." />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Uses linear interpolation between standard market quartiles to estimate your exact percentile rank.
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
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-secondary/20 border-border`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Estimated Market Percentile
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.statusColor}`}>
                    {results.estimatedPercentile.toFixed(1)}th
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Market Standing: <span className={`font-bold ${results.statusColor}`}>{results.status}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Benchmark Tier</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Salary</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Salary Placement vs Market</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" domain={[Math.min(results.p25 * 0.9, results.salary * 0.9), Math.max(results.p75 * 1.1, results.salary * 1.1)]} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          
                          <ReferenceLine x={results.p25} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'top', value: 'P25', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <ReferenceLine x={results.p50} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Median', fill: 'hsl(var(--primary))', fontSize: 10 }} />
                          <ReferenceLine x={results.p75} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'top', value: 'P75', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          
                          <Bar dataKey="value" fill="hsl(var(--emerald-500))" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      The green bar represents your salary relative to standard market quartile markers.
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
            <h2 className="text-2xl font-bold mb-3">What is a Salary Percentile?</h2>
            <p>In compensation benchmarking, a <strong>Salary Percentile</strong> tells you exactly where your pay ranks compared to everyone else holding the same job title in your geographical area.</p>
            <p>If you are at the <strong>70th percentile</strong>, it means you earn more than 70% of the people in your role, and 30% of the people earn more than you.</p>
            
            <h3>Understanding the Three Key Markers</h3>
            <p>When you research salaries on sites like Glassdoor, Payscale, or levels.fyi, they usually present the data using three markers:</p>
            <ul>
              <li><strong>25th Percentile (P25):</strong> The bottom quartile. Typically represents entry-level workers, those in smaller companies, or those in lower-cost geographic regions.</li>
              <li><strong>50th Percentile (Median / P50):</strong> The exact middle. Half the market makes less, half makes more. Most Fortune 500 companies formally set their compensation targets to "match the 50th percentile."</li>
              <li><strong>75th Percentile (P75):</strong> The top quartile. Represents highly experienced workers, top performers, or those working in high-margin industries (like Big Tech or High Finance).</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why We Use the Median (Not the Average)</h2>
            <p>In salary data, the <strong>Average (Mean)</strong> is useless. A few highly compensated CEOs or super-earners will drastically skew the average upward, making everyone else look underpaid.</p>
            <p>The <strong>Median (P50)</strong> is immune to outliers. It simply finds the exact middle person in a lineup. This is why professional HR compensation surveys always use median percentiles rather than average salaries.</p>
            
            <h2 className="text-2xl font-bold mb-3">How to Use This Data in Negotiations</h2>
            <p>If you are asking for a raise, knowing your percentile is your strongest weapon:</p>
            <p><em>"According to [Market Data Source], the 50th percentile for a Senior Financial Analyst in Chicago is $95,000. My current salary is $82,000, which puts me roughly in the 10th percentile. Given that my performance reviews have consistently 'Exceeded Expectations', I am requesting a market adjustment to bring my pay in line with the 50th percentile."</em></p>
          </section>
          <FAQSection faqs={[
            { question: "Is it bad to be at the 25th percentile?", answer: "Not necessarily. If you just graduated college or recently changed careers into a completely new field, you should expect to be in the bottom quartile. However, if you have 5+ years of experience in the role and are still at P25, you are severely underpaid." },
            { question: "Do companies ever target the 75th percentile?", answer: "Yes, but it is rare. Companies known as 'market leaders' (like FAANG tech companies or elite investment banks) intentionally target the 75th or even 90th percentile to attract the absolute best talent in the world. They view the high payroll as a strategic investment." },
            { question: "How accurate is linear interpolation for salaries?", answer: "It is a highly accurate estimate within the P25 to P75 range. The distribution of salaries naturally follows a bell curve, so the middle 50% scales linearly. However, once you pass the 90th percentile, salaries scale exponentially rather than linearly." },
          ]} pageUrl="https://racira.com/calculator/salary-benchmark-percentile-calculator" />
          <PopularCalculators exclude="/calculator/salary-benchmark-percentile-calculator" />
        </div>
      </div>
    </>
  );
}
