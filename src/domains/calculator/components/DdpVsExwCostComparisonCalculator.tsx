"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Scale, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface ComparisonResults {
  exwQuote: number;
  exwLogistics: number;
  exwDuty: number;
  
  ddpQuote: number;
  
  exwTotal: number;
  ddpTotal: number;
  
  difference: number;
  premiumPct: number;
  cheaperOption: "EXW" | "DDP" | "Equal";
  
  chartData: { name: string; Goods: number; Logistics: number; Duty: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; colorClass?: string }[];
}

const calculateComparison = (
  exwQuote: number, exwLogistics: number, exwDuty: number, ddpQuote: number
): ComparisonResults => {
  
  const exwTotal = exwQuote + exwLogistics + exwDuty;
  const ddpTotal = ddpQuote; // DDP implies all logistics and duties are baked into the supplier's price
  
  const difference = Math.abs(ddpTotal - exwTotal);
  let cheaperOption: "EXW" | "DDP" | "Equal" = "Equal";
  let premiumPct = 0;

  if (exwTotal < ddpTotal) {
    cheaperOption = "EXW";
    premiumPct = exwTotal > 0 ? (difference / exwTotal) * 100 : 0;
  } else if (ddpTotal < exwTotal) {
    cheaperOption = "DDP";
    premiumPct = ddpTotal > 0 ? (difference / ddpTotal) * 100 : 0;
  }

  const chartData = [
    { name: "EXW (Buyer Manages Freight)", Goods: exwQuote, Logistics: exwLogistics, Duty: exwDuty },
    { name: "DDP (Seller Manages Freight)", Goods: ddpQuote, Logistics: 0, Duty: 0 },
  ];

  const summaryStats = [
    { label: "EXW Total Cost", value: `$${exwTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "DDP Total Cost", value: `$${ddpTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Cost Difference", value: `$${difference.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Winner", value: cheaperOption },
  ];

  const breakdown = [
    { label: "EXW Strategy: Factory Price", amount: `$${exwQuote.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "EXW Strategy: Your Forwarder Freight Estimate", amount: `+$${exwLogistics.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "EXW Strategy: Your Import Duty Estimate", amount: `+$${exwDuty.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total EXW Financial Cost", amount: `$${exwTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600 font-bold" },
    
    { label: "DDP Strategy: Fully Baked Supplier Quote", amount: `$${ddpTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total DDP Financial Cost", amount: `$${ddpTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary font-bold" },
  ];

  return { exwQuote, exwLogistics, exwDuty, ddpQuote, exwTotal, ddpTotal, difference, premiumPct, cheaperOption, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  exwQuote: "35000",
  exwLogistics: "6500",
  exwDuty: "4200",
  ddpQuote: "51000",
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

export default function DdpVsExwCostComparisonCalculator() {
  const [exwQuote, setExwQuote] = useState(DEFAULTS.exwQuote);
  const [exwLogistics, setExwLogistics] = useState(DEFAULTS.exwLogistics);
  const [exwDuty, setExwDuty] = useState(DEFAULTS.exwDuty);
  const [ddpQuote, setDdpQuote] = useState(DEFAULTS.ddpQuote);
  
  const [results, setResults] = useState<ComparisonResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateComparison(
      parseFloat(exwQuote) || 0, 
      parseFloat(exwLogistics) || 0,
      parseFloat(exwDuty) || 0,
      parseFloat(ddpQuote) || 0
    ));
  };

  const handleReset = () => {
    setExwQuote(DEFAULTS.exwQuote); setExwLogistics(DEFAULTS.exwLogistics); setExwDuty(DEFAULTS.exwDuty); setDdpQuote(DEFAULTS.ddpQuote);
    setResults(calculateComparison(35000, 6500, 4200, 51000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>DDP vs EXW Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === 0) return null;
            return (
              <div key={index} className="flex justify-between gap-4 mb-1">
                <span style={{ color: entry.fill }}>{entry.name}:</span>
                <span>${entry.value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "DDP vs EXW Comparison" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">DDP vs EXW Cost Comparison Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Scale className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">EXW Strategy (You Control Freight)</h2>
            </div>
            
            <CompactInput id="eq" label="Supplier EXW Price (Goods Only)" value={exwQuote} onChange={setExwQuote} prefix="$" tooltip="The bare factory price of the goods, assuming you pick them up." />
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="el" label="Your Logistics Estimate" value={exwLogistics} onChange={setExwLogistics} prefix="$" tooltip="Total cost from your freight forwarder to ship it from the factory to your door." />
              <CompactInput id="ed" label="Your Import Duty Estimate" value={exwDuty} onChange={setExwDuty} prefix="$" tooltip="Your estimated customs duties and taxes." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">DDP Strategy (Supplier Handles Everything)</h2>
            </div>

            <CompactInput id="dq" label="Supplier DDP Quote" value={ddpQuote} onChange={setDdpQuote} prefix="$" tooltip="The total door-to-door price quoted by your supplier, including all freight and duties." />

            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>Suppliers often bake a massive hidden profit margin into their DDP freight quotes. This calculator reveals exactly how much that "convenience" is costing you.</p>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.cheaperOption === 'EXW' ? 'bg-amber-500/10 border-amber-500/30' : results.cheaperOption === 'DDP' ? 'bg-primary/10 border-primary/30' : 'bg-secondary border-border'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Financial Recommendation
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.cheaperOption === 'EXW' ? 'text-amber-600' : results.cheaperOption === 'DDP' ? 'text-primary' : 'text-foreground'}`}>
                    {results.cheaperOption === 'Equal' ? 'Costs are Identical' : `${results.cheaperOption} is Cheaper`}
                  </div>
                  {results.difference > 0 && (
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                      Saves <span className={`font-bold ${results.cheaperOption === 'EXW' ? 'text-amber-600' : 'text-primary'}`}>${results.difference.toLocaleString("en-US")} ({results.premiumPct.toFixed(1)}%)</span> on total landed cost.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Cost Comparison</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.label.includes("Total") ? "bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className={`text-[13px] py-3 px-3 ${item.label.includes("Total") ? "font-bold" : ""}`}>{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>
                              {item.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Landed Cost Stack</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                          
                          <Bar dataKey="Goods" stackId="a" fill="hsl(var(--muted-foreground))" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Logistics" stackId="a" fill="hsl(var(--blue-500))" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Duty" stackId="a" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
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
            <h2 className="text-2xl font-bold mb-3">EXW vs DDP: The Great Supply Chain Debate</h2>
            <p>When negotiating a purchase order with an overseas supplier, you will inevitably have to choose an Incoterm. The two most extreme opposites on the spectrum are <strong>EXW (Ex Works)</strong> and <strong>DDP (Delivered Duty Paid)</strong>.</p>
            
            <h3>What is EXW?</h3>
            <p>Under EXW, the supplier's only responsibility is to manufacture the goods and leave them at their factory loading dock. <strong>You</strong> (the buyer) must hire a freight forwarder to pick them up, clear export customs, sail them across the ocean, pay import duties, and truck them to your warehouse. It is the cheapest price for the goods, but requires maximum logistical effort.</p>

            <h3>What is DDP?</h3>
            <p>Under DDP, the supplier handles literally everything. They act like an Amazon Prime delivery. You pay one flat fee, and the goods magically show up at your warehouse door, with all freight and customs duties already paid. It requires zero logistical effort, but it is almost always the most expensive option.</p>
            
            <h2 className="text-2xl font-bold mb-3">The "Convenience Premium" Trap</h2>
            <p>Many new importers choose DDP because they are intimidated by logistics. However, suppliers know this. When a supplier quotes you a DDP price, they do not just pass along the exact freight cost. They will often add a massive 20% to 40% markup on the freight to compensate themselves for the administrative hassle and risk of clearing customs in your country.</p>
            <p>By getting a separate EXW quote, and asking your own freight forwarder for a logistics quote, you can use this calculator to uncover exactly how much profit the supplier is secretly baking into their DDP freight quote.</p>
          </article>
          <FAQSection faqs={[
            { question: "If EXW is cheaper, why would anyone use DDP?", answer: "DDP is fantastic for very small, low-value test orders (like a $500 sample box shipped via DHL Express) where hiring a dedicated customs broker isn't worth the administrative hassle." },
            { question: "Is DDP legally risky for the buyer?", answer: "Yes. In the United States, CBP holds the 'Importer of Record' legally liable for customs fraud. If your overseas supplier uses a shady DDP agent who lies about the product's value to evade taxes, US Customs can seize your goods and fine YOU, even though the supplier arranged the freight." },
            { question: "What is FOB, and is it a good middle ground?", answer: "FOB (Free On Board) is the industry standard sweet spot. The supplier handles local export logistics in their country (which they are good at), and you hire a forwarder to handle the ocean freight and import customs (which gives you control and transparency)." },
          ]} pageUrl="https://racira.com/calculator/ddp-vs-exw-cost-comparison-calculator" />
          <PopularCalculators exclude="/calculator/ddp-vs-exw-cost-comparison-calculator" />
        </div>
      </div>
    </>
  );
}
