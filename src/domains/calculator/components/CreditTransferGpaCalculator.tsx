"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface GpaInputs {
  currentGpa: number;
  gradedCredits: number;
  pnpCredits: number;
  degreeCredits: number;
  targetGpa: number;
  futurePnpCredits: number;
}

interface GpaResult {
  transferableCredits: number;
  remainingCredits: number;
  futureGradedCredits: number;
  requiredGpa: number;
  degreeProgressPct: number;
  projectedFinalGpa: number;
  achievable: boolean;
  effort: string;
  effortColor: string;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcGpa(inp: GpaInputs): GpaResult {
  const transferableCredits = inp.gradedCredits + inp.pnpCredits;
  const remainingCredits = Math.max(0, inp.degreeCredits - transferableCredits);
  const futureGradedCredits = Math.max(0, remainingCredits - inp.futurePnpCredits);

  // Weighted-average: target cumulative GPA over all graded credits (old + future).
  const totalGraded = inp.gradedCredits + futureGradedCredits;
  let requiredGpa =
    futureGradedCredits > 0
      ? (inp.targetGpa * totalGraded - inp.currentGpa * inp.gradedCredits) / futureGradedCredits
      : inp.currentGpa >= inp.targetGpa
        ? inp.currentGpa
        : 4.01; // no graded credits left to improve the average — only achievable if already at target
  requiredGpa = Math.max(0, requiredGpa);
  const achievable = requiredGpa <= 4;
  const degreeProgressPct = inp.degreeCredits > 0 ? (transferableCredits / inp.degreeCredits) * 100 : 0;
  const projectedFinalGpa =
    totalGraded > 0
      ? (inp.currentGpa * inp.gradedCredits + 3.0 * futureGradedCredits) / totalGraded
      : inp.currentGpa;

  let effort: string;
  let effortColor: string;
  if (!achievable) { effort = "Not achievable — exceeds 4.0 max"; effortColor = "text-red-500"; }
  else if (requiredGpa <= 2.5) { effort = "Comfortable"; effortColor = "text-emerald-600"; }
  else if (requiredGpa <= 3.0) { effort = "Moderate"; effortColor = "text-emerald-600"; }
  else if (requiredGpa <= 3.5) { effort = "Demanding"; effortColor = "text-amber-500"; }
  else { effort = "Very demanding"; effortColor = "text-orange-500"; }

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Current GPA (previous school)", value: fmt(inp.currentGpa) },
    { label: "Graded Credits Transferring", value: `${Math.round(inp.gradedCredits)} credits` },
    { label: "P/NP Credits Transferring", value: `${Math.round(inp.pnpCredits)} credits` },
    { label: "Total Transferable Credits", value: `${Math.round(transferableCredits)} credits`, highlight: true },
    { label: "Credits Required for Degree", value: `${Math.round(inp.degreeCredits)} credits` },
    { label: "Degree Progress After Transfer", value: `${degreeProgressPct.toFixed(1)}%` },
    { label: "Credits Still Needed", value: `${Math.round(remainingCredits)} credits` },
    { label: "Planned P/NP at New School", value: `${Math.round(inp.futurePnpCredits)} credits` },
    { label: "Remaining Graded Credits", value: `${Math.round(futureGradedCredits)} credits` },
    { label: "GPA Needed in Remaining Graded Credits", value: fmt(Math.min(requiredGpa, 4)), highlight: true },
    { label: "Projected Final GPA (at 3.0 avg)", value: fmt(projectedFinalGpa) },
  ];

  const summaryStats = [
    { label: "Required GPA", value: achievable ? fmt(requiredGpa) : "> 4.0" },
    { label: "Transferable Credits", value: `${Math.round(transferableCredits)}` },
    { label: "Degree Progress", value: `${degreeProgressPct.toFixed(1)}%` },
    { label: "Credits Remaining", value: `${Math.round(remainingCredits)}` },
    { label: "Future Graded Credits", value: `${Math.round(futureGradedCredits)}` },
    { label: "Target GPA", value: fmt(inp.targetGpa) },
    { label: "Projected Final @ 3.0", value: fmt(projectedFinalGpa) },
    { label: "Outlook", value: achievable ? effort : "Unachievable" },
  ];

  return {
    transferableCredits, remainingCredits, futureGradedCredits, requiredGpa: Math.min(requiredGpa, 4),
    degreeProgressPct, projectedFinalGpa, achievable, effort, effortColor, breakdown, summaryStats,
  };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: GpaInputs = {
  currentGpa: 3.4,
  gradedCredits: 45,
  pnpCredits: 12,
  degreeCredits: 120,
  targetGpa: 3.0,
  futurePnpCredits: 6,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function CreditTransferGpaCalculator() {
  const [currentGpa, setCurrentGpa] = useState(String(DEFAULTS.currentGpa));
  const [gradedCredits, setGradedCredits] = useState(String(DEFAULTS.gradedCredits));
  const [pnpCredits, setPnpCredits] = useState(String(DEFAULTS.pnpCredits));
  const [degreeCredits, setDegreeCredits] = useState(String(DEFAULTS.degreeCredits));
  const [targetGpa, setTargetGpa] = useState(String(DEFAULTS.targetGpa));
  const [futurePnpCredits, setFuturePnpCredits] = useState(String(DEFAULTS.futurePnpCredits));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<GpaResult>(() => calcGpa(DEFAULTS));

  useEffect(() => { setResult(calcGpa(DEFAULTS)); }, []);

  const getInputs = (): GpaInputs => ({
    currentGpa: parseFloat(currentGpa) || 0,
    gradedCredits: parseFloat(gradedCredits) || 0,
    pnpCredits: parseFloat(pnpCredits) || 0,
    degreeCredits: parseFloat(degreeCredits) || 0,
    targetGpa: parseFloat(targetGpa) || 0,
    futurePnpCredits: parseFloat(futurePnpCredits) || 0,
  });

  // ── Validation ──────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  const gpa = parseFloat(currentGpa) || 0;
  const graded = parseFloat(gradedCredits) || 0;
  const pnp = parseFloat(pnpCredits) || 0;
  const degree = parseFloat(degreeCredits) || 0;
  const target = parseFloat(targetGpa) || 0;
  const futurePnp = parseFloat(futurePnpCredits) || 0;
  const transferable = graded + pnp;
  if (gpa < 0 || gpa > 4.0) errors.gpa = "Current GPA must be between 0.0 and 4.0.";
  if (graded < 0 || graded > degree) errors.graded = "Graded credits must be between 0 and the degree total.";
  if (pnp < 0) errors.pnp = "P/NP credits cannot be negative.";
  if (degree < 1 || degree > 400) errors.degree = "Degree credits must be between 1 and 400.";
  if (target < 0 || target > 4.0) errors.target = "Target GPA must be between 0.0 and 4.0.";
  if (transferable >= degree) errors.degree = "Transferable credits must be less than the degree total.";
  if (futurePnp < 0) errors.futurePnp = "Planned P/NP credits cannot be negative.";
  if (degree - transferable - futurePnp < 0) errors.futurePnp = "Planned P/NP credits exceed the credits still needed.";
  const hasErrors = Object.keys(errors).length > 0;

  const handleCalculate = () => { setResult(calcGpa(getInputs())); };

  const reset = () => {
    setCurrentGpa(String(DEFAULTS.currentGpa));
    setGradedCredits(String(DEFAULTS.gradedCredits));
    setPnpCredits(String(DEFAULTS.pnpCredits));
    setDegreeCredits(String(DEFAULTS.degreeCredits));
    setTargetGpa(String(DEFAULTS.targetGpa));
    setFuturePnpCredits(String(DEFAULTS.futurePnpCredits));
    setResult(calcGpa(DEFAULTS));
  };

  const faqs = [
    { question: "How do colleges calculate GPA for transfer students?", answer: "Policies vary, but most colleges compute a transfer GPA from the letter-graded courses they accept, then combine it with your new school GPA as you complete more credits. Pass/no-pass and credit-only courses add toward your degree but do not enter the GPA calculation. Always confirm how your target school treats repeated courses and plus/minus grades." },
    { question: "Do my grades transfer, or just my credits?", answer: "Usually both, but they may be treated differently. Many schools accept credits toward your degree but still record the grades and include them in your cumulative GPA. Some states guarantee that a passing course with a C or better transfers for credit, while others only give credit without the grade. This is exactly why the calculator separates graded credits from pass/no-pass credits." },
    { question: "What if my target GPA is not achievable?", answer: "If the GPA required in your remaining graded credits exceeds 4.0, your goal is mathematically impossible given your transferred GPA and the credits you have left. Options include extending your timeline expectations, repeating some lower grades where your school allows grade replacement, or adjusting your target — many graduate programs and scholarships accept a 3.0 rather than a 3.5." },
    { question: "How many credits do I need to graduate?", answer: "Most bachelor's degrees require 120 semester credits, though some programs require 124–128, and quarter-system schools differ. Many colleges require you to earn a minimum number of credits at the degree-granting institution — often 30 — so even with heavy transfer credit you will take a substantial number of courses there." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Credit Transfer GPA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Transfer GPA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); if (!hasErrors) handleCalculate(); }}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gpa-current" className="text-sm font-medium mb-1 block">Current GPA (4.0 scale)</label>
                  <div className={inp}><input id="gpa-current" type="number" value={currentGpa} onChange={(e) => setCurrentGpa(e.target.value)} step="0.01" className={ci} /></div>
                  {errors.gpa && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.gpa}</p>}
                </div>
                <div>
                  <label htmlFor="gpa-graded" className="text-sm font-medium mb-1 block">Graded Credits Transferring</label>
                  <div className={inp}><input id="gpa-graded" type="number" value={gradedCredits} onChange={(e) => setGradedCredits(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cr</span></div>
                  {errors.graded && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.graded}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gpa-degree" className="text-sm font-medium mb-1 block">Credits Required for Degree</label>
                  <div className={inp}><input id="gpa-degree" type="number" value={degreeCredits} onChange={(e) => setDegreeCredits(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cr</span></div>
                  {errors.degree && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.degree}</p>}
                </div>
                <div>
                  <label htmlFor="gpa-target" className="text-sm font-medium mb-1 block">Target GPA</label>
                  <div className={inp}><input id="gpa-target" type="number" value={targetGpa} onChange={(e) => setTargetGpa(e.target.value)} step="0.01" className={ci} /></div>
                  {errors.target && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.target}</p>}
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                  Advanced Options
                  <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {showAdvanced && (
                  <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Pass/No-Pass Credits</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="gpa-pnp" className="text-sm font-medium mb-1 block">P/NP Credits Transferring</label>
                          <div className={inp}><input id="gpa-pnp" type="number" value={pnpCredits} onChange={(e) => setPnpCredits(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cr</span></div>
                          {errors.pnp && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.pnp}</p>}
                        </div>
                        <div>
                          <label htmlFor="gpa-futurepnp" className="text-sm font-medium mb-1 block">Planned P/NP at New School</label>
                          <div className={inp}><input id="gpa-futurepnp" type="number" value={futurePnpCredits} onChange={(e) => setFuturePnpCredits(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cr</span></div>
                          {errors.futurePnp && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.futurePnp}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Pass/no-pass courses add degree credit but never enter the GPA calculation, so they raise the average you need in graded courses.</p>
                    </div>
                  </div>
                )}
              </div>

              {hasErrors && (
                <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                  ⚠️ Please fix the errors above before calculating.
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-1">
                <button type="submit" disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
                <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
              </div>
            </form>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">GPA Needed in Remaining Graded Credits</div>
              <div className={`text-4xl font-extrabold tracking-tight ${result.achievable ? result.effortColor : "text-red-500"}`}>{result.achievable ? result.requiredGpa.toFixed(2) : "> 4.0"}</div>
              <div className="text-sm text-muted-foreground mt-1">Outlook: <span className={`font-bold ${result.effortColor}`}>{result.effort}</span> · to reach a {targetGpa || "3.0"} cumulative GPA by graduation</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Transferable Credits", `${Math.round(result.transferableCredits)} cr`],
                ["Degree Progress", `${result.degreeProgressPct.toFixed(1)}%`],
                ["Projected Final @ 3.0", result.projectedFinalGpa.toFixed(2)],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            {/* Breakdown Table */}
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Transfer Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                    <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                    <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Credit Transfer GPA Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A credit transfer GPA calculator helps students moving between colleges understand how their previous coursework will count at the new school and what it will take to reach their GPA goal. When you transfer, two separate things happen to your credits: most colleges accept some courses for credit toward your degree, and the letter grades behind many of those courses travel with you and are folded into your new cumulative GPA. The rules differ by school and by state — some accept all credits but only the credit, others recompute your GPA from every accepted grade, and pass/no-pass courses always count toward your degree without touching your GPA. This calculator models the scenario most transfer students actually face: a batch of graded credits that carry your old GPA with them, a batch of pass/no-pass credits that only add to your degree progress, and a set of credits you still need to earn at the new school. It then answers the question that determines whether a transfer makes sense: given the GPA you are bringing in, what average do you need across the graded credits you have left to graduate with your target GPA?</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How the Transfer GPA Math Works</h2>
              <p className="text-muted-foreground leading-relaxed">Cumulative GPA is a weighted average: the sum of every grade point, divided by the total number of graded credits. When you transfer, your previous grade points arrive already baked into the weighted pool, so the calculator starts by counting exactly what transfers. Graded credits carry grade points equal to your current GPA multiplied by the number of credits; pass/no-pass credits add nothing to either side of the GPA fraction. The credits required for your degree minus everything that already transfers tells you how many credits remain, and subtracting the pass/no-pass courses you plan to take at the new school leaves the graded credits still ahead of you. To graduate at your target GPA, the weighted average of your old grade points and your future grade points must equal that target. Solving that equation for the unknown future average yields the required GPA: the target GPA times all graded credits, minus your current GPA times your transferred graded credits, divided by the graded credits remaining. Because pass/no-pass courses increase the number of credits you must take without adding grade points, every planned P/NP course raises the average you need in the courses that do count — the calculator makes that trade-off explicit so you can decide whether a lighter graded load is worth the higher required average.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The headline result is the GPA you need to average across your remaining graded credits to graduate at your target, with an outlook label that ranges from comfortable to unachievable. If the required figure exceeds 4.0, the math says your goal cannot be reached from your current position, and the realistic levers are repeating lower grades where your school permits grade replacement, shifting planned pass/no-pass courses back into graded courses, or adjusting the target itself. The breakdown table shows the full path — transferable graded and pass/no-pass credits, degree progress after transfer, credits still needed, and the projected final GPA if you simply hold a 3.0 average from here — so you can see which number is driving the requirement. The defaults describe a common situation: a 3.4 GPA on 45 graded credits transferring into a 120-credit degree with 12 pass/no-pass credits already earned, aiming for a 3.0. The calculator will show that holding a modest average of about 2.7 across the remaining graded credits keeps that goal on track, and it will show exactly how much harder the task becomes if more of your remaining credits are taken pass/no-pass. Always confirm the specific transfer policy at your target school — grade scales, repeated-course rules, and residency requirements vary — before committing to a plan.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-transfer-gpa-calculator" />
          <PopularCalculators exclude="/calculator/credit-transfer-gpa-calculator" />
        </div>
      </div>
    </>
  );
}
