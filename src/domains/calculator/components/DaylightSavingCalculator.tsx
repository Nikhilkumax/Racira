"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Sun } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type RegionKey = "US" | "EU" | "UK" | "AU";

interface RegionRules {
  label: string;
  dstStartLabel: string;
  dstEndLabel: string;
  // return transition date for given year
  dstStart: (year: number) => Date;
  dstEnd: (year: number) => Date;
  offsetLabel: string;
}

function nthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(year, month, 1);
  const firstDow = first.getDay();
  const offset = (weekday - firstDow + 7) % 7;
  return new Date(year, month, 1 + offset + (nth - 1) * 7);
}

function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0);
  const lastDow = last.getDay();
  const offset = (lastDow - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - offset);
}

const REGIONS: Record<RegionKey, RegionRules> = {
  US: {
    label: "United States",
    dstStartLabel: "2nd Sunday in March",
    dstEndLabel: "1st Sunday in November",
    dstStart: (y) => nthWeekday(y, 2, 0, 2),
    dstEnd: (y) => nthWeekday(y, 10, 0, 1),
    offsetLabel: "EDT/EST (±4h / ±5h UTC)",
  },
  EU: {
    label: "European Union",
    dstStartLabel: "Last Sunday in March",
    dstEndLabel: "Last Sunday in October",
    dstStart: (y) => lastWeekday(y, 2, 0),
    dstEnd: (y) => lastWeekday(y, 9, 0),
    offsetLabel: "CEST/CET (+2h / +1h UTC)",
  },
  UK: {
    label: "United Kingdom",
    dstStartLabel: "Last Sunday in March",
    dstEndLabel: "Last Sunday in October",
    dstStart: (y) => lastWeekday(y, 2, 0),
    dstEnd: (y) => lastWeekday(y, 9, 0),
    offsetLabel: "BST/GMT (+1h / ±0h UTC)",
  },
  AU: {
    label: "Australia (southern)",
    dstStartLabel: "1st Sunday in October",
    dstEndLabel: "1st Sunday in April",
    dstStart: (y) => nthWeekday(y, 9, 0, 1),
    dstEnd: (y) => nthWeekday(y, 3, 0, 1),
    offsetLabel: "AEDT/AEST (+11h / +10h UTC)",
  },
};

interface DstResult {
  date: Date;
  region: RegionKey;
  active: boolean;
  start: Date;
  end: Date;
  nextTransition: Date;
  nextIsStart: boolean;
  daysUntil: number;
  chartData: { name: string; value: number }[];
}

function calcDst(dateStr: string, region: RegionKey): DstResult {
  const date = new Date(dateStr + "T00:00:00");
  const rules = REGIONS[region];
  const year = date.getFullYear();
  const start = rules.dstStart(year);
  const end = rules.dstEnd(year);
  const active = region === "AU" ? date >= start || date < end : date >= start && date < end;
  const nextStart = rules.dstStart(year + (region === "AU" && date >= end ? 1 : 0));
  const nextEnd = rules.dstEnd(year + (region === "AU" && date >= start ? 1 : 0));
  let nextTransition: Date;
  let nextIsStart: boolean;
  if (region === "AU") {
    if (date < start) { nextTransition = start; nextIsStart = true; }
    else if (date < end) { nextTransition = end; nextIsStart = false; }
    else { nextTransition = nextStart; nextIsStart = true; }
  } else {
    if (date < start) { nextTransition = start; nextIsStart = true; }
    else if (date < end) { nextTransition = end; nextIsStart = false; }
    else { nextTransition = rules.dstStart(year + 1); nextIsStart = true; }
  }
  const daysUntil = Math.round((nextTransition.getTime() - date.getTime()) / 86400000);
  const chartData = [
    { name: "DST Months", value: region === "AU" ? 6 : region === "US" ? 7.5 : 7 },
    { name: "Standard Months", value: region === "AU" ? 6 : region === "US" ? 4.5 : 5 },
  ];
  return { date, region, active, start, end, nextTransition, nextIsStart, daysUntil, chartData };
}

const DEFAULTS = { date: "2026-07-04", region: "US" as RegionKey };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const faqs = [
  { question: "When does daylight saving time start and end in the US?", answer: "In the US, DST runs from the second Sunday in March to the first Sunday in November (about 65% of the year). Clocks spring forward at 2:00 AM and fall back at 2:00 AM." },
  { question: "Why does Australia have different rules?", answer: "Australia is in the southern hemisphere, so seasons are reversed — DST runs October to April there. Not all Australian states observe it (Queensland and the NT do not)." },
  { question: "Does every country observe DST?", answer: "No. Most of Asia and Africa and parts of South America and the US (Hawaii, Arizona) do not observe DST. The EU and UK align their transition weekends for a single 3-week European switch window." },
];

export default function DaylightSavingCalculator() {
  const [date, setDate] = useState(DEFAULTS.date);
  const [region, setRegion] = useState<RegionKey>(DEFAULTS.region);
  const [result, setResult] = useState<DstResult>(() => calcDst("2026-07-04", "US"));

  useEffect(() => {
    if (date && !isNaN(new Date(date).getTime())) setResult(calcDst(date, region));
  }, [date, region]);

  const reset = () => { setDate(DEFAULTS.date); setRegion(DEFAULTS.region); };
  const invalid = !date || isNaN(new Date(date).getTime());

  const rules = REGIONS[result.region];
  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" });

  const breakdown = [
    { label: "Date Checked", value: fmtDate(result.date) },
    { label: "Region", value: rules.label },
    { label: "DST Status", value: result.active ? "Daylight saving active" : "Standard time", highlight: true },
    { label: "Offset", value: rules.offsetLabel },
    { label: "DST Period", value: `${rules.dstStartLabel} → ${rules.dstEndLabel}` },
    { label: "DST Begins", value: fmtDate(result.start) },
    { label: "DST Ends", value: fmtDate(result.end) },
    { label: "Next Transition", value: `${result.nextIsStart ? "DST begins" : "DST ends"} · ${fmtDate(result.nextTransition)}` },
    { label: "Days Until", value: `${result.daysUntil} days` },
  ];

  const summaryStats = [
    { label: "DST Status", value: result.active ? "Active" : "Standard time" },
    { label: "Next Transition", value: fmtDate(result.nextTransition) },
    { label: "Days Until", value: `${result.daysUntil}` },
    { label: "DST Begins", value: fmtDate(result.start) },
    { label: "DST Ends", value: fmtDate(result.end) },
    { label: "Offset", value: rules.offsetLabel },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Daylight Saving Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Daylight Saving Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="dl-date" className="block text-sm font-medium mb-1 text-foreground">Date to Check</label>
              <input id="dl-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="dl-region" className="block text-sm font-medium mb-1 text-foreground">Region</label>
              <select id="dl-region" value={region} onChange={(e) => setRegion(e.target.value as RegionKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(REGIONS).map(([key, r]) => <option key={key} value={key}>{r.label}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Sun className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Choose a valid date.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Daylight Saving Status</div>
              <div className="text-4xl font-extrabold text-primary">{result.active ? "DST Active" : "Standard Time"}</div>
              <div className="text-sm text-muted-foreground mt-1">{fmtDate(result.date)} · {rules.label}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Offset</div>
                <div className="text-lg font-bold text-primary">{result.active ? "DST" : "Standard"}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Next: {result.nextIsStart ? "Begin" : "End"}</div>
                <div className="text-lg font-bold text-primary">{fmtDate(result.nextTransition)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Days Until</div>
                <div className="text-lg font-bold text-primary">{result.daysUntil}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
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
              <h3 className="text-base font-bold mb-3">Time in the Year (per 12 months)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} months (${((v / 12) * 100).toFixed(0)}%)`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Daylight Saving Calculator</h2>
            <p>DST status is fully deterministic from fixed calendar rules. The US observes it from the second Sunday in March (2:00 AM) to the first Sunday in November; the EU and UK from the last Sunday in March to the last Sunday in October; southern Australia from the first Sunday in October to the first Sunday in April.</p>
            <h3>Why the Rules Matter</h3>
            <p>Getting the transition dates wrong breaks timezone conversion, meeting scheduling, and device clocks. Because the rules are fixed by legislation, they can be computed for any year — no live lookups needed. Note the EU has proposed abolishing seasonal changes; such legislation would update these rules.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/daylight-saving-calculator" />
          <PopularCalculators exclude="/calculator/daylight-saving-calculator" />
        </div>
      </div>
    </>
  );
}
