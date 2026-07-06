"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/domains/calculator/components/ui/AmortizationTable";
import { ChevronDown, Printer, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

interface HomeEquityInputs {
  homeValue: number;
  mortgageBalance: number;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  maxLtvAllowed: number;
  startDate: string;
}

interface HomeEquityResults {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  maxBorrowable: number;
  combinedLTV: number;
  payoffDate: string;
  isOverLtv: boolean;
  actualLoanAmount: number;
  chartData: { month: number; balance: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

const parseMonthStr = (mStr: string): number => {
  if (!mStr) return 1;
  const normalized = mStr.trim().toLowerCase();
  const monthsMap: Record<string, number> = {
    jan: 1, january: 1, "1": 1, "01": 1,
    feb: 2, february: 2, "2": 2, "02": 2,
    mar: 3, march: 3, "3": 3, "03": 3,
    apr: 4, april: 4, "4": 4, "04": 4,
    may: 5, "5": 5, "05": 5,
    jun: 6, june: 6, "6": 6, "06": 6,
    jul: 7, july: 7, "7": 7, "07": 7,
    aug: 8, august: 8, "8": 8, "08": 8,
    sep: 9, september: 9, "9": 9, "09": 9,
    oct: 10, october: 10, "10": 10,
    nov: 11, november: 11, "11": 11,
    dec: 12, december: 12, "12": 12,
  };
  return monthsMap[normalized] || parseInt(normalized) || 1;
};

const calculateHomeEquity = (inputs: HomeEquityInputs): HomeEquityResults => {
  const { homeValue, mortgageBalance, loanAmount, interestRate, termYears, maxLtvAllowed, startDate } = inputs;
  
  const maxBorrowable = Math.max(0, (homeValue * (maxLtvAllowed / 100)) - mortgageBalance);
  
  // They can ask for more than maxLTV, but we flag it
  const actualLoanAmount = loanAmount;
  const combinedLTV = homeValue > 0 ? ((mortgageBalance + actualLoanAmount) / homeValue) * 100 : 0;
  const isOverLtv = combinedLTV > maxLtvAllowed;

  const r = interestRate / 100 / 12;
  const n = termYears * 12;
  const monthlyPayment = r > 0 && n > 0 
    ? (actualLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : actualLoanAmount / (n || 1);

  let bal = actualLoanAmount;
  let totalInterest = 0;
  const chartData = [{ month: 0, balance: Math.round(bal) }];
  const monthlyRows: AmortRow[] = [];

  for (let m = 1; m <= n; m++) {
    const int = bal * r;
    let prin = monthlyPayment - int;
    if (prin > bal) prin = bal; // last payment adjustment
    
    totalInterest += int;
    bal -= prin;
    
    monthlyRows.push({
      period: m,
      payment: int + prin,
      principal: prin,
      interest: int,
      balance: Math.max(0, bal)
    });

    if (m % 12 === 0 || m === n) {
      chartData.push({ month: m, balance: Math.max(0, Math.round(bal)) });
    }
  }

  const yearlyRows: AmortRow[] = [];
  for (let y = 0; y < Math.ceil(monthlyRows.length / 12); y++) {
    const yearSlice = monthlyRows.slice(y * 12, (y + 1) * 12);
    if (yearSlice.length === 0) break;
    yearlyRows.push({
      period: y + 1,
      payment: yearSlice.reduce((s, row) => s + row.payment, 0),
      principal: yearSlice.reduce((s, row) => s + row.principal, 0),
      interest: yearSlice.reduce((s, row) => s + row.interest, 0),
      balance: yearSlice[yearSlice.length - 1].balance,
    });
  }

  const totalPaid = actualLoanAmount + totalInterest;

  const sd = startDate.split("-");
  const startMonth = parseMonthStr(sd[1]);
  const startYear = parseInt(sd[0]) || new Date().getFullYear();
  const payoffMonth = ((startMonth - 1 + n) % 12) + 1;
  const payoffYear = startYear + Math.floor((startMonth - 1 + n) / 12);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const summaryStats = [
    { label: "Home Value", value: `$${homeValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Existing Mortgage", value: `$${mortgageBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Max Borrowable (At 85% LTV)", value: `$${maxBorrowable.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Combined LTV", value: `${combinedLTV.toFixed(1)}%` },
  ];

  const breakdown = [
    { label: "Loan Amount Borrowed", amount: `$${actualLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-primary" },
    { label: "Total Interest Over Term", amount: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-amber-500" },
    { label: "Total Repayment Cost", amount: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true },
  ];

  return {
    monthlyPayment,
    totalPaid,
    totalInterest,
    maxBorrowable,
    combinedLTV,
    payoffDate: `${monthNames[payoffMonth - 1]} ${payoffYear}`,
    isOverLtv,
    actualLoanAmount,
    chartData,
    summaryStats,
    breakdown,
    monthlyRows,
    yearlyRows
  };
};

const DEFAULTS = {
  homeValue: "450000",
  mortgageBalance: "200000",
  loanAmount: "80000",
  interestRate: "8.5",
  termYears: "15",
  maxLtvAllowed: "85",
};

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-1">Month {label} ({Math.floor(label/12)}y {label%12}m)</p>
        <p className="text-primary font-bold">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
      </div>
    );
  }
  return null;
};

export default function HomeEquityLoanCalculator() {
  const d = new Date();
  const startD = `${d.getFullYear()}-${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`;
  
  const [homeValue, setHomeValue] = useState(DEFAULTS.homeValue);
  const [mortgageBalance, setMortgageBalance] = useState(DEFAULTS.mortgageBalance);
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [termYears, setTermYears] = useState(DEFAULTS.termYears);
  const [maxLtvAllowed, setMaxLtvAllowed] = useState(DEFAULTS.maxLtvAllowed);
  const [startDate, setStartDate] = useState(startD);

  const [results, setResults] = useState<HomeEquityResults | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateHomeEquity({
      homeValue: parseFloat(homeValue) || 0,
      mortgageBalance: parseFloat(mortgageBalance) || 0,
      loanAmount: parseFloat(loanAmount) || 0,
      interestRate: parseFloat(interestRate) || 0,
      termYears: parseInt(termYears) || 0,
      maxLtvAllowed: parseFloat(maxLtvAllowed) || 85,
      startDate
    }));
  };

  const handleReset = () => {
    setHomeValue(DEFAULTS.homeValue); setMortgageBalance(DEFAULTS.mortgageBalance); setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate); setTermYears(DEFAULTS.termYears); setMaxLtvAllowed(DEFAULTS.maxLtvAllowed);
    setStartDate(startD); setShowAdvanced(false);
    setResults(calculateHomeEquity({
      homeValue: parseFloat(DEFAULTS.homeValue), mortgageBalance: parseFloat(DEFAULTS.mortgageBalance), loanAmount: parseFloat(DEFAULTS.loanAmount),
      interestRate: parseFloat(DEFAULTS.interestRate), termYears: parseInt(DEFAULTS.termYears), maxLtvAllowed: parseFloat(DEFAULTS.maxLtvAllowed), startDate: startD
    }));
  };

  useEffect(() => { handleCalculate(); }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Home Equity Loan Est.</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a home equity loan?", answer: "A home equity loan lets you borrow a lump sum against your home's equity—the difference between its market value and your outstanding mortgage balance. Unlike a HELOC (which acts like a credit card), a home equity loan has a fixed interest rate and fixed monthly payments for the entire term, making it highly predictable and easy to budget." },
    { question: "How much can I borrow?", answer: "Most lenders allow a combined loan-to-value (CLTV) ratio of up to 80% to 85%. The formula is: Max Loan = (Home Value × 0.85) − Mortgage Balance. For example, if your home is worth $450,000 and you owe $200,000, 85% of your home's value is $382,500. Subtract your mortgage, and your maximum borrowable amount is $182,500." },
    { question: "Home equity loan vs. HELOC — which is better?", answer: "Choose a home equity loan if you need a single lump sum for a specific project (like a roof replacement or debt consolidation) and want the stability of a fixed interest rate and fixed payments. Choose a HELOC if you need ongoing, flexible access to cash over several years (like paying for college tuition) and are comfortable with a variable rate." },
    { question: "Is the interest tax-deductible?", answer: "Under current IRS rules (Tax Cuts and Jobs Act), the interest on a home equity loan is only tax-deductible if the funds are used to 'buy, build, or substantially improve' the home that secures the loan. If you use the loan to pay off credit cards, buy a car, or pay for education, the interest is not tax-deductible." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Home Equity Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Equity Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <CompactInput id="home" label="Estimated Home Value" value={homeValue} onChange={setHomeValue} prefix="$" />
            <CompactInput id="mortgage" label="Current Mortgage Balance" value={mortgageBalance} onChange={setMortgageBalance} prefix="$" />
            <CompactInput id="loan" label="Desired Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-4">
                    <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
                    <CompactInput id="term" label="Loan Term" value={termYears} onChange={setTermYears} suffix="yrs" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-foreground mb-1.5">Start Date</label>
                      <div className="grid grid-cols-2 gap-2 h-10">
                        <select
                          value={startDate.split("-")[1] || "Jan"}
                          onChange={(e) => { const y = startDate.split("-")[0] || "2026"; setStartDate(`${y}-${e.target.value}`); }}
                          className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                        >
                          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input
                          type="text" value={startDate.split("-")[0] || ""}
                          onChange={(e) => { const m = startDate.split("-")[1] || "May"; setStartDate(`${e.target.value}-${m}`); }}
                          placeholder="Year"
                          className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                        />
                      </div>
                    </div>
                    <CompactInput id="maxltv" label="Max LTV Limit" value={maxLtvAllowed} onChange={setMaxLtvAllowed} suffix="%" />
                  </div>
                </div>
              )}
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
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Monthly Payment</div>
                  <div className="text-4xl font-bold text-primary tracking-tighter mb-2">
                    ${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {results.isOverLtv 
                      ? <span className="text-red-500 font-bold">Warning: Desired loan exceeds {maxLtvAllowed}% LTV limit.</span>
                      : `CLTV is ${results.combinedLTV.toFixed(1)}%. You are within the ${maxLtvAllowed}% limit.`}
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[15px] py-3 px-3">{item.label}</td>
                            <td className={`text-[15px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Remaining Balance Over Time</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalanceHE" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(val) => `${Math.floor(val/12)}y`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBalanceHE)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 card-calculator !p-5 border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold">Amortization Schedule</h3>
                    <div className="flex rounded-md border border-input overflow-hidden h-8">
                      <button onClick={() => setViewMode("monthly")} className={`px-3 text-xs font-semibold transition-colors ${viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Monthly</button>
                      <button onClick={() => setViewMode("yearly")} className={`px-3 text-xs font-semibold transition-colors border-l border-input ${viewMode === "yearly" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Yearly</button>
                    </div>
                  </div>
                  <LazyView minHeight={300}>
                    <AmortizationTable rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows} yearly={viewMode === "yearly"} />
                  </LazyView>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Home Equity Loan Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A home equity loan calculator is a financial planning tool that determines how much you can borrow against the paid-off portion of your property and what your exact monthly payments will be. Also known as a "second mortgage," a home equity loan provides you with a single, lump-sum payout at a fixed interest rate. Because your home secures the loan, rates are significantly lower than personal loans or credit cards. This calculator helps you navigate lender borrowing limits while charting your exact repayment schedule over the life of the loan.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                The engine behind a home equity loan is standard amortization math, identical to your primary mortgage. Your fixed monthly payment is calculated using a formula that ensures your principal balance reaches zero at the exact end of your chosen term. Every payment is split between interest (calculated on the remaining balance) and principal reduction. In the early years, the majority of your payment goes to interest. As the balance falls, an increasing percentage of your payment is applied to the principal.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                The estimated monthly payment is your locked-in financial commitment; unlike a HELOC, it will never increase. The total interest metric reveals the true cost of borrowing the money, while the amortization schedule breaks down exactly how each payment chips away at the debt. The calculator also flags your Combined Loan-to-Value (CLTV) ratio. If your requested loan pushes your CLTV over the lender's limit (typically 80% to 85%), you will receive a warning indicating that your desired loan amount may not be approved.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your estimated home value and current mortgage balance dictate your available equity. Lenders will not let you borrow 100% of your equity; they typically cap total borrowing at 80% to 85% of the home's value to protect themselves against market downturns. The interest rate is the cost of borrowing; home equity loan rates are slightly higher than primary mortgage rates but much lower than unsecured debt. The loan term (usually 5 to 15 years) dramatically affects your payment: shorter terms have higher monthly payments but save you thousands in total interest.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
              <p className="text-muted-foreground leading-relaxed">
                The advanced options allow you to simulate specific lender constraints. You can adjust the Max LTV Limit to match the exact guidelines of your bank or credit union (some go up to 90%, while conservative lenders cap at 75%). By entering a specific start date, the calculator generates an exact payoff date and amortization table, allowing you to align your debt repayment timeline with retirement or college tuition schedules. 
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
              <p className="text-muted-foreground leading-relaxed">
                Home equity loans are incredibly powerful tools for debt consolidation. If you have $50,000 in credit card debt at 22% interest, paying it off with an 8% home equity loan will save you thousands and drastically reduce your monthly obligations. However, this debt is secured by your house. If you default on a home equity loan, the lender can foreclose on your property. Therefore, you should never use home equity to fund lifestyle expenses, vacations, or depreciating assets like cars. Reserve this financial tool for value-adding home renovations or high-interest debt elimination.
              </p>
            </div>
          </section>
          
          <FAQSection faqs={[
            { question: "What is a home equity loan?", answer: "A home equity loan lets you borrow a lump sum against your home's equity—the difference between its market value and your outstanding mortgage balance. Unlike a HELOC (which acts like a credit card), a home equity loan has a fixed interest rate and fixed monthly payments for the entire term, making it highly predictable and easy to budget." },
            { question: "How much can I borrow?", answer: "Most lenders allow a combined loan-to-value (CLTV) ratio of up to 80% to 85%. The formula is: Max Loan = (Home Value × 0.85) − Mortgage Balance. For example, if your home is worth $450,000 and you owe $200,000, 85% of your home's value is $382,500. Subtract your mortgage, and your maximum borrowable amount is $182,500." },
            { question: "Home equity loan vs. HELOC — which is better?", answer: "Choose a home equity loan if you need a single lump sum for a specific project (like a roof replacement or debt consolidation) and want the stability of a fixed interest rate and fixed payments. Choose a HELOC if you need ongoing, flexible access to cash over several years (like paying for college tuition) and are comfortable with a variable rate." },
            { question: "Is the interest tax-deductible?", answer: "Under current IRS rules (Tax Cuts and Jobs Act), the interest on a home equity loan is only tax-deductible if the funds are used to 'buy, build, or substantially improve' the home that secures the loan. If you use the loan to pay off credit cards, buy a car, or pay for education, the interest is not tax-deductible." }
          ]} pageUrl="https://racira.com/calculator/home-equity-loan-calculator" />
          <PopularCalculators exclude="/calculator/home-equity-loan-calculator" />
        </div>
      </div>
    </>
  );
}
