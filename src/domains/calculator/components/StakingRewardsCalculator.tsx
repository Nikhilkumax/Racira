"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface StakingInput {
  amount: number;
  apy: number;
  months: number;
  compounding: "daily" | "monthly";
}

interface StakingResult {
  rewards: number;
  totalBalance: number;
  monthlyAverage: number;
  effectiveApy: number;
  chartData: { month: number; balance: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcStaking(input: StakingInput): StakingResult {
  const periodsPerYear = input.compounding === "daily" ? 365 : 12;
  const ratePerPeriod = input.apy / 100 / periodsPerYear;
  const totalPeriods = Math.round((input.months / 12) * periodsPerYear);
  const balance = input.amount * Math.pow(1 + ratePerPeriod, totalPeriods);
  const rewards = balance - input.amount;
  const effectiveApy = (Math.pow(1 + ratePerPeriod, periodsPerYear) - 1) * 100;
  const monthlyAverage = rewards / Math.max(1, input.months);

  const chartData: { month: number; balance: number }[] = [{ month: 0, balance: Math.round(input.amount) }];
  let b = input.amount;
  for (let m = 1; m <= input.months; m++) {
    const p = m * (periodsPerYear / 12);
    b = input.amount * Math.pow(1 + ratePerPeriod, Math.round(p));
    chartData.push({ month: m, balance: Math.round(b) });
  }

  const breakdown = [
    { label: "Stake Amount", value: `$${input.amount.toLocaleString()}` },
    { label: "Staking APY", value: `${input.apy.toFixed(1)}%` },
    { label: "Compounding", value: input.compounding === "daily" ? "Daily" : "Monthly" },
    { label: "Staking Period", value: `${input.months} months` },
    { label: "Rewards Earned", value: `$${rewards.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Final Balance", value: `$${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Average Monthly Reward", value: `$${monthlyAverage.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Effective APY", value: `${effectiveApy.toFixed(2)}%` },
  ];

  const summaryStats = [
    { label: "Rewards Earned", value: `$${rewards.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Final Balance", value: `$${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Effective APY", value: `${effectiveApy.toFixed(2)}%` },
    { label: "Monthly Reward", value: `$${monthlyAverage.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Stake Amount", value: `$${input.amount.toLocaleString()}` },
    { label: "Growth", value: `${(rewards / Math.max(1, input.amount) * 100).toFixed(1)}%` },
  ];

  return { rewards, totalBalance: balance, monthlyAverage, effectiveApy, chartData, breakdown, summaryStats };
}

const DEFAULTS: StakingInput = { amount: 10000, apy: 7, months: 12, compounding: "daily" };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function StakingRewardsCalculator() {
  const [amount, setAmount] = useState(String(DEFAULTS.amount));
  const [apy, setApy] = useState(String(DEFAULTS.apy));
  const [months, setMonths] = useState(String(DEFAULTS.months));
  const [compounding, setCompounding] = useState<StakingInput["compounding"]>(DEFAULTS.compounding);
  const [result, setResult] = useState<StakingResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcStaking({ amount: parse(amount, DEFAULTS.amount), apy: parse(apy, DEFAULTS.apy), months: Math.max(1, Math.round(parse(months, DEFAULTS.months))), compounding }));
  const reset = () => {
    setAmount(String(DEFAULTS.amount));
    setApy(String(DEFAULTS.apy));
    setMonths(String(DEFAULTS.months));
    setCompounding(DEFAULTS.compounding);
    setResult(calcStaking(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcStaking(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is crypto staking?", answer: "Staking locks up cryptocurrency to support a proof-of-stake network's security and consensus in exchange for rewards. Staked tokens earn interest-like yield paid in the same asset. Rewards are typically distributed periodically and compound when re-staked." },
    { question: "How is staking APY calculated?", answer: "APY (annual percentage yield) accounts for compounding: Effective APY = (1 + r/n)^n − 1, where r is the nominal rate and n is compounding periods per year. With daily compounding at 7%, the effective yield is about 7.25%. More frequent compounding = slightly higher yield." },
    { question: "What are the risks of staking?", answer: "Staking carries real risks: the token price can fall far more than rewards earn, rewards can be slashed for validator misbehavior, liquidity is locked for the unbonding period, and yields are variable — not guaranteed. Never stake money you can't afford to lock up." },
    { question: "Is staking the same as a savings account?", answer: "No. A savings account has FDIC insurance and a guaranteed rate. Staking has no insurance, no guaranteed yield, and full price risk on the principal. High staking yields (10–20%) usually signal higher token volatility and inflation — the reward may be denominated in a depreciating asset." },
    { question: "How do staking rewards get taxed?", answer: "In most jurisdictions, staking rewards are taxable income when received, at their fair market value — and gains or losses since receipt are capital gains when sold. Reward timing matters: some protocols accrue continuously, others distribute on claim. Consult a tax professional for your jurisdiction." },
    { question: "What is an unbonding period?", answer: "The unbonding period is the delay between requesting to unstake and actually receiving your tokens — commonly 7–28 days depending on the network. During unbonding, rewards stop accruing and the tokens are at risk of slashing. Plan liquidity around this window." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Staking Rewards Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Staking Rewards Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Stake Amount</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Staking APY</label>
                <div className={inp}><input type="number" value={apy} onChange={(e) => setApy(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Staking Period</label>
                <div className={inp}><input type="number" value={months} onChange={(e) => setMonths(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mo</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Compounding</label>
                <select value={compounding} onChange={(e) => setCompounding(e.target.value as StakingInput["compounding"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Rewards Earned</div>
                  <div className="text-4xl font-extrabold tracking-tight text-emerald-600">${result.rewards.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className="text-sm text-muted-foreground mt-1">Final balance: ${result.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} · Effective APY: {result.effectiveApy.toFixed(2)}%</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Final Balance", `$${result.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`], ["Monthly Reward", `$${result.monthlyAverage.toLocaleString(undefined, { maximumFractionDigits: 2 })}`], ["Effective APY", `${result.effectiveApy.toFixed(2)}%`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Staking Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Balance Growth</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]} />
                      <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Staking Rewards Compound</h2>
            <p>Staking rewards compound when earned rewards are added to the staked principal and earn further rewards. The compounding frequency is set by the network — daily compounding beats monthly at the same nominal rate. This calculator projects both the reward stream and the effective APY your stake actually earns.</p>
            <h2 className="text-2xl font-bold mb-3">Yield vs Real Return</h2>
            <p>A 7% staking APY looks attractive, but the real return is APY minus the token's price change and network inflation. A token that falls 30% in a year turns a 7% nominal yield into a 23% loss. Evaluate staking rewards in dollar terms — as this calculator does — not just percentage terms.</p>
            <h2 className="text-2xl font-bold mb-3">Risk Checklist Before Staking</h2>
            <p>Confirm the unbonding period, slashing conditions, and reward distribution schedule. Understand whether the yield is paid in the staked asset or a different token. Check that the validator is reliable and the protocol audited. Never stake more than you can afford to lock away for the full unbonding window.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/staking-rewards-calculator" />
          <PopularCalculators exclude="/calculator/staking-rewards-calculator" />
        </div>
      </div>
    </>
  );
}
