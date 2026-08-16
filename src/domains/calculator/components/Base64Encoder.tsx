"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface EncodeResult {
  output: string;
  inputBytes: number;
  outputChars: number;
  expansionRatio: number;
  paddingChars: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function encodeBase64(text: string): EncodeResult {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const output = btoa(binary);
  const outputChars = output.length;
  const padding = (output.match(/=+$/) || [""])[0].length;
  const expansionRatio = bytes.length > 0 ? outputChars / bytes.length : 0;

  return {
    output,
    inputBytes: bytes.length,
    outputChars,
    expansionRatio,
    paddingChars: padding,
    chartData: [
      { name: "Input", value: bytes.length },
      { name: "Output", value: outputChars },
    ],
    breakdown: [
      { label: "Input Text", value: `"${text.slice(0, 48)}${text.length > 48 ? "…" : ""}"` },
      { label: "Input Size", value: `${bytes.length} bytes` },
      { label: "Encoded Output", value: output.length > 48 ? `${output.slice(0, 48)}…` : output },
      { label: "Output Length", value: `${outputChars} characters` },
      { label: "Padding Characters", value: padding > 0 ? `${padding} "=" sign(s)` : "None (multiple of 3 bytes)" },
      { label: "Expansion Ratio", value: `${expansionRatio.toFixed(3)}× (33% overhead)` },
    ],
    summaryStats: [
      { label: "Input Bytes", value: `${bytes.length}` },
      { label: "Output Characters", value: `${outputChars}` },
      { label: "Expansion", value: `${expansionRatio.toFixed(2)}×` },
      { label: "Padding", value: `${padding} chars` },
      { label: "Size Increase", value: bytes.length > 0 ? `+${Math.round((expansionRatio - 1) * 100)}%` : "0%" },
      { label: "Lines at 76 Chars", value: `${Math.ceil(outputChars / 76)}` },
    ],
  };
}

function decodeBase64(encoded: string): EncodeResult {
  const clean = encoded.replace(/\s+/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  let output = "";
  try {
    output = new TextDecoder().decode(bytes);
  } catch {
    output = binary;
  }
  const inputBytes = clean.length;
  const expansionRatio = output.length > 0 ? inputBytes / output.length : 0;
  const paddingChars = (clean.match(/=+$/) || [""])[0].length;

  return {
    output,
    inputBytes,
    outputChars: output.length,
    expansionRatio,
    paddingChars,
    chartData: [
      { name: "Input", value: inputBytes },
      { name: "Output", value: output.length },
    ],
    breakdown: [
      { label: "Encoded Input", value: encoded.length > 48 ? `${encoded.slice(0, 48)}…` : encoded },
      { label: "Input Length", value: `${inputBytes} characters` },
      { label: "Decoded Output", value: output.length > 48 ? `${output.slice(0, 48)}…` : output },
      { label: "Output Size", value: `${output.length} bytes` },
      { label: "Trailing Padding", value: paddingChars > 0 ? `${paddingChars} "=" sign(s)` : "None" },
      { label: "Size Reduction", value: `${(1 / (expansionRatio || 1)).toFixed(3)}× (25% smaller)` },
    ],
    summaryStats: [
      { label: "Input Characters", value: `${inputBytes}` },
      { label: "Output Bytes", value: `${output.length}` },
      { label: "Reduction", value: expansionRatio > 0 ? `${(1 / expansionRatio).toFixed(2)}×` : "—" },
      { label: "Padding", value: `${paddingChars} chars` },
      { label: "Size Decrease", value: expansionRatio > 0 ? `-${Math.round((1 - 1 / expansionRatio) * 100)}%` : "0%" },
      { label: "UTF-8 Safe", value: "Yes (TextEncoder)" },
    ],
  };
}

const DEFAULTS = { mode: "encode" as "encode" | "decode", text: "Hello, World!" };

export default function Base64Encoder() {
  const [mode, setMode] = useState<"encode" | "decode">(DEFAULTS.mode);
  const [text, setText] = useState(DEFAULTS.text);
  const [result, setResult] = useState<EncodeResult>(() => encodeBase64(DEFAULTS.text));
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    try {
      setError(null);
      setResult(mode === "encode" ? encodeBase64(text) : decodeBase64(text));
    } catch {
      setError(mode === "decode" ? "Invalid Base64 input. Check the characters and try again." : "Unable to encode the given text.");
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setText(DEFAULTS.text);
    setError(null);
    setResult(encodeBase64(DEFAULTS.text));
  };

  useEffect(() => {
    setResult(mode === "encode" ? encodeBase64(text) : decodeBase64(text));
  }, [mode]);

  const inputBytes = new TextEncoder().encode(text).length;
  const outputChars = result.outputChars;

  const faqs = [
    { question: "What is Base64 encoding?", answer: "Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format using 64 characters (A–Z, a–z, 0–9, +, /). It is commonly used to transmit data over media that only reliably handle text, such as email attachments or URLs." },
    { question: "Why does Base64 make data bigger?", answer: "Each group of 3 input bytes (24 bits) becomes 4 Base64 characters (4 × 6 bits). That means output is always 4/3 of the input — a fixed 33% size increase, before padding. This overhead is the price of making binary data text-safe." },
    { question: "What do the '=' padding characters mean?", answer: "Base64 always encodes in groups of 3 bytes. When the input length is not a multiple of 3, one or two '=' characters are appended to pad the output back to a multiple of 4 characters. They carry no information and are stripped during decoding." },
    { question: "Where is Base64 used in practice?", answer: "Email attachments (MIME), embedding images as data URIs in HTML/CSS, JWT tokens, storing binary blobs in JSON, and transmitting binary data in XML. You'll also see it in basic authentication headers (base64 of 'user:password')." },
    { question: "Is Base64 encryption?", answer: "No. Base64 is encoding, not encryption — anyone can decode it instantly. Never use Base64 to protect sensitive data. It only converts binary to a text-safe format; confidentiality requires real encryption like AES." },
    { question: "Does this encoder handle UTF-8 text?", answer: "Yes. The input is converted to UTF-8 bytes with TextEncoder before encoding, so emojis, accented characters, and non-Latin scripts (中文, العربية, हिन्दी) are encoded correctly." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full px-3 py-2.5 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Utilities", href: "/calculator#utilities" }, { label: "Base64 Encoder" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Base64 Encoder</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1 bg-background">
              {(["encode", "decode"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); }} className={`h-9 rounded-md text-sm font-semibold transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                  {m === "encode" ? "Encode" : "Decode"}
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{mode === "encode" ? "Text to Encode" : "Base64 to Decode"}</label>
              <div className={inp}>
                <textarea value={text} onChange={e => setText(e.target.value)} className={`${ci} resize-y min-h-[110px] font-mono text-sm`} placeholder={mode === "encode" ? "Enter plain text…" : "Enter Base64 data…"} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{mode === "encode" ? `${inputBytes} bytes · ${text.length} characters` : `${text.length} characters input`}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {error && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-sm text-foreground">{error}</div>
              </div>
            )}
            {!error && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider">{mode === "encode" ? "Encoded Output" : "Decoded Text"}</div>
                    <button onClick={() => { navigator.clipboard.writeText(result.output); }} className="text-xs font-semibold text-primary hover:underline">Copy</button>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-primary break-all font-mono leading-snug">{result.output.length > 180 ? `${result.output.slice(0, 180)}…` : result.output}</div>
                  <div className="text-sm text-muted-foreground mt-1">{mode === "encode" ? `${outputChars} characters` : `${result.outputChars} bytes`}</div>
                </div>
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {mode === "encode"
                    ? [["Input", `${result.inputBytes} B`], ["Output", `${outputChars} ch`], ["Expansion", `${(result.expansionRatio * 100 - 100).toFixed(0)}%`]].map(([l, v], i) => (
                        <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                          <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                          <div className="text-base font-bold">{v}</div>
                        </div>
                      ))
                    : [["Input", `${result.inputBytes} ch`], ["Output", `${result.outputChars} B`], ["Reduction", `-${Math.round((1 - 1 / result.expansionRatio) * 100)}%`]].map(([l, v], i) => (
                        <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                          <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                          <div className="text-base font-bold">{v}</div>
                        </div>
                      ))}
                </div>
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Conversion Details</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 text-right font-semibold break-all">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Input vs Output Size</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toLocaleString()}`, "Size"]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={60} />
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
              </>
            )}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Base64?</h2>
            <p>Base64 is a binary-to-text encoding scheme that represents binary data using only 64 ASCII characters: A–Z, a–z, 0–9, +, and /. Every 3 bytes of input (24 bits) are split into four 6-bit groups and mapped to a Base64 character, producing output that is exactly 4/3 the size of the input. The <strong>Base64 encoder</strong> on this page converts any UTF-8 text — including emoji and non-Latin scripts — into this portable format, and can decode it back with the flip of a switch.</p>
            <h2 className="text-2xl font-bold mb-3">The Base64 Algorithm</h2>
            <p>Encoding works by reading the input as a stream of bytes. Groups of three bytes become four Base64 characters; a leftover of one or two bytes becomes two or three characters plus one or two "=" padding signs, keeping the total output length a multiple of four. Decoding reverses the process: each Base64 character maps back to its 6-bit value, the bits are regrouped into bytes, and the padding is discarded. The entire process is lossless — what you encode, you can decode exactly.</p>
            <h2 className="text-2xl font-bold mb-3">Why 33% Overhead?</h2>
            <p>Because Base64 uses only 64 symbols, each character carries 6 bits of information. Three 8-bit input bytes (24 bits) therefore need exactly 24 ÷ 6 = 4 output characters. That fixed ratio of 4:3 is why Base64 always inflates data by about a third. It is a deliberate trade-off: a modest size increase in exchange for data that survives any text-only channel, from old email gateways to JSON payloads.</p>
            <h2 className="text-2xl font-bold mb-3">Common Uses</h2>
            <p>Base64 appears everywhere in modern web development: data URIs that embed images directly in HTML or CSS, JWT tokens, MIME email attachments, and storing binary blobs inside JSON. Understanding it helps you debug tokens, shrink payloads, and recognize when data you are looking at is simply encoded rather than encrypted.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/base64-encoder" />
          <PopularCalculators exclude="/calculator/base64-encoder" />
        </div>
      </div>
    </>
  );
}
