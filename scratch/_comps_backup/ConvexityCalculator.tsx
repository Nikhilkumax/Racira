"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
interface ConvexityInputs {
  face: string;
  coupon: string;
  ytm: string;
  years: string;
}

interface ConvexityResult {
  face: number;
  coupon: number;
  ytm: number;
  years: number;
  couponPayment: number;
  price: number;
  macaulayDuration: number;
  modifiedDuration: number;
  convexity: number;
  chartData: { name: string; cash: number }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Pure calculation (annual coupons) ──────────────────────────────────
function calculateConvexity(inputs: ConvexityInputs): ConvexityResult {
  const empty: ConvexityResult = {
    face: 0, coupon: 0, ytm: 0, years: 0, couponPayment: 0, price: 0,
    macaulayDuration: 0, modifiedDuration: 0, convexity: 0, chartData: [], isError: true,
  };
  const face = parseFloat(inputs.face);
  const coupon = parseFloat(inputs.coupon);
  const ytm = parseFloat(inputs.ytm);
  const years = parseFloat(inputs.years);
  if (isNaN(face) || isNaN(coupon) || isNaN(ytm) || isNaN(years)) {
    return { ...empty, errorMsg: "Please enter valid numbers for all four fields." };
  }
  if (face <= 0 || years <= 0) {
    return { ...empty, errorMsg: "Face value and years to maturity must be greater than zero." };
  }
  if (ytm <= 0) {
    return { ...empty, errorMsg: "Yield to maturity must be greater than zero." };
  }
  if (!Number.isInteger(years) || years > 100) {
    return { ...empty, errorMsg: "Years to maturity must be a whole number up to 100." };
  }

  const y = ytm / 100;
  const cRate = coupon / 100;
  const couponPayment = face * cRate;
  const n = years;

  let price = 0;
  let macaulayNum = 0;
  let convexityNum = 0;
  const chartData: { name: string; cash: number }[] = [];

  for (let t = 1; t <= n; t++) {
    const cf = t === n ? couponPayment + face : couponPayment;
    const pv = cf / Math.pow(1 + y, t);
    price += pv;
    macaulayNum += t * pv;
    convexityNum += t * (t + 1) * pv;
    chartData.push({ name: `Yr ${t}`, cash: +cf.toFixed(2) });
  }

  const macaulayDuration = price > 0 ? macaulayNum / price : 0;
  const modifiedDuration = macaulayDuration / (1 + y);
  const convexity = price > 0 ? convexityNum / (price * (1 + y) * (1 + y)) : 0;

  return {
    face, coupon, ytm, years, couponPayment, price, macaulayDuration, modifiedDuration, convexity,
    chartData, isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: ConvexityInputs = { face: "1000", coupon: "6", ytm: "5", years: "10" };

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const CompactInput = ({
  id, label, value, onChange, prefix, suffix,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// ── 4. Component ──────────────────────────────────────────────────────────
const ConvexityCalculator = () => {
  const [inputs, setInputs] = useState<ConvexityInputs>(DEFAULTS);
  const [result, setResult] = useState<ConvexityResult>(() => calculateConvexity(DEFAULTS));

  useEffect(() => {
    setResult(calculateConvexity(DEFAULTS));
  }, []);

  const handleChange = (key: keyof ConvexityInputs, val: string) => setInputs((p) => ({ ...p, [key]: val }));
  const handleCalculate = () => setResult(calculateConvexity(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateConvexity(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const faqs = [
    { question: "What is bond convexity?", answer: "Convexity measures how much a bond's duration changes as yields move, capturing the curvature of the price-yield relationship. Duration is a linear estimate of price sensitivity; convexity is the second-order correction that makes the estimate accurate for large yield moves." },
    { question: "How is convexity calculated?", answer: "For annual coupons: C = [1/(P(1+y)²)] × Σ t(t+1)·CFₜ/(1+y)ᵗ, where CFₜ is the cash flow in period t, y the yield per period, and P the price. Positive convexity means price gains from falling yields exceed losses from rising yields of equal size." },
    { question: "Why does convexity matter?", answer: "Duration alone underestimates price gains when yields fall and overestimates losses when yields rise. Convexity corrects both — a 'convex' bond benefits from interest-rate volatility. Portfolio managers monitor convexity to measure and hedge the risk that duration will change." },
    { question: "What drives a bond's convexity?", answer: "Lower coupons, longer maturities, and lower yields all raise convexity. A zero-coupon bond has the highest convexity of any bond with the same maturity: C = n(n+1)/(1+y)². High convexity is valuable — it improves the price response to rate moves — which is why bonds with high convexity tend to be priced higher." },
    { question: "What is the difference between Macaulay and modified duration?", answer: "Macaulay duration is the weighted-average time to receive the bond's cash flows. Modified duration divides it by (1 + yield) and estimates the percent price change per 1% yield move. Convexity then refines that estimate for larger moves." },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Convexity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Convexity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="face-value" label="Face Value" value={inputs.face} onChange={(v) => handleChange("face", v)} prefix="$" />
              <CompactInput id="coupon-rate" label="Coupon Rate" value={inputs.coupon} onChange={(v) => handleChange("coupon", v)} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="ytm" label="Yield to Maturity" value={inputs.ytm} onChange={(v) => handleChange("ytm", v)} suffix="%" />
              <CompactInput id="years" label="Years to Maturity" value={inputs.years} onChange={(v) => handleChange("years", v)} suffix="yrs" />
            </div>
            <p className="text-xs text-muted-foreground -mt-1">Annual coupon payments assumed.</p>

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 print-section">
            {result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Bond Convexity</div>
                  <div className="text-4xl font-bold text-primary">
                    {fmt(result.convexity)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Annual compounding · Price ${fmt(result.price)} · {result.coupon}% coupon
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Modified Duration", value: fmt(result.modifiedDuration), color: "text-primary" },
                    { label: "Macaulay Duration", value: fmt(result.macaulayDuration), color: "text-foreground" },
                    { label: "Current Price", value: `$${fmt(result.price)}`, color: "text-emerald-600" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Bond Analysis</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Face Value", value: `$${fmtInt(result.face)}` },
                        { label: "Coupon Rate", value: `${fmt(result.coupon)}%` },
                        { label: "Annual Coupon Payment", value: `$${fmt(result.couponPayment)}` },
                        { label: "Yield to Maturity", value: `${fmt(result.ytm)}%` },
                        { label: "Years to Maturity", value: `${fmt(result.years, 0)} years` },
                        { label: "Current Price", value: `$${fmt(result.price)}` },
                        { label: "Macaulay Duration", value: `${fmt(result.macaulayDuration)} years` },
                        { label: "Modified Duration", value: fmt(result.modifiedDuration) },
                        { label: "Convexity", value: fmt(result.convexity), highlight: true },
                      ].map((r, i) => (
                        <tr key={i} className={`border-b last:border-0 ${r.highlight ? "bg-primary/10 font-bold" : ""}`}>
                          <td className="py-2.5 text-muted-foreground">{r.label}</td>
                          <td className="py-2.5 text-right font-semibold">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Annual Cash Flows</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v as number) / 1000}K`} />
                        <Tooltip
                          formatter={(value: number) => [`$${fmt(value as number)}`, "Cash Flow"]}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                        <Bar dataKey="cash" radius={[4, 4, 0, 0]} maxBarSize={26}>
                          {result.chartData.map((entry, idx) => (
                            <Cell key={idx} fill={idx === result.chartData.length - 1 ? "hsl(var(--primary))" : "#10b981"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">Coupons each year plus the principal repayment in the final year (highlighted).</div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Face Value", value: `$${fmtInt(result.face)}` },
                      { label: "Coupon Rate", value: `${fmt(result.coupon)}%` },
                      { label: "YTM", value: `${fmt(result.ytm)}%` },
                      { label: "Years", value: `${fmt(result.years, 0)} yrs` },
                      { label: "Price", value: `$${fmt(result.price)}` },
                      { label: "Macaulay Duration", value: `${fmt(result.macaulayDuration)} yrs` },
                      { label: "Modified Duration", value: fmt(result.modifiedDuration) },
                      { label: "Convexity", value: fmt(result.convexity) },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Bond Convexity?</h2>
            <p>Convexity measures the curvature of a bond's price-yield relationship. Duration estimates how much a bond's price changes when yields move, but the true relationship is curved — price gains accelerate as yields fall and losses decelerate as yields rise. Convexity quantifies that curvature, acting as the second-order correction that makes price estimates accurate for larger rate moves.</p>

            <h2 className="text-2xl font-bold mb-3">How This Calculator Works</h2>
            <p>Enter the bond's face value, coupon rate, yield to maturity, and years to maturity. The calculator prices the bond by discounting each annual cash flow, then computes Macaulay duration, modified duration, and convexity. Convexity uses the standard formula: <strong>C = [1/(P(1+y)²)] × Σ t(t+1)·CFₜ/(1+y)ᵗ</strong>.</p>
            <p>For the defaults — a 6% coupon bond with $1,000 face, 5% yield, and 10 years — the price is about $1,077.2 and convexity about 60.4. A zero-coupon bond with the same maturity would show the maximum convexity of n(n+1)/(1+y)² ≈ 99.8, illustrating how coupon payments reduce convexity.</p>

            <h2 className="text-2xl font-bold mb-3">Duration vs Convexity</h2>
            <p>Modified duration estimates the percent price change per 1% yield move: a modified duration of about 7.7 means a 1% rise in yield lowers price roughly 7.7%. That estimate is a straight line tangent to the price curve. Convexity bends the line to match reality — for a 2% yield drop, duration alone underestimates the price gain, and convexity supplies the missing amount. Positive convexity is always beneficial: gains in falling-rate scenarios exceed losses in rising-rate scenarios of equal size.</p>

            <h2 className="text-2xl font-bold mb-3">Using Convexity in Practice</h2>
            <p>Portfolio managers combine duration and convexity to immunize against rate changes and to compare bonds fairly. High-convexity bonds protect better against large rate moves, which is why investors pay a premium for them. The cash-flow chart in this calculator shows the coupon stream that drives both measures, making it easy to see how the timing of payments shapes the bond's risk profile.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/convexity-calculator" />
          <PopularCalculators exclude="/calculator/convexity-calculator" />
        </div>
      </div>
    </>
  );
};

export default ConvexityCalculator;
