"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Truck, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FreightRatioResults {
  freightCost: number;
  revenue: number;
  remainingRevenue: number;
  ratio: number;
  status: string;
  statusColor: string;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateRatio = (freightCost: number, revenue: number): FreightRatioResults => {
  const ratio = revenue > 0 ? (freightCost / revenue) * 100 : 0;
  const remainingRevenue = Math.max(0, revenue - freightCost);
  const overspend = Math.max(0, freightCost - revenue);

  let status = "";
  let statusColor = "";
  
  if (ratio > 100) {
    status = "Critical (Operating at Loss)";
    statusColor = "text-red-500";
  } else if (ratio > 20) {
    status = "High (Check Margins)";
    statusColor = "text-amber-500";
  } else if (ratio >= 5) {
    status = "Healthy / Average";
    statusColor = "text-blue-500";
  } else if (ratio > 0) {
    status = "Excellent / Highly Optimized";
    statusColor = "text-emerald-500";
  } else {
    status = "No Data";
    statusColor = "text-muted-foreground";
  }

  const chartData = [
    { name: "Freight Expenses", value: freightCost, color: ratio > 20 ? "hsl(var(--destructive))" : "hsl(var(--primary))" },
    { name: "Remaining Revenue", value: remainingRevenue, color: "hsl(var(--muted))" },
  ];

  const summaryStats = [
    { label: "Freight to Revenue Ratio", value: `${ratio.toFixed(2)}%` },
    { label: "Total Freight Spend", value: `$${freightCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Gross Revenue", value: `$${revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Status", value: status.split(' ')[0] },
  ];

  const breakdown = [
    { label: "Total Gross Revenue", amount: `$${revenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Freight & Shipping Costs", amount: `-$${freightCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: ratio > 20 ? "text-red-500" : "text-amber-500" },
    overspend > 0 
      ? { label: "Revenue Deficit", amount: `-$${overspend.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500 font-bold" }
      : { label: "Revenue Remaining for Other COGS & Profit", amount: `$${remainingRevenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-foreground" },
    { label: "Freight to Revenue Ratio", amount: `${ratio.toFixed(2)}%`, isTotal: true, colorClass: statusColor + " font-bold" },
  ];

  return { freightCost, revenue, remainingRevenue, ratio, status, statusColor, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  freightCost: "150000",
  revenue: "2000000",
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

export default function FreightCostToRevenueRatioCalculator() {
  const [freightCost, setFreightCost] = useState(DEFAULTS.freightCost);
  const [revenue, setRevenue] = useState(DEFAULTS.revenue);
  
  const [results, setResults] = useState<FreightRatioResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateRatio(
      parseFloat(freightCost) || 0, 
      parseFloat(revenue) || 0
    ));
  };

  const handleReset = () => {
    setFreightCost(DEFAULTS.freightCost); setRevenue(DEFAULTS.revenue);
    setResults(calculateRatio(150000, 2000000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Freight Ratio Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Freight Cost to Revenue Ratio" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Freight Cost to Revenue Ratio Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Supply Chain Financials</h2>
            </div>
            
            <CompactInput id="fre" label="Total Freight & Shipping Costs" value={freightCost} onChange={setFreightCost} prefix="$" tooltip="Total annual or monthly spend on outbound/inbound logistics." />
            <CompactInput id="rev" label="Total Gross Revenue" value={revenue} onChange={setRevenue} prefix="$" tooltip="Total top-line revenue generated during the same time period." />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Evaluates logistics efficiency by determining exactly how many cents out of every earned dollar are spent purely on moving products.
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.ratio > 20 ? 'bg-red-500/10 border-red-500/30' : results.ratio <= 5 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Freight to Revenue Ratio
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.statusColor}`}>
                    {results.ratio.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Evaluation: <span className={`font-bold ${results.statusColor}`}>{results.status}</span>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Revenue Absorption</h3>
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
            <h2 className="text-2xl font-bold mb-3">What is the Freight Cost to Revenue Ratio?</h2>
            <p>The <strong>Freight Cost to Revenue Ratio</strong> is a key performance indicator (KPI) used in supply chain management and e-commerce. It measures exactly what percentage of your top-line sales is being consumed by logistics and shipping expenses.</p>
            <p>If a company has a ratio of 10%, it means that for every $100 of product sold, $10 is spent purely on moving that product through the supply chain.</p>
            
            <h3>Why is this Metric Critical?</h3>
            <p>During times of inflation, rising fuel costs, or supply chain disruptions (like port closures), freight costs can skyrocket. If a business does not monitor this ratio, skyrocketing shipping costs will silently eat away their profit margins, resulting in a situation where revenue goes up but net profit goes down.</p>

            <h2 className="text-2xl font-bold mb-3">Industry Benchmarks</h2>
            <p>What is a "good" ratio? It depends heavily on the industry and the physical nature of the product:</p>
            <ul>
              <li><strong>High-Value, Lightweight Goods (Electronics, Jewelry):</strong> Typically under 5%. A $1,000 smartphone is very cheap to ship relative to its price.</li>
              <li><strong>General Retail & E-Commerce (Apparel, Home Goods):</strong> Usually ranges from 8% to 15%.</li>
              <li><strong>Heavy, Low-Value Goods (Furniture, Building Materials):</strong> Can easily exceed 20%. Shipping a $50 bag of cement costs almost as much as the product itself.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">How to Improve Your Ratio</h2>
            <p>If your ratio is creeping too high, you have three primary levers to pull:</p>
            <ol>
              <li><strong>Renegotiate Carrier Rates:</strong> Leverage your shipping volume to negotiate better dimensional weight (DIM) divisors or flat-rate pricing with FedEx, UPS, or LTL carriers.</li>
              <li><strong>Optimize Packaging:</strong> Carriers charge by the amount of space a box takes up in a truck, not just its weight. Reducing box sizes or eliminating excess void-fill can drastically reduce shipping costs.</li>
              <li><strong>Raise Product Prices:</strong> If shipping costs cannot be reduced, the only way to fix the ratio is to raise the top-line revenue by increasing prices or implementing shipping surcharges for customers.</li>
            </ol>
          </section>
          <FAQSection faqs={[
            { question: "Should I include inbound or outbound freight?", answer: "Usually, this metric includes BOTH inbound freight (bringing raw materials or inventory to your warehouse) and outbound freight (shipping to the final customer). However, some supply chain managers track 'Outbound Freight to Revenue' as a separate, more granular metric." },
            { question: "Does offering 'Free Shipping' ruin this ratio?", answer: "Yes, if it is poorly managed. 'Free Shipping' is a marketing tactic, not a logistics reality. You must pay the carrier. If you offer free shipping, you must bake the average freight cost into the base retail price of your products to maintain a healthy ratio." },
            { question: "Is warehouse labor included in this cost?", answer: "Generally, no. This ratio isolates transportation (carrier fees, fuel surcharges, duties/customs). Warehouse labor, rent, and software are tracked under a separate metric called 'Fulfillment Cost Per Order'." },
          ]} pageUrl="https://racira.com/calculator/freight-cost-to-revenue-ratio-calculator" />
          <PopularCalculators exclude="/calculator/freight-cost-to-revenue-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
