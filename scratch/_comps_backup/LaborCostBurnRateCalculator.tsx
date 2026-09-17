"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface LaborBurnInputs {
  payroll: number;
  otherExpenses: number;
  revenue: number;
  cash: number;
  growthPct: number;
}

interface LaborBurnResult {
  grossBurn: number;
  netBurn: number;
  laborSharePct: number;
  monthsRunway: number;
  weeksRunway: number;
  runOutDate: string;
  breakEvenMonth: number;
  chartData: { month: number; cash: number }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcLaborBurn(inputs: LaborBurnInputs): LaborBurnResult {
  const grossBurn = inputs.payroll + inputs.otherExpenses;
  const netBurn = grossBurn - inputs.revenue;
  const laborSharePct = grossBurn > 0 ? (inputs.payroll / grossBurn) * 100 : 0;
  const monthsRunway = netBurn > 0 ? inputs.cash / netBurn : 999;
  const weeksRunway = monthsRunway * 4.33;

  const now = new Date();
  const runOut = new Date(now.getFullYear(), now.getMonth() + Math.floor(monthsRunway), 1);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const runOutDate = netBurn > 0 ? `${monthNames[runOut.getMonth()]} ${runOut.getFullYear()}` : "Profitable";

  let breakEvenMonth = 0;
  if (inputs.growthPct > 0 && inputs.revenue > 0 && inputs.revenue < grossBurn) {
    let rev = inputs.revenue;
    for (let m = 1; m <= 120; m++) {
      rev *= 1 + inputs.growthPct / 100;
      if (rev >= grossBurn) { breakEvenMonth = m; break; }
    }
  }

  const chartData: { month: number; cash: number }[] = [{ month: 0, cash: inputs.cash }];
  let cash = inputs.cash;
  let rev = inputs.revenue;
  const months = Math.min(Math.ceil(monthsRunway) + 3, 36);
  for (let m = 1; m <= months; m++) {
    rev *= 1 + inputs.growthPct / 100;
    cash -= grossBurn - rev;
    chartData.push({ month: m, cash: Math.max(0, Math.round(cash)) });
    if (cash <= 0) break;
  }

  const breakdown = [
    { label: "Monthly Payroll (Labor)", value: `$${inputs.payroll.toLocaleString()}` },
    { label: "Other Monthly Expenses", value: `$${inputs.otherExpenses.toLocaleString()}` },
    { label: "Gross Burn (Total Expenses)", value: `$${grossBurn.toLocaleString()}` },
    { label: "Monthly Revenue", value: `$${inputs.revenue.toLocaleString()}` },
    { label: "Net Burn Rate", value: `$${netBurn.toLocaleString()}/mo`, highlight: true },
    { label: "Labor Share of Burn", value: `${laborSharePct.toFixed(1)}%` },
    { label: "Runway (Months)", value: netBurn > 0 ? `${monthsRunway.toFixed(1)} months` : "Profitable" },
    { label: "Runway (Weeks)", value: netBurn > 0 ? `${weeksRunway.toFixed(0)} weeks` : "Profitable" },
    { label: "Cash-Out Date", value: runOutDate },
    { label: "Break-Even Month", value: breakEvenMonth > 0 ? `Month ${breakEvenMonth}` : inputs.growthPct === 0 ? "No growth set" : "Already profitable" },
  ];

  const summaryStats = [
    { label: "Net Burn Rate", value: `$${netBurn.toLocaleString()}/mo` },
    { label: "Gross Burn Rate", value: `$${grossBurn.toLocaleString()}/mo` },
    { label: "Labor Share of Burn", value: `${laborSharePct.toFixed(1)}%` },
    { label: "Months Runway", value: netBurn > 0 ? monthsRunway.toFixed(1) : "∞" },
    { label: "Annual Labor Cost", value: `$${(inputs.payroll * 12).toLocaleString()}` },
    { label: "Revenue/Expense Ratio", value: `${grossBurn > 0 ? ((inputs.revenue / grossBurn) * 100).toFixed(1) : 0}%` },
  ];

  return { grossBurn, netBurn, laborSharePct, monthsRunway, weeksRunway, runOutDate, breakEvenMonth, chartData, breakdown, summaryStats };
}

const DEFAULTS: LaborBurnInputs = { payroll: 60000, otherExpenses: 20000, revenue: 40000, cash: 300000, growthPct: 5 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function LaborCostBurnRateCalculator() {
  const [payroll, setPayroll] = useState("60000");
  const [otherExpenses, setOtherExpenses] = useState("20000");
  const [revenue, setRevenue] = useState("40000");
  const [cash, setCash] = useState("300000");
  const [growthPct, setGrowthPct] = useState("5");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<LaborBurnResult | null>(null);

  const calculate = () =>
    setResult(calcLaborBurn({
      payroll: parseFloat(payroll) || 0,
      otherExpenses: parseFloat(otherExpenses) || 0,
      revenue: parseFloat(revenue) || 0,
      cash: parseFloat(cash) || 0,
      growthPct: parseFloat(growthPct) || 0,
    }));
  const reset = () => { setPayroll(DEFAULTS.payroll.toString()); setOtherExpenses(DEFAULTS.otherExpenses.toString()); setRevenue(DEFAULTS.revenue.toString()); setCash(DEFAULTS.cash.toString()); setGrowthPct(DEFAULTS.growthPct.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const runwayColor = result ? (result.monthsRunway < 6 ? "text-red-500" : result.monthsRunway < 12 ? "text-amber-500" : "text-emerald-600") : "";

  const faqs = [
    { question: "What is labor cost burn rate?", answer: "Labor cost burn rate is the portion of a company's monthly cash burn consumed by payroll — salaries, benefits, taxes, and contractor costs. For service businesses and early-stage startups, labor is usually the single largest burn line, often 60–80% of total monthly expenses." },
    { question: "Why track labor separately from other burn?", answer: "Labor is the most controllable and the slowest to unwind. You cannot cut payroll overnight — notice periods, severance, and hiring pipelines all lag. Knowing your labor share tells you how much runway flexibility you actually have if revenue stalls." },
    { question: "What is a healthy labor-to-burn ratio?", answer: "There is no universal target, but labor above 80% of gross burn leaves little room for tooling, marketing, and other levers. Founders often benchmark against the 40% rule: revenue growth rate plus profit margin should exceed 40% to justify the burn." },
    { question: "How do I reduce labor burn?", answer: "Freeze hiring, convert contractors to project-based engagements, defer raises, and review benefit costs. Each reduction directly extends runway: cutting $10,000/month of labor adds about a month of runway for every $10,000 of net burn you save." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator/business" }, { label: "Labor Cost Burn Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Labor Cost Burn Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="payroll" label="Monthly Payroll (Labor)" value={payroll} onChange={setPayroll} prefix="$" />
              <CompactInput id="other" label="Other Monthly Expenses" value={otherExpenses} onChange={setOtherExpenses} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="revenue" label="Monthly Revenue" value={revenue} onChange={setRevenue} prefix="$" />
              <CompactInput id="cash" label="Cash Balance" value={cash} onChange={setCash} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Revenue Projection</label>
                    <CompactInput id="growth" label="Monthly Revenue Growth" value={growthPct} onChange={setGrowthPct} suffix="%/mo" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Runway</div>
                <div className={`text-4xl font-extrabold mb-1 tracking-tight ${runwayColor}`}>{result.monthsRunway < 999 ? `${result.monthsRunway.toFixed(1)} months` : "Profitable"}</div>
                <div className="text-sm text-muted-foreground font-medium">Net burn ${result.netBurn.toLocaleString()}/mo · cash out {result.runOutDate}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Net Burn", `$${result.netBurn.toLocaleString()}/mo`], ["Gross Burn", `$${result.grossBurn.toLocaleString()}/mo`], ["Labor Share", `${result.laborSharePct.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Burn Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Cash Runway Projection</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Cash"]} />
                    <Area type="monotone" dataKey="cash" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                  </AreaChart>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Labor Deserves Its Own Burn Metric</h2>
            <p>Payroll is usually the first line item investors ask about, because it is the largest and least flexible cost a company carries. This <strong>labor cost burn rate calculator</strong> separates labor from the rest of your burn so you can see exactly how much of your cash consumption is tied to headcount — and how that affects runway.</p>
            <h2 className="text-2xl font-bold mb-3">Reading Your Labor Share</h2>
            <p>Labor share of burn is computed as monthly payroll divided by total monthly expenses. Above 80%, almost every dollar you spend is a person, leaving little room for growth investment. Below 50%, other costs dominate and labor cuts alone will not fix the burn profile.</p>
            <h2 className="text-2xl font-bold mb-3">The Runway Math</h2>
            <p>Runway = cash balance ÷ net burn. Every payroll decision moves this number: adding a $10,000/month hire shortens runway by roughly 1 month per $10,000 of net burn. Use the calculator to model a hire, a raise, or a round of layoffs before you commit.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/labor-cost-burn-rate-calculator" />
          <PopularCalculators exclude="/calculator/labor-cost-burn-rate-calculator" />
        </div>
      </div>
    </>
  );
}
