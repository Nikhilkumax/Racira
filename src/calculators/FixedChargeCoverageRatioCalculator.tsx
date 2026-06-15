"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

interface FccrResults {
  fccr: number;
  availableIncome: number;
  totalFixedCharges: number;
  status: string;
  statusColor: string;
  chartData: any[];
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-[13px] font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const calculateFccr = (inputs: any): FccrResults => {
  const ebit = parseFloat(inputs.ebit) || 0;
  const leasePayments = parseFloat(inputs.leasePayments) || 0;
  const interestExpense = parseFloat(inputs.interestExpense) || 0;
  const principalRepayments = parseFloat(inputs.principalRepayments) || 0;

  const availableIncome = ebit + leasePayments;
  const totalFixedCharges = interestExpense + leasePayments + principalRepayments;

  const fccr = totalFixedCharges > 0 ? availableIncome / totalFixedCharges : 0;

  let status = "N/A";
  let statusColor = "text-muted-foreground";

  if (totalFixedCharges > 0) {
    if (fccr >= 1.5) { status = "Excellent (Strong Solvency)"; statusColor = "text-green-600"; }
    else if (fccr >= 1.25) { status = "Good (Adequate Coverage)"; statusColor = "text-green-500"; }
    else if (fccr >= 1.0) { status = "Warning (Barely Covering)"; statusColor = "text-orange-500"; }
    else { status = "Insolvent (Cannot Cover Charges)"; statusColor = "text-destructive"; }
  }

  const chartData = [
    { name: "Available Income (EBIT + Leases)", amount: availableIncome, color: "hsl(var(--primary))" },
    { name: "Total Fixed Charges", amount: totalFixedCharges, color: "#ef4444" }
  ];

  return {
    fccr,
    availableIncome,
    totalFixedCharges,
    status,
    statusColor,
    chartData
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground -translate-y-14 transform">
        <p className="font-bold text-muted-foreground mb-0.5">{payload[0].payload.name}</p>
        <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

const DEFAULTS = {
  ebit: "250000",
  leasePayments: "50000",
  interestExpense: "30000",
  principalRepayments: "20000"
};

export default function FixedChargeCoverageRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<FccrResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateFccr(inputs));
  }, []);

  const handleChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    setResults(calculateFccr(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResults(calculateFccr(DEFAULTS));
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Fixed Charge Coverage Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fixed Charge Coverage Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT COLUMN */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            
            <div className="text-sm text-muted-foreground mb-2">
              Enter your annual business financials to calculate your FCCR.
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="ebit" label="EBIT (Earnings Before Interest & Taxes)" value={inputs.ebit} onChange={(v: string) => handleChange("ebit", v)} prefix="$" />
              <CompactInput id="leasePayments" label="Fixed Lease Payments" value={inputs.leasePayments} onChange={(v: string) => handleChange("leasePayments", v)} prefix="$" />
              <CompactInput id="interestExpense" label="Interest Expense" value={inputs.interestExpense} onChange={(v: string) => handleChange("interestExpense", v)} prefix="$" />
              <CompactInput id="principalRepayments" label="Principal Repayments (Optional)" value={inputs.principalRepayments} onChange={(v: string) => handleChange("principalRepayments", v)} prefix="$" />
            </div>
            
            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate FCCR
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card" ref={printRef}>
                <div className="flex justify-end">
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Fixed Charge Coverage Ratio</div>
                  <div className="text-4xl font-bold text-primary">{results.fccr.toFixed(2)}x</div>
                  <div className={`text-sm font-bold mt-1 \${results.statusColor}`}>{results.status}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-y border-border py-3 my-2">
                  <div className="text-center px-2">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Available Income</div>
                    <div className="text-sm font-bold">${results.availableIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-center px-2 border-l border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Fixed Charges</div>
                    <div className="text-sm font-bold text-destructive">${results.totalFixedCharges.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" tickFormatter={(val) => `$\${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" hide />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={60}>
                        {results.chartData.map((entry, index) => (
                          <Cell key={`cell-\${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-[1180px] mx-auto mt-12 prose prose-slate dark:prose-invert">
          <h2>What Is the Fixed Charge Coverage Ratio (FCCR)?</h2>
          <p>The Fixed-Charge Coverage Ratio (FCCR) measures a firm's ability to pay all of its fixed charges or expenses with its income before interest and income taxes. It is a critical solvency metric used by banks to determine if a business can comfortably take on additional debt.</p>
          
          <h2>How It Works</h2>
          <p>The standard formula is: <strong>FCCR = (EBIT + Fixed Charges Before Tax) / (Fixed Charges Before Tax + Interest Expense)</strong>. Fixed charges primarily include lease payments and principal debt repayments. Adding lease payments back into EBIT provides a more accurate picture of total available cash flow before fixed obligations are paid.</p>

          <h2>Understanding Your Results</h2>
          <p>A ratio of exactly 1.0x means your business generates exactly enough cash to pay its fixed bills—leaving $0 for growth, reinvestment, or dividends. A ratio of 1.25x or higher is generally required by commercial lenders, indicating a 25% "cushion" of safety.</p>
          
          <h2>Key Factors</h2>
          <p>Unlike the Interest Coverage Ratio, which only looks at interest payments, the FCCR includes lease payments and (sometimes) principal repayments. This makes it a much stricter and more comprehensive measure of financial health, especially for businesses that lease lots of equipment or real estate.</p>
          
          <h2>Practical Examples</h2>
          <p>If a retail business has $250,000 in EBIT, $50,000 in lease payments, and $30,000 in interest expense: Their available income is $300,000, and their fixed charges are $80,000. Their FCCR is 300,000 / 80,000 = 3.75x. This is an extremely healthy ratio.</p>
          
          <h2>Benefits</h2>
          <p>Monitoring your FCCR helps you proactively manage cash flow and prevents you from over-leveraging your business with expensive equipment leases or new debt facilities.</p>
        </div>

        <FAQSection pageUrl="https://racira.com/calculator/fixed-charge-coverage-ratio-calculator" faqs={[
          { question: "What is a good Fixed Charge Coverage Ratio?", answer: "Generally, a ratio of 1.25x or higher is considered healthy. Ratios above 1.5x are considered excellent. Anything below 1.0x means the business is technically insolvent and cannot cover its obligations." },
          { question: "What is the difference between FCCR and Interest Coverage Ratio?", answer: "The Interest Coverage Ratio only looks at a company's ability to pay interest. The FCCR is more conservative because it also includes lease obligations and principal debt repayments, giving a truer picture of solvency." },
          { question: "Why are lease payments added back to EBIT?", answer: "Lease payments are subtracted to calculate standard EBIT. By adding them back, you find the total amount of cash generated before ANY fixed obligations were paid, which is necessary to calculate the true coverage ratio." },
          { question: "Do I include principal repayments?", answer: "Most conservative lenders will require you to include scheduled principal repayments in your fixed charges (often adjusted for taxes). If you have them, you should include them." }
        ]} />
        <PopularCalculators />
      </div>
    </>
  );
}
