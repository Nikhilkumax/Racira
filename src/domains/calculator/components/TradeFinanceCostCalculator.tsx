"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Landmark, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TradeFinanceResults {
  invoiceValue: number;
  apr: number;
  days: number;
  feeRate: number;
  
  interestCost: number;
  feeCost: number;
  totalFinanceCost: number;
  netProceeds: number;
  effectiveApr: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateTradeFinance = (
  invoiceValue: number, apr: number, days: number, feeRate: number
): TradeFinanceResults => {
  
  const interestCost = invoiceValue * (apr / 100) * (days / 365);
  const feeCost = invoiceValue * (feeRate / 100);
  
  const totalFinanceCost = interestCost + feeCost;
  const netProceeds = invoiceValue - totalFinanceCost;

  // Effective APR = (Total Cost / Net Proceeds) * (365 / Days) * 100
  // Note: Standard APR calculation for short term loans often uses Invoice Value, 
  // but true effective APR uses Net Proceeds since that's the cash actually received.
  // We will use Net Proceeds for a true effective APR.
  const effectiveApr = netProceeds > 0 && days > 0 ? (totalFinanceCost / netProceeds) * (365 / days) * 100 : 0;

  const chartData = [
    { name: "Net Cash Proceeds", value: Math.max(0, netProceeds), color: "hsl(var(--primary))" },
    { name: "Accrued Interest", value: interestCost, color: "hsl(var(--amber-500))" },
    { name: "Bank/Setup Fees", value: feeCost, color: "hsl(var(--destructive))" },
  ];

  const summaryStats = [
    { label: "Net Cash Proceeds", value: `$${netProceeds.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Cost of Finance", value: `$${totalFinanceCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "True Effective APR", value: `${effectiveApr.toFixed(2)}%` },
    { label: "Cost per Day", value: `$${(days > 0 ? totalFinanceCost / days : 0).toFixed(2)}` },
  ];

  const breakdown = [
    { label: "Total Commercial Invoice Value", amount: `$${invoiceValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Base Interest [${apr}% APR for ${days} days]`, amount: `-$${interestCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: `Origination / Bank Fee [${feeRate}% flat]`, amount: `-$${feeCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: "Total Finance Cost", amount: `-$${totalFinanceCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-red-500 font-bold" },
    { label: "Net Cash Deposited to Your Account", amount: `$${netProceeds.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { invoiceValue, apr, days, feeRate, interestCost, feeCost, totalFinanceCost, netProceeds, effectiveApr, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  invoiceValue: "250000",
  apr: "8.5",
  days: "90",
  feeRate: "1.5",
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

export default function TradeFinanceCostCalculator() {
  const [invoiceValue, setInvoiceValue] = useState(DEFAULTS.invoiceValue);
  const [apr, setApr] = useState(DEFAULTS.apr);
  const [days, setDays] = useState(DEFAULTS.days);
  const [feeRate, setFeeRate] = useState(DEFAULTS.feeRate);
  
  const [results, setResults] = useState<TradeFinanceResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateTradeFinance(
      parseFloat(invoiceValue) || 0, 
      parseFloat(apr) || 0,
      parseFloat(days) || 0,
      parseFloat(feeRate) || 0
    ));
  };

  const handleReset = () => {
    setInvoiceValue(DEFAULTS.invoiceValue); setApr(DEFAULTS.apr); setDays(DEFAULTS.days); setFeeRate(DEFAULTS.feeRate);
    setResults(calculateTradeFinance(250000, 8.5, 90, 1.5));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Trade Finance Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Trade Finance Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Trade Finance & Factoring Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Facility Terms</h2>
            </div>
            
            <CompactInput id="inv" label="Total Invoice / Facility Value" value={invoiceValue} onChange={setInvoiceValue} prefix="$" tooltip="The total value of the goods being financed or the invoice being factored." />
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="apr" label="Base Interest Rate" value={apr} onChange={setApr} suffix="% APR" tooltip="The annualized interest rate charged by the bank or financier." />
              <CompactInput id="day" label="Financing Duration" value={days} onChange={setDays} suffix="days" tooltip="How many days until the invoice is paid by your buyer (e.g., Net 90 terms)." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <CompactInput id="fee" label="Origination / Flat Setup Fee" value={feeRate} onChange={setFeeRate} suffix="%" tooltip="Banks often charge a flat percentage fee just to open the Letter of Credit or process the factoring." />

            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>Because trade finance durations are very short (usually 30 to 90 days), a seemingly small flat fee (like 1.5%) can mathematically skyrocket your <strong>True Effective APR</strong>.</p>
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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.effectiveApr > 30 ? 'bg-red-500/10 border-red-500/30' : 'bg-primary/10 border-primary/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Net Cash Proceeds
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.effectiveApr > 30 ? 'text-red-600' : 'text-primary'}`}>
                    ${results.netProceeds.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    True Effective APR: <span className={`font-bold ${results.effectiveApr > 30 ? 'text-red-600' : 'text-foreground'}`}>{results.effectiveApr.toFixed(2)}%</span>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Distribution of Value</h3>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is Trade Finance?</h2>
            <p><strong>Trade Finance</strong> provides short-term cash flow to businesses engaged in domestic or international trade. Because supply chains take time, there is often a massive gap between when a manufacturer has to pay their suppliers, and when they actually get paid by their end customer.</p>
            <p>Instead of waiting 90 days for a customer to pay an invoice, a business can use <strong>Invoice Factoring</strong> or a <strong>Letter of Credit</strong> to get cash from a bank immediately. In exchange, the bank takes a cut of the invoice.</p>
            
            <h3>The Danger of "Flat Fees" in Short Term Finance</h3>
            <p>Trade finance companies often advertise their rates deceptively. A lender might say, <em>"We will advance you the cash today for just a 2% flat fee."</em></p>
            <p>To an untrained eye, 2% sounds incredibly cheap. However, if that invoice is due in just 30 days, you are paying 2% for one month of financing. When you annualize that rate (multiply by 12 months), your <strong>True Effective APR</strong> is actually <strong>24%</strong>! This calculator instantly unmasks the true annualized cost of flat-fee financing.</p>

            <h2 className="text-2xl font-bold mb-3">Types of Trade Finance</h2>
            <ul>
              <li><strong>Invoice Factoring:</strong> You sell your outstanding B2B invoices to a third party (a Factor) at a discount. They give you ~80% of the cash today, and collect the 100% invoice from your customer later.</li>
              <li><strong>Supply Chain Finance (Reverse Factoring):</strong> Your large corporate buyer arranges for a bank to pay your invoice early (minus a fee). This is common when selling to giants like Walmart or Amazon.</li>
              <li><strong>Letter of Credit (LC):</strong> A guarantee from a bank that a buyer's payment to a seller will be received on time and for the correct amount. Highly common in international import/export.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">When Does Factoring Make Sense?</h2>
            <p>Paying a 20%+ effective APR is mathematically painful, but it makes sense when the <strong>Opportunity Cost</strong> of not having cash is even worse. If having immediate cash allows you to buy more raw materials to fulfill a massive, highly-profitable purchase order that you otherwise would have had to reject, the expensive finance fee is easily justified by the net profit of the new order.</p>
          </section>
          <FAQSection faqs={[
            { question: "Is Factoring considered debt?", answer: "Technically, no. Factoring is the 'sale of an asset' (your accounts receivable). Because it is not a loan, it does not appear as liability debt on your balance sheet, making it easier to secure other traditional bank loans." },
            { question: "What is Recourse vs. Non-Recourse Factoring?", answer: "In 'Recourse' factoring, if your customer goes bankrupt and fails to pay the invoice, you must buy the invoice back from the factoring company (you take the loss). In 'Non-Recourse', the factoring company assumes the credit risk and takes the loss." },
            { question: "How does the True Effective APR formula work?", answer: "It takes the total dollar amount you paid in fees and interest, divides it by the actual cash you received (Net Proceeds), and then scales it up to a 365-day year. This creates an apples-to-apples comparison against standard bank loans." },
          ]} pageUrl="https://racira.com/calculator/trade-finance-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Trade Finance Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Trade Finance Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Trade Finance Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Trade Finance Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Trade Finance Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/trade-finance-cost-calculator" />
        </div>
      </div>
    </>
  );
}
