"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { RotateCcw, Truck, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface RvResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  loanAmount: number;
  salesTaxAmount: number;
  rows: AmortRow[];
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRv(rvPrice: number, downPayment: number, tradeInValue: number, interestRate: number, loanTermMonths: number, salesTaxRate: number, registrationFees: number): RvResult {
  // Tax is usually calculated on the price after trade-in
  const taxableAmount = Math.max(0, rvPrice - tradeInValue);
  const salesTaxAmount = taxableAmount * (salesTaxRate / 100);
  
  // Total out the door price
  const outTheDoorPrice = rvPrice + salesTaxAmount + registrationFees;
  
  // Loan amount
  const loanAmount = Math.max(0, outTheDoorPrice - downPayment - tradeInValue);
  
  const r = interestRate / 100 / 12;
  const n = loanTermMonths;
  
  const monthlyPayment = loanAmount > 0 && n > 0
    ? (r > 0 ? loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : loanAmount / n)
    : 0;

  const totalInterest = Math.max(0, monthlyPayment * n - loanAmount);
  const totalPaid = loanAmount + totalInterest;

  const rows: AmortRow[] = [];
  let balance = loanAmount;
  for (let i = 1; i <= n && balance > 0.01; i++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance -= principal;
    rows.push({ period: i, payment: interest + principal, principal, interest, balance: Math.max(0, balance) });
  }

  const chartData = [
    { name: "Principal", value: loanAmount, color: "hsl(var(--primary))" },
    { name: "Total Interest", value: totalInterest, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "RV Price", value: `$${rvPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Trade-In & Down Payment", value: `$${(tradeInValue + downPayment).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Sales Tax", value: `$${salesTaxAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Registration Fees", value: `$${registrationFees.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Loan Amount", value: `$${loanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Loan Term", value: `${loanTermMonths} months (${(loanTermMonths/12).toFixed(1)} yrs)` },
  ];

  return { monthlyPayment, totalInterest, totalPaid, loanAmount, salesTaxAmount, rows, chartData, summaryStats };
}

const DEFAULTS = { rvPrice: "85000", downPayment: "10000", tradeInValue: "0", interestRate: "8.5", loanTermMonths: "144", salesTaxRate: "6.5", registrationFees: "500" };

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
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>
) : null;

export default function RvLoanPaymentCalculator() {
  const [rvPrice, setRvPrice] = useState(DEFAULTS.rvPrice);
  const [downPayment, setDownPayment] = useState(DEFAULTS.downPayment);
  const [tradeInValue, setTradeInValue] = useState(DEFAULTS.tradeInValue);
  const [interestRate, setInterestRate] = useState(DEFAULTS.interestRate);
  const [loanTermMonths, setLoanTermMonths] = useState(DEFAULTS.loanTermMonths);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [salesTaxRate, setSalesTaxRate] = useState(DEFAULTS.salesTaxRate);
  const [registrationFees, setRegistrationFees] = useState(DEFAULTS.registrationFees);
  const [results, setResults] = useState<RvResult | null>(null);

  const calc = () => setResults(calcRv(parseFloat(rvPrice)||0, parseFloat(downPayment)||0, parseFloat(tradeInValue)||0, parseFloat(interestRate)||0, parseFloat(loanTermMonths)||144, parseFloat(salesTaxRate)||0, parseFloat(registrationFees)||0));
  const reset = () => { setRvPrice(DEFAULTS.rvPrice); setDownPayment(DEFAULTS.downPayment); setTradeInValue(DEFAULTS.tradeInValue); setInterestRate(DEFAULTS.interestRate); setLoanTermMonths(DEFAULTS.loanTermMonths); setSalesTaxRate(DEFAULTS.salesTaxRate); setRegistrationFees(DEFAULTS.registrationFees); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "How long can you finance an RV?", answer: "RV loans typically have much longer terms than standard auto loans because RVs are large, expensive assets more akin to a small house. While a car loan usually caps at 72-84 months, RV loans commonly stretch from 120 months (10 years) up to 240 months (20 years) for high-end motorhomes exceeding $100,000." },
    { question: "Are RV loan interest rates higher than auto loan rates?", answer: "Generally, yes. RVs are considered luxury, discretionary items rather than primary transportation. In an economic downturn, borrowers are more likely to default on an RV loan than a car loan or mortgage. Because of this higher risk profile, lenders typically charge 1% to 3% more for an RV loan compared to a standard auto loan, depending on your credit score." },
    { question: "Is RV loan interest tax deductible?", answer: "In many cases, yes. The IRS considers an RV to be a 'second home' if it contains basic sleeping, cooking, and toilet facilities. If your RV meets these criteria and the loan is secured by the RV, you may be able to deduct the interest on your federal tax return just like a standard mortgage, subject to current tax code limits." },
    { question: "How does sales tax affect my RV loan?", answer: "Sales tax on an $80,000 RV can be substantial—often $4,000 to $7,000 depending on your state. If you do not pay this tax in cash upfront, the dealership will roll it into your loan amount. This means you will pay interest on the sales tax for the next 10 to 15 years, significantly increasing the total cost of the vehicle." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "RV Loan Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">RV Loan Payment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="RV Price" value={rvPrice} onChange={setRvPrice} prefix="$" />
              <CompactInput id="down" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-1.5">Loan Term</label>
                <select value={loanTermMonths} onChange={e => setLoanTermMonths(e.target.value)} className="h-10 px-3 text-sm border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="60">60 months (5 years)</option>
                  <option value="84">84 months (7 years)</option>
                  <option value="120">120 months (10 years)</option>
                  <option value="144">144 months (12 years)</option>
                  <option value="180">180 months (15 years)</option>
                  <option value="240">240 months (20 years)</option>
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Taxes, Fees & Trade-In <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <CompactInput id="trade" label="Trade-In Value" value={tradeInValue} onChange={setTradeInValue} prefix="$" />
                  <CompactInput id="tax" label="Sales Tax Rate" value={salesTaxRate} onChange={setSalesTaxRate} suffix="%" />
                  <CompactInput id="fees" label="Dealer/Reg Fees" value={registrationFees} onChange={setRegistrationFees} prefix="$" />
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
                <div className="text-4xl font-bold text-foreground">${results.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">For {loanTermMonths} months at {interestRate}% APR</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Loan Amount", `$${results.loanAmount.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Interest", `$${results.totalInterest.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Total Cost", `$${results.totalPaid.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-lg font-bold ${i===1?"text-amber-600":""}`}>{v}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Loan Details</h3>
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
            <h2 className="text-2xl font-bold mb-3">Financing Your RV: What to Know</h2>
            <p>Buying a recreational vehicle is a major financial commitment, often functioning more like purchasing a second home than buying a car. Because motorhomes, fifth wheels, and travel trailers can cost anywhere from $30,000 to well over $300,000, lenders treat RV financing differently than standard auto loans. The <strong>RV Loan Payment Calculator</strong> helps you model these long-term loans so you can understand the true cost of ownership before signing at the dealership.</p>

            <h2 className="text-2xl font-bold mb-3">The Impact of 15-Year and 20-Year Terms</h2>
            <p>To keep monthly payments affordable on expensive rigs, lenders frequently offer RV loans with terms of 144 months (12 years), 180 months (15 years), or even 240 months (20 years) for luxury diesel pushers. While stretching the loan out to 15 years makes the monthly payment look highly attractive, it completely changes the math on total interest.</p>
            <p>For example, an $80,000 RV financed at 8.5% over 60 months (5 years) costs $18,485 in total interest. That same $80,000 RV financed over 180 months (15 years) to lower the monthly payment will cost a staggering $61,780 in total interest. By the time the loan is paid off, you will have paid over $141,000 for an asset that has been depreciating heavily for 15 years. Use this calculator to experiment with shorter terms to see how much interest you can save.</p>

            <h2 className="text-2xl font-bold mb-3">Taxes and Negative Equity</h2>
            <p>Sales tax on an RV purchase is significant. Depending on your state, taxes and dealer fees can add 6% to 10% to the purchase price. If you do not pay these costs in cash and instead roll them into your loan, you are paying 8.5% interest on taxes for the next decade. Furthermore, rolling taxes and fees into the loan almost guarantees you will be "underwater" (owing more than the RV is worth) the moment you drive off the lot. Because RVs depreciate steeply in the first three years, taking a 15-year loan with zero down payment means you may not build positive equity in the RV for 6 to 8 years.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rv-loan-payment-calculator" />
          <PopularCalculators exclude="/calculator/rv-loan-payment-calculator" />
        </div>
      </div>
    </>
  );
}
