"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Activity, Printer, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface ResourceResults {
  capacity: number;
  billable: number;
  admin: number;
  totalAssigned: number;
  loadingPct: number; // Just project/billable loading
  utilizationPct: number; // Total loading including admin
  status: string;
  statusColor: string;
  chartData: { name: string; Billable: number; Admin: number; "Free Capacity": number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateLoading = (capacity: number, billable: number, admin: number): ResourceResults => {
  const totalAssigned = billable + admin;
  
  const loadingPct = capacity > 0 ? (billable / capacity) * 100 : 0;
  const utilizationPct = capacity > 0 ? (totalAssigned / capacity) * 100 : 0;
  
  const freeCapacity = Math.max(0, capacity - totalAssigned);
  const overAllocated = Math.max(0, totalAssigned - capacity);

  let status = "";
  let statusColor = "";
  
  if (utilizationPct > 100) {
    status = "Over-Allocated (Burnout Risk)";
    statusColor = "text-red-500";
  } else if (utilizationPct >= 80) {
    status = "Optimal Allocation";
    statusColor = "text-emerald-500";
  } else if (utilizationPct >= 50) {
    status = "Under-Utilized";
    statusColor = "text-amber-500";
  } else {
    status = "Severely Under-Utilized";
    statusColor = "text-muted-foreground";
  }

  const chartData = [
    { 
      name: "Resource Allocation", 
      Billable: billable, 
      Admin: admin, 
      "Free Capacity": freeCapacity,
      OverAllocated: overAllocated
    }
  ];

  const summaryStats = [
    { label: "Resource Loading", value: `${loadingPct.toFixed(1)}%` },
    { label: "Total Utilization", value: `${utilizationPct.toFixed(1)}%` },
    { label: "Free Capacity", value: `${freeCapacity.toFixed(1)} hrs` },
    { label: "Status", value: status.split(' ')[0] },
  ];

  const breakdown = [
    { label: "Total Available Capacity", amount: `${capacity.toFixed(1)} hrs` },
    { label: "Assigned Project / Billable Work", amount: `${billable.toFixed(1)} hrs`, colorClass: "text-primary font-bold" },
    { label: "Assigned Admin / Overhead Work", amount: `${admin.toFixed(1)} hrs`, colorClass: "text-amber-600" },
    { label: "Unassigned Free Capacity", amount: `${freeCapacity.toFixed(1)} hrs`, colorClass: "text-muted-foreground" },
    overAllocated > 0 ? { label: "Over-Allocation (Deficit)", amount: `-${overAllocated.toFixed(1)} hrs`, colorClass: "text-red-500 font-bold" } : { label: "Over-Allocation", amount: "0 hrs" },
    { label: "Total Utilization %", amount: `${utilizationPct.toFixed(1)}%`, isTotal: true, colorClass: utilizationPct > 100 ? "text-red-500 font-bold" : "text-emerald-500 font-bold" },
  ];

  return { capacity, billable, admin, totalAssigned, loadingPct, utilizationPct, status, statusColor, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  capacity: "40",
  billable: "28",
  admin: "5",
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

export default function ResourceLoadingPercentageCalculator() {
  const [capacity, setCapacity] = useState(DEFAULTS.capacity);
  const [billable, setBillable] = useState(DEFAULTS.billable);
  const [admin, setAdmin] = useState(DEFAULTS.admin);
  
  const [results, setResults] = useState<ResourceResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateLoading(
      parseFloat(capacity) || 0, 
      parseFloat(billable) || 0,
      parseFloat(admin) || 0
    ));
  };

  const handleReset = () => {
    setCapacity(DEFAULTS.capacity); setBillable(DEFAULTS.billable); setAdmin(DEFAULTS.admin);
    setResults(calculateLoading(40, 28, 5));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Resource Loading</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">Time Distribution</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === 0) return null;
            return (
              <div key={index} className="flex justify-between gap-4 mb-1">
                <span style={{ color: entry.fill }}>{entry.name}:</span>
                <span>{entry.value} hrs</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Resource Loading Percentage" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Resource Loading & Utilization Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Time Allocation</h2>
            </div>
            
            <CompactInput id="cap" label="Total Available Capacity" value={capacity} onChange={setCapacity} suffix="hrs" tooltip="The total standard hours available for this resource in the given timeframe (e.g., 40 hrs for a standard week)." />
            
            <div className="border-t border-border my-1"></div>

            <CompactInput id="bil" label="Assigned Project Work (Billable)" value={billable} onChange={setBillable} suffix="hrs" tooltip="Hours assigned to actual client deliverables or core project tasks." />
            <CompactInput id="adm" label="Assigned Admin / Overhead" value={admin} onChange={setAdmin} suffix="hrs" tooltip="Hours assigned to internal meetings, emails, training, or non-billable work." />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Analyzes resource bandwidth to prevent burnout while maximizing billable utilization.
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.utilizationPct > 100 ? 'bg-red-500/10 border-red-500/30' : results.utilizationPct >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Resource Loading (Project Work)
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.statusColor}`}>
                    {results.loadingPct.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Total Utilization: <span className={`font-bold ${results.statusColor}`}>{results.utilizationPct.toFixed(1)}% ({results.status})</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Allocation Metrics</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Hours</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Capacity Distribution</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <XAxis type="number" hide domain={[0, Math.max(results.capacity, results.totalAssigned)]} />
                          <YAxis dataKey="name" type="category" hide />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                          
                          <Bar dataKey="Billable" stackId="a" fill="hsl(var(--primary))" radius={results.admin === 0 && results.capacity <= results.totalAssigned ? [4, 4, 4, 4] : [4, 0, 0, 4]} />
                          <Bar dataKey="Admin" stackId="a" fill="hsl(var(--amber-500))" />
                          <Bar dataKey="Free Capacity" stackId="a" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="OverAllocated" stackId="a" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                          
                          <ReferenceLine x={results.capacity} stroke="hsl(var(--foreground))" strokeDasharray="3 3" label={{ position: 'top', value: '100% Capacity', fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Ideally, Billable + Admin should equal 100% Capacity without exceeding it.
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
            <h2 className="text-2xl font-bold mb-3">What is Resource Loading?</h2>
            <p>In Project Management, <strong>Resource Loading</strong> refers to the amount of project-specific work assigned to an individual (or team) relative to their total available time. It helps project managers determine if an employee has enough bandwidth to take on a new task without causing project delays or personal burnout.</p>
            
            <h3>Loading vs. Utilization</h3>
            <p>While often used interchangeably, there is a technical difference in professional services (like consulting or agencies):</p>
            <ul>
              <li><strong>Resource Loading:</strong> Usually measures strictly the "billable" or direct project work. <em>(e.g., "Jane is 70% loaded with client work.")</em></li>
              <li><strong>Total Utilization:</strong> Measures all assigned work, including internal meetings, training, and administrative overhead. <em>(e.g., "Jane is 70% loaded, but with her 30% admin time, her utilization is 100%.")</em></li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The "100% Loading" Myth</h2>
            <p>A massive mistake made by amateur project managers is trying to load a resource to exactly 100% with project work (e.g., assigning 40 hours of project tasks in a 40-hour work week). This is mathematically guaranteed to fail.</p>
            <p>Why? Because humans are not robots. Employees must attend company all-hands meetings, answer internal emails, go to the bathroom, and occasionally deal with IT issues. Industry best practice dictates that <strong>maximum safe resource loading is 80%</strong>. The remaining 20% (about 8 hours a week) must be reserved as a buffer for overhead and administrative tasks.</p>
            
            <h2 className="text-2xl font-bold mb-3">Handling Over-Allocation</h2>
            <p>If Total Utilization exceeds 100%, the resource is <strong>Over-Allocated</strong>. When this happens, a project manager has three options:</p>
            <ul>
              <li><strong>Resource Leveling:</strong> Push the project deadline back so the work can be spread across more weeks.</li>
              <li><strong>Resource Smoothing:</strong> Assign some of the work to a different team member who has free capacity.</li>
              <li><strong>Authorize Overtime:</strong> Temporarily increase the resource's capacity to 50 or 60 hours, assuming the budget allows for overtime pay (and the employee agrees).</li>
            </ul>
          </article>
          <FAQSection faqs={[
            { question: "What is an ideal billable utilization rate for a consultant?", answer: "In most professional services firms, the target billable utilization rate for a junior-to-mid level consultant is between 75% and 85%. Partners and executives usually have much lower targets (30% to 50%) because they spend most of their time selling new business." },
            { question: "How do you calculate capacity for a team?", answer: "Simply aggregate the individuals. If you have 5 full-time developers, your team capacity is 200 hours per week. If you have 150 hours of assigned development work, the team loading is 75%." },
            { question: "Does PTO count against capacity?", answer: "Yes. If an employee takes one day of Paid Time Off during a standard 5-day week, their available capacity for that week drops from 40 hours to 32 hours. Project managers must adjust loading accordingly." },
          ]} pageUrl="https://racira.com/calculator/resource-loading-percentage-calculator" />
          <PopularCalculators exclude="/calculator/resource-loading-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
