"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  hires: string;
  recruitingCost: string;
  recruiterSalary: string;
  recruiterPct: string;
  timeToFill: string;
  interviewsPerHire: string;
  interviewHours: string;
  mgrHourlyRate: string;
  referralBonus: string;
  relocationCost: string;
  trainingCost: string;
}

interface Result {
  recruiterCost: number;
  interviewCost: number;
  referralTotal: number;
  totalCost: number;
  costPerHire: number;
  costPerInterview: number;
  totalHours: number;
}

const DEFAULTS: Inputs = {
  hires: "20",
  recruitingCost: "40000",
  recruiterSalary: "75000",
  recruiterPct: "40",
  timeToFill: "40",
  interviewsPerHire: "4",
  interviewHours: "3",
  mgrHourlyRate: "60",
  referralBonus: "2000",
  relocationCost: "15000",
  trainingCost: "35000",
};

function calculate(inputs: Inputs): Result {
  const hires = Math.max(0, parseFloat(inputs.hires) || 0);
  const recruitingCost = Math.max(0, parseFloat(inputs.recruitingCost) || 0);
  const recruiterSalary = Math.max(0, parseFloat(inputs.recruiterSalary) || 0);
  const recruiterPct = Math.min(100, Math.max(0, parseFloat(inputs.recruiterPct) || 0));
  const timeToFill = Math.max(0, parseFloat(inputs.timeToFill) || 0);
  const interviewsPerHire = Math.max(0, parseFloat(inputs.interviewsPerHire) || 0);
  const interviewHours = Math.max(0, parseFloat(inputs.interviewHours) || 0);
  const mgrHourlyRate = Math.max(0, parseFloat(inputs.mgrHourlyRate) || 0);
  const referralBonus = Math.max(0, parseFloat(inputs.referralBonus) || 0);
  const relocationCost = Math.max(0, parseFloat(inputs.relocationCost) || 0);
  const trainingCost = Math.max(0, parseFloat(inputs.trainingCost) || 0);

  const recruiterCost = recruiterSalary * (recruiterPct / 100);
  const interviewCost = hires * interviewsPerHire * interviewHours * mgrHourlyRate;
  const referralTotal = hires * referralBonus;
  const totalCost = recruitingCost + recruiterCost + interviewCost + referralTotal + relocationCost + trainingCost;
  const costPerHire = hires > 0 ? totalCost / hires : 0;
  const costPerInterview = interviewsPerHire > 0 ? costPerHire / interviewsPerHire : 0;
  const totalHours = hires * interviewsPerHire * interviewHours;

  return { recruiterCost, interviewCost, referralTotal, totalCost, costPerHire, costPerInterview, totalHours };
}

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

export default function CostPerHireCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.hires) < 0 ||
    num(inputs.recruitingCost) < 0 ||
    num(inputs.recruiterSalary) < 0 ||
    num(inputs.recruiterPct) < 0 || num(inputs.recruiterPct) > 100 ||
    num(inputs.timeToFill) < 0 ||
    num(inputs.interviewsPerHire) < 0 ||
    num(inputs.interviewHours) < 0 ||
    num(inputs.mgrHourlyRate) < 0 ||
    num(inputs.referralBonus) < 0 ||
    num(inputs.relocationCost) < 0 ||
    num(inputs.trainingCost) < 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const handlePrint = () => window.print();

  const rows = [
    { label: "Hires", value: fmt(num(inputs.hires)) },
    { label: "Advertising & Agency Fees", value: fmtMoney(num(inputs.recruitingCost)) },
    { label: `Recruiter Time (${fmt(num(inputs.recruiterPct), 1)}% of salary)`, value: fmtMoney(result.recruiterCost) },
    { label: `Interview Time (${fmt(num(inputs.interviewsPerHire))} × ${fmt(num(inputs.interviewHours))} hrs)`, value: fmtMoney(result.interviewCost) },
    { label: `Referral Bonuses (${fmt(num(inputs.referralBonus))}/hire)`, value: fmtMoney(result.referralTotal) },
    { label: "Relocation & Sign-On", value: fmtMoney(num(inputs.relocationCost)) },
    { label: "Onboarding & Training", value: fmtMoney(num(inputs.trainingCost)) },
    { label: "Total Recruiting Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Hire", value: fmtMoney(result.costPerHire), highlight: true },
  ];

  const summaryStats = [
    { label: "Hires", value: fmt(num(inputs.hires)) },
    { label: "Advertising & Agency", value: fmtMoney(num(inputs.recruitingCost)) },
    { label: "Recruiter Time", value: fmtMoney(result.recruiterCost) },
    { label: "Interview Time", value: fmtMoney(result.interviewCost) },
    { label: "Referral Bonuses", value: fmtMoney(result.referralTotal) },
    { label: "Relocation & Sign-On", value: fmtMoney(num(inputs.relocationCost)) },
    { label: "Onboarding & Training", value: fmtMoney(num(inputs.trainingCost)) },
    { label: "Total Recruiting Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Hire", value: fmtMoney(result.costPerHire) },
    { label: "Time to Fill", value: fmt(num(inputs.timeToFill)) + " days" },
    { label: "Interview Hours Spent", value: fmt(result.totalHours) },
    { label: "Cost per Interview", value: fmtMoney(result.costPerInterview) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cost per Hire Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost per Hire Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cph-hires" label="Number of Hires" value={inputs.hires} onChange={set("hires")} suffix="people" />
              <NumInput id="cph-advertising" label="Advertising & Agency Fees" value={inputs.recruitingCost} onChange={set("recruitingCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cph-recruiter" label="Recruiter Salary" value={inputs.recruiterSalary} onChange={set("recruiterSalary")} prefix="$" />
              <NumInput id="cph-recruiter-pct" label="Recruiter Time on Hires" value={inputs.recruiterPct} onChange={set("recruiterPct")} suffix="%" />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
            >
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Interview Process</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="cph-interviews" label="Interviews per Hire" value={inputs.interviewsPerHire} onChange={set("interviewsPerHire")} suffix="interviews" />
                    <NumInput id="cph-interview-hours" label="Hours per Interview" value={inputs.interviewHours} onChange={set("interviewHours")} suffix="hrs" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="cph-mgr-rate" label="Manager Hourly Rate" value={inputs.mgrHourlyRate} onChange={set("mgrHourlyRate")} prefix="$" />
                    <NumInput id="cph-time-to-fill" label="Time to Fill" value={inputs.timeToFill} onChange={set("timeToFill")} suffix="days" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Bonuses & Onboarding</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="cph-referral" label="Referral Bonus" value={inputs.referralBonus} onChange={set("referralBonus")} prefix="$" suffix="/hire" />
                    <NumInput id="cph-relocation" label="Relocation & Sign-On" value={inputs.relocationCost} onChange={set("relocationCost")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="cph-training" label="Onboarding & Training" value={inputs.trainingCost} onChange={set("trainingCost")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and recruiter time percentage must be between 0 and 100.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={handleReset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={resultsRef} className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cost per Hire</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.costPerHire)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.totalCost)} total for {fmt(num(inputs.hires))} hires — {fmt(num(inputs.timeToFill))}-day time to fill</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Recruiting Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.totalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Interview Time Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.interviewCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Interview</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.costPerInterview)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Hiring Cost Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Cost per Hire Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A cost per hire calculator estimates the complete expense of filling a position, from the first job posting to the day the new employee is productive. The Society for Human Resource Management defines cost per hire as the sum of internal and external recruiting costs divided by the number of hires, and the metric is one of the most widely tracked in talent acquisition. External costs include advertising, agency fees, background checks, and referral bonuses, while internal costs include the prorated time of recruiters and hiring managers, who can spend dozens of hours per hire on screening and interviews. This calculator captures the full picture: advertising and agency fees, the recruiter's salary share, the value of manager interview time, referral bonuses, relocation and sign-on payments, and onboarding and training costs, then divides the total by the number of hires to produce the cost per hire and the cost per interview.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The recruiter time percentage is the internal-cost component that distinguishes a true cost-per-hire calculation from a simple expense tally, and it should reflect the share of the recruiting year these hires consumed, including sourcing, screening, scheduling, and offer negotiation, which routinely totals 30% to 50% of a recruiter's capacity at busy companies. The interview cost is valued at the manager hourly rate because interviewing is the most expensive hidden line in hiring, and the interviews-per-hire input reveals process efficiency: companies that screen thoroughly before the interview round can hold the interview count down without sacrificing quality. The time-to-fill figure is reported alongside cost because the two metrics trade off, and a cost-per-hire that is achieved by rushing a hire often reappears as turnover cost later. The cost-per-interview figure is the diagnostic that exposes expensive processes, and segmenting hires by role type before running the model gives a more actionable benchmark than a blended average.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the number of hires, the total advertising and agency fees, the recruiter's salary, and the percentage of the recruiter's time devoted to these hires. The recruiter cost is the salary multiplied by the time percentage, allocating a fair share of the recruiting function to the period's hires. The advanced options add the interview process details: interviews per hire, hours per interview, and the average manager hourly rate, whose product is the interview time cost; the time to fill in days, which is reported for context; the per-hire referral bonus; the total relocation and sign-on cost; and the onboarding and training cost. With the default inputs, 20 hires with $40,000 of advertising, a $75,000 recruiter spending 40% of their time, and four three-hour interviews at a $60 manager rate carry a $30,000 recruiter cost and a $14,400 interview cost, and the full program totals around $140,000, or roughly $7,000 per hire. The cost per interview divides the per-hire figure by the interviews per hire, showing the price of each additional screening round.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The cost per hire is the headline metric to benchmark against industry surveys, which typically range from a few thousand dollars for hourly roles to well over ten thousand for executive and specialized technical positions. The cost per interview is the diagnostic number: if it is high, streamline the interview process, use structured rubrics, or add a screening call to reduce interview rounds. The time to fill works alongside cost because longer vacancies carry their own cost in lost productivity. Watch the recruiter percentage assumption, since it is easy to understate how much of a recruiter's year a hiring surge consumes. Track cost per hire quarterly and segment it by role type, and pair it with quality-of-hire and retention data, because the cheapest hire is not always the best value.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="cost-per-hire-calculator" />
        </div>
      </div>
    </>
  );
}