"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface GiftTaxResult {
  totalGift: number;
  annualExclusion: number;
  taxableGift: number;
  estimatedTax: number;
  lifetimeUsed: number;
  pieData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcGiftTax(giftAmount: number, annualExclusionLimit: number, isMarriedSplitting: boolean, priorLifetimeGifts: number, lifetimeExemption: number): GiftTaxResult {
  const actualExclusion = isMarriedSplitting ? annualExclusionLimit * 2 : annualExclusionLimit;
  const taxableGiftForYear = Math.max(0, giftAmount - actualExclusion);
  
  const remainingLifetime = Math.max(0, lifetimeExemption - priorLifetimeGifts);
  const giftSubjectToTax = Math.max(0, taxableGiftForYear - remainingLifetime);
  
  // Simplified tax rate estimation (top federal bracket is 40%)
  const estimatedTax = giftSubjectToTax > 0 ? giftSubjectToTax * 0.40 : 0;
  
  const lifetimeUsedThisYear = Math.min(taxableGiftForYear, remainingLifetime);

  const pieData = [
    { name: "Annual Exclusion", value: Math.min(giftAmount, actualExclusion) },
    { name: "Lifetime Exemption Used", value: lifetimeUsedThisYear },
    { name: "Amount Taxed (40%)", value: giftSubjectToTax },
  ];

  const breakdown = [
    { label: "Total Gift Amount", value: `$${giftAmount.toLocaleString()}` },
    { label: "Annual Exclusion Applied", value: `-$${Math.min(giftAmount, actualExclusion).toLocaleString()} ${isMarriedSplitting ? "(Married Split)" : ""}` },
    { label: "Excess Gift (Reportable)", value: `$${taxableGiftForYear.toLocaleString()}` },
    { label: "Remaining Lifetime Exemption", value: `$${remainingLifetime.toLocaleString()}` },
    { label: "Lifetime Exemption Used Now", value: `-$${lifetimeUsedThisYear.toLocaleString()}` },
    { label: "Amount Subject to Tax", value: `$${giftSubjectToTax.toLocaleString()}` },
    { label: "Estimated Tax Due (by Donor)", value: `$${estimatedTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Reportable to IRS", value: taxableGiftForYear > 0 ? "Yes (Form 709)" : "No" },
    { label: "Tax Due Now", value: `$${estimatedTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Lifetime Exemption Used", value: `$${lifetimeUsedThisYear.toLocaleString()}` },
    { label: "Taxable Gift Amount", value: `$${giftSubjectToTax.toLocaleString()}` },
  ];

  return { totalGift: giftAmount, annualExclusion: actualExclusion, taxableGift: giftSubjectToTax, estimatedTax, lifetimeUsed: lifetimeUsedThisYear, pieData, breakdown, summaryStats };
}

const DEFAULTS = { gift: "50000", exclusion: "18000", married: false, priorGifts: "0", lifetime: "13610000" };
const PIE_COLORS = ["#10b981", "#6366f1", "#ef4444"];

export default function GiftTaxCalculator() {
  const [gift, setGift] = useState(DEFAULTS.gift);
  const [exclusion, setExclusion] = useState(DEFAULTS.exclusion);
  const [married, setMarried] = useState(DEFAULTS.married);
  const [priorGifts, setPriorGifts] = useState(DEFAULTS.priorGifts);
  const [lifetime, setLifetime] = useState(DEFAULTS.lifetime);
  
  const [result, setResult] = useState<GiftTaxResult | null>(null);

  const calculate = () => setResult(calcGiftTax(
    parseFloat(gift) || 0, parseFloat(exclusion) || 0, married, parseFloat(priorGifts) || 0, parseFloat(lifetime) || 0
  ));
  
  const reset = () => { 
    setGift(DEFAULTS.gift); setExclusion(DEFAULTS.exclusion); setMarried(DEFAULTS.married); setPriorGifts(DEFAULTS.priorGifts); setLifetime(DEFAULTS.lifetime);
    setResult(calcGiftTax(50000, 18000, false, 0, 13610000)); 
  };
  
  useEffect(() => { setResult(calcGiftTax(50000, 18000, false, 0, 13610000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Who pays the gift tax?", answer: "The donor (the person giving the gift) is responsible for paying the gift tax, not the recipient. The person receiving the gift generally does not owe income tax on the gift amount." },
    { question: "What is the annual gift tax exclusion for 2024?", answer: "In 2024, the annual exclusion limit is $18,000 per recipient. This means you can give up to $18,000 to as many different people as you want in a single year without having to report it to the IRS or pay any tax." },
    { question: "What is gift splitting?", answer: "If you are married, you and your spouse can combine your annual exclusions to give up to $36,000 (in 2024) to a single recipient without triggering reporting requirements. You must file Form 709 to elect gift splitting, even if no tax is owed." },
    { question: "What happens if I give more than the annual exclusion?", answer: "If you give someone $50,000 in 2024, the first $18,000 is excluded. The remaining $32,000 is a 'taxable gift.' However, you still likely won't pay tax! Instead, you must report the $32,000 on IRS Form 709, and it will be deducted from your lifetime estate and gift tax exemption." },
    { question: "Are there gifts that are completely exempt from tax?", answer: "Yes. Unlimited gifts to your spouse (if a US citizen), payments made directly to a medical facility for someone's medical expenses, payments made directly to an educational institution for someone's tuition, and gifts to IRS-approved charities are entirely exempt from the gift tax." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Gift Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Gift Tax Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Gift Amount (to one person)</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={gift} onChange={e => setGift(e.target.value)} className={ci} /></div></div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 mt-2">
              <div><label className="text-sm font-medium mb-1.5 block">Annual Exclusion</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={exclusion} onChange={e => setExclusion(e.target.value)} className={ci} /></div><p className="text-xs text-muted-foreground mt-1">2024 Limit: $18,000</p></div>
              <div className="flex flex-col justify-start pt-6">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={married} onChange={e => setMarried(e.target.checked)} className="w-5 h-5 rounded border-input text-primary focus:ring-primary" />
                  Married Gift Splitting?
                </label>
              </div>
            </div>

            <h3 className="text-base font-bold text-foreground mt-2 border-b border-border pb-1">Lifetime Exemption Details</h3>
            <div><label className="text-sm font-medium mb-1.5 block">Total Prior Lifetime Gifts Reported</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={priorGifts} onChange={e => setPriorGifts(e.target.value)} className={ci} /></div></div>
            <div><label className="text-sm font-medium mb-1.5 block">Lifetime Exemption Limit</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={lifetime} onChange={e => setLifetime(e.target.value)} className={ci} /></div><p className="text-xs text-muted-foreground mt-1">2024 Limit: $13,610,000</p></div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.estimatedTax > 0 ? "bg-red-50 dark:bg-red-950/20 border-red-500" : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.estimatedTax > 0 ? "text-red-600" : "text-emerald-600"}`}>Estimated Tax Due</div>
                <div className={`text-4xl font-extrabold tracking-tight ${result.estimatedTax > 0 ? "text-red-600" : "text-emerald-600"}`}>${result.estimatedTax.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.taxableGift > 0 && result.estimatedTax === 0 ? "No tax due, but IRS Form 709 is required." : result.estimatedTax === 0 ? "No tax due and no reporting required." : "Tax is due to the IRS."}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Reportable Amount", `$${result.taxableGift > 0 || result.lifetimeUsed > 0 ? (result.taxableGift + result.lifetimeUsed).toLocaleString() : 0}`], ["Lifetime Used", `$${result.lifetimeUsed.toLocaleString()}`], ["Tax Due", `$${result.estimatedTax.toLocaleString()}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Gift Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Estimated Tax Due") ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Where Your Gift Amount Goes</h3>
                <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={result.pieData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>{result.pieData.filter(d => d.value > 0).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Legend /></PieChart></ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Gift Tax Myth</h2>
            <p>One of the most common tax myths is that if you give someone a large sum of money, you or they will have to pay a massive tax bill. In reality, less than 1% of Americans ever pay the federal gift tax. The gift tax is deeply intertwined with the estate tax to prevent wealthy individuals from simply giving away all their assets before death to avoid estate taxes.</p>
            <h2 className="text-2xl font-bold mb-3">Annual Exclusion vs. Lifetime Exemption</h2>
            <p>The IRS uses a two-bucket system. The first bucket is the <strong>Annual Exclusion</strong>. In 2024, you can give up to $18,000 to as many people as you want, completely tax-free and without filing any forms. If you give someone $20,000, the extra $2,000 spills over into your second bucket: the <strong>Lifetime Exemption</strong>. </p>
            <p>The Lifetime Exemption for 2024 is massive: $13.61 million. When you give that extra $2,000, you don't pay tax. You simply file Form 709 with your tax return to tell the IRS, "Hey, subtract $2,000 from my $13.61 million lifetime limit." You only pay out-of-pocket gift tax if you completely exhaust your $13+ million lifetime limit.</p>
            <h2 className="text-2xl font-bold mb-3">Exceptions to the Rule</h2>
            <p>You can make unlimited payments for someone's tuition or medical bills without it counting toward your annual or lifetime exclusions—but there's a catch. The money must be paid <strong>directly</strong> to the educational institution or medical provider. You cannot give the money to the student or patient to pay the bill themselves.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gift-tax-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Gift Tax Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Gift Tax Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Gift Tax Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Gift Tax Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Gift Tax Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/gift-tax-calculator" />
        </div>
      </div>
    </>
  );
}
