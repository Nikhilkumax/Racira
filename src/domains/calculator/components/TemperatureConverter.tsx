"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Thermometer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const scales = [
  { key: "C", label: "Celsius", symbol: "°C" },
  { key: "F", label: "Fahrenheit", symbol: "°F" },
  { key: "K", label: "Kelvin", symbol: "K" },
  { key: "R", label: "Rankine", symbol: "°R" },
];

function toC(value: number, from: string): number {
  if (from === "C") return value;
  if (from === "F") return (value - 32) * 5 / 9;
  if (from === "K") return value - 273.15;
  if (from === "R") return (value - 491.67) * 5 / 9;
  return value;
}

function fromC(celsius: number, to: string): number {
  if (to === "C") return celsius;
  if (to === "F") return celsius * 9 / 5 + 32;
  if (to === "K") return celsius + 273.15;
  if (to === "R") return (celsius + 273.15) * 9 / 5;
  return celsius;
}

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 4 });

export default function TemperatureConverter() {
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState("C");
  const [to, setTo] = useState("F");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const v = parseFloat(value) || 0;
  const celsius = toC(v, from);
  const result = fromC(celsius, to);
  const fromScale = scales.find(s => s.key === from)!;
  const toScale = scales.find(s => s.key === to)!;
  const allResults = scales.map(s => ({ name: s.symbol, value: parseFloat(fromC(celsius, s.key).toFixed(2)) }));

  const faqs = [
    { question: "How do I convert Celsius to Fahrenheit?", answer: "Use the formula: °F = (°C × 9/5) + 32. For example, 100°C = (100 × 9/5) + 32 = 180 + 32 = 212°F. Common reference points: 0°C = 32°F (water freezes), 20°C = 68°F (room temperature), 37°C = 98.6°F (body temperature), 100°C = 212°F (water boils at sea level)." },
    { question: "What is absolute zero in different temperature scales?", answer: "Absolute zero is the theoretically lowest possible temperature, where all molecular thermal motion ceases. In different scales: 0 K (Kelvin), −273.15°C (Celsius), −459.67°F (Fahrenheit), and 0°R (Rankine). Absolute zero has never been achieved experimentally, though temperatures within billionths of a kelvin have been reached." },
    { question: "What is the Kelvin scale and why is it used in science?", answer: "The Kelvin scale is the SI temperature unit, starting at absolute zero (0 K) and using the same interval size as Celsius. It contains no negative values, which makes it ideal for scientific calculations involving gas laws, thermodynamics, and radiation physics. 0°C = 273.15 K; room temperature ≈ 293–298 K; the surface of the sun ≈ 5778 K." },
    { question: "What is the Rankine scale?", answer: "The Rankine scale is used in some engineering applications in the United States. Like Kelvin, it starts at absolute zero (0°R), but uses Fahrenheit-sized degree intervals. 0°R = 0 K = absolute zero; 491.67°R = 0°F = 32°F (freezing point of water); 671.67°R = 100°F. It is rarely used outside specific American engineering contexts." },
    { question: "At what temperature are Celsius and Fahrenheit equal?", answer: "Celsius and Fahrenheit are equal at −40 degrees: −40°C = −40°F. This can be verified using the formula: C = F means C = (C × 9/5) + 32, so C − 9C/5 = 32, −4C/5 = 32, C = −40." },
    { question: "What is normal human body temperature in Fahrenheit and Kelvin?", answer: "Normal human body temperature is approximately 37°C, which equals 98.6°F or 310.15 K. However, body temperature varies naturally between individuals and throughout the day, with the normal range being 36.1°C–37.2°C (97°F–99°F). A fever is generally defined as above 38°C (100.4°F)." },
    { question: "How do I convert Kelvin to Celsius?", answer: "Subtract 273.15: °C = K − 273.15. For example, 300 K = 300 − 273.15 = 26.85°C ≈ 27°C (comfortable room temperature). To convert back: K = °C + 273.15." },
    { question: "What temperature does water boil at high altitude?", answer: "Water boils at 100°C (212°F) only at sea level (1 atm pressure). At higher altitudes where atmospheric pressure is lower, water boils at lower temperatures. At 2,000 m altitude, it boils at about 93°C (199°F). At 5,000 m (Mount Everest base camp), water boils at roughly 83°C (181°F)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Converters", href: "/calculator#converters" }, { label: "Temperature Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Temperature Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Convert Temperature</h2>
            <div className="flex flex-col">
              <label htmlFor="temp-val" className="text-sm font-semibold text-foreground mb-1">Temperature Value</label>
              <div className="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input id="temp-val" type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["From Scale", from, setFrom], ["To Scale", to, setTo]].map(([lbl, val, setter]: any) => (
                <div key={lbl as string} className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-foreground">{lbl}</label>
                  <select value={val} onChange={e => setter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20">
                    {scales.map(s => <option key={s.key} value={s.key}>{s.label} ({s.symbol})</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => { setValue("100"); setFrom("C"); setTo("F"); }} className="flex items-center justify-center gap-2 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-2xl font-bold mb-3">Conversion Result</h2>
                <Thermometer className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">{fromScale.label} → {toScale.label}</div>
                <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result)}</div>
                <div className="text-sm font-semibold text-muted-foreground">{toScale.symbol}</div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Scale</th><th className="p-2.5 pr-3 text-right">Value</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border/50">
                    {scales.map(s => (
                      <tr key={s.key} className={`hover:bg-secondary/20 ${s.key === to ? "bg-primary/5" : ""}`}>
                        <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{s.label} ({s.symbol})</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-foreground">{fmt(fromC(celsius, s.key))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mounted && (<>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">All Scale Comparison</h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={allResults} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: any) => [`${v}`, "Temperature"]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              
</>)}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Temperature Scales</h2>
            <p>Temperature is a measure of the average kinetic energy of the particles in a substance. Four primary temperature scales are in common use: Celsius (°C), Fahrenheit (°F), Kelvin (K), and Rankine (°R). Each was developed for different purposes, and conversions between them are essential for science, cooking, engineering, medicine, and international communication.</p>
            <h2 className="text-2xl font-bold mb-3">The Celsius Scale</h2>
            <p>The Celsius scale (formerly Centigrade) was created by Swedish astronomer Anders Celsius in 1742. It is based on two reference points: 0°C is the freezing point of water at standard atmospheric pressure, and 100°C is the boiling point of water at sea level. The scale divides this range into 100 equal degrees. Celsius is the standard for everyday temperature use in almost all countries outside the United States, as well as in scientific contexts worldwide. Human body temperature is 37°C; comfortable indoor room temperature is 20–22°C; refrigerators should be kept at 1–4°C.</p>
            <h2 className="text-2xl font-bold mb-3">The Fahrenheit Scale</h2>
            <p>The Fahrenheit scale was created by German physicist Daniel Gabriel Fahrenheit in 1724. It remains the primary temperature scale for everyday use in the United States, the Cayman Islands, and a few other territories. On the Fahrenheit scale, water freezes at 32°F and boils at 212°F — a range of 180 degrees. Human body temperature is 98.6°F; comfortable indoor temperature is 68–72°F; a severe fever is above 104°F (40°C).</p>
            <h2 className="text-2xl font-bold mb-3">The Kelvin Scale</h2>
            <p>The Kelvin scale is the SI base unit of temperature, named after British physicist William Thomson, 1st Baron Kelvin. Unlike Celsius and Fahrenheit, the Kelvin scale has no negative values because it starts at absolute zero — the theoretical minimum temperature where all molecular thermal motion ceases (0 K = −273.15°C = −459.67°F). Kelvin degrees are the same size as Celsius degrees. The Kelvin scale is essential in physics, chemistry, and astronomy: the cosmic microwave background radiation is 2.7 K; liquid nitrogen boils at 77 K; room temperature is approximately 293–298 K; the surface of the Sun is about 5,778 K.</p>
            <h2 className="text-2xl font-bold mb-3">The Rankine Scale</h2>
            <p>The Rankine scale is used in some American engineering applications, particularly in thermodynamics. It starts at absolute zero like the Kelvin scale, but uses the same degree size as Fahrenheit. Water freezes at 491.67°R and boils at 671.67°R. The relationship between Rankine and Kelvin is: R = K × 9/5. It is used in fields like gas dynamics and combustion engineering in the United States where Fahrenheit-based calculations are traditional.</p>
            <h2 className="text-2xl font-bold mb-3">Common Temperature Reference Points</h2>
            <p>Understanding key reference temperatures helps build intuition for conversions. Absolute zero: 0 K = −273.15°C = −459.67°F. Liquid nitrogen boiling point: 77 K = −196°C = −321°F. Dry ice (CO₂) sublimation: −78.5°C = −109.3°F. Water freezing: 0°C = 32°F = 273.15 K. Human body: 37°C = 98.6°F = 310.15 K. Water boiling at sea level: 100°C = 212°F = 373.15 K. Self-cleaning oven temperature: 500°C = 932°F. Melting point of iron: 1538°C = 2800°F.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/temperature-converter" />
          <PopularCalculators exclude="/calculator/temperature-converter" />
        </div>
      </div>
    </>
  );
}
