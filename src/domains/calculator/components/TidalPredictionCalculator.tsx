"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Waves } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

export default function TidalPredictionCalculator() {
  const [interval, setInterval] = useState("12.42");
  const [amplitude, setAmplitude] = useState("1.5");
  const [phase, setPhase] = useState("0");
  const [startHours, setStartHours] = useState("0");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    period: number;
    amplitudeM: number;
    highTide: number;
    lowTide: number;
    cycleData: { t: number; level: number }[];
    nextHigh: number;
  } | null>(null);

  const handleCalculate = () => {
    const period = parseFloat(interval) || 12.42;
    const amp = parseFloat(amplitude) || 0;
    const phaseDeg = parseFloat(phase) || 0;
    const start = parseFloat(startHours) || 0;
    const omega = (2 * Math.PI) / period;
    const phaseRad = (phaseDeg * Math.PI) / 180;

    const level = (t: number) => amp * Math.cos(omega * (t - start) + phaseRad);

    // Find next high tide within one period
    let nextHigh = 0;
    let best = -Infinity;
    for (let t = 0; t <= period * 2; t += period / 360) {
      const v = level(t);
      if (v > best) { best = v; nextHigh = t; }
    }

    const cycleData = [];
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * period * 2;
      cycleData.push({ t: Number(t.toFixed(2)), level: Number(level(t).toFixed(2)) });
    }

    setResult({
      period,
      amplitudeM: amp,
      highTide: best,
      lowTide: -best,
      cycleData,
      nextHigh: Number(nextHigh.toFixed(2)),
    });
    setShowResults(true);
  };

  const reset = () => {
    setInterval("12.42"); setAmplitude("1.5"); setPhase("0"); setStartHours("0");
    setShowResults(false);
    setResult(null);
  };

  const faqs = [
    { question: "What causes tides?", answer: "Tides are caused by the gravitational pull of the Moon and, to a lesser extent, the Sun, combined with the Earth's rotation. The Moon's pull raises a bulge of water on the side facing it, and a second bulge forms on the far side from centrifugal force — so most coasts see two high tides and two low tides per day." },
    { question: "What is the tidal period?", answer: "The dominant lunar tidal period is 12.42 hours (the M2 constituent) — the time between successive high tides. Because the Moon orbits the Earth, high tide shifts about 50 minutes later each day. The solar constituent (S2) adds a 12-hour component that creates the spring/neap cycle." },
    { question: "What are spring and neap tides?", answer: "When the Sun, Moon, and Earth align (full and new moons), solar and lunar bulges add together, producing spring tides with the largest range. At first and third quarters, the Sun's pull partially cancels the Moon's, producing neap tides with the smallest range." },
    { question: "Why are real predictions so complex?", answer: "Real tide tables combine dozens of harmonic constituents (M2, S2, K1, O1, and more), plus local coastal geography, water depth, and weather. NOAA and other agencies fit these constituents to decades of measurements. A single sinusoid, as modeled here, is a useful approximation but not a navigation tool." },
    { question: "How does this calculator work?", answer: "It models the water level as a cosine wave with the period, amplitude, and phase you specify: h(t) = A·cos(2π(t−t₀)/T + φ). You can simulate the dominant lunar constituent and explore how amplitude and phase shift the tide curve." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Tidal Prediction Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tidal Prediction Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <InputField id="interval" label="Tidal Period" value={interval} onChange={setInterval} suffix="hrs" tooltip="Time between successive high tides. The dominant lunar M2 constituent is 12.42 hours." />
              <InputField id="amplitude" label="Tidal Amplitude" value={amplitude} onChange={setAmplitude} suffix="m" tooltip="Half the tidal range — the height of high tide above mean sea level." />
              <InputField id="phase" label="Phase Shift" value={phase} onChange={setPhase} suffix="°" tooltip="Shifts the whole tide curve in time (0 = high tide at your start time)." />
              <InputField id="startHours" label="Start Offset" value={startHours} onChange={setStartHours} suffix="hrs" tooltip="Hours after midnight to begin the modeled cycle." />
            </div>

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Waves className="h-5 w-5" />Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Tide Model</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">High Tide</p>
                    <p className="text-2xl font-black text-foreground">+{result.highTide.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">m</span></p>
                  </div>
                  <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Low Tide</p>
                    <p className="text-2xl font-black text-foreground">{result.lowTide.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">m</span></p>
                  </div>
                  <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Next High In</p>
                    <p className="text-2xl font-black text-foreground">{result.nextHigh.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">hrs</span></p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Tidal Period", value: result.period, textValue: `${result.period} hours` },
                  { label: "Tidal Range", value: result.amplitudeM * 2, textValue: `${(result.amplitudeM * 2).toFixed(2)} m` },
                  { label: "Model", value: 0, textValue: "Single sinusoid (M2 constituent)", highlight: true },
                ]} />
                <div className="mt-6 p-4 rounded-2xl border border-border bg-card">
                  <p className="text-sm font-bold text-foreground mb-3">Water Level Over Two Tidal Cycles</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={result.cycleData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: "Hours", position: "insideBottom", offset: -2, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => `${v > 0 ? "+" : ""}${v} m`} labelFormatter={(l) => `t = ${l} hrs`} />
                      <ReferenceLine y={0} stroke="hsl(var(--border))" />
                      <Line type="monotone" dataKey="level" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">h(t) = A·cos(2π(t−t₀)/T + φ) — the dominant lunar constituent, idealized to a single sinusoid.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Science of Tides</h2>
            <p>Tides are the slow, rhythmic rise and fall of sea level driven by gravity and orbital motion. The Moon contributes about two-thirds of tidal force and the Sun about one-third, and their combined geometry produces the daily and fortnightly patterns sailors and surfers rely on. Because the Earth rotates beneath the tidal bulges, most shorelines experience roughly two high tides every 24 hours 50 minutes — the lunar day.</p>
            <h3>Harmonic Analysis</h3>
            <p>Modern tide prediction treats the tide as the sum of many sinusoids, each tied to a specific astronomical cycle: the principal lunar (M2, 12.42 h), principal solar (S2, 12.00 h), lunar diurnal (K1, 23.93 h), and dozens more. Harmonic analysis fits the amplitude and phase of each constituent to tide-gauge records, then sums them forward to predict water levels months or years ahead — accurate to centimeters in most harbors.</p>
            <h3>From Model to Reality</h3>
            <p>This calculator models a single constituent so you can feel how period and amplitude shape the curve. Real predictions add the other constituents, then correct for local depth, coastline geometry, and storm surge. Understanding the simple wave underneath all that complexity is the first step to reading a real tide table with confidence.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tidal-prediction-calculator" />
          <PopularCalculators exclude="/calculator/tidal-prediction-calculator" />
        </div>
      </div>
    </>
  );
}
