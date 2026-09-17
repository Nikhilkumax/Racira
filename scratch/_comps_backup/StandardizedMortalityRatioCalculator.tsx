"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import InputField from "@/domains/calculator/components/ui/InputField";

type ConfidenceLevel = "90" | "95" | "99";

interface Stratum {
  label: string;
  personYears: number;
  rate: number;
}

interface SmrInputs {
  observedDeaths: number;
  personYears: number;
  referenceRate: number;
  useStrata: boolean;
  strata: Stratum[];
  confidence: ConfidenceLevel;
}

interface SmrResult {
  observed: number;
  expected: number;
  smr: number;
  smrIndexed: number;
  lowerCi: number;
  upperCi: number;
  excessDeaths: number;
  crudeRate: number;
  expectedRate: number;
  pValue: number;
  significant: boolean;
  interpretation: string;
  strataExpected: number[];
  totalPersonYears: number;
  zScore: number;
}

const Z_SCORES: Record<ConfidenceLevel, number> = { "90": 1.6449, "95": 1.96, "99": 2.5758 };

const DEFAULT_STRATA: Stratum[] = [
  { label: "Under 45", personYears: 20000, rate: 60 },
  { label: "45 to 64", personYears: 18000, rate: 300 },
  { label: "65 to 74", personYears: 8000, rate: 900 },
  { label: "75 and over", personYears: 4000, rate: 2800 },
];

const DEFAULTS: SmrInputs = {
  observedDeaths: 145,
  personYears: 50000,
  referenceRate: 250,
  useStrata: false,
  strata: DEFAULT_STRATA,
  confidence: "95",
};

// Standard normal CDF via the Abramowitz & Stegun 7.1.26 error-function approximation.
function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

export function calculateSmr(i: SmrInputs): SmrResult {
  const strataExpected = i.strata.map(s => (s.personYears * s.rate) / 100000);
  const strataPersonYears = i.strata.reduce((sum, s) => sum + s.personYears, 0);

  const totalPersonYears = i.useStrata ? strataPersonYears : i.personYears;
  const expected = i.useStrata
    ? strataExpected.reduce((sum, v) => sum + v, 0)
    : (i.personYears * i.referenceRate) / 100000;

  const observed = i.observedDeaths;
  const smr = expected > 0 ? observed / expected : 0;
  const z = Z_SCORES[i.confidence];

  // Byar's approximation to the exact Poisson confidence limits on the observed count.
  const lowerCount =
    observed > 0 ? observed * Math.pow(1 - 1 / (9 * observed) - z / (3 * Math.sqrt(observed)), 3) : 0;
  const upperCount =
    (observed + 1) *
    Math.pow(1 - 1 / (9 * (observed + 1)) + z / (3 * Math.sqrt(observed + 1)), 3);

  const lowerCi = expected > 0 ? Math.max(lowerCount, 0) / expected : 0;
  const upperCi = expected > 0 ? upperCount / expected : 0;

  const zScore = expected > 0 ? (observed - expected) / Math.sqrt(expected) : 0;
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  const alpha = 1 - Number(i.confidence) / 100;
  const significant = pValue < alpha;

  let interpretation: string;
  if (!significant) {
    interpretation = "Mortality is not statistically distinguishable from the reference population.";
  } else if (smr > 1) {
    interpretation = "Mortality is significantly higher than the reference population.";
  } else {
    interpretation = "Mortality is significantly lower than the reference population.";
  }

  return {
    observed,
    expected,
    smr,
    smrIndexed: smr * 100,
    lowerCi,
    upperCi,
    excessDeaths: observed - expected,
    crudeRate: totalPersonYears > 0 ? (observed / totalPersonYears) * 100000 : 0,
    expectedRate: totalPersonYears > 0 ? (expected / totalPersonYears) * 100000 : 0,
    pValue,
    significant,
    interpretation,
    strataExpected,
    totalPersonYears,
    zScore,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
const fmtP = (p: number) => (p < 0.001 ? "< 0.001" : fmt(p, 3));

export default function StandardizedMortalityRatioCalculator() {
  const [observedDeaths, setObservedDeaths] = useState(String(DEFAULTS.observedDeaths));
  const [personYears, setPersonYears] = useState(String(DEFAULTS.personYears));
  const [referenceRate, setReferenceRate] = useState(String(DEFAULTS.referenceRate));
  const [useStrata, setUseStrata] = useState(DEFAULTS.useStrata);
  const [strataPy, setStrataPy] = useState<string[]>(DEFAULT_STRATA.map(s => String(s.personYears)));
  const [strataRate, setStrataRate] = useState<string[]>(DEFAULT_STRATA.map(s => String(s.rate)));
  const [confidence, setConfidence] = useState<ConfidenceLevel>(DEFAULTS.confidence);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<SmrResult>(calculateSmr(DEFAULTS));

  const getInputs = (): SmrInputs => ({
    observedDeaths: parseFloat(observedDeaths) || 0,
    personYears: parseFloat(personYears) || 0,
    referenceRate: parseFloat(referenceRate) || 0,
    useStrata,
    strata: DEFAULT_STRATA.map((s, idx) => ({
      label: s.label,
      personYears: parseFloat(strataPy[idx]) || 0,
      rate: parseFloat(strataRate[idx]) || 0,
    })),
    confidence,
  });

  useEffect(() => {
    setResult(calculateSmr(DEFAULTS));
  }, []);

  const observedNum = parseFloat(observedDeaths) || 0;
  const pyNum = parseFloat(personYears) || 0;
  const rateNum = parseFloat(referenceRate) || 0;
  const strataPyTotal = strataPy.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  let errorMsg = "";
  if (observedNum < 0) errorMsg = "Observed deaths cannot be negative.";
  else if (!useStrata && pyNum <= 0) errorMsg = "Person-years at risk must be greater than zero.";
  else if (!useStrata && rateNum <= 0) errorMsg = "Reference mortality rate must be greater than zero.";
  else if (useStrata && strataPyTotal <= 0) errorMsg = "Total stratum person-years must be greater than zero.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResult(calculateSmr(getInputs()));
  };

  const reset = () => {
    setObservedDeaths(String(DEFAULTS.observedDeaths));
    setPersonYears(String(DEFAULTS.personYears));
    setReferenceRate(String(DEFAULTS.referenceRate));
    setUseStrata(DEFAULTS.useStrata);
    setStrataPy(DEFAULT_STRATA.map(s => String(s.personYears)));
    setStrataRate(DEFAULT_STRATA.map(s => String(s.rate)));
    setConfidence(DEFAULTS.confidence);
    setResult(calculateSmr(DEFAULTS));
  };

  const setPyAt = (idx: number, val: string) =>
    setStrataPy(prev => prev.map((v, k) => (k === idx ? val : v)));
  const setRateAt = (idx: number, val: string) =>
    setStrataRate(prev => prev.map((v, k) => (k === idx ? val : v)));

  const smrColor =
    result.smr > 1.1 ? "text-red-600" : result.smr < 0.9 ? "text-emerald-600" : "text-amber-600";
  const sigColor = result.significant ? "text-red-600" : "text-emerald-600";

  const chartData = [
    { name: "Observed", value: result.observed, color: "#2563EB" },
    { name: "Expected", value: result.expected, color: "#94A3B8" },
  ];

  const breakdown: Array<{ label: string; value: string; highlight?: boolean }> = [
    { label: "Observed Deaths", value: fmtInt(result.observed) },
    { label: "Expected Deaths", value: fmt(result.expected, 2) },
    { label: "Person-Years at Risk", value: fmtInt(result.totalPersonYears) },
    { label: "Observed Rate (per 100,000)", value: fmt(result.crudeRate, 1) },
    { label: "Expected Rate (per 100,000)", value: fmt(result.expectedRate, 1) },
    { label: "Standardized Mortality Ratio", value: fmt(result.smr, 3), highlight: true },
    { label: "SMR Indexed (100 = reference)", value: fmt(result.smrIndexed, 1) },
    { label: `Lower ${confidence}% Confidence Limit`, value: fmt(result.lowerCi, 3) },
    { label: `Upper ${confidence}% Confidence Limit`, value: fmt(result.upperCi, 3) },
    { label: "Test Statistic (z)", value: fmt(result.zScore, 3) },
    { label: "Two-Sided p-Value", value: fmtP(result.pValue) },
  ];

  if (useStrata) {
    DEFAULT_STRATA.forEach((s, idx) => {
      breakdown.push({
        label: `Expected — ${s.label}`,
        value: fmt(result.strataExpected[idx] ?? 0, 2),
      });
    });
  }

  const faqs = [
    { question: "What is a standardized mortality ratio?", answer: "The SMR is the number of deaths observed in a study population divided by the number that would have been expected if that population had experienced the same age-specific death rates as a chosen reference population. A value of 1.00 means the two match. Above 1.00 means more deaths than expected, below means fewer. It is conventionally multiplied by 100 and reported as an index, so 116 means 16% more deaths than expected." },
    { question: "How are expected deaths calculated?", answer: "Expected deaths come from indirect standardization: for each stratum, multiply the reference population's death rate by the person-years your population accumulated in that stratum, then sum across strata. If your cohort contributed 18,000 person-years in the 45-to-64 band and the reference rate there is 300 per 100,000, that band contributes 54 expected deaths. Summing every band gives the total expected count." },
    { question: "Why use person-years instead of headcount?", answer: "Cohort members enter and leave observation at different times through recruitment, loss to follow-up and death. Person-years credit each individual for exactly the time they were actually at risk, so someone followed for six months contributes 0.5 person-years. Using headcount instead would overstate exposure and depress the SMR whenever follow-up is incomplete." },
    { question: "What is Byar's approximation?", answer: "Observed death counts follow a Poisson distribution, so the confidence interval is not symmetric around the point estimate. Byar's method is a closed-form approximation to the exact Poisson limits that is accurate for counts above about five and is the standard used in occupational and public-health reporting. This calculator applies it to the observed count and divides by expected deaths, which is treated as fixed." },
    { question: "How do I read the confidence interval?", answer: "If the interval excludes 1.00, the difference from the reference population is statistically significant at your chosen level. An SMR of 1.16 with a 95% interval of 0.98 to 1.36 is not significant, because the population could plausibly be experiencing reference mortality. Narrow intervals require large observed counts; a study with twelve deaths will produce wide limits no matter how carefully it was conducted." },
    { question: "When should SMRs not be compared with each other?", answer: "Two SMRs standardized indirectly against the same reference are not strictly comparable to one another, because each is weighted by its own population's age structure. If cohort A is much younger than cohort B, their SMRs answer slightly different questions. For head-to-head comparison, use directly standardized rates against a common standard population instead." },
    { question: "What is the healthy worker effect?", answer: "Occupational cohorts frequently show SMRs below 1.00 for all causes simply because employment requires a baseline level of health that the general population, which includes the chronically ill and unemployable, does not meet. An SMR of 0.85 in a workforce study is therefore not evidence of a protective exposure. Cause-specific SMRs and internal comparison groups are the usual remedies." },
    { question: "Does a high SMR prove the exposure caused the deaths?", answer: "No. An elevated SMR establishes an association between membership in the study population and excess mortality. Confounding by smoking, socioeconomic status, migration and referral patterns can all produce the same signal. Causal inference requires consistency across studies, exposure-response gradients, biological plausibility and control of confounders that a ratio alone cannot supply." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Standardized Mortality Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Standardized Mortality Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="observed" label="Observed Deaths" value={observedDeaths} onChange={setObservedDeaths} tooltip="Deaths actually recorded in the study population during follow-up." />
              <InputField id="person-years" label="Person-Years at Risk" value={personYears} onChange={setPersonYears} tooltip="Total time all cohort members were under observation. Ignored when age stratification is enabled." disabled={useStrata} />
              <InputField id="ref-rate" label="Reference Rate (per 100,000)" value={referenceRate} onChange={setReferenceRate} tooltip="Mortality rate in the comparison population, per 100,000 person-years." disabled={useStrata} />
              <div>
                <label htmlFor="confidence" className="flex items-center text-sm font-medium text-foreground mb-1">Confidence Level</label>
                <select
                  id="confidence"
                  value={confidence}
                  onChange={e => setConfidence(e.target.value as ConfidenceLevel)}
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
              </div>
            </div>

            {hasValidationErrors && (
              <div className="text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {errorMsg}
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-primary font-medium hover:bg-secondary/30 transition-colors"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="px-3 pb-3 border-t border-border pt-3 flex flex-col gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Standardization Method</div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={useStrata}
                        onChange={e => setUseStrata(e.target.checked)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      Use age-stratified expected deaths
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      When enabled, expected deaths are summed across the four age bands below instead of using a single crude reference rate.
                    </p>
                  </div>
                  {DEFAULT_STRATA.map((s, idx) => (
                    <div key={s.label}>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Age Band — {s.label}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <InputField id={`py-${idx}`} label="Person-Years" value={strataPy[idx]} onChange={v => setPyAt(idx, v)} disabled={!useStrata} tooltip={`Person-years accumulated by cohort members aged ${s.label.toLowerCase()}.`} />
                        <InputField id={`rate-${idx}`} label="Rate / 100,000" value={strataRate[idx]} onChange={v => setRateAt(idx, v)} disabled={!useStrata} tooltip={`Reference mortality rate for the ${s.label.toLowerCase()} band.`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasValidationErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Standardized Mortality Ratio</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.smr, 2)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                indexed {fmt(result.smrIndexed, 0)} · {confidence}% CI {fmt(result.lowerCi, 2)} to {fmt(result.upperCi, 2)}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Excess Deaths</span>
                <span className={`font-extrabold ${result.excessDeaths > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {result.excessDeaths > 0 ? "+" : ""}{fmt(result.excessDeaths, 1)}
                </span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">p-Value</span>
                <span className={`font-extrabold ${sigColor}`}>{fmtP(result.pValue)}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Direction</span>
                <span className={`font-extrabold ${smrColor}`}>
                  {result.smr > 1.1 ? "Elevated" : result.smr < 0.9 ? "Reduced" : "Comparable"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map(row => (
                    <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Total Expected Deaths</td>
                    <td className="py-2.5 px-3 text-right text-foreground">{fmt(result.expected, 2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Observed vs Expected Deaths</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" width={45} />
                    <Tooltip formatter={(v: number) => [`${fmt(v, 1)} deaths`, "Count"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {chartData.map(d => {
                  const total = chartData[0].value + chartData[1].value;
                  const share = total > 0 ? (d.value / total) * 100 : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-1.5 text-[12px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="font-semibold text-muted-foreground">{d.name}</span>
                      <span className="font-bold text-foreground">{fmt(d.value, 1)} ({fmt(share, 1)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Observed Deaths</span>
                  <span className="font-bold text-foreground">{fmtInt(result.observed)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Expected Deaths</span>
                  <span className="font-bold text-foreground">{fmt(result.expected, 2)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Person-Years at Risk</span>
                  <span className="font-bold text-foreground">{fmtInt(result.totalPersonYears)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Observed Rate / 100k</span>
                  <span className="font-bold text-foreground">{fmt(result.crudeRate, 1)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Expected Rate / 100k</span>
                  <span className="font-bold text-foreground">{fmt(result.expectedRate, 1)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">SMR</span>
                  <span className={`font-bold ${smrColor}`}>{fmt(result.smr, 3)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">SMR Indexed</span>
                  <span className={`font-bold ${smrColor}`}>{fmt(result.smrIndexed, 1)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">{confidence}% Confidence Interval</span>
                  <span className="font-bold text-foreground">{fmt(result.lowerCi, 3)} – {fmt(result.upperCi, 3)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Test Statistic (z)</span>
                  <span className="font-bold text-foreground">{fmt(result.zScore, 3)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Two-Sided p-Value</span>
                  <span className={`font-bold ${sigColor}`}>{fmtP(result.pValue)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{result.interpretation}</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How the Standardized Mortality Ratio Works</h2>
            <p>The standardized mortality ratio answers a narrow but useful question: did this population experience more deaths than a reference population of the same age composition would have? It is the ratio of observed deaths to expected deaths, where expected deaths come from applying the reference population's stratum-specific rates to the person-years your cohort actually accumulated. This is indirect standardization. A ratio of 1.00 means the two populations match, and the figure is conventionally multiplied by 100 so that 116 reads as 16% excess mortality.</p>
            <h2 className="text-2xl font-bold mb-3">Why Person-Years Rather Than Headcount</h2>
            <p>Cohort members rarely contribute equal observation time. People are recruited on different dates, some are lost to follow-up, and some die partway through the study. Person-years credit each individual for exactly the interval they were at risk, so a participant followed for six months contributes half a person-year. Substituting headcount inflates exposure and systematically pulls the ratio downward whenever follow-up is incomplete, which is why the denominator is always expressed in person-time.</p>
            <h2 className="text-2xl font-bold mb-3">Confidence Limits and Significance</h2>
            <p>Death counts are Poisson-distributed, so the interval around an SMR is asymmetric — the upper limit sits further from the point estimate than the lower one, especially when counts are small. This calculator applies Byar's approximation to the exact Poisson limits on the observed count, then divides by expected deaths, which is treated as fixed because it derives from a large reference population. If the resulting interval excludes 1.00, the difference is significant at your chosen level. The accompanying z-statistic and two-sided p-value provide the same test in a different form. With fewer than about five observed deaths, treat all of these figures cautiously; the approximation degrades and the interval becomes very wide.</p>
            <h2 className="text-2xl font-bold mb-3">Age Stratification Changes the Answer</h2>
            <p>A single crude reference rate is only adequate when your population's age structure closely resembles the reference. Enabling age stratification computes expected deaths band by band and sums them, which is what standardization is actually for. The same 145 observed deaths can produce an SMR above or below 1.00 depending purely on whether the cohort's age distribution is accounted for, so the stratified figure should be preferred whenever band-level person-years are available.</p>
            <h2 className="text-2xl font-bold mb-3">Interpretation Cautions</h2>
            <p>Two SMRs standardized indirectly against the same reference are not strictly comparable with each other, because each is weighted by its own population's age structure; direct standardization against a common standard is the tool for that comparison. Occupational cohorts also routinely show all-cause SMRs below 1.00 through the healthy worker effect, since employment itself selects for baseline health. Finally, an elevated ratio establishes association, not causation — confounding by smoking, socioeconomic status and referral patterns can produce identical signals. This calculator is intended for epidemiological and educational analysis and is not a clinical or regulatory decision tool.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/standardized-mortality-ratio-calculator" />
          <PopularCalculators exclude="/calculator/standardized-mortality-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
