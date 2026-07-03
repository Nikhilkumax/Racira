"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

interface PiotroskiResult {
  score: number; rating: string; ratingColor: string;
  profitability: { name: string; pass: boolean; desc: string }[];
  leverage: { name: string; pass: boolean; desc: string }[];
  efficiency: { name: string; pass: boolean; desc: string }[];
}

const DEFAULTS = {
  netIncome: "1200000", operatingCF: "1800000", roa: "5.2", deltaROA: "0.8",
  leverage: "0.42", deltaLeverage: "-0.03", currentRatio: "1.8", deltaCurrentRatio: "0.2",
  sharesIssued: "0", deltaGrossMargin: "2.1", deltaAssetTurnover: "0.05",
};

function calculate(d: typeof DEFAULTS): PiotroskiResult {
  const netIncome = parseFloat(d.netIncome) || 0;
  const ocf = parseFloat(d.operatingCF) || 0;
  const roa = parseFloat(d.roa) || 0;
  const deltaROA = parseFloat(d.deltaROA) || 0;
  const lev = parseFloat(d.leverage) || 0;
  const deltaLev = parseFloat(d.deltaLeverage) || 0;
  const cr = parseFloat(d.currentRatio) || 0;
  const deltaCR = parseFloat(d.deltaCurrentRatio) || 0;
  const shares = parseFloat(d.sharesIssued) || 0;
  const deltaGM = parseFloat(d.deltaGrossMargin) || 0;
  const deltaAT = parseFloat(d.deltaAssetTurnover) || 0;

  const profitability = [
    { name: "F1: ROA > 0", pass: roa > 0, desc: "Positive return on assets" },
    { name: "F2: Operating CF > 0", pass: ocf > 0, desc: "Positive operating cash flow" },
    { name: "F3: ΔROA > 0", pass: deltaROA > 0, desc: "Increasing return on assets" },
    { name: "F4: Accruals < 0", pass: ocf > netIncome, desc: "Cash flow > net income (low accruals)" },
  ];
  const leverage = [
    { name: "F5: ΔLeverage < 0", pass: deltaLev < 0, desc: "Declining long-term debt ratio" },
    { name: "F6: ΔCurrent Ratio > 0", pass: deltaCR > 0, desc: "Improving liquidity" },
    { name: "F7: No New Shares", pass: shares <= 0, desc: "No dilutive share issuance" },
  ];
  const efficiency = [
    { name: "F8: ΔGross Margin > 0", pass: deltaGM > 0, desc: "Improving gross profit margin" },
    { name: "F9: ΔAsset Turnover > 0", pass: deltaAT > 0, desc: "Improving asset efficiency" },
  ];

  const score = [...profitability, ...leverage, ...efficiency].filter(c => c.pass).length;
  let rating = "", ratingColor = "";
  if (score >= 8) { rating = "Strong — High Quality"; ratingColor = "text-emerald-600"; }
  else if (score >= 6) { rating = "Good — Above Average"; ratingColor = "text-primary"; }
  else if (score >= 4) { rating = "Neutral — Average"; ratingColor = "text-amber-600"; }
  else { rating = "Weak — Value Trap Risk"; ratingColor = "text-red-600"; }

  return { score, rating, ratingColor, profitability, leverage, efficiency };
}

export default function PiotroskiFScoreCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<PiotroskiResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const handleCalc = () => setR(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const radarData = [
    { subject: "Profitability", score: r.profitability.filter(c => c.pass).length, max: 4 },
    { subject: "Leverage", score: r.leverage.filter(c => c.pass).length, max: 3 },
    { subject: "Efficiency", score: r.efficiency.filter(c => c.pass).length, max: 2 },
  ];

  const allCriteria = [...r.profitability, ...r.leverage, ...r.efficiency];

  const faqs = [
    { question: "What is the Piotroski F-Score?", answer: "The Piotroski F-Score (0–9) is a financial strength indicator developed by accounting professor Joseph Piotroski in 2000. It scores a company across 9 binary criteria covering profitability, leverage/liquidity, and operating efficiency. Higher scores indicate stronger fundamentals." },
    { question: "How is the F-Score interpreted?", answer: "Score 8–9: Strong company with high-quality fundamentals — historically outperforms. Score 6–7: Good quality, above average. Score 3–5: Average or mixed signals. Score 0–2: Weak fundamentals — high risk of continued underperformance or financial distress. Piotroski showed that high-F-score value stocks significantly outperformed low-F-score value stocks." },
    { question: "What are the 9 F-Score criteria?", answer: "Profitability (4 pts): ROA > 0, Operating CF > 0, Increasing ROA, Low accruals (OCF > Net Income). Leverage/Liquidity (3 pts): Declining leverage, Improving current ratio, No new shares issued. Efficiency (2 pts): Improving gross margin, Improving asset turnover." },
    { question: "Who should use the Piotroski F-Score?", answer: "Value investors use it to distinguish fundamentally strong value stocks from 'value traps' — cheap stocks that are cheap for good reason. It is most powerful when screening the cheapest decile of stocks by price-to-book ratio, which is where Piotroski's original research focused." },
    { question: "Why is 'accruals' important in F4?", answer: "F4 checks if operating cash flow exceeds net income. When CF > NI, it suggests earnings are high-quality and not driven by aggressive accounting accruals. Earnings driven by accruals (NI > OCF) are less reliable and more likely to reverse in future periods." },
    { question: "Can F-Score be used for all stocks?", answer: "F-Score works best for mature, value-priced companies. It is less appropriate for growth stocks, startups (negative earnings), financial firms (different balance sheet structure), or very small micro-caps where data quality is lower." },
    { question: "How does F-Score combine with other metrics?", answer: "Piotroski F-Score is most powerful when combined with value metrics like low Price-to-Book or low P/E. Other useful combinations: high F-Score + insider buying, or high F-Score + low short interest. Using F-Score in isolation without valuation context is less effective." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Piotroski F-Score" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Piotroski F-Score Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Profitability</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: "Net Income ($)", key: "netIncome" },
                { label: "Operating Cash Flow ($)", key: "operatingCF" },
                { label: "Return on Assets (%)", key: "roa" },
                { label: "ΔROA vs Prior Year (%)", key: "deltaROA" },
              ] as const).map(({ label, key }) => (
                <div key={key} className="flex flex-col">
                  <label className="text-xs font-semibold text-foreground mb-1">{label}</label>
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Leverage &amp; Liquidity</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: "Long-term Debt Ratio", key: "leverage" },
                { label: "ΔDebt Ratio (neg = good)", key: "deltaLeverage" },
                { label: "Current Ratio", key: "currentRatio" },
                { label: "ΔCurrent Ratio", key: "deltaCurrentRatio" },
                { label: "New Shares Issued (0=none)", key: "sharesIssued" },
              ] as const).map(({ label, key }) => (
                <div key={key} className="flex flex-col">
                  <label className="text-xs font-semibold text-foreground mb-1">{label}</label>
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Operating Efficiency</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: "ΔGross Margin (% pts)", key: "deltaGrossMargin" },
                { label: "ΔAsset Turnover", key: "deltaAssetTurnover" },
              ] as const).map(({ label, key }) => (
                <div key={key} className="flex flex-col">
                  <label className="text-xs font-semibold text-foreground mb-1">{label}</label>
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all">Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`rounded-xl p-5 border-l-4 ${r.score >= 6 ? "bg-primary/10 border-primary" : r.score >= 4 ? "bg-amber-500/10 border-amber-500" : "bg-red-500/10 border-red-500"}`}>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Piotroski F-Score</div>
              <div className={`text-6xl font-extrabold ${r.ratingColor}`}>{r.score}<span className="text-2xl text-muted-foreground">/9</span></div>
              <div className={`text-sm font-semibold mt-1 ${r.ratingColor}`}>{r.rating}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Profitability</div><div className="font-bold text-lg">{r.profitability.filter(c => c.pass).length}/4</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Leverage</div><div className="font-bold text-lg">{r.leverage.filter(c => c.pass).length}/3</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Efficiency</div><div className="font-bold text-lg">{r.efficiency.filter(c => c.pass).length}/2</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">Score Breakdown by Category</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <RTooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">9 Criteria Detail</h3></div>
              {allCriteria.map((c, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-secondary/20">
                  <span className={`text-lg leading-none mt-0.5 ${c.pass ? "text-emerald-500" : "text-red-500"}`}>{c.pass ? "✓" : "✗"}</span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.desc}</div>
                  </div>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${c.pass ? "bg-emerald-500/15 text-emerald-700" : "bg-red-500/15 text-red-700"}`}>{c.pass ? "+1" : "0"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Piotroski F-Score?</h2>
            <p>The Piotroski F-Score is a 9-point accounting-based scoring system developed by Stanford accounting professor Joseph Piotroski in his seminal 2000 paper &quot;Value Investing: The Use of Historical Financial Statement Information to Separate Winners from Losers.&quot; It assesses a company&apos;s fundamental financial health using binary criteria across three dimensions: profitability, financial leverage/liquidity, and operating efficiency. Each criterion earns one point, producing a total score between 0 and 9.</p>
            <h2>The 9 F-Score Criteria Explained</h2>
            <p><strong>Profitability (4 points):</strong> F1: ROA &gt; 0 (company is profitable). F2: Operating Cash Flow &gt; 0 (cash is actually being generated). F3: Change in ROA &gt; 0 (profitability is improving). F4: Accruals &lt; 0, meaning Operating CF &gt; Net Income (earnings are high quality, not accounting artifacts). <strong>Leverage/Liquidity (3 points):</strong> F5: Long-term debt ratio declined (less financial risk). F6: Current ratio improved (better short-term liquidity). F7: No new common shares issued (no dilution signal). <strong>Efficiency (2 points):</strong> F8: Gross margin improved (pricing power or cost control). F9: Asset turnover ratio improved (more efficient asset use).</p>
            <h2>Investment Application</h2>
            <p>Piotroski&apos;s original research focused on high book-to-market (low P/B) value stocks. Within this universe, high F-score stocks (8–9) produced mean annual returns 7.5% higher than low F-score stocks (0–1) over the study period. The screening approach is straightforward: first screen for cheap stocks (low P/B, low P/E), then apply F-Score to identify those with improving fundamentals, and avoid those that are cheap because they are deteriorating.</p>
            <h2>F-Score and Value Traps</h2>
            <p>A "value trap" is a stock that appears cheap by traditional metrics (low P/E, low P/B) but never recovers because the business is genuinely deteriorating. Low F-score value stocks typically represent value traps — the market correctly prices them at a discount. High F-score value stocks represent overlooked opportunities where fundamental improvement hasn&apos;t yet been recognized in the stock price. F-Score is most effective as a value trap filter.</p>
            <h2>Limitations and Considerations</h2>
            <p>F-Score was developed and backtested primarily on US equities from the 1970s–1990s. It is less applicable to financial companies (banks, insurance firms) due to their different balance sheet structures. Very early-stage or rapidly growing companies may score poorly despite strong prospects (e.g., investing in growth means higher leverage and lower current ratio). Use F-Score as one factor in a multi-dimensional framework, not as a standalone buy/sell signal.</p>
            <h2>Combining F-Score with Other Factors</h2>
            <p>High F-Score + Low P/B: Piotroski&apos;s original strategy. High F-Score + Insider Buying: Strong signal of undervalued, improving companies. High F-Score + Low Short Interest: Reduces squeeze risk and confirms fundamental quality. High F-Score + Momentum: Combines quality/value improvement with price confirmation. Many quantitative funds incorporate F-Score as a quality factor in multi-factor models alongside value, momentum, and size factors.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/piotroski-f-score-calculator" />
          <PopularCalculators exclude="/calculator/piotroski-f-score-calculator" />
        </div>
      </div>
    </>
  );
}
