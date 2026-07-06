"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Package, Printer, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ShippingResults {
  declaredValue: number;
  estimatedCost: number;
  totalProtectedValue: number;
  carrierRatePer100: number;
  freeCoverage: number;
  chargeableValue: number;
  chartData: { carrier: string; cost: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateShippingInsurance = (value: number, carrier: string, destination: string, type: string): ShippingResults => {
  let freeCoverage = 100;
  let baseRatePer100 = 0;

  if (carrier === "usps") {
    baseRatePer100 = 1.65;
  } else if (carrier === "fedex_ups") {
    baseRatePer100 = 1.50;
  } else if (carrier === "third_party") {
    freeCoverage = 0;
    baseRatePer100 = 0.80;
  }

  // Modifiers
  if (destination === "international") baseRatePer100 *= 1.5;
  if (type === "fragile") baseRatePer100 *= 1.25;

  const chargeableValue = Math.max(0, value - freeCoverage);
  const unitsOf100 = Math.ceil(chargeableValue / 100);
  
  // Specific minimums (simplified for the calculator)
  let estimatedCost = unitsOf100 * baseRatePer100;
  if (chargeableValue > 0 && estimatedCost < 1.50) estimatedCost = 1.50;

  // Chart Data: Compare the 3 providers
  const getCostForCarrier = (c: string) => {
    let r = c === "USPS" ? 1.65 : c === "FedEx/UPS" ? 1.50 : 0.80;
    let f = c === "Third-Party" ? 0 : 100;
    if (destination === "international") r *= 1.5;
    if (type === "fragile") r *= 1.25;
    const cv = Math.max(0, value - f);
    return Math.max(cv > 0 ? 1.5 : 0, Math.ceil(cv / 100) * r);
  };

  const chartData = [
    { carrier: "Third-Party", cost: getCostForCarrier("Third-Party") },
    { carrier: "FedEx/UPS", cost: getCostForCarrier("FedEx/UPS") },
    { carrier: "USPS", cost: getCostForCarrier("USPS") },
  ];

  const summaryStats = [
    { label: "Declared Value", value: `$${value.toLocaleString()}` },
    { label: "Estimated Cost", value: `$${estimatedCost.toFixed(2)}` },
    { label: "Carrier Included", value: `$${freeCoverage}` },
    { label: "Cost Rate", value: `$${baseRatePer100.toFixed(2)} per $100` },
  ];

  const breakdown = [
    { label: "Total Declared Value", amount: `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Carrier Included Coverage", amount: `-$${freeCoverage.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Chargeable Value", amount: `$${chargeableValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Rate (per $100 or fraction)`, amount: `$${baseRatePer100.toFixed(2)}` },
    { label: "Units of $100 Billed", amount: `${unitsOf100}` },
    { label: "Estimated Insurance Premium", amount: `$${estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true },
  ];

  return { declaredValue: value, estimatedCost, totalProtectedValue: value, carrierRatePer100: baseRatePer100, freeCoverage, chargeableValue, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  value: "500",
  carrier: "usps",
  destination: "domestic",
  type: "standard"
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

export default function ShippingInsuranceCostCalculator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [carrier, setCarrier] = useState(DEFAULTS.carrier);
  const [destination, setDestination] = useState(DEFAULTS.destination);
  const [type, setType] = useState(DEFAULTS.type);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [results, setResults] = useState<ShippingResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateShippingInsurance(parseFloat(value) || 0, carrier, destination, type));
  };

  const handleReset = () => {
    setValue(DEFAULTS.value); setCarrier(DEFAULTS.carrier); setDestination(DEFAULTS.destination); setType(DEFAULTS.type); setShowAdvanced(false);
    setResults(calculateShippingInsurance(500, "usps", "domestic", "standard"));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Shipping Insurance Est</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.carrier}:</span>
          <span className="text-foreground">${payload[0].value.toFixed(2)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Shipping Insurance Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Shipping Insurance Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Package Details</h2>
            </div>
            
            <CompactInput id="val" label="Declared Package Value" value={value} onChange={setValue} prefix="$" />
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1.5">Primary Carrier</label>
              <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="usps">USPS (Postal Service)</option>
                <option value="fedex_ups">FedEx / UPS</option>
                <option value="third_party">Third-Party (e.g. Shipsurance)</option>
              </select>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Risk Modifiers <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1.5">Destination</label>
                    <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="domestic">Domestic (USA)</option>
                      <option value="international">International (+50% Risk)</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1.5">Package Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="standard">Standard Goods</option>
                      <option value="fragile">High-Risk / Fragile (+25% Risk)</option>
                    </select>
                  </div>
                </div>
              )}
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
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-emerald-500/10 border-emerald-500/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Estimated Insurance Premium
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    ${results.estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Total Protected Value: <span className="font-bold text-foreground">${results.totalProtectedValue.toLocaleString()}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Premium Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[14px] py-3 px-3">{item.label}</td>
                            <td className={`text-[14px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Carrier Price Comparison</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="carrier" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.carrier === (carrier === "usps" ? "USPS" : carrier === "fedex_ups" ? "FedEx/UPS" : "Third-Party") ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Is Shipping Insurance Calculated?</h2>
            <p>Shipping insurance is designed to protect merchants and individuals from financial loss if a package is damaged, lost, or stolen in transit. The cost of this insurance is primarily based on the <strong>Declared Value</strong> of the goods, the chosen carrier, and the destination.</p>
            
            <h3>Carrier "Free" Coverage</h3>
            <p>Major domestic carriers in the United States (USPS, FedEx, and UPS) typically include up to $100 of liability coverage for free on their standard priority or expedited services. If your item is worth $100 or less, you usually do not need to purchase additional insurance. However, if your item is worth $500, you are only charged insurance on the remaining $400 of value.</p>
            
            <h3>Carrier vs. Third-Party Insurance</h3>
            <ul>
              <li><strong>Direct Carriers (USPS, FedEx, UPS):</strong> Carriers charge in increments of $100. Rates hover around $1.00 to $1.65 per $100 of value. Filing claims directly through carriers can sometimes be a lengthy bureaucratic process.</li>
              <li><strong>Third-Party Insurers (Shipsurance, U-PIC, etc.):</strong> E-commerce platforms (like Shopify or ShipStation) often offer third-party insurance. This is usually significantly cheaper (often $0.80 per $100 or less) and claims are processed much faster. However, third-party insurance does not utilize the carrier's built-in $100 free coverage; you insure the full amount from dollar zero.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">When Should You Buy Shipping Insurance?</h2>
            <p>Shipping insurance is highly recommended if the cost of replacing the item would significantly impact your business margin or personal finances. As a rule of thumb for e-commerce businesses: if your profit margin is tight and the item value is over $100, insure it. Many high-volume shippers choose to "self-insure" low-value items by simply refunding the customer out of pocket when a package is lost, rather than paying an insurance premium on every single box.</p>
          </article>
          <FAQSection faqs={[
            { question: "Is my package automatically insured?", answer: "Usually, yes, up to $100. USPS Priority Mail, FedEx Ground, and UPS Ground all include up to $100 of default liability coverage. USPS First Class (now Ground Advantage) also includes up to $100. If your item is worth more, you must purchase declared value coverage." },
            { question: "Does shipping insurance cover porch piracy (stolen after delivery)?", answer: "Typically, NO. Carrier insurance only covers the package while it is in their possession (in transit). Once the tracking marks it as 'Delivered,' carrier liability ends. If you are worried about theft after delivery, require a Signature Confirmation." },
            { question: "What is 'Declared Value' vs 'Insurance'?", answer: "Technically, FedEx and UPS do not sell 'insurance'; they sell 'Declared Value.' This raises their financial liability if they lose or damage the package. It functions exactly like insurance for the shipper, but it is a legal distinction that limits their liability to the carrier's specific terms and conditions." },
            { question: "Are international shipments more expensive to insure?", answer: "Yes. Due to the increased handoffs between different national postal services and customs agencies, the risk of loss or damage is higher. Most third-party insurers charge a higher premium for international shipments, and some countries are completely excluded from coverage." },
          ]} pageUrl="https://racira.com/calculator/shipping-insurance-cost-calculator" />
          <PopularCalculators exclude="/calculator/shipping-insurance-cost-calculator" />
        </div>
      </div>
    </>
  );
}
