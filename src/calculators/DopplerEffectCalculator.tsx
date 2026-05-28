"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const C = 299792458;

const DopplerEffectCalculator = () => {
  const DEFAULTS = { sourceFreq: "440", velocity: "30", waveType: "sound", mediumSpeed: "343", approaching: "true" };
  const [sourceFreq, setSourceFreq] = useState(DEFAULTS.sourceFreq);
  const [velocity, setVelocity] = useState(DEFAULTS.velocity);
  const [waveType, setWaveType] = useState(DEFAULTS.waveType);
  const [mediumSpeed, setMediumSpeed] = useState(DEFAULTS.mediumSpeed);
  const [approaching, setApproaching] = useState(DEFAULTS.approaching);
  const [result, setResult] = useState<any>(null);

  const calculate = (f = sourceFreq, v = velocity, wt = waveType, ms = mediumSpeed, ap = approaching) => {
    const F0 = parseFloat(f) || 0;
    const V = parseFloat(v) || 0;
    const VS = wt === "light" ? C : (parseFloat(ms) || 343);
    if (F0 <= 0 || V < 0 || VS <= 0) return;
    const isApproaching = ap === "true";
    let observedF: number;
    let shift: string;
    if (wt === "light") {
      const beta = V / C;
      if (beta >= 1) return;
      if (isApproaching) {
        observedF = F0 * Math.sqrt((1 + beta) / (1 - beta));
        shift = "blueshift";
      } else {
        observedF = F0 * Math.sqrt((1 - beta) / (1 + beta));
        shift = "redshift";
      }
    } else {
      if (isApproaching) {
        observedF = F0 * (VS / (VS - V));
        shift = "higher pitch";
      } else {
        observedF = F0 * (VS / (VS + V));
        shift = "lower pitch";
      }
    }
    const freqChange = observedF - F0;
    const freqChangePct = (freqChange / F0) * 100;
    const wavelengthOrig = VS / F0;
    const wavelengthObs = VS / observedF;
    const speeds = [10, 30, 60, 100, 150];
    const chartData = speeds.map((s) => {
      let fObs: number;
      if (wt === "light") {
        const b = s / C;
        fObs = isApproaching ? F0 * Math.sqrt((1 + b) / (1 - b)) : F0 * Math.sqrt((1 - b) / (1 + b));
      } else {
        fObs = isApproaching ? F0 * (VS / (VS - s)) : F0 * (VS / (VS + s));
      }
      return { name: `${s} ${wt === "light" ? "m/s" : "m/s"}`, freq: parseFloat(fObs.toFixed(1)) };
    });
    setResult({ F0, V, VS, observedF, freqChange, freqChangePct, wavelengthOrig, wavelengthObs, shift, wt, isApproaching, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setSourceFreq(DEFAULTS.sourceFreq); setVelocity(DEFAULTS.velocity); setWaveType(DEFAULTS.waveType);
    setMediumSpeed(DEFAULTS.mediumSpeed); setApproaching(DEFAULTS.approaching);
    calculate(DEFAULTS.sourceFreq, DEFAULTS.velocity, DEFAULTS.waveType, DEFAULTS.mediumSpeed, DEFAULTS.approaching);
  };

  const faqs = [
    { question: "What is the Doppler effect?", answer: "The Doppler effect is the change in frequency (or wavelength) of a wave relative to an observer moving relative to the wave source. An approaching source compresses waves (higher frequency), while a receding source stretches them (lower frequency). Named after Christian Doppler who proposed it in 1842." },
    { question: "What is the Doppler effect formula for sound?", answer: "f_observed = f_source × (v_medium / (v_medium ∓ v_source)). Use minus for approaching source (higher pitch), plus for receding (lower pitch). For 440 Hz at 30 m/s approaching in air (343 m/s): f_obs = 440 × (343/(343-30)) = 440 × 1.096 = 482.2 Hz." },
    { question: "How does the Doppler effect differ for light vs sound?", answer: "Sound requires a medium and uses the classical formula. Light uses the relativistic Doppler formula: f_obs = f₀ × √((1±β)/(1∓β)), where β = v/c. The relativistic formula is symmetric — it doesn't matter whether the source or observer is moving. It also includes time dilation effects absent in classical Doppler." },
    { question: "What is redshift and blueshift?", answer: "Blueshift: light from an approaching source shifts to higher frequencies (toward blue). Redshift: light from a receding source shifts to lower frequencies (toward red). Hubble discovered that distant galaxies are redshifted, proving the universe is expanding. Cosmological redshift z is defined as z = (λ_obs − λ_emit)/λ_emit." },
    { question: "What are practical applications of the Doppler effect?", answer: "Radar guns (police speed measurement). Medical ultrasound (measuring blood flow velocity). Weather radar (detecting storm movement and rotation). Astronomical spectroscopy (measuring star/galaxy velocities). Sonar (submarine detection). Satellite communication (frequency compensation). Airport ground radar." },
    { question: "What happens at the speed of sound (Mach 1)?", answer: "When a source moves at the speed of sound, all wavefronts pile up at the source, creating an infinite observed frequency — a sonic boom (shock wave). Above Mach 1, the source outruns its own sound waves, creating a Mach cone with half-angle θ = arcsin(1/Mach). This is why supersonic aircraft produce the characteristic double boom." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Doppler Effect Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Doppler Effect Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Wave Type</label>
              <div className="flex gap-2">
                {(["sound", "light"] as const).map((w) => (
                  <button key={w} onClick={() => { setWaveType(w); if (w === "light") setMediumSpeed(String(C)); else setMediumSpeed("343"); }} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${waveType === w ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Direction</label>
              <div className="flex gap-2">
                {[{ val: "true", label: "Approaching" }, { val: "false", label: "Receding" }].map((d) => (
                  <button key={d.val} onClick={() => setApproaching(d.val)} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${approaching === d.val ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Source Frequency</label>
              <div className="relative">
                <input type="number" value={sourceFreq} onChange={(e) => setSourceFreq(e.target.value)} className="h-10 w-full px-3 pr-8 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="440" min="0" step="1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Hz</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Source Velocity</label>
              <div className="relative">
                <input type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="30" min="0" step="1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
              </div>
            </div>
            {waveType === "sound" && (
              <div>
                <label className="text-base font-medium block mb-1.5">Speed of Sound</label>
                <div className="relative">
                  <input type="number" value={mediumSpeed} onChange={(e) => setMediumSpeed(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="343" min="1" step="1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m/s</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => calculate(sourceFreq, velocity, waveType, mediumSpeed, approaching)} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-4 ${result.isApproaching ? "bg-blue-500/10 border-blue-500" : "bg-red-500/10 border-red-500"}`}>
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Observed Frequency ({result.shift})</div>
                <div className="text-4xl font-bold" style={{ color: result.isApproaching ? "#3b82f6" : "#ef4444" }}>{fmt(result.observedF, 1)} <span className="text-xl">Hz</span></div>
                <div className="text-sm text-muted-foreground mt-1">
                  {result.freqChange > 0 ? "+" : ""}{fmt(result.freqChange, 1)} Hz ({result.freqChange > 0 ? "+" : ""}{fmt(result.freqChangePct, 2)}%)
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Doppler Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Source Frequency", value: `${fmt(result.F0, 1)} Hz` },
                    { label: "Observed Frequency", value: `${fmt(result.observedF, 1)} Hz` },
                    { label: "Frequency Change", value: `${result.freqChange > 0 ? "+" : ""}${fmt(result.freqChange, 1)} Hz` },
                    { label: "Percentage Shift", value: `${result.freqChangePct > 0 ? "+" : ""}${fmt(result.freqChangePct, 2)}%` },
                    { label: "Source Wavelength", value: `${fmt(result.wavelengthOrig, 3)} m` },
                    { label: "Observed Wavelength", value: `${fmt(result.wavelengthObs, 3)} m` },
                    { label: "Source Velocity", value: `${fmt(result.V)} m/s (Mach ${fmt(result.V / (result.wt === "light" ? C : result.VS), 3)})` },
                    { label: "Direction", value: result.isApproaching ? "Approaching" : "Receding" },
                    { label: "Shift Type", value: result.shift },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Observed Frequency at Different Speeds</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)} Hz`} />
                    <Bar dataKey="freq" fill={result.isApproaching ? "#3b82f6" : "#ef4444"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Doppler Effect Calculator?</h2>
            <p>A Doppler effect calculator computes the observed frequency shift when a wave source and observer are in relative motion. Supporting both sound and light waves, this calculator applies the classical Doppler formula for sound and the relativistic formula for light. Pre-filled with a 440 Hz source (musical note A4) approaching at 30 m/s in air, the observed frequency is approximately 482 Hz — a clearly audible pitch increase.</p>
            <h2>Classical Doppler Formula (Sound)</h2>
            <p><strong>f_obs = f₀ × (v_medium / (v_medium ∓ v_source))</strong>. For an approaching source, the denominator decreases, increasing frequency. For a receding source, the denominator increases, decreasing frequency. At v_source = v_medium (Mach 1), the formula gives infinite frequency — corresponding to the sonic boom shock wave.</p>
            <h2>Relativistic Doppler Formula (Light)</h2>
            <p><strong>f_obs = f₀ × √((1 ± β) / (1 ∓ β))</strong>, where β = v/c. This formula incorporates both the classical Doppler shift and relativistic time dilation. Unlike sound, there is no preferred reference frame for light — the shift depends only on the relative velocity between source and observer. At β = 0.5: approaching frequency doubles, receding frequency halves.</p>
            <h2>Applications in Astronomy</h2>
            <p>Spectral line redshift measures recession velocity of galaxies, confirming the expanding universe. Edwin Hubble discovered that redshift is proportional to distance ({"Hubble's Law: v = H₀d"}). The cosmic microwave background radiation is redshifted by z ≈ 1100, from its original ~3000K to 2.725K. Exoplanet detection via the radial velocity method uses Doppler shifts of stellar spectra to find orbiting planets.</p>
            <h2>Medical and Engineering Applications</h2>
            <p>Doppler ultrasound measures blood flow velocity through vessels — critical for detecting blockages, valve disorders, and fetal heart monitoring. Police radar guns measure vehicle speed by bouncing microwaves off cars and measuring the return frequency shift. Weather Doppler radar detects precipitation movement and rotation (tornado detection). Satellite communications apply Doppler compensation to maintain signal quality.</p>
            <h2>Sonic Booms and Shock Waves</h2>
            <p>When a source exceeds the speed of sound (Mach 1), it outruns its own sound waves. The wavefronts pile up into a conical shock wave — the sonic boom. The Mach cone half-angle θ = arcsin(1/Mach). At Mach 2: θ = 30°. The boom is heard as a sharp double crack (from leading and trailing edges of the aircraft). Concorde cruised at Mach 2.04 — its sonic boom was a major factor limiting overland supersonic flight.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/doppler-effect-calculator" />
          <PopularCalculators exclude="/calculator/doppler-effect-calculator" />
        </div>
      </div>
    </>
  );
};

export default DopplerEffectCalculator;
