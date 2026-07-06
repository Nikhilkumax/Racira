"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const ZeroCouponBondCalculator = () => {
  const DEFAULTS = { faceValue: "10000", rate: "5", years: "10" };
  const [faceValue, setFaceValue] = useState(DEFAULTS.faceValue);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [result, setResult] = useState<any>(null);

  const calculate = (fv = faceValue, r = rate, y = years) => {
    const FV = parseFloat(fv), R = parseFloat(r) / 100, Y = parseFloat(y);
    if (!FV || !R || !Y || FV <= 0 || Y <= 0 || R <= 0) return;
    // Present Value (purchase price) of ZCB
    const PV = FV / Math.pow(1 + R, Y);
    const discount = FV - PV;
    const totalReturn = (discount / PV) * 100;
    const ytm = R * 100;
    // CAGR equals ytm for ZCB
    // Build growth chart: value of ZCB at each year if held
    const chartData = Array.from({ length: Y + 1 }, (_, i) => ({
      name: `Yr ${i}`,
      Value: parseFloat((PV * Math.pow(1 + R, i)).toFixed(2)),
    }));
    setResult({ PV, FV, discount, totalReturn, ytm, Y, R, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setFaceValue(DEFAULTS.faceValue); setRate(DEFAULTS.rate); setYears(DEFAULTS.years); calculate(DEFAULTS.faceValue, DEFAULTS.rate, DEFAULTS.years); };

  const faqs = [
    { question: "What is a zero coupon bond?", answer: "A zero coupon bond (ZCB) is a fixed-income security that pays no periodic interest (coupons). Instead, it is issued at a deep discount to face value and redeems at full face value at maturity. The profit is the difference between the purchase price and face value." },
    { question: "How is a zero coupon bond priced?", answer: "PV = FV / (1 + r)^n, where PV = present value (purchase price), FV = face value, r = annual yield (as decimal), n = years to maturity. Example: a $10,000 bond at 5% yield for 10 years trades at $10,000 / (1.05)^10 = $6,139.13." },
    { question: "What is the yield to maturity of a zero coupon bond?", answer: "For a ZCB, YTM = (FV/PV)^(1/n) – 1. Since there are no coupon payments to reinvest, the YTM equals the stated discount rate exactly, eliminating reinvestment risk — a key advantage of zero coupon bonds." },
    { question: "Are zero coupon bonds taxed?", answer: "In the US, even though ZCBs pay no cash interest, the IRS requires holders to pay income tax annually on the 'phantom income' (accrued discount). This is called OID (Original Issue Discount) tax. Tax-exempt ZCBs (municipal zero coupons) avoid this issue." },
    { question: "What are common uses of zero coupon bonds?", answer: "ZCBs are popular for college savings (match maturity to enrollment date), retirement planning, and liability matching in pension funds. The US Treasury issues STRIPS — zero coupon instruments stripped from Treasury bonds — which are widely used by institutional investors." },
    { question: "How does duration differ for zero coupon bonds?", answer: "A zero coupon bond's duration equals its maturity — the longest possible duration for a given maturity. This makes ZCBs extremely sensitive to interest rate changes, suitable for investors making precise interest rate bets." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Financial", href: "/calculator#financial" }, { label: "Zero Coupon Bond Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Zero Coupon Bond Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Face Value (at Maturity)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={faceValue} onChange={(e) => setFaceValue(e.target.value)} className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="10000" min="1" />
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Annual Yield (YTM)</label>
              <div className="relative">
                <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="h-10 w-full pl-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="5" step="0.1" />
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
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Purchase Price (Present Value)</div>
                <div className="text-4xl font-bold text-primary">${fmt(result.PV)}</div>
                <div className="text-sm text-muted-foreground mt-1">Discount: ${fmt(result.discount)} · Total return: {fmt(result.totalReturn)}% over {result.Y} years</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Bond Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Face Value (at maturity)", value: `$${fmt(result.FV)}` },
                    { label: "Purchase Price (today)", value: `$${fmt(result.PV)}` },
                    { label: "Discount (profit at maturity)", value: `$${fmt(result.discount)}` },
                    { label: "Annual Yield (YTM)", value: `${fmt(result.ytm)}%` },
                    { label: "Years to Maturity", value: `${result.Y}` },
                    { label: "Total Return (%)", value: `${fmt(result.totalReturn)}%` },
                    { label: "Effective Annual Gain", value: `$${fmt(result.discount / result.Y)}` },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Bond Value Growth to Maturity</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(result.Y / 6) - 1)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
                    <Bar dataKey="Value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Bond Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Investment Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Invest Today", value: `$${fmt(result.PV)}` },
                    { label: "Receive at Maturity", value: `$${fmt(result.FV)}` },
                    { label: "Total Profit", value: `$${fmt(result.discount)}` },
                    { label: "YTM (Annual Return)", value: `${fmt(result.ytm)}%` },
                    { label: "Total Return", value: `${fmt(result.totalReturn)}%`, border: true, bold: true },
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
            <h2 className="text-2xl font-bold mb-3">What Is a Zero Coupon Bond Calculator?</h2>
            <p>A zero coupon bond calculator computes the present value (purchase price) of a zero coupon bond given its face value, yield to maturity, and years to maturity. Zero coupon bonds pay no periodic interest — instead, they are issued at a steep discount and redeemed at full face value at maturity. The profit is simply the difference: face value minus purchase price. Pre-filled at $10,000 face value, 5% yield, 10 years, the purchase price is $6,139.13 — delivering $3,860.87 total profit over a decade.</p>
            <p>Zero coupon bonds (also called ZCBs, discount bonds, or pure discount bonds) are used by individual investors, pension funds, and governments. US Treasury STRIPS are the most widely traded zero coupon instruments, derived by separating ("stripping") the principal and interest components of Treasury notes and bonds.</p>
            <h2 className="text-2xl font-bold mb-3">The Zero Coupon Bond Pricing Formula</h2>
            <p><strong>PV = FV / (1 + r)^n</strong></p>
            <p>Where PV = present value (purchase price), FV = face value (par value), r = annual yield to maturity as a decimal, n = years to maturity. For our default values: PV = $10,000 / (1.05)^10 = $10,000 / 1.6289 = $6,139.13. The bar chart shows how the bond's intrinsic value grows each year — a smooth exponential curve from $6,139 to $10,000.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The purchase price is what you pay today. The discount (profit) is the difference between face value and purchase price — this is your total return. Unlike coupon bonds, no reinvestment of interest is required, so the YTM you see is the YTM you get. Duration equals maturity for ZCBs, meaning a 10-year ZCB has a duration of 10 years — double the duration of a typical 10-year coupon bond.</p>
            <h2 className="text-2xl font-bold mb-3">Key Factors in Zero Coupon Bond Pricing</h2>
            <p><strong>Yield:</strong> Small yield changes have large price impacts because of the long duration. A 1% increase in yield on a 10-year ZCB decreases its price by approximately 10%. <strong>Maturity:</strong> Longer maturity = lower purchase price = higher total dollar return. A $10,000 face value ZCB at 5% for 20 years costs only $3,769 — less than half the 10-year price. <strong>Credit Quality:</strong> Investment-grade ZCBs offer lower yields; high-yield (junk) ZCBs offer higher returns but carry default risk.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p><strong>College Savings:</strong> A parent invests in $50,000 face value ZCBs maturing in 18 years at 4% yield. Purchase price: $50,000 / (1.04)^18 = $24,697. Perfect match for college enrollment date with no reinvestment guesswork. <strong>Retirement Planning:</strong> A 30-year ZCB at 5% with $100,000 face value costs $23,138 today. <strong>Tax-Exempt Municipal ZCB:</strong> Same math applies but interest accumulation is tax-free for state residents, effective after-tax yield is higher.</p>
            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Use ZCBs when you have a known future cash need (college, retirement, liability). Avoid holding taxable ZCBs in taxable accounts due to annual OID tax on phantom income — hold them in IRAs or 401(k)s instead. Compare the YTM on ZCBs to the compound interest rate on savings accounts or CDs for the same term. See also: <a href="/calculator/bond-yield-calculator">bond yield calculator</a>, <a href="/calculator/yield-to-maturity-calculator">yield to maturity calculator</a>, and <a href="/calculator/compound-interest-calculator">compound interest calculator</a>.</p>
            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>The zero coupon bond pricing formula involves exponents that are tedious to compute by hand. This calculator handles all computations instantly, shows the year-by-year growth chart, and breaks down your total profit and return. Use it to compare different ZCB scenarios and find the best fit for your investment timeline.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/zero-coupon-bond-calculator" />
          <PopularCalculators exclude="/calculator/zero-coupon-bond-calculator" />
        </div>
      </div>
    </>
  );
};

export default ZeroCouponBondCalculator;
