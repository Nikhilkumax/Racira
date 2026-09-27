"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface TidalInputs {
  startHour: number;
  m2Amplitude: number;
  m2Phase: number;
  s2Amplitude: number;
  s2Phase: number;
  meanSeaLevel: number;
  forecastHours: number;
  requiredClearance: number;
}

const DEFAULTS: TidalInputs = {
  startHour: 6,
  m2Amplitude: 1.5,
  m2Phase: 30,
  s2Amplitude: 0.4,
  s2Phase: 0,
  meanSeaLevel: 2.5,
  forecastHours: 24,
  requiredClearance: 1.0,
};

/** Principal lunar semidiurnal constituent — the dominant driver of most coastlines. */
const M2_PERIOD_H = 12.42;
/** Principal solar semidiurnal constituent — fixed at exactly half a solar day. */
const S2_PERIOD_H = 12.0;
const MINUTES_PER_HOUR = 60;

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { maximumFractionDigits: d }) : "—";

const formatClock = (hoursFromMidnight: number) => {
  const total = ((hoursFromMidnight % 24) + 24) % 24;
  const h = Math.floor(total);
  const m = Math.round((total - h) * 60);
  const hh = m === 60 ? (h + 1) % 24 : h;
  const mm = m === 60 ? 0 : m;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

interface TideEvent {
  hours: number;
  clock: string;
  height: number;
  type: "high" | "low";
}

interface TidalResult {
  valid: boolean;
  errorMsg: string;
  curve: { hours: number; height: number }[];
  events: TideEvent[];
  nextHigh: TideEvent | null;
  nextLow: TideEvent | null;
  highestHigh: TideEvent | null;
  lowestLow: TideEvent | null;
  meanRange: number;
  maxRange: number;
  springRange: number;
  neapRange: number;
  highsPerDay: number;
  springNeapCycleDays: number;
  hoursAboveClearance: number;
  nextClearanceBreach: number | null;
  meanLevel: number;
}

function tideHeight(tauHours: number, i: TidalInputs): number {
  const m2 = i.m2Amplitude * Math.cos((2 * Math.PI * tauHours) / M2_PERIOD_H - (i.m2Phase * Math.PI) / 180);
  const s2 = i.s2Amplitude * Math.cos((2 * Math.PI * tauHours) / S2_PERIOD_H - (i.s2Phase * Math.PI) / 180);
  return i.meanSeaLevel + m2 + s2;
}

function computeTides(i: TidalInputs): TidalResult {
  const invalid =
    i.m2Amplitude <= 0 || i.s2Amplitude < 0 || i.forecastHours <= 0 || i.m2Amplitude + i.s2Amplitude <= 0;
  if (invalid) {
    return {
      valid: false,
      errorMsg:
        "Enter a positive lunar amplitude, a non-negative solar amplitude, and a forecast window of at least one hour.",
      curve: [],
      events: [],
      nextHigh: null,
      nextLow: null,
      highestHigh: null,
      lowestLow: null,
      meanRange: 0,
      maxRange: 0,
      springRange: 0,
      neapRange: 0,
      highsPerDay: 0,
      springNeapCycleDays: 0,
      hoursAboveClearance: 0,
      nextClearanceBreach: null,
      meanLevel: 0,
    };
  }

  const stepMinutes = 1;
  const stepHours = stepMinutes / MINUTES_PER_HOUR;
  const curve: { hours: number; height: number }[] = [];
  for (let tau = 0; tau <= i.forecastHours + 1e-9; tau += stepHours) {
    curve.push({ hours: tau, height: tideHeight(tau, i) });
  }

  const events: TideEvent[] = [];
  for (let k = 1; k < curve.length - 1; k++) {
    const prev = curve[k - 1].height;
    const curr = curve[k].height;
    const next = curve[k + 1].height;
    const isHigh = curr > prev && curr >= next;
    const isLow = curr < prev && curr <= next;
    if (!isHigh && !isLow) continue;
    events.push({
      hours: curve[k].hours,
      clock: formatClock(i.startHour + curve[k].hours),
      height: curr,
      type: isHigh ? "high" : "low",
    });
  }

  const highs = events.filter((e) => e.type === "high");
  const lows = events.filter((e) => e.type === "low");

  const nextAfterStart = (list: TideEvent[]) =>
    list.find((e) => e.hours > 0) ?? list[0] ?? null;

  const nextHigh = nextAfterStart(highs);
  const nextLow = nextAfterStart(lows);

  const highestHigh = highs.reduce<TideEvent | null>((a, b) => (!a || b.height > a.height ? b : a), null);
  const lowestLow = lows.reduce<TideEvent | null>((a, b) => (!a || b.height < a.height ? b : a), null);

  const ranges: number[] = [];
  for (const low of lows) {
    const nearestHigh = highs.reduce<TideEvent | null>(
      (a, b) => (!a || Math.abs(b.hours - low.hours) < Math.abs(a.hours - low.hours) ? b : a),
      null
    );
    if (nearestHigh) ranges.push(Math.abs(nearestHigh.height - low.height));
  }
  const meanRange = ranges.length ? ranges.reduce((a, b) => a + b, 0) / ranges.length : 0;
  const maxRange = ranges.length ? Math.max(...ranges) : 0;

  const meanLevel = i.meanSeaLevel;

  const hoursAboveClearance = curve.filter((p) => p.height >= i.requiredClearance).length * stepHours;
  const breach = curve.find((p) => p.height < i.requiredClearance);
  const nextClearanceBreach = breach ? breach.hours : null;

  return {
    valid: true,
    errorMsg: "",
    curve,
    events,
    nextHigh,
    nextLow,
    highestHigh,
    lowestLow,
    meanRange,
    maxRange,
    springRange: 2 * (i.m2Amplitude + i.s2Amplitude),
    neapRange: 2 * Math.abs(i.m2Amplitude - i.s2Amplitude),
    highsPerDay: 24 / M2_PERIOD_H,
    springNeapCycleDays: (M2_PERIOD_H * S2_PERIOD_H) / Math.abs(M2_PERIOD_H - S2_PERIOD_H) / 24,
    hoursAboveClearance,
    nextClearanceBreach,
    meanLevel,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  suffix?: string;
  tooltip?: string;
  step?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, suffix, tooltip, step }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        step={step}
        value={value}
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
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function TidalPredictionCalculator() {
  const [startHour, setStartHour] = useState(String(DEFAULTS.startHour));
  const [m2Amplitude, setM2Amplitude] = useState(String(DEFAULTS.m2Amplitude));
  const [m2Phase, setM2Phase] = useState(String(DEFAULTS.m2Phase));
  const [s2Amplitude, setS2Amplitude] = useState(String(DEFAULTS.s2Amplitude));
  const [s2Phase, setS2Phase] = useState(String(DEFAULTS.s2Phase));
  const [meanSeaLevel, setMeanSeaLevel] = useState(String(DEFAULTS.meanSeaLevel));
  const [forecastHours, setForecastHours] = useState(String(DEFAULTS.forecastHours));
  const [requiredClearance, setRequiredClearance] = useState(String(DEFAULTS.requiredClearance));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TidalInputs => ({
    startHour: parseFloat(startHour) || 0,
    m2Amplitude: parseFloat(m2Amplitude) || 0,
    m2Phase: parseFloat(m2Phase) || 0,
    s2Amplitude: parseFloat(s2Amplitude) || 0,
    s2Phase: parseFloat(s2Phase) || 0,
    meanSeaLevel: parseFloat(meanSeaLevel) || 0,
    forecastHours: parseFloat(forecastHours) || 0,
    requiredClearance: parseFloat(requiredClearance) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<TidalInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TidalResult>(() => computeTides(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTides(inputs));
  };

  const reset = () => {
    setStartHour(String(DEFAULTS.startHour));
    setM2Amplitude(String(DEFAULTS.m2Amplitude));
    setM2Phase(String(DEFAULTS.m2Phase));
    setS2Amplitude(String(DEFAULTS.s2Amplitude));
    setS2Phase(String(DEFAULTS.s2Phase));
    setMeanSeaLevel(String(DEFAULTS.meanSeaLevel));
    setForecastHours(String(DEFAULTS.forecastHours));
    setRequiredClearance(String(DEFAULTS.requiredClearance));
    setCalcInputs(DEFAULTS);
    setResults(computeTides(DEFAULTS));
  };

  const faqs = [
    {
      question: "How does this tide prediction model work?",
      answer:
        "The calculator sums the two semidiurnal constituents that dominate most coastlines: the principal lunar term (M2, 12.42 hours) and the principal solar term (S2, 12.00 hours). Each is a cosine wave defined by an amplitude and a phase, so the predicted height at any minute is the mean sea level plus both constituent contributions. That is the same harmonic principle official tide tables use, just limited to two terms.",
    },
    {
      question: "Why is the lunar tidal period 12.42 hours instead of 12?",
      answer:
        "The Moon orbits the Earth in the same direction the Earth rotates, so a point on the surface must turn a little farther to catch up with the Moon again. That extra rotation takes about 24 minutes, which is why the lunar day is roughly 24 hours 50 minutes and the M2 constituent has a period of 12.42 hours. It is also why high tide arrives about 50 minutes later each day.",
    },
    {
      question: "What are spring and neap tides?",
      answer:
        "When the solar and lunar bulges line up — at new and full moon — the two constituents add up and produce spring tides with the largest range. When they oppose each other at the quarter moons, the contributions partly cancel and produce neap tides with the smallest range. The calculator reports both the spring range (2 × (M2 + S2)) and the neap range (2 × |M2 − S2|), plus the length of the beat cycle that separates them, roughly 14.8 days.",
    },
    {
      question: "Can I use these numbers for navigation?",
      answer:
        "They are a planning aid, not a charted prediction. A two-constituent model reproduces the timing and rough size of high and low water for a location where M2 and S2 dominate, but it does not include local effects such as shallow-water overtides, weather surge, river discharge, or seasonal mean-level changes. Always check the official tide table and add a safety margin, which the clearance field in Advanced Options helps you explore.",
    },
    {
      question: "What does the clearance check tell me?",
      answer:
        "Enter the draft plus minimum under-keel clearance your vessel needs, and the summary statistics report how many hours of the forecast window the water is deep enough as well as the next time the falling tide drops below that threshold. It is a quick way to see whether a passage window is workable around a shallow berth or bar.",
    },
  ];

  const breakdownRows = results.events.slice(0, 6).map((e) => ({
    label: e.type === "high" ? "High water" : "Low water",
    time: e.clock,
    height: `${fmt(e.height, 2)} m`,
    highlight:
      (results.highestHigh && e.hours === results.highestHigh.hours && e.type === "high") ||
      (results.lowestLow && e.hours === results.lowestLow.hours && e.type === "low"),
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Tide Prediction Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Tide Prediction Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Reference Time">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="start-hour"
                  label="Start Hour"
                  value={startHour}
                  onChange={setStartHour}
                  onEnter={runCalculate}
                  suffix="h"
                  step="0.25"
                  tooltip="Hour after local midnight at which the forecast begins (6 = 06:00)."
                />
                <div className="flex flex-col justify-end">
                  <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                    Begins {formatClock(calcInputs.startHour)}
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Principal Lunar (M2)">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="m2-amplitude"
                  label="Amplitude"
                  value={m2Amplitude}
                  onChange={setM2Amplitude}
                  onEnter={runCalculate}
                  suffix="m"
                  step="0.1"
                  tooltip="Half the lunar tidal range — the height above mean sea level at lunar high water."
                />
                <CompactInput
                  id="m2-phase"
                  label="Phase"
                  value={m2Phase}
                  onChange={setM2Phase}
                  onEnter={runCalculate}
                  suffix="°"
                  step="5"
                  tooltip="Shifts the lunar curve in time; 0° puts lunar high water at the reference hour."
                />
              </div>
            </SubSection>

            <SubSection title="Principal Solar (S2)">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="s2-amplitude"
                  label="Amplitude"
                  value={s2Amplitude}
                  onChange={setS2Amplitude}
                  onEnter={runCalculate}
                  suffix="m"
                  step="0.1"
                  tooltip="Solar contribution. Roughly one quarter to one third of the lunar amplitude at most coasts."
                />
                <CompactInput
                  id="s2-phase"
                  label="Phase"
                  value={s2Phase}
                  onChange={setS2Phase}
                  onEnter={runCalculate}
                  suffix="°"
                  step="5"
                  tooltip="Offsets the solar curve; aligning it with the lunar phase produces spring tides."
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
                  <SubSection title="Datum & Forecast Window">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="mean-sea-level"
                        label="Mean Sea Level"
                        value={meanSeaLevel}
                        onChange={setMeanSeaLevel}
                        onEnter={runCalculate}
                        suffix="m"
                        step="0.1"
                        tooltip="Height of mean sea level above chart datum; added to every prediction."
                      />
                      <CompactInput
                        id="forecast-hours"
                        label="Forecast Hours"
                        value={forecastHours}
                        onChange={setForecastHours}
                        onEnter={runCalculate}
                        suffix="h"
                        step="6"
                        tooltip="Length of the predicted window, sampled once per minute."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Navigation Clearance">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="required-clearance"
                        label="Required Water Depth"
                        value={requiredClearance}
                        onChange={setRequiredClearance}
                        onEnter={runCalculate}
                        suffix="m"
                        step="0.1"
                        tooltip="Draft plus under-keel clearance you need to stay above."
                      />
                      <div className="flex flex-col justify-end">
                        <div className="h-9 rounded-md border border-input bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground font-medium">
                          {fmt(results.hoursAboveClearance, 1)} h above
                        </div>
                      </div>
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
            {results.valid && (
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Next High Tide</div>
                <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                  {results.nextHigh ? results.nextHigh.clock : "—"}
                  <span className="text-lg font-semibold text-muted-foreground ml-2">
                    {results.nextHigh ? `${fmt(results.nextHigh.height, 2)} m` : ""}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {results.nextLow
                    ? `Next low water at ${results.nextLow.clock} (${fmt(results.nextLow.height, 2)} m)`
                    : "No low water falls inside this window"}
                </div>
              </div>
            )}

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mean Range</span>
                <span className="font-extrabold text-foreground">{fmt(results.meanRange, 2)} m</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Highest High
                </span>
                <span className="font-extrabold text-foreground">
                  {results.highestHigh ? `${fmt(results.highestHigh.height, 2)} m` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Highs / Day
                </span>
                <span className="font-extrabold text-foreground">{fmt(results.highsPerDay, 2)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Tide Event</th>
                    <th className="p-2.5 text-right w-[110px]">Local Time</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Predicted Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}
                    >
                      <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>
                        {row.label}
                      </td>
                      <td className="p-2.5 text-right text-foreground">{row.time}</td>
                      <td
                        className={`p-2.5 pr-3 text-right font-semibold ${
                          row.highlight ? "text-amber-700" : "text-foreground"
                        }`}
                      >
                        {row.height}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Full range in window</td>
                    <td className="p-2.5 text-right text-muted-foreground">{fmt(calcInputs.forecastHours, 0)} h</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.maxRange, 2)} m</td>
                  </tr>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mean Sea Level</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.meanLevel, 2)} m</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lowest Low</span>
                  <span className="text-base font-bold text-foreground">
                    {results.lowestLow ? `${fmt(results.lowestLow.height, 2)} m at ${results.lowestLow.clock}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Spring Range</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.springRange, 2)} m</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Neap Range</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.neapRange, 2)} m</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Spring/Neap Cycle</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.springNeapCycleDays, 2)} days</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tide Events</span>
                  <span className="text-base font-bold text-foreground">{results.events.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Hours Above Clearance
                  </span>
                  <span className="text-base font-bold text-primary">{fmt(results.hoursAboveClearance, 1)} h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Next Clearance Breach
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {results.nextClearanceBreach === null
                      ? `Never in ${fmt(calcInputs.forecastHours, 0)} h`
                      : formatClock(calcInputs.startHour + results.nextClearanceBreach)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Harmonic Tide Prediction Works</h2>
            <p>
              Ocean tides are a periodic signal, and periodic signals can be rebuilt by adding up a series of cosine
              waves. Tide tables around the world are produced exactly that way: each coastal station is analysed to
              find the amplitude and phase of a set of tidal constituents, and the prediction for any future minute is
              the sum of those terms. This calculator uses the two constituents that matter most on most coastlines —
              the principal lunar semidiurnal term (M2, period 12.42 hours) and the principal solar semidiurnal term
              (S2, period 12.00 hours) — and adds them to a datum height you specify.
            </p>
            <p>
              The model is written as h(t) = mean sea level + M2 amplitude × cos(2πt / 12.42 − M2 phase) + S2 amplitude
              × cos(2πt / 12.00 − S2 phase), with t measured in hours from your reference time. Change any amplitude or
              phase, press Calculate, and the full curve is resampled minute by minute to locate every high and low
              water in the forecast window.
            </p>

            <h2 className="text-2xl font-bold mb-3">Reading the Predicted Tide Table</h2>
            <p>
              The headline card shows the first high water after your reference time and the low water that follows it,
              with clock times and heights in metres. Below that, the breakdown table lists each tide event in the
              window and highlights the highest high and lowest low, which are the two numbers worth memorising for a
              shallow berth or a bar crossing. The final row reports the largest high-to-low range seen anywhere in the
              window.
            </p>
            <p>
              Summary statistics put the window in context. Mean range is the average high-to-low difference, spring
              range is the maximum the location can deliver when the solar and lunar bulges align (2 × (M2 + S2)), and
              neap range is the minimum when they partly cancel (2 × |M2 − S2|). The spring/neap cycle tells you how
              many days separate the biggest and smallest tides — about 14.8 days for these two constituents, which is
              the familiar fortnightly rhythm of coastal water levels. The clearance pair of statistics counts how many
              hours the water stays above the depth you need and the next time the falling tide drops below it.
            </p>

            <h2 className="text-2xl font-bold mb-3">Interpreting Amplitudes, Phases and Local Effects</h2>
            <p>
              The amplitude of a constituent is half its contribution to the tidal range, and the phase is simply the
              time offset — a larger phase angle means the crest arrives later. If you have a published harmonic
              constant table for your harbour, the M2 amplitude and phase are the first two numbers to copy in; if you
              are estimating, a solar amplitude around a quarter to a third of the lunar amplitude is typical for
              exposed ocean coasts, while enclosed seas usually carry much smaller values for both.
            </p>
            <p>
              Remember that a two-term model is a simplification. Shallow estuaries generate overtides that make the
              flood shorter than the ebb, atmospheric pressure and persistent winds shift water levels by tens of
              centimetres over hours, and river discharge can hold a low tide above its predicted height. The tide
              prediction here is designed for planning, teaching, and quick sanity checks — align it with an official
              station table before relying on it for navigation, and always carry a margin for the weather.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tidal-prediction-calculator" />
          <PopularCalculators exclude="/calculator/tidal-prediction-calculator" />
        </div>
      </div>
    </>
  );
}
