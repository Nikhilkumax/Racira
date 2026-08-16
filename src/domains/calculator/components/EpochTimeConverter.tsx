"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DEFAULTS_TS = "1700000000";

interface EpochResult {
  ts: number;
  date: Date;
  utc: string;
  local: string;
  daysSinceEpoch: number;
  yearsSinceEpoch: number;
  ms: number;
  chartData: { name: string; value: number }[];
}

function fromTs(ts: number): EpochResult {
  const date = new Date(ts * 1000);
  const daysSinceEpoch = ts / 86400;
  const chartData = [
    { name: "Seconds", value: ts },
    { name: "Milliseconds", value: ts * 1000 },
  ];
  return {
    ts, date,
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    daysSinceEpoch,
    yearsSinceEpoch: daysSinceEpoch / 365.25,
    ms: ts * 1000,
    chartData,
  };
}

const faqs = [
  { question: "What is a Unix timestamp?", answer: "It is the number of seconds since 00:00:00 UTC on January 1, 1970 (the Unix epoch), ignoring leap seconds. It is the standard way computers store time — timezone-independent and trivially comparable." },
  { question: "Why are timestamps timezone-free?", answer: "A timestamp is an instant in time, not a clock reading. 1,700,000,000 is the same moment everywhere; only its display differs by timezone. Convert to local time only when presenting it to a user." },
  { question: "What is the 2038 problem?", answer: "32-bit systems store timestamps as signed 32-bit integers, which overflow on January 19, 2038 (2,147,483,647 seconds after the epoch). Modern 64-bit systems are safe for billions of years." },
];

export default function EpochTimeConverter() {
  const [ts, setTs] = useState(DEFAULTS_TS);
  const [dateStr, setDateStr] = useState(() => new Date(1700000000 * 1000).toISOString().slice(0, 16));
  const [result, setResult] = useState<EpochResult>(() => fromTs(1700000000));

  useEffect(() => {
    const v = parseInt(ts, 10);
    if (!isNaN(v) && v >= 0) {
      setResult(fromTs(v));
      const d = new Date(v * 1000);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setDateStr(local);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ts]);

  useEffect(() => {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime()) && ts !== String(Math.floor(d.getTime() / 1000))) {
      setTs(String(Math.floor(d.getTime() / 1000)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  const reset = () => { setTs(DEFAULTS_TS); };
  const invalid = isNaN(parseInt(ts, 10)) || parseInt(ts, 10) < 0;

  const breakdown = [
    { label: "Unix Timestamp", value: `${result.ts.toLocaleString()} s`, highlight: true },
    { label: "Milliseconds", value: `${result.ms.toLocaleString()} ms` },
    { label: "UTC Time", value: result.utc },
    { label: "Local Time", value: result.local },
    { label: "Days Since Epoch", value: `${result.daysSinceEpoch.toLocaleString("en-US", { maximumFractionDigits: 1 })}` },
    { label: "Years Since Epoch", value: `${result.yearsSinceEpoch.toFixed(2)}` },
    { label: "ISO 8601 (UTC)", value: new Date(result.ts * 1000).toISOString() },
  ];

  const summaryStats = [
    { label: "UTC", value: result.utc },
    { label: "Local", value: result.local },
    { label: "Days Since Epoch", value: `${result.daysSinceEpoch.toLocaleString("en-US", { maximumFractionDigits: 1 })}` },
    { label: "Years", value: `${result.yearsSinceEpoch.toFixed(2)}` },
    { label: "Milliseconds", value: `${result.ms.toLocaleString()}` },
    { label: "Seconds", value: `${result.ts.toLocaleString()}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Epoch Time Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Epoch Time Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="et-ts" className="block text-sm font-medium mb-1 text-foreground">Unix Timestamp (seconds)</label>
              <input id="et-ts" type="number" min="0" step="1" value={ts} onChange={(e) => setTs(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <p className="text-xs text-muted-foreground mt-1">Editing this updates the date below</p>
            </div>
            <div>
              <label htmlFor="et-date" className="block text-sm font-medium mb-1 text-foreground">Or Pick a Date (local time)</label>
              <input id="et-date" type="datetime-local" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid non-negative timestamp.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Time</div>
              <div className="text-2xl md:text-3xl font-extrabold text-primary break-all">{result.utc}</div>
              <div className="text-sm text-muted-foreground mt-1">Local: {result.local}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Days Since Epoch</div>
                <div className="text-lg font-bold text-primary">{result.daysSinceEpoch.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Years Since</div>
                <div className="text-lg font-bold text-primary">{result.yearsSinceEpoch.toFixed(1)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Milliseconds</div>
                <div className="text-lg font-bold text-primary">{result.ms.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Representation</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold break-all">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Timestamp in Seconds vs Milliseconds</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold break-all">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Epoch Time Converter</h2>
            <p>Unix time counts seconds from 00:00:00 UTC on January 1, 1970. Because it is an instant, not a calendar reading, the same number displays differently in every timezone — which is exactly why systems store timestamps and convert only for display.</p>
            <h3>Common Pitfalls</h3>
            <p>JavaScript's Date uses milliseconds, not seconds — multiply by 1000 or divide by 1000 at the boundary. And the "epoch" reference differs per system (Windows FILETIME starts in 1601; Excel in 1899), so always confirm which epoch an external timestamp uses before converting.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/epoch-time-converter" />
          <PopularCalculators exclude="/calculator/epoch-time-converter" />
        </div>
      </div>
    </>
  );
}
