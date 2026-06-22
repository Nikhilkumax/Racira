"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmtVal = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtRatio = (n: number) => `${n.toFixed(2)}x`;

export default function CustomerAcquisitionCostCalculator() {
  const [marketingSpend, setMarketingSpend] = useState("15000");
  const [salesSpend, setSalesSpend] = useState("10000");
  const [newCustomers, setNewCustomers] = useState("250");
  const [arpu, setArpu] = useState("300");
  const [margin, setMargin] = useState("75");
  const [churnRate, setChurnRate] = useState("12");

  const [res, setRes] = useState<{
    cac: number;
    ltv: number;
    ltvToCac: number;
    paybackMonths: number;
    avgLifetimeYears: number;
    ratingLabel: string;
    chartData: { name: string; value: number }[];
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const ms = parseFloat(marketingSpend) || 0;
    const ss = parseFloat(salesSpend) || 0;
    const nc = parseFloat(newCustomers) || 1;
    const rev = parseFloat(arpu) || 0;
    const m = (parseFloat(margin) || 0) / 100;
    const cr = (parseFloat(churnRate) || 0) / 100;

    const cac = (ms + ss) / nc;
    const avgLifetimeYears = cr > 0 ? 1 / cr : 0;
    const ltv = cr > 0 ? (rev * m) / cr : 0;
    const ltvToCac = cac > 0 ? ltv / cac : 0;
    const paybackMonths = (rev * m) > 0 ? (cac / (rev * m)) * 12 : 0;

    const ratingLabel = ltvToCac >= 4 ? "Excellent" : ltvToCac >= 3 ? "Healthy (Good)" : ltvToCac >= 1.5 ? "Sub-Optimal (Average)" : "Caution (Low)";

    const chartData = [
      { name: "CAC", value: cac },
      { name: "LTV", value: ltv },
    ];

    setRes({ cac, ltv, ltvToCac, paybackMonths, avgLifetimeYears, ratingLabel, chartData });
  };

  const reset = () => {
    setMarketingSpend("15000");
    setSalesSpend("10000");
    setNewCustomers("250");
    setArpu("300");
    setMargin("75");
    setChurnRate("12");
  };

  const ratingColor = (r: string) => ({ Excellent: "text-emerald-600", "Healthy (Good)": "text-primary", "Sub-Optimal (Average)": "text-amber-600", "Caution (Low)": "text-red-600" }[r] || "text-foreground");

  const faqs = [
    { question: "What is Customer Acquisition Cost (CAC)?", answer: "Customer Acquisition Cost (CAC) measures the total cost of sales and marketing efforts required to acquire a single new customer over a specific period. The formula is: CAC = (Total Marketing Expenses + Total Sales Expenses) ÷ New Customers Acquired." },
    { question: "What is Customer Lifetime Value (LTV)?", answer: "Customer Lifetime Value (LTV) is the total dollar amount a customer is expected to spend with your business during their relationship with you. It takes into account how much they spend, the profit margin, and how long they stay before churning." },
    { question: "What is a good LTV to CAC ratio?", answer: "A ratio of 3:1 is considered the industry standard benchmark for healthy, growing businesses (particularly in software-as-a-service or SaaS). A 1:1 or lower ratio means you spend too much to acquire customers, while a 5:1 or higher ratio might indicate you are under-investing in marketing and leaving growth on the table." },
    { question: "What is the CAC payback period?", answer: "The CAC payback period is the number of months it takes for a customer to generate enough gross profit to cover their acquisition cost. A shorter payback period (typically under 12 months for SaaS) is preferred because it improves cash flow and reduces working capital requirements." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Customer Acquisition Cost Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CAC & LTV Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Sales & Marketing Inputs</h2>
            <CompactInput id="ms" label="Total Marketing Spend" value={marketingSpend} onChange={setMarketingSpend} prefix="$" />
            <CompactInput id="ss" label="Total Sales Salaries & Spend" value={salesSpend} onChange={setSalesSpend} prefix="$" />
            <CompactInput id="nc" label="New Customers Acquired" value={newCustomers} onChange={setNewCustomers} />
            
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <span className="text-sm font-semibold text-foreground">Unit Economics & Churn</span>
              <CompactInput id="arpu" label="Avg Revenue Per Customer (Annual)" value={arpu} onChange={setArpu} prefix="$" />
              <CompactInput id="margin" label="Gross Margin" value={margin} onChange={setMargin} suffix="%" />
              <CompactInput id="churn" label="Annual Customer Churn Rate" value={churnRate} onChange={setChurnRate} suffix="%" />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate CAC & LTV
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Unit Economics Results</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">LTV : CAC Ratio</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtRatio(res.ltvToCac)}</div>
                  <div className={`text-sm font-bold ${ratingColor(res.ratingLabel)}`}>{res.ratingLabel}</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Customer Acquisition Cost (CAC)", value: fmtVal(res.cac), bold: true },
                        { label: "Customer Lifetime Value (LTV)", value: fmtVal(res.ltv), bold: true },
                        { label: "LTV : CAC Ratio", value: fmtRatio(res.ltvToCac) },
                        { label: "CAC Payback Period", value: `${res.paybackMonths.toFixed(1)} Months` },
                        { label: "Avg Customer Lifespan", value: `${res.avgLifetimeYears.toFixed(1)} Years` },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">LTV vs CAC Comparison</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={res.chartData} layout="vertical" margin={{ top: 4, right: 8, left: 24, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: any) => fmtVal(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding CAC & LTV</h2>
            <p>For any modern recurring revenue business or e-commerce platform, two metrics reign supreme: Customer Acquisition Cost (CAC) and Customer Lifetime Value (LTV). Together, they tell the story of a company's marketing efficiency and unit economic health. If CAC exceeds LTV, the business is fundamentally unprofitable at its core; if LTV is significantly higher than CAC, the company has an engine for highly profitable growth.</p>
            
            <h2>What is Customer Acquisition Cost (CAC)?</h2>
            <p>CAC is the total amount spent on marketing campaigns, advertising, sales commissions, and salaries to acquire a single customer. It is calculated by dividing total sales and marketing spend by the number of new customers acquired during that same period.</p>

            <h2>What is Customer Lifetime Value (LTV)?</h2>
            <p>LTV measures the total gross margin a customer generates during their lifespan with your company. The basic formula is: LTV = (Average Revenue Per User × Gross Margin %) ÷ Churn Rate. Churn rate represents the rate at which customers cancel or stop buying from you. Decreasing churn is one of the most effective ways to boost LTV.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/customer-acquisition-cost-calculator" />
          <PopularCalculators exclude="/calculator/customer-acquisition-cost-calculator" />
        </div>
      </div>
    </>
  );
}
