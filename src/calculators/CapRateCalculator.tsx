"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CapRateResult {
  capRate: number;
  noi: number;
  grossYield: number;
  cashOnCash: number;
  grm: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  pieData: { name: string; value: number }[];
}

function calcCapRate(propertyValue: number, annualGrossRent: number, vacancyPct: number,
  operatingExpenses: number, annualDebtService: number, downPayment: number): CapRateResult {
  const effectiveGrossIncome = annualGrossRent * (1 - vacancyPct / 100);
  const noi = effectiveGrossIncome - operatingExpenses;
  const capRate = propertyValue > 0 ? (noi / propertyValue) * 100 : 0;
  const grossYield = propertyValue > 0 ? (annualGrossRent / propertyValue) * 100 : 0;
  const annualCashFlow = noi - annualDebtService;
  const cashOnCash = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;
  const grm = annualGrossRent > 0 ? propertyValue / annualGrossRent : 0;

  const pieData = [
    { name: "NOI", value: Math.max(0, noi) },
    { name: "Operating Expenses", value: operatingExpenses },
    { name: "Vacancy Loss", value: annualGrossRent * (vacancyPct / 100) },
  ].filter(d => d.value > 0);

  const breakdown = [
    { label: "Property Value", value: `$${propertyValue.toLocaleString()}` },
    { label: "Gross Annual Rent", value: `$${annualGrossRent.toLocaleString()}` },
    { label: "Vacancy Rate", value: `${vacancyPct}%` },
    { label: "Effective Gross Income", value: `$${effectiveGrossIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Operating Expenses", value: `$${operatingExpenses.toLocaleString()}` },
    { label: "Net Operating Income (NOI)", value: `$${noi.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Cap Rate", value: `${capRate.toFixed(2)}%` },
    { label: "Gross Rental Yield", value: `${grossYield.toFixed(2)}%` },
    { label: "Gross Rent Multiplier", value: grm.toFixed(1) },
    { label: "Annual Debt Service", value: `$${annualDebtService.toLocaleString()}` },
    { label: "Annual Cash Flow", value: `$${annualCashFlow.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Cash-on-Cash Return", value: `${cashOnCash.toFixed(2)}%` },
  ];

  const summaryStats = [
    { label: "Cap Rate", value: `${capRate.toFixed(2)}%` },
    { label: "NOI", value: `$${noi.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Gross Yield", value: `${grossYield.toFixed(2)}%` },
    { label: "Cash-on-Cash", value: `${cashOnCash.toFixed(2)}%` },
    { label: "GRM", value: grm.toFixed(1) },
    { label: "Annual Cash Flow", value: `$${annualCashFlow.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { capRate, noi, grossYield, cashOnCash, grm, breakdown, summaryStats, pieData };
}

const DEFAULTS = { value: "400000", rent: "36000", vacancy: "5", expenses: "12000", debt: "18000", down: "80000" };
const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b"];

export default function CapRateCalculator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [rent, setRent] = useState(DEFAULTS.rent);
  const [vacancy, setVacancy] = useState(DEFAULTS.vacancy);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [debt, setDebt] = useState(DEFAULTS.debt);
  const [down, setDown] = useState(DEFAULTS.down);
  const [result, setResult] = useState<CapRateResult | null>(null);

  const calculate = () => setResult(calcCapRate(parseFloat(value)||400000, parseFloat(rent)||36000, parseFloat(vacancy)||5, parseFloat(expenses)||12000, parseFloat(debt)||18000, parseFloat(down)||80000));
  const reset = () => { setValue(DEFAULTS.value); setRent(DEFAULTS.rent); setVacancy(DEFAULTS.vacancy); setExpenses(DEFAULTS.expenses); setDebt(DEFAULTS.debt); setDown(DEFAULTS.down); setResult(calcCapRate(400000,36000,5,12000,18000,80000)); };
  useEffect(() => { setResult(calcCapRate(400000,36000,5,12000,18000,80000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a good cap rate for rental property?", answer: "Typical cap rates by market type: Urban/gateway markets (NYC, SF, LA): 3–5%. Suburban markets: 5–7%. Secondary cities: 6–9%. Rural/tertiary markets: 8–12%. Higher cap rates mean higher yield but also higher risk. Most experienced investors target 5–8% cap rates for single-family and small multifamily properties." },
    { question: "What is the difference between cap rate and cash-on-cash return?", answer: "Cap rate ignores financing — it measures the property's intrinsic yield based on NOI and property value. Cash-on-cash return measures actual cash yield on your invested equity after debt payments. A 5% cap rate property can have 8–12% cash-on-cash return with favorable leverage." },
    { question: "What is Net Operating Income (NOI)?", answer: "NOI = Effective Gross Income − Operating Expenses. Operating expenses include property taxes, insurance, maintenance, property management fees, utilities, and reserves. NOI excludes mortgage payments, depreciation, and income taxes." },
    { question: "What is the Gross Rent Multiplier (GRM)?", answer: "GRM = Property Price ÷ Annual Gross Rent. Lower GRM = better value. Example: a $400,000 property with $36,000 gross rent has a GRM of 11.1. Under 12 is generally favorable. GRM is a quick screening tool — always follow up with full cap rate analysis." },
    { question: "How do operating expenses affect cap rate?", answer: "Operating expenses typically run 35–50% of gross rents for rental properties (the '50% rule' of thumb). Higher expenses compress cap rates. Common expenses: property management (8–12%), taxes (varies widely), insurance (0.5–1% of value), maintenance (1% of value/year)." },
    { question: "Can I use cap rate to determine property value?", answer: "Yes: Property Value = NOI ÷ Cap Rate. If comparable properties sell at 6% cap rates and your property generates $24,000 NOI, the implied value is $400,000. This is how commercial real estate appraisers value income properties." },
  ];

  const capColor = result ? (result.capRate >= 7 ? "text-emerald-600" : result.capRate >= 5 ? "text-amber-600" : "text-red-500") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Cap Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Cap Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Property Value / Purchase Price</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Annual Gross Rent</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={rent} onChange={e => setRent(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Vacancy Rate</label>
                <div className={inp}><input type="number" value={vacancy} onChange={e => setVacancy(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Annual Operating Expenses</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Annual Debt Service</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={debt} onChange={e => setDebt(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Down Payment (for CoC)</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={down} onChange={e => setDown(e.target.value)} className={ci} /></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Capitalization Rate</div>
                <div className={`text-4xl font-extrabold tracking-tight ${capColor}`}>{result.capRate.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground mt-1">NOI: ${result.noi.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Cash-on-Cash: {result.cashOnCash.toFixed(2)}% · GRM: {result.grm.toFixed(1)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Cap Rate", `${result.capRate.toFixed(2)}%`], ["Gross Yield", `${result.grossYield.toFixed(2)}%`], ["Cash-on-Cash", `${result.cashOnCash.toFixed(2)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Income Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${(r.label === "Cap Rate" || r.label === "Cash-on-Cash Return") ? "font-bold text-primary" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-3">Income Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={result.pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                      {result.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Cap Rate in Real Estate?</h2>
            <p>The <strong>capitalization rate (cap rate)</strong> is the most widely used metric in commercial real estate valuation. It measures a property&apos;s annual return based on its net operating income relative to its market value — independent of financing. This <strong>cap rate calculator</strong> also computes gross rental yield, cash-on-cash return, and gross rent multiplier for complete investment analysis.</p>
            <h2>Cap Rate Formula</h2>
            <p>Cap Rate = (Net Operating Income ÷ Property Value) × 100. NOI = Effective Gross Income − Operating Expenses. Effective Gross Income = Gross Potential Rent × (1 − Vacancy Rate). Operating expenses exclude mortgage payments but include taxes, insurance, maintenance, management fees, and utilities.</p>
            <h2>Interpreting Cap Rates</h2>
            <p>Below 4%: typical for prime urban gateway markets; low risk, low yield. 4–6%: suburban core markets; balanced risk-return. 6–8%: secondary markets and value-add properties. Above 8%: tertiary markets or higher-risk properties. Cap rate also equals the discount rate in a no-growth scenario, making it a direct measure of investment risk.</p>
            <h2>Cap Rate vs. Other Metrics</h2>
            <p>Cap rate measures unlevered yield — it ignores financing. Cash-on-cash return measures actual return on invested equity after debt payments. GRM is a quick screening multiple. For full analysis, also calculate IRR (internal rate of return) accounting for appreciation and exit cap rate assumptions.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cap-rate-calculator" />
          <PopularCalculators exclude="/calculator/cap-rate-calculator" />
        </div>
      </div>
    </>
  );
}
