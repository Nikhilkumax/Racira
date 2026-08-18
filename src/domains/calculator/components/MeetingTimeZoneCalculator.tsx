"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface MeetingInputs {
  hh: string;
  mm: string;
  ap: string;
  myZone: string;
  p1Zone: string;
  p2Zone: string;
  p3Zone: string;
  p4Zone: string;
}

interface Zone {
  id: string;
  label: string;
  offset: number; // minutes from UTC (standard time)
}

interface MeetingResults {
  myLabel: string;
  myOffset: number;
  utcLabel: string;
  conversions: { id: string; label: string; offset: number; timeLabel: string; hour: number }[];
  chartData: { name: string; hour: number; highlighted: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
export const ZONES: Zone[] = [
  { id: "utc-10", label: "Honolulu (UTC−10)", offset: -600 },
  { id: "utc-8", label: "Los Angeles (UTC−8)", offset: -480 },
  { id: "utc-7", label: "Denver (UTC−7)", offset: -420 },
  { id: "utc-6", label: "Chicago (UTC−6)", offset: -360 },
  { id: "utc-5", label: "New York (UTC−5)", offset: -300 },
  { id: "utc-4", label: "Santiago (UTC−4)", offset: -240 },
  { id: "utc0", label: "London (UTC+0)", offset: 0 },
  { id: "utc+1", label: "Berlin (UTC+1)", offset: 60 },
  { id: "utc+2", label: "Cairo (UTC+2)", offset: 120 },
  { id: "utc+3", label: "Moscow (UTC+3)", offset: 180 },
  { id: "utc+5.5", label: "Mumbai (UTC+5:30)", offset: 330 },
  { id: "utc+7", label: "Bangkok (UTC+7)", offset: 420 },
  { id: "utc+8", label: "Singapore / Beijing (UTC+8)", offset: 480 },
  { id: "utc+9", label: "Tokyo (UTC+9)", offset: 540 },
  { id: "utc+10", label: "Sydney (UTC+10)", offset: 600 },
  { id: "utc+12", label: "Auckland (UTC+12)", offset: 720 },
];

function toMinutes(h: number, m: number, ap: string): number {
  let hh = h % 12;
  if (ap === "pm") hh += 12;
  return hh * 60 + m;
}

function fmt12(totalMin: number): string {
  const wrapped = ((totalMin % 1440) + 1440) % 1440;
  const h24 = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  const ap = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

function zoneById(id: string): Zone {
  return ZONES.find((z) => z.id === id) ?? ZONES[5];
}

function calcMeeting(i: MeetingInputs): MeetingResults | null {
  const h = parseInt(i.hh, 10), m = parseInt(i.mm, 10);
  if (isNaN(h) || isNaN(m)) return null;

  const myZone = zoneById(i.myZone);
  const meetingMin = toMinutes(h, m, i.ap);
  const utcMin = meetingMin - myZone.offset;

  const p1 = zoneById(i.p1Zone);
  const p2 = zoneById(i.p2Zone);
  const p3 = zoneById(i.p3Zone);
  const p4 = zoneById(i.p4Zone);
  const participants = [p1, p2, p3, p4];

  const conversions = participants.map((z) => ({
    id: z.id,
    label: z.label,
    offset: z.offset,
    timeLabel: fmt12(utcMin + z.offset),
    hour: Math.floor((((utcMin + z.offset) % 1440) + 1440) % 1440 / 60),
  }));

  const chartData = [
    { name: "Your Zone", hour: Math.floor(meetingMin / 60), highlighted: true },
    ...conversions.slice(0, 3).map((c) => ({ name: c.label.split(" (")[0], hour: c.hour, highlighted: false })),
  ];

  const breakdown = [
    { label: "Meeting Time (Your Zone)", value: `${fmt12(meetingMin)}`, highlight: true, isTotal: true },
    { label: "Your Zone", value: `${myZone.label}` },
    { label: "UTC Time", value: fmt12(utcMin) },
    ...conversions.map((c) => ({ label: c.label, value: c.timeLabel })),
  ];

  const summaryStats = [
    { label: "Your Zone", value: fmt12(meetingMin) },
    { label: "UTC", value: fmt12(utcMin) },
    ...conversions.slice(0, 3).map((c) => ({ label: c.label.split(" (")[0], value: c.timeLabel })),
    { label: "Zones Compared", value: `${participants.length + 1}` },
    { label: "Offset Range", value: `${myZone.offset >= 0 ? "+" : "−"}${Math.abs(myZone.offset / 60)}h to ${conversions[2].offset >= 0 ? "+" : "−"}${Math.abs(conversions[2].offset / 60)}h` },
  ];

  return { myLabel: fmt12(meetingMin), myOffset: myZone.offset, utcLabel: fmt12(utcMin), conversions, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS: MeetingInputs = { hh: "3", mm: "00", ap: "pm", myZone: "utc-5", p1Zone: "utc0", p2Zone: "utc+8", p3Zone: "utc+9", p4Zone: "utc-8" };

// 4. Component
export default function MeetingTimeZoneCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<MeetingResults | null>(() => calcMeeting(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcMeeting(DEFAULTS));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcMeeting(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcMeeting(DEFAULTS));
  };

  // Validation
  const errors: Record<string, string> = {};
  const h = parseInt(inputs.hh, 10), m = parseInt(inputs.mm, 10);
  if (isNaN(h) || h < 1 || h > 12) errors.hh = "1–12";
  if (isNaN(m) || m < 0 || m > 59) errors.mm = "0–59";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How do I convert a meeting time across time zones?", answer: "Convert the meeting time in your zone to UTC minutes (subtract your UTC offset), then add each participant zone's offset. A 3:00 PM meeting in New York (UTC−5) is 20:00 UTC — 8:00 PM in London (UTC+0) and 4:00 AM the next day in Singapore (UTC+8)." },
    { question: "Do the offsets include daylight saving time?", answer: "No — this calculator uses fixed standard-time offsets for simplicity and determinism. During DST most of the listed cities shift by one hour, so add 1 hour to the converted time for any zone currently observing DST. Check the current offset for each participant's city before scheduling." },
    { question: "What is the best time to schedule across many zones?", answer: "There is no universal best time, but the standard trick is to find the overlap of typical business hours (roughly 9 AM–5 PM) across all zones. The chart shows each zone's local hour for the meeting, making it easy to see whether anyone is being asked to join at 2 AM." },
    { question: "Why does a time zone need a half-hour offset?", answer: "Some zones, like India (UTC+5:30) and parts of Australia and Canada, use 30- or 45-minute offsets because of historical local-mean-time decisions. The calculator includes Mumbai at UTC+5:30 and handles the half hour correctly in every conversion." },
  ];

  const zoneOptions = ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>);

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Meeting Time Zone Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Meeting Time Zone Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Meeting Time</label>
                <div className="flex gap-2">
                  <div className={inp}>
                    <input type="number" min="1" max="12" value={inputs.hh} onChange={(e) => set("hh")(e.target.value)} className={ci} aria-label="Meeting hour" />
                  </div>
                  <span className="text-muted-foreground text-sm self-center shrink-0">:</span>
                  <div className={inp}>
                    <input type="number" min="0" max="59" value={inputs.mm} onChange={(e) => set("mm")(e.target.value)} className={ci} aria-label="Meeting minute" />
                  </div>
                  <select value={inputs.ap} onChange={(e) => set("ap")(e.target.value)} className={`${sel} w-20 shrink-0`} aria-label="AM/PM">
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                  </select>
                </div>
                {errors.hh && <p className="text-xs text-red-500 font-medium mt-1">{errors.hh}</p>}
              </div>
              <div>
                <label htmlFor="myZone" className={lbl}>Your Time Zone</label>
                <select id="myZone" value={inputs.myZone} onChange={(e) => set("myZone")(e.target.value)} className={sel}>
                  {zoneOptions}
                </select>
              </div>
              <div>
                <label htmlFor="p1Zone" className={lbl}>Participant 1</label>
                <select id="p1Zone" value={inputs.p1Zone} onChange={(e) => set("p1Zone")(e.target.value)} className={sel}>
                  {zoneOptions}
                </select>
              </div>
              <div>
                <label htmlFor="p2Zone" className={lbl}>Participant 2</label>
                <select id="p2Zone" value={inputs.p2Zone} onChange={(e) => set("p2Zone")(e.target.value)} className={sel}>
                  {zoneOptions}
                </select>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Additional Participants</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="p3Zone" className={lbl}>Participant 3</label>
                        <select id="p3Zone" value={inputs.p3Zone} onChange={(e) => set("p3Zone")(e.target.value)} className={sel}>
                          {zoneOptions}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="p4Zone" className={lbl}>Participant 4</label>
                        <select id="p4Zone" value={inputs.p4Zone} onChange={(e) => set("p4Zone")(e.target.value)} className={sel}>
                          {zoneOptions}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Meeting Time (Your Zone)</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? result.myLabel : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result ? `UTC ${result.utcLabel} · ${zoneById(inputs.myZone).label}` : "Enter valid times."}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["UTC", result ? result.utcLabel : "—"],
                ...(result ? result.conversions.slice(0, 3).map((c) => [c.label.split(" (")[0], c.timeLabel] as [string, string]) : [["—", "—"], ["—", "—"], ["—", "—"]] as [string, string][]),
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">All Zone Conversions</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result?.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Local Time at the Meeting Hour</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result?.chartData ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 23]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} tickFormatter={(v: number) => `${v}:00`} />
                  <Tooltip formatter={(v: number) => `${v}:00`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <ReferenceLine y={9} stroke="hsl(var(--muted-foreground) / 0.4)" strokeDasharray="4 4" />
                  <ReferenceLine y={17} stroke="hsl(var(--muted-foreground) / 0.4)" strokeDasharray="4 4" />
                  <Bar dataKey="hour" radius={[4, 4, 0, 0]}>
                    {(result?.chartData ?? []).map((d, idx) => (
                      <Cell key={idx} fill={d.highlighted ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Dashed lines mark typical business hours (9:00–17:00) — anyone outside that band is likely being inconvenienced.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result?.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">UTC Is the Meeting Room</h2>
            <p>Every time zone is defined by its offset from Coordinated Universal Time, so the cleanest way to convert a meeting is in two hops: first move the meeting from your zone to UTC (subtract your offset), then move it from UTC to each participant's zone (add their offset). A 3:00 PM meeting in New York is 20:00 UTC, which is 4:00 AM in Singapore — same instant, different clocks.</p>
            <h2 className="text-2xl font-bold mb-3">Half-Hour and Quarter-Hour Zones</h2>
            <p>Not every offset is a whole hour. India runs at UTC+5:30, Nepal at UTC+5:45, and parts of Australia at UTC+9:30 — legacies of decisions made before standardized time zones. The calculator includes Mumbai at UTC+5:30 and carries the half hour through every conversion so the math stays exact.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Business-Hours Band</h2>
            <p>The chart plots each zone's local hour for the meeting against the typical 9:00–17:00 business band. When a bar sits far outside that band, someone is being asked to join at an unreasonable hour — which is precisely the signal a scheduling tool should surface before you send the invite.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/meeting-time-zone-calculator" />
          <PopularCalculators exclude="/calculator/meeting-time-zone-calculator" />
        </div>
      </div>
    </>
  );
}
