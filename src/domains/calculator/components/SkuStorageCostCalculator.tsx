"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Package, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface StorageResults {
  skus: number;
  unitsPerSku: number;
  unitsPerPallet: number;
  palletFee: number;
  
  totalUnits: number;
  perfectPallets: number;
  actualPallets: number;
  honeycombPallets: number;
  
  monthlyStorage: number;
  honeycombPenalty: number;
  
  chartData: { name: string; pallets: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateStorage = (
  skus: number, unitsPerSku: number, 
  unitsPerPallet: number, palletFee: number
): StorageResults => {
  
  const totalUnits = skus * unitsPerSku;
  
  // Theoretical minimum pallets if we mixed everything
  const perfectPallets = unitsPerPallet > 0 ? totalUnits / unitsPerPallet : 0;
  
  // Actual pallets (Because 3PLs generally do not mix SKUs in a pallet location, we round up per SKU)
  const palletsPerSku = unitsPerPallet > 0 ? Math.ceil(unitsPerSku / unitsPerPallet) : 0;
  const actualPallets = palletsPerSku * skus;
  
  // The difference is the honeycomb loss
  const honeycombPallets = Math.max(0, actualPallets - perfectPallets);
  
  const monthlyStorage = actualPallets * palletFee;
  const honeycombPenalty = honeycombPallets * palletFee;

  const chartData = [
    { name: "Efficient Storage", pallets: perfectPallets },
    { name: "Honeycomb Loss (Empty Space)", pallets: honeycombPallets },
  ];

  const summaryStats = [
    { label: "Total Billed Pallets", value: actualPallets.toLocaleString() },
    { label: "Monthly Storage Bill", value: `$${monthlyStorage.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Units Stored", value: totalUnits.toLocaleString() },
    { label: "Honeycomb Penalty", value: `$${honeycombPenalty.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: `Total Physical Inventory`, amount: `${totalUnits.toLocaleString()} units`, colorClass: "text-muted-foreground" },
    { label: `Pallets Required Per SKU`, amount: `${palletsPerSku.toLocaleString()} pallets/SKU`, colorClass: "text-blue-600" },
    { label: `Total Billed Pallet Positions`, amount: `${actualPallets.toLocaleString()} positions`, colorClass: "text-amber-600 font-bold" },
    { label: `Total Monthly 3PL Storage Bill`, amount: `$${monthlyStorage.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
    { label: `Lost to 'Honeycomb Effect'`, amount: `-$${honeycombPenalty.toLocaleString("en-US", { maximumFractionDigits: 2 })} / mo`, isTotal: true, colorClass: "text-red-500 font-bold text-[15px]" },
  ];

  return { skus, unitsPerSku, unitsPerPallet, palletFee, totalUnits, perfectPallets, actualPallets, honeycombPallets, monthlyStorage, honeycombPenalty, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  skus: "150",
  unitsPerSku: "250",
  unitsPerPallet: "200", // e.g. a box of 10, 20 boxes a pallet
  palletFee: "25",
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

export default function SkuStorageCostCalculator() {
  const [skus, setSkus] = useState(DEFAULTS.skus);
  const [unitsPerSku, setUnitsPerSku] = useState(DEFAULTS.unitsPerSku);
  const [unitsPerPallet, setUnitsPerPallet] = useState(DEFAULTS.unitsPerPallet);
  const [palletFee, setPalletFee] = useState(DEFAULTS.palletFee);
  
  const [results, setResults] = useState<StorageResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateStorage(
      parseFloat(skus) || 0, parseFloat(unitsPerSku) || 0,
      parseFloat(unitsPerPallet) || 0, parseFloat(palletFee) || 0
    ));
  };

  const handleReset = () => {
    setSkus(DEFAULTS.skus); setUnitsPerSku(DEFAULTS.unitsPerSku);
    setUnitsPerPallet(DEFAULTS.unitsPerPallet); setPalletFee(DEFAULTS.palletFee);
    setResults(calculateStorage(150, 250, 200, 25));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>SKU Storage Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">Pallet Utilization</p>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">Pallets Billed:</span>
            <span style={{ color: payload[0].fill }}>{payload[0].value.toLocaleString(undefined, {maximumFractionDigits:1})}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "SKU Storage Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SKU Storage & Honeycomb Loss Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Inventory Profile</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="sku" label="Active SKUs" value={skus} onChange={setSkus} tooltip="Number of unique items, colors, or sizes you carry." />
              <CompactInput id="unt" label="Avg Units per SKU" value={unitsPerSku} onChange={setUnitsPerSku} tooltip="How many units of each SKU do you have in stock right now?" />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">3PL Storage Terms</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="pal" label="Units per Pallet" value={unitsPerPallet} onChange={setUnitsPerPallet} tooltip="How many units fit perfectly onto one standard 48x40 pallet?" />
              <CompactInput id="fee" label="Monthly Storage Fee" value={palletFee} onChange={setPalletFee} prefix="$" suffix="/pallet" tooltip="What your warehouse charges per pallet position per month." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-primary/10 border border-primary/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>Warehouses do not mix different SKUs on the same pallet. If you have 20 units of a SKU, and a pallet holds 100, you are still billed for 1 full pallet. This creates massive storage waste known as the <strong>Honeycomb Effect</strong>.</p>
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
                    Total Monthly Storage Bill
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-primary">
                    ${results.monthlyStorage.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    You are being billed for <span className="font-bold text-foreground">{results.actualPallets.toLocaleString()} Pallet Positions</span>.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Inventory Breakdown</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">The Honeycomb Effect</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                          <Bar dataKey="pallets" radius={[0, 4, 4, 0]} barSize={30}>
                            <Cell fill="hsl(var(--blue-500))" />
                            <Cell fill="hsl(var(--red-500))" />
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is the Honeycomb Effect?</h2>
            <p>In warehouse logistics, the <strong>Honeycomb Effect</strong> refers to the empty space that cannot be utilized due to operational constraints—specifically the rule that you cannot mix different SKUs in the same storage bin or pallet location.</p>
            
            <h3>Why Do 3PLs Bill Like This?</h3>
            <p>If you have a red shirt and a blue shirt, the warehouse cannot put them on the same pallet. If they did, the pickers would constantly grab the wrong color, driving up error rates. Therefore, every unique SKU must have its own dedicated storage location.</p>
            <p>If a pallet holds 200 shirts, and you have 150 SKUs, but you only have 25 units left of each SKU... you are now paying a full $25 monthly pallet fee for 150 different pallets, even though every pallet is 85% empty.</p>

            <h2 className="text-2xl font-bold mb-3">SKU Proliferation Will Bankrupt You</h2>
            <p><strong>SKU Proliferation</strong> is the act of endlessly adding new colors, sizes, and variations to your catalog to chase revenue. The sales team loves it. The logistics team hates it.</p>
            <p>As you add SKUs, your overall inventory volume might stay the same, but your physical footprint in the warehouse explodes because of the honeycomb effect. This calculator visualizes that exact financial penalty. If you have too many slow-moving SKUs, the monthly storage bill will consume all of the profit.</p>
          </section>
          <FAQSection faqs={[
            { question: "How can I avoid Honeycomb storage fees?", answer: "Move slow-moving SKUs from 'Pallet Storage' into 'Bin Storage'. 3PLs will often charge $25 for a pallet, but only $2.50 for a small bin on a shelf. Do not store 12 units on a pallet." },
            { question: "What is SKU Rationalization?", answer: "The process of ruthlessly cutting the bottom 20% of your products that barely sell. Dropping dead SKUs instantly reduces your honeycomb waste and lowers your 3PL bill." },
            { question: "Do Amazon FBA fees work like this?", answer: "No. Amazon FBA charges strictly by the cubic foot of the item, not by the pallet position. They use highly advanced chaotic storage algorithms to mix SKUs safely, which is why their storage is highly efficient (but their fulfillment fees are higher)." },
          ]} pageUrl="https://racira.com/calculator/sku-storage-cost-calculator" />
          <PopularCalculators exclude="/calculator/sku-storage-cost-calculator" />
        </div>
      </div>
    </>
  );
}
