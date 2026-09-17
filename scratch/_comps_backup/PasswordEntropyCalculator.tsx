"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PeResult {
  entropy: number;
  charset: number;
  length: number;
  strength: string;
  crackTime: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function charsetSize(pw: string): number {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 33;
  return size;
}

function fmtTime(seconds: number): string {
  if (seconds < 1) return "Instant";
  const units: [number, string][] = [
    [31557600, "years"], [2629800, "months"], [604800, "weeks"], [86400, "days"], [3600, "hours"], [60, "minutes"], [1, "seconds"],
  ];
  for (const [u, name] of units) {
    if (seconds >= u) {
      const v = seconds / u;
      return v >= 1000 ? `${fmt(v, 0)} ${name}` : `${fmt(v)} ${name}`;
    }
  }
  return `${fmt(seconds)} seconds`;
}

function calcEntropy(pw: string): PeResult {
  const length = pw.length;
  const charset = charsetSize(pw);
  const entropy = length > 0 && charset > 0 ? length * Math.log2(charset) : 0;
  const guessesPerSec = 1e10; // modern GPU/hashcat cluster
  const crackSeconds = entropy > 0 ? Math.pow(2, entropy) / 2 / guessesPerSec : 0;
  const strength = entropy >= 100 ? "Very strong" : entropy >= 75 ? "Strong" : entropy >= 60 ? "Good" : entropy >= 40 ? "Weak" : "Very weak";
  const breakdown = [
    { label: "Password Length", value: `${length} characters` },
    { label: "Character Set Size", value: `${charset} symbols` },
    { label: "Character Classes", value: `${[/[a-z]/.test(pw) && "lowercase", /[A-Z]/.test(pw) && "uppercase", /[0-9]/.test(pw) && "digits", /[^a-zA-Z0-9]/.test(pw) && "symbols"].filter(Boolean).join(", ") || "none"}` },
    { label: "Entropy (bits)", value: `${fmt(entropy)} bits` },
    { label: "Assumed Attack Rate", value: `${fmt(guessesPerSec, 0)} guesses/sec` },
    { label: "Time to Brute Force (avg)", value: crackTimeLabel(crackSeconds) },
    { label: "Strength Rating", value: strength },
  ];
  const summaryStats = [
    { label: "Entropy", value: `${fmt(entropy)} bits` },
    { label: "Length", value: `${length} chars` },
    { label: "Charset", value: `${charset} symbols` },
    { label: "Strength", value: strength },
  ];
  const chartData = [
    { name: "Length", value: length, fill: "hsl(var(--primary))" },
    { name: "Charset", value: Math.min(95, charset), fill: "#f59e0b" },
    { name: "Entropy", value: Number(Math.min(128, entropy).toFixed(1)), fill: "#10b981" },
  ];
  return { entropy, charset, length, strength, crackTime: crackTimeLabel(crackSeconds), breakdown, summaryStats, chartData };
}

function crackTimeLabel(sec: number): string {
  return fmtTime(sec);
}

const DEFAULTS = { pw: "CorrectHorseBatteryStaple" };

export default function PasswordEntropyCalculator() {
  const [pw, setPw] = useState(DEFAULTS.pw);
  const [result, setResult] = useState<PeResult | null>(null);

  const calculate = () => setResult(calcEntropy(pw));
  const reset = () => {
    setPw(DEFAULTS.pw);
    setResult(calcEntropy("CorrectHorseBatteryStaple"));
  };
  useEffect(() => { setResult(calcEntropy("CorrectHorseBatteryStaple")); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is password entropy?", answer: "A measure of how unpredictable a password is, in bits: length × log₂(charset size). Each bit doubles the guesses an attacker needs. 60 bits is crackable by a determined attacker; 80+ is strong; 100+ is effectively uncrackable by brute force." },
    { question: "Why does length matter more than complexity?", answer: "Entropy grows linearly with length but only logarithmically with charset size. Adding one lowercase character adds ~4.7 bits; replacing letters with symbols adds less than one bit of character-set growth. Long passphrases beat short symbol soup." },
    { question: "How is crack time estimated?", answer: "The calculator assumes 10 billion guesses per second — a realistic modern GPU cluster. The average brute-force time is 2^(entropy−1) ÷ guesses-per-second. Real attackers use dictionaries and leaks, so known phrases can fall far faster than the math suggests." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Password Entropy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Password Entropy Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Password</label>
              <input type="text" value={pw} onChange={e => setPw(e.target.value)} className={inp} placeholder="CorrectHorseBatteryStaple" />
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`${result.entropy >= 75 ? "bg-primary/10 border-l-4 border-primary" : result.entropy >= 60 ? "bg-amber-500/10 border-l-4 border-amber-500" : "bg-destructive/10 border-l-4 border-destructive"} rounded-lg p-5`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.entropy >= 75 ? "text-primary" : result.entropy >= 60 ? "text-amber-600" : "text-destructive"}`}>Entropy · {result.strength}</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.entropy)} bits</div>
                <div className="text-sm text-muted-foreground mt-1">Brute-force time (10 billion guesses/sec): {result.crackTime}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Length", `${result.length} chars`], ["Charset", `${result.charset} symbols`], ["Crack Time", result.crackTime]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-xs font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Password Profile</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Entropy = length × log₂(charset) — both levers matter</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Measuring Password Strength</h2>
            <p>Strength is not a feeling — it is a number. This <strong>password entropy calculator</strong> computes the bits of unpredictability in any password and converts them into the time a determined attacker would need to brute-force it.</p>
            <h2 className="text-2xl font-bold mb-3">The Math</h2>
            <p>Entropy = length × log₂(charset size). Each of the 26 lowercase letters contributes 4.7 bits; adding uppercase, digits, and symbols grows the charset logarithmically. The crack-time estimate divides the guess space by a realistic 10-billion-guesses-per-second attack.</p>
            <h2 className="text-2xl font-bold mb-3">The Honest Caveat</h2>
            <p>Entropy math assumes random selection. Real attackers try dictionary words, leaked passwords, and patterns first — "Password1!" has high nominal entropy and near-zero real strength. Use a password manager's random generator; this calculator is the yardstick for what it produces.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/password-entropy-calculator" />
          <PopularCalculators exclude="/calculator/password-entropy-calculator" />
        </div>
      </div>
    </>
  );
}
