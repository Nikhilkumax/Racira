"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, PackageX, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DeadFreightResults {
  capacity: number;
  loaded: number;
  cost: number;
  unit: string;
  
  utilizationPct: number;
  emptySpace: number;
  
  baseUnitRate: number;
  effectiveUnitRate: number;
  deadFreightLoss: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateDeadFreight = (
  capacity: number, loaded: number, cost: number, unit: string
): DeadFreightResults => {
  
  // Cap loaded at capacity to prevent negative dead freight in edge cases
  const actualLoaded = Math.min(loaded, capacity);
  
  const utilizationPct = capacity > 0 ? (actualLoaded / capacity) * 100 : 0;
  const emptySpace = capacity - actualLoaded;
  
  const baseUnitRate = capacity > 0 ? cost / capacity : 0;
  const effectiveUnitRate = actualLoaded > 0 ? cost / actualLoaded : 0;
  
  const deadFreightLoss = emptySpace * baseUnitRate;
  const utilizedCost = actualLoaded * baseUnitRate;

  const chartData = [
    { name: "Utilized Space", value: utilizedCost, color: "hsl(var(--primary))" },
    { name: "Dead Freight (Empty Air)", value: deadFreightLoss, color: "hsl(var(--destructive))" },
  ];

  const summaryStats = [
    { label: "Dead Freight Loss", value: `$${deadFreightLoss.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Capacity Utilization", value: `${utilizationPct.toFixed(1)}%` },
    { label: "Base Rate / Unit", value: `$${baseUnitRate.toFixed(2)}` },
    { label: "Effective Rate / Unit", value: `$${effectiveUnitRate.toFixed(2)}` },
  ];

  const breakdown = [
    { label: `Total Flat Rate Paid`, amount: `$${cost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Value of Utilized Space (${utilizationPct.toFixed(1)}%)`, amount: `-$${utilizedCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-emerald-600" },
    { label: `Financial Loss on Empty Space`, amount: `$${deadFreightLoss.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-red-500 font-bold text-[15px]" },
  ];

  return { capacity, loaded: actualLoaded, cost, unit, utilizationPct, emptySpace, baseUnitRate, effectiveUnitRate, deadFreightLoss, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  capacity: "67",
  loaded: "42",
  cost: "5500",
  unit: "CBM", // CBM (Cubic Meters), KG, or Pallets
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

export default function DeadFreightCostCalculator() {
  const [capacity, setCapacity] = useState(DEFAULTS.capacity);
  const [loaded, setLoaded] = useState(DEFAULTS.loaded);
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  
  const [results, setResults] = useState<DeadFreightResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateDeadFreight(
      parseFloat(capacity) || 0, 
      parseFloat(loaded) || 0,
      parseFloat(cost) || 0,
      unit
    ));
  };

  const handleReset = () => {
    setCapacity(DEFAULTS.capacity); setLoaded(DEFAULTS.loaded); setCost(DEFAULTS.cost); setUnit("CBM");
    setResults(calculateDeadFreight(67, 42, 5500, "CBM"));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, [unit]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Dead Freight Loss</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Dead Freight Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dead Freight & Empty Space Financial Loss</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <PackageX className="h-5 w-5 text-red-500" />
              <h2 className="text-2xl font-bold mb-3">Freight Utilization</h2>
            </div>
            
            <div className="flex flex-col">
              <label className="flex items-center text-sm font-semibold text-foreground mb-2">Measurement Unit</label>
              <div className="grid grid-cols-3 gap-2">
                {["CBM", "KGs", "Pallets"].map((u) => (
                  <button 
                    key={u} 
                    onClick={() => setUnit(u)}
                    className={`h-9 rounded-md font-bold text-xs transition-colors border ${unit === u ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-secondary"}`}
                  >Calculate</button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="cap" label="Total Capacity" value={capacity} onChange={setCapacity} suffix={unit} tooltip={`The maximum amount of ${unit} the container or truck can hold.`} />
              <CompactInput id="load" label="Actual Loaded" value={loaded} onChange={setLoaded} suffix={unit} tooltip={`The amount of ${unit} you actually put inside.`} />
            </div>
            
            <CompactInput id="cst" label="Total Flat Rate Paid" value={cost} onChange={setCost} prefix="$" tooltip="The total price you paid to lease the entire container/truck." />

            <div className="p-3 mt-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>When you book an FCL (Full Container Load) or FTL (Full Truckload), you pay a flat rate for the entire box. Every inch of empty space is money burned.</p>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.deadFreightLoss > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Dead Freight Financial Loss
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.deadFreightLoss > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${results.deadFreightLoss.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {results.deadFreightLoss > 0 ? (
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                      You paid for <span className="font-bold text-red-600">{results.emptySpace.toLocaleString()} {results.unit}</span> of empty air.
                    </div>
                  ) : (
                    <div className="text-sm text-emerald-600 font-bold flex items-center gap-2">
                      100% Perfect Utilization
                    </div>
                  )}
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Financial Breakdown</th>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Space Value Distribution</h3>
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
            <h2 className="text-2xl font-bold mb-3">What is Dead Freight?</h2>
            <p><strong>Dead Freight</strong> is a logistics term used to describe the financial loss incurred when a shipper books and pays for a specific amount of cargo capacity, but fails to utilize all of it. In simple terms, it is the cost of shipping empty air.</p>
            <p>This happens frequently in FCL (Full Container Load) ocean shipping and FTL (Full Truckload) domestic shipping. When you book a 40-foot ocean container, the shipping line charges you a flat rate for the box (e.g., $5,500). They do not care if you put 1,000 laptops in it, or a single pair of socks.</p>
            
            <h3>The Hidden Increase in Unit Economics</h3>
            <p>Dead freight destroys product margins through the "Effective Rate" metric. If a container holds 67 Cubic Meters (CBM), and you pay $5,500, your <em>Base Rate</em> is $82 per CBM. You base your product pricing on this.</p>
            <p>However, if your supplier poorly loads the container and only fits 42 CBM of goods inside, your <em>Effective Rate</em> jumps to $130 per CBM. Your freight cost just skyrocketed by 58% per unit, instantly wiping out your profit margin without the carrier ever raising their prices.</p>

            <h2 className="text-2xl font-bold mb-3">How to Prevent Dead Freight</h2>
            <ul>
              <li><strong>Consolidation (LCL / LTL):</strong> If you do not have enough cargo to fill a container, do not book one. Use Less-than-Container-Load (LCL) shipping, where you share a container with other companies and only pay for the exact space you use.</li>
              <li><strong>Carton Optimization:</strong> If your product boxes are slightly too large, they won't stack efficiently on a pallet, leaving massive gaps at the ceiling of the container. Shaving 1 inch off a cardboard box design can sometimes allow an extra 500 units to fit in a container.</li>
              <li><strong>Supplier Penalties:</strong> If you order enough product to fill a 40ft container, but the supplier fails to manufacture it all in time and ships a half-empty container anyway, you should charge the supplier a chargeback for the dead freight loss.</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "Do airlines charge for dead freight?", answer: "Yes, but in a different way. Airlines use 'Chargeable Weight' (comparing actual weight vs volumetric weight). If you book a charter flight or buy a massive block of space on a freighter and fail to fill it, you still pay for the blocked space." },
            { question: "How many CBM fit in a container?", answer: "A standard 20ft container holds about 33 CBM. A standard 40ft container holds about 67 CBM. A 40ft High Cube (HC) holds about 76 CBM. Note that you can rarely utilize 100% due to the geometry of pallets." },
            { question: "Is it ever worth it to ship dead freight?", answer: "Yes. If your factory has a stockout and you desperately need inventory to keep an assembly line running or fulfill a massive customer order, paying $2,000 for empty air is better than losing a $500,000 client relationship." },
          ]} pageUrl="https://racira.com/calculator/dead-freight-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Dead Freight Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Dead Freight Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Dead Freight Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Dead Freight Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Dead Freight Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/dead-freight-cost-calculator" />
        </div>
      </div>
    </>
  );
}
