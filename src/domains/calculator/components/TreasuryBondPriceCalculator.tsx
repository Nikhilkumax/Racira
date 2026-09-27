"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface BondInputs {
  faceValue: number;
  couponRate: number;
  yearsToMaturity: number;
  marketYield: number;
  paymentsPerYear: number;
}

const DEFAULTS: BondInputs = {
  faceValue: 1000,
  couponRate: 4.5,
  yearsToMaturity: 10,
  marketYield: 5.2,
  paymentsPerYear: 2,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function priceFromYield(face: number, couponPerPeriod: number, periods: number, yieldPerPeriod: number): number {
  if (periods <= 0) return 0;
  if (yieldPerPeriod <= 0) return couponPerPeriod * periods + face;
  let price = 0;
  for (let t = 1; t <= periods; t++) {
    price += couponPerPeriod / Math.pow(1 + yieldPerPeriod, t);
  }
  price += face / Math.pow(1 + yieldPerPeriod, periods);
  return price;
}

interface BondResult {
  periods: number;
  couponPerPeriod: number;
  yieldPerPeriod: number;
  price: number;
  pricePer100: number;
  pvCoupons: number;
  pvFace: number;
  currentYield: number;
  totalCoupons: number;
  premium: number;
  macaulayDuration: number;
  modifiedDuration: number;
  priceAtLowerYield: number;
  priceAtHigherYield: number;
  onePercentMove: number;
  valid: boolean;
  errorMsg: string;
}

function computeBond(i: BondInputs): BondResult {
  const freq = Math.max(1, Math.round(i.paymentsPerYear));
  const invalid =
    i.faceValue <= 0 ||
    i.couponRate < 0 ||
    i.yearsToMaturity <= 0 ||
    i.marketYield < 0 ||
    i.paymentsPerYear < 1;

  const periods = Math.max(1, Math.round(i.yearsToMaturity * freq));
  const couponPerPeriod = (i.faceValue * i.couponRate) / 100 / freq;
  const yieldPerPeriod = i.marketYield / 100 / freq;
  const price = priceFromYield(i.faceValue, couponPerPeriod, periods, yieldPerPeriod);

  let pvCoupons = 0;
  let weighted = 0;
  for (let t = 1; t <= periods; t++) {
    const pv = couponPerPeriod / Math.pow(1 + yieldPerPeriod, t);
    pvCoupons += pv;
    weighted += (t / freq) * pv;
  }
  const pvFace = i.faceValue / Math.pow(1 + yieldPerPeriod, periods);
  weighted += (periods / freq) * pvFace;
  const macaulayDuration = price > 0 ? weighted / price : 0;

  const lowerYield = Math.max(0, i.marketYield - 1) / 100 / freq;
  const higherYield = (i.marketYield + 1) / 100 / freq;
  const priceAtLowerYield = priceFromYield(i.faceValue, couponPerPeriod, periods, lowerYield);
  const priceAtHigherYield = priceFromYield(i.faceValue, couponPerPeriod, periods, higherYield);

  return {
    periods,
    couponPerPeriod,
    yieldPerPeriod,
    price,
    pricePer100: (price / i.faceValue) * 100,
    pvCoupons,
    pvFace,
    currentYield: price > 0 ? ((couponPerPeriod * freq) / price) * 100 : 0,
    totalCoupons: couponPerPeriod * periods,
    premium: price - i.faceValue,
    macaulayDuration,
    modifiedDuration: macaulayDuration / (1 + yieldPerPeriod),
    priceAtLowerYield,
    priceAtHigherYield,
    onePercentMove: priceAtLowerYield - priceAtHigherYield,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a face value and maturity above zero, a non-negative coupon and yield, and at least one payment per year."
      : "",
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  hint?: string;
  type?: string;
  min?: string;
  step?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  prefix,
  suffix,
  tooltip,
  hint,
  type = "number",
  min,
  step,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function TreasuryBondPriceCalculator() {
  const [faceValue, setFaceValue] = useState(String(DEFAULTS.faceValue));
  const [couponRate, setCouponRate] = useState(String(DEFAULTS.couponRate));
  const [yearsToMaturity, setYearsToMaturity] = useState(String(DEFAULTS.yearsToMaturity));
  const [marketYield, setMarketYield] = useState(String(DEFAULTS.marketYield));
  const [paymentsPerYear, setPaymentsPerYear] = useState(String(DEFAULTS.paymentsPerYear));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BondInputs => ({
    faceValue: parseFloat(faceValue) || 0,
    couponRate: parseFloat(couponRate) || 0,
    yearsToMaturity: parseFloat(yearsToMaturity) || 0,
    marketYield: parseFloat(marketYield) || 0,
    paymentsPerYear: parseFloat(paymentsPerYear) || 2,
  });

  const [calcInputs, setCalcInputs] = useState<BondInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BondResult>(() => computeBond(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeBond(inputs));
  };

  const reset = () => {
    setFaceValue(String(DEFAULTS.faceValue));
    setCouponRate(String(DEFAULTS.couponRate));
    setYearsToMaturity(String(DEFAULTS.yearsToMaturity));
    setMarketYield(String(DEFAULTS.marketYield));
    setPaymentsPerYear(String(DEFAULTS.paymentsPerYear));
    setCalcInputs(DEFAULTS);
    setResults(computeBond(DEFAULTS));
  };

  const faqs = [
    {
      question: "Why does a bond price move opposite to interest rates?",
      answer:
        "Because the coupon is fixed. When new bonds pay more than yours, nobody will buy your lower coupon at face value, so the price falls until the total return matches what the market demands. When rates fall, your above-market coupon becomes desirable and the price rises. The bond becomes a discount bond in the first case and a premium bond in the second, and the size of the move depends on maturity and coupon level.",
    },
    {
      question: "What is duration and why does it matter?",
      answer:
        "Duration is the weighted average time until cash flows arrive, measured in years, and it also approximates the percentage price change for a one percent change in yield. A bond with a modified duration of eight loses roughly eight percent of its price when yields rise one percentage point. Longer maturities and lower coupons produce higher duration, which means more interest-rate risk.",
    },
    {
      question: "How is a Treasury bond price actually quoted?",
      answer:
        "Treasuries are quoted as a percentage of face value, in thirty-seconds of a point, so a quote of 94-19 means ninety-four and nineteen thirty-seconds per hundred of face, or roughly $945.94 on a thousand dollar bond. Yields are quoted to more decimals because small price changes translate into small yield changes. This calculator reports both the dollar price and the price per hundred, which is the standard market convention.",
    },
    {
      question: "Does the calculator include accrued interest?",
      answer:
        "No. The figure produced is the clean price, which is what market quotes normally show. The invoice price you actually pay adds accrued interest — the coupon earned since the last payment date and owed to the seller. On a settlement date between coupon dates, add the prorated share of the next coupon to the clean price to arrive at the cash amount due.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Treasury Bond Price Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Treasury Bond Price Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Bond Terms">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="face-value"
                  label="Face Value"
                  value={faceValue}
                  onChange={setFaceValue}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Principal repaid at maturity, typically $1,000 per bond."
                />
                <CompactInput
                  id="coupon-rate"
                  label="Coupon Rate"
                  value={couponRate}
                  onChange={setCouponRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Annual coupon paid on face value."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="years"
                  label="Years to Maturity"
                  value={yearsToMaturity}
                  onChange={setYearsToMaturity}
                  onEnter={runCalculate}
                  suffix="yr"
                  tooltip="Remaining time until the principal is repaid."
                />
                <CompactInput
                  id="market-yield"
                  label="Market Yield"
                  value={marketYield}
                  onChange={setMarketYield}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Yield to maturity demanded by the market."
                />
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Payment Frequency">
                    <CompactInput
                      id="frequency"
                      label="Payments Per Year"
                      value={paymentsPerYear}
                      onChange={setPaymentsPerYear}
                      onEnter={runCalculate}
                      min="1"
                      tooltip="Treasury notes pay semi-annually; use 2 for the standard case."
                    />
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Bond Price</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.price, 2)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.premium >= 0
                  ? `Trading at a premium of $${fmt(results.premium, 2)} to face value`
                  : `Trading at a discount of $${fmt(Math.abs(results.premium), 2)} to face value`}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Price per $100</span>
                <span className="font-extrabold text-foreground">{fmt(results.pricePer100, 3)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current Yield</span>
                <span className="font-extrabold text-foreground">{fmt(results.currentYield, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mod. Duration</span>
                <span className="font-extrabold text-foreground">{fmt(results.modifiedDuration, 2)} yr</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Valuation Line</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Coupon per period</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.couponPerPeriod, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.periods, 0)} periods</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Present value of coupons</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.pvCoupons, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.currentYield, 2)}% yield</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Present value of principal</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.pvFace, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">discounted at {fmt(calcInputs.marketYield, 2)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Total coupons over life</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.totalCoupons, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">before reinvestment</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Bond price</td>
                    <td className="p-2.5 text-right text-emerald-600">${fmt(results.price, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">clean price</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Macaulay Duration</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.macaulayDuration, 2)} yr</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Face Value</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.faceValue, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Price if Yield Falls 1%</span>
                  <span className="text-base font-bold text-emerald-600">${fmt(results.priceAtLowerYield, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Price if Yield Rises 1%</span>
                  <span className="text-base font-bold text-red-600">${fmt(results.priceAtHigherYield, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Move Across 1% Range</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.onePercentMove, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Premium or Discount</span>
                  <span className={`text-base font-bold ${results.premium >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {results.premium >= 0 ? "Premium" : "Discount"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Treasury Bond Price Calculator?</h2>
            <p>
              A Treasury bond price calculator converts a yield into the dollar price of a bond&apos;s future payments. Every
              coupon and the principal repayment are discounted back to today at the market yield, and the sum is the
              price. Because the coupon is fixed at issue, the price is the only thing that can move to reconcile the
              bond with current interest rates.
            </p>
            <p>
              Treasuries are quoted as a percentage of face value, so a bond trading at ninety-four and a half is priced at
              $945 per thousand of principal. The calculator reports both conventions, along with duration, so the price
              and its sensitivity to the next rate move can be read together.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The annual coupon is divided by the number of payments per year to produce the periodic cash flow, and the
              market yield is divided the same way. Each coupon is discounted by one plus the periodic yield raised to its
              period number, then the face value is discounted by the same factor over the full term. Adding the parts
              gives the clean price of the bond.
            </p>
            <p>
              Duration is calculated as the present-value-weighted average of the time until each cash flow arrives, which
              is why it is measured in years even though the bond may mature much later. Modified duration divides that by
              one plus the periodic yield to give the approximate percentage price change per one percent change in yield,
              the standard measure of interest-rate risk.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the price with a note on whether the bond trades at a premium or discount. The
              three-stat bar reports price per hundred of face, current yield and modified duration, while the table breaks
              the price into coupon value and principal value, and the summary shows the price either side of a one point
              rate move.
            </p>
            <p>
              Premium and discount both have a purpose. A premium bond pays more than the market rate and will drift down
              toward par as maturity approaches; a discount bond pays less and drifts up. Either way, the yield to maturity
              already accounts for that pull to par, so the total return should match the market yield if the bond is held
              to maturity and coupons are reinvested at that rate.
            </p>
            <p>
              Finally, use duration as your risk dial. Two bonds with the same yield and different maturities can carry
              very different price risk, and comparing duration is faster than comparing prices. If you expect rates to
              rise, shorter duration limits the damage; if you expect them to fall, longer duration amplifies the gain.
              Matching duration to your horizon is the most practical form of interest-rate management for individual
              investors. One practical warning: duration is a linear approximation, and it becomes less accurate for large
              rate moves because bond prices are convex in yield. Convexity means the gain from a one point fall in yields
              is slightly larger than the loss from a one point rise, which quietly works in the bondholder's favour. For
              modest moves the difference is small, but for a two or three point swing the straight duration estimate
              understates the effect, and that asymmetry is why long bonds can look better than their risk profile suggests
              during a rate-cutting cycle.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/treasury-bond-price-calculator" />
          <PopularCalculators exclude="/calculator/treasury-bond-price-calculator" />
        </div>
      </div>
    </>
  );
}
