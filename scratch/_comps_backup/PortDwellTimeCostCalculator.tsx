"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Anchor, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DwellTimeResults {
  containers: number;
  actualDwell: number;
  chassisFee: number;
  demurrageFee: number;
  prePullFee: number;
  isPrePulled: boolean;
  
  totalChassisCost: number;
  totalDemurrageCost: number;
  totalPrePullCost: number;
  
  totalDwellCost: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateDwell = (
  containers: number, actualDwell: number, 
  chassisFee: number, demurrageFee: number, 
  prePullFee: number, isPrePulled: boolean
): DwellTimeResults => {
  
  // Chassis is rented per day, every day it dwells.
  const totalChassisCost = actualDwell * chassisFee * containers;
  
  // If pre-pulled, you avoid port demurrage, but you pay a flat pre-pull fee + chassis rental.
  const totalPrePullCost = isPrePulled ? prePullFee * containers : 0;
  const totalDemurrageCost = isPrePulled ? 0 : actualDwell * demurrageFee * containers;
  
  const totalDwellCost = totalChassisCost + totalDemurrageCost + totalPrePullCost;

  const chartData = [
    { name: "Chassis Rental Fees", value: totalChassisCost, color: "hsl(var(--amber-500))" },
    { name: "Port Demurrage / Storage", value: totalDemurrageCost, color: "hsl(var(--destructive))" },
    { name: "Off-site Pre-Pull Labor", value: totalPrePullCost, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Total Dwell Cost", value: `$${totalDwellCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Asset Days", value: `${actualDwell * containers} Days` },
    { label: "Cost Per Container", value: `$${(containers > 0 ? totalDwellCost / containers : 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Strategy Used", value: isPrePulled ? "Pre-Pull" : "Leave at Port" },
  ];

  const breakdown = [
    { label: `Chassis Rental (${actualDwell} Days × $${chassisFee} × ${containers} Cont.)`, amount: `$${totalChassisCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: `Port Storage / Demurrage (${actualDwell} Days × $${demurrageFee} × ${containers} Cont.)`, amount: `$${totalDemurrageCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: totalDemurrageCost > 0 ? "text-red-500" : "text-muted-foreground line-through" },
    { label: `Drayage Pre-Pull Fee ($${prePullFee} × ${containers} Cont.)`, amount: `$${totalPrePullCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: totalPrePullCost > 0 ? "text-primary" : "text-muted-foreground line-through" },
    { label: "Total Logistics Dwell Cost", amount: `$${totalDwellCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-red-600 font-bold text-[15px]" },
  ];

  return { containers, actualDwell, chassisFee, demurrageFee, prePullFee, isPrePulled, totalChassisCost, totalDemurrageCost, totalPrePullCost, totalDwellCost, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  containers: "3",
  actualDwell: "8",
  chassisFee: "35",
  demurrageFee: "150",
  prePullFee: "350",
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

export default function PortDwellTimeCostCalculator() {
  const [containers, setContainers] = useState(DEFAULTS.containers);
  const [actualDwell, setActualDwell] = useState(DEFAULTS.actualDwell);
  const [chassisFee, setChassisFee] = useState(DEFAULTS.chassisFee);
  const [demurrageFee, setDemurrageFee] = useState(DEFAULTS.demurrageFee);
  const [prePullFee, setPrePullFee] = useState(DEFAULTS.prePullFee);
  const [isPrePulled, setIsPrePulled] = useState(true);
  
  const [results, setResults] = useState<DwellTimeResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateDwell(
      parseFloat(containers) || 0, parseFloat(actualDwell) || 0,
      parseFloat(chassisFee) || 0, parseFloat(demurrageFee) || 0,
      parseFloat(prePullFee) || 0, isPrePulled
    ));
  };

  const handleReset = () => {
    setContainers(DEFAULTS.containers); setActualDwell(DEFAULTS.actualDwell);
    setChassisFee(DEFAULTS.chassisFee); setDemurrageFee(DEFAULTS.demurrageFee); setPrePullFee(DEFAULTS.prePullFee);
    setIsPrePulled(true);
    setResults(calculateDwell(3, 8, 35, 150, 350, true));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, [isPrePulled]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Port Dwell Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Port Dwell Time Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Port Dwell Time & Pre-Pull Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Anchor className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Equipment Dwell</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="cnt" label="Total Containers" value={containers} onChange={setContainers} tooltip="Number of containers sitting idle." />
              <CompactInput id="dwl" label="Actual Dwell Time" value={actualDwell} onChange={setActualDwell} suffix="days" tooltip="Total days the containers sat idle waiting to be unloaded at your warehouse." />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex flex-col mb-1">
              <label className="flex items-center text-sm font-semibold text-foreground mb-2">Congestion Strategy</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setIsPrePulled(true)}
                  className={`h-9 rounded-md font-bold text-[13px] transition-colors border ${isPrePulled ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-secondary"}`}
                >Calculate</button>
                <button 
                  onClick={() => setIsPrePulled(false)}
                  className={`h-9 rounded-md font-bold text-[13px] transition-colors border ${!isPrePulled ? "bg-red-500 text-white border-red-500" : "bg-background text-muted-foreground border-input hover:bg-secondary"}`}
                >
                  Leave at Port
                </button>
              </div>
            </div>

            <CompactInput id="cha" label="Daily Chassis Rental Fee" value={chassisFee} onChange={setChassisFee} prefix="$" suffix="/day" tooltip="The daily fee paid to TRAC, DCLI, etc. to rent the wheels the container sits on." />
            
            {!isPrePulled && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <CompactInput id="dem" label="Port Demurrage (Storage)" value={demurrageFee} onChange={setDemurrageFee} prefix="$" suffix="/day" tooltip="The fine the port charges you per day for leaving the box on their dock." />
              </div>
            )}
            
            {isPrePulled && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <CompactInput id="pre" label="Drayage Pre-Pull Flat Fee" value={prePullFee} onChange={setPrePullFee} prefix="$" tooltip="The flat fee paid to a trucker to move the box from the port to a private off-site yard to avoid Demurrage." />
              </div>
            )}

            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>Compare the financial impact of letting containers accrue port demurrage versus paying a trucker to pre-pull them to a private yard.</p>
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
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Logistics Dwell Cost
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.totalDwellCost > 2000 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${results.totalDwellCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Using the <span className={`font-bold ${results.isPrePulled ? 'text-primary' : 'text-red-600'}`}>{results.isPrePulled ? "Pre-Pull Strategy" : "Port Storage Strategy"}</span>.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Asset Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className={`text-[13px] py-3 px-3 ${item.colorClass?.includes('line-through') ? 'text-muted-foreground line-through' : ''}`}>{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Dwell Expense Mix</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={results.chartData.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {results.chartData.filter(d => d.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
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
            <h2 className="text-2xl font-bold mb-3">What is Dwell Time in Supply Chain?</h2>
            <p><strong>Dwell Time</strong> is the amount of time a shipping container sits completely idle. Whether it is sitting on the dock at the port, or sitting in a dirt parking lot waiting to be unloaded, dwell time is the silent killer of logistics budgets.</p>
            
            <h3>The Pre-Pull Strategy</h3>
            <p>When a port gives you 4 days of "Free Time" to pick up your container, and your warehouse is full, you have a problem. If you leave the container at the port, they will charge you severe <strong>Demurrage fines</strong> (often $200+ per day).</p>
            <p>To avoid this, logistics managers use a tactic called a <strong>Pre-Pull</strong>. They hire a trucker to pick the container up from the port and drop it off at a cheap, private off-site yard. You pay a one-time drayage fee (e.g., $350), but you avoid the massive daily port fines.</p>

            <h2 className="text-2xl font-bold mb-3">The Hidden Chassis Rental Trap</h2>
            <p>Whether the container is sitting at the port, or sitting in a pre-pull yard, it is resting on a <strong>Chassis</strong> (the wheeled trailer frame). You do not own the chassis; you rent it from a leasing pool (like DCLI or TRAC) for around $35 a day.</p>
            <p>If you pre-pull a container to avoid a $200/day port fine, but let it sit in a yard for 15 days, you still have to pay 15 days of chassis rental fees. This calculator helps you determine exactly which strategy is cheaper based on how long you expect the cargo to be delayed.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is the difference between Demurrage and Detention?", answer: "Demurrage is the fine for leaving a full container inside the port terminal. Detention (or Per Diem) is the fine for keeping the physical steel container (owned by the ocean carrier) outside the port for too long." },
            { question: "Do you pay a chassis fee while the container is on the ship?", answer: "No. The chassis fee only begins the moment the crane places the container onto a chassis at the destination port, and stops the moment you return the empty container and chassis back to the terminal." },
            { question: "Can I pre-pull a container if it has a Customs Hold?", answer: "No. US Customs will not allow the container to physically leave the port terminal boundaries if it is under an active hold, meaning you cannot use the Pre-Pull strategy to avoid demurrage during an exam." },
          ]} pageUrl="https://racira.com/calculator/port-dwell-time-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Port Dwell Time Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Port Dwell Time Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Port Dwell Time Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Port Dwell Time Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Port Dwell Time Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/port-dwell-time-cost-calculator" />
        </div>
      </div>
    </>
  );
}
