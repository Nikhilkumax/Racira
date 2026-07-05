"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PropTaxResult {
  annualTax: number;
  monthlyTax: number;
  taxRate: number;
  taxAfterExemption: number;
  estimatedAssessed: number;
  chartData: { year: number; tax: number; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPropertyTax(homeValue: number, assessmentRatio: number, millageRate: number, exemption: number, annualAppreciation: number): PropTaxResult {
  const assessedValue = homeValue * (assessmentRatio / 100);
  const taxableValue = Math.max(0, assessedValue - exemption);
  const annualTax = taxableValue * (millageRate / 1000);
  const taxRate = homeValue > 0 ? (annualTax / homeValue) * 100 : 0;
  const monthlyTax = annualTax / 12;

  const chartData: { year: number; tax: number; value: number }[] = [];
  let val = homeValue;
  for (let y = 0; y <= 10; y++) {
    const av = val * (assessmentRatio / 100);
    const tv = Math.max(0, av - exemption);
    const tax = tv * (millageRate / 1000);
    chartData.push({ year: y, tax: Math.round(tax), value: Math.round(val) });
    val *= (1 + annualAppreciation / 100);
  }

  const breakdown = [
    { label: "Assessed Home Value", value: `$${homeValue.toLocaleString()}` },
    { label: "Assessment Ratio", value: `${assessmentRatio}%` },
    { label: "Estimated Assessed Value", value: `$${assessedValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Homestead Exemption", value: `$${exemption.toLocaleString()}` },
    { label: "Taxable Value", value: `$${taxableValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Mill Rate", value: `${millageRate} mills` },
    { label: "Annual Property Tax", value: `$${annualTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Monthly Tax", value: `$${monthlyTax.toFixed(2)}` },
    { label: "Effective Tax Rate", value: `${taxRate.toFixed(2)}%` },
  ];

  const summaryStats = [
    { label: "Annual Tax", value: `$${annualTax.toFixed(2)}` },
    { label: "Monthly Tax", value: `$${monthlyTax.toFixed(2)}` },
    { label: "Effective Rate", value: `${taxRate.toFixed(2)}%` },
    { label: "Assessed Value", value: `$${assessedValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Taxable Value", value: `$${taxableValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Tax per $1K Value", value: `$${(annualTax / homeValue * 1000).toFixed(2)}` },
  ];

  return { annualTax, monthlyTax, taxRate, taxAfterExemption: annualTax, estimatedAssessed: assessedValue, chartData, breakdown, summaryStats };
}

const DEFAULTS = { value: "350000", assessRatio: "100", millage: "15", exemption: "25000", appreciation: "3" };

export default function PropertyTaxCalculator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [assessRatio, setAssessRatio] = useState(DEFAULTS.assessRatio);
  const [millage, setMillage] = useState(DEFAULTS.millage);
  const [exemption, setExemption] = useState(DEFAULTS.exemption);
  const [appreciation, setAppreciation] = useState(DEFAULTS.appreciation);
  const [result, setResult] = useState<PropTaxResult | null>(null);

  const calculate = () => setResult(calcPropertyTax(parseFloat(value) || 350000, parseFloat(assessRatio) || 100, parseFloat(millage) || 15, parseFloat(exemption) || 25000, parseFloat(appreciation) || 3));
  const reset = () => { setValue(DEFAULTS.value); setAssessRatio(DEFAULTS.assessRatio); setMillage(DEFAULTS.millage); setExemption(DEFAULTS.exemption); setAppreciation(DEFAULTS.appreciation); setResult(calcPropertyTax(350000, 100, 15, 25000, 3)); };
  useEffect(() => { setResult(calcPropertyTax(350000, 100, 15, 25000, 3)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How is property tax calculated?", answer: "Property Tax = (Assessed Value − Exemptions) × Mill Rate ÷ 1,000. Assessed value is usually the market value multiplied by the assessment ratio (varies by state — 100% in many states, 25–50% in others). Mill rate is set by local governments: 1 mill = $1 per $1,000 of taxable value. Example: $300,000 taxable value × 15 mills = $4,500." },
    { question: "What is the homestead exemption?", answer: "A homestead exemption reduces the taxable value of your primary residence. Common amounts: $25,000–$50,000 for most states. Florida: $50,000. Texas: 20% of value. Senior exemptions may apply for homeowners 65+. You must apply for the exemption — it's not automatic in most jurisdictions." },
    { question: "What is an assessment ratio?", answer: "The assessment ratio is the percentage of market value used to determine assessed value for tax purposes. Some states assess at 100% of market value. Others assess at lower percentages: California: limited by Prop 13. New York: varies by property type. Illinois: 33.33%. Always check your local assessment ratio to calculate accurately." },
    { question: "How can I lower my property tax?", answer: "Appeal the assessed value if it's higher than fair market value (15–25% of appeals are successful). Apply for all exemptions you qualify for: homestead, senior, veteran, disability. Verify your property's classification is correct. Request your property record card to check for errors in square footage, bedroom count, or improvements." },
    { question: "Are property taxes tax-deductible?", answer: "Yes — up to $10,000 per year ($5,000 for married filing separately) under the SALT deduction cap established by the Tax Cuts and Jobs Act (2017). This applies to the combined total of state income taxes OR sales taxes, PLUS local property taxes. Only applies if you itemize deductions rather than taking the standard deduction." },
    { question: "How often are properties reassessed?", answer: "Varies widely: annually in many states, every 2–5 years in others. Some states cap annual increases (California: 2% max under Prop 13). A sale typically triggers reassessment at the sale price. New construction and significant improvements usually trigger immediate reassessment." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Property Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Property Tax Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Home Market Value</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Assessment Ratio</label><div className={inp}><input type="number" value={assessRatio} onChange={e => setAssessRatio(e.target.value)} step={1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Mill Rate</label><div className={inp}><input type="number" value={millage} onChange={e => setMillage(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">mills</span></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Homestead Exemption</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={exemption} onChange={e => setExemption(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Annual Appreciation</label><div className={inp}><input type="number" value={appreciation} onChange={e => setAppreciation(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Annual Property Tax</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.annualTax.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground mt-1">Monthly: ${result.monthlyTax.toFixed(2)} · Effective rate: {result.taxRate.toFixed(2)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Annual Tax", `$${result.annualTax.toFixed(0)}`], ["Monthly", `$${result.monthlyTax.toFixed(2)}`], ["Effective Rate", `${result.taxRate.toFixed(2)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Tax Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Annual Property Tax" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">10-Year Tax Projection</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} /><Area type="monotone" dataKey="tax" name="Annual Tax" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Property Tax Calculator?</h2>
            <p>A <strong>property tax calculator</strong> estimates your annual and monthly property tax bill based on your home&apos;s market value, local assessment ratio, mill rate, and applicable exemptions. Property taxes vary enormously by location — from under 0.3% in Hawaii to over 2.5% in New Jersey — making this calculator essential for home buyers evaluating total ownership cost.</p>
            <h2 className="text-2xl font-bold mb-3">How Property Tax Is Calculated</h2>
            <p>Property Tax = (Market Value × Assessment Ratio − Exemptions) × Mill Rate ÷ 1,000. Mill rate (or millage rate) is the tax per $1,000 of taxable value set by local governments. One mill = $1 per $1,000. A 15 mill rate on $300,000 taxable value = $4,500 annual tax.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Assessment Ratios</h2>
            <p>Not all states assess at 100% of market value. Assessment ratios vary: California, Texas, Florida: 100%. New York (residential): ~6% of market value (though nominal rates are higher). Illinois: 33.33%. This is why comparing raw mill rates across states is misleading — you must compare effective rates (tax ÷ market value × 100).</p>
            <h2 className="text-2xl font-bold mb-3">Reducing Your Property Tax Bill</h2>
            <p>Apply for all available exemptions — homestead, senior (age 65+), veteran, disability, agricultural. Appeal if assessment is above market value — file before the appeal deadline (typically 30–90 days after assessment notice). Verify property record for errors. Attend local budget meetings to understand and influence mill rate decisions.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/property-tax-calculator" />
          <PopularCalculators exclude="/calculator/property-tax-calculator" />
        </div>
      </div>
    </>
  );
}
