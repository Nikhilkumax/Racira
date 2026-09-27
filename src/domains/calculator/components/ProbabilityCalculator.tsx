"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Relationship = "independent" | "exclusive" | "custom";

interface ProbabilityInputs {
  pA: number;
  pB: number;
  pAB: number;
  relationship: Relationship;
}

const DEFAULTS: ProbabilityInputs = {
  pA: 40,
  pB: 35,
  pAB: 14,
  relationship: "independent",
};

const fmt = (v: number, d = 4) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const pct = (v: number) => `${fmt(v * 100, 2)}%`;

const oddsText = (p: number): string => {
  if (p <= 0) return "0 : 1 (impossible)";
  if (p >= 1) return "1 : 0 (certain)";
  const against = (1 - p) / p;
  return `${fmt(1 / p, 2)} : 1 against`;
};

interface OutcomeRow {
  label: string;
  probability: number;
  percent: number;
}

interface DerivedRow {
  label: string;
  formula: string;
  probability: number;
}

interface ProbabilityResult {
  valid: boolean;
  errorMsg: string;
  a: number;
  b: number;
  ab: number;
  aOrB: number;
  neither: number;
  aOnly: number;
  bOnly: number;
  aGivenB: number;
  bGivenA: number;
  aGivenNotB: number;
  bGivenNotA: number;
  consistencyOk: boolean;
  outcomeRows: OutcomeRow[];
  derivedRows: DerivedRow[];
  notes: string[];
}

function computeProbability(input: ProbabilityInputs): ProbabilityResult {
  const { pA, pB, pAB, relationship } = input;

  const blank: ProbabilityResult = {
    valid: false,
    errorMsg: "",
    a: 0,
    b: 0,
    ab: 0,
    aOrB: 0,
    neither: 0,
    aOnly: 0,
    bOnly: 0,
    aGivenB: 0,
    bGivenA: 0,
    aGivenNotB: 0,
    bGivenNotA: 0,
    consistencyOk: true,
    outcomeRows: [],
    derivedRows: [],
    notes: [],
  };

  if (!Number.isFinite(pA) || !Number.isFinite(pB) || !Number.isFinite(pAB)) {
    return { ...blank, errorMsg: "Enter a probability for each event, as a percentage between 0 and 100." };
  }
  if (pA < 0 || pA > 100 || pB < 0 || pB > 100) {
    return { ...blank, errorMsg: "Each event probability must sit between 0 and 100 percent." };
  }

  const a = pA / 100;
  const b = pB / 100;

  let ab = 0;
  const notes: string[] = [];

  if (relationship === "exclusive") {
    ab = 0;
    notes.push("Mutually exclusive events cannot occur together, so the joint probability is zero.");
  } else if (relationship === "independent") {
    ab = a * b;
    notes.push("Independent events multiply: P(A ∩ B) = P(A) × P(B).");
  } else {
    ab = pAB / 100;
    if (ab < 0 || ab > 1) {
      return { ...blank, errorMsg: "The joint probability must sit between 0 and 100 percent." };
    }
    notes.push("The joint probability was entered directly and used as given.");
  }

  const consistencyOk = ab <= Math.min(a, b) + 1e-9;
  if (!consistencyOk) {
    return {
      ...blank,
      errorMsg: "The joint probability cannot exceed either single-event probability. Check the values you entered.",
    };
  }
  if (relationship === "custom" && ab < Math.max(0, a + b - 1) - 1e-9) {
    notes.push("The entered joint probability is below the minimum consistent with P(A) and P(B), so the events are highly dependent.");
  }
  if (ab > 0.999 && a < 1) {
    notes.push("A joint probability of almost one with less than certain single events is unusual; double-check the inputs.");
  }

  const aOrB = a + b - ab;
  const neither = Math.max(0, 1 - aOrB);
  const aOnly = a - ab;
  const bOnly = b - ab;
  const aGivenB = b > 0 ? ab / b : 0;
  const bGivenA = a > 0 ? ab / a : 0;
  const bNot = 1 - b;
  const aNot = 1 - a;
  const aGivenNotB = bNot > 0 ? (a - ab) / bNot : 0;
  const bGivenNotA = aNot > 0 ? (b - ab) / aNot : 0;

  const outcomeRows: OutcomeRow[] = [
    { label: "A and B both occur", probability: ab, percent: ab * 100 },
    { label: "A occurs, B does not", probability: aOnly, percent: aOnly * 100 },
    { label: "B occurs, A does not", probability: bOnly, percent: bOnly * 100 },
    { label: "Neither event occurs", probability: neither, percent: neither * 100 },
    { label: "At least one occurs (A ∪ B)", probability: aOrB, percent: aOrB * 100 },
  ];

  const derivedRows: DerivedRow[] = [
    { label: "P(A | B)", formula: "P(A ∩ B) ÷ P(B)", probability: aGivenB },
    { label: "P(B | A)", formula: "P(A ∩ B) ÷ P(A)", probability: bGivenA },
    { label: "P(A | not B)", formula: "P(A only) ÷ (1 − P(B))", probability: aGivenNotB },
    { label: "P(B | not A)", formula: "P(B only) ÷ (1 − P(A))", probability: bGivenNotA },
    { label: "P(not A)", formula: "1 − P(A)", probability: aNot },
    { label: "P(not B)", formula: "1 − P(B)", probability: bNot },
  ];

  return {
    valid: true,
    errorMsg: "",
    a,
    b,
    ab,
    aOrB,
    neither,
    aOnly,
    bOnly,
    aGivenB,
    bGivenA,
    aGivenNotB,
    bGivenNotA,
    consistencyOk,
    outcomeRows,
    derivedRows,
    notes,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function ProbabilityCalculator() {
  const [pA, setPA] = useState(String(DEFAULTS.pA));
  const [pB, setPB] = useState(String(DEFAULTS.pB));
  const [pAB, setPAB] = useState(String(DEFAULTS.pAB));
  const [relationship, setRelationship] = useState<Relationship>(DEFAULTS.relationship);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ProbabilityInputs => ({
    pA: parseFloat(pA) || 0,
    pB: parseFloat(pB) || 0,
    pAB: parseFloat(pAB) || 0,
    relationship,
  });

  const [calcInputs, setCalcInputs] = useState<ProbabilityInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ProbabilityResult>(() => computeProbability(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeProbability(inputs));
  };

  const reset = () => {
    setPA(String(DEFAULTS.pA));
    setPB(String(DEFAULTS.pB));
    setPAB(String(DEFAULTS.pAB));
    setRelationship(DEFAULTS.relationship);
    setCalcInputs(DEFAULTS);
    setResults(computeProbability(DEFAULTS));
  };

  const RELATIONSHIPS: { key: Relationship; label: string }[] = [
    { key: "independent", label: "Independent" },
    { key: "exclusive", label: "Mutually Exclusive" },
    { key: "custom", label: "Enter Joint P" },
  ];

  const faqs = [
    {
      question: "How do I find the probability that at least one of two events happens?",
      answer:
        "Add the two probabilities and subtract the probability that both happen, because adding them double-counts the overlap. Two events with forty and thirty-five percent chances that are independent overlap fourteen percent of the time, so the chance of at least one is forty plus thirty-five minus fourteen, which is sixty-one percent.",
    },
    {
      question: "What does independent mean in probability?",
      answer:
        "Two events are independent when knowing one happened does not change the chance of the other. Independence means the joint probability is simply the product of the two individual probabilities. Coin flips and dice rolls are independent, while drawing cards without replacement is not, because each draw changes the composition of the deck.",
    },
    {
      question: "What is the difference between mutually exclusive and independent?",
      answer:
        "Mutually exclusive events cannot both happen, so their joint probability is zero, which makes them maximally dependent on each other. Independent events can happen together and their overlap is the product of their probabilities. The two ideas are often confused because both describe a clean relationship with no messy overlap.",
    },
    {
      question: "What does conditional probability mean?",
      answer:
        "P(A | B) answers the question of how likely A is once you know B has happened. It divides the joint probability by the probability of the condition, which effectively shrinks the sample space. If B makes A more likely, the conditional value is higher than the plain probability of A, and the reverse direction behaves the same way.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Probability Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Probability Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Event Probabilities">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="prob-a"
                  label="P(A)"
                  value={pA}
                  onChange={setPA}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Chance that event A happens."
                />
                <CompactInput
                  id="prob-b"
                  label="P(B)"
                  value={pB}
                  onChange={setPB}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="Chance that event B happens."
                />
              </div>
            </SubSection>

            <SubSection title="Relationship">
              <div className="grid grid-cols-3 gap-2">
                {RELATIONSHIPS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRelationship(r.key)}
                    aria-pressed={relationship === r.key}
                    className={
                      relationship === r.key
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-xs transition-colors"
                    }
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </SubSection>

            {relationship === "custom" && (
              <SubSection title="Joint Probability">
                <CompactInput
                  id="prob-ab"
                  label="P(A ∩ B)"
                  value={pAB}
                  onChange={setPAB}
                  onEnter={runCalculate}
                  suffix="%"
                  hint="Chance both events happen together."
                  tooltip="Cannot exceed either single-event probability."
                />
              </SubSection>
            )}

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Notes">
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      Independent events multiply to give the joint probability. Mutually exclusive events cannot overlap, so the
                      joint probability is zero. Choose &quot;Enter Joint P&quot; when you know the overlap from data and want every
                      derived figure built from it.
                    </p>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">P(A ∪ B) — At Least One</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? pct(results.aOrB) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `P(A and B both) = ${pct(results.ab)} · neither = ${pct(results.neither)}`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Both Events</span>
                <span className="font-extrabold text-foreground">{results.valid ? pct(results.ab) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Neither</span>
                <span className="font-extrabold text-foreground">{results.valid ? pct(results.neither) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">P(A | B)</span>
                <span className="font-extrabold text-foreground">{results.valid ? pct(results.aGivenB) : "—"}</span>
              </div>
            </div>

            {/* OUTCOME TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Outcome</th>
                    <th className="p-2.5 text-right">Probability</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Percent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.outcomeRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.probability, 4)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.percent, 2)}%`}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-emerald-600">1.0000</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">100.00%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DERIVED TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Derived Quantity</th>
                    <th className="p-2.5">Formula</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.derivedRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-muted-foreground">{row.formula}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.probability, 4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">P(A)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? pct(results.a) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">P(B)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? pct(results.b) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">A Only</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? pct(results.aOnly) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">B Only</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? pct(results.bOnly) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Odds Against A</span>
                  <span className="text-base font-bold text-foreground">{oddsText(results.a)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Odds Against B</span>
                  <span className="text-base font-bold text-foreground">{oddsText(results.b)}</span>
                </div>
              </div>
            </div>

            {results.notes.length > 0 && (
              <div className="bg-secondary/20 border border-border rounded-lg p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Method Notes</div>
                <ul className="flex flex-col gap-1.5">
                  {results.notes.map((note) => (
                    <li key={note} className="text-sm text-foreground">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Probability Calculator?</h2>
            <p>
              A probability calculator combines two events into every quantity that matters: the chance both happen, the
              chance at least one happens, the chance neither happens, and the conditional probabilities that describe one
              event given the other. Enter two percentages, choose how the events relate, and the whole table of derived
              figures is produced at once.
            </p>
            <p>
              Probability is the language of risk. Insurance premiums, medical test results, weather forecasts, quality
              control sampling and game design all rest on it, and most practical questions involve combining two events
              rather than reasoning about a single chance in isolation. The relationship between those events is where the
              interesting arithmetic lives.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Independent events multiply, so the joint probability of two unrelated events is the product of their separate
              probabilities. Mutually exclusive events cannot overlap, which makes the joint probability zero and the union
              simply the sum. When the overlap is known from data, entering it directly lets the calculator work out every
              conditional figure from real observations rather than from an assumption.
            </p>
            <p>
              The union of two events adds the individual probabilities and subtracts the overlap, because simple addition
              counts the cases where both occur twice. Whatever the union leaves over must be the chance that neither happens,
              since the four possible outcomes are exhaustive. Conditional probabilities divide the joint probability by the
              condition, which is the formal statement of learning from evidence.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the chance of at least one event, with the joint and neither probabilities in the
              three-stat bar and the conditional probability of A given B alongside them. The first table lists all five
              outcome combinations and they always sum to one, which is the quickest sanity check available.
            </p>
            <p>
              The second table sets out the conditional probabilities with their formulas. Comparing P(A) with P(A | B) shows
              whether knowing B makes A more or less likely, and the same comparison in reverse reveals the direction of the
              dependency. Two events whose conditional and plain probabilities match to within rounding are effectively
              independent.
            </p>
            <p>
              Watch for impossible combinations. The overlap can never exceed either single probability, and the calculator
              stops with an explanation rather than returning nonsense when that rule is broken. Similarly, mutually exclusive
              events with very high individual probabilities leave little room for anything else, and the neither figure
              becomes small enough to matter in risk decisions.
            </p>
            <p>
              Finally, note the difference between a probability and the odds used by bookmakers. A forty percent chance is
              one point five to one against, not a two point five to one payout, because odds quote the ratio of failures to
              successes rather than the raw counts. The summary panel converts both figures so the two notations can be
              compared directly.
            </p>
            <p>
              When the same calculation is used on real data, keep the sample size in view: a joint probability estimated from
              twenty observations has a wide margin of error, and the conditional figures inherit that uncertainty. Recomputing
              the table with the overlap raised and lowered by a few points is a quick way to see how sensitive a decision
              really is to the inputs.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/probability-calculator" />
          <PopularCalculators exclude="/calculator/probability-calculator" />
        </div>
      </div>
    </>
  );
}
