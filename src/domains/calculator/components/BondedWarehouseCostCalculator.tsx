"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Warehouse, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface BondedResults {
  goodsValue: number;
  dutyRate: number;
  dutyAmount: number;
  storageMonthly: number;
  durationMonths: number;
  totalStorage: number;
  capitalRate: number;
  capitalSaved: number;
  netBenefit: number;
  isProfitable: boolean;
  chartData: { name: string; value: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateBonded = (value: number, dutyRate: number, storage: number, months: number, capitalRate: number): BondedResults => {
  const dutyAmount = value * (dutyRate / 100);
  const totalStorage = storage * months;
  
  // Capital Saved: The amount of money you make (or save on loan interest) by NOT paying the duty upfront.
  // Formula: Deferred Amount * (Annual Rate / 12) * Months
  const capitalSaved = dutyAmount * ((capitalRate / 100) / 12) * months;
  
  const netBenefit = capitalSaved - totalStorage;
  const isProfitable = netBenefit >= 0;

  const chartData = [
    { name: "Duty Deferred (Cash Kept)", value: dutyAmount, fill: "hsl(var(--primary))" },
    { name: "Capital Benefit (Interest Saved)", value: capitalSaved, fill: "hsl(var(--emerald-500))" },
    { name: "Warehouse Storage Cost", value: -totalStorage, fill: "hsl(var(--destructive))" },
  ];

  const summaryStats = [
    { label: "Deferred Import Duty", value: `$${dutyAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Cash Flow Benefit", value: `$${capitalSaved.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Storage Costs", value: `$${totalStorage.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Net Financial Impact", value: `$${Math.abs(netBenefit).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Total Value of Imported Goods", amount: `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Deferred Import Duty Amount", amount: `$${dutyAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary font-bold" },
    { label: `Value of Deferred Capital (${capitalRate}% APR)`, amount: `+$${capitalSaved.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500 font-bold" },
    { label: `Bonded Storage Cost (${months} months)`, amount: `-$${totalStorage.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Net Financial Benefit of Bonded Storage", amount: `${isProfitable ? '+' : '-'}$${Math.abs(netBenefit).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: isProfitable ? "text-emerald-500 font-bold text-[15px]" : "text-red-500 font-bold text-[15px]" },
  ];

  return { goodsValue: value, dutyRate, dutyAmount, storageMonthly: storage, durationMonths: months, totalStorage, capitalRate, capitalSaved, netBenefit, isProfitable, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  value: "500000",
  dutyRate: "25", // Heavy tariffs
  storage: "1500",
  months: "6",
  capitalRate: "8", // Cost of capital / loan interest
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

export default function BondedWarehouseCostCalculator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [dutyRate, setDutyRate] = useState(DEFAULTS.dutyRate);
  const [storage, setStorage] = useState(DEFAULTS.storage);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [capitalRate, setCapitalRate] = useState(DEFAULTS.capitalRate);
  
  const [results, setResults] = useState<BondedResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateBonded(
      parseFloat(value) || 0, 
      parseFloat(dutyRate) || 0,
      parseFloat(storage) || 0,
      parseFloat(months) || 0,
      parseFloat(capitalRate) || 0
    ));
  };

  const handleReset = () => {
    setValue(DEFAULTS.value); setDutyRate(DEFAULTS.dutyRate); setStorage(DEFAULTS.storage); setMonths(DEFAULTS.months); setCapitalRate(DEFAULTS.capitalRate);
    setResults(calculateBonded(500000, 25, 1500, 6, 8));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Bonded Warehouse Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">${Math.abs(payload[0].value).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Bonded Warehouse Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bonded Warehouse Cash Flow & Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Warehouse className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Import & Storage Variables</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="val" label="Total Value of Goods" value={value} onChange={setValue} prefix="$" tooltip="The commercial invoice value of the imported inventory." />
              <CompactInput id="duty" label="Import Duty/Tariff Rate" value={dutyRate} onChange={setDutyRate} suffix="%" tooltip="The customs duty percentage applicable to your goods." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="stor" label="Monthly Storage Cost" value={storage} onChange={setStorage} prefix="$" tooltip="The cost to store the inventory in the bonded facility per month." />
              <CompactInput id="mon" label="Storage Duration" value={months} onChange={setMonths} suffix="mo" tooltip="How many months the goods will sit before being sold/exported." />
            </div>

            <div className="border-t border-border my-1"></div>

            <CompactInput id="cap" label="Cost of Capital (APR)" value={capitalRate} onChange={setCapitalRate} suffix="%" tooltip="Your business loan interest rate, or the return you could make by investing cash elsewhere (usually 6% to 12%)." />

            <div className="p-3 mt-1 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground font-medium">
              Determines if the cash flow benefit of deferring customs duties outweighs the physical cost of bonded storage.
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.isProfitable ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Net Financial Impact
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                    {results.isProfitable ? '+' : '-'}${Math.abs(results.netBenefit).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    {results.isProfitable 
                      ? "Bonded storage provides a net positive cash flow benefit." 
                      : "Bonded storage costs more than the capital saved."}
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Cash Flow Mechanics</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(Math.abs(v)/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <ReferenceLine y={0} stroke="hsl(var(--border))" />
                          <Bar dataKey="value" radius={4} maxBarSize={60}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
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
            <h2 className="text-2xl font-bold mb-3">What is a Bonded Warehouse?</h2>
            <p>A <strong>Bonded Warehouse</strong> is a secure storage facility controlled by customs authorities (like US Customs and Border Protection). When you import goods from overseas, you normally have to pay import duties and tariffs the moment the cargo hits the port. However, if you move the goods directly into a bonded warehouse, you do not have to pay the duties until the goods are removed for domestic sale.</p>
            
            <h3>The Hidden Value: Cash Flow</h3>
            <p>Why pay for special bonded storage? <strong>Cash Flow</strong>. If you import $1,000,000 worth of electronics with a 25% tariff, you owe $250,000 in taxes immediately. If it takes you 6 months to sell that inventory, that $250,000 is locked up and useless to your business.</p>
            <p>By using a bonded warehouse, you keep that $250,000 in your bank account for 6 months. You can use it to buy more inventory, fund marketing, or simply avoid paying 8% interest on a business loan. This calculator measures the financial value of holding that capital versus the physical cost of renting the bonded space.</p>
            
            <h2 className="text-2xl font-bold mb-3">When to Use Bonded Storage</h2>
            <ul>
              <li><strong>High Tariff Goods:</strong> If your import duties are very high (e.g., Section 301 tariffs from China), the capital saved by deferring the tax almost always outweighs the storage cost.</li>
              <li><strong>Exporting:</strong> If you import components, assemble them in the bonded warehouse, and then export them to another country (like Canada), you pay <strong>zero</strong> import duties to the US. This is called a drawback or re-export exemption.</li>
              <li><strong>Long Storage Durations:</strong> If you import a massive bulk order to get a supplier discount, but won't sell through the inventory for 12 months, deferring the tax preserves your operating capital.</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "How long can goods stay in a bonded warehouse?", answer: "In the United States, goods can legally remain in a bonded warehouse for up to 5 years from the date of importation before duties must be paid or the goods destroyed/exported." },
            { question: "Is bonded storage more expensive than normal storage?", answer: "Yes. Bonded warehouses require special security, strict inventory auditing, and a customs bond, so third-party logistics (3PL) providers charge a premium for this space compared to standard commercial warehousing." },
            { question: "What is Cost of Capital?", answer: "Cost of Capital is the price of money. If you have to borrow money to pay the import duties, your cost of capital is your loan interest rate. If you use your own cash, your cost of capital is the return you could have made by investing it elsewhere (Opportunity Cost)." },
          ]} pageUrl="https://racira.com/calculator/bonded-warehouse-cost-calculator" />
          <PopularCalculators exclude="/calculator/bonded-warehouse-cost-calculator" />
        </div>
      </div>
    </>
  );
}
