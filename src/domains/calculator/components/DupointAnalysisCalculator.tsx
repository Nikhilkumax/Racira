"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface DuPontResult {
  roe: number; netProfitMargin: number; assetTurnover: number; equityMultiplier: number;
  roa: number; netIncome: number; revenue: number; totalAssets: number; equity: number;
}
const DEFAULTS = { netIncome:"4800000", revenue:"42000000", totalAssets:"35000000", totalEquity:"18000000" };

function calculate(d: typeof DEFAULTS): DuPontResult {
  const netIncome = parseFloat(d.netIncome)||0;
  const revenue = parseFloat(d.revenue)||1;
  const totalAssets = parseFloat(d.totalAssets)||1;
  const equity = parseFloat(d.totalEquity)||1;
  const netProfitMargin = netIncome / revenue;
  const assetTurnover = revenue / totalAssets;
  const equityMultiplier = totalAssets / equity;
  const roe = netProfitMargin * assetTurnover * equityMultiplier;
  const roa = netProfitMargin * assetTurnover;
  return { roe, netProfitMargin, assetTurnover, equityMultiplier, roa, netIncome, revenue, totalAssets, equity };
}

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
const x = (n: number) => `${n.toFixed(2)}×`;
const fmtM = (n: number) => Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;

export default function DupointAnalysisCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<DuPontResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const handleCalc = () => setR(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const barData = [
    { name: "Net Profit Margin", value: +(r.netProfitMargin * 100).toFixed(2), fill: "hsl(var(--primary))" },
    { name: "Asset Turnover", value: +r.assetTurnover.toFixed(2), fill: "#10b981" },
    { name: "Equity Multiplier", value: +r.equityMultiplier.toFixed(2), fill: "#f59e0b" },
  ];

  const faqs = [
    { question: "What is DuPont Analysis?", answer: "DuPont Analysis is a framework that decomposes Return on Equity (ROE) into three components: Net Profit Margin (profitability), Asset Turnover (efficiency), and Equity Multiplier (leverage). It reveals the source of a company's ROE." },
    { question: "What is the DuPont formula?", answer: "ROE = Net Profit Margin × Asset Turnover × Equity Multiplier. Equivalently: ROE = (Net Income/Revenue) × (Revenue/Total Assets) × (Total Assets/Equity). This 3-factor decomposition is the standard DuPont model." },
    { question: "What is a good ROE?", answer: "ROE above 15% is generally considered good. Warren Buffett looks for consistent ROE above 15–20% without excessive leverage. ROE driven by high margins and turnover is more sustainable than ROE driven purely by financial leverage." },
    { question: "How does leverage affect DuPont ROE?", answer: "A higher equity multiplier (more debt relative to equity) mechanically boosts ROE but increases financial risk. Two companies with identical ROE may have very different risk profiles — one earning it through efficient operations, the other through heavy borrowing." },
    { question: "What is the 5-factor DuPont model?", answer: "The extended 5-factor model further splits profit margin into EBIT margin and tax burden, and splits the equity multiplier into an interest burden component. This reveals whether ROE is driven by operating efficiency, financing costs, or tax effects." },
    { question: "How do I improve ROE?", answer: "Improve net profit margin (pricing power, cost control), increase asset turnover (more revenue per dollar of assets — capital efficiency), or raise financial leverage (more debt). The healthiest path is margin and turnover improvement, not leverage." },
    { question: "What does Return on Assets (ROA) tell me?", answer: "ROA = Net Profit Margin × Asset Turnover = Net Income / Total Assets. It measures how efficiently a company generates profit from its total asset base, independent of financing structure. ROA removes the effect of leverage, making it better for cross-company comparison." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "DuPont Analysis Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">DuPont Analysis Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            {([
              { label: "Net Income", key: "netIncome", tip: "Bottom-line profit from income statement" },
              { label: "Total Revenue", key: "revenue", tip: "Annual net sales / revenue" },
              { label: "Total Assets", key: "totalAssets", tip: "From balance sheet — end of period" },
              { label: "Total Shareholders' Equity", key: "totalEquity", tip: "Total assets minus total liabilities" },
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
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Return on Equity (ROE)</div>
              <div className="text-5xl font-extrabold text-foreground">{pct(r.roe)}</div>
              <div className="text-sm text-muted-foreground mt-1">ROA: {pct(r.roa)} · Equity Multiplier: {x(r.equityMultiplier)}</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Net Profit Margin</div><div className="font-bold text-lg">{pct(r.netProfitMargin)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Asset Turnover</div><div className="font-bold text-lg">{x(r.assetTurnover)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Equity Multiplier</div><div className="font-bold text-lg">{x(r.equityMultiplier)}</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">DuPont Components</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={45}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RTooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm text-foreground">3-Factor DuPont Breakdown</h3></div>
              {[
                { label: "Net Income", val: fmtM(r.netIncome) },
                { label: "Total Revenue", val: fmtM(r.revenue) },
                { label: "Total Assets", val: fmtM(r.totalAssets) },
                { label: "Shareholders' Equity", val: fmtM(r.equity) },
                { label: "Net Profit Margin (÷)", val: pct(r.netProfitMargin), bold: true },
                { label: "Asset Turnover (×)", val: x(r.assetTurnover), bold: true },
                { label: "Equity Multiplier (×)", val: x(r.equityMultiplier), bold: true },
                { label: "Return on Assets (ROA)", val: pct(r.roa), bold: true },
                { label: "Return on Equity (ROE)", val: pct(r.roe), bold: true, highlight: true },
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
            <h2 className="text-2xl font-bold mb-3">What Is DuPont Analysis?</h2>
            <p>DuPont Analysis is a fundamental equity research framework that decomposes Return on Equity (ROE) into three operational and financial components: profitability, asset efficiency, and financial leverage. Developed by the DuPont Corporation in the 1920s, it remains one of the most powerful diagnostic tools in financial statement analysis, revealing not just how much return a company earns for shareholders, but precisely why that return exists and whether it is sustainable.</p>
            <h2 className="text-2xl font-bold mb-3">The 3-Factor DuPont Formula</h2>
            <p><strong>ROE = Net Profit Margin × Asset Turnover × Equity Multiplier</strong></p>
            <p>Expanding each: ROE = (Net Income ÷ Revenue) × (Revenue ÷ Total Assets) × (Total Assets ÷ Equity). Note that Revenue and Total Assets cancel algebraically to give Net Income ÷ Equity — the simple ROE formula. The power of DuPont is that it preserves these components for diagnostic insight before cancellation.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting Each Component</h2>
            <p><strong>Net Profit Margin:</strong> How much of each revenue dollar becomes profit. High margins indicate pricing power, efficient cost management, or favorable industry economics. Software companies often have 20–30% margins; grocery retailers operate at 1–3%. <strong>Asset Turnover:</strong> How many revenue dollars are generated per dollar of assets. Asset-heavy industries (steel, utilities) have low turnover; service businesses have high turnover. <strong>Equity Multiplier:</strong> Total Assets ÷ Equity — a measure of financial leverage. A multiplier of 2.0 means $2 of assets for every $1 of equity, implying $1 of debt financing.</p>
            <h2 className="text-2xl font-bold mb-3">ROE Quality Analysis</h2>
            <p>Two companies with identical ROE may have dramatically different quality. Company A: 20% ROE = 10% margin × 2.0× turnover × 1.0× multiplier (no leverage — earned entirely through operations). Company B: 20% ROE = 5% margin × 2.0× turnover × 2.0× multiplier (half the operational efficiency, doubled with leverage). Company A&apos;s ROE is more sustainable and less risky. DuPont analysis makes this distinction explicit.</p>
            <h2 className="text-2xl font-bold mb-3">Industry Benchmarks</h2>
            <p>Technology (software): High margin (20–30%), moderate turnover (0.6–1.0×), low leverage. Retail: Low margin (1–5%), high turnover (2–4×), moderate leverage. Banking: Very thin operating margin, very low turnover, very high leverage (10–15×). Manufacturing: Moderate margin (5–15%), moderate turnover (0.8–1.5×), moderate leverage. Always compare DuPont components to industry peers rather than universal benchmarks.</p>
            <h2 className="text-2xl font-bold mb-3">Using DuPont for Investment Decisions</h2>
            <p>Improving ROE via margin expansion (better pricing, cost cuts) is the highest quality improvement signal. Improving ROE via turnover (more efficient asset use, faster inventory) is healthy. Improving ROE via leverage increases financial risk and may mask operational deterioration. Investors should reward margin and turnover-driven ROE expansion and scrutinize leverage-driven ROE improvements carefully, especially in rising interest rate environments.</p>
            <h2 className="text-2xl font-bold mb-3">The Extended 5-Factor DuPont Model</h2>
            <p>The 5-factor model further decomposes margin into: Tax Burden (Net Income ÷ Pre-Tax Income) × Interest Burden (Pre-Tax Income ÷ EBIT) × EBIT Margin (EBIT ÷ Revenue) × Asset Turnover × Equity Multiplier. This granular breakdown isolates the effects of taxes, interest expense, and operating efficiency separately — useful for analyzing how changes in tax policy or debt structure impact ROE.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dupont-analysis-calculator" />
          <PopularCalculators exclude="/calculator/dupont-analysis-calculator" />
        </div>
      </div>
    </>
  );
}
