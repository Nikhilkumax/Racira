"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, Beaker, Gauge, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface FugacityResult {
  pressure: number;
  temperature: number;
  criticalPressure: number;
  criticalTemperature: number;
  acentricFactor: number;
  reducedPressure: number;
  reducedTemperature: number;
  fugacityCoefficient: number;
  fugacity: number;
  idealGasFugacity: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  pressure: "10",
  temperature: "300",
  criticalPressure: "45",
  criticalTemperature: "304",
  acentricFactor: "0.225",
};

const calculate = (v: typeof DEFAULTS): FugacityResult => {
  const P = parseFloat(v.pressure) || 0;
  const T = parseFloat(v.temperature) || 0;
  const Pc = parseFloat(v.criticalPressure) || 0;
  const Tc = parseFloat(v.criticalTemperature) || 0;
  const omega = parseFloat(v.acentricFactor) || 0;

  const reducedPressure = Pc > 0 ? P / Pc : 0;
  const reducedTemperature = Tc > 0 ? T / Tc : 0;

  // Pitzer correlation for fugacity coefficient
  const B0 = 0.083 - 0.422 / Math.pow(reducedTemperature, 1.6);
  const B1 = 0.139 - 0.172 / Math.pow(reducedTemperature, 4.2);
  const B = B0 + omega * B1;
  const lnPhi = B * reducedPressure;
  const fugacityCoefficient = Math.exp(lnPhi);

  const fugacity = P * fugacityCoefficient;
  const idealGasFugacity = P;

  const chartData = [
    { name: "Pressure", value: parseFloat(P.toFixed(2)), fill: "#3b82f6" },
    { name: "Fugacity", value: parseFloat(fugacity.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Ideal Gas", value: parseFloat(idealGasFugacity.toFixed(2)), fill: "#10b981" },
    { name: "φ (coeff)", value: parseFloat(fugacityCoefficient.toFixed(3)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Pressure", value: `${P.toFixed(2)} bar` },
    { label: "Temperature", value: `${T.toFixed(1)} K` },
    { label: "Critical Pressure", value: `${Pc.toFixed(2)} bar` },
    { label: "Critical Temperature", value: `${Tc.toFixed(1)} K` },
    { label: "Acentric Factor (ω)", value: `${omega.toFixed(3)}` },
    { label: "Reduced Pressure (Pr)", value: `${reducedPressure.toFixed(3)}` },
    { label: "Reduced Temperature (Tr)", value: `${reducedTemperature.toFixed(3)}` },
    { label: "B0 (Pitzer)", value: `${B0.toFixed(4)}` },
    { label: "B1 (Pitzer)", value: `${B1.toFixed(4)}` },
    { label: "B (second virial)", value: `${B.toFixed(4)}` },
    { label: "ln(φ)", value: `${lnPhi.toFixed(4)}` },
    { label: "Fugacity Coefficient (φ)", value: `${fugacityCoefficient.toFixed(4)}` },
    { label: "Fugacity", value: `${fugacity.toFixed(4)} bar` },
    { label: "Ideal Gas Fugacity", value: `${idealGasFugacity.toFixed(4)} bar` },
    { label: "Deviation from Ideal", value: `${((fugacity - idealGasFugacity) / idealGasFugacity * 100).toFixed(2)}%` },
  ];

  const summaryStats = [
    { label: "Fugacity", value: `${fugacity.toFixed(4)} bar` },
    { label: "Fugacity Coefficient", value: `${fugacityCoefficient.toFixed(4)}` },
    { label: "Reduced Pressure", value: `${reducedPressure.toFixed(3)}` },
    { label: "Reduced Temperature", value: `${reducedTemperature.toFixed(3)}` },
    { label: "Deviation from Ideal", value: `${((fugacity - idealGasFugacity) / idealGasFugacity * 100).toFixed(2)}%` },
  ];

  return {
    pressure: P, temperature: T, criticalPressure: Pc, criticalTemperature: Tc, acentricFactor: omega,
    reducedPressure, reducedTemperature, fugacityCoefficient, fugacity, idealGasFugacity,
    chartData, breakdown, summaryStats,
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function FugacityCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<FugacityResult | null>(null);
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
    { question: "What is fugacity?", answer: "Fugacity is a thermodynamic property that measures the 'effective pressure' of a real gas. It corrects the ideal gas law for intermolecular forces and molecular volume. For an ideal gas, fugacity equals pressure. For real gases, fugacity differs from pressure depending on the gas's deviation from ideal behavior." },
    { question: "What is the fugacity coefficient?", answer: "The fugacity coefficient (φ) is the ratio of fugacity to pressure: φ = f/P. For an ideal gas, φ = 1. For real gases, φ can be less than 1 (attractive forces dominate) or greater than 1 (repulsive forces dominate). At the critical point, φ approaches a characteristic value." },
    { question: "What is the Pitzer correlation?", answer: "The Pitzer correlation is a widely used method for estimating the fugacity coefficient of real gases using the reduced pressure, reduced temperature, and acentric factor. It uses the second virial coefficient B = B0 + ωB1, where B0 and B1 are functions of reduced temperature and ω is the acentric factor." },
    { question: "What is the acentric factor?", answer: "The acentric factor (ω) is a dimensionless measure of the non-sphericity of a molecule's intermolecular forces. It was defined by Kenneth Pitzer. Simple spherical molecules like argon have ω ≈ 0, while complex molecules like water have ω ≈ 0.344." },
    { question: "When does fugacity matter most?", answer: "Fugacity corrections are most important at high pressures and near the critical point, where real gases deviate most from ideal behavior. At low pressures and high temperatures, fugacity approaches pressure and the ideal gas assumption is valid." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator#engineering" },
          { label: "Fugacity Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Fugacity Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Beaker className="w-3.5 h-3.5" /> Gas Properties
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Pressure</label>
                  <div className="relative">
                    <input type="number" value={vals.pressure} onChange={(e) => updateVal("pressure", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">bar</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Temperature</label>
                  <div className="relative">
                    <input type="number" value={vals.temperature} onChange={(e) => updateVal("temperature", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">K</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Beaker className="w-3.5 h-3.5" /> Critical Properties
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Critical Pressure</label>
                  <div className="relative">
                    <input type="number" value={vals.criticalPressure} onChange={(e) => updateVal("criticalPressure", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">bar</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Critical Temperature</label>
                  <div className="relative">
                    <input type="number" value={vals.criticalTemperature} onChange={(e) => updateVal("criticalTemperature", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">K</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Acentric Factor (ω)</label>
                  <input type="number" value={vals.acentricFactor} onChange={(e) => updateVal("acentricFactor", e.target.value)} className="input-calc" step="0.001" />
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
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Fugacity
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{result.fugacity.toFixed(4)} bar</div>
                <p className="text-sm text-muted-foreground">
                  Fugacity Coefficient φ = {result.fugacityCoefficient.toFixed(4)} · Deviation: {((result.fugacity - result.idealGasFugacity) / result.idealGasFugacity * 100).toFixed(2)}%
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Fugacity</div>
                  <div className="text-lg font-bold text-foreground">{result.fugacity.toFixed(3)} bar</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">φ (Coefficient)</div>
                  <div className="text-lg font-bold text-foreground">{result.fugacityCoefficient.toFixed(4)}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Reduced P</div>
                  <div className="text-lg font-bold text-foreground">{result.reducedPressure.toFixed(3)}</div>
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
                <h3 className="text-sm font-semibold mb-3">Fugacity vs Pressure</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={result.chartData[i].fill} />
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
                      <span className="text-sm font-semibold text-foreground">{s.value}</span>
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
            <h2 className="text-2xl font-bold mb-3">Fugacity: Correcting the Ideal Gas Law</h2>
            <p>Fugacity is a fundamental concept in chemical thermodynamics that extends the ideal gas law to real gases. While the ideal gas law (PV = nRT) assumes no intermolecular forces and negligible molecular volume, real gases deviate from this behavior — especially at high pressures and near the critical point. Fugacity provides a corrected "effective pressure" that makes thermodynamic equations for real gases take the same form as those for ideal gases.</p>

            <h3>1. The Fugacity Coefficient</h3>
            <p>The fugacity coefficient (φ) is defined as φ = f/P, where f is the fugacity and P is the pressure. For an ideal gas, φ = 1 exactly. For real gases, φ deviates from 1 depending on the pressure, temperature, and molecular interactions. When φ &lt; 1, attractive forces dominate and the gas is easier to compress than an ideal gas. When φ &gt; 1, repulsive forces dominate and the gas is harder to compress.</p>

            <h3>2. The Pitzer Correlation</h3>
            <p>The Pitzer correlation is one of the most widely used methods for estimating fugacity coefficients. It uses the reduced pressure (Pr = P/Pc), reduced temperature (Tr = T/Tc), and the acentric factor (ω) to calculate the second virial coefficient B = B0 + ωB1. The fugacity coefficient is then φ = exp(B·Pr/Tr). This correlation is accurate to within about 1-2% for most gases at moderate pressures.</p>

            <h3>3. Practical Applications</h3>
            <p>Fugacity calculations are essential in chemical process design, particularly for: (1) Vapor-liquid equilibrium calculations in distillation and absorption columns; (2) Pipeline design for natural gas transport; (3) Reservoir engineering for oil and gas production; (4) Chemical reactor design where non-ideal gas behavior affects equilibrium conversions; and (5) Supercritical fluid extraction processes used in decaffeination and pharmaceutical manufacturing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fugacity-calculator" />
          <PopularCalculators exclude="/calculator/fugacity-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "hsl(var(--primary))", "#10b981", "#f59e0b"];