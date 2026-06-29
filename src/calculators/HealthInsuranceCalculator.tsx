"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface HealthInsuranceResult {
  monthlyPremium: number;
  annualPremium: number;
  deductible: number;
  outOfPocketMax: number;
  worstCaseAnnual: number;
  bestCaseAnnual: number;
  avgExpectedAnnual: number;
  breakdown: { label: string; value: string }[];
  pieData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

type PlanTier = "bronze" | "silver" | "gold" | "platinum";

// 2024 ACA marketplace average plan parameters
const PLAN_PARAMS: Record<PlanTier, { deductible: number; oopMax: number; coinsurance: number; copay: number }> = {
  bronze: { deductible: 6500, oopMax: 9450, coinsurance: 30, copay: 35 },
  silver: { deductible: 3500, oopMax: 8700, coinsurance: 20, copay: 30 },
  gold: { deductible: 1500, oopMax: 6000, coinsurance: 10, copay: 25 },
  platinum: { deductible: 500, oopMax: 4000, coinsurance: 0, copay: 15 },
};

const BASE_PREMIUMS: Record<PlanTier, { single: number; family: number }> = {
  bronze: { single: 380, family: 1140 },
  silver: { single: 520, family: 1560 },
  gold: { single: 680, family: 2040 },
  platinum: { single: 880, family: 2640 },
};

function calcHealthInsurance(
  age: number, tier: PlanTier, coverageType: string,
  stateSubsidy: number, expectedVisits: number
): HealthInsuranceResult {
  // Age factor
  const ageFactor = age < 30 ? 0.85 : age < 40 ? 1.0 : age < 50 ? 1.15 : age < 60 ? 1.35 : 1.5;
  const base = BASE_PREMIUMS[tier][coverageType as "single" | "family"];
  const monthlyPremium = Math.max(0, base * ageFactor - stateSubsidy);
  const annualPremium = monthlyPremium * 12;

  const params = PLAN_PARAMS[tier];
  // Out-of-pocket estimate based on visits
  const annualMedicalCosts = expectedVisits * 300; // ~$300 per visit gross cost
  const afterDeductible = Math.max(0, annualMedicalCosts - params.deductible);
  const coinsuranceCost = afterDeductible * (params.coinsurance / 100);
  const estimatedOOP = Math.min(params.deductible + coinsuranceCost, params.oopMax);

  const bestCaseAnnual = annualPremium; // No medical costs
  const worstCaseAnnual = annualPremium + params.oopMax; // Hit OOP max
  const avgExpectedAnnual = annualPremium + estimatedOOP;

  const breakdown = [
    { label: "Plan Tier", value: tier.charAt(0).toUpperCase() + tier.slice(1) },
    { label: "Coverage Type", value: coverageType === "single" ? "Individual" : "Family" },
    { label: "Monthly Premium", value: `$${monthlyPremium.toFixed(2)}` },
    { label: "Annual Premium", value: `$${annualPremium.toFixed(2)}` },
    { label: "Annual Deductible", value: `$${params.deductible.toLocaleString()}` },
    { label: "Out-of-Pocket Maximum", value: `$${params.oopMax.toLocaleString()}` },
    { label: "Coinsurance After Deductible", value: `${params.coinsurance}%` },
    { label: "Primary Care Copay", value: `$${params.copay}` },
    { label: "Expected Annual OOP", value: `$${estimatedOOP.toFixed(0)}` },
    { label: "Expected Total Annual Cost", value: `$${avgExpectedAnnual.toFixed(0)}` },
  ];

  const pieData = [
    { name: "Premiums", value: parseFloat(annualPremium.toFixed(0)), color: "hsl(var(--primary))" },
    { name: "Expected OOP", value: parseFloat(estimatedOOP.toFixed(0)), color: "#f59e0b" },
    { name: "Deductible Buffer", value: params.deductible - Math.min(params.deductible, estimatedOOP), color: "#22c55e" },
  ].filter(d => d.value > 0);

  const summaryStats = [
    { label: "Monthly Premium", value: `$${monthlyPremium.toFixed(2)}` },
    { label: "Annual Premium", value: `$${annualPremium.toFixed(0)}` },
    { label: "Deductible", value: `$${params.deductible.toLocaleString()}` },
    { label: "OOP Maximum", value: `$${params.oopMax.toLocaleString()}` },
    { label: "Best Case (Annual)", value: `$${bestCaseAnnual.toFixed(0)}` },
    { label: "Worst Case (Annual)", value: `$${worstCaseAnnual.toFixed(0)}` },
  ];

  return { monthlyPremium, annualPremium, deductible: params.deductible, outOfPocketMax: params.oopMax, worstCaseAnnual, bestCaseAnnual, avgExpectedAnnual, breakdown, pieData, summaryStats };
}

export default function HealthInsuranceCalculator() {
  const [age, setAge] = useState("35");
  const [tier, setTier] = useState<PlanTier>("silver");
  const [coverage, setCoverage] = useState("single");
  const [subsidy, setSubsidy] = useState("0");
  const [visits, setVisits] = useState("4");
  const [result, setResult] = useState<HealthInsuranceResult | null>(null);

  const calculate = () => {
    const a = parseInt(age) || 35, v = parseInt(visits) || 4, s = parseFloat(subsidy) || 0;
    setResult(calcHealthInsurance(a, tier, coverage, s, v));
  };

  useEffect(() => { setResult(calcHealthInsurance(35, "silver", "single", 0, 4)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const TIER_COLORS: Record<PlanTier, string> = { bronze: "#cd7f32", silver: "#94a3b8", gold: "#f59e0b", platinum: "#6366f1" };

  const faqs = [
    { question: "What are the four health insurance plan tiers?", answer: "ACA marketplace plans are divided into four metal tiers: Bronze (lowest premium, highest cost-sharing: ~$380/mo, $6,500 deductible, 30% coinsurance), Silver ($520/mo, $3,500 deductible, 20% coinsurance), Gold ($680/mo, $1,500 deductible, 10% coinsurance), Platinum ($880/mo, $500 deductible, 0% coinsurance after deductible). Bronze is best for healthy people who rarely need care; Gold/Platinum for those with frequent medical needs." },
    { question: "What is a health insurance deductible?", answer: "A deductible is the amount you pay for covered services before your insurance starts sharing costs. Example: Silver plan with $3,500 deductible means you pay the first $3,500 of covered medical bills each year. After meeting the deductible, insurance pays its share (e.g., 80% under Silver's 20% coinsurance). Preventive care (annual physicals, vaccinations) is typically covered before meeting the deductible under ACA-compliant plans." },
    { question: "What is the out-of-pocket maximum?", answer: "The out-of-pocket maximum (OOPM) is the most you'll pay for covered services in a plan year. Once you reach this limit, insurance covers 100% of covered services. For 2024, the federal OOPM limits are $9,450 for individual plans and $18,900 for family plans. After a catastrophic medical event, you'll pay your premium + OOPM at most, regardless of total medical bills. This is the key protection against catastrophic medical expenses." },
    { question: "Am I eligible for ACA premium subsidies (tax credits)?", answer: "Premium tax credits (subsidies) are available for households with income 100–400% of the Federal Poverty Level (FPL) who don't have access to affordable employer coverage. The American Rescue Plan extended enhanced subsidies through 2025: no household pays more than 8.5% of income on premiums. For 2024: at 300% FPL (~$40,000 for a single person), you'd pay ~$200/month for a Silver plan, with the government subsidy covering the rest. Use healthcare.gov to calculate your exact subsidy." },
    { question: "Should I choose a Bronze or Gold plan?", answer: "Compare annual costs based on your expected medical usage. If healthy with minimal visits: Bronze (lower premium, rarely hit deductible) typically wins. If you have regular prescriptions, specialist visits, or chronic conditions: calculate (Gold Premium + expected OOP) vs. (Bronze Premium + expected OOP). Often Gold or Silver plans cost less overall for moderate-to-heavy healthcare users because the lower deductible/coinsurance saves more than the higher premium costs." },
    { question: "What is coinsurance vs. copay?", answer: "A copay is a fixed amount paid per visit (e.g., $30 per primary care visit), regardless of the service cost. Coinsurance is a percentage of the total cost paid after meeting your deductible (e.g., 20% of a $1,000 procedure = $200 you pay; insurance pays $800). Most plans use copays for routine visits (primary care, specialist) and coinsurance for hospitalizations and major procedures. Both count toward your annual out-of-pocket maximum." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Health Insurance Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Health Insurance Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <p className="text-xs text-muted-foreground bg-secondary/30 rounded px-3 py-2">Estimates based on 2024 ACA marketplace averages. Actual premiums vary by state and insurer.</p>
            <div>
              <label className="text-base font-medium mb-1.5 block">Plan Tier</label>
              <div className="grid grid-cols-4 gap-2">
                {(["bronze", "silver", "gold", "platinum"] as PlanTier[]).map(t => (
                  <button key={t} onClick={() => setTier(t)} className={`h-10 rounded-md border text-sm font-medium capitalize transition-colors`} style={{ backgroundColor: tier === t ? `${TIER_COLORS[t]}20` : "", borderColor: tier === t ? TIER_COLORS[t] : "", color: tier === t ? TIER_COLORS[t] : "" }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Coverage Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[["single", "Individual"], ["family", "Family"]].map(([v, l]) => (
                  <button key={v} onClick={() => setCoverage(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${coverage === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} min={18} max={64} className={ci} /><span className={suf}>yrs</span></div>
              </div>
              <div>
                <label className="text-base font-medium mb-1.5 block">Monthly Subsidy</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={subsidy} onChange={e => setSubsidy(e.target.value)} min={0} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Expected Doctor Visits / Year</label>
              <div className={inp}><input type="number" value={visits} onChange={e => setVisits(e.target.value)} min={0} max={50} className={ci} /><span className={suf}>visits</span></div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setAge("35"); setTier("silver"); setCoverage("single"); setSubsidy("0"); setVisits("4"); setResult(calcHealthInsurance(35, "silver", "single", 0, 4)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Monthly Premium</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyPremium.toFixed(2)}</div>
                <div className="text-base text-muted-foreground mt-1">Annual: ${result.annualPremium.toFixed(0)} · Best case: ${result.bestCaseAnnual.toFixed(0)} · Worst case: ${result.worstCaseAnnual.toFixed(0)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Deductible", `$${result.deductible.toLocaleString()}`], ["OOP Max", `$${result.outOfPocketMax.toLocaleString()}`], ["Exp. Total", `$${result.avgExpectedAnnual.toFixed(0)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Coverage Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-3">Estimated Annual Cost Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={result.pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                      {result.pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Health Insurance Costs</h2>
            <p>This <strong>health insurance calculator</strong> estimates your total annual healthcare costs across ACA marketplace metal tiers — Bronze, Silver, Gold, and Platinum. Your true annual cost includes not just the monthly premium, but your expected out-of-pocket expenses (deductibles, copays, coinsurance) up to the out-of-pocket maximum. Choosing the "cheapest" premium isn't always the most economical choice if you have significant medical needs.</p>
            <h2>How Metal Tiers Work</h2>
            <p>ACA plans are categorized by actuarial value — the percentage of average member's medical costs the plan pays. Bronze: 60% (you pay 40%). Silver: 70% (you pay 30%). Gold: 80% (you pay 20%). Platinum: 90% (you pay 10%). Higher metal = higher premium + lower out-of-pocket costs. The optimal tier depends on your expected healthcare utilization — Bronze saves money if you're rarely sick; Gold/Platinum saves money if you have chronic conditions, frequent specialist visits, or expensive prescriptions.</p>
            <h2>ACA Premium Tax Credits</h2>
            <p>If your household income is 100–400% of the Federal Poverty Level (FPL) and you're not eligible for affordable employer coverage, Medicare, or Medicaid, you may qualify for premium tax credits (subsidies). For 2024, the enhanced subsidies from the American Rescue Plan remain in effect: no household pays more than 8.5% of income in premiums. A person earning $35,000/year would pay ~$207/month maximum. Use the official healthcare.gov calculator for precise subsidy estimates. Related tools: <a href="/calculator/disability-insurance-calculator">Disability Insurance Calculator</a>, <a href="/calculator/term-life-vs-whole-life-calculator">Term vs. Whole Life Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/health-insurance-calculator" />
          <PopularCalculators exclude="/calculator/health-insurance-calculator" />
        </div>
      </div>
    </>
  );
}
