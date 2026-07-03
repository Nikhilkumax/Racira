"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Train, Truck, Ship, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface MultiModalResults {
  leg1Cost: number;
  leg1Days: number;
  leg2Cost: number;
  leg2Days: number;
  leg3Cost: number;
  leg3Days: number;
  transloadFees: number;
  
  totalCost: number;
  totalDays: number;
  
  chartData: { name: string; cost: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateMultiModal = (
  leg1Cost: number, leg1Days: number,
  leg2Cost: number, leg2Days: number,
  leg3Cost: number, leg3Days: number,
  transloadFees: number
): MultiModalResults => {
  
  const totalCost = leg1Cost + leg2Cost + leg3Cost + transloadFees;
  const totalDays = leg1Days + leg2Days + leg3Days;

  const chartData = [
    { name: "First Mile", cost: leg1Cost },
    { name: "Main Leg", cost: leg2Cost },
    { name: "Last Mile", cost: leg3Cost },
    { name: "Transload", cost: transloadFees },
  ];

  const summaryStats = [
    { label: "Door-to-Door Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Transit Time", value: `${totalDays} Days` },
    { label: "Main Leg Cost", value: `$${leg2Cost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Handling Fees", value: `$${transloadFees.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: `Leg 1: Origin Drayage (${leg1Days} Days)`, amount: `$${leg1Cost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-600" },
    { label: `Leg 2: Rail / Ocean (${leg2Days} Days)`, amount: `$${leg2Cost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-emerald-600" },
    { label: `Leg 3: Destination Delivery (${leg3Days} Days)`, amount: `$${leg3Cost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: `Transloading & Handling Fees`, amount: `$${transloadFees.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: `Total Door-to-Door Cost`, amount: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
  ];

  return { leg1Cost, leg1Days, leg2Cost, leg2Days, leg3Cost, leg3Days, transloadFees, totalCost, totalDays, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  leg1Cost: "450",
  leg1Days: "1",
  leg2Cost: "1200",
  leg2Days: "6",
  leg3Cost: "650",
  leg3Days: "2",
  transloadFees: "200",
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

export default function MultiModalTransportationCostCalculator() {
  const [leg1Cost, setLeg1Cost] = useState(DEFAULTS.leg1Cost);
  const [leg1Days, setLeg1Days] = useState(DEFAULTS.leg1Days);
  
  const [leg2Cost, setLeg2Cost] = useState(DEFAULTS.leg2Cost);
  const [leg2Days, setLeg2Days] = useState(DEFAULTS.leg2Days);
  
  const [leg3Cost, setLeg3Cost] = useState(DEFAULTS.leg3Cost);
  const [leg3Days, setLeg3Days] = useState(DEFAULTS.leg3Days);
  
  const [transloadFees, setTransloadFees] = useState(DEFAULTS.transloadFees);
  
  const [results, setResults] = useState<MultiModalResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateMultiModal(
      parseFloat(leg1Cost) || 0, parseFloat(leg1Days) || 0,
      parseFloat(leg2Cost) || 0, parseFloat(leg2Days) || 0,
      parseFloat(leg3Cost) || 0, parseFloat(leg3Days) || 0,
      parseFloat(transloadFees) || 0
    ));
  };

  const handleReset = () => {
    setLeg1Cost(DEFAULTS.leg1Cost); setLeg1Days(DEFAULTS.leg1Days);
    setLeg2Cost(DEFAULTS.leg2Cost); setLeg2Days(DEFAULTS.leg2Days);
    setLeg3Cost(DEFAULTS.leg3Cost); setLeg3Days(DEFAULTS.leg3Days);
    setTransloadFees(DEFAULTS.transloadFees);
    setResults(calculateMultiModal(450, 1, 1200, 6, 650, 2, 200));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Multi-Modal Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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

  const colors = ["hsl(var(--blue-500))", "hsl(var(--emerald-500))", "hsl(var(--amber-500))", "hsl(var(--muted-foreground))"];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Multi-Modal Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Multi-Modal Transportation Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-5 w-5 text-blue-500" />
              <h2 className="text-2xl font-bold mb-3">First Mile (Origin Drayage)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="l1c" label="Trucking Cost" value={leg1Cost} onChange={setLeg1Cost} prefix="$" tooltip="Cost to move from factory/warehouse to the rail yard or port." />
              <CompactInput id="l1d" label="Transit Days" value={leg1Days} onChange={setLeg1Days} suffix="days" />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Train className="h-5 w-5 text-emerald-500" />
              <h2 className="text-2xl font-bold mb-3">Main Leg (Rail or Ocean)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="l2c" label="Rail/Ocean Cost" value={leg2Cost} onChange={setLeg2Cost} prefix="$" tooltip="The long-haul bulk move." />
              <CompactInput id="l2d" label="Transit Days" value={leg2Days} onChange={setLeg2Days} suffix="days" />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">Last Mile (Destination)</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="l3c" label="Delivery Cost" value={leg3Cost} onChange={setLeg3Cost} prefix="$" tooltip="Cost to move from destination rail yard/port to the final warehouse." />
              <CompactInput id="l3d" label="Transit Days" value={leg3Days} onChange={setLeg3Days} suffix="days" />
            </div>

            <div className="border-t border-border my-1"></div>
            
            <CompactInput id="trn" label="Total Transload & Handling Fees" value={transloadFees} onChange={setTransloadFees} prefix="$" tooltip="Crane fees, terminal handling charges, or cross-docking labor." />

            <div className="p-3 mt-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>Multi-modal transport leverages the fuel efficiency of trains/ships for long distances, combined with the flexibility of trucks for local pickup and delivery.</p>
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
                    Total Door-to-Door Cost
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-primary">
                    ${results.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Estimated Transit Time: <span className="font-bold text-foreground">{results.totalDays} Days</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Logistics Leg</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Cost</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Cost by Segment</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                          <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={25}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is Multi-Modal Transportation?</h2>
            <p><strong>Multi-Modal</strong> (or Intermodal) transportation refers to moving freight from an origin to a destination using multiple modes of transport—usually a combination of trucks and trains (or ships) without handling the freight itself when changing modes. The goods stay inside the same standard 40ft or 53ft shipping container the entire time.</p>
            
            <h3>Why Combine Truck and Rail?</h3>
            <p>A standard semi-truck is highly flexible but very expensive over long distances due to driver wages and diesel fuel consumption. A freight train is incredibly cheap and fuel-efficient over long distances, but it can only go where the tracks go.</p>
            <p><strong>The Intermodal Solution:</strong> A truck picks up the container at the factory (Leg 1), drives it 50 miles to a rail yard. A crane lifts it onto a train. The train moves it 2,000 miles across the country (Leg 2). Another crane takes it off, and a different truck drives it the final 50 miles to the warehouse (Leg 3).</p>

            <h2 className="text-2xl font-bold mb-3">The Trade-Off: Cost vs. Transit Time</h2>
            <p>Shipping a load from Los Angeles to Chicago entirely by truck (Over The Road - OTR) might cost $3,500 and take 3 days. Shipping that same load via Intermodal (Truck + Train + Truck) might cost $2,200 but take 7 days.</p>
            <p>You are trading <strong>speed and reliability</strong> for a massive reduction in <strong>cost and carbon footprint</strong>. Multi-modal is the backbone of modern heavy supply chains.</p>
          </article>
          <FAQSection faqs={[
            { question: "What is Transloading?", answer: "Transloading is physically taking the goods out of one container (like a 40ft Ocean container) and packing them into a different container (like a 53ft domestic truck trailer). This happens constantly at major ports like Los Angeles." },
            { question: "What is Drayage?", answer: "Drayage is the short-distance trucking leg that connects the rail yard or port to the warehouse. It is usually the most expensive part of the trip on a per-mile basis." },
            { question: "Is Intermodal bad for fragile goods?", answer: "It can be. Freight trains experience 'slack action'—violent shudders when the train starts or stops. Goods shipped via rail must be blocked and braced much more securely than goods shipped strictly via highway truck." },
          ]} pageUrl="https://racira.com/calculator/multi-modal-transportation-cost-calculator" />
          <PopularCalculators exclude="/calculator/multi-modal-transportation-cost-calculator" />
        </div>
      </div>
    </>
  );
}
