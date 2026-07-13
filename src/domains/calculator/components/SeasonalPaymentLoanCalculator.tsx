"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/domains/calculator/components/ui/AmortizationTable";
import { RotateCcw, Calendar, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SeasonalResult {
  activeMonthPayment: number;
  totalInterest: number;
  totalPaid: number;
  offSeasonInterestMode: "paid" | "capitalized";
  rows: AmortRow[];
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSeasonal(loanAmount: number, interestRate: number, loanTermYears: number, activeMonthsPerYear: number, offSeasonInterestMode: "paid" | "capitalized"): SeasonalResult {
  const r = interestRate / 100 / 12; // monthly interest rate
  const totalMonths = loanTermYears * 12;
  const offMonthsPerYear = 12 - activeMonthsPerYear;
  
  // We need to find the payment amount P that makes the present value of the cash flows equal to the loan amount.
  // Because the payments are irregular (e.g. pay Jan-Jun, skip Jul-Dec), standard formulas don't work directly.
  // We use Newton-Raphson or binary search to find the exact payment P.
  
  // Let's use a binary search to find the payment P
  let low = 0;
  let high = loanAmount;
  let payment = (low + high) / 2;
  
  // Create an array representing whether a month requires a payment (1) or not (0).
  // We'll assume the year starts with the active months.
  const paymentSchedule: number[] = Array(totalMonths).fill(0);
  for (let year = 0; year < loanTermYears; year++) {
    for (let m = 0; m < activeMonthsPerYear; m++) {
      paymentSchedule[year * 12 + m] = 1;
    }
  }

  // Simulation function to check if a payment P pays off the loan
  const simulate = (p: number) => {
    let balance = loanAmount;
    for (let i = 0; i < totalMonths; i++) {
      const interest = balance * r;
      if (paymentSchedule[i] === 1) {
        // Active month: pay P
        balance = balance + interest - p;
      } else {
        // Off-season month
        if (offSeasonInterestMode === "paid") {
          // You pay interest out of pocket, balance doesn't change
          balance = balance; 
        } else {
          // Interest capitalizes
          balance = balance + interest;
        }
      }
    }
    return balance;
  };

  // Binary search
  for (let i = 0; i < 60; i++) {
    const endBalance = simulate(payment);
    if (Math.abs(endBalance) < 0.001) break;
    if (endBalance > 0) {
      low = payment;
    } else {
      high = payment;
    }
    payment = (low + high) / 2;
  }

  // Now build the actual rows and totals
  const rows: AmortRow[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPaid = 0;

  for (let i = 0; i < totalMonths; i++) {
    const interest = balance * r;
    let principal = 0;
    let actualPayment = 0;

    if (paymentSchedule[i] === 1) {
      actualPayment = payment;
      principal = actualPayment - interest;
      if (principal > balance) {
        principal = balance;
        actualPayment = principal + interest;
      }
      balance -= principal;
    } else {
      if (offSeasonInterestMode === "paid") {
        actualPayment = interest;
        principal = 0;
      } else {
        actualPayment = 0;
        principal = -interest; // negative principal = capitalization
        balance += interest;
      }
    }

    totalInterest += interest;
    totalPaid += actualPayment;

    rows.push({
      period: i + 1,
      payment: actualPayment,
      principal: principal,
      interest: interest,
      balance: Math.max(0, balance)
    });
  }

  const chartData = [
    { name: "Principal", value: loanAmount, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterest, color: "#f59e0b" },
  ];

  const summaryStats = [
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Active Month Payment", value: `$${payment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Off-Season Payment", value: offSeasonInterestMode === "paid" ? "Interest Only" : "$0.00" },
    { label: "Months Paying / Year", value: `${activeMonthsPerYear} months` },
    { label: "Total Interest Paid", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { activeMonthPayment: payment, totalInterest, totalPaid, offSeasonInterestMode, rows, chartData, summaryStats };
}

const DEFAULTS = { loanAmount: "50000", interestRate: "8.5", loanTermYears: "5", activeMonthsPerYear: "6", offSeasonInterestMode: "capitalized" as const };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function SeasonalPaymentLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [activeMonthsPerYear, setActiveMonthsPerYear] = useState(DEFAULTS.activeMonthsPerYear);
  const [offSeasonInterestMode, setOffSeasonInterestMode] = useState<"paid" | "capitalized">(DEFAULTS.offSeasonInterestMode);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<SeasonalResult | null>(null);

  const calc = () => setResults(calcSeasonal(parseFloat(loanAmount)||0, parseFloat(interestRate)||0, parseFloat(loanTermYears)||5, parseFloat(activeMonthsPerYear)||6, offSeasonInterestMode));
  const reset = () => { setLoanAmount(DEFAULTS.loanAmount); setInterestRate(DEFAULTS.interestRate); setLoanTermYears(DEFAULTS.loanTermYears); setActiveMonthsPerYear(DEFAULTS.activeMonthsPerYear); setOffSeasonInterestMode(DEFAULTS.offSeasonInterestMode); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is a seasonal payment loan?", answer: "A seasonal payment loan is a specialized commercial financing structure designed for businesses with highly fluctuating revenue cycles. Instead of paying a fixed amount every month of the year, the borrower only makes full principal and interest payments during their peak 'active' months (e.g., a ski resort paying November to April). During the off-season, payments are reduced or suspended entirely." },
    { question: "How does the off-season work?", answer: "During the off-season months when you are not making full payments, the lender still charges interest on the outstanding loan balance. The loan contract will specify how this interest is handled. You will either be required to make small 'interest-only' payments out of pocket, or the interest will be 'capitalized'—meaning it is added to your total loan balance to be paid off later." },
    { question: "Why are the active month payments so high?", answer: "If you take a 5-year loan but only make payments 6 months out of the year, you are effectively paying off a 60-month loan in just 30 actual payments. Because the amortization schedule is compressed into half the time, the required monthly payment during the active season will be significantly larger than a standard 12-month schedule." },
    { question: "Is capitalized interest dangerous?", answer: "Capitalized interest means you are 'paying interest on interest.' When the unpaid off-season interest is added to your loan principal, your balance goes up instead of down. When the active season begins again, your new payments are calculated based on this larger, compounded balance. While excellent for cash flow, capitalizing interest makes the loan mathematically more expensive in the long run." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Seasonal Payment Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Seasonal Payment Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="loan" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="years" />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Active Months / Yr</label>
                <select value={activeMonthsPerYear} onChange={e => setActiveMonthsPerYear(e.target.value)} className="h-10 px-3 text-sm border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="3">3 months paying</option>
                  <option value="4">4 months paying</option>
                  <option value="6">6 months paying</option>
                  <option value="8">8 months paying</option>
                  <option value="9">9 months paying</option>
                  <option value="10">10 months paying</option>
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Off-Season Interest Rules <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <label className="text-sm font-semibold text-foreground">How is off-season interest handled?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setOffSeasonInterestMode("capitalized")} className={`h-10 rounded-md border text-xs font-medium transition-colors ${offSeasonInterestMode === "capitalized" ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>Added to Balance ($0 due)</button>
                    <button onClick={() => setOffSeasonInterestMode("paid")} className={`h-10 rounded-md border text-xs font-medium transition-colors ${offSeasonInterestMode === "paid" ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>Paid Monthly (Interest Only)</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Active Season Monthly Payment</div>
                <div className="text-4xl font-bold text-foreground">${results.activeMonthPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">Due during the {activeMonthsPerYear} active months of the year.</div>
              </div>

              {results.offSeasonInterestMode === "capitalized" && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-sm text-amber-700 font-medium">⚠️ <strong>Capitalized Interest:</strong> During your {12 - parseFloat(activeMonthsPerYear)} off-season months, you pay $0. However, interest still accrues and is added to your loan balance. Review the amortization schedule to see your balance temporarily increase.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Interest", `$${results.totalInterest.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Cost", `$${results.totalPaid.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-xl font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Loan Structure</h3>
                  <div className="space-y-2.5">
                    {results.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                        <span className="text-sm text-muted-foreground">{s.label}:</span>
                        <span className="text-sm font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                  <h3 className="text-base font-bold mb-2 w-full text-left">Cost Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                        {results.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                    {results.chartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card mt-2 max-h-[400px] overflow-y-auto">
                <h3 className="text-base font-bold mb-4">Monthly Amortization (Year 1 & 2)</h3>
                <AmortizationTable rows={results.rows.slice(0, 24)} yearly={false} />
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Financing for Highly Cyclical Businesses</h2>
            <p>Traditional commercial loans require fixed, equal monthly payments for the life of the loan. For a standard retail store, this structure works well. But for a business dependent on seasons—like an oceanfront hotel, a snow removal company, or an agricultural supplier—a fixed payment can trigger a devastating cash crunch during the off-season. The <strong>Seasonal Payment Loan Calculator</strong> demonstrates how customized debt structuring allows a business to match its debt service directly to its revenue cycle.</p>

            <h2 className="text-2xl font-bold mb-3">The Compression Effect on Cash Flow</h2>
            <p>When you negotiate a seasonal payment schedule, you are not skipping payments; you are <em>compressing</em> them. If you take out a 60-month commercial loan but arrange to only make payments 6 months out of the year (during your peak season), the entire loan must be amortized over just 30 actual payments. Because the amortization timeline is cut in half, the required monthly payment during those active months will be significantly higher than if you had spread it over the full 12 months. You must ensure your peak season revenue is robust enough to absorb these heavier, compressed payments.</p>

            <h2 className="text-2xl font-bold mb-3">The Cost of Capitalized Interest</h2>
            <p>What happens to the loan during the off-season? Your lender is not going to stop charging you interest just because your business is closed. The contract will handle this interest in one of two ways. The most cash-flow-friendly option is to <strong>capitalize</strong> the interest. This means you pay absolutely nothing out of pocket during the off-season. However, the interest the bank charges you each month is simply added to your total loan balance. When your peak season starts again, your balance is higher than when the peak season ended.</p>
            <p>Alternatively, the lender may require <strong>interest-only payments</strong> during the off-season. This requires you to keep some cash reserves to make small monthly payments when revenue is low, but it prevents your principal balance from increasing and significantly lowers the total lifetime cost of the loan.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/seasonal-payment-loan-calculator" />
          <PopularCalculators exclude="/calculator/seasonal-payment-loan-calculator" />
        </div>
      </div>
    </>
  );
}
