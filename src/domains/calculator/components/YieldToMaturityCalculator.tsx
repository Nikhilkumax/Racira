"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

// Newton-Raphson YTM solver
const solveYTM = (price: number, face: number, coupon: number, n: number): number => {
  if (price <= 0 || face <= 0 || n <= 0) return 0;
  let ytm = coupon / price; // initial guess
  for (let i = 0; i < 200; i++) {
    const r = ytm / 2; // semiannual
    const pv = coupon / 2 * (1 - Math.pow(1 + r, -n)) / r + face * Math.pow(1 + r, -n);
    const dpv = -coupon / 2 * ((1 - Math.pow(1 + r, -n)) / (r * r) - n * Math.pow(1 + r, -n - 1) / r) - face * n * Math.pow(1 + r, -n - 1);
    const newYtm = ytm - (pv - price) / (dpv * 0.5);
    if (Math.abs(newYtm - ytm) < 1e-10) { ytm = newYtm; break; }
    ytm = newYtm;
  }
  return ytm;
};

const YieldToMaturityCalculator = () => {
  const DEFAULTS = { price: "950", face: "1000", couponRate: "6", years: "10", frequency: "2" };
  const [price, setPrice] = useState(DEFAULTS.price);
  const [face, setFace] = useState(DEFAULTS.face);
  const [couponRate, setCouponRate] = useState(DEFAULTS.couponRate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [result, setResult] = useState<any>(null);

  const calculate = (pr = price, fv = face, cr = couponRate, yr = years, fr = frequency) => {
    const P = parseFloat(pr), FV = parseFloat(fv), CR = parseFloat(cr) / 100, Y = parseFloat(yr), FREQ = parseInt(fr);
    if (!P || !FV || !Y || P <= 0 || FV <= 0 || Y <= 0) return;
    const annualCoupon = FV * CR;
    const n = Y * FREQ; // total periods
    const ytm = solveYTM(P, FV, annualCoupon, n) * FREQ;
    const currentYield = annualCoupon / P * 100;
    const couponPayment = annualCoupon / FREQ;
    const ytmPercent = ytm * 100;
    const premium = FV - P; // positive = discount, negative = premium

    // Sensitivity: price vs YTM curve
    const chartData: any[] = [];
    for (let yld = Math.max(0.5, ytmPercent - 5); yld <= ytmPercent + 5; yld += 0.5) {
      const r = yld / 100 / FREQ;
      const bondPrice = (annualCoupon / FREQ) * (1 - Math.pow(1 + r, -n)) / r + FV * Math.pow(1 + r, -n);
      chartData.push({ ytm: parseFloat(yld.toFixed(1)), price: parseFloat(bondPrice.toFixed(2)) });
    }

    setResult({ ytmPercent, currentYield, annualCoupon, couponPayment, P, FV, Y, FREQ, premium, n, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setPrice(DEFAULTS.price); setFace(DEFAULTS.face); setCouponRate(DEFAULTS.couponRate); setYears(DEFAULTS.years); setFrequency(DEFAULTS.frequency); calculate(DEFAULTS.price, DEFAULTS.face, DEFAULTS.couponRate, DEFAULTS.years, DEFAULTS.frequency); };

  const faqs = [
    { question: "What is yield to maturity (YTM)?", answer: "Yield to maturity is the total return anticipated on a bond if it is held until maturity. YTM considers the current market price, face value, coupon rate, and time to maturity. It is expressed as an annual percentage rate and assumes all coupon payments are reinvested at the same rate." },
    { question: "How is YTM calculated?", answer: "YTM is found by solving for r in: Price = Σ[Coupon / (1+r)^t] + FaceValue / (1+r)^n. This equation has no closed-form solution and must be solved iteratively (Newton-Raphson method). Our calculator performs hundreds of iterations for precise results." },
    { question: "What is the difference between YTM and coupon rate?", answer: "The coupon rate is a fixed percentage of face value paid periodically. YTM reflects the bond's total annualized return given its current market price. When a bond trades at a discount (below face value), YTM > coupon rate. When trading at a premium, YTM < coupon rate." },
    { question: "What is current yield vs YTM?", answer: "Current yield = Annual Coupon / Current Price. It only measures income return, ignoring capital gain/loss at maturity. YTM accounts for both income and the gain (discount bond) or loss (premium bond) received at maturity. YTM is always the more comprehensive measure." },
    { question: "What does it mean if YTM is higher than the coupon rate?", answer: "A YTM higher than the coupon rate means the bond is trading at a discount (below face value). Buyers are being compensated for the below-market coupon rate through a capital gain at maturity (they pay less than face value but receive full face value at redemption)." },
    { question: "What is yield to call (YTC)?", answer: "Yield to call is the yield assuming the bond is called (redeemed early) at the first call date. For callable bonds trading at a premium, YTC is often more relevant than YTM. Use our yield to call calculator alongside this YTM calculator for complete bond analysis." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Yield to Maturity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Yield to Maturity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Current Market Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="950" min="1" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Face Value (Par Value)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={face} onChange={(e) => setFace(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1000" min="1" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Annual Coupon Rate</label>
              <div className="relative">
                <input type="number" value={couponRate} onChange={(e) => setCouponRate(e.target.value)} className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="6" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Years to Maturity</label>
              <div className="relative">
                <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="h-10 w-full pl-3 pr-16 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10" min="1" max="50" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">years</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Payment Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                <option value="1">Annual</option>
                <option value="2">Semi-Annual</option>
                <option value="4">Quarterly</option>
                <option value="12">Monthly</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Yield to Maturity (YTM)</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.ytmPercent)}%</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Current yield: {fmt(result.currentYield)}% · Bond is trading at a {result.premium > 0 ? "discount" : "premium"} (${fmt(Math.abs(result.premium))})
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Bond Analysis Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Market Price", value: `$${fmt(result.P)}` },
                    { label: "Face Value (Par)", value: `$${fmt(result.FV)}` },
                    { label: "Annual Coupon", value: `$${fmt(result.annualCoupon)}` },
                    { label: `Payment per Period (${result.FREQ === 1 ? "Annual" : result.FREQ === 2 ? "Semi-Annual" : result.FREQ === 4 ? "Quarterly" : "Monthly"})`, value: `$${fmt(result.couponPayment)}` },
                    { label: "Total Periods", value: `${result.n}` },
                    { label: "Yield to Maturity (YTM)", value: `${fmt(result.ytmPercent)}%` },
                    { label: "Current Yield", value: `${fmt(result.currentYield)}%` },
                    { label: "Discount / Premium", value: `${result.premium >= 0 ? "Discount" : "Premium"}: $${fmt(Math.abs(result.premium))}` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Price-Yield Relationship</h3>
                <p className="text-xs text-muted-foreground mb-3">Bond price vs yield — the dot marks your current bond</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ytm" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v: any) => `$${Number(v).toFixed(2)}`} labelFormatter={(l) => `Yield: ${l}%`} />
                    <ReferenceLine x={parseFloat(fmt(result.ytmPercent))} stroke="hsl(var(--primary))" strokeDasharray="4 2" label={{ value: "YTM", position: "top", fontSize: 10 }} />
                    <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Bond Price" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Yield Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Coupon Rate", value: `${couponRate}%` },
                    { label: "Current Yield", value: `${fmt(result.currentYield)}%` },
                    { label: "Yield to Maturity", value: `${fmt(result.ytmPercent)}%` },
                    { label: "YTM vs Coupon", value: result.ytmPercent > parseFloat(couponRate) ? `+${fmt(result.ytmPercent - parseFloat(couponRate))}% (discount bond)` : `${fmt(result.ytmPercent - parseFloat(couponRate))}% (premium bond)` },
                    { label: "Price Type", value: result.premium >= 0 ? "Discount Bond" : "Premium Bond", border: true, bold: true },
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

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Yield to Maturity Calculator?</h2>
            <p>A yield to maturity calculator determines the total annualized return on a bond if held until its maturity date. YTM is the single most important metric for bond valuation — it accounts for the bond's current price, face value, coupon payments, and time to maturity. Pre-filled with a $1,000 face value bond priced at $950 with a 6% coupon and 10 years to maturity, the YTM is approximately 6.71% — higher than the 6% coupon because the investor benefits from the $50 capital gain at maturity.</p>
            <p>The yield to maturity calculator is used by bond investors, portfolio managers, financial advisors, and corporate treasurers to evaluate fixed-income securities. It helps compare bonds with different coupon rates, maturities, and prices on a level playing field.</p>
            <h2 className="text-2xl font-bold mb-3">How YTM Is Calculated</h2>
            <p>YTM solves for r in: <strong>Price = Σ[C/(1+r)^t] + FV/(1+r)^n</strong>, where C = periodic coupon payment, FV = face value, n = total periods, r = periodic yield. There is no direct algebraic solution — YTM must be found iteratively. This calculator uses the Newton-Raphson numerical method, converging to the answer in under 200 iterations with precision to 10 decimal places.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The price-yield chart shows the inverse relationship between bond price and yield — as yields rise, prices fall, and vice versa. The dashed reference line marks your current bond's YTM. The curve's steepness reflects the bond's duration — longer maturity bonds have steeper curves (more price sensitivity). Current yield (annual coupon / price) only measures income; YTM includes capital gain/loss at maturity for the full picture.</p>
            <h2 className="text-2xl font-bold mb-3">Key Factors Affecting YTM</h2>
            <p><strong>Market Price:</strong> Lower price → higher YTM (discount bond). Higher price → lower YTM (premium bond). <strong>Coupon Rate:</strong> Higher coupon payments increase income component of YTM. <strong>Time to Maturity:</strong> Longer maturity magnifies the capital gain/loss effect on YTM. A $50 discount on a 1-year bond has a much larger YTM impact than on a 30-year bond. <strong>Payment Frequency:</strong> More frequent payments compound more favorably; semi-annual is the US market standard.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>Discount Bond:</strong> 10-year, 5% coupon, $950 price → YTM = 5.58%. The extra 0.58% compensates for the $50 capital gain. <strong>Premium Bond:</strong> 10-year, 8% coupon, $1,050 price → YTM = 7.44%. The high coupon is partially offset by the $50 capital loss at maturity. <strong>Par Bond:</strong> When price = face value exactly, YTM = coupon rate.</p>
            <h2 className="text-2xl font-bold mb-3">YTM vs Other Yield Measures</h2>
            <p>Current yield = Annual Coupon / Price. Simple measure, ignores capital gain/loss. YTM = Comprehensive annualized return assuming held to maturity. Yield to Call (YTC) = YTM calculated to the call date instead of maturity date. Yield to Worst (YTW) = The lowest of YTM and all possible YTCs — the most conservative measure for callable bonds.</p>
            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Always compare bonds using YTM, not coupon rate or current yield alone. Use the price-yield chart to visualize interest rate risk — steeper curves mean higher duration and more interest rate sensitivity. For callable bonds, also calculate yield to call. See also: <a href="/calculator/bond-price-calculator">bond price calculator</a>, <a href="/calculator/yield-to-call-calculator">yield to call calculator</a>, and <a href="/calculator/bond-duration-calculator">bond duration calculator</a>.</p>
            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>YTM calculation by hand requires iterative trial and error that can take hours for an unpracticed investor. This yield to maturity calculator delivers the answer in milliseconds, including a price-yield sensitivity chart that reveals your bond's interest rate risk at a glance.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/yield-to-maturity-calculator" />
          <PopularCalculators exclude="/calculator/yield-to-maturity-calculator" />
        </div>
      </div>
    </>
  );
};

export default YieldToMaturityCalculator;
