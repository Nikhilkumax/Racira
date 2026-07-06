"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Ship, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ClearanceResults {
  goodsValue: number;
  dutyRate: number;
  dutyAmount: number;
  brokerFee: number;
  mpf: number;
  hmf: number;
  isOcean: boolean;
  totalClearanceCost: number;
  effectiveRate: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateClearance = (value: number, dutyRate: number, brokerFee: number, isOcean: boolean): ClearanceResults => {
  const dutyAmount = value * (dutyRate / 100);
  
  // US Customs MPF (Merchandise Processing Fee) - Standard rate is 0.3464%
  // Min is $31.67, Max is $614.35 (As of recent years, though limits occasionally adjust. We use standard estimates).
  let mpf = value * 0.003464;
  if (mpf < 31.67 && value > 2500) mpf = 31.67; // Only applies to formal entries > $2500
  if (mpf > 614.35) mpf = 614.35;
  if (value <= 2500) mpf = 0; // Informal entries have different flat rules, let's assume 0 for simplicity if under 2500.

  // US Customs HMF (Harbor Maintenance Fee) - Only applies to ocean freight. Rate is 0.125%. No min/max.
  const hmf = isOcean ? (value * 0.00125) : 0;
  
  const totalClearanceCost = dutyAmount + brokerFee + mpf + hmf;
  const effectiveRate = value > 0 ? (totalClearanceCost / value) * 100 : 0;

  const chartData = [
    { name: "Import Duty", value: dutyAmount, color: "hsl(var(--destructive))" },
    { name: "Merchandise Processing (MPF)", value: mpf, color: "hsl(var(--amber-500))" },
    { name: "Harbor Maintenance (HMF)", value: hmf, color: "hsl(var(--blue-500))" },
    { name: "Broker Fee", value: brokerFee, color: "hsl(var(--muted-foreground))" },
  ];

  const summaryStats = [
    { label: "Total Clearance Cost", value: `$${totalClearanceCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Import Duty", value: `$${dutyAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "US Customs Fees (MPF/HMF)", value: `$${(mpf + hmf).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective Tariff Rate", value: `${effectiveRate.toFixed(2)}%` },
  ];

  const breakdown = [
    { label: "Total Commercial Value of Goods", amount: `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Import Duty (${dutyRate}%)`, amount: `+$${dutyAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Merchandise Processing Fee (MPF)", amount: `+$${mpf.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: "Harbor Maintenance Fee (HMF)", amount: `+$${hmf.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: isOcean ? "text-blue-600" : "text-muted-foreground" },
    { label: "Customs Broker Entry Fee", amount: `+$${brokerFee.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Cost to Clear Customs", amount: `$${totalClearanceCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
  ];

  return { goodsValue: value, dutyRate, dutyAmount, brokerFee, mpf, hmf, isOcean, totalClearanceCost, effectiveRate, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  value: "150000",
  dutyRate: "6.5",
  brokerFee: "150",
  isOcean: "true",
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

export default function CustomsClearanceCostEstimator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [dutyRate, setDutyRate] = useState(DEFAULTS.dutyRate);
  const [brokerFee, setBrokerFee] = useState(DEFAULTS.brokerFee);
  const [isOcean, setIsOcean] = useState(DEFAULTS.isOcean === "true");
  
  const [results, setResults] = useState<ClearanceResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateClearance(
      parseFloat(value) || 0, 
      parseFloat(dutyRate) || 0,
      parseFloat(brokerFee) || 0,
      isOcean
    ));
  };

  const handleReset = () => {
    setValue(DEFAULTS.value); setDutyRate(DEFAULTS.dutyRate); setBrokerFee(DEFAULTS.brokerFee); setIsOcean(true);
    setResults(calculateClearance(150000, 6.5, 150, true));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Customs Cost Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Customs Clearance Cost Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">US Customs Clearance Cost Estimator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Ship className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Import Details (US Entry)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="val" label="Value of Goods" value={value} onChange={setValue} prefix="$" tooltip="The total commercial value of the imported items." />
              <CompactInput id="duty" label="Import Duty Rate" value={dutyRate} onChange={setDutyRate} suffix="%" tooltip="The tariff rate based on the product's HTS code." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <CompactInput id="brok" label="Customs Broker Fee" value={brokerFee} onChange={setBrokerFee} prefix="$" tooltip="The flat fee your customs broker charges to file the entry (typically $100 - $250)." />
              
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-2">Transport Method</label>
                <div className="flex gap-4 items-center h-10">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={isOcean} onChange={() => setIsOcean(true)} className="accent-primary w-4 h-4" />
                    Ocean
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={!isOcean} onChange={() => setIsOcean(false)} className="accent-primary w-4 h-4" />
                    Air / Land
                  </label>
                </div>
              </div>
            </div>

            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>Automatically calculates mandatory US CBP fees including the Merchandise Processing Fee (MPF) and Harbor Maintenance Fee (HMF).</p>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-emerald-500/10 border-emerald-500/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Estimated Clearance Cost
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    ${results.totalClearanceCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Effective Tariff Rate: <span className="font-bold text-foreground">{results.effectiveRate.toFixed(2)}% of goods value</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Fee Breakdown</th>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Distribution of Fees</h3>
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding US Customs Clearance Costs</h2>
            <p>When importing commercial goods into the United States, the price on your supplier's invoice is only part of the story. Before US Customs and Border Protection (CBP) will release your cargo from the port, you must pay a series of duties and fees. If you do not budget for these accurately, your profit margins will be wiped out.</p>
            
            <h3>1. Import Duty (Tariffs)</h3>
            <p>This is the largest variable. The duty rate is determined by the product's <strong>HTS (Harmonized Tariff Schedule) Code</strong> and its country of origin. Some products enter duty-free (0%), while others face steep protective tariffs (up to 25% or more).</p>

            <h3>2. Merchandise Processing Fee (MPF)</h3>
            <p>The MPF is a mandatory fee charged by US Customs on all formal entries (shipments valued over $2,500). It is calculated at <strong>0.3464%</strong> of the goods value.</p>
            <ul>
              <li><strong>Minimum MPF:</strong> $31.67</li>
              <li><strong>Maximum MPF:</strong> $614.35</li>
            </ul>
            <p><em>Note: If you import a $500,000 shipment, your MPF is legally capped at $614.35, saving you a significant amount of money.</em></p>

            <h3>3. Harbor Maintenance Fee (HMF)</h3>
            <p>The HMF only applies if your goods arrive via <strong>Ocean Freight</strong> at a US port. It does not apply to air freight or trucks crossing the border. It is calculated at <strong>0.125%</strong> of the goods value, with no minimum or maximum limit.</p>
            
            <h3>4. Customs Broker Fee</h3>
            <p>Unless you are a licensed customs broker yourself, you must pay a third-party logistics company to file the entry paperwork (CBP Form 3461 and 7501) on your behalf. Brokers typically charge a flat fee per entry, usually ranging from $100 to $250.</p>
          </article>
          <FAQSection faqs={[
            { question: "What is an 'Informal Entry'?", answer: "Shipments valued under $2,500 usually qualify as informal entries. They often have simplified paperwork and are exempt from standard MPF limits, though flat-rate fees may still apply depending on how they are cleared (manual vs electronic)." },
            { question: "Do I pay duties on the shipping cost?", answer: "In the United States, duties are generally assessed on the FOB (Free On Board) value of the goods. This means you pay duty on the cost of the goods themselves, but you do NOT pay duty on the cost of the international ocean or air freight." },
            { question: "What happens if I use the wrong HTS code?", answer: "Using the wrong HTS code to secure a lower duty rate is considered customs fraud. CBP can seize your cargo, issue massive fines, and flag your company for mandatory intense inspections on all future imports. Always use a licensed customs broker to classify goods." },
          ]} pageUrl="https://racira.com/calculator/customs-clearance-cost-estimator" />
          <PopularCalculators exclude="/calculator/customs-clearance-cost-estimator" />
        </div>
      </div>
    </>
  );
}
