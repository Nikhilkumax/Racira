"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/domains/calculator/components/ui/AmortizationTable";
import { RotateCcw, Briefcase, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface SbaResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  guaranteeFeeAmount: number;
  totalLoanAmount: number;
  rows: AmortRow[];
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSba(baseLoanAmount: number, interestRate: number, loanTermYears: number, financeGuaranteeFee: boolean): SbaResult {
  // SBA 7(a) Guarantee Fee calculation (simplified for standard maturities > 12 months)
  // Up to $150,000: 2% of the guaranteed portion
  // $150,001 to $700,000: 3% of the guaranteed portion
  // $700,001 to $5,000,000: 3.5% of guaranteed portion up to $1M, plus 3.75% of guaranteed portion over $1M
  // Guaranty percentage is usually 85% for loans <= $150k, 75% for loans > $150k
  
  let guarantyPct = 0.75;
  if (baseLoanAmount <= 150000) guarantyPct = 0.85;
  
  const guaranteedPortion = baseLoanAmount * guarantyPct;
  
  let guaranteeFeePct = 0;
  let guaranteeFeeAmount = 0;
  
  if (baseLoanAmount <= 150000) {
    guaranteeFeePct = 0.02;
    guaranteeFeeAmount = guaranteedPortion * guaranteeFeePct;
  } else if (baseLoanAmount <= 700000) {
    guaranteeFeePct = 0.03;
    guaranteeFeeAmount = guaranteedPortion * guaranteeFeePct;
  } else {
    const guaranteedUpTo1M = Math.min(1000000, baseLoanAmount) * 0.75; // 75% of the first 1M
    const guaranteedOver1M = Math.max(0, baseLoanAmount - 1000000) * 0.75;
    guaranteeFeeAmount = (guaranteedUpTo1M * 0.035) + (guaranteedOver1M * 0.0375);
  }

  const totalLoanAmount = financeGuaranteeFee ? baseLoanAmount + guaranteeFeeAmount : baseLoanAmount;
  
  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;
  
  const monthlyPayment = totalLoanAmount > 0 && n > 0
    ? (r > 0 ? totalLoanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : totalLoanAmount / n)
    : 0;

  const totalInterest = Math.max(0, monthlyPayment * n - totalLoanAmount);
  const totalPaid = totalLoanAmount + totalInterest;

  const rows: AmortRow[] = [];
  let balance = totalLoanAmount;
  for (let i = 1; i <= n && balance > 0.01; i++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance -= principal;
    rows.push({ period: i, payment: interest + principal, principal, interest, balance: Math.max(0, balance) });
  }

  const chartData = [
    { name: "Base Loan Principal", value: baseLoanAmount, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterest, color: "#f59e0b" },
  ];
  if (financeGuaranteeFee && guaranteeFeeAmount > 0) {
    chartData.push({ name: "Financed Guarantee Fee", value: guaranteeFeeAmount, color: "#10b981" });
  }

  const summaryStats = [
    { label: "Base Loan Request", value: `$${baseLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "SBA Guaranty Portion", value: `${(guarantyPct * 100).toFixed(0)}%` },
    { label: "Est. Guarantee Fee", value: `$${guaranteeFeeAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Financing Fee?", value: financeGuaranteeFee ? "Yes, added to loan" : "No, paid out of pocket" },
    { label: "Total Final Loan Amount", value: `$${totalLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { monthlyPayment, totalInterest, totalPaid, guaranteeFeeAmount, totalLoanAmount, rows, chartData, summaryStats };
}

const DEFAULTS = { baseLoanAmount: "350000", interestRate: "11.25", loanTermYears: "10", financeGuaranteeFee: true };

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

export default function Sba7aLoanPaymentCalculator() {
  const [baseLoanAmount, setBaseLoanAmount] = useState(DEFAULTS.baseLoanAmount);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [financeGuaranteeFee, setFinanceGuaranteeFee] = useState(DEFAULTS.financeGuaranteeFee);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<SbaResult | null>(null);

  const calc = () => setResults(calcSba(parseFloat(baseLoanAmount)||0, parseFloat(interestRate)||0, parseFloat(loanTermYears)||10, financeGuaranteeFee));
  const reset = () => { setBaseLoanAmount(DEFAULTS.baseLoanAmount); setInterestRate(DEFAULTS.interestRate); setLoanTermYears(DEFAULTS.loanTermYears); setFinanceGuaranteeFee(DEFAULTS.financeGuaranteeFee); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is an SBA 7(a) loan?", answer: "The 7(a) loan program is the Small Business Administration's primary program for providing financial assistance to small businesses. The SBA does not lend money directly; instead, it provides a federal guarantee to approved lenders, reducing their risk and encouraging them to lend to businesses that might not otherwise qualify for traditional bank financing." },
    { question: "What is the SBA Guarantee Fee?", answer: "To fund the 7(a) program in case of borrower defaults, the SBA charges a Guarantee Fee to the lender, who passes the cost onto the borrower. The fee is only calculated on the portion of the loan that the SBA guarantees (usually 75% or 85%). Depending on the loan size, the fee ranges from 2% to 3.75% of the guaranteed amount. The fee can be paid out-of-pocket at closing, or it can be financed into the loan." },
    { question: "How are SBA 7(a) interest rates determined?", answer: "Most 7(a) loans have variable interest rates pegged to the Wall Street Journal (WSJ) Prime Rate, plus a 'margin' added by the lender. The SBA imposes maximum allowed margins based on the loan size and term. For example, a lender might charge 'Prime + 2.75%'. If Prime is 8.5%, your effective rate is 11.25%." },
    { question: "What are the standard loan terms?", answer: "SBA 7(a) loans offer exceptionally long repayment terms compared to traditional commercial loans, which keeps monthly payments lower. Standard terms are 10 years for working capital, inventory, or equipment. If the loan is used to purchase commercial real estate, the term can be extended up to 25 years." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "SBA 7(a) Loan Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SBA 7(a) Loan Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="amount" label="Base Loan Request" value={baseLoanAmount} onChange={setBaseLoanAmount} prefix="$" />
              <CompactInput id="rate" label="Interest Rate (Prime + Margin)" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Loan Term</label>
                <select value={loanTermYears} onChange={e => setLoanTermYears(e.target.value)} className="h-10 px-3 text-sm border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="5">5 years</option>
                  <option value="7">7 years</option>
                  <option value="10">10 years (Standard / Equipment)</option>
                  <option value="15">15 years</option>
                  <option value="25">25 years (Real Estate Only)</option>
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Guarantee Fee Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <label className="text-sm font-semibold text-foreground">How will you pay the SBA Guarantee Fee?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setFinanceGuaranteeFee(true)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${financeGuaranteeFee ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>Finance into Loan</button>
                    <button onClick={() => setFinanceGuaranteeFee(false)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${!financeGuaranteeFee ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>Pay Out of Pocket</button>
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
            <p className="text-xs text-muted-foreground text-center">Estimation uses standard SBA guaranty tiers based on loan size.</p>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                <div className="text-4xl font-bold text-foreground">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">Based on ${results.totalLoanAmount.toLocaleString()} loan for {loanTermYears} years.</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["SBA Guarantee Fee", `$${results.guaranteeFeeAmount.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Interest", `$${results.totalInterest.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Repayment", `$${results.totalPaid.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-lg font-bold ${i===1?"text-amber-600":""}`}>{v}</div>
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
                <h3 className="text-base font-bold mb-4">Yearly Amortization Schedule</h3>
                <AmortizationTable rows={results.rows.filter(r => r.period % 12 === 0).map(r => ({...r, period: r.period/12}))} yearly={true} />
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding SBA 7(a) Loan Costs</h2>
            <p>The SBA 7(a) loan is the most popular government-backed commercial loan in the United States, designed to help small businesses acquire funding when they cannot qualify for conventional bank loans. While the terms are highly favorable, the fee structures are significantly more complex than standard commercial loans. The <strong>SBA 7(a) Loan Payment Calculator</strong> is designed to accurately model these unique costs, particularly the mandatory Guarantee Fee.</p>

            <h2 className="text-2xl font-bold mb-3">How the Guarantee Fee Works</h2>
            <p>Because the Small Business Administration uses taxpayer funds to guarantee the lender against your default, they require an upfront insurance premium known as the Guarantee Fee. The math behind this fee is convoluted because it is <em>not</em> based on your total loan amount. It is only based on the portion of the loan that the SBA guarantees.</p>
            <p>For example, if you borrow $500,000, the SBA typically guarantees 75% of it ($375,000). The fee for a loan of this size is 3% of the guaranteed portion. Therefore, 3% of $375,000 equals an $11,250 Guarantee Fee. Most businesses choose to finance this fee by rolling it into the loan, meaning the final principal they owe the bank is $511,250. This calculator automatically computes the correct tiered percentages to reveal exactly what you will owe at closing.</p>

            <h2 className="text-2xl font-bold mb-3">The Prime Rate and Your Interest</h2>
            <p>Unlike fixed-rate commercial real estate mortgages, the vast majority of SBA 7(a) loans feature variable interest rates that fluctuate daily. The rate is tied to the Wall Street Journal Prime Rate plus a margin negotiated by the lender (e.g., Prime + 2.75%).</p>
            <p>This means your monthly payment is not static. If the Federal Reserve raises interest rates, the Prime rate increases, and your monthly SBA payment will jump accordingly. When using this calculator for financial planning, it is highly recommended to run scenarios with interest rates 2% or 3% higher than today's rate to ensure your business's cash flow can survive a high-rate environment.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sba-7a-loan-payment-calculator" />
          <PopularCalculators exclude="/calculator/sba-7a-loan-payment-calculator" />
        </div>
      </div>
    </>
  );
}
