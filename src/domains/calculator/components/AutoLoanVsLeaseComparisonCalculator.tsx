"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { pmt, depreciate } from "@/lib/auto/autoFinance";

interface CompareInputs {
  msrp: number;
  termMonths: number;
  buyAprPct: number;
  buyDownPct: number;
  buyTaxPct: number;
  leaseAprPct: number;
  leaseDownPayment: number;
  leaseResidualPct: number;
  leaseAcqFee: number;
  leaseDisposition: number;
  annualMiles: number;
  leaseMileageAllowance: number;
  leaseOveragePerMile: number;
}

interface CompareResults {
  buy: {
    downPayment: number;
    loanAmount: number;
    monthlyPayment: number;
    totalPayments: number;
    salesTax: number;
    totalCost: number;
    equityAtEnd: number;
    netCost: number;
  };
  lease: {
    capitalizedCost: number;
    monthlyPayment: number;
    totalPayments: number;
    upfrontCost: number;
    mileageOverage: number;
    acqFee: number;
    dispositionFee: number;
    totalCost: number;
  };
  winner: "buy" | "lease";
  savingsAmount: number;
}

const DEFAULTS: CompareInputs = {
  msrp: 35000,
  termMonths: 36,
  buyAprPct: 6.9,
  buyDownPct: 10,
  buyTaxPct: 7,
  leaseAprPct: 4.5,
  leaseDownPayment: 3000,
  leaseResidualPct: 58,
  leaseAcqFee: 695,
  leaseDisposition: 400,
  annualMiles: 12000,
  leaseMileageAllowance: 36000,
  leaseOveragePerMile: 0.25,
};

function calculate(input: CompareInputs): CompareResults {
  const msrp = Math.max(0, input.msrp);
  const term = Math.max(1, Math.round(input.termMonths));
  const years = term / 12;

  // ── BUY path
  const buyDownPayment = msrp * (Math.max(0, input.buyDownPct) / 100);
  const salesTax = msrp * (Math.max(0, input.buyTaxPct) / 100);
  const loanAmount = msrp - buyDownPayment;
  const buyMonthly = pmt(loanAmount, input.buyAprPct, years);
  const buyTotalPayments = buyMonthly * term;
  const buyTotalCost = buyDownPayment + salesTax + buyTotalPayments;
  const depCurve = depreciate(msrp, Math.ceil(years));
  const equityAtEnd = depCurve[Math.ceil(years)] ?? 0;
  const buyNetCost = buyTotalCost - equityAtEnd;

  // ── LEASE path
  const capCost = msrp - Math.max(0, input.leaseDownPayment);
  const residualValue = msrp * (Math.max(0, input.leaseResidualPct) / 100);
  const depreciationLease = capCost - residualValue;
  const leaseMonthlyBase = depreciationLease / term;
  const moneyFactor = Math.max(0, input.leaseAprPct) / 2400;
  const financeCharge = (capCost + residualValue) * moneyFactor;
  const leaseMonthly = leaseMonthlyBase + financeCharge;
  const leaseTaxMonthly = leaseMonthly * (Math.max(0, input.buyTaxPct) / 100);
  const leaseMonthlyTotal = leaseMonthly + leaseTaxMonthly;
  const leaseTotalPayments = leaseMonthlyTotal * term;
  const leaseUpfront = Math.max(0, input.leaseDownPayment) + Math.max(0, input.leaseAcqFee);
  const milesUsed = Math.max(0, input.annualMiles) * years;
  const mileageOverage = Math.max(0, milesUsed - Math.max(0, input.leaseMileageAllowance)) * Math.max(0, input.leaseOveragePerMile);
  const leaseDisposition = Math.max(0, input.leaseDisposition);
  const leaseTotalCost = leaseUpfront + leaseTotalPayments + mileageOverage + leaseDisposition;

  const winner = buyNetCost <= leaseTotalCost ? "buy" : "lease";
  const savingsAmount = Math.abs(buyNetCost - leaseTotalCost);

  return {
    buy: {
      downPayment: buyDownPayment,
      loanAmount,
      monthlyPayment: buyMonthly,
      totalPayments: buyTotalPayments,
      salesTax,
      totalCost: buyTotalCost,
      equityAtEnd,
      netCost: buyNetCost,
    },
    lease: {
      capitalizedCost: capCost,
      monthlyPayment: leaseMonthlyTotal,
      totalPayments: leaseTotalPayments,
      upfrontCost: leaseUpfront,
      mileageOverage,
      acqFee: Math.max(0, input.leaseAcqFee),
      dispositionFee: leaseDisposition,
      totalCost: leaseTotalCost,
    },
    winner,
    savingsAmount,
  };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const fmt2 = (n: number) => "$" + fmt(n, 2);

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={Number.isFinite(value) ? value : ""} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const AutoLoanVsLeaseComparisonCalculator = () => {
  const [inputs, setInputs] = useState<CompareInputs>(DEFAULTS);
  const [result, setResult] = useState<CompareResults>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof CompareInputs) => (v: number) => setInputs((prev) => ({ ...prev, [k]: v }));

  const hasErrors =
    inputs.msrp < 0 || inputs.termMonths < 1 || inputs.buyAprPct < 0 || inputs.buyDownPct < 0 ||
    inputs.buyTaxPct < 0 || inputs.leaseAprPct < 0 || inputs.leaseDownPayment < 0 ||
    inputs.leaseResidualPct < 0 || inputs.leaseResidualPct > 100 || inputs.leaseAcqFee < 0 ||
    inputs.leaseDisposition < 0 || inputs.annualMiles < 0 || inputs.leaseMileageAllowance < 0 ||
    inputs.leaseOveragePerMile < 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const buyWins = result.winner === "buy";

  const breakdown = [
    { label: "MSRP", value: fmtMoney(inputs.msrp) },
    { label: "Term", value: `${fmt(inputs.termMonths, 0)} months` },
    { label: "Buy Down Payment", value: fmtMoney(result.buy.downPayment) },
    { label: "Buy Sales Tax", value: fmtMoney(result.buy.salesTax) },
    { label: "Buy Loan Amount", value: fmtMoney(result.buy.loanAmount) },
    { label: "Buy Monthly Payment", value: fmt2(result.buy.monthlyPayment) },
    { label: "Buy Total Payments", value: fmtMoney(result.buy.totalPayments) },
    { label: "Resale Value at End", value: fmtMoney(result.buy.equityAtEnd) },
    { label: "Net Cost — Buy", value: fmtMoney(result.buy.netCost) },
    { label: "Lease Upfront Fees", value: fmtMoney(result.lease.upfrontCost) },
    { label: "Lease Monthly Payment", value: fmt2(result.lease.monthlyPayment) },
    { label: "Lease Total Payments", value: fmtMoney(result.lease.totalPayments) },
    { label: "Mileage Overage", value: fmtMoney(result.lease.mileageOverage) },
    { label: "Disposition Fee", value: fmtMoney(result.lease.dispositionFee) },
    { label: "Total Cost — Lease", value: fmtMoney(result.lease.totalCost) },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="msrp" label="Vehicle MSRP" value={inputs.msrp} onChange={set("msrp")} prefix="$" />
            <NumInput id="term" label="Term" value={inputs.termMonths} onChange={set("termMonths")} suffix="mo" />
            <NumInput id="buy-apr" label="Buy APR" value={inputs.buyAprPct} onChange={set("buyAprPct")} suffix="%" />
            <NumInput id="buy-down" label="Buy Down Payment" value={inputs.buyDownPct} onChange={set("buyDownPct")} suffix="%" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Buy Path</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="buy-tax" label="Sales Tax" value={inputs.buyTaxPct} onChange={set("buyTaxPct")} suffix="%" />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Lease Terms</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="lease-apr" label="Lease APR" value={inputs.leaseAprPct} onChange={set("leaseAprPct")} suffix="%" />
                  <NumInput id="lease-down" label="Lease Down Payment" value={inputs.leaseDownPayment} onChange={set("leaseDownPayment")} prefix="$" />
                  <NumInput id="residual" label="Residual Value" value={inputs.leaseResidualPct} onChange={set("leaseResidualPct")} suffix="%" />
                  <NumInput id="acq-fee" label="Acquisition Fee" value={inputs.leaseAcqFee} onChange={set("leaseAcqFee")} prefix="$" />
                  <NumInput id="disposition" label="Disposition Fee" value={inputs.leaseDisposition} onChange={set("leaseDisposition")} prefix="$" />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Mileage</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="annual-miles" label="Annual Miles" value={inputs.annualMiles} onChange={set("annualMiles")} />
                  <NumInput id="mileage-allowance" label="Lease Mileage Allowance" value={inputs.leaseMileageAllowance} onChange={set("leaseMileageAllowance")} />
                  <NumInput id="overage" label="Overage per Mile" value={inputs.leaseOveragePerMile} onChange={set("leaseOveragePerMile")} prefix="$" />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Net Savings with {buyWins ? "Buying" : "Leasing"}</div>
            <div className="text-4xl font-bold text-primary">{fmtMoney(result.savingsAmount)}</div>
            <div className="text-sm text-muted-foreground mt-1">{buyWins ? "Buying" : "Leasing"} is cheaper over {fmt(inputs.termMonths, 0)} months by this amount</div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Buy Monthly</div>
              <div className={`text-lg font-bold mt-1 ${buyWins ? "text-emerald-600" : ""}`}>{fmt2(result.buy.monthlyPayment)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Lease Monthly</div>
              <div className={`text-lg font-bold mt-1 ${!buyWins ? "text-emerald-600" : ""}`}>{fmt2(result.lease.monthlyPayment)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Buy Net Cost</div>
              <div className={`text-lg font-bold mt-1 ${buyWins ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(result.buy.netCost)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Lease Total Cost</div>
              <div className={`text-lg font-bold mt-1 ${!buyWins ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(result.lease.totalCost)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Buy vs. Lease Comparison</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Savings with {buyWins ? "Buy" : "Lease"}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmtMoney(result.savingsAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">Savings with {buyWins ? "Buy" : "Lease"}</div>
                <div className="text-base font-bold text-primary">{fmtMoney(result.savingsAmount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is a Buy vs. Lease Comparison?</h2>
            <p className="text-muted-foreground leading-relaxed">Deciding whether to buy or lease a car comes down to comparing the true cost of each path over the same time horizon, not just the monthly payment. Buying spreads the vehicle's purchase price across a loan while you keep the asset, so the calculation must account for the down payment, sales tax, total loan payments, and the resale value the car still has when the term ends. Leasing is effectively paying for the depreciation you use — the difference between the capitalized cost and the residual value — plus a finance charge, upfront fees, mileage overage, and a disposition fee at return. The two paths feel similar month to month, which is exactly why the total-cost comparison matters: a lease with a tempting payment can still be the more expensive choice once fees and mileage are counted, and a buy with a higher payment can come out ahead once you bank the car's remaining value. This calculator models both paths side by side over the same term so the comparison is apples to apples.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Comparison Works</h2>
            <p className="text-muted-foreground leading-relaxed">On the buy side, the loan amount is the MSRP minus your down payment, and the monthly payment is computed with a standard amortization formula using your APR and term. The true cost of buying is the down payment plus sales tax plus every loan payment, minus the car's projected resale value at the end of the term — that residual equity is the reason buying can beat leasing despite higher monthly payments. On the lease side, the monthly payment is the financed depreciation plus a money-factor finance charge, with sales tax applied monthly. The money factor is the lease industry's way of expressing an interest rate: divide an APR by 2,400 to get the money factor, then multiply it by the sum of the capitalized cost and the residual value to get the monthly finance charge. The total lease cost adds the upfront down payment and acquisition fee, any mileage overage beyond your allowance (the miles you drive above the contract limit, billed per mile at return), and the disposition fee charged when you hand the car back. Whichever path has the lower total is the winner, and the difference is the net savings you would realize over the term.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Buying typically wins over longer terms and when resale values hold up, because you capture the car's remaining equity; leasing wins when you want lower payments, drive under the mileage allowance, and plan to swap vehicles frequently. The biggest sensitivity in the model is the residual value percentage — a lease with an aggressive residual looks artificially cheap, while a weak one pushes the monthly payment up sharply. Check the mileage inputs too: exceeding the allowance by even 3,000 miles a year at 25 cents per mile adds $750 a year on top of the lease, and most contracts bill overage at rates that make the dealer a tidy profit. Two caveats are worth remembering when you read the result. The resale value used on the buy side is a projection, and real market conditions can shift it either way; and leasing always carries the risk of wear-and-tear charges at return. Use this comparison as a planning tool for your actual numbers, and remember that taxes, insurance, and maintenance are roughly comparable across both paths for the same vehicle.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/auto-loan-vs-lease-comparison-calculator" />
      </div>
    </div>
  );
};

export default AutoLoanVsLeaseComparisonCalculator;