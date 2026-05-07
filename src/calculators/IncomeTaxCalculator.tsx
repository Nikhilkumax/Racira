"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { ChevronDown, Printer, RotateCcw } from "lucide-react";

const US_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ],
  married: [
    { min: 0, max: 23200, rate: 10 },
    { min: 23200, max: 94300, rate: 12 },
    { min: 94300, max: 201050, rate: 22 },
    { min: 201050, max: 383900, rate: 24 },
    { min: 383900, max: 487450, rate: 32 },
    { min: 487450, max: 731200, rate: 35 },
    { min: 731200, max: Infinity, rate: 37 },
  ],
  hoh: [
    { min: 0, max: 16550, rate: 10 },
    { min: 16550, max: 63100, rate: 12 },
    { min: 63100, max: 100500, rate: 22 },
    { min: 100500, max: 191950, rate: 24 },
    { min: 191950, max: 243700, rate: 32 },
    { min: 243700, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ],
};

const INDIA_NEW_REGIME = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 5 },
  { min: 700000, max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

const INDIA_OLD_REGIME = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

const calcBracketTax = (income: number, brackets: { min: number; max: number; rate: number }[]) => {
  let tax = 0;
  for (const b of brackets) {
    if (income <= b.min) break;
    const taxable = Math.min(income, b.max) - b.min;
    tax += taxable * (b.rate / 100);
  }
  return tax;
};

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const IncomeTaxCalculator = () => {
  const [regime, setRegime] = useState<"us" | "india">("us");
  const [filingStatus, setFilingStatus] = useState("single");
  const [salary, setSalary] = useState("85000");
  const [otherIncome, setOtherIncome] = useState("0");
  const [deductions, setDeductions] = useState("14600");
  const [retirementContrib, setRetirementContrib] = useState("0");
  const [stateTax, setStateTax] = useState("5");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [capitalGains, setCapitalGains] = useState("0");
  const [interestIncome, setInterestIncome] = useState("0");
  const [dividends, setDividends] = useState("0");

  // India
  const [indiaRegime, setIndiaRegime] = useState<"new" | "old">("new");

  const [result, setResult] = useState<{
    federalTax: number;
    stateTaxAmt: number;
    totalTax: number;
    effectiveRate: number;
    netIncome: number;
    monthlyTakeHome: number;
  } | null>(null);

  const calculate = () => {
    const gross = (parseFloat(salary) || 0) + (parseFloat(otherIncome) || 0) + (parseFloat(capitalGains) || 0) + (parseFloat(interestIncome) || 0) + (parseFloat(dividends) || 0);
    const ded = parseFloat(deductions) || 0;
    const ret = parseFloat(retirementContrib) || 0;
    const stPct = (parseFloat(stateTax) || 0) / 100;

    const taxableIncome = Math.max(0, gross - ded - ret);

    let federalTax: number;
    if (regime === "us") {
      const brackets = filingStatus === "married" ? US_BRACKETS_2024.married : filingStatus === "hoh" ? US_BRACKETS_2024.hoh : US_BRACKETS_2024.single;
      federalTax = calcBracketTax(taxableIncome, brackets);
    } else {
      const brackets = indiaRegime === "new" ? INDIA_NEW_REGIME : INDIA_OLD_REGIME;
      federalTax = calcBracketTax(taxableIncome, brackets);
    }

    const stateTaxAmt = taxableIncome * stPct;
    const totalTax = federalTax + stateTaxAmt;
    const netIncome = gross - totalTax;

    setResult({
      federalTax,
      stateTaxAmt,
      totalTax,
      effectiveRate: gross > 0 ? (totalTax / gross) * 100 : 0,
      netIncome,
      monthlyTakeHome: netIncome / 12,
    });
  };

  const reset = () => {
    setSalary("85000"); setOtherIncome("0"); setDeductions("14600");
    setRetirementContrib("0"); setStateTax("5"); setCapitalGains("0");
    setInterestIncome("0"); setDividends("0"); setResult(null);
  };

  const faqs = [
    { question: "How is federal income tax calculated?", answer: "Federal income tax uses a progressive bracket system. Your income is divided into brackets, each taxed at a different rate. Only the income within each bracket is taxed at that bracket's rate, not your entire income." },
    { question: "What is the standard deduction?", answer: "The standard deduction is a fixed amount that reduces your taxable income. For 2024, it's $14,600 for single filers and $29,200 for married filing jointly. You can itemize deductions instead if they exceed the standard deduction." },
    { question: "What is the effective tax rate?", answer: "Your effective tax rate is the total tax paid divided by your total income. It's always lower than your marginal (top bracket) rate because only a portion of your income is taxed at the highest rate." },
    { question: "How do retirement contributions reduce taxes?", answer: "Traditional 401(k) and IRA contributions are tax-deductible, reducing your taxable income. For example, contributing $20,000 to a 401(k) on a $100,000 salary means you're only taxed on $80,000 (before other deductions)." },
    { question: "Does this calculator work for India?", answer: "Yes! Toggle to the India regime to calculate taxes under either the New Tax Regime or Old Tax Regime. The calculator uses current Indian tax brackets and allows you to compare both options." },
    { question: "What about state taxes?", answer: "State income tax rates vary widely. Some states (like Texas, Florida) have no income tax, while others (like California) have rates up to 13.3%. Enter your state's rate for an accurate total tax estimate." },
  ];

  const currSymbol = regime === "india" ? "₹" : "$";

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Income Tax Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Income Tax Calculator</h1>
            <p className="text-muted-foreground mb-8">Estimate your federal and state taxes, effective rate, and take-home pay.</p>

            <div className="card-calculator mb-8">
              {/* Regime toggle */}
              <div className="flex rounded-lg border border-input overflow-hidden mb-6">
                <button onClick={() => { setRegime("us"); setResult(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${regime === "us" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>🇺🇸 United States</button>
                <button onClick={() => { setRegime("india"); setResult(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${regime === "india" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>🇮🇳 India</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                {regime === "us" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Filing Status</label>
                    <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className="input-calc">
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                      <option value="hoh">Head of Household</option>
                    </select>
                  </div>
                )}
                {regime === "india" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Tax Regime</label>
                    <div className="flex rounded-lg border border-input overflow-hidden">
                      <button onClick={() => setIndiaRegime("new")} className={`flex-1 py-3 text-sm font-medium ${indiaRegime === "new" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>New Regime</button>
                      <button onClick={() => setIndiaRegime("old")} className={`flex-1 py-3 text-sm font-medium ${indiaRegime === "old" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>Old Regime</button>
                    </div>
                  </div>
                )}
                <InputField id="salary" label="Annual Salary" value={salary} onChange={setSalary} prefix={currSymbol} />
                <InputField id="deductions" label="Deductions" value={deductions} onChange={setDeductions} prefix={currSymbol} tooltip="Standard or itemized deductions." />
                <InputField id="retirement" label="Retirement Contributions" value={retirementContrib} onChange={setRetirementContrib} prefix={currSymbol} tooltip="401(k), IRA, or similar tax-deductible contributions." />
                <InputField id="state" label="State/Local Tax Rate" value={stateTax} onChange={setStateTax} suffix="%" />
              </div>

              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4">
                Additional Income <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
                  <InputField id="other" label="Other Income" value={otherIncome} onChange={setOtherIncome} prefix={currSymbol} />
                  <InputField id="cap" label="Capital Gains" value={capitalGains} onChange={setCapitalGains} prefix={currSymbol} />
                  <InputField id="int" label="Interest Income" value={interestIncome} onChange={setInterestIncome} prefix={currSymbol} />
                  <InputField id="div" label="Dividends" value={dividends} onChange={setDividends} prefix={currSymbol} />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate Tax</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Tax Summary</h2>
                <ResultDisplay items={[
                  { label: regime === "india" ? "Income Tax" : "Federal Tax", value: result.federalTax },
                  { label: "State/Local Tax", value: result.stateTaxAmt },
                  { label: "Total Tax", value: result.totalTax, highlight: true },
                  { label: "Effective Rate", value: 0, textValue: `${result.effectiveRate.toFixed(2)}%` },
                  { label: "Net Income", value: result.netIncome, highlight: true },
                  { label: "Monthly Take-Home", value: result.monthlyTakeHome, highlight: true },
                ]} />
                <div className="mt-6 flex justify-center">
                  <PieChart segments={[
                    { label: "Take-Home", value: result.netIncome, color: "hsl(211, 100%, 50%)" },
                    { label: regime === "india" ? "Income Tax" : "Federal Tax", value: result.federalTax, color: "hsl(220, 60%, 20%)" },
                    { label: "State Tax", value: result.stateTaxAmt, color: "hsl(210, 30%, 75%)" },
                  ]} size={180} />
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is an Income Tax Calculator?</h2>
              <p>An income tax calculator estimates the amount of federal and state taxes you owe based on your income, filing status, deductions, and other factors. It helps you understand your tax liability and plan your finances by showing your effective tax rate and monthly take-home pay.</p>
              <p>Our calculator supports both US federal tax brackets (2024) and Indian tax regimes (New and Old), making it useful for taxpayers in both countries. It accounts for deductions, retirement contributions, and multiple income sources.</p>

              <h2>Understanding Progressive Tax Brackets</h2>
              <p>The US federal income tax system uses progressive brackets, meaning different portions of your income are taxed at different rates. For example, a single filer earning $85,000 in 2024 would pay 10% on the first $11,600, 12% on income from $11,601 to $47,150, and 22% on income from $47,151 to $85,000 (after deductions).</p>
              <p>This means your effective (average) tax rate is always lower than your marginal (highest bracket) rate. Many people mistakenly believe earning more could put their entire income in a higher bracket — this is not how progressive taxes work.</p>

              <h2>Reducing Your Tax Burden</h2>
              <ul>
                <li><strong>Maximize retirement contributions:</strong> Traditional 401(k) and IRA contributions directly reduce taxable income.</li>
                <li><strong>Itemize when beneficial:</strong> If your itemized deductions (mortgage interest, state taxes, charitable donations) exceed the standard deduction, itemizing saves money.</li>
                <li><strong>Tax-loss harvesting:</strong> Offset capital gains with investment losses to reduce tax on investment income.</li>
                <li><strong>Use tax-advantaged accounts:</strong> HSAs, 529 plans, and FSAs provide tax benefits for healthcare, education, and dependent care expenses.</li>
              </ul>

              <h2>India Tax Regimes Explained</h2>
              <p>India offers two tax regimes. The New Regime has lower rates but fewer deductions. The Old Regime has higher rates but allows deductions under sections 80C, 80D, HRA, and others. Our calculator lets you compare both to find which is more beneficial for your situation.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. Tax laws are complex and change frequently. Consult a qualified tax professional for accurate tax advice specific to your situation.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/income-tax-calculator" />
            <PopularCalculators exclude="/income-tax-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default IncomeTaxCalculator;

