"use client";
import { useMemo, useState } from "react";
import { ToolShell, Field, NumberInput, TextInput, Result } from "../ui";

// Minimal NOAA-style sunrise/sunset calculator
function solar(date: Date, lat: number, lon: number, zenith: number) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;
  const day = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 86400000,
  );
  const calc = (rising: boolean) => {
    const lngHour = lon / 15;
    const t = day + ((rising ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin(rad * M) + 0.02 * Math.sin(rad * 2 * M) + 282.634;
    L = ((L % 360) + 360) % 360;
    let RA = deg * Math.atan(0.91764 * Math.tan(rad * L));
    RA = ((RA % 360) + 360) % 360;
    const Lq = Math.floor(L / 90) * 90;
    const RAq = Math.floor(RA / 90) * 90;
    RA = (RA + (Lq - RAq)) / 15;
    const sinDec = 0.39782 * Math.sin(rad * L);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(rad * zenith) - sinDec * Math.sin(rad * lat)) / (cosDec * Math.cos(rad * lat));
    if (cosH > 1 || cosH < -1) return null;
    let H = rising ? 360 - deg * Math.acos(cosH) : deg * Math.acos(cosH);
    H /= 15;
    const T = H + RA - 0.06571 * t - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;
    return UT;
  };
  return { rise: calc(true), set: calc(false) };
}

const fmtUT = (h: number | null, tz: number) => {
  if (h == null) return "—";
  let local = h + tz;
  local = ((local % 24) + 24) % 24;
  const hh = Math.floor(local);
  const mm = Math.round((local - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

function SunBase({ title, zenith }: { title: string; zenith: number }) {
  const today = new Date();
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [lat, setLat] = useState(40.7128);
  const [lon, setLon] = useState(-74.006);
  const [tz, setTz] = useState(-(today.getTimezoneOffset() / 60));

  const r = useMemo(() => {
    const d = new Date(date + "T12:00:00Z");
    return solar(d, lat, lon, zenith);
  }, [date, lat, lon, zenith]);

  return (
    <ToolShell note={`${title} = sun between -4° and +6° (golden) or -6° and -4° (blue). Times are local (UTC offset).`}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Date"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Latitude"><NumberInput value={lat} step={0.001} onChange={(e) => setLat(+e.target.value)} /></Field>
        <Field label="Longitude"><NumberInput value={lon} step={0.001} onChange={(e) => setLon(+e.target.value)} /></Field>
        <Field label="UTC offset (hours)"><NumberInput value={tz} step={0.5} onChange={(e) => setTz(+e.target.value)} /></Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Result label={`${title} — morning`} value={fmtUT(r.rise, tz)} />
        <Result label={`${title} — evening`} value={fmtUT(r.set, tz)} />
      </div>
    </ToolShell>
  );
}

export function GoldenHourCalculator() {
  return <SunBase title="Golden hour" zenith={84} />;
}
export function BlueHourCalculator() {
  return <SunBase title="Blue hour" zenith={94} />;
}
