"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Calculator } from "lucide-react";

const zones = [
  { key: "UTC-12", label: "UTC−12 (Baker Island)", offset: -12 },
  { key: "UTC-11", label: "UTC−11 (Samoa)", offset: -11 },
  { key: "UTC-10", label: "UTC−10 (Hawaii)", offset: -10 },
  { key: "UTC-9", label: "UTC−9 (Alaska)", offset: -9 },
  { key: "UTC-8", label: "UTC−8 (PST)", offset: -8 },
  { key: "UTC-7", label: "UTC−7 (MST)", offset: -7 },
  { key: "UTC-6", label: "UTC−6 (CST)", offset: -6 },
  { key: "UTC-5", label: "UTC−5 (EST)", offset: -5 },
  { key: "UTC-4", label: "UTC−4 (AST)", offset: -4 },
  { key: "UTC-3", label: "UTC−3 (Brazil)", offset: -3 },
  { key: "UTC-2", label: "UTC−2", offset: -2 },
  { key: "UTC-1", label: "UTC−1 (Azores)", offset: -1 },
  { key: "UTC+0", label: "UTC+0 (GMT/London)", offset: 0 },
  { key: "UTC+1", label: "UTC+1 (CET/Paris)", offset: 1 },
  { key: "UTC+2", label: "UTC+2 (EET/Cairo)", offset: 2 },
  { key: "UTC+3", label: "UTC+3 (Moscow)", offset: 3 },
  { key: "UTC+4", label: "UTC+4 (Dubai)", offset: 4 },
  { key: "UTC+5", label: "UTC+5 (Pakistan)", offset: 5 },
  { key: "UTC+5.5", label: "UTC+5:30 (IST/India)", offset: 5.5 },
  { key: "UTC+6", label: "UTC+6 (Bangladesh)", offset: 6 },
  { key: "UTC+7", label: "UTC+7 (Bangkok)", offset: 7 },
  { key: "UTC+8", label: "UTC+8 (Singapore/China)", offset: 8 },
  { key: "UTC+9", label: "UTC+9 (JST/Tokyo)", offset: 9 },
  { key: "UTC+10", label: "UTC+10 (AEST/Sydney)", offset: 10 },
  { key: "UTC+11", label: "UTC+11 (Magadan)", offset: 11 },
  { key: "UTC+12", label: "UTC+12 (Auckland)", offset: 12 },
];

const formatTime = (hours: number, minutes: number) => {
  let h = hours % 24;
  if (h < 0) h += 24;
  const dayShift = hours < 0 ? " (prev day)" : hours >= 24 ? " (next day)" : "";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${minutes.toString().padStart(2, "0")} ${period}${dayShift}`;
};

const format24 = (hours: number, minutes: number) => {
  let h = hours % 24;
  if (h < 0) h += 24;
  return `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

interface ConversionResult {
  sourceTime12: string;
  sourceTime24: string;
  sourceZoneLabel: string;
  convertedTime12: string;
  convertedTime24: string;
  targetZoneLabel: string;
  diff: number;
  h: number;
  m: number;
}

const TimeZoneConverter = () => {
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [fromZone, setFromZone] = useState("UTC-5");
  const [toZone, setToZone] = useState("UTC+5.5");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleCalculate = () => {
    const h = parseInt(hour) || 0;
    const m = parseInt(minute) || 0;
    const fromOffset = zones.find(z => z.key === fromZone)?.offset ?? 0;
    const toOffset = zones.find(z => z.key === toZone)?.offset ?? 0;
    const diff = toOffset - fromOffset;
    const totalMinutes = h * 60 + m + diff * 60;
    const resultH = Math.floor(totalMinutes / 60);
    const resultM = Math.round(totalMinutes % 60);

    setResult({
      sourceTime12: formatTime(h, m),
      sourceTime24: format24(h, m),
      sourceZoneLabel: zones.find(z => z.key === fromZone)?.label ?? fromZone,
      convertedTime12: formatTime(resultH, resultM),
      convertedTime24: format24(resultH, resultM),
      targetZoneLabel: zones.find(z => z.key === toZone)?.label ?? toZone,
      diff,
      h,
      m,
    });
    setShowResults(true);
  };

  const reset = () => {
    setShowResults(false);
    setHour("12");
    setMinute("0");
    setFromZone("UTC-5");
    setToZone("UTC+5.5");
    setResult(null);
  };

  const faqs = [
    { question: "How does time zone conversion work?", answer: "Time zones are defined as offsets from Coordinated Universal Time (UTC). To convert between two zones, calculate the difference between their offsets and add it to the source time. For example, EST (UTC−5) to IST (UTC+5:30) is a +10.5 hour shift." },
    { question: "What is UTC?", answer: "UTC (Coordinated Universal Time) is the global time standard from which all time zones are derived. It does not observe daylight saving time and serves as the zero reference point (UTC+0) for all other offsets." },
    { question: "Does this tool account for daylight saving time?", answer: "This converter uses fixed UTC offsets rather than named time zones with DST rules. During daylight saving periods, you may need to adjust the offset manually (e.g., use UTC−4 instead of UTC−5 for EDT instead of EST)." },
    { question: "What is the International Date Line?", answer: "The International Date Line runs roughly along the 180° meridian in the Pacific Ocean. When you cross it heading westward you skip forward a day; heading eastward you go back a day. Our converter handles this by showing '(next day)' or '(prev day)' labels." },
    { question: "How many time zones are there?", answer: "There are 38 time zones in practice, ranging from UTC−12 to UTC+14. Most are whole-hour offsets, but India (UTC+5:30), Nepal (UTC+5:45), and several others use fractional-hour offsets." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Time Zone Converter" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Time Zone Converter</h1>
        <p className="text-muted-foreground mb-6 text-lg">Convert times between different time zones worldwide.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="tz-hour" label="Hour (0-23)" value={hour} onChange={setHour} min="0" step="1" />
                <InputField id="tz-minute" label="Minute" value={minute} onChange={setMinute} min="0" step="1" />
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">From Time Zone</label>
                  <Select value={fromZone} onValueChange={setFromZone}>
                    <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                    <SelectContent>{zones.map(z => <SelectItem key={z.key} value={z.key}>{z.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">To Time Zone</label>
                  <Select value={toZone} onValueChange={setToZone}>
                    <SelectTrigger className="input-calc"><SelectValue /></SelectTrigger>
                    <SelectContent>{zones.map(z => <SelectItem key={z.key} value={z.key}>{z.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Calculator className="h-5 w-5" /> Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">Result</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="result-card">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Source Time</p>
                    <p className="text-xl font-bold text-foreground">{result.sourceTime12}</p>
                    <p className="text-sm text-muted-foreground">{result.sourceTime24} • {result.sourceZoneLabel}</p>
                  </div>
                  <div className="result-card">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Converted Time</p>
                    <p className="text-xl font-bold text-[hsl(217,91%,40%)] dark:text-primary">{result.convertedTime12}</p>
                    <p className="text-sm text-muted-foreground">{result.convertedTime24} • {result.targetZoneLabel}</p>
                  </div>
                </div>
                <div className="result-card mt-3">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Time Difference</p>
                  <p className="text-xl font-bold text-foreground">{result.diff >= 0 ? "+" : ""}{result.diff} hours</p>
                </div>

                {/* Popular Conversions */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Popular Conversions</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { from: "UTC-5", to: "UTC+0", label: "EST → GMT" },
                      { from: "UTC-8", to: "UTC+5.5", label: "PST → IST" },
                      { from: "UTC+0", to: "UTC+9", label: "GMT → JST" },
                      { from: "UTC-5", to: "UTC+1", label: "EST → CET" },
                      { from: "UTC+5.5", to: "UTC+8", label: "IST → SGT" },
                      { from: "UTC-8", to: "UTC+0", label: "PST → GMT" },
                    ].map(conv => {
                      const fOff = zones.find(z => z.key === conv.from)?.offset ?? 0;
                      const tOff = zones.find(z => z.key === conv.to)?.offset ?? 0;
                      const d = tOff - fOff;
                      const tMin = result.h * 60 + result.m + d * 60;
                      const tH = Math.floor(tMin / 60);
                      const tM = Math.round(tMin % 60);
                      return (
                        <div key={conv.label} className="result-card">
                          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{conv.label}</p>
                          <p className="text-lg font-bold text-foreground">{formatTime(result.h, result.m)} → {formatTime(tH, tM)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>World Time Zones Explained</h2>
              <p>The Earth is divided into 24 primary time zones, each roughly 15° of longitude wide — corresponding to one hour of Earth's rotation. In practice, political boundaries create 38 distinct zones ranging from UTC−12 (Baker Island) to UTC+14 (Line Islands, Kiribati).</p>
              <p>Several zones use half-hour or 45-minute offsets. India (UTC+5:30), Iran (UTC+3:30), Nepal (UTC+5:45), and parts of Australia (UTC+9:30) are the most notable examples. Our converter supports all major offsets.</p>

              <h2>Daylight Saving Time (DST)</h2>
              <p>Approximately 70 countries observe daylight saving time, shifting clocks forward by one hour in spring and back in autumn. DST transitions typically occur at 2:00 AM local time. Because different countries transition on different dates, the offset between two cities can change multiple times per year.</p>
              <p>For the most accurate conversion during DST transitions, verify which offset each location is currently observing and select the corresponding UTC offset manually.</p>

              <h2>Tips for International Scheduling</h2>
              <ul>
                <li><strong>Use UTC as the anchor:</strong> When coordinating across 3+ time zones, express the meeting time in UTC first, then let each participant convert locally.</li>
                <li><strong>Respect business hours:</strong> Avoid scheduling before 9 AM or after 6 PM in any participant's zone when possible.</li>
                <li><strong>Rotate inconvenience:</strong> For recurring meetings spanning very different zones, alternate the meeting time so the same team doesn't always have an early or late call.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/time-zone-converter" />
          <PopularCalculators exclude="/calculator/time-zone-converter" />
        </div>
      </div>
    </>
  );
};

export default TimeZoneConverter;
