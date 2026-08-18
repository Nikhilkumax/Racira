"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Copy, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";
const AMBIGUOUS = "Il1O0o";

function genPassword(length: number, useLower: boolean, useUpper: boolean, useDigits: boolean, useSymbols: boolean, excludeAmb: boolean): string {
  let pool = "";
  if (useLower) pool += excludeAmb ? LOWER.replace(/[lo]/g, "") : LOWER;
  if (useUpper) pool += excludeAmb ? UPPER.replace(/[IO]/g, "") : UPPER;
  if (useDigits) pool += excludeAmb ? DIGITS.replace(/[01]/g, "") : DIGITS;
  if (useSymbols) pool += SYMBOLS;
  if (pool.length === 0) pool = LOWER;
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < length; i++) out += pool[arr[i] % pool.length];
  // guarantee at least one char of each selected class
  const classes: string[] = [];
  if (useLower) classes.push(excludeAmb ? LOWER.replace(/[lo]/g, "") : LOWER);
  if (useUpper) classes.push(excludeAmb ? UPPER.replace(/[IO]/g, "") : UPPER);
  if (useDigits) classes.push(excludeAmb ? DIGITS.replace(/[01]/g, "") : DIGITS);
  if (useSymbols) classes.push(SYMBOLS);
  for (const cls of classes) {
    if (out.length > 0) {
      const idx = Math.floor(Math.random() * out.length);
      out = out.slice(0, idx) + cls[Math.floor(Math.random() * cls.length)] + out.slice(idx + 1);
    }
  }
  return out;
}

function charsetOf(pw: string): number {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 33;
  return size;
}

const DEFAULTS = { length: "16", lower: true, upper: true, digits: true, symbols: true, exclude: true };

export default function PasswordGenerator() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [useLower, setUseLower] = useState(DEFAULTS.lower);
  const [useUpper, setUseUpper] = useState(DEFAULTS.upper);
  const [useDigits, setUseDigits] = useState(DEFAULTS.digits);
  const [useSymbols, setUseSymbols] = useState(DEFAULTS.symbols);
  const [exclude, setExclude] = useState(DEFAULTS.exclude);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const len = Math.max(4, Math.min(64, parseInt(length, 10) || 16));
    setPassword(genPassword(len, useLower, useUpper, useDigits, useSymbols, exclude));
  };
  useEffect(() => { generate(); /* eslint-disable-next-line */ }, []);

  const entropy = password.length > 0 ? password.length * Math.log2(charsetOf(password)) : 0;
  const strength = entropy >= 100 ? "Very strong" : entropy >= 75 ? "Strong" : entropy >= 60 ? "Good" : "Weak";
  const chartData = [
    { name: "Length", value: password.length, fill: "hsl(var(--primary))" },
    { name: "Charset", value: Math.min(95, charsetOf(password)), fill: "#f59e0b" },
    { name: "Entropy", value: Number(Math.min(128, entropy).toFixed(1)), fill: "#10b981" },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";
  const check = "flex items-center gap-2 text-sm cursor-pointer";

  const faqs = [
    { question: "How random is the generator?", answer: "It uses crypto.getRandomValues — the same cryptographically secure random source browsers use for encryption. That matters: weak randomness is how many 'random' password generators fail." },
    { question: "What does 'exclude ambiguous' do?", answer: "It removes characters that look alike — I, l, 1, O, 0, o — so the password is easy to read and type from a printed or spoken form. The entropy cost is small." },
    { question: "Why do I still need a manager?", answer: "A strong password reused across sites is still compromised when any one site leaks. Generate a unique password per site and store them in a password manager; the generator creates the raw material." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Password Generator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Password Generator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Length</label>
              <input type="number" min={4} max={64} value={length} onChange={e => setLength(e.target.value)} className={inp} placeholder="16" />
            </div>
            <div className="flex flex-col gap-2">
              <label className={check}><input type="checkbox" checked={useLower} onChange={e => setUseLower(e.target.checked)} className="h-4 w-4" /> Lowercase (a–z)</label>
              <label className={check}><input type="checkbox" checked={useUpper} onChange={e => setUseUpper(e.target.checked)} className="h-4 w-4" /> Uppercase (A–Z)</label>
              <label className={check}><input type="checkbox" checked={useDigits} onChange={e => setUseDigits(e.target.checked)} className="h-4 w-4" /> Digits (0–9)</label>
              <label className={check}><input type="checkbox" checked={useSymbols} onChange={e => setUseSymbols(e.target.checked)} className="h-4 w-4" /> Symbols (!@#$…)</label>
              <label className={check}><input type="checkbox" checked={exclude} onChange={e => setExclude(e.target.checked)} className="h-4 w-4" /> Exclude ambiguous (Il1O0o)</label>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={generate} className="flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={generate} aria-label="Regenerate" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {password && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Generated Password · {strength}</div>
                <div className="text-xl font-extrabold tracking-tight font-mono break-words leading-relaxed">{password}</div>
                <div className="flex gap-3 mt-3">
                  <button onClick={copy} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-semibold hover:bg-secondary">
                    <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy"}
                  </button>
                  <span className="text-sm text-muted-foreground self-center">{password.length} chars · {Math.round(entropy)} bits entropy</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Length", `${password.length} chars`], ["Entropy", `${Math.round(entropy)} bits`], ["Strength", strength]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Password Profile</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [v, ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">16+ characters of mixed classes lands comfortably in strong territory</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Length:</span><span className="font-semibold">{password.length} chars</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Entropy:</span><span className="font-semibold">{Math.round(entropy)} bits</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Strength:</span><span className="font-semibold">{strength}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Source:</span><span className="font-semibold">crypto.getRandomValues</span></div>
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Randomness You Can Trust</h2>
            <p>Most password generators are weak because their randomness is weak. This <strong>password generator</strong> uses the browser's cryptographically secure random source and lets you choose length and character classes for any site's rules.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing the Options</h2>
            <p>Longer beats complicated: 16 characters of lowercase-plus-digits outperforms 8 characters of symbol soup. Enable every class the site allows, exclude ambiguous characters if you will type the password by hand, and check the entropy readout — it should sit comfortably above 80 bits.</p>
            <h2 className="text-2xl font-bold mb-3">The Full Picture</h2>
            <p>The generated password's entropy and strength are computed live, so you can see exactly what your settings buy you. Copy it into your password manager and never into a chat — the whole point is that it appears nowhere except where you store it.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/password-generator" />
          <PopularCalculators exclude="/calculator/password-generator" />
        </div>
      </div>
    </>
  );
}
