"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

const INDUSTRY_ROA = [
  { industry: "Technology", median: 12, high: 22 },
  { industry: "Healthcare", median: 9, high: 18 },
  { industry: "Financials", median: 1.2, high: 2.5 },
  { industry: "Consumer Staples", median: 7, high: 14 },
  { industry: "Energy", median: 5, high: 11 },
  { industry: "Industrials", median: 6, high: 12 },
  { industry: "Utilities", median: 3, high: 6 },
];

export default function ReturnOnAssetsCalculator() {
  const [netIncome, setNetIncome] = useState("5000000");
  const [beginAssets, setBeginAssets] = useState("48000000");
  const [endAssets, setEndAssets] = useState("52000000");
  const [industry, setIndustry] = useState("Technology");
  const [res, setRes] = useState<{ roa: number; avgAssets: number; benchmark: number; benchmarkHigh: number; ratingLabel: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const ni = parseFloat(netIncome) || 0;
    const ba = parseFloat(beginAssets) || 0;
    const ea = parseFloat(endAssets) || 0;
    const avgAssets = (ba + ea) / 2;
    const roa = avgAssets > 0 ? (ni / avgAssets) * 100 : 0;
    const bench = INDUSTRY_ROA.find(r => r.industry === industry) || INDUSTRY_ROA[0];
    const ratingLabel = roa >= bench.high ? "Excellent" : roa >= bench.median ? "Good" : roa >= bench.median * 0.7 ? "Average" : "Below Average";
    setRes({ roa, avgAssets, benchmark: bench.median, benchmarkHigh: bench.high, ratingLabel });
  };

  const reset = () => { setNetIncome("5000000"); setBeginAssets("48000000"); setEndAssets("52000000"); setIndustry("Technology"); };

  const fmtM = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n.toLocaleString()}`;
  const ratingColor = (r: string) => ({ Excellent: "text-emerald-600", Good: "text-primary", Average: "text-amber-600", "Below Average": "text-red-600" }[r] || "text-foreground");

  const faqs = [
    { question: "What is Return on Assets (ROA)?", answer: "Return on Assets (ROA) is a financial ratio that shows how profitable a company is relative to its total assets. It measures management's efficiency at using assets to generate earnings. The formula is: ROA = Net Income ÷ Average Total Assets × 100." },
    { question: "What is a good ROA?", answer: "Generally, an ROA of 5% or higher is considered decent, and 10% or higher is excellent. However, benchmarks vary widely by industry. Capital-intensive businesses like utilities or airlines require huge investments in assets and typically have low ROAs (often below 5%). Capital-light tech companies can easily achieve ROAs of 15% or higher." },
    { question: "How does ROA differ from ROE?", answer: "While Return on Equity (ROE) only measures profitability relative to shareholder equity, ROA includes all assets financed by both equity and debt (liabilities). If a company has zero debt, its ROA and ROE will be equal. If it takes on debt, its assets increase, which reduces ROA relative to ROE. Evaluating both together reveals how much leverage a company uses to boost equity returns." },
    { question: "Why is average assets used instead of ending assets?", answer: "Using average assets (beginning + ending ÷ 2) accounts for asset growth or sales during the fiscal year. A company's assets change constantly, so averaging provides a more accurate representation of the asset base that was actually used to generate that year's net income." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Return on Assets Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Return on Assets (ROA) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Company Asset Details</h2>
            <CompactInput id="ni" label="Net Income" value={netIncome} onChange={setNetIncome} prefix="$" />
            <CompactInput id="ba" label="Beginning Total Assets" value={beginAssets} onChange={setBeginAssets} prefix="$" />
            <CompactInput id="ea" label="Ending Total Assets" value={endAssets} onChange={setEndAssets} prefix="$" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Industry Benchmark</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                {INDUSTRY_ROA.map(r => <option key={r.industry} value={r.industry}>{r.industry} (Median: {r.median}%)</option>)}
              </select>
            </div>
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">ROA Analysis</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Return on Assets</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtPct(res.roa)}</div>
                  <div className={`text-sm font-bold ${ratingColor(res.ratingLabel)}`}>{res.ratingLabel} vs {industry} industry median of {res.benchmark}%</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Net Income", value: fmtM(parseFloat(netIncome) || 0) },
                        { label: "Beginning Total Assets", value: fmtM(parseFloat(beginAssets) || 0) },
                        { label: "Ending Total Assets", value: fmtM(parseFloat(endAssets) || 0) },
                        { label: "Average Assets", value: fmtM(res.avgAssets) },
                        { label: "Return on Assets (ROA)", value: fmtPct(res.roa), bold: true },
                        { label: "Industry Median ROA", value: fmtPct(res.benchmark) },
                        { label: "Industry High ROA", value: fmtPct(res.benchmarkHigh) },
                        { label: "Rating", value: res.ratingLabel },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-bold ${r.label === "Rating" ? ratingColor(res.ratingLabel) : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">ROA vs Industry Benchmarks</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={INDUSTRY_ROA.map(r => ({ name: r.industry, median: r.median, high: r.high }))} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                        <Tooltip formatter={(v: any, n: string) => [`${Number(v).toFixed(1)}%`, n]} />
                        <ReferenceLine y={res.roa} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Your ROA: ${res.roa.toFixed(1)}%`, position: "right", fontSize: 10, fill: "#f59e0b" }} />
                        <Bar dataKey="median" fill="hsl(var(--primary) / 0.4)" name="Industry Median" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="high" fill="hsl(var(--primary) / 0.15)" name="Industry High" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Return on Assets (ROA)?</h2>
            <p>Return on Assets (ROA) is an essential financial metric that measures how effectively a company uses its assets to generate profits. It shows the relationship between a company's earnings and the capital invested in its infrastructure, inventory, machinery, and other physical or intellectual properties. In simple terms: for every dollar in assets a business owns, how many cents of net profit does it produce?</p>
            <p>A higher ROA indicates that a company is more efficient and productive with its resources, while a lower ROA indicates potential mismanagement, underutilized assets, or excessive capital expenditures that are not translating into earnings growth. Investors and analysts use ROA to compare companies within the same industry to evaluate operational performance.</p>

            <h2 className="text-2xl font-bold mb-3">The Return on Assets Formula</h2>
            <p>The standard formula for ROA is:</p>
            <p><code>Return on Assets (ROA) = (Net Income ÷ Average Total Assets) × 100</code></p>
            <p>Average assets are calculated as: <code>(Beginning Total Assets + Ending Total Assets) ÷ 2</code>. Using average assets is vital because a company's asset balance changes over the course of a fiscal year, making a single year-end snapshot inaccurate.</p>

            <h2 className="text-2xl font-bold mb-3">Why ROA Varies by Industry</h2>
            <p>Because ROA depends heavily on the size of the asset base, it is not useful for comparing businesses in entirely different sectors. Capital-intensive industries (like rail transportation, oil and gas, telecommunications, and utilities) must invest billions in infrastructure. Even highly profitable utility companies might display an ROA of only 3% to 5% because their asset denominators are massive. Conversely, tech startups or service organizations require few physical assets, often achieving ROAs above 15%.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/return-on-assets-calculator" />
          <PopularCalculators exclude="/calculator/return-on-assets-calculator" />
        </div>
      </div>
    </>
  );
}
