import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ExamCountdown() {
  const [name, setName] = useState("Final Exam");
  const [date, setDate] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = date ? new Date(date).getTime() : 0;
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Exam Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Date &amp; Time</Label><Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      </div>
      <div className="text-center py-8">
        <div className="text-sm text-muted-foreground">Countdown to</div>
        <div className="text-2xl font-semibold mb-6">{name}</div>
        <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto">
          {[["Days", days], ["Hours", hours], ["Min", mins], ["Sec", secs]].map(([l, v]) => (
            <div key={l as string} className="rounded-xl border bg-primary/5 p-4">
              <div className="text-4xl font-bold text-primary tabular-nums">{String(v).padStart(2, "0")}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
