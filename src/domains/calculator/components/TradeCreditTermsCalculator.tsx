"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Percent, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CreditTermsResults {
  discountAmount: number;
  paymentIfDiscounted: number;
  daysToBorrow: number;
  apr: number;
  ear: number;
  recommendation: string;
  recommendationColor: string;
  chartData: { source: string; rate: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateCreditTerms = (invoice: number, discountPct: number, discountDays: number, netDays: number, bankRate: number): CreditTermsResults => {
  const d = discountPct / 100;
  const daysToBorrow = Math.max(1, netDays - discountDays); // Avoid divide by zero
  
  const discountAmount = invoice * d;
  const paymentIfDiscounted = invoice - discountAmount;
  
  // APR Approximation: (Discount % / (100 - Discount %)) * (365 / (Net - Discount))
  const periodicRate = d / (1 - d);
  const periodsPerYear = 365 / daysToBorrow;
  
  const apr = (periodicRate * periodsPerYear) * 100;
  
  // EAR (Effective Annual Rate): (1 + Periodic Rate) ^ PeriodsPerYear - 1
  const ear = (Math.pow(1 + periodicRate, periodsPerYear) - 1) * 100;

  let recommendation = "";
  let recommendationColor = "";
  if (ear > bankRate) {
    recommendation = "Take the Discount";
    recommendationColor = "text-emerald-500";
  } else {
    recommendation = "Skip Discount (Keep Cash)";
    recommendationColor = "text-amber-500";
  }

  const chartData = [
    { source: "Bank Loan Rate", rate: bankRate },
    { source: "Cost of Missing Discount (EAR)", rate: Math.min(ear, 150) }, // Cap at 150% for visualization
  ];

  const summaryStats = [
    { label: "Effective Annual Rate (EAR)", value: `${ear.toFixed(1)}%` },
    { label: "Nominal Rate (APR)", value: `${apr.toFixed(1)}%` },
    { label: "Discount Savings", value: `$${discountAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Recommendation", value: recommendation.split(' ')[0] },
  ];

  const breakdown = [
    { label: "Full Invoice Amount", amount: `$${invoice.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Early Payment Discount", amount: `-$${discountAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Amount Due on Discount Date", amount: `$${paymentIfDiscounted.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true },
    { label: "Days Financed by Missing Discount", amount: `${daysToBorrow} days` },
    { label: "Implied Interest Rate (EAR)", amount: `${ear.toFixed(2)}%`, isTotal: true },
  ];

  return { discountAmount, paymentIfDiscounted, daysToBorrow, apr, ear, recommendation, recommendationColor, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  invoice: "10000",
  discountPct: "2",
  discountDays: "10",
  netDays: "30",
  bankRate: "8",
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

export default function TradeCreditTermsCalculator() {
  const [invoice, setInvoice] = useState(DEFAULTS.invoice);
  const [discountPct, setDiscountPct] = useState(DEFAULTS.discountPct);
  const [discountDays, setDiscountDays] = useState(DEFAULTS.discountDays);
  const [netDays, setNetDays] = useState(DEFAULTS.netDays);
  const [bankRate, setBankRate] = useState(DEFAULTS.bankRate);
  
  const [results, setResults] = useState<CreditTermsResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateCreditTerms(
      parseFloat(invoice) || 0, 
      parseFloat(discountPct) || 0, 
      parseFloat(discountDays) || 0, 
      parseFloat(netDays) || 0,
      parseFloat(bankRate) || 0
    ));
  };

  const handleReset = () => {
    setInvoice(DEFAULTS.invoice); setDiscountPct(DEFAULTS.discountPct); setDiscountDays(DEFAULTS.discountDays); setNetDays(DEFAULTS.netDays); setBankRate(DEFAULTS.bankRate);
    setResults(calculateCreditTerms(10000, 2, 10, 30, 8));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Trade Credit Terms</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.source}:</span>
          <span className="text-foreground">{payload[0].value.toFixed(1)}%</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Trade Credit Terms Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Trade Credit Terms Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Invoice & Terms</h2>
            </div>
            
            <CompactInput id="inv" label="Invoice Amount" value={invoice} onChange={setInvoice} prefix="$" tooltip="The total amount due on the invoice." />
            
            <div className="grid grid-cols-3 gap-4 bg-secondary/20 p-3 rounded-lg border border-border">
              <CompactInput id="pct" label="Disc. %" value={discountPct} onChange={setDiscountPct} suffix="%" tooltip="The percentage discount offered for early payment." />
              <CompactInput id="dday" label="Disc. Days" value={discountDays} onChange={setDiscountDays} tooltip="The number of days you have to pay to receive the discount." />
              <CompactInput id="net" label="Net Days" value={netDays} onChange={setNetDays} tooltip="The maximum number of days to pay the full amount." />
            </div>
            <div className="text-xs font-bold text-center text-muted-foreground tracking-widest uppercase">
              Terms: {discountPct}% / {discountDays} Net {netDays}
            </div>

            <hr className="border-border my-2" />

            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Capital Cost</h2>
            </div>
            <CompactInput id="bank" label="Your Cost of Borrowing" value={bankRate} onChange={setBankRate} suffix="%" tooltip="The annual interest rate if you were to borrow money from a bank (e.g., line of credit)." />

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
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-secondary/20 border-border`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Cost of Missing Discount (EAR)
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.ear > 20 ? 'text-red-600' : 'text-amber-600'}`}>
                    {results.ear.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Action: <span className={`font-bold ${results.recommendationColor}`}>{results.recommendation}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Discount Mechanics</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Capital Cost Comparison</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="source" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.source === "Bank Loan Rate" ? "hsl(var(--muted))" : "hsl(var(--destructive))"} />
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
            <h2 className="text-2xl font-bold mb-3">What Are Trade Credit Terms?</h2>
            <p>Trade credit terms (also known as payment terms) dictate how and when a buyer must pay a supplier for goods or services. They are often displayed in a shorthand format like <strong>"2/10 Net 30"</strong>.</p>
            <ul>
              <li><strong>2</strong>: The percentage discount offered (2%).</li>
              <li><strong>10</strong>: The number of days the buyer has to pay to receive the discount (10 days).</li>
              <li><strong>Net 30</strong>: If the discount is not taken, the full invoice amount is due in 30 days.</li>
            </ul>

            <h3>The Cost of Missing the Discount</h3>
            <p>Many businesses mistakenly believe that missing a 2% discount is a minor cost. In reality, the cost of giving up that discount is usually enormous. If terms are 2/10 Net 30, and you pay on day 30 instead of day 10, you are effectively borrowing the invoice amount from your supplier for exactly 20 days (30 - 10 = 20).</p>
            <p>You pay a 2% "interest" charge (by losing the discount) for a 20-day loan. If you scale that up to a full year (365 days / 20 days = 18.25 periods), that 2% charge compounds to an Effective Annual Rate (EAR) of over <strong>44%</strong>!</p>
            
            <h2 className="text-2xl font-bold mb-3">When to Take the Discount</h2>
            <p>To decide whether to take the discount, you must compare the Effective Annual Rate (EAR) of missing the discount to your company's actual cost of borrowing (e.g., your Line of Credit rate from a bank).</p>
            <ul>
              <li>If the <strong>EAR of missing the discount &gt; Bank Rate</strong>: Borrow money from the bank to pay the supplier on Day 10. You will save money.</li>
              <li>If the <strong>EAR of missing the discount &lt; Bank Rate</strong>: Skip the discount, keep your cash, and pay the supplier on Day 30.</li>
            </ul>
            <p>Because the EAR of standard terms like 1/10 Net 30 (18% EAR) or 2/10 Net 30 (44% EAR) is almost always higher than standard commercial lending rates, <strong>it is almost always financially optimal to take the discount</strong>.</p>

          </article>
          <FAQSection faqs={[
            { question: "What does '1/10 Net 30' mean?", answer: "It means you receive a 1% discount if you pay within 10 days. Otherwise, the full net amount is due in 30 days." },
            { question: "What is EAR vs APR in trade credit?", answer: "The APR (Annual Percentage Rate) simply multiplies the periodic rate by the number of periods in a year. The EAR (Effective Annual Rate) accounts for compound interest, providing a slightly higher and mathematically precise measure of the true cost of missing the discount." },
            { question: "What if I stretch the payables (pay late)?", answer: "If terms are 2/10 Net 30, but you pay on day 60 instead of day 30, the 'loan' period increases from 20 days to 50 days. This drops the EAR from 44% to around 15%. This is why struggling companies stretch payables—it artificially lowers their borrowing cost, though it ruins supplier relationships." },
          ]} pageUrl="https://racira.com/calculator/trade-credit-terms-calculator" />
          <PopularCalculators exclude="/calculator/trade-credit-terms-calculator" />
        </div>
      </div>
    </>
  );
}
