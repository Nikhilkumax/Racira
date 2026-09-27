"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type SystemKey = "f1" | "motogp" | "wsbk" | "indycar" | "nascar" | "custom";

interface PointsSystem {
  key: SystemKey;
  label: string;
  table: number[] | null;
}

/** Points by finishing position, positions 1 to 10. */
const SYSTEMS: PointsSystem[] = [
  { key: "f1", label: "Formula 1 style — 25-18-15-12…", table: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  { key: "motogp", label: "MotoGP style — 25-20-16-13…", table: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6] },
  { key: "wsbk", label: "World Superbike style", table: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6] },
  { key: "indycar", label: "IndyCar style — 50-40-35-32…", table: [50, 40, 35, 32, 30, 28, 26, 24, 22, 20] },
  { key: "nascar", label: "NASCAR style — 40-35-34-33…", table: [40, 35, 34, 33, 32, 31, 30, 29, 28, 27] },
  { key: "custom", label: "Custom linear scale", table: null },
];

interface ChampInputs {
  system: SystemKey;
  wins: number;
  seconds: number;
  thirds: number;
  rounds: number;
  fourthToSixth: number;
  seventhToTenth: number;
  nonScoring: number;
  fastestLaps: number;
  fastestLapPoints: number;
  poles: number;
  polePoints: number;
  sprintWins: number;
  sprintPoints: number;
  dropRounds: number;
  customP1: number;
  customP10: number;
  decimals: number;
}

const DEFAULTS: ChampInputs = {
  system: "f1",
  wins: 3,
  seconds: 4,
  thirds: 3,
  rounds: 20,
  fourthToSixth: 5,
  seventhToTenth: 3,
  nonScoring: 2,
  fastestLaps: 2,
  fastestLapPoints: 1,
  poles: 1,
  polePoints: 0,
  sprintWins: 0,
  sprintPoints: 0,
  dropRounds: 0,
  customP1: 25,
  customP10: 1,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ChampResult {
  valid: boolean;
  errorMsg: string;
  table: number[];
  pointsFromWins: number;
  pointsFromSeconds: number;
  pointsFromThirds: number;
  midBandAverage: number;
  lowerBandAverage: number;
  pointsFromMidBand: number;
  pointsFromLowerBand: number;
  bonusPoints: number;
  subtotal: number;
  droppedPoints: number;
  total: number;
  classifiedRounds: number;
  pointsPerRound: number;
  podiumRate: number;
  scoringRate: number;
  maximumPossible: number;
  percentOfMaximum: number;
  deficit: number;
  tieBreakNote: string;
  breakdown: BreakdownRow[];
}

function calculateChampionship(input: ChampInputs): ChampResult {
  const systemSpec = SYSTEMS.find((s) => s.key === input.system) || SYSTEMS[0];

  // Custom scale interpolates linearly between the entered first-place and
  // tenth-place values, so it can represent any table a series publishes.
  const table =
    systemSpec.table ??
    Array.from({ length: 10 }, (_, i) => {
      const step = (input.customP1 - input.customP10) / 9;
      return input.customP1 - step * i;
    });

  const blank = (errorMsg: string): ChampResult => ({
    valid: false,
    errorMsg,
    table,
    pointsFromWins: 0,
    pointsFromSeconds: 0,
    pointsFromThirds: 0,
    midBandAverage: 0,
    lowerBandAverage: 0,
    pointsFromMidBand: 0,
    pointsFromLowerBand: 0,
    bonusPoints: 0,
    subtotal: 0,
    droppedPoints: 0,
    total: 0,
    classifiedRounds: 0,
    pointsPerRound: 0,
    podiumRate: 0,
    scoringRate: 0,
    maximumPossible: 0,
    percentOfMaximum: 0,
    deficit: 0,
    tieBreakNote: "",
    breakdown: [],
  });

  const nums = [
    input.wins,
    input.seconds,
    input.thirds,
    input.rounds,
    input.fourthToSixth,
    input.seventhToTenth,
    input.nonScoring,
    input.fastestLaps,
    input.fastestLapPoints,
    input.poles,
    input.polePoints,
    input.sprintWins,
    input.sprintPoints,
    input.dropRounds,
    input.customP1,
    input.customP10,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to total the points.");
  const counts = [
    input.wins,
    input.seconds,
    input.thirds,
    input.fourthToSixth,
    input.seventhToTenth,
    input.nonScoring,
    input.fastestLaps,
    input.poles,
    input.sprintWins,
    input.dropRounds,
  ];
  if (counts.some((v) => v < 0)) return blank("Result counts cannot be negative.");
  if (input.rounds <= 0 || input.rounds > 60) return blank("Rounds completed should be between 1 and 60.");
  const classifiedRounds =
    input.wins + input.seconds + input.thirds + input.fourthToSixth + input.seventhToTenth + input.nonScoring;
  if (classifiedRounds > input.rounds) {
    return blank("The finishing results add up to more rounds than were completed — check the counts.");
  }
  if (input.dropRounds > input.rounds) return blank("You cannot drop more rounds than were completed.");
  if (table.some((v) => v < 0)) return blank("Points values cannot be negative.");

  const d = Math.max(0, Math.min(2, input.decimals));

  const pointsFromWins = input.wins * table[0];
  const pointsFromSeconds = input.seconds * table[1];
  const pointsFromThirds = input.thirds * table[2];
  // Band points use the average of the positions the band covers.
  const midBand = (table[3] + table[4] + table[5]) / 3;
  const lowerBand = (table[6] + table[7] + table[8] + table[9]) / 4;
  const pointsFromMidBand = input.fourthToSixth * midBand;
  const pointsFromLowerBand = input.seventhToTenth * lowerBand;
  const bonusPoints =
    input.fastestLaps * input.fastestLapPoints + input.poles * input.polePoints + input.sprintWins * input.sprintPoints;

  const subtotal = pointsFromWins + pointsFromSeconds + pointsFromThirds + pointsFromMidBand + pointsFromLowerBand + bonusPoints;

  // Dropping the worst rounds removes the lowest-scoring finishes from the tally.
  const roundValues: number[] = [];
  input.wins > 0 && roundValues.push(...Array(input.wins).fill(table[0]));
  input.seconds > 0 && roundValues.push(...Array(input.seconds).fill(table[1]));
  input.thirds > 0 && roundValues.push(...Array(input.thirds).fill(table[2]));
  input.fourthToSixth > 0 && roundValues.push(...Array(input.fourthToSixth).fill(midBand));
  input.seventhToTenth > 0 && roundValues.push(...Array(input.seventhToTenth).fill(lowerBand));
  input.nonScoring > 0 && roundValues.push(...Array(input.nonScoring).fill(0));
  roundValues.sort((a, b) => a - b);
  const droppedPoints = roundValues.slice(0, Math.min(input.dropRounds, roundValues.length)).reduce((s, v) => s + v, 0);

  const total = subtotal - droppedPoints;
  const pointsPerRound = total / input.rounds;
  const podiumRate = ((input.wins + input.seconds + input.thirds) / input.rounds) * 100;
  const scoringRate = ((classifiedRounds - input.nonScoring) / input.rounds) * 100;
  const maximumPossible =
    input.rounds * (table[0] + input.fastestLapPoints + input.polePoints + input.sprintPoints);
  const percentOfMaximum = maximumPossible > 0 ? (total / maximumPossible) * 100 : 0;
  const deficit = maximumPossible - total;

  const tieBreakNote =
    input.wins > 0
      ? `Ties are normally broken on wins first, and this record has ${fmt(input.wins, 0)} of them, then seconds.`
      : "With no wins, a tie would be broken on second places, then third places.";

  const breakdown: BreakdownRow[] = [
    { label: `Wins · ${fmt(input.wins, 0)} × ${fmt(table[0], 0)}`, value: fmt(pointsFromWins, d) },
    { label: `Second places · ${fmt(input.seconds, 0)} × ${fmt(table[1], 0)}`, value: fmt(pointsFromSeconds, d) },
    { label: `Third places · ${fmt(input.thirds, 0)} × ${fmt(table[2], 0)}`, value: fmt(pointsFromThirds, d) },
    {
      label: `Fourth to sixth · ${fmt(input.fourthToSixth, 0)} × ${fmt(midBand, 1)} average`,
      value: fmt(pointsFromMidBand, d),
    },
    {
      label: `Seventh to tenth · ${fmt(input.seventhToTenth, 0)} × ${fmt(lowerBand, 1)} average`,
      value: fmt(pointsFromLowerBand, d),
    },
    {
      label: `Bonus points · ${fmt(input.fastestLaps, 0)} fastest laps, ${fmt(input.poles, 0)} poles, ${fmt(input.sprintWins, 0)} sprints`,
      value: fmt(bonusPoints, d),
    },
    { label: "Subtotal before drop scores", value: fmt(subtotal, d), highlight: true },
    {
      label: `Dropped rounds · worst ${fmt(input.dropRounds, 0)}`,
      value: `−${fmt(droppedPoints, d)}`,
    },
    { label: "Championship total", value: fmt(total, d), highlight: true },
    { label: "Points per round", value: fmt(pointsPerRound, 2) },
    {
      label: `Maximum possible · ${fmt(input.rounds, 0)} rounds × ${fmt(table[0] + input.fastestLapPoints + input.polePoints + input.sprintPoints, 0)}`,
      value: fmt(maximumPossible, d),
    },
    { label: "Percentage of the maximum", value: `${fmt(percentOfMaximum, 1)}%` },
    { label: "Points dropped from a perfect season", value: fmt(deficit, d) },
    { label: "Rounds accounted for", value: `${fmt(classifiedRounds, 0)} of ${fmt(input.rounds, 0)}` },
  ];

  return {
    valid: true,
    errorMsg: "",
    table,
    pointsFromWins,
    pointsFromSeconds,
    pointsFromThirds,
    midBandAverage: midBand,
    lowerBandAverage: lowerBand,
    pointsFromMidBand,
    pointsFromLowerBand,
    bonusPoints,
    subtotal,
    droppedPoints,
    total,
    classifiedRounds,
    pointsPerRound,
    podiumRate,
    scoringRate,
    maximumPossible,
    percentOfMaximum,
    deficit,
    tieBreakNote,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
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
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function ChampionshipPointsCalculator() {
  const [system, setSystem] = useState<string>(DEFAULTS.system);
  const [wins, setWins] = useState(String(DEFAULTS.wins));
  const [seconds, setSeconds] = useState(String(DEFAULTS.seconds));
  const [thirds, setThirds] = useState(String(DEFAULTS.thirds));
  const [rounds, setRounds] = useState(String(DEFAULTS.rounds));
  const [fourthToSixth, setFourthToSixth] = useState(String(DEFAULTS.fourthToSixth));
  const [seventhToTenth, setSeventhToTenth] = useState(String(DEFAULTS.seventhToTenth));
  const [nonScoring, setNonScoring] = useState(String(DEFAULTS.nonScoring));
  const [fastestLaps, setFastestLaps] = useState(String(DEFAULTS.fastestLaps));
  const [fastestLapPoints, setFastestLapPoints] = useState(String(DEFAULTS.fastestLapPoints));
  const [poles, setPoles] = useState(String(DEFAULTS.poles));
  const [polePoints, setPolePoints] = useState(String(DEFAULTS.polePoints));
  const [sprintWins, setSprintWins] = useState(String(DEFAULTS.sprintWins));
  const [sprintPoints, setSprintPoints] = useState(String(DEFAULTS.sprintPoints));
  const [dropRounds, setDropRounds] = useState(String(DEFAULTS.dropRounds));
  const [customP1, setCustomP1] = useState(String(DEFAULTS.customP1));
  const [customP10, setCustomP10] = useState(String(DEFAULTS.customP10));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ChampInputs => ({
    system: system as SystemKey,
    wins: parseFloat(wins) || 0,
    seconds: parseFloat(seconds) || 0,
    thirds: parseFloat(thirds) || 0,
    rounds: parseFloat(rounds) || 0,
    fourthToSixth: parseFloat(fourthToSixth) || 0,
    seventhToTenth: parseFloat(seventhToTenth) || 0,
    nonScoring: parseFloat(nonScoring) || 0,
    fastestLaps: parseFloat(fastestLaps) || 0,
    fastestLapPoints: parseFloat(fastestLapPoints) || 0,
    poles: parseFloat(poles) || 0,
    polePoints: parseFloat(polePoints) || 0,
    sprintWins: parseFloat(sprintWins) || 0,
    sprintPoints: parseFloat(sprintPoints) || 0,
    dropRounds: parseFloat(dropRounds) || 0,
    customP1: parseFloat(customP1) || 0,
    customP10: parseFloat(customP10) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<ChampInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ChampResult>(() => calculateChampionship(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateChampionship(inputs));
  };

  const reset = () => {
    setSystem(DEFAULTS.system);
    setWins(String(DEFAULTS.wins));
    setSeconds(String(DEFAULTS.seconds));
    setThirds(String(DEFAULTS.thirds));
    setRounds(String(DEFAULTS.rounds));
    setFourthToSixth(String(DEFAULTS.fourthToSixth));
    setSeventhToTenth(String(DEFAULTS.seventhToTenth));
    setNonScoring(String(DEFAULTS.nonScoring));
    setFastestLaps(String(DEFAULTS.fastestLaps));
    setFastestLapPoints(String(DEFAULTS.fastestLapPoints));
    setPoles(String(DEFAULTS.poles));
    setPolePoints(String(DEFAULTS.polePoints));
    setSprintWins(String(DEFAULTS.sprintWins));
    setSprintPoints(String(DEFAULTS.sprintPoints));
    setDropRounds(String(DEFAULTS.dropRounds));
    setCustomP1(String(DEFAULTS.customP1));
    setCustomP10(String(DEFAULTS.customP10));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateChampionship(DEFAULTS));
  };

  const roundsNum = parseFloat(rounds);
  const winsNum = parseFloat(wins);
  const classified =
    (parseFloat(wins) || 0) +
    (parseFloat(seconds) || 0) +
    (parseFloat(thirds) || 0) +
    (parseFloat(fourthToSixth) || 0) +
    (parseFloat(seventhToTenth) || 0) +
    (parseFloat(nonScoring) || 0);

  const errors = {
    rounds: !Number.isFinite(roundsNum) || roundsNum <= 0 || roundsNum > 60 ? "Use 1–60 rounds" : "",
    wins: !Number.isFinite(winsNum) || winsNum < 0 ? "Cannot be negative" : "",
    results:
      Number.isFinite(roundsNum) && classified > roundsNum
        ? `Results add up to ${classified} rounds of ${fmt(roundsNum, 0)}`
        : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How are championship points calculated?",
      answer:
        "Each series publishes a table that converts a finishing position into points: Sprint and Formula 1 award 25 to the winner and step down to one for tenth, MotoGP stops at fifteen points for fifteenth, and stock-car style systems use flatter scales. Bonus points are then added for fastest laps, poles or sprint events where the rules allow, and some series allow the worst rounds to be dropped from the total.",
    },
    {
      question: "What does a drop score do to a championship?",
      answer:
        "A drop score removes the worst one or two rounds from a driver's tally, which softens the effect of a retirement or a bad weekend. It matters most in long seasons where a single mechanical failure would otherwise decide the title, and it slightly rewards consistency because a dropped zero is worth less than a dropped fourth place. The calculator removes the lowest-scoring rounds from the record when you set a drop count.",
    },
    {
      question: "How are ties broken?",
      answer:
        "Almost every series counts wins first, then second places, then third, and so on down the finishing order until the tie is broken. A tie on points with unequal wins therefore goes to the driver with more victories, which is why wins are tracked separately in the output even when the points total is what the championship table shows.",
    },
    {
      question: "How reliable is a points-per-round figure?",
      answer:
        "It is the most useful normalising statistic when comparing drivers across different season lengths or mid-season, because raw totals depend on how many rounds have been run. A driver averaging eighteen points a round is on course for a dominant season across twenty rounds, while the same average over six rounds is simply a good start. The maximum-possible comparison in the output makes that gap explicit.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Championship Points Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Championship Points Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Season Record">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="wins"
                  label="Wins"
                  value={wins}
                  onChange={setWins}
                  onEnter={runCalculate}
                  min="0"
                  step="1"
                  error={errors.wins}
                  tooltip="Races or events won this season."
                />
                <CompactInput
                  id="seconds"
                  label="Second Places"
                  value={seconds}
                  onChange={setSeconds}
                  onEnter={runCalculate}
                  min="0"
                  step="1"
                  tooltip="Finishes in second position."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="thirds"
                  label="Third Places"
                  value={thirds}
                  onChange={setThirds}
                  onEnter={runCalculate}
                  min="0"
                  step="1"
                  tooltip="Finishes in third position."
                />
                <CompactInput
                  id="rounds"
                  label="Rounds Completed"
                  value={rounds}
                  onChange={setRounds}
                  onEnter={runCalculate}
                  min="1"
                  max="60"
                  step="1"
                  error={errors.rounds}
                  tooltip="Events started, used for the points-per-round figure."
                />
              </div>
            </SubSection>

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
                  <SubSection title="Scoring System">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="system"
                        label="Points Table"
                        value={system}
                        onChange={setSystem}
                        options={SYSTEMS.map((s) => ({ value: s.key, label: s.label }))}
                        tooltip="Sets the points awarded by finishing position."
                      />
                      <CompactInput
                        id="drop-rounds"
                        label="Drop Worst Rounds"
                        value={dropRounds}
                        onChange={setDropRounds}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        tooltip="Rounds removed from the tally, as many series allow."
                      />
                    </div>
                    {system === "custom" && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <CompactInput
                          id="custom-p1"
                          label="Points for First"
                          value={customP1}
                          onChange={setCustomP1}
                          onEnter={runCalculate}
                          min="0"
                          step="1"
                          tooltip="Top of the custom scale."
                        />
                        <CompactInput
                          id="custom-p10"
                          label="Points for Tenth"
                          value={customP10}
                          onChange={setCustomP10}
                          onEnter={runCalculate}
                          min="0"
                          step="1"
                          hint="Positions between interpolate linearly."
                          tooltip="Bottom of the custom scale."
                        />
                      </div>
                    )}
                  </SubSection>
                  <SubSection title="Remaining Results">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="mid-band"
                        label="4th–6th Finishes"
                        value={fourthToSixth}
                        onChange={setFourthToSixth}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        tooltip="Scored at the average of positions four to six."
                      />
                      <CompactInput
                        id="lower-band"
                        label="7th–10th Finishes"
                        value={seventhToTenth}
                        onChange={setSeventhToTenth}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        tooltip="Scored at the average of positions seven to ten."
                      />
                      <CompactInput
                        id="non-scoring"
                        label="Non-Scoring Rounds"
                        value={nonScoring}
                        onChange={setNonScoring}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        error={errors.results}
                        tooltip="Finishes outside the points and retirements."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Bonus Points & Display">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="fastest-laps"
                        label="Fastest Laps"
                        value={fastestLaps}
                        onChange={setFastestLaps}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        tooltip="Fastest laps recorded during the season."
                      />
                      <CompactInput
                        id="fl-points"
                        label="Points Each"
                        value={fastestLapPoints}
                        onChange={setFastestLapPoints}
                        onEnter={runCalculate}
                        min="0"
                        step="0.5"
                        tooltip="Points awarded per fastest lap; one is typical."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for points figures."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <CompactInput
                        id="poles"
                        label="Pole Positions"
                        value={poles}
                        onChange={setPoles}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        tooltip="Poles taken, if the series awards points for them."
                      />
                      <CompactInput
                        id="pole-points"
                        label="Pole Points"
                        value={polePoints}
                        onChange={setPolePoints}
                        onEnter={runCalculate}
                        min="0"
                        step="0.5"
                        tooltip="Most series award none."
                      />
                      <CompactInput
                        id="sprint-wins"
                        label="Sprint Wins"
                        value={sprintWins}
                        onChange={setSprintWins}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        tooltip="Sprint or heat victories."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <CompactInput
                        id="sprint-points"
                        label="Sprint Points Each"
                        value={sprintPoints}
                        onChange={setSprintPoints}
                        onEnter={runCalculate}
                        min="0"
                        step="0.5"
                        tooltip="Points awarded for a sprint win."
                      />
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Championship Points</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.total, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.pointsPerRound, 2)} points per round across ${fmt(calcInputs.rounds, 0)} rounds — ${fmt(results.percentOfMaximum, 1)}% of the maximum available`
                  : "Fix the highlighted inputs to total the points"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Round</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.pointsPerRound, 2) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Podium Rate</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.podiumRate, 1)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Dropped</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.droppedPoints, 0)} pts` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Points Source</th>
                    <th className="p-2.5 pr-3 text-right w-[170px]">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.valid ? (
                    results.breakdown.map((row) => (
                      <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={2}>
                        Enter the season results to total the points.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Total after drop scores</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.total, calcInputs.decimals)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rounds completed</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(calcInputs.rounds, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rounds classified</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.classifiedRounds, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Points from wins</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.pointsFromWins, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bonus points</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.bonusPoints, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Subtotal</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.subtotal, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Points finishes</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.scoringRate, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Maximum possible</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.maximumPossible, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Below maximum</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.deficit, 0)} pts` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className="text-[11px] text-muted-foreground mt-3">{results.tieBreakNote}</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Championship Points Calculator?</h2>
            <p>
              A championship points calculator converts a season's finishing positions into a points total using the scoring table
              of a chosen series. It handles the standard position points, bonus points for fastest laps, poles and sprint events,
              drop scores that remove the worst rounds, and then normalises the result into points per round and a percentage of the
              maximum a perfect season would have scored.
            </p>
            <p>
              Points systems vary far more than they appear to. Formula 1 pays right down to tenth, MotoGP extends to fifteenth,
              stock-car scales are deliberately flat to keep championships close, and some series award points for leading laps or
              qualifying. Comparing two drivers or two seasons without normalising for the scoring table leads to wrong conclusions.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each finishing position is converted with the selected table: 25 points for a win in Formula 1 style scoring, 18 for
              second, 15 for third and down to one for tenth. Finishes in the middle and lower bands are grouped and credited at the
              average of the positions the band covers, which keeps the input manageable while staying within a point or two of the
              exact total. Bonus points are added straight from the counts and per-event values you enter, so any series rule can be
              represented.
            </p>
            <p>
              Drop scores are then applied. Many series allow the worst one or two rounds to be discarded, so the calculator removes
              the lowest-scoring rounds from the record — a retirement or a non-points finish if one exists, and otherwise the weakest
              counting result. That is why a dropped zero is worth more to a driver than a dropped fourth place, and why series with
              drop scores reward risk-taking slightly more than those without.
            </p>
            <p>
              Finally the total is normalised. Points per round is the fairest comparison across different season lengths or part-way
              through a year, the podium rate shows how often the driver finished in the top three, the scoring rate shows how often
              they finished in the points at all, and the maximum-possible calculation quantifies exactly how far the season sits from
              a perfect record.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the championship total after drop scores, with points per round and the percentage of the maximum
              in the subtext. The three-stat bar adds the per-round figure, the podium rate and the points removed by drop scores.
            </p>
            <p>
              The breakdown table lists points from each result category, the bonus points, the subtotal, the drop-score deduction and
              the total, followed by the per-round rate, the maximum possible and the gap to it. The summary panel reports rounds
              completed and classified, points from wins, bonus points and both rate statistics, plus a note on how ties are broken.
            </p>
            <p>
              Use the current points table for the series you are following, because scales change between seasons and bonus rules are
              the first thing series organisers adjust. The banded treatment of mid-field finishes and the linear interpolation in the
              custom scale keep the arithmetic transparent, so the total is usually within a point or two of the official tally rather
              than exact to the last decimal.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/championship-points-calculator" />
          <PopularCalculators exclude="/calculator/championship-points-calculator" />
        </div>
      </div>
    </>
  );
}
