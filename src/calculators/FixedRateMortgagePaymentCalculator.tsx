"use client";
import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw, Home } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface FRMResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcFRM(homePrice: number, downPaymentPct: number, interestRate: number, loanTermYears: number, propertyTax: number, homeInsurance: number): FRMResult {
  const downPayment = homePrice * (downPaymentPct / 100);
  const principal = homePrice - downPayment;
  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;
  const monthlyPI = principal > 0 && n > 0
    ? (r > 0 ? principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : principal / n)
    : 0;
  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyPayment = monthlyPI + monthlyTax + monthlyInsurance;

  const totalInterest = Math.max(0, monthlyPI * n - principal);
  const totalPaid = principal + totalInterest;

  const d = new Date(); d.setMonth(d.getMonth() + n);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const payoffDate = `${months[d.getMonth()]} ${d.getFullYear()}`;

  let balance = principal; const monthlyRows: AmortRow[] = [];
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
    { name: "Principal", value: principal, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterest, color: "#f59e0b" },
    { name: "Tax & Insurance", value: (propertyTax + homeInsurance) * loanTermYears, color: "#10b981" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Home Price", value: `$${homePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Down Payment", value: `$${downPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${downPaymentPct}%)` },
    { label: "Loan Amount", value: `$${principal.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "P&I Payment", value: `$${monthlyPI.toFixed(2)}/mo` },
    { label: "Total Interest", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payoff Date", value: payoffDate },
  ];

  return { monthlyPayment, totalInterest, totalPaid, payoffDate, monthlyRows, yearlyRows, chartData, summaryStats };
}

const DEFAULTS = { homePrice: "400000", downPaymentPct: "20", interestRate: "6.5", loanTermYears: "30", propertyTax: "3600", homeInsurance: "1200" };

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
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>
) : null;

export default function FixedRateMortgagePaymentCalculator() {
  const [homePrice, setHomePrice] = useState(DEFAULTS.homePrice);
  const [downPaymentPct, setDownPaymentPct] = useState(DEFAULTS.downPaymentPct);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [propertyTax, setPropertyTax] = useState(DEFAULTS.propertyTax);
  const [homeInsurance, setHomeInsurance] = useState(DEFAULTS.homeInsurance);
  const [results, setResults] = useState<FRMResult | null>(null);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const calc = () => setResults(calcFRM(parseFloat(homePrice)||0, parseFloat(downPaymentPct)||0, parseFloat(interestRate)||0, parseFloat(loanTermYears)||30, parseFloat(propertyTax)||0, parseFloat(homeInsurance)||0));
  const reset = () => { setHomePrice(DEFAULTS.homePrice); setDownPaymentPct(DEFAULTS.downPaymentPct); setInterestRate(DEFAULTS.interestRate); setLoanTermYears(DEFAULTS.loanTermYears); setPropertyTax(DEFAULTS.propertyTax); setHomeInsurance(DEFAULTS.homeInsurance); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);
  const handlePrint = () => { if (!printRef.current) return; const w = window.open("","_blank"); if (!w) return; w.document.write(`<html><head><title>Fixed-Rate Mortgage</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`); w.document.write(printRef.current.innerHTML); w.document.write("</body></html>"); w.document.close(); w.print(); };

  const faqs = [
    { question: "What is a fixed-rate mortgage?", answer: "A fixed-rate mortgage (FRM) locks your interest rate for the entire loan term—typically 15 or 30 years. Your principal and interest payment never changes, providing complete payment predictability. This contrasts with adjustable-rate mortgages (ARMs), where the rate can change after an initial fixed period." },
    { question: "Is a 15-year or 30-year fixed-rate mortgage better?", answer: "It depends on your financial goals. A 15-year mortgage has a higher monthly payment but builds equity faster and costs dramatically less in total interest—often saving $100,000+ on a typical home loan. A 30-year mortgage has lower monthly payments, improving monthly cash flow, but the total interest cost is substantially higher." },
    { question: "What does the P&I payment include?", answer: "P&I stands for Principal and Interest—the core components of your mortgage payment. Your actual monthly payment is higher because it also includes property taxes (escrowed), homeowners insurance (escrowed), and potentially PMI if your down payment is below 20%. Our calculator shows all components." },
    { question: "How does a larger down payment affect my fixed-rate mortgage?", answer: "A larger down payment directly reduces your loan amount, lowering your monthly P&I payment and total interest paid. Going from 5% to 20% down on a $400,000 home eliminates PMI, reduces your loan by $60,000, and can save over $70,000 in interest over 30 years." },
    { question: "Should I lock my rate with a fixed or adjustable mortgage?", answer: "Fixed rates offer certainty and protection against rate increases. ARMs start with lower rates but carry risk if rates rise. If you plan to stay in the home more than 7-10 years or rates are currently at historical lows, a fixed-rate mortgage is generally the safer choice." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Fixed-Rate Mortgage Payment Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fixed-Rate Mortgage Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
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
                  <CompactInput id="tax" label="Annual Property Tax" value={propertyTax} onChange={setPropertyTax} prefix="$" />
                  <CompactInput id="ins" label="Annual Home Insurance" value={homeInsurance} onChange={setHomeInsurance} prefix="$" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Home className="h-4 w-4" /> Calculate Payment
              </button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary print:hidden" aria-label="Print"><Printer className="h-4 w-4" /></button>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">{loanTermYears}-year fixed at {interestRate}% APR</div>
                </div>
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Loan Amount", `$${(parseFloat(homePrice)*(1-parseFloat(downPaymentPct)/100)||0).toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Interest", `$${results.totalInterest.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Payoff Date", results.payoffDate]].map(([l,v],i) => (
                    <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-lg font-bold ${i===1?"text-amber-600":i===2?"text-emerald-600":""}`}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <h3 className="text-base font-bold mb-4">Payment Summary</h3>
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
                      <button onClick={() => setViewMode("monthly")} className={`px-3 text-xs font-semibold transition-colors ${viewMode==="monthly"?"bg-primary text-primary-foreground":"bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Monthly</button>
                      <button onClick={() => setViewMode("yearly")} className={`px-3 text-xs font-semibold transition-colors border-l border-input ${viewMode==="yearly"?"bg-primary text-primary-foreground":"bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Yearly</button>
                    </div>
                  </div>
                  <AmortizationTable rows={viewMode==="yearly"?results.yearlyRows:results.monthlyRows} yearly={viewMode==="yearly"} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Fixed-Rate Mortgage?</h2>
            <p>A <strong>fixed-rate mortgage</strong> is the most straightforward and popular home financing product in the United States. The defining feature is simple: the interest rate is permanently locked for the entire duration of the loan—whether that is 10, 15, 20, or 30 years. Your principal and interest (P&I) payment never changes from the first payment to the last, providing a level of financial predictability that adjustable-rate mortgages (ARMs) cannot match.</p>
            <p>This calculator computes your exact monthly payment, generates a full amortization schedule, and shows how much of your total payment goes toward building equity versus paying interest to the bank—an essential insight for making an informed mortgage decision.</p>

            <h2 className="text-2xl font-bold mb-3">The 15-Year vs. 30-Year Decision</h2>
            <p>The choice between a 15-year and 30-year fixed mortgage is one of the most consequential financial decisions a homeowner makes. On a $320,000 loan at 6.5% APR, a 30-year term produces a monthly P&I payment of $2,023. The same loan on a 15-year term costs $2,790 per month—$767 more per month. However, the 30-year borrower will pay approximately $408,000 in total interest over the loan life, while the 15-year borrower pays only $182,000. The shorter term saves an extraordinary $226,000 in interest, though it requires a significantly higher monthly commitment.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Amortization</h2>
            <p>Every fixed-rate mortgage payment is split between two components that shift over time. In the early years, the vast majority of each payment is consumed by interest, because the outstanding balance is at its peak. For example, on a $320,000 loan at 6.5%, your very first payment includes approximately $1,733 of interest and only $290 of principal. By year 20, those proportions flip—more goes to principal than interest. This is amortization in action.</p>

            <h2 className="text-2xl font-bold mb-3">The True Monthly Cost of Homeownership</h2>
            <p>Your P&I payment is only part of your total monthly housing cost. Lenders typically require that property taxes and homeowners insurance be collected monthly into an escrow account, from which they pay these bills on your behalf. If your down payment is below 20%, PMI is also added. Our Advanced Options panel lets you input annual property tax and insurance amounts to calculate your true all-in monthly payment—the number that must fit within your household budget.</p>

            <h2 className="text-2xl font-bold mb-3">Down Payment Impact</h2>
            <p>The down payment is a powerful lever. Every extra dollar you put down reduces your loan principal by exactly one dollar, reducing interest charges over the entire loan term. Additionally, reaching a 20% down payment eliminates the requirement for Private Mortgage Insurance (PMI), which typically adds 0.2%–2% of the loan amount per year to your costs. On a $400,000 home, the difference between 5% down ($20,000) and 20% down ($80,000) eliminates PMI and reduces the loan by $60,000—saving over $100,000 in total long-term costs.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fixed-rate-mortgage-payment-calculator" />
          <PopularCalculators exclude="/calculator/fixed-rate-mortgage-payment-calculator" />
        </div>
      </div>
    </>
  );
}
