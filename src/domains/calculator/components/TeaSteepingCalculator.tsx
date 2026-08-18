"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface SteepInputs {
  teaId: string;
  volume: number;    // ml
  waterTemp: number; // °C
  steepTime: number; // minutes
  altitude: number;  // meters
  leafRatio: number; // grams per 240 ml cup
}

interface TeaInfo {
  id: string;
  label: string;
  temp: number;
  timeMin: number;
  timeMax: number;
  leaves: number;
  note: string;
}

interface SteepResults {
  tea: TeaInfo;
  leavesG: number;
  tempDiff: number;
  localBoil: number;
  verdict: string;
  overMin: number;
  underMin: number;
  tooHot: boolean;
  tooCold: boolean;
  tempNote: string;
  chartData: { name: string; temp: number; selected: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const TEAS: TeaInfo[] = [
  { id: "white", label: "White Tea", temp: 75, timeMin: 2, timeMax: 3, leaves: 4, note: "Delicate — cooler water preserves floral notes" },
  { id: "green", label: "Green Tea", temp: 80, timeMin: 2, timeMax: 3, leaves: 4, note: "Hotter or longer steeping brings bitterness" },
  { id: "oolong", label: "Oolong Tea", temp: 90, timeMin: 3, timeMax: 5, leaves: 5, note: "Rolled leaves need warmer water to open" },
  { id: "black", label: "Black Tea", temp: 95, timeMin: 3, timeMax: 5, leaves: 4, note: "Fully oxidized — tolerates near-boiling water" },
  { id: "herbal", label: "Herbal / Tisane", temp: 100, timeMin: 5, timeMax: 7, leaves: 5, note: "No caffeine; steep long for full flavor" },
];

function calcSteep(i: SteepInputs): SteepResults {
  const tea = TEAS.find((t) => t.id === i.teaId) ?? TEAS[0];
  const leavesG = (i.leafRatio * i.volume) / 240;
  const tempDiff = i.waterTemp - tea.temp;
  const localBoil = 100 - i.altitude / 300;
  const overMin = i.steepTime > tea.timeMax ? i.steepTime - tea.timeMax : 0;
  const underMin = i.steepTime < tea.timeMin ? tea.timeMin - i.steepTime : 0;
  let verdict: string;
  if (overMin > 0) verdict = "Over-steeped";
  else if (underMin > 0) verdict = "Under-steeped";
  else verdict = "Optimal";
  const tooHot = i.waterTemp > tea.temp + 10 || i.waterTemp > localBoil;
  const tooCold = i.waterTemp < tea.temp - 5;
  const tempNote = tooHot ? "too hot — may scorch leaves" : tooCold ? "too cool — flavor will be weak" : "ideal";

  const chartData = TEAS.map((t) => ({
    name: t.label.split(" ")[0],
    temp: t.temp,
    selected: t.id === tea.id,
  }));

  const breakdown = [
    { label: "Tea Type", value: tea.label },
    { label: "Recommended Temperature", value: `${tea.temp}°C` },
    { label: "Recommended Time", value: `${tea.timeMin}–${tea.timeMax} min` },
    { label: "Your Water Temperature", value: `${i.waterTemp}°C (${tempDiff >= 0 ? "+" : ""}${tempDiff.toFixed(0)} vs ideal)` },
    { label: "Local Boiling Point", value: `${localBoil.toFixed(0)}°C` },
    { label: `Leaf Amount (for ${i.volume} ml)`, value: `${leavesG.toFixed(1)} g` },
    { label: "Steeping Verdict", value: verdict, highlight: true, isTotal: true },
  ];

  const summaryStats = [
    { label: "Tea", value: tea.label },
    { label: "Verdict", value: verdict },
    { label: "Steeping Time", value: `${i.steepTime} min (ideal ${tea.timeMin}–${tea.timeMax})` },
    { label: "Water Temperature", value: `${i.waterTemp}°C (ideal ${tea.temp}°C)` },
    { label: "Local Boiling Point", value: `${localBoil.toFixed(0)}°C` },
    { label: "Leaf Amount", value: `${leavesG.toFixed(1)} g` },
    { label: `Servings (${i.volume} ml)`, value: `${Math.max(1, Math.round(i.volume / 240))} cup(s)` },
    { label: "Brewing Note", value: tea.note },
  ];

  return { tea, leavesG, tempDiff, localBoil, verdict, overMin, underMin, tooHot, tooCold, tempNote, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  teaId: "green",
  volume: "240",
  waterTemp: "80",
  steepTime: "2.5",
  altitude: "0",
  leafRatio: "4",
};

// 4. Component
export default function TeaSteepingCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<SteepResults>(() => calcSteep({ teaId: "green", volume: 240, waterTemp: 80, steepTime: 2.5, altitude: 0, leafRatio: 4 }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcSteep({ teaId: "green", volume: 240, waterTemp: 80, steepTime: 2.5, altitude: 0, leafRatio: 4 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const build = (): SteepInputs => ({
    teaId: inputs.teaId,
    volume: parseFloat(inputs.volume) || 0,
    waterTemp: parseFloat(inputs.waterTemp) || 0,
    steepTime: parseFloat(inputs.steepTime) || 0,
    altitude: parseFloat(inputs.altitude) || 0,
    leafRatio: parseFloat(inputs.leafRatio) || 0,
  });

  const calculate = () => setResult(calcSteep(build()));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcSteep({ teaId: "green", volume: 240, waterTemp: 80, steepTime: 2.5, altitude: 0, leafRatio: 4 }));
  };

  const selectTea = (id: string) => {
    const t = TEAS.find((x) => x.id === id) ?? TEAS[0];
    setInputs((s) => ({
      ...s,
      teaId: id,
      waterTemp: String(t.temp),
      steepTime: String((t.timeMin + t.timeMax) / 2),
      leafRatio: String(t.leaves),
    }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const volume = parseFloat(inputs.volume) || 0;
  const waterTemp = parseFloat(inputs.waterTemp) || 0;
  const steepTime = parseFloat(inputs.steepTime) || 0;
  const altitude = parseFloat(inputs.altitude) || 0;
  const leafRatio = parseFloat(inputs.leafRatio) || 0;
  if (volume < 60) errors.volume = "Must be at least 60 ml";
  if (waterTemp < 40 || waterTemp > 100) errors.waterTemp = "Must be 40–100°C";
  if (steepTime <= 0) errors.steepTime = "Must be greater than 0";
  if (altitude < 0 || altitude > 5000) errors.altitude = "Must be 0–5000 m";
  if (leafRatio <= 0) errors.leafRatio = "Must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How do I know if my tea is over-steeped?", answer: "Each variety has a standard window: white and green teas need only 2–3 minutes, oolong and black 3–5, and herbal 5–7. Beyond the upper bound, tannins and catechins release and the cup turns bitter and astringent. Steeping time matters more than temperature for most teas — a timer is the cheapest upgrade you can make." },
    { question: "Why does my green tea taste bitter?", answer: "Green tea is the most forgiving of mistakes in the opposite direction: water above 85°C or steeping past 3 minutes extracts excess bitterness. Use 75–80°C water and stop at 2–3 minutes. If it still tastes bitter, try a shorter steep before lowering the temperature further." },
    { question: "Does altitude really change brewing?", answer: "Yes. Water boils at about 1°C lower for every 300 m of elevation, so at 1,500 m it boils near 95°C — which is ideal for black tea but still too hot for green. The calculator adjusts the local boiling point so you can see when your water would scorch the leaves." },
    { question: "How much tea should I use?", answer: "A standard guideline is 4–5 g of loose leaf per 240 ml cup (about 2–3 grams per 150 ml for fine-leaf teas). The amount scales linearly with volume, so a 500 ml pot needs roughly double the leaves of a single cup. Adjust the leaf amount to taste — more leaf gives a stronger cup." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Tea Steeping Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tea Steeping Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="teaId" className={lbl}>Tea Type</label>
                <select id="teaId" value={inputs.teaId} onChange={(e) => selectTea(e.target.value)} className={sel}>
                  {TEAS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="volume" className={lbl}>Water Volume</label>
                <div className={inp}>
                  <input id="volume" type="number" min="60" step="30" value={inputs.volume} onChange={(e) => set("volume")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">ml</span>
                </div>
                {errors.volume && <p className="text-xs text-red-500 font-medium mt-1">{errors.volume}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="waterTemp" className={lbl}>Water Temperature</label>
                <div className={inp}>
                  <input id="waterTemp" type="number" min="40" max="100" value={inputs.waterTemp} onChange={(e) => set("waterTemp")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">°C</span>
                </div>
                {errors.waterTemp && <p className="text-xs text-red-500 font-medium mt-1">{errors.waterTemp}</p>}
              </div>
              <div>
                <label htmlFor="steepTime" className={lbl}>Steeping Time</label>
                <div className={inp}>
                  <input id="steepTime" type="number" min="0.5" max="15" step="0.5" value={inputs.steepTime} onChange={(e) => set("steepTime")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">min</span>
                </div>
                {errors.steepTime && <p className="text-xs text-red-500 font-medium mt-1">{errors.steepTime}</p>}
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Altitude & Amount</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="altitude" className={lbl}>Altitude</label>
                        <div className={inp}>
                          <input id="altitude" type="number" min="0" max="5000" value={inputs.altitude} onChange={(e) => set("altitude")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">m</span>
                        </div>
                        {errors.altitude && <p className="text-xs text-red-500 font-medium mt-1">{errors.altitude}</p>}
                      </div>
                      <div>
                        <label htmlFor="leafRatio" className={lbl}>Leaf Amount per Cup</label>
                        <div className={inp}>
                          <input id="leafRatio" type="number" min="1" max="10" step="0.5" value={inputs.leafRatio} onChange={(e) => set("leafRatio")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">g/240ml</span>
                        </div>
                        {errors.leafRatio && <p className="text-xs text-red-500 font-medium mt-1">{errors.leafRatio}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Steeping Verdict</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.verdict}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.tea.label} · {result.tea.temp}°C for {result.tea.timeMin}–{result.tea.timeMax} min · your water is {result.tempNote}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Ideal Temp", `${result.tea.temp}°C`],
                ["Leaves Needed", `${result.leavesG.toFixed(1)} g`],
                ["Temp vs Ideal", `${result.tempDiff >= 0 ? "+" : ""}${result.tempDiff.toFixed(0)}°C`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${i === 2 ? (result.tempDiff > 10 || result.tempDiff < -5 ? "text-red-600" : "text-green-600") : "text-foreground"}`}>{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Brewing Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Recommended Temperature by Tea</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[60, 105]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v}°C`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="temp" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, i) => (
                      <Cell key={i} fill={d.selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Highlighted bar is the selected tea.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Tea Steeping Works</h2>
            <p>Every tea variety has a standard brewing window that balances extraction of flavor compounds against bitterness. White and green teas are delicate: their leaves are minimally oxidized, so they need cooler water (75–80°C) and short steeps of 2–3 minutes. Oolong and black teas tolerate 90–95°C water and 3–5 minutes, while herbal tisanes — no caffeine — can steep 5–7 minutes at a full boil.</p>
            <h2 className="text-2xl font-bold mb-3">Why Temperature and Time Matter</h2>
            <p>Hotter water extracts catechins and tannins faster, so temperature and time trade off against each other. The same leaf can produce a sweet, floral cup at 80°C for 2.5 minutes or a bitter one at 95°C for 5. The calculator compares your settings against each tea's recommended range and returns an explicit verdict — under-steeped, optimal, or over-steeped — plus a note when the water itself is off.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Brewing Tips</h2>
            <p>Use about 4–5 g of loose leaf per 240 ml cup and scale linearly with volume. If you live above sea level, remember your water boils below 100°C — at 1,500 m it boils near 95°C, which is perfect for black tea but still too hot for green. And when in doubt, steep shorter: you can always add time, but you cannot take bitterness back out.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tea-steeping-time-calculator" />
          <PopularCalculators exclude="/calculator/tea-steeping-time-calculator" />
        </div>
      </div>
    </>
  );
}
