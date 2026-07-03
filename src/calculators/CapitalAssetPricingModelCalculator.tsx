"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

const DEFAULTS = { riskFreeRate: "4.5", beta: "1.2", marketReturn: "10.5" };

interface CAPMResult {
  expectedReturn: number;
  marketRiskPremium: number;
  riskPremium: number;
  sharpeRatio: number;
  treynorRatio: number;
  alphaNeeded: number;
  chartData: { beta: string; expectedReturn: number }[];
}

function calculate(v: typeof DEFAULTS): CAPMResult {
  const rf = parseFloat(v.riskFreeRate) / 100;
  const beta = parseFloat(v.beta);
  const rm = parseFloat(v.marketReturn) / 100;

  // CAPM: E(R) = Rf + β × (Rm - Rf)
  const marketRiskPremium = rm - rf;
  const riskPremium = beta * marketRiskPremium;
  const expectedReturn = rf + riskPremium;

  // Treynor Ratio = (E(R) - Rf) / β
  const treynorRatio = beta !== 0 ? riskPremium / beta : 0;
  // Sharpe (approximation assuming σ ≈ β × market σ, market σ ≈ 15%)
  const assetSigma = Math.abs(beta) * 0.15;
  const sharpeRatio = assetSigma > 0 ? riskPremium / assetSigma : 0;
  // Alpha needed to justify vs risk-free
  const alphaNeeded = expectedReturn - rm; // how much above market needed

  // Chart: security market line from beta 0 to 2
  const chartData = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((b) => ({
    beta: `β=${b}`,
    expectedReturn: parseFloat(((rf + b * marketRiskPremium) * 100).toFixed(2)),
  }));

  return { expectedReturn, marketRiskPremium, riskPremium, sharpeRatio, treynorRatio, alphaNeeded, chartData };
}

const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

export default function CapitalAssetPricingModelCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<CAPMResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));
  useEffect(() => { setMounted(true); runCalc(); }, []);
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const faqs = [
    { question: "What is the Capital Asset Pricing Model (CAPM)?", answer: "CAPM is a financial model that establishes the theoretically appropriate required return for an asset given its systematic risk (beta). It states that an asset's expected return equals the risk-free rate plus a risk premium proportional to the asset's beta. Developed by William Sharpe (1964), CAPM earned him the Nobel Prize in Economics in 1990." },
    { question: "What is the CAPM formula?", answer: "E(R) = Rf + β × (Rm − Rf). Where E(R) = expected return on the asset, Rf = risk-free rate (typically 10-year US Treasury yield), β (beta) = systematic risk relative to the market, Rm = expected market return, (Rm − Rf) = market risk premium. For β=1.2, Rf=4.5%, Rm=10.5%: E(R) = 4.5% + 1.2 × (10.5% − 4.5%) = 4.5% + 7.2% = 11.7%." },
    { question: "What does beta measure?", answer: "Beta measures a stock's volatility relative to the overall market. β=1.0: moves in lockstep with the market. β>1: more volatile than the market (amplifies market moves). β<1: less volatile. β<0: moves opposite to the market (rare, e.g., some gold stocks). A β of 1.2 means the stock historically moves 1.2× the market — if the market falls 10%, the stock typically falls 12%." },
    { question: "What is the market risk premium?", answer: "The market risk premium (MRP) = Expected Market Return − Risk-Free Rate. It represents the extra return investors demand for taking on equity market risk over a safe government bond. Historically, the US MRP has averaged 4–7% annually. When setting a risk-free rate of 4.5% and expected market return of 10.5%, the MRP is 6%." },
    { question: "What are the limitations of CAPM?", answer: "CAPM assumes: (1) markets are efficient, (2) investors only care about mean and variance of returns, (3) beta is stable and measurable. In reality, markets have anomalies, beta changes over time, and factors beyond systematic risk (size, value, momentum) explain returns. The Fama-French Three-Factor Model extends CAPM by adding size and value factors." },
    { question: "How is CAPM used in corporate finance?", answer: "CAPM is the most common method to estimate the cost of equity capital (Ke) for WACC calculations. By computing the required return for a company's equity using its beta, analysts can discount future cash flows at the appropriate rate for DCF valuation. It's also used to evaluate whether a portfolio manager is generating alpha (return above CAPM expectation)." },
    { question: "What is the Security Market Line (SML)?", answer: "The Security Market Line (SML) plots the relationship between beta and expected return as defined by CAPM. All efficiently priced assets plot on the SML. Assets above the SML are undervalued (delivering more return than CAPM suggests) and assets below are overvalued. Alpha = actual return − CAPM expected return. Positive alpha indicates outperformance after adjusting for systematic risk." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "CAPM Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Capital Asset Pricing Model (CAPM) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Risk-Free Rate (%)</label>
              <div className="relative">
                <input type="number" value={vals.riskFreeRate} onChange={set("riskFreeRate")} className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" step="0.1" min="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Beta (β)</label>
              <input type="number" value={vals.beta} onChange={set("beta")} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" step="0.1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Expected Market Return (%)</label>
              <div className="relative">
                <input type="number" value={vals.marketReturn} onChange={set("marketReturn")} className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" step="0.1" min="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
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
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Expected Return (CAPM)</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtPct(result.expectedReturn)}</div>
                  <div className="text-sm text-muted-foreground font-medium">Risk Premium: {fmtPct(result.riskPremium)} · β = {vals.beta}</div>
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
                        { label: "Expected Return E(R)", value: fmtPct(result.expectedReturn) },
                        { label: "Risk-Free Rate (Rf)", value: `${vals.riskFreeRate}%` },
                        { label: "Market Risk Premium", value: fmtPct(result.marketRiskPremium) },
                        { label: "Asset Risk Premium (β × MRP)", value: fmtPct(result.riskPremium) },
                        { label: "Beta (β)", value: parseFloat(vals.beta).toFixed(2) },
                        { label: "Treynor Ratio", value: fmtPct(result.treynorRatio) },
                        { label: "Approx. Sharpe Ratio (σ≈β×15%)", value: result.sharpeRatio.toFixed(3), bold: true },
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
                    <h3 className="text-sm font-bold text-foreground mb-3">Security Market Line (SML)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={result.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="beta" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v: any) => [`${v}%`, "Expected Return"]} />
                        <ReferenceLine y={parseFloat(vals.marketReturn)} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Mkt", fill: "#f59e0b", fontSize: 10 }} />
                        <Bar dataKey="expectedReturn" radius={[3, 3, 0, 0]}>
                          {result.chartData.map((_, i) => (
                            <Cell key={i} fill={i === 4 ? "#f59e0b" : "hsl(var(--primary))"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">CAPM Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "E(R)", value: fmtPct(result.expectedReturn) },
                      { label: "Beta (β)", value: parseFloat(vals.beta).toFixed(2) },
                      { label: "Market Risk Premium", value: fmtPct(result.marketRiskPremium) },
                      { label: "Asset Risk Premium", value: fmtPct(result.riskPremium) },
                      { label: "Treynor Ratio", value: result.treynorRatio.toFixed(4) },
                      { label: "Risk Level", value: parseFloat(vals.beta) > 1.5 ? "Aggressive" : parseFloat(vals.beta) > 1 ? "Above Market" : parseFloat(vals.beta) > 0.5 ? "Moderate" : "Defensive", bold: true },
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
            <h2>What Is the Capital Asset Pricing Model (CAPM)?</h2>
            <p>The Capital Asset Pricing Model (CAPM) is the foundational theory of modern finance for determining the required return on any investment. Developed by William Sharpe in 1964 (building on Harry Markowitz's portfolio theory), CAPM establishes that the expected return on an asset is proportional to its systematic risk — the risk that cannot be eliminated through diversification. This model underpins how trillions of dollars in capital are priced, valued, and allocated across global financial markets every day.</p>
            <p>Our calculator comes pre-filled with realistic 2024 values: a risk-free rate of 4.5% (approximating the 10-year US Treasury yield), beta of 1.2 (a moderately aggressive stock), and expected market return of 10.5% (close to the long-run S&P 500 average). The result: a required expected return of 11.7% per year.</p>

            <h2>The CAPM Formula</h2>
            <p><strong>E(R) = Rf + β × (Rm − Rf)</strong></p>
            <p>Where E(R) = Expected return on the asset. Rf = Risk-free rate (yield on government bonds, typically 10-year US Treasury). β (Beta) = Systematic risk of the asset relative to the market. Rm = Expected return of the overall market. (Rm − Rf) = Market Risk Premium — the extra return demanded for bearing market risk. Working through our example: E(R) = 4.5% + 1.2 × (10.5% − 4.5%) = 4.5% + 1.2 × 6% = 4.5% + 7.2% = 11.7%.</p>

            <h2>Understanding Beta (β): The Risk Measure</h2>
            <p>Beta is the cornerstone of CAPM — it measures how much an asset's returns move relative to the market. A beta of 1.0 means the asset moves in perfect lockstep with the market — it is as risky as the overall market (e.g., an S&P 500 index fund). A beta above 1.0 means the asset amplifies market movements: a beta of 1.5 means if the market rises 10%, the stock typically rises 15%; if the market falls 10%, the stock falls 15%. A beta below 1.0 means the asset is less volatile than the market. Utilities, consumer staples, and healthcare stocks often have betas of 0.4–0.8. A negative beta (rare) means the asset moves counter to the market — gold stocks and some volatility instruments can have slightly negative betas.</p>

            <h2>The Security Market Line (SML)</h2>
            <p>The Security Market Line is the visual representation of CAPM — a line that plots expected return (y-axis) against beta (x-axis). Every point on the SML represents the CAPM-required expected return for a given beta. The y-intercept is the risk-free rate (beta = 0). The slope of the SML equals the market risk premium (Rm − Rf). Assets plotting above the SML are undervalued — they offer more return than CAPM requires for their risk level, representing positive alpha (α &gt; 0). Assets below the SML are overvalued — insufficient return for their risk. Active portfolio managers constantly seek assets above the SML.</p>

            <h2>CAPM in Corporate Finance and Valuation</h2>
            <p>CAPM's most important practical application is calculating the cost of equity (Ke) for use in the Weighted Average Cost of Capital (WACC). WACC = (E/V) × Ke + (D/V) × Kd × (1−T). Where Ke is determined by CAPM. WACC is then used as the discount rate in DCF (Discounted Cash Flow) models to value businesses, projects, and acquisitions. A company with a beta of 1.2, risk-free rate of 4.5%, and market premium of 6% has a cost of equity of 11.7%. If this company has no debt, its WACC = 11.7%, and all future free cash flows are discounted at this rate to compute intrinsic value.</p>

            <h2>Market Risk Premium: The Historical Perspective</h2>
            <p>The market risk premium (MRP) has averaged approximately 4.5–6% in the US historically, though it varies significantly by estimation method and time period. From 1926–2023, the equity risk premium (US large-cap stocks vs. Treasury bills) averaged approximately 7.7%. However, forward-looking estimates using dividend discount models or earnings yield approaches tend to produce lower estimates of 4–5.5%, reflecting current market valuations. Many practitioners use 5.5–6% as a reasonable MRP assumption for US equities in current market conditions.</p>

            <h2>Limitations of CAPM and Alternative Models</h2>
            <p>CAPM rests on several assumptions that don't fully hold in practice: Markets are perfectly efficient and all investors have identical beliefs. Investors can borrow and lend at the risk-free rate. Returns follow a normal distribution. Beta is stable and a complete measure of risk. Empirical research has identified systematic return anomalies that CAPM cannot explain: the size effect (small-cap stocks outperform), the value effect (high book-to-market stocks outperform), and the momentum effect (recent winners continue to outperform). The Fama-French Three-Factor Model adds size (SMB) and value (HML) factors to CAPM. The Carhart Four-Factor Model adds momentum. The Fama-French Five-Factor Model further adds profitability and investment factors.</p>

            <h2>Using CAPM to Identify Alpha</h2>
            <p>Alpha (α) = Actual Return − CAPM Expected Return. A portfolio manager delivering actual returns of 14% with a beta of 1.2 at Rf=4.5% and Rm=10.5% has generated alpha of 14% − 11.7% = 2.3%. This represents 2.3% of return unexplained by systematic risk — genuine skill or exploitation of market inefficiency. Over long periods, consistently positive alpha is extraordinarily rare; studies suggest fewer than 5% of active managers deliver statistically significant positive alpha net of fees. This is the empirical foundation for the passive index investing revolution led by Vanguard and Fidelity.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/capital-asset-pricing-model-calculator" />
          <PopularCalculators exclude="/calculator/capital-asset-pricing-model-calculator" />
        </div>
      </div>
    </>
  );
}
