"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Car, Gauge, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { calculateAccelerationEstimator, DEFAULTS, type AccelerationEstimatorInputs, type AccelerationEstimatorResults } from "./AccelerationEstimatorLogic";

const fmt = (n: number, dec = 1) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const AccelEstimatorCalculator = () => {
  const [horsepower, setHorsepower] = useState(String(DEFAULTS.horsepower));
  const [weight, setWeight] = useState(String(DEFAULTS.weight));
  const [drivetrain, setDrivetrain] = useState<AccelerationEstimatorInputs["drivetrain"]>(DEFAULTS.drivetrain);
  const [transmission, setTransmission] = useState<AccelerationEstimatorInputs["transmission"]>(DEFAULTS.transmission);
  const [tireType, setTireType] = useState<AccelerationEstimatorInputs["tireType"]>(DEFAULTS.tireType);
  const [showAdv, setShowAdv] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [results, setResults] = useState<AccelerationEstimatorResults>(() => calculateAccelerationEstimator(DEFAULTS));

  const getInputs = (): AccelerationEstimatorInputs => ({
    horsepower: parseFloat(horsepower) || 0,
    weight: parseFloat(weight) || 0,
    drivetrain,
    transmission,
    tireType,
  });

  const handleCalculate = () => {
    const inputs = getInputs();
    setResults(calculateAccelerationEstimator(inputs));
  };

  const reset = () => {
    setHorsepower(String(DEFAULTS.horsepower));
    setWeight(String(DEFAULTS.weight));
    setDrivetrain(DEFAULTS.drivetrain);
    setTransmission(DEFAULTS.transmission);
    setTireType(DEFAULTS.tireType);
    setShowAdv(false);
    setResults(calculateAccelerationEstimator(DEFAULTS));
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  const valErrors: Record<string, string> = {};
  const hp = parseFloat(horsepower) || 0;
  const wt = parseFloat(weight) || 0;
  if (hp <= 0) valErrors.horsepower = "Horsepower must be > 0";
  if (wt <= 0) valErrors.weight = "Weight must be > 0";
  if (hp > 2000) valErrors.horsepower = "Horsepower seems too high";
  if (wt > 20000) valErrors.weight = "Weight seems too high";
  const hasValidationErrors = Object.keys(valErrors).length > 0;

  const pieData = [
    { name: "0–60 mph", value: results.zeroToSixty, color: PIE_COLORS[0] },
    { name: "Quarter Mile", value: results.quarterMile, color: PIE_COLORS[1] },
    { name: "Top Speed", value: results.topSpeed, color: PIE_COLORS[2] },
  ];

  const piePcts = pieData.map(item => {
    const total = pieData.reduce((a, b) => a + b.value, 0);
    if (total <= 0) return 0;
    return Math.round((item.value / total) * 1000) / 10;
  });
  const pieSumPct = piePcts.reduce((a, b) => a + b, 0);
  let pieDataWithPcts = pieData.map((item, i) => ({ ...item, pct: piePcts[i] }));
  if (pieData.reduce((a, b) => a + b.value, 0) > 0 && Math.abs(pieSumPct - 100) > 0.1) {
    const diff = Math.round((100 - pieSumPct) * 10) / 10;
    const maxIdx = piePcts.indexOf(Math.max(...piePcts));
    pieDataWithPcts[maxIdx].pct = Math.round((pieDataWithPcts[maxIdx].pct + diff) * 10) / 10;
  }
  const pieDataFinal = pieDataWithPcts.filter(d => d.value > 0);

  const breakdownRows = [
    { label: "0–60 mph Time", value: `${results.zeroToSixty}s`, highlight: true },
    { label: "Quarter Mile Time", value: `${results.quarterMile}s` },
    { label: "Top Speed", value: `${results.topSpeed} mph` },
    { label: "Power-to-Weight", value: `${results.powerToWeight} hp/ton` },
    { label: "Drivetrain Loss Factor", value: `${results.drivetrainLoss}%` },
  ];

  const summaryStats = [
    { label: "Horsepower", value: `${fmt(hp, 0)} hp` },
    { label: "Curb Weight", value: `${fmt(wt, 0)} lbs` },
    { label: "Drivetrain", value: drivetrain.toUpperCase() },
    { label: "Transmission", value: transmission.charAt(0).toUpperCase() + transmission.slice(1) },
    { label: "Tire Type", value: tireType.charAt(0).toUpperCase() + tireType.slice(1).replace("allseason", "All-Season") },
    { label: "Power-to-Weight", value: `${results.powerToWeight} hp/ton` },
  ];

  const faqs = [
    { question: "What is a 0–60 mph acceleration estimator?", answer: "It is a calculator that estimates the time it takes for a vehicle to accelerate from 0 to 60 miles per hour based on its horsepower, weight, drivetrain, and transmission type." },
    { question: "How does power-to-weight ratio affect acceleration?", answer: "A higher power-to-weight ratio generally means faster acceleration. More horsepower relative to the vehicle's weight allows it to overcome inertia more quickly." },
    { question: "Why does drivetrain type matter for acceleration?", answer: "All-wheel drive (AWD) vehicles typically have better traction off the line, reducing wheel spin and improving initial acceleration compared to front-wheel drive (FWD) or rear-wheel drive (RWD) vehicles." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator#transportation" }, { label: "0-60 MPH Acceleration Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">0-60 MPH Acceleration Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="horsepower"
                label="Horsepower"
                value={horsepower}
                onChange={setHorsepower}
                suffix="hp"
              />
              <CompactInput
                id="weight"
                label="Curb Weight"
                value={weight}
                onChange={setWeight}
                suffix="lbs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="drivetrain" className="text-sm font-semibold text-foreground mb-1">
                  Drivetrain
                </label>
                <div className="relative h-9">
                  <select
                    id="drivetrain"
                    value={drivetrain}
                    onChange={(e) => setDrivetrain(e.target.value as any)}
                    className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                  >
                    <option value="fwd">FWD</option>
                    <option value="rwd">RWD</option>
                    <option value="awd">AWD</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="transmission" className="text-sm font-semibold text-foreground mb-1">
                  Transmission
                </label>
                <div className="relative h-9">
                  <select
                    id="transmission"
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as any)}
                    className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="dct">DCT</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                {showAdv ? <span className="text-xs">▼</span> : <span className="text-xs">▶</span>}
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Tire Configuration</div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex flex-col">
                        <label htmlFor="tire-type" className="text-sm font-semibold text-foreground mb-1">Tire Type</label>
                        <div className="relative h-9">
                          <select
                            id="tire-type"
                            value={tireType}
                            onChange={(e) => setTireType(e.target.value as any)}
                            className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                          >
                            <option value="summer">Summer</option>
                            <option value="performance">Performance</option>
                            <option value="allseason">All-Season</option>
                            <option value="winter">Winter</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasValidationErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}

            <div className="flex gap-2.5">
              <Button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className="flex-1 h-10 text-base font-bold"
              >
                Calculate
              </Button>
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
            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated 0–60 Time</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.zeroToSixty}s
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Quarter Mile: {results.quarterMile}s | Top Speed: {results.topSpeed} mph
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Power-to-Weight</span>
                <span className="font-extrabold text-foreground">{results.powerToWeight} hp/ton</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Drivetrain Loss</span>
                <span className="font-extrabold text-foreground">{results.drivetrainLoss}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Top Speed</span>
                <span className="font-extrabold text-foreground">{results.topSpeed} mph</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdownRows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10 font-bold" : ""} ${row.highlight ? "text-amber-700" : "text-foreground"}`}>
                      <td className={`p-2.5 pl-3 ${row.highlight ? "text-amber-700 font-bold" : "font-semibold"}`}>{row.label}</td>
                      <td className={`p-2.5 pr-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "font-semibold"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DONUT CHART */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
              <div className="shrink-0">
                {mounted && pieDataFinal.length > 0 ? (
                  <div className="w-[160px] h-[160px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pieDataFinal}>
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {pieDataFinal.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => [typeof value === 'number' ? value.toFixed(1) : value, ""]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="w-[160px] h-[160px] flex items-center justify-center text-muted-foreground text-xs">Loading chart...</div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-primary/10 text-primary font-bold text-xs">📊</span>
                  Performance Breakdown
                </h4>
                {pieDataFinal.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{typeof item.value === 'number' ? item.value.toFixed(1) : item.value} ({item.pct.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                {summaryStats.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <PopularCalculators exclude="/calculator/0-60-mph-acceleration-estimator" />
        <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/0-60-mph-acceleration-estimator" />
      </div>
    </>
  );
};

export default AccelEstimatorCalculator;
