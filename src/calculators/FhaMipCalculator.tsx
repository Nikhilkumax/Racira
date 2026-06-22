"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface MIPResult {
  upfrontMIP: number;
  annualMIP: number;
  monthlyMIP: number;
  mipRate: number;
  baseLoanAmount: number;
  totalLoanWithUFMIP: number;
  monthlyPrincipalInterest: number;
  totalMonthlyPayment: number;
  mipCancellationMonth: number | null;
  totalMIPPaid: number;
  ltv: number;
  chartData: { year: number; mipPaid: number; balance: number }[];
  summaryStats: { label: string; value: string }[];
}

function getMIPRate(ltv: number, termYears: number, loanAmount: number): number {
  // FHA MIP rates as of 2024
  if (termYears > 15) {
    if (loanAmount <= 726200) {
      if (ltv <= 90) return 0.50;
      if (ltv <= 95) return 0.50;
      return 0.55;
    } else {
      if (ltv <= 90) return 0.70;
      if (ltv <= 95) return 0.70;
      return 0.75;
    }
  } else {
    if (loanAmount <= 726200) {
      if (ltv <= 90) return 0.15;
      return 0.40;
    } else {
      if (ltv <= 90) return 0.40;
      return 0.65;
    }
  }
}

function calcMIP(homeValue: number, downPaymentPct: number, loanTermYears: number, interestRate: number): MIPResult {
  const downPayment = homeValue * (downPaymentPct / 100);
  const baseLoanAmount = homeValue - downPayment;
  const ltv = (baseLoanAmount / homeValue) * 100;
  const upfrontMIPRate = 1.75; // 1.75% of base loan
  const upfrontMIP = baseLoanAmount * (upfrontMIPRate / 100);
  const totalLoanWithUFMIP = baseLoanAmount + upfrontMIP;

  const mipRate = getMIPRate(ltv, loanTermYears, baseLoanAmount);
  const annualMIP = baseLoanAmount * (mipRate / 100);
  const monthlyMIP = annualMIP / 12;

  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;
  const monthlyPI = totalLoanWithUFMIP > 0 && n > 0
    ? (r > 0 ? totalLoanWithUFMIP * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : totalLoanWithUFMIP / n)
    : 0;
  const totalMonthlyPayment = monthlyPI + monthlyMIP;

  // FHA MIP cancellation rules
  // If downPayment >= 10% (LTV <= 90%), MIP cancels after 11 years
  // If downPayment < 10%, MIP is for life of loan (30yr term) or 11 years (15yr term)
  let mipCancellationMonth: number | null = null;
  if (loanTermYears <= 15 && ltv <= 90) {
    mipCancellationMonth = 11 * 12;
  } else if (loanTermYears > 15 && ltv <= 90) {
    mipCancellationMonth = 11 * 12;
  } else if (loanTermYears > 15 && ltv > 90) {
    mipCancellationMonth = null; // life of loan
  } else {
    mipCancellationMonth = 11 * 12;
  }

  const totalMIPMonths = mipCancellationMonth ?? n;
  // MIP is on declining balance — simplified as flat for total estimate
  const totalMIPPaid = monthlyMIP * Math.min(totalMIPMonths, n) + upfrontMIP;

  const chartData = [];
  let balance = totalLoanWithUFMIP;
  let cumulativeMIP = upfrontMIP;
  for (let y = 1; y <= loanTermYears; y++) {
    const mths = y * 12;
    for (let m = (y - 1) * 12 + 1; m <= mths && m <= n; m++) {
      const interest = balance * r;
      const principal = monthlyPI - interest;
      balance = Math.max(0, balance - principal);
      const mipActive = !mipCancellationMonth || m <= mipCancellationMonth;
      if (mipActive) cumulativeMIP += monthlyMIP;
    }
    chartData.push({ year: y, mipPaid: Math.round(cumulativeMIP), balance: Math.round(balance) });
  }

  const summaryStats = [
    { label: "Base Loan Amount", value: `$${baseLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Upfront MIP (1.75%)", value: `$${upfrontMIP.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Total Loan w/ UFMIP", value: `$${totalLoanWithUFMIP.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual MIP Rate", value: `${mipRate.toFixed(2)}%` },
    { label: "Monthly MIP", value: `$${monthlyMIP.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "MIP Cancellation", value: mipCancellationMonth ? `After ${mipCancellationMonth / 12} years` : "Life of Loan" },
    { label: "Total MIP Paid", value: `$${totalMIPPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "LTV Ratio", value: `${ltv.toFixed(1)}%` },
  ];

  return { upfrontMIP, annualMIP, monthlyMIP, mipRate, baseLoanAmount, totalLoanWithUFMIP, monthlyPrincipalInterest: monthlyPI, totalMonthlyPayment, mipCancellationMonth, totalMIPPaid, ltv, chartData, summaryStats };
}

const DEFAULTS = { homeValue: "400000", downPaymentPct: "3.5", loanTermYears: "30", interestRate: "6.75" };

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

export default function FhaMipCalculator() {
  const [homeValue, setHomeValue] = useState(DEFAULTS.homeValue);
  const [downPaymentPct, setDownPaymentPct] = useState(DEFAULTS.downPaymentPct);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [results, setResults] = useState<MIPResult | null>(null);

  const calc = () => setResults(calcMIP(parseFloat(homeValue)||0, parseFloat(downPaymentPct)||0, parseFloat(loanTermYears)||30, parseFloat(interestRate)||0));
  const reset = () => { setHomeValue(DEFAULTS.homeValue); setDownPaymentPct(DEFAULTS.downPaymentPct); setLoanTermYears(DEFAULTS.loanTermYears); setInterestRate(DEFAULTS.interestRate); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is FHA MIP?", answer: "FHA Mortgage Insurance Premium (MIP) is insurance that protects FHA-approved lenders against losses if a borrower defaults. Unlike conventional PMI, FHA MIP has two components: a one-time Upfront MIP (UFMIP) of 1.75% of the loan amount paid at closing, and an Annual MIP paid monthly for the life of the loan (or 11 years if your down payment is 10% or more)." },
    { question: "How long do I pay FHA MIP?", answer: "It depends on your down payment and loan term. If you put down less than 10% on a 30-year loan, you pay annual MIP for the entire life of the loan. If you put down 10% or more, MIP cancels after 11 years. On a 15-year loan with a down payment of 10%+, MIP also cancels after 11 years." },
    { question: "Can I avoid FHA MIP?", answer: "Yes. The most common strategy is to put down 10% or more (to limit MIP to 11 years) and then refinance into a conventional loan once you reach 20% equity. Conventional loans with 20% down have no PMI at all. If your credit score is 620+, a conventional loan may be a better long-term value." },
    { question: "What is the FHA upfront MIP rate?", answer: "The Upfront MIP rate is 1.75% of the base loan amount for all FHA loans, regardless of loan term, LTV, or credit score. It can be paid in cash at closing or rolled into the loan amount, where it becomes part of the principal you pay interest on." },
    { question: "How does FHA MIP compare to conventional PMI?", answer: "Conventional PMI rates (0.2%–2% annually) are based on your credit score and LTV. Conventional PMI cancels automatically when your LTV reaches 78% of the original purchase price. FHA MIP is often less sensitive to credit score but can be more expensive long-term because it may last the life of the loan." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "FHA MIP Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">FHA Mortgage Insurance Premium (MIP) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="home-value" label="Home Price" value={homeValue} onChange={setHomeValue} prefix="$" />
              <CompactInput id="down-pct" label="Down Payment" value={downPaymentPct} onChange={setDownPaymentPct} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Loan Term</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["15", "15yr"], ["30", "30yr"]].map(([v, l]) => (
                    <button key={v} onClick={() => setLoanTermYears(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${loanTermYears === v ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-secondary"}`}>{l}</button>
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
                  <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Shield className="h-4 w-4" /> Calculate MIP
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.totalMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">P&I: ${results.monthlyPrincipalInterest.toFixed(2)} + MIP: ${results.monthlyMIP.toFixed(2)}/mo</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly MIP", `$${results.monthlyMIP.toFixed(2)}`], ["Upfront MIP", `$${results.upfrontMIP.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total MIP", `$${results.totalMIPPaid.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold text-amber-600">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">MIP Details</h3>
                <div className="space-y-2.5">
                  {results.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                      <span className="text-sm text-muted-foreground">{s.label}:</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {results.mipCancellationMonth === null && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">⚠️ With less than 10% down on a 30-year FHA loan, MIP applies for the <strong>life of the loan</strong>. Consider refinancing to a conventional loan once you reach 20% equity to eliminate mortgage insurance.</p>
                </div>
              )}
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cumulative MIP Paid Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={results.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Bar dataKey="mipPaid" name="Cumulative MIP Paid" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is FHA Mortgage Insurance Premium (MIP)?</h2>
            <p>The <strong>FHA Mortgage Insurance Premium (MIP)</strong> is a mandatory insurance charge required on all loans backed by the Federal Housing Administration. Since FHA loans allow borrowers to purchase homes with as little as 3.5% down, the MIP protects approved lenders against the risk of default on these higher-LTV loans. Without this insurance, banks would be unwilling to extend mortgages to borrowers with smaller down payments and less-than-perfect credit histories.</p>
            <p>MIP has two distinct components. The <strong>Upfront MIP (UFMIP)</strong> is a one-time charge of 1.75% of the base loan amount, due at closing. Most borrowers choose to roll this into the loan, meaning it gets added to the mortgage principal and financed over the loan term. The <strong>Annual MIP</strong> is an ongoing charge expressed as a percentage of the outstanding loan balance, divided into 12 monthly installments that are added to your regular mortgage payment.</p>

            <h2 className="text-2xl font-bold mb-3">How MIP Rates Are Determined</h2>
            <p>The Annual MIP rate depends on three variables: your loan term (15 years vs. 30 years), your Loan-to-Value (LTV) ratio at origination, and your loan amount relative to the conforming loan limit ($726,200 for 2024 in most areas). For a 30-year FHA loan with less than 10% down under the conforming limit, the annual MIP rate is 0.55% of the loan balance. Loans above the conforming limit carry slightly higher MIP rates.</p>

            <h2 className="text-2xl font-bold mb-3">FHA MIP Cancellation Rules</h2>
            <p>FHA MIP does not cancel automatically when you reach 20% equity, unlike conventional PMI. Cancellation is strictly governed by two rules. If your original down payment was less than 10%, the annual MIP applies for the entire life of the loan—you can never cancel it without refinancing. If your original down payment was 10% or more, the annual MIP automatically cancels after 11 years of on-time payments, regardless of your remaining loan balance.</p>
            <p>This critical rule makes the FHA loan significantly more expensive in the long run for borrowers who plan to stay in their homes for many years. A conventional loan with 20% down carries no PMI at all, while an FHA loan with 3.5% down will carry MIP for 30 years, adding tens of thousands of dollars to the total cost of homeownership.</p>

            <h2 className="text-2xl font-bold mb-3">The Refinance Strategy to Eliminate MIP</h2>
            <p>The most effective strategy for eliminating FHA MIP is to refinance into a conventional loan once your home equity reaches 20%. As home values appreciate and you pay down your principal, your LTV will decrease. When your equity reaches 20% of the current appraised value, you can refinance into a conventional mortgage with no PMI requirement, permanently eliminating the MIP burden.</p>
            <p>The break-even timeline for this strategy depends on your current FHA rate, current conventional rates, refinancing closing costs, and how long you plan to stay in the home. Use our Refinance Calculator to model this scenario with your specific numbers.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fha-mortgage-insurance-premium-mip-calculator" />
          <PopularCalculators exclude="/calculator/fha-mortgage-insurance-premium-mip-calculator" />
        </div>
      </div>
    </>
  );
}
