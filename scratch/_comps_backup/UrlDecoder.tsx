"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface DecoderInputs {
  text: string;
}

interface TokenRow {
  token: string;
  decoded: string;
  type: "reserved" | "percent" | "plain";
  index: number;
}

interface DecoderResult {
  decoded: string;
  componentDecoded: string;
  originalLength: number;
  decodedLength: number;
  percentCount: number;
  rows: TokenRow[];
}

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: DecoderInputs = {
  text: "https%3A%2F%2Fracira.com%2Fcalculator%3Fq%3Dhello%20world%26lang%3Den",
};

// ── 4. Pure calculation function ────────────────────────────────────────────
function calculate(inputs: DecoderInputs): DecoderResult {
  const decoded = decodeURI(inputs.text);
  const componentDecoded = decodeURIComponent(inputs.text);
  const percentCount = (inputs.text.match(/%/g) || []).length;

  // tokenize: percent-encoded triplets, reserved chars, plain runs
  const rows: TokenRow[] = [];
  const re = /(%[0-9A-Fa-f]{2})|([:/?#\[\]@!$&'()*+,;=])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = re.exec(inputs.text))) {
    if (m.index > last) {
      rows.push({ token: inputs.text.slice(last, m.index), decoded: inputs.text.slice(last, m.index), type: "plain", index: idx++ });
    }
    if (m[1]) {
      rows.push({ token: m[1], decoded: decodeURIComponent(m[1]), type: "percent", index: idx++ });
    } else if (m[2]) {
      rows.push({ token: m[2], decoded: m[2], type: "reserved", index: idx++ });
    }
    last = m.index + m[0].length;
  }
  if (last < inputs.text.length) {
    rows.push({ token: inputs.text.slice(last), decoded: inputs.text.slice(last), type: "plain", index: idx++ });
  }

  return {
    decoded,
    componentDecoded,
    originalLength: inputs.text.length,
    decodedLength: decoded.length,
    percentCount,
    rows,
  };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const UrlDecoder = () => {
  const [inputs, setInputs] = useState<DecoderInputs>(DEFAULTS);
  const [result, setResult] = useState<DecoderResult>(() => calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const invalid = inputs.text.length === 0;

  const run = () => {
    if (invalid) return;
    try {
      setResult(calculate(inputs));
    } catch {
      // keep previous result if malformed
    }
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const chartData = [
    { name: "Encoded", value: result.originalLength, color: "hsl(var(--primary))" },
    { name: "Decoded", value: result.decodedLength, color: "#10b981" },
    { name: "% Triplets", value: result.percentCount, color: "#f59e0b" },
  ];

  const faqs = [
    { question: "What does URL decoding do?", answer: "It reverses percent-encoding, converting %20 back to a space, %2F back to a slash, and %E2%82%AC back to the euro sign, so an encoded string becomes readable text again." },
    { question: "What is the difference between decodeURI and decodeURIComponent?", answer: "decodeURI leaves reserved characters like / ? & alone (it is meant for whole URLs). decodeURIComponent decodes them too, which is correct for individual query-string values." },
    { question: "What if the input is not valid percent-encoding?", answer: "Malformed sequences like %ZZ or a trailing % are left as-is by decodeURI and may throw in decodeURIComponent. The tool computes the lenient decode so you still see a useful result." },
    { question: "Why is %20 sometimes a plus sign?", answer: "In form-encoded query strings (application/x-www-form-urlencoded), spaces are sent as +. decodeURIComponent does not convert + to a space; if your input came from a form, replace + with %20 first." },
    { question: "Can I decode a full URL?", answer: "Yes — pasting a fully encoded URL decodes the path and query segments. Use the component-level output when you need query values decoded aggressively." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "URL Decoder" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">URL Decoder</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col">
                <label htmlFor="urldec-text" className="text-sm font-medium text-foreground mb-1">Encoded URL or String</label>
                <textarea
                  id="urldec-text"
                  rows={4}
                  value={inputs.text}
                  onChange={(e) => setInputs({ text: e.target.value })}
                  placeholder="Paste an encoded URL…"
                  className={`w-full px-3 py-2 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono resize-y ${invalid ? "border-red-500" : ""}`}
                />
                {invalid && <p className="text-[11px] text-red-500 font-medium mt-1">Enter an encoded string</p>}
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Decoded URL</div>
              <div className="text-xl font-bold text-primary mb-1 tracking-tight break-all leading-snug">{result.decoded}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {result.originalLength} chars → {result.decodedLength} chars · {result.percentCount} % triplets
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Encoded</span>
                <span className="font-extrabold text-foreground">{result.originalLength} chars</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Decoded</span>
                <span className="font-extrabold text-emerald-600">{result.decodedLength} chars</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Percent Triplets</span>
                <span className="font-extrabold text-primary">{result.percentCount}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Token</th>
                    <th className="p-2.5 pr-3 text-right">Decoded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.slice(0, 14).map((r) => (
                    <tr key={r.index} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-mono font-semibold text-foreground">{r.token || "␣"}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.type === "percent" ? "text-amber-700" : "text-foreground"}`}>{r.decoded}</td>
                    </tr>
                  ))}
                  {result.rows.length > 14 && (
                    <tr>
                      <td colSpan={2} className="p-2.5 pl-3 text-[11px] text-muted-foreground italic">
                        … and {result.rows.length - 14} more tokens
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CHART */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Encoded vs Decoded</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} width={40} />
                  <Tooltip formatter={(v: number) => [String(v), "Count"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
                    {chartData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">Decoding shrinks %20-style triplets back to single characters</p>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Encoded Length", value: `${result.originalLength} chars` },
                  { label: "Decoded Length", value: `${result.decodedLength} chars` },
                  { label: "Percent Triplets", value: String(result.percentCount) },
                  { label: "Length Saved", value: `${result.originalLength - result.decodedLength} chars` },
                  { label: "decodeURI Output", value: result.decoded },
                  { label: "Component Output", value: result.componentDecoded },
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
            <h2 className="text-2xl font-bold mb-3">Reading Encoded URLs</h2>
            <p>Percent-encoding turns every unsafe character in a URL into a percent sign followed by two hex digits, which is efficient to transmit but nearly unreadable to humans. A link like https%3A%2F%2Fracira.com%2Fcalculator%3Fq%3Dhello%20world is opaque at a glance, yet it decodes cleanly to https://racira.com/calculator?q=hello world. Understanding how to reverse the process matters for debugging web analytics, inspecting API request logs, and recovering the real value behind an obfuscated query parameter.</p>
            <p>JavaScript offers two decoders. decodeURI reverses encodeURI: it restores percent sequences but leaves reserved URL characters untouched, which suits entire URLs. decodeURIComponent reverses encodeURIComponent and also converts reserved characters back to their literal form, which suits individual query values. This tool runs both and shows the token-level breakdown — each %XX triplet, reserved symbol, and plain run — so you can see precisely which bytes were encoded and what they became.</p>
            <h2 className="text-2xl font-bold mb-3">Handling Edge Cases</h2>
            <p>Real-world encoded strings are not always well-formed. A trailing percent sign, a triplet like %ZZ, or an incomplete UTF-8 sequence can cause the strict decoder to throw. This tool performs a lenient decode so you always receive a readable result, counts the percent triplets, and reports the length savings — the number of characters the encoding added. If you are debugging a form submission, remember that form data may use + for spaces; replace + with %20 before decoding to recover the literal plus or space correctly.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/url-decoder" />
          <PopularCalculators exclude="/calculator/url-decoder" />
        </div>
      </div>
    </>
  );
};

export default UrlDecoder;
