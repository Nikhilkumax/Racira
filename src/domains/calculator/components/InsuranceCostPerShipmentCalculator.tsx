"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, ShieldCheck, Printer, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface InsuranceResults {
  goodsValue: number;
  freightCost: number;
  markupAmount: number;
  totalInsuredValue: number;
  insurancePremium: number;
  totalCIFValue: number;
  chartData: { category: string; amount: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateInsurance = (goods: number, freight: number, markupPct: number, premiumRate: number): InsuranceResults => {
  // In international trade, standard practice is to insure for CIF + 10% (i.e. 110% of Cost + Freight)
  // Total Insured Value (TIV) = (Goods + Freight) * (1 + Markup/100)
  
  const baseValue = goods + freight;
  const markupAmount = baseValue * (markupPct / 100);
  const totalInsuredValue = baseValue + markupAmount;
  
  const insurancePremium = totalInsuredValue * (premiumRate / 100);
  
  // Total CIF = Cost + Insurance + Freight (does not include the markup in actual cost, only the premium)
  const totalCIFValue = goods + freight + insurancePremium;

  const chartData = [
    { category: "Goods Value", amount: goods, color: "hsl(var(--muted))" },
    { category: "Freight Cost", amount: freight, color: "hsl(var(--secondary))" },
    { category: "10% Markup", amount: markupAmount, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Insured Value (TIV)", value: `$${totalInsuredValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Insurance Premium", value: `$${insurancePremium.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Landed Cost", value: `$${totalCIFValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective Premium Rate", value: `${premiumRate.toFixed(2)}%` },
  ];

  const breakdown = [
    { label: "Commercial Value of Goods (C)", amount: `$${goods.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Freight & Shipping Cost (F)", amount: `$${freight.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Anticipated Profit Markup (${markupPct}%)`, amount: `$${markupAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Insured Value (TIV)", amount: `$${totalInsuredValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true },
    { label: `Premium Rate Applied`, amount: `${premiumRate}%` },
    { label: "Calculated Insurance Premium (I)", amount: `$${insurancePremium.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500" },
  ];

  return { goodsValue: goods, freightCost: freight, markupAmount, totalInsuredValue, insurancePremium, totalCIFValue, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  goods: "50000",
  freight: "3500",
  markupPct: "10",
  premiumRate: "0.45",
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

export default function InsuranceCostPerShipmentCalculator() {
  const [goods, setGoods] = useState(DEFAULTS.goods);
  const [freight, setFreight] = useState(DEFAULTS.freight);
  const [markupPct, setMarkupPct] = useState(DEFAULTS.markupPct);
  const [premiumRate, setPremiumRate] = useState(DEFAULTS.premiumRate);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [results, setResults] = useState<InsuranceResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateInsurance(
      parseFloat(goods) || 0, 
      parseFloat(freight) || 0, 
      parseFloat(markupPct) || 0, 
      parseFloat(premiumRate) || 0
    ));
  };

  const handleReset = () => {
    setGoods(DEFAULTS.goods); setFreight(DEFAULTS.freight); setMarkupPct(DEFAULTS.markupPct); setPremiumRate(DEFAULTS.premiumRate); setShowAdvanced(false);
    setResults(calculateInsurance(50000, 3500, 10, 0.45));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Cargo Insurance Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.category}:</span>
          <span className="text-foreground">${payload[0].value.toLocaleString()}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Insurance Cost Per Shipment" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Insurance Cost Per Shipment Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Shipment Valuation</h2>
            </div>
            
            <CompactInput id="goods" label="Commercial Value of Goods" value={goods} onChange={setGoods} prefix="$" tooltip="The invoice value of the goods being shipped." />
            <CompactInput id="freight" label="Freight Cost" value={freight} onChange={setFreight} prefix="$" tooltip="The cost of transporting the goods (shipping charges)." />
            
            <hr className="border-border my-2" />
            
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Insurance Policy</h2>
            </div>
            
            <CompactInput id="rate" label="Premium Rate" value={premiumRate} onChange={setPremiumRate} suffix="%" tooltip="The insurance rate charged by your broker (e.g., 0.45%)." step="0.01" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Incoterms <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="markup" label="CIF Markup Percentage" value={markupPct} onChange={setMarkupPct} suffix="%" tooltip="Standard international practice is 10% (CIF + 10%) to cover anticipated profit." />
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
                    ${results.insurancePremium.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Total Insured Value (TIV): <span className="font-bold text-foreground">${results.totalInsuredValue.toLocaleString()}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Valuation Breakdown</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Insured Value Composition</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Cargo Insurance Costs (CIF)</h2>
            <p>In international trade and logistics, marine and cargo insurance is vital to protect against loss, damage, or theft during transit. The cost of this insurance is not simply based on the cost of the goods; it is based on the <strong>Total Insured Value (TIV)</strong>.</p>
            
            <h3>The CIF + 10% Rule</h3>
            <p>The standard practice in global shipping (especially under the <strong>CIF Incoterm</strong> — Cost, Insurance, and Freight) is to insure the shipment for 110% of its CIF value. This is known as "CIF + 10%".</p>
            <p>Why the extra 10%? If a shipment is lost at sea, simply refunding the cost of the goods doesn't make the buyer whole. The buyer has lost time, anticipated profit, and may incur expedited shipping costs to replace the goods. The 10% markup (which can sometimes be negotiated to 20%) covers these incidental losses and anticipated profit.</p>
            
            <h2 className="text-2xl font-bold mb-3">How the Premium is Calculated</h2>
            <p>The calculation follows a strict sequence:</p>
            <ol>
              <li><strong>Base Value:</strong> Commercial Value of Goods + Freight Cost.</li>
              <li><strong>Markup:</strong> Base Value × 10% (or custom markup).</li>
              <li><strong>Total Insured Value (TIV):</strong> Base Value + Markup.</li>
              <li><strong>Insurance Premium:</strong> TIV × Premium Rate (e.g., 0.45%).</li>
            </ol>
            <p>If your goods are worth $50,000 and freight is $3,500, the base is $53,500. With a 10% markup, your Total Insured Value becomes $58,850. At a premium rate of 0.45%, your insurance cost is exactly $264.83.</p>
            
            <h2 className="text-2xl font-bold mb-3">What Factors Affect the Premium Rate?</h2>
            <p>Your insurance broker or freight forwarder will assign a premium rate (usually between 0.10% and 1.00%) based on several risk factors:</p>
            <ul>
              <li><strong>Nature of Goods:</strong> Electronics and jewelry carry high theft risks (higher rates); raw steel or timber carry very low risk (lower rates).</li>
              <li><strong>Route and Destination:</strong> Shipping to regions with known piracy, poor port infrastructure, or political instability will spike premiums.</li>
              <li><strong>Packaging:</strong> Proper export crating and containerization reduce damage risk, lowering the rate.</li>
              <li><strong>Mode of Transport:</strong> Air freight is generally considered safer and faster than ocean freight, often resulting in lower insurance rates despite higher freight costs.</li>
            </ul>
          </article>
          <FAQSection faqs={[
            { question: "What is CIF?", answer: "CIF stands for Cost, Insurance, and Freight. It is an Incoterm dictating that the seller must arrange and pay for the cost of goods, the ocean freight, and the marine insurance to bring the goods to the destination port." },
            { question: "Is the 10% markup mandatory?", answer: "Under official CIF terms established by the International Chamber of Commerce (Incoterms 2020), 110% is the default minimum coverage requirement. You can negotiate higher markups (like 20%) if both parties agree, but 10% is standard." },
            { question: "Who pays for the insurance?", answer: "Under CIF terms, the seller pays for the insurance. Under FOB (Free On Board) or EXW (Ex Works) terms, the buyer is responsible for purchasing their own insurance if they want the cargo protected." },
            { question: "What is General Average?", answer: "General Average is a maritime law principle where all parties in a sea venture proportionally share any losses resulting from a voluntary sacrifice of part of the ship or cargo to save the whole in an emergency. Marine insurance is critical because it covers your General Average contribution, which can be massive even if your specific cargo wasn't damaged." },
          ]} pageUrl="https://racira.com/calculator/insurance-cost-per-shipment-calculator" />
          <PopularCalculators exclude="/calculator/insurance-cost-per-shipment-calculator" />
        </div>
      </div>
    </>
  );
}
