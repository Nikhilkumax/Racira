"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Briefcase } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NumInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}

function NumInput({ label, value, onChange, min = 0, max = 9999999, step = 1, suffix, prefix }: NumInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(min);
            const n = parseFloat(raw);
            if (Number.isNaN(n)) return;
            onChange(Math.min(max, Math.max(min, n)));
          }}
          className={`input-calc ${prefix ? "pl-8" : ""} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

const INR = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

const STATES: { id: string; label: string; slabs: { min: number; max: number; tax: number }[] }[] = [
  {
    id: "maharashtra",
    label: "Maharashtra",
    slabs: [
      { min: 0, max: 7500, tax: 0 },
      { min: 7501, max: 10000, tax: 175 },
      { min: 10001, max: Infinity, tax: 200 },
    ],
  },
  {
    id: "karnataka",
    label: "Karnataka",
    slabs: [
      { min: 0, max: 15000, tax: 0 },
      { min: 15001, max: Infinity, tax: 200 },
    ],
  },
  {
    id: "west_bengal",
    label: "West Bengal",
    slabs: [
      { min: 0, max: 10000, tax: 0 },
      { min: 10001, max: 15000, tax: 110 },
      { min: 15001, max: 25000, tax: 130 },
      { min: 25001, max: 40000, tax: 150 },
      { min: 40001, max: Infinity, tax: 200 },
    ],
  },
  {
    id: "andhra_pradesh",
    label: "Andhra Pradesh",
    slabs: [
      { min: 0, max: 15000, tax: 0 },
      { min: 15001, max: 20000, tax: 150 },
      { min: 20001, max: Infinity, tax: 200 },
    ],
  },
  {
    id: "telangana",
    label: "Telangana",
    slabs: [
      { min: 0, max: 15000, tax: 0 },
      { min: 15001, max: 20000, tax: 150 },
      { min: 20001, max: Infinity, tax: 200 },
    ],
  },
  {
    id: "tamil_nadu",
    label: "Tamil Nadu",
    slabs: [
      { min: 0, max: 21000, tax: 0 },
      { min: 21001, max: 30000, tax: 100 },
      { min: 30001, max: 45000, tax: 235 },
      { min: 45001, max: 60000, tax: 510 },
      { min: 60001, max: 75000, tax: 760 },
      { min: 75001, max: Infinity, tax: 1095 },
    ],
  },
  {
    id: "gujarat",
    label: "Gujarat",
    slabs: [
      { min: 0, max: 5999, tax: 0 },
      { min: 6000, max: 8999, tax: 80 },
      { min: 9000, max: 11999, tax: 150 },
      { min: 12000, max: Infinity, tax: 200 },
    ],
  },
  {
    id: "madhya_pradesh",
    label: "Madhya Pradesh",
    slabs: [
      { min: 0, max: 18750, tax: 0 },
      { min: 18751, max: 25000, tax: 125 },
      { min: 25001, max: Infinity, tax: 208 },
    ],
  },
];

export default function ProfessionalTaxCalculator() {
  const [salary, setSalary] = useState(50000);
  const [state, setState] = useState("maharashtra");
  const [showResults, setShowResults] = useState(false);

  const st = STATES.find((s) => s.id === state) ?? STATES[0];
  let monthly = 0;
  for (const slab of st.slabs) {
    if (salary >= slab.min && salary <= slab.max) {
      monthly = slab.tax;
      break;
    }
  }
  if (salary > st.slabs[st.slabs.length - 1].min) monthly = st.slabs[st.slabs.length - 1].tax;
  const annual = Math.min(monthly * 12, 2500);
  const effective = salary > 0 ? (annual / (salary * 12)) * 100 : 0;
  const monthlyAfter = salary - monthly;

  const chartData = STATES.map((s) => {
    let m = 0;
    for (const slab of s.slabs) {
      if (salary >= slab.min && salary <= slab.max) {
        m = slab.tax;
        break;
      }
    }
    if (salary > s.slabs[s.slabs.length - 1].min) m = s.slabs[s.slabs.length - 1].tax;
    return { name: s.label.split(" ")[0], tax: m };
  });

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setSalary(50000);
    setState("maharashtra");
    setShowResults(false);
  };

  const faqs = [
    { question: "What is professional tax?", answer: "It is a state-level tax on salaried income and professions, deducted monthly by employers and paid to the state. Each state sets its own slab rates keyed to monthly gross salary, and the Constitution caps the annual total at ₹2,500 per person." },
    { question: "Who pays professional tax?", answer: "Anyone earning a salary in a state that levies it. The employer deducts it from your pay and deposits it with the state each month. Self-employed professionals in most states must register and pay it themselves on their professional income." },
    { question: "Which states have the highest slabs?", answer: "Tamil Nadu tops out at ₹1,095/month (₹2,400/year), followed by West Bengal and Maharashtra at ₹200/month. Several states — including Delhi, Haryana, and Rajasthan — do not levy professional tax at all." },
    { question: "Is professional tax tax-deductible?", answer: "Yes. It is deductible from your salary income under Section 16(iii) of the Income Tax Act, which effectively lowers your taxable salary by the amount of PT you paid during the year." },
    { question: "What is the ₹2,500 annual cap?", answer: "Article 276 of the Indian Constitution limits total professional tax to ₹2,500 per person per year. No state can charge more, so even the highest monthly slabs are constrained by this ceiling." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Professional Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Professional Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Briefcase className="w-4 h-4" /> India State PT
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Monthly Gross Salary" value={salary} onChange={setSalary} min={0} max={1000000} step={1000} prefix="₹" />
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input-calc"
                >
                  {STATES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Monthly Professional Tax</p>
                  <p className="text-4xl font-bold text-primary mt-1">{INR(monthly)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {st.label} · annual {INR(annual)} (constitutional cap ₹2,500/yr) · {effective.toFixed(3)}% of salary
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-card">
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly PT</p>
                    <p className="text-2xl font-bold text-primary">{INR(monthly)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Annual PT</p>
                    <p className="text-2xl font-bold text-orange-500">{INR(annual)}</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Net Monthly Salary</p>
                    <p className="text-2xl font-bold text-green-600">{INR(monthlyAfter)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Item</th>
                        <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2.5 px-3 font-medium">Monthly Professional Tax</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{INR(monthly)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Annual Professional Tax</td>
                        <td className="py-2.5 px-3 text-right">{INR(annual)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Gross Monthly Salary</td>
                        <td className="py-2.5 px-3 text-right">{INR(salary)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2.5 px-3">Net Monthly Salary (after PT)</td>
                        <td className="py-2.5 px-3 text-right">{INR(monthlyAfter)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">Effective Rate</td>
                        <td className="py-2.5 px-3 text-right">{effective.toFixed(3)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Monthly PT by State (your salary)</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => "₹" + v} />
                        <Bar dataKey="tax" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">State</span>
                      <span className="font-medium">{st.label}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Monthly Salary</span>
                      <span className="font-medium">{INR(salary)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Monthly PT</span>
                      <span className="font-medium">{INR(monthly)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Annual PT</span>
                      <span className="font-medium">{INR(annual)}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Income Tax Deduction</span>
                      <span className="font-medium">Deductible u/s 16(iii)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Constitutional Cap</span>
                      <span className="font-medium">₹2,500 / year</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                Enter your monthly salary and state, then click <strong className="text-foreground">Calculate</strong> to see your monthly and annual professional tax.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Professional Tax Works</h2>
            <p>Professional tax is a state-level levy on salaried income, deducted monthly by the employer. Each state has its own slab table keyed to monthly gross salary; the annual total is capped at ₹2,500 by Article 276 of the Constitution. The tax is deductible from salary income under Section 16(iii).</p>
            <h3>Worked Example</h3>
            <p>At ₹50,000/month in Maharashtra, PT is ₹200/month (₹2,400/year — under the cap). The same salary in Karnataka also costs ₹200/month, but in Tamil Nadu the slab is ₹760/month, hitting ₹2,400/year.</p>
            <h3>Comparing States</h3>
            <p>PT differences are small in absolute terms — at most ₹100–900/month — but they vary with your salary band and state of employment. If you work remotely or are choosing between offers in different states, this calculator shows exactly what each location deducts from your pay.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/professional-tax-calculator" />
          <PopularCalculators exclude="/calculator/professional-tax-calculator" />
        </div>
      </div>
    </>
  );
}
