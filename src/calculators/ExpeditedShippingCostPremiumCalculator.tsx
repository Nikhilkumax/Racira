"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Zap, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface PremiumResults {
  standardCost: number;
  expeditedCost: number;
  units: number;
  profitPerUnit: number;
  
  premium: number;
  premiumPerUnit: number;
  breakEvenUnits: number;
  newProfitMargin: number;
  
  chartData: { name: string; standard: number; premium: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculatePremium = (
  standardCost: number, expeditedCost: number, 
  units: number, profitPerUnit: number
): PremiumResults => {
  
  const premium = expeditedCost > standardCost ? expeditedCost - standardCost : 0;
  const premiumPerUnit = units > 0 ? premium / units : 0;
  
  const breakEvenUnits = profitPerUnit > 0 ? Math.ceil(premium / profitPerUnit) : 0;
  
  const originalTotalProfit = units * profitPerUnit;
  const newTotalProfit = originalTotalProfit - premium;
  const newProfitMargin = units > 0 ? newTotalProfit / units : 0;

  const chartData = [
    { name: "Total Freight Bill", standard: standardCost, premium: premium },
  ];

  const summaryStats = [
    { label: "The Expedited Premium", value: `$${premium.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Added Cost Per Unit", value: `$${premiumPerUnit.toFixed(2)}` },
    { label: "Break-Even Sales Needed", value: `${breakEvenUnits} Units` },
    { label: "New Profit Per Unit", value: `$${newProfitMargin.toFixed(2)}` },
  ];

  const breakdown = [
    { label: "Standard Shipping Base Cost", amount: `$${standardCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: "Speed Upgrade Premium (The Delta)", amount: `+$${premium.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Total Expedited Invoice", amount: `$${expeditedCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
    { label: `Profit Margin Lost Per Unit`, amount: `-$${premiumPerUnit.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-red-600 font-bold text-[15px]" },
  ];

  return { standardCost, expeditedCost, units, profitPerUnit, premium, premiumPerUnit, breakEvenUnits, newProfitMargin, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  standardCost: "1500",
  expeditedCost: "4200",
  units: "500",
  profitPerUnit: "18.50",
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

export default function ExpeditedShippingCostPremiumCalculator() {
  const [standardCost, setStandardCost] = useState(DEFAULTS.standardCost);
  const [expeditedCost, setExpeditedCost] = useState(DEFAULTS.expeditedCost);
  const [units, setUnits] = useState(DEFAULTS.units);
  const [profitPerUnit, setProfitPerUnit] = useState(DEFAULTS.profitPerUnit);
  
  const [results, setResults] = useState<PremiumResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculatePremium(
      parseFloat(standardCost) || 0, parseFloat(expeditedCost) || 0,
      parseFloat(units) || 0, parseFloat(profitPerUnit) || 0
    ));
  };

  const handleReset = () => {
    setStandardCost(DEFAULTS.standardCost); setExpeditedCost(DEFAULTS.expeditedCost);
    setUnits(DEFAULTS.units); setProfitPerUnit(DEFAULTS.profitPerUnit);
    setResults(calculatePremium(1500, 4200, 500, 18.50));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Expedited Premium</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">Total Logistics Invoice</p>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">Standard Base Cost:</span>
            <span style={{ color: payload[0].fill }}>${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground font-bold">Expedited Speed Penalty:</span>
            <span style={{ color: payload[1].fill }} className="font-bold">+${payload[1].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Expedited Shipping Premium" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Expedited Shipping Cost Premium Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">Freight Comparison</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="std" label="Standard Shipping Cost" value={standardCost} onChange={setStandardCost} prefix="$" tooltip="The normal cost if you shipped this on a standard timeline." />
              <CompactInput id="exp" label="Expedited / Air Freight Cost" value={expeditedCost} onChange={setExpeditedCost} prefix="$" tooltip="The emergency quote from the carrier to get it there immediately." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Unit Economics</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="unt" label="Units in Shipment" value={units} onChange={setUnits} tooltip="Total individual products in this specific expedited load." />
              <CompactInput id="pro" label="Normal Profit Per Unit" value={profitPerUnit} onChange={setProfitPerUnit} prefix="$" tooltip="Your standard gross profit margin for a single unit." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>When supply chain managers panic and upgrade a shipment to "Overnight Air", they often completely destroy the profit margin of the goods inside the box.</p>
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
                
                <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Margin Destruction Risk
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-red-600">
                    {results.breakEvenUnits} Units
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    You must sell {results.breakEvenUnits} units from this shipment <span className="font-bold text-red-600">for free</span> just to pay the FedEx driver.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Financial Impact</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">The Expedited Premium</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" hide />
                          <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                          
                          <Bar dataKey="standard" name="Standard Base Cost" stackId="a" fill="hsl(var(--muted-foreground))" radius={[0, 0, 0, 0]} barSize={40} />
                          <Bar dataKey="premium" name="Expedited Penalty" stackId="a" fill="hsl(var(--red-500))" radius={[0, 4, 4, 0]} barSize={40} />
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
            <h2 className="text-2xl font-bold mb-3">The Danger of "Expedited" Shipping</h2>
            <p>In logistics, speed equals money. If a factory runs late on production, a junior supply chain manager might instinctively upgrade the ocean container to an Air Freight shipment to "save the deadline." They look at the invoice, see an extra $2,700 charge, and think it is an acceptable penalty to keep the customer happy.</p>
            
            <h3>Margin Destruction</h3>
            <p>What they fail to calculate is <strong>Margin Destruction</strong>. If you are shipping 500 units of a product that only makes $18 in profit per unit, your entire total profit for that shipment is $9,000.</p>
            <p>If you pay a $2,700 "Expedited Premium" to the shipping carrier, you just surrendered 30% of your total profit margin to FedEx. You are essentially working for the shipping company.</p>

            <h2 className="text-2xl font-bold mb-3">The "Break-Even Sales" Concept</h2>
            <p>This calculator translates that logistics penalty into a language the Sales team understands. If the expedited premium is $2,700, and your profit is $18 a unit, <strong>you have to sell 150 units for absolutely zero profit</strong> just to pay for the shipping upgrade.</p>
            <p>If the shipment only contains 300 units, you just wiped out half of your profit. In many cases, it is mathematically smarter to simply accept the late delivery penalty from the retailer than to pay the massive Air Freight premium.</p>
          </article>
          <FAQSection faqs={[
            { question: "When is expedited shipping worth it?", answer: "When the cost of a stockout is higher than the premium. If you are out of stock on Amazon during Black Friday, you might lose $50,000 in sales. Paying a $5,000 air freight premium to get inventory back in stock immediately is highly profitable." },
            { question: "Can I pass expedited costs to the customer?", answer: "In B2C e-commerce, yes (e.g., charging $25 for Overnight Shipping at checkout). In B2B wholesale, almost never, unless the retailer specifically requested the rush and agreed to pay the freight terms in writing." },
            { question: "What is an Expedite Broker?", answer: "A specialized freight broker that handles emergency shipments (like a broken machine part shutting down a factory). They use dedicated 'Hot Shot' trucks or exclusive air charters, and they are incredibly expensive." },
          ]} pageUrl="https://racira.com/calculator/expedited-shipping-cost-premium-calculator" />
          <PopularCalculators exclude="/calculator/expedited-shipping-cost-premium-calculator" />
        </div>
      </div>
    </>
  );
}
