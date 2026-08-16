"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Factory, Printer, Settings2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface LeanResults {
  totalLeadTime: number;
  valueAdd: number;
  nonValueAdd: number;
  pce: number;
  wastePct: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateLean = (
  leadTime: number, 
  defects: number, 
  overproduction: number, 
  waiting: number, 
  transport: number, 
  inventory: number, 
  motion: number, 
  extraProcessing: number
): LeanResults => {
  const nonValueAdd = defects + overproduction + waiting + transport + inventory + motion + extraProcessing;
  
  // Value Add is whatever is left over from Total Lead Time. 
  // If Non-Value Add exceeds Lead Time, cap Value Add at 0 and bump Lead Time (for calculation sanity).
  const actualLeadTime = Math.max(leadTime, nonValueAdd);
  const valueAdd = actualLeadTime - nonValueAdd;
  
  const pce = actualLeadTime > 0 ? (valueAdd / actualLeadTime) * 100 : 0;
  const wastePct = actualLeadTime > 0 ? (nonValueAdd / actualLeadTime) * 100 : 0;

  const rawChartData = [
    { name: "Value-Added Time", value: valueAdd, color: "hsl(var(--emerald-500, 150 84% 39%))" },
    { name: "Defects/Rework", value: defects, color: "hsl(var(--chart-1))" },
    { name: "Overproduction", value: overproduction, color: "hsl(var(--chart-2))" },
    { name: "Waiting/Delays", value: waiting, color: "hsl(var(--chart-3))" },
    { name: "Transporting", value: transport, color: "hsl(var(--chart-4))" },
    { name: "Inventory/Searching", value: inventory, color: "hsl(var(--chart-5))" },
    { name: "Motion", value: motion, color: "hsl(var(--destructive))" },
    { name: "Over-Processing", value: extraProcessing, color: "hsl(var(--amber-500, 45 93% 47%))" },
  ];

  const chartData = rawChartData.filter(d => d.value > 0);

  const summaryStats = [
    { label: "Process Cycle Eff. (PCE)", value: `${pce.toFixed(1)}%` },
    { label: "Total Waste %", value: `${wastePct.toFixed(1)}%` },
    { label: "Value-Added Time", value: `${valueAdd.toFixed(1)} hrs` },
    { label: "Total Lead Time", value: `${actualLeadTime.toFixed(1)} hrs` },
  ];

  const breakdown = [
    { label: "Total Process Lead Time", amount: `${actualLeadTime.toFixed(1)} hrs` },
    { label: "Total Non-Value-Added (Waste) Time", amount: `${nonValueAdd.toFixed(1)} hrs`, colorClass: "text-red-500" },
    { label: "Total Value-Added (Processing) Time", amount: `${valueAdd.toFixed(1)} hrs`, colorClass: "text-emerald-500 font-bold" },
    { label: "Process Cycle Efficiency (PCE)", amount: `${pce.toFixed(1)}%`, isTotal: true, colorClass: pce > 20 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold" },
  ];

  return { totalLeadTime: actualLeadTime, valueAdd, nonValueAdd, pce, wastePct, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  leadTime: "120",
  defects: "8",
  overproduction: "0",
  waiting: "45",
  transport: "12",
  inventory: "6",
  motion: "15",
  extraProcessing: "4",
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

export default function LeanWastePercentageCalculator() {
  const [leadTime, setLeadTime] = useState(DEFAULTS.leadTime);
  const [defects, setDefects] = useState(DEFAULTS.defects);
  const [overproduction, setOverproduction] = useState(DEFAULTS.overproduction);
  const [waiting, setWaiting] = useState(DEFAULTS.waiting);
  const [transport, setTransport] = useState(DEFAULTS.transport);
  const [inventory, setInventory] = useState(DEFAULTS.inventory);
  const [motion, setMotion] = useState(DEFAULTS.motion);
  const [extraProcessing, setExtraProcessing] = useState(DEFAULTS.extraProcessing);
  
  const [results, setResults] = useState<LeanResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateLean(
      parseFloat(leadTime) || 0, 
      parseFloat(defects) || 0, parseFloat(overproduction) || 0,
      parseFloat(waiting) || 0, parseFloat(transport) || 0,
      parseFloat(inventory) || 0, parseFloat(motion) || 0,
      parseFloat(extraProcessing) || 0
    ));
  };

  const handleReset = () => {
    setLeadTime(DEFAULTS.leadTime); setDefects(DEFAULTS.defects); setOverproduction(DEFAULTS.overproduction);
    setWaiting(DEFAULTS.waiting); setTransport(DEFAULTS.transport); setInventory(DEFAULTS.inventory);
    setMotion(DEFAULTS.motion); setExtraProcessing(DEFAULTS.extraProcessing);
    setResults(calculateLean(120, 8, 0, 45, 12, 6, 15, 4));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Lean Waste PCE</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">{payload[0].value.toLocaleString()} hrs</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Lean Waste Percentage" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Lean Waste Percentage Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Factory className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Process Times (Hours)</h2>
            </div>
            
            <CompactInput id="lead" label="Total Process Lead Time" value={leadTime} onChange={setLeadTime} suffix="hrs" tooltip="The total time from start to finish for one complete cycle or batch." />
            
            <div className="flex items-center gap-2 mb-1 mt-2">
              <Settings2 className="h-5 w-5 text-destructive" />
              <h2 className="text-2xl font-bold mb-3">TIMWOOD Waste (NVA)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="w_wait" label="Waiting" value={waiting} onChange={setWaiting} suffix="hrs" tooltip="Time spent waiting for previous steps, materials, or approvals." />
              <CompactInput id="w_mot" label="Excess Motion" value={motion} onChange={setMotion} suffix="hrs" tooltip="Unnecessary physical movement by workers (walking, reaching)." />
              <CompactInput id="w_tran" label="Transportation" value={transport} onChange={setTransport} suffix="hrs" tooltip="Moving materials or products between locations unnecessarily." />
              <CompactInput id="w_def" label="Defects / Rework" value={defects} onChange={setDefects} suffix="hrs" tooltip="Time spent fixing errors or scrapping defective units." />
              <CompactInput id="w_inv" label="Excess Inventory" value={inventory} onChange={setInventory} suffix="hrs" tooltip="Time wasted managing, searching for, or storing excess WIP inventory." />
              <CompactInput id="w_op" label="Overproduction" value={overproduction} onChange={setOverproduction} suffix="hrs" tooltip="Time spent making more than what the customer ordered." />
              <CompactInput id="w_ep" label="Over-Processing" value={extraProcessing} onChange={setExtraProcessing} suffix="hrs" tooltip="Doing more work than is required by the customer spec." />
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.pce < 10 ? 'bg-primary/10 border-primary/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Process Cycle Efficiency (PCE)
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.pce < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {results.pce.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Waste Percentage: <span className="font-bold text-red-500">{results.wastePct.toFixed(1)}%</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Lean Metrics</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Hours</th>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Time Allocation (VA vs Waste)</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={results.chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is Lean Waste & Process Cycle Efficiency?</h2>
            <p>In Lean Six Sigma and modern manufacturing, processes are broken down into two types of time: <strong>Value-Added (VA)</strong> and <strong>Non-Value-Added (NVA)</strong>. NVA time is commonly referred to as "Waste".</p>
            <p><strong>Process Cycle Efficiency (PCE)</strong> is a critical lean metric that reveals how much of your total lead time is actually spent transforming the product into something the customer is willing to pay for.</p>
            
            <h3>The 7 Wastes of Lean (TIMWOOD)</h3>
            <p>Taiichi Ohno of Toyota identified seven distinct types of waste that bloat lead times and destroy efficiency:</p>
            <ol>
              <li><strong>Transport:</strong> Moving products or materials from one place to another unnecessarily.</li>
              <li><strong>Inventory:</strong> Unfinished goods (WIP) sitting idle, taking up space, and tying up cash.</li>
              <li><strong>Motion:</strong> Workers walking, reaching, or searching for tools due to poor workstation design.</li>
              <li><strong>Waiting:</strong> Operators standing idle waiting for the previous machine to finish, or waiting for materials to arrive. This is usually the largest source of waste.</li>
              <li><strong>Overproduction:</strong> Making more parts than what is currently ordered (often to keep machines busy).</li>
              <li><strong>Over-Processing:</strong> Doing more work on a part than the customer requires (e.g., polishing a surface that will never be seen).</li>
              <li><strong>Defects:</strong> Scrap, rework, or fixing errors.</li>
            </ol>
            <p><em>(Note: An 8th waste—Non-Utilized Talent—is often added, forming the acronym TIMWOODS, but is harder to quantify in strict hours for this calculator).</em></p>
            
            <h2 className="text-2xl font-bold mb-3">Interpreting Your PCE Score</h2>
            <p>Most people are shocked when they calculate their first PCE score. In traditional, non-lean manufacturing, it is incredibly common for a part to take 14 days (336 hours) to move through a factory, even though the actual cutting, welding, and painting only took 4 hours.</p>
            <ul>
              <li><strong>Traditional Batch Manufacturing:</strong> PCE is typically between <strong>1% and 5%</strong>. (95%+ of the time, the product is just waiting in a queue).</li>
              <li><strong>World-Class Lean Operations:</strong> Target a PCE of <strong>20% or higher</strong>. (Achieving 100% is physically impossible due to necessary but non-value-added activities like curing/drying).</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "How is Value-Added time calculated?", answer: "In this calculator, Value-Added time is derived by subtracting the sum of all your quantified wastes from your Total Lead Time. If your lead time is 100 hours and you identified 90 hours of waste, your VA time is 10 hours." },
            { question: "What is Necessary Non-Value-Added time?", answer: "This is time that the customer doesn't technically pay for, but you cannot eliminate. For example, safety inspections or drying time for paint. While it is technically 'waste' in pure lean theory, it is considered necessary waste." },
            { question: "How do I increase my PCE?", answer: "Do not focus on making your machines run faster. To improve PCE, you must aggressively attack the 'Waiting' and 'Inventory' wastes. Transition from batch-and-queue processing to single-piece continuous flow." },
          ]} pageUrl="https://racira.com/calculator/lean-waste-percentage-calculator" />
          <PopularCalculators exclude="/calculator/lean-waste-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
