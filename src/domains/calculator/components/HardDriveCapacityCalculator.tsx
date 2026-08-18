"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface DriveCapacityResult {
  advertisedGb: number;
  decimalBytes: number;
  binaryGb: number;
  missingGb: number;
  missingPct: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmtSize(bytes: number): string {
  if (bytes >= 1099511627776) return `${(bytes / 1099511627776).toFixed(2)} TiB`;
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GiB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MiB`;
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function calcDrive(advertisedGb: number): DriveCapacityResult {
  const decimalBytes = advertisedGb * 1000000000;
  const binaryGb = decimalBytes / 1073741824;
  const missingGb = advertisedGb - binaryGb;
  const missingPct = (missingGb / advertisedGb) * 100;

  const breakdown = [
    { label: "Advertised Capacity", value: `${advertisedGb.toLocaleString()} GB (decimal)` },
    { label: "Actual Bytes", value: `${decimalBytes.toLocaleString()} bytes` },
    { label: "OS-Reported Capacity", value: `${binaryGb.toFixed(2)} GB (binary)` },
    { label: "Format Difference", value: `${missingGb.toFixed(2)} GB` },
    { label: "Capacity Lost", value: `${missingPct.toFixed(2)}%` },
    { label: "Standard", value: "Drive makers use 10⁹ (decimal); OS uses 2³⁰ (binary)" },
    { label: "Difference per GB", value: `${(1 - 1000000000 / 1073741824) * 1000} MB` },
    { label: "Missing per 1 TB", value: `${(1000 - 1000000000000 / 1073741824).toFixed(2)} GB` },
  ];
  const summaryStats = [
    { label: "OS Capacity", value: `${binaryGb.toFixed(2)} GB` },
    { label: "Advertised", value: `${advertisedGb.toLocaleString()} GB` },
    { label: "Missing", value: `${missingGb.toFixed(2)} GB` },
    { label: "Missing %", value: `${missingPct.toFixed(2)}%` },
    { label: "Decimal Bytes", value: fmtSize(decimalBytes) },
    { label: "Binary Bytes", value: fmtSize(decimalBytes) },
    { label: "Ratio", value: "1000/1024 = 0.9313" },
    { label: "Explanation", value: "0.9313× of advertised" },
  ];
  const chartData = [
    { name: "Advertised", value: Math.round(advertisedGb), fill: "#8b5cf6" },
    { name: "OS Shows", value: Math.round(binaryGb), fill: "hsl(var(--primary))" },
    { name: "Difference", value: Math.round(missingGb), fill: "#ef4444" },
  ];
  return { advertisedGb, decimalBytes, binaryGb, missingGb, missingPct, breakdown, summaryStats, chartData };
}

const DEFAULTS = { gb: "1000" };

export default function HardDriveCapacityCalculator() {
  const [gb, setGb] = useState(DEFAULTS.gb);
  const [result, setResult] = useState<DriveCapacityResult | null>(null);

  const advertised = parseFloat(gb) || 0;
  const errs: string[] = [];
  if (advertised <= 0) errs.push("Advertised capacity must be greater than 0.");
  if (advertised > 100000) errs.push("Capacity looks unrealistic — enter gigabytes.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDrive(advertised)); };
  const reset = () => {
    setGb(DEFAULTS.gb);
    setResult(calcDrive(1000));
  };
  useEffect(() => { setResult(calcDrive(1000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "Why does my 1 TB drive show only 931 GB?", answer: "Drive manufacturers measure in decimal gigabytes (10⁹ bytes), while operating systems report in binary gibibytes (2³⁰ bytes). One decimal TB equals 0.9313 binary TB, so 68.7 GB appears to vanish." },
    { question: "Is my drive defective?", answer: "No — this is a units convention, not missing hardware. The drive contains exactly the advertised number of bytes; it is simply reported in different units." },
    { question: "What is the difference between GB and GiB?", answer: "1 GB = 1,000,000,000 bytes (decimal, used by marketers). 1 GiB = 1,073,741,824 bytes (binary, used by operating systems). The ratio between them is 1000/1024 ≈ 0.9313." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Hard Drive Capacity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Hard Drive Capacity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Advertised Capacity</label>
              <div className={inp}><input type="number" value={gb} onChange={e => setGb(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">GB</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Actual Usable Capacity</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.binaryGb.toFixed(2)} GB</div>
                <div className="text-sm text-muted-foreground mt-1">{result.advertisedGb.toLocaleString()} GB advertised − {result.missingGb.toFixed(2)} GB format difference</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Advertised`, `${result.advertisedGb.toLocaleString()} GB`], ["OS-Reported", `${result.binaryGb.toFixed(2)} GB`], ["Difference", `${result.missingPct.toFixed(2)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Capacity Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Decimal vs Binary</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}GB`} />
                    <Tooltip formatter={(v: number) => [`${v} GB`, ""]} />
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
            <h2 className="text-2xl font-bold mb-3">The Decimal vs Binary Mismatch</h2>
            <p>This <strong>hard drive capacity calculator</strong> converts the manufacturer's decimal gigabyte (10⁹ bytes) into the binary gibibyte (2³⁰ bytes) your operating system reports. Multiply the advertised size by 1000/1024 ≈ 0.9313 to find the OS-visible capacity.</p>
            <h2 className="text-2xl font-bold mb-3">The Math Behind the 6.87%</h2>
            <p>A 1 TB drive holds exactly 10¹² bytes. But the OS divides by 2³⁰ (1,073,741,824), giving 931.32 GiB — a loss of 68.7 GB, or 6.87% of the label. The gap grows with capacity: a 4 TB drive "loses" about 275 GB.</p>
            <h2 className="text-2xl font-bold mb-3">Not Just a Marketing Trick</h2>
            <p>Both conventions are legitimate — SI prefixes are decimal, while computer memory is naturally binary. The confusion is a documentation failure, not fraud: the exact byte count is on the drive's spec sheet. Partition tables, filesystems, and reserved space add further visible overhead.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hard-drive-capacity-calculator" />
          <PopularCalculators exclude="/calculator/hard-drive-capacity-calculator" />
        </div>
      </div>
    </>
  );
}
