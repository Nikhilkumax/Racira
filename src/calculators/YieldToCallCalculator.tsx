"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

// Newton-Raphson yield solver
const solveYield = (price: number, face: number, coupon: number, n: number, freq: number): number => {
  if (price <= 0 || face <= 0 || n <= 0) return 0;
  const cp = coupon / freq;
  let r = (coupon / price) / freq;
  for (let i = 0; i < 200; i++) {
    const pv = cp * (1 - Math.pow(1 + r, -n)) / r + face * Math.pow(1 + r, -n);
    const dpv = -cp * ((1 - Math.pow(1 + r, -n)) / (r * r) - n * Math.pow(1 + r, -n - 1) / r) - face * n * Math.pow(1 + r, -n - 1);
    const nr = r - (pv - price) / dpv;
    if (Math.abs(nr - r) < 1e-10) { r = nr; break; }
    r = nr;
  }
  return r * freq;
};

const YieldToCallCalculator = () => {
  const DEFAULTS = { price: "1050", face: "1000", couponRate: "8", callPrice: "1020", yearsToCall: "5", frequency: "2" };
  const [price, setPrice] = useState(DEFAULTS.price);
  const [face, setFace] = useState(DEFAULTS.face);
  const [couponRate, setCouponRate] = useState(DEFAULTS.couponRate);
  const [callPrice, setCallPrice] = useState(DEFAULTS.callPrice);
  const [yearsToCall, setYearsToCall] = useState(DEFAULTS.yearsToCall);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [result, setResult] = useState<any>(null);

  const calculate = (pr = price, fv = face, cr = couponRate, cp = callPrice, ytc_y = yearsToCall, fr = frequency) => {
    const P = parseFloat(pr), FV = parseFloat(fv), CR = parseFloat(cr) / 100;
    const CP = parseFloat(cp), YTC = parseFloat(ytc_y), FREQ = parseInt(fr);
    if (!P || !FV || !YTC || P <= 0 || FV <= 0 || YTC <= 0) return;
    const annualCoupon = FV * CR;
    const n_call = YTC * FREQ;
    const ytc = solveYield(P, CP, annualCoupon, n_call, FREQ) * 100;
    const currentYield = (annualCoupon / P) * 100;
    const couponPayment = annualCoupon / FREQ;
    const callPremium = CP - FV;

    // Compare YTC vs YTM (using face value maturity as dummy long-term)
    const chartData = [
      { name: "Coupon Rate", value: parseFloat(CR.toFixed(4)) * 100 },
      { name: "Current Yield", value: parseFloat(currentYield.toFixed(4)) },
      { name: "Yield to Call", value: parseFloat(ytc.toFixed(4)) },
    ];

    setResult({ ytc, currentYield, annualCoupon, couponPayment, P, FV, CP, callPremium, YTC, FREQ, n_call, chartData, CR: CR * 100 });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setPrice(DEFAULTS.price); setFace(DEFAULTS.face); setCouponRate(DEFAULTS.couponRate); setCallPrice(DEFAULTS.callPrice); setYearsToCall(DEFAULTS.yearsToCall); setFrequency(DEFAULTS.frequency); calculate(DEFAULTS.price, DEFAULTS.face, DEFAULTS.couponRate, DEFAULTS.callPrice, DEFAULTS.yearsToCall, DEFAULTS.frequency); };

  const faqs = [
    { question: "What is yield to call (YTC)?", answer: "Yield to call is the yield on a callable bond assuming it is redeemed by the issuer at the earliest call date. It is identical in concept to YTM but replaces face value with the call price and total maturity with time to call. YTC is especially relevant for premium bonds likely to be called." },
    { question: "When is YTC more important than YTM?", answer: "When a bond trades at a premium (above par), issuers are likely to call it to refinance at lower rates. In this case, YTC is the more realistic return estimate. If a bond trades at a discount, it is unlikely to be called early, making YTM more relevant." },
    { question: "What is the call premium?", answer: "The call premium is the amount above face value paid to bondholders if the bond is called. For example, a bond with $1,000 face value and $1,020 call price has a $20 call premium. This compensates investors for the early redemption risk they bear." },
    { question: "How is YTC calculated?", answer: "YTC solves for r in: Price = Σ[Coupon/(1+r)^t] + CallPrice/(1+r)^n, where n = periods to call. This is solved iteratively using Newton-Raphson, replacing the face value with the call price and total maturity with time to the call date." },
    { question: "What is yield to worst (YTW)?", answer: "Yield to worst is the lowest of all possible yields — YTM, YTC for each call date, and yield to put. It represents the worst-case return scenario. Conservative bond analysis always uses yield to worst as the baseline metric." },
    { question: "Can I use this calculator for bonds with multiple call dates?", answer: "For bonds with multiple call dates, calculate YTC separately for each call date and the call price at each date. The lowest result is the yield to worst. Most callable corporate bonds have call schedules with declining call premiums as the bond ages." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Yield to Call Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Yield to Call Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Current Market Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1050" min="1" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Face Value (Par)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={face} onChange={(e) => setFace(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1000" min="1" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Annual Coupon Rate</label>
              <div className="relative">
                <input type="number" value={couponRate} onChange={(e) => setCouponRate(e.target.value)} className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="8" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Call Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={callPrice} onChange={(e) => setCallPrice(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="1020" min="1" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Years to First Call Date</label>
              <div className="relative">
                <input type="number" value={yearsToCall} onChange={(e) => setYearsToCall(e.target.value)} className="h-10 w-full pl-3 pr-16 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="5" min="0.5" step="0.5" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">years</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Payment Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                <option value="1">Annual</option>
                <option value="2">Semi-Annual</option>
                <option value="4">Quarterly</option>
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Yield to Call (YTC)</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.ytc)}%</div>
                <div className="text-sm text-muted-foreground mt-1">
                  If called in {result.YTC} years at ${fmt(result.CP)} · Current yield: {fmt(result.currentYield)}%
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Bond Call Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Market Price", value: `$${fmt(result.P)}` },
                    { label: "Face Value (Par)", value: `$${fmt(result.FV)}` },
                    { label: "Call Price", value: `$${fmt(result.CP)}` },
                    { label: "Call Premium", value: `$${fmt(result.callPremium)}` },
                    { label: "Annual Coupon", value: `$${fmt(result.annualCoupon)}` },
                    { label: "Coupon per Period", value: `$${fmt(result.couponPayment)}` },
                    { label: "Periods to Call", value: `${result.n_call}` },
                    { label: "Yield to Call (YTC)", value: `${fmt(result.ytc)}%` },
                    { label: "Current Yield", value: `${fmt(result.currentYield)}%` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Yield Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)}%`} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Yield %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Call Risk Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Coupon Rate", value: `${fmt(result.CR)}%` },
                    { label: "Current Yield", value: `${fmt(result.currentYield)}%` },
                    { label: "Yield to Call (YTC)", value: `${fmt(result.ytc)}%` },
                    { label: "Call Premium Received", value: `$${fmt(result.callPremium)}` },
                    { label: "Call Risk Level", value: result.P > result.FV ? "HIGH (trading at premium)" : "LOW (trading at discount)", border: true, bold: true },
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
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Yield to Call Calculator?</h2>
            <p>A yield to call calculator determines the annualized return on a callable bond if the issuer redeems it on the earliest call date at the specified call price. Pre-filled with a $1,000 face value bond priced at $1,050 with an 8% coupon, $1,020 call price, and 5 years to call, the YTC is approximately 7.02% — meaningfully below the 8% coupon because the investor pays a premium and receives only $1,020 (not $1,000) at call. Callable bonds are common in corporate and municipal bond markets.</p>
            <p>When a bond trades at a premium, the issuer has financial incentive to call it and refinance at lower market rates. In such cases, yield to call is often a more realistic return expectation than yield to maturity. Our yield to call calculator helps bond investors assess call risk and true expected return.</p>
            <h2>How YTC Is Calculated</h2>
            <p><strong>Price = Σ[C/(1+r)^t] + CallPrice/(1+r)^n</strong></p>
            <p>Where C = periodic coupon payment, n = number of periods to the call date, CallPrice = the price the issuer will pay if the bond is called. This is solved iteratively using Newton-Raphson convergence. Unlike YTM, the terminal value is the call price (which may include a call premium), not the face value.</p>
            <h2>Understanding Your Results</h2>
            <p>The yield comparison chart shows three key yield metrics side by side: coupon rate (the stated interest rate), current yield (annual income / price), and yield to call (total annualized return to call date). For premium bonds, YTC is typically the lowest of the three — it reflects the capital loss from buying above call price. The call risk summary indicates HIGH risk when the bond trades above par, suggesting the issuer would benefit from calling the bond.</p>
            <h2>Key Factors in Yield to Call Analysis</h2>
            <p><strong>Call Price:</strong> A higher call premium (call price above par) partly compensates investors for early redemption risk. <strong>Time to Call:</strong> Shorter call periods compress income and magnify the price-vs-call-price differential in YTC. <strong>Market Price:</strong> The further above par a bond trades, the lower its YTC and the higher the call risk. <strong>Coupon Rate:</strong> High-coupon bonds issued in high-rate environments are most likely to be called when rates fall.</p>
            <h2>Practical Examples</h2>
            <p><strong>Corporate Bond:</strong> $1,000 par, 9% coupon, priced at $1,080, callable in 3 years at $1,030. YTC ≈ 6.5%. With a 6.5% YTC versus 9% coupon, the investor faces significant call risk if market rates drop further. <strong>Municipal Bond:</strong> Tax-exempt 5% coupon, priced at $1,020, callable in 5 years at par. YTC ≈ 4.56% — after taxes for a 30% bracket investor, the after-tax yield is still competitive with taxable alternatives.</p>
            <h2>YTC vs YTM — When to Use Each</h2>
            <p>Use YTM for non-callable bonds or discount bonds unlikely to be called. Use YTC when the bond trades at a premium, the issuer is investment-grade with strong refinancing incentive, or market rates have fallen significantly since issuance. Always compute yield to worst (the minimum of YTM and all YTCs) for callable premium bonds. See also: <a href="/calculator/yield-to-maturity-calculator">yield to maturity calculator</a>, <a href="/calculator/bond-price-calculator">bond price calculator</a>, and <a href="/calculator/bond-duration-calculator">bond duration calculator</a>.</p>
            <h2>Benefits of This Calculator</h2>
            <p>Manually computing YTC requires iterative trial-and-error calculations involving exponents. This yield to call calculator delivers precise results in milliseconds, with a clear visual comparison of all three yield metrics to help you quickly assess the trade-off between coupon income and call risk.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/yield-to-call-calculator" />
          <PopularCalculators exclude="/calculator/yield-to-call-calculator" />
        </div>
      </div>
    </>
  );
};

export default YieldToCallCalculator;
