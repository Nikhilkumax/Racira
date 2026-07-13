"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface InheritanceTaxResult {
  totalEstate: number;
  taxableEstate: number;
  estimatedTax: number;
  effectiveRate: number;
  heirPortion: number;
  pieData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcInheritanceTax(estateValue: number, exemptionAmount: number, taxRate: number, deductions: number): InheritanceTaxResult {
  const netEstate = Math.max(0, estateValue - deductions);
  const taxableEstate = Math.max(0, netEstate - exemptionAmount);
  const estimatedTax = taxableEstate * (taxRate / 100);
  const heirPortion = netEstate - estimatedTax;
  const effectiveRate = estateValue > 0 ? (estimatedTax / estateValue) * 100 : 0;

  const pieData = [
    { name: "Estimated Tax", value: estimatedTax },
    { name: "Heir Portion", value: heirPortion },
    { name: "Deductions", value: deductions },
  ];

  const breakdown = [
    { label: "Total Estate Value", value: `$${estateValue.toLocaleString()}` },
    { label: "Deductions (Debts/Expenses)", value: `-$${deductions.toLocaleString()}` },
    { label: "Net Estate Value", value: `$${netEstate.toLocaleString()}` },
    { label: "Tax Exemption Amount", value: `$${exemptionAmount.toLocaleString()}` },
    { label: "Taxable Estate", value: `$${taxableEstate.toLocaleString()}` },
    { label: "Estimated Tax Rate", value: `${taxRate}%` },
    { label: "Estimated Tax Due", value: `$${estimatedTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Net to Heirs", value: `$${heirPortion.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Taxable Estate", value: `$${taxableEstate.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Estimated Tax", value: `$${estimatedTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective Tax Rate", value: `${effectiveRate.toFixed(2)}%` },
    { label: "Heir Portion", value: `$${heirPortion.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { totalEstate: estateValue, taxableEstate, estimatedTax, effectiveRate, heirPortion, pieData, breakdown, summaryStats };
}

const DEFAULTS = { value: "15000000", exemption: "13610000", rate: "40", deductions: "50000" };
const PIE_COLORS = ["#ef4444", "#10b981", "#9ca3af"];

export default function InheritanceTaxCalculator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [exemption, setExemption] = useState(DEFAULTS.exemption);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [deductions, setDeductions] = useState(DEFAULTS.deductions);
  
  const [result, setResult] = useState<InheritanceTaxResult | null>(null);

  const calculate = () => setResult(calcInheritanceTax(
    parseFloat(value) || 0, parseFloat(exemption) || 0, parseFloat(rate) || 0, parseFloat(deductions) || 0
  ));
  
  const reset = () => { 
    setValue(DEFAULTS.value); setExemption(DEFAULTS.exemption); setRate(DEFAULTS.rate); setDeductions(DEFAULTS.deductions);
    setResult(calcInheritanceTax(15000000, 13610000, 40, 50000)); 
  };
  
  useEffect(() => { setResult(calcInheritanceTax(15000000, 13610000, 40, 50000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the difference between an estate tax and an inheritance tax?", answer: "An estate tax is levied on the total value of a deceased person's estate before any assets are distributed. An inheritance tax is a state tax levied directly on the beneficiaries who receive the assets. At the federal level, the US only has an estate tax, not an inheritance tax." },
    { question: "What is the federal estate tax exemption for 2024?", answer: "For 2024, the federal estate tax exemption is $13.61 million per individual ($27.22 million for a married couple). If the estate's value is below this threshold, no federal estate tax is owed. Note: This high exemption limit is scheduled to sunset (cut roughly in half) at the end of 2025 unless Congress extends it." },
    { question: "Do states have their own estate or inheritance taxes?", answer: "Yes, some do. As of 2024, 12 states plus Washington D.C. have an estate tax, and 6 states have an inheritance tax (Maryland has both). State exemption limits are often much lower than the federal limit—for example, Massachusetts and Oregon have exemptions of just $1 million." },
    { question: "Are spouses subject to estate or inheritance taxes?", answer: "Generally, no. Under the unlimited marital deduction, you can leave an unlimited amount of assets to a surviving spouse (who is a U.S. citizen) free of federal estate tax. Spouses are also typically exempt from state inheritance taxes." },
    { question: "How does the 'step-up in basis' work?", answer: "When you inherit assets like stocks or real estate, the cost basis is 'stepped up' to the fair market value on the date of the original owner's death. This means if you sell the asset immediately, you owe zero capital gains tax, regardless of how much the asset appreciated during the deceased's lifetime. This is one of the most powerful tax benefits in the US tax code." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Estate/Inheritance Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Estate & Inheritance Tax Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Total Estate Value</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /></div></div>
            <div><label className="text-base font-medium mb-1.5 block">Tax Exemption Amount</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={exemption} onChange={e => setExemption(e.target.value)} className={ci} /></div><p className="text-xs text-muted-foreground mt-1">2024 Federal Limit: $13,610,000</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Marginal Tax Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Deductions/Debts</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className={ci} /></div></div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Tax Due</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.estimatedTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Net to Heirs: ${result.heirPortion.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Effective Rate: {result.effectiveRate.toFixed(2)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Taxable Estate", `$${result.taxableEstate.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Est. Tax", `$${result.estimatedTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Heirs Receive", `$${result.heirPortion.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Estate Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Estimated Tax Due") ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Estate Distribution</h3>
                <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={result.pieData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>{result.pieData.filter(d => d.value > 0).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Legend /></PieChart></ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Estate and Inheritance Taxes</h2>
            <p>Estate taxes and inheritance taxes are two different ways governments tax wealth transfer after death. The federal government only imposes an estate tax, which is calculated based on the total net value of the deceased's estate before any money is distributed. It is paid by the estate itself.</p>
            <h2 className="text-2xl font-bold mb-3">The High Federal Exemption</h2>
            <p>For the vast majority of Americans, federal estate tax is a non-issue. The 2017 Tax Cuts and Jobs Act essentially doubled the exemption amount. In 2024, an individual can leave up to $13.61 million to heirs without paying a single dime in federal estate tax. For married couples, this amount is portable, meaning a couple can shield over $27.2 million from federal taxation. However, these elevated limits are scheduled to expire at the end of 2025 unless renewed.</p>
            <h2 className="text-2xl font-bold mb-3">Watch Out for State Taxes</h2>
            <p>While you may easily avoid the federal estate tax, state taxes are a different story. Twelve states have an estate tax, often with exemptions much lower than the federal level. For example, Massachusetts and Oregon tax estates valued over just $1 million. Additionally, six states have an inheritance tax, which is paid by the heir receiving the money. The rate usually depends on the relationship to the deceased—spouses and children are often exempt, while more distant relatives or friends pay higher rates.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inheritance-tax-calculator" />
          <PopularCalculators exclude="/calculator/inheritance-tax-calculator" />
        </div>
      </div>
    </>
  );
}
