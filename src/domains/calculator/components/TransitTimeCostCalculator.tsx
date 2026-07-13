"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Ship, Plane, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface TransitResults {
  shipmentValue: number;
  apr: number;
  
  oceanDays: number;
  oceanCost: number;
  airDays: number;
  airCost: number;
  
  oceanOpportunityCost: number;
  airOpportunityCost: number;
  
  totalOceanCost: number;
  totalAirCost: number;
  
  winner: "Ocean" | "Air";
  savings: number;
  
  chartData: { name: string; freight: number; opportunity: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateTransit = (
  shipmentValue: number, apr: number, 
  oceanDays: number, oceanCost: number, 
  airDays: number, airCost: number
): TransitResults => {
  
  const oceanOpportunityCost = shipmentValue * (apr / 100) * (oceanDays / 365);
  const airOpportunityCost = shipmentValue * (apr / 100) * (airDays / 365);
  
  const totalOceanCost = oceanCost + oceanOpportunityCost;
  const totalAirCost = airCost + airOpportunityCost;
  
  const winner = totalOceanCost <= totalAirCost ? "Ocean" : "Air";
  const savings = Math.abs(totalOceanCost - totalAirCost);

  const chartData = [
    { name: "Ocean Freight", freight: oceanCost, opportunity: oceanOpportunityCost },
    { name: "Air Freight", freight: airCost, opportunity: airOpportunityCost },
  ];

  const summaryStats = [
    { label: "Optimal Choice", value: winner },
    { label: "Financial Savings", value: `$${savings.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Ocean True Cost", value: `$${totalOceanCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Air True Cost", value: `$${totalAirCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Ocean: Base Freight Cost", amount: `$${oceanCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-600" },
    { label: `Ocean: Capital Opportunity Cost (${oceanDays} days @ ${apr}%)`, amount: `+$${oceanOpportunityCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Ocean: Total Financial Impact", amount: `$${totalOceanCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold" },
    { label: "Air: Base Freight Cost", amount: `$${airCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-600 mt-4" },
    { label: `Air: Capital Opportunity Cost (${airDays} days @ ${apr}%)`, amount: `+$${airOpportunityCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Air: Total Financial Impact", amount: `$${totalAirCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold" },
  ];

  return { shipmentValue, apr, oceanDays, oceanCost, airDays, airCost, oceanOpportunityCost, airOpportunityCost, totalOceanCost, totalAirCost, winner, savings, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  shipmentValue: "150000",
  apr: "12",
  oceanDays: "45",
  oceanCost: "2500",
  airDays: "7",
  airCost: "9000",
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

export default function TransitTimeCostCalculator() {
  const [shipmentValue, setShipmentValue] = useState(DEFAULTS.shipmentValue);
  const [apr, setApr] = useState(DEFAULTS.apr);
  const [oceanDays, setOceanDays] = useState(DEFAULTS.oceanDays);
  const [oceanCost, setOceanCost] = useState(DEFAULTS.oceanCost);
  const [airDays, setAirDays] = useState(DEFAULTS.airDays);
  const [airCost, setAirCost] = useState(DEFAULTS.airCost);
  
  const [results, setResults] = useState<TransitResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateTransit(
      parseFloat(shipmentValue) || 0, parseFloat(apr) || 0,
      parseFloat(oceanDays) || 0, parseFloat(oceanCost) || 0,
      parseFloat(airDays) || 0, parseFloat(airCost) || 0
    ));
  };

  const handleReset = () => {
    setShipmentValue(DEFAULTS.shipmentValue); setApr(DEFAULTS.apr);
    setOceanDays(DEFAULTS.oceanDays); setOceanCost(DEFAULTS.oceanCost);
    setAirDays(DEFAULTS.airDays); setAirCost(DEFAULTS.airCost);
    setResults(calculateTransit(150000, 12, 45, 2500, 7, 9000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Transit Time Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">Freight Base Cost:</span>
            <span style={{ color: payload[0].fill }}>${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">Tied-Up Capital Cost:</span>
            <span style={{ color: payload[1].fill }}>${payload[1].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
          <div className="flex justify-between gap-4 mt-2 pt-1 border-t border-border">
            <span className="text-muted-foreground font-bold">Total Financial Impact:</span>
            <span className="text-foreground font-bold">${(payload[0].value + payload[1].value).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Transit Time Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Transit Time Opportunity Cost Calculator (Air vs Ocean)</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="val" label="Total Value of Goods" value={shipmentValue} onChange={setShipmentValue} prefix="$" tooltip="Commercial value of the inventory in transit." />
              <CompactInput id="apr" label="Cost of Capital (APR)" value={apr} onChange={setApr} suffix="%" tooltip="Your business loan interest rate, or the ROI you expect from your cash." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Ship className="h-5 w-5 text-blue-500" />
              <h2 className="text-2xl font-bold mb-3">Ocean Freight (Slow & Cheap)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="oday" label="Ocean Transit Time" value={oceanDays} onChange={setOceanDays} suffix="days" tooltip="Total days from factory pickup to warehouse delivery." />
              <CompactInput id="ocst" label="Ocean Freight Cost" value={oceanCost} onChange={setOceanCost} prefix="$" />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Plane className="h-5 w-5 text-sky-500" />
              <h2 className="text-2xl font-bold mb-3">Air Freight (Fast & Expensive)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="aday" label="Air Transit Time" value={airDays} onChange={setAirDays} suffix="days" tooltip="Usually 5-7 days door-to-door." />
              <CompactInput id="acst" label="Air Freight Cost" value={airCost} onChange={setAirCost} prefix="$" />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>Ocean freight is always cheaper on the invoice, but it ties up massive amounts of capital for weeks. This calculates which method is actually cheaper financially.</p>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.winner === 'Ocean' ? 'bg-blue-500/10 border-blue-500' : 'bg-sky-500/10 border-sky-500'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Optimal Financial Choice
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.winner === 'Ocean' ? 'text-blue-600' : 'text-sky-600'}`}>
                    {results.winner} Freight is Cheaper
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Even when accounting for tied-up capital, {results.winner} saves you <span className="font-bold text-emerald-600">${results.savings.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>.
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
                          <tr key={idx} className={`${item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""} ${item.colorClass?.includes('mt-4') ? "border-t-4 border-background" : ""}`}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass?.replace('mt-4','') || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Freight vs Capital Cost</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} />
                          <YAxis hide />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                          <Bar dataKey="freight" name="Base Freight" stackId="a" fill="hsl(var(--blue-500))" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="opportunity" name="Tied-Up Capital Cost" stackId="a" fill="hsl(var(--amber-500))" radius={[4, 4, 0, 0]} />
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
            <h2 className="text-2xl font-bold mb-3">Air vs Ocean: The Supply Chain Trade-Off</h2>
            <p>Every logistics manager faces the classic dilemma: Do I ship this cargo via Ocean (cheap but takes 45 days) or Air (expensive but takes 5 days)? The amateur mistake is to only look at the logistics invoice. The professional approach is to calculate the <strong>Total Cost of Ownership (TCO)</strong>, which includes the cost of tied-up capital.</p>
            
            <h3>The Hidden Cost of Ocean Freight</h3>
            <p>When you ship goods across the ocean, you usually pay the factory before the ship leaves the port. That means you have massive amounts of cash tied up in inventory that is sitting in a metal box in the middle of the Pacific Ocean. You cannot sell those goods, and you cannot use that cash for marketing or operations.</p>
            <p>If you are using a business loan (or line of credit) to fund that inventory, you are paying daily interest on that cash. If the ship takes 45 days, you just paid 45 days of interest to the bank while generating zero revenue. This is called the <strong>Opportunity Cost of Capital</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">When Air Freight Actually Saves Money</h2>
            <p>For low-value, heavy goods (like furniture or canned food), Ocean freight is almost always cheaper, even with the opportunity cost. However, for <strong>high-value, lightweight goods</strong> (like microchips, smartphones, or high-end pharmaceuticals), the math flips.</p>
            <p>If you have $2,000,000 worth of iPhones, the daily interest cost of tying up that capital is so exorbitant that it is mathematically cheaper to pay the massive Air Freight premium just to get the goods onto store shelves 40 days faster.</p>
          </section>
          <FAQSection faqs={[
            { question: "What should I use for 'Cost of Capital' if I don't have a business loan?", answer: "Use your expected Return on Investment (ROI). If you could take that cash and invest it in marketing to generate a 15% return, your cost of capital is 15%. Your cash should never sit idle for 'free'." },
            { question: "Are there other costs to slow transit times?", answer: "Yes. Obsolescence is a major risk in fashion and tech. If you ship winter coats via ocean, but they get delayed and arrive in Spring, you now have to liquidate them at a massive loss. Air freight guarantees you hit the seasonal window." },
            { question: "Can I do a mix of both?", answer: "Yes! A common strategy is 'Sea-Air'. You ship 20% of your inventory via Air Freight to capture immediate sales and launch the product, and ship the remaining 80% via Ocean to lower your blended margin." },
          ]} pageUrl="https://racira.com/calculator/transit-time-cost-calculator" />
          <PopularCalculators exclude="/calculator/transit-time-cost-calculator" />
        </div>
      </div>
    </>
  );
}
