"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const MEDIA: Record<string, { label: string; speed: number; unit: string }> = {
  light: { label: "Light (vacuum)", speed: 299792458, unit: "m/s" },
  soundAir: { label: "Sound in air (20 °C)", speed: 343, unit: "m/s" },
  soundWater: { label: "Sound in water", speed: 1480, unit: "m/s" },
  soundSteel: { label: "Sound in steel", speed: 5960, unit: "m/s" },
  custom: { label: "Custom speed", speed: 343, unit: "m/s" },
};

const H_PLANCK = 6.62607015e-34;

interface WavelengthResult {
  wavelength: number; // meters
  wavelengthStr: string;
  period: number; // seconds
  wavenumber: number; // 1/m
  photonEnergy: number | null; // J
  chartData: { name: string; wavelength: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function fmtLength(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  if (m >= 1) return `${m.toFixed(2)} m`;
  if (m >= 0.001) return `${(m * 1000).toFixed(2)} mm`;
  if (m >= 1e-6) return `${(m * 1e6).toFixed(2)} µm`;
  return `${(m * 1e9).toFixed(2)} nm`;
}

function calcWavelength(speed: number, freq: number, isEm: boolean): WavelengthResult {
  const wavelength = speed / freq;
  const period = 1 / freq;
  const wavenumber = 1 / wavelength;
  const photonEnergy = isEm ? H_PLANCK * freq : null;

  // Inverse relationship: λ at f/2, f, 2f
  const factors = [0.5, 1, 2];
  const chartData = factors.map((f, i) => ({
    name: `${f}×f`,
    wavelength: speed / (freq * f),
    fill: i === 1 ? "hsl(var(--primary))" : i % 2 === 0 ? "#a3a3a3" : "#d4d4d4",
  }));

  const breakdown = [
    { label: "Wave Speed (v)", value: `${speed.toLocaleString()} m/s` },
    { label: "Frequency (f)", value: `${freq.toLocaleString()} Hz` },
    { label: "Wavelength (λ = v ÷ f)", value: fmtLength(wavelength) },
    { label: "Period (T = 1 ÷ f)", value: `${period.toLocaleString(undefined, { maximumFractionDigits: 6 })} s` },
    { label: "Wavenumber (1 ÷ λ)", value: `${wavenumber.toLocaleString(undefined, { maximumFractionDigits: 2 })} m⁻¹` },
    ...(photonEnergy !== null
      ? [{ label: "Photon Energy (E = h·f)", value: `${photonEnergy.toExponential(3)} J` }]
      : []),
  ];

  const summaryStats = [
    { label: "Wavelength (λ)", value: fmtLength(wavelength) },
    { label: "Frequency (f)", value: `${freq.toLocaleString()} Hz` },
    { label: "Period (T)", value: `${period.toLocaleString(undefined, { maximumFractionDigits: 6 })} s` },
    { label: "Speed", value: `${speed.toLocaleString()} m/s` },
    { label: "Formula", value: "λ = v ÷ f" },
    ...(photonEnergy !== null ? [{ label: "Photon Energy", value: `${photonEnergy.toExponential(3)} J` }] : []),
  ];

  return { wavelength, wavelengthStr: fmtLength(wavelength), period, wavenumber, photonEnergy, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function WavelengthCalculator() {
  const [medium, setMedium] = useState("soundAir");
  const [speed, setSpeed] = useState("343");
  const [freq, setFreq] = useState("440");
  const [result, setResult] = useState<WavelengthResult | null>(null);

  const calculate = () => {
    const isEm = medium === "light";
    const spd = isEm ? MEDIA.light.speed : medium === "custom" ? (parseFloat(speed) || 343) : MEDIA[medium].speed;
    setResult(calcWavelength(spd, Math.max(1e-6, parseFloat(freq) || 440), isEm));
  };
  const reset = () => {
    setMedium("soundAir");
    setSpeed("343");
    setFreq("440");
    setResult(calcWavelength(343, 440, false));
  };
  useEffect(() => {
    setResult(calcWavelength(343, 440, false));
  }, []);

  const faqs = [
    { question: "What is wavelength?", answer: "Wavelength is the distance between successive identical points of a wave — the distance a wave travels in one period. It is related to speed and frequency by λ = v ÷ f: higher frequency means shorter wavelength at a given speed." },
    { question: "Why does light have such tiny wavelengths?", answer: "Light travels at 299,792,458 m/s, so even modest frequencies produce microscopic wavelengths — visible light is roughly 400–700 nm. Sound's wavelengths, at a few hundred meters per second, are centimeters to meters." },
    { question: "What are the visible light colors?", answer: "Violet ~400 nm, blue ~475 nm, green ~510 nm, yellow ~570 nm, orange ~590 nm, red ~650 nm. The photon energy shown is inversely related: blue photons carry more energy than red ones, which is why blue light causes more photochemical damage." },
    { question: "How do I use the custom speed?", answer: "Pick 'Custom speed' and enter the wave speed of your medium — for example, sound in hydrogen (~1,284 m/s) or a rope wave you measured. The frequency field always takes hertz." },
    { question: "What is the wavenumber?", answer: "The wavenumber is the number of wave cycles per meter, k = 1/λ. It is the spatial counterpart of frequency, and it appears constantly in spectroscopy and quantum physics." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Wavelength Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Wavelength Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Medium</label>
                <div className={inp}>
                  <select value={medium} onChange={(e) => setMedium(e.target.value)} className={ci}>
                    <option value="light">Light (vacuum)</option>
                    <option value="soundAir">Sound in air (20 °C)</option>
                    <option value="soundWater">Sound in water</option>
                    <option value="soundSteel">Sound in steel</option>
                    <option value="custom">Custom speed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Frequency (Hz)</label>
                <div className={inp}><input type="number" value={freq} onChange={(e) => setFreq(e.target.value)} className={ci} min={1e-6} /></div>
              </div>
            </div>
            {medium === "custom" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Custom Wave Speed (m/s)</label>
                <div className={inp}><input type="number" value={speed} onChange={(e) => setSpeed(e.target.value)} className={ci} min={1} /></div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Wavelength (λ)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.wavelengthStr}</div>
                  <div className="text-sm text-muted-foreground mt-1">{MEDIA[medium]?.label ?? "Custom"} · {freq.toLocaleString()} Hz</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Wavelength", result.wavelengthStr], ["Period", `${result.period.toLocaleString(undefined, { maximumFractionDigits: 6 })} s`], ["Wavenumber", `${result.wavenumber.toLocaleString(undefined, { maximumFractionDigits: 1 })} m⁻¹`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Wavelength vs Frequency (Inverse)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [fmtLength(v), "Wavelength"]} />
                      <Bar dataKey="wavelength" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">Doubling the frequency halves the wavelength — the signature inverse relationship λ = v/f.</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Wavelength, Frequency, and Speed</h2>
            <p>Every wave satisfies <strong>v = f × λ</strong>: speed equals frequency times wavelength. For a fixed speed, higher frequency means shorter wavelength, and vice versa. This single relationship ties together musical pitch, radio channels, and the color of light.</p>
            <h2 className="text-2xl font-bold mb-3">A Tale of Two Speeds</h2>
            <p>Light in vacuum moves at 299,792,458 m/s — nearly a million times faster than sound in air (343 m/s). That is why a 440 Hz note is a 0.78 m sound wave but a radio signal at the same frequency would have a wavelength of 681 km. The medium sets the scale of everything that follows.</p>
            <h2 className="text-2xl font-bold mb-3">From Wavelength to Photon Energy</h2>
            <p>For electromagnetic waves, frequency is energy: each photon carries E = h·f, where h is Planck's constant. So wavelength and energy are inversely linked — a blue photon (470 nm) carries more energy than a red one (650 nm), which is why UV light is more damaging than visible light and why X-rays (sub-nanometer) penetrate tissue.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wavelength-calculator" />
          <PopularCalculators exclude="/calculator/wavelength-calculator" />
        </div>
      </div>
    </>
  );
}
