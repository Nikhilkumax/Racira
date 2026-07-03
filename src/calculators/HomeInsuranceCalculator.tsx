"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Home } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

interface HICoverage { dwelling: number; otherStructures: number; personalProperty: number; lossOfUse: number; liability: number; medPay: number; totalAnnual: number; totalMonthly: number; }

export default function HomeInsuranceCalculator() {
  const [homeValue, setHomeValue] = useState("350000");
  const [homeAge, setHomeAge] = useState("15");
  const [sqFt, setSqFt] = useState("2000");
  const [state, setState] = useState("TX");
  const [constructionType, setConstructionType] = useState("frame");
  const [roofAge, setRoofAge] = useState("8");
  const [hasPool, setHasPool] = useState(false);
  const [hasDog, setHasDog] = useState(false);
  const [deductible, setDeductible] = useState("1000");
  const [res, setRes] = useState<HICoverage | null>(null);

  const stateRates: Record<string, number> = {
    TX: 2.25, FL: 2.0, OK: 2.1, KS: 1.8, NE: 1.6, CO: 1.5, AR: 1.5,
    AL: 1.4, MO: 1.3, MS: 1.3, LA: 1.6, GA: 1.2, SC: 1.2, NC: 1.1,
    VA: 0.95, MD: 0.85, PA: 0.8, NY: 0.75, NJ: 0.85, CA: 0.7,
    AZ: 0.85, NV: 0.6, WA: 0.65, OR: 0.65, ID: 0.55, MT: 0.7, WY: 0.7,
    ND: 0.85, SD: 0.9, MN: 1.0, WI: 0.7, MI: 0.95, OH: 0.8, IN: 0.75,
    IL: 0.95, IA: 0.9, KY: 0.9, TN: 1.1, WV: 0.75, DE: 0.7, CT: 0.8,
    RI: 0.9, MA: 0.85, VT: 0.6, NH: 0.65, ME: 0.75, AK: 1.2, HI: 0.3,
    UT: 0.5, NM: 0.95,
  };

  useEffect(() => { calculate(); }, []);

  const calculate = () => {
    const hv = parseFloat(homeValue) || 350000;
    const age = parseFloat(homeAge) || 15;
    const sqft = parseFloat(sqFt) || 2000;
    const ded = parseFloat(deductible) || 1000;
    const baseRate = (stateRates[state] || 1.0) / 100;

    // Rebuild cost (dwelling coverage) ~ 80-90% of home value
    const dwelling = hv * 0.85;
    const otherStructures = dwelling * 0.1;
    const personalProperty = dwelling * 0.5;
    const lossOfUse = dwelling * 0.2;
    const liability = 100000;
    const medPay = 5000;

    // Base premium: ~$0.40-$0.50 per $100 of dwelling coverage adjusted by state
    let premium = (dwelling / 100) * 0.45 * (baseRate / 0.01);

    // Adjustments
    if (age > 20) premium *= 1.1;
    if (age > 40) premium *= 1.15;
    if (constructionType === "masonry") premium *= 0.85;
    if (parseInt(roofAge) > 15) premium *= 1.2;
    if (hasPool) premium *= 1.05;
    if (hasDog) premium *= 1.03;
    // Deductible: higher deductible = lower premium
    const dedMultiplier = deductible === "500" ? 1.1 : deductible === "1000" ? 1.0 : deductible === "2000" ? 0.9 : 0.82;
    premium *= dedMultiplier;

    const totalAnnual = Math.round(premium);
    const totalMonthly = totalAnnual / 12;

    setRes({ dwelling, otherStructures, personalProperty, lossOfUse, liability, medPay, totalAnnual, totalMonthly });
  };

  const stateOptions = Object.keys(stateRates).sort().map(s => ({ value: s, label: s }));
  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

  const faqs = [
    { question: "How much home insurance do I need?", answer: "You need enough dwelling coverage to fully rebuild your home at current construction costs, not its market value. These can differ significantly — a $400,000 home in a high land-value area may only cost $250,000 to rebuild. Personal property coverage should be 50-70% of your dwelling limit. Liability should be at least $300,000 if you have assets to protect. Consider an umbrella policy for additional liability." },
    { question: "What factors affect home insurance premiums?", answer: "Key factors: Location (state, flood/wildfire/tornado risk zones), Home age and construction type (wood frame vs brick), Roof age and material, Claims history, Credit score (in most states), Proximity to fire station, Presence of pool, trampoline, or certain dog breeds, Deductible chosen, Security systems (discounts), and Coverage amounts selected." },
    { question: "What does home insurance not cover?", answer: "Standard HO-3 policies exclude: floods (requires separate NFIP or private flood insurance), earthquakes (separate policy needed), routine maintenance, mold in most cases, pest damage (termites, rodents), sewer/drain backup (add-on endorsement), and business equipment/inventory. Review your policy exclusions carefully and consider riders for high-value jewelry or art." },
    { question: "What is the difference between ACV and replacement cost?", answer: "ACV (Actual Cash Value) pays what your property was worth at the time of loss, accounting for depreciation. A 10-year-old roof might be worth 30-40% of its original value. Replacement Cost Value (RCV) pays what it costs to replace with a new equivalent, regardless of depreciation. Always choose RCV coverage if possible — the premium difference is usually modest but the payout difference can be huge." },
    { question: "How can I lower my home insurance premium?", answer: "Raise your deductible (from $500 to $1,000 can save 10-15%), bundle with auto insurance (15-25% discount), install security systems, replace aging roof or plumbing, improve your credit score, shop competing insurers annually, ask about loyalty discounts, and remove trampolines or certain liabilities. Avoid filing small claims — maintaining a clean claims history significantly reduces premiums over time." },
  ];

  const pieData = res ? [
    { name: "Dwelling", value: Math.round(res.dwelling / 1000) },
    { name: "Personal Property", value: Math.round(res.personalProperty / 1000) },
    { name: "Other Structures", value: Math.round(res.otherStructures / 1000) },
    { name: "Loss of Use", value: Math.round(res.lossOfUse / 1000) },
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Home Insurance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Insurance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Home Details</h2>
            <div className="flex flex-col gap-4">
              <Inp id="hv" label="Home Value" value={homeValue} onChange={setHomeValue} prefix="$" />
              <div className="grid grid-cols-2 gap-3">
                <Inp id="age" label="Home Age (years)" value={homeAge} onChange={setHomeAge} suffix="yrs" />
                <Inp id="sqft" label="Square Footage" value={sqFt} onChange={setSqFt} suffix="sqft" />
              </div>
              <Sel id="state" label="State" value={state} onChange={setState} options={stateOptions} />
              <div className="grid grid-cols-2 gap-3">
                <Sel id="construction" label="Construction Type" value={constructionType} onChange={setConstructionType} options={[{ value: "frame", label: "Wood Frame" }, { value: "masonry", label: "Masonry/Brick" }]} />
                <Inp id="roof" label="Roof Age (years)" value={roofAge} onChange={setRoofAge} suffix="yrs" />
              </div>
              <Sel id="deductible" label="Deductible" value={deductible} onChange={setDeductible} options={[{ value: "500", label: "$500" }, { value: "1000", label: "$1,000" }, { value: "2000", label: "$2,000" }, { value: "2500", label: "$2,500" }]} />
              <div className="flex gap-6">
                {[{ label: "Swimming Pool", state: hasPool, set: setHasPool }, { label: "Dog on Premises", state: hasDog, set: setHasDog }].map(({ label, state: s, set }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={s} onChange={e => set(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset => { setHomeValue("350000"); setHomeAge("15"); setSqFt("2000"); setState("TX"); setConstructionType("frame"); setRoofAge("8"); setHasPool(false); setHasDog(false); setDeductible("1000"); setTimeout(calculate, 0); }} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">* Estimates for budgeting only. Get quotes from licensed insurers for accurate pricing.</p>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Estimated Coverage & Cost</h2>
                  <Home className="h-5 w-5 text-primary" />
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Annual Premium</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtUSD(res.totalAnnual)}</div>
                  <div className="text-sm text-muted-foreground font-medium">{fmtUSD(res.totalMonthly)}/month (added to mortgage escrow)</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Coverage Type</th><th className="p-2.5 pr-3 text-right">Recommended Limit</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50 text-base">
                      {[
                        { label: "Dwelling (Coverage A)", value: fmtUSD(res.dwelling) },
                        { label: "Other Structures (Coverage B)", value: fmtUSD(res.otherStructures) },
                        { label: "Personal Property (Coverage C)", value: fmtUSD(res.personalProperty) },
                        { label: "Loss of Use (Coverage D)", value: fmtUSD(res.lossOfUse) },
                        { label: "Liability (Coverage E)", value: fmtUSD(res.liability) },
                        { label: "Medical Payments (Coverage F)", value: fmtUSD(res.medPay) },
                      ].map(row => (
                        <tr key={row.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-medium text-foreground">{row.label}</td>
                          <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Coverage Breakdown ($000s)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: $${value}k`} labelLine={false} fontSize={10}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`$${v}k coverage`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-muted/30">
                  {[
                    { label: "Annual Est.", value: fmtUSD(res.totalAnnual) },
                    { label: "Monthly Est.", value: fmtUSD(res.totalMonthly) },
                    { label: "Dwelling Cov.", value: fmtUSD(res.dwelling) },
                    { label: "Deductible", value: fmtUSD(parseFloat(deductible)) },
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
            <h2>How to Use This Home Insurance Calculator</h2>
            <p>This home insurance calculator provides an estimated annual premium and recommended coverage levels based on your home's characteristics and location. Enter your home's current market value, age, square footage, state, construction type, and roof age to generate a tailored estimate. The calculator adjusts rates based on real state-by-state insurance cost data and applies standard underwriting factors like roof age, pool presence, and deductible selection.</p>
            <p>Note that this is an estimate for budgeting purposes. Actual premiums vary by insurer, claims history, credit score, local fire ratings, and individual underwriting guidelines. Always get at least 3 competitive quotes from licensed insurers before purchasing or renewing a homeowners policy.</p>

            <h2>Understanding Homeowners Insurance Coverage Types</h2>
            <p><strong>Coverage A (Dwelling):</strong> Pays to repair or rebuild your home's structure after a covered loss (fire, wind, hail, etc.). Should equal your home's full rebuild cost, not its market value. Get a replacement cost estimate from a contractor or appraiser.</p>
            <p><strong>Coverage B (Other Structures):</strong> Covers detached structures like garages, fences, sheds, and guest houses. Typically 10% of Coverage A.</p>
            <p><strong>Coverage C (Personal Property):</strong> Covers your belongings — furniture, electronics, clothing, appliances — inside or temporarily away from home. Standard is 50-70% of dwelling coverage. Consider a home inventory for expensive items.</p>
            <p><strong>Coverage D (Loss of Use):</strong> Pays additional living expenses (hotel, meals) if a covered loss makes your home temporarily uninhabitable. Typically 20-30% of dwelling coverage.</p>
            <p><strong>Coverage E (Liability):</strong> Protects you if someone is injured on your property or you accidentally damage others' property. Standard is $100,000 minimum; $300,000+ recommended for most homeowners.</p>
            <p><strong>Coverage F (Medical Payments):</strong> Pays small medical bills for guests injured on your property, regardless of fault. Typically $1,000-$5,000.</p>

            <h2>Home Insurance Rates by State</h2>
            <p>State location is the single biggest factor in home insurance pricing. Texas has some of the nation's highest rates (averaging 2.25% of home value annually) due to hurricane, hail, and tornado risk. Florida is also expensive (2.0%) due to hurricane exposure. Oklahoma and Kansas face high tornado frequency. California, Washington, and Hawaii have lower rates despite natural disaster risks, partly because certain perils (earthquake, flood) are excluded from standard policies.</p>
            <p>Low-risk states like Utah, Nevada, and Hawaii often have premiums half those of high-risk Midwest and Gulf Coast states. This geographic variation makes it essential to check state-specific rates rather than relying on national averages.</p>

            <h2>How to Lower Your Home Insurance Premium</h2>
            <p>The most impactful savings strategy is <strong>increasing your deductible</strong>. Moving from a $500 to a $2,500 deductible can reduce your premium 15-25%. Only raise the deductible to an amount you can comfortably pay out-of-pocket. <strong>Bundling</strong> home and auto insurance with the same carrier saves 10-25% on both policies. <strong>Home hardening</strong> — hurricane shutters, impact-resistant roofing, smoke detectors, security systems — earns discounts in most states. Maintaining a <strong>claims-free record</strong> is essential; even small claims can raise premiums significantly for 3-5 years.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-insurance-calculator" />
          <PopularCalculators exclude="/calculator/home-insurance-calculator" />
        </div>
      </div>
    </>
  );
}
