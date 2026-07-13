"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Gauge, RotateCcw, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface BoostResults {
  estimatedHp: number;
  hpGained: number;
  pressureRatio: number;
  densityRatio: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateBoost = (inputs: typeof DEFAULTS): BoostResults => {
  const baseHp = parseFloat(inputs.baseHp);
  const boostPsi = parseFloat(inputs.boostPsi);
  
  // Advanced
  const atmosphericPsi = parseFloat(inputs.atmosphericPsi) || 14.7;
  const ambientTempF = parseFloat(inputs.ambientTemp) || 70;
  const intercoolerEff = parseFloat(inputs.intercoolerEff) / 100 || 0.70; // 70% efficient intercooler

  if (isNaN(baseHp) || baseHp <= 0 || isNaN(boostPsi) || boostPsi < 0) {
    return {
      estimatedHp: 0, hpGained: 0, pressureRatio: 0, densityRatio: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "Base HP and Boost must be valid positive numbers."
    };
  }

  // Absolute Pressure = Atmospheric + Boost
  const absolutePressure = atmosphericPsi + boostPsi;
  const pressureRatio = absolutePressure / atmosphericPsi;

  // Temperature calculations (in Rankine)
  const ambientTempR = ambientTempF + 459.67;
  
  // Compressor discharge temperature (ideal gas law / adiabatic compression)
  // T2 = T1 * (P2/P1)^0.283 (assuming standard ratio of specific heats for air)
  const idealDischargeTempR = ambientTempR * Math.pow(pressureRatio, 0.283);
  
  // Assume a typical compressor efficiency of 70%
  const compressorEff = 0.70;
  const actualDischargeTempR = ambientTempR + ((idealDischargeTempR - ambientTempR) / compressorEff);

  // Intercooler calculation
  // Intercooler removes a percentage of the heat added by the compressor
  const heatAdded = actualDischargeTempR - ambientTempR;
  const heatRemoved = heatAdded * intercoolerEff;
  const finalManifoldTempR = actualDischargeTempR - heatRemoved;

  // Density Ratio = (Pressure Ratio) * (Ambient Temp / Final Manifold Temp)
  const densityRatio = pressureRatio * (ambientTempR / finalManifoldTempR);

  // Estimated HP = Base HP * Density Ratio
  // We apply a volumetric efficiency penalty (assume 95% of theoretical density makes it into power)
  const estimatedHp = baseHp * densityRatio * 0.95;
  const hpGained = estimatedHp - baseHp;

  // Generate chart data for 0 to 30 psi
  const chartData = [];
  const schedule = [];
  
  for (let psi = 0; psi <= 30; psi += 2) {
    const pAbs = atmosphericPsi + psi;
    const pRatio = pAbs / atmosphericPsi;
    const iDischargeR = ambientTempR * Math.pow(pRatio, 0.283);
    const aDischargeR = ambientTempR + ((iDischargeR - ambientTempR) / compressorEff);
    const fManifoldR = aDischargeR - ((aDischargeR - ambientTempR) * intercoolerEff);
    const dRatio = pRatio * (ambientTempR / fManifoldR);
    const hp = baseHp * dRatio * 0.95;
    
    chartData.push({
      Boost: psi,
      Horsepower: Math.round(hp)
    });

    if (psi % 5 === 0 && psi > 0) {
      schedule.push({
        boost: psi,
        hp: Math.round(hp),
        gain: Math.round(hp - baseHp)
      });
    }
  }

  return {
    estimatedHp: Math.round(estimatedHp),
    hpGained: Math.round(hpGained),
    pressureRatio: Number(pressureRatio.toFixed(2)),
    densityRatio: Number(densityRatio.toFixed(2)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  baseHp: "200",
  boostPsi: "10",
  atmosphericPsi: "14.7", // Sea level
  ambientTemp: "70",      // Fahrenheit
  intercoolerEff: "70"    // %
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function TurboBoostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BoostResults>(calculateBoost(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateBoost(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBoost(DEFAULTS));
  };

  const faqs = [
    { question: "How does a turbocharger increase horsepower?", answer: "An internal combustion engine is essentially an air pump. Its power is limited by how much atmospheric air it can suck in to mix with fuel. A turbocharger uses exhaust gases to spin a compressor wheel, which forcibly crams pressurized air (boost) into the engine. More air means the engine can burn more fuel, resulting in a massive increase in horsepower." },
    { question: "What is Density Ratio vs. Pressure Ratio?", answer: "Pressure Ratio is simply how much you are compressing the air (e.g., 14.7 psi of boost doubles the atmospheric pressure, creating a 2.0 Pressure Ratio). However, compressing air generates extreme heat, and hot air is less dense. Therefore, 14.7 psi of boost does not perfectly double your horsepower. The Density Ratio accounts for this thermal expansion, giving a much more accurate prediction of the actual oxygen molecules reaching the cylinder." },
    { question: "Why is an intercooler important?", answer: "When a turbo compresses air, the air temperature can spike well over 250°F. Hot air is less dense and highly prone to causing catastrophic engine detonation (knock). An intercooler acts like a radiator for the intake air, stripping away the heat before it reaches the engine. A highly efficient intercooler increases air density, which safely maximizes your horsepower gain." },
    { question: "Can I just turn the boost up to 30 PSI?", answer: "No. Increasing boost drastically increases the physical stress on the engine's connecting rods, pistons, and head gaskets. Furthermore, if the fuel injectors cannot supply enough fuel to match the massive influx of air, the engine will run 'lean' and melt the pistons. High boost levels require forged engine internals, high-flow fuel systems, and custom computer tuning." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Turbo Boost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Turbo Boost Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Estimate the horsepower gain from adding a turbocharger or supercharger to a naturally aspirated engine.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="base" label="Base NA Horsepower" value={inputs.baseHp} onChange={(v: string) => handleChange("baseHp", v)} suffix="HP" placeholder="200" />
              <CompactInput id="boost" label="Target Boost Pressure" value={inputs.boostPsi} onChange={(v: string) => handleChange("boostPsi", v)} suffix="PSI" placeholder="10" />
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Thermodynamic Variables <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <CompactInput id="atm" label="Atmospheric Pressure" value={inputs.atmosphericPsi} onChange={(v: string) => handleChange("atmosphericPsi", v)} suffix="PSI" />
                    <CompactInput id="temp" label="Ambient Air Temp" value={inputs.ambientTemp} onChange={(v: string) => handleChange("ambientTemp", v)} suffix="°F" />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <CompactInput id="eff" label="Intercooler Efficiency" value={inputs.intercoolerEff} onChange={(v: string) => handleChange("intercoolerEff", v)} suffix="%" />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">* Note: Air-to-Air intercoolers are typically 60-75% efficient. Sea level atmospheric pressure is 14.7 PSI.</div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
            
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Estimated Boosted Horsepower</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-7xl font-black text-primary tracking-tighter">{results.estimatedHp}</div>
                    <div className="text-2xl font-bold text-primary mb-1">HP</div>
                  </div>
                  <div className="text-sm font-medium mt-2 text-foreground">
                    A gain of <strong className="text-emerald-600 dark:text-emerald-500">+{results.hpGained} HP</strong> over the naturally aspirated base.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Base HP</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.baseHp}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Pressure Ratio</div>
                    <div className="text-2xl font-bold text-blue-500">{results.pressureRatio}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Density Ratio</div>
                    <div className="text-2xl font-bold text-emerald-500">{results.densityRatio}</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Horsepower Curve (0 to 30 PSI)</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Boost" tickFormatter={(val) => `${val} psi`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={parseFloat(inputs.boostPsi)} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: 'hsl(var(--primary))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} HP`, 'Power']}
                          labelFormatter={(label) => `Boost: ${label} PSI`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line type="monotone" dataKey="Horsepower" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Boost Benchmarks</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Boost Pressure</th>
                          <th className="px-4 py-3 font-semibold text-right">Estimated HP</th>
                          <th className="px-4 py-3 font-semibold text-right text-emerald-600 dark:text-emerald-500">HP Gain</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.boost} className={`hover:bg-muted/20 transition-colors ${row.boost == inputs.boostPsi ? 'bg-primary/5' : ''}`}>
                            <td className="px-4 py-3 font-medium text-foreground">{row.boost} PSI</td>
                            <td className="px-4 py-3 text-right font-bold text-foreground">{row.hp}</td>
                            <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-500">+{row.gain} HP</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Do Turbochargers Add Horsepower?</h2>
            <p>Naturally aspirated engines rely on the downward stroke of the piston to pull atmospheric air into the combustion chamber. This creates a hard physical limit on how much oxygen can mix with fuel. A turbocharger completely rewrites this rule. Driven by waste exhaust gases, the turbo's compressor wheel acts as a powerful forced-induction pump. It artificially pressurizes the intake air (measured in PSI of "boost"), allowing the engine to inhale a massive surplus of oxygen and burn significantly more fuel, generating explosive horsepower gains.</p>

            <h2 className="text-2xl font-bold mb-3">The Rule of 14.7 PSI</h2>
            <p>A common myth in the automotive community is that adding 14.7 PSI of boost will perfectly double your engine's horsepower. Atmospheric pressure at sea level is exactly 14.7 PSI. Therefore, adding an additional 14.7 PSI of boost creates a Pressure Ratio of 2.0 (doubling the total pressure). In a perfect world of pure mathematics, doubling the pressure doubles the oxygen, which doubles the horsepower. In reality, physics gets in the way.</p>

            <h2 className="text-2xl font-bold mb-3">Thermal Dynamics and Density Ratio</h2>
            <p>When you compress air, it gets incredibly hot. According to the Ideal Gas Law, hot air expands and becomes less dense. So, even though you doubled the physical pressure inside the manifold, the hot, expanded air molecules take up more space. You are not actually shoving twice as many oxygen molecules into the cylinder. The true measurement of how much extra oxygen the engine receives is called the <strong>Density Ratio</strong>.</p>

            <h2 className="text-2xl font-bold mb-3">The Critical Role of Intercoolers</h2>
            <p>Because the air exiting a turbocharger can exceed 250°F, forcing it directly into the engine is highly inefficient and dangerous (leading to premature fuel detonation). To solve this, builders route the hot air through an intercooler—a large heat exchanger mounted in the front bumper. The intercooler strips the heat away, dropping the intake temperature back down near ambient levels. This cools and condenses the air, drastically improving the Density Ratio. A high-efficiency intercooler is the secret to extracting massive, safe horsepower from high boost pressures.</p>

            <h2 className="text-2xl font-bold mb-3">Limitations of Boosted Applications</h2>
            <p>Our Turbo Boost Calculator provides thermodynamic estimates, but it assumes your engine block can physically survive the strain. Turning the boost up to 25 PSI might mathematically yield 500 horsepower, but if you have a factory cast-iron engine with weak connecting rods, the engine will likely shatter long before it reaches that number. High horsepower builds require forged internal components, high-capacity fuel injectors, and highly specialized ECU tuning to manage the aggressive air-fuel ratios.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/turbo-boost-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
