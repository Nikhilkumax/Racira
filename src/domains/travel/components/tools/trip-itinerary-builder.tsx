"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Calendar, MapPin, Download } from "lucide-react";

type Activity = { id: string; time: string; title: string; notes: string };
type Day = { id: string; date: string; location: string; activities: Activity[] };

const uid = () => Math.random().toString(36).slice(2, 9);

export function TripItineraryBuilder() {
  const [tripName, setTripName] = useState("My Adventure");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState<Day[]>([
    { id: uid(), date: "", location: "", activities: [{ id: uid(), time: "09:00", title: "", notes: "" }] },
  ]);

  const totalActivities = useMemo(
    () => days.reduce((n, d) => n + d.activities.length, 0),
    [days]
  );

  const addDay = () =>
    setDays((d) => [...d, { id: uid(), date: "", location: "", activities: [] }]);

  const removeDay = (id: string) => setDays((d) => d.filter((x) => x.id !== id));

  const updateDay = (id: string, patch: Partial<Day>) =>
    setDays((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const addActivity = (dayId: string) =>
    setDays((d) =>
      d.map((x) =>
        x.id === dayId
          ? { ...x, activities: [...x.activities, { id: uid(), time: "", title: "", notes: "" }] }
          : x
      )
    );

  const updateActivity = (dayId: string, actId: string, patch: Partial<Activity>) =>
    setDays((d) =>
      d.map((x) =>
        x.id === dayId
          ? { ...x, activities: x.activities.map((a) => (a.id === actId ? { ...a, ...patch } : a)) }
          : x
      )
    );

  const removeActivity = (dayId: string, actId: string) =>
    setDays((d) =>
      d.map((x) =>
        x.id === dayId ? { ...x, activities: x.activities.filter((a) => a.id !== actId) } : x
      )
    );

  const exportText = () => {
    const lines: string[] = [tripName, destination ? `Destination: ${destination}` : "", ""];
    days.forEach((d, i) => {
      lines.push(`Day ${i + 1}${d.date ? ` — ${d.date}` : ""}${d.location ? ` · ${d.location}` : ""}`);
      d.activities.forEach((a) => {
        lines.push(`  ${a.time || "--:--"}  ${a.title}${a.notes ? ` — ${a.notes}` : ""}`);
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tripName.replace(/\s+/g, "-").toLowerCase()}-itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Trip name">
            <input
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="input"
              placeholder="Summer in Japan"
            />
          </Field>
          <Field label="Destination">
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input"
              placeholder="Tokyo, Kyoto, Osaka"
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {days.length} day{days.length !== 1 && "s"}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {totalActivities} activities</span>
          <button onClick={exportText} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 hover:bg-accent">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {days.map((day, idx) => (
        <div key={day.id} className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold">Day {idx + 1}</h3>
            {days.length > 1 && (
              <button
                onClick={() => removeDay(day.id)}
                className="text-muted-foreground hover:text-red-500"
                aria-label="Remove day"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Date">
              <input
                type="date"
                value={day.date}
                onChange={(e) => updateDay(day.id, { date: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Location">
              <input
                value={day.location}
                onChange={(e) => updateDay(day.id, { location: e.target.value })}
                className="input"
                placeholder="Tokyo"
              />
            </Field>
          </div>

          <div className="mt-5 space-y-3">
            {day.activities.map((a) => (
              <div key={a.id} className="grid items-start gap-2 rounded-lg border border-border p-3 sm:grid-cols-[110px_1fr_auto]">
                <input
                  type="time"
                  value={a.time}
                  onChange={(e) => updateActivity(day.id, a.id, { time: e.target.value })}
                  className="input"
                />
                <div className="space-y-2">
                  <input
                    value={a.title}
                    onChange={(e) => updateActivity(day.id, a.id, { title: e.target.value })}
                    className="input"
                    placeholder="Activity (e.g. Visit Senso-ji Temple)"
                  />
                  <input
                    value={a.notes}
                    onChange={(e) => updateActivity(day.id, a.id, { notes: e.target.value })}
                    className="input"
                    placeholder="Notes (optional)"
                  />
                </div>
                <button
                  onClick={() => removeActivity(day.id, a.id)}
                  className="self-center text-muted-foreground hover:text-red-500"
                  aria-label="Remove activity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addActivity(day.id)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80"
            >
              <Plus className="h-4 w-4" /> Add activity
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addDay}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" /> Add another day
      </button>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
