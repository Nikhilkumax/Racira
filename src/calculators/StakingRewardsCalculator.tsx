"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface StakingResult {
  annualReward: number;
  monthlyReward: number;
  dailyReward: number;
  totalValueAfter: number;
  compoundedValue: number;
  simpleValue: number;
  compoundAdvantage: number;
  breakdown: { label: string; value: string }[];
  projections: { year: number; simple: number; compounded: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcStaking(
  principal: number, apr: number, compoundFreq: number, years: number, priceGrowthPct: number
): StakingResult {
  // Simple staking (no compounding)
  const annualReward = principal * (apr / 100);
  const monthlyReward = annualReward / 12;
  const dailyReward = annualReward / 365;

  // Compound staking
  const r = apr / 100 / compoundFreq;
  const n = compoundFreq * years;
  const compoundedValue = principal * Math.pow(1 + r, n);
  const simpleValue = principal + annualReward * years;

  // With price appreciation
  const priceMult = Math.pow(1 + priceGrowthPct / 100, years);
  const totalValueAfter = compoundedValue * priceMult;
  const compoundAdvantage = compoundedValue - simpleValue;

  const projections = Array.from({ length: Math.min(years, 20) + 1 }, (_, i) => {
    const comp = principal * Math.pow(1 + apr / 100 / compoundFreq, compoundFreq * i);
    const simp = principal + annualReward * i;
    return {
      year: i,
      simple: parseFloat((simp * Math.pow(1 + priceGrowthPct / 100, i)).toFixed(2)),
      compounded: parseFloat((comp * Math.pow(1 + priceGrowthPct / 100, i)).toFixed(2)),
    };
  });

  const breakdown = [
    { label: "Staked Amount", value: `$${principal.toLocaleString()}` },
    { label: "APR / APY", value: `${apr}%` },
    { label: "Compound Frequency", value: compoundFreq === 365 ? "Daily" : compoundFreq === 12 ? "Monthly" : compoundFreq === 4 ? "Quarterly" : "Yearly" },
    { label: "Daily Reward", value: `$${dailyReward.toFixed(4)}` },
    { label: "Monthly Reward", value: `$${monthlyReward.toFixed(2)}` },
    { label: "Annual Reward (simple)", value: `$${annualReward.toFixed(2)}` },
    { label: `Value After ${years}yr (compounded)`, value: `$${compoundedValue.toFixed(2)}` },
    { label: `Compounding Advantage`, value: `$${compoundAdvantage.toFixed(2)}` },
    { label: `With ${priceGrowthPct}%/yr Price Growth`, value: `$${totalValueAfter.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Daily Reward", value: `$${dailyReward.toFixed(4)}` },
    { label: "Monthly Reward", value: `$${monthlyReward.toFixed(2)}` },
    { label: "Annual Reward", value: `$${annualReward.toFixed(2)}` },
    { label: `${years}yr Compounded`, value: `$${compoundedValue.toFixed(2)}` },
    { label: "Compound Advantage", value: `$${compoundAdvantage.toFixed(2)}` },
    { label: "With Price Growth", value: `$${totalValueAfter.toFixed(2)}` },
  ];

  return { annualReward, monthlyReward, dailyReward, totalValueAfter, compoundedValue, simpleValue, compoundAdvantage, breakdown, projections, summaryStats };
}

export default function StakingRewardsCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [apr, setApr] = useState("8");
  const [years, setYears] = useState("5");
  const [compoundFreq, setCompoundFreq] = useState("12");
  const [priceGrowth, setPriceGrowth] = useState("10");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<StakingResult | null>(null);

  const calculate = () => {
    const p = parseFloat(principal) || 0, a = parseFloat(apr) || 0;
    const y = parseInt(years) || 5, cf = parseInt(compoundFreq) || 12;
    const pg = parseFloat(priceGrowth) || 0;
    if (p > 0 && a > 0) setResult(calcStaking(p, a, cf, y, pg));
  };

  useEffect(() => { setResult(calcStaking(10000, 8, 12, 5, 10)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is crypto staking?", answer: "Staking is the process of locking cryptocurrency in a proof-of-stake (PoS) network to validate transactions and earn rewards. Unlike proof-of-work (mining), staking doesn't require specialized hardware. You earn rewards — similar to interest — for participating in network security. Popular staking coins: Ethereum (3–4% APR), Cardano (3–5%), Solana (6–8%), Polkadot (12–14%), and various DeFi protocols (5–20%+ APY)." },
    { question: "What is the difference between APR and APY in staking?", answer: "APR (Annual Percentage Rate) is the simple rate without compounding. APY (Annual Percentage Yield) accounts for compound interest — it represents the actual annual return when rewards are reinvested. At 8% APR compounded monthly: APY = (1 + 0.08/12)^12 − 1 = 8.30%. At 8% APR daily compounding: APY = 8.33%. The higher the compounding frequency and the APR, the larger the APR-to-APY gap." },
    { question: "How is staking APR calculated?", answer: "Staking APR varies by network and is determined by: the total staking rewards allocated per year by the protocol, divided by the total amount staked. If a network distributes $1,000,000 in rewards annually and $10,000,000 is staked, APR = 10%. As more people stake, APR decreases. Real-time staking APRs can be found on staking analytics sites like Staking Rewards, Messari, or the specific blockchain's dashboard." },
    { question: "What are the risks of crypto staking?", answer: "Key staking risks: Market risk — the cryptocurrency price may fall, making rewards worthless in fiat terms. Lock-up periods — many protocols require staked funds to be locked for days or weeks, preventing quick selling. Slashing — validators who misbehave or go offline may lose a portion of staked funds. Smart contract risk — DeFi staking protocols may have code vulnerabilities. Inflation risk — high staking rewards are often offset by token inflation, diluting value. Always research the protocol thoroughly before staking." },
    { question: "What is liquid staking?", answer: "Liquid staking allows you to stake tokens while receiving a liquid derivative token (e.g., stETH for staked ETH) that can be used in DeFi. This solves the liquidity problem of traditional staking. Popular liquid staking protocols: Lido (stETH), Rocket Pool (rETH), Marinade Finance (mSOL). Liquid staking typically charges 5–15% of staking rewards as a fee. Total value locked in liquid staking exceeded $40 billion in 2024." },
    { question: "Should I compound my staking rewards?", answer: "Compounding staking rewards — reinvesting rewards as soon as you receive them — maximizes long-term returns. At 8% APR: Simple (annual): $10,000 → $14,800 after 5 years ($4,800 gain). Compounded daily: $10,000 → $14,918 (+$118 extra). The compounding advantage grows significantly over longer time horizons and higher APRs. However, gas fees for reinvesting on-chain can offset compounding benefits on small amounts — calculate whether the gas cost is worth it." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Staking Rewards Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Staking Rewards Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Staked Amount</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={ci} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">APR / APY</label>
                <div className={inp}><input type="number" value={apr} onChange={e => setApr(e.target.value)} step={0.1} className={ci} /><span className={suf}>%</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Duration</label>
                <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} min={1} max={30} className={ci} /><span className={suf}>yrs</span></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Compound Frequency</label>
              <div className="grid grid-cols-4 gap-2">
                {[["Daily", "365"], ["Monthly", "12"], ["Quarterly", "4"], ["Yearly", "1"]].map(([l, v]) => (
                  <button key={v} onClick={() => setCompoundFreq(v)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${compoundFreq === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(v => !v)} className="flex items-center gap-1.5 text-base font-semibold text-primary hover:underline">
                Price Appreciation <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <label className="text-sm font-semibold mb-1 block">Token Price Growth per Year</label>
                  <div className={inp}><input type="number" value={priceGrowth} onChange={e => setPriceGrowth(e.target.value)} step={1} className={ci} /><span className={suf}>%/yr</span></div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setPrincipal("10000"); setApr("8"); setYears("5"); setCompoundFreq("12"); setPriceGrowth("10"); setResult(calcStaking(10000, 8, 12, 5, 10)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Annual Staking Reward</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.annualReward.toFixed(2)}</div>
                <div className="text-base text-muted-foreground mt-1">${result.monthlyReward.toFixed(2)}/month · ${result.dailyReward.toFixed(4)}/day · Compound advantage: ${result.compoundAdvantage.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`${years}yr Compounded`, `$${result.compoundedValue.toFixed(0)}`], [`With Price Growth`, `$${result.totalValueAfter.toFixed(0)}`], ["Total Gain", `$${(result.compoundedValue - parseFloat(principal)).toFixed(0)}`]].map(([l, v], i) => (
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
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Simple vs. Compounded Growth</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.projections} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Legend />
                    <Line type="monotone" dataKey="simple" name="Simple" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="compounded" name="Compounded" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
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
            <h2>How Staking Rewards Work</h2>
            <p>Crypto staking earns rewards for participating in proof-of-stake (PoS) blockchain network validation. This <strong>staking rewards calculator</strong> computes daily, monthly, and annual rewards, and projects compounded growth over your holding period. The compound staking formula: <strong>A = P × (1 + r/n)^(nt)</strong>, where P = principal staked, r = APR, n = compound frequency, t = years.</p>
            <h2>APR vs. APY in Staking</h2>
            <p>APR (Annual Percentage Rate) is the base rate without compounding. APY (Annual Percentage Yield) = (1 + APR/n)^n − 1, where n = number of compound periods per year. At 8% APR: Monthly compounding APY = 8.30%; Daily compounding APY = 8.33%. Platforms advertising "APY" have already factored in the compounding benefit — compare like-for-like when evaluating protocols.</p>
            <h2>Compound Staking Strategy</h2>
            <p>The compounding advantage accelerates dramatically over time. At 8% APR over 10 years: Simple staking yields $8,000 in rewards on $10,000 principal. Monthly compounding yields $12,202 — an extra $4,202. Over 20 years: simple = $16,000, compounded = $49,268. The key is reinvesting rewards promptly. On networks with high gas fees, batch reinvestment (weekly or monthly) is more cost-efficient than daily. Related tools: <a href="/calculator/crypto-profit-calculator">Crypto Profit Calculator</a>, <a href="/calculator/compound-interest-calculator">Compound Interest Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/staking-rewards-calculator" />
          <PopularCalculators exclude="/calculator/staking-rewards-calculator" />
        </div>
      </div>
    </>
  );
}
