"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BondResult {
  price: number;
  premium: number;
  currentYield: number;
  annualIncome: number;
  pvCoupons: number;
  pvFace: number;
  totalPeriods: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBond(fv: number, crPct: number, ytmPct: number, years: number, paymentsPerYear: number): BondResult {
  const cr = (crPct || 0) / 100;
  const y = (ytmPct || 0) / 100;
  const m = Math.max(1, paymentsPerYear || 2);
  const totalPeriods = years * m;
  const periodRate = y / m;
  const couponPayment = (fv * cr) / m;

  const pvCoupons = periodRate > 0 ? couponPayment * (1 - Math.pow(1 + periodRate, -totalPeriods)) / periodRate : couponPayment * totalPeriods;
  const pvFace = fv / Math.pow(1 + periodRate, totalPeriods);
  const price = pvCoupons + pvFace;
  const premium = price - fv;
  const annualIncome = fv * cr;
  const currentYield = price > 0 ? (annualIncome / price) * 100 : 0;

  return {
    price,
    premium,
    currentYield,
    annualIncome,
    pvCoupons,
    pvFace,
    totalPeriods,
    chartData: [
      { name: "PV of Coupons", value: +pvCoupons.toFixed(2) },
      { name: "PV of Face Value", value: +pvFace.toFixed(2) },
      { name: "Bond Price", value: +price.toFixed(2) },
    ],
    breakdown: [
      { label: "Face Value", value: `$${fv.toLocaleString()}` },
      { label: "Coupon Rate", value: `${crPct}%` },
      { label: "Yield to Maturity", value: `${ytmPct}%` },
      { label: "Years to Maturity", value: `${years}` },
      { label: "Payments per Year", value: `${m}` },
      { label: "PV of Coupon Payments", value: `$${pvCoupons.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "PV of Face Value", value: `$${pvFace.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "Bond Price", value: `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "Premium / (Discount)", value: `${premium >= 0 ? "$" + premium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " premium" : "$" + (-premium).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " discount"}` },
      { label: "Annual Coupon Income", value: `$${annualIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { label: "Current Yield", value: `${currentYield.toFixed(3)}%` },
    ],
    summaryStats: [
      { label: "Bond Price", value: `$${price.toFixed(2)}` },
      { label: "Premium/(Discount)", value: `${premium >= 0 ? "+$" : "-$"}${Math.abs(premium).toFixed(2)}` },
      { label: "Annual Income", value: `$${annualIncome.toFixed(2)}` },
      { label: "Current Yield", value: `${currentYield.toFixed(3)}%` },
      { label: "Coupon Payment", value: `$${couponPayment.toFixed(2)}/period` },
      { label: "Total Periods", value: `${totalPeriods}` },
    ],
  };
}

const DEFAULTS = { faceValue: "1000", couponRate: "5", ytm: "6", years: "10", payments: "2" };

export default function BondPriceCalculator() {
  const [faceValue, setFaceValue] = useState(DEFAULTS.faceValue);
  const [couponRate, setCouponRate] = useState(DEFAULTS.couponRate);
  const [ytm, setYtm] = useState(DEFAULTS.ytm);
  const [years, setYears] = useState(DEFAULTS.years);
  const [paymentsPerYear, setPaymentsPerYear] = useState(DEFAULTS.payments);
  const [result, setResult] = useState<BondResult>(() => calcBond(1000, 5, 6, 10, 2));

  const calculate = () => setResult(calcBond(parseFloat(faceValue) || 1000, parseFloat(couponRate) || 0, parseFloat(ytm) || 0, parseFloat(years) || 0, parseInt(paymentsPerYear) || 2));
  const reset = () => { setFaceValue(DEFAULTS.faceValue); setCouponRate(DEFAULTS.couponRate); setYtm(DEFAULTS.ytm); setYears(DEFAULTS.years); setPaymentsPerYear(DEFAULTS.payments); setResult(calcBond(1000, 5, 6, 10, 2)); };
  useEffect(() => { setResult(calcBond(1000, 5, 6, 10, 2)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const premiumColor = result.premium >= 0 ? "text-emerald-600" : "text-red-500";

  const faqs = [
    { question: "What is bond price?", answer: "Bond price is the present value of all future cash flows (coupon payments + face value), discounted at the required yield to maturity (YTM)." },
    { question: "Why does bond price move inversely to interest rates?", answer: "When market interest rates rise, new bonds pay higher coupons, making existing lower-coupon bonds less attractive. Their prices must fall to make their yield competitive with the market rate." },
    { question: "What is Yield to Maturity (YTM)?", answer: "YTM is the total return anticipated if the bond is held until maturity. It accounts for coupon payments, reinvestment of those coupons, and the difference between purchase price and face value." },
    { question: "What is a bond trading at a discount vs. premium?", answer: "A bond trades at a discount when its price is below face value (YTM > coupon rate). It trades at a premium when its price is above face value (YTM < coupon rate). At par, price equals face value." },
    { question: "What is current yield?", answer: "Current yield = Annual Coupon ÷ Current Market Price. It shows the annual income as a percentage of today's price but ignores capital gains/losses from price-to-par convergence at maturity." },
    { question: "What is duration and why does it matter?", answer: "Duration measures a bond's sensitivity to interest rate changes. A bond with duration of 5 years will lose approximately 5% in value for each 1% rise in interest rates." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Bond Price Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Bond Price Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Face Value</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={faceValue} onChange={e => setFaceValue(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Coupon Rate</label>
                <div className={inp}><input type="number" value={couponRate} onChange={e => setCouponRate(e.target.value)} className={ci} min={0} step={0.1} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Yield to Maturity</label>
                <div className={inp}><input type="number" value={ytm} onChange={e => setYtm(e.target.value)} className={ci} min={0} step={0.1} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Years to Maturity</label>
                <div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} min={0} step={0.5} /><span className="pr-3 text-muted-foreground text-sm">yr</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Payment Frequency</label>
              <select value={paymentsPerYear} onChange={e => setPaymentsPerYear(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="1">Annual</option>
                <option value="2">Semi-Annual (most common)</option>
                <option value="4">Quarterly</option>
                <option value="12">Monthly</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Bond Price</div>
              <div className="text-4xl font-extrabold text-primary">${result.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className={`text-sm font-semibold mt-1 ${premiumColor}`}>{result.premium >= 0 ? `Premium of $${result.premium.toFixed(2)}` : `Discount of $${Math.abs(result.premium).toFixed(2)}`}</div>
              <div className="text-sm text-muted-foreground mt-1">Current yield {result.currentYield.toFixed(3)}% · {result.annualIncome.toFixed(2)}/yr income</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Annual Income", `$${result.annualIncome.toFixed(2)}`], ["Current Yield", `${result.currentYield.toFixed(3)}%`], ["Premium/(Disc)", `${result.premium >= 0 ? "+$" : "-$"}${Math.abs(result.premium).toFixed(2)}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Valuation Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Price Components</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 2 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Bond Pricing Works</h2>
            <p>A bond is essentially a loan from an investor to a borrower (typically a government or corporation). In exchange for the loan, the borrower promises to pay regular interest payments (coupons) and return the principal (face value) at maturity. The fair price of a bond equals the present value of all future cash flows, discounted at the current market interest rate (yield to maturity).</p>
            <h2 className="text-2xl font-bold mb-3">The Inverse Relationship Between Price and Yield</h2>
            <p>The most important principle in bond investing is the inverse relationship between bond prices and interest rates. When prevailing interest rates rise, newly issued bonds offer higher coupons, making existing bonds with lower coupons less attractive. To compensate, the price of existing bonds falls until their yield matches the new market rate. Conversely, when rates fall, existing bonds with higher coupons become more valuable, and their prices rise.</p>
            <h2 className="text-2xl font-bold mb-3">Discount vs. Premium Bonds</h2>
            <p>A bond sells at a <strong>discount</strong> when its coupon rate is lower than current market rates (YTM &gt; coupon). It sells at a <strong>premium</strong> when its coupon rate exceeds current market rates (YTM &lt; coupon). As maturity approaches, the price converges toward face value — this is called "pull to par."</p>
            <h2 className="text-2xl font-bold mb-3">Calculating Bond Price: The Formula</h2>
            <p>Bond Price = Σ [Coupon / (1 + YTM/m)^t] + [Face Value / (1 + YTM/m)^(n×m)], where m is payments per year, n is years to maturity, and t runs from 1 to n×m. This sums the present value of each periodic coupon payment plus the present value of the lump-sum face value repayment at maturity.</p>
            <h2 className="text-2xl font-bold mb-3">Duration and Interest Rate Sensitivity</h2>
            <p>Duration is a measure of a bond's sensitivity to interest rate changes. A bond with a modified duration of 7 years will decrease in value by approximately 7% if interest rates rise by 1%. Longer maturity bonds have higher duration (more sensitive), and lower-coupon bonds have higher duration for the same maturity.</p>
            <h2 className="text-2xl font-bold mb-3">Bond Yield Measures</h2>
            <p>There are multiple yield measures for bonds: <strong>Coupon Rate</strong> (stated annual interest as % of face value), <strong>Current Yield</strong> (annual coupon ÷ current price), <strong>Yield to Maturity (YTM)</strong> (total return if held to maturity), and <strong>Yield to Call (YTC)</strong> (return if the bond is called by the issuer before maturity). YTM is the most comprehensive and most widely used.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bond-price-calculator" />
          <PopularCalculators exclude="/calculator/bond-price-calculator" />
        </div>
      </div>
    </>
  );
}
