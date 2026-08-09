"use client";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

interface ActInputs {
  englishRaw: number;
  mathRaw: number;
  readingRaw: number;
  scienceRaw: number;
  targetComposite: number;
  writingScore: number;
}

interface SectionResult {
  name: string;
  raw: number;
  maxRaw: number;
  scaled: number;
}

interface ActResult {
  sections: SectionResult[];
  composite: number;
  percentile: number;
  stemScore: number;
  elaScore: number;
  strongest: SectionResult;
  weakest: SectionResult;
  pointsToTarget: number;
  rawPointsNeeded: number;
  band: string;
}

const MAX_RAW = { english: 75, math: 60, reading: 40, science: 40 } as const;

// Raw-to-scaled thresholds from a released ACT form. Each entry is the
// minimum raw score required to earn that scaled score, indexed 36 down to 1.
const ENGLISH_MIN: number[] = [74, 73, 71, 70, 69, 68, 67, 66, 64, 62, 60, 58, 56, 53, 51, 48, 45, 43, 40, 38, 35, 33, 30, 27, 25, 23, 20, 18, 16, 14, 11, 9, 7, 5, 3, 0];
const MATH_MIN: number[] = [59, 57, 56, 54, 52, 50, 48, 45, 43, 41, 39, 36, 34, 32, 30, 27, 24, 21, 18, 15, 12, 10, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1, 0];
const READING_MIN: number[] = [40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 28, 27, 25, 24, 22, 20, 18, 17, 16, 15, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0];
const SCIENCE_MIN: number[] = [40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 26, 24, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0];

// National percentile ranks by composite score, index 0 = composite 1.
const PERCENTILE_BY_COMPOSITE: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 4, 7, 12, 18, 25, 32, 38, 44, 50, 56, 62, 68, 73, 77, 81, 85, 88, 90, 93, 95, 97, 98, 99, 99, 100];

const DEFAULTS: ActInputs = {
  englishRaw: 65,
  mathRaw: 50,
  readingRaw: 35,
  scienceRaw: 35,
  targetComposite: 30,
  writingScore: 8,
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function rawToScaled(raw: number, thresholds: number[], maxRaw: number): number {
  const safeRaw = clamp(Math.round(raw), 0, maxRaw);
  for (let i = 0; i < thresholds.length; i++) {
    if (safeRaw >= thresholds[i]) return 36 - i;
  }
  return 1;
}

function scaledToRaw(targetScaled: number, thresholds: number[], maxRaw: number): number {
  const safeScaled = clamp(Math.round(targetScaled), 1, 36);
  return clamp(thresholds[36 - safeScaled], 0, maxRaw);
}

function bandFor(composite: number): string {
  if (composite >= 34) return "Elite";
  if (composite >= 30) return "Very Strong";
  if (composite >= 24) return "Competitive";
  if (composite >= 21) return "At or Above Average";
  return "Below Average";
}

function calculateAct(inputs: ActInputs): ActResult {
  const sections: SectionResult[] = [
    { name: "English", raw: clamp(Math.round(inputs.englishRaw), 0, MAX_RAW.english), maxRaw: MAX_RAW.english, scaled: rawToScaled(inputs.englishRaw, ENGLISH_MIN, MAX_RAW.english) },
    { name: "Math", raw: clamp(Math.round(inputs.mathRaw), 0, MAX_RAW.math), maxRaw: MAX_RAW.math, scaled: rawToScaled(inputs.mathRaw, MATH_MIN, MAX_RAW.math) },
    { name: "Reading", raw: clamp(Math.round(inputs.readingRaw), 0, MAX_RAW.reading), maxRaw: MAX_RAW.reading, scaled: rawToScaled(inputs.readingRaw, READING_MIN, MAX_RAW.reading) },
    { name: "Science", raw: clamp(Math.round(inputs.scienceRaw), 0, MAX_RAW.science), maxRaw: MAX_RAW.science, scaled: rawToScaled(inputs.scienceRaw, SCIENCE_MIN, MAX_RAW.science) },
  ];

  const composite = Math.round(sections.reduce((sum, s) => sum + s.scaled, 0) / sections.length);
  const percentile = PERCENTILE_BY_COMPOSITE[composite - 1] ?? 1;

  const writing = clamp(Math.round(inputs.writingScore), 2, 12);
  // Writing is reported on 2-12 while sections use 1-36, so it is placed on the
  // 1-36 range before averaging into ELA rather than dragging the mean down.
  const writingScaled = Math.round(((writing - 2) / 10) * 35 + 1);
  const stemScore = Math.round((sections[1].scaled + sections[3].scaled) / 2);
  const elaScore = Math.round((sections[0].scaled + sections[2].scaled + writingScaled) / 3);

  const ordered = [...sections].sort((a, b) => b.scaled - a.scaled);
  const target = clamp(Math.round(inputs.targetComposite), 1, 36);
  const pointsToTarget = Math.max(0, target - composite);

  const weakest = ordered[ordered.length - 1];
  const weakestThresholds = weakest.name === "English" ? ENGLISH_MIN : weakest.name === "Math" ? MATH_MIN : weakest.name === "Reading" ? READING_MIN : SCIENCE_MIN;
  const neededScaled = clamp(weakest.scaled + pointsToTarget * sections.length, 1, 36);
  const rawPointsNeeded = pointsToTarget === 0 ? 0 : Math.max(0, scaledToRaw(neededScaled, weakestThresholds, weakest.maxRaw) - weakest.raw);

  return {
    sections,
    composite,
    percentile,
    stemScore,
    elaScore,
    strongest: ordered[0],
    weakest,
    pointsToTarget,
    rawPointsNeeded,
    band: bandFor(composite),
  };
}
const faqs = [
  { question: "How is the ACT composite score calculated?", answer: "Each of the four sections is converted from a raw score (number of correct answers) to a scaled score of 1-36 using a conversion table specific to that test form. The composite is the average of those four scaled scores, rounded to the nearest whole number. A .5 average rounds up." },
  { question: "Why do raw-to-scaled conversions change between test dates?", answer: "ACT equates every form so that a given scaled score represents the same ability regardless of which test you took. If a form is slightly harder, the curve is slightly more forgiving. This calculator uses a published released-form table, so your actual result may differ by a point on a different form." },
  { question: "What are the STEM and ELA scores?", answer: "STEM is the rounded average of your Math and Science scaled scores. ELA is the rounded average of English, Reading, and Writing. Both are reported alongside the composite but neither affects it." },
  { question: "Does the Writing section affect my composite score?", answer: "No. Writing is scored 2-12 separately and only feeds the ELA score. Your composite is determined solely by English, Math, Reading, and Science." },
  { question: "What is a good ACT score?", answer: "The national average composite is about 20. A 24 or above puts you in the top quarter of test-takers, 30 or above is very strong, and 34-36 is elite territory at roughly the 99th percentile." },
];

const ACTScoreCalculator = () => {
  const [inputs, setInputs] = useState<ActInputs>(DEFAULTS);
  const [result, setResult] = useState<ActResult>(calculateAct(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calculateAct(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key: keyof ActInputs, raw: string) => {
    const parsed = raw === "" ? 0 : Number(raw);
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  const handleCalculate = () => setResult(calculateAct(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateAct(DEFAULTS));
  };

  const outOfRange =
    inputs.englishRaw < 0 || inputs.englishRaw > MAX_RAW.english ||
    inputs.mathRaw < 0 || inputs.mathRaw > MAX_RAW.math ||
    inputs.readingRaw < 0 || inputs.readingRaw > MAX_RAW.reading ||
    inputs.scienceRaw < 0 || inputs.scienceRaw > MAX_RAW.science;

  const chartData = result.sections.map((s) => ({ name: s.name.slice(0, 3), scaled: s.scaled }));
  const barColor = (scaled: number) => (scaled >= 30 ? "hsl(142 71% 45%)" : scaled >= 24 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)");

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Education", href: "/calculator/education" },
          { label: "ACT Score Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">ACT Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="act-english" className="block text-sm font-medium mb-1">English Raw (0-75)</label>
              <input id="act-english" type="number" min={0} max={MAX_RAW.english} value={inputs.englishRaw}
                onChange={(e) => update("englishRaw", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-base" />
            </div>
            <div>
              <label htmlFor="act-math" className="block text-sm font-medium mb-1">Math Raw (0-60)</label>
              <input id="act-math" type="number" min={0} max={MAX_RAW.math} value={inputs.mathRaw}
                onChange={(e) => update("mathRaw", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-base" />
            </div>
            <div>
              <label htmlFor="act-reading" className="block text-sm font-medium mb-1">Reading Raw (0-40)</label>
              <input id="act-reading" type="number" min={0} max={MAX_RAW.reading} value={inputs.readingRaw}
                onChange={(e) => update("readingRaw", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-base" />
            </div>
            <div>
              <label htmlFor="act-science" className="block text-sm font-medium mb-1">Science Raw (0-40)</label>
              <input id="act-science" type="number" min={0} max={MAX_RAW.science} value={inputs.scienceRaw}
                onChange={(e) => update("scienceRaw", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-base" />
            </div>
          </div>

          {outOfRange && (
            <p className="mt-3 text-sm text-red-600">Raw scores must fall within each section&apos;s valid range.</p>
          )}

          <button type="button" onClick={() => setShowAdvanced((v) => !v)}
            className="mt-4 flex items-center gap-1 text-sm text-primary font-medium">
            Advanced Options <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </button>

          {showAdvanced && (
            <div className="mt-3 rounded-md border border-input p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Score Goals</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="act-target" className="block text-sm font-medium mb-1">Target Composite</label>
                  <input id="act-target" type="number" min={1} max={36} value={inputs.targetComposite}
                    onChange={(e) => update("targetComposite", e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-base" />
                </div>
                <div>
                  <label htmlFor="act-writing" className="block text-sm font-medium mb-1">Writing Score (2-12)</label>
                  <input id="act-writing" type="number" min={2} max={12} value={inputs.writingScore}
                    onChange={(e) => update("writingScore", e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-base" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button type="button" onClick={handleCalculate} disabled={outOfRange}
              className="h-10 w-full rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50">
              Calculate
            </button>
            <button type="button" onClick={handleReset} aria-label="Reset to defaults"
              className="h-10 w-10 shrink-0 rounded-md border border-input flex items-center justify-center">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="relative bg-primary/10 border-l-4 border-primary rounded-lg p-5">
            <button type="button" onClick={() => window.print()} aria-label="Print results"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <Printer className="h-4 w-4" />
            </button>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Composite Score</p>
            <p className="text-4xl font-bold text-primary">{result.composite}</p>
            <p className="text-sm text-muted-foreground">
              {result.band} &middot; {result.percentile}th percentile nationally
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-input bg-background">
            <div className="p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">STEM</p>
              <p className="text-xl font-bold">{result.stemScore}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">ELA</p>
              <p className="text-xl font-bold">{result.elaScore}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">To Target</p>
              <p className={`text-xl font-bold ${result.pointsToTarget === 0 ? "text-green-600" : result.pointsToTarget <= 3 ? "text-orange-500" : "text-red-600"}`}>
                {result.pointsToTarget === 0 ? "Met" : `+${result.pointsToTarget}`}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-input bg-background overflow-hidden">
            <table className="w-full text-base">
              <thead className="bg-muted/30">
                <tr>
                  <th scope="col" className="text-left py-2.5 px-3 font-medium">Section</th>
                  <th scope="col" className="text-right py-2.5 px-3 font-medium">Raw</th>
                  <th scope="col" className="text-right py-2.5 px-3 font-medium">Max</th>
                  <th scope="col" className="text-right py-2.5 px-3 font-medium">Scaled</th>
                </tr>
              </thead>
              <tbody>
                {result.sections.map((s) => (
                  <tr key={s.name} className={`border-t border-border ${s.name === result.weakest.name ? "bg-primary/10" : ""}`}>
                    <td className="py-2.5 px-3">{s.name}</td>
                    <td className="py-2.5 px-3 text-right">{s.raw}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{s.maxRaw}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{s.scaled}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2.5 px-3">Composite</td>
                  <td className="py-2.5 px-3 text-right">&mdash;</td>
                  <td className="py-2.5 px-3 text-right">36</td>
                  <td className="py-2.5 px-3 text-right">{result.composite}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-input bg-background p-4">
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 36]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value}`, "Scaled score"]} />
                  <ReferenceLine y={result.composite} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
                  <Bar dataKey="scaled" radius={[4, 4, 0, 0]}>
                    {chartData.map((d) => (
                      <Cell key={d.name} fill={barColor(d.scaled)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Section scaled scores; dashed line marks the composite of {result.composite}
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Summary Statistics</p>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Composite Score</dt>
              <dd className="text-right font-medium">{result.composite} / 36</dd>
              <dt className="text-muted-foreground">National Percentile</dt>
              <dd className="text-right font-medium">{result.percentile}th</dd>
              <dt className="text-muted-foreground">Score Band</dt>
              <dd className="text-right font-medium">{result.band}</dd>
              <dt className="text-muted-foreground">STEM Score</dt>
              <dd className="text-right font-medium">{result.stemScore}</dd>
              <dt className="text-muted-foreground">ELA Score</dt>
              <dd className="text-right font-medium">{result.elaScore}</dd>
              <dt className="text-muted-foreground">Strongest Section</dt>
              <dd className="text-right font-medium">{result.strongest.name} ({result.strongest.scaled})</dd>
              <dt className="text-muted-foreground">Weakest Section</dt>
              <dd className="text-right font-medium">{result.weakest.name} ({result.weakest.scaled})</dd>
              <dt className="text-muted-foreground">Target Composite</dt>
              <dd className="text-right font-medium">{clamp(Math.round(inputs.targetComposite), 1, 36)}</dd>
              <dt className="text-muted-foreground">Points to Target</dt>
              <dd className="text-right font-medium">{result.pointsToTarget === 0 ? "Target met" : `+${result.pointsToTarget}`}</dd>
              <dt className="text-muted-foreground">Extra Raw Points Needed</dt>
              <dd className="text-right font-medium">
                {result.pointsToTarget === 0 ? "None" : `${result.rawPointsNeeded} in ${result.weakest.name}`}
              </dd>
            </dl>
          </div>
          </div>
        </div>

        <AdPlaceholder className="mb-10" />
        <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/act-score-calculator" />
        <PopularCalculators exclude="/calculator/act-score-calculator" />
      </div>
    </>
  );
};

export default ACTScoreCalculator;
