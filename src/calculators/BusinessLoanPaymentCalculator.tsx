"use client";
import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Briefcase } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface BLPInputs { loanAmount: number; interestRate: number; loanTermMonths: number; originationFee: number; monthlyRevenue: number; }
interface BLPResults { monthlyPayment: number; totalInterest: number; totalCost: number; apr: number; payoffDate: string; monthlyRows: AmortRow[]; yearlyRows: AmortRow[]; chartData: { name: string; value: number; color: string }[]; summaryStats: { label: string; value: string }[]; }

function calcBLP(inp: BLPInputs): BLPResults {
  const { loanAmount, interestRate, loanTermMonths, originationFee, monthlyRevenue } = inp;
  const r = interestRate / 100 / 12;
  const n = loanTermMonths;
  const monthlyPayment = loanAmount > 0 && n > 0
    ? (r > 0 ? loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : loanAmount / n)
    : 0;
  const totalInterest = Math.max(0, monthlyPayment * n - loanAmount);
  const totalCost = loanAmount + totalInterest + originationFee;
  const effectiveLoan = loanAmount - originationFee;
  const aprMonthly = effectiveLoan > 0 ? (monthlyPayment / effectiveLoan - 1 + Math.pow(monthlyPayment / effectiveLoan, 0)) : 0;
  const apr = interestRate; // simplified

  const d = new Date(); d.setMonth(d.getMonth() + n);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const payoffDate = `${months[d.getMonth()]} ${d.getFullYear()}`;

  let balance = loanAmount; const monthlyRows: AmortRow[] = [];
  for (let m = 1; m <= n && balance > 0.01; m++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance -= principal;
    monthlyRows.push({ period: m, payment: interest + principal, principal, interest, balance: Math.max(0, balance) });
  }
  const yearlyRows: AmortRow[] = [];
  for (let y = 0; y < Math.ceil(monthlyRows.length / 12); y++) {
    const sl = monthlyRows.slice(y * 12, (y + 1) * 12);
    if (!sl.length) break;
    yearlyRows.push({ period: y + 1, payment: sl.reduce((s, r) => s + r.payment, 0), principal: sl.reduce((s, r) => s + r.principal, 0), interest: sl.reduce((s, r) => s + r.interest, 0), balance: sl[sl.length - 1].balance });
  }
  const chartData = [
    { name: "Principal", value: loanAmount, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterest, color: "#f59e0b" },
    { name: "Origination Fee", value: originationFee, color: "#10b981" },
  ].filter(d => d.value > 0);
  const dscr = monthlyRevenue > 0 ? (monthlyRevenue / monthlyPayment) : 0;
  const summaryStats = [
    { label: "Monthly Payment", value: `$${monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Origination Fee", value: `$${originationFee.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Cost of Loan", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Debt Service Coverage", value: dscr > 0 ? `${dscr.toFixed(2)}x` : "N/A" },
    { label: "Payoff Date", value: payoffDate },
  ];
  return { monthlyPayment, totalInterest, totalCost, apr, payoffDate, monthlyRows, yearlyRows, chartData, summaryStats };
}

const DEFAULTS = { loanAmount: "250000", interestRate: "7.5", loanTermMonths: "60", originationFee: "2500", monthlyRevenue: "50000" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>
) : null;

export default function BusinessLoanPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermMonths, setLoanTermMonths] = useState(DEFAULTS.loanTermMonths);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [originationFee, setOriginationFee] = useState(DEFAULTS.originationFee);
  const [monthlyRevenue, setMonthlyRevenue] = useState(DEFAULTS.monthlyRevenue);
  const [results, setResults] = useState<BLPResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => setResults(calcBLP({
    loanAmount: parseFloat(loanAmount) || 0, interestRate: parseFloat(interestRate) || 0,
    loanTermMonths: parseFloat(loanTermMonths) || 0, originationFee: parseFloat(originationFee) || 0,
    monthlyRevenue: parseFloat(monthlyRevenue) || 0,
  }));
  const handleReset = () => { setLoanAmount(DEFAULTS.loanAmount); setInterestRate(DEFAULTS.interestRate); setLoanTermMonths(DEFAULTS.loanTermMonths); setOriginationFee(DEFAULTS.originationFee); setMonthlyRevenue(DEFAULTS.monthlyRevenue); setShowAdvanced(false); };
  useEffect(() => { handleCalculate(); }, []);
  const handlePrint = () => { if (!printRef.current) return; const w = window.open("", "_blank"); if (!w) return; w.document.write(`<html><head><title>Business Loan</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`); w.document.write(printRef.current.innerHTML); w.document.write("</body></html>"); w.document.close(); w.print(); };

  const faqs = [
    { question: "What is a typical business loan interest rate?", answer: "Business loan rates vary widely by lender and borrower profile. SBA loans range from 6% to 13%, bank term loans from 5% to 12%, and online lenders from 10% to 30%+. Your rate depends on credit score, time in business, revenue, and collateral." },
    { question: "What is the Debt Service Coverage Ratio (DSCR)?", answer: "DSCR measures your business's ability to repay debt from its operating income. DSCR = Net Operating Income / Total Debt Service. A ratio above 1.25x is typically required by lenders; below 1.0x means you cannot cover your payments from business income." },
    { question: "How do origination fees affect the true cost of a loan?", answer: "Origination fees are paid upfront but represent an effective increase in your loan cost. A $2,500 fee on a $250,000 loan at 7.5% over 60 months means you receive less than the full amount but pay interest on the full principal, raising your effective APR." },
    { question: "Should I choose a shorter or longer loan term?", answer: "Shorter terms mean higher monthly payments but significantly less total interest. Longer terms free up monthly cash flow but cost more overall. For a business, the right term depends on the useful life of the asset being financed and your projected cash flow." },
    { question: "What types of business loans are available?", answer: "Common types include SBA 7(a) loans (government-backed, best rates), term loans (fixed payment schedules), lines of credit (revolving), equipment financing, invoice factoring, and merchant cash advances. Each has different rate structures and repayment terms." },
    { question: "Can I pay off a business loan early?", answer: "Many business loans allow early repayment, but some lenders charge prepayment penalties—especially SBA loans during the first 3 years. Always check your loan agreement for prepayment penalties before making extra payments." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Business Loan Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Business Loan Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="loan-amount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
              <CompactInput id="interest-rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="term" label="Loan Term" value={loanTermMonths} onChange={setLoanTermMonths} suffix="months" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="fee" label="Origination Fee" value={originationFee} onChange={setOriginationFee} prefix="$" />
                  <CompactInput id="revenue" label="Monthly Revenue" value={monthlyRevenue} onChange={setMonthlyRevenue} prefix="$" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">For {loanTermMonths} months at {interestRate}% APR</div>
                </div>
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Loan Amount", `$${(parseFloat(loanAmount)||0).toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Interest", `$${results.totalInterest.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Cost", `$${results.totalCost.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-lg font-bold ${i === 1 ? "text-amber-600" : ""}`}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Loan Summary</h3>
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
                <div className="mt-2 card-calculator !p-5 border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold">Amortization Schedule</h3>
                    <div className="flex rounded-md border border-input overflow-hidden h-8">
                      <button onClick={() => setViewMode("monthly")} className={`px-3 text-xs font-semibold transition-colors ${viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Monthly</button>
                      <button onClick={() => setViewMode("yearly")} className={`px-3 text-xs font-semibold transition-colors border-l border-input ${viewMode === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Yearly</button>
                    </div>
                  </div>
                  <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows} yearly={viewMode === "yearly"} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Business Loan Payments</h2>
            <p>A <strong>Business Loan Payment Calculator</strong> is an essential financial planning tool for any entrepreneur or business owner seeking debt financing. Unlike personal loans, business loans come with a vastly wider range of structures, rates, and fees that can make it difficult to compare offers side-by-side. This calculator simplifies that process by computing your exact monthly payment, total interest cost, and complete amortization schedule in seconds, enabling you to make data-driven borrowing decisions.</p>
            <p>Understanding the true cost of a business loan goes beyond the monthly payment figure. A loan with a low monthly payment stretched over a long term may cost your business far more in total interest than a higher-payment, shorter-term loan. This calculator makes those trade-offs immediately visible.</p>

            <h2 className="text-2xl font-bold mb-3">How Business Loan Payments Are Calculated</h2>
            <p>Most business term loans are amortizing loans, meaning each monthly payment covers both the accruing interest and a portion of the principal balance. The standard amortization formula is: <strong>M = P × [r(1+r)^n] / [(1+r)^n – 1]</strong>, where M is the monthly payment, P is the loan principal, r is the monthly interest rate (APR divided by 12), and n is the total number of monthly payments.</p>
            <p>In the early months of the loan, the majority of your payment goes toward interest—because the outstanding balance is at its highest. As you pay down the principal, the interest portion shrinks and more of your payment goes toward reducing the debt. This is the essence of amortization.</p>

            <h2 className="text-2xl font-bold mb-3">Key Variables That Affect Your Payment</h2>
            <p><strong>Loan Amount:</strong> The principal is the most direct driver of your payment. Borrowing $500,000 instead of $250,000 at the same rate and term will exactly double your monthly payment.</p>
            <p><strong>Interest Rate (APR):</strong> Business loan rates vary dramatically—from as low as 6% for SBA-backed loans to 30%+ for online alternative lenders. Even a 2% difference in rate on a $250,000 loan over 5 years represents thousands of dollars in additional interest.</p>
            <p><strong>Loan Term:</strong> The term is the repayment period in months. A 36-month term yields higher payments than a 60-month term for the same loan amount and rate, but results in significantly less total interest paid.</p>

            <h2 className="text-2xl font-bold mb-3">The Debt Service Coverage Ratio (DSCR)</h2>
            <p>The DSCR is one of the most important metrics lenders use to evaluate whether a business can safely take on a loan. It is calculated as: <strong>DSCR = Net Operating Income / Total Annual Debt Service</strong>. Most traditional lenders require a minimum DSCR of 1.25x, meaning the business generates 25% more income than its total debt obligations. Our Advanced Options panel calculates your DSCR automatically when you enter your monthly revenue.</p>
            <p>A DSCR below 1.0x is a red flag—it means your current income cannot cover the proposed loan payments, and lenders will likely decline the application. A DSCR of 2.0x or higher indicates strong financial health and gives you negotiating power to secure better rates.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Origination Fees</h2>
            <p>Origination fees are one-time upfront charges levied by the lender for processing the loan application and disbursing funds. They are typically expressed as a percentage of the loan amount (1% to 5%) or as a flat dollar fee. While they do not directly affect your monthly payment calculation, they significantly impact the true cost of borrowing. A $2,500 origination fee on a $250,000 loan means you effectively receive $247,500 in usable capital while paying interest on the full $250,000 principal.</p>

            <h2 className="text-2xl font-bold mb-3">Types of Business Loans</h2>
            <p><strong>SBA 7(a) Loans:</strong> Government-guaranteed loans offered through approved banks, providing the most favorable rates (currently 6%–13% depending on the prime rate). Best suited for established businesses with strong credit profiles. Loan amounts up to $5 million with terms up to 10 years for working capital.</p>
            <p><strong>Term Loans:</strong> Traditional bank or credit union financing with fixed monthly payments over a set period. Typically requires 2+ years in business, strong revenue, and a personal credit score above 680. Rates generally range from 5% to 15%.</p>
            <p><strong>Online Business Loans:</strong> Faster approval (sometimes same-day) with more flexible eligibility requirements. The trade-off is significantly higher interest rates—often 15% to 35%—and shorter terms. Best used for short-term cash flow needs, not long-term asset financing.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Example 1: Short vs. Long Term on a $200,000 Loan at 8% APR.</strong> A 36-month term produces a monthly payment of $6,267 and a total interest cost of $25,605. A 60-month term drops the payment to $4,057 but increases total interest to $43,420—a difference of $17,815. The lower monthly payment comes at a steep long-term price.</p>
            <p><strong>Example 2: Rate Shopping on a $500,000 Loan over 60 Months.</strong> At 7% APR, your monthly payment is $9,901 and total interest is $94,073. At 10% APR (a common online lender rate), your monthly payment rises to $10,624 and total interest jumps to $137,418—a $43,345 difference. Securing a competitive rate should be your first priority before accepting any loan offer.</p>

            <h2 className="text-2xl font-bold mb-3">Best Practices for Business Borrowers</h2>
            <p><strong>Get Pre-Approved from Multiple Sources:</strong> Always compare at least three loan offers before committing. SBA lenders, community banks, credit unions, and CDFI lenders often offer better rates than online alternative lenders. The application process is more rigorous, but the savings are substantial.</p>
            <p><strong>Match Loan Term to Asset Life:</strong> Finance short-term needs (inventory, payroll) with short-term loans or lines of credit. Finance long-term assets (equipment, real estate) with long-term loans whose term does not exceed the useful life of the asset.</p>
            <p><strong>Read the Fine Print on Prepayment:</strong> Some business loans—particularly SBA loans in the first three years—carry prepayment penalties. If you anticipate generating excess cash flow that you would use to pay down the loan early, verify there are no penalties before signing.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/business-loan-payment-calculator" />
          <PopularCalculators exclude="/calculator/business-loan-payment-calculator" />
        </div>
      </div>
    </>
  );
}
