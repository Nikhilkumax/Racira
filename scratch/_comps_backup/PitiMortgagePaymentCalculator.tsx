"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Home, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface PitiResult {
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoa: number;
  totalMonthlyPayment: number;
  loanAmount: number;
  downPaymentAmount: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPiti(homePrice: number, downPaymentPct: number, interestRate: number, loanTermYears: number, annualPropertyTax: number, annualHomeInsurance: number, monthlyHoa: number, annualPmiRate: number): PitiResult {
  const downPaymentAmount = homePrice * (downPaymentPct / 100);
  const loanAmount = Math.max(0, homePrice - downPaymentAmount);
  
  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;
  
  const principalAndInterest = loanAmount > 0 && n > 0
    ? (r > 0 ? loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : loanAmount / n)
    : 0;

  const propertyTax = annualPropertyTax / 12;
  const homeInsurance = annualHomeInsurance / 12;
  
  // PMI only applies if down payment is less than 20%
  const pmi = downPaymentPct < 20 ? (loanAmount * (annualPmiRate / 100)) / 12 : 0;
  
  const totalMonthlyPayment = principalAndInterest + propertyTax + homeInsurance + pmi + monthlyHoa;

  const chartData = [
    { name: "Principal & Interest", value: principalAndInterest, color: "hsl(var(--primary))" },
    { name: "Property Tax", value: propertyTax, color: "#f59e0b" },
    { name: "Home Insurance", value: homeInsurance, color: "#10b981" },
    { name: "PMI", value: pmi, color: "#ef4444" },
    { name: "HOA Fees", value: monthlyHoa, color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Home Price", value: `$${homePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Down Payment", value: `$${downPaymentAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${downPaymentPct}%)` },
    { label: "Interest Rate", value: `${interestRate}%` },
    { label: "Loan Term", value: `${loanTermYears} years` },
  ];

  return { principalAndInterest, propertyTax, homeInsurance, pmi, hoa: monthlyHoa, totalMonthlyPayment, loanAmount, downPaymentAmount, chartData, summaryStats };
}

const DEFAULTS = { homePrice: "400000", downPaymentPct: "10", interestRate: "6.5", loanTermYears: "30", annualPropertyTax: "4800", annualHomeInsurance: "1200", monthlyHoa: "0", annualPmiRate: "0.5" };

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
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo</p>
  </div>
) : null;

export default function PitiMortgagePaymentCalculator() {
  const [homePrice, setHomePrice] = useState(DEFAULTS.homePrice);
  const [downPaymentPct, setDownPaymentPct] = useState(DEFAULTS.downPaymentPct);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [annualPropertyTax, setAnnualPropertyTax] = useState(DEFAULTS.annualPropertyTax);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState(DEFAULTS.annualHomeInsurance);
  const [monthlyHoa, setMonthlyHoa] = useState(DEFAULTS.monthlyHoa);
  const [annualPmiRate, setAnnualPmiRate] = useState(DEFAULTS.annualPmiRate);
  
  const [results, setResults] = useState<PitiResult | null>(null);

  const calc = () => setResults(calcPiti(parseFloat(homePrice)||0, parseFloat(downPaymentPct)||0, parseFloat(interestRate)||0, parseFloat(loanTermYears)||30, parseFloat(annualPropertyTax)||0, parseFloat(annualHomeInsurance)||0, parseFloat(monthlyHoa)||0, parseFloat(annualPmiRate)||0));
  const reset = () => { setHomePrice(DEFAULTS.homePrice); setDownPaymentPct(DEFAULTS.downPaymentPct); setInterestRate(DEFAULTS.interestRate); setLoanTermYears(DEFAULTS.loanTermYears); setAnnualPropertyTax(DEFAULTS.annualPropertyTax); setAnnualHomeInsurance(DEFAULTS.annualHomeInsurance); setMonthlyHoa(DEFAULTS.monthlyHoa); setAnnualPmiRate(DEFAULTS.annualPmiRate); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What does PITI stand for?", answer: "PITI is an acronym that stands for Principal, Interest, Taxes, and Insurance. These four elements make up the standard monthly mortgage payment. Lenders use the full PITI amount, rather than just the principal and interest, to determine whether you qualify for a loan because it represents your true monthly housing obligation." },
    { question: "How is the Principal and Interest (P&I) calculated?", answer: "P&I is calculated using an amortization formula based on your loan amount, interest rate, and loan term. The loan amount is your purchase price minus your down payment. This formula ensures that your P&I payment remains exactly the same every month for the entire life of a fixed-rate loan, even though the ratio of principal to interest changes each month." },
    { question: "Why do my property taxes and insurance go up?", answer: "While your Principal and Interest are fixed, property taxes and homeowners insurance are not. Local tax assessors re-evaluate property values periodically, and insurance companies adjust premiums based on risk factors and inflation. Because your lender usually collects these via an escrow account, your total PITI payment will increase over time when taxes or insurance rates rise." },
    { question: "When does PMI (Private Mortgage Insurance) drop off?", answer: "If you put down less than 20%, you will likely pay PMI. For conventional loans, PMI typically drops off automatically when your loan-to-value (LTV) ratio reaches 78% of the original purchase price. You can also request cancellation when it hits 80%. FHA loans, however, carry Mortgage Insurance Premiums (MIP) that often last for the entire life of the loan." },
    { question: "Should I include HOA fees in PITI?", answer: "While HOA fees are technically not part of the PITI acronym, they are a mandatory housing expense. Lenders absolutely include HOA dues in their Debt-to-Income (DTI) calculations when approving your loan. If you are buying a condo or in a managed community, you must factor the HOA fee into your true monthly affordability." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "PITI Mortgage Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">PITI Mortgage Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" />
              <CompactInput id="down" label="Down Payment" value={downPaymentPct} onChange={setDownPaymentPct} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Loan Term</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["15","15 yr"],["30","30 yr"]].map(([v,l]) => (
                    <button key={v} onClick={() => setLoanTermYears(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${loanTermYears===v?"bg-primary text-primary-foreground border-primary":"border-input bg-background hover:bg-secondary"}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="tax" label="Annual Property Tax" value={annualPropertyTax} onChange={setAnnualPropertyTax} prefix="$" />
              <CompactInput id="ins" label="Annual Insurance" value={annualHomeInsurance} onChange={setAnnualHomeInsurance} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Additional Fees & PMI <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="hoa" label="Monthly HOA Fee" value={monthlyHoa} onChange={setMonthlyHoa} prefix="$" />
                  <CompactInput id="pmi" label="Annual PMI Rate" value={annualPmiRate} onChange={setAnnualPmiRate} suffix="%" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Monthly Payment</div>
                <div className="text-4xl font-bold text-foreground">${results.totalMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">Includes Principal, Interest, Taxes, Insurance, and applicable fees.</div>
              </div>
              
              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Principal & Interest", `$${results.principalAndInterest.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`], ["Taxes, Ins & Fees", `$${(results.propertyTax + results.homeInsurance + results.pmi + results.hoa).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>

              {parseFloat(downPaymentPct) < 20 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium">⚠️ <strong>PMI Included:</strong> Because your down payment is less than 20%, an estimated Private Mortgage Insurance (PMI) payment of ${results.pmi.toFixed(2)}/mo is included. This will typically drop off when you reach 20% equity.</p>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Payment Breakdown</h3>
                  <div className="space-y-2.5">
                    {results.chartData.map((s, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
                          <span className="text-sm text-muted-foreground">{s.name}</span>
                        </div>
                        <span className="text-sm font-semibold">${s.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                  <h3 className="text-base font-bold mb-2 w-full text-left">PITI Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                        {results.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the True Cost of Homeownership</h2>
            <p>One of the most common mistakes first-time homebuyers make is calculating their affordability based solely on the loan principal and interest rate. While P&I forms the core of your mortgage, it does not reflect the total amount you will write a check for every month. To avoid foreclosure and protect their asset, lenders require you to pay property taxes and homeowners insurance simultaneously with your loan repayment. This complete calculation is known as PITI: Principal, Interest, Taxes, and Insurance.</p>

            <h2 className="text-2xl font-bold mb-3">The Four Components of PITI</h2>
            <p><strong>Principal:</strong> This is the portion of your monthly payment that actually pays down the outstanding balance of your loan. In the early years of a 30-year mortgage, the principal portion is very small, but it grows larger each month as the balance decreases.</p>
            <p><strong>Interest:</strong> The fee the lender charges you to borrow the money. In the beginning of the loan, interest makes up the vast majority of your P&I payment. While the total P&I payment remains fixed, the ratio of interest to principal shifts constantly through the process of amortization.</p>
            <p><strong>Taxes:</strong> Real estate property taxes are assessed by your local county or municipality. Lenders typically divide your annual tax bill by 12 and collect that amount monthly, holding it in an escrow account until the tax bill is due. Because local governments can raise tax rates and property values generally increase, your tax payment will fluctuate over time.</p>
            <p><strong>Insurance:</strong> Homeowners insurance protects the property against damage from fire, weather, and theft. Like taxes, the lender collects 1/12th of the annual premium each month into an escrow account. If you put down less than 20%, a second type of insurance—Private Mortgage Insurance (PMI)—is also added to protect the lender against default.</p>

            <h2 className="text-2xl font-bold mb-3">Why PITI Matters for Loan Approval</h2>
            <p>When you apply for a mortgage, the underwriter evaluates your Debt-to-Income (DTI) ratio. They do not use your base P&I to calculate this ratio; they use the full projected PITI, plus any Homeowners Association (HOA) dues. If you have a strict budget, understanding your PITI is essential. A $400,000 home in a state with very high property taxes will result in a much higher monthly PITI—and therefore require a higher income to qualify—than a $400,000 home in a low-tax state.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/piti-mortgage-payment-calculator" />
          <PopularCalculators exclude="/calculator/piti-mortgage-payment-calculator" />
        </div>
      </div>
    </>
  );
}
