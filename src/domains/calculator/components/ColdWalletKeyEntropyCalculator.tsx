"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, KeyRound, ShieldCheck, Cpu } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

type Method = "bip39" | "dice" | "coin" | "passphrase" | "hex";

interface MethodSpec {
  key: Method;
  label: string;
  bitsPerUnit: number;
  unitLabel: string;
}

interface EntropyInputs {
  method: Method;
  quantity: number;
  passphraseCharset: number;
  attackerRateLog10: number;
  extraPassphraseBits: number;
  kdfIterationsLog2: number;
  proMode: boolean;
  wattsPerGuessLog10: number;
  electricityCostPerKwh: number;
}

interface ChartPoint {
  name: string;
  bits: number;
  isYours: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface EntropyResult {
  rawEntropyBits: number;
  effectiveEntropyBits: number;
  keyspaceExponent: number;
  strengthBand: string;
  strengthColor: string;
  crackLog10Seconds: number;
  crackLog10Years: number;
  crackDescription: string;
  marginVs128: number;
  bitsPerUnit: number;
  unitLabel: string;
  checksumBits: number;
  chartData: ChartPoint[];
  rows: TableRow[];
  // Professional mode
  energyLog10Joules: number;
  costLog10Dollars: number;
  landauerRatioLog10: number;
  quantumEffectiveBits: number;
}

const LOG2 = Math.log10(2);
// BIP-39 wordlists contain exactly 2048 words, so each word carries 11 bits.
const BITS_PER_BIP39_WORD = 11;
const SECONDS_PER_YEAR = 31557600;
// Age of the universe in years, used as an intuitive upper reference.
const UNIVERSE_AGE_LOG10_YEARS = Math.log10(1.38e10);
// Landauer's limit at room temperature: minimum joules to irreversibly flip one bit.
const LANDAUER_JOULES = 2.85e-21;

const METHODS: MethodSpec[] = [
  { key: "bip39", label: "BIP-39 Mnemonic Words", bitsPerUnit: BITS_PER_BIP39_WORD, unitLabel: "words" },
  { key: "dice", label: "Casino Dice Rolls (d6)", bitsPerUnit: Math.log2(6), unitLabel: "rolls" },
  { key: "coin", label: "Coin Flips", bitsPerUnit: 1, unitLabel: "flips" },
  { key: "hex", label: "Random Hex Characters", bitsPerUnit: 4, unitLabel: "characters" },
  { key: "passphrase", label: "Random Passphrase Characters", bitsPerUnit: 0, unitLabel: "characters" },
];

const DEFAULTS: EntropyInputs = {
  method: "bip39",
  quantity: 12,
  passphraseCharset: 95,
  attackerRateLog10: 12,
  extraPassphraseBits: 0,
  kdfIterationsLog2: 0,
  proMode: false,
  wattsPerGuessLog10: -9,
  electricityCostPerKwh: 0.1,
};

function methodSpec(key: Method): MethodSpec {
  return METHODS.find((m) => m.key === key) ?? METHODS[0];
}

function bitsPerUnitFor(i: EntropyInputs): number {
  if (i.method === "passphrase") {
    const charset = Math.max(2, Math.round(i.passphraseCharset));
    return Math.log2(charset);
  }
  return methodSpec(i.method).bitsPerUnit;
}

// Renders a base-10 exponent as readable text without overflowing to Infinity.
function formatLog10(exponent: number, unit: string): string {
  if (!isFinite(exponent)) return "effectively unbounded";
  if (exponent < 0) return `less than 1 ${unit}`;
  if (exponent < 6) return `${Math.round(Math.pow(10, exponent)).toLocaleString("en-US")} ${unit}`;
  const mantissa = Math.pow(10, exponent - Math.floor(exponent));
  return `${mantissa.toFixed(2)} × 10^${Math.floor(exponent)} ${unit}`;
}

export function calculateKeyEntropy(i: EntropyInputs): EntropyResult {
  const spec = methodSpec(i.method);
  const bitsPerUnit = bitsPerUnitFor(i);
  const quantity = Math.max(0, Math.round(i.quantity));

  // BIP-39 phrases include a checksum, so the wordlist bits overstate true entropy.
  // A 12-word phrase carries 132 wordlist bits but only 128 bits of real entropy.
  const checksumBits = i.method === "bip39" ? (quantity * BITS_PER_BIP39_WORD) / 33 : 0;
  const rawEntropyBits = Math.max(0, quantity * bitsPerUnit - checksumBits);

  // An optional BIP-39 passphrase and KDF stretching both add to attacker work.
  const effectiveEntropyBits = rawEntropyBits + Math.max(0, i.extraPassphraseBits) + Math.max(0, i.kdfIterationsLog2);

  const keyspaceExponent = effectiveEntropyBits * LOG2;

  // On average an exhaustive search succeeds after half the keyspace.
  const crackLog10Seconds = (effectiveEntropyBits - 1) * LOG2 - i.attackerRateLog10;
  const crackLog10Years = crackLog10Seconds - Math.log10(SECONDS_PER_YEAR);

  let strengthBand: string;
  let strengthColor: string;
  if (effectiveEntropyBits >= 128) {
    strengthBand = "Cryptographically Secure";
    strengthColor = "text-emerald-600";
  } else if (effectiveEntropyBits >= 100) {
    strengthBand = "Strong";
    strengthColor = "text-emerald-600";
  } else if (effectiveEntropyBits >= 80) {
    strengthBand = "Marginal";
    strengthColor = "text-amber-600";
  } else if (effectiveEntropyBits >= 64) {
    strengthBand = "Weak";
    strengthColor = "text-amber-600";
  } else {
    strengthBand = "Critically Insufficient";
    strengthColor = "text-red-600";
  }

  let crackDescription: string;
  if (crackLog10Years > UNIVERSE_AGE_LOG10_YEARS) {
    const universes = crackLog10Years - UNIVERSE_AGE_LOG10_YEARS;
    crackDescription = `${formatLog10(universes, "times")} the current age of the universe`;
  } else if (crackLog10Years > 0) {
    crackDescription = formatLog10(crackLog10Years, "years");
  } else if (crackLog10Seconds > 0) {
    crackDescription = formatLog10(crackLog10Seconds, "seconds");
  } else {
    crackDescription = "under one second";
  }

  const marginVs128 = effectiveEntropyBits - 128;

  const chartData: ChartPoint[] = [
    { name: "56-bit DES", bits: 56, isYours: false },
    { name: "64-bit", bits: 64, isYours: false },
    { name: "80-bit floor", bits: 80, isYours: false },
    { name: "Your key", bits: Math.round(effectiveEntropyBits), isYours: true },
    { name: "128-bit AES", bits: 128, isYours: false },
    { name: "256-bit AES", bits: 256, isYours: false },
  ];

  const rows: TableRow[] = [
    { label: "Generation Method", value: spec.label },
    { label: `Quantity (${spec.unitLabel})`, value: quantity.toLocaleString("en-US") },
    { label: "Entropy per Unit", value: `${bitsPerUnit.toFixed(3)} bits` },
    { label: "Raw Wordlist / Symbol Bits", value: `${(quantity * bitsPerUnit).toFixed(1)} bits` },
    { label: "Checksum Bits Deducted", value: `${checksumBits.toFixed(1)} bits` },
    { label: "True Seed Entropy", value: `${rawEntropyBits.toFixed(1)} bits`, key: true },
    { label: "Added Passphrase Entropy", value: `${Math.max(0, i.extraPassphraseBits).toFixed(1)} bits` },
    { label: "KDF Stretching Equivalent", value: `${Math.max(0, i.kdfIterationsLog2).toFixed(1)} bits` },
    { label: "Effective Attacker Work Factor", value: `${effectiveEntropyBits.toFixed(1)} bits` },
    { label: "Total Keyspace", value: `10^${keyspaceExponent.toFixed(1)} combinations` },
    { label: "Security Classification", value: strengthBand },
    { label: "Margin vs 128-bit Standard", value: `${marginVs128 >= 0 ? "+" : ""}${marginVs128.toFixed(1)} bits` },
  ];

  // Professional mode: thermodynamic cost of the search.
  const energyLog10Joules = (effectiveEntropyBits - 1) * LOG2 + i.wattsPerGuessLog10;
  // 1 kWh = 3.6e6 joules.
  const kwhLog10 = energyLog10Joules - Math.log10(3.6e6);
  const costLog10Dollars = kwhLog10 + Math.log10(Math.max(0.0001, i.electricityCostPerKwh));
  const landauerRatioLog10 = energyLog10Joules - ((effectiveEntropyBits - 1) * LOG2 + Math.log10(LANDAUER_JOULES));
  // Grover's algorithm gives a quadratic speedup against symmetric search.
  const quantumEffectiveBits = effectiveEntropyBits / 2;

  return {
    rawEntropyBits,
    effectiveEntropyBits,
    keyspaceExponent,
    strengthBand,
    strengthColor,
    crackLog10Seconds,
    crackLog10Years,
    crackDescription,
    marginVs128,
    bitsPerUnit,
    unitLabel: spec.unitLabel,
    checksumBits,
    chartData,
    rows,
    energyLog10Joules,
    costLog10Dollars,
    landauerRatioLog10,
    quantumEffectiveBits,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function ColdWalletKeyEntropyCalculator() {
  const [inputs, setInputs] = useState<EntropyInputs>(DEFAULTS);
  const [result, setResult] = useState<EntropyResult>(calculateKeyEntropy(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateKeyEntropy(inputs));
  }, []);

  const calculate = () => setResult(calculateKeyEntropy(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateKeyEntropy(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof EntropyInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const faqs = [
    {
      question: "How many bits of entropy does a 12-word seed phrase have?",
      answer:
        "Exactly 128 bits. Each BIP-39 word is drawn from a 2,048-word list and therefore encodes 11 bits, giving 132 bits across twelve words. The last four of those bits are a checksum derived from the first 128, not independent randomness, so the true entropy is 128 bits. A 24-word phrase works the same way: 264 wordlist bits minus 8 checksum bits equals 256 bits of real entropy.",
    },
    {
      question: "Is 128 bits actually enough, or should I use 24 words?",
      answer:
        "128 bits is enough by an enormous margin and will remain so. Searching a 128-bit keyspace is not merely expensive, it is thermodynamically prohibited: even a perfectly efficient computer operating at Landauer's limit would need more energy than the Sun outputs over its remaining lifetime. A 24-word phrase gives 256 bits, which is genuinely stronger on paper, but the difference is irrelevant against brute force. Choose 24 words for margin against future cryptanalysis of the underlying primitives, not because 128 bits is crackable.",
    },
    {
      question: "How many dice rolls do I need for a secure key?",
      answer:
        "A standard six-sided die produces log2(6) ≈ 2.585 bits per roll, so 50 rolls yields about 129 bits and 99 rolls yields about 256 bits. Casino-grade precision dice are preferred because ordinary dice have measurable bias from the drilled pips. Dice are the gold standard for seed generation precisely because you can verify the randomness yourself rather than trusting a device's random number generator.",
    },
    {
      question: "Does adding a BIP-39 passphrase really help?",
      answer:
        "Yes, and it is the most effective single upgrade available. The passphrase, sometimes called the 25th word, is combined with the seed to derive an entirely different wallet. An attacker who physically obtains your written seed phrase still cannot access funds without it. The catch is that it is unrecoverable: forget the passphrase and the funds are gone permanently, with no support line to call. Add its own entropy in Advanced Options to see the combined work factor.",
    },
    {
      question: "What is a key derivation function and why does it add bits?",
      answer:
        "A KDF such as PBKDF2 or scrypt deliberately makes each guess slow by iterating a hash thousands or millions of times. If it takes 2^20 operations to test one candidate, the attacker's effective work rises by 20 bits. This is modelled here as an entropy equivalent because that is exactly how it functions against brute force. KDF stretching matters enormously for human-chosen passphrases and matters very little for a properly random 128-bit seed, which is already unsearchable.",
    },
    {
      question: "Do quantum computers break seed phrases?",
      answer:
        "Not in the way most coverage suggests. Grover's algorithm provides a quadratic speedup against symmetric search, which halves effective bit strength: a 128-bit seed becomes roughly 64-bit equivalent, and a 256-bit seed becomes 128-bit equivalent. The genuine quantum threat to cryptocurrency is Shor's algorithm against the elliptic curve signatures that protect spent addresses, not against seed entropy. Professional Mode shows the Grover-adjusted figure.",
    },
    {
      question: "Why can't I just pick words myself?",
      answer:
        "Because human choice is not random and the loss is catastrophic rather than marginal. People select memorable words, common words, and thematically related sequences, collapsing an apparent 128-bit space to something an attacker can search in hours. The same applies to picking a phrase from a book, a song lyric, or a birthday. Entropy calculations only hold when every unit is drawn independently and uniformly, which is why dice or a vetted hardware generator matter.",
    },
    {
      question: "Where does this calculator's threat model come from?",
      answer:
        "The default attacker is assumed to try 10^12 candidates per second, which is far beyond any realistic adversary for seed phrase search and is chosen deliberately as a worst case. All arithmetic runs locally in your browser using base-10 logarithms so the numbers never overflow, and nothing you enter is transmitted anywhere. Never type a real seed phrase into any website, including this one; enter only word counts and roll counts.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator/finance" },
          { label: "Cold Wallet Key Entropy Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cold Wallet Key Entropy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="method" className={lbl}>Generation Method</label>
                <select id="method" className={inp} value={inputs.method}
                  onChange={(e) => setInputs((p) => ({ ...p, method: e.target.value as Method }))}>
                  {METHODS.map((m) => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className={lbl}>
                  Number of {methodSpec(inputs.method).unitLabel}
                </label>
                <input id="quantity" type="number" min="1" step="1" className={inp} value={inputs.quantity}
                  onChange={(e) => setNum("quantity", e.target.value)} />
              </div>
              <div>
                <label htmlFor="passphraseCharset" className={lbl}>Character Set Size</label>
                <input id="passphraseCharset" type="number" min="2" step="1" className={inp}
                  disabled={inputs.method !== "passphrase"} value={inputs.passphraseCharset}
                  onChange={(e) => setNum("passphraseCharset", e.target.value)} />
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <ShieldCheck className="h-3.5 w-3.5" /> Key Hardening
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="extraPassphraseBits" className={lbl}>Passphrase Bits</label>
                        <input id="extraPassphraseBits" type="number" min="0" step="1" className={inp}
                          value={inputs.extraPassphraseBits} onChange={(e) => setNum("extraPassphraseBits", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="kdfIterationsLog2" className={lbl}>KDF Cost (bits)</label>
                        <input id="kdfIterationsLog2" type="number" min="0" step="1" className={inp}
                          value={inputs.kdfIterationsLog2} onChange={(e) => setNum("kdfIterationsLog2", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Cpu className="h-3.5 w-3.5" /> Attacker Model
                    </div>
                    <div>
                      <label htmlFor="attackerRateLog10" className={lbl}>Guess Rate</label>
                      <select id="attackerRateLog10" className={inp} value={inputs.attackerRateLog10}
                        onChange={(e) => setNum("attackerRateLog10", e.target.value)}>
                        <option value="6">10^6 /sec — single laptop</option>
                        <option value="9">10^9 /sec — GPU rig</option>
                        <option value="12">10^12 /sec — nation-state cluster</option>
                        <option value="15">10^15 /sec — global botnet</option>
                        <option value="18">10^18 /sec — hypothetical maximum</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <KeyRound className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock thermodynamic and quantum analysis
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="wattsPerGuessLog10" className={lbl}>Joules per Guess</label>
                          <select id="wattsPerGuessLog10" className={inp} value={inputs.wattsPerGuessLog10}
                            onChange={(e) => setNum("wattsPerGuessLog10", e.target.value)}>
                            <option value="-6">10^-6 J — current hardware</option>
                            <option value="-9">10^-9 J — optimistic ASIC</option>
                            <option value="-12">10^-12 J — theoretical limit</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="electricityCostPerKwh" className={lbl}>Electricity $/kWh</label>
                          <input id="electricityCostPerKwh" type="number" min="0.01" step="0.01" className={inp}
                            value={inputs.electricityCostPerKwh} onChange={(e) => setNum("electricityCostPerKwh", e.target.value)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Effective Key Entropy</div>
              <div className="text-4xl font-bold text-primary my-1">{result.effectiveEntropyBits.toFixed(1)} bits</div>
              <div className="text-sm text-muted-foreground">
                {result.strengthBand} — a keyspace of 10^{result.keyspaceExponent.toFixed(1)} combinations
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Classification</div>
                <div className={`text-lg font-bold ${result.strengthColor}`}>{result.strengthBand}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Seed Entropy</div>
                <div className="text-lg font-bold text-foreground">{result.rawEntropyBits.toFixed(0)} bits</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">vs 128-bit</div>
                <div className={`text-lg font-bold ${result.marginVs128 >= 0 ? "text-emerald-600" : result.marginVs128 >= -48 ? "text-amber-600" : "text-red-600"}`}>
                  {result.marginVs128 >= 0 ? "+" : ""}{result.marginVs128.toFixed(0)} bits
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Average Time to Exhaust Keyspace</div>
              <div className="text-2xl font-bold text-foreground">{result.crackDescription}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Assuming 10^{inputs.attackerRateLog10} guesses per second, sustained without interruption
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Entropy Component</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Total Effective Entropy</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.effectiveEntropyBits.toFixed(1)} bits</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Entropy Against Standard Benchmarks</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} label={{ value: "bits", angle: -90, position: "insideLeft", fontSize: 11 }} />
                    <RTooltip formatter={(value: number) => `${value} bits`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <ReferenceLine y={128} stroke="#10B981" strokeDasharray="4 4" />
                    <Bar dataKey="bits" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.isYours ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> Your key
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Reference standard
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#10B981" }} /> 128-bit security line
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Thermodynamic &amp; Quantum Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Energy to Exhaust</div>
                    <div className="text-base font-bold text-foreground">10^{result.energyLog10Joules.toFixed(1)} joules</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Electricity Cost</div>
                    <div className="text-base font-bold text-foreground">10^{result.costLog10Dollars.toFixed(1)} USD</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Multiple of Landauer Limit</div>
                    <div className="text-base font-bold text-foreground">10^{result.landauerRatioLog10.toFixed(1)}x</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Post-Grover Strength</div>
                    <div className={`text-base font-bold ${result.quantumEffectiveBits >= 128 ? "text-emerald-600" : result.quantumEffectiveBits >= 64 ? "text-amber-600" : "text-red-600"}`}>
                      {result.quantumEffectiveBits.toFixed(1)} bits
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Key Entropy Measures</h2>
            <p className="mb-4">
              Entropy is the number of genuinely unpredictable bits behind a key, and it is the only honest measure of how
              hard that key is to guess. A key with 128 bits of entropy can take any of 2^128 values, roughly 3.4 × 10^38
              possibilities. Crucially, entropy counts randomness, not length. A 40-character passphrase copied from a song
              lyric has almost no entropy despite its length, while 50 dice rolls recorded honestly have about 129 bits.
              This calculator works from the generation method rather than the output, because that is where the randomness
              actually comes from.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why 12 Words Equals 128 Bits, Not 132</h2>
            <p className="mb-4">
              BIP-39 wordlists contain exactly 2,048 entries, so each word encodes 11 bits and twelve words appear to carry
              132. Four of those bits are a checksum computed from the other 128, which lets a wallet detect a mistyped
              word but adds no unpredictability. True entropy is therefore 128 bits. The same structure scales: a 24-word
              phrase carries 264 wordlist bits minus 8 checksum bits, giving exactly 256. Any calculator that reports 132
              or 264 bits is counting the checksum as randomness, which it is not.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why 128 Bits Cannot Be Brute Forced</h2>
            <p className="mb-4">
              The impossibility here is physical rather than merely economic. Landauer's principle sets a minimum energy of
              about 2.85 × 10^-21 joules to irreversibly flip a single bit at room temperature. Simply counting through a
              128-bit keyspace, with no work done per candidate, would require more energy than is plausibly available to a
              civilisation on this planet, and 256 bits exceeds the output of the Sun over its remaining lifetime. Real
              cryptocurrency losses do not come from broken entropy. They come from photographed seed phrases, cloud
              backups, phishing, malicious wallet software, and keys generated by weak random number generators.
            </p>

            <h2 className="text-2xl font-bold mb-3">Generating Entropy You Can Verify</h2>
            <p>
              The advantage of dice is verification: you can see the randomness happen rather than trusting a chip you
              cannot audit. Casino-grade precision dice avoid the small bias introduced by drilled pips, and 50 rolls give
              128 bits while 99 rolls give 256. Never choose words yourself, never derive a phrase from a book or lyric,
              and never enter a real seed phrase into any website, this one included. Enter only counts here. If you use a
              BIP-39 passphrase as a 25th word, add its entropy in Advanced Options to see the combined work factor, and
              remember that the passphrase is unrecoverable by design: losing it destroys access as completely as losing
              the seed itself.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cold-wallet-key-entropy-calculator" />
          <PopularCalculators exclude="/calculator/cold-wallet-key-entropy-calculator" />
        </div>
      </div>
    </>
  );
}
