"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Camera } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface EvResult {
  iso: number;
  shutter: number;
  aperture: number;
  ev100: number;
  evIso: number;
  lux: number;
  chartData: { name: string; value: number }[];
}

function calcEv(iso: number, shutter: number, aperture: number): EvResult {
  const ev100 = Math.log2((aperture * aperture) / shutter);
  const evIso = ev100 + Math.log2(iso / 100);
  const lux = 2.5 * Math.pow(2, ev100) * (iso / 100);
  const chartData = [
    { name: "EV @ ISO 100", value: Number(ev100.toFixed(2)) },
    { name: "EV @ ISO " + iso, value: Number(evIso.toFixed(2)) },
  ];
  return { iso, shutter, aperture, ev100, evIso, lux, chartData };
}

const SHUTTERS = [
  { label: "1/1000 s", value: 1 / 1000 },
  { label: "1/500 s", value: 1 / 500 },
  { label: "1/250 s", value: 1 / 250 },
  { label: "1/125 s", value: 1 / 125 },
  { label: "1/60 s", value: 1 / 60 },
  { label: "1/30 s", value: 1 / 30 },
  { label: "1/15 s", value: 1 / 15 },
  { label: "1/8 s", value: 1 / 8 },
  { label: "1/4 s", value: 1 / 4 },
  { label: "1/2 s", value: 1 / 2 },
  { label: "1 s", value: 1 },
];

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
const ISOS = [50, 100, 200, 400, 800, 1600, 3200, 6400];

const DEFAULTS = { iso: "100", shutter: "0.008", aperture: "8" };

const faqs = [
  { question: "What is exposure value?", answer: "EV is a unitless measure of scene brightness or exposure: EV = log₂(N² ÷ t), where N is the f-number and t the shutter speed in seconds. Higher EV means more light — sunny day ≈ 15, indoors ≈ 5–7." },
  { question: "How does ISO affect EV?", answer: "The EV formula assumes ISO 100. Raising ISO to 400 allows the same brightness at a lower light level, equivalent to a +2 EV shift: EV_iso = EV₁₀₀ + log₂(ISO ÷ 100)." },
  { question: "What is the lux estimate?", answer: "Lux ≈ 2.5 × 2^EV₁₀₀ × (ISO/100) is a rough conversion from exposure to illuminance. Full daylight is ~10,000+ lux, a bright office ~500, twilight ~10." },
];

export default function ExposureValueCalculator() {
  const [iso, setIso] = useState(DEFAULTS.iso);
  const [shutter, setShutter] = useState(DEFAULTS.shutter);
  const [aperture, setAperture] = useState(DEFAULTS.aperture);
  const [result, setResult] = useState<EvResult>(() => calcEv(100, 1 / 125, 8));

  useEffect(() => {
    const i = parseFloat(iso);
    const s = parseFloat(shutter);
    const a = parseFloat(aperture);
    if (!isNaN(i) && !isNaN(s) && !isNaN(a) && i > 0 && s > 0 && a > 0) setResult(calcEv(i, s, a));
  }, [iso, shutter, aperture]);

  const reset = () => { setIso(DEFAULTS.iso); setShutter(DEFAULTS.shutter); setAperture(DEFAULTS.aperture); };
  const invalid = isNaN(parseFloat(iso)) || isNaN(parseFloat(shutter)) || isNaN(parseFloat(aperture)) || parseFloat(iso) <= 0 || parseFloat(shutter) <= 0 || parseFloat(aperture) <= 0;

  const shutterLabel = SHUTTERS.find(s => Math.abs(s.value - result.shutter) < 1e-9)?.label ?? `${result.shutter.toFixed(3)} s`;

  const breakdown = [
    { label: "Aperture (f-number)", value: `f/${result.aperture}` },
    { label: "Shutter Speed", value: shutterLabel },
    { label: "ISO", value: `${result.iso}` },
    { label: "EV at ISO 100", value: `${result.ev100.toFixed(2)}`, highlight: true },
    { label: "EV at Selected ISO", value: `${result.evIso.toFixed(2)}` },
    { label: "Estimated Illuminance", value: `${result.lux.toLocaleString("en-US", { maximumFractionDigits: 0 })} lux` },
    { label: "Lighting Scenario", value: result.lux >= 10000 ? "Bright daylight" : result.lux >= 1000 ? "Overcast / bright indoor" : result.lux >= 100 ? "Indoor lighting" : result.lux >= 10 ? "Twilight" : "Very low light" },
  ];

  const summaryStats = [
    { label: "EV (ISO 100)", value: `${result.ev100.toFixed(2)}` },
    { label: "EV (ISO " + result.iso + ")", value: `${result.evIso.toFixed(2)}` },
    { label: "Lux", value: `${result.lux.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Aperture", value: `f/${result.aperture}` },
    { label: "Shutter", value: shutterLabel },
    { label: "ISO", value: `${result.iso}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Exposure Value Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Exposure Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ev-iso" className="block text-sm font-medium mb-1 text-foreground">ISO</label>
                <select id="ev-iso" value={iso} onChange={(e) => setIso(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {ISOS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ev-aperture" className="block text-sm font-medium mb-1 text-foreground">Aperture</label>
                <select id="ev-aperture" value={aperture} onChange={(e) => setAperture(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {APERTURES.map(v => <option key={v} value={v}>f/{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="ev-shutter" className="block text-sm font-medium mb-1 text-foreground">Shutter Speed</label>
              <select id="ev-shutter" value={shutter} onChange={(e) => setShutter(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                {SHUTTERS.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Camera className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Select valid ISO, aperture, and shutter values.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Exposure Value</div>
              <div className="text-4xl font-extrabold text-primary">EV {result.ev100.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">f/{result.aperture} · {shutterLabel} · ISO {result.iso} (EV {result.evIso.toFixed(1)} adjusted)</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">EV @ ISO {result.iso}</div>
                <div className="text-lg font-bold text-primary">{result.evIso.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Estimated Lux</div>
                <div className="text-lg font-bold text-primary">{result.lux.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Scenario</div>
                <div className="text-lg font-bold text-primary">{result.lux >= 1000 ? "Daylight" : result.lux >= 100 ? "Indoor" : "Low light"}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">EV at ISO 100 vs Selected ISO</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`EV ${v.toFixed(2)}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Exposure Value Calculator</h2>
            <p>Exposure value condenses aperture and shutter speed into one number: EV = log₂(N² ÷ t). At f/8 and 1/125 s, EV = log₂(64 ÷ 0.008) = log₂(8,000) ≈ 13. Every stop of aperture or shutter changes EV by exactly 1 — the basis of the exposure triangle.</p>
            <h3>ISO as an EV Offset</h3>
            <p>ISO doesn't change the light arriving at the sensor, but it changes the exposure index. Doubling ISO is equivalent to a +1 EV shift, which is why low-light photography trades image noise for exposure headroom: EV₁₀₀ + log₂(ISO/100) gives the effective value.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/exposure-value-calculator" />
          <PopularCalculators exclude="/calculator/exposure-value-calculator" />
        </div>
      </div>
    </>
  );
}
