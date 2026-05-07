"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import InputField from "@/components/calculator/InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const TimeZoneConverter = () => {
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [fromZone, setFromZone] = useState("UTC-5");
  const [toZone, setToZone] = useState("UTC+5.5");

  const h = parseInt(hour) || 0;
  const m = parseInt(minute) || 0;
  const fromOffset = zones.find(z => z.key === fromZone)?.offset ?? 0;
  const toOffset = zones.find(z => z.key === toZone)?.offset ?? 0;
  const diff = toOffset - fromOffset;
  const totalMinutes = h * 60 + m + diff * 60;
  const resultH = Math.floor(totalMinutes / 60);
  const resultM = Math.round(totalMinutes % 60);

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Time Zone Converter" }]} />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Time Zone Converter</h1>
        <p className="text-muted-foreground mb-6">Convert times between different time zones worldwide.</p>

        <div className="card-calc p-6 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
        </div>

        <div className="card-calc p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Result</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="result-card">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Source Time</p>
              <p className="text-xl font-bold text-foreground">{formatTime(h, m)}</p>
              <p className="text-sm text-muted-foreground">{format24(h, m)} • {zones.find(z => z.key === fromZone)?.label}</p>
            </div>
            <div className="result-card">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Converted Time</p>
              <p className="text-xl font-bold text-[hsl(217,91%,40%)] dark:text-primary">{formatTime(resultH, resultM)}</p>
              <p className="text-sm text-muted-foreground">{format24(resultH, resultM)} • {zones.find(z => z.key === toZone)?.label}</p>
            </div>
          </div>
          <div className="result-card mt-3">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Time Difference</p>
            <p className="text-xl font-bold text-foreground">{diff >= 0 ? "+" : ""}{diff} hours</p>
          </div>
        </div>

        <div className="card-calc p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Popular Conversions</h2>
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
              const tMin = h * 60 + m + d * 60;
              const tH = Math.floor(tMin / 60);
              const tM = Math.round(tMin % 60);
              return (
                <div key={conv.label} className="result-card">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{conv.label}</p>
                  <p className="text-lg font-bold text-foreground">{formatTime(h, m)} → {formatTime(tH, tM)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeZoneConverter;

