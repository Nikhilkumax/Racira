"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmtM = (n: number) => {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
};

export default function LifeInsuranceCalculator() {
  const [annualIncome, setAnnualIncome] = useState("85000");
  const [yearsNeeded, setYearsNeeded] = useState("20");
  const [totalDebts, setTotalDebts] = useState("200000");
  const [finalExpenses, setFinalExpenses] = useState("15000");
  const [childrenExpenses, setChildrenExpenses] = useState("50000");
  const [liquidAssets, setLiquidAssets] = useState("75000");
  const [existingCoverage, setExistingCoverage] = useState("100000");
  const [method, setMethod] = useState<"dime" | "income">("dime");
  const [res, setRes] = useState<{ coverage: number; breakdown: { label: string; value: number; color: string }[]; methodName: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const income = parseFloat(annualIncome) || 0;
    const years = parseFloat(yearsNeeded) || 0;
    const debts = parseFloat(totalDebts) || 0;
    const final = parseFloat(finalExpenses) || 0;
    const kids = parseFloat(childrenExpenses) || 0;
    const liquid = parseFloat(liquidAssets) || 0;
    const existing = parseFloat(existingCoverage) || 0;

    let coverage = 0;
    const breakdown: { label: string; value: number; color: string }[] = [];

    if (method === "dime") {
      // DIME: Debt + Income + Mortgage (included in debts) + Education
      const incomeReplacement = income * years;
      breakdown.push(
        { label: "Income Replacement", value: incomeReplacement, color: "hsl(var(--primary))" },
        { label: "Total Debts", value: debts, color: "#ef4444" },
        { label: "Final Expenses", value: final, color: "#f59e0b" },
        { label: "Children's Education", value: kids, color: "#8b5cf6" },
      );
      coverage = incomeReplacement + debts + final + kids - liquid - existing;
    } else {
      // 10× Income method
      const base = income * 10;
      breakdown.push(
        { label: "10× Annual Income", value: base, color: "hsl(var(--primary))" },
        { label: "Final Expenses", value: final, color: "#f59e0b" },
        { label: "Debts", value: debts, color: "#ef4444" },
      );
      coverage = base + final + debts - liquid - existing;
    }
    setRes({ coverage: Math.max(0, coverage), breakdown, methodName: method === "dime" ? "DIME Method" : "10× Income Method" });
  };

  const reset = () => {
    setAnnualIncome("85000"); setYearsNeeded("20"); setTotalDebts("200000");
    setFinalExpenses("15000"); setChildrenExpenses("50000"); setLiquidAssets("75000"); setExistingCoverage("100000");
  };

  const faqs = [
    { question: "How much life insurance do I need?", answer: "Most financial advisors recommend coverage of 10–15× your annual income. More precisely, calculate using the DIME method: Debt (all outstanding debts including mortgage), Income (annual income × years until youngest child is independent), Mortgage (outstanding balance), Education (children's future education costs). Subtract existing coverage and liquid assets to find the gap." },
    { question: "What is the DIME method?", answer: "DIME stands for Debt + Income replacement + Mortgage + Education. It's considered the most comprehensive way to estimate life insurance needs. Add up all four components, then subtract existing savings and any life insurance already in place. The result is the additional coverage you should purchase." },
    { question: "What is the difference between term and whole life insurance?", answer: "Term life insurance covers you for a specific period (10, 20, or 30 years) and pays a death benefit only if you die during the term. It's significantly cheaper — often 5–10× less than whole life. Whole life insurance is permanent coverage with a cash value component that grows over time. Most financial planners recommend term life for pure insurance protection." },
    { question: "How does the amount of coverage affect premiums?", answer: "Premiums scale roughly linearly with coverage amount. A healthy 35-year-old male can typically get $500,000 in 20-year term coverage for $25–35/month, and $1M coverage for $40–55/month. Factors affecting premiums include: age (biggest factor), health status, smoking history, family medical history, occupation, and policy term length." },
    { question: "When should I buy life insurance?", answer: "The best time to buy life insurance is when you're young and healthy — premiums are lowest and you're most likely to qualify without exclusions. Key life events that trigger a coverage review: getting married, having children, buying a home, significant income increase, business partnership. Most people need coverage during their working years while dependents rely on their income." },
    { question: "Does life insurance cover suicide or pre-existing conditions?", answer: "Most policies have a 2-year contestability period during which the insurer can investigate and deny claims for material misrepresentation. After 2 years, most policies cover suicide. Pre-existing conditions may result in higher premiums, exclusions, or outright denial depending on severity. Always disclose all health conditions honestly when applying." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Life Insurance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Life Insurance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Your Financial Profile</h2>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Calculation Method</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {(["dime", "income"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setMethod(m)} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${method === m ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                    {m === "dime" ? "DIME Method" : "10× Income"}
                  </button>
                ))}
              </div>
            </div>
            <CompactInput id="income" label="Annual Gross Income" value={annualIncome} onChange={setAnnualIncome} prefix="$" />
            {method === "dime" && <CompactInput id="years" label="Years of Income to Replace" value={yearsNeeded} onChange={setYearsNeeded} suffix="years" />}
            <CompactInput id="debts" label="Total Debts (mortgage, loans, etc.)" value={totalDebts} onChange={setTotalDebts} prefix="$" />
            <CompactInput id="final" label="Final Expenses (funeral, etc.)" value={finalExpenses} onChange={setFinalExpenses} prefix="$" />
            {method === "dime" && <CompactInput id="kids" label="Children's Education Fund" value={childrenExpenses} onChange={setChildrenExpenses} prefix="$" />}
            <div className="border-t border-border pt-4 flex flex-col gap-4">
              <span className="text-sm font-semibold text-muted-foreground">Subtract: Assets You Already Have</span>
              <CompactInput id="liquid" label="Liquid Assets (savings, investments)" value={liquidAssets} onChange={setLiquidAssets} prefix="$" />
              <CompactInput id="existing" label="Existing Life Insurance Coverage" value={existingCoverage} onChange={setExistingCoverage} prefix="$" />
            </div>
            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
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
                  <h2 className="text-2xl font-bold mb-3">Coverage Results</h2>
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Recommended Coverage</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtM(res.coverage)}</div>
                  <div className="text-sm text-muted-foreground font-medium">Using {res.methodName} · After existing assets</div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Component</th><th className="p-2.5 pr-3 text-right">Amount</th><th className="p-2.5 pr-3 text-right">+/−</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {res.breakdown.map(b => (
                        <tr key={b.label} className="hover:bg-secondary/20">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{b.label}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground font-semibold">{fmtM(b.value)}</td>
                          <td className="p-2.5 pr-3 text-right text-emerald-600 font-bold">+</td>
                        </tr>
                      ))}
                      <tr className="hover:bg-secondary/20 text-red-500">
                        <td className="p-2.5 pl-3 font-semibold">Liquid Assets</td>
                        <td className="p-2.5 pr-3 text-right font-semibold">{fmtM(parseFloat(liquidAssets) || 0)}</td>
                        <td className="p-2.5 pr-3 text-right font-bold">−</td>
                      </tr>
                      <tr className="hover:bg-secondary/20 text-red-500">
                        <td className="p-2.5 pl-3 font-semibold">Existing Coverage</td>
                        <td className="p-2.5 pr-3 text-right font-semibold">{fmtM(parseFloat(existingCoverage) || 0)}</td>
                        <td className="p-2.5 pr-3 text-right font-bold">−</td>
                      </tr>
                      <tr className="font-bold bg-secondary/30">
                        <td className="p-2.5 pl-3 text-foreground">Additional Coverage Needed</td>
                        <td className="p-2.5 pr-3 text-right text-primary">{fmtM(res.coverage)}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">=</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Coverage Needs Breakdown</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={res.breakdown.filter(b => b.value > 0)} layout="vertical" margin={{ top: 4, right: 8, left: 80, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmtM(v)} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip formatter={(v: any) => fmtM(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Amount" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "Total Needed", value: fmtM(res.coverage + (parseFloat(existingCoverage) || 0) + (parseFloat(liquidAssets) || 0)) },
                    { label: "Already Covered", value: fmtM((parseFloat(existingCoverage) || 0) + (parseFloat(liquidAssets) || 0)) },
                    { label: "Coverage Gap", value: fmtM(res.coverage) },
                    { label: "Income Multiple", value: `${(res.coverage / Math.max(parseFloat(annualIncome) || 1, 1)).toFixed(1)}×` },
                    { label: "Annual Income", value: fmtM(parseFloat(annualIncome) || 0) },
                    { label: "Method", value: res.methodName.split(" ")[0] },
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
            <h2>How Much Life Insurance Do You Need?</h2>
            <p>Life insurance is one of the most important financial safety nets you can provide for your family, yet determining how much coverage you need is often confusing. The right amount depends on your income, debts, family situation, existing savings, and financial goals. This calculator uses two proven methods to give you a data-driven coverage estimate rather than an arbitrary rule of thumb.</p>
            <p>The most common mistake people make is either being underinsured (relying solely on employer-provided group coverage, which is typically only 1–2× salary) or overinsured (buying more permanent life insurance than needed due to aggressive sales tactics). A properly sized term life policy can provide comprehensive protection at a fraction of the cost of whole life insurance.</p>

            <h2>The DIME Method Explained</h2>
            <p>The DIME method is the most systematic approach to calculating life insurance needs. It considers four key components: <strong>Debt</strong> — all outstanding obligations your family would inherit, including mortgage, car loans, student loans, credit card debt, and personal loans. <strong>Income</strong> — your annual income multiplied by the number of years until your youngest dependent reaches financial independence (typically 18–25). <strong>Mortgage</strong> — the remaining balance on your home (often included in debt, but highlighted separately due to its size). <strong>Education</strong> — estimated future education costs for all dependent children. The total is then reduced by your liquid assets and any existing life insurance coverage to find your net coverage gap.</p>

            <h2>The 10× Income Rule</h2>
            <p>A simpler quick estimate, the 10× income rule suggests purchasing life insurance equal to 10 times your annual gross income. This approximation works reasonably well for families with average debt levels and young children. However, it's less accurate for high-debt families, those with significant savings, families with many dependents, or single-income households where the surviving spouse would need many years of income replacement. Always verify with the DIME method for a more precise figure.</p>

            <h2>Term Life vs Whole Life Insurance</h2>
            <p>For most families, term life insurance is the right choice. A 20-year level-term policy locked in at age 30–35 can provide $500,000–$1,000,000 in coverage for $25–60/month. The policy covers the period when your family is most financially vulnerable — when children are young, the mortgage is large, and retirement savings are still accumulating. By the time the term ends (typically when children are grown and the mortgage is paid off), your need for life insurance has usually diminished significantly.</p>
            <p>Whole life and universal life policies combine permanent death benefit coverage with a cash value investment component. While they can make sense in specific estate planning scenarios (particularly for high-net-worth individuals), most financial advisors recommend "buy term and invest the difference" — purchasing affordable term coverage and investing the premium savings in diversified index funds, which typically outperform insurance cash value growth over the long term.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/life-insurance-calculator" />
          <PopularCalculators exclude="/calculator/life-insurance-calculator" />
        </div>
      </div>
    </>
  );
}
