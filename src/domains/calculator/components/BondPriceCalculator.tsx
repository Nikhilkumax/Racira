"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function BondPriceCalculator() {
  const [faceValue, setFaceValue] = useState("1000");
  const [couponRate, setCouponRate] = useState("5");
  const [ytm, setYtm] = useState("6");
  const [years, setYears] = useState("10");
  const [paymentsPerYear, setPaymentsPerYear] = useState("2");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ price: 0, premium: 0, currentYield: 0, annualIncome: 0 });

  const handleCalculate = () => {
    const fv = parseFloat(faceValue) || 1000;
    const cr = (parseFloat(couponRate) || 0) / 100;
    const y = (parseFloat(ytm) || 0) / 100;
    const n = parseFloat(years) || 0;
    const m = parseFloat(paymentsPerYear) || 2;
    const totalPeriods = n * m;
    const periodRate = y / m;
    const couponPayment = (fv * cr) / m;

    const pvCoupons = couponPayment * (1 - Math.pow(1 + periodRate, -totalPeriods)) / periodRate;
    const pvFace = fv / Math.pow(1 + periodRate, totalPeriods);
    const price = pvCoupons + pvFace;
    const premium = price - fv;
    const annualIncome = fv * cr;
    const currentYield = price > 0 ? (annualIncome / price) * 100 : 0;

    setResults({ price, premium, currentYield, annualIncome });
    setShowResults(true);
  };

  const reset = () => { setFaceValue("1000"); setCouponRate("5"); setYtm("6"); setYears("10"); setPaymentsPerYear("2"); setShowResults(false); };

  const faqs = [
    { question: "What is bond price?", answer: "Bond price is the present value of all future cash flows (coupon payments + face value), discounted at the required yield to maturity (YTM)." },
    { question: "Why does bond price move inversely to interest rates?", answer: "When market interest rates rise, new bonds pay higher coupons, making existing lower-coupon bonds less attractive. Their prices must fall to make their yield competitive with the market rate." },
    { question: "What is Yield to Maturity (YTM)?", answer: "YTM is the total return anticipated if the bond is held until maturity. It accounts for coupon payments, reinvestment of those coupons, and the difference between purchase price and face value." },
    { question: "What is a bond trading at a discount vs. premium?", answer: "A bond trades at a discount when its price is below face value (YTM > coupon rate). It trades at a premium when its price is above face value (YTM < coupon rate). At par, price equals face value." },
    { question: "What is current yield?", answer: "Current yield = Annual Coupon ÷ Current Market Price. It shows the annual income as a percentage of today's price but ignores capital gains/losses from price-to-par convergence at maturity." },
    { question: "What is duration and why does it matter?", answer: "Duration measures a bond's sensitivity to interest rate changes. A bond with duration of 5 years will lose approximately 5% in value for each 1% rise in interest rates." },
    { question: "What is the difference between corporate and government bonds?", answer: "Government bonds (Treasuries) are backed by the government and carry negligible default risk. Corporate bonds carry credit risk and must offer higher yields to compensate for the possibility of default." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Bond Price Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bond Price Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="face-value" label="Face / Par Value ($)" value={faceValue} onChange={setFaceValue} prefix="$" tooltip="The bond's face value, typically $1,000 for corporate bonds." />
                <InputField id="coupon-rate" label="Annual Coupon Rate (%)" value={couponRate} onChange={setCouponRate} suffix="%" tooltip="The stated interest rate paid annually on the bond's face value." />
                <InputField id="ytm" label="Yield to Maturity (%)" value={ytm} onChange={setYtm} suffix="%" tooltip="The required return / market interest rate used to discount cash flows." />
                <InputField id="years" label="Years to Maturity" value={years} onChange={setYears} tooltip="Number of years until the bond matures and returns face value." />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Payment Frequency</label>
                  <select value={paymentsPerYear} onChange={e => setPaymentsPerYear(e.target.value)} className="input-calc">
                    <option value="1">Annual</option>
                    <option value="2">Semi-Annual (most common)</option>
                    <option value="4">Quarterly</option>
                    <option value="12">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">Bond Valuation Results</h2>
                <ResultDisplay items={[
                  { label: "Bond Price", value: results.price, highlight: true },
                  { label: "Premium / (Discount) to Par", value: results.premium, highlight: results.premium !== 0 },
                  { label: "Annual Coupon Income", value: results.annualIncome },
                  { label: "Current Yield", value: 0, textValue: `${results.currentYield.toFixed(3)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">How Bond Pricing Works</h2>
              <p>A bond is essentially a loan from an investor to a borrower (typically a government or corporation). In exchange for the loan, the borrower promises to pay regular interest payments (coupons) and return the principal (face value) at maturity. The fair price of a bond equals the present value of all future cash flows, discounted at the current market interest rate (yield to maturity).</p>
              <h2 className="text-2xl font-bold mb-3">The Inverse Relationship Between Price and Yield</h2>
              <p>The most important principle in bond investing is the inverse relationship between bond prices and interest rates. When prevailing interest rates rise, newly issued bonds offer higher coupons, making existing bonds with lower coupons less attractive. To compensate, the price of existing bonds falls until their yield matches the new market rate. Conversely, when rates fall, existing bonds with higher coupons become more valuable, and their prices rise.</p>
              <h2 className="text-2xl font-bold mb-3">Discount vs. Premium Bonds</h2>
              <p>A bond sells at a <strong>discount</strong> when its coupon rate is lower than current market rates (YTM &gt; coupon). For example, a 4% coupon bond when market rates are 6% will trade below par. It sells at a <strong>premium</strong> when its coupon rate exceeds current market rates (YTM &lt; coupon). A 6% coupon bond when rates are 4% trades above par. As maturity approaches, the price converges toward face value — this is called "pull to par."</p>
              <h2 className="text-2xl font-bold mb-3">Calculating Bond Price: The Formula</h2>
              <p>Bond Price = Σ [Coupon / (1 + YTM/m)^t] + [Face Value / (1 + YTM/m)^(n×m)], where m is payments per year, n is years to maturity, and t runs from 1 to n×m. This sums the present value of each periodic coupon payment plus the present value of the lump-sum face value repayment at maturity.</p>
              <h2 className="text-2xl font-bold mb-3">Duration and Interest Rate Sensitivity</h2>
              <p>Duration is a measure of a bond's sensitivity to interest rate changes. A bond with a modified duration of 7 years will decrease in value by approximately 7% if interest rates rise by 1%. Longer maturity bonds have higher duration (more sensitive), and lower-coupon bonds have higher duration for the same maturity. Understanding duration is essential for managing fixed-income portfolio risk.</p>
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
