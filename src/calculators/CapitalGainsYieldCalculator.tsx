"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const DEFAULTS = { buyPrice: "150", sellPrice: "185", dividends: "4.50" };

interface CGYResult {
  capitalGainsYield: number;
  dividendYield: number;
  totalReturn: number;
  capitalGain: number;
  annualizedReturn: number;
  chartData: { name: string; value: number; fill: string }[];
}

function calculate(v: typeof DEFAULTS): CGYResult {
  const p0 = parseFloat(v.buyPrice) || 0;
  const p1 = parseFloat(v.sellPrice) || 0;
  const div = parseFloat(v.dividends) || 0;

  if (p0 <= 0) return { capitalGainsYield: 0, dividendYield: 0, totalReturn: 0, capitalGain: 0, annualizedReturn: 0, chartData: [] };

  // CGY = (P1 - P0) / P0
  const capitalGainsYield = (p1 - p0) / p0;
  // Dividend Yield = Dividends / P0
  const dividendYield = div / p0;
  // Total Return = CGY + Dividend Yield
  const totalReturn = capitalGainsYield + dividendYield;
  const capitalGain = p1 - p0;

  // Approximate annualized (assumes 1-year holding period in base, else same)
  const annualizedReturn = totalReturn;

  const chartData = [
    { name: "Capital Gains Yield", value: parseFloat((capitalGainsYield * 100).toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Dividend Yield", value: parseFloat((dividendYield * 100).toFixed(2)), fill: "#10b981" },
    { name: "Total Return", value: parseFloat((totalReturn * 100).toFixed(2)), fill: "#f59e0b" },
  ];

  return { capitalGainsYield, dividendYield, totalReturn, capitalGain, annualizedReturn, chartData };
}

const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;
const fmtCurrency = (n: number) => `$${Math.abs(n).toFixed(2)}`;

export default function CapitalGainsYieldCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<CGYResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));
  useEffect(() => { setMounted(true); runCalc(); }, []);
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const faqs = [
    { question: "What is Capital Gains Yield (CGY)?", answer: "Capital Gains Yield (CGY) measures the percentage price appreciation of an investment from its purchase price to its sale price. CGY = (Selling Price − Purchase Price) ÷ Purchase Price × 100. It represents only the price return component of total return — the income (dividend or interest) component is excluded." },
    { question: "How do I calculate total return on a stock?", answer: "Total Return = Capital Gains Yield + Dividend Yield = [(P1 − P0) + Dividends] ÷ P0 × 100. For a stock bought at $150, sold at $185, with $4.50 in dividends received: CGY = (185−150)/150 = 23.33%. Dividend Yield = 4.50/150 = 3%. Total Return = 26.33%." },
    { question: "What is the difference between capital gain and capital gains yield?", answer: "Capital gain is the absolute dollar profit: Selling Price − Purchase Price = $185 − $150 = $35. Capital Gains Yield is the percentage return: $35 ÷ $150 = 23.33%. Capital gains yield normalizes the gain relative to the investment size, making it comparable across different investment amounts." },
    { question: "How are capital gains taxed?", answer: "In the US, capital gains tax depends on holding period. Short-term capital gains (held ≤1 year) are taxed as ordinary income (10–37%). Long-term capital gains (held >1 year) are taxed at preferential rates: 0% for income up to $47,025, 15% for $47,025–$518,900, and 20% above that (2024 rates for single filers). This creates a strong incentive to hold investments for more than one year." },
    { question: "What's a typical capital gains yield for stocks?", answer: "The S&P 500 has historically delivered price returns (CGY) of approximately 7–8% per year, plus 1.5–2% dividend yield, for total returns around 9.5–10%. Growth stocks may have higher CGY (20%+) but minimal dividends. Value/dividend stocks may have lower CGY (3–5%) but higher dividend yields (3–5%), producing comparable total returns with different risk profiles." },
    { question: "What is unrealized vs realized capital gain?", answer: "Unrealized capital gain exists on paper while you still hold the investment — you haven't sold yet so no tax is owed. Realized capital gain occurs when you sell — triggering a taxable event. Tax-loss harvesting is the strategy of realizing losses to offset realized gains, reducing your net taxable capital gains for the year." },
    { question: "Does dividend yield affect capital gains yield?", answer: "Generally, higher dividend-paying companies reinvest less capital internally, which can slow price appreciation. There's often a tradeoff between CGY and dividend yield within the same company. However, total return (CGY + dividend yield) is what matters for investors — some prefer dividend income (for cash flow) while others prefer pure price appreciation (for tax efficiency, as unrealized gains are not taxed)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Capital Gains Yield Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Capital Gains Yield Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Purchase Price ($)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={vals.buyPrice} onChange={set("buyPrice")} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" step="0.01" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Selling Price ($)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={vals.sellPrice} onChange={set("sellPrice")} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" step="0.01" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Dividends Received ($)</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={vals.dividends} onChange={set("dividends")} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" step="0.01" />
              </div>
            </div>
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => runCalc()} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Return</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtPct(result.totalReturn)}</div>
                  <div className="text-sm text-muted-foreground font-medium">Capital Gains Yield: {fmtPct(result.capitalGainsYield)} · Dividend Yield: {fmtPct(result.dividendYield)}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Metric</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Capital Gains Yield (CGY)", value: fmtPct(result.capitalGainsYield) },
                        { label: "Dividend Yield", value: fmtPct(result.dividendYield) },
                        { label: "Total Return", value: fmtPct(result.totalReturn) },
                        { label: "Absolute Capital Gain", value: `${result.capitalGain >= 0 ? "+" : "-"}${fmtCurrency(result.capitalGain)}` },
                        { label: "Purchase Price", value: `$${parseFloat(vals.buyPrice).toFixed(2)}` },
                        { label: "Selling Price", value: `$${parseFloat(vals.sellPrice).toFixed(2)}` },
                        { label: "Dividends Received", value: `$${parseFloat(vals.dividends).toFixed(2)}`, bold: true },
                      ].map((r) => (
                        <tr key={r.label} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right ${r.bold ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Return Components</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={result.chartData} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v: any) => [`${v}%`, "Return"]} />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {result.chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Return Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "CGY", value: fmtPct(result.capitalGainsYield) },
                      { label: "Dividend Yield", value: fmtPct(result.dividendYield) },
                      { label: "Total Return", value: fmtPct(result.totalReturn) },
                      { label: "Capital Gain ($)", value: `${result.capitalGain >= 0 ? "+" : "-"}$${Math.abs(result.capitalGain).toFixed(2)}` },
                      { label: "Buy Price", value: `$${parseFloat(vals.buyPrice).toFixed(2)}` },
                      { label: "Performance", value: result.totalReturn >= 0.15 ? "Excellent" : result.totalReturn >= 0.08 ? "Good" : result.totalReturn >= 0 ? "Positive" : "Loss", bold: true },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                        <span className={`text-base font-bold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Capital Gains Yield?</h2>
            <p>Capital Gains Yield (CGY) is a key return metric for any investment that appreciates in price — stocks, real estate, bonds, or alternative assets. It measures the percentage price increase from your purchase price to your selling price, isolating the price appreciation component of your total investment return. For investors focused on growth rather than income, CGY is the primary performance metric.</p>
            <p>Our calculator uses a realistic example: a stock purchased at $150, sold at $185, with $4.50 in dividends received during the holding period. This produces a Capital Gains Yield of 23.33%, a Dividend Yield of 3.00%, and a Total Return of 26.33% — a strong performance representing approximately 2.5× the typical annual stock market return.</p>

            <h2>The Capital Gains Yield Formula</h2>
            <p><strong>Capital Gains Yield = (Selling Price − Purchase Price) ÷ Purchase Price × 100</strong></p>
            <p>For our example: CGY = ($185 − $150) ÷ $150 × 100 = $35 ÷ $150 × 100 = 23.33%. The absolute capital gain is simply the dollar difference: $185 − $150 = $35 per share. If you held 100 shares, your capital gain is $3,500. CGY is scale-independent — it tells you the return percentage regardless of position size, making it useful for comparing different investments regardless of their price levels.</p>

            <h2>Total Return: Combining CGY and Dividend Yield</h2>
            <p><strong>Total Return = Capital Gains Yield + Dividend Yield</strong></p>
            <p><strong>Total Return = [(P1 − P0) + Dividends] ÷ P0</strong></p>
            <p>Total return is the complete measure of investment performance, combining both price appreciation and any income received. For our stock: Total Return = ($35 + $4.50) ÷ $150 = $39.50 ÷ $150 = 26.33%. This is the number to use when comparing across different investment types — a real estate investment with 8% CGY and 4% rental yield produces a 12% total return, identical to a stock with 12% CGY and no dividend.</p>

            <h2>Capital Gains Tax: How It Works</h2>
            <p>The US tax treatment of capital gains creates powerful incentives. Short-term capital gains (assets held one year or less) are taxed as ordinary income at your marginal rate — potentially 22–37% for middle and high earners. Long-term capital gains (assets held more than one year) are taxed at special rates: 0% for taxable income below $47,025 (single filer, 2024), 15% for most middle-income earners, and 20% for high earners above $518,900. The difference between short-term and long-term rates can be dramatic: a $35,000 capital gain taxed at 35% (short-term) vs. 15% (long-term) saves $7,000 in tax — just by waiting 12 months. For most investors, maximizing after-tax total return by managing the mix of long-term vs. short-term gains is one of the most impactful tax strategies available.</p>

            <h2>CGY Across Different Asset Classes</h2>
            <p>Different asset classes have historically delivered very different capital gains yields. US Equities (S&P 500): approximately 7–8% CGY annually, plus 1.5–2% dividend yield. Growth stocks (FAANG, etc.): 15–30%+ CGY in strong years, minimal dividends. Value stocks: 5–10% CGY with 3–5% dividend yields. Real estate: 3–5% annual price appreciation (national average) plus 4–8% rental yield. Bonds: minimal CGY in stable rate environments; CGY is negative when interest rates rise. Gold: 0% cash yield but 3–4% long-run price appreciation. Cryptocurrency: highly volatile CGY with no income yield. For most long-term wealth builders, diversified equity exposure through index funds delivers the most consistent positive CGY over 10+ year periods.</p>

            <h2>Unrealized vs. Realized Capital Gains</h2>
            <p>An unrealized capital gain exists when your investment has appreciated in value but you haven't sold it yet. You "own" the gain on paper but owe no taxes until you sell. Unrealized gains can be deferred indefinitely — this is one of the most powerful features of equity investing. Warren Buffett's Berkshire Hathaway holds tens of billions in unrealized gains on positions like Coca-Cola and Apple, deferring taxes for decades. A realized capital gain occurs at the moment of sale, triggering a taxable event. Tax-loss harvesting — deliberately selling losing positions to realize losses that offset realized gains — is a powerful year-end strategy to reduce your tax liability on capital gains while maintaining similar market exposure.</p>

            <h2>Step-Up in Cost Basis</h2>
            <p>One of the most significant estate planning advantages of long-term investing is the step-up in cost basis at death. When an investor dies, their heirs receive the inherited assets with a cost basis stepped up to the fair market value at the date of death. All unrealized capital gains accumulated during the decedent's lifetime are permanently wiped out for tax purposes. This makes holding appreciated assets until death a powerful estate planning strategy — the "buy, hold, and die" strategy eliminates capital gains tax on a lifetime of investment appreciation for heirs who receive the stepped-up basis.</p>

            <h2>Price-to-Earnings and CGY Expectations</h2>
            <p>Expected capital gains yield and current valuations are inversely related. The Shiller P/E (CAPE) ratio provides a valuation context: when CAPE is high (above 30), historical evidence suggests future 10-year CGY will be below average (perhaps 3–5%). When CAPE is low (below 15), future CGY tends to be stronger (8–12%). Current CAPE (2024) at approximately 35 suggests below-average forward equity returns, though this doesn't predict short-term movements. Earnings growth is the fundamental driver of long-run CGY — stocks follow earnings over long periods. A company growing earnings per share at 10% per year will likely deliver roughly 10% CGY over many years, assuming stable valuation multiples.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/capital-gains-yield-calculator" />
          <PopularCalculators exclude="/calculator/capital-gains-yield-calculator" />
        </div>
      </div>
    </>
  );
}
