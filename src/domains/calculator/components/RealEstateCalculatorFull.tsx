"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Building } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = (n: number) => `$${fmt(n)}`;
const fmtPct = (n: number, d = 2) => `${n.toFixed(d)}%`;

const Inp = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface REResult {
  monthlyRent: number; annualRent: number; noi: number; capRate: number; cashOnCash: number;
  annualMortgage: number; totalCashFlow: number; monthlyCashFlow: number; totalReturn: number;
  roi: number; breakEvenOccupancy: number; grossYield: number;
  projectionData: { year: number; equity: number; cashFlow: number; totalReturn: number }[];
}

export default function RealEstateCalculatorFull() {
  const [purchasePrice, setPurchasePrice] = useState("350000");
  const [downPayment, setDownPayment] = useState("20");
  const [interestRate, setInterestRate] = useState("7.2");
  const [loanTerm, setLoanTerm] = useState("30");
  const [monthlyRentIn, setMonthlyRentIn] = useState("2400");
  const [propertyTax, setPropertyTax] = useState("3600");
  const [insurance, setInsurance] = useState("1800");
  const [maintenance, setMaintenance] = useState("3500");
  const [vacancyRate, setVacancyRate] = useState("8");
  const [mgmtFee, setMgmtFee] = useState("8");
  const [appreciation, setAppreciation] = useState("3");
  const [holdYears, setHoldYears] = useState("10");
  const [res, setRes] = useState<REResult | null>(null);

  useEffect(() => { calculate(); }, []);

  const calculate = () => {
    const pp = parseFloat(purchasePrice) || 350000;
    const dp = parseFloat(downPayment) / 100 || 0.20;
    const ir = parseFloat(interestRate) / 100 || 0.072;
    const lt = parseInt(loanTerm) || 30;
    const mr = parseFloat(monthlyRentIn) || 2400;
    const pt = parseFloat(propertyTax) || 3600;
    const ins = parseFloat(insurance) || 1800;
    const maint = parseFloat(maintenance) || 3500;
    const vac = parseFloat(vacancyRate) / 100 || 0.08;
    const mgmt = parseFloat(mgmtFee) / 100 || 0.08;
    const appr = parseFloat(appreciation) / 100 || 0.03;
    const hy = parseInt(holdYears) || 10;

    const downAmt = pp * dp;
    const loanAmt = pp - downAmt;
    const monthlyRate = ir / 12;
    const numPayments = lt * 12;
    const monthlyPayment = loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualMortgage = monthlyPayment * 12;

    const annualRent = mr * 12;
    const effectiveRent = annualRent * (1 - vac);
    const mgmtFeeAmt = effectiveRent * mgmt;
    const noi = effectiveRent - pt - ins - maint - mgmtFeeAmt;
    const capRate = (noi / pp) * 100;
    const grossYield = (annualRent / pp) * 100;
    const totalCashFlow = noi - annualMortgage;
    const monthlyCashFlow = totalCashFlow / 12;
    const cashOnCash = (totalCashFlow / downAmt) * 100;
    const totalReturn = cashOnCash + appr * 100;
    const roi = (noi / (pp * dp)) * 100;
    const breakEvenOccupancy = ((annualMortgage + pt + ins + maint) / annualRent) * 100;

    // Projection
    let loanBalance = loanAmt;
    const projectionData = Array.from({ length: hy + 1 }, (_, i) => {
      const propValue = pp * Math.pow(1 + appr, i);
      const equity = propValue - loanBalance;
      const annualCF = i === 0 ? 0 : totalCashFlow;
      const totalRet = equity - downAmt + annualCF * i;
      if (i > 0) {
        for (let m = 0; m < 12; m++) {
          const int = loanBalance * monthlyRate;
          const princ = monthlyPayment - int;
          loanBalance -= princ;
        }
      }
      return { year: i, equity: Math.round(equity), cashFlow: Math.round(annualCF), totalReturn: Math.round(totalRet) };
    });

    setRes({ monthlyRent: mr, annualRent, noi, capRate, cashOnCash, annualMortgage, totalCashFlow, monthlyCashFlow, totalReturn, roi, breakEvenOccupancy, grossYield, projectionData });
  };

  const faqs = [
    { question: "What is a cap rate and what is a good cap rate?", answer: "Cap rate (capitalization rate) = Net Operating Income / Property Value. It measures a property's income-generating potential independent of financing. A 'good' cap rate depends on the market and property type. In high-cost urban markets (NYC, SF), 3-5% cap rates are typical due to appreciation expectations. In secondary and tertiary markets, 6-10%+ cap rates are common. Higher cap rates offer more cash flow but often in slower-appreciating markets; lower cap rates reflect higher appreciation expectations." },
    { question: "What is cash-on-cash return?", answer: "Cash-on-cash return = Annual Cash Flow / Total Cash Invested (down payment + closing costs). It measures the actual cash income relative to cash invested, making it directly comparable to other investment returns. Unlike cap rate, it accounts for your specific financing. A 5-8% cash-on-cash return is generally considered acceptable for rental properties. Higher leverage (smaller down payment) can increase cash-on-cash return but also increases risk." },
    { question: "What expenses should I budget for rental property?", answer: "Budget for: Property taxes (0.5-2.5% of value annually), Insurance (0.5-1.5% of value), Maintenance and repairs (1-2% of value annually), Property management fees (8-12% of gross rent), Vacancy (5-10% of potential gross income), Capital expenditures reserve (roof, HVAC, water heater — ~1% of value), HOA fees if applicable. These expenses typically total 40-50% of gross rent in what's called the 'expense ratio.' The 50% rule of thumb: assume 50% of gross rent goes to expenses before mortgage." },
    { question: "What is the 1% rule for rental properties?", answer: "The 1% rule suggests that the monthly rent should equal at least 1% of the purchase price. A $300,000 property should rent for at least $3,000/month. Properties meeting this threshold are more likely to generate positive cash flow. However, in many high-cost markets, properties rarely meet the 1% rule (a $1M SF property doesn't rent for $10,000), making the rule more useful as a quick filter in affordable markets than a universal standard." },
    { question: "Should I pay all cash or use financing?", answer: "Financing (leverage) amplifies both gains and losses. With 20% down, a 10% property appreciation gives you 50% return on your cash invested. But if property values fall 20%, you've lost your entire down payment on a leveraged purchase. Cash purchases eliminate mortgage risk and cash flow is maximized (no debt service), but returns are lower since you're not using leverage. For most investors, moderate leverage (20-25% down) optimizes the risk/return tradeoff." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Real Estate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Real Estate Investment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Property Details</h2>
            <div className="flex flex-col gap-4">
              <Inp id="pp" label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
              <div className="grid grid-cols-2 gap-3">
                <Inp id="dp" label="Down Payment" value={downPayment} onChange={setDownPayment} suffix="%" />
                <Inp id="ir" label="Mortgage Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Inp id="lt" label="Loan Term" value={loanTerm} onChange={setLoanTerm} suffix="yrs" />
                <Inp id="mr" label="Monthly Rent" value={monthlyRentIn} onChange={setMonthlyRentIn} prefix="$" />
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Annual Expenses</p>
                <div className="grid grid-cols-2 gap-3">
                  <Inp id="pt" label="Property Tax" value={propertyTax} onChange={setPropertyTax} prefix="$" />
                  <Inp id="ins" label="Insurance" value={insurance} onChange={setInsurance} prefix="$" />
                  <Inp id="maint" label="Maintenance" value={maintenance} onChange={setMaintenance} prefix="$" />
                  <Inp id="vac" label="Vacancy Rate" value={vacancyRate} onChange={setVacancyRate} suffix="%" />
                  <Inp id="mgmt" label="Mgmt Fee" value={mgmtFee} onChange={setMgmtFee} suffix="%" />
                  <Inp id="appr" label="Appreciation" value={appreciation} onChange={setAppreciation} suffix="%/yr" />
                </div>
                <div className="mt-3">
                  <Inp id="hy" label="Hold Period" value={holdYears} onChange={setHoldYears} suffix="yrs" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={() => { setPurchasePrice("350000"); setDownPayment("20"); setInterestRate("7.2"); setLoanTerm("30"); setMonthlyRentIn("2400"); setPropertyTax("3600"); setInsurance("1800"); setMaintenance("3500"); setVacancyRate("8"); setMgmtFee("8"); setAppreciation("3"); setHoldYears("10"); setTimeout(calculate, 0); }} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Investment Analysis</h2>
                  <Building className="h-5 w-5 text-primary" />
                </div>

                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
                  <div className={`text-[13px] font-bold mb-1 uppercase tracking-wider ${res.monthlyCashFlow >= 0 ? "text-primary" : "text-red-500"}`}>Monthly Cash Flow</div>
                  <div className={`text-4xl font-extrabold mb-1 tracking-tight ${res.monthlyCashFlow >= 0 ? "text-foreground" : "text-red-500"}`}>
                    {res.monthlyCashFlow >= 0 ? "+" : ""}{fmtUSD(Math.round(res.monthlyCashFlow))}/mo
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Cap Rate: {fmtPct(res.capRate)} | Cash-on-Cash: {fmtPct(res.cashOnCash)}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      {[
                        { label: "Gross Rental Yield", value: fmtPct(res.grossYield) },
                        { label: "Net Operating Income (NOI)", value: fmtUSD(Math.round(res.noi)) + "/yr" },
                        { label: "Cap Rate", value: fmtPct(res.capRate) },
                        { label: "Annual Mortgage (P+I)", value: fmtUSD(Math.round(res.annualMortgage)) + "/yr" },
                        { label: "Annual Cash Flow", value: `${res.totalCashFlow >= 0 ? "+" : ""}${fmtUSD(Math.round(res.totalCashFlow))}/yr` },
                        { label: "Cash-on-Cash Return", value: fmtPct(res.cashOnCash) },
                        { label: "Break-Even Occupancy", value: fmtPct(res.breakEvenOccupancy) },
                      ].map(row => (
                        <tr key={row.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-medium text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Equity Build-up Over {holdYears} Years</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={res.projectionData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [fmtUSD(v)]} />
                      <Legend />
                      <Line type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Equity" />
                      <Line type="monotone" dataKey="totalReturn" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Total Return" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "Monthly CF", value: `${res.monthlyCashFlow >= 0 ? "+" : ""}${fmtUSD(Math.round(res.monthlyCashFlow))}` },
                    { label: "Cap Rate", value: fmtPct(res.capRate) },
                    { label: "CoC Return", value: fmtPct(res.cashOnCash) },
                    { label: "Break-Even Occ.", value: fmtPct(res.breakEvenOccupancy) },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How to Analyze a Real Estate Investment</h2>
            <p>Real estate investment analysis requires evaluating multiple metrics simultaneously to understand both cash flow and total return potential. This calculator computes the key metrics that experienced real estate investors use: cap rate, cash-on-cash return, net operating income, gross yield, break-even occupancy, and equity buildup over time. Understanding each metric's meaning and limitations is essential for making sound investment decisions.</p>
            <p>The starting point is always the <strong>Net Operating Income (NOI)</strong>: annual rent × (1 − vacancy rate) minus all operating expenses (taxes, insurance, maintenance, management fees). NOI is the income the property generates before debt service — it's independent of your financing, making it useful for comparing properties.</p>

            <h2 className="text-2xl font-bold mb-3">Key Real Estate Investment Metrics Explained</h2>
            <p><strong>Cap Rate</strong> (NOI / Property Value) is the financing-independent return metric. It tells you what a property would return if bought all-cash. A $350,000 property with $21,000 NOI has a 6% cap rate. Higher cap rates generally indicate higher risk or slower-appreciating markets. Cap rates compress (fall) when property values rise faster than rents.</p>
            <p><strong>Cash-on-Cash Return</strong> measures your actual dollar return relative to your cash invested. After accounting for your mortgage payment, how much cash flows to you annually as a percentage of your down payment? A $70,000 down payment yielding $5,600 annual cash flow = 8% cash-on-cash. This is directly comparable to stock market returns.</p>
            <p><strong>Break-Even Occupancy</strong> is the minimum occupancy percentage needed to cover all costs including mortgage. If your break-even is 75%, any occupancy above 75% generates positive cash flow. Lower break-even rates provide a larger safety margin against vacancies and unexpected expenses.</p>

            <h2 className="text-2xl font-bold mb-3">The 50% Rule and 1% Rule</h2>
            <p>Two quick screening rules used by investors: The <strong>50% rule</strong> estimates that 50% of gross rent goes to operating expenses (excluding mortgage). Gross rent of $2,400/month means approximately $1,200/month in expenses — so your NOI is roughly $1,200/month. The <strong>1% rule</strong> suggests monthly rent should be at least 1% of purchase price — a $300,000 property should rent for $3,000/month. Properties meeting this threshold are more likely to cash-flow positively with typical financing. Most high-cost urban markets don't meet these rules, making them better suited for appreciation plays than cash-flow investing.</p>

            <h2 className="text-2xl font-bold mb-3">Total Return: Cash Flow + Appreciation + Principal Paydown</h2>
            <p>Real estate total return has three components: (1) Cash flow from rent after all expenses and debt service; (2) Appreciation — the property's value increase over time; (3) Loan paydown — each mortgage payment builds equity even if the property doesn't appreciate. A property with neutral cash flow might still be an excellent investment if it appreciates at 5%/year and tenants are paying down $10,000+/year in principal. This three-dimensional return is what makes real estate uniquely powerful compared to stocks (which only have price appreciation and dividends).</p>

            <h2 className="text-2xl font-bold mb-3">Real Estate Investment Risks</h2>
            <p>Real estate investing involves significant risks: illiquidity (you can't sell a fraction of a property overnight), leverage risk (borrowed money amplifies losses), vacancy risk, tenant damage, unexpected maintenance costs (a new HVAC unit can cost $5,000-$15,000), local market risk, regulatory risk (rent control, eviction moratoriums), and interest rate risk if using adjustable-rate financing. Successful real estate investors maintain cash reserves (typically 3-6 months of gross rent) and properly vet tenants to minimize vacancies and damage.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/real-estate-calculator" />
          <PopularCalculators exclude="/calculator/real-estate-calculator" />
        </div>
      </div>
    </>
  );
}
