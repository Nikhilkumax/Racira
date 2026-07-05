"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SocialSecurityResult {
  monthlyBenefit62: number;
  monthlyBenefit67: number;
  monthlyBenefit70: number;
  breakEven62vs67: number;
  breakEven67vs70: number;
  lifeValueAt62: number;
  lifeValueAt67: number;
  lifeValueAt70: number;
  pia: number;
  breakdown: { label: string; value: string }[];
  comparisonData: { age: string; benefit: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSocialSecurity(
  pia: number, // Primary Insurance Amount (full retirement benefit at FRA)
  birthYear: number
): SocialSecurityResult {
  // Full Retirement Age (FRA) based on birth year
  const fra = birthYear >= 1960 ? 67 : birthYear >= 1955 ? 66 + Math.floor((birthYear - 1954) / 1) * 2 / 12 : 66;

  // Reduction for claiming at 62: 30% for post-1960 (36 months × 5/9% + 24 months × 5/12%)
  const reduction62 = fra >= 67 ? 0.30 : 0.25;
  const monthlyBenefit62 = pia * (1 - reduction62);

  // Full benefit at FRA
  const monthlyBenefit67 = pia; // assuming FRA = 67 for simplicity

  // Delayed credits: 8% per year after FRA up to 70
  const monthlyBenefit70 = pia * 1.24; // 3 years × 8% = 24% increase

  // Break-even calculations (months)
  // Break-even 62 vs 67: when do cumulative benefits equalize?
  const extraPerMonth67 = monthlyBenefit67 - monthlyBenefit62;
  const monthsForegone = (67 - 62) * 12;
  const foregone62 = monthlyBenefit62 * monthsForegone;
  const breakEven62vs67 = 67 + foregone62 / (extraPerMonth67 * 12);

  const extraPerMonth70 = monthlyBenefit70 - monthlyBenefit67;
  const monthsForegone70 = (70 - 67) * 12;
  const foregone67 = monthlyBenefit67 * monthsForegone70;
  const breakEven67vs70 = 70 + foregone67 / (extraPerMonth70 * 12);

  // Lifetime value if living to age 85
  const lifespan = 85;
  const lifeValueAt62 = monthlyBenefit62 * 12 * (lifespan - 62);
  const lifeValueAt67 = monthlyBenefit67 * 12 * (lifespan - 67);
  const lifeValueAt70 = monthlyBenefit70 * 12 * (lifespan - 70);

  const breakdown = [
    { label: "Primary Insurance Amount (PIA)", value: `$${pia.toLocaleString()}` },
    { label: "Full Retirement Age (FRA)", value: `${fra}` },
    { label: "Benefit at 62 (reduced)", value: `$${monthlyBenefit62.toFixed(2)}/mo` },
    { label: "Benefit at 67 (FRA)", value: `$${monthlyBenefit67.toFixed(2)}/mo` },
    { label: "Benefit at 70 (max)", value: `$${monthlyBenefit70.toFixed(2)}/mo` },
    { label: "Break-Even 62 vs 67", value: `Age ${breakEven62vs67.toFixed(1)}` },
    { label: "Break-Even 67 vs 70", value: `Age ${breakEven67vs70.toFixed(1)}` },
    { label: "Lifetime Value at 62 (to 85)", value: `$${lifeValueAt62.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Lifetime Value at 67 (to 85)", value: `$${lifeValueAt67.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Lifetime Value at 70 (to 85)", value: `$${lifeValueAt70.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const comparisonData = [
    { age: "Claim at 62", benefit: parseFloat(monthlyBenefit62.toFixed(2)), color: "#f59e0b" },
    { age: "Claim at 67 (FRA)", benefit: parseFloat(monthlyBenefit67.toFixed(2)), color: "hsl(var(--primary))" },
    { age: "Claim at 70 (Max)", benefit: parseFloat(monthlyBenefit70.toFixed(2)), color: "#22c55e" },
  ];

  const summaryStats = [
    { label: "PIA (at FRA)", value: `$${pia.toFixed(2)}/mo` },
    { label: "Age 62 Benefit", value: `$${monthlyBenefit62.toFixed(2)}/mo` },
    { label: "Age 70 Benefit", value: `$${monthlyBenefit70.toFixed(2)}/mo` },
    { label: "Break-Even 62/67", value: `Age ${breakEven62vs67.toFixed(1)}` },
    { label: "Break-Even 67/70", value: `Age ${breakEven67vs70.toFixed(1)}` },
    { label: "Best if Live Past", value: `Age ${Math.max(breakEven62vs67, breakEven67vs70).toFixed(0)}` },
  ];

  return { monthlyBenefit62, monthlyBenefit67, monthlyBenefit70, breakEven62vs67, breakEven67vs70, lifeValueAt62, lifeValueAt67, lifeValueAt70, pia, breakdown, comparisonData, summaryStats };
}

export default function SocialSecurityCalculator() {
  const [pia, setPia] = useState("2000");
  const [birthYear, setBirthYear] = useState("1965");
  const [result, setResult] = useState<SocialSecurityResult | null>(null);

  const calculate = () => {
    const p = parseFloat(pia) || 2000, by = parseInt(birthYear) || 1965;
    setResult(calcSocialSecurity(p, by));
  };

  useEffect(() => { setResult(calcSocialSecurity(2000, 1965)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the best age to claim Social Security?", answer: "The optimal claiming age depends on your health, longevity expectations, and financial need. Key analysis: Claim at 62: maximum years of benefits but permanently reduced (up to 30% for post-1960 birth). Claim at FRA (67): full PIA benefit. Claim at 70: maximum monthly benefit (PIA + 24% for post-1960). Break-even analysis: if you live past approximately age 79–80, delaying to 70 pays more total lifetime benefits than claiming early. If you have serious health issues or immediate financial need, claiming early makes sense." },
    { question: "What is my Social Security Primary Insurance Amount (PIA)?", answer: "Your PIA is your monthly benefit if you claim at your Full Retirement Age (FRA). It's calculated by Social Security based on your Average Indexed Monthly Earnings (AIME) over your 35 highest-earning years. Bend points apply: 90% of first $1,115 of AIME + 32% of AIME from $1,115–$6,721 + 15% of AIME above $6,721 (2024 values). You can check your estimated PIA on SSA.gov by creating a my Social Security account." },
    { question: "What is the Full Retirement Age (FRA) for Social Security?", answer: "FRA is the age at which you receive your full PIA benefit. For people born 1943–1954: FRA is 66. Born 1955–1960: FRA increases 2 months per birth year (66y2m to 66y10m). Born 1960 or later: FRA is 67. Claiming before FRA permanently reduces benefits; delaying past FRA increases them by 8% per year (in delayed retirement credits) up to age 70." },
    { question: "How does Social Security spousal benefit work?", answer: "A spouse can receive up to 50% of the working spouse's PIA (not their increased benefit from delayed claiming). Spousal benefits are available at age 62 with reduction, or full at FRA. If a spouse has their own work record, they receive their own benefit or the spousal benefit — whichever is higher. Divorced spouses can claim on an ex's record if married 10+ years, currently single, and both are 62+. The decision of when the higher-earning spouse claims significantly affects the lower-earning spouse's future survivor benefit." },
    { question: "Are Social Security benefits taxable?", answer: "Up to 85% of Social Security benefits may be federally taxable. Calculation: Combined income = Adjusted Gross Income + Nontaxable interest + 50% of SS benefits. If combined income is: under $25,000 (single) or $32,000 (married): no tax. $25,000–$34,000 (single): up to 50% of SS is taxable. Above $34,000 (single): up to 85% is taxable. Thirteeen states also tax SS benefits. Strategic Roth conversions before claiming SS can minimize combined income and reduce SS taxation." },
    { question: "Can I work while receiving Social Security?", answer: "If you claim before FRA: For 2024, Social Security withholds $1 for every $2 earned above $22,320/year. In the year you reach FRA, $1 withheld per $3 above $59,520. After reaching FRA: you can earn unlimited income with no reduction in benefits. Importantly, withheld benefits are NOT lost — they are recalculated and added back as increased monthly benefits once you reach FRA, creating a higher permanent benefit. Working also adds to your earnings record, potentially increasing your PIA." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Social Security Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Social Security Claiming Age Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-base font-medium mb-1.5 block">Your Monthly PIA (Full Retirement Benefit)</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={pia} onChange={e => setPia(e.target.value)} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Find your PIA on SSA.gov (my Social Security). Avg. 2024 benefit ≈ $1,907/mo.</p>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Year of Birth</label>
              <div className={inp}><input type="number" value={birthYear} onChange={e => setBirthYear(e.target.value)} min={1943} max={1960} className={ci} /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Determines your Full Retirement Age (FRA). Born 1960+: FRA = 67.</p>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setPia("2000"); setBirthYear("1965"); setResult(calcSocialSecurity(2000, 1965)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Full Retirement Benefit (Age 67)</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyBenefit67.toFixed(2)}<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                <div className="text-base text-muted-foreground mt-1">Claim at 62: ${result.monthlyBenefit62.toFixed(2)}/mo · Claim at 70: ${result.monthlyBenefit70.toFixed(2)}/mo</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Break-Even 62/67", `Age ${result.breakEven62vs67.toFixed(1)}`], ["Break-Even 67/70", `Age ${result.breakEven67vs70.toFixed(1)}`], ["70 Increase", `+${((result.monthlyBenefit70 / result.monthlyBenefit67 - 1) * 100).toFixed(0)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Claiming Age Analysis</h3>
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
                <h3 className="text-base font-bold mb-4">Monthly Benefit by Claiming Age</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="age" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}`} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}/month`, "Benefit"]} />
                    <Bar dataKey="benefit" radius={[4, 4, 0, 0]}>{result.comparisonData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
                  </BarChart>
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">When Should You Claim Social Security?</h2>
            <p>This <strong>Social Security calculator</strong> computes your monthly benefit at the three key claiming ages (62, FRA, and 70) and provides break-even analysis — the age at which delaying produces more total lifetime income than claiming early. For post-1960 birth years: claiming at 62 reduces your full benefit by 30%; claiming at 70 increases it by 24% (8%/year for 3 years past FRA). The break-even analysis assumes equal health and spending needs at all ages.</p>
            <h2 className="text-2xl font-bold mb-3">Break-Even Analysis</h2>
            <p>Break-even analysis answers: "At what age will I receive more total lifetime benefits by delaying?" For claiming at 67 vs. 62 (post-1960): The higher monthly benefit at 67 must offset the 60 months of foregone payments at 62. Break-even is typically around age 79–80. For 70 vs. 67: Break-even typically falls around age 82–83. If your family has a history of longevity and you're in good health, delaying maximizes lifetime benefits. If you have serious health concerns, claiming early may be prudent.</p>
            <h2 className="text-2xl font-bold mb-3">The Spousal and Survivor Benefit Dimension</h2>
            <p>For married couples, the decision of when the higher-earning spouse claims affects not just their benefit but also the surviving spouse's benefit. When one spouse dies, the surviving spouse inherits the higher of the two benefits. This means the higher earner delaying to 70 can provide a significantly larger survivor benefit for their spouse — particularly important when one spouse earned considerably more than the other. This spousal/survivor dimension often makes delayed claiming even more valuable for couples. Related tools: <a href="/calculator/retirement-calculator">Retirement Calculator</a>, <a href="/calculator/early-retirement-calculator">FIRE Calculator</a>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/social-security-calculator" />
          <PopularCalculators exclude="/calculator/social-security-calculator" />
        </div>
      </div>
    </>
  );
}
