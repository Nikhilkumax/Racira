"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Waveform, Signal, ChartBar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";

interface FFTResult {
  sampleRate: number;
  numSamples: number;
  frequencies: number[];
  magnitudes: number[];
  phases: number[];
  dominantFreq: number;
  dominantMag: number;
  chartData: { name: string; magnitude: number; fill: string }[];
  phaseData: { name: string; phase: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  sampleRate: "1000",
  numSamples: "64",
  signalType: "sine",
  frequency1: "50",
  frequency2: "120",
  amplitude1: "1",
  amplitude2: "0.5",
};

const calculate = (v: typeof DEFAULTS): FFTResult => {
  const sampleRate = parseFloat(v.sampleRate) || 1000;
  const numSamples = Math.round(parseFloat(v.numSamples) || 64);
  const freq1 = parseFloat(v.frequency1) || 0;
  const freq2 = parseFloat(v.frequency2) || 0;
  const amp1 = parseFloat(v.amplitude1) || 1;
  const amp2 = parseFloat(v.amplitude2) || 0;

  const signalType = v.signalType;

  // Generate time-domain samples
  const dt = 1 / sampleRate;
  const samples: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    const t = i * dt;
    let sample = 0;
    if (signalType === "sine") {
      sample = amp1 * Math.sin(2 * Math.PI * freq1 * t) + amp2 * Math.sin(2 * Math.PI * freq2 * t);
    } else if (signalType === "square") {
      sample = amp1 * Math.sign(Math.sin(2 * Math.PI * freq1 * t));
      if (freq2 > 0) sample += amp2 * Math.sign(Math.sin(2 * Math.PI * freq2 * t));
    } else if (signalType === "triangle") {
      sample = amp1 * (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq1 * t));
      if (freq2 > 0) sample += amp2 * (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq2 * t));
    } else if (signalType === "sawtooth") {
      sample = amp1 * (2 * ((freq1 * t) % 1) - 1);
      if (freq2 > 0) sample += amp2 * (2 * ((freq2 * t) % 1) - 1);
    } else if (signalType === "noise") {
      sample = amp1 * (Math.random() * 2 - 1);
    } else {
      sample = amp1 * Math.sin(2 * Math.PI * freq1 * t);
    }
    samples.push(sample);
  }

  // DFT computation
  const frequencies: number[] = [];
  const magnitudes: number[] = [];
  const phases: number[] = [];

  const nyquist = sampleRate / 2;
  const freqResolution = sampleRate / numSamples;
  const numBins = Math.floor(numSamples / 2) + 1;

  for (let k = 0; k < numBins; k++) {
    const freq = k * freqResolution;
    frequencies.push(freq);

    let real = 0;
    let imag = 0;
    for (let n = 0; n < numSamples; n++) {
      const angle = (2 * Math.PI * k * n) / numSamples;
      real += samples[n] * Math.cos(angle);
      imag -= samples[n] * Math.sin(angle);
    }

    const magnitude = Math.sqrt(real * real + imag * imag) / numSamples;
    const phase = Math.atan2(imag, real);

    magnitudes.push(magnitude * 2);
    phases.push(phase);
  }

  // Find dominant frequency
  let dominantFreq = 0;
  let dominantMag = 0;
  for (let i = 1; i < magnitudes.length; i++) {
    if (magnitudes[i] > dominantMag) {
      dominantMag = magnitudes[i];
      dominantFreq = frequencies[i];
    }
  }

  const chartData = frequencies.map((f, i) => ({
    name: `${f.toFixed(0)} Hz`,
    magnitude: parseFloat(magnitudes[i].toFixed(4)),
    fill: magnitudes[i] === dominantMag ? "hsl(var(--primary))" : "#3b82f6",
  }));

  const phaseData = frequencies.map((f, i) => ({
    name: `${f.toFixed(0)} Hz`,
    phase: parseFloat((phases[i] * 180 / Math.PI).toFixed(2)),
  }));

  const breakdown = [
    { label: "Sample Rate", value: `${sampleRate} Hz` },
    { label: "Number of Samples", value: `${numSamples}` },
    { label: "Frequency Resolution", value: `${freqResolution.toFixed(2)} Hz` },
    { label: "Nyquist Frequency", value: `${nyquist.toFixed(0)} Hz` },
    { label: "Signal Type", value: signalType },
    { label: "Frequency 1", value: `${freq1} Hz` },
    { label: "Frequency 2", value: `${freq2} Hz` },
    { label: "Amplitude 1", value: `${amp1.toFixed(2)}` },
    { label: "Amplitude 2", value: `${amp2.toFixed(2)}` },
    { label: "Dominant Frequency", value: `${dominantFreq.toFixed(2)} Hz` },
    { label: "Dominant Magnitude", value: `${dominantMag.toFixed(4)}` },
    { label: "Number of Frequency Bins", value: `${numBins}` },
  ];

  const summaryStats = [
    { label: "Dominant Freq", value: `${dominantFreq.toFixed(2)} Hz` },
    { label: "Sample Rate", value: `${sampleRate} Hz` },
    { label: "Freq Resolution", value: `${freqResolution.toFixed(2)} Hz` },
    { label: "Nyquist", value: `${nyquist.toFixed(0)} Hz` },
    { label: "Signal Type", value: signalType },
  ];

  return {
    sampleRate, numSamples, frequencies, magnitudes, phases,
    dominantFreq, dominantMag,
    chartData, phaseData, breakdown, summaryStats,
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

export default function FourierTransformCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<FFTResult | null>(null);
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
    { question: "What is a Fourier Transform?", answer: "The Fourier Transform decomposes a signal into its constituent frequencies. It converts a time-domain signal (amplitude vs. time) into a frequency-domain representation (magnitude and phase vs. frequency). This is fundamental to signal processing, audio analysis, communications, and many other fields." },
    { question: "What is the difference between DFT and FFT?", answer: "The Discrete Fourier Transform (DFT) computes the frequency spectrum of a finite set of discrete samples. The Fast Fourier Transform (FFT) is an efficient algorithm for computing the DFT. The FFT reduces the computational complexity from O(N²) to O(N log N), making it practical for large datasets." },
    { question: "What is the Nyquist frequency?", answer: "The Nyquist frequency is half the sample rate. It represents the highest frequency that can be accurately represented in a digital signal. Frequencies above the Nyquist frequency will be aliased (folded back) into lower frequencies, causing distortion." },
    { question: "What is frequency resolution?", answer: "Frequency resolution is the smallest difference in frequency that can be distinguished in the spectrum. It equals the sample rate divided by the number of samples (Δf = fs/N). Longer signals (more samples) or lower sample rates provide better frequency resolution." },
    { question: "Why do I see two frequency peaks for a sine wave?", answer: "For real-valued signals, the DFT produces a symmetric spectrum. The peak at the positive frequency is the mirror image of the peak at the negative frequency. This calculator only shows the positive frequency half (up to the Nyquist frequency)." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Fourier Transform Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Fourier Transform Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Signal className="w-3.5 h-3.5" /> Signal Parameters
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Signal Type</label>
                  <select value={vals.signalType} onChange={(e) => updateVal("signalType", e.target.value)} className="input-calc">
                    <option value="sine">Sine Wave</option>
                    <option value="square">Square Wave</option>
                    <option value="triangle">Triangle Wave</option>
                    <option value="sawtooth">Sawtooth Wave</option>
                    <option value="noise">Random Noise</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Frequency 1 (Hz)</label>
                  <input type="number" value={vals.frequency1} onChange={(e) => updateVal("frequency1", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Frequency 2 (Hz)</label>
                  <input type="number" value={vals.frequency2} onChange={(e) => updateVal("frequency2", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Amplitude 1</label>
                  <input type="number" value={vals.amplitude1} onChange={(e) => updateVal("amplitude1", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Amplitude 2</label>
                  <input type="number" value={vals.amplitude2} onChange={(e) => updateVal("amplitude2", e.target.value)} className="input-calc" step="any" min="0" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <ChartBar className="w-3.5 h-3.5" /> Sampling
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Sample Rate (Hz)</label>
                  <input type="number" value={vals.sampleRate} onChange={(e) => updateVal("sampleRate", e.target.value)} className="input-calc" step="any" min="1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Number of Samples</label>
                  <input type="number" value={vals.numSamples} onChange={(e) => updateVal("numSamples", e.target.value)} className="input-calc" step="1" min="8" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Compute FFT
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Waveform className="h-3 w-3" /> Dominant Frequency
                </div>
                <div className="text-4xl font-bold text-primary mb-1">{result.dominantFreq.toFixed(2)} Hz</div>
                <p className="text-sm text-muted-foreground">
                  Magnitude: {result.dominantMag.toFixed(4)} · {result.numSamples} samples @ {result.sampleRate} Hz
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Freq Resolution</div>
                  <div className="text-lg font-bold text-foreground">{(result.sampleRate / result.numSamples).toFixed(2)} Hz</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Nyquist</div>
                  <div className="text-lg font-bold text-foreground">{(result.sampleRate / 2).toFixed(0)} Hz</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Bins</div>
                  <div className="text-lg font-bold text-foreground">{result.frequencies.length}</div>
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
                <h3 className="text-sm font-semibold mb-3">Magnitude Spectrum</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="magnitude" radius={[6, 6, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Fourier Transform: From Time Domain to Frequency Domain</h2>
            <p>The Fourier Transform is one of the most powerful tools in mathematics and engineering. It decomposes any signal into its constituent frequencies, revealing the hidden frequency components that make up complex waveforms. This calculator implements the Discrete Fourier Transform (DFT) algorithm to analyze sampled signals and display their frequency spectra.</p>

            <h3>1. How the DFT Works</h3>
            <p>The Discrete Fourier Transform converts a sequence of N time-domain samples into N frequency-domain coefficients. Each coefficient represents the amplitude and phase of a sinusoidal component at a specific frequency. The formula is: X[k] = Σ(n=0 to N-1) x[n] · e^(-j·2π·k·n/N). The magnitude |X[k]| tells you how much of frequency k is present in the signal, and the angle arg(X[k]) gives the phase.</p>

            <h3>2. Key Concepts</h3>
            <p><strong>Sample Rate:</strong> The number of samples taken per second (Hz). Higher sample rates capture higher frequencies. <strong>Nyquist Frequency:</strong> Half the sample rate — the maximum frequency that can be accurately represented. <strong>Frequency Resolution:</strong> The spacing between frequency bins, equal to sample_rate / num_samples. More samples or lower sample rates give finer resolution.</p>

            <h3>3. Signal Types</h3>
            <p>This calculator supports five signal types: (1) Sine — a pure tone at the specified frequency; (2) Square — a periodic square wave rich in odd harmonics; (3) Triangle — a periodic triangle wave with odd harmonics that fall off as 1/n²; (4) Sawtooth — a periodic sawtooth wave with all harmonics falling off as 1/n; (5) Noise — random samples with uniform distribution. You can combine two frequencies with different amplitudes to study multi-tone signals.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fourier-transform-calculator" />
          <PopularCalculators exclude="/calculator/fourier-transform-calculator" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "hsl(var(--primary))", "#10b981", "#f59e0b"];