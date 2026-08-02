"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Shield, Key, Lock, Hash } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface EntropyResult {
  keyBits: number;
  entropyBits: number;
  entropyBytes: number;
  entropyNibbles: number;
  possibleKeys: number;
  bruteForceTime: string;
  securityLevel: string;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  keyBits: "256",
  entropySource: "uniform",
  hashAlgorithm: "SHA-256",
};

const ENTROPY_SOURCES: Record<string, { name: string; efficiency: number; description: string }> = {
  uniform: { name: "Uniform Random", efficiency: 1.0, description: "Each bit is equally likely 0 or 1" },
  biased: { name: "Biased (80/20)", efficiency: 0.72, description: "80% probability of 0, 20% of 1" },
  partially: { name: "Partially Correlated", efficiency: 0.5, description: "Bits have 50% correlation" },
  weak: { name: "Weak PRNG", efficiency: 0.25, description: "Low-entropy pseudo-random source" },
};

const HASH_OUTPUT_BITS: Record<string, number> = {
  "SHA-256": 256,
  "SHA-512": 512,
  "SHA-3-256": 256,
  "SHA-3-512": 512,
  "BLAKE2b": 512,
  "BLAKE2s": 256,
};

const calculate = (v: typeof DEFAULTS): EntropyResult => {
  const keyBits = parseFloat(v.keyBits) || 0;
  const source = ENTROPY_SOURCES[v.entropySource] || ENTROPY_SOURCES.uniform;
  const hashBits = HASH_OUTPUT_BITS[v.hashAlgorithm] || 256;

  const entropyBits = keyBits * source.efficiency;
  const entropyBytes = entropyBits / 8;
  const entropyNibbles = entropyBits / 4;
  const possibleKeys = Math.pow(2, entropyBits);

  let bruteForceTime: string;
  if (entropyBits >= 128) {
    bruteForceTime = "Practically infinite (exceeds age of universe)";
  } else if (entropyBits >= 80) {
    bruteForceTime = "Millions of years with current technology";
  } else if (entropyBits >= 64) {
    bruteForceTime = "Years to decades with specialized hardware";
  } else if (entropyBits >= 40) {
    bruteForceTime = "Hours to days with GPU clusters";
  } else if (entropyBits >= 32) {
    bruteForceTime = "Minutes to hours with GPU clusters";
  } else {
    bruteForceTime = "Seconds to minutes with consumer hardware";
  }

  let securityLevel: string;
  if (entropyBits >= 128) securityLevel = "Cryptographic (Strong)";
  else if (entropyBits >= 80) securityLevel = "Moderate";
  else if (entropyBits >= 64) securityLevel = "Weak";
  else securityLevel = "Insecure";

  const chartData = [
    { name: "Key Size", value: parseFloat(keyBits.toFixed(0)), fill: "#3b82f6" },
    { name: "Effective Entropy", value: parseFloat(entropyBits.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Hash Output", value: parseFloat(hashBits.toFixed(0)), fill: "#10b981" },
    { name: "Source Efficiency", value: parseFloat((source.efficiency * 100).toFixed(0)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Key Size", value: `${keyBits.toFixed(0)} bits` },
    { label: "Entropy Source", value: source.name },
    { label: "Source Efficiency", value: `${(source.efficiency * 100).toFixed(0)}%` },
    { label: "Effective Entropy", value: `${entropyBits.toFixed(1)} bits` },
    { label: "Entropy (Bytes)", value: `${entropyBytes.toFixed(1)} bytes` },
    { label: "Entropy (Nibbles)", value: `${entropyNibbles.toFixed(1)} nibbles` },
    { label: "Possible Keys", value: possibleKeys.toExponential(3) },
    { label: "Hash Algorithm", value: v.hashAlgorithm },
    { label: "Hash Output Size", value: `${hashBits} bits` },
    { label: "Brute Force Time", value: bruteForceTime },
    { label: "Security Level", value: securityLevel },
  ];

  const summaryStats = [
    { label: "Key Size", value: `${keyBits.toFixed(0)} bits` },
    { label: "Effective Entropy", value: `${entropyBits.toFixed(1)} bits` },
    { label: "Possible Keys", value: possibleKeys.toExponential(2) },
    { label: "Security Level", value: securityLevel },
    { label: "Brute Force", value: entropyBits >= 128 ? "Infeasible" : bruteForceTime },
  ];

  return {
    keyBits, entropyBits, entropyBytes, entropyNibbles, possibleKeys,
    bruteForceTime, securityLevel,
    chartData, breakdown, summaryStats,
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

export default function ColdWalletKeyEntropyCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<EntropyResult | null>(null);
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
    { question: "What is key entropy in cold wallets?", answer: "Key entropy measures the randomness quality of the private key generated for a cold wallet. Higher entropy means more possible keys, making brute-force attacks infeasible. A 256-bit key with full entropy has 2^256 possible combinations." },
    { question: "Why does entropy source matter?", answer: "The entropy source determines how many truly random bits are available. A uniform random source provides maximum entropy per bit. Biased or correlated sources waste entropy, reducing the effective security of the key." },
    { question: "What is a secure entropy level for cryptocurrency?", answer: "For cryptocurrency wallets, 128 bits of effective entropy is considered the minimum for security against brute-force attacks. 256 bits is the standard for Bitcoin and most modern wallets, providing security far beyond what is computationally feasible." },
    { question: "How long would it take to brute-force a 256-bit key?", answer: "Even with all the computing power on Earth, brute-forcing a 256-bit key would take longer than the age of the universe. The number of possible keys (2^256) is approximately 1.16 × 10^77." },
    { question: "What is the role of the hash algorithm?", answer: "Hash algorithms like SHA-256 are used to derive deterministic keys from entropy sources. The hash output size determines the maximum effective entropy. SHA-256 produces 256 bits of output, matching the standard 256-bit key size." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Cold Wallet Key Entropy Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Cold Wallet Key Entropy Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Key className="w-3.5 h-3.5" /> Key Parameters
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Key Size (bits)</label>
                  <input type="number" value={vals.keyBits} onChange={(e) => updateVal("keyBits", e.target.value)} className="input-calc" step="8" min="128" max="512" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Entropy Source</label>
                  <select value={vals.entropySource} onChange={(e) => updateVal("entropySource", e.target.value)} className="input-calc">
                    {Object.entries(ENTROPY_SOURCES).map(([k, s]) => (
                      <option key={k} value={k}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Hash Algorithm</label>
                  <select value={vals.hashAlgorithm} onChange={(e) => updateVal("hashAlgorithm", e.target.value)} className="input-calc">
                    {Object.keys(HASH_OUTPUT_BITS).map((algo) => (
                      <option key={algo} value={algo}>{algo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className={`border-l-4 rounded-lg p-5 ${result.securityLevel.includes("Strong") ? "bg-emerald-500/10 border-emerald-500" : result.securityLevel.includes("Moderate") ? "bg-amber-500/10 border-amber-500" : "bg-rose-500/10 border-rose-500"}`}>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Security Level
                </div>
                <div className={`text-4xl font-bold ${result.securityLevel.includes("Strong") ? "text-emerald-600" : result.securityLevel.includes("Moderate") ? "text-amber-600" : "text-rose-600"}`}>
                  {result.securityLevel}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.entropyBits.toFixed(1)} bits effective entropy · {result.possibleKeys.toExponential(2)} possible keys
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Entropy</div>
                  <div className="text-lg font-bold text-foreground">{result.entropyBits.toFixed(1)} bits</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Possible Keys</div>
                  <div className="text-lg font-bold text-foreground">{result.possibleKeys.toExponential(2)}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Brute Force</div>
                  <div className="text-lg font-bold text-foreground">{result.bruteForceTime.split(" ")[0]}</div>
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
                <h3 className="text-sm font-semibold mb-3">Key Size vs Entropy</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Cold Wallet Key Entropy: The Foundation of Security</h2>
            <p>Cold wallets (hardware wallets, paper wallets, air-gapped devices) derive their security from the entropy of the private key they generate. Entropy is the measure of randomness in a key — the more random bits, the harder it is for an attacker to guess or brute-force the key. This calculator helps you understand the effective entropy of your cold wallet keys and the security implications of different entropy sources and key sizes.</p>

            <h3>1. Understanding Key Entropy</h3>
            <p>In cryptography, entropy measures the unpredictability of a key. A 256-bit key generated from a perfect random source has 256 bits of entropy, meaning there are 2^256 possible keys. However, if the random source is biased or predictable, the effective entropy is lower. For example, a biased source where 80% of bits are 0 and 20% are 1 has an entropy of about 0.72 bits per bit, so a 256-bit key from this source has only about 184 bits of effective entropy.</p>

            <h3>2. Entropy Sources and Their Quality</h3>
            <p>High-quality entropy sources include hardware random number generators (TRNGs) that measure physical phenomena like thermal noise or radioactive decay. Lower-quality sources include pseudo-random number generators (PRNGs) that use deterministic algorithms seeded with limited entropy. The efficiency factor quantifies how much effective entropy is lost due to bias or correlation in the source.</p>

            <h3>3. Security Levels for Cryptocurrency</h3>
            <p>For Bitcoin and most cryptocurrencies, a 128-bit effective entropy is considered the minimum for security against brute-force attacks. The standard 256-bit key size with full entropy provides 256 bits of security, which is far beyond what any foreseeable technology can break. Even quantum computers using Grover's algorithm would reduce this to 128 bits of security — still considered secure.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cold-wallet-key-entropy-calculator" />
          <PopularCalculators exclude="/calculator/cold-wallet-key-entropy-calculator" />
        </div>
      </div>
    </>
  );
}
