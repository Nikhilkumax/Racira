"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface DIRResult {
  dir: number; dailyExpenses: number; rating: string; ratingColor: string;
  liquidAssets: number; daysDefended: number;
}
const DEFAULTS = { cash: "420000", marketableSecurities: "180000", netReceivables: "380000", annualCOGS: "2400000", annualOpEx: "600000" };

function calculate(d: typeof DEFAULTS): DIRResult {
  const cash = parseFloat(d.cash) || 0;
  const sec = parseFloat(d.marketableSecurities) || 0;
  const ar = parseFloat(d.netReceivables) || 0;
  const cogs = parseFloat(d.annualCOGS) || 0;
  const opex = parseFloat(d.annualOpEx) || 0;
  const liquidAssets = cash + sec + ar;
  const dailyExpenses = (cogs + opex) / 365;
  const dir = dailyExpenses > 0 ? liquidAssets / dailyExpenses : 0;
  let rating = "", ratingColor = "";
  if (dir >= 60) { rating = "Strong — Excellent Coverage"; ratingColor = "text-emerald-600"; }
  else if (dir >= 30) { rating = "Adequate Coverage"; ratingColor = "text-primary"; }
  else if (dir >= 15) { rating = "Caution — Limited Runway"; ratingColor = "text-amber-600"; }
  else { rating = "Critical — Immediate Risk"; ratingColor = "text-red-600"; }
  return { dir, dailyExpenses, rating, ratingColor, liquidAssets, daysDefended: dir };
}

const fmtM = (n: number) => Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default function DefensiveIntervalRatioCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<DIRResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const handleCalc = () => setR(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const barData = [
    { name: "Your DIR", value: +r.dir.toFixed(1), fill: r.dir >= 30 ? "hsl(var(--primary))" : "#ef4444" },
    { name: "Conservative Min", value: 30, fill: "#94a3b8" },
    { name: "Comfortable", value: 60, fill: "#10b981" },
  ];

  const faqs = [
    { question: "What is the Defensive Interval Ratio?", answer: "The Defensive Interval Ratio (DIR), also called the Basic Defense Interval (BDI), measures how many days a company can operate using only its liquid assets (cash, marketable securities, receivables) without needing additional revenue or external financing." },
    { question: "How is DIR calculated?", answer: "DIR = Defensive Interval Assets ÷ Daily Operating Expenses. Defensive Assets = Cash + Marketable Securities + Net Receivables. Daily Operating Expenses = (COGS + Operating Expenses) ÷ 365. The result tells you how many days of operations the liquid assets can sustain." },
    { question: "What is a good DIR?", answer: "A DIR of 30+ days is generally considered adequate. Many analysts prefer 45–60 days as a comfortable buffer. Startups and high-growth companies often target 12–18 months of runway (365+ days). Below 15 days signals critical liquidity risk." },
    { question: "How does DIR differ from the current ratio?", answer: "The current ratio includes all current assets (including inventory) against all current liabilities. DIR focuses only on the most liquid assets (excluding inventory) and measures them against daily cash outflows — making it a more practical survival measure." },
    { question: "Why is DIR important for startups?", answer: "Startups often measure runway in months: Runway = Cash ÷ Monthly Burn Rate. DIR is the corporate equivalent. Investors track this metric closely — companies with < 6 months of runway face pressure to raise capital or achieve profitability quickly." },
    { question: "What expenses are included in DIR denominator?", answer: "The denominator typically includes COGS and cash operating expenses (excluding non-cash items like depreciation and amortization). Some analysts use total operating expenses before D&A. Only cash-consuming expenses count since we are measuring actual cash survival capacity." },
    { question: "How can a company improve its DIR?", answer: "Increase liquid assets: raise additional capital, accelerate receivables collections, reduce cash burn rate. Decrease daily expenses: cut costs, defer non-essential spending, negotiate better supplier terms. Improve collections efficiency (reduce DSO) to convert AR to cash faster." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Defensive Interval Ratio" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Defensive Interval Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Defensive Assets (Liquid)</p>
            {([
              { label: "Cash & Cash Equivalents", key: "cash", tip: "Most liquid — immediately available" },
              { label: "Marketable Securities", key: "marketableSecurities", tip: "Short-term investments convertible to cash" },
              { label: "Net Accounts Receivable", key: "netReceivables", tip: "Expected to collect within normal credit terms" },
            ] as const).map(({ label, key, tip }) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-0.5">{label}</label>
                <p className="text-xs text-muted-foreground mb-1">{tip}</p>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
                </div>
              </div>
            ))}
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-1">Annual Cash Operating Expenses</p>
            {([
              { label: "Annual COGS (cash portion)", key: "annualCOGS", tip: "Exclude non-cash items like depreciation" },
              { label: "Annual Operating Expenses", key: "annualOpEx", tip: "SG&A and other cash operating costs" },
            ] as const).map(({ label, key, tip }) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm font-semibold text-foreground mb-0.5">{label}</label>
                <p className="text-xs text-muted-foreground mb-1">{tip}</p>
                <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                  <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all">Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`rounded-xl p-5 border-l-4 ${r.dir >= 30 ? "bg-primary/10 border-primary" : "bg-red-500/10 border-red-500"}`}>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Defensive Interval</div>
              <div className={`text-5xl font-extrabold ${r.ratingColor}`}>{r.dir.toFixed(1)} <span className="text-2xl">days</span></div>
              <div className={`text-sm font-semibold mt-1 ${r.ratingColor}`}>{r.rating}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Liquid Assets</div><div className="font-bold text-lg">{fmtM(r.liquidAssets)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Daily Burn</div><div className="font-bold text-lg">{fmtM(r.dailyExpenses)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Weeks Runway</div><div className="font-bold text-lg">{(r.dir / 7).toFixed(1)} wks</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">DIR vs. Benchmarks (days)</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={45}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" d" />
                    <RTooltip formatter={(v: number) => [`${v} days`, ""]} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">Calculation Detail</h3></div>
              {[
                { label: "Cash & Equivalents", val: fmtM(parseFloat(f.cash) || 0) },
                { label: "Marketable Securities", val: fmtM(parseFloat(f.marketableSecurities) || 0) },
                { label: "Net Receivables", val: fmtM(parseFloat(f.netReceivables) || 0) },
                { label: "Total Liquid Assets", val: fmtM(r.liquidAssets), bold: true },
                { label: "Annual Cash Expenses", val: fmtM((parseFloat(f.annualCOGS) || 0) + (parseFloat(f.annualOpEx) || 0)) },
                { label: "Daily Cash Burn", val: `${fmtM(r.dailyExpenses)}/day`, bold: true },
                { label: "Defensive Interval Ratio", val: `${r.dir.toFixed(1)} days`, bold: true, highlight: true },
                { label: "Runway (weeks)", val: `${(r.dir / 7).toFixed(1)} weeks` },
                { label: "Assessment", val: r.rating },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-2 px-4 py-2.5 border-b border-border/30 last:border-0 ${row.highlight ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                  <span className="text-muted-foreground text-sm">{row.label}</span>
                  <span className={`text-right text-sm ${row.bold ? "font-bold text-foreground" : ""}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Defensive Interval Ratio?</h2>
            <p>The Defensive Interval Ratio (DIR), also known as the Basic Defense Interval (BDI) or Defensive Interval Period (DIP), is a liquidity metric that measures how many days a company could operate exclusively using its most liquid assets — without generating any new revenue or accessing additional financing. It answers the critical question: "If all revenue stopped today, how long could we keep the lights on?"</p>
            <h2 className="text-2xl font-bold mb-3">DIR Formula</h2>
            <p><strong>DIR = Defensive Assets ÷ Daily Operating Expenses</strong></p>
            <p>Where Defensive Assets = Cash + Marketable Securities + Net Receivables. Daily Operating Expenses = (COGS + Operating Expenses) ÷ 365. Non-cash charges like depreciation and amortization are excluded from the denominator since they do not consume cash. Inventory and other current assets are excluded from defensive assets because they are less liquid and require a sale to convert to cash.</p>
            <h2 className="text-2xl font-bold mb-3">DIR vs. Current Ratio</h2>
            <p>The current ratio (Current Assets ÷ Current Liabilities) is a static snapshot of assets vs. liabilities. DIR is a dynamic, time-based measure. A company with a current ratio of 2.0 might have a DIR of only 15 days if most of its current assets are slow-moving inventory. A retailer with large inventory but rapid turnover might have a lower current ratio but adequate DIR. They are complementary — use both together for a complete liquidity picture.</p>
            <h2 className="text-2xl font-bold mb-3">Startup Runway — The Consumer Version of DIR</h2>
            <p>Startups and venture-backed companies focus intensely on cash runway: Cash ÷ Monthly Burn Rate = Months of Runway. DIR is the institutionalized corporate version of this concept. Venture investors typically require at least 12–18 months of runway before the next fundraise. A DIR below 90 days for a startup would be alarming and would trigger emergency fundraising or cost-cutting measures.</p>
            <h2 className="text-2xl font-bold mb-3">Industry Applications</h2>
            <p>DIR is particularly relevant for: Seasonal businesses (retailers building inventory pre-holiday need sufficient DIR to survive the build-up phase). Capital-intensive businesses (construction, aerospace) with lumpy revenue streams. Companies in cyclical industries where revenue can drop 30–50% in downturns. Distressed companies being analyzed by creditors or restructuring advisors. Healthcare and professional services businesses with receivables-heavy balance sheets and low inventory.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Your Defensive Interval</h2>
            <p>Accelerate cash collection: reduce DSO by offering early payment discounts or tightening credit terms. Build a cash reserve: maintain a minimum cash balance policy (e.g., 60 days of operating expenses). Establish a revolving credit facility as backstop liquidity — banks are more willing to provide credit when you don&apos;t urgently need it. Reduce burn rate: identify and eliminate non-critical overhead. Convert slow assets to cash: factor receivables, liquidate slow-moving inventory at discount rather than holding it.</p>
            <h2 className="text-2xl font-bold mb-3">DIR in Financial Distress Analysis</h2>
            <p>Credit analysts and restructuring advisors use DIR to assess how much time a distressed company has before it faces a liquidity crisis. A DIR below 30 days often triggers accelerated review of refinancing options, asset sales, or bankruptcy preparation. During the COVID-19 pandemic, many businesses' DIRs collapsed from months to weeks — illustrating why companies with strong pre-crisis balance sheets (high DIR) survived while leveraged competitors failed.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/defensive-interval-ratio-calculator" />
          <PopularCalculators exclude="/calculator/defensive-interval-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
