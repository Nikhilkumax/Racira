"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const H = 6.62607015e-34; // Planck, J·s
const C = 2.99792458e8;   // speed of light, m/s

function fmtSci(n: number, digits = 4): string {
  return n.toExponential(digits);
}
function fmtFreq(n: number): string {
  if (n >= 1e15) return `${(n / 1e15).toFixed(3)} PHz`;
  if (n >= 1e12) return `${(n / 1e12).toFixed(3)} THz`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(3)} GHz`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(3)} MHz`;
  return fmtSci(n) + " Hz";
}

const DEFAULTS = { mode: "wl", wavelength: "550", freq: "5.45e14" };

export default function PhotonEnergyCalculator() {
  const [mode, setMode] = useState<"wl" | "freq">(DEFAULTS.mode as "wl" | "freq");
  const [wlStr, setWlStr] = useState(DEFAULTS.wavelength);
  const [freqStr, setFreqStr] = useState(DEFAULTS.freq);
  const [calculated, setCalculated] = useState(false);

  const wl = parseFloat(wlStr); // nm
  const f = parseFloat(freqStr); // Hz

  const wlM = wl * 1e-9;
  const freq = mode === "wl" ? (isNaN(wlM) || wlM <= 0 ? NaN : C / wlM) : f;
  const wavelengthM = mode === "wl" ? wlM : (isNaN(f) || f <= 0 ? NaN : C / f);
  const energyJ = isNaN(freq) ? NaN : H * freq;
  const energyEv = isNaN(energyJ) ? NaN : energyJ / 1.602176634e-19;

  const valid = !isNaN(energyJ) && energyJ > 0;
  const color = (() => {
    const n = wavelengthM * 1e9;
    if (isNaN(n)) return "hsl(var(--primary))";
    if (n < 400) return "#8b5cf6";
    if (n < 450) return "#6366f1";
    if (n < 490) return "#3b82f6";
    if (n < 520) return "#10b981";
    if (n < 570) return "#22c55e";
    if (n < 590) return "#eab308";
    if (n < 620) return "#f59e0b";
    if (n < 700) return "#ef4444";
    return "#7f1d1d";
  })();

  const chartData = [
    { name: "Energy (J)", value: energyJ, fill: "hsl(var(--primary))" },
    { name: "Energy (eV)", value: energyEv, fill: "#f59e0b" },
  ];

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setMode(DEFAULTS.mode as "wl" | "freq"); setWlStr(DEFAULTS.wavelength); setFreqStr(DEFAULTS.freq); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";
  const seg = "flex-1 py-2 rounded-md text-sm font-semibold transition-all";

  const faqs = [
    { question: "What is the photon energy formula?", answer: "E = hf, where h is Planck's constant (6.626×10⁻³⁴ J·s) and f is the frequency. Since frequency and wavelength are linked by c = fλ, the same energy can be written E = hc/λ — pick whichever input you have." },
    { question: "Why is electron-volts used?", answer: "Photon energies are tiny in joules — a visible photon carries about 3×10⁻¹⁹ J. An electron-volt (1.602×10⁻¹⁹ J) is the natural scale: a 550 nm green photon is 2.25 eV, a comfortable number. Spectroscopy and quantum physics quote energies almost exclusively in eV." },
    { question: "How does color relate to energy?", answer: "Shorter wavelengths carry more energy: violet photons (≈400 nm, 3.1 eV) pack roughly 75% more energy than red ones (≈700 nm, 1.77 eV). That is why UV light can break chemical bonds and trigger sunburn while visible light cannot." },
    { question: "What is the visible spectrum range?", answer: "Roughly 380–700 nm, corresponding to 3.26–1.77 eV. The calculator colors the result bar by the photon's wavelength, so you can see where your light lands on the visible spectrum — or that it falls outside it entirely." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Photon Energy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Photon Energy Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="flex gap-1 p-1 rounded-md bg-muted/60">
              <button onClick={() => setMode("wl")} className={`${seg} ${mode === "wl" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>From wavelength</button>
              <button onClick={() => setMode("freq")} className={`${seg} ${mode === "freq" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>From frequency</button>
            </div>
            {mode === "wl" ? (
              <div>
                <label className={lbl}>Wavelength (nanometers)</label>
                <input type="number" min={0} value={wlStr} onChange={e => setWlStr(e.target.value)} className={inp} placeholder="550" />
              </div>
            ) : (
              <div>
                <label className={lbl}>Frequency (Hz)</label>
                <input type="number" step="any" min={0} value={freqStr} onChange={e => setFreqStr(e.target.value)} className={inp} placeholder="5.45e14" />
              </div>
            )}
            {!valid && <p className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">Enter a positive wavelength or frequency.</p>}
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Constants: h = 6.626×10⁻³⁴ J·s, c = 2.998×10⁸ m/s, 1 eV = 1.602×10⁻¹⁹ J.</p>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Photon Energy</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtSci(energyJ)} J</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtSci(energyEv, 3)} eV · {fmtFreq(freq)} · {wavelengthM * 1e9 < 1 ? `${(wavelengthM * 1e12).toFixed(1)} pm` : `${(wavelengthM * 1e9).toFixed(1)} nm`}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Energy (eV)", `${fmtSci(energyEv, 3)} eV`, "quantum scale"], ["Frequency", fmtFreq(freq), "c / λ"], ["Wavelength", `${(wavelengthM * 1e9).toFixed(1)} nm`, "visible: 380–700 nm"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold break-all">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Energy in Two Units</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => v.toExponential(0)} />
                    <Tooltip formatter={(v: number) => [fmtSci(Number(v)), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 h-6 rounded-full mx-4" style={{ background: color, opacity: 0.9 }} />
                <p className="text-center text-sm text-muted-foreground mt-2">Spectrum bar: this photon lands at {(wavelengthM * 1e9).toFixed(0)} nm — {(wavelengthM * 1e9) < 380 ? "ultraviolet" : (wavelengthM * 1e9) <= 700 ? "visible" : "infrared"} light</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Calculation Detail</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Input:</span><span className="font-semibold">{mode === "wl" ? `${wl} nm` : `${fmtSci(f)} Hz`}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Frequency:</span><span className="font-semibold">{fmtFreq(freq)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Wavelength:</span><span className="font-semibold">{(wavelengthM * 1e9).toFixed(1)} nm</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Region:</span><span className="font-semibold">{(wavelengthM * 1e9) < 380 ? "UV" : (wavelengthM * 1e9) <= 700 ? "Visible" : "IR"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">E = hf:</span><span className="font-semibold">{fmtSci(energyJ)} J</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">E in eV:</span><span className="font-semibold">{fmtSci(energyEv, 3)} eV</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Light Is Quantized</h2>
            <p>Light comes in photons, and each one carries an energy set by its frequency — E = hf. This <strong>photon energy calculator</strong> plugs your wavelength or frequency into Planck's relation and reports the energy in joules and electron-volts.</p>
            <h2 className="text-2xl font-bold mb-3">Frequency and Wavelength Are One Story</h2>
            <p>Because every photon travels at c, wavelength and frequency determine each other. Give the calculator either one and it derives the rest: the other value, the energy, and where the photon sits on the spectrum — from gamma rays at femtometer wavelengths to radio waves meters long.</p>
            <h2 className="text-2xl font-bold mb-3">Why Energy Matters</h2>
            <p>Photon energy decides what light can do: ionize atoms (UV and beyond), trigger photoelectric emission, or just warm a surface. The 2.25 eV of green light and the 4+ eV of near-UV differ by enough to separate a safe tan from DNA damage.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/photon-energy-calculator" />
          <PopularCalculators exclude="/calculator/photon-energy-calculator" />
        </div>
      </div>
    </>
  );
}
