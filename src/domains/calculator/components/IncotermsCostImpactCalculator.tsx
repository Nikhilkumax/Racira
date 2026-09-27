"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Globe2, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

type IncotermType = "EXW" | "FOB" | "CIF" | "DDP";

interface IncotermResults {
  goods: number;
  originInland: number;
  originPort: number;
  mainFreight: number;
  insurance: number;
  destPort: number;
  destInland: number;
  incoterm: IncotermType;
  buyerCost: number;
  sellerCost: number;
  totalLogistics: number;
  chartData: { name: string; Buyer: number; Seller: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; responsible: string; colorClass?: string }[];
}

const calculateIncoterms = (
  goods: number, originInland: number, originPort: number, mainFreight: number, 
  insurance: number, destPort: number, destInland: number, incoterm: IncotermType
): IncotermResults => {
  
  let buyerLogistics = 0;
  let sellerLogistics = 0;

  // The cost of goods is always paid by the buyer to the seller, but for logistics mapping, 
  // we map who directly pays the freight forwarder/customs for each leg.
  
  const rules = {
    EXW: { originInland: "Buyer", originPort: "Buyer", mainFreight: "Buyer", insurance: "Buyer", destPort: "Buyer", destInland: "Buyer" },
    FOB: { originInland: "Seller", originPort: "Seller", mainFreight: "Buyer", insurance: "Buyer", destPort: "Buyer", destInland: "Buyer" },
    CIF: { originInland: "Seller", originPort: "Seller", mainFreight: "Seller", insurance: "Seller", destPort: "Buyer", destInland: "Buyer" },
    DDP: { originInland: "Seller", originPort: "Seller", mainFreight: "Seller", insurance: "Seller", destPort: "Seller", destInland: "Seller" },
  };

  const currentRules = rules[incoterm];

  buyerLogistics += currentRules.originInland === "Buyer" ? originInland : 0;
  sellerLogistics += currentRules.originInland === "Seller" ? originInland : 0;

  buyerLogistics += currentRules.originPort === "Buyer" ? originPort : 0;
  sellerLogistics += currentRules.originPort === "Seller" ? originPort : 0;

  buyerLogistics += currentRules.mainFreight === "Buyer" ? mainFreight : 0;
  sellerLogistics += currentRules.mainFreight === "Seller" ? mainFreight : 0;

  buyerLogistics += currentRules.insurance === "Buyer" ? insurance : 0;
  sellerLogistics += currentRules.insurance === "Seller" ? insurance : 0;

  buyerLogistics += currentRules.destPort === "Buyer" ? destPort : 0;
  sellerLogistics += currentRules.destPort === "Seller" ? destPort : 0;

  buyerLogistics += currentRules.destInland === "Buyer" ? destInland : 0;
  sellerLogistics += currentRules.destInland === "Seller" ? destInland : 0;

  const totalLogistics = buyerLogistics + sellerLogistics;

  const chartData = [
    { name: "Origin Inland", Buyer: currentRules.originInland === "Buyer" ? originInland : 0, Seller: currentRules.originInland === "Seller" ? originInland : 0 },
    { name: "Origin Port/Customs", Buyer: currentRules.originPort === "Buyer" ? originPort : 0, Seller: currentRules.originPort === "Seller" ? originPort : 0 },
    { name: "Main Freight", Buyer: currentRules.mainFreight === "Buyer" ? mainFreight : 0, Seller: currentRules.mainFreight === "Seller" ? mainFreight : 0 },
    { name: "Insurance", Buyer: currentRules.insurance === "Buyer" ? insurance : 0, Seller: currentRules.insurance === "Seller" ? insurance : 0 },
    { name: "Dest Port/Customs", Buyer: currentRules.destPort === "Buyer" ? destPort : 0, Seller: currentRules.destPort === "Seller" ? destPort : 0 },
    { name: "Dest Inland", Buyer: currentRules.destInland === "Buyer" ? destInland : 0, Seller: currentRules.destInland === "Seller" ? destInland : 0 },
  ];

  const summaryStats = [
    { label: "Selected Incoterm", value: incoterm },
    { label: "Buyer Logistics Cost", value: `$${buyerLogistics.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Seller Logistics Cost", value: `$${sellerLogistics.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Supply Chain Cost", value: `$${totalLogistics.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Origin Inland Transport (Truck to Port)", amount: `$${originInland.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, responsible: currentRules.originInland, colorClass: currentRules.originInland === "Buyer" ? "text-primary font-bold" : "text-amber-500 font-bold" },
    { label: "Origin Port Handling & Export Customs", amount: `$${originPort.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, responsible: currentRules.originPort, colorClass: currentRules.originPort === "Buyer" ? "text-primary font-bold" : "text-amber-500 font-bold" },
    { label: "Main International Freight (Ocean/Air)", amount: `$${mainFreight.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, responsible: currentRules.mainFreight, colorClass: currentRules.mainFreight === "Buyer" ? "text-primary font-bold" : "text-amber-500 font-bold" },
    { label: "Cargo Insurance Premium", amount: `$${insurance.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, responsible: currentRules.insurance, colorClass: currentRules.insurance === "Buyer" ? "text-primary font-bold" : "text-amber-500 font-bold" },
    { label: "Destination Port Handling & Import Duties", amount: `$${destPort.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, responsible: currentRules.destPort, colorClass: currentRules.destPort === "Buyer" ? "text-primary font-bold" : "text-amber-500 font-bold" },
    { label: "Destination Inland Transport (Port to Door)", amount: `$${destInland.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, responsible: currentRules.destInland, colorClass: currentRules.destInland === "Buyer" ? "text-primary font-bold" : "text-amber-500 font-bold" },
  ];

  return { goods, originInland, originPort, mainFreight, insurance, destPort, destInland, incoterm, buyerCost: buyerLogistics, sellerCost: sellerLogistics, totalLogistics, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  goods: "50000",
  originInland: "400",
  originPort: "350",
  mainFreight: "4500",
  insurance: "250",
  destPort: "1200",
  destInland: "800",
  incoterm: "FOB" as IncotermType
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

export default function IncotermsCostImpactCalculator() {
  const [goods, setGoods] = useState(DEFAULTS.goods);
  const [originInland, setOriginInland] = useState(DEFAULTS.originInland);
  const [originPort, setOriginPort] = useState(DEFAULTS.originPort);
  const [mainFreight, setMainFreight] = useState(DEFAULTS.mainFreight);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [destPort, setDestPort] = useState(DEFAULTS.destPort);
  const [destInland, setDestInland] = useState(DEFAULTS.destInland);
  const [incoterm, setIncoterm] = useState<IncotermType>(DEFAULTS.incoterm);
  
  const [results, setResults] = useState<IncotermResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateIncoterms(
      parseFloat(goods) || 0, 
      parseFloat(originInland) || 0,
      parseFloat(originPort) || 0,
      parseFloat(mainFreight) || 0,
      parseFloat(insurance) || 0,
      parseFloat(destPort) || 0,
      parseFloat(destInland) || 0,
      incoterm
    ));
  };

  const handleReset = () => {
    setGoods(DEFAULTS.goods); setOriginInland(DEFAULTS.originInland); setOriginPort(DEFAULTS.originPort); setMainFreight(DEFAULTS.mainFreight); setInsurance(DEFAULTS.insurance); setDestPort(DEFAULTS.destPort); setDestInland(DEFAULTS.destInland); setIncoterm("FOB");
    setResults(calculateIncoterms(50000, 400, 350, 4500, 250, 1200, 800, "FOB"));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []); // Auto-calculate when incoterm changes

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Incoterms Impact</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
                <span style={{ color: entry.fill }}>{entry.name} Pays:</span>
                <span>${entry.value.toLocaleString()}</span>
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Incoterms Cost Impact" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Incoterms Responsibility & Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label htmlFor="inco" className="flex items-center text-base font-bold text-foreground mb-2">Select Incoterm Agreement</label>
              <div className="grid grid-cols-4 gap-2">
                {["EXW", "FOB", "CIF", "DDP"].map((term) => (
                  <button 
                    key={term} 
                    onClick={() => setIncoterm(term as IncotermType)}
                    className={`h-10 rounded-md font-bold text-sm transition-colors border ${incoterm === term ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-secondary"}`}
                  >{term}</button>
                ))}
              </div>
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Globe2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Logistics Chain Costs</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="orig1" label="Origin Inland Freight" value={originInland} onChange={setOriginInland} prefix="$" tooltip="Cost to move goods from the seller's factory to the origin port." />
              <CompactInput id="orig2" label="Origin Port Handling" value={originPort} onChange={setOriginPort} prefix="$" tooltip="Export customs clearance and terminal handling charges (THC)." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="main" label="Main Freight (Ocean/Air)" value={mainFreight} onChange={setMainFreight} prefix="$" tooltip="The cost of the main international transport leg." />
              <CompactInput id="ins" label="Cargo Insurance" value={insurance} onChange={setInsurance} prefix="$" tooltip="Premium paid to insure the goods during transit." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="dest1" label="Dest. Port & Import Duty" value={destPort} onChange={setDestPort} prefix="$" tooltip="Import customs clearance, duties, and destination port fees." />
              <CompactInput id="dest2" label="Destination Inland" value={destInland} onChange={setDestInland} prefix="$" tooltip="Final delivery cost from the destination port to the buyer's door." />
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className={`grid grid-cols-2 gap-4`}>
                  <div className="rounded-lg p-5 relative bg-primary/10 border-l-4 border-primary">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Total Buyer Logistics Cost</div>
                    <div className="text-3xl font-bold tracking-tighter mb-2 text-primary">
                      ${results.buyerCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="rounded-lg p-5 relative bg-amber-500/10 border-l-4 border-amber-500">
                    <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-amber-600 transition-colors print:hidden" aria-label="Print Results">
                      <Printer className="h-4 w-4" />
                    </button>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Total Seller Logistics Cost</div>
                    <div className="text-3xl font-bold tracking-tighter mb-2 text-amber-600">
                      ${results.sellerCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
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
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Responsible</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.responsible}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Cost Distribution ({results.incoterm})</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                          
                          <Bar dataKey="Buyer" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Seller" stackId="a" fill="hsl(var(--amber-500))" radius={[0, 4, 4, 0]} />
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
            <h2 className="text-2xl font-bold mb-3">What are Incoterms?</h2>
            <p><strong>Incoterms</strong> (International Commercial Terms) are universal, pre-defined commercial rules published by the International Chamber of Commerce (ICC). They are universally used in international commercial transactions and procurement processes.</p>
            <p>A three-letter Incoterm clearly dictates two massive factors in international trade: <strong>Cost</strong> (who pays for which part of the journey) and <strong>Risk</strong> (at what exact geographic point the responsibility for lost/damaged cargo shifts from the seller to the buyer).</p>
            
            <h3>The Four Most Common Incoterms Explained</h3>
            <ul>
              <li><strong>EXW (Ex Works):</strong> Maximum responsibility for the Buyer. The seller simply leaves the goods at their factory door. The buyer must hire trucks, clear export customs, pay for ocean freight, and handle import duties.</li>
              <li><strong>FOB (Free On Board):</strong> The standard for Chinese manufacturing. The seller pays to truck the goods to the port and clear export customs. Once the goods are loaded onto the ship, all costs and risks transfer to the buyer.</li>
              <li><strong>CIF (Cost, Insurance, Freight):</strong> The seller pays for everything (including marine insurance) all the way up to the destination port. However, once the goods arrive at the destination port, the buyer must pay import duties and hire a truck for final delivery.</li>
              <li><strong>DDP (Delivered Duty Paid):</strong> Maximum responsibility for the Seller. The seller acts essentially like Amazon Prime—they handle all shipping, pay all import duties, and deliver the goods directly to the buyer's door.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why Your Freight Invoice May Vary</h2>
            <p>If you switch a contract from FOB to CIF, your supplier will increase the price of the goods. They aren't paying the freight out of the kindness of their heart; they are simply baking the freight cost into the commercial invoice.</p>
            <p>Many professional importers prefer <strong>FOB</strong> because it gives them total control over the main ocean freight. They can use their own trusted freight forwarders to negotiate better rates, rather than relying on the seller's forwarder (who may inflate the CIF price for extra profit).</p>
          </section>
          <FAQSection faqs={[
            { question: "Can I use FOB for Air Freight?", answer: "Technically, no. According to ICC rules, FOB is strictly for ocean/inland waterway transport. The equivalent term for air freight is FCA (Free Carrier). However, in practice, many businesses mistakenly use FOB for air freight anyway." },
            { question: "Why do sellers hate DDP?", answer: "Because under DDP, the seller is legally responsible for clearing customs in a foreign country (the buyer's country). This means the seller must deal with foreign tax laws, VAT/GST registration, and import tariffs, which is an administrative nightmare for most exporters." },
            { question: "Who pays for unloading the truck at the final destination?", answer: "Under almost all Incoterms (including DDP), the buyer is responsible for unloading the truck once it arrives at their facility, unless explicitly stated otherwise in the sales contract." },
          ]} pageUrl="https://racira.com/calculator/incoterms-cost-impact-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Incoterms Cost Impact Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Incoterms Cost Impact Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Incoterms Cost Impact Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Incoterms Cost Impact Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Incoterms Cost Impact Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/incoterms-cost-impact-calculator" />
        </div>
      </div>
    </>
  );
}
