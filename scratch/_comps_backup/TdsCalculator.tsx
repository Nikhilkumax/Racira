"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Landmark } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Slab {
  label: string;
  max: number;
  rate: number;
}

// FY 2024-25 slabs
const NEW_REGIME_SLABS: Slab[] = [
  { label: "0 – ₹3,00,000", max: 300000, rate: 0 },
  { label: "₹3,00,001 – ₹6,00,000", max: 600000, rate: 0.05 },
  { label: "₹6,00,001 – ₹9,00,000", max: 900000, rate: 0.1 },
  { label: "₹9,00,001 – ₹12,00,000", max: 1200000, rate: 0.15 },
  { label: "₹12,00,001 – ₹15,00,000", max: 1500000, rate: 0.2 },
  { label: "Above ₹15,00,000", max: Infinity, rate: 0.3 },
];

const OLD_REGIME_SLABS: Slab[] = [
  { label: "0 – ₹2,50,000", max: 250000, rate: 0 },
  { label: "₹2,50,001 – ₹5,00,000", max: 500000, rate: 0.05 },
  { label: "₹5,00,001 – ₹10,00,000", max: 1000000, rate: 0.2 },
  { label: "Above ₹10,00,000", max: Infinity, rate: 0.3 },
];

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function TdsCalculator() {
  const [grossSalary, setGrossSalary] = useState("1200000");
  const [otherIncome, setOtherIncome] = useState("0");
  const [deductions, setDeductions] = useState("150000");
  const [sections, setSections] = useState("80000");
  const [regime, setRegime] = useState<"new" | "old">("new");
  const [showResults, setShowResults] = useState(false);

  const gross = parseFloat(grossSalary) || 0;
  const other = parseFloat(otherIncome) || 0;
  const ded = parseFloat(deductions) || 0;
  const sec = parseFloat(sections) || 0;

  let taxable: number;
  if (regime === "new") {
    taxable = Math.max(0, gross + other - 75000);
  } else {
    taxable = Math.max(0, gross + other - ded - sec - 50000);
  }

  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
  let tax = 0;
  let prev = 0;
  const rows: (Slab & { amount: number; tax: number })[] = [];
  for (const slab of slabs) {
    const amount = taxable > prev ? Math.min(taxable, slab.max) - prev : 0;
    const slabTax = amount * slab.rate;
    tax += slabTax;
    rows.push({ ...slab, amount, tax: slabTax });
    if (taxable <= slab.max) break;
    prev = slab.max === Infinity ? taxable : slab.max;
  }
  // 87A rebate: no tax up to ₹7L taxable (new) / ₹2.5L (old)
  const rebateLimit = regime === "new" ? 700000 : 250000;
  if (taxable <= rebateLimit) tax = 0;
  tax = Math.round(tax);
  const cess = Math.round(tax * 0.04);
  const total = tax + cess;
  const monthly = total / 12;
  const takeHome = gross + other - total;

  const chartData = rows
    .filter((r) => r.amount > 0)
    .map((r) => ({ name: r.label.split("–")[0].trim(), amount: Math.round(r.amount / 1000), tax: Math.round(r.tax / 1000) }));

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setGrossSalary("1200000");
    setOtherIncome("0");
    setDeductions("150000");
    setSections("80000");
    setRegime("new");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is TDS on salary?", answer: "TDS (Tax Deducted at Source) is the mechanism where your employer withholds income tax from each month's salary and deposits it with the government on your behalf. At year-end, the withheld amount is credited against your final tax liability via Form 16." },
    { question: "New regime or old regime?", answer: "The new regime (FY 2024-25) offers lower slab rates with a ₹75,000 standard deduction and no other exemptions; income up to ₹7,00,000 is tax-free via the 87A rebate. The old regime keeps deductions (80C, 80D, HRA, LTA) but has the ₹50,000 standard deduction and a ₹2.5L rebate threshold. Choose whichever leaves you with less tax." },
    { question: "How is taxable salary computed?", answer: "New regime: gross salary + other income − ₹75,000 standard deduction. Old regime: gross + other − standard deduction − 80C/80D deductions − exemptions like HRA and LTA. Only the resulting taxable figure is run through the slabs." },
    { question: "What is the health and education cess?", answer: "A 4% surcharge applied on top of the income tax computed from the slabs — 2% for health and 2% for education. It is added to every taxpayer's bill, including TDS withheld each month." },
    { question: "Why did my TDS change mid-year?", answer: "Employers project your full-year liability from each payslip. If you submit investment proofs, switch regimes, or get a raise mid-year, the projection changes and the monthly TDS is recalculated over the remaining months to even out the full-year total." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "TDS Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">TDS Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Landmark className="w-4 h-4" /> Tax Deducted at Source
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Gross Annual Salary (₹)</label>
                <input id="tds-gross" type="number" value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Other Income (₹)</label>
                <input id="tds-other" type="number" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} min={0} className="input-calc" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Tax Regime</label>
                <select value={regime} onChange={(e) => setRegime(e.target.value as "new" | "old")} className="input-calc">
                  <option value="new">New regime (FY 2024-25)</option>
                  <option value="old">Old regime</option>
                </select>
              </div>
              {regime === "old" && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">Deductions (80C, 80D, etc.) (₹)</label>
                    <input id="tds-ded" type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} min={0} className="input-calc" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">Other Exemptions (HRA, LTA) (₹)</label>
                    <input id="tds-sec" type="number" value={sections} onChange={(e) => setSections(e.target.value)} min={0} className="input-calc" />
                  </div>
                </>
              )}
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
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Annual Tax (incl. cess)</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(total)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(monthly)}/month TDS · {fmt(takeHome)} annual take-home
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Taxable Income</p>
                    <p className="text-2xl font-bold text-primary">{fmt(taxable)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Income Tax</p>
                    <p className="text-2xl font-bold text-orange-500">{fmt(tax)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Cess (4%)</p>
                    <p className="text-2xl font-bold text-green-600">{fmt(cess)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Item</th>
                        <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Total Annual Tax</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{fmt(total)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Taxable Income</td>
                        <td className="py-2.5 px-3 text-right">{fmt(taxable)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Income Tax</td>
                        <td className="py-2.5 px-3 text-right">{fmt(tax)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Health & Education Cess (4%)</td>
                        <td className="py-2.5 px-3 text-right">{fmt(cess)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Monthly TDS Deduction</td>
                        <td className="py-2.5 px-3 text-right font-medium">{fmt(monthly)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Annual Take-Home</td>
                        <td className="py-2.5 px-3 text-right">{fmt(takeHome)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Tax by Slab (₹ thousands)</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => "₹" + (v * 1000).toLocaleString("en-IN")} />
                        <Bar dataKey="amount" name="Income in Slab" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Regime</span>
                      <span className="font-medium">{regime === "new" ? "New" : "Old"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Gross + Other Income</span>
                      <span className="font-medium">{fmt(gross + other)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Rebate Applied</span>
                      <span className="font-medium">{taxable <= rebateLimit ? `Yes (87A ≤ ₹${(rebateLimit / 100000).toFixed(0)}L)` : "No"}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Monthly TDS</span>
                      <span className="font-medium">{fmt(monthly)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Annual Tax</span>
                      <span className="font-medium">{fmt(total)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Take-Home</span>
                      <span className="font-medium">{fmt(takeHome)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your salary, other income, and regime, then click <strong className="text-foreground">Calculate</strong> to see your annual tax and monthly TDS deduction.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How TDS on Salary Works</h2>
            <p>Under the new regime, a ₹12,00,000 salary with the ₹75,000 standard deduction leaves ₹11,25,000 taxable. That spans the 5%, 10%, and 15% slabs, yielding ₹78,750 in tax plus ₹3,150 cess — about ₹6,825 per month. The employer withholds this from your monthly salary and deposits it with the government.</p>
            <h3>New vs. Old Regime</h3>
            <p>The new regime's lower slab rates help most salaried taxpayers who claim few deductions; the 87A rebate makes income up to ₹7,00,000 entirely tax-free. The old regime rewards taxpayers with heavy 80C, 80D, HRA, and LTA usage — above roughly ₹15 lakh of taxable income, the old regime with full deductions usually wins again. Run both here and compare the monthly TDS.</p>
            <h3>Rebate Rules</h3>
            <p>Section 87A wipes out the tax entirely when taxable income stays at or below the threshold — ₹7,00,000 (new regime) or ₹2,50,000 (old regime). Cross the line by even one rupee and the full slab tax applies, so it pays to stay just under the limit if you can shift income or deductions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tds-calculator" />
          <PopularCalculators exclude="/calculator/tds-calculator" />
        </div>
      </div>
    </>
  );
}
