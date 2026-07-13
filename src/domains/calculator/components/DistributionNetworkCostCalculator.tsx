"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, MapPin, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface NetworkResults {
  numDCs: number;
  rentPerDC: number;
  laborPerDC: number;
  inventoryPerDC: number;
  totalOutboundFreight: number;
  
  totalRent: number;
  totalLabor: number;
  totalInventory: number;
  totalFixed: number;
  
  totalNetworkCost: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateNetwork = (
  numDCs: number, rentPerDC: number, laborPerDC: number, 
  inventoryPerDC: number, totalOutboundFreight: number
): NetworkResults => {
  
  const totalRent = numDCs * rentPerDC;
  const totalLabor = numDCs * laborPerDC;
  const totalInventory = numDCs * inventoryPerDC;
  
  const totalFixed = totalRent + totalLabor + totalInventory;
  const totalNetworkCost = totalFixed + totalOutboundFreight;

  const chartData = [
    { name: "Warehouse Rent & Utilities", value: totalRent, color: "hsl(var(--muted-foreground))" },
    { name: "Warehouse Labor", value: totalLabor, color: "hsl(var(--blue-500))" },
    { name: "Inventory Carrying Cost", value: totalInventory, color: "hsl(var(--amber-500))" },
    { name: "Outbound Freight (Shipping)", value: totalOutboundFreight, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Total Network Cost", value: `$${totalNetworkCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Active Nodes", value: `${numDCs} DCs` },
    { label: "Total Fixed Overhead", value: `$${totalFixed.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Freight Expense", value: `$${totalOutboundFreight.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: `Rent & Utilities (${numDCs} nodes × $${rentPerDC.toLocaleString()})`, amount: `$${totalRent.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: `Management & Labor (${numDCs} nodes × $${laborPerDC.toLocaleString()})`, amount: `$${totalLabor.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-600" },
    { label: `Inventory Carrying Cost (${numDCs} nodes × $${inventoryPerDC.toLocaleString()})`, amount: `$${totalInventory.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Total Network Outbound Freight", amount: `$${totalOutboundFreight.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary font-bold" },
    { label: "Total Monthly Logistics Cost", amount: `$${totalNetworkCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
  ];

  return { numDCs, rentPerDC, laborPerDC, inventoryPerDC, totalOutboundFreight, totalRent, totalLabor, totalInventory, totalFixed, totalNetworkCost, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  numDCs: "3",
  rentPerDC: "25000",
  laborPerDC: "45000",
  inventoryPerDC: "12000",
  totalOutboundFreight: "185000",
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

export default function DistributionNetworkCostCalculator() {
  const [numDCs, setNumDCs] = useState(DEFAULTS.numDCs);
  const [rentPerDC, setRentPerDC] = useState(DEFAULTS.rentPerDC);
  const [laborPerDC, setLaborPerDC] = useState(DEFAULTS.laborPerDC);
  const [inventoryPerDC, setInventoryPerDC] = useState(DEFAULTS.inventoryPerDC);
  const [totalOutboundFreight, setTotalOutboundFreight] = useState(DEFAULTS.totalOutboundFreight);
  
  const [results, setResults] = useState<NetworkResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateNetwork(
      parseFloat(numDCs) || 0,
      parseFloat(rentPerDC) || 0, parseFloat(laborPerDC) || 0,
      parseFloat(inventoryPerDC) || 0, parseFloat(totalOutboundFreight) || 0
    ));
  };

  const handleReset = () => {
    setNumDCs(DEFAULTS.numDCs); setRentPerDC(DEFAULTS.rentPerDC);
    setLaborPerDC(DEFAULTS.laborPerDC); setInventoryPerDC(DEFAULTS.inventoryPerDC);
    setTotalOutboundFreight(DEFAULTS.totalOutboundFreight);
    setResults(calculateNetwork(3, 25000, 45000, 12000, 185000));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Network Node Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Distribution Network Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Distribution Network Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Network Size</h2>
            </div>
            
            <CompactInput id="ndc" label="Number of Active Nodes (DCs)" value={numDCs} onChange={setNumDCs} tooltip="How many distribution centers or 3PL warehouses do you have active?" />
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">Average Node Overhead (Monthly)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rnt" label="Avg Rent & Utilities" value={rentPerDC} onChange={setRentPerDC} prefix="$" tooltip="Average monthly lease and utility cost per building." />
              <CompactInput id="lab" label="Avg Labor Cost" value={laborPerDC} onChange={setLaborPerDC} prefix="$" tooltip="Average monthly warehouse payroll per building." />
            </div>

            <CompactInput id="inv" label="Avg Inventory Carrying Cost" value={inventoryPerDC} onChange={setInventoryPerDC} prefix="$" tooltip="The monthly capital cost of holding duplicate safety stock at each location." />

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-blue-500" />
              <h2 className="text-2xl font-bold mb-3">Total Network Outbound</h2>
            </div>

            <CompactInput id="out" label="Total Outbound Freight" value={totalOutboundFreight} onChange={setTotalOutboundFreight} prefix="$" tooltip="Your total monthly UPS/FedEx/LTL bill across the entire network." />

            <div className="p-3 mt-1 rounded-lg bg-primary/10 border border-primary/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>Model the fundamental supply chain trade-off: Adding more warehouses lowers your outbound freight costs, but multiplies your fixed rent and duplicate inventory costs.</p>
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
                    Total Monthly Network Cost
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-primary">
                    ${results.totalNetworkCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Operating a <span className="font-bold text-foreground">{results.numDCs} node</span> distribution network.
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Network Expense Mix</h3>
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
            <h2 className="text-2xl font-bold mb-3">The Supply Chain Network Trade-Off</h2>
            <p>Designing a distribution network is a delicate balancing act between two opposing forces: <strong>Outbound Freight Costs</strong> and <strong>Fixed Overhead Costs</strong>.</p>
            
            <h3>1 Node Strategy (Centralized)</h3>
            <p>If you have one giant warehouse in Kansas, your fixed overhead is incredibly low. You only pay rent for one building and you only need one management team. <strong>The problem:</strong> Shipping a package from Kansas to California is expensive (high shipping zones) and slow. Your outbound freight bill will be massive.</p>

            <h3>3 Node Strategy (Decentralized)</h3>
            <p>To reduce shipping costs and offer "2-Day Delivery", you open a warehouse in Nevada, one in Ohio, and one in Texas. Now, you are much closer to your customers. Your outbound freight bill drops by 35%. <strong>The problem:</strong> You are now paying rent for three buildings. More importantly, you are carrying duplicate "Safety Stock" inventory at three different locations, tying up massive amounts of capital.</p>
            
            <h2 className="text-2xl font-bold mb-3">When Does it Make Sense to Expand?</h2>
            <p>This calculator allows you to model those scenarios. You should only add a new Distribution Center (DC) to your network if the projected savings in <strong>Outbound Freight</strong> are greater than the new <strong>Fixed Overhead + Inventory Cost</strong> of the new facility.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is Inventory Carrying Cost?", answer: "It is the financial cost of holding inventory. It includes the cost of capital (interest on loans used to buy the goods), insurance, taxes, and obsolescence risk. Usually calculated as 15% to 25% of inventory value annually." },
            { question: "Why do more DCs increase inventory?", answer: "Because of 'Safety Stock'. If you have 1 DC, you might need 1,000 units of a shirt to absorb demand spikes. If you have 3 DCs, you can't perfectly predict which DC will get the orders, so you might need 600 units at each DC (1,800 total) to prevent stockouts." },
            { question: "Does Amazon have the optimal network?", answer: "Amazon has an incredibly decentralized network with hundreds of nodes, optimized almost purely for speed rather than cost. For a normal business without Amazon's volume, copying their network would lead to instant bankruptcy due to fixed overhead." },
          ]} pageUrl="https://racira.com/calculator/distribution-network-cost-calculator" />
          <PopularCalculators exclude="/calculator/distribution-network-cost-calculator" />
        </div>
      </div>
    </>
  );
}
