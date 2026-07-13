"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, ChevronDown, Printer, RotateCcw } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ReferenceArea, ResponsiveContainer, Legend,
} from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import {
  calculatePmiRemoval, MONTHS, addMonths,
  type RemovalInputs, type RemovalLoanType, type RemovalPmiMode, type RemovalPath,
} from "./pmiRemovalLogic";

const fmtUsd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtUsd2 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

const now = new Date();

const DEFAULTS: RemovalInputs = {
  homeValue: 400000,
  loanAmount: 380000,
  interestRate: 6.75,
  loanTermYears: 30,
  loanType: "conventional",
  startMonth: MONTHS[now.getMonth()],
  startYear: now.getFullYear(),
  appreciationRate: 3.5,
  extraMonthly: 0,
  creditScore: 740,
  propertyUse: "primary",
  pmiMode: "auto",
  manualPmiRate: 0.55,
  seasoningMonths: 24,
};

const CI = ({
  id, label, value, onChange, prefix, suffix, step = "any", min, max,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; step?: string; min?: string; max?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id} type="number" value={value} onChange={(e) => onChange(e.target.value)}
        step={step} min={min} max={max}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const SegBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button" onClick={onClick}
    className={`flex-1 h-9 rounded-md text-sm font-semibold transition-all ${active ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"}`}
  >
    {children}
  </button>
);

const PmiRemovalDateCalculator = () => {
  const [inputs, setInputs] = useState<RemovalInputs>(DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState(() => calculatePmiRemoval(DEFAULTS));

  useEffect(() => { setResults(calculatePmiRemoval(inputs)); /* recompute on any input change */ }, [inputs]);

  const set = <K extends keyof RemovalInputs>(key: K, val: RemovalInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleReset = () => { setInputs(DEFAULTS); setShowAdvanced(false); };

  const chartData = useMemo(() =>
    results.ltvCurve.map((p) => ({
      month: p.month,
      original: p.ltvOriginal,
      current: p.ltvCurrent,
    })), [results]);

  const faqs = [
    { question: "When can I legally remove PMI from my mortgage?", answer: "Under the federal Homeowners Protection Act (HPA) of 1998, your servicer must AUTOMATICALLY cancel PMI when your scheduled loan balance reaches 78% of the home's original value — no request or appraisal needed, you just have to be current on payments. You can also REQUEST removal earlier, as soon as your balance reaches 80% of the home's CURRENT (appraised) value, which happens faster in rising markets." },
    { question: "What is the difference between 78% automatic and 80% borrower-requested PMI removal?", answer: "The 78% rule is automatic and based on the ORIGINAL value and the standard amortization schedule — it happens on its own regardless of home appreciation or extra payments. The 80% rule is borrower-requested and based on the home's CURRENT value, so appreciation and extra principal payments accelerate it. Because it uses current value, the 80% path is almost always faster in appreciating markets, but requires you to ask in writing and usually pay for an appraisal ($500–$700)." },
    { question: "Do I need an appraisal to remove PMI?", answer: "Usually yes for borrower-requested removal at 80% of current value — the servicer must verify the home's value supports the new LTV. For automatic termination at 78% of original value, no appraisal is required because it's based on the original purchase price/appraisal and the fixed schedule. Some servicers waive the appraisal if your loan is seasoned and a desktop valuation supports 75–80% LTV." },
    { question: "Is PMI tax deductible?", answer: "PMI was deductible as mortgage insurance premiums through 2021 under a provision that has since expired and not been renewed. Currently, PMI is NOT deductible on federal returns. FHA MIP and VA funding fees follow similar rules. Always confirm with a tax professional, as Congress periodically revisits this deduction." },
    { question: "Why does FHA MIP not go away like conventional PMI?", answer: "For FHA loans endorsed on or after June 3, 2013, MIP is permanent for the life of the loan if you put less than 10% down. If you put 10% or more down, MIP cancels automatically after 11 years (132 months). Unlike conventional PMI, FHA MIP cannot be removed just by reaching 80% LTV — the only way out for most borrowers is to refinance into a conventional loan." },
    { question: "How do extra payments speed up PMI removal?", answer: "Extra principal payments reduce your balance faster, which accelerates BOTH the 78% automatic and 80% borrower-requested paths. The 78% automatic date is fixed by the original schedule, so it doesn't move — but reaching 80% of current value happens much sooner. Even $100/month extra can shave 2–4 years off PMI on a typical loan, saving thousands." },
    { question: "What credit score do I need for the lowest PMI rate?", answer: "Conventional PMI rates drop sharply above 760 (the 'excellent' tier). Between 720–759 you get good rates; below 700 rates rise noticeably, and below 680 PMI becomes expensive. Your credit score at origination locks in the PMI rate for the life of the policy, so improving your score before applying saves the most." },
    { question: "Does refinancing remove PMI?", answer: "Yes. Refinancing into a new conventional loan at 80% LTV or below eliminates PMI entirely. For FHA borrowers stuck with lifetime MIP, refinancing to conventional once they reach 80% LTV is the standard exit. Watch closing costs — only refinance if PMI savings exceed the refi cost within a reasonable breakeven (typically 2–3 years)." },
  ];

  const isFha = inputs.loanType === "fha";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "PMI Removal Date" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-foreground">PMI Removal Date Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ─── LEFT: Inputs ─── */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card lg:sticky lg:top-4">
            {/* Loan type toggle */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Loan Type</label>
              <div className="flex gap-2">
                <SegBtn active={!isFha} onClick={() => set("loanType", "conventional")}>Conventional (PMI)</SegBtn>
                <SegBtn active={isFha} onClick={() => set("loanType", "fha")}>FHA (MIP)</SegBtn>
              </div>
            </div>

            <CI id="hv" label="Home Value / Purchase Price" value={String(inputs.homeValue)} onChange={(v) => set("homeValue", parseFloat(v) || 0)} prefix="$" step="1000" />
            <CI id="la" label="Original Loan Amount" value={String(inputs.loanAmount)} onChange={(v) => set("loanAmount", parseFloat(v) || 0)} prefix="$" step="1000" />

            <div className="grid grid-cols-2 gap-4">
              <CI id="rate" label="Interest Rate" value={String(inputs.interestRate)} onChange={(v) => set("interestRate", parseFloat(v) || 0)} suffix="%" step="0.05" />
              <CI id="term" label="Loan Term" value={String(inputs.loanTermYears)} onChange={(v) => set("loanTermYears", parseFloat(v) || 30)} suffix="yr" step="1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="sm" className="text-sm font-semibold text-foreground mb-1">Loan Start Month</label>
                <select id="sm" value={inputs.startMonth} onChange={(e) => set("startMonth", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <CI id="sy" label="Loan Start Year" value={String(inputs.startYear)} onChange={(v) => set("startYear", parseInt(v) || now.getFullYear())} step="1" />
            </div>

            <CI id="appr" label="Expected Annual Appreciation" value={String(inputs.appreciationRate)} onChange={(v) => set("appreciationRate", parseFloat(v) || 0)} suffix="%" step="0.1" />

            {!isFha && (
              <CI id="extra" label="Extra Monthly Principal (optional)" value={String(inputs.extraMonthly)} onChange={(v) => set("extraMonthly", parseFloat(v) || 0)} prefix="$" step="10" />
            )}

            {/* Advanced */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  {!isFha && (
                    <>
                      <div className="col-span-2 flex items-center gap-2">
                        <SegBtn active={inputs.pmiMode === "auto"} onClick={() => set("pmiMode", "auto")}>Auto Rate</SegBtn>
                        <SegBtn active={inputs.pmiMode === "manual"} onClick={() => set("pmiMode", "manual")}>Manual</SegBtn>
                      </div>
                      {inputs.pmiMode === "manual" && (
                        <CI id="mrate" label="Manual PMI Rate" value={String(inputs.manualPmiRate)} onChange={(v) => set("manualPmiRate", parseFloat(v) || 0)} suffix="%" step="0.01" />
                      )}
                      {inputs.pmiMode === "auto" && (
                        <CI id="cs" label="Credit Score" value={String(inputs.creditScore)} onChange={(v) => set("creditScore", parseInt(v) || 720)} min="620" max="850" />
                      )}
                      <div className="flex flex-col">
                        <label htmlFor="pu" className="text-sm font-semibold text-foreground mb-1">Property Use</label>
                        <select id="pu" value={inputs.propertyUse} onChange={(e) => set("propertyUse", e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="primary">Primary Residence</option>
                          <option value="second">Second Home</option>
                          <option value="investment">Investment</option>
                        </select>
                      </div>
                      <CI id="seas" label="Seasoning Floor" value={String(inputs.seasoningMonths)} onChange={(v) => set("seasoningMonths", parseInt(v) || 24)} suffix="mo" step="1" min="0" />
                    </>
                  )}
                  {isFha && (
                    <div className="col-span-2" />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={() => setResults(calculatePmiRemoval(inputs))} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center focus:outline-none" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ─── RIGHT: Results ─── */}
          <div className="flex flex-col gap-3">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check Your Inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : !results.pmiRequired ? (
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-5">
                <div className="text-sm font-bold text-emerald-600 mb-1 uppercase tracking-wider">No PMI Required</div>
                <div className="text-base font-medium text-foreground">Your starting loan is {fmtPct(results.initialLtv)} LTV — below the 80% threshold. PMI was never required on this loan.</div>
              </div>
            ) : (
              <>
                {/* Primary headline card */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-l-4 border-primary rounded-xl p-5 relative">
                  <div className="flex justify-end absolute top-3 right-4">
                    <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none" onClick={() => window.print()}>
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-semibold">
                    {isFha ? "FHA MIP Cancellation Date" : "Earliest PMI Removal Date"}
                  </div>
                  <div className="text-4xl md:text-5xl font-extrabold text-primary mb-1 tracking-tight">
                    {results.earliest.dateLabel}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {results.earliest.months > 0
                      ? <>Via <strong className="text-foreground">{results.earliest.label}</strong> — month {fmtInt(results.earliest.months)} of your loan.</>
                      : results.earliest.description}
                  </div>
                  <div className="mt-3 text-sm text-foreground/80 bg-background/60 rounded-md p-2.5 border border-border/50">
                    {results.earliest.description}
                  </div>
                </div>

                {/* 3-stat bar */}
                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total PMI Until Removal</div>
                    <div className="text-lg font-bold text-foreground">{fmtUsd(results.totalPmiPaid)}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Monthly PMI Cost</div>
                    <div className="text-lg font-bold text-foreground">{fmtUsd2(results.monthlyPmi)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Savings After Removal</div>
                    <div className="text-lg font-bold text-emerald-600">{fmtUsd2(results.monthlySavings)}/mo</div>
                  </div>
                </div>

                {/* LTV chart */}
                <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">LTV Over Time — When PMI Can Come Off</h3>
                  <div className="w-full h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <ReferenceArea y1={78} y2={100} fill="#f59e0b" fillOpacity={0.10} />
                        <XAxis
                          dataKey="month" type="number"
                          domain={[0, "dataMax"]}
                          tickFormatter={(m) => `Yr ${Math.round(Number(m) / 12)}`}
                          ticks={[0, 36, 72, 108, 144, 180, 216, 252, 288, 324, 360]}
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false}
                        />
                        <YAxis domain={[40, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} width={38} />
                        <Tooltip
                          formatter={(val: number, name: string) => [`${val}%`, name === "original" ? "LTV (original value)" : "LTV (current value)"]}
                          labelFormatter={(m) => `Month ${m} (Yr ${(Number(m) / 12).toFixed(1)})`}
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "80% (request)", position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }} />
                        <ReferenceLine y={78} stroke="#10b981" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "78% (auto)", position: "insideBottomRight", fontSize: 10, fill: "#10b981" }} />
                        <Line name="LTV (original value)" dataKey="original" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} connectNulls />
                        <Line name="LTV (current value)" dataKey="current" stroke="#8b5cf6" strokeWidth={2.5} dot={false} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Removal paths table */}
                {!isFha ? (
                  <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border">
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">All PMI Termination Paths (HPA)</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            <th className="p-2.5 pl-3">Termination Path</th>
                            <th className="p-2.5 text-right">Month</th>
                            <th className="p-2.5 text-right">Removal Date</th>
                            <th className="p-2.5 pr-3 text-right">Basis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          <PathRow path={results.autoTermination78} highlight={results.earliest.label === results.autoTermination78.label} basisLabel="Original value" />
                          <PathRow path={results.borrowerRequested80} highlight={results.earliest.label === results.borrowerRequested80.label} basisLabel="Current value" />
                          <PathRow path={results.midpoint} highlight={results.earliest.label === results.midpoint.label} basisLabel="Statutory" />
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">FHA MIP Termination</h3>
                    <p className="text-sm text-muted-foreground">{results.fhaRule?.description}</p>
                  </div>
                )}

                {/* Acceleration table (conventional only, with meaningful extra inputs) */}
                {!isFha && (
                  <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border">
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Accelerate Removal with Extra Payments</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            <th className="p-2.5 pl-3">Extra / Month</th>
                            <th className="p-2.5 text-right">Removal Date</th>
                            <th className="p-2.5 text-right">Months Saved</th>
                            <th className="p-2.5 pr-3 text-right">PMI Saved</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {results.acceleration.map((row) => (
                            <tr key={row.extra} className={`hover:bg-secondary/20 transition-colors ${row.extra === inputs.extraMonthly ? "bg-primary/5" : ""}`}>
                              <td className="p-2.5 pl-3 font-semibold text-foreground">{row.extra === 0 ? "None" : `+${fmtUsd(row.extra)}`}{row.extra === inputs.extraMonthly && <span className="ml-2 text-[10px] text-primary font-bold uppercase">Yours</span>}</td>
                              <td className="p-2.5 text-right text-foreground">{row.dateLabel}</td>
                              <td className="p-2.5 text-right text-foreground">{row.monthsSaved > 0 ? `${row.monthsSaved} mo` : "—"}</td>
                              <td className="p-2.5 pr-3 text-right font-medium text-emerald-600">{row.pmiSavedVsBaseline > 0 ? fmtUsd(row.pmiSavedVsBaseline) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Summary breakdown */}
                <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Loan Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <SummaryStat label="Base Loan Amount" value={fmtUsd(results.baseLoanAmount)} />
                    <SummaryStat label="Starting LTV" value={fmtPct(results.initialLtv)} />
                    <SummaryStat label="Monthly P&I" value={fmtUsd2(results.monthlyPi)} />
                    {!isFha && <SummaryStat label="PMI Rate" value={`${results.pmiRate.toFixed(2)}%`} sub={results.pmiTierLabel} />}
                    {isFha && <SummaryStat label="MIP Status" value={results.fhaLifetime ? "Lifetime" : "11-year"} />}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── SEO CONTENT ─── */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is It?</h2>
            <p>A PMI Removal Date Calculator is an advanced financial tool designed to tell you the exact month and year you can legally cancel private mortgage insurance on a conventional loan—or when FHA mortgage insurance premiums (MIP) finally expire. PMI typically costs homeowners between $100 and $400 per month, and millions of people pay it for years longer than necessary because they do not fully understand the legal regulations that dictate when lenders are forced to remove it. By simulating your loan's amortization schedule and applying the federal Homeowners Protection Act (HPA) of 1998, this calculator projects three distinct termination pathways to show you the fastest possible route to eliminating this unnecessary expense.</p>
            <p>Many homeowners operate under the misconception that their loan servicer will automatically drop their PMI the very moment their loan balance falls below 80% of the home's value. Unfortunately, this is a widespread myth that costs borrowers thousands of dollars in excess premiums. The law only requires automatic termination when your scheduled balance reaches 78% of the original home value. If you want it removed earlier—such as when you hit 80% of the home's current market value—you must proactively request it in writing. This calculator eliminates the guesswork by doing the complex date math for you, allowing you to take control of your mortgage.</p>
            <p>By using this tool, you can visualize the impact of your payment strategy over the long term. You will see the precise dollar amount of PMI you will pay over the life of your loan if you do nothing, versus how much you could save if you strategically overpay your principal or capitalize on rising local property values to trigger an early cancellation.</p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>The calculator operates by running a month-by-month amortization algorithm on your specific loan parameters. First, it determines your starting Loan-to-Value (LTV) ratio by dividing your original loan amount by the home's value. If this ratio exceeds 80% on a conventional loan, PMI is required. The system then calculates your monthly principal and interest payment, precisely tracking how much of each payment goes toward reducing your principal balance.</p>
            <p>Under federal law, there are three independent termination triggers that the calculator evaluates. Your PMI ends on whichever of these dates comes first for your specific situation. The first is the Automatic Termination at 78% LTV. Your servicer must cancel PMI automatically the month your loan's scheduled balance reaches 78% of the home's original appraised value (or purchase price, whichever is lower). This date is mathematically fixed; even if you make extra payments, the automatic termination date does not move up unless you specifically request early cancellation.</p>
            <p>The second trigger is Borrower-Requested Removal at 80% LTV. As soon as your actual balance hits 80% of the home's current market value, you can demand removal. Because current value reflects appreciation and extra principal payments, this path is usually years faster. The third trigger is the Final Termination at Loan Midpoint, an absolute statutory backstop ensuring PMI ends no later than the midpoint of your loan term (e.g., year 15 of a 30-year loan), assuming payments are current.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Results</h2>
            <p>When you review the calculator's output, the most prominent feature is the Primary Result Card, which displays the absolute earliest date you can remove PMI across all available legal pathways. If the borrower-requested 80% path is faster due to appreciation or extra payments, the result card will highlight that date and classify it as "Borrower-Requested." If you have made no extra payments and assume zero appreciation, the card will display the 78% automatic termination date.</p>
            <p>The results also include an interactive LTV curve. The primary line on this chart tracks your scheduled amortization against the home's original value—this is the trajectory that governs your 78% automatic termination. The secondary line tracks your actual balance against the home's current value, accounting for appreciation and extra payments. When this secondary line crosses the 80% threshold, you become eligible to request cancellation.</p>
            <p>It is also crucial to understand how the results change if you select an FHA loan. FHA loans follow a completely different, much stricter rule set. For loans endorsed on or after June 3, 2013, if you put less than 10% down at origination, MIP lasts for the entire life of the loan. The calculator will accurately reflect this by displaying a "Lifetime" MIP status, reminding you that your only exit strategy is to refinance into a conventional mortgage once you reach 80% LTV.</p>

            <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
            <p>Several variables dramatically influence your PMI removal timeline. The most significant is your home's appreciation rate. The 80% borrower-requested date is based on current value, which improves in two ways: your balance drops as you pay principal, and your home's value rises with appreciation. In a market appreciating 3–4% per year, a homeowner can reach 80% LTV in three to four years instead of nine to ten. Our calculator allows you to model these scenarios instantly.</p>
            <p>Extra principal payments have a similarly powerful compounding effect. Every extra dollar you send to your servicer directly reduces the numerator in your LTV calculation. Because early mortgage payments are heavily skewed toward interest, adding even $100 a month in extra principal can double the speed at which your balance declines in the first five years. The calculator's acceleration table shows exactly how many months and dollars each extra-payment tier saves.</p>
            <p>Your interest rate and loan term also dictate the speed of amortization. A 15-year mortgage will reach the 80% and 78% thresholds significantly faster than a 30-year mortgage because a much larger portion of your early payments goes toward principal. Conversely, higher interest rates slow down principal reduction in the early years, delaying your natural cancellation dates.</p>

            <h2 className="text-2xl font-bold mb-3">Advanced Features</h2>
            <p>This calculator includes several advanced features designed for precision modeling. For instance, the "Loan Start Date" selector allows you to synchronize the amortization math with your exact mortgage anniversary, ensuring the projected month-by-month timeline perfectly matches your servicer's schedule. You can also specify an exact "Monthly PMI Amount" if you already know your premium, bypassing estimation engines for down-to-the-penny accuracy on your total lifetime PMI cost.</p>
            <p>Another powerful feature is the "Current Home Value" input. Rather than assuming your home's value remains static, you can model how rising local property values aggressively pull forward your eligibility date for borrower-requested cancellation. The calculator dynamically uses this value to calculate your true current LTV month over month.</p>
            <p>Finally, the "Extra Monthly Payment" tool demonstrates the compounding power of overpayments. By inputting an extra monthly payment, the calculator instantly recalculates your amortization curve, showing you exactly how many months early you will cross the 80% and 78% thresholds and exactly how many dollars you will save in avoided PMI premiums.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Examples</h2>
            <p>Let's look at a practical example to demonstrate the tool's utility. Suppose you purchased a $400,000 home with a 5% down payment. Your starting loan balance is $380,000, yielding a 95% LTV. Based solely on the standard 30-year amortization schedule at 6.5%, it will take over a decade for your balance to slowly creep down to $312,000 (the 78% automatic termination mark). Over that decade, you will pay roughly $18,000 in PMI.</p>
            <p>However, if you input a modest 3% annual appreciation rate into the calculator, the scenario changes drastically. Your home's value will reach approximately $463,000 by year five. Your loan balance at that point will be roughly $350,000, which means your LTV is $350k / $463k = 75.5%. You are well past the 80% threshold required for borrower-requested cancellation. By ordering a new appraisal to prove this new value, you can strip the PMI off your loan over five years earlier than the automatic date, saving you thousands.</p>
            <p>If you combine that 3% appreciation with an extra $150 per month in principal payments, you reach the 80% current-value threshold even faster—in exactly 44 months (under four years). The calculator allows you to seamlessly toggle these variables and instantly see the revised calendar date and total dollars saved.</p>

            <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
            <p>Knowing your eligibility date is only half the battle; executing the removal requires navigating your servicer's bureaucracy. Once the calculator indicates you have reached the 80% threshold based on current value, you must formally write your servicer to request cancellation. A phone call is not legally sufficient under the Homeowners Protection Act. Log into your servicer's portal and look for a specific "PMI Cancellation Form," or send a certified letter.</p>
            <p>When requesting cancellation based on appreciation, the servicer will instruct you on how to verify the property's value. Do not order your own appraisal; the servicer must order it through their approved vendor network to prevent fraud. You will typically have to pay for this upfront, which usually costs between $400 and $700 for a full appraisal. If your loan is older or you have substantial equity, they may allow a cheaper Broker Price Opinion (BPO) or an automated desktop valuation.</p>
            <p>Before initiating the request, ensure you meet the strict behavioral criteria. Servicers will deny your request if you do not have a "good payment history," defined as no 30-day late payments in the past 12 months, and no 60-day late payments in the past 24 months. Furthermore, the property must not have any subordinate liens (like a HELOC or second mortgage) that push the combined LTV over 80%. Verify cancellation on your next statement; PMI should disappear within 30 to 60 days of approval.</p>

            <h2 className="text-2xl font-bold mb-3">Benefits</h2>
            <p>The financial benefits of early PMI removal are staggering. PMI offers absolutely no protection or benefit to you as the homeowner—it solely protects the lender in case you default on the mortgage. Every dollar spent on it is essentially a tax on your lack of initial equity. By eliminating this expense as quickly as possible, you free up substantial monthly cash flow.</p>
            <p>For a typical homeowner, removing PMI can save between $1,500 and $4,000 per year. If appreciation and paydown get you to 80% LTV in year four instead of the scheduled year nine, you save roughly $10,000 to $20,000 over the life of the loan. That money can be redirected toward retirement savings, college funds, or further principal reduction to accelerate your path to a mortgage-free life.</p>
            <p>By tracking your local real estate market and proactively requesting an appraisal as soon as the calculator indicates you have crossed the 80% threshold, the $500 cost of the appraisal becomes an investment. In many cases, spending $500 on an appraisal yields a 500% to 1,000% return in the first year alone from avoided PMI premiums. This makes monitoring your PMI removal date one of the highest-ROI financial moves a homeowner can make.</p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pmi-removal-date-calculator" />
          <PopularCalculators exclude="/calculator/pmi-removal-date-calculator" />
        </div>
      </div>
    </>
  );
};

const PathRow = ({ path, highlight, basisLabel }: { path: RemovalPath; highlight: boolean; basisLabel: string }) => (
  <tr className={`hover:bg-secondary/20 transition-colors ${highlight ? "bg-emerald-500/5" : ""}`}>
    <td className="p-2.5 pl-3 font-semibold text-foreground">
      {path.label}
      {highlight && <span className="ml-2 text-[10px] text-emerald-600 font-bold uppercase">Earliest</span>}
    </td>
    <td className="p-2.5 text-right text-foreground">{path.months > 0 ? `Mo ${Math.round(path.months)}` : "—"}</td>
    <td className="p-2.5 text-right text-foreground">{path.dateLabel}</td>
    <td className="p-2.5 pr-3 text-right text-muted-foreground text-xs">{basisLabel}</td>
  </tr>
);

const SummaryStat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">{label}</div>
    <div className="text-base font-bold text-foreground">{value}</div>
    {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
  </div>
);

export default PmiRemovalDateCalculator;
