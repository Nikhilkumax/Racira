"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUSD = (n: number) => `$${fmt(n)}`;

const Inp = ({ id, label, value, onChange, prefix, suffix }: { id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const Sel = ({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <select id={id} value={value} onChange={e => onChange(e.target.value)} className="rounded-md border border-input bg-background h-10 px-3 text-base text-foreground outline-none shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

interface SSResult {
  monthlyBenefit: number;
  annualBenefit: number;
  lifetimeTotal: number;
  breakEvenAge: number;
  earlyBenefit: number;
  fullBenefit: number;
  delayedBenefit: number;
  claimingData: { age: number; monthly: number; cumulative: number }[];
}

export default function SocialSecurityBenefitsCalculator() {
  const [currentAge, setCurrentAge] = useState("55");
  const [retirementAge, setRetirementAge] = useState("67");
  const [avgEarnings, setAvgEarnings] = useState("75000");
  const [yearsWorked, setYearsWorked] = useState("30");
  const [maritalStatus, setMaritalStatus] = useState("single");
  const [spouseEarnings, setSpouseEarnings] = useState("45000");
  const [res, setRes] = useState<SSResult | null>(null);

  useEffect(() => { calculate(); }, []);

  // Simplified SSA bend point calculation
  const estimatePIA = (aime: number): number => {
    const b1 = 1115, b2 = 6721; // 2024 bend points
    if (aime <= b1) return aime * 0.90;
    if (aime <= b2) return b1 * 0.90 + (aime - b1) * 0.32;
    return b1 * 0.90 + (b2 - b1) * 0.32 + (aime - b2) * 0.15;
  };

  const calculate = () => {
    const ca = parseInt(currentAge) || 55;
    const ra = parseInt(retirementAge) || 67;
    const ae = parseFloat(avgEarnings) || 75000;
    const yw = parseInt(yearsWorked) || 30;

    // AIME = average indexed monthly earnings (simplified: use top-35 years average)
    const effectiveYears = Math.min(yw, 35);
    const aime = (ae / 12) * (effectiveYears / 35);
    const pia = estimatePIA(aime); // Full retirement benefit (PIA) at FRA

    const fra = 67; // Full Retirement Age for born 1960+
    const claimingAge = Math.max(62, Math.min(70, ra));

    // Early claiming reduction: 5/9% per month for first 36 months, 5/12% thereafter
    let monthlyBenefit = pia;
    if (claimingAge < fra) {
      const monthsEarly = (fra - claimingAge) * 12;
      const reduction = monthsEarly <= 36 ? monthsEarly * (5 / 9 / 100) : 36 * (5 / 9 / 100) + (monthsEarly - 36) * (5 / 12 / 100);
      monthlyBenefit = pia * (1 - reduction);
    } else if (claimingAge > fra) {
      const monthsLate = (claimingAge - fra) * 12;
      monthlyBenefit = pia * (1 + monthsLate * (8 / 12 / 100));
    }

    const earlyBenefit = pia * (1 - 36 * (5 / 9 / 100) - 12 * (5 / 12 / 100)); // age 62
    const fullBenefit = pia; // age 67
    const delayedBenefit = pia * (1 + 36 * (8 / 12 / 100)); // age 70

    const annualBenefit = monthlyBenefit * 12;
    const yearsReceiving = Math.max(0, 85 - claimingAge); // assume life to 85
    const lifetimeTotal = annualBenefit * yearsReceiving;

    // Break-even: when does delaying pay off vs claiming early?
    const earlyTotal = (age: number) => Math.max(0, age - 62) * 12 * earlyBenefit;
    const delayedTotal = (age: number) => Math.max(0, age - 70) * 12 * delayedBenefit;
    let breakEvenAge = 70;
    for (let age = 70; age <= 90; age++) {
      if (delayedTotal(age) >= earlyTotal(age)) { breakEvenAge = age; break; }
    }

    const claimingData = [62, 63, 64, 65, 66, 67, 68, 69, 70].map(age => {
      let mb = pia;
      if (age < fra) {
        const me = (fra - age) * 12;
        const r = me <= 36 ? me * (5 / 9 / 100) : 36 * (5 / 9 / 100) + (me - 36) * (5 / 12 / 100);
        mb = pia * (1 - r);
      } else if (age > fra) {
        mb = pia * (1 + (age - fra) * 12 * (8 / 12 / 100));
      }
      const cumulative = mb * 12 * (85 - age);
      return { age, monthly: Math.round(mb), cumulative: Math.round(cumulative) };
    });

    setRes({ monthlyBenefit, annualBenefit, lifetimeTotal, breakEvenAge, earlyBenefit, fullBenefit, delayedBenefit, claimingData });
  };

  const faqs = [
    { question: "At what age should I claim Social Security?", answer: "There's no universal 'best' answer — it depends on your health, other income sources, marital status, and need for cash flow. Claiming at 62 gives you the most years of benefits but each check is 30% smaller than at 67 (and 25% smaller than waiting until 70). Claiming at 70 maximizes each monthly payment (24% higher than at 67) but requires surviving long enough to break even — typically around age 80-81. Those in poor health or with no other income often benefit from claiming early; those with good health and alternative income sources benefit from delaying." },
    { question: "How is my Social Security benefit calculated?", answer: "SSA calculates your Primary Insurance Amount (PIA) using your highest 35 years of inflation-adjusted earnings. First, they calculate your Average Indexed Monthly Earnings (AIME). Then they apply a progressive formula using 'bend points': 90% of the first $1,115 of AIME, 32% of the next $5,606, and 15% of any remainder (2024 figures). Lower earners receive a higher replacement rate as a percentage of their wages — this is by design, as Social Security is both an insurance program and a social safety net." },
    { question: "Can I work and collect Social Security at the same time?", answer: "Yes, but if you claim before Full Retirement Age (FRA), your benefit is reduced $1 for every $2 earned above the annual limit ($22,320 in 2024). In the year you reach FRA, the limit increases to $59,520 and the reduction is $1 for every $3 over the limit. Once you reach FRA, you can earn unlimited income without any benefit reduction. Benefits withheld due to earnings are later recalculated upward at FRA, so the 'lost' benefits are partially recovered." },
    { question: "How does marriage affect Social Security benefits?", answer: "Married spouses can claim a spousal benefit of up to 50% of their partner's PIA (or their own earned benefit, whichever is larger). Divorced spouses can claim on an ex's record if the marriage lasted 10+ years and they remain unmarried. Widow(er)s can claim 100% of a deceased spouse's benefit. These provisions mean that optimizing Social Security as a couple is a two-person planning exercise — strategies like 'claim and switch' or coordinating claiming ages can substantially increase lifetime household benefits." },
    { question: "Will Social Security run out of money?", answer: "Social Security's trust funds are projected to be exhausted by 2033-2035 if no legislative changes are made. However, even after depletion, ongoing payroll taxes would fund approximately 75-80% of promised benefits. Congress has historically acted before benefits were cut — the 1983 reforms last addressed a similar crisis. Most analysts expect a combination of higher payroll taxes, benefit adjustments for higher earners, or retirement age increases to restore long-term solvency rather than complete elimination of benefits." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Social Security Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Social Security Benefits Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Your Information</h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Inp id="currage" label="Current Age" value={currentAge} onChange={setCurrentAge} suffix="yrs" />
                <Inp id="retage" label="Planned Claim Age" value={retirementAge} onChange={setRetirementAge} suffix="yrs" />
              </div>
              <Inp id="earnings" label="Average Annual Earnings" value={avgEarnings} onChange={setAvgEarnings} prefix="$" />
              <Inp id="yw" label="Years Worked (max 35)" value={yearsWorked} onChange={setYearsWorked} suffix="yrs" />
              <Sel id="marital" label="Marital Status" value={maritalStatus} onChange={setMaritalStatus} options={[{ value: "single", label: "Single" }, { value: "married", label: "Married" }, { value: "widowed", label: "Widowed" }]} />
              {maritalStatus === "married" && (
                <Inp id="spouse" label="Spouse Average Earnings" value={spouseEarnings} onChange={setSpouseEarnings} prefix="$" />
              )}
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> This is a simplified estimate. Create a my Social Security account at ssa.gov for your actual benefit projection.
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={() => { setCurrentAge("55"); setRetirementAge("67"); setAvgEarnings("75000"); setYearsWorked("30"); setMaritalStatus("single"); setTimeout(calculate, 0); }} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Estimated Benefits</h2>
                  <Shield className="h-5 w-5 text-primary" />
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Monthly Benefit at Age {retirementAge}</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtUSD(Math.round(res.monthlyBenefit))}/mo</div>
                  <div className="text-sm text-muted-foreground font-medium">{fmtUSD(Math.round(res.annualBenefit))}/year | Lifetime est.: {fmtUSD(Math.round(res.lifetimeTotal))}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Claiming Age</th><th className="p-2.5 pr-3 text-right">Monthly Benefit</th><th className="p-2.5 pr-3 text-right">vs Age 67</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      {[
                        { label: "Age 62 (Early)", value: res.earlyBenefit, diff: ((res.earlyBenefit / res.fullBenefit - 1) * 100) },
                        { label: "Age 67 (Full)", value: res.fullBenefit, diff: 0 },
                        { label: "Age 70 (Maximum)", value: res.delayedBenefit, diff: ((res.delayedBenefit / res.fullBenefit - 1) * 100) },
                      ].map(row => (
                        <tr key={row.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-medium text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmtUSD(Math.round(row.value))}/mo</td>
                          <td className={`p-2.5 pr-3 text-right font-semibold ${row.diff < 0 ? "text-red-500" : row.diff > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                            {row.diff === 0 ? "Baseline" : `${row.diff > 0 ? "+" : ""}${row.diff.toFixed(1)}%`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Monthly Benefit by Claiming Age</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={res.claimingData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="age" tick={{ fontSize: 10 }} label={{ value: "Claiming Age", position: "insideBottom", offset: -2, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                      <Tooltip formatter={(v: any) => [fmtUSD(v), "Monthly Benefit"]} labelFormatter={l => `Claim at age ${l}`} />
                      <Bar dataKey="monthly" name="Monthly Benefit" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "Monthly", value: fmtUSD(Math.round(res.monthlyBenefit)) },
                    { label: "Annual", value: fmtUSD(Math.round(res.annualBenefit)) },
                    { label: "Lifetime Est.", value: fmtUSD(Math.round(res.lifetimeTotal)) },
                    { label: "Break-Even Age", value: `~${res.breakEvenAge}` },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Social Security Benefits Are Calculated</h2>
            <p>The Social Security Administration (SSA) calculates your benefit using a three-step process. First, your actual earnings history is indexed for inflation to create a consistent comparison across years. Second, the SSA takes your 35 highest-earning years (after indexing) and averages them to compute your Average Indexed Monthly Earnings (AIME). If you have fewer than 35 years of covered employment, zeros are included for missing years, lowering your AIME. Third, the AIME is run through a progressive bend-point formula to calculate your Primary Insurance Amount (PIA) — the benefit you receive if you claim exactly at your Full Retirement Age (FRA).</p>
            <p>The bend point formula for 2024: 90% of the first $1,115 of AIME, plus 32% of AIME from $1,115-$6,721, plus 15% of AIME above $6,721. This progressive structure means lower earners receive a higher replacement rate of their pre-retirement income — typically 55-65% for low earners vs 25-35% for high earners.</p>

            <h2 className="text-2xl font-bold mb-3">When Should You Claim Social Security?</h2>
            <p>The claiming age decision is one of the most consequential financial choices of your retirement. You can claim as early as 62 (with reduced benefits) or delay up to 70 (with enhanced benefits). Claiming before your Full Retirement Age (66-67 depending on birth year) permanently reduces your monthly check. Delaying past FRA increases it by 8% per year — a guaranteed, inflation-adjusted return that's hard to beat in any other investment.</p>
            <p>The break-even analysis compares when delayed benefits overtake early benefits in lifetime total. Claiming at 62 vs 70: you need to survive to approximately age 80-81 for the age-70 strategy to pay off in lifetime dollars. Given average life expectancy of ~78-79, it's a close call — but for anyone in good health, delaying often maximizes lifetime benefits.</p>

            <h2 className="text-2xl font-bold mb-3">Spousal and Survivor Benefits</h2>
            <p>Married couples have additional Social Security strategies available. Spousal benefits allow a spouse who worked less (or not at all) to receive up to 50% of their partner's PIA. Survivor benefits are 100% of the deceased spouse's benefit. These provisions create powerful planning opportunities: the higher-earning spouse delaying to 70 maximizes both their own benefit AND the survivor benefit the surviving spouse will collect potentially for decades.</p>

            <h2 className="text-2xl font-bold mb-3">Taxes on Social Security Benefits</h2>
            <p>Up to 85% of Social Security benefits may be subject to federal income tax depending on your "combined income" (adjusted gross income + nontaxable interest + 50% of Social Security benefits). If combined income exceeds $34,000 (single) or $44,000 (married filing jointly), up to 85% of benefits are taxable. 13 states also tax Social Security to varying degrees. This makes Roth IRA conversions before claiming Social Security attractive for some retirees, as Roth distributions don't count toward combined income thresholds.</p>

            <h2 className="text-2xl font-bold mb-3">Maximizing Your Social Security Benefits</h2>
            <p>Work at least 35 years to avoid zero-income years pulling down your AIME. Maximize earnings during your peak earning years — each additional dollar of earnings up to the Social Security wage base ($168,600 in 2024) increases your eventual benefit. If you stop working before 62, consider whether working a few additional years would meaningfully raise your 35-year earnings average. For married couples, coordinate claiming ages strategically — often the lower earner claims early while the higher earner delays to 70. Review your Social Security earnings record annually at ssa.gov for errors that can permanently reduce your benefit.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/social-security-benefits-calculator" />
          <PopularCalculators exclude="/calculator/social-security-benefits-calculator" />
        </div>
      </div>
    </>
  );
}
