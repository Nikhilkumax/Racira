"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Radio } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const MEDIA = [
  { id: "vacuum", label: "Vacuum / Air (c ≈ 3.00 × 10⁸ m/s)", speed: 299792458 },
  { id: "water", label: "Water (≈ 2.25 × 10⁸ m/s)", speed: 2.25e8 },
  { id: "glass", label: "Glass (≈ 2.00 × 10⁸ m/s)", speed: 2.0e8 },
  { id: "fiber", label: "Optical Fiber (≈ 2.05 × 10⁸ m/s)", speed: 2.05e8 },
] as const;

const PREFIXES = [
  { id: "hz", label: "Hz", mult: 1 },
  { id: "khz", label: "kHz", mult: 1e3 },
  { id: "mhz", label: "MHz", mult: 1e6 },
  { id: "ghz", label: "GHz", mult: 1e9 },
] as const;

interface WaveResult {
  freqHz: number;
  wavelengthM: number;
  speed: number;
  freqDisplay: string;
  wavelengthDisplay: string;
  band: string;
}

function calcWave(freqValue: number, prefixId: string, mediaId: string): WaveResult {
  const prefix = PREFIXES.find((p) => p.id === prefixId) ?? PREFIXES[0];
  const medium = MEDIA.find((m) => m.id === mediaId) ?? MEDIA[0];
  const freqHz = freqValue * prefix.mult;
  const wavelengthM = freqHz > 0 ? medium.speed / freqHz : 0;
  let wavelengthDisplay: string;
  if (wavelengthM >= 1) wavelengthDisplay = `${wavelengthM.toFixed(2)} m`;
  else if (wavelengthM >= 1e-3) wavelengthDisplay = `${(wavelengthM * 1e3).toFixed(2)} mm`;
  else if (wavelengthM >= 1e-6) wavelengthDisplay = `${(wavelengthM * 1e6).toFixed(2)} µm`;
  else wavelengthDisplay = `${(wavelengthM * 1e9).toFixed(2)} nm`;
  let band: string;
  const f = freqHz;
  if (f < 3e3) band = "ELF / VLF radio";
  else if (f < 3e6) band = "MF / HF radio";
  else if (f < 3e8) band = "VHF / UHF (FM, TV, Wi-Fi)";
  else if (f < 3e11) band = "Microwave (radar, 5G)";
  else if (f < 4.3e14) band = "Infrared";
  else if (f < 7.5e14) band = "Visible light";
  else if (f < 3e16) band = "Ultraviolet";
  else if (f < 3e19) band = "X-rays";
  else band = "Gamma rays";
  return { freqHz, wavelengthM, speed: medium.speed, freqDisplay: `${freqValue} ${prefix.label}`, wavelengthDisplay, band };
}

const DEFAULTS = { freq: "100", prefix: "mhz", media: "vacuum" };

const faqs = [
  { question: "What is the wave equation?", answer: "c = f × λ: wave speed equals frequency times wavelength. Light in vacuum travels at 299,792,458 m/s, so a 100 MHz radio wave has a wavelength of about 3 meters." },
  { question: "Why does light slow down in glass or water?", answer: "The speed of light in a medium is c/n, where n is the refractive index. Water (n ≈ 1.33) and glass (n ≈ 1.5) slow light, which is why prisms bend it and fibers guide it. Frequency stays constant — only wavelength shrinks." },
  { question: "What is the electromagnetic spectrum?", answer: "It is the full range of frequencies: radio (kHz–GHz), microwaves, infrared, visible light (430–770 THz), ultraviolet, X-rays, and gamma rays. Higher frequency means shorter wavelength and more energy per photon." },
];

export default function FrequencyWavelengthCalculator() {
  const [freq, setFreq] = useState(DEFAULTS.freq);
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [media, setMedia] = useState(DEFAULTS.media);
  const [result, setResult] = useState<WaveResult>(() => calcWave(100, "mhz", "vacuum"));

  const handleCalculate = () => {
    const v = parseFloat(freq);
    if (isNaN(v) || v <= 0) return;
    setResult(calcWave(v, prefix, media));
  };

  const reset = () => {
    setFreq(DEFAULTS.freq);
    setPrefix(DEFAULTS.prefix);
    setMedia(DEFAULTS.media);
    setResult(calcWave(100, "mhz", "vacuum"));
  };

  const chartData = MEDIA.map((m) => ({ name: m.label.split(" (")[0], value: Number((m.speed / result.freqHz).toFixed(4)) }));
  const breakdown = [
    { label: "Frequency", value: `${result.freqHz.toLocaleString("en-US", { maximumFractionDigits: 6 })} Hz`, highlight: false },
    { label: "Wave Speed in Medium", value: `${(result.speed / 1e8).toFixed(2)} × 10⁸ m/s`, highlight: false },
    { label: "Wavelength (λ = c/f)", value: result.wavelengthDisplay, highlight: true },
    { label: "Wavelength in Meters", value: `${result.wavelengthM.toFixed(6)} m`, highlight: false },
    { label: "Spectral Band", value: result.band, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Frequency & Wavelength Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Frequency & Wavelength Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Radio className="w-4 h-4" /> c = f × λ
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Frequency</label>
                  <input type="number" value={freq} onChange={(e) => setFreq(e.target.value)} className="input-calc" placeholder="100" min={0} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Unit</label>
                  <select value={prefix} onChange={(e) => setPrefix(e.target.value)} className="input-calc">
                    {PREFIXES.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Propagation Medium</label>
                <select value={media} onChange={(e) => setMedia(e.target.value)} className="input-calc">
                  {MEDIA.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Radio className="w-4 h-4 text-primary" /> WAVELENGTH
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.wavelengthDisplay}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                A {result.freqDisplay} wave in {media === "vacuum" ? "vacuum" : "this medium"} — {result.band}.
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Wavelength by Medium</h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: number) => `${value} m`} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={55} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3 italic">Same frequency, slower media compress the wavelength.</p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
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

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Period (T = 1/f)", value: `${(1 / result.freqHz).toExponential(2)} s` },
                  { label: "Photon Energy (E = h·f)", value: `${(6.62607015e-34 * result.freqHz).toExponential(2)} J` },
                  { label: "Visible Light", value: "430–770 THz" },
                  { label: "Reference", value: "c = 299,792,458 m/s" },
                ].map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Frequency & Wavelength Calculator</h2>
            <p>Every wave obeys c = f × λ: the wave speed equals the product of frequency and wavelength. In vacuum, electromagnetic waves all travel at the same speed c, so frequency and wavelength are perfect inverses — a 100 MHz radio wave spans 3 meters while a 100 GHz microwave spans 3 millimeters. The frequency of a wave never changes when it enters a new medium; instead the wavelength compresses as the wave slows.</p>
            <h3>Reading the spectrum</h3>
            <p>The band readout places your frequency on the electromagnetic spectrum. Radio waves are meters to kilometers long, infrared and visible light are hundreds of nanometers, and X-rays are smaller than atoms. This single equation — plus the speed of light — is what antenna designers, fiber-optic engineers, and astronomers all use daily.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/frequency-wavelength-calculator" />
          <PopularCalculators exclude="/calculator/frequency-wavelength-calculator" />
        </div>
      </div>
    </>
  );
}
