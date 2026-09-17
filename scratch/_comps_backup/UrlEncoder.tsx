"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface EncoderInputs {
  text: string;
}

interface CharRow {
  char: string;
  encoded: string;
  keep: boolean;
  index: number;
}

interface EncoderResult {
  component: string;
  uri: string;
  originalLength: number;
  componentLength: number;
  uriLength: number;
  rows: CharRow[];
}

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: EncoderInputs = {
  text: "https://racira.com/calculator?q=hello world&lang=en",
};

// ── 4. Pure calculation function ────────────────────────────────────────────
const UNRESERVED = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~".split(""));

function calculate(inputs: EncoderInputs): EncoderResult {
  const component = encodeURIComponent(inputs.text);
  const uri = encodeURI(inputs.text);
  const rows: CharRow[] = [...inputs.text].map((ch, i) => ({
    char: ch,
    encoded: encodeURIComponent(ch),
    keep: UNRESERVED.has(ch),
    index: i,
  }));
  return {
    component,
    uri,
    originalLength: inputs.text.length,
    componentLength: component.length,
    uriLength: uri.length,
    rows,
  };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const UrlEncoder = () => {
  const [inputs, setInputs] = useState<EncoderInputs>(DEFAULTS);
  const [result, setResult] = useState<EncoderResult>(() => calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const invalid = inputs.text.length === 0;

  const run = () => {
    if (invalid) return;
    setResult(calculate(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const chartData = [
    { name: "Original", value: result.originalLength, color: "hsl(var(--primary))" },
    { name: "encodeURIComponent", value: result.componentLength, color: "#10b981" },
    { name: "encodeURI", value: result.uriLength, color: "#f59e0b" },
  ];

  const faqs = [
    { question: "What is URL encoding?", answer: "URLs may only contain a safe character set. Anything else — spaces, non-ASCII letters, reserved symbols — is replaced with a percent sign followed by the character's two hex digits. A space becomes %20." },
    { question: "What is the difference between encodeURI and encodeURIComponent?", answer: "encodeURI preserves reserved URL characters like / ? & # so the whole URL stays readable. encodeURIComponent encodes everything except unreserved characters, so it is the correct choice for query-string values." },
    { question: "Why does a space encode as %20 and not +?", answer: "In the path of a URL, a space is %20. In HTML form data (application/x-www-form-urlencoded), a space historically becomes +. Both decode back to a space." },
    { question: "Is %20 case-sensitive?", answer: "No. %20 and %2f decode identically, and most browsers normalize hex digits to uppercase. This encoder outputs uppercase hex for consistency." },
    { question: "What characters are always safe?", answer: "The unreserved set: A–Z, a–z, 0–9, hyphen, underscore, period, and tilde. These never need encoding in any part of a URL." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "URL Encoder" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">URL Encoder</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col">
                <label htmlFor="urlenc-text" className="text-sm font-medium text-foreground mb-1">Text to Encode</label>
                <textarea
                  id="urlenc-text"
                  rows={4}
                  value={inputs.text}
                  onChange={(e) => setInputs({ text: e.target.value })}
                  placeholder="Paste a URL or string…"
                  className={`w-full px-3 py-2 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono resize-y ${invalid ? "border-red-500" : ""}`}
                />
                {invalid && <p className="text-[11px] text-red-500 font-medium mt-1">Enter text to encode</p>}
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">encodeURIComponent Output</div>
              <div className="text-xl font-bold text-primary mb-1 tracking-tight break-all leading-snug">{result.component}</div>
              <div className="text-sm text-muted-foreground font-medium">
                {result.originalLength} chars → {result.componentLength} chars
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Original</span>
                <span className="font-extrabold text-foreground">{result.originalLength} chars</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Component</span>
                <span className="font-extrabold text-emerald-600">{result.componentLength} chars</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">encodeURI</span>
                <span className="font-extrabold text-primary">{result.uriLength} chars</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Char</th>
                    <th className="p-2.5 text-right">Encoded</th>
                    <th className="p-2.5 pr-3 text-right">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.slice(0, 14).map((r) => (
                    <tr key={r.index} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{r.char === " " ? "␣" : r.char}</td>
                      <td className="p-2.5 text-right font-mono text-foreground">{r.encoded}</td>
                      <td className={`p-2.5 pr-3 text-right text-[11px] font-bold uppercase tracking-wider ${r.keep ? "text-emerald-600" : "text-amber-600"}`}>
                        {r.keep ? "unreserved" : "encoded"}
                      </td>
                    </tr>
                  ))}
                  {result.rows.length > 14 && (
                    <tr>
                      <td colSpan={3} className="p-2.5 pl-3 text-[11px] text-muted-foreground italic">
                        … and {result.rows.length - 14} more characters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CHART */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Length Comparison (characters)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} width={40} />
                  <Tooltip formatter={(v: number) => [`${v} chars`, "Length"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
                    {chartData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">encodeURIComponent encodes more aggressively than encodeURI</p>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Original Length", value: `${result.originalLength} chars` },
                  { label: "Component Length", value: `${result.componentLength} chars` },
                  { label: "encodeURI Length", value: `${result.uriLength} chars` },
                  { label: "Unreserved Chars", value: `${result.rows.filter((r) => r.keep).length}` },
                  { label: "Encoded Chars", value: `${result.rows.filter((r) => !r.keep).length}` },
                  { label: "encodeURI Output", value: result.uri },
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
            <h2 className="text-2xl font-bold mb-3">Why URLs Must Be Encoded</h2>
            <p>A URL is transmitted as a sequence of bytes, but only a narrow subset of ASCII characters is safe to send literally. Letters, digits, and the unreserved symbols hyphen, underscore, period, and tilde pass through untouched. Every other character — spaces, quotation marks, angle brackets, non-ASCII letters, and the reserved delimiters when they appear inside values — must be percent-encoded: replaced by a percent sign and the character's two-digit hexadecimal code. A space becomes %20, an ampersand inside a query value becomes %26, and the euro sign becomes %E2%82%AC in its three-byte UTF-8 form.</p>
            <p>JavaScript exposes two encoders with different scopes. encodeURI preserves the reserved characters that structure a URL — / : ? # & = — making it suitable for encoding an entire existing URL. encodeURIComponent encodes those characters too, which is why it must be used for every value you place into a query string: a value containing & or = would otherwise be parsed as separate parameters. Failing to encode user input is the classic source of broken links and a common gateway for parameter injection in web applications.</p>
            <h2 className="text-2xl font-bold mb-3">Using the Encoder</h2>
            <p>Type or paste any string — a full URL, a query value, or plain text with spaces and symbols — and the tool returns both the component-level and full-URI encodings side by side, along with a per-character breakdown that shows exactly which characters were transformed and how. The length comparison chart makes the difference between the two encoders visible at a glance, so you can confirm which one your code should call before you build the link.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/url-encoder" />
          <PopularCalculators exclude="/calculator/url-encoder" />
        </div>
      </div>
    </>
  );
};

export default UrlEncoder;
