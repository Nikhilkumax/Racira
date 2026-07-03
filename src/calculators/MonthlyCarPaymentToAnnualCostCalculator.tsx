"use client";

import { useState, useEffect, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RotateCcw, Calculator, Printer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { pmt, totalInterest, fmtUsd } from "@/lib/auto/autoFinance";

interface Inputs {
  monthlyPayment: number;
  loanTermMonths: number;
  loanApr: number;
  annualInsurance: number;
  annualFuel: number;
  annualMaintenance: number;
  annualRegistration: number;
  annualParking: number;
}

interface Results {
  totalLoanPayments: number;
  totalInterest: number;
  loanPrincipal: number;
  insuranceTotal: number;
  fuelTotal: number;
  maintenanceTotal: number;
  registrationTotal: number;
  parkingTotal: number;
  annualCost: number;
  monthlyTotal: number;
  costPerMile: number;
}

const DEFAULTS: Inputs = {
  monthlyPayment: 550,
  loanTermMonths: 60,
  loanApr: 6.9,
  annualInsurance: 1800,
  annualFuel: 2400,
  annualMaintenance: 800,
  annualRegistration: 400,
  annualParking: 600,
};

const LOAN_YEARS = 5;

function calculate(input: Inputs): Results {
  const monthly = Math.max(0, input.monthlyPayment);
  const n = Math.max(1, Math.round(input.loanTermMonths));
  const r = input.loanApr / 100 / 12;

  // Reverse-engineer principal from monthly payment: P = M * ((1+r)^n - 1) / (r*(1+r)^n)
  let principal: number;
  if (r === 0) {
    principal = monthly * n;
  } else {
    const factor = Math.pow(1 + r, n);
    principal = monthly * (factor - 1) / (r * factor);
  }

  const totalLoanPayments = monthly * n;
  const interest = totalLoanPayments - principal;

  const insuranceTotal = input.annualInsurance * LOAN_YEARS;
  const fuelTotal = input.annualFuel * LOAN_YEARS;
  const maintenanceTotal = input.annualMaintenance * LOAN_YEARS;
  const registrationTotal = input.annualRegistration * LOAN_YEARS;
  const parkingTotal = input.annualParking * LOAN_YEARS;

  const totalAll = totalLoanPayments + insuranceTotal + fuelTotal + maintenanceTotal + registrationTotal + parkingTotal;
  const annualCost = totalAll / LOAN_YEARS;
  const monthlyTotal = annualCost / 12;

  return {
    totalLoanPayments, totalInterest: interest, loanPrincipal: principal,
    insuranceTotal, fuelTotal, maintenanceTotal, registrationTotal, parkingTotal,
    annualCost, monthlyTotal, costPerMile: 15000 > 0 ? annualCost / 15000 : 0,
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

const COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#10b981", "#06b6d4", "#ec4899", "#f97316"];

const MonthlyCarPaymentToAnnualCostCalculator = () => {
  const [monthlyPayment, setMonthlyPayment] = useState(String(DEFAULTS.monthlyPayment));
  const [loanTermMonths, setLoanTermMonths] = useState(String(DEFAULTS.loanTermMonths));
  const [loanApr, setLoanApr] = useState(String(DEFAULTS.loanApr));
  const [annualInsurance, setAnnualInsurance] = useState(String(DEFAULTS.annualInsurance));
  const [annualFuel, setAnnualFuel] = useState(String(DEFAULTS.annualFuel));
  const [annualMaintenance, setAnnualMaintenance] = useState(String(DEFAULTS.annualMaintenance));
  const [annualRegistration, setAnnualRegistration] = useState(String(DEFAULTS.annualRegistration));
  const [annualParking, setAnnualParking] = useState(String(DEFAULTS.annualParking));
  const [annualMiles, setAnnualMiles] = useState("15000");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  const inputs: Inputs & { annualMiles: number } = useMemo(() => ({
    monthlyPayment: parseFloat(monthlyPayment) || 0,
    loanTermMonths: parseFloat(loanTermMonths) || 0,
    loanApr: parseFloat(loanApr) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0,
    annualFuel: parseFloat(annualFuel) || 0,
    annualMaintenance: parseFloat(annualMaintenance) || 0,
    annualRegistration: parseFloat(annualRegistration) || 0,
    annualParking: parseFloat(annualParking) || 0,
    annualMiles: parseFloat(annualMiles) || 15000,
  }), [monthlyPayment, loanTermMonths, loanApr, annualInsurance, annualFuel, annualMaintenance, annualRegistration, annualParking, annualMiles]);

  useEffect(() => { setResults(calculate(DEFAULTS)); }, []);
  const handleCalculate = () => {
    const { annualMiles, ...calcInputs } = inputs;
    const r = calculate(calcInputs);
    const miles = inputs.annualMiles;
    setResults({ ...r, costPerMile: miles > 0 ? r.annualCost / miles : 0 });
  };
  const reset = () => {
    const d = DEFAULTS;
    setMonthlyPayment(String(d.monthlyPayment)); setLoanTermMonths(String(d.loanTermMonths)); setLoanApr(String(d.loanApr));
    setAnnualInsurance(String(d.annualInsurance)); setAnnualFuel(String(d.annualFuel)); setAnnualMaintenance(String(d.annualMaintenance));
    setAnnualRegistration(String(d.annualRegistration)); setAnnualParking(String(d.annualParking)); setAnnualMiles("15000"); setShowAdvanced(false);
    setResults(calculate(DEFAULTS));
  };

  const pieData = results ? [
    { name: "Loan Principal", value: Math.round(results.loanPrincipal), color: "#3b82f6" },
    { name: "Loan Interest", value: Math.round(results.totalInterest), color: COLORS[1] },
    { name: "Insurance", value: Math.round(results.insuranceTotal), color: COLORS[2] },
    { name: "Fuel", value: Math.round(results.fuelTotal), color: COLORS[3] },
    { name: "Maintenance", value: Math.round(results.maintenanceTotal), color: COLORS[4] },
    { name: "Registration", value: Math.round(results.registrationTotal), color: COLORS[5] },
    { name: "Parking", value: Math.round(results.parkingTotal), color: COLORS[6] },
  ] : [];
  const activePie = pieData.filter(d => d.value > 0);
  const pieTotal = activePie.reduce((s, d) => s + d.value, 0);

  const faqs = [
    { question: "How do I convert my monthly payment to an annual cost?", answer: "Multiply your monthly car payment by 12, then add all annual expenses (insurance, fuel, maintenance, registration, parking). For example, a $550/month payment equals $6,600/year in loan payments alone. Adding $1,800 insurance, $2,400 fuel, $800 maintenance, $400 registration, and $600 parking brings the true annual cost to $12,600 — more than double the payment." },
    { question: "Why is the annual cost so much higher than 12× the payment?", answer: "The monthly payment only covers the loan. A typical car owner also spends $6,000–$8,000 per year on insurance, fuel, maintenance, registration, and parking. Your true annual cost is usually 1.5–2.5x the monthly payment times 12." },
    { question: "How much interest am I actually paying?", answer: "On a $550/month, 60-month loan at 6.9% APR, you borrow about $27,700 and pay $5,300 in interest. That's nearly $1,060/year in pure interest cost — money that could be invested elsewhere if you paid cash." },
    { question: "What is a healthy car budget as a percentage of income?", answer: "Financial experts recommend keeping total transportation costs (payment + insurance + fuel + maintenance) below 15% of gross income. On a $60,000 salary, that's $9,000/year or $750/month total. If your payment alone is $550, you have only $200/month for all other costs — which is tight." },
    { question: "Can I reduce my total annual cost?", answer: "Yes. Refinance at a lower APR, increase insurance deductibles, improve fuel efficiency by maintaining tire pressure and driving habits, do DIY maintenance where possible, and shop around for parking alternatives. The biggest savings come from paying off the loan early or choosing a less expensive vehicle." },
    { question: "Does a shorter loan term help?", answer: "A shorter term means higher monthly payments but significantly less total interest. For example, $550/month over 60 months at 6.9% costs $5,300 in interest. The same principal over 48 months would be ~$660/month but only ~$4,000 in interest — saving $1,300." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Monthly Payment to Annual Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Monthly Car Payment to Annual Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CI id="payment" label="Monthly Payment" value={monthlyPayment} onChange={setMonthlyPayment} prefix="$" />
              <CI id="term" label="Loan Term" value={loanTermMonths} onChange={setLoanTermMonths} suffix="mo" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="insurance" label="Insurance / Year" value={annualInsurance} onChange={setAnnualInsurance} prefix="$" />
              <CI id="fuel" label="Fuel / Year" value={annualFuel} onChange={setAnnualFuel} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CI id="maintenance" label="Maintenance / Year" value={annualMaintenance} onChange={setAnnualMaintenance} prefix="$" />
              <CI id="miles" label="Annual Miles" value={annualMiles} onChange={setAnnualMiles} />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CI id="apr" label="Loan APR" value={loanApr} onChange={setLoanApr} suffix="%" />
                  <CI id="reg" label="Registration / Year" value={annualRegistration} onChange={setAnnualRegistration} prefix="$" />
                  <CI id="park" label="Parking / Year" value={annualParking} onChange={setAnnualParking} prefix="$" />
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

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-blue-600 mb-1 uppercase tracking-wider">True Annual Cost</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.annualCost).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">${Math.round(results.monthlyTotal).toLocaleString()}/mo total · ${results.costPerMile.toFixed(2)}/mile</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Payment Only</div>
                    <div className="text-lg font-bold text-foreground">${Math.round(inputs.monthlyPayment * 12).toLocaleString()}/yr</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">All Costs</div>
                    <div className="text-lg font-bold text-blue-600">${Math.round(results.annualCost).toLocaleString()}/yr</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Interest Paid</div>
                    <div className="text-lg font-bold text-amber-600">${Math.round(results.totalInterest).toLocaleString()}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Category</th>
                        <th className="p-2.5 text-right">Annual</th>
                        <th className="p-2.5 pr-3 text-right">Total ({LOAN_YEARS}yr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Loan Payment", annual: inputs.monthlyPayment * 12, total: results.totalLoanPayments, cls: "text-blue-600" },
                        { label: "  (Interest portion)", annual: results.totalInterest / LOAN_YEARS, total: results.totalInterest, cls: "text-amber-600" },
                        { label: "Insurance", annual: inputs.annualInsurance, total: results.insuranceTotal, cls: "text-violet-600" },
                        { label: "Fuel", annual: inputs.annualFuel, total: results.fuelTotal, cls: "text-emerald-600" },
                        { label: "Maintenance", annual: inputs.annualMaintenance, total: results.maintenanceTotal, cls: "text-cyan-600" },
                        { label: "Registration", annual: inputs.annualRegistration, total: results.registrationTotal, cls: "text-pink-600" },
                        { label: "Parking", annual: inputs.annualParking, total: results.parkingTotal, cls: "text-orange-600" },
                      ].map(r => (
                        <tr key={r.label} className="text-muted-foreground hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className="p-2.5 text-right text-foreground">${Math.round(r.annual).toLocaleString()}</td>
                          <td className={`p-2.5 pr-3 text-right font-medium ${r.cls}`}>${Math.round(r.total).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-secondary/30 text-foreground text-base border-t border-border">
                        <td className="p-2.5 pl-3">Total</td>
                        <td className="p-2.5 text-right">${Math.round(results.annualCost).toLocaleString()}</td>
                        <td className="p-2.5 pr-3 text-right text-primary">${Math.round(results.annualCost * LOAN_YEARS).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-border bg-card">
                  <div className="w-full sm:w-1/2 flex justify-center shrink-0">
                    {activePie.length > 0 && (
                      <div className="w-[200px] h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={activePie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                              {activePie.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">/ Year</span>
                          <span className="text-lg font-extrabold text-foreground">${Math.round(results.annualCost).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-col gap-2">
                    {activePie.map(d => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
                        <span className="text-foreground font-medium flex-1">{d.name}</span>
                        <span className="text-muted-foreground tabular-nums">{pieTotal > 0 ? ((d.value / pieTotal) * 100).toFixed(1) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Monthly Payment to Annual Cost Calculator?</h2>
            <p>This calculator converts your monthly car payment into the true annual cost of ownership. Most people look at their $550/month payment and think that's what their car costs. In reality, the annual cost is typically 1.5–2.5x the loan payment alone because it also includes insurance, fuel, maintenance, registration, parking, and interest.</p>
            <p>By starting from the monthly payment you already know, this calculator reverse-engineers the full financial picture — revealing exactly how much your car really costs you every year.</p>

            <h2>How It Works</h2>
            <p>Given your monthly payment, loan term, and APR, the calculator first determines the loan principal by solving the payment formula in reverse: P = M × ((1+r)^n − 1) / (r × (1+r)^n). It then computes total interest paid over the life of the loan. Annual operating costs (insurance, fuel, maintenance, registration, parking) are summed and combined with the loan costs to produce the true annual cost.</p>

            <h2>Understanding Your Results</h2>
            <p>The primary result shows the true annual cost — typically $10,000–$15,000 for someone with a $500–$600/month payment. The 3-stat bar compares your payment-only annual cost vs the true annual cost vs total interest paid. The breakdown table shows each category as annual and total-over-loan figures. The donut chart shows where every dollar goes.</p>

            <h2>The Hidden Costs Beyond the Payment</h2>
            <ul>
              <li><strong>Insurance:</strong> $1,500–$2,500/year for most drivers, more for young drivers, sports cars, or high-crime areas.</li>
              <li><strong>Fuel:</strong> $1,800–$3,200/year depending on MPG, miles driven, and gas prices.</li>
              <li><strong>Maintenance:</strong> $500–$1,200/year — more for older vehicles or luxury brands.</li>
              <li><strong>Registration & taxes:</strong> $300–$800/year, varies by state and vehicle value.</li>
              <li><strong>Parking:</strong> $0–$4,800/year depending on location.</li>
              <li><strong>Interest:</strong> $800–$1,200/year on a typical 60-month auto loan.</li>
            </ul>

            <h2>Practical Example</h2>
            <p>A $550/month, 60-month payment at 6.9% APR finances about $27,700. Total loan payments: $33,000, of which $5,300 is interest. Adding insurance ($1,800), fuel ($2,400), maintenance ($800), registration ($400), and parking ($600) gives a true annual cost of $12,200/year — $667/month total, which is 21% more than the loan payment alone.</p>

            <h2>Tips to Lower Your True Annual Cost</h2>
            <ul>
              <li><strong>Refinance at a lower rate</strong> — even 1% APR reduction saves $500–$1,000 over the loan life.</li>
              <li><strong>Shop insurance every 6–12 months</strong> — carriers routinely increase renewal rates.</li>
              <li><strong>Reduce fuel costs</strong> through efficient driving, proper tire pressure, and route optimization.</li>
              <li><strong>Pay off the loan early</strong> to eliminate interest charges.</li>
              <li><strong>Bundle insurance</strong> with home/renters for multi-policy discounts of 10–25%.</li>
            </ul>

            <h2>Benefits of Using This Calculator</h2>
            <p>This tool transforms a single monthly payment number into the complete financial picture. It helps you budget accurately, understand the true cost of your vehicle, compare different cars beyond just their payments, and make informed decisions about refinancing, early payoff, or vehicle replacement.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/monthly-car-payment-to-annual-cost-calculator" />
          <PopularCalculators exclude="/calculator/monthly-car-payment-to-annual-cost-calculator" />
        </div>
      </div>
    </>
  );
};

export default MonthlyCarPaymentToAnnualCostCalculator;
