"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, HardDrive } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const UNITS = [
  { id: "GB", label: "Gigabytes (GB)", bytes: 1e9 },
  { id: "TB", label: "Terabytes (TB)", bytes: 1e12 },
] as const;

interface DriveResult {
  size: number;
  unitId: string;
  rawBytes: number;
  osGiB: number;
  osTiB: number;
  formattedGiB: number;
  lossGiB: number;
  diffPct: number;
  chartData: { name: string; value: number }[];
}

function calcDrive(size: number, unitId: string): DriveResult {
  const unit = UNITS.find((u) => u.id === unitId) ?? UNITS[1];
  const rawBytes = size * unit.bytes;
  const osGiB = rawBytes / 1024 ** 3;
  const osTiB = rawBytes / 1024 ** 4;
  const formattedGiB = osGiB * 0.93;
  const marketingGiB = size * (unitId === "TB" ? 1000 : 1); // what the box suggests in GB
  const lossGiB = size * (unitId === "TB" ? 1000 : 1) - osGiB;
  const diffPct = (lossGiB / marketingGiB) * 100;
  const chartData = [
    { name: "Advertised", value: Number((unitId === "TB" ? size * 1000 : size).toFixed(0)) },
    { name: "OS (GiB)", value: Number(osGiB.toFixed(0)) },
    { name: "Formatted", value: Number(formattedGiB.toFixed(0)) },
  ];
  return { size, unitId, rawBytes, osGiB, osTiB, formattedGiB, lossGiB, diffPct, chartData };
}

const DEFAULTS = { size: "2", unit: "TB" };

const faqs = [
  { question: "Why does my 2 TB drive show only 1.81 TB?", answer: "Drive makers use decimal units (1 TB = 10¹² bytes) while operating systems use binary units (1 TiB = 2⁴⁰ = 1,099,511,627,776 bytes). A 2 TB drive holds 2×10¹² bytes = 1.82 TiB, and formatting overhead trims it further to ~1.69 TiB." },
  { question: "What is the difference between GB and GiB?", answer: "GB is a decimal unit (10⁹ bytes) used on retail boxes; GiB is binary (2³⁰ = 1,073,741,824 bytes) used by Windows and macOS. The ratio is 1.073741824 — about a 7.3% 'loss' that isn't really lost, just a unit mismatch." },
  { question: "How much space does formatting eat?", answer: "The file system (NTFS, APFS, ext4) uses 5–10% for journaling, metadata, and allocation tables. A 2 TB drive typically shows about 1.69–1.81 TiB usable depending on the OS and file system." },
];

export default function HardDriveCapacityCalculator() {
  const [size, setSize] = useState(DEFAULTS.size);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<DriveResult>(() => calcDrive(2, "TB"));

  const handleCalculate = () => {
    const s = parseFloat(size);
    if (isNaN(s) || s <= 0) return;
    setResult(calcDrive(s, unit));
  };

  const reset = () => {
    setSize(DEFAULTS.size);
    setUnit(DEFAULTS.unit);
    setResult(calcDrive(2, "TB"));
  };

  const breakdown = [
    { label: "Advertised Capacity", value: `${result.size} ${result.unitId} (${(result.rawBytes / 1e9).toFixed(0)} GB decimal)`, highlight: false },
    { label: "Capacity in OS (GiB)", value: `${result.osGiB.toFixed(2)} GiB (${result.osTiB.toFixed(2)} TiB)`, highlight: true },
    { label: "Typical Usable (after format)", value: `${result.formattedGiB.toFixed(2)} GiB`, highlight: false },
    { label: "Apparent 'Loss'", value: `${result.lossGiB.toFixed(0)} GiB (${result.diffPct.toFixed(1)}%)`, highlight: false },
    { label: "Raw Bytes", value: `${result.rawBytes.toLocaleString("en-US")} bytes`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Hard Drive Capacity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hard Drive Capacity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <HardDrive className="w-4 h-4" /> Real vs Advertised Storage
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Advertised Capacity</label>
                <input type="number" value={size} onChange={(e) => setSize(e.target.value)} className="input-calc" placeholder="2" min={0} step="0.5" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-calc">
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <HardDrive className="w-4 h-4 text-primary" /> CAPACITY AS SEEN BY THE OS
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.osGiB.toFixed(2)} GiB</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {result.size} {result.unitId} shows as {result.osTiB.toFixed(2)} TiB / {result.formattedGiB.toFixed(2)} GiB usable — a {result.diffPct.toFixed(1)}% difference from the label.
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Capacity Comparison (GiB)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(0)} GiB`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Decimal / Binary Ratio", value: "1 GB = 0.9313 GiB" },
                  { label: "Common Confusion", value: "Boxes use GB, OS uses GiB" },
                  { label: "Format Overhead", value: "≈ 7% (NTFS/APFS)" },
                  { label: "For 2 TB Drive", value: "≈ 1.69 TiB usable" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Hard Drive Capacity Calculator</h2>
            <p>The "missing" space on every new drive is a unit mismatch, not a defect. Manufacturers advertise in decimal: 1 TB = 10¹² bytes exactly. Operating systems measure in binary: 1 TiB = 2⁴⁰ bytes = 1.0995×10¹² bytes. Because binary units are larger, the same byte count yields a smaller number — a 2 TB (2×10¹² byte) drive reads as 1.82 TiB in Windows.</p>
            <h3>The formatting trim</h3>
            <p>On top of the unit difference, every file system reserves space for structure: NTFS and APFS use a few percent for the journal, metadata, and allocation tables, and manufacturers' "usable capacity" figures often assume another ~5% off. The result is that a 2 TB drive typically offers around 1.69 TiB of actual free space. This calculator walks through all three numbers — advertised, binary, and formatted — so you know exactly what you're buying.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hard-drive-capacity-calculator" />
          <PopularCalculators exclude="/calculator/hard-drive-capacity-calculator" />
        </div>
      </div>
    </>
  );
}
