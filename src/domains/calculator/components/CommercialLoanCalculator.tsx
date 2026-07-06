"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface CommercialLoanResult {
  monthlyPayment: number;
  annualDebtService: number;
  dscr: number;
  ltv: number;
  balloonPayment: number;
  totalInterest: number;
  chartData: { name: string; NOICashFlow: number; DebtService: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCommercialLoan(propertyValue: number, loanAmount: number, rate: number, amortYears: number, termYears: number, noi: number): CommercialLoanResult {
  const principal = Math.max(0, loanAmount);
  const r = rate / 100 / 12;
  const amortMonths = amortYears * 12;
  const termMonths = termYears * 12;
  const annualNOI = noi;

  const ltv = propertyValue > 0 ? (principal / propertyValue) * 100 : 0;
  const monthlyPayment = principal > 0 && r > 0 && amortMonths > 0 ? (principal * r * Math.pow(1 + r, amortMonths)) / (Math.pow(1 + r, amortMonths) - 1) : 0;
  const annualDebtService = monthlyPayment * 12;
  const dscr = annualDebtService > 0 ? annualNOI / annualDebtService : 0;

  let currentBalance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= termMonths; m++) {
    const interestPayment = currentBalance * r;
    const principalPayment = monthlyPayment - interestPayment;
    currentBalance -= principalPayment;
    totalInterest += interestPayment;
  }

  const balloonPayment = Math.max(0, currentBalance);

  const chartData = [
    { name: "Annual Cash Flow", NOICashFlow: annualNOI, DebtService: annualDebtService }
  ];

  const breakdown = [
    { label: "Property Value", value: `$${propertyValue.toLocaleString()}` },
    { label: "Loan Amount", value: `$${principal.toLocaleString()}` },
    { label: "Loan-to-Value (LTV)", value: `${ltv.toFixed(2)}%` },
    { label: "Annual Net Operating Income", value: `$${annualNOI.toLocaleString()}` },
    { label: "Annual Debt Service", value: `$${annualDebtService.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Debt Service Coverage Ratio", value: `${dscr.toFixed(2)}x` },
    { label: "Total Interest Paid (Over Term)", value: `$${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Balloon Payment Due", value: `$${balloonPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Monthly Payment", value: `$${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "DSCR", value: `${dscr.toFixed(2)}x` },
    { label: "LTV", value: `${ltv.toFixed(1)}%` },
    { label: "Balloon Payment", value: `$${balloonPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Net Cash Flow (Monthly)", value: `$${((annualNOI - annualDebtService) / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
  ];

  return { monthlyPayment, annualDebtService, dscr, ltv, balloonPayment, totalInterest, chartData, breakdown, summaryStats };
}

const DEFAULTS = { propertyValue: "1500000", loanAmount: "1000000", rate: "7.5", amortYears: "25", termYears: "10", noi: "125000" };

export default function CommercialLoanCalculator() {
  const [propertyValue, setPropertyValue] = useState(DEFAULTS.propertyValue);
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [amortYears, setAmortYears] = useState(DEFAULTS.amortYears);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [termYears, setTermYears] = useState(DEFAULTS.termYears);
  const [noi, setNoi] = useState(DEFAULTS.noi);
  
  const [result, setResult] = useState<CommercialLoanResult | null>(null);

  const calculate = () => setResult(calcCommercialLoan(
    parseFloat(propertyValue) || 0, parseFloat(loanAmount) || 0, parseFloat(rate) || 0, parseFloat(amortYears) || 0, parseFloat(termYears) || 0, parseFloat(noi) || 0
  ));
  
  const reset = () => { 
    setPropertyValue(DEFAULTS.propertyValue); setLoanAmount(DEFAULTS.loanAmount); setRate(DEFAULTS.rate); setAmortYears(DEFAULTS.amortYears);
    setTermYears(DEFAULTS.termYears); setNoi(DEFAULTS.noi); setShowAdvanced(false);
    setResult(calcCommercialLoan(1500000, 1000000, 7.5, 25, 10, 125000)); 
  };
  
  useEffect(() => { calculate(); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How are commercial loans different from residential mortgages?", answer: "Commercial loans are made to business entities (like LLCs) rather than individuals. They typically have shorter terms (5-10 years), higher interest rates, and higher down payment requirements (20-30%). Unlike residential loans which are based on personal income, commercial loans focus on the property's ability to generate income." },
    { question: "What is DSCR?", answer: "Debt Service Coverage Ratio (DSCR) is a key metric used by commercial lenders. It is calculated by dividing the property's Net Operating Income (NOI) by its annual debt service. Most lenders require a DSCR of at least 1.20 to 1.25 to ensure the property generates enough cash to cover the loan payments." },
    { question: "Why do commercial loans have balloon payments?", answer: "Commercial lenders often prefer to limit their long-term interest rate risk. By setting a loan term (e.g., 10 years) that is shorter than the amortization period (e.g., 25 years), they ensure the borrower must either pay off the loan, sell the property, or refinance at current market rates after a decade." },
    { question: "What is Net Operating Income (NOI)?", answer: "NOI is the total income generated by a property (rent, parking fees, etc.) minus all necessary operating expenses (property taxes, insurance, maintenance, utilities). It does not include mortgage payments or income taxes." },
    { question: "What is a good Loan-to-Value (LTV) for commercial real estate?", answer: "Most commercial lenders prefer an LTV between 65% and 80%. This means you need a down payment of at least 20% to 35%. Lower LTVs generally result in better interest rates because the lender is taking on less risk." },
    { question: "Can I get a 30-year commercial mortgage?", answer: "It is extremely rare to find a 30-year fixed commercial mortgage. The closest equivalent is a multifamily loan backed by Fannie Mae, Freddie Mac, or HUD, which can offer up to 35-year amortizations and terms, but these are strict exceptions to the rule." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Commercial Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Commercial Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-sm font-medium mb-1.5 block">Property Value</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} className={ci} /></div></div>
            <div><label className="text-sm font-medium mb-1.5 block">Loan Amount</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Interest Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Amortization (Yrs)</label><div className={inp}><input type="number" value={amortYears} onChange={e => setAmortYears(e.target.value)} className={ci} /></div></div>
            </div>

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
              Advanced Options {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border mt-1">
                <div><label className="text-sm font-medium mb-1.5 block">Loan Term (Yrs)</label><div className={inp}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={ci} /></div></div>
                <div><label className="text-sm font-medium mb-1.5 block">Annual NOI</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={noi} onChange={e => setNoi(e.target.value)} className={ci} /></div></div>
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Balloon Due at Year {termYears}: ${result.balloonPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["DSCR", `${result.dscr.toFixed(2)}x`], ["LTV", `${result.ltv.toFixed(1)}%`], ["Total Interest", `$${result.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className={`text-base font-bold ${l === "DSCR" && result.dscr >= 1.25 ? "text-emerald-600" : l === "DSCR" ? "text-red-600" : ""}`}>{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Balloon Payment") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Income vs Debt Service (Annual)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `$${(v/1000)}k`} />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="NOICashFlow" name="Net Operating Income" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40} />
                    <Bar dataKey="DebtService" name="Annual Debt Service" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Commercial Loan Calculator?</h2>
            <p>A commercial loan calculator is an advanced financial tool designed explicitly for real estate investors, business owners, and syndicators who are purchasing or refinancing income-producing properties. Unlike a standard residential mortgage calculator, which primarily focuses on basic amortization over a 15- or 30-year fixed term, a commercial loan calculator accounts for the unique, often complex structures inherent to commercial finance. This includes the decoupling of loan amortization from the loan term, the calculation of massive balloon payments, and the crucial analysis of cash flow metrics like the Debt Service Coverage Ratio (DSCR).</p>
            <p>Commercial real estate (CRE) deals live and die by the numbers. Lenders do not care about your personal W-2 salary in the same way residential lenders do. Instead, they underwrite the property itself as a standalone business. Our calculator replicates a commercial underwriter's desk, allowing you to instantly determine if a property generates enough Net Operating Income (NOI) to support the debt you are requesting, empowering you to negotiate with banks from a position of mathematical strength.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The mathematics powering this calculator use standard commercial lending formulas, executing thousands of calculations instantly. The core difference lies in how amortization and loan terms interact.</p>
            <p>First, the calculator uses the <strong>Amortization Period</strong> (typically 20-25 years) to establish your monthly payment. It uses the standard amortization formula: <code>M = P [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]</code>, where <em>n</em> is the amortization in months. This gives you a relatively low monthly payment as if you had 25 years to pay it off.</p>
            <p>However, the calculator also tracks the <strong>Loan Term</strong> (typically 5-10 years). It runs an amortization schedule silently in the background, deducting your principal payments month by month. Exactly when the Loan Term expires, it halts the schedule and calculates the remaining principal balance. This massive remaining balance is your <strong>Balloon Payment</strong>.</p>
            <p>Simultaneously, the calculator evaluates risk by dividing your inputted Net Operating Income (NOI) by the calculated Annual Debt Service (your monthly payment multiplied by 12) to produce the exact DSCR.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>When you click calculate, the tool produces five distinct analytical zones designed to give you a 360-degree view of your commercial deal.</p>
            <p><strong>Primary Result Card:</strong> Your estimated monthly payment is displayed prominently, along with the exact dollar amount of the balloon payment due at the end of the term. This balloon figure is critical for planning your exit strategy (refinance or sale).</p>
            <p><strong>3-Stat Bar:</strong> This bar instantly tells you if the deal is viable. It displays the DSCR (highlighting green if it's over 1.25, the industry standard for safety), the Loan-to-Value (LTV) ratio, and the total interest you will pay over the term.</p>
            <p><strong>Loan Breakdown Table:</strong> This provides a line-item accounting of the deal structure, acting as a clean summary sheet you can include in your lender package or investor prospectus.</p>
            <p><strong>Income vs. Debt Service Chart:</strong> This bar chart visually represents your DSCR. The blue bar represents the total cash the property generates (NOI), while the red bar represents the mortgage payments. The gap between them is your absolute cash flow cushion. If the red bar is ever larger than the blue bar, the property is cash-flow negative.</p>
            <p><strong>Summary Statistics:</strong> A fast, readable grid aggregating the most important metrics, including your net monthly cash flow after debt service is paid.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>To successfully utilize a commercial loan calculator and secure funding, you must deeply understand the primary variables lenders use to underwrite deals.</p>
            <p><strong>Debt Service Coverage Ratio (DSCR):</strong> This is the golden rule of commercial lending. A DSCR of 1.0 means your income exactly matches your debt—zero profit. A DSCR of 1.25x means you generate 25% more income than needed to pay the bank. Lenders almost universally require a minimum DSCR of 1.20 to 1.25. If your DSCR is below this, you must either increase the NOI, lower the interest rate, or bring a larger down payment to shrink the loan size.</p>
            <p><strong>Loan-to-Value (LTV):</strong> Commercial lenders are highly conservative. While you can buy a house with 3% down, commercial properties usually require 20% to 35% down (LTVs of 65% to 80%). High leverage in commercial real estate dramatically increases default risk during economic downturns, which is why lenders force you to keep significant equity in the deal.</p>
            <p><strong>Net Operating Income (NOI):</strong> NOI is the lifeblood of commercial real estate. It is the total revenue minus all operating expenses (taxes, insurance, maintenance, property management). Notably, NOI does <em>not</em> include your mortgage payment or depreciation. The higher your NOI, the higher the property's value, and the larger the loan you can secure.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Options tab is where the calculator transitions from a simple payment estimator into a true commercial underwriting tool.</p>
            <p>By inputting the <strong>Loan Term</strong> independently of the Amortization period, you accurately model the reality of commercial finance. Most commercial loans are 5, 7, or 10-year term loans amortized over 25 years. This feature alone separates this tool from basic residential calculators.</p>
            <p>Furthermore, adding the <strong>Annual NOI</strong> unlocks the DSCR and cash flow analysis. Without inputting NOI, a commercial calculator cannot tell you if the deal is safe or risky; it can only tell you the math of the loan. By integrating NOI, the tool validates the financial integrity of the asset.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at how tweaking these variables changes the viability of a multi-million dollar deal.</p>
            <p><strong>Example 1: The Safe Bet.</strong> You are buying a $2,000,000 apartment complex. You request a $1,400,000 loan (70% LTV). The interest rate is 6.5%, amortized over 25 years with a 10-year term. The property generates $150,000 in NOI. Your annual debt service is $113,435. Your DSCR is an excellent 1.32x. The lender approves this deal instantly. After 10 years, you will owe a balloon payment of $1,053,000.</p>
            <p><strong>Example 2: The Risky Squeeze.</strong> You want to buy the exact same $2,000,000 property, but you want to put less money down. You request a $1,600,000 loan (80% LTV) at 6.5% over 25 years. Your annual debt service jumps to $129,640. The property still only generates $150,000 in NOI. Your DSCR plummets to 1.15x. Most traditional commercial lenders will deny this loan because the cash flow margin is too thin to handle an unexpected vacancy or repair. You must bring more cash to the closing table.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Commercial financing is an art form as much as a science. Here are proven strategies to secure the best possible loan for your property.</p>
            <p>First, impeccably document your NOI. Lenders will not take your word for it. You must provide a "T-12" (Trailing 12 months profit and loss statement) and a certified Rent Roll. If you claim the NOI is $100k, but your tax returns show it was $70k because you expensed heavily, the lender will use the $70k figure, potentially killing the deal.</p>
            <p>Second, prepare for the balloon payment years in advance. A 10-year term feels like a lifetime, but it passes quickly. You must track current interest rates and market cap rates as you approach year 8 or 9 so you can execute a strategic refinance or sale before the massive principal balance comes due.</p>
            <p>Third, negotiate the "Prepayment Penalty." Commercial loans almost always feature severe penalties if you pay off the loan early (often called Yield Maintenance or Step-Down penalties). If you plan to flip the property in 3 years, do not sign a 10-year loan with yield maintenance; it will destroy your profit margin.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>Routinely using a commercial loan calculator before writing offers or contacting brokers gives you a massive competitive advantage. It prevents you from wasting time on deals that look good on a spreadsheet but will inevitably fail at the underwriter's desk.</p>
            <p>By forcing you to confront the DSCR and the balloon payment, this calculator ensures you structure your debt responsibly. It transforms you from a speculative buyer into a sophisticated investor who speaks the language of the bank, ultimately helping you build a safer, more profitable commercial real estate portfolio.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/commercial-loan-calculator" />
          <PopularCalculators exclude="/calculator/commercial-loan-calculator" />
        </div>
      </div>
    </>
  );
}
