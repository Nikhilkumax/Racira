"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface DividendResult {
  annualDividend: number;
  monthlyDividend: number;
  quarterlyDividend: number;
  portfolioValue: number;
  yieldOnCost: number;
  projectedValue10yr: number;
  projectedDividend10yr: number;
  totalReturn10yr: number;
  projectionData: { year: number; portfolio: number; annualDividend: number; cumDividends: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcDividend(
  shares: number, pricePerShare: number, dividendYield: number,
  annualGrowthRate: number, dividendGrowthRate: number, years: number,
  drip: boolean
): DividendResult {
  const portfolioValue = shares * pricePerShare;
  const annualDividend = portfolioValue * (dividendYield / 100);
  const monthlyDividend = annualDividend / 12;
  const quarterlyDividend = annualDividend / 4;
  const yieldOnCost = dividendYield; // same at purchase

  let currentShares = shares;
  let currentPrice = pricePerShare;
  let currentYield = dividendYield;
  let cumDividends = 0;

  const projectionData = [{ year: 0, portfolio: parseFloat(portfolioValue.toFixed(0)), annualDividend: parseFloat(annualDividend.toFixed(2)), cumDividends: 0 }];

  for (let y = 1; y <= years; y++) {
    currentPrice *= (1 + annualGrowthRate / 100);
    currentYield *= (1 + dividendGrowthRate / 100);
    const yearDiv = currentShares * currentPrice * (currentYield / 100);
    cumDividends += yearDiv;
    if (drip) {
      const newShares = yearDiv / currentPrice;
      currentShares += newShares;
    }
    const portVal = currentShares * currentPrice;
    projectionData.push({
      year: y,
      portfolio: parseFloat(portVal.toFixed(0)),
      annualDividend: parseFloat(yearDiv.toFixed(2)),
      cumDividends: parseFloat(cumDividends.toFixed(0)),
    });
  }

  const projectedValue10yr = projectionData[Math.min(10, years)].portfolio;
  const projectedDividend10yr = projectionData[Math.min(10, years)].annualDividend;
  const totalReturn10yr = projectedValue10yr - portfolioValue + (projectionData[Math.min(10, years)].cumDividends);
  const yieldOnCostFinal = (projectedDividend10yr / portfolioValue) * 100;

  const breakdown = [
    { label: "Shares Owned", value: shares.toLocaleString() },
    { label: "Price Per Share", value: `$${pricePerShare.toFixed(2)}` },
    { label: "Portfolio Value", value: `$${portfolioValue.toLocaleString()}` },
    { label: "Current Dividend Yield", value: `${dividendYield}%` },
    { label: "Annual Dividend Income", value: `$${annualDividend.toFixed(2)}` },
    { label: "Quarterly Dividend", value: `$${quarterlyDividend.toFixed(2)}` },
    { label: "Monthly Dividend", value: `$${monthlyDividend.toFixed(2)}` },
    { label: "DRIP Enabled", value: drip ? "Yes — reinvesting dividends" : "No — taking cash" },
    { label: `Projected Value (${years}yr)`, value: `$${projectedValue10yr.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: `Yield on Cost (${years}yr)`, value: `${yieldOnCostFinal.toFixed(2)}%` },
    { label: `Total Return (${years}yr)`, value: `$${totalReturn10yr.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Annual Dividend", value: `$${annualDividend.toFixed(2)}` },
    { label: "Monthly Dividend", value: `$${monthlyDividend.toFixed(2)}` },
    { label: "Current Yield", value: `${dividendYield}%` },
    { label: `Portfolio in ${years}yr`, value: `$${(projectedValue10yr / 1000).toFixed(0)}K` },
    { label: `Dividend in ${years}yr`, value: `$${projectedDividend10yr.toFixed(0)}/yr` },
    { label: `Yield on Cost ${years}yr`, value: `${yieldOnCostFinal.toFixed(2)}%` },
  ];

  return { annualDividend, monthlyDividend, quarterlyDividend, portfolioValue, yieldOnCost, projectedValue10yr, projectedDividend10yr, totalReturn10yr, projectionData, breakdown, summaryStats };
}

export default function DividendCalculator() {
  const [shares, setShares] = useState("500");
  const [price, setPrice] = useState("50");
  const [divYield, setDivYield] = useState("3.5");
  const [priceGrowth, setPriceGrowth] = useState("6");
  const [divGrowth, setDivGrowth] = useState("5");
  const [years, setYears] = useState("10");
  const [drip, setDrip] = useState(true);
  const [result, setResult] = useState<DividendResult | null>(null);

  const calculate = () => {
    setResult(calcDividend(
      parseFloat(shares) || 500, parseFloat(price) || 50,
      parseFloat(divYield) || 3.5, parseFloat(priceGrowth) || 6,
      parseFloat(divGrowth) || 5, parseInt(years) || 10, drip
    ));
  };

  useEffect(() => { setResult(calcDividend(500, 50, 3.5, 6, 5, 10, true)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is dividend yield and how is it calculated?", answer: "Dividend yield = Annual Dividend Per Share ÷ Stock Price × 100. Example: A stock paying $2.00/year in dividends and trading at $50 has a 4% dividend yield. Yield changes as the stock price moves — a falling price increases yield (often a warning sign), while a rising price decreases yield (positive price appreciation). Forward yield uses expected future dividends; trailing yield uses the past 12 months of dividends. When comparing dividend stocks, also check dividend payout ratio and growth history." },
    { question: "What is DRIP (Dividend Reinvestment Plan)?", answer: "DRIP automatically reinvests dividends to purchase additional shares instead of receiving cash. Over long time periods, DRIP dramatically amplifies returns through compound growth. Example: $25,000 invested at 3.5% yield with 6% price growth and 5% dividend growth over 20 years: Without DRIP: ~$80,000 portfolio + cumulative dividends. With DRIP: ~$130,000+ due to reinvested dividends buying more shares at each dividend date. DRIP is especially powerful in tax-advantaged accounts (IRAs, 401k) where no tax is owed on dividends." },
    { question: "What is a good dividend yield?", answer: "Context matters enormously: 0–1%: Low yield — growth-focused stocks (tech). 1.5–2.5%: Modest yield — quality growth stocks (S&P 500 average ~1.4%). 3–5%: Solid income — typical dividend ETFs, REITs, utilities. 6–8%: High yield — requires scrutiny of sustainability. 8%+: Warning zone — often indicates a dividend cut risk or deeply discounted stock. The safest dividend stocks combine: consistent dividend growth history (10+ years), payout ratio under 60%, strong free cash flow, and competitive advantage (moat). Dividend Aristocrats (25+ years of increases) are a good starting screen." },
    { question: "What is yield on cost?", answer: "Yield on cost (YOC) = Current Annual Dividend Per Share ÷ Original Purchase Price × 100. It shows your effective yield based on what you originally paid — not the current price. Example: You buy a stock at $20 with $0.80 annual dividend (4% yield). Over 10 years the dividend grows to $1.30/share — your YOC is now 6.5% on your original investment. Long-term dividend investors often cite high YOC as a measure of the power of dividend growth investing." },
    { question: "What are Dividend Aristocrats?", answer: "Dividend Aristocrats are S&P 500 companies that have increased their annual dividend for at least 25 consecutive years. As of 2024, there are ~65 Aristocrats. Examples: Coca-Cola (62 years of increases), Johnson & Johnson (62 years), Procter & Gamble (67 years), Realty Income (30 years). Dividend Kings require 50+ consecutive years of increases (~55 companies). These companies have survived recessions, financial crises, and industry disruptions while continuously growing shareholder distributions — a sign of exceptional business quality and financial discipline." },
    { question: "How are dividends taxed?", answer: "Qualified dividends (most US stocks held 60+ days): taxed at long-term capital gains rates — 0%, 15%, or 20% depending on income. Ordinary dividends (some foreign stocks, REITs, money market): taxed as ordinary income (10–37%). REIT dividends: mostly ordinary income, though the 20% pass-through deduction (QBI) applies. In a taxable brokerage account, dividends trigger tax in the year received — even if reinvested via DRIP. Hold dividend stocks in tax-advantaged accounts (Roth IRA) to eliminate dividend tax entirely." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Dividend Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Dividend Calculator with DRIP Projection</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Shares Owned</label>
                <div className={inp}><input type="number" value={shares} onChange={e => setShares(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Price Per Share</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} step={0.01} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Dividend Yield</label>
              <div className={inp}><input type="number" value={divYield} onChange={e => setDivYield(e.target.value)} step={0.1} className={ci} /><span className={suf}>%/yr</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Price Growth</label>
                <div className={inp}><input type="number" value={priceGrowth} onChange={e => setPriceGrowth(e.target.value)} step={0.5} className={ci} /><span className={suf}>%/yr</span></div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Dividend Growth</label>
                <div className={inp}><input type="number" value={divGrowth} onChange={e => setDivGrowth(e.target.value)} step={0.5} className={ci} /><span className={suf}>%/yr</span></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Projection Period</label>
              <div className="grid grid-cols-4 gap-2">
                {[["5", "5yr"], ["10", "10yr"], ["15", "15yr"], ["20", "20yr"]].map(([v, l]) => (
                  <button key={v} onClick={() => setYears(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${years === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-2 block">Dividend Reinvestment (DRIP)</label>
              <div className="grid grid-cols-2 gap-2">
                {[["true", "Reinvest (DRIP)"], ["false", "Take as Cash"]].map(([v, l]) => (
                  <button key={v} onClick={() => setDrip(v === "true")} className={`h-10 rounded-md border text-sm font-medium transition-colors ${drip === (v === "true") ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setShares("500"); setPrice("50"); setDivYield("3.5"); setPriceGrowth("6"); setDivGrowth("5"); setYears("10"); setDrip(true); setResult(calcDividend(500, 50, 3.5, 6, 5, 10, true)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Annual Dividend Income</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.annualDividend.toFixed(2)}</div>
                <div className="text-base text-muted-foreground mt-1">${result.monthlyDividend.toFixed(2)}/month · ${result.quarterlyDividend.toFixed(2)}/quarter · {years}yr projected: ${result.projectedDividend10yr.toFixed(0)}/yr</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`${years}yr Portfolio`, `$${(result.projectedValue10yr / 1000).toFixed(0)}K`], [`${years}yr Annual Div`, `$${result.projectedDividend10yr.toFixed(0)}`], [`${years}yr Total Return`, `$${(result.totalReturn10yr / 1000).toFixed(0)}K`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Dividend Details</h3>
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
                <h3 className="text-base font-bold mb-4">Portfolio & Dividend Growth Projection</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Line type="monotone" dataKey="portfolio" name="Portfolio Value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cumDividends" name="Cumulative Dividends" stroke="#22c55e" strokeWidth={2} dot={false} />
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Dividend Income Is Calculated</h2>
            <p>This <strong>dividend calculator</strong> computes your current income and projects future portfolio value and dividend income using compounding growth assumptions. Annual Dividend = Portfolio Value × Dividend Yield. With DRIP enabled, dividends purchase additional shares at each payment, creating a compounding cycle where each reinvestment generates its own future dividends. Over 20 years, DRIP can add 40–60% more total return compared to taking dividends as cash.</p>
            <h2 className="text-2xl font-bold mb-3">The Power of Dividend Growth Investing</h2>
            <p>A stock paying 3.5% today with 5% annual dividend growth provides a yield-on-cost of 5.7% after 10 years and 9.3% after 20 years — based on original purchase price. This is why long-term dividend investors focus on dividend growth rate as much as current yield. Dividend Aristocrats (S&P 500 companies with 25+ consecutive years of dividend increases) average approximately 8–10% annual dividend growth over the long term.</p>
            <h2 className="text-2xl font-bold mb-3">DRIP vs. Cash Dividends</h2>
            <p>DRIP is most powerful in: tax-advantaged accounts (Roth IRA, 401k — no tax on dividends), bear markets (reinvesting buys more shares at lower prices — dollar-cost averaging). Cash dividends are preferred for: income-dependent retirees needing cash flow, taxable accounts during high-income years (avoiding additional dividend tax), or when you want to deploy dividends to other investment opportunities. Most dividend-focused investors under 60 should strongly consider DRIP to maximize compounding. Related tools: <a href="/calculator/compound-interest-calculator">Compound Interest Calculator</a>, <a href="/calculator/investment-calculator">Investment Calculator</a>.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dividend-calculator" />
          <PopularCalculators exclude="/calculator/dividend-calculator" />
        </div>
      </div>
    </>
  );
}
