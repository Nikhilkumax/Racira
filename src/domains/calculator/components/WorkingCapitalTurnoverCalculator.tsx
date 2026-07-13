"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

interface WCTResult { wct: number; revenue: number; workingCapital: number; rating: string; ratingColor: string; }
const DEFAULTS = { revenue: "18500000", currentAssets: "4200000", currentLiabilities: "1800000" };

function calculate(d: typeof DEFAULTS): WCTResult {
  const revenue = parseFloat(d.revenue) || 0;
  const ca = parseFloat(d.currentAssets) || 0;
  const cl = parseFloat(d.currentLiabilities) || 0;
  const wc = ca - cl;
  const wct = wc !== 0 ? revenue / wc : 0;
  let rating = "", ratingColor = "";
  if (wct < 0) { rating = "Negative WC — Supplier-Funded"; ratingColor = "text-purple-600"; }
  else if (wct > 10) { rating = "Highly Efficient"; ratingColor = "text-emerald-600"; }
  else if (wct > 5) { rating = "Good"; ratingColor = "text-primary"; }
  else if (wct > 2) { rating = "Adequate"; ratingColor = "text-amber-600"; }
  else { rating = "Low — Excess Working Capital"; ratingColor = "text-red-600"; }
  return { wct, revenue, workingCapital: wc, rating, ratingColor };
}

const fmtM = (n: number) => { const s = n < 0 ? "-" : ""; const a = Math.abs(n); return a >= 1e6 ? `${s}$${(a / 1e6).toFixed(2)}M` : `${s}$${a.toLocaleString("en-US", { maximumFractionDigits: 0 })}`; };

export default function WorkingCapitalTurnoverCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<WCTResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const handleCalc = () => setR(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const barData = [
    { name: "Your WCT", value: +Math.abs(r.wct).toFixed(2), fill: "hsl(var(--primary))" },
    { name: "Industry Avg", value: 5, fill: "#94a3b8" },
    { name: "Best-in-Class", value: 10, fill: "#10b981" },
  ];

  const faqs = [
    { question: "What is working capital turnover?", answer: "Working Capital Turnover = Revenue ÷ Working Capital. It measures how efficiently a company uses its working capital to generate revenue. Higher turnover means the company generates more revenue per dollar of net current assets." },
    { question: "What is a good working capital turnover ratio?", answer: "It depends heavily on industry. Retail: 8–15× (fast inventory turnover, negative working capital models). Manufacturing: 3–6×. Services: 6–10×. A ratio below 2× may indicate excess idle working capital. Negative ratios occur when current liabilities exceed current assets." },
    { question: "What does a negative working capital turnover mean?", answer: "A negative ratio means the company has negative working capital (current liabilities > current assets). This is common in retail (Amazon, Walmart) where suppliers fund operations — actually a sign of strong negotiating power, not financial distress." },
    { question: "How can I improve working capital turnover?", answer: "Increase revenue without proportional increases in current assets. Reduce excess inventory (improve DIO). Collect receivables faster (reduce DSO). Extend payable terms (increase DPO). Repatriate excess cash to shareholders or invest in growth rather than holding idle current assets." },
    { question: "What is the relationship between WCT and CCC?", answer: "Both measure working capital efficiency from different angles. CCC (DIO + DSO − DPO) measures time. WCT measures revenue generated per dollar of net current assets. A company can have a good CCC but poor WCT if revenue is low relative to its asset base, or vice versa." },
    { question: "How does WCT relate to the current ratio?", answer: "High WCT often accompanies low current ratios (lean working capital management). Low WCT often accompanies high current ratios (more conservative, less efficient balance sheet management). There is an inherent tension — optimize for both together." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Working Capital Turnover Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Working Capital Turnover Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              { label: "Annual Revenue", key: "revenue", tip: "Total annual net sales" },
              { label: "Total Current Assets", key: "currentAssets", tip: "Cash, AR, inventory, prepaid expenses" },
              { label: "Total Current Liabilities", key: "currentLiabilities", tip: "AP, accrued liabilities, short-term debt" },
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
            <div className={`rounded-xl p-5 border-l-4 ${r.wct > 2 || r.wct < 0 ? "bg-primary/10 border-primary" : "bg-amber-500/10 border-amber-500"}`}>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Working Capital Turnover</div>
              <div className={`text-5xl font-extrabold ${r.ratingColor}`}>{r.wct.toFixed(2)}<span className="text-2xl">×</span></div>
              <div className={`text-sm font-semibold mt-1 ${r.ratingColor}`}>{r.rating}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Revenue</div><div className="font-bold text-lg">{fmtM(r.revenue)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Working Capital</div><div className={`font-bold text-lg ${r.workingCapital >= 0 ? "" : "text-red-600"}`}>{fmtM(r.workingCapital)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Rev / Day</div><div className="font-bold text-lg">{fmtM(r.revenue / 365)}</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">WCT vs. Benchmarks</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={45}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `${v}×`} tick={{ fontSize: 11 }} />
                    <RTooltip formatter={(v: number) => [`${v}×`, ""]} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">Calculation Detail</h3></div>
              {[
                { label: "Annual Revenue", val: fmtM(parseFloat(f.revenue) || 0) },
                { label: "Current Assets", val: fmtM(parseFloat(f.currentAssets) || 0) },
                { label: "Current Liabilities", val: fmtM(parseFloat(f.currentLiabilities) || 0) },
                { label: "Working Capital (CA − CL)", val: fmtM(r.workingCapital), bold: true },
                { label: "Working Capital Turnover", val: `${r.wct.toFixed(3)}×`, bold: true, highlight: true },
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Working Capital Turnover?</h2>
            <p>Working Capital Turnover (WCT) measures how efficiently a company uses its net current assets (working capital) to generate revenue. A higher ratio indicates more revenue generated per dollar of working capital deployed — a hallmark of capital-efficient businesses. Formula: WCT = Net Revenue ÷ (Current Assets − Current Liabilities).</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting High vs. Low WCT</h2>
            <p>High WCT (&gt;8×): The company generates substantial revenue from minimal net current assets — typically seen in retailers, service businesses, and fast-moving consumer goods companies. These businesses benefit from high inventory velocity and strong supplier payment terms. Low WCT (&lt;2×): The company maintains relatively large working capital for its revenue level — may indicate inventory build-up, slow collections, excess cash, or seasonal preparedness. Negative WCT: Current liabilities exceed current assets — common in large retailers with superior supplier leverage (e.g., Amazon ~−5× WCT).</p>
            <h2 className="text-2xl font-bold mb-3">WCT and Business Models</h2>
            <p>Asset-light services companies (consulting, SaaS) often have high WCT because they require minimal current assets to generate revenue. Capital-intensive manufacturers with large raw material inventories and slow-collecting B2B receivables have lower WCT. Retailers can achieve negative working capital through aggressive payables management — collecting cash from customers before paying suppliers, which effectively provides free financing for their operations.</p>
            <h2 className="text-2xl font-bold mb-3">Relationship with Other Efficiency Metrics</h2>
            <p>WCT is one component of broader efficiency analysis. Asset Turnover (Revenue ÷ Total Assets) is the broader measure including fixed assets. WCT specifically isolates the current asset portion. Together with DIO, DSO, and DPO (the cash conversion cycle components), WCT gives a complete picture of short-term capital efficiency. A company can have a good cash conversion cycle but still have low WCT if it maintains excessive liquid cash reserves.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Working Capital Turnover</h2>
            <p>Reduce excess current assets: repatriate surplus cash via dividends or buybacks rather than holding idle balances. Optimize inventory: implement demand forecasting and JIT practices to reduce DIO. Accelerate collections: tighten credit terms and improve AR processes to reduce DSO. Extend payables: negotiate longer supplier payment terms to increase DPO. Revenue growth without proportional working capital growth directly improves WCT through the leverage effect of fixed working capital infrastructure.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/working-capital-turnover-calculator" />
          <PopularCalculators exclude="/calculator/working-capital-turnover-calculator" />
        </div>
      </div>
    </>
  );
}
