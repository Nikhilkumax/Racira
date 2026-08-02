"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Settings, Wrench, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface SealResult {
  sealingPressure: number;
  springLoadPressure: number;
  hydraulicUnbalance: number;
  operatingPressure: number;
  pressureSafetyMargin: number;
  recommendedSpringLoad: number;
  status: "Safe" | "Warning" | "Critical";
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  systemPressure: "150",
  fluidVaporPressure: "5",
  springPreload: "120",
  sealType: "single",
  safetyFactor: "1.5",
};

const SEAL_TYPE_FACTORS: Record<string, { factor: number; margin: number }> = {
  single: { factor: 1.0, margin: 1.3 },
  double: { factor: 0.85, margin: 1.5 },
  tandem: { factor: 0.7, margin: 1.7 },
  cartridge: { factor: 0.95, margin: 1.4 },
};

const calculate = (v: typeof DEFAULTS): SealResult => {
  const sysPressure = parseFloat(v.systemPressure) || 0;
  const vaporPressure = parseFloat(v.fluidVaporPressure) || 0;
  const springPreload = parseFloat(v.springPreload) || 0;
  const safetyFactor = parseFloat(v.safetyFactor) || 1.5;

  const sealConfig = SEAL_TYPE_FACTORS[v.sealType] || SEAL_TYPE_FACTORS.single;
  const { factor, margin } = sealConfig;

  // 1. Sealing (closing) pressure = System pressure - fluid vapor pressure
  // The seal needs to overcome fluid vapor pressure + system pressure to maintain sealing
  const sealingPressure = (sysPressure - vaporPressure) * factor;

  // 2. Spring load pressure needed to keep seal closed
  const springLoadPressure = sealingPressure * safetyFactor;

  // 3. Hydraulic unbalance (exposed to system pressure on seal faces)
  const hydraulicUnbalance = sysPressure - springPreload;

  // 4. Operating pressure (actual pressure at seal faces during operation)
  const operatingPressure = Math.max(0, sysPressure - springPreload * factor);

  // 5. Safety margin (how much safety factor we have)
  const designedSpringLoad = springPreload * margin;
  const pressureSafetyMargin = designedSpringLoad > 0 ? ((designedSpringLoad - sealingPressure) / designedSpringLoad) * 100 : 0;

  // 6. Recommended spring load
  const recommendedSpringLoad = (sealingPressure + (sysPressure * 0.1)) * safetyFactor;

  // Status determination
  let status: "Safe" | "Warning" | "Critical";
  if (sealingPressure > springPreload * 1.2) {
    status = "Critical";
  } else if (sealingPressure > springPreload * 0.9) {
    status = "Warning";
  } else if (pressureSafetyMargin < 20) {
    status = "Warning";
  } else {
    status = "Safe";
  }

  const chartData = [
    { name: "System Pressure", value: parseFloat(sysPressure.toFixed(1)), fill: "#3b82f6" },
    { name: "Sealing Pressure", value: parseFloat(sealingPressure.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Spring Load", value: parseFloat(springLoadPressure.toFixed(1)), fill: "#10b981" },
    { name: "Operating Pressure", value: parseFloat(operatingPressure.toFixed(1)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "System Pressure", value: `${sysPressure.toFixed(1)} PSI` },
    { label: "Fluid Vapor Pressure", value: `${vaporPressure.toFixed(1)} PSI` },
    { label: "Pressure Differential", value: `${(sysPressure - vaporPressure).toFixed(1)} PSI` },
    { label: "Seal Type Factor", value: `${factor} (${v.sealType})` },
    { label: "Sealing Pressure", value: `${sealingPressure.toFixed(1)} PSI` },
    { label: "Safety Factor", value: `${safetyFactor.toFixed(1)}x` },
    { label: "Required Spring Load", value: `${springLoadPressure.toFixed(1)} PSI` },
    { label: "Spring Preload", value: `${springPreload.toFixed(1)} PSI` },
    { label: "Hydraulic Unbalance", value: `${hydraulicUnbalance.toFixed(1)} PSI` },
    { label: "Operating Pressure", value: `${operatingPressure.toFixed(1)} PSI` },
    { label: "Pressure Safety Margin", value: `${pressureSafetyMargin.toFixed(1)}%` },
  ];

  const summaryStats = [
    { label: "Sealing Pressure", value: `${sealingPressure.toFixed(1)} PSI` },
    { label: "Spring Load Needed", value: `${springLoadPressure.toFixed(1)} PSI` },
    { label: "Operating Pressure", value: `${operatingPressure.toFixed(1)} PSI` },
    { label: "Status", value: status },
    { label: "Safety Margin", value: `${pressureSafetyMargin.toFixed(1)}%` },
    { label: "Recommended Load", value: `${recommendedSpringLoad.toFixed(1)} PSI` },
  ];

  return {
    sealingPressure,
    springLoadPressure,
    hydraulicUnbalance,
    operatingPressure,
    pressureSafetyMargin,
    recommendedSpringLoad,
    status,
    chartData,
    breakdown,
    summaryStats,
  };
};

const fmt = (n: number) => `${n.toFixed(2)}`;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>{payload[0].value} PSI</p>
      </div>
    );
  }
  return null;
};

export default function MechanicalSealPressureCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<SealResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(vals));
  };

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const updateVal = (key: keyof typeof DEFAULTS, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is sealing pressure in a mechanical seal?", answer: "Sealing pressure is the minimum pressure that must be applied by the seal spring to the seal faces to prevent process fluid from leaking. It must be greater than the fluid vapor pressure plus the system pressure component acting to open the seal." },
    { question: "How does seal type affect the calculation?", answer: "Single seals are more vulnerable to pressure fluctuations. Double and tandem seals provide backup sealing paths and allow for lower spring loads. The seal type factor adjusts the effective pressure to account for these design differences." },
    { question: "What is hydraulic unbalance?", answer: "Hydraulic unbalance occurs when the system pressure acting on the seal faces exceeds the spring preload force, potentially blowing the seal open. Minimizing unbalance is critical for seal longevity." },
    { question: "What safety factor should I use?", answer: "A safety factor of 1.3 to 2.0 is recommended. Higher safety factors account for pressure fluctuations, but too high a spring load can cause excessive wear on the seal faces." },
    { question: "What is a safe pressure safety margin?", answer: "A margin above 20% is generally considered safe. If the spring preload is too close to the sealing pressure, the seal may fail to maintain contact under pressure spikes." },
  ];

  const statusColors = { Safe: "text-emerald-600", Warning: "text-amber-600", Critical: "text-rose-600" };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator#engineering" },
          { label: "Mechanical Seal Pressure Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Mechanical Seal Pressure Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> System Parameters
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">System Pressure</label>
                  <input type="number" value={vals.systemPressure} onChange={(e) => updateVal("systemPressure", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Fluid Vapor Pressure</label>
                  <input type="number" value={vals.fluidVaporPressure} onChange={(e) => updateVal("fluidVaporPressure", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Spring Preload Pressure</label>
                  <input type="number" value={vals.springPreload} onChange={(e) => updateVal("springPreload", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Safety Factor</label>
                  <input type="number" value={vals.safetyFactor} onChange={(e) => updateVal("safetyFactor", e.target.value)} className="input-calc" step="any" min="1" max="3" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Seal Type</label>
                  <select value={vals.sealType} onChange={(e) => updateVal("sealType", e.target.value)} className="input-calc">
                    <option value="single">Single Seal</option>
                    <option value="double">Double Seal</option>
                    <option value="tandem">Tandem Seal</option>
                    <option value="cartridge">Cartridge Seal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Settings className="h-3 w-3" /> Status
                </div>
                <div className={`text-4xl font-bold ${statusColors[result.status]}`}>{result.status}</div>
                <p className="text-sm text-muted-foreground mt-1">Sealing Pressure: {fmt(result.sealingPressure)} PSI</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Sealing Pressure</div>
                  <div className="text-lg font-bold text-foreground">{fmt(result.sealingPressure)} PSI</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Spring Load</div>
                  <div className="text-lg font-bold text-foreground">{fmt(result.springLoadPressure)} PSI</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Safety Margin</div>
                  <div className={`text-lg font-bold ${result.pressureSafetyMargin < 20 ? 'text-rose-600' : 'text-emerald-600'}`}>{fmt(result.pressureSafetyMargin)}%</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Parameter</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Pressure Distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className={`text-sm font-semibold ${s.label === "Status" ? statusColors[s.value as keyof typeof statusColors] : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Mechanical Seal Pressure: Design and Safety</h2>
            <p>Mechanical seals are critical components in centrifugal pumps and rotating equipment, creating a fluid-tight barrier between the rotating shaft and the stationary housing. Proper seal pressure design ensures that the seal faces remain in contact, preventing process fluid leakage while minimizing wear. This calculator helps engineers determine the sealing pressure, required spring load, operational pressure, and safety margins for various seal configurations under different system conditions.</p>

            <h3>1. Understanding Sealing Pressure</h3>
            <p>The sealing pressure is the net pressure that the seal spring must overcome to keep the seal faces closed against the process fluid. It is calculated as the difference between system pressure and fluid vapor pressure, adjusted by the seal type factor. This accounts for the fact that the fluid inside the seal chamber exerts pressure that tries to push the seal faces apart.</p>

            <h3>2. Spring Preload and Hydraulic Unbalance</h3>
            <p>Spring preload is the initial force applied to the seal faces before the system starts. If the system pressure exceeds this preload, hydraulic unbalance occurs, which can blow the seal open. The operating pressure represents the residual pressure at the seal faces during operation, which should ideally be near zero or slightly negative for optimal sealing.</p>

            <h3>3. Safety Factors and Seal Selection</h3>
            <p>The recommended safety factor ensures the spring can maintain seal contact even under pressure spikes or transient conditions. Single seals typically require higher safety margins than double seals, which provide a backup barrier. Regular verification of pressure safety margins prevents premature seal failure and costly downtime.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mechanical-seal-pressure-calculator" />
          <PopularCalculators exclude="/calculator/mechanical-seal-pressure-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "hsl(var(--primary))", "#10b981", "#f59e0b"];
