"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Globe, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface ShippingResults {
  originDrayage: number;
  exportFees: number;
  mainFreight: number;
  destHandling: number;
  importDuties: number;
  destDrayage: number;
  
  originLegTotal: number;
  freightLegTotal: number;
  destLegTotal: number;
  
  totalShippingCost: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateShipping = (
  originDrayage: number, exportFees: number, 
  mainFreight: number, 
  destHandling: number, importDuties: number, destDrayage: number
): ShippingResults => {
  
  const originLegTotal = originDrayage + exportFees;
  const freightLegTotal = mainFreight;
  const destLegTotal = destHandling + importDuties + destDrayage;
  
  const totalShippingCost = originLegTotal + freightLegTotal + destLegTotal;

  const chartData = [
    { name: "Origin Logistics", value: originLegTotal, color: "hsl(var(--amber-500))" },
    { name: "Main Ocean/Air Freight", value: freightLegTotal, color: "hsl(var(--blue-500))" },
    { name: "Destination Logistics", value: destLegTotal, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Door-to-Door Cost", value: `$${totalShippingCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Origin Fees", value: `$${originLegTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Main Freight", value: `$${freightLegTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Destination Fees", value: `$${destLegTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Origin: Factory Pickup & Drayage", amount: `$${originDrayage.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Origin: Export Customs & Port THC", amount: `$${exportFees.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Main Leg: Ocean / Air Freight", amount: `$${mainFreight.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-600 font-bold" },
    { label: "Destination: Port THC & Handling", amount: `$${destHandling.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Destination: Import Duties & Taxes", amount: `$${importDuties.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Destination: Final Mile Delivery", amount: `$${destDrayage.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Door-to-Door Landed Cost", amount: `$${totalShippingCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
  ];

  return { originDrayage, exportFees, mainFreight, destHandling, importDuties, destDrayage, originLegTotal, freightLegTotal, destLegTotal, totalShippingCost, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  originDrayage: "450",
  exportFees: "300",
  mainFreight: "4200",
  destHandling: "550",
  importDuties: "2800",
  destDrayage: "800",
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

export default function InternationalShippingCostEstimator() {
  const [originDrayage, setOriginDrayage] = useState(DEFAULTS.originDrayage);
  const [exportFees, setExportFees] = useState(DEFAULTS.exportFees);
  const [mainFreight, setMainFreight] = useState(DEFAULTS.mainFreight);
  const [destHandling, setDestHandling] = useState(DEFAULTS.destHandling);
  const [importDuties, setImportDuties] = useState(DEFAULTS.importDuties);
  const [destDrayage, setDestDrayage] = useState(DEFAULTS.destDrayage);
  
  const [results, setResults] = useState<ShippingResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateShipping(
      parseFloat(originDrayage) || 0, parseFloat(exportFees) || 0,
      parseFloat(mainFreight) || 0,
      parseFloat(destHandling) || 0, parseFloat(importDuties) || 0, parseFloat(destDrayage) || 0
    ));
  };

  const handleReset = () => {
    setOriginDrayage(DEFAULTS.originDrayage); setExportFees(DEFAULTS.exportFees); setMainFreight(DEFAULTS.mainFreight);
    setDestHandling(DEFAULTS.destHandling); setImportDuties(DEFAULTS.importDuties); setDestDrayage(DEFAULTS.destDrayage);
    setResults(calculateShipping(450, 300, 4200, 550, 2800, 800));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>International Shipping Stack</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "International Shipping Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Door-to-Door International Shipping Estimator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">1. Origin Port (Export)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="odray" label="Factory Pickup" value={originDrayage} onChange={setOriginDrayage} prefix="$" tooltip="Cost to truck the container from the overseas factory to the departure port." />
              <CompactInput id="oexp" label="Export Customs" value={exportFees} onChange={setExportFees} prefix="$" tooltip="Origin customs clearance and Terminal Handling Charges (THC)." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-blue-500" />
              <h2 className="text-2xl font-bold mb-3">2. Main Freight Leg</h2>
            </div>
            
            <CompactInput id="mfre" label="Ocean / Air Freight Rate" value={mainFreight} onChange={setMainFreight} prefix="$" tooltip="The core cost of putting the box on a ship or airplane." />

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">3. Destination Port (Import)</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="dthc" label="Port THC" value={destHandling} onChange={setDestHandling} prefix="$" tooltip="Destination Terminal Handling Charges and broker fees." />
              <CompactInput id="ddut" label="Import Duties" value={importDuties} onChange={setImportDuties} prefix="$" tooltip="Taxes and tariffs paid to your local government (e.g., US CBP)." />
            </div>

            <CompactInput id="ddray" label="Final Mile Trucking" value={destDrayage} onChange={setDestDrayage} prefix="$" tooltip="Cost to truck the cleared container from the destination port to your warehouse." />

            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>Breaks down the three phases of global logistics to prevent "sticker shock" when the final forwarder invoice arrives.</p>
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
                    Total Door-to-Door Shipping Cost
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-primary">
                    ${results.totalShippingCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Does not include the commercial value of the goods.
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Cost Distribution by Leg</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis hide />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the International Shipping Stack</h2>
            <p>One of the biggest mistakes new importers make is looking up an "Ocean Freight Rate" from Shanghai to Los Angeles ($4,200), and assuming that is the total cost of logistics. In reality, moving a 40-foot steel container from a factory in China to a warehouse in Ohio involves three distinct phases, each with its own massive costs.</p>
            
            <h3>Phase 1: Origin Logistics</h3>
            <p>Before the cargo can ever see a ship, it must get to the port. You have to pay a local trucker to drive the empty container to the factory, wait for it to be loaded, and drive it to the port terminal. You also have to pay export customs clearance and terminal handling charges (THC) to the port authorities to lift the box via crane.</p>

            <h3>Phase 2: The Main Freight Leg</h3>
            <p>This is the core fee paid to the ocean carrier (e.g., Maersk or MSC) to physically sail the box across the ocean. It often includes a Bunker Adjustment Factor (BAF) which fluctuates with global fuel prices.</p>

            <h3>Phase 3: Destination Logistics & Duties</h3>
            <p>This is where "sticker shock" happens. Once the ship arrives, you must pay the destination port THC to unload it. You must pay a customs broker to clear it, and you must pay your government import duties and tariffs. Finally, you have to hire a domestic trucker to haul it out of the chaotic port (Drayage) and bring it to your final warehouse.</p>
            
            <h2 className="text-2xl font-bold mb-3">Why Use This Calculator?</h2>
            <p>This tool models a true <strong>Door-to-Door (D2D)</strong> scenario. If you are importing goods using EXW or FOB terms, you are responsible for multiple layers of this stack. Failing to account for destination drayage or import duties can completely wipe out your product's profit margin before it ever reaches your shelves.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is THC?", answer: "Terminal Handling Charges (THC) are fees levied by the port authority to physically move the container around the terminal yard using heavy machinery and cranes. You pay THC at both origin and destination." },
            { question: "What is Drayage?", answer: "Drayage is the specialized logistics niche of moving shipping containers over short distances, typically between the port terminal and a local rail yard or warehouse." },
            { question: "Are these costs fixed?", answer: "No. Ocean freight rates change weekly based on global supply and demand. Drayage rates spike during peak seasons (like before Christmas) due to severe truck driver shortages at the ports." },
          ]} pageUrl="https://racira.com/calculator/international-shipping-cost-estimator" />
          <PopularCalculators exclude="/calculator/international-shipping-cost-estimator" />
        </div>
      </div>
    </>
  );
}
