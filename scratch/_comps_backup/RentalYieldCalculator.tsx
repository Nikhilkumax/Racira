"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RentalYieldResult {
  grossYield: number;
  netYield: number;
  noi: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number;
  breakEvenOccupancy: number;
  chartData: { year: number; cumCashFlow: number; equity: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRentalYield(purchasePrice: number, monthlyRent: number, vacancyPct: number, annualExpenses: number, mortgagePayment: number, appreciation: number): RentalYieldResult {
  const annualGrossRent = monthlyRent * 12;
  const vacancyLoss = annualGrossRent * (vacancyPct / 100);
  const effectiveGrossIncome = annualGrossRent - vacancyLoss;
  const noi = effectiveGrossIncome - annualExpenses;
  const annualDebtService = mortgagePayment * 12;
  const annualCashFlow = noi - annualDebtService;
  const monthlyCashFlow = annualCashFlow / 12;
  const grossYield = purchasePrice > 0 ? (annualGrossRent / purchasePrice) * 100 : 0;
  const netYield = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
  const capRate = netYield;
  const breakEvenOccupancy = annualGrossRent > 0 ? ((annualExpenses + annualDebtService) / annualGrossRent) * 100 : 0;

  const chartData: { year: number; cumCashFlow: number; equity: number }[] = [];
  let cumCF = 0;
  let propValue = purchasePrice;
  for (let y = 0; y <= 10; y++) {
    cumCF += annualCashFlow;
    chartData.push({ year: y, cumCashFlow: Math.round(cumCF), equity: Math.round(propValue - purchasePrice * 0.8) }); // rough equity
    propValue *= (1 + appreciation / 100);
  }

  const breakdown = [
    { label: "Purchase Price", value: `$${purchasePrice.toLocaleString()}` },
    { label: "Monthly Rent", value: `$${monthlyRent.toLocaleString()}` },
    { label: "Annual Gross Rent", value: `$${annualGrossRent.toLocaleString()}` },
    { label: "Vacancy Loss", value: `$${vacancyLoss.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${vacancyPct}%)` },
    { label: "Annual Operating Expenses", value: `$${annualExpenses.toLocaleString()}` },
    { label: "Net Operating Income (NOI)", value: `$${noi.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Debt Service", value: `$${annualDebtService.toLocaleString()}` },
    { label: "Annual Cash Flow", value: `$${annualCashFlow.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Gross Yield", value: `${grossYield.toFixed(2)}%` },
    { label: "Net Yield / Cap Rate", value: `${netYield.toFixed(2)}%` },
    { label: "Break-Even Occupancy", value: `${breakEvenOccupancy.toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Gross Yield", value: `${grossYield.toFixed(2)}%` },
    { label: "Net Yield", value: `${netYield.toFixed(2)}%` },
    { label: "Cap Rate", value: `${capRate.toFixed(2)}%` },
    { label: "Monthly Cash Flow", value: `$${monthlyCashFlow.toFixed(0)}` },
    { label: "Annual Cash Flow", value: `$${annualCashFlow.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Break-Even Occupancy", value: `${breakEvenOccupancy.toFixed(1)}%` },
  ];

  return { grossYield, netYield, noi, monthlyCashFlow, annualCashFlow, capRate, breakEvenOccupancy, chartData, breakdown, summaryStats };
}

const DEFAULTS = { price: "400000", rent: "2500", vacancy: "5", expenses: "8000", mortgage: "1800", appreciation: "4" };

export default function RentalYieldCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [rent, setRent] = useState(DEFAULTS.rent);
  const [vacancy, setVacancy] = useState(DEFAULTS.vacancy);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [mortgage, setMortgage] = useState(DEFAULTS.mortgage);
  const [appreciation, setAppreciation] = useState(DEFAULTS.appreciation);
  const [result, setResult] = useState<RentalYieldResult | null>(null);

  const calculate = () => setResult(calcRentalYield(parseFloat(price) || 400000, parseFloat(rent) || 2500, parseFloat(vacancy) || 5, parseFloat(expenses) || 8000, parseFloat(mortgage) || 1800, parseFloat(appreciation) || 4));
  const reset = () => { setPrice(DEFAULTS.price); setRent(DEFAULTS.rent); setVacancy(DEFAULTS.vacancy); setExpenses(DEFAULTS.expenses); setMortgage(DEFAULTS.mortgage); setAppreciation(DEFAULTS.appreciation); setResult(calcRentalYield(400000, 2500, 5, 8000, 1800, 4)); };
  useEffect(() => { setResult(calcRentalYield(400000, 2500, 5, 8000, 1800, 4)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a good rental yield?", answer: "Gross rental yield benchmarks: Below 4%: weak — likely negative cash flow. 4–6%: average — common in desirable urban markets. 6–8%: good — positive cash flow achievable. 8%+: excellent — strong cash-on-cash returns likely. Net yield (after expenses) is always 2–4% below gross yield. Target net yield above your mortgage rate to achieve positive cash flow." },
    { question: "How is rental yield calculated?", answer: "Gross Rental Yield = (Annual Rent ÷ Property Value) × 100. Net Rental Yield = ((Annual Rent − Expenses) ÷ Property Value) × 100. Net yield equals cap rate — the most commonly used institutional metric. Always use net yield for actual investment decisions." },
    { question: "What expenses should I include?", answer: "Operating expenses (included in NOI): property management (8–12% of rent), property taxes, insurance, maintenance/repairs (1% of value/year), vacancy (5–10% of potential rent), HOA fees if applicable. NOT included: mortgage payments, depreciation, income taxes. The '50% rule' says expenses typically run 50% of gross rent." },
    { question: "What is break-even occupancy?", answer: "Break-even occupancy is the minimum occupancy rate needed to cover all expenses including debt service. Example: if break-even occupancy is 75%, you can have 25% vacancy and still pay all bills. Most landlords target break-even occupancy under 80% for safety." },
    { question: "Is rental property a good investment?", answer: "Rental property can generate returns through: Cash flow (monthly rental income after expenses). Appreciation (property value growth, historically 3–5% annually). Tax benefits (depreciation, expense deductions, 1031 exchanges). Leverage (using mortgage to control a larger asset). Total returns averaging 8–12% annually have made real estate one of the best long-term wealth builders." },
    { question: "What is the 1% rule for rental properties?", answer: "The 1% rule states: monthly rent should be at least 1% of the purchase price. A $300,000 property should rent for $3,000/month. This is a quick screening tool to estimate positive cash flow potential. In high-cost markets, 0.5–0.7% is more realistic. Always follow up with a full cash flow analysis." },
  ];

  const yieldColor = result ? (result.netYield >= 7 ? "text-emerald-600" : result.netYield >= 5 ? "text-amber-600" : "text-red-500") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Rental Yield Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Rental Yield Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Purchase Price</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Monthly Rent</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={rent} onChange={e => setRent(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Vacancy Rate</label><div className={inp}><input type="number" value={vacancy} onChange={e => setVacancy(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Annual Expenses</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Monthly Mortgage</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={mortgage} onChange={e => setMortgage(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Annual Appreciation</label><div className={inp}><input type="number" value={appreciation} onChange={e => setAppreciation(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Net Rental Yield</div>
                <div className={`text-4xl font-extrabold tracking-tight ${yieldColor}`}>{result.netYield.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground mt-1">Gross: {result.grossYield.toFixed(2)}% · Cash flow: ${result.monthlyCashFlow.toFixed(0)}/mo · NOI: ${result.noi.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Gross Yield", `${result.grossYield.toFixed(2)}%`], ["Net Yield", `${result.netYield.toFixed(2)}%`], ["Monthly CF", `$${result.monthlyCashFlow.toFixed(0)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Rental Income Analysis</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${(r.label === "Net Yield / Cap Rate" || r.label === "Annual Cash Flow") ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">10-Year Cash Flow Projection</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} /><Area type="monotone" dataKey="cumCashFlow" name="Cum. Cash Flow" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Rental Yield Calculator?</h2>
            <p>A <strong>rental yield calculator</strong> measures the annual return generated by a rental property as a percentage of its purchase price. It computes both gross yield (revenue only) and net yield (after all operating expenses), giving you the true performance picture of any investment property. This calculator also shows monthly cash flow, break-even occupancy, and 10-year cumulative projections.</p>
            <h2 className="text-2xl font-bold mb-3">Gross vs. Net Rental Yield</h2>
            <p>Gross Yield = (Annual Rent ÷ Property Value) × 100. Net Yield = (NOI ÷ Property Value) × 100. NOI = Effective Gross Income − Operating Expenses. The gap between gross and net yield is typically 2–4 percentage points, representing the cost of vacancy, property management, taxes, insurance, and maintenance.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Cash Flow</h2>
            <p>Positive cash flow = NOI exceeds debt service. Even a property with low yield can have positive cash flow with low leverage. Cash flow is the lifeline of buy-and-hold investing — it allows you to survive vacancies, repairs, and market downturns without selling at a loss. Target: positive cash flow even with 10–15% vacancy.</p>
            <h2 className="text-2xl font-bold mb-3">Key Benchmarks and Rules</h2>
            <p>The 1% Rule: monthly rent ≥ 1% of purchase price. The 50% Rule: assume expenses = 50% of gross rent. The 2% Rule (very aggressive): monthly rent ≥ 2% of price. These are screening rules only — always build a full cash flow model. Net yield above the mortgage rate indicates positive leverage.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rental-yield-calculator" />
          <PopularCalculators exclude="/calculator/rental-yield-calculator" />
        </div>
      </div>
    </>
  );
}
