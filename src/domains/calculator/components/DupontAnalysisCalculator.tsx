"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";

interface DupontInputs {
  netIncome: number;
  revenue: number;
  totalAssets: number;
  equity: number;
  ebit: number;
  pretaxIncome: number;
  proMode: boolean;
}

interface DupontResult {
  netProfitMargin: number;
  assetTurnover: number;
  equityMultiplier: number;
  roe: number;
  roa: number;
  taxBurden: number;
  interestBurden: number;
  operatingMargin: number;
  roe5: number;
  debtRatio: number;
  totalDebt: number;
  valid: boolean;
}

const DEFAULTS: DupontInputs = {
  netIncome: 2400000,
  revenue: 24000000,
  totalAssets: 16000000,
  equity: 8000000,
  ebit: 4200000,
  pretaxIncome: 3400000,
  proMode: false,
};

export function calculateDupont(i: DupontInputs): DupontResult {
  const safe = (n: number, d: number) => (d !== 0 && isFinite(n / d) ? n / d : 0);

  const netProfitMargin = safe(i.netIncome, i.revenue) * 100;
  const assetTurnover = safe(i.revenue, i.totalAssets);
  const equityMultiplier = safe(i.totalAssets, i.equity);
  const roe = (netProfitMargin / 100) * assetTurnover * equityMultiplier * 100;
  const roa = safe(i.netIncome, i.totalAssets) * 100;

  const taxBurden = safe(i.netIncome, i.pretaxIncome);
  const interestBurden = safe(i.pretaxIncome, i.ebit);
  const operatingMargin = safe(i.ebit, i.revenue);
  const roe5 = taxBurden * interestBurden * operatingMargin * assetTurnover * equityMultiplier * 100;

  const totalDebt = i.totalAssets - i.equity;
  const debtRatio = safe(totalDebt, i.totalAssets) * 100;

  return {
    netProfitMargin,
    assetTurnover,
    equityMultiplier,
    roe,
    roa,
    taxBurden,
    interestBurden,
    operatingMargin,
    roe5,
    debtRatio,
    totalDebt,
    valid: i.revenue > 0 && i.totalAssets > 0 && i.equity > 0,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const DupontAnalysisCalculator = () => {
  const [netIncome, setNetIncome] = useState(String(DEFAULTS.netIncome));
  const [revenue, setRevenue] = useState(String(DEFAULTS.revenue));
  const [totalAssets, setTotalAssets] = useState(String(DEFAULTS.totalAssets));
  const [equity, setEquity] = useState(String(DEFAULTS.equity));
  const [ebit, setEbit] = useState(String(DEFAULTS.ebit));
  const [pretaxIncome, setPretaxIncome] = useState(String(DEFAULTS.pretaxIncome));
  const [proMode, setProMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<DupontResult>(calculateDupont(DEFAULTS));
  const [calcPro, setCalcPro] = useState(false);

  const getInputs = (): DupontInputs => ({
    netIncome: parseFloat(netIncome) || 0,
    revenue: parseFloat(revenue) || 0,
    totalAssets: parseFloat(totalAssets) || 0,
    equity: parseFloat(equity) || 0,
    ebit: parseFloat(ebit) || 0,
    pretaxIncome: parseFloat(pretaxIncome) || 0,
    proMode,
  });

  useEffect(() => {
    setResults(calculateDupont(DEFAULTS));
  }, []);

  const equityNum = parseFloat(equity) || 0;
  const revenueNum = parseFloat(revenue) || 0;
  const assetsNum = parseFloat(totalAssets) || 0;
  const hasValidationErrors = equityNum <= 0 || revenueNum <= 0 || assetsNum <= 0;

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResults(calculateDupont(getInputs()));
    setCalcPro(proMode);
  };

  const reset = () => {
    setNetIncome(String(DEFAULTS.netIncome));
    setRevenue(String(DEFAULTS.revenue));
    setTotalAssets(String(DEFAULTS.totalAssets));
    setEquity(String(DEFAULTS.equity));
    setEbit(String(DEFAULTS.ebit));
    setPretaxIncome(String(DEFAULTS.pretaxIncome));
    setProMode(false);
    setCalcPro(false);
    setResults(calculateDupont(DEFAULTS));
  };

  const driverData = [
    { name: "Net Margin", value: results.netProfitMargin, unit: "%", color: "#2563EB" },
    { name: "Asset Turnover", value: results.assetTurnover, unit: "×", color: "#10B981" },
    { name: "Equity Multiplier", value: results.equityMultiplier, unit: "×", color: "#F59E0B" },
  ];

  const rating =
    results.roe >= 20
      ? { label: "Excellent", color: "text-emerald-600" }
      : results.roe >= 12
        ? { label: "Healthy", color: "text-emerald-600" }
        : results.roe >= 8
          ? { label: "Moderate", color: "text-amber-600" }
          : { label: "Weak", color: "text-red-600" };

  const leverageFlag =
    results.equityMultiplier >= 3
      ? { label: "High", color: "text-red-600" }
      : results.equityMultiplier >= 2
        ? { label: "Moderate", color: "text-amber-600" }
        : { label: "Conservative", color: "text-emerald-600" };

  const breakdown = [
    { label: "Net Profit Margin (NI ÷ Revenue)", value: `${fmt(results.netProfitMargin)}%` },
    { label: "Asset Turnover (Revenue ÷ Assets)", value: `${fmt(results.assetTurnover)}×` },
    { label: "Equity Multiplier (Assets ÷ Equity)", value: `${fmt(results.equityMultiplier)}×` },
    { label: "Return on Equity (ROE)", value: `${fmt(results.roe)}%`, highlight: true },
    { label: "Return on Assets (ROA)", value: `${fmt(results.roa)}%` },
    { label: "Total Debt (Assets − Equity)", value: `$${fmtInt(results.totalDebt)}` },
    { label: "Debt Ratio (Debt ÷ Assets)", value: `${fmt(results.debtRatio)}%` },
  ];

  const faqs = [
    { question: "What is DuPont analysis?", answer: "DuPont analysis decomposes Return on Equity into three drivers: net profit margin (profitability), asset turnover (efficiency), and the equity multiplier (leverage). Instead of a single ROE number, it shows you which of the three is actually driving — or dragging — shareholder returns." },
    { question: "What is the DuPont formula?", answer: "The 3-step DuPont formula is ROE = (Net Income ÷ Revenue) × (Revenue ÷ Total Assets) × (Total Assets ÷ Shareholder Equity). The revenue and asset terms cancel algebraically, leaving Net Income ÷ Equity, which is ROE by definition." },
    { question: "What is the difference between 3-step and 5-step DuPont?", answer: "The 5-step version splits net profit margin into three further components: tax burden (Net Income ÷ Pre-Tax Income), interest burden (Pre-Tax Income ÷ EBIT), and operating margin (EBIT ÷ Revenue). This separates operating performance from financing and tax effects. Enable Professional Mode to see the 5-step decomposition." },
    { question: "What is a good ROE?", answer: "ROE between 15% and 20% is generally considered strong for most industries. However, ROE inflated by heavy leverage is riskier than the same ROE driven by margin or efficiency — which is exactly what DuPont analysis is designed to reveal." },
    { question: "Why is a high equity multiplier a warning sign?", answer: "The equity multiplier measures leverage. A company can raise ROE simply by taking on more debt, without improving operations at all. An equity multiplier above 3 means assets are financed with substantially more debt than equity, amplifying both gains and losses." },
    { question: "Should I use average or ending balance sheet values?", answer: "Analysts commonly use average total assets and average equity — the mean of the beginning and ending balances — because income is earned across the period while balance sheet figures are point-in-time. Ending values are acceptable for quick comparisons as long as you apply the same method consistently." },
    { question: "Does DuPont analysis work across industries?", answer: "The decomposition works for any company, but the benchmarks do not transfer. Retailers typically show low margins with high asset turnover; software firms show the reverse. Compare a company against its own industry peers and its own history, never against an unrelated sector." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "DuPont Analysis Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">DuPont Analysis Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="net-income" label="Net Income ($)" value={netIncome} onChange={setNetIncome} prefix="$" tooltip="Bottom-line profit after all expenses, interest, and taxes." />
              <InputField id="revenue" label="Revenue ($)" value={revenue} onChange={setRevenue} prefix="$" tooltip="Total sales or turnover for the period." />
              <InputField id="total-assets" label="Total Assets ($)" value={totalAssets} onChange={setTotalAssets} prefix="$" tooltip="All assets on the balance sheet. Use average assets for best accuracy." />
              <InputField id="equity" label="Shareholder Equity ($)" value={equity} onChange={setEquity} prefix="$" tooltip="Total assets minus total liabilities (book value)." />
            </div>

            {hasValidationErrors && (
              <div className="text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                Revenue, Total Assets, and Shareholder Equity must all be greater than zero.
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-3 py-2.5">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Professional Mode</span>
                <span className="text-[11px] text-muted-foreground">Unlocks 5-step DuPont decomposition</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={proMode}
                onClick={() => setProMode(v => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${proMode ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all ${proMode ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {proMode && (
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Income Statement Detail</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="ebit" label="EBIT ($)" value={ebit} onChange={setEbit} prefix="$" tooltip="Earnings before interest and taxes (operating profit)." />
                      <InputField id="pretax-income" label="Pre-Tax Income ($)" value={pretaxIncome} onChange={setPretaxIncome} prefix="$" tooltip="Earnings before taxes, after interest expense." />
                    </div>
                  </div>
                )}
              </div>
            )}

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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Return on Equity</div>
              <div className="text-4xl font-extrabold text-primary mb-1 tracking-tight">{fmt(results.roe)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                Every $100 of equity generates ${fmt(results.roe)} of annual profit
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ROE Rating</span>
                <span className={`font-extrabold ${rating.color}`}>{rating.label}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Return on Assets</span>
                <span className="font-extrabold text-foreground">{fmt(results.roa)}%</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Leverage</span>
                <span className={`font-extrabold ${leverageFlag.color}`}>{leverageFlag.label}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">DuPont Component</th>
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
                    <td className="py-2.5 px-3 text-foreground">ROE (Margin × Turnover × Multiplier)</td>
                    <td className="py-2.5 px-3 text-right text-foreground">{fmt(results.roe)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">ROE Driver Comparison</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={driverData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
                    <Tooltip
                      formatter={(v: number) => [fmt(v), "Value"]}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {driverData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {driverData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[12px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-semibold text-muted-foreground">{d.name}</span>
                    <span className="font-bold text-foreground">{fmt(d.value)}{d.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PROFESSIONAL MODE: 5-STEP DECOMPOSITION */}
            {calcPro && (
              <div className="rounded-lg border border-border bg-card p-5">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">5-Step DuPont Decomposition</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground font-medium">Tax Burden (NI ÷ PBT)</span>
                    <span className="font-bold text-foreground">{fmt(results.taxBurden)}×</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground font-medium">Interest Burden (PBT ÷ EBIT)</span>
                    <span className="font-bold text-foreground">{fmt(results.interestBurden)}×</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground font-medium">Operating Margin (EBIT ÷ Rev)</span>
                    <span className="font-bold text-foreground">{fmt(results.operatingMargin * 100)}%</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground font-medium">Asset Turnover</span>
                    <span className="font-bold text-foreground">{fmt(results.assetTurnover)}×</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground font-medium">Equity Multiplier</span>
                    <span className="font-bold text-foreground">{fmt(results.equityMultiplier)}×</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground font-medium">5-Step ROE</span>
                    <span className="font-bold text-primary">{fmt(results.roe5)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Net Profit Margin</span>
                  <span className="font-bold text-foreground">{fmt(results.netProfitMargin)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Asset Turnover</span>
                  <span className="font-bold text-foreground">{fmt(results.assetTurnover)}×</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Equity Multiplier</span>
                  <span className="font-bold text-foreground">{fmt(results.equityMultiplier)}×</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Return on Equity</span>
                  <span className="font-bold text-foreground">{fmt(results.roe)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Return on Assets</span>
                  <span className="font-bold text-foreground">{fmt(results.roa)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Debt</span>
                  <span className="font-bold text-foreground">${fmtInt(results.totalDebt)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Debt Ratio</span>
                  <span className="font-bold text-foreground">{fmt(results.debtRatio)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">ROE Rating</span>
                  <span className={`font-bold ${rating.color}`}>{rating.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding DuPont Analysis</h2>
            <p>Return on Equity is one of the most widely quoted metrics in finance, and one of the most misleading when read in isolation. Two companies can report an identical 20% ROE while running completely different businesses: one earns it through pricing power and fat margins, the other through aggressive borrowing. DuPont analysis, developed at the DuPont Corporation in the 1920s, splits ROE into its underlying drivers so you can tell those two companies apart.</p>
            <h2 className="text-2xl font-bold mb-3">The Three Levers</h2>
            <p><strong>Net profit margin</strong> measures profitability — how many cents of profit survive from each dollar of revenue after every cost. <strong>Asset turnover</strong> measures efficiency — how much revenue the company generates per dollar of assets deployed. <strong>The equity multiplier</strong> measures leverage — how much of the asset base is funded by debt rather than shareholder capital. Multiply the three together and the revenue and asset terms cancel, leaving Net Income ÷ Equity, which is ROE by definition.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Decomposition Matters</h2>
            <p>The critical insight is that the three levers carry very different risk profiles. Improving margin or turnover reflects genuine operating improvement. Raising the equity multiplier raises ROE too, but it does so by adding debt, which amplifies losses just as efficiently as it amplifies gains. A company whose ROE has climbed purely because its equity multiplier expanded has not become a better business; it has become a more fragile one.</p>
            <h2 className="text-2xl font-bold mb-3">Industry Context Is Essential</h2>
            <p>Different business models produce systematically different profiles. Grocery chains and discount retailers run thin margins with very high asset turnover. Software and pharmaceutical companies show the opposite pattern: high margins, low turnover. Banks operate with equity multipliers that would be alarming in any other sector. There is no universal target for any of the three components, which is why DuPont analysis is most useful when comparing a company to its direct peers or tracking it against its own history.</p>
            <h2 className="text-2xl font-bold mb-3">The Five-Step Extension</h2>
            <p>The extended version splits net profit margin into tax burden, interest burden, and operating margin. This separates operating performance from financing and tax effects, which matters when comparing companies across jurisdictions with different tax rates, or when a firm's profitability is being reshaped by its debt load rather than its operations. Enable Professional Mode to see the full five-factor breakdown alongside the standard three.</p>
            <h2 className="text-2xl font-bold mb-3">Using Balance Sheet Averages</h2>
            <p>Net income accumulates across an entire reporting period, while total assets and equity are snapshots on a single date. Analysts commonly resolve this mismatch by using average balances — the beginning and ending figures divided by two. The difference rarely changes conclusions for stable companies, but it matters considerably for firms that raised capital, bought back stock, or made a large acquisition mid-year.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dupont-analysis-calculator" />
          <PopularCalculators exclude="/calculator/dupont-analysis-calculator" />
        </div>
      </div>
    </>
  );
};

export default DupontAnalysisCalculator;
