import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Event = { year: string; title: string; desc: string };

export function TimelineBuilder() {
  const [events, setEvents] = useState<Event[]>([
    { year: "1776", title: "Declaration of Independence", desc: "The 13 colonies declare independence." },
  ]);
  const [e, setE] = useState<Event>({ year: "", title: "", desc: "" });
  const sorted = [...events].sort((a, b) => +a.year - +b.year);
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-[100px_1fr_2fr_auto] gap-2">
        <Input placeholder="Year" value={e.year} onChange={(ev) => setE({ ...e, year: ev.target.value })} />
        <Input placeholder="Title" value={e.title} onChange={(ev) => setE({ ...e, title: ev.target.value })} />
        <Input placeholder="Description" value={e.desc} onChange={(ev) => setE({ ...e, desc: ev.target.value })} />
        <Button onClick={() => { if (e.year && e.title) { setEvents([...events, e]); setE({ year: "", title: "", desc: "" }); } }}>Add</Button>
      </div>
      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary/30" />
        {sorted.map((ev, i) => (
          <div key={i} className="relative mb-6">
            <div className="absolute -left-[22px] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
            <div className="rounded-lg border bg-card p-4 flex justify-between items-start gap-2">
              <div>
                <div className="text-primary font-bold text-sm">{ev.year}</div>
                <div className="font-semibold">{ev.title}</div>
                <div className="text-sm text-muted-foreground">{ev.desc}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEvents(events.filter((x) => x !== ev))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
