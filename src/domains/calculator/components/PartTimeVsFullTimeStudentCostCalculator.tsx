"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, GraduationCap, Wallet, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type TuitionModel = "perCredit" | "flatFullTime";

interface StudentInputs {
  costPerCredit: number;
  totalCredits: number;
  fullTimeCredits: number;
  partTimeCredits: number;
  tuitionModel: TuitionModel;
  flatRatePerTerm: number;
  feesPerTerm: number;
  livingCostPerTerm: number;
  aidPerTerm: number;
  hourlyWage: number;
  partTimeWorkHours: number;
  fullTimeWorkHours: number;
  proMode: boolean;
  wageGrowthPercent: number;
  loanRatePercent: number;
  termsPerYear: number;
}

interface PathResult {
  label: string;
  terms: number;
  years: number;
  tuition: number;
  fees: number;
  living: number;
  aid: number;
  earnings: number;
  netCost: number;
  loanInterest: number;
  totalWithInterest: number;
}

interface ChartPoint {
  name: string;
  partTime: number;
  fullTime: number;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface StudentResult {
  partTime: PathResult;
  fullTime: PathResult;
  netDifference: number;
  cheaperPath: string;
  cheaperPathColor: string;
  extraTerms: number;
  extraYears: number;
  chartData: ChartPoint[];
  rows: TableRow[];
}

const DEFAULTS: StudentInputs = {
  costPerCredit: 450,
  totalCredits: 120,
  fullTimeCredits: 15,
  partTimeCredits: 6,
  tuitionModel: "perCredit",
  flatRatePerTerm: 6500,
  feesPerTerm: 850,
  livingCostPerTerm: 4200,
  aidPerTerm: 2000,
  hourlyWage: 22,
  partTimeWorkHours: 30,
  fullTimeWorkHours: 12,
  proMode: false,
  wageGrowthPercent: 3,
  loanRatePercent: 6.5,
  termsPerYear: 2,
};

const WEEKS_PER_TERM = 15;

function buildPath(
  label: string,
  creditsPerTerm: number,
  workHours: number,
  i: StudentInputs,
  isFullTime: boolean
): PathResult {
  const credits = Math.max(1, creditsPerTerm);
  const totalCredits = Math.max(1, i.totalCredits);
  const terms = Math.ceil(totalCredits / credits);
  const termsPerYear = Math.max(1, i.termsPerYear);
  const years = terms / termsPerYear;

  // Flat-rate tuition applies only to full-time enrollment; part-time students
  // are billed per credit at nearly every institution that uses a banded rate.
  const tuition =
    i.tuitionModel === "flatFullTime" && isFullTime
      ? Math.max(0, i.flatRatePerTerm) * terms
      : Math.max(0, i.costPerCredit) * totalCredits;

  const fees = Math.max(0, i.feesPerTerm) * terms;
  const living = Math.max(0, i.livingCostPerTerm) * terms;

  // Federal Pell eligibility is prorated by enrollment intensity: full-time
  // draws the full award, half-time (6-8 credits) draws half, and below 6
  // credits draws a quarter.
  let aidFactor: number;
  if (credits >= 12) aidFactor = 1;
  else if (credits >= 6) aidFactor = 0.5;
  else aidFactor = 0.25;
  const aid = Math.max(0, i.aidPerTerm) * aidFactor * terms;

  // Earnings while enrolled. In Professional Mode wages compound annually.
  const wage = Math.max(0, i.hourlyWage);
  const hours = Math.max(0, workHours);
  let earnings = 0;
  if (i.proMode) {
    const g = i.wageGrowthPercent / 100;
    for (let t = 0; t < terms; t++) {
      const yearIndex = Math.floor(t / termsPerYear);
      earnings += hours * WEEKS_PER_TERM * wage * Math.pow(1 + g, yearIndex);
    }
  } else {
    earnings = hours * WEEKS_PER_TERM * wage * terms;
  }

  const netCost = tuition + fees + living - aid - earnings;

  // Unmet need is assumed borrowed and accrues simple annual interest over the
  // remaining time in school.
  const borrowed = Math.max(0, tuition + fees + living - aid - earnings);
  const r = i.proMode ? i.loanRatePercent / 100 : 0;
  const loanInterest = borrowed * r * (years / 2);
  const totalWithInterest = netCost + loanInterest;

  return {
    label,
    terms,
    years,
    tuition,
    fees,
    living,
    aid,
    earnings,
    netCost,
    loanInterest,
    totalWithInterest,
  };
}

export function calculateStudentCost(i: StudentInputs): StudentResult {
  const fullTime = buildPath("Full-Time", i.fullTimeCredits, i.fullTimeWorkHours, i, true);
  const partTime = buildPath("Part-Time", i.partTimeCredits, i.partTimeWorkHours, i, false);

  const ptTotal = i.proMode ? partTime.totalWithInterest : partTime.netCost;
  const ftTotal = i.proMode ? fullTime.totalWithInterest : fullTime.netCost;
  const netDifference = ptTotal - ftTotal;

  let cheaperPath: string;
  let cheaperPathColor: string;
  if (Math.abs(netDifference) < 500) {
    cheaperPath = "Roughly equivalent — within $500";
    cheaperPathColor = "text-amber-600";
  } else if (netDifference < 0) {
    cheaperPath = "Part-time costs less overall";
    cheaperPathColor = "text-emerald-600";
  } else {
    cheaperPath = "Full-time costs less overall";
    cheaperPathColor = "text-emerald-600";
  }

  const extraTerms = partTime.terms - fullTime.terms;
  const extraYears = partTime.years - fullTime.years;

  const chartData: ChartPoint[] = [
    { name: "Tuition", partTime: Math.round(partTime.tuition), fullTime: Math.round(fullTime.tuition) },
    { name: "Fees", partTime: Math.round(partTime.fees), fullTime: Math.round(fullTime.fees) },
    { name: "Living", partTime: Math.round(partTime.living), fullTime: Math.round(fullTime.living) },
    { name: "Aid", partTime: -Math.round(partTime.aid), fullTime: -Math.round(fullTime.aid) },
    { name: "Earnings", partTime: -Math.round(partTime.earnings), fullTime: -Math.round(fullTime.earnings) },
  ];

  const usd = (v: number) =>
    `${v < 0 ? "-" : ""}$${Math.abs(Math.round(v)).toLocaleString("en-US")}`;

  const rows: TableRow[] = [
    { label: "Terms to Degree — Part-Time", value: `${partTime.terms} terms (${partTime.years.toFixed(1)} yr)` },
    { label: "Terms to Degree — Full-Time", value: `${fullTime.terms} terms (${fullTime.years.toFixed(1)} yr)` },
    { label: "Tuition — Part-Time", value: usd(partTime.tuition) },
    { label: "Tuition — Full-Time", value: usd(fullTime.tuition) },
    { label: "Fees — Part-Time", value: usd(partTime.fees) },
    { label: "Fees — Full-Time", value: usd(fullTime.fees) },
    { label: "Living Costs — Part-Time", value: usd(partTime.living) },
    { label: "Living Costs — Full-Time", value: usd(fullTime.living) },
    { label: "Grants & Aid — Part-Time", value: usd(-partTime.aid) },
    { label: "Grants & Aid — Full-Time", value: usd(-fullTime.aid) },
    { label: "Earnings While Enrolled — Part-Time", value: usd(-partTime.earnings) },
    { label: "Earnings While Enrolled — Full-Time", value: usd(-fullTime.earnings) },
    { label: "Net Cost — Part-Time", value: usd(ptTotal) },
    { label: "Net Cost — Full-Time", value: usd(ftTotal) },
    { label: "Net Cost Difference", value: usd(netDifference), key: true },
  ];

  return {
    partTime,
    fullTime,
    netDifference,
    cheaperPath,
    cheaperPathColor,
    extraTerms,
    extraYears,
    chartData,
    rows,
  };
}
const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function PartTimeVsFullTimeStudentCostCalculator() {
  const [inputs, setInputs] = useState<StudentInputs>(DEFAULTS);
  const [result, setResult] = useState<StudentResult>(calculateStudentCost(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateStudentCost(inputs));
  }, []);

  const calculate = () => setResult(calculateStudentCost(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateStudentCost(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof StudentInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const usd = (v: number) =>
    `${v < 0 ? "-" : ""}$${Math.abs(Math.round(v)).toLocaleString("en-US")}`;

  const faqs = [
    {
      question: "Is it cheaper to go to college part-time or full-time?",
      answer:
        "Tuition is usually similar per credit, so the difference comes from everything else. Part-time students pay mandatory fees and living costs across many more terms, which adds up, and they receive less financial aid per term because Pell and most institutional grants are prorated by enrollment intensity. Against that, part-time students can work far more hours. Which path wins depends on your wage: high earners often come out ahead part-time, while students with generous aid packages usually finish cheaper full-time.",
    },
    {
      question: "How does part-time enrollment affect financial aid?",
      answer:
        "Federal Pell Grants are prorated by enrollment intensity. Full-time enrollment (12 or more credits) draws the full award, half-time (6 to 8 credits) draws roughly half, and less than half-time typically draws a quarter or nothing depending on the program. Federal loans require at least half-time enrollment. Many state grants and institutional scholarships require full-time status outright, so dropping below 12 credits can eliminate them entirely — check each award's terms before deciding.",
    },
    {
      question: "What counts as full-time versus part-time?",
      answer:
        "For federal aid purposes, full-time undergraduate enrollment is 12 or more credit hours per term, and half-time is 6 to 11. Note that 12 credits per term across two semesters yields 24 credits a year, which will not finish a 120-credit degree in four years. Students who intend to graduate in four years generally need about 15 credits per term, which is why 15 is the default here rather than the 12-credit aid minimum.",
    },
    {
      question: "Why does taking longer cost more even at the same tuition rate?",
      answer:
        "Per-credit tuition is roughly path-independent — 120 credits costs the same whether you take them over four years or ten. Everything charged per term is not. Mandatory fees, health insurance, and living costs recur every term you are enrolled, so a part-time student paying eight years of fees pays twice what a four-year student pays for the identical degree. Add tuition inflation over the longer horizon and the gap widens further.",
    },
    {
      question: "Does flat-rate tuition change the math?",
      answer:
        "Substantially. Many institutions charge a flat rate for full-time enrollment covering 12 to 18 credits, which means a student taking 18 credits pays the same as one taking 12. Under that model, full-time enrollment gets dramatically cheaper per credit while part-time students are billed per credit at the standard rate. If your school uses banded tuition, taking the maximum credits allowed within the band is the single largest cost lever available to you.",
    },
    {
      question: "What is the opportunity cost of studying full-time?",
      answer:
        "The wages you do not earn. A student working 12 hours a week at $22 an hour earns about $4,000 per term, while a part-time student working 30 hours earns roughly $10,000 — a $6,000 per-term difference. Over four years that gap approaches $48,000, which is why forgone earnings often dominate the comparison. The counterweight is that finishing sooner starts your post-degree salary sooner, and that raise typically exceeds student-job wages by a wide margin.",
    },
    {
      question: "Should I work more hours and take fewer credits?",
      answer:
        "It depends on the arithmetic above, but be careful about the completion risk. Research consistently shows that students working more than about 20 hours a week while enrolled complete at lower rates, and an unfinished degree is the most expensive outcome of all — you pay the costs without receiving the credential. If you do go part-time, keeping momentum matters more than optimizing each term's cost.",
    },
    {
      question: "What does this calculator leave out?",
      answer:
        "Institution-specific aid formulas, state grant rules, tuition inflation, employer tuition assistance, and tax credits like the American Opportunity Credit are all outside the model — enter your actual aid figures rather than relying on defaults. It also does not price the earlier start to your post-degree career, which for many fields is the largest single term in the real comparison. Use the output to frame the decision, then verify aid eligibility with your financial aid office.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Education", href: "/calculator/education" },
          { label: "Part-Time vs Full-Time Student Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Part-Time vs Full-Time Student Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="costPerCredit" className={lbl}>Cost Per Credit ($)</label>
                <input id="costPerCredit" type="number" min="0" step="25" className={inp}
                  value={inputs.costPerCredit} onChange={(e) => setNum("costPerCredit", e.target.value)} />
              </div>
              <div>
                <label htmlFor="totalCredits" className={lbl}>Total Credits to Degree</label>
                <input id="totalCredits" type="number" min="1" step="3" className={inp}
                  value={inputs.totalCredits} onChange={(e) => setNum("totalCredits", e.target.value)} />
              </div>
              <div>
                <label htmlFor="fullTimeCredits" className={lbl}>Full-Time Credits/Term</label>
                <input id="fullTimeCredits" type="number" min="1" step="1" className={inp}
                  value={inputs.fullTimeCredits} onChange={(e) => setNum("fullTimeCredits", e.target.value)} />
              </div>
              <div>
                <label htmlFor="partTimeCredits" className={lbl}>Part-Time Credits/Term</label>
                <input id="partTimeCredits" type="number" min="1" step="1" className={inp}
                  value={inputs.partTimeCredits} onChange={(e) => setNum("partTimeCredits", e.target.value)} />
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced ? (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Wallet className="h-3.5 w-3.5" /> Fees &amp; Living Costs
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="feesPerTerm" className={lbl}>Mandatory Fees/Term ($)</label>
                        <input id="feesPerTerm" type="number" min="0" step="50" className={inp}
                          value={inputs.feesPerTerm} onChange={(e) => setNum("feesPerTerm", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="livingCostPerTerm" className={lbl}>Living Cost/Term ($)</label>
                        <input id="livingCostPerTerm" type="number" min="0" step="100" className={inp}
                          value={inputs.livingCostPerTerm} onChange={(e) => setNum("livingCostPerTerm", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="tuitionModel" className={lbl}>Tuition Model</label>
                        <select id="tuitionModel" className={inp} value={inputs.tuitionModel}
                          onChange={(e) => setInputs((p) => ({ ...p, tuitionModel: e.target.value as TuitionModel }))}>
                          <option value="perCredit">Per-credit for all students</option>
                          <option value="flatFullTime">Flat rate for full-time, per-credit part-time</option>
                        </select>
                      </div>
                      {inputs.tuitionModel === "flatFullTime" ? (
                        <div className="col-span-2">
                          <label htmlFor="flatRatePerTerm" className={lbl}>Full-Time Flat Rate/Term ($)</label>
                          <input id="flatRatePerTerm" type="number" min="0" step="250" className={inp}
                            value={inputs.flatRatePerTerm} onChange={(e) => setNum("flatRatePerTerm", e.target.value)} />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <GraduationCap className="h-3.5 w-3.5" /> Aid &amp; Earnings
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="aidPerTerm" className={lbl}>Grants/Aid Per Term ($)</label>
                        <input id="aidPerTerm" type="number" min="0" step="100" className={inp}
                          value={inputs.aidPerTerm} onChange={(e) => setNum("aidPerTerm", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="hourlyWage" className={lbl}>Hourly Wage ($)</label>
                        <input id="hourlyWage" type="number" min="0" step="0.5" className={inp}
                          value={inputs.hourlyWage} onChange={(e) => setNum("hourlyWage", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="partTimeWorkHours" className={lbl}>Part-Time Work Hrs/Wk</label>
                        <input id="partTimeWorkHours" type="number" min="0" max="80" step="1" className={inp}
                          value={inputs.partTimeWorkHours} onChange={(e) => setNum("partTimeWorkHours", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="fullTimeWorkHours" className={lbl}>Full-Time Work Hrs/Wk</label>
                        <input id="fullTimeWorkHours" type="number" min="0" max="80" step="1" className={inp}
                          value={inputs.fullTimeWorkHours} onChange={(e) => setNum("fullTimeWorkHours", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="termsPerYear" className={lbl}>Terms Per Year</label>
                        <select id="termsPerYear" className={inp} value={inputs.termsPerYear}
                          onChange={(e) => setNum("termsPerYear", e.target.value)}>
                          <option value="2">2 (semesters)</option>
                          <option value="3">3 (trimesters/quarters)</option>
                          <option value="4">4 (quarters + summer)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <TrendingUp className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock wage growth and borrowing cost analysis
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="wageGrowthPercent" className={lbl}>Annual Wage Growth (%)</label>
                          <input id="wageGrowthPercent" type="number" min="0" step="0.5" className={inp}
                            value={inputs.wageGrowthPercent} onChange={(e) => setNum("wageGrowthPercent", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="loanRatePercent" className={lbl}>Loan Rate (%)</label>
                          <input id="loanRatePercent" type="number" min="0" step="0.25" className={inp}
                            value={inputs.loanRatePercent} onChange={(e) => setNum("loanRatePercent", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Net Cost Difference</div>
              <div className="text-4xl font-bold text-primary my-1">{usd(Math.abs(result.netDifference))}</div>
              <div className={`text-sm font-semibold ${result.cheaperPathColor}`}>{result.cheaperPath}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Part-Time Net</div>
                <div className="text-lg font-bold text-emerald-600">
                  {usd(inputs.proMode ? result.partTime.totalWithInterest : result.partTime.netCost)}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Full-Time Net</div>
                <div className="text-lg font-bold text-amber-600">
                  {usd(inputs.proMode ? result.fullTime.totalWithInterest : result.fullTime.netCost)}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Extra Time</div>
                <div className="text-lg font-bold text-red-600">+{result.extraYears.toFixed(1)} yr</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Net Cost Difference</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{usd(result.netDifference)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Cost Components by Enrollment Path</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }}
                      tickFormatter={(v: number) => `${v < 0 ? "-" : ""}$${Math.abs(v) >= 1000 ? `${Math.abs(v) / 1000}k` : Math.abs(v)}`} />
                    <RTooltip formatter={(value: number, name: string) => [usd(value), name]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="partTime" name="Part-Time" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fullTime" name="Full-Time" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Aid and earnings display as negative values because they offset cost.
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Wage Growth &amp; Borrowing Cost</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan Interest — Part-Time</div>
                    <div className="text-base font-bold text-foreground">{usd(result.partTime.loanInterest)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loan Interest — Full-Time</div>
                    <div className="text-base font-bold text-foreground">{usd(result.fullTime.loanInterest)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Earnings w/ {inputs.wageGrowthPercent}% Growth — Part-Time</div>
                    <div className="text-base font-bold text-foreground">{usd(result.partTime.earnings)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Earnings w/ {inputs.wageGrowthPercent}% Growth — Full-Time</div>
                    <div className="text-base font-bold text-foreground">{usd(result.fullTime.earnings)}</div>
                  </div>
                  <div className="col-span-2 pt-1">
                    <div className="text-sm text-muted-foreground">
                      Interest accrues on unmet need over the average time in school, so the longer part-time path
                      carries more borrowing cost even at the same rate. Wages compound annually, which favours the path
                      with more working years — but does not price the earlier start to your post-degree salary.
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Costs That Scale With Time, Not Credits</h2>
            <p className="mb-4">
              Per-credit tuition is roughly path-independent: 120 credits costs the same whether you take them over four
              years or ten. Everything billed per term is not. Mandatory fees, health insurance, technology charges, and
              living costs recur every term you stay enrolled, so a part-time student stretching a degree across eight
              years pays those line items twice as many times for the identical credential. This is the single most
              underestimated factor in the comparison, and it is why stretching enrollment rarely saves as much as the
              lower per-term bill suggests.
            </p>

            <h2 className="text-2xl font-bold mb-3">How Enrollment Intensity Changes Your Aid</h2>
            <p className="mb-4">
              Federal Pell Grants are prorated by enrollment intensity — full-time draws the full award, half-time draws
              roughly half — and federal loans require at least half-time enrollment. More consequentially, many state
              grants and institutional scholarships require full-time status outright and disappear entirely below 12
              credits. Because aid is awarded per term rather than per credit, a part-time student can end up receiving
              less total aid across a longer enrollment than a full-time student receives across a shorter one. Verify
              each award's enrollment requirement before assuming it survives a switch to part-time.
            </p>

            <h2 className="text-2xl font-bold mb-3">Forgone Earnings Usually Decide It</h2>
            <p className="mb-4">
              The largest term in this comparison is often the wages you do not earn. A student working 12 hours a week
              at $22 an hour clears about $4,000 a term; at 30 hours the same wage yields roughly $10,000. Over the
              length of a degree that gap can approach $50,000, which frequently exceeds the entire tuition difference.
              This is what makes part-time enrollment genuinely attractive for students with solid wages or employer
              tuition assistance, and it is also why the calculation is so sensitive to the wage you enter.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Risk the Arithmetic Does Not Capture</h2>
            <p>
              Completion probability belongs in the decision even though no formula prices it cleanly. Students working
              more than about 20 hours a week while enrolled complete at measurably lower rates, and an unfinished degree
              is the worst financial outcome available — full cost, no credential. The other omission runs the opposite
              way: finishing sooner starts your post-degree salary sooner, and that raise typically dwarfs student-job
              wages. Treat this tool as a way to size the cost gap, then weigh it against how likely each path is to get
              you to graduation and how much your degree changes your earnings.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/part-time-vs-full-time-student-cost-calculator" />
          <PopularCalculators exclude="/calculator/part-time-vs-full-time-student-cost-calculator" />
        </div>
      </div>
    </>
  );
}
