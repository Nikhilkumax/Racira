"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Home, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface AffordResult {
  maxHomePrice: number;
  maxLoanAmount: number;
  maxTotalMonthlyPayment: number;
  maxPIMonthly: number;
  downPaymentAmount: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcAffordability(monthlyIncome: number, monthlyDebts: number, downPayment: number, interestRate: number, loanTermYears: number, propertyTaxRate: number, homeInsurance: number, maxDti: number): AffordResult {
  // Maximum allowed total monthly debt payment based on front/back end ratios
  const maxTotalDebtPayment = monthlyIncome * (maxDti / 100);
  
  // Maximum housing payment (PITI + HOA) allowed
  const maxHousingPayment = Math.max(0, maxTotalDebtPayment - monthlyDebts);
  
  // We need to reverse-engineer the home price from the max housing payment.
  // Housing Payment = P&I + Tax + Insurance
  // P&I = LoanAmount * (r(1+r)^n)/((1+r)^n - 1)
  // LoanAmount = HomePrice - DownPayment
  // Tax = HomePrice * (TaxRate / 12)
  // Insurance = HomeInsurance / 12
  
  const r = interestRate / 100 / 12;
  const n = loanTermYears * 12;
  const mortgageFactor = r > 0 ? (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 1 / n;
  const monthlyTaxRate = (propertyTaxRate / 100) / 12;
  const monthlyIns = homeInsurance / 12;
  
  // maxHousingPayment = (HomePrice - DownPayment) * mortgageFactor + HomePrice * monthlyTaxRate + monthlyIns
  // maxHousingPayment - monthlyIns + DownPayment * mortgageFactor = HomePrice * (mortgageFactor + monthlyTaxRate)
  
  const maxHomePrice = Math.max(0, (maxHousingPayment - monthlyIns + downPayment * mortgageFactor) / (mortgageFactor + monthlyTaxRate));
  const maxLoanAmount = Math.max(0, maxHomePrice - downPayment);
  
  const monthlyPI = maxLoanAmount * mortgageFactor;
  const monthlyTax = maxHomePrice * monthlyTaxRate;
  
  const chartData = [
    { name: "Principal & Interest", value: monthlyPI, color: "hsl(var(--primary))" },
    { name: "Property Tax", value: monthlyTax, color: "#f59e0b" },
    { name: "Home Insurance", value: monthlyIns, color: "#10b981" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Gross Monthly Income", value: `$${monthlyIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Debts", value: `$${monthlyDebts.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Max Debt-to-Income (DTI)", value: `${maxDti}%` },
    { label: "Max Allowed Housing Payment", value: `$${maxHousingPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Estimated Property Tax", value: `$${monthlyTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` },
  ];

  return { maxHomePrice, maxLoanAmount, maxTotalMonthlyPayment: maxHousingPayment, maxPIMonthly: monthlyPI, downPaymentAmount: downPayment, chartData, summaryStats };
}

const DEFAULTS = { monthlyIncome: "10000", monthlyDebts: "1000", downPayment: "80000", interestRate: "6.5", loanTermYears: "30", propertyTaxRate: "1.2", homeInsurance: "1200", maxDti: "43" };

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

export default function MaximumMortgageAffordabilityCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState(DEFAULTS.monthlyIncome);
  const [monthlyDebts, setMonthlyDebts] = useState(DEFAULTS.monthlyDebts);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [propertyTaxRate, setPropertyTaxRate] = useState(DEFAULTS.propertyTaxRate);
  const [homeInsurance, setHomeInsurance] = useState(DEFAULTS.homeInsurance);
  const [maxDti, setMaxDti] = useState(DEFAULTS.maxDti);
  const [results, setResults] = useState<AffordResult | null>(null);

  const calc = () => setResults(calcAffordability(parseFloat(monthlyIncome)||0, parseFloat(monthlyDebts)||0, parseFloat(downPayment)||0, parseFloat(interestRate)||0, parseFloat(loanTermYears)||30, parseFloat(propertyTaxRate)||0, parseFloat(homeInsurance)||0, parseFloat(maxDti)||43));
  const reset = () => { setMonthlyIncome(DEFAULTS.monthlyIncome); setMonthlyDebts(DEFAULTS.monthlyDebts); setDownPayment(DEFAULTS.downPayment); setInterestRate(DEFAULTS.interestRate); setLoanTermYears(DEFAULTS.loanTermYears); setPropertyTaxRate(DEFAULTS.propertyTaxRate); setHomeInsurance(DEFAULTS.homeInsurance); setMaxDti(DEFAULTS.maxDti); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "How much of my income should go to a mortgage?", answer: "Lenders typically follow the 28/36 rule. No more than 28% of your gross monthly income should go toward housing expenses (mortgage, taxes, insurance), and no more than 36% should go toward all total debt (housing plus car loans, student loans, credit cards). However, conventional loans legally allow Debt-to-Income (DTI) ratios up to 43% (or even 50% with compensating factors)." },
    { question: "What is Debt-to-Income (DTI) ratio?", answer: "DTI compares your gross monthly income to your total monthly debt payments. If you earn $10,000 a month and have $1,000 in car/student loan payments, plus a projected $2,500 housing payment, your total debt is $3,500. Your DTI is 35% ($3,500 / $10,000). Our calculator uses the maximum DTI you specify (default 43%) to work backwards and find the most expensive home you qualify for." },
    { question: "Does this calculator include property taxes and insurance?", answer: "Yes. When a lender determines how much you can afford, they don't just look at principal and interest (P&I). They calculate PITI: Principal, Interest, Taxes, and Insurance. A $400,000 home in a state with 2% property tax will yield a much smaller max affordability than the same home in a state with 0.5% property tax, because taxes consume more of your allowed monthly payment." },
    { question: "Can I afford the maximum amount calculated?", answer: "Just because a lender will approve you for a maximum amount doesn't mean you should spend it. The maximum affordability calculation assumes you will stretch your budget to the absolute legal limit. Most financial advisors recommend spending significantly less than your mathematical maximum to ensure you have cash flow for savings, investments, home maintenance, and lifestyle." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Maximum Mortgage Affordability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Maximum Mortgage Affordability Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="income" label="Gross Monthly Income" value={monthlyIncome} onChange={setMonthlyIncome} prefix="$" />
              <CompactInput id="debts" label="Monthly Debts" value={monthlyDebts} onChange={setMonthlyDebts} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="down" label="Available Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="years" />
                  <CompactInput id="tax" label="Property Tax Rate" value={propertyTaxRate} onChange={setPropertyTaxRate} suffix="%" />
                  <CompactInput id="ins" label="Annual Insurance" value={homeInsurance} onChange={setHomeInsurance} prefix="$" />
                  <CompactInput id="dti" label="Max DTI Ratio" value={maxDti} onChange={setMaxDti} suffix="%" />
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Maximum Home Price You Can Afford</div>
                <div className="text-4xl font-bold text-foreground">${results.maxHomePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">Based on ${results.maxTotalMonthlyPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })} max monthly housing payment</div>
              </div>
              <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Max Loan Amount", `$${results.maxLoanAmount.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Down Payment", `$${results.downPaymentAmount.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Qualification Metrics</h3>
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
                  <h3 className="text-base font-bold mb-2 w-full text-left">Max Monthly Payment Breakdown</h3>
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
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Much Home Can You Truly Afford?</h2>
            <p>Determining your maximum mortgage affordability is the crucial first step before browsing real estate listings. If you start shopping before knowing your mathematical limit, you risk falling in love with a home that lenders will not approve you for. The <strong>Maximum Mortgage Affordability Calculator</strong> reverses the standard mortgage math: instead of entering a home price to see the monthly payment, you enter your income and debts, and the calculator determines the absolute maximum home price a lender will approve.</p>
            <p>This calculation is strictly mathematical. It models the exact underwriting formulas used by major banks, relying heavily on the Debt-to-Income (DTI) ratio. However, borrowers should be aware that "what you qualify for" and "what you should comfortably spend" are often two different numbers. Being approved for a $600,000 home doesn't mean your lifestyle and savings goals can easily absorb the payments.</p>

            <h2 className="text-2xl font-bold mb-3">The Debt-to-Income (DTI) Constraint</h2>
            <p>Your affordability ceiling is established by your Debt-to-Income ratio. Lenders divide your total monthly debt obligations (car payments, student loans, minimum credit card payments, plus the proposed new mortgage payment) by your gross monthly income (your income before taxes). For conventional loans, the absolute legal limit for DTI is usually 43%, though some automated underwriting systems may approve up to 50% for borrowers with excellent credit and large reserves.</p>
            <p>Our calculator assumes a default max DTI of 43%. If you earn $10,000 a month gross, your maximum total allowed debt is $4,300. If you already have $1,000 in existing car and student loan payments, the lender will only allow a maximum housing payment of $3,300. That $3,300 must cover Principal, Interest, Taxes, and Insurance (PITI).</p>

            <h2 className="text-2xl font-bold mb-3">Why Property Taxes Drastically Change Affordability</h2>
            <p>Many homebuyers use simple mortgage calculators that only look at Principal and Interest, leading them to dramatically overestimate what they can afford. Lenders underwrite based on PITI. This means the local property tax rate is a massive factor in your purchasing power.</p>
            <p>For example, if you are looking at a $500,000 home in a state with a 0.5% property tax rate, your monthly tax bill is $208. In a state with a 2.5% property tax rate, the monthly tax bill on that same $500,000 home is $1,041. That extra $833 per month in taxes eats directly into your allowed DTI ratio, meaning the lender will drastically reduce the maximum loan amount they will approve in the high-tax state.</p>

            <h2 className="text-2xl font-bold mb-3">The Impact of Down Payments</h2>
            <p>Your available down payment serves two functions in affordability. First, it bridges the gap between the maximum loan amount the bank will give you and the purchase price of the home. If the bank's DTI formula dictates they will only lend you $400,000, but you have $100,000 in cash, you can afford a $500,000 home. Second, bringing a down payment of at least 20% eliminates Private Mortgage Insurance (PMI). Removing the PMI cost from your monthly payment frees up more room in your DTI ratio, allowing the bank to approve a slightly larger principal loan amount.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/maximum-mortgage-affordability-calculator" />
          <PopularCalculators exclude="/calculator/maximum-mortgage-affordability-calculator" />
        </div>
      </div>
    </>
  );
}
