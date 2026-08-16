"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, PiggyBank } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface FundResult {
  expenses: { label: string; amount: number }[];
  monthly: number;
  months: number;
  target: number;
  current: number;
  gap: number;
  monthlySaving: number;
  monthsToGoal: number;
  chartData: { name: string; value: number }[];
}

function calcFund(expenses: number[], months: number, current: number, monthlySaving: number): FundResult {
  const labels = ["Housing", "Utilities", "Groceries", "Transportation", "Insurance", "Other Essential"];
  const items = labels.map((label, i) => ({ label, amount: expenses[i] || 0 }));
  const monthly = expenses.reduce((s, v) => s + v, 0);
  const target = monthly * months;
  const gap = Math.max(0, target - current);
  const monthsToGoal = monthlySaving > 0 ? Math.ceil(gap / monthlySaving) : Infinity;
  const chartData = [
    { name: "Current Savings", value: current },
    { name: "Target", value: target },
  ];
  return { expenses: items, monthly, months, target, current, gap, monthlySaving, monthsToGoal, chartData };
}

const DEFAULTS = { housing: "1800", utilities: "250", groceries: "500", transport: "400", insurance: "200", other: "300", months: "6", current: "2000", saving: "500" };

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString()}`;

const faqs = [
  { question: "How much should my emergency fund hold?", answer: "The standard advice is 3–6 months of essential expenses — more if your income is variable or you're the sole earner. Essential expenses exclude discretionary spending: dining, travel, and subscriptions." },
  { question: "What counts as an essential expense?", answer: "Housing, utilities, groceries, transportation, insurance, and minimum debt payments. These are the costs you must cover if income stops — the fund's job is keeping them paid." },
  { question: "Where should I keep the fund?", answer: "In a high-yield savings account — liquid, no withdrawal penalty, and FDIC-insured. Do not invest it: the fund is insurance against a bad month, not a growth asset, and selling during a downturn can destroy it." },
];

export default function EmergencyFundCalculator() {
  const [housing, setHousing] = useState(DEFAULTS.housing);
  const [utilities, setUtilities] = useState(DEFAULTS.utilities);
  const [groceries, setGroceries] = useState(DEFAULTS.groceries);
  const [transport, setTransport] = useState(DEFAULTS.transport);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [other, setOther] = useState(DEFAULTS.other);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [saving, setSaving] = useState(DEFAULTS.saving);
  const [result, setResult] = useState<FundResult>(() => calcFund([1800, 250, 500, 400, 200, 300], 6, 2000, 500));

  useEffect(() => {
    const vals = [housing, utilities, groceries, transport, insurance, other, months, current, saving].map(parseFloat);
    if (vals.every(v => !isNaN(v)) && vals[6] > 0 && vals[7] >= 0 && vals[8] >= 0) {
      setResult(calcFund(vals.slice(0, 6), vals[6], vals[7], vals[8]));
    }
  }, [housing, utilities, groceries, transport, insurance, other, months, current, saving]);

  const reset = () => { setHousing(DEFAULTS.housing); setUtilities(DEFAULTS.utilities); setGroceries(DEFAULTS.groceries); setTransport(DEFAULTS.transport); setInsurance(DEFAULTS.insurance); setOther(DEFAULTS.other); setMonths(DEFAULTS.months); setCurrent(DEFAULTS.current); setSaving(DEFAULTS.saving); };
  const invalid = [housing, utilities, groceries, transport, insurance, other, months, current, saving].some(v => isNaN(parseFloat(v))) || parseFloat(months) <= 0 || parseFloat(current) < 0 || parseFloat(saving) < 0;

  const breakdown = [
    ...result.expenses.map(e => ({ label: e.label, value: fmtMoney(e.amount), highlight: false })),
    { label: "Total Essential Monthly", value: fmtMoney(result.monthly), highlight: true },
    { label: "Months of Coverage", value: `${result.months}`, highlight: false },
    { label: "Fund Target", value: fmtMoney(result.target), highlight: false },
    { label: "Current Savings", value: fmtMoney(result.current), highlight: false },
    { label: "Remaining Gap", value: fmtMoney(result.gap), highlight: false },
    { label: "Time to Goal", value: result.monthsToGoal === Infinity ? "— (set a savings rate)" : `~${result.monthsToGoal} months at ${fmtMoney(result.monthlySaving)}/mo`, highlight: false },
  ];

  const summaryStats = [
    { label: "Monthly Essentials", value: fmtMoney(result.monthly) },
    { label: "Fund Target", value: fmtMoney(result.target) },
    { label: "Current Savings", value: fmtMoney(result.current) },
    { label: "Gap", value: fmtMoney(result.gap) },
    { label: "Coverage (current)", value: `${result.current > 0 ? (result.current / result.monthly).toFixed(1) : 0} months` },
    { label: "Savings Rate", value: `${result.monthlySaving > 0 ? `${result.monthlySaving.toFixed(0)}/mo` : "—"}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Emergency Fund Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Emergency Fund Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Monthly Essential Expenses ($)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ef-housing" className="block text-sm font-medium mb-1 text-foreground">Housing</label>
                <input id="ef-housing" type="number" min="0" step="50" value={housing} onChange={(e) => setHousing(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ef-utils" className="block text-sm font-medium mb-1 text-foreground">Utilities</label>
                <input id="ef-utils" type="number" min="0" step="25" value={utilities} onChange={(e) => setUtilities(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ef-groceries" className="block text-sm font-medium mb-1 text-foreground">Groceries</label>
                <input id="ef-groceries" type="number" min="0" step="50" value={groceries} onChange={(e) => setGroceries(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ef-transport" className="block text-sm font-medium mb-1 text-foreground">Transportation</label>
                <input id="ef-transport" type="number" min="0" step="50" value={transport} onChange={(e) => setTransport(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ef-insurance" className="block text-sm font-medium mb-1 text-foreground">Insurance</label>
                <input id="ef-insurance" type="number" min="0" step="25" value={insurance} onChange={(e) => setInsurance(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ef-other" className="block text-sm font-medium mb-1 text-foreground">Other Essential</label>
                <input id="ef-other" type="number" min="0" step="50" value={other} onChange={(e) => setOther(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ef-months" className="block text-sm font-medium mb-1 text-foreground">Months of Coverage</label>
                <select id="ef-months" value={months} onChange={(e) => setMonths(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="3">3 months (minimum)</option>
                  <option value="6">6 months (standard)</option>
                  <option value="9">9 months (variable income)</option>
                  <option value="12">12 months (conservative)</option>
                </select>
              </div>
              <div>
                <label htmlFor="ef-current" className="block text-sm font-medium mb-1 text-foreground">Current Savings ($)</label>
                <input id="ef-current" type="number" min="0" step="500" value={current} onChange={(e) => setCurrent(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="border border-border rounded-lg p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Advanced Options</div>
              <label htmlFor="ef-saving" className="block text-sm font-medium mb-1 text-foreground">Monthly Savings Contribution ($)</label>
              <input id="ef-saving" type="number" min="0" step="50" value={saving} onChange={(e) => setSaving(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <PiggyBank className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter numeric expenses, a coverage period, and non-negative savings.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Emergency Fund Target</div>
              <div className="text-4xl font-extrabold text-primary">{fmtMoney(result.target)}</div>
              <div className="text-sm text-muted-foreground mt-1">{fmtMoney(result.monthly)}/mo × {result.months} months · gap {fmtMoney(result.gap)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly Essentials</div>
                <div className="text-lg font-bold text-primary">{fmtMoney(result.monthly)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Current Savings</div>
                <div className="text-lg font-bold text-primary">{fmtMoney(result.current)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Gap</div>
                <div className="text-lg font-bold text-primary">{fmtMoney(result.gap)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Current vs Target</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmtMoney(v), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Emergency Fund Calculator</h2>
            <p>An emergency fund covers essential expenses when income stops. Sum the essentials, multiply by the coverage months, and compare to current savings: with $3,450 in essentials and 6 months of coverage, the target is $20,700 — against $2,000 saved, a $18,700 gap.</p>
            <h3>Building the Fund</h3>
            <p>The gap closes one paycheck at a time: $500 a month reaches $18,700 in about 38 months, or faster with windfalls. Prioritize liquidity over yield — the fund must be available within days, which is why high-yield savings beats invested money for this purpose.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/emergency-fund-calculator" />
          <PopularCalculators exclude="/calculator/emergency-fund-calculator" />
        </div>
      </div>
    </>
  );
}
