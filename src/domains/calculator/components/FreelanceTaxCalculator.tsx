"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface FreelanceTaxResult {
  gross: number;
  expenses: number;
  netProfit: number;
  seTax: number;
  fedRate: number;
  fedTax: number;
  stateRate: number;
  stateTax: number;
  stdDeduction: number;
  taxableIncome: number;
  totalTax: number;
  takeHome: number;
  effectiveRate: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

function calcFreelanceTax(gross: number, expenses: number, fedRate: number, stateRate: number, stdDeduction: number): FreelanceTaxResult {
  const netProfit = gross - expenses;
  const seTax = netProfit * 0.9235 * 0.153;
  const taxableIncome = Math.max(0, netProfit - seTax * 0.5 - stdDeduction);
  const fedTax = taxableIncome * (fedRate / 100);
  const stateTax = netProfit * (stateRate / 100);
  const totalTax = seTax + fedTax + stateTax;
  const takeHome = netProfit - totalTax;
  const effectiveRate = netProfit > 0 ? (totalTax / netProfit) * 100 : 0;

  const breakdown = [
    { label: "Gross Freelance Income", value: fmt$(gross) },
    { label: "− Business Expenses", value: `−${fmt$(expenses)}` },
    { label: "Net Profit", value: fmt$(netProfit) },
    { label: "Self-Employment Tax (15.3%)", value: fmt$(seTax) },
    { label: "− Standard Deduction", value: `−${fmt$(stdDeduction)}` },
    { label: "Taxable Income", value: fmt$(taxableIncome) },
    { label: "Federal Income Tax", value: `${fedRate}% → ${fmt$(fedTax)}` },
    { label: "State Income Tax", value: `${stateRate}% → ${fmt$(stateTax)}` },
    { label: "Total Tax", value: fmt$(totalTax) },
    { label: "Estimated Take-Home", value: fmt$(takeHome) },
  ];
  const summaryStats = [
    { label: "Total Tax", value: fmt$(totalTax) },
    { label: "Take-Home", value: fmt$(takeHome) },
    { label: "Effective Rate", value: `${effectiveRate.toFixed(1)}%` },
    { label: "SE Tax", value: fmt$(seTax) },
    { label: "Federal Tax", value: fmt$(fedTax) },
    { label: "State Tax", value: fmt$(stateTax) },
    { label: "Net Profit", value: fmt$(netProfit) },
    { label: "Taxable Income", value: fmt$(taxableIncome) },
  ];
  const chartData = [
    { name: "Take-Home", value: Math.max(0, Math.round(takeHome)), fill: "hsl(var(--primary))" },
    { name: "SE Tax", value: Math.max(0, Math.round(seTax)), fill: "#ef4444" },
    { name: "Federal", value: Math.max(0, Math.round(fedTax)), fill: "#f59e0b" },
    { name: "State", value: Math.max(0, Math.round(stateTax)), fill: "#8b5cf6" },
  ];
  return { gross, expenses, netProfit, seTax, fedRate, fedTax, stateRate, stateTax, stdDeduction, taxableIncome, totalTax, takeHome, effectiveRate, breakdown, summaryStats, chartData };
}

const DEFAULTS = { gross: "80000", expenses: "12000", fedRate: "12", stateRate: "5", std: "14600" };

export default function FreelanceTaxCalculator() {
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [fedRate, setFedRate] = useState(DEFAULTS.fedRate);
  const [stateRate, setStateRate] = useState(DEFAULTS.stateRate);
  const [std, setStd] = useState(DEFAULTS.std);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<FreelanceTaxResult | null>(null);

  const gr = parseFloat(gross) || 0;
  const ex = parseFloat(expenses) || 0;
  const fr = parseFloat(fedRate) || 0;
  const sr = parseFloat(stateRate) || 0;
  const sd = parseFloat(std) || 0;
  const errs: string[] = [];
  if (gr <= 0) errs.push("Gross income must be greater than 0.");
  if (ex < 0 || ex > gr) errs.push("Business expenses must be between 0 and gross income.");
  if (fr < 0 || fr > 50) errs.push("Federal rate must be between 0% and 50%.");
  if (sr < 0 || sr > 15) errs.push("State rate must be between 0% and 15%.");
  if (sd < 0) errs.push("Standard deduction cannot be negative.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcFreelanceTax(gr, ex, fr, sr, sd)); };
  const reset = () => {
    setGross(DEFAULTS.gross); setExpenses(DEFAULTS.expenses); setFedRate(DEFAULTS.fedRate); setStateRate(DEFAULTS.stateRate); setStd(DEFAULTS.std);
    setResult(calcFreelanceTax(80000, 12000, 12, 5, 14600));
  };
  useEffect(() => { setResult(calcFreelanceTax(80000, 12000, 12, 5, 14600)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is self-employment tax?", answer: "Self-employed workers pay both the employer and employee shares of Social Security (12.4%) and Medicare (2.9%) — 15.3% combined — on 92.35% of net profit." },
    { question: "Why is half the SE tax deductible?", answer: "The employer half of self-employment tax is deductible as a business expense, which is why this calculator subtracts 50% of the SE tax before computing income tax." },
    { question: "Are quarterly payments required?", answer: "If you expect to owe more than $1,000 in tax, the IRS generally requires estimated quarterly payments. The total here can be divided into four equal installments." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Freelancer Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Freelancer Tax Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Gross Freelance Income</label>
                <div className={inp}><input type="number" value={gross} onChange={e => setGross(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Business Expenses</label>
                <div className={inp}><input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Federal Income Tax Rate</label>
                <div className={inp}><input type="number" value={fedRate} onChange={e => setFedRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className={lbl}>State Income Tax Rate</label>
                <div className={inp}><input type="number" value={stateRate} onChange={e => setStateRate(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdv(o => !o)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 self-start"
            >
              Advanced Options
              <span className={`transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Deductions</div>
                  <div>
                    <label className={lbl}>Standard Deduction</label>
                    <div className={inp}><input type="number" value={std} onChange={e => setStd(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
                    <p className="text-xs text-muted-foreground mt-1.5">$14,600 for single filers in 2025. Itemizing may yield a larger deduction.</p>
                  </div>
                </div>
              </div>
            )}
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Total Tax</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt$(result.totalTax)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.effectiveRate.toFixed(1)}% effective on {fmt$(result.netProfit)} net profit</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Self-Employment Tax`, fmt$(result.seTax)], ["Federal Tax", fmt$(result.fedTax)], ["Take-Home", fmt$(result.takeHome)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Tax Calculation</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 8 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 8 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 8 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Where Your Profit Goes</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Net profit split between taxes and take-home</p>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Self-Employment Tax</h2>
            <p>This <strong>freelancer tax calculator</strong> models the 15.3% self-employment tax (12.4% Social Security + 2.9% Medicare) applied to 92.35% of net profit. Because freelancers pay both shares, their total tax burden typically runs 25–35% of profit even before state taxes.</p>
            <h2 className="text-2xl font-bold mb-3">Income Tax Estimate</h2>
            <p>Taxable income starts from net profit, subtracts the deductible half of the SE tax, then the standard deduction ($14,600 for single filers in 2025). The federal rate you enter should be your effective bracket — a flat-rate estimate of the progressive schedule.</p>
            <h2 className="text-2xl font-bold mb-3">Plan for Quarterly Payments</h2>
            <p>Freelancers owe estimated taxes quarterly rather than through withholding. Setting aside roughly the effective rate shown here from every invoice avoids underpayment penalties at filing time.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/freelancer-tax-calculator" />
          <PopularCalculators exclude="/calculator/freelancer-tax-calculator" />
        </div>
      </div>
    </>
  );
}
