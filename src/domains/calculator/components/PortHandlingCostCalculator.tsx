"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Anchor, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PortResults {
  containers: number;
  thcRate: number;
  baseTHC: number;
  
  portDays: number;
  portFreeDays: number;
  demurrageRate: number;
  demurrageDays: number;
  demurrageCost: number;

  outsideDays: number;
  equipFreeDays: number;
  detentionRate: number;
  detentionDays: number;
  detentionCost: number;

  totalPenalties: number;
  totalCost: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculatePortCosts = (
  containers: number, thcRate: number, 
  portDays: number, portFreeDays: number, demurrageRate: number,
  outsideDays: number, equipFreeDays: number, detentionRate: number
): PortResults => {
  
  const baseTHC = containers * thcRate;

  const demurrageDays = Math.max(0, portDays - portFreeDays);
  const demurrageCost = demurrageDays * demurrageRate * containers;

  const detentionDays = Math.max(0, outsideDays - equipFreeDays);
  const detentionCost = detentionDays * detentionRate * containers;

  const totalPenalties = demurrageCost + detentionCost;
  const totalCost = baseTHC + totalPenalties;

  const chartData = [
    { name: "Terminal Handling (Base)", value: baseTHC, color: "hsl(var(--primary))" },
    { name: "Demurrage (Port Storage Penalty)", value: demurrageCost, color: "hsl(var(--destructive))" },
    { name: "Detention (Equipment Penalty)", value: detentionCost, color: "hsl(var(--amber-500))" },
  ];

  const summaryStats = [
    { label: "Total Port/Terminal Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Base THC", value: `$${baseTHC.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Penalty Fees", value: `$${totalPenalties.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Delayed Containers", value: containers.toString() },
  ];

  const breakdown = [
    { label: `Terminal Handling Charge (THC) [${containers} × $${thcRate}]`, amount: `$${baseTHC.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Port Demurrage [${demurrageDays} overage days × $${demurrageRate} × ${containers}]`, amount: `+$${demurrageCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: demurrageCost > 0 ? "text-red-500 font-bold" : "text-muted-foreground" },
    { label: `Equipment Detention [${detentionDays} overage days × $${detentionRate} × ${containers}]`, amount: `+$${detentionCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: detentionCost > 0 ? "text-amber-600 font-bold" : "text-muted-foreground" },
    { label: "Total Penalties / Fines", amount: `$${totalPenalties.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: totalPenalties > 0 ? "text-red-500" : "" },
    { label: "Total Financial Cost", amount: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { containers, thcRate, baseTHC, portDays, portFreeDays, demurrageRate, demurrageDays, demurrageCost, outsideDays, equipFreeDays, detentionRate, detentionDays, detentionCost, totalPenalties, totalCost, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  containers: "2",
  thcRate: "350",
  
  portDays: "8",
  portFreeDays: "4",
  demurrageRate: "150",
  
  outsideDays: "6",
  equipFreeDays: "4",
  detentionRate: "100"
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

export default function PortHandlingCostCalculator() {
  const [containers, setContainers] = useState(DEFAULTS.containers);
  const [thcRate, setThcRate] = useState(DEFAULTS.thcRate);
  
  const [portDays, setPortDays] = useState(DEFAULTS.portDays);
  const [portFreeDays, setPortFreeDays] = useState(DEFAULTS.portFreeDays);
  const [demurrageRate, setDemurrageRate] = useState(DEFAULTS.demurrageRate);
  
  const [outsideDays, setOutsideDays] = useState(DEFAULTS.outsideDays);
  const [equipFreeDays, setEquipFreeDays] = useState(DEFAULTS.equipFreeDays);
  const [detentionRate, setDetentionRate] = useState(DEFAULTS.detentionRate);
  
  const [results, setResults] = useState<PortResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculatePortCosts(
      parseFloat(containers) || 0, parseFloat(thcRate) || 0,
      parseFloat(portDays) || 0, parseFloat(portFreeDays) || 0, parseFloat(demurrageRate) || 0,
      parseFloat(outsideDays) || 0, parseFloat(equipFreeDays) || 0, parseFloat(detentionRate) || 0
    ));
  };

  const handleReset = () => {
    setContainers(DEFAULTS.containers); setThcRate(DEFAULTS.thcRate);
    setPortDays(DEFAULTS.portDays); setPortFreeDays(DEFAULTS.portFreeDays); setDemurrageRate(DEFAULTS.demurrageRate);
    setOutsideDays(DEFAULTS.outsideDays); setEquipFreeDays(DEFAULTS.equipFreeDays); setDetentionRate(DEFAULTS.detentionRate);
    setResults(calculatePortCosts(2, 350, 8, 4, 150, 6, 4, 100));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Port Handling Costs</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Port Handling Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Port Demurrage & Detention Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="cnt" label="Total Containers" value={containers} onChange={setContainers} tooltip="Number of FCL (Full Container Load) units." />
              <CompactInput id="thc" label="Terminal Handling (THC)" value={thcRate} onChange={setThcRate} prefix="$" suffix="/cntr" tooltip="The base fee charged by the port to lift the container off the ship." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Anchor className="h-5 w-5 text-red-500" />
              <h2 className="text-2xl font-bold mb-3">Demurrage (Inside the Port)</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="pd" label="Actual Days" value={portDays} onChange={setPortDays} />
              <CompactInput id="pfd" label="Free Days" value={portFreeDays} onChange={setPortFreeDays} />
              <CompactInput id="pr" label="Daily Rate" value={demurrageRate} onChange={setDemurrageRate} prefix="$" tooltip="Penalty per container, per day." />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Anchor className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">Detention (Outside the Port)</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="od" label="Actual Days" value={outsideDays} onChange={setOutsideDays} />
              <CompactInput id="ofd" label="Free Days" value={equipFreeDays} onChange={setEquipFreeDays} />
              <CompactInput id="dr" label="Daily Rate" value={detentionRate} onChange={setDetentionRate} prefix="$" tooltip="Penalty per container, per day." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Calculates standard Terminal Handling Charges (THC) alongside expensive logistical delay penalties.
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.totalPenalties > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-primary/10 border-primary/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Port & Equipment Costs
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.totalPenalties > 0 ? 'text-red-600' : 'text-primary'}`}>
                    ${results.totalCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Penalty Fees: <span className={`font-bold ${results.totalPenalties > 0 ? 'text-red-600' : 'text-foreground'}`}>${results.totalPenalties.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Expense Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Cost Distribution</h3>
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
            <h2 className="text-2xl font-bold mb-3">Demurrage vs. Detention: The Supply Chain Nightmare</h2>
            <p>During global supply chain crunches, the words <strong>Demurrage</strong> and <strong>Detention</strong> strike fear into the hearts of importers. These are daily financial penalties levied by ports and ocean carriers for delaying their operations or holding onto their equipment for too long.</p>
            <p>While often used interchangeably by novices, they mean two very different things in the logistics world. Understanding the difference is critical to disputing unfair invoices.</p>
            
            <h3>1. Port Demurrage (Inside the Port)</h3>
            <p>When a ship arrives and unloads your container onto the dock, the port gives you a "Free Time" window (usually 3 to 5 days) to clear customs and send a truck to pick it up. If you fail to pick it up in time, the port charges you <strong>Demurrage</strong>.</p>
            <ul>
              <li><strong>Why it happens:</strong> Your customs broker failed to file paperwork in time, the port is congested and trucks can't get in, or your warehouse is full and you deliberately delayed pickup.</li>
              <li><strong>Who charges it:</strong> The Port Authority or Terminal Operator.</li>
            </ul>

            <h3>2. Equipment Detention (Outside the Port)</h3>
            <p>Once your trucker picks up the container and takes it to your warehouse, the ocean carrier (the shipping line) gives you a "Free Time" window to unload the goods and return the empty metal container back to the port. If you hold onto the empty container for too long, the carrier charges you <strong>Detention</strong>.</p>
            <ul>
              <li><strong>Why it happens:</strong> Your warehouse staff is too slow at unloading the cargo, or there is a shortage of truck chassis to return the empty container.</li>
              <li><strong>Who charges it:</strong> The Ocean Carrier (e.g., Maersk, MSC, Hapag-Lloyd).</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">The Escalation Effect</h2>
            <p>Demurrage and Detention are rarely flat fees. They usually operate on a tiered escalation scale to aggressively incentivize you to move. For example: Days 1-3 might be $150/day, Days 4-7 might jump to $300/day, and Days 8+ could be a punishing $500/day per container. If you have 10 containers stuck at the port for a week, you could easily face a $30,000 penalty invoice.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is a Terminal Handling Charge (THC)?", answer: "A THC is a standard, non-penalty fee charged by the port for the physical labor and crane operation required to lift your container off the ship and place it onto the dock (and eventually onto your trucker's chassis)." },
            { question: "Can I negotiate Demurrage and Detention?", answer: "Before the shipment, yes. Large importers negotiate extended 'Free Time' into their annual carrier contracts (e.g., getting 14 free days instead of 4). After the penalties have accrued, it is very difficult to negotiate unless you can prove the delay was the port's fault (e.g., a union strike)." },
            { question: "What does 'Per Diem' mean?", answer: "Per Diem (Latin for 'per day') is often used synonymously with Detention. When a trucker says they are charging you 'Per Diem' fees, they mean the daily late fee for holding the carrier's equipment." },
          ]} pageUrl="https://racira.com/calculator/port-handling-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Port Handling Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Port Handling Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Port Handling Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Port Handling Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Port Handling Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/port-handling-cost-calculator" />
        </div>
      </div>
    </>
  );
}
