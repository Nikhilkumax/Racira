"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const UNITS = [
  { id: "hz", label: "Hertz (Hz)", toHz: 1, name: "Hz" },
  { id: "khz", label: "Kilohertz (kHz)", toHz: 1e3, name: "kHz" },
  { id: "mhz", label: "Megahertz (MHz)", toHz: 1e6, name: "MHz" },
  { id: "ghz", label: "Gigahertz (GHz)", toHz: 1e9, name: "GHz" },
  { id: "rpm", label: "Revolutions/min (rpm)", toHz: 1 / 60, name: "rpm" },
  { id: "bpm", label: "Beats/min (bpm)", toHz: 1 / 60, name: "bpm" },
] as const;

interface FreqResult {
  value: number;
  unitId: string;
  hz: number;
  periodSec: number;
  conversions: { name: string; value: number }[];
  chartData: { name: string; value: number }[];
}

function convertFreq(value: number, unitId: string): FreqResult {
  const unit = UNITS.find((u) => u.id === unitId) ?? UNITS[0];
  const hz = value * unit.toHz;
  const periodSec = hz > 0 ? 1 / hz : 0;
  const conversions = UNITS.map((u) => ({ name: u.name, value: hz / u.toHz }));
  const chartData = conversions.map((c) => ({ name: c.name, value: Number(c.value.toPrecision(4)) }));
  return { value, unitId, hz, periodSec, conversions, chartData };
}

const DEFAULTS = { value: "100", unit: "mhz" };

const faqs = [
  { question: "How are frequency units related?", answer: "1 kHz = 1,000 Hz, 1 MHz = 1,000,000 Hz, and 1 GHz = 1,000,000,000 Hz. Each step is a factor of 1,000. Revolutions per minute (rpm) divide by 60: 60 rpm = 1 Hz." },
  { question: "What is a period and how does it relate to frequency?", answer: "The period T is the time of one full cycle, T = 1/f. A 100 MHz signal has a period of 10 nanoseconds — that's why high-frequency circuits need nanosecond-level timing precision." },
  { question: "What frequency ranges matter in everyday tech?", answer: "Audio is 20 Hz–20 kHz, FM radio is 87.5–108 MHz, Wi-Fi operates at 2.4 GHz and 5 GHz, and 5G cellular adds bands around 3.5–40 GHz. Power grids run at 50 or 60 Hz." },
];

export default function FrequencyConverter() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<FreqResult>(() => convertFreq(100, "mhz"));

  const handleCalculate = () => {
    const v = parseFloat(value);
    if (isNaN(v) || v < 0) return;
    setResult(convertFreq(v, unit));
  };

  const reset = () => {
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setResult(convertFreq(100, "mhz"));
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 6 });

  const breakdown = [
    { label: "Frequency in Hertz", value: `${fmt(result.hz)} Hz`, highlight: true },
    { label: "Period (T = 1/f)", value: result.periodSec >= 1 ? `${fmt(result.periodSec)} s` : result.periodSec >= 1e-3 ? `${fmt(result.periodSec * 1e3)} ms` : result.periodSec >= 1e-6 ? `${fmt(result.periodSec * 1e6)} µs` : `${fmt(result.periodSec * 1e9)} ns`, highlight: false },
    { label: "Cycles per Minute", value: `${fmt(result.hz * 60)} cpm`, highlight: false },
    { label: "Cycles per Day", value: `${fmt(result.hz * 86400)} cycles/day`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Frequency Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Frequency Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Activity className="w-4 h-4" /> Frequency Unit Conversion
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Frequency Value</label>
                <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="input-calc" placeholder="e.g. 100" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-calc">
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
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
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Activity className="w-4 h-4 text-primary" /> EQUIVALENT FREQUENCY
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{fmt(result.hz)} Hz</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                One full cycle completes every {result.periodSec >= 1 ? `${fmt(result.periodSec)} seconds` : result.periodSec >= 1e-3 ? `${fmt(result.periodSec * 1e3)} milliseconds` : result.periodSec >= 1e-6 ? `${fmt(result.periodSec * 1e6)} microseconds` : `${fmt(result.periodSec * 1e9)} nanoseconds`}.
              </p>
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

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">All Unit Conversions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Unit</th>
                      <th className="p-2.5 pr-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.conversions.map((c) => (
                      <tr key={c.name}>
                        <td className="p-2.5 pl-3 text-muted-foreground">{c.name}</td>
                        <td className="p-2.5 pr-3 text-right font-semibold">{fmt(c.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Wavelength (in air)", value: result.hz > 0 ? `${fmt(299792458 / result.hz)} m` : "—" },
                  { label: "Common Use", value: "Radio, audio, computing" },
                  { label: "Audible Range", value: "20 Hz – 20 kHz" },
                  { label: "Standard Power", value: "50 / 60 Hz (grid)" },
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
            <h2 className="text-2xl font-bold mb-3">About the Frequency Converter</h2>
            <p>Frequency measures how often a repeating event occurs per second, in hertz. The SI prefix ladder — kilo (10³), mega (10⁶), giga (10⁹) — covers everything from the 60 Hz power grid to the 5+ GHz radios in your phone. Rotational speed in rpm is just frequency in disguise: 3,600 rpm on a motor equals 60 Hz, which is exactly why AC motors run at 3,600 or 1,800 rpm on a 60 Hz supply.</p>
            <h3>Frequency, period, and wavelength</h3>
            <p>The reciprocal relationship f = 1/T links frequency to the cycle time, and for waves the speed equation c = f·λ ties frequency to wavelength. A 100 MHz FM signal has a 3-meter wavelength, while a 5 GHz Wi-Fi signal squeezes into 6 cm — which is why Wi-Fi antennas are so much smaller than FM antennas.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/frequency-converter" />
          <PopularCalculators exclude="/calculator/frequency-converter" />
        </div>
      </div>
    </>
  );
}
