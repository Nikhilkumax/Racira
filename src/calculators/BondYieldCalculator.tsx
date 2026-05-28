"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtPct = (n: number) => `${fmt(n)}%`;
const fmtUSD = (n: number) => `$${fmt(n)}`;

const Inp = ({ id, label, value, onChange, prefix, suffix, step = "any" }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; step?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step={step} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface Results {
  ytm: number;
  currentYield: number;
  bondPrice: number;
  totalCoupons: number;
  totalReturn: number;
  annualCoupon: number;
  priceVsYtm: { ytm: number; price: number }[];
  cashFlows: { period: number; coupon: number; principal: number; total: number }[];
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

export default function BondYieldCalculator() {
  const [mode, setMode] = useState<"ytm" | "price">("ytm");
  const [faceValue, setFaceValue] = useState("1000");
  const [couponRate, setCouponRate] = useState("5");
  const [marketPrice, setMarketPrice] = useState("950");
  const [ytmInput, setYtmInput] = useState("5.5");
  const [yearsToMaturity, setYearsToMaturity] = useState("10");
  const [frequency, setFrequency] = useState<"1" | "2" | "4">("2");
  const [res, setRes] = useState<Results | null>(null);

  useEffect(() => { calculate(); }, []);

  const calculate = () => {
    const face = parseFloat(faceValue) || 1000;
    const coupon = parseFloat(couponRate) || 5;
    const price = parseFloat(marketPrice) || 950;
    const ytmIn = parseFloat(ytmInput) / 100 || 0.055;
    const years = parseFloat(yearsToMaturity) || 10;
    const freq = parseInt(frequency);
    const periods = years * freq;

    let ytm: number, bondPrice: number;
    if (mode === "ytm") {
      ytm = calcYTM(price, face, coupon, periods, freq);
      bondPrice = price;
    } else {
      ytm = ytmIn;
      bondPrice = calcPrice(ytmIn, face, coupon, periods, freq);
    }

    const annualCoupon = (coupon / 100) * face;
    const currentYield = (annualCoupon / bondPrice) * 100;
    const totalCoupons = annualCoupon * years;
    const totalReturn = ((face - bondPrice) + totalCoupons) / bondPrice * 100;

    const priceVsYtm = Array.from({ length: 40 }, (_, i) => {
      const y = (i + 1) * 0.005;
      return { ytm: parseFloat((y * 100).toFixed(2)), price: parseFloat(calcPrice(y, face, coupon, periods, freq).toFixed(2)) };
    });

    const cashFlows = Array.from({ length: Math.min(periods, 20) }, (_, i) => {
      const period = i + 1;
      const couponPmt = (coupon / 100) * face / freq;
      const principal = period === periods ? face : 0;
      return { period, coupon: couponPmt, principal, total: couponPmt + principal };
    });

    setRes({ ytm: ytm * 100, currentYield, bondPrice, totalCoupons, totalReturn, annualCoupon, priceVsYtm, cashFlows });
  };

  const reset = () => {
    setMode("ytm"); setFaceValue("1000"); setCouponRate("5");
    setMarketPrice("950"); setYtmInput("5.5"); setYearsToMaturity("10"); setFrequency("2");
    setTimeout(calculate, 0);
  };

  const faqs = [
    { question: "What is Yield to Maturity (YTM)?", answer: "YTM is the total return an investor earns if they buy a bond today at the current market price and hold it until it matures, receiving all coupon payments and the face value at maturity. It accounts for the price discount or premium, all coupons, and the time value of money. YTM is the most comprehensive measure of a bond's return and is expressed as an annualized rate." },
    { question: "What is the difference between YTM and current yield?", answer: "Current yield is simply the annual coupon payment divided by the current market price. It only measures income return but ignores capital gain/loss from buying at a premium or discount. YTM includes both the income from coupons and the capital gain or loss from the difference between purchase price and face value at maturity, making it a more complete measure." },
    { question: "Why do bond prices and yields move in opposite directions?", answer: "When a bond's yield rises, its price falls, and vice versa. This is because a bond's cash flows are fixed. If market interest rates rise, investors demand a higher return, which means they'll only pay a lower price for an existing bond's fixed payments. Mathematically, the bond price is the present value of future cash flows discounted at the yield rate — a higher discount rate produces a lower present value." },
    { question: "What is a premium bond vs a discount bond?", answer: "A bond trades at a premium when its market price is above its face value, which happens when its coupon rate is higher than current market yields. A discount bond trades below face value when its coupon rate is below prevailing rates. A bond trading at exactly its face value is at par. Premium bonds have current yield < YTM, while discount bonds have current yield > YTM." },
    { question: "How does coupon frequency affect YTM?", answer: "More frequent coupon payments (e.g., semi-annual vs annual) slightly reduce the effective YTM because investors receive money sooner and can reinvest it. Semi-annual compounding is standard for US Treasury and corporate bonds. The difference is typically small but becomes more significant at higher interest rates." },
    { question: "What is duration and why does it matter?", answer: "Duration measures a bond's sensitivity to interest rate changes. Longer-duration bonds lose more value when interest rates rise. A rule of thumb: a bond with duration of 7 years will lose approximately 7% in price if yields rise by 1%. Duration helps investors manage interest rate risk in their bond portfolios." },
    { question: "What is a good bond yield?", answer: "A 'good' yield depends on the investor's goals and risk tolerance. US Treasury bonds offer near risk-free yields (currently 4-5%). Investment-grade corporate bonds offer 5-7%. High-yield (junk) bonds offer 7-12% but carry higher default risk. Always compare yield to credit risk, duration, and inflation expectations rather than chasing the highest number." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Bond Yield Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bond Yield Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Bond Parameters</h2>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Calculate</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {(["ytm", "price"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                    {m === "ytm" ? "Yield to Maturity" : "Bond Price"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Inp id="face" label="Face Value" value={faceValue} onChange={setFaceValue} prefix="$" />
              <Inp id="coupon" label="Coupon Rate" value={couponRate} onChange={setCouponRate} suffix="%" />
              {mode === "ytm"
                ? <Inp id="price" label="Market Price" value={marketPrice} onChange={setMarketPrice} prefix="$" />
                : <Inp id="ytm-in" label="Required Yield (YTM)" value={ytmInput} onChange={setYtmInput} suffix="%" />
              }
              <Inp id="years" label="Years to Maturity" value={yearsToMaturity} onChange={setYearsToMaturity} suffix="yrs" />
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">Coupon Frequency</span>
                <div className="flex rounded-md border border-border overflow-hidden">
                  {(["1", "2", "4"] as const).map(f => (
                    <button key={f} type="button" onClick={() => setFrequency(f)} className={`flex-1 py-2 text-sm font-semibold transition-colors ${frequency === f ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                      {f === "1" ? "Annual" : f === "2" ? "Semi-Annual" : "Quarterly"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Results</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>

                {/* Primary Result */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                    {mode === "ytm" ? "Yield to Maturity" : "Bond Price"}
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    {mode === "ytm" ? fmtPct(res.ytm) : fmtUSD(res.bondPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Current Yield: {fmtPct(res.currentYield)}
                  </div>
                </div>

                {/* Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th>
                      <th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      {[
                        { label: "Bond Price", value: fmtUSD(res.bondPrice) },
                        { label: "Face Value", value: fmtUSD(parseFloat(faceValue)) },
                        { label: "Annual Coupon", value: fmtUSD(res.annualCoupon) },
                        { label: "YTM", value: fmtPct(res.ytm) },
                        { label: "Current Yield", value: fmtPct(res.currentYield) },
                        { label: "Total Coupons", value: fmtUSD(res.totalCoupons) },
                        { label: "Total Return", value: fmtPct(res.totalReturn) },
                        { label: "Premium / Discount", value: `${res.bondPrice >= parseFloat(faceValue) ? "+" : ""}${fmtUSD(res.bondPrice - parseFloat(faceValue))}` },
                      ].map(row => (
                        <tr key={row.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-medium text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Chart */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Bond Price vs Yield</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={res.priceVsYtm} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ytm" tick={{ fontSize: 10 }} label={{ value: "YTM (%)", position: "insideBottom", offset: -2, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                      <Tooltip formatter={(v: any) => [`$${fmt(v)}`, "Price"]} labelFormatter={l => `YTM: ${l}%`} />
                      <ReferenceLine x={parseFloat(fmt(res.ytm))} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Current", fontSize: 9 }} />
                      <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Price" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "YTM", value: fmtPct(res.ytm) },
                    { label: "Current Yield", value: fmtPct(res.currentYield) },
                    { label: "Total Return", value: fmtPct(res.totalReturn) },
                    { label: "Bond Status", value: res.bondPrice < parseFloat(faceValue) ? "Discount" : res.bondPrice > parseFloat(faceValue) ? "Premium" : "At Par" },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
            <h2>What Is a Bond Yield Calculator?</h2>
            <p>A bond yield calculator helps investors determine the return they can expect from a bond investment. Whether you're evaluating corporate bonds, municipal bonds, U.S. Treasury bonds, or international debt securities, understanding yield is essential to comparing fixed-income investments and building a balanced portfolio. The two most critical yield metrics are Yield to Maturity (YTM) and current yield, each telling a different part of the story.</p>
            <p>Bond yield calculators are used by individual retail investors, portfolio managers, financial advisors, and institutional traders. They're especially valuable when comparing bonds with different coupon rates, maturities, and market prices to find the best risk-adjusted return. A bond priced at a discount to its face value always offers a higher YTM than its stated coupon rate, while a premium bond has a lower YTM.</p>

            <h2>How Bond Yield Is Calculated</h2>
            <p>The <strong>Yield to Maturity (YTM)</strong> is calculated using an iterative process since there's no simple closed-form solution. The formula finds the discount rate (r) that equates the bond's current price to the present value of all future cash flows:</p>
            <p><strong>Price = Σ [C / (1+r)^t] + [Face Value / (1+r)^n]</strong></p>
            <p>Where C is the periodic coupon payment, r is the periodic yield, t is the period number, and n is the total number of periods. This calculator uses a binary search algorithm to solve for r with high precision.</p>
            <p>The <strong>Current Yield</strong> is simpler: Current Yield = Annual Coupon / Market Price × 100. For example, a $1,000 bond paying $50/year priced at $950 has a current yield of 5.26%.</p>

            <h2>Understanding Your Results</h2>
            <p>When a bond trades at a <strong>discount</strong> (price below face value), its YTM will be higher than its coupon rate. This is because you're getting the coupons plus a capital gain when the bond matures at face value. Conversely, a <strong>premium bond</strong> (price above face value) has a YTM lower than the coupon rate because you're paying more now and will receive less at maturity.</p>
            <p>The <strong>bond price vs yield chart</strong> illustrates the inverse relationship: as yields rise, prices fall, and vice versa. This curve is convex (bowed outward), meaning price increases from yield drops are larger than price decreases from yield rises of the same magnitude — a property called convexity.</p>

            <h2>Key Bond Concepts Explained</h2>
            <h3>Face Value (Par Value)</h3>
            <p>The face value is the amount the bond issuer promises to repay at maturity. Most bonds have a $1,000 face value. This is also the base for calculating coupon payments. The face value doesn't change regardless of where the bond trades in the market.</p>
            <h3>Coupon Rate</h3>
            <p>The coupon rate is the annual interest rate stated on the bond, expressed as a percentage of face value. A $1,000 bond with a 5% coupon pays $50/year. Most U.S. corporate and Treasury bonds pay semi-annually, so $25 every 6 months. The coupon rate is fixed at issuance and never changes.</p>
            <h3>Market Price</h3>
            <p>The market price is what buyers and sellers agree to pay for the bond in the secondary market. It fluctuates based on changes in interest rates, credit quality, time to maturity, and supply/demand. Bond prices and yields always move in opposite directions.</p>
            <h3>Years to Maturity</h3>
            <p>This is the remaining time until the bond issuer repays the face value. Longer-maturity bonds are more sensitive to interest rate changes (higher duration) and typically offer higher yields to compensate investors for the added risk.</p>

            <h2>Types of Bond Yields</h2>
            <p>Beyond YTM and current yield, investors track several other yield metrics. <strong>Yield to Call (YTC)</strong> applies to callable bonds — those the issuer can redeem before maturity. If rates fall, issuers may call bonds and reissue at lower rates. YTC calculates return assuming the bond is called at the earliest call date.</p>
            <p><strong>Tax-Equivalent Yield (TEY)</strong> allows comparison between tax-exempt municipal bonds and taxable bonds: TEY = Municipal Yield / (1 - Tax Rate). A 4% muni yield is equivalent to 6.25% for someone in the 36% tax bracket.</p>
            <p><strong>Spread over Treasuries</strong> measures the additional yield a corporate or junk bond pays over a comparable-maturity Treasury, compensating for credit risk. Investment-grade spreads are typically 50–200 basis points; high-yield spreads are 300–700+ basis points.</p>

            <h2>Practical Bond Investment Scenarios</h2>
            <p><strong>Scenario 1 — Rising Rate Environment:</strong> You own a 10-year Treasury bond with a 3% coupon bought at par ($1,000). Rates rise to 5%. Your bond's price drops to approximately $845 (a 15.5% price decline). If you sell, you realize a capital loss. If you hold to maturity, you still receive face value — but missed out on higher-yielding new bonds for years.</p>
            <p><strong>Scenario 2 — Discount Bond Opportunity:</strong> A 5-year corporate bond with 4% coupon is priced at $920 due to credit concerns. YTM = approximately 6.1%. If the company doesn't default, you earn 6.1% annually — well above the 4% coupon. The discount compensates for credit risk.</p>
            <p><strong>Scenario 3 — Laddering Strategy:</strong> Build a bond ladder with maturities in 2, 4, 6, 8, and 10 years. As each bond matures, reinvest at prevailing rates. This smooths out interest rate risk and provides regular liquidity without needing to sell bonds early.</p>

            <h2>Tips for Bond Investors</h2>
            <p>Always compare YTM, not current yield, when evaluating bonds — especially those trading at significant premiums or discounts. Account for taxes: Treasury interest is exempt from state tax; municipal bond interest is often federal tax-exempt. Consider credit ratings (Moody's, S&P) carefully: BBB- is the lowest investment grade; below that is high yield (junk). Diversify across maturities, sectors, and credit qualities. Be cautious with callable bonds in falling-rate environments — your best bonds get called away just when you'd prefer to keep them.</p>

            <h2>Benefits of Using a Bond Yield Calculator</h2>
            <p>Calculating YTM manually requires iterative trial-and-error or a financial calculator. This tool solves it instantly with high precision, letting you quickly compare multiple bonds, model different yield scenarios, and understand how price changes affect returns. Whether you're a beginner building your first bond ladder or a professional managing a fixed-income portfolio, an accurate yield calculator is indispensable for making informed decisions.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bond-yield-calculator" />
          <PopularCalculators exclude="/calculator/bond-yield-calculator" />
        </div>
      </div>
    </>
  );
}
