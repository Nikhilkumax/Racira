"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { RotateCcw, Building, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface JumboResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  loanAmount: number;
  yearlyRows: AmortRow[];
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

const CONFORMING_LIMIT = 766550; // 2024 conforming limit

function calcJumbo(homePrice: number, downPaymentPct: number, interestRate: number, loanTermYears: number, propertyTax: number, homeInsurance: number): JumboResult {
  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const isJumbo = loanAmount > CONFORMING_LIMIT;
  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;
  const monthlyPI = loanAmount > 0 && n > 0
    ? (r > 0 ? loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : loanAmount / n)
    : 0;
  const monthlyPayment = monthlyPI + (propertyTax / 12) + (homeInsurance / 12);
  const totalInterest = Math.max(0, monthlyPI * n - loanAmount);
  const totalPaid = loanAmount + totalInterest;

  let balance = loanAmount; const monthlyRows: AmortRow[] = [];
  for (let m = 1; m <= n && balance > 0.01; m++) {
    const interest = balance * r;
    let p = monthlyPI - interest;
    if (p > balance) p = balance;
    balance -= p;
    monthlyRows.push({ period: m, payment: interest + p, principal: p, interest, balance: Math.max(0, balance) });
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
    { name: "Tax & Insurance", value: (propertyTax + homeInsurance) * loanTermYears, color: "#10b981" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Home Price", value: `$${homePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Down Payment", value: `$${downPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${downPaymentPct}%)` },
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Loan Type", value: isJumbo ? `Jumbo (above $${(CONFORMING_LIMIT/1000).toFixed(0)}K limit)` : "Conforming" },
    { label: "Monthly P&I", value: `$${monthlyPI.toFixed(2)}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { monthlyPayment, totalInterest, totalPaid, loanAmount, yearlyRows, chartData, summaryStats };
}

const DEFAULTS = { homePrice: "1500000", downPaymentPct: "20", interestRate: "7.25", loanTermYears: "30", propertyTax: "18000", homeInsurance: "3600" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function JumboLoanPaymentCalculator() {
  const [homePrice, setHomePrice] = useState(DEFAULTS.homePrice);
  const [downPaymentPct, setDownPaymentPct] = useState(DEFAULTS.downPaymentPct);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [propertyTax, setPropertyTax] = useState(DEFAULTS.propertyTax);
  const [homeInsurance, setHomeInsurance] = useState(DEFAULTS.homeInsurance);
  const [results, setResults] = useState<JumboResult | null>(null);

  const calc = () => setResults(calcJumbo(parseFloat(homePrice)||0, parseFloat(downPaymentPct)||0, parseFloat(interestRate)||0, parseFloat(loanTermYears)||30, parseFloat(propertyTax)||0, parseFloat(homeInsurance)||0));
  const reset = () => { setHomePrice(DEFAULTS.homePrice); setDownPaymentPct(DEFAULTS.downPaymentPct); setInterestRate(DEFAULTS.interestRate); setLoanTermYears(DEFAULTS.loanTermYears); setPropertyTax(DEFAULTS.propertyTax); setHomeInsurance(DEFAULTS.homeInsurance); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is a jumbo loan?", answer: "A jumbo loan is any mortgage that exceeds the conforming loan limit set annually by the FHFA—$766,550 for most US counties in 2024 (higher in high-cost areas like NYC, San Francisco, and Honolulu). Because Fannie Mae and Freddie Mac cannot purchase jumbo loans, lenders carry them on their own books, resulting in stricter qualification requirements." },
    { question: "What down payment is required for a jumbo loan?", answer: "Most jumbo lenders require a minimum of 10-20% down, compared to 3-5% for conforming loans. Some ultra-high-balance jumbo products over $2 million require 25-30%. Unlike conforming loans, there are no government programs (FHA, VA) for jumbo amounts—only conventional private lenders." },
    { question: "Are jumbo loan rates higher than conforming rates?", answer: "Historically, jumbo rates were 0.25-0.50% higher than conforming rates. In recent years, however, the gap has narrowed and jumbo rates sometimes match or beat conforming rates at certain lenders, especially for borrowers with very high credit scores (760+) and large down payments. Rates are highly lender-specific for jumbos." },
    { question: "What credit score is needed for a jumbo loan?", answer: "Most jumbo lenders require a minimum credit score of 700, with 720-740+ preferred. For loan amounts above $2 million, lenders often require 760+. Unlike FHA-backed conforming loans, there is no government floor on credit score for jumbo products." },
    { question: "Can I get a jumbo loan with a DTI above 43%?", answer: "Jumbo loans are not subject to the 43% Debt-to-Income 'Qualified Mortgage' rule in the same way as conventional conforming loans. However, most jumbo lenders set their own DTI limits of 38-43%. Some portfolio lenders offer more flexibility for borrowers with very high incomes and large liquid reserves." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Jumbo Loan Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Jumbo Loan Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="home-price" label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" />
              <CompactInput id="down-pct" label="Down Payment" value={downPaymentPct} onChange={setDownPaymentPct} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Loan Term</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["15","15yr"],["30","30yr"]].map(([v,l]) => (
                    <button key={v} onClick={() => setLoanTermYears(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${loanTermYears===v?"bg-primary text-primary-foreground border-primary":"border-input bg-background hover:bg-secondary"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="tax" label="Annual Property Tax" value={propertyTax} onChange={setPropertyTax} prefix="$" />
                  <CompactInput id="ins" label="Annual Home Insurance" value={homeInsurance} onChange={setHomeInsurance} prefix="$" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">{loanTermYears}-year jumbo at {interestRate}% APR</div>
              </div>
              {results.loanAmount > CONFORMING_LIMIT && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">⚡ This is a <strong>Jumbo Loan</strong> — your loan amount of ${results.loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} exceeds the 2024 conforming limit of ${CONFORMING_LIMIT.toLocaleString()}. Stricter qualification requirements apply.</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Loan Amount", `$${results.loanAmount.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Interest", `$${results.totalInterest.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Paid", `$${results.totalPaid.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-lg font-bold ${i===1?"text-amber-600":""}`}>{v}</div>
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
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Yearly Amortization Schedule</h3>
                <AmortizationTable rows={results.yearlyRows} yearly={true} />
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Jumbo Loan?</h2>
            <p>A <strong>jumbo loan</strong> is a mortgage that exceeds the conforming loan limits established annually by the Federal Housing Finance Agency (FHFA). For 2024, the baseline limit is $766,550 for single-family homes in most U.S. counties. In high-cost markets like New York City, San Francisco Bay Area, Honolulu, and Seattle, higher limits apply—up to $1,149,825 in some areas. Any loan exceeding these thresholds is classified as a jumbo mortgage and does not qualify for purchase by Fannie Mae or Freddie Mac.</p>
            <p>Because jumbo loans cannot be sold on the secondary market to government-sponsored enterprises, lenders hold them on their own balance sheets. This exposes lenders to greater risk and explains why jumbo loans historically carried higher interest rates and stricter qualification requirements than conforming loans.</p>

            <h2 className="text-2xl font-bold mb-3">Jumbo Loan Qualification Requirements</h2>
            <p>The qualification bar for jumbo loans is significantly higher than for conforming mortgages. Most lenders require a minimum credit score of 700, with many premium jumbo programs requiring 720 or higher. For loan amounts above $2 million, 760+ credit scores are common requirements. The Debt-to-Income ratio ceiling is typically 43%, though portfolio lenders with more flexible guidelines may allow up to 45-50% for exceptional borrowers.</p>
            <p>Down payment requirements are also stricter. While conventional loans allow as little as 3% down, most jumbo programs require 10-20% depending on loan amount. For loans above $2 million, 25-30% down payments are common. Cash reserves are another major differentiator—most jumbo lenders require 6-12 months of payments in liquid reserves post-closing, compared to 2 months for conforming loans.</p>

            <h2 className="text-2xl font-bold mb-3">The Jumbo Premium: Rate Differences</h2>
            <p>The historical "jumbo premium"—the additional interest rate charged above conforming loan rates—has fluctuated significantly over time. In the aftermath of the 2008 financial crisis, jumbo rates were 0.5-1.0% higher than conforming rates. As the market recovered and competition among private lenders intensified, the premium narrowed to 0.1-0.3%. In some market environments, highly qualified jumbo borrowers at certain lenders have actually received rates slightly below conforming rates, thanks to the premium credit profiles of the typical jumbo borrower demographic.</p>

            <h2 className="text-2xl font-bold mb-3">Interest Savings on Large Loans</h2>
            <p>On a $1.5 million jumbo loan at 7.25% over 30 years, the monthly P&I payment is approximately $10,236. The total interest paid over the life of the loan is approximately $1.68 million—more than the original loan amount. Even a small rate reduction produces enormous savings at this scale. A 0.25% rate reduction (from 7.25% to 7.00%) saves approximately $138 per month and over $49,000 in total interest. This makes rate shopping critically important for jumbo borrowers—even fractional rate differences represent meaningful lifetime savings.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/jumbo-loan-payment-calculator" />
          <PopularCalculators exclude="/calculator/jumbo-loan-payment-calculator" />
        </div>
      </div>
    </>
  );
}
