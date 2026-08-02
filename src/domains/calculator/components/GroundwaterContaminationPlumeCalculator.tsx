"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { Calculator, RefreshCw } from "lucide-react";

const fmt = (n: number, d = 4) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

const GroundwaterContaminationPlumeCalculator = () => {
  const DEFAULTS = {
    sourceConcentration: "100",
    hydraulicConductivity: "1",
    hydraulicGradient: "0.01",
    porosity: "0.3",
    dispersivity: "1",
    decayRate: "0.001",
    distance: "10",
    time: "365",
  };

  const [sourceConcentration, setSourceConcentration] = useState(DEFAULTS.sourceConcentration);
  const [hydraulicConductivity, setHydraulicConductivity] = useState(DEFAULTS.hydraulicConductivity);
  const [hydraulicGradient, setHydraulicGradient] = useState(DEFAULTS.hydraulicGradient);
  const [porosity, setPorosity] = useState(DEFAULTS.porosity);
  const [dispersivity, setDispersivity] = useState(DEFAULTS.dispersivity);
  const [decayRate, setDecayRate] = useState(DEFAULTS.decayRate);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [time, setTime] = useState(DEFAULTS.time);
  const [result, setResult] = useState<{
    concentration: number;
    velocity: number;
    travelTime: number;
  } | null>(null);

  const calculate = () => {
    const C0 = parseFloat(sourceConcentration);
    const K = parseFloat(hydraulicConductivity);
    const i = parseFloat(hydraulicGradient);
    const n = parseFloat(porosity);
    const lambda = parseFloat(decayRate);
    const x = parseFloat(distance);
    const tInput = parseFloat(time);

    if (isNaN(C0) || isNaN(K) || isNaN(i) || isNaN(n) || isNaN(lambda) || isNaN(x) || isNaN(tInput)) {
      setResult(null);
      return;
    }

    // average linear velocity
    const v = (K * i) / n; // m/d
    // travel time based on distance
    const travelTime = x / v; // days
    // concentration using first-order decay over travel time
    const C = C0 * Math.exp(-lambda * travelTime);

    setResult({ concentration: C, velocity: v, travelTime });
  };

  useEffect(() => {
    calculate();
  }, [
    sourceConcentration,
    hydraulicConductivity,
    hydraulicGradient,
    porosity,
    decayRate,
    distance,
    time,
  ]);

  const reset = () => {
    setSourceConcentration(DEFAULTS.sourceConcentration);
    setHydraulicConductivity(DEFAULTS.hydraulicConductivity);
    setHydraulicGradient(DEFAULTS.hydraulicGradient);
    setPorosity(DEFAULTS.porosity);
    setDispersivity(DEFAULTS.dispersivity);
    setDecayRate(DEFAULTS.decayRate);
    setDistance(DEFAULTS.distance);
    setTime(DEFAULTS.time);
  };

  const faqs = [
    {
      question: "What is a contaminant plume?",
      answer:
        "A contaminant plume is the body of contaminated groundwater that emanates from a source of pollution. Its shape and concentration distribution are governed by advection, dispersion, and chemical reactions such as decay.",
    },
    {
      question: "How is plume length estimated?",
      answer:
        "Plume length can be estimated using analytical solutions of the advection-dispersion-reaction equation. For a continuous source with first-order decay, the concentration declines exponentially with travel time: C = C₀·exp(−λ·t), where t = x/v is the travel time from the source to a point x downstream.",
    },
    {
      question: "What parameters control plume migration?",
      answer:
        "Key parameters include hydraulic conductivity (K), hydraulic gradient (i), porosity (n) which together determine groundwater velocity; longitudinal dispersivity (αL) which affects spreading; decay rate (λ) representing biodegradation or decay; and the source concentration C₀.",
    },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calculator" },
        { label: "Groundwater Contamination Plume Calculator" },
      ]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Groundwater Contamination Plume Calculator
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div className="space-y-4">
              <div>
                <label className="text-base font-medium block mb-1.5">Source Concentration (mg/L)</label>
                <input
                  type="number"
                  value={sourceConcentration}
                  onChange={(e) => setSourceConcentration(e.target.value)}
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter source concentration"
                />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Hydraulic Conductivity (m/d)</label>
                <input
                  type="number"
                  value={hydraulicConductivity}
                  onChange={(e) => setHydraulicConductivity(e.target.value)}
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter hydraulic conductivity"
                />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Hydraulic Gradient</label>
                <input
                  type="number"
                  value={hydraulicGradient}
                  onChange={(e) => setHydraulicGradient(e.target.value)}
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter hydraulic gradient"
                />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Porosity</label>
                <input
                  type="number"
                  value={porosity}
                  onChange={(e) => setPorosity(e.target.value)}
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter porosity"
                />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Longitudinal Dispersivity (m)</label>
                <input
                  type="number"
                  value={dispersivity}
                  onChange={(e) => setDispersivity(e.target.value)}
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter longitudinal dispersivity"
                />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Decay Rate (1/day)</label>
                <input
                  type="number"
                  value={decayRate}
                  onChange={(e) => setDecayRate(e.target.value)}
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter decay rate"
                />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Distance from Source (m)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter distance"
                />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Time (days) (optional, for reference)</label>
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-10 px-3 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter time"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={calculate}
                  className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm"
                >
                  Calculate
                </button>
                <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {result && (
              <>
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Results</h3>
                  <div className="space-y-2 text-base">
                    <p>
                      <span className="font-medium">Source Concentration (C₀):</span> {fmt(parseFloat(sourceConcentration))} mg/L
                    </p>
                    <p>
                      <span className="font-medium">Groundwater Velocity (v):</span> {fmt(result.velocity)} m/d
                    </p>
                    <p>
                      <span className="font-medium">Travel Time to {fmt(parseFloat(distance))} m:</span> {fmt(result.travelTime)} days
                    </p>
                    <p>
                      <span className="font-medium">Decay Rate (λ):</span> {fmt(parseFloat(decayRate), 6)} 1/day
                    </p>
                    <p>
                      <span className="font-medium">Concentration at Distance (C):</span>{" "}
                      <span className="font-mono text-lg">{fmt(result.concentration)}</span> mg/L
                    </p>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3">Formula</h3>
                  <p className="text-sm">
                    C = C₀ × exp(−λ × t)<br />
                    where t = x / v, v = (K × i) / n
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    C₀ = source concentration (mg/L), λ = decay rate (1/day), t = travel time (days), x = distance (m), v = groundwater velocity (m/d), K = hydraulic conductivity (m/d), i = hydraulic gradient, n = porosity.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Contaminant Plume Modeling</h2>
            <p>
              Contaminant plume modeling is essential for assessing the extent of groundwater pollution and designing effective remediation strategies. The simplest analytical approach assumes one-dimensional, steady-state flow with uniform transport properties and first‑order decay. Under these assumptions, the concentration downstream of a continuous source declines exponentially with travel time, which itself depends on the groundwater velocity and the distance from the source.
            </p>
            <p>
              The groundwater velocity (v) is determined by the hydraulic conductivity (K), hydraulic gradient (i), and effective porosity (n) via Darcy’s law: v = (K·i)/n. The travel time (t) to a point at distance x is t = x/v. Incorporating first‑order decay with rate constant λ gives the concentration at distance x as:C = C₀·exp(−λ·x/v). This equation neglects dispersion, which would cause spreading of the plume; however, for many screening‑level assessments the exponential decay term provides a reasonable estimate of the plume’s central‑line concentration.
            </p>
            <p>
              Users can adjust the source concentration, hydraulic conductivity, gradient, porosity, decay rate, and distance to see how these factors influence the predicted concentration. The calculator also outputs the groundwater velocity and travel time for reference. While more sophisticated models incorporate dispersion, transient flow, and reactive transport, this tool offers a quick, transparent estimate for preliminary evaluations.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/groundwater-contamination-plume-calculator" />
          <PopularCalculators exclude="/calculator/groundwater-contamination-plume-calculator" />
        </div>
      </div>
    </>
  );
};

export default GroundwaterContaminationPlumeCalculator;