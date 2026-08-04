"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";

type PoolTiming = "pre" | "post";

interface DilutionInputs {
  preMoney: number;
  investment: number;
  existingShares: number;
  yourOwnership: number;
  poolPercent: number;
  poolTiming: PoolTiming;
}

interface DilutionResult {
  postMoney: number;
  investorPercent: number;
  poolPercent: number;
  existingPercent: number;
  totalShares: number;
  investorShares: number;
  poolShares: number;
  pricePerShare: number;
  yourPostOwnership: number;
  yourDilution: number;
  yourShares: number;
  yourStakeValue: number;
  otherExistingPercent: number;
  valid: boolean;
}

const DEFAULTS: DilutionInputs = {
  preMoney: 8000000,
  investment: 2000000,
  existingShares: 8000000,
  yourOwnership: 60,
  poolPercent: 10,
  poolTiming: "pre",
};

export function calculateDilution(i: DilutionInputs): DilutionResult {
  const postMoney = i.preMoney + i.investment;
  const valid = i.preMoney > 0 && i.investment >= 0 && i.existingShares > 0 && postMoney > 0;

  if (!valid) {
    return {
      postMoney: 0, investorPercent: 0, poolPercent: 0, existingPercent: 0,
      totalShares: 0, investorShares: 0, poolShares: 0, pricePerShare: 0,
      yourPostOwnership: 0, yourDilution: 0, yourShares: 0, yourStakeValue: 0,
      otherExistingPercent: 0, valid: false,
    };
  }

  const investorFrac = i.investment / postMoney;
  const poolFrac = Math.min(Math.max(i.poolPercent, 0), 100) / 100;

  let totalShares: number;
  let poolShares: number;
  let investorShares: number;

  if (i.poolTiming === "pre") {
    // Pre-money shuffle: existing holders absorb the entire pool.
    const existingFrac = 1 - investorFrac - poolFrac;
    if (existingFrac <= 0) {
      return {
        postMoney, investorPercent: investorFrac * 100, poolPercent: poolFrac * 100,
        existingPercent: 0, totalShares: 0, investorShares: 0, poolShares: 0,
        pricePerShare: 0, yourPostOwnership: 0, yourDilution: i.yourOwnership,
        yourShares: 0, yourStakeValue: 0, otherExistingPercent: 0, valid: false,
      };
    }
    totalShares = i.existingShares / existingFrac;
    poolShares = totalShares * poolFrac;
    investorShares = totalShares * investorFrac;
  } else {
    // Post-money pool: created after the round, dilutes investor and founders alike.
    const preRoundTotal = i.existingShares / (1 - investorFrac);
    investorShares = preRoundTotal * investorFrac;
    totalShares = poolFrac < 1 ? preRoundTotal / (1 - poolFrac) : preRoundTotal;
    poolShares = totalShares - preRoundTotal;
  }

  const pricePerShare = investorShares > 0 ? i.investment / investorShares : 0;
  const existingPercent = (i.existingShares / totalShares) * 100;
  const yourShares = (i.yourOwnership / 100) * i.existingShares;
  const yourPostOwnership = (yourShares / totalShares) * 100;
  const yourDilution = i.yourOwnership - yourPostOwnership;
  const yourStakeValue = (yourPostOwnership / 100) * postMoney;

  return {
    postMoney,
    investorPercent: (investorShares / totalShares) * 100,
    poolPercent: (poolShares / totalShares) * 100,
    existingPercent,
    totalShares,
    investorShares,
    poolShares,
    pricePerShare,
    yourPostOwnership,
    yourDilution,
    yourShares,
    yourStakeValue,
    otherExistingPercent: existingPercent - yourPostOwnership,
    valid: true,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const DilutionCalculator = () => {
  const [preMoney, setPreMoney] = useState(String(DEFAULTS.preMoney));
  const [investment, setInvestment] = useState(String(DEFAULTS.investment));
  const [existingShares, setExistingShares] = useState(String(DEFAULTS.existingShares));
  const [yourOwnership, setYourOwnership] = useState(String(DEFAULTS.yourOwnership));
  const [poolPercent, setPoolPercent] = useState(String(DEFAULTS.poolPercent));
  const [poolTiming, setPoolTiming] = useState<PoolTiming>(DEFAULTS.poolTiming);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<DilutionResult>(calculateDilution(DEFAULTS));

  const getInputs = (): DilutionInputs => ({
    preMoney: parseFloat(preMoney) || 0,
    investment: parseFloat(investment) || 0,
    existingShares: parseFloat(existingShares) || 0,
    yourOwnership: parseFloat(yourOwnership) || 0,
    poolPercent: parseFloat(poolPercent) || 0,
    poolTiming,
  });

  useEffect(() => {
    setResults(calculateDilution(DEFAULTS));
  }, []);

  const preNum = parseFloat(preMoney) || 0;
  const invNum = parseFloat(investment) || 0;
  const sharesNum = parseFloat(existingShares) || 0;
  const ownNum = parseFloat(yourOwnership) || 0;
  const poolNum = parseFloat(poolPercent) || 0;
  const postNum = preNum + invNum;
  const investorFracPreview = postNum > 0 ? invNum / postNum : 0;

  let errorMsg = "";
  if (preNum <= 0) errorMsg = "Pre-money valuation must be greater than zero.";
  else if (invNum < 0) errorMsg = "Investment amount cannot be negative.";
  else if (sharesNum <= 0) errorMsg = "Existing shares outstanding must be greater than zero.";
  else if (ownNum < 0 || ownNum > 100) errorMsg = "Your current ownership must be between 0% and 100%.";
  else if (poolNum < 0 || poolNum >= 100) errorMsg = "Option pool must be between 0% and 99%.";
  else if (poolTiming === "pre" && investorFracPreview + poolNum / 100 >= 1)
    errorMsg = "Investor stake plus option pool leaves nothing for existing shareholders. Lower the pool or the investment.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResults(calculateDilution(getInputs()));
  };

  const reset = () => {
    setPreMoney(String(DEFAULTS.preMoney));
    setInvestment(String(DEFAULTS.investment));
    setExistingShares(String(DEFAULTS.existingShares));
    setYourOwnership(String(DEFAULTS.yourOwnership));
    setPoolPercent(String(DEFAULTS.poolPercent));
    setPoolTiming(DEFAULTS.poolTiming);
    setResults(calculateDilution(DEFAULTS));
  };

  const pieData = [
    { name: "You", value: results.yourPostOwnership, color: "#2563EB" },
    { name: "Other Existing", value: results.otherExistingPercent, color: "#60A5FA" },
    { name: "New Investor", value: results.investorPercent, color: "#10B981" },
    { name: "Option Pool", value: results.poolPercent, color: "#F59E0B" },
  ].filter(d => d.value > 0.0001);

  const dilutionSeverity =
    results.yourDilution >= 25
      ? { label: "Heavy", color: "text-red-600" }
      : results.yourDilution >= 15
        ? { label: "Significant", color: "text-amber-600" }
        : { label: "Moderate", color: "text-emerald-600" };

  const breakdown = [
    { label: "Pre-Money Valuation", value: `$${fmtInt(preNum)}` },
    { label: "Investment Amount", value: `$${fmtInt(invNum)}` },
    { label: "Post-Money Valuation", value: `$${fmtInt(results.postMoney)}` },
    { label: "Price Per Share", value: `$${fmt(results.pricePerShare, 4)}` },
    { label: "New Investor Shares", value: fmtInt(results.investorShares) },
    { label: "Option Pool Shares", value: fmtInt(results.poolShares) },
    { label: "Total Shares After Round", value: fmtInt(results.totalShares) },
    { label: "Your Ownership Before", value: `${fmt(ownNum)}%` },
    { label: "Your Ownership After", value: `${fmt(results.yourPostOwnership)}%`, highlight: true },
    { label: "Ownership Lost", value: `${fmt(results.yourDilution)} pts` },
  ];

  const faqs = [
    { question: "What is equity dilution?", answer: "Dilution is the reduction in your ownership percentage when a company issues new shares. Your share count does not change — the denominator does. Owning 600,000 of 1,000,000 shares is 60%; after 250,000 new shares are issued, the same 600,000 shares represent 48%." },
    { question: "How is post-money valuation calculated?", answer: "Post-money valuation equals pre-money valuation plus the investment amount. A $2,000,000 investment at an $8,000,000 pre-money valuation produces a $10,000,000 post-money valuation, and the investor owns $2,000,000 ÷ $10,000,000 = 20% of the company." },
    { question: "What is an option pool shuffle?", answer: "When investors require an option pool to be created before the round closes, the new shares come entirely out of the existing shareholders' stake rather than being shared with the incoming investor. This is called the pre-money shuffle, and it increases founder dilution meaningfully — often by several percentage points." },
    { question: "Does dilution mean I am losing money?", answer: "Not necessarily. Dilution reduces your percentage, but if the round raises the company's valuation, the value of your smaller slice can still be higher than before. Owning 48% of a $10,000,000 company is worth more than 60% of a $6,000,000 one. Dilution only destroys value in a down round." },
    { question: "Is the pool usually created pre-money or post-money?", answer: "Pre-money is the market standard in venture term sheets, and it is the more expensive option for founders. Post-money pools spread the dilution across everyone including the new investor, which is why they are less common and are usually a negotiated concession." },
    { question: "How much dilution is normal per round?", answer: "A typical priced round sells 15% to 25% of the company, with seed rounds often at the higher end. Adding an option pool on top can push total founder dilution past 30% in a single round. Founders commonly end up with 10% to 20% after several rounds of financing." },
    { question: "What is price per share in a funding round?", answer: "Price per share equals the investment amount divided by the number of shares the investor receives. When a pre-money option pool is created, the effective price per share falls below the naive pre-money valuation divided by existing shares, because more shares exist before the investor's money is counted." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dilution Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dilution Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="pre-money" label="Pre-Money Valuation ($)" value={preMoney} onChange={setPreMoney} prefix="$" tooltip="Company valuation agreed before the new money comes in." />
              <InputField id="investment" label="Investment Amount ($)" value={investment} onChange={setInvestment} prefix="$" tooltip="Total new capital being raised in this round." />
              <InputField id="existing-shares" label="Existing Shares" value={existingShares} onChange={setExistingShares} tooltip="Fully diluted shares outstanding before the round." />
              <InputField id="your-ownership" label="Your Ownership (%)" value={yourOwnership} onChange={setYourOwnership} suffix="%" tooltip="Your stake before this round closes." />
            </div>

            {hasValidationErrors && (
              <div className="text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {errorMsg}
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-primary font-medium hover:bg-secondary/30 transition-colors"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="px-3 pb-3 border-t border-border pt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Option Pool</div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField id="pool-percent" label="Option Pool (%)" value={poolPercent} onChange={setPoolPercent} suffix="%" tooltip="Employee option pool as a percentage of the post-round cap table." />
                    <div>
                      <label htmlFor="pool-timing" className="flex items-center text-sm font-medium text-foreground mb-1">Pool Timing</label>
                      <select
                        id="pool-timing"
                        value={poolTiming}
                        onChange={e => setPoolTiming(e.target.value as PoolTiming)}
                        className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="pre">Pre-Money (shuffle)</option>
                        <option value="post">Post-Money</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasValidationErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Your Ownership After Round</div>
              <div className="text-4xl font-extrabold text-primary mb-1 tracking-tight">{fmt(results.yourPostOwnership)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                Down from {fmt(ownNum)}% — a loss of {fmt(results.yourDilution)} percentage points
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Post-Money</span>
                <span className="font-extrabold text-foreground">${fmtInt(results.postMoney)}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Investor Stake</span>
                <span className="font-extrabold text-foreground">{fmt(results.investorPercent)}%</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Dilution</span>
                <span className={`font-extrabold ${dilutionSeverity.color}`}>{dilutionSeverity.label}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Round Detail</th>
                    <th className="py-2.5 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map(row => (
                    <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Your Stake Value (Post-Money)</td>
                    <td className="py-2.5 px-3 text-right text-foreground">${fmtInt(results.yourStakeValue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-lg border border-border bg-card">
              <div className="shrink-0">
                <div className="w-[220px] h-[220px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPie>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={2} dataKey="value">
                        {pieData.map(e => <Cell key={e.name} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${fmt(v)}%`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    </RPie>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Your Share</span>
                    <span className="text-base font-extrabold text-foreground">{fmt(results.yourPostOwnership)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2 w-full">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Post-Round Cap Table</h4>
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{fmt(item.value)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Post-Money Valuation</span>
                  <span className="font-bold text-foreground">${fmtInt(results.postMoney)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Price Per Share</span>
                  <span className="font-bold text-foreground">${fmt(results.pricePerShare, 4)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Shares After</span>
                  <span className="font-bold text-foreground">{fmtInt(results.totalShares)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">New Investor Shares</span>
                  <span className="font-bold text-foreground">{fmtInt(results.investorShares)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Option Pool Shares</span>
                  <span className="font-bold text-foreground">{fmtInt(results.poolShares)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Investor Ownership</span>
                  <span className="font-bold text-foreground">{fmt(results.investorPercent)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Your Ownership After</span>
                  <span className="font-bold text-foreground">{fmt(results.yourPostOwnership)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Ownership Lost</span>
                  <span className="font-bold text-foreground">{fmt(results.yourDilution)} pts</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Your Shares</span>
                  <span className="font-bold text-foreground">{fmtInt(results.yourShares)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Your Stake Value</span>
                  <span className="font-bold text-foreground">${fmtInt(results.yourStakeValue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Equity Dilution Works</h2>
            <p>Dilution is one of the most misunderstood mechanics in startup financing. When a company raises money by issuing new shares, existing shareholders keep every share they owned — what changes is the total number of shares outstanding. Your slice of the pie gets thinner because the pie now has more slices, not because anyone took shares away from you. Understanding this distinction matters, because dilution is not inherently bad; it is the price of capital.</p>
            <h2 className="text-2xl font-bold mb-3">Pre-Money and Post-Money Valuation</h2>
            <p>Every priced round starts with a pre-money valuation, the agreed worth of the business before new capital arrives. Add the investment and you get the post-money valuation. The investor's ownership is simply their check divided by the post-money figure. This is why the distinction between a "$8 million pre" and an "$8 million post" deal is not a technicality — on a $2 million raise, the difference is 20% versus 25% of the company.</p>
            <h2 className="text-2xl font-bold mb-3">The Option Pool Shuffle</h2>
            <p>Investors typically require an employee option pool to be in place before they invest, sized to cover hiring until the next round. The critical detail is when that pool is created. If it is carved out of the pre-money valuation — the market standard — the new shares dilute only the existing shareholders, not the incoming investor. The investor still receives their full negotiated percentage, and founders absorb the entire cost of the pool. Switching the timing setting in Advanced Options shows exactly how many percentage points this convention costs you.</p>
            <h2 className="text-2xl font-bold mb-3">Dilution Is Not the Same as Loss</h2>
            <p>A smaller percentage of a larger company is frequently worth far more than a larger percentage of a smaller one. A founder who drops from 60% to 48% while the valuation rises from $8 million to $10 million has seen the paper value of their stake increase. The scenario where dilution genuinely destroys value is a down round, where new shares are issued at a lower price than previous investors paid, shrinking both the percentage and the value behind it.</p>
            <h2 className="text-2xl font-bold mb-3">Planning Across Multiple Rounds</h2>
            <p>Dilution compounds. A founder who gives up 20% in a seed round, 20% in a Series A, and 15% in a Series B does not retain 45% — the rounds multiply rather than add, leaving roughly 54% of their original stake. Layer option pool expansions on top of each round and founding teams commonly land between 10% and 20% by the time a company reaches later-stage financing. Modeling each prospective round before signing a term sheet is the only reliable way to see where you will end up.</p>
            <h2 className="text-2xl font-bold mb-3">What to Negotiate</h2>
            <p>The headline valuation attracts the most attention, but the option pool size and its timing often move founder ownership by more than a modest valuation bump would. A smaller pre-money pool, a post-money pool, or a pool sized against a realistic hiring plan rather than an inflated one can each be worth several percentage points. Run the scenarios before the term sheet is signed, not after.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dilution-calculator" />
          <PopularCalculators exclude="/calculator/dilution-calculator" />
        </div>
      </div>
    </>
  );
};

export default DilutionCalculator;
