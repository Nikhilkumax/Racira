"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Box, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface UnitLoadResults {
  palletCost: number;
  wrapCost: number;
  dunnageCost: number;
  laborCost: number;
  unitsPerPallet: number;
  
  totalMaterials: number;
  totalPalletCost: number;
  costPerUnit: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateUnitLoad = (
  palletCost: number, wrapCost: number, dunnageCost: number, 
  laborCost: number, unitsPerPallet: number
): UnitLoadResults => {
  
  const totalMaterials = palletCost + wrapCost + dunnageCost;
  const totalPalletCost = totalMaterials + laborCost;
  
  const costPerUnit = unitsPerPallet > 0 ? totalPalletCost / unitsPerPallet : 0;

  const chartData = [
    { name: "Pallet Base", value: palletCost, color: "hsl(var(--amber-700))" },
    { name: "Shrinkwrap", value: wrapCost, color: "hsl(var(--blue-400))" },
    { name: "Straps / Dunnage", value: dunnageCost, color: "hsl(var(--orange-500))" },
    { name: "Warehouse Labor", value: laborCost, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Cost Per Unit", value: `$${costPerUnit.toFixed(3)}` },
    { label: "Total Unit Load Cost", value: `$${totalPalletCost.toFixed(2)}` },
    { label: "Material Cost", value: `$${totalMaterials.toFixed(2)}` },
    { label: "Units Per Pallet", value: unitsPerPallet.toLocaleString() },
  ];

  const breakdown = [
    { label: "Wooden / Plastic Pallet Base", amount: `$${palletCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-700" },
    { label: "Stretch Wrap (Plastic)", amount: `$${wrapCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Corner Protectors & Strapping", amount: `$${dunnageCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-orange-600" },
    { label: "Warehouse Build Labor", amount: `$${laborCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Cost to Build 1 Unit Load", amount: `$${totalPalletCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
    { label: `Burden Added Per Unit (÷ ${unitsPerPallet})`, amount: `$${costPerUnit.toLocaleString("en-US", { maximumFractionDigits: 3 })}`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { palletCost, wrapCost, dunnageCost, laborCost, unitsPerPallet, totalMaterials, totalPalletCost, costPerUnit, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  palletCost: "16.50",
  wrapCost: "2.25",
  dunnageCost: "1.75",
  laborCost: "6.50",
  unitsPerPallet: "240",
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

export default function UnitLoadCostCalculator() {
  const [palletCost, setPalletCost] = useState(DEFAULTS.palletCost);
  const [wrapCost, setWrapCost] = useState(DEFAULTS.wrapCost);
  const [dunnageCost, setDunnageCost] = useState(DEFAULTS.dunnageCost);
  const [laborCost, setLaborCost] = useState(DEFAULTS.laborCost);
  const [unitsPerPallet, setUnitsPerPallet] = useState(DEFAULTS.unitsPerPallet);
  
  const [results, setResults] = useState<UnitLoadResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateUnitLoad(
      parseFloat(palletCost) || 0, parseFloat(wrapCost) || 0, 
      parseFloat(dunnageCost) || 0, parseFloat(laborCost) || 0, 
      parseFloat(unitsPerPallet) || 0
    ));
  };

  const handleReset = () => {
    setPalletCost(DEFAULTS.palletCost); setWrapCost(DEFAULTS.wrapCost); 
    setDunnageCost(DEFAULTS.dunnageCost); setLaborCost(DEFAULTS.laborCost); 
    setUnitsPerPallet(DEFAULTS.unitsPerPallet);
    setResults(calculateUnitLoad(16.50, 2.25, 1.75, 6.50, 240));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Unit Load Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Unit Load Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Unit Load (Pallet Build) Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Box className="h-5 w-5 text-amber-600" />
              <h2 className="text-2xl font-bold mb-3">Pallet Materials</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="pal" label="Pallet Cost" value={palletCost} onChange={setPalletCost} prefix="$" tooltip="Cost of one wooden GMA pallet or plastic pallet." />
              <CompactInput id="wrp" label="Stretch Wrap" value={wrapCost} onChange={setWrapCost} prefix="$" tooltip="Cost of the plastic film used to secure the load." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="dun" label="Dunnage / Straps" value={dunnageCost} onChange={setDunnageCost} prefix="$" tooltip="Cost of cardboard corner protectors, banding straps, or slip sheets." />
              <CompactInput id="lab" label="Build Labor" value={laborCost} onChange={setLaborCost} prefix="$" tooltip="Warehouse labor time translated into a dollar cost per pallet built." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Box className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Load Configuration</h2>
            </div>
            
            <CompactInput id="unt" label="Units per Pallet" value={unitsPerPallet} onChange={setUnitsPerPallet} tooltip="How many individual retail items are stacked on this single pallet?" />

            <div className="p-3 mt-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p>When you shift from e-commerce fulfillment (shipping single boxes) to B2B fulfillment (shipping pallets to retailers), you must account for the cost of building the "Unit Load."</p>
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
                    Cost Added Per Unit
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-primary">
                    ${results.costPerUnit.toFixed(3)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Total cost to build the pallet is <span className="font-bold text-foreground">${results.totalPalletCost.toFixed(2)}</span>.
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Pallet Expense Mix</h3>
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
            <h2 className="text-2xl font-bold mb-3">What is a Unit Load?</h2>
            <p>In supply chain logistics, a <strong>Unit Load</strong> is the standard configuration of a pallet. Instead of moving 240 individual boxes by hand, warehouse workers stack those 240 boxes onto a wooden pallet, wrap it in plastic, and strap it down. A forklift can now move all 240 items at once.</p>
            
            <h3>The Hidden Costs of Palletization</h3>
            <p>If you are a manufacturer selling wholesale to Walmart, Walmart will require you to ship your goods on specific types of pallets (often "Grade A" white wood or CHEP blue pallets). These materials are not free.</p>
            <p>During the COVID-19 pandemic, a severe lumber shortage caused the price of a standard 48x40 wooden pallet to skyrocket from $9 to over $25. This suddenly destroyed the profit margins of companies shipping cheap goods like bottled water, because the wood the water sat on cost more than the water itself.</p>

            <h2 className="text-2xl font-bold mb-3">Why Calculate Cost Per Unit?</h2>
            <p>If you sell high-value electronics and put $100,000 worth of laptops on a single pallet, a $27 pallet build cost is a negligible fraction of a penny per laptop.</p>
            <p>But if you sell concrete landscaping bricks that cost $2.00 each, and you can only fit 50 bricks on a pallet due to weight limits, that $27 pallet build adds a massive <strong>$0.54 markup</strong> to every single brick. You must calculate this and build it into your wholesale pricing, or you will lose money on every B2B order.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is Dunnage?", answer: "Dunnage refers to the materials used to protect the cargo during transport. For pallets, this usually means cardboard corner protectors, slip sheets placed between layers, or inflatable air bags placed between pallets inside the truck." },
            { question: "Should I buy a pallet wrapping machine?", answer: "If you build more than 15 pallets a day, yes. A semi-automatic stretch wrapper costs about $5,000. It dramatically reduces labor time and, more importantly, uses 40% less plastic wrap than manual hand-wrapping because the machine stretches the film to its maximum yield." },
            { question: "What is a CHEP pallet?", answer: "CHEP (the blue pallets) and PECO (the red pallets) operate on a rental pool system. You do not buy them; you rent them and pay an issue fee and a daily rental fee until they arrive at the retailer's network." },
          ]} pageUrl="https://racira.com/calculator/unit-load-cost-calculator" />
          <PopularCalculators exclude="/calculator/unit-load-cost-calculator" />
        </div>
      </div>
    </>
  );
}
