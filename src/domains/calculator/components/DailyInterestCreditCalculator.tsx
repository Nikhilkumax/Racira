"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type Frequency = "daily" | "monthly" | "quarterly" | "annually";

interface Inputs {
  balance: number;
  apy: number;
  monthlyDeposit: number;
  years: number;
  frequency: Frequency;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  endingBalance: number;
  totalInterest: number;
  totalDeposits: number;
  dailyCredit: number;
  effectiveYield: number;
  frequencyLabel: string;
  chartData: { year: number; balance: number; noCompound: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FREQUENCIES: Record<Frequency, { label: string; perYear: number }> = {
  daily: { label: "Daily", perYear: 365 },
  monthly: { label: "Monthly", perYear: 12 },
  quarterly: { label: "Quarterly", perYear: 4 },
  annually: { label: "Annually", perYear: 1 },
};

function calc(inp: Inputs): Result {
  const freq = FREQUENCIES[inp.frequency];
  const r = inp.apy / 100; // nominal annual rate
  const i = r / freq.perYear; // per-credit-period rate

  // Monthly effective rate: (1 + i)^(periods per month) - 1, with one deposit per month
  const rm = Math.pow(1 + i, freq.perYear / 12) - 1;
  const months = inp.years * 12;

  // Month-by-month simulation: credit interest, then deposit at end of month.
  // Headline, breakdown, and chart all read from this single schedule.
  let bal = inp.balance;
  let simple = inp.balance;
  const chartData: { year: number; balance: number; noCompound: number }[] = [];
  chartData.push({ year: 0, balance: Math.round(bal), noCompound: Math.round(simple) });
  for (let m = 1; m <= months; m++) {
    bal = bal * (1 + rm) + inp.monthlyDeposit;
    simple = simple * (1 + r / 12) + inp.monthlyDeposit;
    if (m % 12 === 0) {
      chartData.push({ year: m / 12, balance: Math.round(bal), noCompound: Math.round(simple) });
    }
  }
  const endingBalance = bal;
  const simpleBalance = simple;

  const totalDeposits = inp.monthlyDeposit * 12 * inp.years;
  const totalInterest = endingBalance - inp.balance - totalDeposits;

  // Interest credited for one day on the current balance (banks post daily at nominal/365)
  const dailyCredit = inp.balance * (r / 365);
  const effectiveYield = (Math.pow(1 + i, freq.perYear) - 1) * 100;

  const frequencyLabel = freq.label.toLowerCase();

  const breakdown: Row[] = [
    { label: "Starting Balance", value: money(inp.balance), sum: true },
    { label: "Nominal Rate", value: inp.apy.toFixed(2) + "%", sum: true },
    { label: "Interest Credit Frequency", value: freq.label, sum: true },
    { label: "Effective Annual Yield", value: effectiveYield.toFixed(3) + "%", highlight: true, sum: true },
    { label: "Monthly Deposits", value: money(inp.monthlyDeposit) + "/mo", sum: true },
    { label: "Total Deposits over " + inp.years + " Yrs", value: money(totalDeposits), sum: true },
    { label: "Per-Day Interest (Current Balance)", value: money2(dailyCredit), highlight: true, sum: true },
    { label: "Interest Earned over " + inp.years + " Yrs", value: money(totalInterest), isTotal: true, sum: true },
    { label: "Ending Balance", value: money(endingBalance), isTotal: true, sum: true },
    { label: "Balance Without Compounding", value: money(simpleBalance), sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return { endingBalance, totalInterest, totalDeposits, dailyCredit, effectiveYield, frequencyLabel, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { balance: 10000, apy: 4.5, monthlyDeposit: 200, years: 5, frequency: "daily" };

export default function DailyInterestCreditCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [apy, setApy] = useState(String(DEFAULTS.apy));
  const [monthlyDeposit, setMonthlyDeposit] = useState(String(DEFAULTS.monthlyDeposit));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [frequency, setFrequency] = useState<Frequency>(DEFAULTS.frequency);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    apy: parseFloat(apy) || 0,
    monthlyDeposit: parseFloat(monthlyDeposit) || 0,
    years: parseInt(years) || 0,
    frequency,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setApy(String(DEFAULTS.apy));
    setMonthlyDeposit(String(DEFAULTS.monthlyDeposit));
    setYears(String(DEFAULTS.years));
    setFrequency(DEFAULTS.frequency);
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const bal = parseFloat(balance) || 0;
  const ar = parseFloat(apy) || 0;
  const dep = parseFloat(monthlyDeposit) || 0;
  const yr = parseInt(years) || 0;

  const valErrors: Record<string, string> = {};
  if (balance === "" || isNaN(parseFloat(balance))) valErrors.balance = "Enter a starting balance";
  else if (bal < 0) valErrors.balance = "Balance cannot be negative";
  if (apy === "" || isNaN(parseFloat(apy))) valErrors.apy = "Enter an APY";
  else if (ar < 0) valErrors.apy = "APY cannot be negative";
  else if (ar > 15) valErrors.apy = "APY looks too high for a deposit account";
  if (monthlyDeposit === "" || isNaN(parseFloat(monthlyDeposit))) valErrors.monthlyDeposit = "Enter a monthly deposit";
  else if (dep < 0) valErrors.monthlyDeposit = "Deposit cannot be negative";
  if (years === "" || isNaN(parseInt(years))) valErrors.years = "Enter a time horizon";
  else if (yr < 1) valErrors.years = "At least 1 year";
  else if (yr > 40) valErrors.years = "Max 40 years";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  const res = result;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Daily Interest Credit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Daily Interest Credit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="di-balance" className="text-sm font-medium mb-1 block">Starting Balance ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="di-balance" type="number" min="0" step="100" value={balance} onChange={(e) => setBalance(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}
              </div>
              <div>
                <label htmlFor="di-apy" className="text-sm font-medium mb-1 block">APY (%)</label>
                <div className={inputCls}>
                  <input id="di-apy" type="number" min="0" max="15" step="0.05" value={apy} onChange={(e) => setApy(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.apy && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apy}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="di-deposit" className="text-sm font-medium mb-1 block">Monthly Deposit ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="di-deposit" type="number" min="0" step="25" value={monthlyDeposit} onChange={(e) => setMonthlyDeposit(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.monthlyDeposit && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.monthlyDeposit}</p>}
              </div>
              <div>
                <label htmlFor="di-years" className="text-sm font-medium mb-1 block">Time Horizon (Years)</label>
                <div className={inputCls}>
                  <input id="di-years" type="number" min="1" max="40" step="1" value={years} onChange={(e) => setYears(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.years && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.years}</p>}
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center justify-center gap-1.5 py-1 text-sm text-primary font-medium hover:underline">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Compounding</div>
                  <div>
                    <label htmlFor="di-freq" className="text-sm font-medium mb-1 block">Interest Credit Frequency</label>
                    <div className="relative h-10">
                      <select id="di-freq" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className={selectCls}>
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">How often interest is credited and starts earning its own interest.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {res && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Ending Balance after {yr} Years</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money(res.endingBalance)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {money(res.totalInterest)} interest earned on {money(res.totalDeposits)} of deposits · {res.frequencyLabel} credit at {ar.toFixed(2)}%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Total Interest Earned", money(res.totalInterest), "text-emerald-600"],
                    ["Interest Credited Today", money2(res.dailyCredit), "text-primary"],
                    ["Effective Annual Yield", res.effectiveYield.toFixed(3) + "%", res.effectiveYield >= ar ? "text-emerald-600" : "text-amber-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Balance Growth — Compounding vs. Simple</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={res.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} tickFormatter={(v) => (v === 0 ? "Now" : "Yr " + v)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                      <Tooltip formatter={(v: number, name: string) => [money(Number(v)), name === "balance" ? "With compounding" : "Without compounding"]} labelFormatter={(l) => (l === 0 ? "Now" : "Year " + l)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="balance" name="With compounding" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="noCompound" name="Without compounding" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">Dashed line shows the same deposits earning simple interest — the gap is the compounding effect of {res.frequencyLabel} crediting.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Interest Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {res.breakdown.map((r, idx) => (
                        <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                          <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                          <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {res.summaryStats.map((s, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Daily Crediting Beats the Sticker Rate</h2>
            <p>High-yield savings accounts and money market accounts advertise an APY, but the interest that compounds inside them is credited on a schedule — many online banks post it daily. When interest is credited daily, each day's earnings start earning their own interest the next day, which pushes your true annual return slightly above the nominal rate: at 4.50%, daily crediting yields about 4.602% annually versus 4.500% for annual crediting. The difference sounds trivial on a single dollar, but across years of deposits it compounds into a meaningful gap — and switching your emergency fund from a 0.1% big-bank account to a 4.5% high-yield account is the single highest-return, zero-risk change most people can make. This calculator models the exact credited schedule and shows the compounding effect against a simple-interest baseline.</p>
          </section>
          <FAQSection faqs={[
            { question: "How is daily interest calculated on a savings account?", answer: "Banks divide your annual percentage yield by 365 (or 360 on some business products), multiply it by your daily balance, and post that amount as interest — usually at the end of each day or statement cycle. Because the credited interest adds to the balance, the next day's interest is computed on a slightly larger number, which is compounding in action." },
            { question: "Does the crediting frequency matter much?", answer: "At typical savings rates it matters modestly per year — daily vs. annual crediting at 4.5% adds roughly a tenth of a percentage point of effective yield — but over a decade of steady deposits the gap grows to hundreds of dollars on a five-figure balance. What matters far more is the APY itself and avoiding monthly fees." },
            { question: "How do banks quote APY vs APR?", answer: "APY (annual percentage yield) already includes the effect of compounding, so it is the number to compare across accounts. APR is the nominal rate used to compute each period's interest before compounding. This calculator takes your APY as the nominal input and derives the effective yield from the credit frequency you choose." },
          ]} pageUrl="https://racira.com/calculator/daily-interest-credit-calculator" />
          <PopularCalculators exclude="/calculator/daily-interest-credit-calculator" />
        </div>
      </div>
    </>
  );
}
