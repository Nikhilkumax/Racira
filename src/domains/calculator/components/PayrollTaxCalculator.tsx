"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SS_RATE = 0.062; // each side
const MEDICARE_RATE = 0.0145; // each side
const ADD_MEDICARE_RATE = 0.009; // employee only, above threshold
const SS_WAGE_BASE = 176100; // 2025
const ADD_MEDICARE_THRESHOLD = 200000; // single filer
const FUTA_RATE = 0.006; // 6.0% less 5.4% credit when state UI is current
const DEFAULT_SUTA = 0.027;

const PERIODS: { label: string; perYear: number }[] = [
  { label: "Weekly", perYear: 52 },
  { label: "Biweekly", perYear: 26 },
  { label: "Semi-monthly", perYear: 24 },
  { label: "Monthly", perYear: 12 },
];

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}
function fmtUSD0(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const DEFAULTS = { salary: "75000", period: "Biweekly", suta: String(DEFAULT_SUTA * 100) };

export default function PayrollTaxCalculator() {
  const [salary, setSalary] = useState(DEFAULTS.salary);
  const [period, setPeriod] = useState(DEFAULTS.period);
  const [suta, setSuta] = useState(DEFAULTS.suta);
  const [calculated, setCalculated] = useState(false);

  const annual = Math.max(0, parseFloat(salary) || 0);
  const sutaRate = Math.max(0, Math.min(15, parseFloat(suta) || 0)) / 100;

  const ssEmp = Math.min(annual, SS_WAGE_BASE) * SS_RATE;
  const mcEmp = annual * MEDICARE_RATE;
  const addMc = Math.max(0, annual - ADD_MEDICARE_THRESHOLD) * ADD_MEDICARE_RATE;
  const employeeShare = ssEmp + mcEmp + addMc;

  const ssEmpr = Math.min(annual, SS_WAGE_BASE) * SS_RATE;
  const mcEmpr = annual * MEDICARE_RATE;
  const futa = Math.min(annual, 7000) * FUTA_RATE;
  const sutaAmt = Math.min(annual, 42000) * sutaRate;
  const employerShare = ssEmpr + mcEmpr + futa + sutaAmt;

  const totalTax = employeeShare + employerShare;
  const totalEmployerCost = annual + employerShare;
  const employeeRate = annual > 0 ? (employeeShare / annual) * 100 : 0;

  const perYear = PERIODS.find(p => p.label === period)?.perYear ?? 26;
  const chartData = [
    { name: "Employee SS", value: Number(ssEmp.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Employee Medicare", value: Number(mcEmp.toFixed(2)), fill: "#0ea5e9" },
    { name: "Employer SS", value: Number(ssEmpr.toFixed(2)), fill: "#10b981" },
    { name: "Employer Medicare", value: Number(mcEmpr.toFixed(2)), fill: "#f59e0b" },
    { name: "FUTA", value: Number(futa.toFixed(2)), fill: "#8b5cf6" },
    { name: "SUTA", value: Number(sutaAmt.toFixed(2)), fill: "#ef4444" },
  ].filter(d => d.value > 0);

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => {
    setSalary(DEFAULTS.salary);
    setPeriod(DEFAULTS.period);
    setSuta(DEFAULTS.suta);
    setCalculated(false);
  };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "Which taxes count as payroll taxes?", answer: "The FICA taxes — Social Security (6.2% each side up to the $176,100 wage base in 2025) and Medicare (1.45% each side, uncapped) — plus federal unemployment (FUTA) and state unemployment (SUTA). Income tax withholding is separate; this calculator focuses on payroll taxes only." },
    { question: "Why does the employer side cost so much?", answer: "Employers match Social Security and Medicare dollar-for-dollar, then pay FUTA and SUTA on top. For a $75,000 employee in a 2.7% SUTA state, the employer share lands around $8,700 — about 11.6% of gross pay, before any benefits." },
    { question: "What is the additional Medicare tax?", answer: "Employees earning above $200,000 (single) pay an extra 0.9% Medicare surtax on the excess. It is employee-only — employers never pay it, so it widens the gap between the two sides for high earners." },
    { question: "When does FUTA apply?", answer: "FUTA is 6.0% of the first $7,000 of wages, but most employers claim the 5.4% credit for timely state UI payments, netting the effective 0.6% used here. It only ever touches the first $7,000 of each employee's pay." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Payroll Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Payroll Tax Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Annual gross salary per employee</label>
              <input type="number" min={0} value={salary} onChange={e => setSalary(e.target.value)} className={inp} placeholder="75000" />
            </div>
            <div>
              <label className={lbl}>Pay frequency</label>
              <select value={period} onChange={e => setPeriod(e.target.value)} className={inp}>
                {PERIODS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>State unemployment (SUTA) rate %</label>
              <input type="number" min={0} max={15} step={0.1} value={suta} onChange={e => setSuta(e.target.value)} className={inp} placeholder="2.7" />
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">2025 rates: SS 6.2% each side (up to ${SS_WAGE_BASE.toLocaleString()}), Medicare 1.45% each side, employee-only 0.9% surtax above ${ADD_MEDICARE_THRESHOLD.toLocaleString()}, FUTA 0.6% effective on the first $7,000.</p>
          </div>

          {calculated && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Payroll Tax · Both Sides</div>
                <div className="text-3xl font-extrabold tracking-tight">{fmtUSD0(totalTax)}/yr</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtUSD0(employeeShare)} employee · {fmtUSD0(employerShare)} employer</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Employee share", fmtUSD0(employeeShare), `${employeeRate.toFixed(1)}% of pay`], ["Employer share", fmtUSD0(employerShare), `${((employerShare / Math.max(1, annual)) * 100).toFixed(1)}% of pay`], ["Employer cost", fmtUSD0(totalEmployerCost), `${perYear} pay periods/yr`]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Where the Payroll Tax Goes</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} strokeWidth={0}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number | string) => [fmtUSD0(Number(v)), ""]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Social Security and Medicare dominate — FUTA and SUTA are small because they cap early</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Annual Breakdown</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Employee Social Security:</span><span className="font-semibold">{fmtUSD(ssEmp)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Employer Social Security:</span><span className="font-semibold">{fmtUSD(ssEmpr)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Employee Medicare:</span><span className="font-semibold">{fmtUSD(mcEmp)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Employer Medicare:</span><span className="font-semibold">{fmtUSD(mcEmpr)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Additional Medicare:</span><span className="font-semibold">{addMc > 0 ? fmtUSD(addMc) : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">FUTA (federal):</span><span className="font-semibold">{fmtUSD(futa)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SUTA (state):</span><span className="font-semibold">{fmtUSD(sutaAmt)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Per period (employee):</span><span className="font-semibold">{fmtUSD(employeeShare / perYear)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Payroll Taxes Are a Two-Sided Coin</h2>
            <p>When you budget for an employee, the sticker salary is only part of the cost. This <strong>payroll tax calculator</strong> separates the employee side (withheld from their check) from the employer side (paid out of your pocket on top of salary), so the true cost per hire is visible at a glance.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Breakdown</h2>
            <p>Social Security is capped at the ${SS_WAGE_BASE.toLocaleString()} wage base, so high earners stop paying it mid-year. Medicare is uncapped, and employees above ${ADD_MEDICARE_THRESHOLD.toLocaleString()} pay a 0.9% surtax on the excess. FUTA applies only to the first $7,000 of wages at an effective 0.6%, and SUTA rates vary widely by state and experience rating.</p>
            <h2 className="text-2xl font-bold mb-3">The Real Cost of an Employee</h2>
            <p>Add the employer share to the salary to get the true fully-loaded cost, then compare it against the employee's take-home to see how much of the gross pay is absorbed by these taxes before anyone sees a dollar.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/payroll-tax-calculator" />
          <PopularCalculators exclude="/calculator/payroll-tax-calculator" />
        </div>
      </div>
    </>
  );
}
