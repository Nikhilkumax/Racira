"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const TO_MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-",
  "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.", "$": "...-..-", "@": ".--.-.",
};

const FROM_MORSE: Record<string, string> = Object.fromEntries(Object.entries(TO_MORSE).map(([k, v]) => [v, k]));

function textToMorse(text: string): string {
  const words = text.toUpperCase().trim().split(/\s+/);
  return words
    .map((word) =>
      word
        .split("")
        .map((ch) => TO_MORSE[ch] ?? "")
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean)
    .join(" / ");
}

function morseToText(morse: string): string {
  const words = morse.trim().split(/\s*\/\s*/);
  return words
    .map((word) =>
      word
        .split(/\s+/)
        .map((code) => FROM_MORSE[code] ?? "")
        .join("")
    )
    .join(" ");
}

interface MorseResult {
  output: string;
  chars: number;
  codes: number;
  timing: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function buildResult(input: string, output: string, dir: string): MorseResult {
  const charCount = dir === "text" ? input.replace(/\s/g, "").length : output.replace(/\s/g, "").length;
  const codes = dir === "text" ? (output.match(/[.-]+/g) || []).length : (input.match(/[.-]+/g) || []).length;
  const timing = [
    { label: "Dit (dot) length", value: "1 unit" },
    { label: "Dah (dash) length", value: "3 units" },
    { label: "Gap within a letter", value: "1 unit" },
    { label: "Gap between letters", value: "3 units" },
    { label: "Gap between words", value: "7 units" },
  ];
  const freq: Record<string, number> = {};
  const src = dir === "text" ? input.toUpperCase().replace(/[^A-Z0-9]/g, "") : output.toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (const ch of src) freq[ch] = (freq[ch] || 0) + 1;
  const chartData = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], i) => ({ name, value, fill: ["hsl(var(--primary))", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"][i % 8] }));
  return { output, chars: charCount, codes, timing, chartData };
}

const DEFAULTS = { text: "HELLO WORLD", morse: ".... . .-.. .-.. --- / .-- --- .-. .-.. -.." };

export default function MorseCodeTranslator() {
  const [dir, setDir] = useState<string>("text");
  const [text, setText] = useState(DEFAULTS.text);
  const [morse, setMorse] = useState(DEFAULTS.morse);
  const [result, setResult] = useState<MorseResult | null>(null);

  const convert = (d: string) => {
    if (d === "text") setResult(buildResult(text, textToMorse(text), "text"));
    else setResult(buildResult(morse, morseToText(morse), "morse"));
  };
  const calculate = () => convert(dir);
  const reset = () => {
    setDir("text"); setText(DEFAULTS.text); setMorse(DEFAULTS.morse);
    setResult(buildResult(DEFAULTS.text, textToMorse(DEFAULTS.text), "text"));
  };
  useEffect(() => { setResult(buildResult(DEFAULTS.text, textToMorse(DEFAULTS.text), "text")); }, []);

  const ta = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[88px] font-mono";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How do I read Morse code?", answer: "Dots and dashes stand for letters; a space separates letters within a word and a slash separates words. Timing units: a dot is 1, a dash 3, gaps of 1 within a letter, 3 between letters, and 7 between words." },
    { question: "What do the timings mean?", answer: "Morse is a timing-based code — the classic rule is that the length of a dot defines everything else: dash = 3 dots, intra-letter gap = 1, letter gap = 3, word gap = 7. Operators send at a consistent rate so these ratios hold." },
    { question: "What can be translated?", answer: "Letters A–Z, digits 0–9, and common punctuation including periods, commas, question marks, and slashes. Unsupported symbols are skipped in text-to-Morse; unknown codes decode as blanks in Morse-to-text." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Morse Code Translator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Morse Code Translator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Direction</label>
              <select value={dir} onChange={e => setDir(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="text">Text → Morse code</option>
                <option value="morse">Morse code → Text</option>
              </select>
            </div>
            <div>
              <label className={lbl}>{dir === "text" ? "Plain Text" : "Morse Code (use / between words)"}</label>
              <textarea value={dir === "text" ? text : morse} onChange={e => (dir === "text" ? setText(e.target.value) : setMorse(e.target.value))} className={ta} placeholder={dir === "text" ? "HELLO WORLD" : ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."} />
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
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{dir === "text" ? "Morse Code" : "Decoded Text"}</div>
                <div className="text-2xl font-extrabold tracking-tight font-mono break-words leading-relaxed">{result.output || "—"}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.chars} characters · {result.codes} code symbols</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`${dir === "text" ? "Input" : "Output"} Length`, `${result.chars}`], ["Code Symbols", `${result.codes}`], ["Words", `${result.output.split(/ \/ |\s+/).filter(Boolean).length}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Timing Units</h3>
                <table className="w-full text-base"><tbody>
                  {result.timing.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 0 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 0 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 0 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData.length > 0 && (
                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Character Frequency</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip formatter={(v: number) => [v, "occurrences"]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-center text-sm text-muted-foreground mt-1">Most frequent characters in your input</p>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Direction:</span><span className="font-semibold">{dir === "text" ? "Text → Morse" : "Morse → Text"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Characters:</span><span className="font-semibold">{result.chars}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Code Symbols:</span><span className="font-semibold">{result.codes}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Words:</span><span className="font-semibold">{result.output.split(/ \/ |\s+/).filter(Boolean).length}</span></div>
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Two Centuries of Dots and Dashes</h2>
            <p>Morse code encodes every letter and digit as a pattern of short and long signals — dits and dahs. This <strong>morse code translator</strong> converts in both directions: type text and get dots and dashes, or paste dots and dashes and decode the message.</p>
            <h2 className="text-2xl font-bold mb-3">The Rhythm Rules</h2>
            <p>The timing ratios are the language's grammar: a dash lasts three dots, a single gap separates dits within a letter, three gaps separate letters, and seven separate words. Slashes in the text form mark word boundaries.</p>
            <h2 className="text-2xl font-bold mb-3">Still in Use</h2>
            <p>Beyond hobby radio, Morse survives where electronics are minimal — aviation beacons, emergency signaling, and accessibility devices. Learning a few letters is easy: E is a single dot, T a single dash, S is three dots, O three dashes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/morse-code-translator" />
          <PopularCalculators exclude="/calculator/morse-code-translator" />
        </div>
      </div>
    </>
  );
}
