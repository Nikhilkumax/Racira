"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

interface BondYieldInputs {
  mode: "ytm" | "price";
  faceValue: number;
  couponRate: number;
  marketPrice: number;
  ytmInput: number;
  yearsToMaturity: number;
  frequency: number;
}

interface BondYieldResults {
  ytm: number;
  currentYield: number;
  bondPrice: number;
  totalCoupons: number;
  totalReturn: number;
  annualCoupon: number;
  isPremium: boolean;
  isDiscount: boolean;
  priceVsYtm: { ytm: number; price: number }[];
  cashFlows: { period: number; coupon: number; principal: number; total: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calcYTM = (price: number, face: number, coupon: number, periods: number, freq: number): number => {
  const c = (coupon / 100) * face / freq;
  let lo = 0.0001, hi = 2.0;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const r = mid / freq;
    let pv = 0;
    for (let t = 1; t <= periods; t++) pv += c / Math.pow(1 + r, t);
    pv += face / Math.pow(1 + r, periods);
    if (pv > price) lo = mid; else hi = mid;
    if (Math.abs(pv - price) < 0.0001) break;
  }
  return (lo + hi) / 2;
};

const calcPrice = (ytm: number, face: number, coupon: number, periods: number, freq: number): number => {
  const c = (coupon / 100) * face / freq;
  const r = ytm / freq;
  let pv = 0;
  for (let t = 1; t <= periods; t++) pv += c / Math.pow(1 + r, t);
  pv += face / Math.pow(1 + r, periods);
  return pv;
};

const calculateBond = (inputs: BondYieldInputs): BondYieldResults => {
  const { mode, faceValue, couponRate, marketPrice, ytmInput, yearsToMaturity, frequency } = inputs;
  const periods = yearsToMaturity * frequency;

  let ytm: number, bondPrice: number;
  if (mode === "ytm") {
    ytm = calcYTM(marketPrice, faceValue, couponRate, periods, frequency);
    bondPrice = marketPrice;
  } else {
    ytm = ytmInput / 100;
    bondPrice = calcPrice(ytm, faceValue, couponRate, periods, frequency);
  }

  const annualCoupon = (couponRate / 100) * faceValue;
  const currentYield = bondPrice > 0 ? (annualCoupon / bondPrice) * 100 : 0;
  const totalCoupons = annualCoupon * yearsToMaturity;
  const totalReturn = bondPrice > 0 ? (((faceValue - bondPrice) + totalCoupons) / bondPrice) * 100 : 0;

  const priceVsYtm = Array.from({ length: 40 }, (_, i) => {
    const y = (i + 1) * 0.005;
    return { ytm: parseFloat((y * 100).toFixed(2)), price: parseFloat(calcPrice(y, faceValue, couponRate, periods, frequency).toFixed(2)) };
  });

  const cashFlows = Array.from({ length: Math.min(periods, 40) }, (_, i) => {
    const period = i + 1;
    const couponPmt = annualCoupon / frequency;
    const principal = period === periods ? faceValue : 0;
    return { period, coupon: couponPmt, principal, total: couponPmt + principal };
  });

  const isPremium = bondPrice > faceValue;
  const isDiscount = bondPrice < faceValue;

  const summaryStats = [
    { label: "Current Yield", value: `${currentYield.toFixed(2)}%` },
    { label: "Total Return (If held)", value: `${totalReturn.toFixed(2)}%` },
    { label: "Bond Status", value: isPremium ? "Premium" : isDiscount ? "Discount" : "At Par" },
    { label: "Total Coupons", value: `$${totalCoupons.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Face Value (Principal)", amount: `$${faceValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Market Price", amount: `$${bondPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: isPremium ? "text-red-500" : isDiscount ? "text-emerald-500" : "text-primary" },
    { label: "Total Expected Interest", amount: `$${totalCoupons.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Capital Gain/Loss at Maturity", amount: `$${(faceValue - bondPrice).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: faceValue > bondPrice ? "text-emerald-500" : "text-red-500" },
    { label: "Total Value at Maturity", amount: `$${(faceValue + totalCoupons).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true },
  ];

  return {
    ytm: ytm * 100, currentYield, bondPrice, totalCoupons, totalReturn, annualCoupon, isPremium, isDiscount, priceVsYtm, cashFlows, summaryStats, breakdown
  };
};

const DEFAULTS = { mode: "ytm" as const, faceValue: "1000", couponRate: "5", marketPrice: "950", ytmInput: "5.5", yearsToMaturity: "10", frequency: "2" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function BondYieldCalculator() {
  const [mode, setMode] = useState<"ytm" | "price">(DEFAULTS.mode);
  const [faceValue, setFaceValue] = useState(DEFAULTS.faceValue);
  const [couponRate, setCouponRate] = useState(DEFAULTS.couponRate);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [marketPrice, setMarketPrice] = useState(DEFAULTS.marketPrice);
  const [ytmInput, setYtmInput] = useState(DEFAULTS.ytmInput);
  const [yearsToMaturity, setYearsToMaturity] = useState(DEFAULTS.yearsToMaturity);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);

  const [results, setResults] = useState<BondYieldResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateBond({
      mode,
      faceValue: parseFloat(faceValue) || 1000,
      couponRate: parseFloat(couponRate) || 0,
      marketPrice: parseFloat(marketPrice) || 0,
      ytmInput: parseFloat(ytmInput) || 0,
      yearsToMaturity: parseFloat(yearsToMaturity) || 10,
      frequency: parseInt(frequency) || 2
    }));
  };

  const handleReset = () => {
    setMode(DEFAULTS.mode); setFaceValue(DEFAULTS.faceValue); setCouponRate(DEFAULTS.couponRate);
    setMarketPrice(DEFAULTS.marketPrice); setYtmInput(DEFAULTS.ytmInput); setYearsToMaturity(DEFAULTS.yearsToMaturity); setFrequency(DEFAULTS.frequency);
    setShowAdvanced(false);
    setResults(calculateBond({ mode: DEFAULTS.mode, faceValue: parseFloat(DEFAULTS.faceValue), couponRate: parseFloat(DEFAULTS.couponRate), marketPrice: parseFloat(DEFAULTS.marketPrice), ytmInput: parseFloat(DEFAULTS.ytmInput), yearsToMaturity: parseFloat(DEFAULTS.yearsToMaturity), frequency: parseInt(DEFAULTS.frequency) }));
  };

  useEffect(() => { handleCalculate(); }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Bond Yield Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
          <p className="font-bold text-muted-foreground mb-1">YTM: {label}%</p>
          <p className="text-primary font-bold">Price: ${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Bond Yield Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bond Yield Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1.5">Solve For</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full shadow-sm">
                <button type="button" onClick={() => setMode("ytm")} className={`flex-1 text-xs sm:text-sm font-semibold transition-colors ${mode === "ytm" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Yield to Maturity (YTM)</button>
                <button type="button" onClick={() => setMode("price")} className={`flex-1 text-xs sm:text-sm font-semibold transition-colors border-l border-input ${mode === "price" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Bond Price</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="face" label="Face Value (Par)" value={faceValue} onChange={setFaceValue} prefix="$" />
              <CompactInput id="coupon" label="Coupon Rate" value={couponRate} onChange={setCouponRate} suffix="%" />
            </div>

            {mode === "ytm" ? (
              <CompactInput id="price" label="Current Market Price" value={marketPrice} onChange={setMarketPrice} prefix="$" />
            ) : (
              <CompactInput id="ytmIn" label="Required Yield (YTM)" value={ytmInput} onChange={setYtmInput} suffix="%" />
            )}

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Bond Terms</div>
                  <CompactInput id="years" label="Years to Maturity" value={yearsToMaturity} onChange={setYearsToMaturity} suffix="yrs" />
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1.5">Coupon Frequency</label>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="1">Annual (1x/yr)</option>
                      <option value="2">Semi-Annual (2x/yr)</option>
                      <option value="4">Quarterly (4x/yr)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    {mode === "ytm" ? "Estimated Yield to Maturity" : "Estimated Bond Price"}
                  </div>
                  <div className="text-4xl font-bold text-primary tracking-tighter mb-2 flex items-center gap-3">
                    {mode === "ytm" ? `${results.ytm.toFixed(2)}%` : `$${results.bondPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {mode === "ytm" && results.isPremium && "Bond trades at a premium. YTM is lower than coupon rate."}
                    {mode === "ytm" && results.isDiscount && "Bond trades at a discount. YTM is higher than coupon rate."}
                    {mode === "ytm" && !results.isPremium && !results.isDiscount && "Bond trades at par. YTM equals coupon rate."}
                    {mode === "price" && "This is the theoretical price to achieve your required yield."}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {results.summaryStats.map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stat.label}</div>
                      <div className="text-sm font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[14px] py-3 px-3">{item.label}</td>
                            <td className={`text-[14px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Price vs Yield Curve</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={results.priceVsYtm} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="ytm" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine x={results.ytm} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: "Current", fontSize: 10, fill: "hsl(var(--destructive))", position: "top" }} />
                        <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 card-calculator !p-0 border border-border bg-card overflow-hidden">
                  <h3 className="text-base font-bold p-4 pb-2">Cash Flow Schedule (First 40 Periods)</h3>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead className="bg-secondary/50 border-b border-border sticky top-0 z-10">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Period</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Coupon</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Principal</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Total Flow</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.cashFlows.map((row) => (
                          <tr key={row.period} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-2.5 px-3 font-semibold">{row.period}</td>
                            <td className="py-2.5 px-3 text-right text-emerald-600">${row.coupon.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="py-2.5 px-3 text-right">${row.principal.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                            <td className="py-2.5 px-3 text-right font-bold">${row.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Bond Yield Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A bond yield calculator is a highly specialized financial tool used to determine the exact return on investment (Yield to Maturity) of a bond, or conversely, to determine what a bond should be priced at given a required yield. Yield to Maturity (YTM) is the most comprehensive measure of a bond's return because it accounts for not just the periodic interest payments (coupons), but also the capital gain or loss realized when the bond matures and pays out its face value. This tool is essential for investors comparing bonds with different coupon rates, prices, and maturities.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Yield to Maturity vs. Current Yield</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Current Yield</strong> is simply a snapshot: it divides the annual coupon payment by the current market price. While useful for income investors, it is deeply flawed because it ignores what happens when the bond matures. <strong>Yield to Maturity (YTM)</strong> is the true annualized rate of return if you hold the bond until it matures. It uses a complex present-value formula that factors in the time value of money, the exact timing of every coupon payment, and the difference between your purchase price and the face value payout.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Premium vs. Discount Bonds</h2>
              <p className="text-muted-foreground leading-relaxed">
                When a bond trades for more than its $1,000 face value, it is a <strong>Premium Bond</strong>. This occurs when its coupon rate is higher than current market interest rates. Because you are overpaying upfront, your YTM will always be lower than the coupon rate. Conversely, a <strong>Discount Bond</strong> trades below $1,000 because its coupon is lower than current rates. Your YTM on a discount bond will always be higher than the coupon rate because you receive a capital gain when the issuer pays you the full $1,000 at maturity.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-3">The Price/Yield Relationship (Convexity)</h2>
              <p className="text-muted-foreground leading-relaxed">
                The most fundamental rule of fixed-income investing is that bond prices and bond yields move in opposite directions. If market interest rates rise, newly issued bonds pay more, making older bonds with lower coupons less attractive. To sell those older bonds, their price must drop until their YTM matches the new, higher market rates. Our Price vs Yield curve visually demonstrates this relationship, showing exactly how sensitive the bond's price is to shifting market interest rates.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Coupon Frequency</h2>
              <p className="text-muted-foreground leading-relaxed">
                The frequency of coupon payments affects the total return due to the power of compounding. While European bonds often pay annually, U.S. Treasury and corporate bonds almost universally pay semi-annually. Getting half your interest six months early allows you to reinvest that cash sooner, resulting in a slightly higher effective yield than an annual-paying bond with the same stated rate.
              </p>
            </div>
          </section>
          
          <FAQSection faqs={[
            { question: "What is Yield to Maturity (YTM)?", answer: "YTM is the total return an investor earns if they buy a bond today at the current market price and hold it until it matures, receiving all coupon payments and the face value at maturity. It accounts for the price discount or premium, all coupons, and the time value of money. YTM is the most comprehensive measure of a bond's return and is expressed as an annualized rate." },
            { question: "Why do bond prices and yields move in opposite directions?", answer: "When a bond's yield rises, its price falls, and vice versa. This is because a bond's cash flows are fixed. If market interest rates rise, investors demand a higher return, which means they'll only pay a lower price for an existing bond's fixed payments. Mathematically, the bond price is the present value of future cash flows discounted at the yield rate — a higher discount rate produces a lower present value." },
            { question: "What is a premium bond vs a discount bond?", answer: "A bond trades at a premium when its market price is above its face value, which happens when its coupon rate is higher than current market yields. A discount bond trades below face value when its coupon rate is below prevailing rates. Premium bonds have a YTM lower than their coupon rate, while discount bonds have a YTM higher than their coupon rate." },
            { question: "How does coupon frequency affect YTM?", answer: "More frequent coupon payments (e.g., semi-annual vs annual) slightly reduce the effective YTM calculation because investors receive money sooner and can reinvest it. Semi-annual compounding is standard for US Treasury and corporate bonds." }
          ]} pageUrl="https://racira.com/calculator/bond-yield-calculator" />
          <PopularCalculators exclude="/calculator/bond-yield-calculator" />
        </div>
      </div>
    </>
  );
}
