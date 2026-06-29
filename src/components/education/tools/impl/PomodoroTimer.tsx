import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export function PomodoroTimer() {
  const [mode, setMode] = useState<"focus" | "short" | "long">("focus");
  const durations = { focus: 25, short: 5, long: 15 };
  const [sec, setSec] = useState(durations.focus * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    }
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running]);

  useEffect(() => { setSec(durations[mode] * 60); setRunning(false); }, [mode]);

  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");

  return (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center gap-2">
        {(["focus", "short", "long"] as const).map((k) => (
          <Button key={k} variant={mode === k ? "default" : "outline"} onClick={() => setMode(k)} size="sm">
            {k === "focus" ? "Focus 25" : k === "short" ? "Short Break 5" : "Long Break 15"}
          </Button>
        ))}
      </div>
      <div className="text-8xl font-mono font-bold text-primary tabular-nums">{m}:{s}</div>
      <div className="flex justify-center gap-2">
        <Button size="lg" onClick={() => setRunning(!running)}>
          {running ? <><Pause className="h-4 w-4 mr-2" /> Pause</> : <><Play className="h-4 w-4 mr-2" /> Start</>}
        </Button>
        <Button size="lg" variant="outline" onClick={() => { setRunning(false); setSec(durations[mode] * 60); }}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
