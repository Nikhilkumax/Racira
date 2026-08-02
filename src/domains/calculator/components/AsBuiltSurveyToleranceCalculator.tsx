"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Ruler, Target, MapPin, Compass } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface SurveyResult {
  linearTolerance: number;
  angularTolerance: number;
  closureError: number;
  closureRatio: number;
  relativeError: number;
  isWithinTolerance: boolean;
  standard: string;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  measuredDistance: "100",
  measuredAngle: "90",
  expectedDistance: "100",
  expectedAngle: "90",
  standard: "ASTM_E500",
  distanceUnit: "meters",
  angleUnit: "degrees",
};

const STANDARDS: Record<string, { name: string; linearFactor: number; angularFactor: number }> = {
  ASTM_E500: { name: "ASTM E500", linearFactor: 0.005, angularFactor: 5 },
  ALTA_NSPS: { name: "ALTA/NSPS", linearFactor: 0.002, angularFactor: 2 },
  ISO_4463: { name: "ISO 4463", linearFactor: 0.003, angularFactor: 3 },
  FGDC: { name: "FGDC", linearFactor: 0.005, angularFactor: 5 },
};

const calculate = (v: typeof DEFAULTS): SurveyResult => {
  const measuredDist = parseFloat(v.measuredDistance) || 0;
  const measuredAngle = parseFloat(v.measuredAngle) || 0;
  const expectedDist = parseFloat(v.expectedDistance) || 0;
  const expectedAngle = parseFloat(v.expectedAngle) || 0;
  const standard = STANDARDS[v.standard] || STANDARDS.ASTM_E500;

  const linearError = Math.abs(measuredDist - expectedDist);
  const angularError = Math.abs(measuredAngle - expectedAngle);

  const linearTolerance = expectedDist > 0 ? expectedDist * standard.linearFactor : 0;
  const angularTolerance = standard.angularFactor;

  const closureError = Math.sqrt(Math.pow(linearError, 2) + Math.pow(angularError * Math.PI / 180 * expectedDist, 2));
  const closureRatio = expectedDist > 0 ? closureError / expectedDist : 0;
  const relativeError = expectedDist > 0 ? (linearError / expectedDist) * 100 : 0;
  const isWithinTolerance = linearError <= linearTolerance && angularError <= angularTolerance;

  const chartData = [
    { name: "Measured", value: parseFloat(measuredDist.toFixed(2)), fill: "#3b82f6" },
    { name: "Expected", value: parseFloat(expectedDist.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Tolerance (±)", value: parseFloat(linearTolerance.toFixed(2)), fill: "#10b981" },
    { name: "Error", value: parseFloat(linearError.toFixed(2)), fill: "#ef4444" },
  ];

  const breakdown = [
    { label: "Measured Distance", value: `${measuredDist.toFixed(2)} ${vals.distanceUnit}` },
    { label: "Expected Distance", value: `${expectedDist.toFixed(2)} ${vals.distanceUnit}` },
    { label: "Linear Error", value: `${linearError.toFixed(4)} ${vals.distanceUnit}` },
    { label: "Measured Angle", value: `${measuredAngle.toFixed(2)} ${vals.angleUnit}` },
    { label: "Expected Angle", value: `${expectedAngle.toFixed(2)} ${vals.angleUnit}` },
    { label: "Angular Error", value: `${angularError.toFixed(2)} ${vals.angleUnit}` },
    { label: "Standard", value: standard.name },
    { label: "Linear Tolerance", value: `±${linearTolerance.toFixed(4)} ${vals.distanceUnit}` },
    { label: "Angular Tolerance", value: `±${angularTolerance.toFixed(1)} ${vals.angleUnit}` },
    { label: "Closure Error", value: `${closureError.toFixed(4)} ${vals.distanceUnit}` },
    { label: "Closure Ratio", value: `1:${closureRatio > 0 ? (1 / closureRatio).toFixed(0) : "∞"}` },
    { label: "Relative Error", value: `${relativeError.toFixed(4)}%` },
  ];

  const summaryStats = [
    { label: "Linear Error", value: `${linearError.toFixed(4)} ${vals.distanceUnit}` },
    { label: "Angular Error", value: `${angularError.toFixed(2)} ${vals.angleUnit}` },
    { label: "Within Tolerance", value: isWithinTolerance ? "Yes ✓" : "No ✗" },
    { label: "Closure Ratio", value: closureRatio > 0 ? `1:${(1 / closureRatio).toFixed(0)}` : "N/A" },
    { label: "Relative Error", value: `${relativeError.toFixed(4)}%` },
    { label: "Standard", value: standard.name },
  ];

  return {
    linearTolerance,
    angularTolerance,
    closureError,
    closureRatio,
    relativeError,
    isWithinTolerance,
    standard: standard.name,
    chartData,
    breakdown,
    summaryStats,
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

export default function AsBuiltSurveyToleranceCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<SurveyResult | null>(null);
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
    { question: "What is an as-built survey tolerance?", answer: "As-built survey tolerance is the allowable deviation between the as-built measurements of a constructed feature and its design specifications. It defines how close the actual construction must match the planned dimensions." },
    { question: "What is the closure ratio?", answer: "The closure ratio is the ratio of the total survey error to the total survey distance. A ratio of 1:10000 means that for every 10,000 units of distance measured, the error is 1 unit. Higher ratios indicate better survey accuracy." },
    { question: "What is ASTM E500?", answer: "ASTM E500 is a standard practice for collecting and reporting geodetic survey data. It defines acceptable tolerances for linear and angular measurements in construction and engineering surveys." },
    { question: "What is ALTA/NSPS?", answer: "ALTA/NSPS (American Land Title Association / National Society of Professional Surveyors) defines minimum standards for land title surveys in the United States. It specifies tighter tolerances than general construction surveys." },
    { question: "Why does angular error matter for linear measurements?", answer: "Angular errors compound over distance. A small angular error of 1 degree over 100 meters results in a linear offset of about 1.75 meters. This is why both linear and angular tolerances must be checked together." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Construction", href: "/calculator#construction" },
          { label: "As-Built Survey Tolerance Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          As-Built Survey Tolerance Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" /> Measurements
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Measured Distance</label>
                  <div className="relative">
                    <input type="number" value={vals.measuredDistance} onChange={(e) => updateVal("measuredDistance", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{vals.distanceUnit}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Expected Distance</label>
                  <div className="relative">
                    <input type="number" value={vals.expectedDistance} onChange={(e) => updateVal("expectedDistance", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{vals.distanceUnit}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Angular Measurements
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Measured Angle</label>
                  <div className="relative">
                    <input type="number" value={vals.measuredAngle} onChange={(e) => updateVal("measuredAngle", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{vals.angleUnit}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Expected Angle</label>
                  <div className="relative">
                    <input type="number" value={vals.expectedAngle} onChange={(e) => updateVal("expectedAngle", e.target.value)} className="input-calc" step="any" min="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{vals.angleUnit}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Survey Standard
              </h3>
              <select value={vals.standard} onChange={(e) => updateVal("standard", e.target.value)} className="input-calc">
                <option value="ASTM_E500">ASTM E500</option>
                <option value="ALTA_NSPS">ALTA/NSPS</option>
                <option value="ISO_4463">ISO 4463</option>
                <option value="FGDC">FGDC</option>
              </select>
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
              <div className={`border-l-4 rounded-lg p-5 ${result.isWithinTolerance ? "bg-emerald-500/10 border-emerald-500" : "bg-rose-500/10 border-rose-500"}`}>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Tolerance Check
                </div>
                <div className={`text-4xl font-bold ${result.isWithinTolerance ? "text-emerald-600" : "text-rose-600"}`}>
                  {result.isWithinTolerance ? "Within Tolerance" : "Outside Tolerance"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Standard: {result.standard}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Linear Error</div>
                  <div className="text-lg font-bold text-foreground">{result.linearTolerance.toFixed(4)}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Closure Ratio</div>
                  <div className="text-lg font-bold text-foreground">1:{result.closureRatio > 0 ? (1 / result.closureRatio).toFixed(0) : "∞"}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Relative Error</div>
                  <div className={`text-lg font-bold ${result.relativeError > 1 ? "text-rose-600" : "text-emerald-600"}`}>{result.relativeError.toFixed(4)}%</div>
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
                <h3 className="text-sm font-semibold mb-3">Measurement vs Tolerance</h3>
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
                      <span className={`text-sm font-semibold ${s.label === "Within Tolerance" && s.value.includes("Yes") ? "text-emerald-600" : s.label === "Within Tolerance" && s.value.includes("No") ? "text-rose-600" : "text-foreground"}`}>{s.value}</span>
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
            <h2 className="text-2xl font-bold mb-3">As-Built Survey Tolerance: Ensuring Construction Accuracy</h2>
            <p>As-built surveys are critical for verifying that constructed features match their design specifications. Survey tolerances define the acceptable range of deviation between measured and designed values. Exceeding these tolerances can result in costly rework, structural issues, or project delays. This calculator helps surveyors and engineers quickly determine whether their measurements fall within acceptable tolerances based on industry standards.</p>

            <h3>1. Linear Tolerance</h3>
            <p>Linear tolerance is the maximum allowable deviation in distance measurements. It is typically expressed as a fraction of the measured distance (e.g., 1:5000 or 0.005 of the distance). For a 100-meter distance measured with a 0.005 tolerance, the allowable error is ±0.5 meters. Tighter tolerances are required for precision construction such as bridge piers, tunnel alignments, and high-rise building cores.</p>

            <h3>2. Angular Tolerance</h3>
            <p>Angular tolerance is the maximum allowable deviation in angle measurements, typically expressed in seconds of arc or degrees. A common tolerance for construction surveys is ±5 seconds of arc (approximately ±0.0014 degrees). Angular errors compound over distance, so a 1-second error over 100 meters creates a linear offset of about 0.5 millimeters.</p>

            <h3>3. Closure Error and Ratio</h3>
            <p>The closure error is the total discrepancy between the measured and expected positions, combining both linear and angular errors. The closure ratio (e.g., 1:10000) expresses this error relative to the total survey distance. Higher ratios indicate better survey quality. For construction surveys, a closure ratio of 1:5000 to 1:20000 is typical depending on the project requirements.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/as-built-survey-tolerance-calculator" />
          <PopularCalculators exclude="/calculator/as-built-survey-tolerance-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "hsl(var(--primary))", "#10b981", "#ef4444"];