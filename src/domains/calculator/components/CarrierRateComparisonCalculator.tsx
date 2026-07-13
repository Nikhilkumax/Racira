"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Truck, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CarrierQuote {
  base: number;
  fscPct: number;
  fscAmount: number;
  fees: number;
  total: number;
}

interface CarrierResults {
  carrierA: CarrierQuote;
  carrierB: CarrierQuote;
  winner: string;
  savingsAmt: number;
  savingsPct: number;
  chartData: { name: string; "Base Rate": number; "Fuel Surcharge": number; "Accessorial Fees": number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; carrierA: string; carrierB: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateComparison = (aBase: number, aFsc: number, aFees: number, bBase: number, bFsc: number, bFees: number): CarrierResults => {
  const aFscAmt = aBase * (aFsc / 100);
  const aTotal = aBase + aFscAmt + aFees;
  
  const bFscAmt = bBase * (bFsc / 100);
  const bTotal = bBase + bFscAmt + bFees;

  let winner = "";
  let savingsAmt = 0;
  let savingsPct = 0;

  if (aTotal < bTotal) {
    winner = "Carrier A";
    savingsAmt = bTotal - aTotal;
    savingsPct = (savingsAmt / bTotal) * 100;
  } else if (bTotal < aTotal) {
    winner = "Carrier B";
    savingsAmt = aTotal - bTotal;
    savingsPct = (savingsAmt / aTotal) * 100;
  } else {
    winner = "Tie (Equal Cost)";
  }

  const chartData = [
    { name: "Carrier A", "Base Rate": aBase, "Fuel Surcharge": aFscAmt, "Accessorial Fees": aFees },
    { name: "Carrier B", "Base Rate": bBase, "Fuel Surcharge": bFscAmt, "Accessorial Fees": bFees },
  ];

  const summaryStats = [
    { label: "Carrier A Total", value: `$${aTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Carrier B Total", value: `$${bTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Cost Winner", value: winner },
    { label: "Potential Savings", value: savingsAmt > 0 ? `$${savingsAmt.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "$0.00" },
  ];

  const breakdown = [
    { label: "Base Freight Rate", carrierA: `$${aBase.toFixed(2)}`, carrierB: `$${bBase.toFixed(2)}` },
    { label: "Fuel Surcharge (FSC)", carrierA: `$${aFscAmt.toFixed(2)} (${aFsc}%)`, carrierB: `$${bFscAmt.toFixed(2)} (${bFsc}%)` },
    { label: "Accessorial / Other Fees", carrierA: `$${aFees.toFixed(2)}`, carrierB: `$${bFees.toFixed(2)}` },
    { label: "Total Landed Cost", carrierA: `$${aTotal.toFixed(2)}`, carrierB: `$${bTotal.toFixed(2)}`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return {
    carrierA: { base: aBase, fscPct: aFsc, fscAmount: aFscAmt, fees: aFees, total: aTotal },
    carrierB: { base: bBase, fscPct: bFsc, fscAmount: bFscAmt, fees: bFees, total: bTotal },
    winner, savingsAmt, savingsPct, chartData, summaryStats, breakdown
  };
};

const DEFAULTS = {
  aBase: "1250", aFsc: "24", aFees: "150",
  bBase: "1400", bFsc: "15", bFees: "50",
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

export default function CarrierRateComparisonCalculator() {
  const [aBase, setABase] = useState(DEFAULTS.aBase);
  const [aFsc, setAFsc] = useState(DEFAULTS.aFsc);
  const [aFees, setAFees] = useState(DEFAULTS.aFees);
  
  const [bBase, setBBase] = useState(DEFAULTS.bBase);
  const [bFsc, setBFsc] = useState(DEFAULTS.bFsc);
  const [bFees, setBFees] = useState(DEFAULTS.bFees);

  const [results, setResults] = useState<CarrierResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateComparison(
      parseFloat(aBase) || 0, parseFloat(aFsc) || 0, parseFloat(aFees) || 0,
      parseFloat(bBase) || 0, parseFloat(bFsc) || 0, parseFloat(bFees) || 0
    ));
  };

  const handleReset = () => {
    setABase(DEFAULTS.aBase); setAFsc(DEFAULTS.aFsc); setAFees(DEFAULTS.aFees);
    setBBase(DEFAULTS.bBase); setBFsc(DEFAULTS.bFsc); setBFees(DEFAULTS.bFees);
    setResults(calculateComparison(1250, 24, 150, 1400, 15, 50));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carrier Rate Comp</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let total = 0;
      payload.forEach((entry: any) => total += entry.value);
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 mb-1">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span>${entry.value.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 mt-2 pt-1 border-t border-border font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Carrier Rate Comparison" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carrier Rate Comparison Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            {/* Carrier A */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Truck className="h-5 w-5 text-blue-500" />
                <h2 className="text-2xl font-bold mb-3">Carrier A Quote</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="abase" label="Base Freight Rate" value={aBase} onChange={setABase} prefix="$" />
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="afsc" label="Fuel Surcharge (FSC)" value={aFsc} onChange={setAFsc} suffix="%" />
                  <CompactInput id="afees" label="Accessorial Fees" value={aFees} onChange={setAFees} prefix="$" />
                </div>
              </div>
            </div>

            {/* Carrier B */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Truck className="h-5 w-5 text-amber-500" />
                <h2 className="text-2xl font-bold mb-3">Carrier B Quote</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="bbase" label="Base Freight Rate" value={bBase} onChange={setBBase} prefix="$" />
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput id="bfsc" label="Fuel Surcharge (FSC)" value={bFsc} onChange={setBFsc} suffix="%" />
                  <CompactInput id="bfees" label="Accessorial Fees" value={bFees} onChange={setBFees} prefix="$" />
                </div>
              </div>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.winner.includes('A') ? 'bg-blue-500/10 border-blue-500/30' : results.winner.includes('B') ? 'bg-amber-500/10 border-amber-500/30' : 'bg-secondary/20 border-border'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Cost Analysis Result
                  </div>
                  <div className={`text-3xl sm:text-4xl font-bold tracking-tighter mb-2 ${results.winner.includes('A') ? 'text-blue-600' : results.winner.includes('B') ? 'text-amber-600' : 'text-foreground'}`}>
                    {results.winner} is Cheaper
                  </div>
                  {results.savingsAmt > 0 && (
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                      Savings by choosing {results.winner}: <span className="font-bold text-emerald-600">${results.savingsAmt.toFixed(2)} ({results.savingsPct.toFixed(1)}%)</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Rate Item</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Carrier A</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Carrier B</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.isTotal && results.winner.includes('A') ? 'text-emerald-600' : ''}`}>{item.carrierA}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.isTotal && results.winner.includes('B') ? 'text-emerald-600' : ''}`}>{item.carrierB}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Cost Composition</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Bar dataKey="Base Rate" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="Fuel Surcharge" stackId="a" fill="hsl(var(--chart-2))" />
                          <Bar dataKey="Accessorial Fees" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Comparing Freight Rates is Tricky</h2>
            <p>When shippers request freight quotes from carriers, they rarely receive simple, flat-rate pricing. Carrier pricing is a complex stack of base rates, dynamic fuel surcharges, and conditional accessorial fees. This structure makes a simple "apples-to-apples" comparison difficult.</p>
            
            <h3>The Illusion of the Low Base Rate</h3>
            <p>It is incredibly common for Carrier A to quote a lower base freight rate than Carrier B. If a shipper only looks at the base rate, they will choose Carrier A. However, Carrier A might have a much higher Fuel Surcharge (FSC) matrix, or they might charge aggressively for basic accessorials like residential delivery or liftgate service.</p>
            <p>In many cases, the carrier with the higher base rate actually ends up being cheaper once the total landed cost is calculated.</p>
            
            <h2 className="text-2xl font-bold mb-3">Understanding the Cost Stack</h2>
            <ul>
              <li><strong>Base Rate:</strong> The core charge to move cargo from point A to point B. This is usually calculated by mileage, by weight (CWT), or as a flat lane rate.</li>
              <li><strong>Fuel Surcharge (FSC):</strong> An extra percentage added to the base rate to protect the carrier from volatile diesel prices. The FSC fluctuates weekly based on the Department of Energy's national diesel price index. Note that FSC is usually applied as a percentage of the <em>base rate</em>, not a flat fee.</li>
              <li><strong>Accessorial Fees:</strong> Extra services beyond standard dock-to-dock transit. Common accessorials include Liftgate fees (if a loading dock is unavailable), Residential Delivery fees, Inside Delivery, Sort & Segregate, and Detention fees (if you hold the driver too long).</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">Best Practices for Logistics Procurement</h2>
            <p>When running a freight RFP (Request for Proposal), never evaluate carriers on base rates alone. Always demand that carriers provide their full FSC tables and a schedule of accessorial fees. Run scenario analyses by applying their specific surcharges to your historical shipping data to find the true lowest cost provider.</p>
          </section>
          <FAQSection faqs={[
            { question: "Is the Fuel Surcharge calculated on the total bill?", answer: "Usually, no. In most freight contracts, the FSC is calculated only as a percentage of the Base Rate, not the accessorial fees. This is why a high base rate combined with a high FSC percentage can aggressively inflate your freight bill." },
            { question: "What is FAK?", answer: "FAK stands for 'Freight All Kinds'. It's a pricing agreement where a carrier agrees to rate multiple different freight classes at a single unified class (e.g., rating Class 100 and Class 85 both as Class 70). This simplifies billing and lowers costs." },
            { question: "Can I negotiate Accessorial Fees?", answer: "Absolutely. While base rates and FSCs get the most attention, many shippers successfully negotiate waivers or flat reductions on specific accessorials they use frequently, such as securing a flat $25 liftgate fee regardless of standard tariffs." },
          ]} pageUrl="https://racira.com/calculator/carrier-rate-comparison-calculator" />
          <PopularCalculators exclude="/calculator/carrier-rate-comparison-calculator" />
        </div>
      </div>
    </>
  );
}
