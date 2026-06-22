"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DEFAULTS = {
  faceValue: "1000",
  couponRate: "6",
  yearsToMaturity: "10",
  ytm: "5",
  paymentsPerYear: "2",
};

interface BondDurationResult {
  macaulayDuration: number;
  modifiedDuration: number;
  bondPrice: number;
  couponPayment: number;
  totalCoupons: number;
  dv01: number;
  priceChange1pct: number;
  chartData: { period: string; pv: number; weight: number }[];
}

function calculate(v: typeof DEFAULTS): BondDurationResult {
  const F = parseFloat(v.faceValue) || 1000;
  const c = parseFloat(v.couponRate) / 100;
  const n_years = parseFloat(v.yearsToMaturity);
  const ytmAnnual = parseFloat(v.ytm) / 100;
  const m = parseFloat(v.paymentsPerYear) || 2;

  const r = ytmAnnual / m;               // periodic yield
  const n = n_years * m;                  // total periods
  const C = (F * c) / m;                 // coupon per period

  if (n <= 0 || r <= 0) return { macaulayDuration: 0, modifiedDuration: 0, bondPrice: 0, couponPayment: C, totalCoupons: 0, dv01: 0, priceChange1pct: 0, chartData: [] };

  // Bond Price = sum of PV of coupons + PV of face value
  let bondPrice = 0;
  let weightedSum = 0;
  const chartData: { period: string; pv: number; weight: number }[] = [];

  for (let t = 1; t <= n; t++) {
    const pv = C / Math.pow(1 + r, t);
    bondPrice += pv;
    weightedSum += (t / m) * pv;   // time in years × PV
    if (t % m === 0 || t === n) {  // show annual / final data points
      chartData.push({ period: `Yr ${Math.round(t / m)}`, pv: parseFloat(pv.toFixed(2)), weight: parseFloat(((t / m) * pv).toFixed(2)) });
    }
  }
  // Add face value PV
  const pvFace = F / Math.pow(1 + r, n);
  bondPrice += pvFace;
  weightedSum += n_years * pvFace;

  const macaulayDuration = weightedSum / bondPrice;
  const modifiedDuration = macaulayDuration / (1 + r);
  const dv01 = (modifiedDuration * bondPrice) / 10000;    // dollar value of 1 basis point
  const priceChange1pct = -modifiedDuration * bondPrice * 0.01;

  return { macaulayDuration, modifiedDuration, bondPrice, couponPayment: C * m, totalCoupons: C * n, dv01, priceChange1pct, chartData };
}

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtCurrency = (n: number) => `$${fmt(n)}`;

export default function BondDurationCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<BondDurationResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));
  useEffect(() => { setMounted(true); runCalc(); }, []);
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const faqs = [
    { question: "What is Macaulay Duration?", answer: "Macaulay Duration is the weighted average time (in years) until a bond's cash flows are received, where each cash flow is weighted by its present value as a proportion of the bond's total price. It measures the effective maturity of a bond — a bond with a Macaulay Duration of 7.5 years behaves economically as if it matures in 7.5 years." },
    { question: "What is Modified Duration?", answer: "Modified Duration = Macaulay Duration ÷ (1 + Yield/Payments per Year). It measures a bond's price sensitivity to interest rate changes. If Modified Duration = 7.2, a 1% rise in interest rates causes the bond's price to fall approximately 7.2%. It's the most widely used measure of bond interest rate risk." },
    { question: "What is DV01?", answer: "DV01 (Dollar Value of One Basis Point) measures how much a bond's price changes for a 1 basis point (0.01%) move in yield. DV01 = (Modified Duration × Bond Price) / 10,000. Portfolio managers use DV01 to hedge interest rate risk and size fixed-income positions precisely." },
    { question: "Why do longer bonds have higher duration?", answer: "Longer maturity bonds take more time to return cash flows (coupons + principal), so investors wait longer for their money back. This increases sensitivity to interest rate changes. A 30-year zero-coupon bond has a duration of 30 years — it moves roughly 30% for every 1% rate change. A 1-year bond barely moves." },
    { question: "How does coupon rate affect duration?", answer: "Higher coupon rates reduce duration because more cash flows are returned earlier (as coupons), reducing the average wait time. A zero-coupon bond has duration equal to its maturity. As coupon rate increases, duration decreases. This is why low-coupon bonds carry more interest rate risk than high-coupon bonds of the same maturity." },
    { question: "What does it mean when a bond trades above or below par?", answer: "Par value (face value) is the bond's principal, typically $1,000. When market yield > coupon rate, bond price < par (discount). When market yield < coupon rate, bond price > par (premium). When yields equal coupon rate, price = par. A $1,000 face value bond with 6% coupon priced at $1,081 when yields are 5% means it's trading at a premium." },
    { question: "How do investors use duration for portfolio management?", answer: "Duration matching (immunization) involves aligning the duration of assets and liabilities so that interest rate changes affect both equally — eliminating interest rate risk. Pension funds use this to match the duration of their bond holdings to the duration of future pension obligations. Active managers take duration bets — increasing duration when they expect rates to fall (bond prices rise) and shortening duration before expected rate increases." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Bond Duration Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bond Duration Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Inputs</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Face Value ($)</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input type="number" value={vals.faceValue} onChange={set("faceValue")} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Coupon Rate (%)</label>
                <div className="relative">
                  <input type="number" value={vals.couponRate} onChange={set("couponRate")} className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Years to Maturity</label>
                <div className="relative">
                  <input type="number" value={vals.yearsToMaturity} onChange={set("yearsToMaturity")} className="h-10 w-full pl-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0.5" step="0.5" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">yr</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Yield to Maturity (%)</label>
                <div className="relative">
                  <input type="number" value={vals.ytm} onChange={set("ytm")} className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" min="0" step="0.1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Payment Frequency</label>
              <select value={vals.paymentsPerYear} onChange={set("paymentsPerYear")}
                className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="1">Annual (1×/year)</option>
                <option value="2">Semi-Annual (2×/year)</option>
                <option value="4">Quarterly (4×/year)</option>
                <option value="12">Monthly (12×/year)</option>
              </select>
            </div>

            <div className="flex gap-2.5 mt-1">
              <button onClick={() => runCalc()} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Macaulay Duration</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result.macaulayDuration)} years</div>
                  <div className="text-sm text-muted-foreground font-medium">Bond Price: {fmtCurrency(result.bondPrice)} · Modified Duration: {fmt(result.modifiedDuration)}</div>
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
                        { label: "Bond Price", value: fmtCurrency(result.bondPrice) },
                        { label: "Macaulay Duration", value: `${fmt(result.macaulayDuration)} years` },
                        { label: "Modified Duration", value: fmt(result.modifiedDuration) },
                        { label: "DV01 (per bp move)", value: `$${fmt(result.dv01, 4)}` },
                        { label: "Price Change per 1% Rate Rise", value: fmtCurrency(result.priceChange1pct) },
                        { label: "Annual Coupon Payment", value: fmtCurrency(result.couponPayment) },
                        { label: "Total Coupon Income", value: fmtCurrency(result.totalCoupons), bold: true },
                      ].map((r) => (
                        <tr key={r.label} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right ${r.bold ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && result.chartData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Present Value of Cash Flows by Year</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={result.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                        <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "PV of Cash Flow"]} />
                        <Bar dataKey="pv" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Risk Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Macaulay Duration", value: `${fmt(result.macaulayDuration)} yrs` },
                      { label: "Modified Duration", value: fmt(result.modifiedDuration) },
                      { label: "DV01", value: `$${fmt(result.dv01, 4)}` },
                      { label: "Bond Price", value: fmtCurrency(result.bondPrice) },
                      { label: "1% Rate Sensitivity", value: fmtCurrency(result.priceChange1pct) },
                      { label: "Interest Rate Risk", value: result.modifiedDuration > 10 ? "Very High" : result.modifiedDuration > 7 ? "High" : result.modifiedDuration > 4 ? "Moderate" : "Low", bold: true },
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

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Bond Duration?</h2>
            <p>Bond duration is one of the most important concepts in fixed-income investing — yet it's frequently misunderstood. Duration is not simply the time until a bond matures. Rather, it is the weighted average time until all cash flows (coupons and principal repayment) are received, where each cash flow is weighted by its present value as a fraction of the total bond price. Duration measures both the average timing of a bond's cash flows and, critically, its sensitivity to interest rate changes.</p>
            <p>Our calculator is pre-filled with a typical investment-grade bond: $1,000 face value, 6% coupon, 10-year maturity, 5% yield to maturity, semi-annual payments. This produces a bond price of approximately $1,077 (premium bond since coupon &gt; yield) and a Macaulay Duration of about 7.8 years.</p>

            <h2>Macaulay Duration Formula</h2>
            <p><strong>Macaulay Duration = Σ [t × PV(CFt)] ÷ Bond Price</strong></p>
            <p>Where t = time of each cash flow in years, PV(CFt) = present value of each cash flow discounted at the yield. Each coupon payment and the final principal repayment is discounted back to present value, then weighted by its time and divided by the bond's total price. The result is the effective weighted average maturity of the bond's cash flows, expressed in years.</p>

            <h2>Modified Duration: The Interest Rate Sensitivity Measure</h2>
            <p><strong>Modified Duration = Macaulay Duration ÷ (1 + YTM/m)</strong></p>
            <p>Where m = number of coupon payments per year. Modified Duration is the most practically useful duration measure because it directly quantifies price sensitivity: a Modified Duration of 7.5 means that for each 1% (100 basis point) increase in interest rates, the bond's price falls approximately 7.5%. Conversely, if rates fall 1%, the price rises approximately 7.5%. This linear approximation works well for small rate changes; for larger moves, convexity adjustment is needed for greater accuracy.</p>

            <h2>DV01: Dollar Value of One Basis Point</h2>
            <p><strong>DV01 = (Modified Duration × Bond Price) ÷ 10,000</strong></p>
            <p>DV01 translates duration into dollar terms per basis point (0.01%) yield change. If a bond has DV01 of $7.50, every 1bp rise in yields costs you $7.50 per bond. For a portfolio of 1,000 bonds, that's $7,500 per basis point. Professional bond traders and portfolio managers use DV01 to size hedges, manage risk limits, and ensure that their interest rate exposure is precisely controlled. Futures contracts on 10-year Treasury notes have DV01 of approximately $100 per contract, making them efficient hedging vehicles.</p>

            <h2>What Determines a Bond's Duration?</h2>
            <p>Three primary factors determine duration. First, maturity: all else equal, longer maturity = higher duration. A 30-year bond has much higher duration than a 5-year bond. Second, coupon rate: higher coupons return cash sooner (as periodic income), reducing the average time to receive cash flows. A zero-coupon bond's Macaulay Duration equals its maturity exactly, since all cash flows occur at maturity. As coupon rate increases, duration decreases. Third, yield: higher yields discount future cash flows more aggressively, making nearer-term cash flows (early coupons) proportionally more valuable — this slightly reduces duration. The relationship between yield and duration is smaller than the maturity and coupon effects.</p>

            <h2>Duration and the Bond Price-Yield Relationship</h2>
            <p>The fundamental rule of bond investing: when interest rates rise, bond prices fall, and vice versa. Duration quantifies exactly how much. A bond with Modified Duration of 8 loses approximately 8% of its value for every 1% rise in rates. During the 2022 rate cycle when the Federal Reserve raised rates by 4.25%, long-duration bonds with Modified Duration of 15–20 lost 60–80% of their value — larger drawdowns than many equity markets. Understanding duration is not optional for fixed-income investors — it is the primary driver of bond performance in a rising rate environment.</p>

            <h2>Investment Strategies Using Duration</h2>
            <p>Duration matching (immunization) aligns a portfolio's duration with the investor's time horizon. If you need funds in 8 years, building a bond portfolio with Macaulay Duration of 8 ensures that price and reinvestment rate risk offset each other, locking in the current yield regardless of rate movements. This is widely used by pension funds, insurance companies, and endowments. Barbell strategy involves holding short-duration and long-duration bonds but few intermediate. This provides liquidity (short-term) plus yield (long-term) while maintaining a target average duration. Active duration management involves extending duration before expected rate cuts (to profit from price appreciation) and shortening before expected hikes.</p>

            <h2>Convexity: The Duration Refinement</h2>
            <p>Duration provides a linear approximation of price sensitivity that becomes less accurate for large rate moves. Convexity is the second-order correction. A bond with positive convexity benefits more from rate decreases than it suffers from equivalent rate increases — the price-yield relationship curves in the investor's favor. Callable bonds can have negative convexity: when rates fall, the issuer may call the bond, capping price appreciation. Mortgage-backed securities (MBS) are the classic negative convexity instrument. When comparing bonds with similar duration, prefer the one with higher convexity — it's a "free" enhancement in most scenarios.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bond-duration-calculator" />
          <PopularCalculators exclude="/calculator/bond-duration-calculator" />
        </div>
      </div>
    </>
  );
}
