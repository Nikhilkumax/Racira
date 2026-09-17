"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function W4WithholdingCalculator() {
  const [grossPay, setGrossPay] = useState("5200");
  const [payFreq, setPayFreq] = useState("biweekly");
  const [filingStatus, setFilingStatus] = useState("single");
  const [allowances, setAllowances] = useState("2");
  const [extraWithholding, setExtraWithholding] = useState("0");
  const [showResults, setShowResults] = useState(false);

  const gross = parseFloat(grossPay) || 0;
  const extra = parseFloat(extraWithholding) || 0;
  const perYear = payFreq === "weekly" ? 52 : payFreq === "biweekly" ? 26 : payFreq === "semimonthly" ? 24 : 12;

  const stdDeduction = filingStatus === "single" || filingStatus === "marriedSeparate" ? 14600 : 29200;
  const allowanceValue = 4300;
  const taxable = Math.max(0, gross * perYear - stdDeduction - parseFloat(allowances || "0") * allowanceValue);

  // 2024 federal brackets
  const brackets =
    filingStatus === "single"
      ? [
          { max: 11600, rate: 0.1 },
          { max: 47150, rate: 0.12 },
          { max: 100525, rate: 0.22 },
          { max: 191950, rate: 0.24 },
          { max: 243725, rate: 0.32 },
          { max: Infinity, rate: 0.35 },
        ]
      : [
          { max: 23200, rate: 0.1 },
          { max: 94300, rate: 0.12 },
          { max: 201050, rate: 0.22 },
          { max: 383900, rate: 0.24 },
          { max: 487450, rate: 0.32 },
          { max: Infinity, rate: 0.35 },
        ];

  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (taxable > prev) {
      tax += (Math.min(taxable, b.max) - prev) * b.rate;
    }
    if (taxable <= b.max) break;
    prev = b.max === Infinity ? taxable : b.max;
  }

  const annualWithholding = tax + extra * perYear;
  const perPaycheck = annualWithholding / perYear;
  const takeHome = gross - perPaycheck;
  const effectiveRate = gross > 0 ? (annualWithholding / (gross * perYear)) * 100 : 0;

  const chartData = [
    { name: "Take-Home", value: Math.round(takeHome * 100) / 100 },
    { name: "Withholding", value: Math.round(perPaycheck * 100) / 100 },
  ];

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setGrossPay("5200");
    setPayFreq("biweekly");
    setFilingStatus("single");
    setAllowances("2");
    setExtraWithholding("0");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is a W-4?", answer: "Form W-4 tells your employer how much federal income tax to withhold from each paycheck. Your filing status, dependents, and any extra withholding you request on the form determine the amount — this calculator estimates the result of those choices." },
    { question: "What is an allowance on the modern W-4?", answer: "Since 2020 the W-4 no longer uses allowances; it asks for dependents, other income, and deductions directly. This calculator models the older $4,300-per-allowance method, which still approximates the outcome for most filers." },
    { question: "How do I avoid owing at tax time?", answer: "Withhold enough during the year to cover your liability. The IRS safe harbor waives penalties if you withhold at least 100% of last year's tax (110% above $150,000) or 90% of this year's. If this calculator shows low withholding and you owe, add extra withholding per check." },
    { question: "Is withholding the same as my actual tax?", answer: "No — withholding is a running prepayment. Your actual liability is computed on the full return, accounting for credits, capital gains, and itemized deductions. Overwithholding produces a refund; underwithholding produces a bill. This is an estimate for planning." },
    { question: "How do pay frequency and extra withholding interact?", answer: "Annual withholding = annual tax on your projected taxable income + extra-withholding dollars multiplied by the number of paychecks. Extra $50 per check adds $2,600/year on a biweekly schedule — a fast way to close a gap without changing your W-4 status." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "W-4 Withholding Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">W-4 Withholding Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <FileText className="w-4 h-4" /> Paycheck Withholding
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Gross Pay per Period ($)</label>
                <input id="w4-gross" type="number" value={grossPay} onChange={(e) => setGrossPay(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Pay Frequency</label>
                <select value={payFreq} onChange={(e) => setPayFreq(e.target.value)} className="input-calc">
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="semimonthly">Semi-monthly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Filing Status</label>
                <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className="input-calc">
                  <option value="single">Single</option>
                  <option value="marriedJoint">Married filing jointly</option>
                  <option value="marriedSeparate">Married filing separately</option>
                  <option value="headOfHousehold">Head of household</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Allowances (line 3)</label>
                <input id="w4-allowances" type="number" value={allowances} onChange={(e) => setAllowances(e.target.value)} min={0} max={20} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Extra Withholding per Check ($)</label>
                <input id="w4-extra" type="number" value={extraWithholding} onChange={(e) => setExtraWithholding(e.target.value)} min={0} className="input-calc" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Withholding per Paycheck</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(perPaycheck)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(annualWithholding)}/year · effective {effectiveRate.toFixed(1)}% · {fmt(takeHome)} take-home per check
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Annual Withholding</p>
                    <p className="text-2xl font-bold text-primary">{fmt(annualWithholding)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Taxable Income</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(taxable)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Take-Home / Check</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(takeHome)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Item</th>
                        <th className="py-2.5 px-3 font-medium text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Withholding per Paycheck</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(perPaycheck)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Annual Taxable Income</td>
                        <td className="py-2.5 px-3 text-right">{fmt(taxable)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Annual Withholding</td>
                        <td className="py-2.5 px-3 text-right">{fmt(annualWithholding)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Gross per Paycheck</td>
                        <td className="py-2.5 px-3 text-right">{fmt(gross)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Estimated Take-Home per Check</td>
                        <td className="py-2.5 px-3 text-right">{fmt(takeHome)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Each Paycheck ($)</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Pay Frequency</span>
                      <span className="font-medium capitalize">{payFreq}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Filing Status</span>
                      <span className="font-medium">{filingStatus === "single" ? "Single" : filingStatus === "marriedJoint" ? "MFJ" : filingStatus === "marriedSeparate" ? "MFS" : "Head of Household"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Allowances</span>
                      <span className="font-medium">{allowances}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Extra Withholding</span>
                      <span className="font-medium">{fmt(extra)}/check</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Annual Withholding</span>
                      <span className="font-medium">{fmt(annualWithholding)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Effective Rate</span>
                      <span className="font-medium">{effectiveRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your gross pay and W-4 selections, then click <strong className="text-foreground">Calculate</strong> to see the federal tax withheld from each paycheck.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Paycheck Withholding Works</h2>
            <p>Withholding is estimated by annualizing your per-period gross pay, subtracting the standard deduction plus $4,300 per allowance, and applying 2024 federal brackets. Your actual refund or amount owed depends on other income, credits, and deductions on your final return — this is an estimate to help avoid a big surprise in April.</p>
            <h3>Worked Example</h3>
            <p>A single filer earning $5,200 biweekly ($135,200/year) with 2 allowances has taxable income of $112,000 after the $14,600 standard deduction and $8,600 of allowances. The 2024 brackets withhold about $19,900 for the year — $766 per check — leaving $4,434 of take-home per paycheck. Adding $50 of extra withholding trims that to $4,384 but banks an extra $1,300 toward your April bill.</p>
            <h3>Fine-Tuning Your W-4</h3>
            <p>Owed a large amount last April? Add extra withholding per check. Got a refund you consider a 0% interest loan to the IRS? Reduce allowances. Recheck after life events — marriage, a child, or a raise — because each shifts the brackets your withholding is based on.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/w4-withholding-calculator" />
          <PopularCalculators exclude="/calculator/w4-withholding-calculator" />
        </div>
      </div>
    </>
  );
}
