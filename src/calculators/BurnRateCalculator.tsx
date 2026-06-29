"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BurnResult {
  monthsRunway: number;
  weeksRunway: number;
  runOutDate: string;
  netBurn: number;
  grossBurn: number;
  defaultMonthToBreakEven: number;
  chartData: { month: number; cash: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBurn(cashBalance: number, monthlyRevenue: number, monthlyExpenses: number, monthlyGrowthPct: number): BurnResult {
  const grossBurn = monthlyExpenses;
  const netBurn = monthlyExpenses - monthlyRevenue;
  const monthsRunway = netBurn > 0 ? cashBalance / netBurn : 999;
  const weeksRunway = monthsRunway * 4.33;

  const now = new Date();
  const runOut = new Date(now.getFullYear(), now.getMonth() + Math.floor(monthsRunway), 1);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const runOutDate = netBurn > 0 ? `${monthNames[runOut.getMonth()]} ${runOut.getFullYear()}` : "Profitable";

  // When does revenue cover expenses (if growing)?
  let breakEvenMonth = 0;
  if (monthlyGrowthPct > 0 && monthlyRevenue > 0 && monthlyRevenue < monthlyExpenses) {
    let rev = monthlyRevenue;
    for (let m = 1; m <= 120; m++) {
      rev *= (1 + monthlyGrowthPct / 100);
      if (rev >= monthlyExpenses) { breakEvenMonth = m; break; }
    }
  }

  const chartData: { month: number; cash: number }[] = [{ month: 0, cash: cashBalance }];
  let cash = cashBalance;
  let rev = monthlyRevenue;
  const months = Math.min(Math.ceil(monthsRunway) + 3, 36);
  for (let m = 1; m <= months; m++) {
    rev *= (1 + monthlyGrowthPct / 100);
    cash -= (monthlyExpenses - rev);
    chartData.push({ month: m, cash: Math.max(0, Math.round(cash)) });
    if (cash <= 0) break;
  }

  const breakdown = [
    { label: "Cash Balance", value: `$${cashBalance.toLocaleString()}` },
    { label: "Monthly Revenue", value: `$${monthlyRevenue.toLocaleString()}` },
    { label: "Monthly Expenses (Gross Burn)", value: `$${grossBurn.toLocaleString()}` },
    { label: "Net Burn Rate", value: `$${netBurn.toLocaleString()}/mo` },
    { label: "Runway (Months)", value: netBurn > 0 ? `${monthsRunway.toFixed(1)} months` : "Profitable" },
    { label: "Runway (Weeks)", value: netBurn > 0 ? `${weeksRunway.toFixed(0)} weeks` : "Profitable" },
    { label: "Cash-Out Date", value: runOutDate },
    { label: "Break-Even Month", value: breakEvenMonth > 0 ? `Month ${breakEvenMonth}` : monthlyGrowthPct === 0 ? "No growth set" : "Already profitable" },
  ];

  const summaryStats = [
    { label: "Net Burn Rate", value: `$${netBurn.toLocaleString()}/mo` },
    { label: "Gross Burn Rate", value: `$${grossBurn.toLocaleString()}/mo` },
    { label: "Months Runway", value: netBurn > 0 ? `${monthsRunway.toFixed(1)}` : "∞" },
    { label: "Cash-Out Date", value: runOutDate },
    { label: "Annual Burn", value: `$${(netBurn * 12).toLocaleString()}` },
    { label: "Revenue/Expense Ratio", value: `${monthlyExpenses > 0 ? ((monthlyRevenue / monthlyExpenses) * 100).toFixed(1) : 0}%` },
  ];

  return { monthsRunway, weeksRunway, runOutDate, netBurn, grossBurn, defaultMonthToBreakEven: breakEvenMonth, chartData, breakdown, summaryStats };
}

const DEFAULTS = { cash: "500000", revenue: "30000", expenses: "80000", growth: "10" };

export default function BurnRateCalculator() {
  const [cash, setCash] = useState(DEFAULTS.cash);
  const [revenue, setRevenue] = useState(DEFAULTS.revenue);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [growth, setGrowth] = useState(DEFAULTS.growth);
  const [result, setResult] = useState<BurnResult | null>(null);

  const calculate = () => setResult(calcBurn(parseFloat(cash)||500000, parseFloat(revenue)||30000, parseFloat(expenses)||80000, parseFloat(growth)||10));
  const reset = () => { setCash(DEFAULTS.cash); setRevenue(DEFAULTS.revenue); setExpenses(DEFAULTS.expenses); setGrowth(DEFAULTS.growth); setResult(calcBurn(500000,30000,80000,10)); };
  useEffect(() => { setResult(calcBurn(500000,30000,80000,10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is burn rate?", answer: "Burn rate is how quickly a company spends its cash reserves. Gross burn is total monthly expenses. Net burn is monthly expenses minus revenue. It's the key metric investors use to determine startup runway — how long the company can operate before needing more funding." },
    { question: "What is startup runway?", answer: "Runway = Cash Balance ÷ Net Burn Rate. It tells you how many months you can operate at current spending and revenue levels. Most investors want to see 12–18 months of runway at all times. Raising with less than 6 months is considered a crisis." },
    { question: "What is a good burn rate for a startup?", answer: "There's no universal answer, but the burn should be justified by growth. A common benchmark: monthly net burn shouldn't exceed 1/12th of the expected next funding round. Pre-product startups should burn as little as possible. Post-product startups can burn more aggressively if growing 20%+ month-over-month." },
    { question: "How can I extend my runway?", answer: "Cut non-essential expenses. Delay hires. Negotiate vendor payment terms. Accelerate revenue through prepayments or annual subscriptions. Raise a bridge round early. Consider revenue-based financing for SaaS businesses." },
    { question: "What is the difference between gross and net burn?", answer: "Gross burn = total cash spent monthly. Net burn = gross burn minus revenue. Net burn is what actually depletes your cash reserves. A company with $100K in expenses and $40K revenue has $60K net burn." },
    { question: "When should a startup start thinking about runway?", answer: "From day one. Even if you have 24 months of runway today, you should start fundraising when you have 12 months left — fundraising typically takes 3–6 months. Always maintain a 6-month buffer as your minimum safety margin." },
  ];

  const runwayColor = result ? (result.monthsRunway < 6 ? "text-red-500" : result.monthsRunway < 12 ? "text-amber-500" : "text-emerald-600") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Burn Rate Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Burn Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Current Cash Balance</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={cash} onChange={e => setCash(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Monthly Revenue</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Monthly Expenses</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Monthly Revenue Growth</label>
              <div className={inp}><input type="number" value={growth} onChange={e => setGrowth(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%/mo</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Runway</div>
                <div className={`text-4xl font-extrabold tracking-tight ${runwayColor}`}>{result.monthsRunway < 999 ? `${result.monthsRunway.toFixed(1)} months` : "Profitable"}</div>
                <div className="text-sm text-muted-foreground mt-1">Net burn: ${result.netBurn.toLocaleString()}/mo · Cash out: {result.runOutDate}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Net Burn", `$${result.netBurn.toLocaleString()}/mo`], ["Gross Burn", `$${result.grossBurn.toLocaleString()}/mo`], ["Runway", result.monthsRunway < 999 ? `${result.weeksRunway.toFixed(0)} wks` : "∞"]].map(([l, v], i) => (
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
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
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
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Burn Rate?</h2>
            <p>Burn rate measures how fast a startup or early-stage company is spending its cash reserves. For companies pre-profitability, this is the single most critical financial metric — it determines survival. This <strong>burn rate calculator</strong> computes your net and gross burn rate, runway in months and weeks, and projects when your cash will run out at current rates.</p>
            <h2>The Burn Rate Formulas</h2>
            <p>Gross Burn Rate = Total Monthly Expenses. Net Burn Rate = Monthly Expenses − Monthly Revenue. Runway = Cash Balance ÷ Net Burn Rate. These calculations are essential for investor reporting, board meetings, and fundraising timelines.</p>
            <h2>Understanding Your Runway</h2>
            <p>Under 6 months: critical — begin emergency fundraising or cost cuts immediately. 6–12 months: start fundraising now, as it typically takes 3–6 months to close a round. 12–18 months: healthy — begin preparing for the next round. 18+ months: strong position to negotiate favorable terms with investors.</p>
            <h2>Key Benchmarks by Stage</h2>
            <p>Pre-seed ($0–$500K raised): Monthly burn typically $5K–$30K. Seed ($500K–$2M): $30K–$100K/month. Series A ($2M–$15M): $100K–$500K/month. Series B+: $500K–$2M+/month. Benchmark your burn against peers and ensure it's tied to proportional growth in key metrics.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/burn-rate-calculator" />
          <PopularCalculators exclude="/calculator/burn-rate-calculator" />
        </div>
      </div>
    </>
  );
}
