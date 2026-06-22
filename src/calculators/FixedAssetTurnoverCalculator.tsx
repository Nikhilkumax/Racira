"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface FATResult { fat: number; netRevenue: number; netFixedAssets: number; daysPerCycle: number; rating: string; ratingColor: string; }
const DEFAULTS = { revenue: "22000000", beginPPE: "8400000", endPPE: "9200000", accumulatedDepreciation: "2800000" };

function calculate(d: typeof DEFAULTS): FATResult {
  const revenue = parseFloat(d.revenue) || 0;
  const beginPPE = parseFloat(d.beginPPE) || 0;
  const endPPE = parseFloat(d.endPPE) || 0;
  const accDep = parseFloat(d.accumulatedDepreciation) || 0;
  const avgGrossPPE = (beginPPE + endPPE) / 2;
  const avgNetPPE = avgGrossPPE - accDep;
  const fat = avgNetPPE > 0 ? revenue / avgNetPPE : 0;
  const daysPerCycle = fat > 0 ? 365 / fat : 0;
  let rating = "", ratingColor = "";
  if (fat >= 4) { rating = "Highly Efficient"; ratingColor = "text-emerald-600"; }
  else if (fat >= 2) { rating = "Good Efficiency"; ratingColor = "text-primary"; }
  else if (fat >= 1) { rating = "Moderate — Assets Underused"; ratingColor = "text-amber-600"; }
  else { rating = "Poor — Heavy Asset Base"; ratingColor = "text-red-600"; }
  return { fat, netRevenue: revenue, netFixedAssets: avgNetPPE, daysPerCycle, rating, ratingColor };
}

const fmtM = (n: number) => Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default function FixedAssetTurnoverCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<FATResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const handleCalc = () => setR(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const barData = [
    { name: "Your FAT", value: +r.fat.toFixed(2), fill: "hsl(var(--primary))" },
    { name: "Manufacturing Avg", value: 2.5, fill: "#94a3b8" },
    { name: "Retail Avg", value: 5, fill: "#10b981" },
  ];

  const faqs = [
    { question: "What is the Fixed Asset Turnover ratio?", answer: "Fixed Asset Turnover (FAT) = Net Revenue ÷ Average Net Fixed Assets (PP&E). It measures how efficiently a company generates revenue from its fixed assets — property, plant, and equipment. Higher FAT means more revenue generated per dollar of long-term capital invested in physical infrastructure." },
    { question: "What is a good fixed asset turnover ratio?", answer: "It varies significantly by industry. Asset-light service firms: 5–20×. Retail: 3–8×. Manufacturing: 1.5–3×. Utilities: 0.3–0.6×. Capital-intensive industries inherently have lower FAT. Always compare to industry peers." },
    { question: "Why use average net fixed assets?", answer: "Averaging beginning and ending PP&E smooths out the impact of large capital expenditures made partway through the year. Net PP&E (after accumulated depreciation) better reflects the current economic value of fixed assets than gross PP&E." },
    { question: "How does FAT relate to capital intensity?", answer: "Low FAT indicates high capital intensity — the business requires large fixed asset investments to generate each dollar of revenue. High FAT indicates capital efficiency. Asset-light business models (SaaS, consulting, financial services) have very high FAT because they generate revenue without significant physical infrastructure." },
    { question: "What are the limitations of FAT?", answer: "FAT can be inflated by old, fully-depreciated assets that still generate revenue (net book value near zero makes denominator small). Different depreciation methods across companies affect comparability. Companies that lease rather than own fixed assets will have higher FAT since lease assets may be off-balance-sheet (pre-IFRS 16/ASC 842)." },
    { question: "How can a company improve FAT?", answer: "Increase revenue through better capacity utilization, new products, or market expansion. Divest underutilized assets or lease them to others. Outsource capital-intensive functions (contract manufacturing, third-party logistics). Adopt asset-light operating models using technology to replace physical infrastructure." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Fixed Asset Turnover Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fixed Asset Turnover Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              { label: "Annual Net Revenue", key: "revenue", tip: "Total annual sales from income statement" },
              { label: "Beginning PP&E (Gross)", key: "beginPPE", tip: "Property, Plant & Equipment at start of year" },
              { label: "Ending PP&E (Gross)", key: "endPPE", tip: "Property, Plant & Equipment at end of year" },
              { label: "Accumulated Depreciation", key: "accumulatedDepreciation", tip: "Total depreciation on ending PP&E balance" },
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
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className={`rounded-xl p-5 border-l-4 ${r.fat >= 2 ? "bg-primary/10 border-primary" : "bg-amber-500/10 border-amber-500"}`}>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Fixed Asset Turnover</div>
              <div className={`text-5xl font-extrabold ${r.ratingColor}`}>{r.fat.toFixed(2)}<span className="text-2xl">×</span></div>
              <div className={`text-sm font-semibold mt-1 ${r.ratingColor}`}>{r.rating}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Net Revenue</div><div className="font-bold text-lg">{fmtM(r.netRevenue)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Avg Net PPE</div><div className="font-bold text-lg">{fmtM(r.netFixedAssets)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Days / Cycle</div><div className="font-bold text-lg">{r.daysPerCycle.toFixed(0)} d</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">FAT vs. Industry Benchmarks</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={45}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `${v}×`} tick={{ fontSize: 11 }} />
                    <RTooltip formatter={(v: number) => [`${v}×`, ""]} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
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
                { label: "Annual Revenue", val: fmtM(parseFloat(f.revenue) || 0) },
                { label: "Avg Gross PP&E", val: fmtM(((parseFloat(f.beginPPE) || 0) + (parseFloat(f.endPPE) || 0)) / 2) },
                { label: "Accumulated Depreciation", val: fmtM(parseFloat(f.accumulatedDepreciation) || 0) },
                { label: "Avg Net PP&E", val: fmtM(r.netFixedAssets), bold: true },
                { label: "Fixed Asset Turnover", val: `${r.fat.toFixed(3)}×`, bold: true, highlight: true },
                { label: "Days to Turn Over Assets", val: `${r.daysPerCycle.toFixed(1)} days` },
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
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Fixed Asset Turnover Ratio?</h2>
            <p>The Fixed Asset Turnover (FAT) ratio measures how efficiently a company generates revenue from its long-term tangible assets — Property, Plant &amp; Equipment (PP&amp;E). It is a key operational efficiency metric in capital-intensive industries and a critical component of DuPont Analysis decomposition, where it feeds into the broader Asset Turnover ratio.</p>
            <h2>Fixed Asset Turnover Formula</h2>
            <p><strong>FAT = Net Revenue ÷ Average Net PP&amp;E</strong></p>
            <p>Average Net PP&amp;E = (Beginning Net PP&amp;E + Ending Net PP&amp;E) ÷ 2. Using the average smooths for mid-year capital expenditures. Net PP&amp;E = Gross PP&amp;E − Accumulated Depreciation. Using net book value reflects the remaining economic value after depreciation of the asset base.</p>
            <h2>Why FAT Varies Dramatically by Industry</h2>
            <p>Service businesses (consulting, software, financial services) require minimal physical infrastructure to generate revenue — making their FAT extremely high (10×+). Manufacturers, utilities, and heavy industrials require massive fixed asset investments per dollar of revenue — FAT of 0.5–2.5× is normal. This is why FAT is only meaningful when compared within an industry cohort, not across diverse sectors.</p>
            <h2>FAT and Capital Expenditure Strategy</h2>
            <p>Companies can maintain or improve FAT while growing revenue by keeping capex disciplined relative to revenue growth. A declining FAT over time may signal over-investment in capacity (relative to demand), aging assets being replaced with expensive new ones, or revenue declining faster than the asset base can be rationalized. Rising FAT signals improving operational leverage — revenue growing faster than the fixed asset base, a hallmark of scaling businesses.</p>
            <h2>FAT and Depreciation Effects</h2>
            <p>As assets age, their net book value declines (accumulated depreciation increases), which mechanically increases FAT even without revenue growth or operational improvement. Companies with older, more fully-depreciated assets will appear more FAT-efficient than those with newly upgraded infrastructure. Analysts using FAT should also track gross PP&amp;E turnover (Revenue ÷ Gross PP&amp;E) as a complement to remove this depreciation distortion.</p>
            <h2>FAT in the Context of DuPont Analysis</h2>
            <p>In DuPont Analysis, Asset Turnover = Revenue ÷ Total Assets. FAT isolates the fixed asset component, while Working Capital Turnover captures the current asset efficiency. Together they explain the Total Asset Turnover and ultimately contribute to explaining Return on Equity through the multiplier effect of efficient asset utilization on ROE. Improving FAT improves Asset Turnover, which improves ROA and ROE without requiring higher margins or greater leverage.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fixed-asset-turnover-calculator" />
          <PopularCalculators exclude="/calculator/fixed-asset-turnover-calculator" />
        </div>
      </div>
    </>
  );
}
