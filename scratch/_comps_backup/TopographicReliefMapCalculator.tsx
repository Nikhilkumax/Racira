"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Map as MapIcon, Ruler } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

type UnitSystem = "imperial" | "metric";
type TerrainClass = "flat" | "gentle" | "rolling" | "hilly" | "mountainous" | "alpine";

interface TerrainSpec {
  key: TerrainClass;
  label: string;
  maxSlopePercent: number;
  color: string;
  note: string;
}

interface ReliefInputs {
  unitSystem: UnitSystem;
  maxElevation: number;
  minElevation: number;
  horizontalDistance: number;
  contourInterval: number;
  mapScaleDenominator: number;
  proMode: boolean;
  verticalExaggeration: number;
  profileSamples: number;
}

interface ChartPoint {
  name: string;
  value: number;
  color: string;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface ReliefResult {
  relief: number;
  slopePercent: number;
  slopeDegrees: number;
  slopeRatio: string;
  gradientFtPerMile: number;
  contourCount: number;
  contourSpacingMapMm: number;
  terrain: TerrainSpec;
  reliefRatio: number;
  exaggeratedRelief: number;
  apparentSlopeDegrees: number;
  mapDistanceMm: number;
  unitLabel: string;
  distanceUnitLabel: string;
  chartData: ChartPoint[];
  rows: TableRow[];
}

const TERRAINS: TerrainSpec[] = [
  { key: "flat", label: "Flat / Level", maxSlopePercent: 2, color: "#16a34a", note: "Essentially level ground. Drainage design governs rather than grading; suitable for any construction without cut and fill." },
  { key: "gentle", label: "Gently Sloping", maxSlopePercent: 5, color: "#65a30d", note: "Gentle grade well within accessible route limits. Standard road and foundation practice applies with minimal earthwork." },
  { key: "rolling", label: "Rolling", maxSlopePercent: 10, color: "#f59e0b", note: "Rolling terrain. Vehicle access remains straightforward but sustained grades approach highway maxima and terracing may help." },
  { key: "hilly", label: "Hilly", maxSlopePercent: 20, color: "#f97316", note: "Hilly ground. Switchbacks, retaining structures, and significant cut and fill become necessary for roads and building pads." },
  { key: "mountainous", label: "Mountainous", maxSlopePercent: 40, color: "#dc2626", note: "Mountainous. Erosion risk is high, machinery access is limited, and specialized foundation and slope stabilization design is required." },
  { key: "alpine", label: "Alpine / Cliff", maxSlopePercent: Number.POSITIVE_INFINITY, color: "#991b1b", note: "Alpine or near-cliff gradient. Beyond the angle of repose for most soils; expect exposed rock, rockfall hazard, and technical access." },
];

const FEET_PER_METER = 3.28084;
const FEET_PER_MILE = 5280;
const METERS_PER_KM = 1000;

function terrainFor(slopePercent: number): TerrainSpec {
  const abs = Math.abs(slopePercent);
  return TERRAINS.find((t) => abs <= t.maxSlopePercent) ?? TERRAINS[TERRAINS.length - 1];
}

const DEFAULTS: ReliefInputs = {
  unitSystem: "imperial",
  maxElevation: 3200,
  minElevation: 1450,
  horizontalDistance: 4.2,
  contourInterval: 40,
  mapScaleDenominator: 24000,
  proMode: false,
  verticalExaggeration: 2,
  profileSamples: 6,
};

function calculateRelief(inputs: ReliefInputs): ReliefResult {
  const imperial = inputs.unitSystem === "imperial";
  const unitLabel = imperial ? "ft" : "m";
  const distanceUnitLabel = imperial ? "mi" : "km";

  const relief = inputs.maxElevation - inputs.minElevation;

  // Put rise and run in the same unit before taking the ratio.
  const runInElevationUnits = imperial
    ? inputs.horizontalDistance * FEET_PER_MILE
    : inputs.horizontalDistance * METERS_PER_KM;

  const slopeRatioRaw = runInElevationUnits > 0 ? relief / runInElevationUnits : 0;
  const slopePercent = slopeRatioRaw * 100;
  const slopeDegrees = (Math.atan(slopeRatioRaw) * 180) / Math.PI;
  const runPerRise = slopeRatioRaw !== 0 ? 1 / slopeRatioRaw : 0;
  const slopeRatio = slopeRatioRaw !== 0 ? `1 : ${runPerRise.toFixed(1)}` : "Level";

  // Gradient expressed the way survey and hydrology reports usually quote it.
  const gradientFtPerMile = imperial
    ? inputs.horizontalDistance > 0
      ? relief / inputs.horizontalDistance
      : 0
    : inputs.horizontalDistance > 0
      ? (relief * FEET_PER_METER) / (inputs.horizontalDistance / 1.609344)
      : 0;

  const contourCount =
    inputs.contourInterval > 0 ? Math.floor(Math.abs(relief) / inputs.contourInterval) : 0;

  // Ground distance between successive contours, then that distance on the printed sheet.
  const groundRunPerContour =
    slopeRatioRaw !== 0 && inputs.contourInterval > 0 ? inputs.contourInterval / slopeRatioRaw : 0;
  const groundRunPerContourMeters = imperial ? groundRunPerContour / FEET_PER_METER : groundRunPerContour;
  const contourSpacingMapMm =
    inputs.mapScaleDenominator > 0 ? (groundRunPerContourMeters * 1000) / inputs.mapScaleDenominator : 0;

  const runMeters = imperial ? runInElevationUnits / FEET_PER_METER : runInElevationUnits;
  const mapDistanceMm =
    inputs.mapScaleDenominator > 0 ? (runMeters * 1000) / inputs.mapScaleDenominator : 0;

  const terrain = terrainFor(slopePercent);

  // Relief ratio (Melton-style): relief divided by horizontal extent, dimensionless.
  const reliefRatio = runInElevationUnits > 0 ? relief / runInElevationUnits : 0;

  const exaggeration = inputs.verticalExaggeration > 0 ? inputs.verticalExaggeration : 1;
  const exaggeratedRelief = relief * exaggeration;
  const apparentSlopeDegrees = (Math.atan(slopeRatioRaw * exaggeration) * 180) / Math.PI;

  const num = (v: number, d = 1) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const chartData: ChartPoint[] = TERRAINS.slice(0, 5).map((t) => ({
    name: t.label.split(" ")[0],
    value: t.maxSlopePercent,
    color: t.key === terrain.key ? t.color : "#cbd5e1",
  }));
  chartData.push({
    name: "Yours",
    value: Math.round(Math.abs(slopePercent) * 10) / 10,
    color: terrain.color,
  });

  const rows: TableRow[] = [
    { label: "Maximum Elevation", value: `${num(inputs.maxElevation, 0)} ${unitLabel}` },
    { label: "Minimum Elevation", value: `${num(inputs.minElevation, 0)} ${unitLabel}` },
    { label: "Total Relief", value: `${num(relief, 0)} ${unitLabel}`, key: true },
    { label: "Horizontal Distance", value: `${num(inputs.horizontalDistance, 2)} ${distanceUnitLabel}` },
    { label: "Average Slope", value: `${num(slopePercent, 2)}%`, key: true },
    { label: "Slope in Degrees", value: `${num(slopeDegrees, 2)}°` },
    { label: "Rise : Run Ratio", value: slopeRatio },
    { label: "Gradient", value: `${num(gradientFtPerMile, 0)} ft/mi` },
    { label: "Contour Interval", value: `${num(inputs.contourInterval, 0)} ${unitLabel}` },
    { label: "Contour Lines Crossed", value: `${contourCount.toLocaleString("en-US")} lines` },
    { label: "Contour Spacing on Map", value: `${num(contourSpacingMapMm, 2)} mm` },
    { label: "Terrain Classification", value: terrain.label, key: true },
  ];

  return {
    relief,
    slopePercent,
    slopeDegrees,
    slopeRatio,
    gradientFtPerMile,
    contourCount,
    contourSpacingMapMm,
    terrain,
    reliefRatio,
    exaggeratedRelief,
    apparentSlopeDegrees,
    mapDistanceMm,
    unitLabel,
    distanceUnitLabel,
    chartData,
    rows,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function TopographicReliefMapCalculator() {
  const [inputs, setInputs] = useState<ReliefInputs>(DEFAULTS);
  const [result, setResult] = useState<ReliefResult>(calculateRelief(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateRelief(inputs));
  }, []);

  const calculate = () => setResult(calculateRelief(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateRelief(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof ReliefInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const changeUnits = (system: UnitSystem) => {
    setInputs((prev) => {
      if (prev.unitSystem === system) return prev;
      const toMetric = system === "metric";
      const conv = (v: number) => (toMetric ? v / FEET_PER_METER : v * FEET_PER_METER);
      const distConv = (v: number) => (toMetric ? v * 1.609344 : v / 1.609344);
      return {
        ...prev,
        unitSystem: system,
        maxElevation: Math.round(conv(prev.maxElevation)),
        minElevation: Math.round(conv(prev.minElevation)),
        contourInterval: Math.max(1, Math.round(conv(prev.contourInterval))),
        horizontalDistance: Math.round(distConv(prev.horizontalDistance) * 100) / 100,
      };
    });
  };

  const fmt = (v: number, d = 1) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const faqs = [
    {
      question: "What is topographic relief?",
      answer:
        "Relief is the difference in elevation between the highest and lowest points in an area, and it is reported as a single vertical distance. A basin with peaks at 3200 feet and a valley floor at 1450 feet has 1750 feet of relief. Relief describes vertical range only and says nothing about how abruptly the change occurs, which is why it is nearly always paired with slope or gradient to convey the character of the terrain.",
    },
    {
      question: "How is average slope calculated from a topographic map?",
      answer:
        "Divide the vertical rise by the horizontal run, with both in the same unit, then convert. The catch is that maps mix units freely: elevation in feet, distance in miles. A rise of 1750 feet over 4.2 miles means dividing by 22,176 feet, giving a ratio of 0.0789 or 7.89%. Taking the arctangent of that same ratio yields 4.51 degrees. Percent and degrees are not interchangeable, and the difference widens sharply above about 20%.",
    },
    {
      question: "What is a contour interval and how do I choose one?",
      answer:
        "The contour interval is the fixed elevation difference between adjacent contour lines. USGS 7.5-minute quadrangles commonly use 40 feet in mountainous terrain, 20 feet in moderate relief, and 10 feet or less on flat ground. The interval is chosen so lines are legible without merging: too small an interval in steep terrain produces an unreadable dark mass, while too large an interval on flat ground shows almost no lines at all.",
    },
    {
      question: "Why does contour spacing on the printed map matter?",
      answer:
        "Contour lines separated by less than about 0.3 millimetres on paper will visually merge and print as a solid band. This calculator converts your slope and contour interval into actual millimetres at your map scale, which tells you whether the interval is legible before you commit to it. If spacing comes out below roughly half a millimetre, the standard fix is a larger contour interval, a larger map scale, or supplementary hillshading.",
    },
    {
      question: "What is vertical exaggeration and when should I use it?",
      answer:
        "Vertical exaggeration stretches the vertical axis of a cross-section relative to the horizontal so subtle landforms become visible. A factor of 2 to 5 is common for regional profiles; geological cross-sections sometimes use 10 or more. The cost is distortion: apparent slope angles no longer match reality, and a 5 degree hillside can look like a 25 degree escarpment. Any profile using exaggeration should state the factor, and Professional Mode reports both true and apparent angles here.",
    },
    {
      question: "What slope is too steep to build on?",
      answer:
        "Grades under 5% suit most construction with routine grading. Between 10% and 20% you enter the range where retaining structures, stepped foundations, and switchback access become necessary. Above 30% the cost of earthwork and stabilization rises steeply, and many jurisdictions impose additional geotechnical review or prohibit development outright. Beyond about 35 to 40% you are past the angle of repose for most unconsolidated soils.",
    },
    {
      question: "What does the relief ratio tell me?",
      answer:
        "The relief ratio divides total relief by horizontal extent, producing a dimensionless number that allows watersheds of different sizes to be compared directly. Higher values indicate steeper, more energetic basins where runoff concentrates quickly and sediment yield tends to be greater. It is one of a family of morphometric measures, alongside drainage density and hypsometric integral, used to characterize basins in geomorphology and hydrology.",
    },
    {
      question: "How does map scale relate to what I can measure?",
      answer:
        "A scale of 1:24,000 means one unit on the map equals 24,000 on the ground, so one inch represents 2000 feet. Larger scales, meaning smaller denominators, show more detail over less area. Scale also caps measurement precision: a line drawn 0.2 millimetres wide covers nearly 5 metres of ground at 1:24,000, which sets a practical floor on how finely any distance or contour position can be resolved from the sheet.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Construction", href: "/calculator#construction" },
          { label: "Topographic Relief Map Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Topographic Relief Map Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="maxElevation" className={lbl}>Max Elevation ({result.unitLabel})</label>
                <input id="maxElevation" type="number" step="10" className={inp} value={inputs.maxElevation}
                  onChange={(e) => setNum("maxElevation", e.target.value)} />
              </div>
              <div>
                <label htmlFor="minElevation" className={lbl}>Min Elevation ({result.unitLabel})</label>
                <input id="minElevation" type="number" step="10" className={inp} value={inputs.minElevation}
                  onChange={(e) => setNum("minElevation", e.target.value)} />
              </div>
              <div>
                <label htmlFor="horizontalDistance" className={lbl}>Horizontal Distance ({result.distanceUnitLabel})</label>
                <input id="horizontalDistance" type="number" min="0" step="0.1" className={inp}
                  value={inputs.horizontalDistance} onChange={(e) => setNum("horizontalDistance", e.target.value)} />
              </div>
              <div>
                <label htmlFor="contourInterval" className={lbl}>Contour Interval ({result.unitLabel})</label>
                <input id="contourInterval" type="number" min="1" step="5" className={inp}
                  value={inputs.contourInterval} onChange={(e) => setNum("contourInterval", e.target.value)} />
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced ? (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <MapIcon className="h-3.5 w-3.5" /> Units &amp; Map Scale
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="unitSystem" className={lbl}>Unit System</label>
                        <select id="unitSystem" className={inp} value={inputs.unitSystem}
                          onChange={(e) => changeUnits(e.target.value as UnitSystem)}>
                          <option value="imperial">Feet / Miles</option>
                          <option value="metric">Metres / Kilometres</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="mapScaleDenominator" className={lbl}>Map Scale (1 : n)</label>
                        <input id="mapScaleDenominator" type="number" min="1" step="1000" className={inp}
                          value={inputs.mapScaleDenominator}
                          onChange={(e) => setNum("mapScaleDenominator", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Ruler className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock profile exaggeration and morphometry
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="verticalExaggeration" className={lbl}>Vertical Exaggeration (×)</label>
                          <input id="verticalExaggeration" type="number" min="1" step="0.5" className={inp}
                            value={inputs.verticalExaggeration}
                            onChange={(e) => setNum("verticalExaggeration", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="profileSamples" className={lbl}>Profile Sample Points</label>
                          <input id="profileSamples" type="number" min="2" step="1" className={inp}
                            value={inputs.profileSamples} onChange={(e) => setNum("profileSamples", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Relief</div>
              <div className="text-4xl font-bold text-primary">
                {fmt(result.relief, 0)} {result.unitLabel}
              </div>
              <div className="text-sm text-muted-foreground">
                {fmt(result.slopePercent, 2)}% average slope ({fmt(result.slopeDegrees, 2)}°) over {fmt(inputs.horizontalDistance, 2)} {result.distanceUnitLabel} — {result.terrain.label}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Slope</div>
                <div className="text-lg font-bold" style={{ color: result.terrain.color }}>{fmt(result.slopePercent, 1)}%</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Degrees</div>
                <div className="text-lg font-bold text-amber-600">{fmt(result.slopeDegrees, 2)}°</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Contours</div>
                <div className="text-lg font-bold text-emerald-600">{result.contourCount.toLocaleString("en-US")}</div>
              </div>
            </div>

            <div className="rounded-lg border-l-4 p-4 bg-card border border-border" style={{ borderLeftColor: result.terrain.color }}>
              <div className="text-sm font-bold text-foreground mb-1">{result.terrain.label} Terrain</div>
              <p className="text-sm text-muted-foreground">{result.terrain.note}</p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Parameter</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Relief over Distance</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">
                      {fmt(result.relief, 0)} {result.unitLabel} / {fmt(inputs.horizontalDistance, 2)} {result.distanceUnitLabel}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Your Slope Against Terrain Class Limits (%)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v: number) => `${v}%`} />
                    <RTooltip formatter={(value: number) => [`${value}%`, "Slope"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: result.terrain.color }} /> Your slope &amp; matched class
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm bg-slate-300" /> Class upper limits
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Profile Construction &amp; Morphometry</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Exaggerated Relief</div>
                    <div className="text-base font-bold text-foreground">
                      {fmt(result.exaggeratedRelief, 0)} {result.unitLabel} at {fmt(inputs.verticalExaggeration, 1)}×
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Apparent Slope on Profile</div>
                    <div className="text-base font-bold text-amber-600">{fmt(result.apparentSlopeDegrees, 2)}°</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">True Slope</div>
                    <div className="text-base font-bold text-foreground">{fmt(result.slopeDegrees, 2)}°</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Relief Ratio</div>
                    <div className="text-base font-bold text-foreground">{result.reliefRatio.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Transect Length on Map</div>
                    <div className="text-base font-bold text-foreground">{fmt(result.mapDistanceMm, 1)} mm</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Elevation per Sample</div>
                    <div className="text-base font-bold text-foreground">
                      {fmt(inputs.profileSamples > 1 ? result.relief / (inputs.profileSamples - 1) : 0, 1)} {result.unitLabel}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Legibility Check</div>
                    <div className="text-sm text-muted-foreground">
                      {result.contourSpacingMapMm < 0.3
                        ? `At ${fmt(result.contourSpacingMapMm, 2)} mm apart, contours will merge into a solid band at 1:${inputs.mapScaleDenominator.toLocaleString("en-US")}. Increase the contour interval or move to a larger map scale.`
                        : `Contours land ${fmt(result.contourSpacingMapMm, 2)} mm apart at 1:${inputs.mapScaleDenominator.toLocaleString("en-US")}, which prints legibly. Spacing below roughly 0.3 mm is where lines begin to merge.`}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Relief, Slope, and Why They Are Not the Same Thing</h2>
            <p className="mb-4">
              Relief is the simplest terrain measurement there is: subtract the lowest elevation from the highest. What it
              deliberately omits is any sense of how that change is distributed. Two areas can share 1750 feet of relief
              while one rises steadily across four miles and the other sits flat for three and a half miles before hitting a
              cliff. Slope supplies the missing dimension by dividing rise by run, and the two figures together are what
              actually characterize terrain. Reporting relief alone is a common way to make gentle country sound rugged.
            </p>

            <h2 className="text-2xl font-bold mb-3">Getting the Units Right Before Dividing</h2>
            <p className="mb-4">
              The most frequent error in slope calculation comes from mixing units without noticing. Topographic maps label
              elevation in feet and distance in miles, and dividing one by the other directly produces a number that means
              nothing. The run must be converted first: 4.2 miles is 22,176 feet, and only then does dividing 1750 by it
              yield the true ratio of 0.0789. Percent slope is that ratio times a hundred; degrees require its arctangent.
              The two diverge slowly at first, with 7.89% corresponding to 4.51 degrees, then sharply higher up — 100% slope
              is 45 degrees, not 90.
            </p>

            <h2 className="text-2xl font-bold mb-3">Choosing a Contour Interval That Prints</h2>
            <p className="mb-4">
              A contour interval is a compromise between detail and legibility. USGS 7.5-minute quadrangles use 40 feet in
              mountains, 20 feet in moderate relief, and 10 feet or finer on plains, precisely because the right interval
              depends on how steep the ground is. On a steep slope, closely spaced contours converge on paper until they
              print as a solid black mass; on flat ground, a coarse interval yields a nearly blank sheet. The practical test
              is millimetres on the printed page. Below roughly 0.3 millimetres of separation lines merge, and this
              calculator converts your slope, interval, and map scale into that figure directly so the interval can be
              checked before the sheet is drawn.
            </p>

            <h2 className="text-2xl font-bold mb-3">Vertical Exaggeration and Honest Profiles</h2>
            <p className="mb-4">
              Cross-sections drawn at true scale often look disappointingly flat, because horizontal extent usually dwarfs
              vertical range. Stretching the vertical axis by a factor of two to five makes landforms readable, and
              geological sections sometimes go to ten or beyond. The price is that every angle on the drawing is now false:
              a genuine 4.5 degree grade can present as a 24 degree escarpment at 5× exaggeration. That is acceptable when
              the goal is showing structure, and misleading when someone reads slope angles off the figure. Any exaggerated
              profile should state its factor prominently, which is why both the true and apparent angles are reported side
              by side in Professional Mode.
            </p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/topographic-relief-map-calculator" />
          <PopularCalculators exclude="/calculator/topographic-relief-map-calculator" />
        </div>
      </div>
    </>
  );
}

