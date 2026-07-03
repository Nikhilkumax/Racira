"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface NetIncomeResult {
  grossIncome: number;
  totalTaxes: number;
  totalDeductions: number;
  netIncome: number;
  monthlyNet: number;
  biweeklyNet: number;
  effectiveTaxRate: number;
  pieData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcNetIncome(gross: number, federalTax: number, stateTax: number, localTax: number, fica: number, medical: number, retirement: number, other: number): NetIncomeResult {
  const totalTaxes = (gross * (federalTax + stateTax + localTax + fica)) / 100;
  const preTaxDeductions = (gross * retirement) / 100 + medical * 12; // assuming medical is monthly, converting to annual
  const otherDeductions = other * 12; // assuming monthly 
  
  const totalDeductions = totalTaxes + preTaxDeductions + otherDeductions;
  const netIncome = Math.max(0, gross - totalDeductions);
  const monthlyNet = netIncome / 12;
  const biweeklyNet = netIncome / 26;
  const effectiveTaxRate = gross > 0 ? (totalTaxes / gross) * 100 : 0;

  const pieData = [
    { name: "Take-Home Pay", value: netIncome },
    { name: "Taxes", value: totalTaxes },
    { name: "Benefits/Retirement", value: preTaxDeductions + otherDeductions },
  ];

  const breakdown = [
    { label: "Annual Gross Income", value: `$${gross.toLocaleString()}` },
    { label: "Estimated Taxes", value: `$${totalTaxes.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Benefits & Retirement", value: `$${(preTaxDeductions + otherDeductions).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Deductions", value: `$${totalDeductions.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Annual Net Income", value: `$${netIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Take-Home", value: `$${monthlyNet.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Bi-Weekly Paycheck", value: `$${biweeklyNet.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Effective Tax Rate", value: `${effectiveTaxRate.toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Annual Take-Home", value: `$${netIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Take-Home", value: `$${monthlyNet.toFixed(0)}` },
    { label: "Bi-Weekly Take-Home", value: `$${biweeklyNet.toFixed(0)}` },
    { label: "Tax Burden", value: `${effectiveTaxRate.toFixed(1)}%` },
    { label: "Total Deductions", value: `$${totalDeductions.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Keep Percentage", value: `${gross > 0 ? ((netIncome / gross) * 100).toFixed(1) : 0}%` },
  ];

  return { grossIncome: gross, totalTaxes, totalDeductions, netIncome, monthlyNet, biweeklyNet, effectiveTaxRate, pieData, breakdown, summaryStats };
}

const DEFAULTS = { gross: "75000", federal: "12", state: "4", local: "0", fica: "7.65", medical: "150", retirement: "5", other: "0" };
const PIE_COLORS = ["#10b981", "#ef4444", "#6366f1"]; 

export default function NetIncomeCalculator() {
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [federal, setFederal] = useState(DEFAULTS.federal);
  const [state, setState] = useState(DEFAULTS.state);
  const [local, setLocal] = useState(DEFAULTS.local);
  const [fica, setFica] = useState(DEFAULTS.fica);
  const [medical, setMedical] = useState(DEFAULTS.medical);
  const [retirement, setRetirement] = useState(DEFAULTS.retirement);
  const [other, setOther] = useState(DEFAULTS.other);
  
  const [result, setResult] = useState<NetIncomeResult | null>(null);

  const calculate = () => setResult(calcNetIncome(
    parseFloat(gross) || 0, parseFloat(federal) || 0, parseFloat(state) || 0, parseFloat(local) || 0, 
    parseFloat(fica) || 0, parseFloat(medical) || 0, parseFloat(retirement) || 0, parseFloat(other) || 0
  ));
  
  const reset = () => { 
    setGross(DEFAULTS.gross); setFederal(DEFAULTS.federal); setState(DEFAULTS.state); setLocal(DEFAULTS.local);
    setFica(DEFAULTS.fica); setMedical(DEFAULTS.medical); setRetirement(DEFAULTS.retirement); setOther(DEFAULTS.other);
    setResult(calcNetIncome(75000, 12, 4, 0, 7.65, 150, 5, 0)); 
  };
  
  useEffect(() => { setResult(calcNetIncome(75000, 12, 4, 0, 7.65, 150, 5, 0)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is net income vs. gross income?", answer: "Gross income is your total earnings before any taxes or deductions are taken out. Net income (take-home pay) is what actually hits your bank account after federal taxes, state taxes, FICA (Social Security & Medicare), and benefits (health insurance, 401k) are deducted." },
    { question: "What is FICA?", answer: "FICA stands for the Federal Insurance Contributions Act. It's a mandatory payroll tax that funds Social Security and Medicare. For employees, it's 7.65% (6.2% for Social Security up to a wage base limit, and 1.45% for Medicare on all earnings). Employers pay a matching 7.65%." },
    { question: "How can I increase my take-home pay?", answer: "1. Adjust your W-4 withholdings if you consistently get large tax refunds (getting a refund means you took home too little each month). 2. Review employer benefits for cheaper health insurance tiers. 3. Lower 401k contributions (though this sacrifices future wealth and matching). 4. Move to a state with no income tax." },
    { question: "Why is my take-home pay so much lower than my salary?", answer: "A typical employee keeps only 65% to 75% of their gross salary. Approximately 15-25% goes to taxes (Federal, State, FICA), and another 5-10% goes to pre-tax deductions like health insurance premiums, HSA contributions, and retirement savings (401k/403b)." },
    { question: "Are bonuses taxed differently than regular income?", answer: "Yes and no. Bonuses are considered supplemental income. The IRS requires employers to withhold federal taxes on bonuses at a flat rate of 22% (or higher for very large bonuses), rather than your standard progressive rate. However, your actual tax liability is calculated normally when you file your return." },
    { question: "What are pre-tax deductions?", answer: "Pre-tax deductions are items taken out of your paycheck before income taxes are calculated. Examples include traditional 401(k) contributions, health insurance premiums, and HSA/FSA contributions. These reduce your taxable income, effectively lowering your tax bill." },
    { question: "Does my state income tax affect my net income?", answer: "Absolutely. State income taxes vary wildly. Nine states (like Texas and Florida) have no state income tax, meaning workers keep more of their gross pay. Other states (like California and New York) have high income taxes, which significantly reduces your net income." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Net Income Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Net Income (Take-Home Pay) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Annual Gross Salary</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={gross} onChange={e => setGross(e.target.value)} className={ci} /></div></div>
            
            <h3 className="text-base font-bold text-foreground mt-2 border-b border-border pb-1">Estimated Tax Rates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Effective Fed Tax</label><div className={inp}><input type="number" value={federal} onChange={e => setFederal(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Effective State Tax</label><div className={inp}><input type="number" value={state} onChange={e => setState(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Local Tax</label><div className={inp}><input type="number" value={local} onChange={e => setLocal(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">FICA (Medicare+SS)</label><div className={inp}><input type="number" value={fica} onChange={e => setFica(e.target.value)} step={0.01} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
            </div>

            <h3 className="text-base font-bold text-foreground mt-2 border-b border-border pb-1">Benefits & Deductions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">401k Contribution</label><div className={inp}><input type="number" value={retirement} onChange={e => setRetirement(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground">%</span></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Medical/mo</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={medical} onChange={e => setMedical(e.target.value)} className={ci} /></div></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Other Deductions/mo</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={other} onChange={e => setOther(e.target.value)} className={ci} /></div></div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Take-Home Pay</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.monthlyNet.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Annual Net: ${result.netIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Bi-Weekly: ${result.biweeklyNet.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Annual Take-Home", `$${result.netIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Total Taxes", `$${result.totalTaxes.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Bi-Weekly", `$${result.biweeklyNet.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Paycheck Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label.includes("Net Income") || r.label.includes("Take-Home") ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Where Your Money Goes</h3>
                <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={result.pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>{result.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} /><Legend /></PieChart></ResponsiveContainer>
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
            <h2>What is Net Income?</h2>
            <p>Net income (often referred to colloquially as <strong>take-home pay</strong>) is the precise amount of money you actually receive in your paycheck after all mandatory taxes, voluntary benefits, and retirement contributions have been deducted from your gross salary. While your gross salary is the impressive top-line number you negotiate during a job offer, your net income is the realistic bottom-line number that dictates your lifestyle, budgeting capacity, and true financial power.</p>
            <p>Understanding the vast chasm between gross income and net income is a rite of passage for every working professional. It is the difference between what you earn on paper and what you actually have available to spend, save, and invest. For businesses, net income represents pure profit after all expenses, taxes, and costs of goods sold are subtracted from total revenue. For individuals, however, it represents your actual disposable income. Mastering the calculation and optimization of your net income is the foundational step in personal financial planning.</p>

            <h2>How It Works</h2>
            <p>The calculation from gross to net income involves subtracting a cascading series of taxes and deductions. The overarching formula is: <strong>Net Income = Gross Income – (Federal Taxes + State Taxes + Local Taxes + FICA + Pre-Tax Deductions + Post-Tax Deductions)</strong>.</p>
            <p>First, your employer deducts FICA taxes, which include Social Security and Medicare. This is a flat rate for most earners. Next, pre-tax deductions are subtracted. These are highly beneficial because they lower your taxable income. Common pre-tax deductions include traditional 401(k) contributions, health insurance premiums, and Health Savings Account (HSA) funding.</p>
            <p>After pre-tax deductions are removed, your remaining income is subject to Federal, State, and potentially Local income taxes based on your tax bracket. Finally, any post-tax deductions (such as Roth 401(k) contributions, union dues, or wage garnishments) are subtracted. The remaining balance is your true net income—the money deposited directly into your checking account.</p>

            <h2>Understanding Your Results</h2>
            <p>Our net income calculator provides a granular breakdown of exactly where your money is going, empowering you to make informed decisions about your paycheck.</p>
            <p><strong>Monthly and Bi-Weekly Take-Home:</strong> These are the most critical numbers for your personal budget. If you are paid bi-weekly, remember that two months out of the year you will receive three paychecks instead of two. Budgeting based on two paychecks per month builds an automatic savings buffer.</p>
            <p><strong>Effective Tax Rate:</strong> This is the actual percentage of your total income that goes toward taxes. Because the US tax system is progressive (you only pay higher rates on income that falls within higher brackets), your effective tax rate is always lower than your marginal (top) tax bracket.</p>
            <p><strong>Total Deductions:</strong> This aggregates all money taken from your check. It’s important to distinguish between "lost" money (like taxes) and "saved" money (like 401k contributions). High total deductions aren't necessarily bad if a large portion is going toward your retirement wealth.</p>
            <p><strong>Where Your Money Goes Chart:</strong> This visual breakdown quickly illustrates the ratio of your take-home pay versus taxes and benefits. Ideally, you want to optimize your benefits to maximize wealth-building deductions while minimizing unnecessary tax leakage.</p>

            <h2>Key Factors</h2>
            <p>Several variables drastically impact the size of your final paycheck. Adjusting these factors can legally increase your net income.</p>
            <p><strong>Federal Withholding (W-4):</strong> Your W-4 form tells your employer how much federal tax to withhold. If you consistently receive massive tax refunds in April, it means your withholding is too high—you are giving the government a free loan. Adjusting your W-4 allows you to keep more of your net income in every paycheck throughout the year.</p>
            <p><strong>State and Local Taxes:</strong> Geography plays a massive role in your net income. Nine states currently levy zero state income tax (including Texas, Florida, and Nevada). Moving from a high-tax state like California or New York to a zero-tax state can act as an immediate and substantial raise to your net income, without changing your gross salary.</p>
            <p><strong>Benefit Selections:</strong> During open enrollment, your choice of health insurance heavily impacts your paycheck. A High Deductible Health Plan (HDHP) usually has much lower premiums than a PPO, leaving more net income in your check, provided you don't incur heavy medical expenses.</p>
            <p><strong>Retirement Contributions:</strong> Contributing heavily to a traditional 401(k) significantly reduces your net income today, but it also reduces your tax burden today, while building long-term wealth. It is a calculated trade-off between current cash flow and future financial independence.</p>

            <h2>Advanced Features</h2>
            <p>For those looking to deeply analyze their compensation package, advanced metrics provide further clarity on total compensation versus net pay.</p>
            <p>This calculator allows you to model out specific local taxes, which are often overlooked but can deduct an additional 1-3% from your gross pay in cities like New York or Philadelphia. Additionally, modeling different pre-tax versus post-tax retirement contributions (Traditional vs. Roth) lets you forecast not just your current net income, but your projected tax burden in retirement.</p>
            <p>By tweaking the exact percentages for 401(k) contributions and FICA, you can find the perfect "sweet spot" that maximizes employer matches while maintaining enough monthly net income to cover your living expenses and lifestyle goals.</p>

            <h2>Practical Examples</h2>
            <p>To see how drastically location and choices affect net income, consider two professionals earning the exact same gross salary of $100,000.</p>
            <p><strong>Example A: The High-Tax Resident.</strong> Mark lives in New York City. He earns $100,000. He pays federal tax, New York State tax, and NYC local tax. He contributes 10% to his 401(k) and pays $200/month for health insurance. After FICA and all taxes, his effective tax burden is nearly 30%. His total deductions are roughly $40,000. His net income is only $60,000 a year, or $5,000 a month.</p>
            <p><strong>Example B: The Zero-Tax Resident.</strong> Sarah lives in Austin, Texas. She also earns $100,000 and contributes 10% to her 401(k) and pays $200/month for health insurance. Because Texas has no state or local income tax, her tax burden is significantly lower. Her total deductions are roughly $32,000. Her net income is $68,000 a year, or $5,666 a month. Simply by living in a different state, Sarah takes home over $8,000 more per year on the exact same salary.</p>

            <h2>Tips & Best Practices</h2>
            <p>Maximizing your net income isn't just about earning a higher gross salary; it's about efficient tax planning and strategic benefit selection.</p>
            <p>First, perform an annual W-4 checkup. The IRS provides an online withholding estimator. Ensure you are withholding exactly what you owe—no more, no less. A $3,600 tax refund is not a windfall; it is $300 a month that was missing from your net income all year long.</p>
            <p>Second, utilize tax-advantaged accounts to the absolute maximum. HSAs (Health Savings Accounts) are triple-tax-advantaged. Contributions go in pre-tax (lowering your tax burden and technically reducing current net income but increasing total wealth), grow tax-free, and come out tax-free for medical expenses.</p>
            <p>Third, regularly review your health insurance usage. If you are young, healthy, and rarely visit the doctor, paying high premiums for a "gold" tier health plan is unnecessarily bleeding your net income. Switch to a lower premium plan and invest the difference.</p>

            <h2>Benefits</h2>
            <p>Knowing your exact net income is the absolute bedrock of personal finance. You cannot build a realistic budget, get out of debt, or invest for the future using your gross salary. Gross salary is a vanity metric; net income is reality.</p>
            <p>By regularly using a net income calculator, you gain precise control over your cash flow. You will understand exactly how a raise, a move to a new state, or a change in retirement contributions will affect your daily life, allowing you to make strategic career and financial decisions with complete confidence.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/net-income-calculator" />
          <PopularCalculators exclude="/calculator/net-income-calculator" />
        </div>
      </div>
    </>
  );
}
