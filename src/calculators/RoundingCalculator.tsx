"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const RoundingCalculator = () => {
  const DEFAULTS = { number: "3.14159265358979", decimalPlaces: "2" };
  const [number, setNumber] = useState(DEFAULTS.number);
  const [decimalPlaces, setDecimalPlaces] = useState(DEFAULTS.decimalPlaces);
  const [result, setResult] = useState<any>(null);

  const calculate = (n = number, d = decimalPlaces) => {
    const N = parseFloat(n);
    const D = parseInt(d);
    if (isNaN(N) || isNaN(D) || D < 0 || D > 15) return;
    const factor = Math.pow(10, D);
    const roundHalf    = Math.round(N * factor) / factor;
    const roundDown    = Math.floor(N * factor) / factor;
    const roundUp      = Math.ceil(N * factor) / factor;
    const roundTrunc   = Math.trunc(N * factor) / factor;
    // Round half to even (banker's rounding)
    const halfway = N * factor;
    const floored = Math.floor(halfway);
    const bankersRound = (halfway - floored === 0.5)
      ? (floored % 2 === 0 ? floored : floored + 1) / factor
      : Math.round(halfway) / factor;

    const sigFigs = [1, 2, 3, 4, 5, 6].map((sf) => {
      const mag = Math.floor(Math.log10(Math.abs(N)));
      const f = Math.pow(10, sf - 1 - mag);
      return { sf, value: Math.round(N * f) / f };
    });

    const chartData = [0, 1, 2, 3, 4, 5, 6].map((dp) => {
      const f2 = Math.pow(10, dp);
      return { places: dp, value: Math.round(N * f2) / f2 };
    });

    setResult({ N, D, roundHalf, roundDown, roundUp, roundTrunc, bankersRound, sigFigs, chartData });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setNumber(DEFAULTS.number); setDecimalPlaces(DEFAULTS.decimalPlaces); calculate(DEFAULTS.number, DEFAULTS.decimalPlaces); };

  const fmt = (n: number, d = 10) => {
    const s = n.toPrecision(15).replace(/\.?0+$/, "");
    return s;
  };

  const faqs = [
    { question: "What are the different rounding methods?", answer: "Round half up (standard): 2.5 → 3. Round half down: 2.5 → 2. Round half to even (banker's rounding): 2.5 → 2, 3.5 → 4. Truncation: 2.9 → 2 (drop decimals). Floor: always round down (−2.1 → −3). Ceiling: always round up (2.1 → 3). Each has specific use cases in finance, engineering, and computing." },
    { question: "What is banker's rounding?", answer: "Banker's rounding (round half to even) rounds 0.5 to the nearest even number: 0.5 → 0, 1.5 → 2, 2.5 → 2, 3.5 → 4. Over many calculations, this prevents systematic upward bias — half the 0.5 cases round up, half round down. Used by IEEE 754 floating point, Excel (ROUND), and financial calculations to minimize accumulated rounding error." },
    { question: "What are significant figures?", answer: "Significant figures represent meaningful precision in a measurement. 3.14 has 3 sig figs. 100 has 1 (or 3 if written 100.). To round to n sig figs: find the nth significant digit, then round at that position. 3.14159 to 3 sig figs = 3.14. 0.00456789 to 3 sig figs = 0.00457. Leading zeros don't count; trailing zeros after the decimal point do." },
    { question: "What is the difference between floor and truncate?", answer: "Both drop the decimal for positive numbers: floor(3.9) = trunc(3.9) = 3. For negative numbers they differ: floor(−3.1) = −4 (always rounds toward negative infinity), trunc(−3.1) = −3 (always rounds toward zero). In most languages, integer division truncates. Python's // operator uses floor division." },
    { question: "Why does rounding error matter?", answer: "Repeated rounding introduces cumulative error. Floating-point representation (IEEE 754) also causes tiny errors: 0.1 + 0.2 = 0.30000000000000004 in JavaScript. In financial calculations (taxes, currency conversion), always round at the end — not intermediate steps. The 1994 Ariane 5 rocket failure was partly caused by floating-point conversion errors." },
    { question: "What is round-trip accuracy?", answer: "Round-trip accuracy means that converting a number to a string and back preserves its value. IEEE 754 double precision has ~15.9 significant decimal digits, so any decimal with 15 or fewer sig figs can be stored exactly in a round trip. Beyond that, rounding errors occur. JavaScript's toPrecision(17) gives enough digits for perfect round-trip fidelity." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Rounding Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rounding Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Number</label>
              <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="3.14159265358979" />
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Decimal Places</label>
              <input type="number" value={decimalPlaces} onChange={(e) => setDecimalPlaces(e.target.value)} className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="2" min="0" max="15" step="1" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Rounded to {result.D} decimal place{result.D !== 1 ? "s" : ""}</div>
                <div className="text-4xl font-bold text-primary">{fmt(result.roundHalf)}</div>
                <div className="text-sm text-muted-foreground mt-1">Standard rounding (half-up) of {fmt(result.N)}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">All Rounding Methods</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Original Number", value: fmt(result.N) },
                    { label: "Round Half-Up (standard)", value: fmt(result.roundHalf) },
                    { label: "Round Down (floor)", value: fmt(result.roundDown) },
                    { label: "Round Up (ceiling)", value: fmt(result.roundUp) },
                    { label: "Truncate (toward zero)", value: fmt(result.roundTrunc) },
                    { label: "Banker's Rounding (half-even)", value: fmt(result.bankersRound) },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium font-mono">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Significant Figures</h3>
                <table className="w-full text-base"><tbody>
                  {result.sigFigs.map((s: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{s.sf} significant figure{s.sf !== 1 ? "s" : ""}</td>
                      <td className="text-right font-medium font-mono">{fmt(s.value)}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Value at Different Decimal Places</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="places" tick={{ fontSize: 10 }} label={{ value: "Decimal Places", position: "insideBottom", offset: -2, fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                    <Tooltip formatter={(v: any) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 10 })} labelFormatter={(l) => `${l} decimal places`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Rounding Calculator?</h2>
            <p>A rounding calculator computes a number rounded to a specified number of decimal places using five different methods: standard half-up, floor, ceiling, truncation, and banker{"'"}s rounding. Pre-filled with π (3.14159265358979) to 2 decimal places, the standard result is 3.14. The calculator also shows significant figure rounding for 1–6 sig figs.</p>
            <h2>Standard Rounding Rules</h2>
            <p>If the digit after the rounding position is 0–4: round down (keep the digit). If 5–9: round up (increment the digit). Then drop all subsequent digits. Examples: 3.14159 to 2dp = 3.14. 3.145 to 2dp = 3.15. 3.995 to 2dp = 4.00. This is the method taught in schools and used in most everyday calculations.</p>
            <h2>Banker{"'"}s Rounding Explained</h2>
            <p>Standard rounding always rounds 0.5 up, causing systematic upward bias. Over millions of transactions, this can amount to significant errors. Banker{"'"}s rounding (half-to-even): when the digit is exactly 5, round to the nearest even digit. 2.5 → 2 (2 is even), 3.5 → 4 (4 is even), 4.5 → 4 (4 is even), 5.5 → 6 (6 is even). IEEE 754 uses this by default.</p>
            <h2>Floor vs Ceiling vs Truncate</h2>
            <p><strong>Floor:</strong> always toward negative infinity. floor(3.9) = 3, floor(−3.1) = −4. <strong>Ceiling:</strong> always toward positive infinity. ceil(3.1) = 4, ceil(−3.9) = −3. <strong>Truncate:</strong> always toward zero. trunc(3.9) = 3, trunc(−3.9) = −3. For positive numbers floor = truncate. For negative numbers ceil = truncate. Python{"'"}s int() truncates; // uses floor division.</p>
            <h2>Significant Figures in Science</h2>
            <p>Significant figures express measurement precision. Rules: all non-zero digits are significant. Zeros between sig figs are significant. Leading zeros (0.0034) are not significant. Trailing zeros after decimal are significant (3.00). In calculations: multiplication/division — answer has the fewest sig figs of any input. Addition/subtraction — answer has the fewest decimal places.</p>
            <h2>Rounding in Financial Applications</h2>
            <p>Currency rounding varies by jurisdiction. Euro zone: round to 2 decimal places. Some currencies have no cents (Japanese yen: 0 dp). Swiss franc transactions round to 0.05. Tax calculations: always round in favor of the taxpayer (different directions for credits vs. liabilities). GAAP and IFRS both require consistent rounding policies disclosed in financial statements.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rounding-calculator" />
          <PopularCalculators exclude="/calculator/rounding-calculator" />
        </div>
      </div>
    </>
  );
};

export default RoundingCalculator;
