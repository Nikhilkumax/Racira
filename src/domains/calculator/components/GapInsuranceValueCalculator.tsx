"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend } from "recharts";
import { pmt, amortize, depreciate, fmtUsd } from "@/lib/auto/autoFinance";

interface Inputs {
  purchasePrice: number;
  downPayment: number;
  loanApr: number;
  loanTermYears: number;
  salesTaxRate: number;
  feesAndAddOns: number;
  gapPremium: number;
  depreciationFirstYear: number;
  depreciationAnnual: number;
}

interface Results {
  loanBalance: { year: number; balance: number }[];
  vehicleValue: { year: number; value: number }[];
  payoutEvents: { year: number; loanBalance: number; vehicleValue: number; gapPayout: number; cumulativeGapCost: number }[];
  breakEvenYear: number | null;
  maxGapPayout: number;
  totalGapCost: number;
  netBenefit: number;
  gapUseful: boolean;
}

const DEFAULTS: Inputs = {
  purchasePrice: 38000, downPayment: 5000, loanApr: 7.0, loanTermYears: 6,
  salesTaxRate: 7.5, feesAndAddOns: 1500, gapPremium: 600,
  depreciationFirstYear: 20, depreciationAnnual: 15,
};

function calculate(input: Inputs): Results {
  const price = Math.max(0, input.purchasePrice);
  const taxableAmount = price + Math.max(0, input.feesAndAddOns);
  const salesTax = taxableAmount * (input.salesTaxRate / 100);
  const amountFinanced = price + salesTax + input.feesAndAddOns - Math.max(0, input.downPayment);

  const termMonths = Math.round(input.loanTermYears * 12);
  const schedule = amortize(amountFinanced, input.loanApr, input.loanTermYears);

  // Loan balance by year
  const loanBalance: { year: number; balance: number }[] = [{ year: 0, balance: amountFinanced }];
  for (let y = 1; y <= input.loanTermYears; y++) {
    const row = schedule[Math.min(y * 12, schedule.length) - 1];
    loanBalance.push({ year: y, balance: row ? row.balance : 0 });
  }

  // Vehicle value by year (depreciation starts from purchase price)
  const valueCurve = depreciate(price, input.loanTermYears, input.depreciationFirstYear / 100, input.depreciationAnnual / 100);
  const vehicleValue: { year: number; value: number }[] = valueCurve.map((v, y) => ({ year: y, value: v }));

  // GAP events: loan balance > vehicle value means GAP would pay out
  const gapPremiumAnnual = input.gapPremium / input.loanTermYears;
  const payoutEvents: { year: number; loanBalance: number; vehicleValue: number; gapPayout: number; cumulativeGapCost: number }[] = [];
  let cumulativeGapCost = 0;
  let maxGapPayout = 0;
  let breakEvenYear: number | null = null;
  let totalGapPayout = 0;

  for (let y = 1; y <= input.loanTermYears; y++) {
    const lb = loanBalance[y]?.balance ?? 0;
    const vv = vehicleValue[y]?.value ?? 0;
    const gapPayout = Math.max(0, lb - vv);
    cumulativeGapCost += gapPremiumAnnual;
    payoutEvents.push({ year: y, loanBalance: lb, vehicleValue: vv, gapPayout, cumulativeGapCost });
    if (gapPayout > maxGapPayout) maxGapPayout = gapPayout;
    totalGapPayout += gapPayout;
    if (breakEvenYear === null && gapPayout > cumulativeGapCost) {
      breakEvenYear = y;
    }
  }

  const totalGapCost = input.gapPremium;
  const netBenefit = totalGapPayout > 0 ? maxGapPayout - totalGapCost : -totalGapCost;

  return {
    loanBalance,
    vehicleValue,
    payoutEvents,
    breakEvenYear,
    maxGapPayout,
    totalGapCost,
    netBenefit,
    gapUseful: maxGapPayout > 0,
  };
}

const CI = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const GapInsuranceValueCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(String(DEFAULTS.purchasePrice));
  const [downPayment, setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [loanApr, setLoanApr] = useState(String(DEFAULTS.loanApr));
  const [loanTermYears, setLoanTermYears] = useState(String(DEFAULTS.loanTermYears));
  const [salesTaxRate, setSalesTaxRate] = useState(String(DEFAULTS.salesTaxRate));
  const [feesAndAddOns, setFeesAndAddOns] = useState(String(DEFAULTS.feesAndAddOns));
  const [gapPremium, setGapPremium] = useState(String(DEFAULTS.gapPremium));
  const [firstYearDep, setFirstYearDep] = useState(String(DEFAULTS.depreciationFirstYear));
  const [annualDep, setAnnualDep] = useState(String(DEFAULTS.depreciationAnnual));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  const inputs: Inputs = useMemo(() => ({
    purchasePrice: parseFloat(purchasePrice) || 0, downPayment: parseFloat(downPayment) || 0,
    loanApr: parseFloat(loanApr) || 0, loanTermYears: parseFloat(loanTermYears) || 0,
    salesTaxRate: parseFloat(salesTaxRate) || 0, feesAndAddOns: parseFloat(feesAndAddOns) || 0,
    gapPremium: parseFloat(gapPremium) || 0, depreciationFirstYear: parseFloat(firstYearDep) || 20,
    depreciationAnnual: parseFloat(annualDep) || 15,
  }), [purchasePrice, downPayment, loanApr, loanTermYears, salesTaxRate, feesAndAddOns, gapPremium, firstYearDep, annualDep]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => setResults(calculate(inputs));
  const reset = () => {
    const d = DEFAULTS;
    setPurchasePrice(String(d.purchasePrice)); setDownPayment(String(d.downPayment)); setLoanApr(String(d.loanApr)); setLoanTermYears(String(d.loanTermYears));
    setSalesTaxRate(String(d.salesTaxRate)); setFeesAndAddOns(String(d.feesAndAddOns)); setGapPremium(String(d.gapPremium));
    setFirstYearDep(String(d.depreciationFirstYear)); setAnnualDep(String(d.depreciationAnnual)); setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const chartData = results ? results.loanBalance.map((lb, i) => ({
    year: `Yr ${i}`,
    loan: Math.round(lb.balance),
    value: Math.round(results.vehicleValue[i]?.value ?? 0),
  })) : [];

  const faqs = [
    { question: "What is GAP insurance and when do I need it?", answer: "GAP (Guaranteed Asset Protection) insurance covers the difference between your loan balance and your car's actual cash value if the car is totaled or stolen. You need GAP insurance whenever your loan balance exceeds the vehicle's value — typically when you put less than 20% down, finance for 60+ months, or roll taxes/fees into the loan." },
    { question: "How much does GAP insurance cost?", answer: "GAP insurance from a dealer costs $400–$1,000 (often financed into the loan). From your auto insurer it's typically $20–$40/year added to your premium. Always check with your insurer first — dealer GAP is usually 3–5x more expensive." },
    { question: "When is GAP insurance worth it?", answer: "GAP is worth it if your loan balance will exceed vehicle value for any significant period. This happens with low down payments (<20%), long loan terms (72+ months), high APRs, luxury vehicles with steep depreciation, or when rolling taxes and fees into the loan." },
    { question: "How is the GAP payout calculated?", answer: "If your car is totaled, the insurer pays the actual cash value (ACV). If your loan balance is higher, GAP pays the difference. For example, if you owe $30,000 but the car is worth $24,000, GAP pays $6,000 to the lender." },
    { question: "When does GAP stop being useful?", answer: "GAP stops being useful once your loan balance drops below the vehicle's market value — typically around year 3–4 of a 5–6 year loan. At that point you can cancel GAP for a prorated refund." },
    { question: "Should I buy GAP from the dealer or my insurer?", answer: "Almost always from your insurer. Dealer GAP costs $400–$1,000 upfront (often financed, adding interest). Insurer GAP costs $20–$40/year — over 5 years that's $100–$200 vs $500–$1,200+ from a dealer." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "GAP Insurance Value" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GAP Insurance Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="price" label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
              <CI id="down" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="apr" label="Loan APR" value={loanApr} onChange={setLoanApr} suffix="%" />
              <CI id="term" label="Loan Term" value={loanTermYears} onChange={setLoanTermYears} suffix="yr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="gap" label="GAP Premium" value={gapPremium} onChange={setGapPremium} prefix="$" />
              <CI id="tax" label="Sales Tax Rate" value={salesTaxRate} onChange={setSalesTaxRate} suffix="%" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CI id="fees" label="Fees & Add-ons" value={feesAndAddOns} onChange={setFeesAndAddOns} prefix="$" />
                  <CI id="dep1" label="Year-1 Depreciation" value={firstYearDep} onChange={setFirstYearDep} suffix="%" />
                  <CI id="depN" label="Annual Depreciation" value={annualDep} onChange={setAnnualDep} suffix="%" />
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
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                </div>

                <div className={`border rounded-xl p-5 text-center ${results.gapUseful ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" : "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20"}`}>
                  <div className={`text-[13px] font-bold mb-1 uppercase tracking-wider ${results.gapUseful ? "text-emerald-600" : "text-amber-600"}`}>
                    {results.gapUseful ? "GAP Insurance Is Worth It" : "GAP Insurance May Not Be Needed"}
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    {results.netBenefit > 0 ? "+" : ""}${Math.round(Math.abs(results.netBenefit)).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {results.gapUseful
                      ? `Max potential payout: $${Math.round(results.maxGapPayout).toLocaleString()} vs $${Math.round(results.totalGapCost).toLocaleString()} cost`
                      : `Loan stays above vehicle value — total cost $${Math.round(results.totalGapCost).toLocaleString()} with no expected payout`}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Max Payout</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.maxGapPayout).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">GAP Cost</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(results.totalGapCost).toLocaleString()}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Useful Until</div>
                    <div className="text-lg font-bold text-foreground">{results.breakEvenYear ? `Year ${results.breakEvenYear}` : "N/A"}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Year</th>
                        <th className="p-2.5 text-right">Loan Balance</th>
                        <th className="p-2.5 text-right">Vehicle Value</th>
                        <th className="p-2.5 pr-3 text-right">GAP Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.payoutEvents.map((e) => {
                        const underwater = e.loanBalance > e.vehicleValue;
                        return (
                          <tr key={e.year} className={`hover:bg-secondary/20 transition-colors ${underwater ? "bg-red-500/5" : ""}`}>
                            <td className="p-2.5 pl-3 font-semibold text-foreground">Year {e.year}</td>
                            <td className="p-2.5 text-right text-foreground">${Math.round(e.loanBalance).toLocaleString()}</td>
                            <td className="p-2.5 text-right text-foreground">${Math.round(e.vehicleValue).toLocaleString()}</td>
                            <td className={`p-2.5 pr-3 text-right font-medium ${e.gapPayout > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                              {e.gapPayout > 0 ? `$${Math.round(e.gapPayout).toLocaleString()}` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Loan Balance vs Vehicle Value</h3>
                  <div className="w-full h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === "loan" ? "Loan Balance" : "Vehicle Value"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="loan" stroke="#ef4444" strokeWidth={2.5} name="loan" dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} name="value" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">When the red line (loan) is above the green line (value), you're "underwater" and GAP insurance would pay out.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the GAP Insurance Value Calculator?</h2>
            <p>GAP (Guaranteed Asset Protection) insurance covers the difference between what you owe on your car loan and what the car is actually worth if it's totaled or stolen. This calculator determines whether GAP insurance is worth buying for your specific loan by comparing the cost of GAP coverage against the maximum potential payout over the life of your loan.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The calculator computes your loan balance at each year using standard amortization, then compares it against your vehicle's depreciated market value. Whenever the loan balance exceeds the vehicle value, you're "underwater" — GAP would pay the difference if the car were totaled. The tool sums potential payouts and compares them to the GAP premium cost.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary card shows whether GAP is worth it based on your net benefit. The 3-stat bar shows maximum potential payout, GAP cost, and the year you break even (when you can cancel). The table shows year-by-year loan balance, vehicle value, and potential GAP payout. The line chart visualizes when your loan goes "underwater" — the red area between the lines is what GAP would cover.</p>

            <h2 className="text-2xl font-bold mb-3">When Is GAP Insurance Worth It?</h2>
            <ul>
              <li><strong>Low down payment (under 20%)</strong> — you'll be underwater for years 1–3 minimum.</li>
              <li><strong>Long loan term (72+ months)</strong> — depreciation outpaces principal paydown.</li>
              <li><strong>High APR (8%+)</strong> — more of each payment goes to interest, slowing equity buildup.</li>
              <li><strong>Luxury or high-depreciation vehicles</strong> — lose value faster than typical cars.</li>
              <li><strong>Rolled taxes and fees into the loan</strong> — starts you underwater on day one.</li>
              <li><strong>Negative equity from a trade-in</strong> — adds to the new loan balance.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">When Is GAP NOT Worth It?</h2>
            <ul>
              <li><strong>20%+ down payment</strong> — equity protects you from being underwater.</li>
              <li><strong>Short loan term (48 months or less)</strong> — quick principal paydown.</li>
              <li><strong>Low APR and low fees</strong> — loan tracks close to vehicle value.</li>
              <li><strong>Vehicle with slow depreciation</strong> — Toyota, Honda, some trucks retain value well.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">How to Buy GAP Insurance Cheaply</h2>
            <ul>
              <li><strong>Check your auto insurer first.</strong> Most offer GAP for $20–$40/year — total cost $100–$240 over the loan.</li>
              <li><strong>Avoid dealer GAP.</strong> Dealers charge $400–$1,000 and often finance it into the loan (adding interest).</li>
              <li><strong>Negotiate dealer GAP price.</strong> If you must buy from the dealer, offer $300 — they often accept.</li>
              <li><strong>Cancel when no longer needed.</strong> Once your loan balance drops below vehicle value (year 3–4), cancel for a prorated refund.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Practical Example</h2>
            <p>A $38,000 car with $5,000 down, 7% APR, 72-month loan, 7.5% sales tax, and $1,500 in fees means financing ~$37,000. In year 1, the car is worth ~$30,400 but you owe ~$32,000 — you're $1,600 underwater. By year 3, you may still be $500–$1,000 underwater. GAP costing $600 (from insurer over 6 years) protects against a potential $3,000–$5,000 payout — clearly worth it.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits of Using This Calculator</h2>
            <p>This tool takes the guesswork out of GAP insurance decisions. By showing exactly when you'll be underwater and how much GAP would pay, it helps you decide whether to buy GAP, where to buy it (insurer vs dealer), and when to cancel it for a refund.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gap-insurance-value-calculator" />
          <PopularCalculators exclude="/calculator/gap-insurance-value-calculator" />
        </div>
      </div>
    </>
  );
};

export default GapInsuranceValueCalculator;
