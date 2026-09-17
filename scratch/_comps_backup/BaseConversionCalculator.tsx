"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type BaseName = "2" | "8" | "10" | "16";

interface BaseInputs {
  value: string;
  fromBase: BaseName;
  bitWidth: string;
  showSigned: boolean;
  groupBits: boolean;
}

interface BaseResult {
  valid: boolean;
  decimal: number;
  binary: string;
  octal: string;
  hex: string;
  binaryDigits: number;
  isNegative: boolean;
  primaryLabel: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { base: string; value: number; fill: string }[];
}

const BASE_RADIX: Record<BaseName, number> = { "2": 2, "8": 8, "10": 10, "16": 16 };
const BASE_LABEL: Record<BaseName, string> = { "2": "Binary", "8": "Octal", "10": "Decimal", "16": "Hexadecimal" };
const VALID_CHARS: Record<BaseName, RegExp> = {
  "2": /^[01]+$/,
  "8": /^[0-7]+$/,
  "10": /^[0-9]+$/,
  "16": /^[0-9a-f]+$/,
};

function groupBinary(bin: string, group: boolean): string {
  if (!group) return bin;
  const padded = bin.length % 4 === 0 ? bin : bin.padStart(Math.ceil(bin.length / 4) * 4, "0");
  return padded.replace(/(.{4})/g, "$1 ").trim();
}

function calcBase(inputs: BaseInputs): BaseResult {
  const empty: BaseResult = {
    valid: false,
    decimal: 0,
    binary: "0",
    octal: "0",
    hex: "0",
    binaryDigits: 1,
    isNegative: false,
    primaryLabel: "0",
    breakdown: [{ label: "Status", value: "Enter a valid value" }],
    summaryStats: [
      { label: "Decimal", value: "0" },
      { label: "Binary", value: "0" },
      { label: "Octal", value: "0" },
      { label: "Hex", value: "0" },
    ],
    chartData: [
      { base: "Binary", value: 0, fill: "#3b82f6" },
      { base: "Octal", value: 0, fill: "#10b981" },
      { base: "Decimal", value: 0, fill: "#f59e0b" },
      { base: "Hex", value: 0, fill: "#8b5cf6" },
    ],
  };

  const fromBase: BaseName = inputs.fromBase || "10";
  const radix = BASE_RADIX[fromBase];
  const raw = (inputs.value || "").trim();

  if (raw === "") return empty;

  const isNegative = raw.startsWith("-");
  const body = (isNegative ? raw.slice(1) : raw).toLowerCase();

  if (body === "" || !VALID_CHARS[fromBase].test(body)) return empty;

  const parsed = parseInt(body, radix);
  if (!Number.isFinite(parsed)) return empty;

  const decimalMagnitude = parsed;
  const decimal = isNegative ? -decimalMagnitude : decimalMagnitude;

  const rawBits = parseInt(inputs.bitWidth);
  const bitWidth = Number.isFinite(rawBits) ? Math.max(1, Math.min(64, rawBits)) : 8;

  // Unsigned magnitude representations (based on absolute value).
  const mag = Math.abs(decimal);
  let binMag = mag.toString(2);
  const octMag = mag.toString(8);
  const hexMag = mag.toString(16).toUpperCase();

  let binaryDisplay: string;
  let binaryDigits: number;

  if (inputs.showSigned && isNegative) {
    // Two's complement within bit width.
    const modulo = Math.pow(2, bitWidth);
    let tc = ((decimal % modulo) + modulo) % modulo;
    let tcBin = tc.toString(2).padStart(bitWidth, "0");
    binaryDisplay = groupBinary(tcBin, inputs.groupBits);
    binaryDigits = tcBin.length;
    binMag = tcBin;
  } else {
    const padded = binMag.padStart(Math.max(binMag.length, bitWidth), "0");
    binaryDisplay = groupBinary(padded, inputs.groupBits);
    binaryDigits = padded.length;
    binMag = padded;
  }

  const octDisplay = (isNegative && !inputs.showSigned ? "-" : "") + octMag;
  const hexDisplay = (isNegative && !inputs.showSigned ? "-" : "") + hexMag;
  const decDisplay = decimal.toString();

  const primaryLabel =
    fromBase === "2" ? decDisplay :
    fromBase === "10" ? "0x" + hexMag :
    decDisplay;

  const breakdown = [
    { label: "Input", value: `${raw} (base ${fromBase} · ${BASE_LABEL[fromBase]})` },
    { label: "Decimal (base 10)", value: decDisplay },
    { label: "Binary (base 2)", value: binaryDisplay },
    { label: "Octal (base 8)", value: octDisplay },
    { label: "Hexadecimal (base 16)", value: "0x" + hexMag + (isNegative && !inputs.showSigned ? " (neg)" : "") },
    { label: "Bit Width", value: `${bitWidth} bits` },
  ];

  const summaryStats = [
    { label: "Decimal", value: decDisplay },
    { label: "Binary", value: binaryDisplay },
    { label: "Octal", value: octDisplay },
    { label: "Hex", value: "0x" + hexMag },
    { label: "Bits Used", value: `${binaryDigits}` },
    { label: "Signed", value: inputs.showSigned ? "Two's complement" : "Unsigned" },
  ];

  const chartData = [
    { base: "Binary", value: binMag.replace(/\s/g, "").length, fill: "#3b82f6" },
    { base: "Octal", value: octMag.length, fill: "#10b981" },
    { base: "Decimal", value: decDisplay.replace("-", "").length, fill: "#f59e0b" },
    { base: "Hex", value: hexMag.length, fill: "#8b5cf6" },
  ];

  return {
    valid: true,
    decimal,
    binary: binaryDisplay,
    octal: octDisplay,
    hex: "0x" + hexMag,
    binaryDigits,
    isNegative,
    primaryLabel,
    breakdown,
    summaryStats,
    chartData,
  };
}

const DEFAULTS: BaseInputs = {
  value: "255",
  fromBase: "10",
  bitWidth: "8",
  showSigned: false,
  groupBits: true,
};

export default function BaseConversionCalculator() {
  const [inputs, setInputs] = useState<BaseInputs>(DEFAULTS);
  const [result, setResult] = useState<BaseResult>(calcBase(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);

  useEffect(() => {
    setResult(calcBase(inputs));
  }, []);

  const calculate = () => setResult(calcBase(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcBase(DEFAULTS));
  };

  const update = (patch: Partial<BaseInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How do I convert decimal to binary?", answer: "To convert a decimal number to binary, repeatedly divide the number by 2 and record the remainders. Reading the remainders from bottom to top gives the binary representation. For example, 255 ÷ 2 repeatedly yields 11111111." },
    { question: "What is two's complement?", answer: "Two's complement is the standard way computers represent signed (negative) integers. For a negative value within a fixed bit width, you take the binary of the magnitude, invert all bits, and add 1. Enable 'Show Signed' to view negative numbers in two's complement form." },
    { question: "Why does bit width matter?", answer: "Bit width determines how many binary digits are used to represent a number. It pads the binary output (for example, to 8, 16, 32, or 64 bits) and defines the range for two's complement signed representation. Common widths match data types like byte (8), short (16), int (32), and long (64)." },
    { question: "What bases can I convert between?", answer: "This tool converts between the four most common bases in computing: binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Enter a value in any base and instantly see all four representations." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Base Conversion Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Base Conversion Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Value</label>
                <div className={inp}><input type="text" value={inputs.value} onChange={e => update({ value: e.target.value })} className={ci} placeholder="e.g. 255" /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">From Base</label>
                <div className={inp}>
                  <select value={inputs.fromBase} onChange={e => update({ fromBase: e.target.value as BaseName })} className={ci}>
                    <option value="10">Decimal (base 10)</option>
                    <option value="2">Binary (base 2)</option>
                    <option value="8">Octal (base 8)</option>
                    <option value="16">Hexadecimal (base 16)</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => setShowAdv(!showAdv)} className="text-sm text-primary font-medium text-left">
              Advanced Options {showAdv ? "▲" : "▼"}
            </button>
            {showAdv && (
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Display</div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Bit Width</label>
                  <div className={inp}><input type="number" value={inputs.bitWidth} onChange={e => update({ bitWidth: e.target.value })} min={1} max={64} className={ci} /></div>
                  <p className="text-xs text-muted-foreground mt-1">Pads the binary output and sets the two's complement range.</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={inputs.showSigned} onChange={e => update({ showSigned: e.target.checked })} className="h-4 w-4" />
                  Show Signed (two's complement)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={inputs.groupBits} onChange={e => update({ groupBits: e.target.checked })} className="h-4 w-4" />
                  Group Bits (spaces every 4 digits)
                </label>
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Converted Value</div>
              <div className="text-4xl font-extrabold tracking-tight text-primary break-all">{result.valid ? result.binary : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.valid ? `${result.decimal} decimal · ${result.octal} octal · ${result.hex} hex` : "Enter a valid value for the selected base"}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Decimal", `${result.decimal}`], ["Octal", `${result.octal}`], ["Hex", `${result.hex}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold break-all">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Conversion Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 1 ? "bg-primary/5" : ""}`}>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-semibold break-all">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Digit Count by Base</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="base" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip formatter={(v: number) => [v, "Digits"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold break-all text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Base Conversion Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A base conversion calculator translates a number from one numeral system to another. Computers work in binary (base 2), where every value is a sequence of 0s and 1s, but humans usually read decimal (base 10). Octal (base 8) and hexadecimal (base 16) are compact shorthands that map cleanly onto groups of binary digits, which is why they appear constantly in programming, memory addresses, color codes, and low-level debugging. This tool takes a value in any of these four bases and instantly shows its equivalent in all the others, so you never have to convert by hand.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How Base Conversion Works</h2>
              <p className="text-muted-foreground leading-relaxed">Converting from any base to decimal uses positional notation: each digit is multiplied by its base raised to the position's power, then summed. Converting decimal to another base uses repeated division — divide by 2 for binary, 8 for octal, or 16 for hexadecimal, and collect the remainders in reverse. For signed values, this calculator uses two's complement within a chosen bit width: negative numbers are stored by inverting the bits of the magnitude and adding one. Bit width also pads the binary output to a fixed size such as 8, 16, 32, or 64 bits, matching common data types used in software.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary card shows your value in binary, with decimal, octal, and hexadecimal equivalents beneath it. The three-stat bar summarizes the decimal, octal, and hex forms at a glance, while the breakdown table lists every representation plus the active bit width. The digit-count chart compares how many digits the same number needs in each base, illustrating why hexadecimal is so compact for large values. Use the Advanced Options to enable two's complement for negative numbers, adjust bit width for padding, and toggle bit grouping to add spaces every four binary digits for easier reading.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/base-conversion-calculator" />
          <PopularCalculators exclude="/calculator/base-conversion-calculator" />
        </div>
      </div>
    </>
  );
}
