"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface BinaryInputs {
  mode: "toBinary" | "toText";
  text: string;
}

interface CharRow {
  char: string;
  code: number;
  binary: string;
  hex: string;
  index: number;
}

interface BinaryResult {
  binary: string;
  hex: string;
  decimals: string;
  charCount: number;
  byteCount: number;
  decodedText: string;
  rows: CharRow[];
  mode: "toBinary" | "toText";
}

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: BinaryInputs = {
  mode: "toBinary",
  text: "Hello Racira",
};

// ── 4. Pure calculation functions ───────────────────────────────────────────
function toBinary(text: string): BinaryResult {
  const rows: CharRow[] = [...text].map((ch, i) => {
    const code = ch.codePointAt(0) ?? 0;
    const bin = code.toString(2).padStart(8, "0");
    return {
      char: ch,
      code,
      binary: bin,
      hex: code.toString(16).toUpperCase().padStart(2, "0"),
      index: i,
    };
  });
  const binary = rows.map((r) => r.binary).join(" ");
  const hex = rows.map((r) => r.hex).join(" ");
  const decimals = rows.map((r) => String(r.code)).join(" ");
  return {
    binary,
    hex,
    decimals,
    charCount: rows.length,
    byteCount: rows.reduce((s, r) => s + (r.code > 255 ? 2 : 1), 0),
    decodedText: text,
    rows,
    mode: "toBinary",
  };
}

function fromBinary(input: string): BinaryResult {
  const clean = input.replace(/[^01]/g, "");
  // pad to a multiple of 8
  const padded = clean.length % 8 === 0 ? clean : clean.padStart(clean.length + (8 - (clean.length % 8)), "0");
  const bytes: number[] = [];
  for (let i = 0; i < padded.length; i += 8) {
    bytes.push(parseInt(padded.slice(i, i + 8), 2));
  }
  let decoded = "";
  const rows: CharRow[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const code = bytes[i];
    const ch = code >= 32 && code <= 126 ? String.fromCharCode(code) : "·";
    decoded += ch;
    rows.push({ char: ch, code, binary: padded.slice(i * 8, i * 8 + 8), hex: code.toString(16).toUpperCase().padStart(2, "0"), index: i });
  }
  const hex = bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
  return {
    binary: padded.match(/.{1,8}/g)?.join(" ") ?? padded,
    hex,
    decimals: bytes.join(" "),
    charCount: bytes.length,
    byteCount: bytes.length,
    decodedText: decoded,
    rows,
    mode: "toText",
  };
}

function calculate(inputs: BinaryInputs): BinaryResult {
  return inputs.mode === "toBinary" ? toBinary(inputs.text) : fromBinary(inputs.text);
}

// ── 5. Component ────────────────────────────────────────────────────────────
const TextBinaryConverter = () => {
  const [inputs, setInputs] = useState<BinaryInputs>(DEFAULTS);
  const [result, setResult] = useState<BinaryResult>(() => calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (patch: Partial<BinaryInputs>) => setInputs((p) => ({ ...p, ...patch }));

  const invalid = inputs.text.trim() === "";

  const run = () => {
    if (invalid) return;
    setResult(calculate(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const chartData = result.rows.slice(0, 20).map((r) => ({
    name: r.char === " " ? "␣" : r.char,
    code: r.code,
  }));

  const primaryLabel = inputs.mode === "toBinary" ? "Binary Encoding" : "Decoded Text";
  const primaryValue = inputs.mode === "toBinary" ? result.binary : result.decodedText;

  const faqs = [
    { question: "How does text become binary?", answer: "Each character has a numeric code — ASCII/Unicode — and the computer stores that number as a fixed-width binary value. 'A' is 65, which is 01000001 in 8-bit binary." },
    { question: "What does UTF-8 vs ASCII mean here?", answer: "ASCII covers codes 0–127 using one byte per character. Characters above 127 (like é or emoji) use two or more bytes in UTF-8. This converter reports the byte count so you can see the difference." },
    { question: "Why is 01001000 the letter H?", answer: "The Unicode code point of 'H' is 72, and 72 in binary is 01001000. Each bit position is a power of two: 64 + 8 = 72." },
    { question: "Can I paste binary back into text?", answer: "Yes — switch to Binary → Text mode and paste groups of 8 bits. Any spaces or punctuation between bits are ignored, and incomplete groups are padded with leading zeros." },
    { question: "What is hexadecimal used for?", answer: "Hex is a compact way to write bytes — each byte is exactly two hex digits (0–FF). Programmers use it to inspect memory, color values, and binary file formats without writing long binary strings." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Text Binary Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Text Binary Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col">
                <label htmlFor="bin-mode" className="text-sm font-medium text-foreground mb-1">Conversion Direction</label>
                <div className="flex rounded-md border border-input overflow-hidden h-10 w-full">
                  <button
                    type="button"
                    onClick={() => set({ mode: "toBinary" })}
                    className={`flex-1 text-sm font-semibold transition-colors ${inputs.mode === "toBinary" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                  >
                    Text → Binary
                  </button>
                  <button
                    type="button"
                    onClick={() => set({ mode: "toText" })}
                    className={`flex-1 text-sm font-semibold transition-colors border-l border-input ${inputs.mode === "toText" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                  >
                    Binary → Text
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col">
                <label htmlFor="bin-text" className="text-sm font-medium text-foreground mb-1">
                  {inputs.mode === "toBinary" ? "Text" : "Binary (groups of 8 bits)"}
                </label>
                <textarea
                  id="bin-text"
                  rows={4}
                  value={inputs.text}
                  onChange={(e) => set({ text: e.target.value })}
                  placeholder={inputs.mode === "toBinary" ? "Type or paste text…" : "e.g. 01001000 01100101 01101100 01101100 01101111"}
                  className={`w-full px-3 py-2 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono resize-y ${invalid ? "border-red-500" : ""}`}
                />
                {invalid && <p className="text-[11px] text-red-500 font-medium mt-1">Enter some text or binary to convert</p>}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={run}
                disabled={invalid}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-4 print-section">
            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{primaryLabel}</div>
              <div className="text-2xl font-bold text-primary mb-1 tracking-tight break-all leading-snug">
                {primaryValue}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {result.charCount} characters · {result.byteCount} bytes
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Characters</span>
                <span className="font-extrabold text-foreground">{result.charCount}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bytes</span>
                <span className="font-extrabold text-emerald-600">{result.byteCount}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hex Length</span>
                <span className="font-extrabold text-primary">{result.hex.replace(/ /g, "").length} digits</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Char</th>
                    <th className="p-2.5 text-right">Decimal</th>
                    <th className="p-2.5 text-right">Hex</th>
                    <th className="p-2.5 pr-3 text-right">Binary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.slice(0, 12).map((r) => (
                    <tr key={r.index} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{r.char === " " ? "␣" : r.char}</td>
                      <td className="p-2.5 text-right text-muted-foreground">{r.code}</td>
                      <td className="p-2.5 text-right text-muted-foreground">0x{r.hex}</td>
                      <td className="p-2.5 pr-3 text-right font-mono text-foreground">{r.binary}</td>
                    </tr>
                  ))}
                  {result.rows.length > 12 && (
                    <tr>
                      <td colSpan={4} className="p-2.5 pl-3 text-[11px] text-muted-foreground italic">
                        … and {result.rows.length - 12} more characters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CHART */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Byte Value by Character (first 20)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis domain={[0, 255]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} width={34} />
                  <Tooltip formatter={(v: number) => [String(v), "Byte value"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="code" radius={[4, 4, 0, 0]} maxBarSize={20} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">Each bar is the numeric code of one character (0–255)</p>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Characters", value: String(result.charCount) },
                  { label: "Bytes", value: String(result.byteCount) },
                  { label: "Binary", value: `${result.binary.replace(/ /g, "").length} bits` },
                  { label: "Hexadecimal", value: result.hex },
                  { label: "Decimal Codes", value: result.decimals },
                  { label: "ASCII Range", value: `${result.rows.filter((r) => r.code < 128).length} of ${result.rows.length} chars` },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{item.label}</span>
                    <span className="text-sm font-extrabold text-foreground break-all">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Computers Store Text</h2>
            <p>At the hardware level, computers know only two states — on and off — represented as binary digits, or bits. To store text, every character is assigned a number, and that number is written in binary. The American Standard Code for Information Interchange (ASCII) assigns the numbers 0 through 127 to the letters, digits, and punctuation of English: the capital letter A is 65, which in eight-bit binary is 01000001. A string like "Hello" is therefore stored as five consecutive bytes: 72, 101, 108, 108, 111 — or in binary, 01001000 01100101 01101100 01101100 01101111.</p>
            <p>Modern systems use Unicode and the UTF-8 encoding, which preserves ASCII as a compatible subset and extends it to cover every writing system on earth. Characters beyond 127 — accented letters, Greek, Cyrillic, and emoji — occupy two, three, or even four bytes, which is why a text's byte count can exceed its character count. This converter shows both the character count and the byte count so the difference becomes visible, and it renders each character's decimal, hexadecimal, and eight-bit binary representation side by side.</p>
            <h2 className="text-2xl font-bold mb-3">Reading and Writing Binary</h2>
            <p>Hexadecimal is the practical shorthand programmers use for binary data, because each byte maps to exactly two hex digits: 01000001 is 0x41, and 01101100 is 0x6C. Reading a byte in hex takes half the effort of reading eight bits. This tool works in both directions: type text to see its binary and hex encodings, or paste binary groups to decode them back into readable characters. Spaces between bit groups are ignored and incomplete final groups are padded with leading zeros, so messy pastes still decode cleanly.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/text-binary-converter" />
          <PopularCalculators exclude="/calculator/text-binary-converter" />
        </div>
      </div>
    </>
  );
};

export default TextBinaryConverter;
