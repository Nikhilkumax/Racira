"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ConvResult {
  output: string;
  chars: number;
  bytes: number;
  bits: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function textToBinary(text: string): ConvResult {
  const bytes = new TextEncoder().encode(text);
  const bits: string[] = [];
  bytes.forEach(b => bits.push(b.toString(2).padStart(8, "0")));
  const output = bits.join(" ");
  return {
    output,
    chars: text.length,
    bytes: bytes.length,
    bits: bytes.length * 8,
    chartData: [
      { name: "Characters", value: text.length },
      { name: "Bytes", value: bytes.length },
      { name: "Bits", value: bytes.length * 8 },
    ],
    breakdown: [
      { label: "Input Text", value: `"${text.slice(0, 40)}${text.length > 40 ? "…" : ""}"` },
      { label: "Characters", value: `${text.length}` },
      { label: "UTF-8 Bytes", value: `${bytes.length}` },
      { label: "Total Bits", value: `${bytes.length * 8}` },
      { label: "Bits per Character (avg)", value: text.length > 0 ? `${((bytes.length * 8) / text.length).toFixed(1)}` : "0" },
      { label: "Binary Output", value: output.length > 60 ? `${output.slice(0, 60)}…` : output },
    ],
    summaryStats: [
      { label: "Characters", value: `${text.length}` },
      { label: "Bytes", value: `${bytes.length}` },
      { label: "Bits", value: `${bytes.length * 8}` },
      { label: "Bytes per Char", value: text.length > 0 ? `${(bytes.length / text.length).toFixed(2)}` : "0" },
      { label: "ASCII Only", value: bytes.length === text.length ? "Yes" : "No" },
      { label: "Encoded Format", value: "UTF-8" },
    ],
  };
}

function binaryToText(binary: string): ConvResult {
  const cleaned = binary.replace(/\s+/g, "");
  if (cleaned.length % 8 !== 0) {
    return { output: "", chars: 0, bytes: 0, bits: 0, chartData: [], breakdown: [], summaryStats: [], };
  }
  const byteStrings = cleaned.match(/.{8}/g) || [];
  const bytes = new Uint8Array(byteStrings.map(b => parseInt(b, 2)));
  let output = "";
  try {
    output = new TextDecoder().decode(bytes);
  } catch {
    output = "";
  }
  return {
    output,
    chars: output.length,
    bytes: bytes.length,
    bits: bytes.length * 8,
    chartData: [
      { name: "Characters", value: output.length },
      { name: "Bytes", value: bytes.length },
      { name: "Bits", value: bytes.length * 8 },
    ],
    breakdown: [
      { label: "Binary Input", value: cleaned.length > 40 ? `${cleaned.slice(0, 40)}…` : cleaned },
      { label: "Byte Groups", value: `${byteStrings.length}` },
      { label: "Total Bits", value: `${bytes.length * 8}` },
      { label: "Decoded Text", value: output.length > 40 ? `"${output.slice(0, 40)}…"` : `"${output}"` },
      { label: "Characters", value: `${output.length}` },
      { label: "UTF-8 Bytes", value: `${bytes.length}` },
    ],
    summaryStats: [
      { label: "Characters", value: `${output.length}` },
      { label: "Bytes", value: `${bytes.length}` },
      { label: "Bits", value: `${bytes.length * 8}` },
      { label: "Byte Groups", value: `${byteStrings.length}` },
      { label: "ASCII Only", value: bytes.length === output.length ? "Yes" : "No" },
      { label: "Decoded Format", value: "UTF-8" },
    ],
  };
}

const DEFAULTS = { mode: "text-to-bin" as "text-to-bin" | "bin-to-text", value: "Hello, World!" };

export default function BinaryTextConverter() {
  const [mode, setMode] = useState<"text-to-bin" | "bin-to-text">(DEFAULTS.mode);
  const [value, setValue] = useState(DEFAULTS.value);
  const [result, setResult] = useState<ConvResult>(() => textToBinary(DEFAULTS.value));
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    if (mode === "text-to-bin") {
      setError(null);
      setResult(textToBinary(value));
    } else {
      const cleaned = value.replace(/\s+/g, "");
      if (!cleaned) { setError("Enter a binary string (8 bits per character)."); return; }
      if (cleaned.length % 8 !== 0) { setError("Binary length must be a multiple of 8 — each character is 8 bits (1 byte)."); return; }
      if (!/^[01]+$/.test(cleaned)) { setError("Binary input may only contain 0 and 1 digits."); return; }
      setError(null);
      setResult(binaryToText(value));
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setValue(DEFAULTS.value);
    setError(null);
    setResult(textToBinary(DEFAULTS.value));
  };

  useEffect(() => { setResult(textToBinary(DEFAULTS.value)); }, []);

  const faqs = [
    { question: "How does text become binary?", answer: "Every character is stored as a numeric code. UTF-8 assigns each character a byte sequence, and each byte is written as its 8-bit binary equivalent. 'A' is 65, which in binary is 01000001." },
    { question: "Why 8 bits per character?", answer: "A byte is 8 bits and can represent 256 values (0–255), which is enough for all ASCII characters. UTF-8 uses multiple bytes (2–4) for symbols, accented letters, and emoji, which is why those characters use more bits." },
    { question: "How do I convert binary back to text?", answer: "Group the binary digits into 8-bit bytes, convert each group to its decimal value, then map those values to characters using the UTF-8 table. This calculator does all three steps for you." },
    { question: "What is UTF-8?", answer: "UTF-8 is the dominant character encoding on the web. It represents every Unicode character while remaining backward-compatible with ASCII. One to four bytes encode each character depending on its code point." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Utilities", href: "/calculator#utilities" }, { label: "Binary Text Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Binary Text Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1 bg-background">
              {([["text-to-bin", "Text → Binary"], ["bin-to-text", "Binary → Text"]] as const).map(([m, label]) => (
                <button key={m} onClick={() => setMode(m)} className={`h-9 rounded-md text-sm font-semibold transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>{label}</button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{mode === "text-to-bin" ? "Text to Encode" : "Binary to Decode"}</label>
              <div className="flex items-center rounded-md border border-input bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <textarea value={value} onChange={e => setValue(e.target.value)} className="w-full px-3 py-2.5 text-base bg-transparent outline-none border-none text-foreground resize-y min-h-[110px] font-mono text-sm" placeholder={mode === "text-to-bin" ? "Enter plain text…" : "Enter binary (8 bits per char)…"} />
              </div>
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
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                <div className="text-sm text-foreground">{error}</div>
              </div>
            )}
            {!error && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{mode === "text-to-bin" ? "Binary Output" : "Decoded Text"}</div>
                  <div className="text-xl md:text-2xl font-bold text-primary break-all font-mono leading-snug">{result.output.length > 180 ? `${result.output.slice(0, 180)}…` : result.output}</div>
                  <div className="text-sm text-muted-foreground mt-1">{mode === "text-to-bin" ? `${result.bytes} bytes · ${result.bits} bits` : `${result.chars} characters`}</div>
                </div>
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Characters", `${result.chars}`], ["Bytes", `${result.bytes}`], ["Bits", `${result.bits}`]].map(([l, v], i) => (
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
                  <h3 className="text-base font-bold mb-4">Size Breakdown</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString(), "Count"]} />
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
            <h2 className="text-2xl font-bold mb-3">How Text Becomes Binary</h2>
            <p>A <strong>binary text converter</strong> translates between human-readable characters and the 1s and 0s a computer actually stores. Each character is mapped to a numeric code — the letter 'A' is 65 in the ASCII table — and that number is written as an 8-bit binary string: 01000001. Text is simply a long sequence of these 8-bit bytes.</p>
            <h2 className="text-2xl font-bold mb-3">UTF-8 and Multi-Byte Characters</h2>
            <p>Modern text uses UTF-8 encoding. ASCII characters (A–Z, digits, punctuation) map to a single byte, while accented letters and symbols use two bytes, and emoji can use three or four. That is why 'Hello' is 5 bytes but a string with emoji takes more space. This converter uses the browser's native UTF-8 encoder, so it handles every Unicode character correctly.</p>
            <h2 className="text-2xl font-bold mb-3">Why Convert Text to Binary?</h2>
            <p>Seeing text as binary helps you understand how computers store data, debug encoding issues, and recognize binary data in files and network traffic. It is also a great way to teach the connection between the abstract numbers in code and the physical on/off states of a processor.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/binary-text-converter" />
          <PopularCalculators exclude="/calculator/binary-text-converter" />
        </div>
      </div>
    </>
  );
}
