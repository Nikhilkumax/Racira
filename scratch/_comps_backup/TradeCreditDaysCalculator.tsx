"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, TrendingUp, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DPOResults {
  dpo: number;
  apTurnover: number;
  ap: number;
  cogs: number;
  period: number;
  status: string;
  statusColor: string;
  benchmarks: { sector: string; dpo: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateDPO = (ap: number, cogs: number, period: number): DPOResults => {
  const dpo = cogs > 0 ? (ap / cogs) * period : 0;
  const apTurnover = ap > 0 ? cogs / ap : 0;

  let status = "";
  let statusColor = "";
  if (dpo > 60) {
    status = "Highly Leveraged (Maximized Float)";
    statusColor = "text-emerald-500"; // Good for cash flow, bad for supplier relations if late
  } else if (dpo >= 30) {
    status = "Standard Commercial Terms";
    statusColor = "text-blue-500";
  } else if (dpo > 15) {
    status = "Fast Payer (Low Float)";
    statusColor = "text-amber-500";
  } else {
    status = "Cash Basis / Very Fast";
    statusColor = "text-red-500"; // Poor use of trade credit
  }

  const benchmarks = [
    { sector: "Retail", dpo: 65 },
    { sector: "Manufacturing", dpo: 45 },
    { sector: "Technology", dpo: 40 },
    { sector: "Healthcare", dpo: 55 },
    { sector: "Your Company", dpo: dpo },
  ].sort((a, b) => b.dpo - a.dpo);

  const summaryStats = [
    { label: "Trade Credit Days (DPO)", value: `${dpo.toFixed(1)} days` },
    { label: "A/P Turnover Ratio", value: `${apTurnover.toFixed(2)}x` },
    { label: "Avg. Daily COGS", value: `$${(cogs/period).toLocaleString(undefined, { maximumFractionDigits: 0 })}/day` },
    { label: "Cash Flow Leverage", value: status.split(' ')[0] },
  ];

  const breakdown = [
    { label: "Average Accounts Payable", amount: `$${ap.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Cost of Goods Sold (COGS)", amount: `$${cogs.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Period Length", amount: `${period} days` },
    { label: "Accounts Payable Turnover", amount: `${apTurnover.toFixed(2)} times per period` },
    { label: "Days Payable Outstanding (DPO)", amount: `${dpo.toFixed(1)} days`, isTotal: true },
  ];

  return { dpo, apTurnover, ap, cogs, period, status, statusColor, benchmarks, summaryStats, breakdown };
};

const DEFAULTS = {
  ap: "45000",
  cogs: "350000",
  period: "365",
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

export default function TradeCreditDaysCalculator() {
  const [ap, setAp] = useState(DEFAULTS.ap);
  const [cogs, setCogs] = useState(DEFAULTS.cogs);
  const [period, setPeriod] = useState(DEFAULTS.period);
  
  const [results, setResults] = useState<DPOResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateDPO(parseFloat(ap) || 0, parseFloat(cogs) || 0, parseInt(period) || 365));
  };

  const handleReset = () => {
    setAp(DEFAULTS.ap); setCogs(DEFAULTS.cogs); setPeriod(DEFAULTS.period);
    setResults(calculateDPO(parseFloat(DEFAULTS.ap), parseFloat(DEFAULTS.cogs), parseInt(DEFAULTS.period)));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Trade Credit Days</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.sector}:</span>
          <span className="text-foreground">{payload[0].value.toFixed(1)} Days</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Trade Credit Days Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Trade Credit Days Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Financial Inputs</h2>
            </div>
            
            <CompactInput id="ap" label="Average Accounts Payable" value={ap} onChange={setAp} prefix="$" tooltip="The average amount you owe to suppliers during the period." />
            <CompactInput id="cogs" label="Cost of Goods Sold (COGS)" value={cogs} onChange={setCogs} prefix="$" tooltip="The total cost of goods sold during the period." />
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1.5">Period (Days)</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="365">Annual (365 Days)</option>
                <option value="90">Quarterly (90 Days)</option>
                <option value="30">Monthly (30 Days)</option>
              </select>
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
                
                <div className={`bg-primary/10 bg-primary/10 bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative bg-primary/10 border-primary`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Trade Credit Days (Days Payable Outstanding)
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.statusColor}`}>
                    {results.dpo.toFixed(1)} Days
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Supplier Cash Flow Strategy: <span className={`font-bold ${results.statusColor}`}>{results.status}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Metric Breakdown</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">DPO vs Industry Benchmarks</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={results.benchmarks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="sector" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={85} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="dpo" radius={[0, 4, 4, 0]}>
                            {results.benchmarks.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.sector === "Your Company" ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
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
            <h2 className="text-2xl font-bold mb-3">What Are Trade Credit Days (DPO)?</h2>
            <p>Trade Credit Days, more formally known as <strong>Days Payable Outstanding (DPO)</strong>, is a financial ratio that indicates the average time (in days) that a company takes to pay its bills and invoices to its trade creditors, which include suppliers, vendors, or financiers. The formula is simple: <code>(Accounts Payable / Cost of Goods Sold) × Number of Days in the Period</code>.</p>
            
            <h3>Why Is DPO Important?</h3>
            <p>DPO is a critical measure of working capital efficiency. A company wants to maximize its cash flow. By delaying payments to suppliers as long as commercially acceptable, the company effectively secures a short-term, interest-free loan from its vendors. This cash can be used elsewhere in the business to fund growth or earn interest.</p>
            <ul>
              <li><strong>High DPO:</strong> The company is maximizing its "float." It keeps cash in the bank longer. Giants like Amazon and Walmart often operate with very high DPOs because they dictate payment terms to smaller suppliers. However, if DPO is too high, it may signal that the company is struggling to pay its bills or is risking its vendor relationships.</li>
              <li><strong>Low DPO:</strong> The company pays its bills quickly. While this ensures excellent supplier relations (and often earns early payment discounts), it means the company is not maximizing its short-term cash flow leverage.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Cash Conversion Cycle</h2>
            <p>Trade Credit Days is one of the three components of the <strong>Cash Conversion Cycle (CCC)</strong>, which measures how long it takes a company to convert its investments in inventory back into cash. The CCC formula is: <code>DIO + DSO - DPO</code>.</p>
            <p>Because DPO is subtracted in this formula, increasing your Trade Credit Days directly reduces your Cash Conversion Cycle, improving your overall liquidity.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is a 'good' DPO?", answer: "A 'good' DPO depends entirely on the industry and the specific trade terms negotiated with suppliers (like Net 30 or Net 60). Generally, 30 to 45 days is standard. If your DPO is 75 days but your suppliers expect payment in 30 days, your DPO is bad because you are paying late." },
            { question: "How can I improve my Trade Credit Days?", answer: "You can increase your DPO by renegotiating payment terms with suppliers (e.g., asking for Net 45 instead of Net 30), centralizing payables to control cash outflows better, or simply delaying payments until the exact due date rather than paying invoices the day they arrive." },
            { question: "What is the Accounts Payable Turnover Ratio?", answer: "It is a related metric showing how many times a company pays off its accounts payable balance during a period. It is calculated as COGS / Accounts Payable. A high turnover ratio means bills are paid frequently; a low ratio means bills are paid slowly." },
            { question: "Can a high DPO be a bad thing?", answer: "Yes. If a high DPO is achieved by systematically paying suppliers late, vendors may refuse to do business, lower their service quality, or revoke trade credit privileges entirely, forcing the company to pay Cash On Delivery (COD)." },
          ]} pageUrl="https://racira.com/calculator/trade-credit-days-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Trade Credit Days Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Trade Credit Days Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Trade Credit Days Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Trade Credit Days Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Trade Credit Days Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/trade-credit-days-calculator" />
        </div>
      </div>
    </>
  );
}
