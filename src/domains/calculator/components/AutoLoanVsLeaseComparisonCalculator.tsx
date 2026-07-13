"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from "recharts";
import { pmt, depreciate } from "@/lib/auto/autoFinance";

interface CompareInputs {
  msrp: number;
  termMonths: number;
  buyAprPct: number;
  buyDownPct: number;
  buyTaxPct: number;
  leaseAprPct: number;       // money factor × 2400
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
  // Equity at end of the term: depreciation model gives market value.
  const depCurve = depreciate(msrp, Math.ceil(years));
  const equityAtEnd = depCurve[Math.ceil(years)] ?? 0;
  const buyNetCost = buyTotalCost - equityAtEnd;

  // ── LEASE path
  const capCost = msrp - Math.max(0, input.leaseDownPayment);
  const residualValue = msrp * (Math.max(0, input.leaseResidualPct) / 100);
  const depreciationLease = capCost - residualValue;
  const leaseMonthlyBase = depreciationLease / term;
  // Money factor from APR. Lease uses average of cap cost + residual as base.
  const moneyFactor = Math.max(0, input.leaseAprPct) / 2400;
  const financeCharge = ((capCost + residualValue) * moneyFactor);
  const leaseMonthly = leaseMonthlyBase + financeCharge;
  // Use tax on monthly (simplified ~tax on depreciation portion)
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

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const AutoLoanVsLeaseComparisonCalculator = () => {
  const [msrp, setMsrp] = useState(String(DEFAULTS.msrp));
  const [termMonths, setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [buyAprPct, setBuyAprPct] = useState(String(DEFAULTS.buyAprPct));
  const [buyDownPct, setBuyDownPct] = useState(String(DEFAULTS.buyDownPct));
  const [buyTaxPct, setBuyTaxPct] = useState(String(DEFAULTS.buyTaxPct));
  const [leaseAprPct, setLeaseAprPct] = useState(String(DEFAULTS.leaseAprPct));
  const [leaseDownPayment, setLeaseDownPayment] = useState(String(DEFAULTS.leaseDownPayment));
  const [leaseResidualPct, setLeaseResidualPct] = useState(String(DEFAULTS.leaseResidualPct));
  const [leaseAcqFee, setLeaseAcqFee] = useState(String(DEFAULTS.leaseAcqFee));
  const [leaseDisposition, setLeaseDisposition] = useState(String(DEFAULTS.leaseDisposition));
  const [annualMiles, setAnnualMiles] = useState(String(DEFAULTS.annualMiles));
  const [leaseMileageAllowance, setLeaseMileageAllowance] = useState(String(DEFAULTS.leaseMileageAllowance));
  const [leaseOveragePerMile, setLeaseOveragePerMile] = useState(String(DEFAULTS.leaseOveragePerMile));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<CompareResults | null>(null);

  const inputs: CompareInputs = useMemo(() => ({
    msrp: parseFloat(msrp) || 0,
    termMonths: parseFloat(termMonths) || 0,
    buyAprPct: parseFloat(buyAprPct) || 0,
    buyDownPct: parseFloat(buyDownPct) || 0,
    buyTaxPct: parseFloat(buyTaxPct) || 0,
    leaseAprPct: parseFloat(leaseAprPct) || 0,
    leaseDownPayment: parseFloat(leaseDownPayment) || 0,
    leaseResidualPct: parseFloat(leaseResidualPct) || 0,
    leaseAcqFee: parseFloat(leaseAcqFee) || 0,
    leaseDisposition: parseFloat(leaseDisposition) || 0,
    annualMiles: parseFloat(annualMiles) || 0,
    leaseMileageAllowance: parseFloat(leaseMileageAllowance) || 0,
    leaseOveragePerMile: parseFloat(leaseOveragePerMile) || 0,
  }), [msrp, termMonths, buyAprPct, buyDownPct, buyTaxPct, leaseAprPct, leaseDownPayment, leaseResidualPct, leaseAcqFee, leaseDisposition, annualMiles, leaseMileageAllowance, leaseOveragePerMile]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);

  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    setMsrp(String(DEFAULTS.msrp));
    setTermMonths(String(DEFAULTS.termMonths));
    setBuyAprPct(String(DEFAULTS.buyAprPct));
    setBuyDownPct(String(DEFAULTS.buyDownPct));
    setBuyTaxPct(String(DEFAULTS.buyTaxPct));
    setLeaseAprPct(String(DEFAULTS.leaseAprPct));
    setLeaseDownPayment(String(DEFAULTS.leaseDownPayment));
    setLeaseResidualPct(String(DEFAULTS.leaseResidualPct));
    setLeaseAcqFee(String(DEFAULTS.leaseAcqFee));
    setLeaseDisposition(String(DEFAULTS.leaseDisposition));
    setAnnualMiles(String(DEFAULTS.annualMiles));
    setLeaseMileageAllowance(String(DEFAULTS.leaseMileageAllowance));
    setLeaseOveragePerMile(String(DEFAULTS.leaseOveragePerMile));
    setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const chartData = results ? [
    { name: "Buy", Upfront: Math.round(results.buy.downPayment + results.buy.salesTax), Payments: Math.round(results.buy.totalPayments), Equity: -Math.round(results.buy.equityAtEnd), fill: "#3b82f6" },
    { name: "Lease", Upfront: Math.round(results.lease.upfrontCost), Payments: Math.round(results.lease.totalPayments), Equity: 0, fill: "#f59e0b" },
  ] : [];

  const faqs = [
    { question: "Is it cheaper to lease or buy a car?", answer: "Over a single 3-year cycle, leasing is usually cheaper on monthly cash flow because you only pay for the vehicle's depreciation plus a finance charge. But over multiple cycles, buying is typically cheaper because you build equity and own an asset at the end. This calculator shows the net cost of each over the same term." },
    { question: "What is a lease residual value?", answer: "The residual value is the estimated worth of the car at the end of the lease, expressed as a percentage of MSRP. Higher residuals mean lower lease payments because you pay for less depreciation. Residuals are set by the leasing company and are non-negotiable." },
    { question: "What is a money factor?", answer: "The money factor is the lease equivalent of an interest rate. Multiply it by 2400 to convert to an APR. For example, a money factor of 0.0019 equals roughly 4.5% APR. The calculator accepts the APR equivalent directly." },
    { question: "What is the acquisition fee?", answer: "An acquisition fee (or bank fee) is a one-time charge the leasing company bills to set up the lease, typically $500–$1,000. It is paid upfront or rolled into the capitalized cost. Some luxury brands waive it; others do not." },
    { question: "What is the disposition fee?", answer: "The disposition fee is charged at the end of the lease if you return the vehicle rather than buying it, typically $300–$500. It covers the leasing company's cost of reselling the car. It is usually waived if you lease another vehicle from the same brand." },
    { question: "What happens if I exceed the mileage allowance?", answer: "Leases charge a per-mile fee (typically $0.15–$0.30/mile) for every mile over the contracted allowance. This calculator applies your overage rate to miles driven above the allowance. Buying avoids this charge entirely — drive as much as you want." },
    { question: "Does this calculator include taxes?", answer: "Yes. We apply sales tax to the full MSRP for the buy path (typical for purchases) and to the monthly lease payment for the lease path (typical for leases in most U.S. states). Tax rules vary by state — confirm with your local dealer." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Auto Loan vs Lease" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Auto Loan vs Lease Comparison Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="msrp" label="Vehicle MSRP" value={msrp} onChange={setMsrp} prefix="$" />
              <CompactInput id="term" label="Term" value={termMonths} onChange={setTermMonths} suffix="months" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="buy-apr" label="Buy APR" value={buyAprPct} onChange={setBuyAprPct} suffix="%" />
              <CompactInput id="buy-down" label="Buy Down Payment" value={buyDownPct} onChange={setBuyDownPct} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="lease-apr" label="Lease APR (eq.)" value={leaseAprPct} onChange={setLeaseAprPct} suffix="%" />
              <CompactInput id="residual" label="Lease Residual" value={leaseResidualPct} onChange={setLeaseResidualPct} suffix="%" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="tax" label="Sales Tax" value={buyTaxPct} onChange={setBuyTaxPct} suffix="%" />
                  <CompactInput id="lease-down" label="Lease Down Payment" value={leaseDownPayment} onChange={setLeaseDownPayment} prefix="$" />
                  <CompactInput id="acq" label="Acquisition Fee" value={leaseAcqFee} onChange={setLeaseAcqFee} prefix="$" />
                  <CompactInput id="disp" label="Disposition Fee" value={leaseDisposition} onChange={setLeaseDisposition} prefix="$" />
                  <CompactInput id="annual-miles" label="Annual Miles" value={annualMiles} onChange={setAnnualMiles} />
                  <CompactInput id="allowance" label="Lease Mile Cap" value={leaseMileageAllowance} onChange={setLeaseMileageAllowance} suffix="mi" />
                  <CompactInput id="overage" label="Overage Rate" value={leaseOveragePerMile} onChange={setLeaseOveragePerMile} prefix="$" suffix="/mi" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex justify-end">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Lower Net Cost: {results.winner === "buy" ? "Buying" : "Leasing"}</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.savingsAmount).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">Saved over {Math.round(inputs.termMonths)} months vs the alternative</div>
                </div>

                <div className="grid grid-cols-2 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Buy Net Cost</div>
                    <div className="text-lg font-bold text-blue-600">${Math.round(results.buy.netCost).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Lease Total</div>
                    <div className="text-lg font-bold text-amber-600">${Math.round(results.lease.totalCost).toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Cost Component</th>
                        <th className="p-2.5 text-right w-[110px]">Buy</th>
                        <th className="p-2.5 pr-3 text-right w-[110px]">Lease</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Upfront / Down Payment</td>
                        <td className="p-2.5 text-right text-foreground">${Math.round(results.buy.downPayment).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">${Math.round(results.lease.upfrontCost).toLocaleString()}</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Sales Tax</td>
                        <td className="p-2.5 text-right text-foreground">${Math.round(results.buy.salesTax).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">incl.</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Monthly Payments ({Math.round(inputs.termMonths)} mo)</td>
                        <td className="p-2.5 text-right text-foreground">${Math.round(results.buy.totalPayments).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">${Math.round(results.lease.totalPayments).toLocaleString()}</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Mileage Overage</td>
                        <td className="p-2.5 text-right text-foreground">$0</td>
                        <td className="p-2.5 pr-3 text-right text-red-600">${Math.round(results.lease.mileageOverage).toLocaleString()}</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Disposition Fee</td>
                        <td className="p-2.5 text-right text-foreground">$0</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">${Math.round(results.lease.dispositionFee).toLocaleString()}</td>
                      </tr>
                      <tr className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                        <td className="p-2.5 pl-3 font-semibold text-foreground">Equity at End (−)</td>
                        <td className="p-2.5 text-right text-emerald-600">−${Math.round(results.buy.equityAtEnd).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">$0</td>
                      </tr>
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Net Cost of Ownership</td>
                        <td className="p-2.5 text-right text-blue-600">${Math.round(results.buy.netCost).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-amber-600">${Math.round(results.lease.totalCost).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Cost Breakdown: Buy vs Lease</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Upfront" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Payments" stackId="a" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
                    <div className="flex justify-between"><span className="text-muted-foreground">Vehicle MSRP:</span><span className="font-medium text-foreground">${Math.round(inputs.msrp).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Term:</span><span className="font-medium text-foreground">{Math.round(inputs.termMonths)} months</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Buy monthly:</span><span className="font-medium text-foreground">${results.buy.monthlyPayment.toFixed(0)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Lease monthly:</span><span className="font-medium text-foreground">${results.lease.monthlyPayment.toFixed(0)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Buy loan amount:</span><span className="font-medium text-foreground">${Math.round(results.buy.loanAmount).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Lease cap cost:</span><span className="font-medium text-foreground">${Math.round(results.lease.capitalizedCost).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Buy equity at end:</span><span className="font-medium text-foreground">${Math.round(results.buy.equityAtEnd).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Lease mileage overage:</span><span className="font-medium text-foreground">${Math.round(results.lease.mileageOverage).toLocaleString()}</span></div>
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between text-base">
                    <span className="font-semibold text-foreground">{results.winner === "buy" ? "Buy wins by:" : "Lease wins by:"}</span>
                    <span className="font-bold text-primary">${Math.round(results.savingsAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-12 space-y-8 text-base text-foreground max-w-[1180px]">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is the Auto Loan vs Lease Comparison Calculator?</h2>
            <p>The Auto Loan vs Lease Comparison Calculator helps you decide whether financing the purchase of a vehicle or leasing it will cost less over the same term. It runs both scenarios on the same vehicle, same term, and same annual mileage, then reports the net cost of each — including the equity you keep when you buy versus the fees and mileage penalties you face when you lease.</p>
            <p>This side-by-side view removes the marketing spin that surrounds both options. Dealers quote low lease payments and low purchase APRs in isolation, but the only fair comparison is total dollars out of pocket over the term you actually intend to keep the car. This calculator does exactly that.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p><strong>Buy path:</strong> The loan amount is MSRP minus the down payment. The monthly payment uses the standard amortization formula M = P × r(1+r)<sup>n</sup> / ((1+r)<sup>n</sup> − 1). Total cost = down payment + sales tax + all monthly payments. We then subtract the vehicle's estimated market value at the end of the term (from a depreciation curve) to get the <em>net</em> cost — because when you buy, you own an asset worth real money.</p>
            <p><strong>Lease path:</strong> The monthly payment is the sum of (1) the depreciation portion — (capitalized cost − residual) ÷ term — and (2) the finance charge — (cap cost + residual) × money factor. Money factor = APR ÷ 2400. Total cost = upfront costs (down + acquisition fee) + all monthly payments + mileage overage + disposition fee. There is no equity at the end.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary result declares the lower-cost option and the dollar gap. The 3-stat bar shows the two net costs side by side. The breakdown table itemizes every cost component for both paths so you can see exactly where the difference comes from. The stacked bar chart visualizes the relative sizes of upfront versus ongoing costs. The summary recaps every key input and output.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors That Drive the Difference</h2>
            <ul>
              <li><strong>Residual value:</strong> Higher residuals lower lease payments dramatically because you only pay for depreciation. Luxury cars often lease well because they hold residuals; quickly-depreciating cars lease poorly.</li>
              <li><strong>Term length:</strong> Short terms favor leasing (less depreciation to finance); long horizons favor buying because you keep using an owned asset after the loan ends.</li>
              <li><strong>Annual mileage:</strong> High-mileage drivers get penalized hard by leases. At 20,000 miles/year on a 36-month lease with a 36,000-mile cap, you face $7,200+ in overage charges.</li>
              <li><strong>Buy APR vs lease money factor:</strong> Manufacturer-subsidized lease rates (often 1–3% equivalent APR) can make leasing dramatically cheaper in any single cycle.</li>
              <li><strong>Sales tax treatment:</strong> Most states tax the full purchase price upfront for buys but only the monthly payment for leases, advantaging leases in the short term.</li>
              <li><strong>Disposition and acquisition fees:</strong> Unique to leases, these add $700–$1,500 to total lease cost and have no equivalent in a purchase.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>The Advanced Options panel exposes every lease-specific input: acquisition fee, disposition fee, lease mileage allowance, per-mile overage rate, and annual mileage. Default values reflect typical real-world charges. Adjust them to match the exact lease offer you are evaluating from a dealer worksheet.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <h3>Example 1: Mainstream sedan, 36 months</h3>
            <p>A $35,000 sedan with a 58% residual over 36 months typically shows lease payments around $425/month and a buy payment of $940/month at 6.9% APR. But once you net out the roughly $19,000 of equity you keep with the purchase, the buy's net cost over the 36 months is often only $2,000–$4,000 more than the lease — and you still own the car. Leasing wins on monthly cash flow; buying wins on long-term economics.</p>
            <h3>Example 2: High-mileage driver</h3>
            <p>Driving 20,000 miles/year on a 36-month lease with a 36,000-mile allowance adds 24,000 excess miles × $0.25 = $6,000 in overage. That single factor often flips the decision decisively toward buying.</p>
            <h3>Example 3: Subsidized lease</h3>
            <p>A manufacturer offering a 1% money factor on a vehicle with a 62% residual can make a 24-month lease genuinely cheaper than buying, even after fees. These subsidized leases are common at model-year-end and worth comparing.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <ul>
              <li><strong>Compare the same term and mileage.</strong> Mixing terms makes any comparison meaningless.</li>
              <li><strong>Negotiate the capitalized cost on a lease.</strong> The "selling price" of a lease is negotiable just like a purchase; don't focus only on the monthly payment.</li>
              <li><strong>Read the money factor carefully.</strong> Dealers sometimes mark up the money factor for extra profit. Ask for the buy rate.</li>
              <li><strong>Plan for disposition fees.</strong> If you will return the car, budget $300–$500 in disposition fees at lease end.</li>
              <li><strong>Watch the equity on buys.</strong> Vehicles that hold value (Toyota, Honda, some luxury brands) make buying especially attractive.</li>
              <li><strong>Model multiple cycles.</strong> If you replace cars every 3 years, run the calculator for a 9-year horizon by chaining 3 leases vs one buy kept for 9 years.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>By calculating the true net cost of both options on identical terms, this calculator replaces dealer marketing with hard math. You see exactly how much each option costs in total dollars, where the differences come from, and which choice leaves you better off. Use it before every car-shopping trip to negotiate from a position of clarity rather than monthly-payment confusion.</p>
          </div>
        </section>
        <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/auto-loan-vs-lease-comparison-calculator" />
        <PopularCalculators exclude="/calculator/auto-loan-vs-lease-comparison-calculator" />
      </div>
    </>
  );
};

export default AutoLoanVsLeaseComparisonCalculator;
