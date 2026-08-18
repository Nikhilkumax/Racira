"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { md5, sha1 } from "@noble/hashes/legacy.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";

interface HashResult {
  text: string;
  bytes: number;
  chars: number;
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function toHex(u: Uint8Array): string {
  return Array.from(u).map(b => b.toString(16).padStart(2, "0")).join("");
}

function calcHashes(text: string): HashResult {
  const data = new TextEncoder().encode(text);
  const hMd5 = toHex(md5(data));
  const hSha1 = toHex(sha1(data));
  const hSha256 = toHex(sha256(data));
  const hSha512 = toHex(sha512(data));

  const breakdown = [
    { label: "Input Text", value: text.length > 60 ? `${text.slice(0, 60)}…` : text },
    { label: "Input Length", value: `${text.length} chars · ${data.length} bytes` },
    { label: "MD5 (128-bit)", value: hMd5 },
    { label: "SHA-1 (160-bit)", value: hSha1 },
    { label: "SHA-256 (256-bit)", value: hSha256 },
    { label: "SHA-512 (512-bit)", value: hSha512 },
    { label: "Algorithm", value: "Noble Hashes (client-side)" },
    { label: "Network", value: "None — computed locally" },
  ];
  const summaryStats = [
    { label: "SHA-256", value: `${hSha256.slice(0, 16)}…` },
    { label: "MD5", value: `${hMd5.slice(0, 16)}…` },
    { label: "SHA-1", value: `${hSha1.slice(0, 16)}…` },
    { label: "SHA-512", value: `${hSha512.slice(0, 16)}…` },
    { label: "Input", value: `${text.length} chars` },
    { label: "Bytes", value: `${data.length} bytes` },
    { label: "Security", value: "SHA-256 / SHA-512" },
    { label: "Legacy", value: "MD5, SHA-1 (broken)" },
  ];
  const chartData = [
    { name: "MD5", value: 128, fill: "#ef4444" },
    { name: "SHA-1", value: 160, fill: "#f59e0b" },
    { name: "SHA-256", value: 256, fill: "hsl(var(--primary))" },
    { name: "SHA-512", value: 512, fill: "#10b981" },
  ];
  return { text, bytes: data.length, chars: text.length, md5: hMd5, sha1: hSha1, sha256: hSha256, sha512: hSha512, breakdown, summaryStats, chartData };
}

const DEFAULT_TEXT = "Hello, World!";

export default function HashCalculator() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [result, setResult] = useState<HashResult | null>(null);

  const errs: string[] = [];
  if (text.trim().length === 0) errs.push("Enter some text to hash.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHashes(text)); };
  const reset = () => {
    setText(DEFAULT_TEXT);
    setResult(calcHashes(DEFAULT_TEXT));
  };
  useEffect(() => { setResult(calcHashes(DEFAULT_TEXT)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a cryptographic hash?", answer: "A one-way function that maps any input to a fixed-length fingerprint. You can compute the hash of text in milliseconds, but reversing a hash to recover the input is computationally infeasible." },
    { question: "Which algorithm should I use?", answer: "SHA-256 or SHA-512 for security-sensitive checksums and password hashing pipelines. MD5 and SHA-1 are cryptographically broken (collision attacks exist) and should only be used for legacy compatibility or file integrity where collisions are tolerable." },
    { question: "Is my input sent anywhere?", answer: "No. All hashing happens locally in your browser using the Noble Hashes library — the text never leaves your device." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Hash Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Hash Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Text to Hash</label>
              <div className="flex items-center rounded-md border border-input bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <input value={text} onChange={e => setText(e.target.value)} placeholder="Enter any text…" className="w-full h-10 px-3 text-base bg-transparent outline-none border-none text-foreground" />
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">SHA-256 Hash</div>
                <div className="text-xl md:text-2xl font-extrabold tracking-tight break-all">{result.sha256}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.chars} chars · {result.bytes} bytes · computed locally</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`MD5 Length`, "32 hex chars"], ["SHA-1 Length", "40 hex chars"], ["SHA-512 Length", "128 hex chars"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">All Hash Outputs</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 align-top ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold break-all ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Hash Length (bits)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}b`} />
                    <Tooltip formatter={(v: number) => [`${v} bits`, "Hash size"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">One-Way Fingerprints</h2>
            <p>This <strong>hash calculator</strong> computes MD5, SHA-1, SHA-256, and SHA-512 digests of any text entirely in your browser using the Noble Hashes library. A hash is deterministic — the same input always produces the same digest — yet practically irreversible, which makes hashes ideal for integrity checks and password verification.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing an Algorithm</h2>
            <p>SHA-256 and SHA-512 remain secure for general use. MD5 and SHA-1 are broken: researchers have constructed collisions in seconds to minutes, so they are unsuitable where an attacker could craft two inputs with the same digest.</p>
            <h2 className="text-2xl font-bold mb-3">Privacy by Design</h2>
            <p>Because every digest is computed client-side, sensitive strings — API keys, tokens, candidate passwords — never transit the network. Use this tool to verify checksums, test hashing pipelines, or inspect how algorithms behave before integrating them.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hash-calculator" />
          <PopularCalculators exclude="/calculator/hash-calculator" />
        </div>
      </div>
    </>
  );
}
