"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type AngleUnit = "degrees" | "radians" | "gradians" | "turns";

interface AngleInputs {
  value: string;
  fromUnit: AngleUnit;
  decimals: string;
}

interface AngleResult {
  degrees: number;
  radians: number;
  gradians: number;
  turns: number;
  dms: { degrees: number; minutes: number; seconds: number };
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { unit: string; value: number; fill: string }[];
}

const TO_DEG: Record<AngleUnit, number> = {
  degrees: 1,
  radians: 180 / Math.PI,
  gradians: 0.9,
  turns: 360,
};

function calcAngle(inputs: AngleInputs): AngleResult {
  const rawValue = parseFloat(inputs.value);
  const value = Number.isFinite(rawValue) ? rawValue : 0;
  const rawDecimals = parseInt(inputs.decimals);
  const decimals = Number.isFinite(rawDecimals) ? Math.max(0, Math.min(10, rawDecimals)) : 4;
  const fromUnit: AngleUnit = inputs.fromUnit || "degrees";

  const deg = value * TO_DEG[fromUnit];
  const rad = deg * (Math.PI / 180);
  const grad = deg / 0.9;
  const turns = deg / 360;

  const absDeg = Math.abs(deg);
  const d = Math.floor(absDeg);
  const m = Math.floor((absDeg - d) * 60);
  const s = ((absDeg - d) * 60 - m) * 60;

  const r = (n: number) => parseFloat(n.toFixed(decimals));

  const breakdown = [
    { label: "Input Value", value: `${r(value)} ${fromUnit}` },
    { label: "Degrees (°)", value: `${r(deg)}°` },
    { label: "Radians (rad)", value: `${r(rad)} rad` },
    { label: "Gradians (grad)", value: `${r(grad)} grad` },
    { label: "Turns", value: `${r(turns)}` },
    { label: "DMS", value: `${d}° ${m}′ ${r(s)}″` },
  ];

  const summaryStats = [
    { label: "Degrees", value: `${r(deg)}°` },
    { label: "Radians", value: `${r(rad)}` },
    { label: "Gradians", value: `${r(grad)}` },
    { label: "Turns", value: `${r(turns)}` },
    { label: "DMS", value: `${d}°${m}′${r(s)}″` },
    { label: "Input Unit", value: fromUnit },
  ];

  const chartData = [
    { unit: "Degrees", value: r(deg), fill: "#3b82f6" },
    { unit: "Radians", value: r(rad), fill: "#10b981" },
    { unit: "Gradians", value: r(grad), fill: "#f59e0b" },
    { unit: "Turns", value: r(turns), fill: "#8b5cf6" },
  ];

  return {
    degrees: r(deg),
    radians: r(rad),
    gradians: r(grad),
    turns: r(turns),
    dms: { degrees: d, minutes: m, seconds: r(s) },
    breakdown,
    summaryStats,
    chartData,
  };
}

const DEFAULTS: AngleInputs = { value: "45", fromUnit: "degrees", decimals: "4" };

export default function AngleConverterAdvanced() {
  const [inputs, setInputs] = useState<AngleInputs>(DEFAULTS);
  const [result, setResult] = useState<AngleResult>(calcAngle(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);

  useEffect(() => {
    setResult(calcAngle(inputs));
  }, []);

  const calculate = () => setResult(calcAngle(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcAngle(DEFAULTS));
  };

  const update = (patch: Partial<AngleInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How many degrees are in one radian?", answer: "One radian equals approximately 57.2958 degrees. The conversion is: degrees = radians × (180 / π). Conversely, radians = degrees × (π / 180)." },
    { question: "What is a gradian?", answer: "A gradian (or gon) is a unit where a full circle is 400 gradians. One gradian equals 0.9 degrees. Gradians are commonly used in surveying and European engineering." },
    { question: "What is a turn?", answer: "A turn (or revolution) is a full 360-degree rotation. 1 turn = 360° = 2π radians = 400 gradians. It's used in engineering and rotational mechanics." },
    { question: "How do I convert degrees to DMS?", answer: "DMS (Degrees, Minutes, Seconds) breaks a decimal degree into whole degrees, minutes (1/60 of a degree), and seconds (1/60 of a minute). For example, 45.5° = 45° 30′ 0″." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Angle Converter Advanced" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Angle Converter Advanced</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Value</label>
                <div className={inp}><input type="number" value={inputs.value} onChange={e => update({ value: e.target.value })} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">From Unit</label>
                <div className={inp}>
                  <select value={inputs.fromUnit} onChange={e => update({ fromUnit: e.target.value as AngleUnit })} className={ci}>
                    <option value="degrees">Degrees (°)</option>
                    <option value="radians">Radians (rad)</option>
                    <option value="gradians">Gradians (grad)</option>
                    <option value="turns">Turns</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => setShowAdv(!showAdv)} className="text-sm text-primary font-medium text-left">
              Advanced Options {showAdv ? "▲" : "▼"}
            </button>
            {showAdv && (
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Precision</div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Decimal Places</label>
                  <div className={inp}><input type="number" value={inputs.decimals} onChange={e => update({ decimals: e.target.value })} min={0} max={10} className={ci} /></div>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Converted Angle</div>
              <div className="text-4xl font-extrabold tracking-tight text-primary">{result.degrees}°</div>
              <div className="text-sm text-muted-foreground mt-1">{result.radians} rad · {result.gradians} grad · {result.turns} turns</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Radians", `${result.radians}`], ["Gradians", `${result.gradians}`], ["Turns", `${result.turns}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Conversion Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-primary/5" : ""}`}>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Angle in All Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v, "Value"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an Angle Converter?</h2>
              <p className="text-muted-foreground leading-relaxed">An angle converter is a tool that translates angular measurements between different units of rotation. The four most common units are degrees, radians, gradians, and turns. A full circle contains 360 degrees, 2π radians (approximately 6.2832), 400 gradians, or exactly 1 turn. Engineers, mathematicians, surveyors, and physicists frequently switch between these units depending on the problem domain. Radians are the natural unit for calculus and trigonometry, degrees are standard for everyday geometry, gradians appear in surveying, and turns simplify rotational mechanics calculations.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">This converter first translates your input value into degrees using a unit-specific factor, then converts from degrees to every other unit. The conversion formulas are: degrees = radians × (180/π), degrees = gradians × 0.9, and degrees = turns × 360. Once the degree value is known, the reverse conversions apply: radians = degrees × (π/180), gradians = degrees / 0.9, and turns = degrees / 360. The tool also produces a DMS (degrees, minutes, seconds) breakdown, where 1 degree equals 60 minutes and 1 minute equals 60 seconds. This is useful for navigation, astronomy, and precision machining where fractional degrees are expressed in sexagesimal notation.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result card shows your angle in degrees, with the equivalent values in radians, gradians, and turns displayed below. The 3-stat bar gives a quick comparison across the three non-degree units. The breakdown table includes the DMS representation, which splits decimal degrees into whole degrees, minutes, and seconds. The bar chart visualizes the relative magnitude in each unit system, helping you intuitively see how the same angle scales differently across units. Adjust the decimal places in Advanced Options to control rounding precision for all outputs.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/angle-converter-advanced" />
          <PopularCalculators exclude="/calculator/angle-converter-advanced" />
        </div>
      </div>
    </>
  );
}
