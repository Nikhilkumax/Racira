"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getRating = (ratio: number) => {
  if (ratio >= 1.5) return { label: "Excellent", color: "#10b981", desc: "Company has very strong short-term liquidity." };
  if (ratio >= 1.0) return { label: "Good", color: "#3b82f6", desc: "Company can cover current liabilities with liquid assets." };
  if (ratio >= 0.7) return { label: "Caution", color: "#f59e0b", desc: "Liquidity may be tight. Monitor cash flow closely." };
  return { label: "Poor", color: "#ef4444", desc: "Potential liquidity risk — may struggle to meet short-term obligations." };
};

const QuickRatioCalculator = () => {
  const DEFAULTS = { cash: "50000", securities: "30000", receivables: "80000", currentLiabilities: "100000" };
  const [cash, setCash] = useState(DEFAULTS.cash);
  const [securities, setSecurities] = useState(DEFAULTS.securities);
  const [receivables, setReceivables] = useState(DEFAULTS.receivables);
  const [currentLiabilities, setCurrentLiabilities] = useState(DEFAULTS.currentLiabilities);
  const [result, setResult] = useState<any>(null);

  const calculate = (c = cash, s = securities, r = receivables, cl = currentLiabilities) => {
    const C = parseFloat(c) || 0, S = parseFloat(s) || 0, R = parseFloat(r) || 0, CL = parseFloat(cl);
    if (!CL || CL <= 0) return;
    const quickAssets = C + S + R;
    const quickRatio = quickAssets / CL;
    const rating = getRating(quickRatio);
    const pieData = [
      { name: "Cash & Equivalents", value: C, color: "#10b981" },
      { name: "Marketable Securities", value: S, color: "#3b82f6" },
      { name: "Accounts Receivable", value: R, color: "#f59e0b" },
    ].filter((d) => d.value > 0);
    setResult({ quickRatio, quickAssets, C, S, R, CL, rating, pieData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setCash(DEFAULTS.cash); setSecurities(DEFAULTS.securities); setReceivables(DEFAULTS.receivables); setCurrentLiabilities(DEFAULTS.currentLiabilities); calculate(DEFAULTS.cash, DEFAULTS.securities, DEFAULTS.receivables, DEFAULTS.currentLiabilities); };

  const faqs = [
    { question: "What is the quick ratio?", answer: "The quick ratio (also called the acid-test ratio) measures a company's ability to meet short-term liabilities using only its most liquid assets: cash, marketable securities, and accounts receivable. It excludes inventory, which may not be quickly convertible to cash." },
    { question: "What is the quick ratio formula?", answer: "Quick Ratio = (Cash + Marketable Securities + Accounts Receivable) / Current Liabilities. An equivalent formula is: Quick Ratio = (Current Assets – Inventory – Prepaid Expenses) / Current Liabilities." },
    { question: "What is a good quick ratio?", answer: "A quick ratio of 1.0 or higher is generally considered satisfactory — it means the company has at least $1 of liquid assets for every $1 of current liabilities. Ratios above 1.5 indicate excellent liquidity. Below 0.7 suggests potential liquidity risk, though industry context matters significantly." },
    { question: "How does quick ratio differ from current ratio?", answer: "The current ratio includes all current assets (including inventory and prepaid expenses). The quick ratio is more conservative — it excludes inventory because it cannot always be quickly converted to cash. Quick ratio is a stricter test of short-term financial health." },
    { question: "Which industries typically have low quick ratios?", answer: "Retail and manufacturing companies typically have lower quick ratios because they carry large inventories. Banks, software, and service companies often have higher quick ratios as their assets are more liquid. Always compare quick ratios within the same industry." },
    { question: "What does a quick ratio above 2 mean?", answer: "A very high quick ratio (above 2) may indicate the company is holding excess cash or is not efficiently deploying its liquid assets. While better than a dangerously low ratio, it can suggest missed investment opportunities or inefficient capital allocation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Quick Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Quick Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Cash &amp; Cash Equivalents</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={cash} onChange={(e) => setCash(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="50000" min="0" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Marketable Securities</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={securities} onChange={(e) => setSecurities(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="30000" min="0" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Accounts Receivable</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={receivables} onChange={(e) => setReceivables(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="80000" min="0" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Current Liabilities</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={currentLiabilities} onChange={(e) => setCurrentLiabilities(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="100000" min="1" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Quick Ratio (Acid-Test Ratio)</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{fmt(result.quickRatio)}x</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — {result.rating.desc}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Liquidity Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Cash & Cash Equivalents", value: `$${fmt(result.C)}` },
                    { label: "Marketable Securities", value: `$${fmt(result.S)}` },
                    { label: "Accounts Receivable", value: `$${fmt(result.R)}` },
                    { label: "Total Quick Assets", value: `$${fmt(result.quickAssets)}` },
                    { label: "Current Liabilities", value: `$${fmt(result.CL)}` },
                    { label: "Quick Ratio", value: `${fmt(result.quickRatio)}x` },
                    { label: "Coverage Gap / Surplus", value: result.quickAssets >= result.CL ? `+$${fmt(result.quickAssets - result.CL)} surplus` : `-$${fmt(result.CL - result.quickAssets)} shortfall` },
                    { label: "Rating", value: result.rating.label },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.pieData.length > 0 && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Quick Asset Composition</h3>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={result.pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {result.pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Financial Health Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Quick Assets", value: `$${fmt(result.quickAssets)}` },
                    { label: "Current Liabilities", value: `$${fmt(result.CL)}` },
                    { label: "Quick Ratio", value: `${fmt(result.quickRatio)}x` },
                    { label: "Industry Benchmark", value: "≥ 1.0x (healthy)" },
                    { label: "Liquidity Rating", value: result.rating.label, border: true, bold: true },
                  ].map((s, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Quick Ratio Calculator?</h2>
            <p>A quick ratio calculator measures a company's short-term liquidity by comparing its most liquid assets to its current liabilities. Also known as the acid-test ratio, the quick ratio is a stricter version of the current ratio because it excludes inventory and prepaid expenses — assets that cannot always be quickly converted to cash. Pre-filled with $50,000 cash, $30,000 securities, $80,000 receivables, and $100,000 in current liabilities, the quick ratio is 1.60x — indicating excellent liquidity.</p>
            <p>Financial analysts, investors, creditors, and business owners use the quick ratio to assess whether a company can meet its short-term obligations without relying on selling inventory or raising new capital. It is one of the primary financial ratios used in credit analysis and business valuation.</p>
            <h2>The Quick Ratio Formula</h2>
            <p><strong>Quick Ratio = (Cash + Marketable Securities + Accounts Receivable) / Current Liabilities</strong></p>
            <p>Equivalently: Quick Ratio = (Current Assets – Inventory – Prepaid Expenses) / Current Liabilities. For our defaults: Quick Ratio = ($50,000 + $30,000 + $80,000) / $100,000 = $160,000 / $100,000 = 1.60x. This means the company has $1.60 in liquid assets for every $1.00 of current liabilities.</p>
            <h2>Understanding Your Results</h2>
            <p>A ratio above 1.0 means the company can cover all current liabilities with liquid assets — a positive sign. The pie chart shows the composition of quick assets: how much comes from cash (most liquid), marketable securities (very liquid), and accounts receivable (liquid but dependent on customer payment timing). The coverage surplus/shortfall tells you exactly how much buffer or deficit exists. For example, a 1.60x ratio on $100,000 current liabilities means a $60,000 surplus — comfortable headroom for unexpected expenses.</p>
            <h2>Key Components of the Quick Ratio</h2>
            <p><strong>Cash and Cash Equivalents:</strong> Bank deposits, Treasury bills, money market funds — the most liquid assets. High cash holdings boost the quick ratio but may indicate inefficient capital deployment. <strong>Marketable Securities:</strong> Short-term investments easily converted to cash: Treasury notes, commercial paper, short-term bonds. <strong>Accounts Receivable:</strong> Money owed by customers. Quality depends heavily on receivable aging — 90-day-old receivables are less reliable than 30-day receivables. <strong>Current Liabilities:</strong> Obligations due within 12 months: accounts payable, short-term debt, accrued expenses, current portion of long-term debt.</p>
            <h2>Industry Benchmarks and Interpretations</h2>
            <p>Quick ratio benchmarks vary significantly by industry. Technology and software companies often maintain ratios of 2.0x+ due to minimal inventory. Retail companies (Walmart, Target) may have ratios of 0.2–0.4x — acceptable because inventory turns over rapidly. Manufacturing companies typically target 0.5–1.0x. Banking regulations require minimum liquidity ratios under Basel III. The healthcare industry averages around 1.0–1.5x. Always compare a company's quick ratio to its direct peers and historical trend rather than an absolute threshold.</p>
            <h2>Practical Examples</h2>
            <p><strong>Small Business:</strong> A restaurant has $15,000 cash, $5,000 receivables, and $40,000 in current liabilities. Quick ratio = 0.50x — concerning, as food inventory cannot be liquidated instantly. <strong>Tech Startup:</strong> $500,000 cash, $200,000 receivables, $300,000 liabilities. Quick ratio = 2.33x — excellent, typical for subscription software businesses. <strong>Manufacturer:</strong> $100,000 cash, $150,000 receivables, $200,000 securities, $350,000 liabilities. Quick ratio = 1.29x — healthy for manufacturing sector.</p>
            <h2>Quick Ratio vs Current Ratio</h2>
            <p>The current ratio = Current Assets / Current Liabilities includes inventory and prepaid expenses. It is a broader measure of liquidity but less conservative. If a company's current ratio is 2.0x but quick ratio is 0.8x, it means most of its current assets are tied up in inventory — a potential red flag if inventory is hard to liquidate quickly. See also: <a href="/calculator/current-ratio-calculator">current ratio calculator</a>, <a href="/calculator/cash-ratio-calculator">cash ratio calculator</a>, and <a href="/calculator/working-capital-calculator">working capital calculator</a>.</p>
            <h2>Benefits of Using This Calculator</h2>
            <p>The quick ratio calculation is simple but the interpretation requires context. This calculator provides instant computation with a color-coded rating system, pie chart visualization of asset composition, and surplus/shortfall analysis — making it easy to assess and communicate a company's liquidity position to investors, lenders, or management teams.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/quick-ratio-calculator" />
          <PopularCalculators exclude="/calculator/quick-ratio-calculator" />
        </div>
      </div>
    </>
  );
};

export default QuickRatioCalculator;
