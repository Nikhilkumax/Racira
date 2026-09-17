"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type UnitSystem = "lbs" | "kg";
type FeedingStatus = "none" | "mixed" | "exclusive";
type BmiCategory = "underweight" | "normal" | "overweight" | "obese";

interface PostpartumInputs {
  prePregnancyLbs: number;
  currentLbs: number;
  goalLbs: number;
  weeksPostpartum: number;
  // Tier 2A
  rateLbsPerWeek: number;
  feeding: FeedingStatus;
  // Tier 2B
  proMode: boolean;
  bmiCategory: BmiCategory;
  pregnancyGainLbs: number;
}

interface ChartPoint {
  week: number;
  planned: number;
  slow: number;
  fast: number;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface PostpartumResult {
  remainingLbs: number;
  weeksToGoal: number;
  slowWeeksToGoal: number;
  fastWeeksToGoal: number;
  reached: boolean;
  weightAt3Months: number;
  weightAt6Months: number;
  weightAt12Months: number;
  chartData: ChartPoint[];
  phaseNote: string;
  feedingNote: string;
  // Tier 2B
  gainRange: [number, number] | null;
  gainStatus: "below" | "within" | "above" | null;
  gainRemainingLbs: number | null;
  gainLostSoFarLbs: number | null;
  abovePrePregnancy: boolean;
}

const LB_TO_KG = 0.45359237;

// IOM gestational weight-gain recommendations by pre-pregnancy BMI (lb)
const IOM_RANGES: Record<BmiCategory, [number, number]> = {
  underweight: [28, 40],
  normal: [25, 35],
  overweight: [15, 25],
  obese: [11, 20],
};

const BMI_LABELS: Record<BmiCategory, string> = {
  underweight: "Underweight (BMI < 18.5)",
  normal: "Normal (BMI 18.5–24.9)",
  overweight: "Overweight (BMI 25–29.9)",
  obese: "Obese (BMI ≥ 30)",
};

const FEEDING_LABELS: Record<FeedingStatus, string> = {
  none: "Not breastfeeding",
  mixed: "Mixed / partial breastfeeding",
  exclusive: "Exclusively breastfeeding",
};

const calculatePostpartum = (inputs: PostpartumInputs): PostpartumResult => {
  const {
    prePregnancyLbs, currentLbs, goalLbs, weeksPostpartum, rateLbsPerWeek,
    feeding, proMode, bmiCategory, pregnancyGainLbs,
  } = inputs;

  const current = Math.max(0, currentLbs);
  const goal = Math.max(0, goalLbs);
  const rate = Math.max(0.1, rateLbsPerWeek);
  const remaining = Math.max(0, current - goal);
  const reached = remaining === 0;

  // Three paces: the evidence-based floor and ceiling around the chosen plan
  const weeksToGoal = reached ? 0 : Math.ceil(remaining / rate);
  const slowWeeksToGoal = reached ? 0 : Math.ceil(remaining / 0.5);
  const fastWeeksToGoal = reached ? 0 : Math.ceil(remaining / 1.5);

  const project = (week: number) => Math.max(goal, current - rate * week);

  const chartData: ChartPoint[] = [];
  for (let w = 0; w <= 52; w++) {
    chartData.push({
      week: w,
      planned: Math.round(project(w) * 10) / 10,
      slow: Math.round(Math.max(goal, current - 0.5 * w) * 10) / 10,
      fast: Math.round(Math.max(goal, current - 1.5 * w) * 10) / 10,
    });
  }

  const weightAt3Months = Math.round(project(12) * 10) / 10;
  const weightAt6Months = Math.round(project(26) * 10) / 10;
  const weightAt12Months = Math.round(project(52) * 10) / 10;

  const phaseNote =
    weeksPostpartum <= 2
      ? "You are still inside the first two weeks, when most of the scale movement is retained fluid rather than fat. Expect a faster-than-planned drop right now; the projection becomes accurate once that fluid loss settles."
      : weeksPostpartum < 26
        ? "You are in the gradual fat-loss phase. The plan assumes a steady weekly pace from today, which is the realistic part of the curve — early fluid loss is behind you and the natural plateau usually arrives around six months."
        : "You are past the six-month mark, where weight naturally plateaus for many women. If the scale has stopped moving, the causes are usually a return to full food intake, reduced breastfeeding energy cost, or disrupted sleep — not a failure of effort.";

  const feedingNote =
    feeding === "exclusive"
      ? "Exclusively breastfeeding burns roughly 500 kcal per day, and many mothers lose one to two pounds per month without actively dieting. Because hunger tends to rise to match, an aggressive deficit is not needed — and rates much above 1.5 lb per week are not advised while milk supply is being established."
      : feeding === "mixed"
        ? "Partial breastfeeding still adds a meaningful energy cost, but less predictably than exclusive feeding, so plan on the safe end of the range and let the scale set the pace."
        : "Without breastfeeding, there is no metabolic cushion from milk production, so the pace you set is entirely the result of diet and activity.";

  // Tier 2B — how much of the pregnancy gain is still on, and was the gain in range?
  const useIom = proMode;
  const gainRange = useIom ? IOM_RANGES[bmiCategory] : null;
  let gainStatus: PostpartumResult["gainStatus"] = null;
  if (useIom && pregnancyGainLbs >= 0) {
    if (pregnancyGainLbs < gainRange![0]) gainStatus = "below";
    else if (pregnancyGainLbs > gainRange![1]) gainStatus = "above";
    else gainStatus = "within";
  }
  const projectedTotal = prePregnancyLbs + Math.max(0, pregnancyGainLbs);
  const gainRemainingLbs = useIom ? Math.max(0, projectedTotal - current) : null;
  const gainLostSoFarLbs = useIom
    ? Math.max(0, Math.max(0, pregnancyGainLbs) - (gainRemainingLbs ?? 0))
    : null;
  const abovePrePregnancy = useIom && current > prePregnancyLbs;

  return {
    remainingLbs: Math.round(remaining * 10) / 10,
    weeksToGoal, slowWeeksToGoal, fastWeeksToGoal, reached,
    weightAt3Months, weightAt6Months, weightAt12Months,
    chartData, phaseNote, feedingNote,
    gainRange, gainStatus, gainRemainingLbs, gainLostSoFarLbs, abovePrePregnancy,
  };
};

const DEFAULTS: PostpartumInputs = {
  prePregnancyLbs: 155,
  currentLbs: 180,
  goalLbs: 150,
  weeksPostpartum: 12,
  rateLbsPerWeek: 1,
  feeding: "exclusive",
  proMode: false,
  bmiCategory: "normal",
  pregnancyGainLbs: 30,
};

const FAQS = [
  {
    question: "How much weight is lost immediately after giving birth?",
    answer:
      "Most women lose somewhere between 11 and 13 pounds in the first day or two. That figure is simply the sum of the baby (typically 7 to 8 pounds), the placenta (about 1.5 pounds), and amniotic fluid (roughly 2 pounds). Over the following one to two weeks, a further 5 to 10 pounds of retained fluid is shed through increased urination and sweating as blood volume returns to normal. None of that early drop is fat loss, which is why this calculator projects forward from your current weight rather than trying to model the first fortnight.",
  },
  {
    question: "What is a safe rate of postpartum weight loss?",
    answer:
      "About one pound per week is the widely used target, with roughly 0.5 to 1.5 pounds per week as the sensible band. This calculator shows all three paces so you can see how much difference they actually make to the timeline. Losing faster than about 1.5 pounds per week is not recommended in the postpartum period: it tends to require a deficit deep enough to compromise nutrient intake at a time when recovery and, for many, milk production are both drawing on your reserves. Slower is genuinely fine — the destination matters more than the pace.",
  },
  {
    question: "When can I start trying to lose weight after birth?",
    answer:
      "Most guidance suggests waiting until roughly six weeks postpartum, and until after your postnatal check, before actively pursuing weight loss. Before that point your body is repairing tissue, replacing blood volume, and — if you are breastfeeding — establishing supply. Gentle walking usually starts much earlier, often within days for an uncomplicated vaginal birth. After a caesarean or a complicated delivery, the timeline is longer and is a question for your own clinician rather than a calculator.",
  },
  {
    question: "Does breastfeeding actually help with weight loss?",
    answer:
      "It helps, but less dramatically than is often claimed. Exclusive breastfeeding costs roughly 500 calories a day, and studies generally find breastfeeding mothers lose about one to two extra pounds per month compared with those who are not. The reason the effect looks small is that appetite rises to meet the demand, so much of that energy cost is offset by eating more. Breastfeeding is worth doing for many reasons; treating it as a weight-loss strategy tends to disappoint.",
  },
  {
    question: "Why has my weight loss stalled at six months?",
    answer:
      "A plateau around the six-month mark is the norm, not a personal failure. Several things converge: solid foods reduce milk volume and therefore the energy cost of feeding, appetite and eating patterns return to pre-pregnancy levels, cumulative sleep deprivation raises appetite hormones and lowers spontaneous activity, and by this point the easy fluid and early fat loss are long gone. If you want to keep moving, the effective levers are protein intake, resistance training to preserve lean mass, and whatever sleep you can protect — not a deeper calorie cut.",
  },
  {
    question: "How much weight should I have gained during pregnancy?",
    answer:
      "The Institute of Medicine ranges depend on your pre-pregnancy BMI: 28 to 40 pounds if you were underweight, 25 to 35 pounds at a normal BMI, 15 to 25 pounds if overweight, and 11 to 20 pounds if obese. Gaining above your range is the strongest single predictor of retaining weight at one year postpartum, which is why Professional Mode checks your total gain against the range for your category. Gaining below the range is also associated with risks during pregnancy, so neither end is a target to aim past.",
  },
  {
    question: "Is it realistic to return to my exact pre-pregnancy weight?",
    answer:
      "For many women, yes, though it commonly takes six to twelve months rather than the few weeks that media coverage implies. Research consistently finds that a substantial minority of women retain some weight at one year. Body composition also shifts: it is entirely possible to be at your pre-pregnancy weight while your clothes fit differently, because muscle and fat distribution have changed. Setting a goal based on how you feel and function, rather than on a specific number from a previous year, tends to produce better outcomes.",
  },
  {
    question: "Should I be dieting while breastfeeding?",
    answer:
      "A moderate deficit is generally considered compatible with breastfeeding once supply is well established, usually after the first six to eight weeks. Very low calorie intakes are a different matter and can affect both supply and the mother's own nutrient status. The practical approach most clinicians suggest is to aim at the gentle end of the range, keep protein and fluid intake up, and treat any noticeable drop in supply as a signal to eat more rather than to push harder. Discuss any structured plan with your healthcare provider first.",
  },
];

const PostpartumWeightLossCalculator = () => {
  const [inputs, setInputs] = useState<PostpartumInputs>(DEFAULTS);
  const [result, setResult] = useState<PostpartumResult>(calculatePostpartum(DEFAULTS));
  const [units, setUnits] = useState<UnitSystem>("lbs");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculatePostpartum(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof PostpartumInputs>(key: K, val: PostpartumInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResult(calculatePostpartum(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculatePostpartum(DEFAULTS));
    setUnits("lbs");
    setShowAdvanced(false);
  };

  // All internal maths stays in pounds; conversion happens only at the display edge
  const toDisplay = (lbs: number) => (units === "kg" ? lbs * LB_TO_KG : lbs);
  const fromDisplay = (v: number) => (units === "kg" ? v / LB_TO_KG : v);
  const u = units === "kg" ? "kg" : "lbs";
  const fmt = (lbs: number, d = 1) =>
    toDisplay(lbs).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

  const weeksLabel = (w: number) =>
    w === 0 ? "goal already reached" : `${w} week${w === 1 ? "" : "s"} (${(w / 4.345).toFixed(1)} months)`;

  const tableRows: TableRow[] = [
    { rowId: "current", label: "Current weight", value: `${fmt(inputs.currentLbs)} ${u}` },
    { rowId: "goal", label: "Goal weight", value: `${fmt(inputs.goalLbs)} ${u}` },
    { rowId: "remaining", label: "Still to lose", value: `${fmt(result.remainingLbs)} ${u}`, key: true },
    { rowId: "rate", label: "Planned pace", value: `${fmt(inputs.rateLbsPerWeek, 2)} ${u} / week` },
    { rowId: "weeks", label: "Time to goal at planned pace", value: weeksLabel(result.weeksToGoal) },
    { rowId: "slow", label: "At the gentle pace (0.5 lb/wk)", value: weeksLabel(result.slowWeeksToGoal) },
    { rowId: "fast", label: "At the upper safe pace (1.5 lb/wk)", value: weeksLabel(result.fastWeeksToGoal) },
    { rowId: "m3", label: "Projected weight in 3 months", value: `${fmt(result.weightAt3Months)} ${u}` },
    { rowId: "m6", label: "Projected weight in 6 months", value: `${fmt(result.weightAt6Months)} ${u}` },
    { rowId: "m12", label: "Projected weight in 12 months", value: `${fmt(result.weightAt12Months)} ${u}` },
    { rowId: "weeksPp", label: "Weeks postpartum today", value: `${inputs.weeksPostpartum}` },
    {
      rowId: "target",
      label: "Target date",
      value: result.reached ? "Goal reached" : `about ${(inputs.weeksPostpartum + result.weeksToGoal / 4.345).toFixed(0)} months postpartum`,
      total: true,
    },
  ];

  const wrap =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel =
    "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium text-foreground mb-1";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Postpartum Weight Loss Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Postpartum Weight Loss Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex flex-col">
              <label className={lbl}>Current Weight</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={Number(toDisplay(inputs.currentLbs).toFixed(1))}
                  onChange={(e) => set("currentLbs", fromDisplay(parseFloat(e.target.value) || 0))}
                  className={ci}
                  min={0}
                  step={0.5}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">{u}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Goal Weight</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={Number(toDisplay(inputs.goalLbs).toFixed(1))}
                  onChange={(e) => set("goalLbs", fromDisplay(parseFloat(e.target.value) || 0))}
                  className={ci}
                  min={0}
                  step={0.5}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">{u}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Pre-Pregnancy Weight</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={Number(toDisplay(inputs.prePregnancyLbs).toFixed(1))}
                  onChange={(e) => set("prePregnancyLbs", fromDisplay(parseFloat(e.target.value) || 0))}
                  className={ci}
                  min={0}
                  step={0.5}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">{u}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Used as a reference line on the chart. Your goal does not have to match it.
              </p>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Weeks Postpartum</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.weeksPostpartum}
                  onChange={(e) => set("weeksPostpartum", parseInt(e.target.value, 10) || 0)}
                  className={ci}
                  min={0}
                  step={1}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">weeks</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-sm font-semibold text-primary hover:underline text-left mt-1"
            >
              {showAdvanced ? "− Hide" : "+ Show"} Advanced Options
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Display &amp; Pace</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className={lbl}>Units</label>
                      <select value={units} onChange={(e) => setUnits(e.target.value as UnitSystem)} className={sel}>
                        <option value="lbs">Pounds (lbs)</option>
                        <option value="kg">Kilograms (kg)</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className={lbl}>Weekly Pace</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={Number(toDisplay(inputs.rateLbsPerWeek).toFixed(2))}
                          onChange={(e) => set("rateLbsPerWeek", fromDisplay(parseFloat(e.target.value) || 0))}
                          className={ci}
                          min={0.1}
                          step={0.1}
                        />
                        <span className="pr-3 text-sm text-muted-foreground select-none">{u}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    0.5 to 1.5 lb per week is the accepted safe band. Values above that are not recommended postpartum.
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Feeding</div>
                  <div className="flex flex-col">
                    <label className={lbl}>Breastfeeding Status</label>
                    <select
                      value={inputs.feeding}
                      onChange={(e) => set("feeding", e.target.value as FeedingStatus)}
                      className={sel}
                    >
                      {(Object.keys(FEEDING_LABELS) as FeedingStatus[]).map((k) => (
                        <option key={k} value={k}>
                          {FEEDING_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => set("proMode", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-semibold text-foreground">Professional Mode</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Adds an Institute of Medicine gestational weight-gain review against your pre-pregnancy BMI category.
                  </p>
                  {inputs.proMode && (
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex flex-col">
                        <label className={lbl}>Pre-Pregnancy BMI Category</label>
                        <select
                          value={inputs.bmiCategory}
                          onChange={(e) => set("bmiCategory", e.target.value as BmiCategory)}
                          className={sel}
                        >
                          {(Object.keys(BMI_LABELS) as BmiCategory[]).map((k) => (
                            <option key={k} value={k}>
                              {BMI_LABELS[k]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className={lbl}>Total Pregnancy Weight Gain</label>
                        <div className={wrap}>
                          <input
                            type="number"
                            value={Number(toDisplay(inputs.pregnancyGainLbs).toFixed(1))}
                            onChange={(e) => set("pregnancyGainLbs", fromDisplay(parseFloat(e.target.value) || 0))}
                            className={ci}
                            min={0}
                            step={0.5}
                          />
                          <span className="pr-3 text-sm text-muted-foreground select-none">{u}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-base"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. Primary */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-sm font-bold uppercase tracking-wider text-primary mb-1">
                {result.reached ? "Goal Weight Reached" : "Time to Reach Your Goal"}
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-primary tracking-tight">
                  {result.reached ? "0" : result.weeksToGoal}
                </div>
                <div className="text-lg font-semibold text-muted-foreground">
                  {result.reached ? "weeks remaining" : `weeks (${(result.weeksToGoal / 4.345).toFixed(1)} months)`}
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-2">
                {fmt(result.remainingLbs)} {u} still to lose at {fmt(inputs.rateLbsPerWeek, 2)} {u} per week &middot; landing around{" "}
                {(inputs.weeksPostpartum + result.weeksToGoal / 4.345).toFixed(0)} months postpartum
              </div>
            </div>

            {/* 2. Three-stat bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Gentle (0.5/wk)</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(142 71% 45%)" }}>{result.slowWeeksToGoal} wk</div>
                <div className="text-xs text-muted-foreground mt-0.5">safest pace</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Your Plan</div>
                <div
                  className="text-2xl font-bold"
                  style={{
                    color:
                      inputs.rateLbsPerWeek <= 1
                        ? "hsl(142 71% 45%)"
                        : inputs.rateLbsPerWeek <= 1.5
                        ? "hsl(25 95% 53%)"
                        : "hsl(0 84% 60%)",
                  }}
                >
                  {result.weeksToGoal} wk
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {inputs.rateLbsPerWeek <= 1.5 ? "within safe band" : "above safe band"}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Upper (1.5/wk)</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>{result.fastWeeksToGoal} wk</div>
                <div className="text-xs text-muted-foreground mt-0.5">fastest advised</div>
              </div>
            </div>

            {/* 3. Breakdown table */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-3">Weight Loss Plan</h3>
              <table className="w-full text-base border-collapse">
                <tbody>
                  {tableRows.map((r) => (
                    <tr
                      key={r.rowId}
                      className={`border-b border-border/60 last:border-0 ${r.key ? "bg-primary/10" : ""} ${r.total ? "border-t-2 border-t-border font-bold" : ""}`}
                    >
                      <td className={`py-2.5 px-3 ${r.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right tabular-nums ${r.key ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Chart */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-1">Projected Progress Over 12 Months</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Your planned pace against the gentle and upper ends of the safe band. The dashed line is your pre-pregnancy weight.
              </p>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={result.chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 65% / 0.25)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="hsl(215 16% 65%)"
                        width={52}
                        domain={["dataMin - 5", "dataMax + 5"]}
                        tickFormatter={(v: number) => toDisplay(v).toFixed(0)}
                      />
                      <RTooltip
                        formatter={(v: number, name: string) => [`${fmt(v)} ${u}`, name]}
                        labelFormatter={(l: number) => `Week ${l}`}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <ReferenceLine
                        y={inputs.prePregnancyLbs}
                        stroke="hsl(215 16% 65%)"
                        strokeDasharray="4 4"
                        label={{ value: "pre-pregnancy", fontSize: 10, position: "insideTopRight" }}
                      />
                      <Line type="monotone" dataKey="slow" name="Gentle 0.5/wk" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                      <Line type="monotone" dataKey="planned" name="Your plan" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="fast" name="Upper 1.5/wk" stroke="hsl(25 95% 53%)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            {/* Pro mode — IOM gestational gain review */}
            {inputs.proMode && result.gainRange && (
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Gestational Weight Gain Review</h3>
                <table className="w-full text-base border-collapse">
                  <tbody>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">Pre-pregnancy category</td>
                      <td className="py-2.5 px-3 text-right text-foreground">{BMI_LABELS[inputs.bmiCategory]}</td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">IOM recommended gain</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-foreground">
                        {fmt(result.gainRange[0], 0)}–{fmt(result.gainRange[1], 0)} {u}
                      </td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">Your total gain</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-foreground">{fmt(inputs.pregnancyGainLbs)} {u}</td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">Of that gain, lost so far</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-foreground">{fmt(result.gainLostSoFarLbs ?? 0)} {u}</td>
                    </tr>
                    <tr className="border-t-2 border-t-border font-bold">
                      <td className="py-2.5 px-3 text-foreground">Still above pre-pregnancy weight by</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-primary">
                        {fmt(Math.max(0, inputs.currentLbs - inputs.prePregnancyLbs))} {u}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div
                  className="mt-4 rounded-lg p-3 border"
                  style={{
                    borderColor:
                      result.gainStatus === "within" ? "hsl(142 71% 45%)" : result.gainStatus === "above" ? "hsl(25 95% 53%)" : "hsl(217 91% 60%)",
                    backgroundColor:
                      result.gainStatus === "within"
                        ? "hsl(142 71% 45% / 0.1)"
                        : result.gainStatus === "above"
                        ? "hsl(25 95% 53% / 0.1)"
                        : "hsl(217 91% 60% / 0.1)",
                  }}
                >
                  <div className="text-sm text-muted-foreground">
                    {result.gainStatus === "within" &&
                      "Your pregnancy gain fell inside the Institute of Medicine range for your category, which is the single best predictor of returning to pre-pregnancy weight within a year."}
                    {result.gainStatus === "above" &&
                      "Your gain was above the Institute of Medicine range for your category. Gaining above range is associated with retaining more weight at one year, so a slower, sustainable pace over a longer horizon tends to work better than a steep deficit."}
                    {result.gainStatus === "below" &&
                      "Your gain was below the Institute of Medicine range for your category. Under-gaining carries its own considerations during pregnancy and can mean fewer reserves postpartum — worth raising with your provider before pursuing further loss."}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Summary statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {tableRows.map((r) => (
                  <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className={`tabular-nums text-right ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">{result.phaseNote}</p>
              <p className="text-xs text-muted-foreground mt-2">{result.feedingNote}</p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong className="text-foreground">This is an educational planning tool, not medical advice.</strong> Postpartum
                recovery varies enormously between individuals and between births. Speak to your midwife, GP, or obstetric provider
                before starting any weight-loss plan, particularly after a caesarean or a complicated delivery.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Three Phases of Postpartum Weight Change</h2>
            <p>
              Postpartum weight loss is not one process but three, and they behave so differently that treating them as a single
              trend is the fastest route to disappointment. Understanding which phase you are in tells you what the scale is
              actually measuring.
            </p>
            <p>
              The <strong>first phase</strong> is delivery itself. Between the baby, the placenta, and amniotic fluid, most women
              are 11 to 13 pounds lighter within a day. The <strong>second phase</strong> covers the following one to two weeks, as
              the extra blood volume and interstitial fluid that pregnancy required are shed through urination and sweating —
              typically another 5 to 10 pounds. Neither of these is fat loss, and neither responds to diet or exercise. The{" "}
              <strong>third phase</strong> is the gradual reduction of the fat stores laid down during pregnancy, and it is the
              only phase this calculator projects. That is deliberate: modelling a steady weekly rate through the fluid-loss weeks
              would produce a number that looks precise and is meaningless.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why One Pound a Week Is the Standard Recommendation</h2>
            <p>
              The commonly cited safe range for postpartum loss is roughly 0.5 to 1.5 pounds per week, with about one pound as the
              usual target. The upper bound is not arbitrary. Losing faster than that requires a deficit deep enough that
              micronutrient intake usually suffers, and the postpartum period is a bad time for that: tissue is still repairing,
              iron stores are often depleted from delivery, and for breastfeeding mothers, milk production is drawing several
              hundred calories a day on top of everything else.
            </p>
            <p>
              This calculator deliberately shows three timelines rather than one. Comparing them is instructive: the difference
              between the gentle and the aggressive pace is usually a couple of months, not a couple of years. Once you see that
              a 30-pound goal takes about 60 weeks at the gentle pace and about 20 weeks at the upper pace, the trade-off becomes
              a real decision rather than an abstract preference — and for many people, the gentler option becomes easier to
              justify.
            </p>

            <h2 className="text-2xl font-bold mb-3">Breastfeeding, Energy Cost, and Realistic Expectations</h2>
            <p>
              Exclusive breastfeeding costs the body roughly 500 calories a day, which sounds like it should produce dramatic
              weight loss. In practice, the research finds breastfeeding mothers lose about one to two extra pounds per month
              compared with those who are not breastfeeding — real, but modest. The gap between the theoretical energy cost and the
              observed result is explained almost entirely by appetite: hunger rises to meet the demand, and most people eat more
              without consciously deciding to.
            </p>
            <p>
              There is also a timing effect. As solid foods are introduced around six months, milk volume falls and the energy
              cost falls with it, which is one of several reasons the six-month plateau is so consistently reported. Sleep
              deprivation compounds this: chronic short sleep raises ghrelin, lowers leptin, and reduces spontaneous physical
              activity, all of which push in the wrong direction at exactly the point when the metabolic assistance from feeding
              is fading.
            </p>

            <h2 className="text-2xl font-bold mb-3">What Gestational Weight Gain Predicts</h2>
            <p>
              The strongest single predictor of postpartum weight retention is how much weight was gained during pregnancy
              relative to the Institute of Medicine range for the pre-pregnancy BMI category. Those ranges are 28 to 40 pounds for
              underweight, 25 to 35 for normal weight, 15 to 25 for overweight, and 11 to 20 for obesity. Women who gain within
              their range are substantially more likely to be at or near their pre-pregnancy weight at one year.
            </p>
            <p>
              This matters for goal-setting rather than for blame. If your gain exceeded the range, a twelve-month horizon is more
              realistic than a six-month one, and a gentle sustained pace will outperform a steep deficit that cannot survive the
              first bad night of sleep. Professional Mode in this calculator performs that comparison and reports how much of the
              pregnancy gain remains, which is often a more encouraging figure than the raw distance to a goal weight. And it is
              worth repeating what the research also shows: a meaningful proportion of women retain some weight at one year, body
              composition shifts even at identical weight, and neither of those facts is a personal failing.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/postpartum-weight-loss-calculator" />
          <PopularCalculators exclude="/calculator/postpartum-weight-loss-calculator" />
        </div>
      </div>
    </>
  );
};

export default PostpartumWeightLossCalculator;
