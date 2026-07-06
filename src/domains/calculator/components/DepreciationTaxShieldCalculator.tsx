"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Landmark, Printer } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TaxShieldResults {
  annualDepreciation: number;
  annualTaxShield: number;
  totalTaxShield: number;
  chartData: { year: string; cumulativeSavings: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateTaxShield = (cost: number, salvage: number, life: number, taxRate: number): TaxShieldResults => {
  const depreciableBase = Math.max(0, cost - salvage);
  const annualDepreciation = life > 0 ? depreciableBase / life : 0;
  
  const annualTaxShield = annualDepreciation * (taxRate / 100);
  const totalTaxShield = annualTaxShield * life;

  const chartData = [];
  chartData.push({ year: "Year 0", cumulativeSavings: 0 });
  
  let cumulative = 0;
  for (let i = 1; i <= life; i++) {
    cumulative += annualTaxShield;
    chartData.push({ year: `Year ${i}`, cumulativeSavings: cumulative });
  }

  const summaryStats = [
    { label: "Annual Tax Shield", value: `$${annualTaxShield.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Lifetime Tax Savings", value: `$${totalTaxShield.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Depreciable Base", value: `$${depreciableBase.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Exp.", value: `$${annualDepreciation.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Original Asset Cost", amount: `$${cost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Estimated Salvage Value", amount: `-$${salvage.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Total Depreciable Base", amount: `$${depreciableBase.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Annual Straight-Line Depreciation", amount: `$${annualDepreciation.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Corporate Tax Rate Applied`, amount: `${taxRate.toFixed(1)}%` },
    { label: "Annual Tax Shield (Cash Savings)", amount: `$${annualTaxShield.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { annualDepreciation, annualTaxShield, totalTaxShield, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  cost: "150000",
  salvage: "10000",
  life: "7",
  taxRate: "21",
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

export default function DepreciationTaxShieldCalculator() {
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [salvage, setSalvage] = useState(DEFAULTS.salvage);
  const [life, setLife] = useState(DEFAULTS.life);
  const [taxRate, setTaxRate] = useState(DEFAULTS.taxRate);
  
  const [results, setResults] = useState<TaxShieldResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateTaxShield(
      parseFloat(cost) || 0, 
      parseFloat(salvage) || 0,
      parseFloat(life) || 1, // prevent div by zero
      parseFloat(taxRate) || 0
    ));
  };

  const handleReset = () => {
    setCost(DEFAULTS.cost); setSalvage(DEFAULTS.salvage); setLife(DEFAULTS.life); setTaxRate(DEFAULTS.taxRate);
    setResults(calculateTaxShield(150000, 10000, 7, 21));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Tax Shield Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <p className="font-bold text-foreground mb-1">{payload[0].payload.year}</p>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Cumulative Tax Savings:</span>
            <span className="text-emerald-500 font-bold">${payload[0].value.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Depreciation Tax Shield" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Depreciation Tax Shield Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Asset & Tax Inputs</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="cost" label="Asset Purchase Cost" value={cost} onChange={setCost} prefix="$" tooltip="The total initial cost of the asset including shipping, installation, and setup." />
              <CompactInput id="salvage" label="Salvage Value" value={salvage} onChange={setSalvage} prefix="$" tooltip="The estimated resale value of the asset at the end of its useful life." />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="life" label="Useful Life" value={life} onChange={setLife} suffix="Yrs" tooltip="How many years the asset will be depreciated (e.g., 5 or 7 years for equipment)." />
              <CompactInput id="tax" label="Corporate Tax Rate" value={taxRate} onChange={setTaxRate} suffix="%" tooltip="Your company's marginal corporate income tax rate (e.g., 21% US Federal)." step="0.1" />
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
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-emerald-600 transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Lifetime Tax Savings
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-emerald-600`}>
                    ${results.totalTaxShield.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Annual Tax Shield: <span className="font-bold text-foreground">${results.annualTaxShield.toLocaleString(undefined, {minimumFractionDigits: 2})} / year</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Annual Calculation</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Cumulative Cash Saved (Tax Shield)</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="cumulativeSavings" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                        </AreaChart>
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
            <h2 className="text-2xl font-bold mb-3">What is a Depreciation Tax Shield?</h2>
            <p>A <strong>Depreciation Tax Shield</strong> is the reduction in income taxes that results from taking an allowable deduction for depreciation. Because depreciation is a non-cash expense (you don't actually write a check for it each year), the tax savings it generates represent real, tangible cash flow that stays in the business.</p>
            
            <h3>How the Tax Shield Works</h3>
            <p>When a company buys a large asset (like a $150,000 piece of manufacturing equipment), the IRS does not usually allow the company to deduct the entire $150,000 as an expense in year one. Instead, the company must capitalize the asset and depreciate it (deduct a portion of its value) over its "useful life."</p>
            <p>If the annual depreciation expense is $20,000, that expense lowers the company's taxable income by $20,000. If the corporate tax rate is 21%, the company saves <strong>$4,200</strong> in taxes that year ($20,000 × 21%). This $4,200 is the annual tax shield.</p>

            <h2 className="text-2xl font-bold mb-3">Why is it Important for Capital Budgeting?</h2>
            <p>When companies use NPV (Net Present Value) or IRR (Internal Rate of Return) to decide whether to buy a new machine, they must look at cash flows. Because the tax shield is a real cash saving, it is always added back into the cash flow projections.</p>
            <p>A machine that costs $150,000 might generate enough tax shields over its life to effectively reduce its net cost to $120,000, making the investment significantly more attractive.</p>

            <h2 className="text-2xl font-bold mb-3">Straight-Line vs. Accelerated Depreciation</h2>
            <p>This calculator uses the <strong>Straight-Line</strong> method, which spreads the deduction equally over the asset's life. However, governments often allow <strong>Accelerated Depreciation</strong> (like MACRS in the US) or even 100% Bonus Depreciation.</p>
            <p>Accelerated depreciation doesn't change the <em>total</em> lifetime tax shield, but it pulls those tax savings into the earlier years of the project. Due to the time value of money, receiving those tax shields sooner is highly beneficial to a company's cash flow.</p>
          </article>
          <FAQSection faqs={[
            { question: "Is a tax shield actual cash?", answer: "Yes, indirectly. Because it legally reduces the amount of cash you must pay to the government in taxes, that cash remains in your corporate bank account. In finance, a dollar saved on taxes is exactly equal to a dollar earned." },
            { question: "What is Salvage Value?", answer: "Salvage value is the estimated resale value of the asset at the end of its useful life. You cannot depreciate an asset below its salvage value. If you buy a truck for $50k and expect to sell it for $10k in five years, your depreciable base is only $40k." },
            { question: "What happens if my company operates at a loss?", answer: "If your company has zero taxable income (operating at a loss), the depreciation expense cannot shield taxes in the current year because there are no taxes to shield. However, the resulting Net Operating Loss (NOL) can often be carried forward to shield taxes in future profitable years." },
          ]} pageUrl="https://racira.com/calculator/depreciation-tax-shield-calculator" />
          <PopularCalculators exclude="/calculator/depreciation-tax-shield-calculator" />
        </div>
      </div>
    </>
  );
}
